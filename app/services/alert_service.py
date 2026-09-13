from fastapi import Depends
from requests import Session
from app.database.dependencies import get_db
from app.models.risk_score import RiskScore
from app.models.alert import Alert

def generate_alert_for_node(node_id: str,db: Session = Depends(get_db)):
    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.node_id == node_id)
        .order_by(RiskScore.node_timestamp.desc())
        .first()
    )
    if not latest_risk:
        return {"error": "No risk score found for the given node ID"}
    if latest_risk.score >= 40:
        severity = "HIGH"
    elif latest_risk.score >= 20:
        severity = "MEDIUM"
    else:
        severity = "LOW"
    if severity == "LOW":
        return {"message": "Risk level too low to generate an alert"}
    existing_alert = (
        db.query(Alert).filter(Alert.node_id == node_id, Alert.status == "ACTIVE").first()
    )
    if existing_alert:
        severity_rank = {
            "LOW" : 0,
            "MEDIUM": 1,
            "HIGH": 2   
        }
        if severity_rank[severity] > severity_rank[existing_alert.severity]:
            existing_alert.severity = severity
            existing_alert.score = latest_risk.score
            existing_alert.message = (
                f"{severity} level subsidence risk detected "
                f"for node {node_id}"
            )
            db.commit()
            return {
                "message": "alert escalated",
                "alert_id": existing_alert.id
            }
        return {
            "message": "Active alert already exists",
            "alert_id": existing_alert.id
        }
    message = (
        f"{severity} level subsidence risk detected "
        f"for node {node_id}"
    )
    alert = Alert(
        node_id=node_id,
        status = "ACTIVE",
        severity=severity,
        signal=latest_risk.signal,
        score=latest_risk.score,
        message=message,
        acknowledged=False,
        sms_sent=False,
        email_sent=False,
        resolved_at=None,
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
        "status": alert.status,
        "acknowledged": alert.acknowledged,
        "sms_sent": alert.sms_sent,
        "email_sent": alert.email_sent,
        "resolved_at": alert.resolved_at
    }