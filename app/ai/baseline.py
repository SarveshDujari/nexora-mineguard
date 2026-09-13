from collections import deque
from statistics import median


class NodeBaseline:
    """Self-baseline for a physical A/B node when no reference node exists."""

    def __init__(self, calibration_samples=20):
        self.calibration_samples = calibration_samples
        self.samples = []
        self.ready = False
        self.tilt_x = 0.0
        self.tilt_y = 0.0
        self.rssi = None

    def update(self, tilt_x, tilt_y, rssi):
        if self.ready:
            return

        self.samples.append((tilt_x, tilt_y, rssi))
        if len(self.samples) >= self.calibration_samples:
            self.tilt_x = median(x[0] for x in self.samples)
            self.tilt_y = median(x[1] for x in self.samples)
            rssi_values = [x[2] for x in self.samples if x[2] is not None]
            self.rssi = median(rssi_values) if rssi_values else None
            self.ready = True

    def deviations(self, tilt_x, tilt_y, rssi):
        # Before calibration, compare against the running median of collected samples.
        if self.samples and not self.ready:
            bx = median(x[0] for x in self.samples)
            by = median(x[1] for x in self.samples)
            r_values = [x[2] for x in self.samples if x[2] is not None]
            br = median(r_values) if r_values else None
        else:
            bx, by, br = self.tilt_x, self.tilt_y, self.rssi

        rssi_drift = (rssi - br) if (rssi is not None and br is not None) else 0.0
        return tilt_x - bx, tilt_y - by, rssi_drift
