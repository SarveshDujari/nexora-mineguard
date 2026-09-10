from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.models.alert import Alert
from app.models.risk_score import RiskScore

router = APIRouter(prefix="/api/alerts",tags=["Alerts"])
@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()
@router.post("/generate/{node_id}")
def generate_alert(node_id: str,db: Session = Depends(get_db)):
    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.node_id == node_id)
        .order_by(RiskScore.node_timestamp.desc())
        .first()
    )
    if not latest_risk:
        return {"error": "No risk score found for the given node ID"}
    if latest_risk.score >= 80:
        severity = "CRITICAL"
    elif latest_risk.score >= 60:
        severity = "HIGH"
    elif latest_risk.score >= 40:
        severity = "MEDIUM"
    else:
        severity = "LOW"
    if severity == "LOW":
        return {"message": "Risk level too low to generate an alert"}
    existing_alert = (
        db.query(Alert).filter(Alert.node_id == node_id, Alert.status == "ACTIVE").first()
    )
    if existing_alert:
        return {
            "message": "Active alert already exists",
            "alert_id": existing_alert.id
        }
    message = (
        f"{severity} subsidence risk detected "
        f"for node {node_id}"
    )
    alert = Alert(
        node_id=node_id,
        severity=severity,
        signal=latest_risk.signal,
        score=latest_risk.score,
        message=message,
        node_timestamp=latest_risk.node_timestamp,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id,
        "node_id": alert.node_id,
        "severity": alert.severity,
        "score": alert.score,
        "signal": alert.signal,
        "message": alert.message,
        "status": alert.status
    }