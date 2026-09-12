import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Shield,
  LayoutGrid,
  Radio,
  MapPin,
  Bell,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Cpu,
  Wifi,
  Share2,
  Podcast,
  Router,
  Server,
  Activity,
  Network,
  ShieldAlert,
  TrendingUp,
  Layers,
  BellRing,
} from "lucide-react";
import "./Dashboard.css";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const navItems = [
  {
    label: "Dashboard",
    icon: LayoutGrid,
    path: "/",
  },
  {
    label: "Nodes",
    icon: Radio,
    path: "/Nodes",
  },
  {
    label: "Live Map",
    icon: MapPin,
    path: "/LiveMap",
  },
  {
    label: "Alerts",
    icon: Bell,
    path: "/Alerts",
    badge: 2,
  },
];

const pipelineStages = [
  {
    key: "sensors",
    icon: Radio,
    title: "Sensors",
    subtitle: "Generate readings",
    variant: "default",
  },
  {
    key: "esp32",
    icon: Cpu,
    title: "ESP32 Node",
    subtitle: "Collects sensor data",
    variant: "default",
    iconTone: "accent",
  },
  {
    key: "espnow",
    icon: Wifi,
    title: "ESP-NOW",
    subtitle: "Node → Bridge",
    variant: "accent",
  },
  {
    key: "bridge",
    icon: Share2,
    title: "Bridge",
    subtitle: "Receives node data",
    variant: "default",
  },
  {
    key: "lora",
    icon: Podcast,
    title: "LoRa",
    subtitle: "Bridge → Gateway",
    variant: "accent",
  },
  {
    key: "gateway",
    icon: Router,
    title: "Gateway",
    subtitle: "Forwards telemetry",
    variant: "default",
  },
  {
    key: "backend",
    icon: Server,
    title: "Backend",
    subtitle: "Processes telemetry",
    variant: "default",
  },
  {
    key: "dashboard",
    icon: Activity,
    title: "Dashboard",
    subtitle: "Displays risk & alerts",
    variant: "solid",
  },
];

// connector color alternates blue / emerald, matching the source markup
const connectorColors = ["blue", "emerald", "blue", "emerald", "blue", "emerald", "blue"];

const connectionHealth = [
  { label: "ESP32 → Bridge", status: "Connected · RSSI -62 dBm" },
  { label: "Bridge → Gateway", status: "Connected · RSSI -78 dBm" },
  { label: "Gateway → Backend", status: "Connected · Live" },
  { label: "Backend → Dashboard", status: "Connected · Live" },
];

const nodes = [
  {
    id: "NODE 01",
    location: "North Bench",
    status: "SAFE",
    statusClass: "safe",
    riskScore: 18,
    riskLabel: "LOW",
    concern: "All readings normal",
    concernClass: "normal",
    readings: [
      { label: "Vibration", value: "Normal", tone: "safe" },
      { label: "Tilt", value: "Stable", tone: "safe" },
      { label: "Crack", value: "Normal", tone: "safe" },
    ],
    lastUpdate: "3 sec ago",
    dotClass: "safe",
  },
  {
    id: "NODE 02",
    location: "Central Haul Road",
    status: "WARNING",
    statusClass: "warning",
    riskScore: 58,
    riskLabel: "MEDIUM",
    concern: "Vibration increasing ↑",
    concernClass: "warning",
    readings: [
      { label: "Vibration", value: "4.82 mm/s", tone: "warning" },
      { label: "Tilt", value: "Increasing", tone: "warning" },
      { label: "Crack", value: "Normal", tone: "safe" },
    ],
    lastUpdate: "4 sec ago",
    dotClass: "warning",
  },
  {
    id: "NODE 03",
    location: "South Zone",
    status: "CRITICAL",
    statusClass: "critical",
    riskScore: 92,
    riskLabel: "HIGH",
    concern: "Displacement above threshold",
    concernClass: "critical",
    readings: [
      { label: "Vibration", value: "8.4 mm/s", tone: "critical" },
      { label: "Tilt", value: "0.82°", tone: "critical" },
      { label: "Crack", value: "Detected", tone: "critical", strong: true },
    ],
    lastUpdate: "3 sec ago",
    dotClass: "critical",
  },
];

const activeAlerts = [
  {
    level: "CRITICAL",
    node: "Node 03",
    message: "Displacement above threshold",
    time: "2 min ago",
    tone: "critical",
  },
  {
    level: "WARNING",
    node: "Node 02",
    message: "Vibration increasing ↑",
    time: "8 min ago",
    tone: "warning",
  },
];

