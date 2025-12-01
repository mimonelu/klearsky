# server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import logging
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

# USE A HUGGINGFACE ONLINE MODEL
MODEL_NAME = "gpt2"   # ← change this to any HF model you want

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

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


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, log_level="info")
