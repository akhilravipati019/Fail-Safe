import logging
from typing import List

from ..config import settings
from .feature_meta import FEATURE_DESCRIPTIONS, FEATURE_LABELS
from .interventions import suggest_interventions

logger = logging.getLogger(__name__)

_GEMINI_MODEL_NAME = "gemini-2.0-flash"
_genai_model = None
_genai_init_failed = False


def _get_genai_model():
    global _genai_model, _genai_init_failed
    if _genai_model is not None or _genai_init_failed:
        return _genai_model

    if not settings.gemini_api_key:
        _genai_init_failed = True
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        _genai_model = genai.GenerativeModel(_GEMINI_MODEL_NAME)
    except Exception:
        logger.exception("Failed to initialize Gemini client")
        _genai_init_failed = True
        _genai_model = None

    return _genai_model


def _build_prompt(risk_percent: float, risk_level: str, top_factors: List[dict], interventions: List[str]) -> str:
    lines = [
        "You are an assistant helping a teacher understand an AI-generated student "
        "at-risk prediction from the FAILSAFE early-warning system.",
        f"The student's predicted risk of failing is {risk_percent:.1f}% ({risk_level} risk).",
        "",
        "The top contributing factors (from a SHAP explanation) are:",
    ]
    for f in top_factors:
        feature = f["feature"]
        label = f.get("label") or FEATURE_LABELS.get(feature, feature)
        desc = FEATURE_DESCRIPTIONS.get(feature, "")
        direction = f["direction"]
        lines.append(f"- {label} = {f['value']} ({desc}) {direction} risk")

    lines.append("")
    lines.append("Rule-based suggested interventions already identified:")
    for s in interventions:
        lines.append(f"- {s}")

    lines.append("")
    lines.append(
        "Write a short, plain-language summary (3-5 sentences) for the teacher explaining "
        "WHY this student was flagged, in terms a non-technical teacher will understand. "
        "Then provide a prioritized, numbered action plan (3-4 concrete steps) the teacher "
        "can take this week. Be supportive and specific, and avoid clinical or judgmental "
        "language. Do not use markdown headings."
    )
    return "\n".join(lines)


def generate_narrative(risk_percent: float, risk_level: str, top_factors: List[dict], interventions: List[str]):
    """Returns (narrative_text, llm_generated_bool)."""
    model = _get_genai_model()

    if model is not None:
        try:
            prompt = _build_prompt(risk_percent, risk_level, top_factors, interventions)
            response = model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text, True
        except Exception:
            logger.exception("Gemini generation failed, falling back to rule-based narrative")

    # Fallback: rule-based summary
    fallback_lines = [
        f"This student has a {risk_percent:.1f}% predicted risk of failing ({risk_level} risk).",
        "Top contributing factors:",
    ]
    for f in top_factors[:3]:
        label = f.get("label") or FEATURE_LABELS.get(f["feature"], f["feature"])
        fallback_lines.append(f"- {label} ({f['direction']} risk)")

    fallback_lines.append("Suggested next steps:")
    for s in interventions or suggest_interventions(top_factors):
        fallback_lines.append(f"- {s}")

    return "\n".join(fallback_lines), False
