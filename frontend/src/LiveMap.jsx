import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Shield,
  LayoutGrid,
  Radio,
  MapPin,
  Bell,
  Clock,
  User,
  Plus,
  Minus,
  LocateFixed,
  X,
  ArrowRight,
} from "lucide-react";
import "./LiveMap.css";

// ---------------------------------------------------------------------------
// Static / mock telemetry data — mirrors the real backend schema
// ---------------------------------------------------------------------------
const NODE_TELEMETRY = {
  1: {
    node_id: "node-01",
    name: "Node 01",
    zone: "North Bench",
    sector: "Sector Alpha",
    lat: 23.6592,
    lng: 86.4495,
    telemetry: {
      tilt_x: 0.02,
      tilt_y: 0.01,
      vib_rms: 0.14,
      flex_raw: 340,
      crack_ok: true,
      rssi: -64,
      buffered: false,
    },
    alert: {
      severity: "SAFE",
      signal: "nominal",
      score: 0.2,
      message: "All sensor parameters within standard baseline limits.",
      ts: "11:42:00 UTC",
    },
  },
  2: {
    node_id: "node-02",
    name: "Node 02",
    zone: "Central Haul Road",
    sector: "Sector Beta",
    lat: 23.6558,
    lng: 86.4526,
    telemetry: {
      tilt_x: 0.24,
      tilt_y: 0.18,
      vib_rms: 5.12,
      flex_raw: 680,
      crack_ok: true,
      rssi: -74,
      buffered: false,
    },
    alert: {
      severity: "WARNING",
      signal: "vib_spike",
      score: 1.4,
      message: "Elevated vibration harmonic detected on haulage line",
      ts: "11:41:45 UTC",
    },
  },
  3: {
    node_id: "node-03",
    name: "Node 03",
    zone: "South Zone",
    sector: "Sector Gamma",
    lat: 23.6515,
    lng: 86.4552,
    telemetry: {
      tilt_x: 84.5,
      tilt_y: 12.2,
      vib_rms: 8.4,
      flex_raw: 940,
      crack_ok: false,
      rssi: -82,
      buffered: false,
    },
    alert: {
      severity: "CRITICAL",
      signal: "tilt_rate",
      score: 2.7,
      message: "Node 03 tilt rate exceeded threshold (2.7σ over 30s window)",
      ts: "11:42:08 UTC",
    },
  },
};

const SEVERITY_CLASS = {
  CRITICAL: "critical",
  WARNING: "warning",
  SAFE: "safe",
};

function mapSignalName(signal) {
  switch (signal) {
    case "tilt_rate":
      return "Tilt Rate";
    case "vib_spike":
      return "Vibration Spike";
    case "crack":
      return "Crack Detection";
    case "rssi_drift":
      return "RSSI Drift";
    default:
      return "Nominal Telemetry";
  }
}

function getRssiDescriptor(rssi) {
  if (rssi < -80) return "Weak";
  if (rssi > -65) return "Strong";
  return "Fair";
}

// ---------------------------------------------------------------------------
// Sidebar navigation
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/" },
  { key: "nodes", label: "Nodes", icon: Radio, path: "/Nodes" },
  { key: "live-map", label: "Live Map", icon: MapPin, path: "/LiveMap" },
  { key: "alerts", label: "Alerts", icon: Bell, path: "/Alerts", badge: 2 },
];

