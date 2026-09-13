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
    if score < 20:
        return "LOW"
    elif score < 40:
        return "MEDIUM"
    else :
        return "HIGH"

