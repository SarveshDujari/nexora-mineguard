# MineGuard live-prototype AI configuration.
# Physical prototype: A + B active nodes, C = bridge. No reference node / VD.

NOISE_WINDOW = 20
RATE_MAX = 0.018          # deg/s
TILT_MAX = 1.2            # deg
RSSI_DRIFT_MAX = 10.0     # dB

# Live prototype fusion: only signals actually available on A/B.
TILT_WEIGHT = 0.50
RSSI_WEIGHT = 0.25
ANOMALY_WEIGHT = 0.25

AMBER_THRESHOLD = 0.35
RED_THRESHOLD = 0.55
RED_PERSISTENCE = 5
GREEN_RECOVERY = 6

ISOLATION_DAMPING = 0.65
CORROBORATION_BONUS = 1.15

MODEL_PATH = "ml/models/isolation_forest.joblib"
