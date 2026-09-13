from types import SimpleNamespace
from app.ai.pipeline import LiveAIPipeline


def main():
    pipe = LiveAIPipeline()
    normal = [
        SimpleNamespace(node_id="A", ts=1, tilt_x=.12, tilt_y=-.04, vib_rms=.08, rssi=-67),
        SimpleNamespace(node_id="B", ts=1, tilt_x=.08, tilt_y=.03, vib_rms=.07, rssi=-71),
    ]
    for i in range(25):
        for n in normal:
            n.ts = i
        result = pipe.process_packet(normal)

    assert len(result) == 2
    assert {r["node_id"] for r in result} == {"A", "B"}
    assert all(r["severity"] in {"GREEN", "AMBER", "RED"} for r in result)
    print("STEP 7 AI SMOKE TEST: PASS")
    for r in result:
        print(r["node_id"], r["severity"], round(float(r["fusion_score"]), 3))


if __name__ == "__main__":
    main()
