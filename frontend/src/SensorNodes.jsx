import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutGrid,
  Radio,
  MapPin,
  Bell,
  Clock,
  ArrowRight,
} from "lucide-react";
import "./SensorNodes.css";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, active: false },
  { key: "nodes", label: "Nodes", icon: Radio, active: true },
  { key: "map", label: "Live Map", icon: MapPin, active: false },
  {
    key: "alerts",
    label: "Alerts",
    icon: Bell,
    active: false,
    badge: "2",
  },
];

const NODES = [
  {
    id: "node-01",
    tone: "safe",
    sector: "Sector Alpha · North Bench",
    number: "NODE 01",
    location: "North Bench Pit Zone",
    statusLabel: "SAFE",
    riskScore: 18,
    riskLevel: "LOW",
    description: "Normal baseline readings across monitored sensors.",
    metrics: [
      {
        label: "Flex / Extension",
        value: "340 raw",
        note: "Stable",
        tone: "safe",
      },
      {
        label: "Vibration",
        value: "0.14 mm/s",
        note: "Stable",
        tone: "safe",
      },
      {
        label: "Tilt (X / Y)",
        value: "X: 0.02° | Y: 0.01°",
        note: "Normal",
        tone: "safe",
      },
      {
        label: "Sudden Tilt",
        value: "Normal",
        suffix: ">80°",
        note: "Threshold 80°",
        tone: "safe",
      },
    ],
    rssi: "-64 dBm",
    lastUpdate: "2s ago",
    tabs: [
      { label: "Flex / Extension", active: true },
      { label: "Vibration", active: false },
      { label: "Tilt", active: false },
    ],
    range: "1H",
    summary: {
      currentValue: "340 raw",
      currentBadge: "Normal",
      thresholdValue: "750 raw (Below)",
      rateValue: "±0.02 raw/hr → Stable",
    },
    chart: {
      gradientId: "gradSafe01",
      color: "#2563eb",
      yAxisLabels: [
        { x: 4, y: 16, text: "1000 raw" },
        { x: 4, y: 62, text: "500 raw" },
        { x: 4, y: 108, text: "0 raw" },
      ],
      threshold: {
        y: 36,
        label: "Threshold 750 raw",
        labelX: 480,
        labelY: 32,
        stroke: "#cbd5e1",
        fill: "#64748b",
      },
      areaPath: "M 0,96 C 100,95 200,97 300,96 C 400,95 500,96 600,96 L 600,125 L 0,125 Z",
      lines: [
        {
          d: "M 0,96 C 100,95 200,97 300,96 C 400,95 500,96 600,96",
          stroke: "#2563eb",
          width: 2.5,
        },
      ],
      point: { cx: 600, cy: 96, fill: "#2563eb" },
    },
  },
  {
    id: "node-02",
    tone: "warning",
    sector: "Sector Beta · Central Haul Road",
    number: "NODE 02",
    location: "Central Haul Road Junction",
    statusLabel: "WARNING",
    riskScore: 58,
    riskLevel: "MEDIUM",
    description: "Elevated harmonic vibration detected in recent readings.",
    metrics: [
      {
        label: "Flex / Extension",
        value: "680 raw",
        note: "Elevated",
        tone: "warning",
      },
      {
        label: "Vibration",
        value: "5.12 mm/s",
        note: "Elevated",
        tone: "warning",
      },
      {
        label: "Tilt (X / Y)",
        value: "X: 0.24° | Y: 0.18°",
        note: "Elevated",
        tone: "warning",
      },
      {
        label: "Sudden Tilt",
        value: "Normal",
        suffix: ">80°",
        note: "Threshold 80°",
        tone: "safe",
      },
    ],
    rssi: "-74 dBm",
    lastUpdate: "2s ago",
    tabs: [
      { label: "Flex / Extension", active: false },
      { label: "Vibration", active: true },
      { label: "Tilt", active: false },
    ],
    range: "1H",
    summary: {
      currentValue: "5.12 mm/s",
      currentBadge: "Elevated",
      thresholdValue: "4.00 mm/s (Above)",
      rateValue: "+1.45 mm/s/hr ↑ Elevated",
    },
    chart: {
      gradientId: "gradWarning02",
      color: "#d97706",
      yAxisLabels: [
        { x: 4, y: 16, text: "6.00 mm/s" },
        { x: 4, y: 62, text: "3.00 mm/s" },
        { x: 4, y: 108, text: "0.00 mm/s" },
      ],
      threshold: {
        y: 46,
        label: "Threshold 4.00 mm/s",
        labelX: 475,
        labelY: 42,
        stroke: "#f59e0b",
        fill: "#b45309",
      },
      areaPath:
        "M 0,85 L 60,82 L 120,86 L 180,83 L 240,85 L 300,83 L 360,85 L 390,83 L 420,42 L 450,94 L 480,28 L 510,92 L 540,38 L 570,72 L 600,32 L 600,125 L 0,125 Z",
      lines: [
        {
          d: "M 0,85 L 60,82 L 120,86 L 180,83 L 240,85 L 300,83 L 360,85 L 390,83",
          stroke: "#94a3b8",
          width: 2,
        },
        {
          d: "M 390,83 L 420,42 L 450,94 L 480,28 L 510,92 L 540,38 L 570,72 L 600,32",
          stroke: "#d97706",
          width: 2.5,
        },
      ],
      point: { cx: 600, cy: 32, fill: "#d97706" },
    },
  },
  {
    id: "node-03",
    tone: "critical",
    sector: "Sector Gamma · South Zone",
    number: "NODE 03",
    location: "South Escarpment Wall",
    statusLabel: "CRITICAL",
    riskScore: 92,
    riskLevel: "HIGH",
    description: "High-risk condition detected in recent sensor readings.",
    metrics: [
      {
        label: "Flex / Extension",
        value: "940 raw",
        note: "Critical",
        tone: "critical",
      },
      {
        label: "Vibration",
        value: "8.40 mm/s",
        note: "Critical",
        tone: "warning",
      },
      {
        label: "Tilt (X / Y)",
        value: "X: 84.5° | Y: 12.2°",
        note: "Critical",
        tone: "critical",
      },
      {
        label: "Sudden Tilt",
        value: "DETECTED",
        suffix: ">80°",
        note: "Limit exceeded",
        tone: "critical",
      },
    ],
    rssi: "-82 dBm",
    lastUpdate: "1s ago",
    tabs: [
      { label: "Flex / Extension", active: true },
      { label: "Vibration", active: false },
      { label: "Tilt", active: false },
    ],
    range: "1H",
    summary: {
      currentValue: "940 raw",
      currentBadge: "Critical",
      thresholdValue: "750 raw",
      thresholdWarning: "⚠ Above threshold",
      rateValue: "+85 raw/hr ↑ Critical",
    },
    chart: {
      gradientId: "gradCrit03",
      color: "#e11d48",
      yAxisLabels: [
        { x: 4, y: 16, text: "1000 raw" },
        { x: 4, y: 62, text: "500 raw" },
        { x: 4, y: 108, text: "0 raw" },
      ],
      threshold: {
        y: 48,
        label: "Threshold 750 raw",
        labelX: 480,
        labelY: 44,
        stroke: "#f43f5e",
        fill: "#be123c",
      },
      areaPath:
        "M 0,105 C 180,103 300,98 390,78 C 470,60 530,30 600,14 L 600,125 L 0,125 Z",
      lines: [
        {
          d: "M 0,105 C 180,103 300,98 390,78 C 470,60 530,30 600,14",
          stroke: "#e11d48",
          width: 2.75,
        },
      ],
      point: { cx: 600, cy: 14, fill: "#e11d48" },
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function useUtcClock() {
  const format = () => {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    const s = String(now.getUTCSeconds()).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();
    return `UTC ${h}:${m}:${s} • ${day} ${month} ${year}`;
  };

  const [timestamp, setTimestamp] = useState(format());

  useEffect(() => {
    const id = setInterval(() => setTimestamp(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return timestamp;
}

function Sidebar({ activeItem}) {
   const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Shield size={20} strokeWidth={2} />
          </div>
          <div className="brand-text">
            <span className="brand-name">MineGuard</span>
            <span className="brand-subtitle">Mine Safety Monitoring</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeItem;
            return (
              <button
                key={item.key}
                type="button"
                className={`nav-item${isActive ? " nav-item-active" : ""}`}
                 onClick={() => {
                        if (item.key === "dashboard") navigate("/");
                        if (item.key === "nodes") navigate("/Nodes");
                        if (item.key === "map") navigate("/LiveMap");
                        if (item.key === "alerts") navigate("/Alerts");
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="nav-item-left">
                  <Icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <span className="footer-dot" />
        <span>MineGuard System</span>
      </div>
    </aside>
  );
}

function Header({ timestamp }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <span className="header-brand">MineGuard</span>
        <div className="online-pill">
          <span className="online-dot" />
          <span>System Online</span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-clock">
          <Clock size={16} strokeWidth={2} />
          <span>{timestamp}</span>
        </div>
        <button
          type="button"
          className="avatar-btn"
          title="Operator Profile"
          aria-label="Operator Profile"
        />
      </div>
    </header>
  );
}

function MetricCard({ metric }) {
  return (
    <div className={`metric-card metric-card-${metric.tone}`}>
      <div className="metric-card-text">
        <span className="metric-label">{metric.label}</span>
        {metric.suffix ? (
          <div className="metric-value-row">
            <span className="metric-value">{metric.value}</span>
            <span className="metric-suffix">{metric.suffix}</span>
          </div>
        ) : (
          <span className="metric-value">{metric.value}</span>
        )}
        <span className="metric-note">{metric.note}</span>
      </div>
      <span className={`metric-dot metric-dot-${metric.tone}`} />
    </div>
  );
}

function TrendChart({ chart }) {
  return (
    <div className="chart-panel">
      <div className="chart-svg-wrap">
        <svg
          className="chart-svg"
          preserveAspectRatio="none"
          viewBox="0 0 600 130"
        >
          <defs>
            <linearGradient id={chart.gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={chart.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={chart.color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="20" y2="20" />
          <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="65" y2="65" />
          <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="110" y2="110" />

          <line
            stroke={chart.threshold.stroke}
            strokeDasharray="4 4"
            strokeWidth="1.25"
            x1="0"
            x2="600"
            y1={chart.threshold.y}
            y2={chart.threshold.y}
          />
          <text
            fill={chart.threshold.fill}
            fontSize="9.5"
            fontWeight="600"
            x={chart.threshold.labelX}
            y={chart.threshold.labelY}
          >
            {chart.threshold.label}
          </text>

          {chart.yAxisLabels.map((label) => (
            <text
              key={label.text}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="500"
              x={label.x}
              y={label.y}
            >
              {label.text}
            </text>
          ))}

          <path d={chart.areaPath} fill={`url(#${chart.gradientId})`} />

          {chart.lines.map((line, idx) => (
            <path
              key={idx}
              d={line.d}
              fill="none"
              stroke={line.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={line.width}
            />
          ))}

          <circle
            cx={chart.point.cx}
            cy={chart.point.cy}
            fill={chart.point.fill}
            r="4.5"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="chart-x-axis">
        <span>-60m</span>
        <span>-45m</span>
        <span>-30m</span>
        <span>-15m</span>
        <span className="chart-x-now">Now</span>
      </div>
    </div>
  );
}

function NodeCard({ node }) {
  const [activeTab, setActiveTab] = useState(
    node.tabs.find((t) => t.active)?.label ?? node.tabs[0].label
  );
  const [activeRange, setActiveRange] = useState(node.range);

  return (
    <article className={`node-card node-card-${node.tone}`}>
      <div className="node-card-grid">
        {/* Left info column */}
        <div className="node-info-col">
          <div className="node-info-top">
            <div className="node-eyebrow">{node.sector}</div>

            <div>
              <h2 className="node-title">{node.number}</h2>
              <div className="node-location">
                <MapPin size={15} strokeWidth={2} />
                <span>{node.location}</span>
              </div>
            </div>

            <div className="node-status-row">
              <span className={`status-pill status-pill-${node.tone}`}>
                <span className={`status-pill-dot status-pill-dot-${node.tone}`} />
                {node.statusLabel}
              </span>
              <span className={`risk-pill risk-pill-${node.tone}`}>
                Risk Score: {node.riskScore}/100 · {node.riskLevel}
              </span>
            </div>

            <p className="node-description">{node.description}</p>

            <div className="metric-grid">
              {node.metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </div>
          </div>

          <div className="node-info-footer">
            <div className="node-connection">
              <span className="connection-item">
                <span className="connection-dot" />
                Connected
              </span>
              <span className="dot-separator">•</span>
              <span className="connection-rssi">RSSI {node.rssi}</span>
              <span className="dot-separator">•</span>
              <span className="connection-time">{node.lastUpdate}</span>
            </div>
            <a href="#details" className={`view-details view-details-${node.tone}`}>
              <span>View Details</span>
              <ArrowRight size={16} strokeWidth={2} />
            </a>
          </div>
        </div>

        {/* Right trend column */}
        <div className="node-trend-col">
          <div className="trend-controls">
            <div className="tab-group" role="tablist">
              {node.tabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.label}
                  className={`tab-btn${
                    activeTab === tab.label ? ` tab-btn-active-${node.tone}` : ""
                  }`}
                  onClick={() => setActiveTab(tab.label)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="range-group">
              {["1H", "6H", "24H"].map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`range-btn${
                    activeRange === range ? " range-btn-active" : ""
                  }`}
                  onClick={() => setActiveRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className={`trend-summary trend-summary-${node.tone}`}>
            <div className="summary-item">
              <span className="summary-label">Current:</span>
              <span className={`summary-value summary-value-${node.tone}`}>
                {node.summary.currentValue}
              </span>
              <span className={`summary-badge summary-badge-${node.tone}`}>
                {node.summary.currentBadge}
              </span>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Threshold:</span>
              <span className="summary-value-plain">
                {node.summary.thresholdValue}
              </span>
              {node.summary.thresholdWarning && (
                <span className="summary-warning">
                  {node.summary.thresholdWarning}
                </span>
              )}
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Rate of Change:</span>
              <span className={`summary-rate summary-rate-${node.tone}`}>
                {node.summary.rateValue}
              </span>
            </div>
          </div>

          <TrendChart chart={node.chart} />
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function SensorNodes() {
  const timestamp = useUtcClock();
  // const [activeNav, setActiveNav] = useState("nodes");

  return (
    <div className="mineguard-app">
      <Sidebar activeItem ="nodes"  />

      <div className="main-wrapper">
        <Header timestamp={timestamp} />

        <main className="main-content">
          <div className="content-inner">
            <div className="page-header-row">
              <div>
                <h1 className="page-title">Sensor Nodes</h1>
                <p className="page-subtitle">
                  Monitor live sensor trends and current risk status.
                </p>
              </div>
              <div className="live-pill">
                <span className="ping-wrap">
                  <span className="ping-ping" />
                  <span className="ping-dot" />
                </span>
                <span>Live · Updated just now</span>
              </div>
            </div>

            <div className="node-list">
              {NODES.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}