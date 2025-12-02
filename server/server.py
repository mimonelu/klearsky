import os
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv()) 

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

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

# New Model for Spans
class SpanScore(BaseModel):
    word: str
    score: float

class ToxicSpansResponse(BaseModel):
    spans: List[SpanScore]


# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.post("/toxicityHateSpeechPrediction", response_model=PredictionResponse)
async def predict_toxicity(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    try:
        response = client.text_classification(
            model="unitary/toxic-bert",
            text=req.text
        )
        predictions = [Prediction(label=item.label, score=item.score) for item in response]
        return PredictionResponse(predictions=predictions)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")


@app.post("/nonToxicRewriting", response_model=RewritingResponse)
async def non_toxic_rewriting(req: TextRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    try:
        messages = [
            {"role": "system", "content": "Rewrite the user's text to be non-toxic, polite, and constructive."},
            {"role": "user", "content": f"Rewrite this: \"{req.text}\""}
        ]
        response = client.chat_completion(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=messages,
            max_tokens=200,
            temperature=0.5
        )
        clean_text = response.choices[0].message.content.strip().strip('"')
        return RewritingResponse(rewritten_text=clean_text)
    except Exception as e:
        logger.error(f"Rewriting failed: {e}")
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
                "content": f"You are a helpful aide. Context: {req.context or 'General'}. Analyze this post and provide context cues."
            },
            {"role": "user", "content": f"Analyze this:\n\"{target_text}\""}
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
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")

# --- NEW: VISUALIZATION 2 ENDPOINT (Classifier + Explainer Logic) ---
@app.post("/toxicSpans", response_model=ToxicSpansResponse)
async def explain_toxicity(req: TextRequest):
    """
    Simulates an Explainer by masking words and checking the drop in toxicity score.
    This identifies which words are contributing most to the toxicity.
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not set.")
    
    text = req.text.strip()
    if not text:
        return ToxicSpansResponse(spans=[])

    try:
        # 1. Get Baseline Score
        base_resp = client.text_classification(model="unitary/toxic-bert", text=text)
        # Get the max score among toxicity labels
        base_score = max([p.score for p in base_resp if p.label != 'non-toxic'] or [0])

        words = text.split()
        spans = []

        # 2. Perturbation Loop (Simple Explanation)
        # Note: Ideally we batch this, but for simplicity we iterate.
        for i in range(len(words)):
            # Create text without this word
            masked_text = " ".join(words[:i] + words[i+1:])
            
            # If masking leaves empty string, score is 0
            if not masked_text.strip():
                score_drop = base_score
            else:
                masked_resp = client.text_classification(model="unitary/toxic-bert", text=masked_text)
                masked_score = max([p.score for p in masked_resp if p.label != 'non-toxic'] or [0])
                
                # The importance is how much the score DROPPED when we removed the word
                score_drop = base_score - masked_score

            # Normalize negative drops (word removal increased toxicity) to 0
            importance = max(0.0, score_drop)
            
            spans.append(SpanScore(word=words[i], score=importance))

        return ToxicSpansResponse(spans=spans)

    except Exception as e:
        logger.error(f"Toxic spans failed: {e}")
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, log_level="info")