import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from .. import models, schemas
from ..deps import get_current_teacher
from ..ml.feature_meta import (
    FEATURE_DESCRIPTIONS,
    FEATURE_LABELS,
    FIELD_GROUPS,
    NUMERIC_RANGES,
)
from ..ml.llm import generate_narrative
from ..ml.model_loader import get_model_bundle
from ..ml.predict_service import predict_with_explanations

router = APIRouter(dependencies=[Depends(get_current_teacher)])


@router.get("/meta/options", response_model=schemas.MetaOptionsResponse)
def get_meta_options(_: models.Teacher = Depends(get_current_teacher)):
    bundle = get_model_bundle()
    feature_cols = bundle["feature_cols"]
    categorical_cols = bundle["categorical_cols"]
    le_dict = bundle["le_dict"]

    categorical_fields = {}
    numeric_fields = {}

    for col in feature_cols:
        label = FEATURE_LABELS.get(col, col)
        description = FEATURE_DESCRIPTIONS.get(col, "")

        if col in categorical_cols:
            categorical_fields[col] = schemas.CategoricalFieldMeta(
                label=label,
                description=description,
                options=le_dict[col],
            )
        else:
            lo, hi, step = NUMERIC_RANGES.get(col, (0, 100, 1))
            numeric_fields[col] = schemas.NumericFieldMeta(
                label=label,
                description=description,
                min=lo,
                max=hi,
                step=step,
            )

    return schemas.MetaOptionsResponse(
        feature_cols=feature_cols,
        categorical_fields=categorical_fields,
        numeric_fields=numeric_fields,
        groups=FIELD_GROUPS,
    )


@router.post("/predict/single", response_model=schemas.SingleResultResponse)
def predict_single(student: schemas.StudentInput, _: models.Teacher = Depends(get_current_teacher)):
    if not student:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No student data provided.")

    result = predict_with_explanations([student])[0]

    narrative, llm_generated = generate_narrative(
        result["risk_percent"], result["risk_level"], result["top_factors"], result["interventions"]
    )

    return schemas.SingleResultResponse(**result, narrative=narrative, llm_generated=llm_generated)


@router.post("/predict/csv", response_model=schemas.CsvResultsResponse)
def predict_csv(file: UploadFile = File(...), _: models.Teacher = Depends(get_current_teacher)):
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a .csv file.")

    raw_bytes = file.file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw_bytes), sep=None, engine="python")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not parse CSV file.")

    if df.empty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV has no rows.")

    bundle = get_model_bundle()
    feature_cols = bundle["feature_cols"]

    required_cols = [c for c in feature_cols if c != "course"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV is missing required columns: {', '.join(missing)}",
        )

    df = df.where(pd.notnull(df), None)
    raw_rows = df.to_dict(orient="records")

    results = predict_with_explanations(raw_rows)
    return schemas.CsvResultsResponse(results=results)


@router.post("/predict/explain", response_model=schemas.ExplainResponse)
def predict_explain(payload: schemas.ExplainRequest, _: models.Teacher = Depends(get_current_teacher)):
    narrative, llm_generated = generate_narrative(
        payload.risk_percent,
        payload.risk_level,
        [f.model_dump() for f in payload.top_factors],
        payload.interventions,
    )
    return schemas.ExplainResponse(narrative=narrative, llm_generated=llm_generated)
