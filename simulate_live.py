import argparse
import json
import math
import random
import time
import urllib.error
import urllib.request
from datetime import datetime

DEFAULT_URL = "http://127.0.0.1:8000/api/ingest/gateway"
DEFAULT_INTERVAL = 1.0
DEFAULT_SAMPLES = 70

BASELINES = {
    "A": {"tilt_x": 0.12, "tilt_y": -0.04, "vib_rms": 0.08, "rssi": -67.0},
    "B": {"tilt_x": 0.08, "tilt_y": 0.03, "vib_rms": 0.07, "rssi": -71.0},
}


def clamp(value, low, high):
    return max(low, min(high, value))


def noise(scale):
    return random.gauss(0.0, scale)


def make_node(node_id, t, scenario):
    base = BASELINES[node_id]

    tx = base["tilt_x"] + noise(0.008)
    ty = base["tilt_y"] + noise(0.008)
    vib = max(0.0, base["vib_rms"] + noise(0.006))
    rssi = base["rssi"] + noise(0.7)

    # Keep the first 20 samples calm so the backend can establish
    # its self-baseline.
    if t >= 20:
        phase = t - 20

        if scenario == "isolated":
            # Only A moves. B remains calm.
            if node_id == "A":
                ramp = min(1.0, phase / 35.0)
                tx += 0.95 * ramp
                ty -= 0.28 * ramp
                vib += 0.30 * ramp

        elif scenario == "correlated":
            # A and B move together.
            ramp = min(1.0, phase / 35.0)
            tx += 0.75 * ramp
            ty -= 0.22 * ramp
            vib += 0.25 * ramp

        elif scenario == "accelerating":
            # Movement grows quadratically after calibration.
            x = min(1.0, phase / 35.0)
            ramp = x * x
            tx += 1.05 * ramp
            ty -= 0.32 * ramp
            vib += 0.35 * ramp

        elif scenario == "rssi":
            # Tilt stays normal while the radio link progressively degrades.
            degradation = min(12.0, phase * 12.0 / 35.0)
            rssi -= degradation

        elif scenario == "noise":
            # Short vibration/tilt spikes without sustained movement.
            if phase % 8 in (0, 1):
                tx += random.uniform(-0.45, 0.45)
                ty += random.uniform(-0.20, 0.20)
                vib += random.uniform(0.25, 0.60)

    return {
        "node_id": node_id,
        "ts": int(time.time()),
        "tilt_x": round(tx, 4),
        "tilt_y": round(ty, 4),
        "vib_rms": round(vib, 4),
        "flex_raw": 0,
        "crack_ok": True,
        "rssi": round(rssi, 2),
    }


def build_payload(sample_number, scenario):
    now = int(time.time())

    return {
        "gateway_id": "GATEWAY_01",
        "buffered": False,
        "received_ts": now,
        "payload": {
            "bridge_id": "C",
            "ts": now,
            "nodes": [
                make_node("A", sample_number, scenario),
                make_node("B", sample_number, scenario),
            ],
        },
    }


def post_payload(payload, url):
    body = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def print_result(sample, payload, result):
    ai_results = result.get("ai", [])

    parts = []
    for item in ai_results:
        node = item.get("node_id", "?")
        severity = item.get("severity", "?")
        score = item.get("fusion_score", 0)
        progression = item.get("progression", "?")
        corr = item.get("corroborated", False)

        parts.append(
            f"{node} {severity} {score:.3f} "
            f"{progression} corr={corr}"
        )

    print(f"[{sample:03d}] " + " | ".join(parts))

    # Helpful telemetry snapshot.
    nodes = payload["payload"]["nodes"]
    telemetry = " ".join(
        f"{n['node_id']}:tilt={n['tilt_x']:.2f},rssi={n['rssi']:.1f}"
        for n in nodes
    )
    print(f"      {telemetry}")


def main():
    parser = argparse.ArgumentParser(
        description="Send live synthetic MineGuard telemetry to FastAPI."
    )
    parser.add_argument(
        "scenario",
        choices=[
            "normal",
            "isolated",
            "correlated",
            "accelerating",
            "rssi",
            "noise",
        ],
        help="Synthetic scenario to replay.",
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=DEFAULT_SAMPLES,
        help=f"Number of readings to send (default: {DEFAULT_SAMPLES}).",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=DEFAULT_INTERVAL,
        help=f"Seconds between readings (default: {DEFAULT_INTERVAL}).",
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"Backend endpoint (default: {DEFAULT_URL}).",
    )

    args = parser.parse_args()

    print("=" * 68)
    print("MineGuard LIVE SYNTHETIC SIMULATOR")
    print("=" * 68)
    print(f"Scenario : {args.scenario.upper()}")
    print(f"Samples  : {args.samples}")
    print(f"Interval : {args.interval}s")
    print(f"Endpoint : {args.url}")
    print()
    print("First 20 samples are kept calm for self-baseline calibration.")
    print("Open http://localhost:5173 in your browser to watch the dashboard.")
    print("Press Ctrl+C to stop.")
    print()

    # Quick connectivity check before starting the replay.
    try:
        payload = build_payload(0, args.scenario)
        result = post_payload(payload, args.url)
        print_result(0, payload, result)
    except urllib.error.URLError as exc:
        print("\nERROR: Cannot reach FastAPI.")
        print("Start the backend first:")
        print("  uvicorn app.main:app --reload")
        print(f"\nDetails: {exc}")
        return 1
    except Exception as exc:
        print(f"\nERROR: {type(exc).__name__}: {exc}")
        return 1

    try:
        for sample in range(1, args.samples):
            time.sleep(args.interval)

            payload = build_payload(sample, args.scenario)

            try:
                result = post_payload(payload, args.url)
                print_result(sample, payload, result)
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                print(f"[{sample:03d}] HTTP {exc.code}: {detail}")
            except urllib.error.URLError as exc:
                print(f"[{sample:03d}] Connection error: {exc}")
            except Exception as exc:
                print(f"[{sample:03d}] ERROR {type(exc).__name__}: {exc}")

    except KeyboardInterrupt:
        print("\nSimulation stopped.")

    print("\nSimulation finished.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