function Sidebar({ activePath, onNavigate }) {
  const navigate = useNavigate();
  return (
    <aside className="mg-sidebar">
      <div className="mg-sidebar-top">
        <div className="mg-sidebar-brand">
          <div className="mg-brand-icon">
            <Shield size={20} />
          </div>
          <div className="mg-brand-text">
            <span className="mg-brand-title mg-text-headline-sm">MineGuard</span>
            <span className="mg-brand-subtitle mg-text-label-sm">
              Mine Safety Monitoring
            </span>
          </div>
        </div>
        <div className="mg-nav-wrap">
          <nav className="mg-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activePath;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`mg-nav-item mg-text-label-lg${isActive ? " active" : ""}`}
                  onClick={() => {
                            onNavigate(item.key);
                            navigate(item.path);
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="mg-nav-item-content">
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="mg-nav-badge">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mg-sidebar-footer">
        <div className="mg-footer-row">
          <span className="mg-dot" />
          <span className="mg-text-label-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Telemetry Engine v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({ timestamp }) {
  return (
    <header className="mg-header">
      <div className="mg-header-left">
        <span className="mg-text-headline-sm" style={{ fontSize: 16 }}>
          MineGuard
        </span>
        <div className="mg-status-chip">
          <span className="mg-status-dot" />
          <span className="mg-text-label-sm">System Online</span>
        </div>
      </div>
      <div className="mg-header-right">
        <div className="mg-time mg-text-label-md">
          <Clock size={18} />
          <span>{timestamp}</span>
        </div>
        <div className="mg-avatar">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Node detail popover
// ---------------------------------------------------------------------------
function NodePopover({ node, onClose, onViewDetails }) {
  if (!node) return null;
  const { telemetry, alert, name, zone, sector } = node;
  const sevClass = SEVERITY_CLASS[alert.severity] || "safe";
  const rssiQuality = getRssiDescriptor(telemetry.rssi);

  return (
    <div className="mg-popover">
      <div className="mg-popover-header">
        <div className="mg-popover-title-block">
          <div className="mg-popover-title-row">
            <span className="mg-popover-title">
              {name} · {zone}
            </span>
            <span className={`mg-popover-badge ${sevClass}`}>{alert.severity}</span>
          </div>
          <div className="mg-popover-meta">
            <span className={`mg-popover-score ${sevClass}`}>
              Anomaly Score: {alert.score}σ
            </span>
            <span style={{ color: "var(--color-outline)" }}>•</span>
            <span>{sector}</span>
          </div>
        </div>
        <button className="mg-popover-close" onClick={onClose} title="Close" type="button">
          <X size={18} />
        </button>
      </div>

      <div className="mg-popover-metrics">
        <div className="mg-metric-card">
          <p className="mg-metric-label">Flex</p>
          <p className="mg-metric-value">{telemetry.flex_raw} raw</p>
          <span className="mg-metric-sub">flex_raw telemetry</span>
        </div>
        <div className="mg-metric-card">
          <p className="mg-metric-label">Vibration</p>
          <p className={`mg-metric-value ${sevClass}`}>
            {telemetry.vib_rms.toFixed(2)} mm/s
          </p>
          <span className="mg-metric-sub">vib_rms magnitude</span>
        </div>
        <div className="mg-metric-card">
          <p className="mg-metric-label">Tilt X / Y</p>
          <p className="mg-metric-value">
            {telemetry.tilt_x}° / {telemetry.tilt_y}°
          </p>
          <span className="mg-metric-sub">tilt_x / tilt_y</span>
        </div>
        <div className="mg-metric-card">
          <p className="mg-metric-label">Crack Status</p>
          <p className={`mg-metric-value ${telemetry.crack_ok ? "safe" : "critical"}`}>
            {telemetry.crack_ok ? "Normal" : "Detected"}
          </p>
          <span className={`mg-metric-sub ${telemetry.crack_ok ? "" : "critical"}`}>
            crack_ok: {String(telemetry.crack_ok)}
          </span>
        </div>
        <div className="mg-metric-card span-2">
          <div>
            <span className="mg-metric-label">RSSI Link:</span>
            <span className="mg-metric-value" style={{ marginLeft: 4, display: "inline" }}>
              {telemetry.rssi} dBm ({rssiQuality})
            </span>
          </div>
          <span className="mg-mesh-tag">Mesh Link</span>
        </div>
      </div>

      <div className="mg-popover-alert-meta">
        <div className="mg-alert-trigger-row">
          <span className="mg-alert-trigger-label">Alert Trigger:</span>
          <span className={`mg-alert-trigger-value ${sevClass}`}>
            {mapSignalName(alert.signal)}
          </span>
        </div>
        <div className={`mg-alert-message ${sevClass}`}>{alert.message}</div>
        <div className="mg-alert-footer-row">
          <div>
            Data Status:{" "}
            <span className={`mg-data-status ${telemetry.buffered ? "buffered" : "live"}`}>
              {telemetry.buffered ? "Buffered" : "Live"}
            </span>
          </div>
          <div>
            Alert Time: <span className="mg-alert-time">{alert.ts}</span>
          </div>
        </div>
      </div>

      <div className="mg-popover-footer">
        <button className="mg-popover-link" type="button" onClick={onViewDetails}>
          <span>View Node Details</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Live Map page
// ---------------------------------------------------------------------------
export default function LiveMap() {
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState("live-map");
  const [selectedNodeId, setSelectedNodeId] = useState(3);
  const [popoverOpen, setPopoverOpen] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const selectedNode = selectedNodeId ? NODE_TELEMETRY[selectedNodeId] : null;

  const handleSelectNode = useCallback((id) => {
    setSelectedNodeId(id);
    setPopoverOpen(true);
  }, []);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([23.655, 86.452], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Hazard risk-intensity rings
    L.circle([23.6515, 86.4552], {
      radius: 280,
      color: "#ef4444",
      weight: 1.5,
      opacity: 0.5,
      fillColor: "#ef4444",
      fillOpacity: 0.14,
    }).addTo(map);

    L.circle([23.6558, 86.4526], {
      radius: 160,
      color: "#f59e0b",
      weight: 1,
      opacity: 0.4,
      fillColor: "#f59e0b",
      fillOpacity: 0.08,
    }).addTo(map);

    const buildIcon = (id, node) => {
      const sevClass = SEVERITY_CLASS[node.alert.severity] || "safe";
      const isCritical = sevClass === "critical";
      const isWarning = sevClass === "warning";

      const html = isCritical
        ? `
          <div class="mg-marker">
            <div class="mg-marker-dot-wrap">
              <span class="mg-marker-halo mg-pulse-ring" style="width:3.5rem;height:3.5rem;background:rgba(239,68,68,0.3);"></span>
              <span class="mg-marker-halo mg-pulse-ring-delayed" style="width:3.5rem;height:3.5rem;background:rgba(239,68,68,0.25);"></span>
              <span class="mg-marker-halo" style="width:2.25rem;height:2.25rem;background:rgba(239,68,68,0.35);"></span>
              <div class="mg-marker-core critical" style="background:#ef4444;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
              </div>
            </div>
            <div class="mg-marker-label critical">
              <span class="mg-marker-label-text critical">${node.name} · CRITICAL</span>
            </div>
          </div>
        `
        : `
          <div class="mg-marker">
            <div class="mg-marker-dot-wrap">
              <span class="mg-marker-halo" style="width:2rem;height:2rem;background:${
                isWarning ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.2)"
              };"></span>
              <div class="mg-marker-core ${sevClass}" style="background:${
                isWarning ? "#f59e0b" : "#10b981"
              };">
                <span class="mg-marker-core-dot"></span>
              </div>
            </div>
            <div class="mg-marker-label">
              <span class="mg-marker-label-text">${node.name} · ${node.alert.severity}</span>
            </div>
          </div>
        `;

      return L.divIcon({
        className: "",
        iconSize: isCritical ? [140, 70] : [130, 60],
        iconAnchor: isCritical ? [70, 24] : [65, 20],
        html,
      });
    };

    Object.entries(NODE_TELEMETRY).forEach(([id, node]) => {
      const marker = L.marker([node.lat, node.lng], {
        icon: buildIcon(id, node),
      }).addTo(map);
      marker.on("click", () => handleSelectNode(Number(id)));
      markersRef.current[id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds(
      Object.values(NODE_TELEMETRY).map((n) => [n.lat, n.lng])
    );
    map.flyToBounds(bounds, { padding: [60, 60], duration: 1 });
    handleSelectNode(3);
  };

  return (
    <div className="mg-root">
      <Sidebar activePath={activePath} onNavigate={setActivePath} />
      <div className="mg-body">
        <Header timestamp="UTC 14:32:08 • 24 Oct 2024" />
        <main className="mg-main">
          <div className="mg-page-stack">
            {/* Toolbar */}
            <div className="mg-toolbar">
              <div>
                <div className="mg-toolbar-title-row">
                  <span className="mg-text-headline-md">Live Map</span>
                  <span className="mg-toolbar-tag mg-text-label-sm">Sector 4-B Pit</span>
                </div>
                <p className="mg-toolbar-sub mg-text-body-sm">
                  Spatial overview of the 3 active sensor nodes across the site
                </p>
              </div>
              <div className="mg-legend">
                <div className="mg-legend-item">
                  <span className="mg-legend-dot safe" />
                  <span className="mg-legend-label mg-text-label-sm">Safe</span>
                </div>
                <div className="mg-legend-item">
                  <span className="mg-legend-dot warning" />
                  <span className="mg-legend-label mg-text-label-sm">Warning</span>
                </div>
                <div className="mg-legend-item">
                  <span className="mg-legend-dot critical" />
                  <span className="mg-legend-label mg-text-label-sm">Critical</span>
                </div>
                <div className="mg-legend-divider" />
                <div className="mg-legend-item">
                  <span className="mg-legend-glow-icon">
                    <span className="mg-legend-glow-dot" />
                  </span>
                  <span className="mg-legend-muted mg-text-label-sm">
                    Radial Glow · Risk Intensity
                  </span>
                </div>
              </div>
            </div>

            {/* Map viewport */}
            <div className="mg-map-viewport">
              <div className="mg-leaflet-map" ref={mapContainerRef} />

              <div className="mg-compass">
                <div className="mg-compass-chip mg-text-label-sm">
                  <span className="mg-compass-n">N</span>
                  <span className="mg-compass-arrow">↑</span>
                  <span className="mg-compass-label">North</span>
                </div>
              </div>

              <div className="mg-map-controls">
                <div className="mg-zoom-group">
                  <button className="mg-icon-btn" onClick={handleZoomIn} title="Zoom In" type="button">
                    <Plus size={20} />
                  </button>
                  <div className="mg-zoom-divider" />
                  <button className="mg-icon-btn" onClick={handleZoomOut} title="Zoom Out" type="button">
                    <Minus size={20} />
                  </button>
                </div>
                <button
                  className="mg-recenter-btn"
                  onClick={handleRecenter}
                  title="Recenter to Sensor Nodes"
                  type="button"
                >
                  <LocateFixed size={20} />
                </button>
              </div>

              <div className="mg-scale-footer">
                <div className="mg-scale-item">
                  <span className="mg-scale-label">SCALE:</span>
                  <div className="mg-scale-bar">
                    <span className="mg-scale-tick" />
                    <span className="mg-scale-tick" />
                  </div>
                  <span className="mg-scale-label">200m</span>
                </div>
                <div className="mg-scale-divider" />
                <span className="mg-scale-area">
                  Active Area: <strong>3.4 km²</strong>
                </span>
              </div>

              {popoverOpen && selectedNode ? (
                <NodePopover
                  node={selectedNode}
                  onClose={() => setPopoverOpen(false)}
                  onViewDetails={() => setActivePath("/Nodes")}
                />
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
