from typing import Any, Dict, List

import numpy as np
import pandas as pd

from .feature_meta import CATEGORICAL_DEFAULTS, FEATURE_LABELS, NUMERIC_RANGES
from .interventions import suggest_interventions
from .model_loader import get_model_bundle


def risk_level(probability: float) -> str:
    if probability < 0.3:
        return "low"
    if probability < 0.6:
        return "medium"
    return "high"


def _encode_value(col: str, value: Any, le_dict: Dict[str, list], categorical_cols: List[str]) -> float:
    if col in categorical_cols:
        classes = le_dict[col]
        str_value = str(value).strip()

        # try exact, then case-insensitive match against known classes
        if str_value in classes:
            return float(classes.index(str_value))

        for i, cls in enumerate(classes):
            if str(cls).lower() == str_value.lower():
                return float(i)

        # unseen category -> fall back to default, else first class
        default = CATEGORICAL_DEFAULTS.get(col, classes[0])
        return float(classes.index(default)) if default in classes else 0.0

    # numeric feature
    try:
        num = float(value)
    except (TypeError, ValueError):
        num = 0.0

    if col in NUMERIC_RANGES:
        lo, hi, _ = NUMERIC_RANGES[col]
        num = min(max(num, lo), hi)

    return num


def encode_rows(raw_rows: List[Dict[str, Any]]) -> pd.DataFrame:
    """Convert a list of raw feature dicts into an encoded DataFrame
    matching the model's expected feature_cols order."""
    bundle = get_model_bundle()
    feature_cols = bundle["feature_cols"]
    categorical_cols = bundle["categorical_cols"]
    le_dict = bundle["le_dict"]

    encoded_records = []
    for raw in raw_rows:
        record = {}
        for col in feature_cols:
            raw_value = raw.get(col, CATEGORICAL_DEFAULTS.get(col))
            if raw_value is None or (isinstance(raw_value, float) and np.isnan(raw_value)):
                raw_value = CATEGORICAL_DEFAULTS.get(col, 0)
            record[col] = _encode_value(col, raw_value, le_dict, categorical_cols)
        encoded_records.append(record)

    return pd.DataFrame(encoded_records, columns=feature_cols)


def predict_with_explanations(raw_rows: List[Dict[str, Any]], top_n: int = 5) -> List[dict]:
    """Run the model + SHAP on a batch of raw feature rows.

    Returns a list of result dicts (matching schemas.PredictionResult).
    """
    bundle = get_model_bundle()
    model = bundle["model"]
    explainer = bundle["explainer"]
    feature_cols = bundle["feature_cols"]

    X = encode_rows(raw_rows)
    probs = model.predict_proba(X)[:, 1]
    shap_values = explainer.shap_values(X)

    results = []
    for i, raw in enumerate(raw_rows):
        prob = float(probs[i])
        row_shap = shap_values[i]

        factors = []
        for feat_idx, feature in enumerate(feature_cols):
            factors.append({
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "value": raw.get(feature, X.iloc[i][feature]),
                "shap_impact": float(row_shap[feat_idx]),
                "direction": "increases" if row_shap[feat_idx] > 0 else "decreases",
            })

        factors.sort(key=lambda f: abs(f["shap_impact"]), reverse=True)
        top_factors = factors[:top_n]

        results.append({
            "row_index": i,
            "risk_probability": prob,
            "risk_percent": round(prob * 100, 1),
            "risk_level": risk_level(prob),
            "top_factors": top_factors,
            "interventions": suggest_interventions(top_factors, top_n=3),
        })

    return results
