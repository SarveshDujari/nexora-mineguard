from datetime import UTC, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.models.alert import Alert
from app.models.risk_score import RiskScore
from app.models.sensor_reading import SensorReading

router = APIRouter(prefix="/api/risk",tags=["Risk"])

def calculate_risk(reading):
    tilt_comp = min(abs(reading.tilt_x) * 100, 100)
    vib_comp = min(reading.vib_rms * 500, 100)
    flex_comp = min(abs(reading.flex_raw - 2100) / 5, 100)
    crack_comp = 100 if not reading.crack_ok else 0
    risk = (
        0.35 * tilt_comp
        + 0.25 * vib_comp
        + 0.25 * flex_comp
        + 0.15 * crack_comp
    )
    return round(risk, 2)

def get_severity(score):
    if score < 30:
        return "LOW"
    elif score < 60:
        return "MEDIUM"
    elif score < 80:
        return "HIGH"
    return "CRITICAL"

@router.get("/{node_id}")
def get_risk_scores(node_id: str, limit: int = 200, db: Session = Depends(get_db)):
    return (
        db.query(RiskScore)
        .filter(RiskScore.node_id == node_id)
        .order_by(RiskScore.timestamp.desc())
        .limit(limit)
        .all()
    )

@router.post("/calculate/{node_id}")
def calculate_node_risk(node_id: str,db: Session = Depends(get_db)):
    reading = (
        db.query(SensorReading)
        .filter(SensorReading.node_id == node_id)
        .order_by(SensorReading.node_timestamp.desc())
        .first()
    )
    if not reading : 
        return {"error": "No reading found for the given node ID"}
    score = calculate_risk(reading)
    severity = get_severity(score)
    active_alert = (db.query(Alert).filter(Alert.node_id == node_id,Alert.status == "ACTIVE").order_by(Alert.timestamp.desc()).first())
    if active_alert and score < 30:
        active_alert.status = "RESOLVED"
        active_alert.resolved_at = datetime.now(UTC)
        db.commit()
        db.refresh(active_alert)
    risk_entry = RiskScore(
        node_id=node_id,
        score=score,
        signal="ACTIVE",
        severity=severity,
        node_timestamp=reading.node_timestamp,
    )
    db.add(risk_entry)
    db.commit()
    db.refresh(risk_entry)
    return {
        "node_id": node_id,
        "risk_score": score,
        "severity": severity
    }
