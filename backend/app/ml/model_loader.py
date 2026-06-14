import os
import pickle
import threading

import shap

_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "failsafe_model.pkl")

_lock = threading.Lock()
_bundle = None


def get_model_bundle():
    """Lazily load the trained model bundle + build a SHAP explainer once."""
    global _bundle
    if _bundle is None:
        with _lock:
            if _bundle is None:
                if not os.path.exists(_MODEL_PATH):
                    raise FileNotFoundError(
                        f"Model file not found at {_MODEL_PATH}. "
                        "Run backend/ml_training/train_model.py first."
                    )
                with open(_MODEL_PATH, "rb") as f:
                    data = pickle.load(f)

                data["explainer"] = shap.TreeExplainer(data["model"])
                _bundle = data

    return _bundle
