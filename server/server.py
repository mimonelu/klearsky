import os
import logging
import uvicorn
import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv

# Database Imports
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv(find_dotenv()) 

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

# ==============================================================================
# DATABASE SETUP
# ==============================================================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./user_activity.db" 
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_did = Column(String, index=True)       
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action_type = Column(String)                
    input_text = Column(Text)                   
    moderation_mode = Column(String)            
    metadata_json = Column(JSON)                

# Create tables
Base.metadata.create_all(bind=engine)

# ==============================================================================
# CONFIGURATION
# ==============================================================================

HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    logger.warning("HF_TOKEN is missing. API-based endpoints will fail.")

try:
    client = InferenceClient(token=HF_TOKEN)
except Exception as e:
    logger.error(f"InferenceClient setup failed: {e}")

# ==============================================================================
# SERVER SETUP
# ==============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---

class TextRequest(BaseModel):
    text: str
    context: Optional[str] = None 

class Prediction(BaseModel):
    label: str
    score: float

class PredictionResponse(BaseModel):
    predictions: List[Prediction]

class RewritingResponse(BaseModel):
    rewritten_text: str

class InfoResponse(BaseModel):
    contextual_info: str

class SpanScore(BaseModel):
    word: str
    score: float

class ToxicSpansResponse(BaseModel):
    spans: List[SpanScore]

class LogRequest(BaseModel):
    user_did: str
    action_type: str
    input_text: Optional[str] = ""
    moderation_mode: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

# ==============================================================================
# DATABASE HELPER
# ==============================================================================

def save_log_to_db(log_data: LogRequest):
    db = SessionLocal()
    try:
        db_log = ActivityLog(
            user_did=log_data.user_did,
            action_type=log_data.action_type,
            input_text=log_data.input_text,
            moderation_mode=log_data.moderation_mode,
            metadata_json=log_data.meta
        )
        db.add(db_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log activity: {repr(e)}")
    finally:
        db.close()

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.post("/log_activity")
async def log_activity(req: LogRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(save_log_to_db, req)
    return {"status": "logged"}

@app.post("/toxicityHateSpeechPrediction", response_model=PredictionResponse)
async def predict_toxicity(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    try:
        # Unitary Toxic Bert works best for classification
        response = client.text_classification(
            model="unitary/toxic-bert",
            text=req.text
        )
        predictions = [Prediction(label=item.label, score=item.score) for item in response]
        return PredictionResponse(predictions=predictions)
    except Exception as e:
        logger.error(f"Prediction failed: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")


@app.post("/nonToxicRewriting", response_model=RewritingResponse)
async def non_toxic_rewriting(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    try:
        # Qwen 2.5 Instruction Format
        messages = [
            {"role": "system", "content": "You are a helpful assistant. Rewrite the user's text to be non-toxic, polite, and constructive. Keep the original meaning. Do NOT output anything else (like 'Here is the rewrite')."},
            {"role": "user", "content": f"Rewrite this text: \"{req.text}\""}
        ]
        
        # MODEL CHANGED: Qwen/Qwen2.5-7B-Instruct (SOTA & Ungated)
        response = client.chat_completion(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=messages,
            max_tokens=200,
            temperature=0.5,
            stream=False # Ensure streaming is OFF to prevent StopIteration errors
        )
        
        if not response.choices:
             raise ValueError("Model returned empty response")
             
        clean_text = response.choices[0].message.content.strip().strip('"')
        return RewritingResponse(rewritten_text=clean_text)
    except Exception as e:
        logger.error(f"Rewriting failed: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")
    

@app.post("/infoMessage", response_model=InfoResponse)
async def provide_info_message(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    try:
        target_text = req.text 
        messages = [
            {
                "role": "system", 
                "content": f"You are a helpful aide. Context: {req.context or 'General'}. Analyze this post and provide brief context cues to help the user reply."
            },
            {"role": "user", "content": f"Analyze this:\n\"{target_text}\""}
        ]
        
        # MODEL CHANGED: Qwen/Qwen2.5-7B-Instruct
        response = client.chat_completion(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=messages,
            max_tokens=300,
            stream=False
        )
        
        if not response.choices:
             raise ValueError("Model returned empty response")

        info = response.choices[0].message.content.strip()
        return InfoResponse(contextual_info=info)
    except Exception as e:
        logger.error(f"Info generation failed: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")

# --- VISUALIZATION 2 (Toxic Spans) ---
@app.post("/toxicSpans", response_model=ToxicSpansResponse)
async def explain_toxicity(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    
    text = req.text.strip()
    if not text:
        return ToxicSpansResponse(spans=[])

    try:
        # 1. Baseline
        base_resp = client.text_classification(model="unitary/toxic-bert", text=text)
        bad_labels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
        base_score = max([p.score for p in base_resp if p.label in bad_labels] or [0])

        words = text.split()
        spans = []

        # 2. Perturbation Loop
        for i in range(len(words)):
            masked_text = " ".join(words[:i] + words[i+1:])
            
            if not masked_text.strip():
                score_drop = base_score
            else:
                masked_resp = client.text_classification(model="unitary/toxic-bert", text=masked_text)
                masked_score = max([p.score for p in masked_resp if p.label in bad_labels] or [0])
                score_drop = base_score - masked_score

            importance = max(0.0, score_drop)
            spans.append(SpanScore(word=words[i], score=importance))

        return ToxicSpansResponse(spans=spans)

    except Exception as e:
        logger.error(f"Toxic spans failed: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, log_level="info")