const mapMarkers = [
  { id: "Node 01", top: "28%", left: "28%", tone: "safe" },
  { id: "Node 02", top: "50%", left: "50%", tone: "warning" },
  { id: "Node 03", top: "68%", left: "72%", tone: "critical", callout: true },
];

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------

function NavLink({ item }) {
  const Icon = item.icon;

  return (
    <RouterNavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `nav-link${isActive ? " nav-link--active" : ""}`
      }
    >
      <span className="nav-link__left">
        <Icon size={20} strokeWidth={2} />
        <span>{item.label}</span>
      </span>

      {item.badge != null && (
        <span className="nav-badge">{item.badge}</span>
      )}
    </RouterNavLink>
  );
}

function PipelineStage({ stage, isLast }) {
  const Icon = stage.icon;
  return (
    <div className={`pipeline-stage pipeline-stage--${stage.variant}`}>
      <div
        className={`pipeline-stage__icon${
          stage.variant === "solid" ? " pipeline-stage__icon--solid" : ""
        }${stage.iconTone === "accent" ? " pipeline-stage__icon--accent" : ""}`}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <span className="pipeline-stage__title">{stage.title}</span>
      <span className="pipeline-stage__subtitle">{stage.subtitle}</span>
    </div>
  );
}

function PipelineConnector({ color }) {
  return (
    <div className="pipeline-connector">
      <div className="pipeline-connector__track">
        <div className={`pipeline-connector__packet pipeline-connector__packet--${color}`} />
      </div>
      <ArrowRight size={13} className={`pipeline-connector__arrow pipeline-connector__arrow--${color}`} />
    </div>
  );
}

function HealthPill({ label, status }) {
  return (
    <div className="health-pill">
      <span className="health-pill__label">{label}</span>
      <span className="health-pill__status">
        <span className="dot dot--safe" />
        <span>{status}</span>
      </span>
    </div>
  );
}

function ReadingChip({ reading }) {
  return (
    <div className={`reading-chip reading-chip--${reading.tone}`}>
      <span className="reading-chip__label">{reading.label}</span>
      <span className={`reading-chip__value reading-chip__value--${reading.tone}${reading.strong ? " reading-chip__value--strong" : ""}`}>
        {reading.value}
      </span>
    </div>
  );
}

