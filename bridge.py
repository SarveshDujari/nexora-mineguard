import json
import serial
import requests

SERIAL_PORT = "/dev/cu.usbserial-10"   # change to your port
BAUD_RATE = 115200

BACKEND_URL = "http://localhost:8000/api/ingest/gateway"

ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

print("Listening for ESP32 data...")

while True:
    try:
        line = ser.readline().decode("utf-8").strip()
        if line:
            print(repr(line))
        if not line:
            continue

        print("Received:", line)

        payload = json.loads(line)

        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=5
        )

        print("Backend:", response.status_code)

    except json.JSONDecodeError:
        print("Invalid JSON:", line)

    except Exception as e:
        print("Error:", e)