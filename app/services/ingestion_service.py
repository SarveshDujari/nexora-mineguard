from sqlalchemy.orm import Session
from app.models.sensor_reading import SensorReading
from app.repositories.sensor_repo import (create_sensor_readings, create_sensor_readings)
from app.models.risk_score import RiskScore
from app.services.alert_service import generate_alert_for_node
from app.services.risk_service import (calculate_risk,get_severity)
import time

def ingest_gateway_packet(packet,db: Session):
    readings = []
    for node in packet.payload.nodes:
        reading = SensorReading(
            gateway_id=packet.gateway_id,
            bridge_id=packet.payload.bridge_id,
            node_id=node.node_id,
            node_timestamp=node.ts,
            gateway_received_timestamp=int(time.time()),
            buffered=packet.buffered, 
            tilt_x=node.tilt_x,
            tilt_y=node.tilt_y,
            vib_rms=node.vib_rms,
            flex_raw=node.flex_raw,
            crack_ok=node.crack_ok,
            rssi=node.rssi
        )
        readings.append(reading)

    create_sensor_readings(db,readings)
    for reading in readings :
        score = calculate_risk(reading)
        severity = get_severity(score)
        risk_entry = RiskScore(
            node_id=reading.node_id,
            score=score,
            signal="ACTIVE",
            severity=severity,
            node_timestamp=reading.node_timestamp,
        )
        db.add(risk_entry)
    db.commit()
    for reading in readings : 
        generate_alert_for_node(reading.node_id,db)
    return {
        "status": "success",
        "row_inserted": len(readings)
    }
