import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, PassiveAggressiveClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "..", "datasets", "sample_news_dataset.csv")
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # Combine title and text for training
    df['combined_text'] = df['title'].fillna('') + " " + df['text'].fillna('')
    X = df['combined_text']
    y = df['label'] # 1 = Real, 0 = Fake

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

    candidates = {
        "LogisticRegression": LogisticRegression(C=1.0, max_iter=200),
        "PassiveAggressive": PassiveAggressiveClassifier(max_iter=100, random_state=42),
        "MultinomialNB": MultinomialNB(alpha=0.1),
        "RandomForest": RandomForestClassifier(n_estimators=50, random_state=42)
    }

    best_f1 = -1.0
    best_name = None
    best_pipeline = None
    best_metrics = {}
    all_results = {}

    for name, clf in candidates.items():
        pipe = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
            ('clf', clf)
        ])
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()

        all_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "confusion_matrix": cm
        }
        print(f"[{name}] Acc: {acc:.3f} | Prec: {prec:.3f} | Rec: {rec:.3f} | F1: {f1:.3f}")

        if f1 > best_f1:
            best_f1 = f1
            best_name = name
            best_pipeline = pipe
            best_metrics = all_results[name]

    # Save best model
    model_output_path = os.path.join(models_dir, "news_classifier_pipeline.joblib")
    joblib.dump(best_pipeline, model_output_path)
    print(f"\nBest Model Selected: {best_name} (F1: {best_f1:.4f})")
    print(f"Saved pipeline to: {model_output_path}")

    metrics_output_path = os.path.join(models_dir, "model_metrics.json")
    metrics_data = {
        "best_model": best_name,
        "metrics": best_metrics,
        "all_model_evaluations": all_results,
        "dataset_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features": "TF-IDF (1-2 ngrams, 5000 features)"
    }
    with open(metrics_output_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved metrics to: {metrics_output_path}")

if __name__ == "__main__":
    train()
