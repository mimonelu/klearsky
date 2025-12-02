import os
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv

# Load environment variables from the .env file
load_dotenv(find_dotenv()) 

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# 1. READ TOKEN FROM ENVIRONMENT (Used by InferenceClient)
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    logger.warning("HF_TOKEN is missing. API-based endpoints will fail.")

# 2. Setup the Inference Client (Connects to Hugging Face Cloud for API endpoints)
try:
    client = InferenceClient(token=HF_TOKEN)
except Exception as e:
    logger.error(f"InferenceClient setup failed. API endpoints will not work: {e}")

# ==============================================================================
# SERVER SETUP
# ==============================================================================

# Allow Vue dev server
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


# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.post("/toxicityHateSpeechPrediction", response_model=PredictionResponse)
async def predict_toxicity(req: TextRequest):
    """
    Checks toxicity using 'unitary/toxic-bert' (This uses the InferenceClient)
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set. Cannot access Inference API.")
    try:
        # toxic-bert works with standard classification API
        response = client.text_classification(
            model="unitary/toxic-bert",
            text=req.text
        )
        
        predictions = [Prediction(label=item.label, score=item.score) for item in response]
        return PredictionResponse(predictions=predictions)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cloud API Error: {str(e)}")


@app.post("/nonToxicRewriting", response_model=RewritingResponse)
async def non_toxic_rewriting(req: TextRequest):
    """
    Rewrites text using Llama-3 Chat API (This uses the InferenceClient)
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set. Cannot access Inference API.")
    try:
        messages = [
            {
                "role": "system", 
                "content": "You are a helpful moderation assistant. Rewrite the user's text to be calm, polite, and constructive, while keeping the original meaning. Do not add conversational filler like 'Here is the rewrite:'."
            },
            {
                "role": "user", 
                "content": f"Rewrite this text to be non-toxic: \"{req.text}\""
            }
        ]

        response = client.chat_completion(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=messages,
            max_tokens=200,
            temperature=0.5 # Lower temp for more deterministic rewrites
        )
        
        clean_text = response.choices[0].message.content.strip().strip('"')
        return RewritingResponse(rewritten_text=clean_text)
        
    except Exception as e:
        logger.error(f"Rewriting failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cloud API Error: {str(e)}")
    

@app.post("/infoMessage", response_model=InfoResponse)
async def provide_info_message(req: TextRequest):
    """
    Analyzes the PARENT POST (context) to inform the user before they reply 
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set. Cannot access Inference API.")
    try:
        # Use req.text as the main content to analyze (Parent Post Content)
        target_text = req.text 
        
        messages = [
            {
                "role": "system", 
                "content": (
                    "You are a helpful communication aide. "
                    f"The user is within a '{req.context or 'General'}' context. " 
                    "The user is about to reply to the following social media post. "
                    "Analyze THIS POST and provide information and context on the topic discussed in the post so they can write a better informed response."
                )
            },
            {
                "role": "user", 
                "content": f"Analyze this post:\n\"{target_text}\""
            }
        ]

        response = client.chat_completion(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=messages,
            max_tokens=300
        )
        
        info = response.choices[0].message.content.strip()
        return InfoResponse(contextual_info=info)
        
    except Exception as e:
        logger.error(f"Info generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cloud API Error: {str(e)}")
    

if __name__ == "__main__":
    # Ensure uvicorn runs the app from the correct module path
    uvicorn.run("server:app", host="0.0.0.0", port=8000, log_level="info")