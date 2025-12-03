# 📖 Content Moderation API & Activity Logging

This repository hosts a **Content Moderation Backend** powered by Python (`FastAPI`) and Hugging Face Transformers. It serves as the intelligent engine for a frontend application (e.g., a social media platform like Klearsky) to detect toxicity, suggest non-toxic rewrites, and visualize toxic language patterns.

Additionally, this system includes a comprehensive **User Activity Logging** module to analyze user behavior, moderation effectiveness, and intervention impact via a local SQLite database.

---

## 🛠️ Technical Stack

* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Server:** Uvicorn (ASGI)
* **AI Inference:** [Hugging Face InferenceClient](https://huggingface.co/docs/huggingface_hub/guides/inference)
    * *Note:* This API connects to Hugging Face's Serverless Inference API, allowing for the use of powerful LLMs and BERT models without requiring local GPU resources.
* **Database:** SQLite (`SQLAlchemy`)

---

## 🚀 API Features & Endpoints

This API exposes four main intelligent capabilities:

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

## 📝 User Activity Logging Documentation

The backend automatically logs user interactions within the "New Post" popup to a local SQLite database. This data is structured to allow for granular analysis of user sessions.

### 1. Database Schema

**File:** `user_activity.db`  
**Table:** `activity_logs`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique auto-incrementing ID. |
| `user_did` | String | The decentralized identifier (DID) of the user. |
| `timestamp` | DateTime | UTC timestamp of when the event occurred. |
| `action_type` | String | The specific event identifier (see Section 4). |
| `input_text` | Text | The content of the text area at the moment of the log. |
| `moderation_mode` | String | The active tool selected by the user (see Section 3). |
| `metadata_json` | JSON | Context-specific data (Session ID, scores, duration, etc.). |

### 2. Global Metadata

The following keys are injected into `metadata_json` for **every** log entry (where applicable):

* **`popup_session_id`** (String): A unique ID generated when the popup opens (`UserDID_Timestamp`). Use this to group all actions within a single "writing session" (from Open to Close).
* **`parent_cid`** (String): If the post is a **reply**, this contains the CID of the post being replied to.
* **`parent_text`** (String): If the post is a **reply**, this contains the text of the post being replied to.

### 3. Moderation Modes

The `moderation_mode` column tracks which intervention tool was active during the event.

| Mode Key | Description |
| :--- | :--- |
| `STANDARD` | No specific moderation tool selected (Default). |
| `SAFE` | **Safe Submit Mode**: Blocks submission if toxicity > 50% until confirmed. |
| `REWRITE` | **Live Rewrite**: Suggests non-toxic alternatives if toxicity > 60%. |
| `INFO` | **Analysis Mode**: Provides context/conflict resolution advice for the thread. |
| `VISUALIZATION1` | **Dynamic Bar**: Shows a real-time toxicity percentage bar. |
| `VISUALIZATION2` | **Toxic Spans**: Highlights specific words contributing to toxicity. |

---

## 4. Action Types & Metadata Dictionary

Below is the list of all interactions logged (`action_type`) and the specific data stored in `metadata_json`.

### 🟢 Session Lifecycle
Tracking when the user starts and stops writing.

* **`POPUP_OPENED`**
    * Trigger: User opens the "New Post" or "Reply" window.
    * Meta: `{"timestamp_ms": 1709...}`
* **`POPUP_CLOSED`**
    * Trigger: User closes the window (via Submit, Cancel, or clicking away).
    * Meta: `{"duration_ms": 4500}` (Time spent in this session).

### ✍️ Drafting
* **`DRAFT_AUTOSAVE`**
    * Trigger: User types in the text area (debounced by 1s).
    * Meta: `{"length": 140}` (Character count).

### 🛡️ Feature Specific Logs

**Visualization 1 (Toxicity Bar)**
* **`VISUALIZATION_1_UPDATE`**
    * Trigger: Real-time update of the toxicity score bar.
    * Meta: `{"score": 0.85}` (0.0 to 1.0).

**Visualization 2 (Toxic Spans)**
* **`VISUALIZATION_2_UPDATE`**
    * Trigger: System identifies specific toxic words.
    * Meta: `{"spans": [{"word": "badword", "score": 0.9}]}`

**Rewrite Mode**
* **`REWRITE_SUGGESTED`**
    * Trigger: System generates a new version of the text.
    * Meta:
        ```json
        {
          "original": "You are stupid",
          "suggestion": "I disagree with you",
          "score": 0.95
        }
        ```

**Info/Analysis Mode**
* **`INFO_REQUESTED`**
    * Trigger: System fetches thread context and generates advice.
    * Meta: `{"thread_length": 5}` (Number of ancestor posts analyzed).

### 🚀 Submission Flow
These events occur when the user clicks "Post".

**General**
* **`POST_SUBMITTED`**
    * Trigger: User clicks "Post" (logged if no blocking logic is triggered).
    * Meta: `{"final_mode": "STANDARD"}`

**Safe Mode Interventions**
* **`SUBMIT_BLOCKED_SAFE_MODE`**
    * Trigger: User clicked Post, but toxicity was high. Popup blocked.
    * Meta: `{"score": 0.88}`
* **`SUBMIT_CANCELLED_BY_USER`**
    * Trigger: User clicked "Cancel" on the warning dialog.
    * Meta: `{}`
* **`SUBMIT_FORCED_BY_USER`**
    * Trigger: User clicked "Post Anyway" on the warning dialog.
    * Meta: `{}`

**Rewrite Mode Interventions**
* **`REWRITE_ACCEPTED_AT_SUBMIT`**
    * Trigger: User accepted the rewrite suggestion offered upon clicking Post.
    * Meta: `{}`
* **`REWRITE_REJECTED_AT_SUBMIT`**
    * Trigger: User rejected the rewrite and chose to post the original text.
    * Meta: `{}`

**Errors**
* **`POST_SUBMITTED_ON_ERROR`**
    * Trigger: Moderation API failed, user chose to post without checking.
    * Meta: `{}`
* **`POST_SUBMISSION_FAILED`**
    * Trigger: Bluesky API rejected the post (e.g., rate limit).
    * Meta: `{"error": "Error message string"}`

### ✅ Final Outcome
* **`POST_PUBLISHED`**
    * Trigger: Post successfully sent to Bluesky Network.
    * Meta:
        ```json
        {
          "final_mode": "REWRITE",
          "cid": "bafyre...",
          "uri": "at://did:plc:..."
        }
        ```

---
