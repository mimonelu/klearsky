<<<<<<< HEAD
import os
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from huggingface_hub import InferenceClient
from dotenv import load_dotenv # Import this

# Load environment variables from the .env file
load_dotenv()
=======
# server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import logging
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
>>>>>>> parent of 75d0ff6b (Update backend)

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

# USE A HUGGINGFACE ONLINE MODEL
MODEL_NAME = "gpt2"   # ← change this to any HF model you want

<<<<<<< HEAD
# 1. READ TOKEN FROM ENVIRONMENT
# If the token is not found, this will be None
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise ValueError("HF_TOKEN is missing. Please set it in your .env file or environment variables.")

# 2. Setup the Client (Connects to Hugging Face Cloud)
client = InferenceClient(token=HF_TOKEN)

# ==============================================================================
# SERVER SETUP
# ==============================================================================
=======
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
>>>>>>> parent of 75d0ff6b (Update backend)

# Allow Vue dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: Optional[int] = 50
    do_sample: Optional[bool] = False
    temperature: Optional[float] = 1.0
    top_k: Optional[int] = 0
    top_p: Optional[float] = 1.0

class GenerateResponse(BaseModel):
    generated_text: str

tokenizer = None
model = None
text_generator = None

@app.on_event("startup")
async def startup_load():
    global tokenizer, model, text_generator
    logger.info(f"Downloading model {MODEL_NAME} from HuggingFace...")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

    model.to(DEVICE)

    text_generator = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        device=0 if DEVICE == "cuda" else -1,
    )

    logger.info("Model loaded successfully!")

@app.post("/generate", response_model=GenerateResponse)
async def generate_text(req: GenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is empty")

    output = text_generator(
        prompt,
        max_new_tokens=min(max(req.max_new_tokens, 1), 200),
        do_sample=req.do_sample,
        temperature=req.temperature,
        top_k=req.top_k or None,
        top_p=req.top_p,
        num_return_sequences=1,
    )[0]["generated_text"]

    # remove the prompt prefix
    if output.startswith(prompt):
        output = output[len(prompt):].strip()

    return GenerateResponse(generated_text=output)


<<<<<<< HEAD
@app.post("/toxicityHateSpeechPrediction", response_model=PredictionResponse)
async def predict_toxicity(req: TextRequest):
    """
    Checks toxicity using 'unitary/toxic-bert' (This still uses text_classification)
    """
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
    Rewrites text using Llama-3 Chat API
    """
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
    Analyzes the PARENT POST (context) to inform the user before they reply.
    """
    try:
        # We focus on the context (the post being replied to)
        # If context is missing, we analyze the drafted text instead.
        target_text = req.context if req.context else req.text
        
        messages = [
            {
                "role": "system", 
                "content": (
                    "You are a helpful communication aide. "
                    "The user is about to reply to the following social media post. "
                    "Analyze THIS POST and provide information and context cues so they can write a better response."
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
    

=======
>>>>>>> parent of 75d0ff6b (Update backend)
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, log_level="info")
