"""
Train script for Nutrify AI Intent Classifier.
Builds a TF-IDF + Calibrated Linear Support Vector Classifier pipeline,
evaluates on held-out test data, and persists the trained model artifact and evaluation metrics.
"""
import os
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def load_data(filename):
    filepath = os.path.join(DATASET_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    texts = [item["text"] for item in data]
    labels = [item["intent"] for item in data]
    return texts, labels

def train_and_evaluate():
    print("Loading datasets...")
    X_train, y_train = load_data("training_data.json")
    X_test, y_test = load_data("test_data.json")

    print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples.")

    # Optimized TF-IDF + Calibrated LinearSVC pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True,
            min_df=1
        )),
        ('clf', CalibratedClassifierCV(
            LinearSVC(C=1.0, random_state=42, dual=True, max_iter=2000),
            cv=3
        ))
    ])

    print("Fitting model...")
    pipeline.fit(X_train, y_train)

    print("Evaluating model on held-out test set...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
    unique_labels = sorted(list(set(y_test)))
    report = classification_report(y_test, y_pred, digits=4, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred, digits=4, zero_division=0)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=unique_labels).tolist()

    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1-Score : {f1:.4f}")
    print("\nDetailed Classification Report:")
    print(report_text)
    print("Confusion Matrix:")
    print(np.array(conf_matrix))

    # Persist model artifact
    model_path = os.path.join(MODELS_DIR, "intent_pipeline.joblib")
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved to: {model_path}")

    # Persist metrics for reference and audit
    metrics = {
        "accuracy": float(acc),
        "precision_weighted": float(precision),
        "recall_weighted": float(recall),
        "f1_weighted": float(f1),
        "labels": unique_labels,
        "confusion_matrix": conf_matrix,
        "classification_report": report
    }
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")

    return pipeline, metrics

if __name__ == "__main__":
    train_and_evaluate()
