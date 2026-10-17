"""
Evaluation script for Nutrify AI Intent Classification model.
Loads the saved pipeline and evaluates on test_data.json or any provided test dataset.
"""
import os
import json
import joblib
import numpy as np
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def run_evaluation(test_filename="test_data.json"):
    model_path = os.path.join(MODELS_DIR, "intent_pipeline.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}. Run train.py first.")

    pipeline = joblib.load(model_path)
    test_path = os.path.join(DATASET_DIR, test_filename)
    with open(test_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)

    X_test = [item["text"] for item in test_data]
    y_test = [item["intent"] for item in test_data]

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    unique_labels = sorted(list(set(y_test)))
    report_text = classification_report(y_test, y_pred, digits=4, zero_division=0)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=unique_labels)

    print("==================================================")
    print("      NUTRIFY AI INTENT EVALUATION REPORT        ")
    print("==================================================")
    print(f"Test Samples: {len(X_test)}")
    print(f"Accuracy    : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision   : {precision:.4f}")
    print(f"Recall      : {recall:.4f}")
    print(f"F1-Score    : {f1:.4f}\n")
    print("Classification Report:")
    print(report_text)
    print("Confusion Matrix:")
    print(f"Labels: {unique_labels}")
    print(conf_matrix)
    print("==================================================")

    return {
        "accuracy": acc,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": conf_matrix.tolist()
    }

if __name__ == "__main__":
    run_evaluation()
