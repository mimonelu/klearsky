# 📖 Content Moderation API - README

This repository hosts a **Content Moderation Backend** powered by Python (`FastAPI`) and Hugging Face Transformers. It serves as the intelligent engine for a frontend application (e.g., a social media platform like Klearsky) to detect toxicity, suggest non-toxic rewrites, and visualize toxic language patterns.

---

## 🚀 Features

This API exposes four main capabilities:

### 1. 🛡️ Toxicity Detection
* **Endpoint:** `/toxicityHateSpeechPrediction`
* **Model:** `unitary/toxic-bert`
* **Function:** Analyzes text and returns a probability score for various toxicity labels (toxic, severe_toxic, obscene, threat, insult, identity_hate).
* **Use Case:** Real-time flagging of harmful content before it is posted.

### 2. ✨ Non-Toxic Rewriting
* **Endpoint:** `/nonToxicRewriting`
* **Model:** `meta-llama/Meta-Llama-3-8B-Instruct`
* **Function:** Uses a Large Language Model (LLM) to rewrite toxic or aggressive messages into polite, constructive alternatives while preserving the original intent.
* **Use Case:** Helping users rephrase heated comments ("Smart Reply" for moderation).

### 3. ℹ️ Contextual Analysis (Info Mode)
* **Endpoint:** `/infoMessage`
* **Model:** `meta-llama/Meta-Llama-3-8B-Instruct`
* **Function:** Analyzes the *parent post* (the post a user is replying to) to provide context cues.
* **Use Case:** Helping users understand the tone or nuance of a discussion before they reply, reducing misunderstandings.

### 4. 🔍 Toxic Spans Visualization (Explainability)
* **Endpoint:** `/toxicSpans`
* **Method:** Classifier + Input Perturbation (Masking)
* **Function:** Identifies *which specific words* make a sentence toxic. It does this by masking words one by one and measuring the drop in the toxicity score.
* **Use Case:** Visualizing toxicity (e.g., highlighting specific insults in red) so users know exactly what to change.

---

## 🛠️ Technical Stack

* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Server:** Uvicorn (ASGI)
* **AI Inference:** [Hugging Face InferenceClient](https://huggingface.co/docs/huggingface_hub/guides/inference)
    * This API connects to Hugging Face's Serverless Inference API, so huge models do not need to run on your local machine.

---
