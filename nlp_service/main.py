"""
FastAPI Microservice for Nutrify AI Natural Language Processing.
Provides endpoints for Intent Classification, Entity Extraction, and Model Health.
"""
import os
import re
import joblib
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nlp_service.extractor import EntityExtractor
from nlp_service.train import train_and_evaluate

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "intent_pipeline.joblib")

app = FastAPI(
    title="Nutrify AI NLP Microservice",
    description="Intent Classification and Entity Extraction for Nutrition & Food Ordering Analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model and extractor instances
pipeline = None
extractor = None

def get_pipeline():
    global pipeline
    if pipeline is None:
        if not os.path.exists(MODEL_PATH):
            print("Model artifact not found. Training model now...")
            pipeline, _ = train_and_evaluate()
        else:
            pipeline = joblib.load(MODEL_PATH)
    return pipeline

def get_extractor():
    global extractor
    if extractor is None:
        extractor = EntityExtractor()
    return extractor

@app.on_event("startup")
def startup_event():
    get_pipeline()
    get_extractor()
    print("Nutrify AI NLP service initialized successfully.")

class ParseRequest(BaseModel):
    text: str = Field(..., description="Natural language user query", min_length=1)
    user_context: Optional[Dict[str, Any]] = Field(default=None, description="Optional user contextual metadata")

class EntityDetails(BaseModel):
    food_items: List[str]
    foods_detailed: List[Dict[str, Any]]
    quantity: Optional[float]
    meal_type: Optional[str]
    time_reference: Optional[str]
    nutrition_terms: List[str]

class ParseResponse(BaseModel):
    intent: str
    confidence: float
    all_scores: Dict[str, float]
    entities: EntityDetails

@app.get("/health")
def health_check():
    model_loaded = pipeline is not None or os.path.exists(MODEL_PATH)
    return {
        "status": "healthy",
        "service": "nutrify-nlp",
        "model_loaded": model_loaded,
        "engine": "spaCy + scikit-learn Calibrated LinearSVC"
    }

@app.get("/intents")
def list_intents():
    return {
        "intents": [
            {"id": "calorie_lookup", "description": "Specific food calorie lookups and calculations"},
            {"id": "nutrition_info", "description": "Detailed macro, micronutrient and ingredient breakdown"},
            {"id": "food_recommendation", "description": "Suggestions for healthy meals, dinners, and snacks"},
            {"id": "food_substitution", "description": "Healthy alternatives and food swaps for junk food"},
            {"id": "habit_advice", "description": "Behavioral guidance to mitigate late-night cravings and risk"},
            {"id": "order_history", "description": "Queries on user's past orders and food intake logs"},
            {"id": "general_nutrition", "description": "Educational nutrition science questions"},
            {"id": "unsupported", "description": "Out of scope, non-nutrition queries"}
        ]
    }

@app.post("/parse", response_model=ParseResponse)
def parse_message(request: ParseRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    current_pipeline = get_pipeline()
    current_extractor = get_extractor()

    # Intent Classification
    predicted_intent = current_pipeline.predict([text])[0]
    probabilities = current_pipeline.predict_proba([text])[0]
    classes = current_pipeline.classes_

    scores_dict = {cls_name: float(round(prob, 4)) for cls_name, prob in zip(classes, probabilities)}
    confidence = float(round(max(probabilities), 4))

    # Entity Extraction
    entities = current_extractor.parse(text)

    # Intent refinement based on extracted entities:
    # 1. Calorie lookup priority if calorie term is explicitly queried for a food
    if ("calories" in entities["nutrition_terms"] or "kcal" in entities["nutrition_terms"] or "calorie" in text.lower()) and entities["food_items"]:
        predicted_intent = "calorie_lookup"

    # 2. If classified as nutrition_info but has no catalog food and asks general science / hydration questions
    general_science_keywords = ["water", "hydration", "sleep", "metabolism", "fasting", "intermittent", "daily recommended", "average adult", "exercise", "lifestyle disease"]
    has_catalog_food = any(f.get("is_in_catalog", False) for f in entities.get("foods_detailed", []))
    if predicted_intent == "nutrition_info" and not has_catalog_food:
        if any(kw in text.lower() for kw in general_science_keywords):
            predicted_intent = "general_nutrition"

    # 3. Consumption reporting statements: "I ate X", "I had X", "I just ate" with catalog food
    consumption_cues = ["i ate", "i had", "i consumed", "just ate", "i've eaten", "i ordered and ate"]
    if any(c in text.lower() for c in consumption_cues) and has_catalog_food:
        if predicted_intent in ("unsupported", "general_nutrition", "nutrition_info"):
            predicted_intent = "habit_advice"

    # 4. If query mentions a catalog food, it is never unsupported
    if predicted_intent == "unsupported" and has_catalog_food:
        predicted_intent = "habit_advice"

    # Greeting detection: "hi", "hello", "hey", "good morning", etc.
    clean_text = re.sub(r'[^a-zA-Z\s]', '', text.lower()).strip()
    greeting_patterns = {"hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening", "hi there", "hello there", "hey there", "whats up", "namaste", "hey nutrify", "hello nutrify"}
    if clean_text in greeting_patterns or re.match(r'^(hi|hello|hey|greetings)\b', clean_text):
        predicted_intent = "greeting"
        confidence = 0.99
        scores_dict["greeting"] = 0.99

    # If confidence is exceptionally low (< 0.25) across all nutrition classes and no entities found, flag unsupported
    if predicted_intent != "greeting" and confidence < 0.25 and not entities["food_items"] and not entities["nutrition_terms"]:
        predicted_intent = "unsupported"

    return {
        "intent": predicted_intent,
        "confidence": confidence,
        "all_scores": scores_dict,
        "entities": entities
    }

@app.post("/retrain")
def retrain_model():
    try:
        global pipeline
        new_pipeline, metrics = train_and_evaluate()
        pipeline = new_pipeline
        return {
            "status": "success",
            "message": "Model retrained and updated in memory successfully.",
            "metrics": {
                "accuracy": metrics["accuracy"],
                "precision": metrics["precision_weighted"],
                "recall": metrics["recall_weighted"],
                "f1": metrics["f1_weighted"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("nlp_service.main:app", host="127.0.0.1", port=8000, reload=False)
