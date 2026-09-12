from datetime import UTC, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.models.alert import Alert
from app.models.risk_score import RiskScore
from app.models.sensor_reading import SensorReading
from app.services.risk_service import (calculate_risk,get_severity)

router = APIRouter(prefix="/api/risk",tags=["Risk"])

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
    if active_alert and score < 10:
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
