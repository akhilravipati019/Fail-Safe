"""
Trains the FAILSAFE at-risk-student model and saves it for the backend.

Ported from FAILSAFE_Project.ipynb. Run from the backend/ml_training directory:

    python train_model.py

Produces ../app/ml/failsafe_model.pkl containing:
    - model: trained XGBClassifier
    - feature_cols: ordered list of input feature names
    - categorical_cols: subset of feature_cols that are label-encoded
    - le_dict: {column -> ordered list of original category labels}
"""
import os
import pickle

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    # 1. Load + combine datasets
    df_mat = pd.read_csv(os.path.join(HERE, "student-mat.csv"), sep=";")
    df_por = pd.read_csv(os.path.join(HERE, "student-por.csv"), sep=";")

    df_mat["course"] = "mat"
    df_por["course"] = "por"

    df_all = pd.concat([df_mat, df_por], ignore_index=True)
    print("Total students (rows):", df_all.shape[0])
    print("Total columns:", df_all.shape[1])

    # 2. Target: at_risk = final grade < 10
    df_all["at_risk"] = (df_all["G3"] < 10).astype(int)
    print(df_all["at_risk"].value_counts())
    print(f"Percentage at risk: {df_all['at_risk'].mean() * 100:.1f}%")

    # 3. Label-encode categorical columns
    categorical_cols = [
        "school", "sex", "address", "famsize", "Pstatus", "Mjob", "Fjob",
        "reason", "guardian", "schoolsup", "famsup", "paid", "activities",
        "nursery", "higher", "internet", "romantic", "course",
    ]

    le_dict = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df_all[col] = le.fit_transform(df_all[col])
        le_dict[col] = list(le.classes_)

    print("Encoded columns:", categorical_cols)

    # 4. Feature set: everything except G2, G3, at_risk
    feature_cols = [c for c in df_all.columns if c not in ["G2", "G3", "at_risk"]]
    print(f"Using {len(feature_cols)} features:")
    print(feature_cols)

    # 5. Train/test split
    X = df_all[feature_cols]
    y = df_all["at_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print("Training samples:", X_train.shape[0])
    print("Testing samples:", X_test.shape[0])

    # 6. Baseline model
    baseline_model = XGBClassifier(
        n_estimators=100, max_depth=4, learning_rate=0.1,
        random_state=42, eval_metric="logloss",
    )
    baseline_model.fit(X_train, y_train)

    y_prob = baseline_model.predict_proba(X_test)[:, 1]
    print("Baseline AUC:", roc_auc_score(y_test, y_prob))

    # 7. Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(baseline_model, X_train, y_train, cv=cv, scoring="roc_auc")
    print("CV AUC scores per fold:", cv_scores)
    print(f"Mean AUC: {cv_scores.mean():.4f}  |  Std: {cv_scores.std():.4f}")

    # 8. Hyperparameter tuning
    param_grid = {
        "n_estimators": [50, 100, 200],
        "max_depth": [3, 4, 6],
        "learning_rate": [0.01, 0.1, 0.2],
        "subsample": [0.7, 1.0],
        "colsample_bytree": [0.7, 1.0],
    }

    grid = GridSearchCV(
        XGBClassifier(random_state=42, eval_metric="logloss"),
        param_grid,
        cv=5,
        scoring="roc_auc",
        n_jobs=-1,
        verbose=1,
    )
    grid.fit(X_train, y_train)

    print("\nBest parameters found:", grid.best_params_)
    print("Best CV AUC:", grid.best_score_)

    # 9. Evaluate tuned model
    best_model = grid.best_estimator_
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]

    print(classification_report(y_test, y_pred))
    print("Test AUC:", roc_auc_score(y_test, y_prob))

    # 10. Save model bundle
    out_dir = os.path.join(HERE, "..", "app", "ml")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "failsafe_model.pkl")

    with open(out_path, "wb") as f:
        pickle.dump({
            "model": best_model,
            "feature_cols": feature_cols,
            "categorical_cols": categorical_cols,
            "le_dict": le_dict,
        }, f)

    print(f"\nModel saved to {out_path}")
    print(f"Final Test AUC: {roc_auc_score(y_test, y_prob):.4f}")


if __name__ == "__main__":
    main()