function NodeCard({ node }) {
  return (
    <div className={`node-card node-card--${node.statusClass}`}>
      <div className="node-card__body">
        <div className="node-card__header">
          <div>
            <span className="node-card__id">{node.id}</span>
            <span className="node-card__location">{node.location}</span>
          </div>
          <span className={`status-pill status-pill--${node.statusClass}`}>
            <span className="status-pill__dot" />
            {node.status}
          </span>
        </div>

        <div className="node-card__risk">
          <div className="node-card__risk-row">
            <span>
              Risk Score: <strong>{node.riskScore}/100</strong> · {node.riskLabel}
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill progress-fill--${node.statusClass}`}
              style={{ width: `${node.riskScore}%` }}
            />
          </div>
        </div>

        <div className="node-card__concern">
          <span className="eyebrow">PRIMARY CONCERN</span>
          <p className={`node-card__concern-text node-card__concern-text--${node.concernClass}`}>
            {node.concern}
          </p>
        </div>

        <div className="node-card__readings">
          <span className="eyebrow eyebrow--small">KEY READINGS</span>
          <div className="reading-grid">
            {node.readings.map((r) => (
              <ReadingChip key={r.label} reading={r} />
            ))}
          </div>
        </div>
      </div>

      <div className="node-card__footer">
        <span className="node-card__live">
          <span className={`dot dot--${node.dotClass}`} />
          Live · {node.lastUpdate}
        </span>
        <RouterNavLink to="/Nodes" className="link-arrow">
  View Node <ArrowRight size={16} />
</RouterNavLink>
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  return (
    <div className="alert-row">
      <div className="alert-row__body">
        <div className="alert-row__level">
          <span className={`dot dot--${alert.tone}`} />
          <span className={`alert-row__level-text alert-row__level-text--${alert.tone}`}>
            {alert.level} · {alert.node}
          </span>
        </div>
        <p className="alert-row__message">{alert.message}</p>
        <span className="alert-row__time">{alert.time}</span>
      </div>
      <a href="#" className={`alert-row__view alert-row__view--${alert.tone}`}>
        View <ChevronRight size={14} />
      </a>
    </div>
  );
}

function MapMarker({ marker }) {
  return (
    <div
      className={`map-marker map-marker--${marker.tone}`}
      style={{ top: marker.top, left: marker.left }}
    >
      <div className="map-marker__ring">
        {marker.callout && <span className="map-marker__ping" />}
        <div className="map-marker__dot-wrap">
          <span className="map-marker__dot" />
        </div>
      </div>
      <div className="map-marker__label">{marker.id}</div>

      {marker.callout && (
        <div className="map-callout">
          <div className="map-callout__header">Node 03 · South Zone</div>
          <div className="map-callout__risk">
            <span className="dot dot--critical" />
            Critical · Risk Score: 92/100
          </div>
          <p className="map-callout__desc">Displacement above threshold</p>
          <a href="#" className="map-callout__link">
            View Node <ArrowRight size={12} />
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MineGuardDashboard() {
  return (
    <div className="mg-app">
      {/* Sidebar */}
      <aside className="mg-sidebar">
        <div>
          <div className="mg-sidebar__brand">
            <div className="mg-sidebar__logo">
              <Shield size={20} strokeWidth={2} />
            </div>
            <div className="mg-sidebar__brand-text">
              <span className="mg-sidebar__brand-title">MineGuard</span>
              <span className="mg-sidebar__brand-subtitle">Mine Safety Monitoring</span>
            </div>
          </div>
          <nav className="mg-sidebar__nav">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      <div className="mg-content-wrapper">
        {/* Header */}
        <header className="mg-header">
          <div className="mg-header__left">
            <span className="mg-header__title">MineGuard</span>
            <div className="pill pill--online">
              <span className="dot dot--online" />
              <span>System Online</span>
            </div>
          </div>
          <div className="mg-header__right">
            <div className="pill pill--live">
              <span className="dot dot--live" />
              <span>Live · Updated 3s ago</span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mg-main">
          {/* Mine status banner */}
          <section className="card status-banner">
            <div className="status-banner__left">
              <div className="status-banner__icon">
                <AlertTriangle size={24} strokeWidth={2} />
              </div>
              <div className="status-banner__text">
                <span className="eyebrow">MINE STATUS</span>
                <div className="status-banner__row">
                  <span className="status-pill status-pill--critical status-pill--lg">
                    <span className="status-pill__dot" />
                    CRITICAL
                  </span>
                  <span className="status-banner__summary">— 1 of 3 nodes requires attention</span>
                </div>
                <p className="status-banner__detail">
                  Primary concern:{" "}
                  <span className="status-banner__detail-strong">
                    Node 03 · Displacement above threshold
                  </span>
                </p>
              </div>
            </div>
            <a href="#" className="btn btn--danger-outline">
              View Alert <ArrowRight size={16} />
            </a>
          </section>

          {/* Live system data flow */}
          <section className="card data-flow">
            <div className="data-flow__header">
              <div className="data-flow__title-group">
                <div className="data-flow__icon">
                  <RefreshCw size={19} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="card-title">Live System Data Flow</h2>
                  <span className="card-subtitle">End-to-end edge to cloud pipeline</span>
                </div>
              </div>
              <span className="pill pill--active">
                <span className="dot dot--online" />
                Telemetry Pipeline · Active Transmission
              </span>
            </div>

            <div className="pipeline-scroll">
              <div className="pipeline-track">
                {pipelineStages.map((stage, i) => (
                  <React.Fragment key={stage.key}>
                    <PipelineStage stage={stage} />
                    {i < pipelineStages.length - 1 && (
                      <PipelineConnector color={connectorColors[i]} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="connection-health">
              <div className="connection-health__label">
                <Network size={16} />
                <span>CONNECTION HEALTH</span>
              </div>
              <div className="connection-health__grid">
                {connectionHealth.map((h) => (
                  <HealthPill key={h.label} label={h.label} status={h.status} />
                ))}
              </div>
            </div>
          </section>

          {/* Compact node summary */}
          <section className="node-summary">
            <div className="node-summary__title">
              <Radio size={18} />
              <span>3 Sensor Nodes</span>
            </div>
            <div className="node-summary__legend">
              <span className="legend-item">
                <span className="dot dot--safe" /> 1 Safe
              </span>
              <span className="legend-sep">·</span>
              <span className="legend-item">
                <span className="dot dot--warning" /> 1 Warning
              </span>
              <span className="legend-sep">·</span>
              <span className="legend-item">
                <span className="dot dot--critical" /> 1 Critical
              </span>
            </div>
          </section>

          {/* Early warning banner */}
          <div className="card early-warning">
            <div className="early-warning__left">
              <div className="early-warning__icon">
                <ShieldAlert size={18} />
              </div>
              <div className="early-warning__text">
                <span className="early-warning__badge">
                  <span className="dot dot--warning-pulse" />
                  EARLY WARNING
                </span>
                <span className="early-warning__message">
                  Node 03 risk increasing rapidly · Potential impact zone: 120 m
                </span>
              </div>
            </div>
            <div className="early-warning__right">
              <span>Rapid slope displacement trend</span>
            </div>
          </div>

          {/* Node cards grid */}
          <section className="node-grid">
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </section>

          {/* Risk trend row */}
          <div className="card risk-trend">
            <div className="risk-trend__left">
              <div className="risk-trend__icon">
                <TrendingUp size={20} />
              </div>
              <div className="risk-trend__text">
                <div className="risk-trend__title-row">
                  <h3 className="risk-trend__title">Risk Trend — Last 1 Hour</h3>
                  <span className="risk-trend__badge">
                    <span className="dot dot--critical" />
                    Early warning triggered
                  </span>
                </div>
                <div className="risk-trend__values">
                  <span className="risk-trend__node">Node 03 · Increasing rapidly:</span>
                  <span className="risk-trend__numbers">72 → 78 → 84 → 92 ↑</span>
                </div>
              </div>
            </div>
            <div className="risk-trend__right">
              <svg className="sparkline" viewBox="0 0 160 30" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  points="0,25 50,20 105,12 160,3"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="0" cy="25" r="3" fill="#e11d48" />
                <circle cx="50" cy="20" r="3" fill="#e11d48" />
                <circle cx="105" cy="12" r="3" fill="#e11d48" />
                <circle cx="160" cy="3" r="4" fill="#e11d48" />
              </svg>
              <div className="sparkline__axis">
                <span>-60m</span>
                <span>-30m</span>
                <span>-15m</span>
                <span className="sparkline__axis-now">Now</span>
              </div>
            </div>
          </div>

          {/* Bottom split: map + alerts */}
          <section className="bottom-split">
            {/* Map */}
            <div className="card map-card">
              <div className="map-card__top">
                <div className="map-card__title-group">
                  <Layers size={20} />
                  <h2 className="card-title">Live Mine Risk Map</h2>
                </div>
                <span className="map-card__count">3 Active Sensor Nodes</span>
              </div>

              <div className="map-canvas">
                <svg
                  className="map-canvas__contours"
                  viewBox="0 0 540 250"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <ellipse cx="270" cy="125" rx="240" ry="105" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                  <ellipse cx="270" cy="125" rx="190" ry="80" stroke="currentColor" strokeWidth="1.2" />
                  <ellipse cx="270" cy="125" rx="140" ry="58" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
                  <ellipse cx="270" cy="125" rx="80" ry="34" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M40,220 C140,195 200,135 270,125 C340,115 410,65 500,30"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>

                {mapMarkers.map((m) => (
                  <MapMarker key={m.id} marker={m} />
                ))}
              </div>

              <div className="map-card__footer">
                <div className="map-legend">
                  <span className="legend-item">
                    <span className="legend-dot legend-dot--safe" /> Safe
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot legend-dot--warning" /> Warning
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot legend-dot--critical" /> Critical
                  </span>
                </div>
                <a href="#" className="link-arrow link-arrow--sm">
                  View Full Map <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Active alerts */}
            <div className="card alerts-card">
              <div>
                <div className="alerts-card__top">
                  <div className="alerts-card__title-group">
                    <BellRing size={20} className="alerts-card__icon" />
                    <h2 className="card-title">Active Alerts</h2>
                  </div>
                  <span className="alerts-card__count">2 Active</span>
                </div>

                <div className="alerts-card__list">
                  {activeAlerts.map((alert) => (
                    <AlertRow key={`${alert.node}-${alert.message}`} alert={alert} />
                  ))}
                </div>
              </div>

              <div className="alerts-card__footer">
                <a href="#" className="link-arrow link-arrow--sm">
                  View All Alerts <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}