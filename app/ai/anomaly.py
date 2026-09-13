from pathlib import Path
import joblib
import numpy as np
import pandas as pd

from .config import MODEL_PATH

_ARTIFACT = None


def _load():
    global _ARTIFACT
    if _ARTIFACT is None:
        # Resolve relative to the project root, not the terminal's current directory.
        project_root = Path(__file__).resolve().parents[2]
        path = project_root / MODEL_PATH
        if not path.exists():
            raise FileNotFoundError(
                f"Isolation Forest model not found at {path}. "
                "Make sure ml/models/isolation_forest.joblib exists."
            )
        _ARTIFACT = joblib.load(path)
    return _ARTIFACT


def detect_anomaly(features):
    artifact = _load()
    cols = artifact["feature_cols"]
    # DataFrame preserves feature names and avoids sklearn's feature-name warning.
    x = pd.DataFrame([[features.get(c, 0.0) for c in cols]], columns=cols)
    raw = float(-artifact["model"].decision_function(x)[0])
    score = float(1.0 / (1.0 + np.exp(-8.0 * raw)))
    return max(0.0, min(1.0, score)), raw
