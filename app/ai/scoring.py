import math

from .config import (
    RATE_MAX, TILT_MAX, RSSI_DRIFT_MAX,
    TILT_WEIGHT, RSSI_WEIGHT, ANOMALY_WEIGHT,
    AMBER_THRESHOLD, RED_THRESHOLD,
    ISOLATION_DAMPING, CORROBORATION_BONUS,
)


def track_a(features):
    rate_component = min(abs(features["tilt_rate"]) / RATE_MAX, 1.0)
    deviation_component = min(features["tilt_mag"] / TILT_MAX, 1.0)
    return 0.70 * rate_component + 0.30 * deviation_component


def track_b(features, track_a_score):
    rssi_component = min(abs(features["rssi_drift"]) / RSSI_DRIFT_MAX, 1.0)
    return math.sqrt(max(0.0, rssi_component * track_a_score))


def fusion(track_a_score, track_b_score, anomaly_score, corroborated=False):
    score = (
        TILT_WEIGHT * track_a_score
        + RSSI_WEIGHT * track_b_score
        + ANOMALY_WEIGHT * anomaly_score
    )
    if corroborated:
        score *= CORROBORATION_BONUS
    return max(0.0, min(1.0, score))


def severity(score):
    if score >= RED_THRESHOLD:
        return "RED"
    if score >= AMBER_THRESHOLD:
        return "AMBER"
    return "GREEN"
