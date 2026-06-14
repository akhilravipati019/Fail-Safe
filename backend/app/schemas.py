from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TeacherOut(BaseModel):
    id: int
    username: str
    full_name: str

    class Config:
        from_attributes = True


class NumericFieldMeta(BaseModel):
    type: str = "number"
    label: str
    description: str
    min: float
    max: float
    step: float = 1


class CategoricalFieldMeta(BaseModel):
    type: str = "select"
    label: str
    description: str
    options: List[str]


class MetaOptionsResponse(BaseModel):
    feature_cols: List[str]
    categorical_fields: Dict[str, CategoricalFieldMeta]
    numeric_fields: Dict[str, NumericFieldMeta]
    groups: Dict[str, List[str]]


# StudentInput is intentionally a free-form dict: 32 raw feature values,
# either category labels (e.g. "F", "yes") or numbers.
StudentInput = Dict[str, Any]


class TopFactor(BaseModel):
    feature: str
    label: str
    value: Any
    shap_impact: float
    direction: str  # "increases" | "decreases"


class PredictionResult(BaseModel):
    row_index: int
    risk_probability: float
    risk_percent: float
    risk_level: str  # "low" | "medium" | "high"
    top_factors: List[TopFactor]
    interventions: List[str]


class SingleResultResponse(PredictionResult):
    narrative: str
    llm_generated: bool


class CsvResultsResponse(BaseModel):
    results: List[PredictionResult]


class ExplainRequest(BaseModel):
    risk_percent: float
    risk_level: str
    top_factors: List[TopFactor]
    interventions: List[str]


class ExplainResponse(BaseModel):
    narrative: str
    llm_generated: bool
