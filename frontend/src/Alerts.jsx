import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Shield,
  LayoutGrid,
  Radio,
  MapPin,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Vibrate,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  Gauge,
  Check,
  Info,
  X,
} from "lucide-react";
import "./Alerts.css";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/" },
  { key: "nodes", label: "Nodes", icon: Radio, path: "/Nodes" },
  { key: "live-map", label: "Live Map", icon: MapPin, path: "/LiveMap" },
  { key: "alerts", label: "Alerts", icon: Bell, path: "/Alerts", active: true },
];

const NODE_STATUS = [
  {
    id: "node-01",
    tone: "safe",
    name: "Node 01 · North Bench",
    description: "Nominal slope equilibrium",
    statusLabel: "SAFE",
    score: "18/100 · LOW",
  },
  {
    id: "node-02",
    tone: "warning",
    name: "Node 02 · Central Haul Road",
    description: "Vibration & tilt anomalies",
    statusLabel: "WARNING",
    score: "58/100 · MEDIUM",
  },
  {
    id: "node-03",
    tone: "critical",
    name: "Node 03 · South Zone",
    description: "Displacement alert triggered",
    statusLabel: "CRITICAL",
    score: "92/100 · HIGH",
  },
];

const INITIAL_ALERTS = [
  {
    id: 1,
    severity: "critical",
    icon: "crisis",
    nodeName: "Node 03 · South Zone",
    riskScore: 92,
    riskLevel: "HIGH",
    title: "High risk detected — rapid displacement trend",
    signalLabel: "Signal: Displacement ↑",
    value: "Value: +4.2 mm/hr",
    trend: "Trend: Increasing rapidly",
    time: "2 min ago",
    acknowledged: true,
  },
  {
    id: 2,
    severity: "warning",
    icon: "vibration",
    nodeName: "Node 02 · Central Haul Road",
    riskScore: 58,
    riskLevel: "MEDIUM",
    title: "Abnormal vibration detected",
    signalLabel: "Signal: Vibration ↑",
    value: "Value: 4.82 mm/s",
    trend: "Trend: Increasing",
    time: "8 min ago",
    acknowledged: false,
  },
  {
    id: 3,
    severity: "warning",
    icon: "tilt",
    nodeName: "Node 02 · Central Haul Road",
    riskScore: 58,
    riskLevel: "MEDIUM",
    title: "Tilt drift detected",
    signalLabel: "Signal: Tilt ↑",
    value: "Value: 0.38°",
    trend: "Trend: Increasing",
    time: "42 min ago",
    acknowledged: true,
  },
  {
    id: 4,
    severity: "resolved",
    icon: "resolved",
    nodeName: "Node 01 · North Bench",
    riskScore: 18,
    riskLevel: "LOW",
    title: "Routine calibration check completed successfully",
    statusText: "Status: Diagnostic Passed",
    time: "2 hours ago",
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warning" },
  { key: "resolved", label: "Resolved" },
];

const ALERT_ICONS = {
  crisis: AlertTriangle,
  vibration: Vibrate,
  tilt: RotateCcw,
  resolved: CheckCircle2,
};

const SIGNAL_ICONS = {
  crisis: TrendingUp,
  vibration: Gauge,
  tilt: RotateCcw,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function useLiveClock() {
  const format = () => {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    const s = String(now.getUTCSeconds()).padStart(2, "0");
    return `UTC ${h}:${m}:${s} · Live`;
  };
  const [timestamp, setTimestamp] = useState(format());
  useEffect(() => {
    const id = setInterval(() => setTimestamp(format()), 1000);
    return () => clearInterval(id);
  }, []);
  return timestamp;
}

let toastSeq = 1;

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function Sidebar({ badgeCount }) {
  const navigate = useNavigate();
  return (
    <aside className="alerts-sidebar">
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
            return (
              <button
                  key={item.key}
                  type="button"
                  className={`nav-item${item.active ? " nav-item-active" : ""}`}
                  onClick={() => navigate(item.path)}
                  aria-current={item.active ? "page" : undefined}
              >
                <span className="nav-item-left">
                  <Icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </span>
                {item.key === "alerts" && (
                  <span
                    className={`nav-badge${badgeCount === 0 ? " nav-badge-idle" : ""}`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <span className="footer-dot" />
        <span>System Online</span>
      </div>
    </aside>
  );
}

function Header({ timestamp }) {
  return (
    <header className="alerts-header">
      <div className="header-left">
        <span className="header-brand">MineGuard</span>
        <div className="online-pill">
          <span className="online-dot" />
          <span>System Online</span>
        </div>
      </div>
      <div className="header-right">
        <div className="live-clock">
          <span className="live-clock-dot" />
          <span>{timestamp}</span>
        </div>
      </div>
    </header>
  );
}

function CriticalBanner({ acknowledged, onAcknowledge, onView }) {
  return (
    <div className={`critical-banner${acknowledged ? " critical-banner-ack" : ""}`}>
      <div className="banner-left">
        <div className="banner-icon-box">
          {acknowledged ? (
            <CheckCircle2 size={20} strokeWidth={2} />
          ) : (
            <AlertTriangle size={20} strokeWidth={2} />
          )}
        </div>
        <div className="banner-copy">
          <div className="banner-top-row">
            <span className="banner-status-tag">
              {acknowledged ? (
                <>
                  <Check size={12} strokeWidth={2.5} /> ACKNOWLEDGED BY OPERATOR
                </>
              ) : (
                "UNACKNOWLEDGED"
              )}
            </span>
            <span className="banner-node-name">Node 03 · South Zone</span>
          </div>
          <p className="banner-message">
            Rapid slope displacement detected beyond threshold.
          </p>
          <div className="banner-meta-row">
            <span className="banner-meta banner-meta-risk">
              Risk Score: 92/100 · HIGH
            </span>
            <span className="banner-meta">Signal: Displacement ↑</span>
            <span className="banner-meta">Velocity: +4.2 mm/hr</span>
            <span className="banner-meta">Trend: Increasing rapidly</span>
          </div>
        </div>
      </div>

      <div className="banner-actions">
        <button
          type="button"
          className="btn btn-banner-ack"
          onClick={onAcknowledge}
          disabled={acknowledged}
        >
          {acknowledged ? (
            <>
              <Check size={14} strokeWidth={2.5} /> Acknowledged
            </>
          ) : (
            "Acknowledge"
          )}
        </button>
        <button
          type="button"
          className="btn btn-critical"
          onClick={() => onView("Node 03 · South Zone")}
        >
          <span>View Critical Alert</span>
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function NodeStatusCard({ node }) {
  return (
    <div className={`node-status-card node-status-card-${node.tone}`}>
      <div className="node-status-left">
        <span className={`node-status-dot node-status-dot-${node.tone}`} />
        <div className="node-status-text">
          <span className="node-status-name">{node.name}</span>
          <span className="node-status-desc">{node.description}</span>
        </div>
      </div>
      <div className="node-status-right">
        <span className={`node-status-badge node-status-badge-${node.tone}`}>
          {node.statusLabel}
        </span>
        <div className="node-status-score">{node.score}</div>
      </div>
    </div>
  );
}

function AlertCard({ alert, onAcknowledge, onView }) {
  const Icon = ALERT_ICONS[alert.icon];
  const SignalIcon = SIGNAL_ICONS[alert.icon];
  const isResolved = alert.severity === "resolved";

  return (
    <div
      className={`alert-card alert-card-${alert.severity}${
        alert.acknowledged ? " alert-card-ack" : ""
      }`}
    >
      <div className="alert-left">
        <div className={`alert-icon-box alert-icon-box-${alert.severity}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="alert-copy">
          <div className="alert-top-row">
            {isResolved ? (
              <span className="alert-badge alert-badge-resolved">
                <Check size={12} strokeWidth={2.5} /> RESOLVED
              </span>
            ) : (
              <span
                className={`alert-badge${
                  alert.acknowledged
                    ? " alert-badge-ack"
                    : ` alert-badge-${alert.severity}`
                }`}
              >
                {alert.acknowledged ? (
                  <>
                    <Check size={12} strokeWidth={2.5} /> ACKNOWLEDGED
                  </>
                ) : (
                  alert.severity.toUpperCase()
                )}
              </span>
            )}
            <span className="alert-node-name">{alert.nodeName}</span>
            {!isResolved && (
              <span className={`alert-risk-badge alert-risk-badge-${alert.severity}`}>
                Risk Score: {alert.riskScore}/100 · {alert.riskLevel}
              </span>
            )}
          </div>

          <p className="alert-title">{alert.title}</p>

          {isResolved ? (
            <div className="alert-meta-row">
              <span className="alert-meta-resolved">{alert.statusText}</span>
              <span className="alert-meta-sep">•</span>
              <span className="alert-meta-time">
                <Clock size={13} strokeWidth={2} />
                {alert.time}
              </span>
            </div>
          ) : (
            <div className="alert-meta-row">
              <span className={`alert-meta-signal alert-meta-signal-${alert.severity}`}>
                {SignalIcon && <SignalIcon size={14} strokeWidth={2} />}
                {alert.signalLabel}
              </span>
              <span className="alert-meta-sep">•</span>
              <span>{alert.value}</span>
              <span className="alert-meta-sep">•</span>
              <span>{alert.trend}</span>
              <span className="alert-meta-sep">•</span>
              <span className="alert-meta-time">
                <Clock size={13} strokeWidth={2} />
                {alert.time}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="alert-actions">
        {!isResolved && (
          <button
            type="button"
            className="btn btn-ack"
            onClick={() => onAcknowledge(alert.id)}
            disabled={alert.acknowledged}
          >
            {alert.acknowledged ? (
              <>
                <Check size={13} strokeWidth={2.5} /> Acknowledged
              </>
            ) : (
              "Acknowledge"
            )}
          </button>
        )}
        <button
          type="button"
          className={`btn btn-view btn-view-${alert.severity}`}
          onClick={() => onView(alert.nodeName)}
        >
          <span>{isResolved ? "Details" : "View Node"}</span>
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, iconTone, title, subtitle, badge, badgeTone }) {
  return (
    <div className="summary-card">
      <div className="summary-left">
        <div className={`summary-icon-box summary-icon-box-${iconTone}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="summary-text">
          <span className="summary-title">{title}</span>
          <span className="summary-subtitle">{subtitle}</span>
        </div>
      </div>
      <span className={`summary-badge summary-badge-${badgeTone}`}>
        <span className="summary-badge-dot" />
        {badge}
      </span>
    </div>
  );
}

function ToastItem({ toast, onClose, onAcknowledge, onView }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const Icon =
    toast.severity === "critical"
      ? AlertTriangle
      : toast.severity === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      className={`toast toast-${toast.severity}${visible ? " toast-visible" : ""}`}
    >
      <div className={`toast-icon-box toast-icon-box-${toast.severity}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="toast-body">
        <div className="toast-top-row">
          <span className={`toast-title toast-title-${toast.severity}`}>
            {toast.title}
          </span>
          <button
            type="button"
            className="toast-close"
            onClick={() => onClose(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <p className="toast-message">{toast.message}</p>
        {toast.alertId && (
          <div className="toast-actions">
            <button
              type="button"
              className="toast-btn toast-btn-ack"
              onClick={() => {
                onAcknowledge(toast.alertId);
                onClose(toast.id);
              }}
            >
              Acknowledge
            </button>
            <button
              type="button"
              className="toast-btn toast-btn-view"
              onClick={() => {
                onView(
                  toast.alertId === 1
                    ? "Node 03 · South Zone"
                    : "Node 02 · Central Haul Road"
                );
                onClose(toast.id);
              }}
            >
              View Node <ArrowRight size={12} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Alerts() {
  const navigate = useNavigate();
  const timestamp = useLiveClock();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [bannerAcknowledged, setBannerAcknowledged] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef([]);

  const badgeCount = alerts.filter(
    (a) => a.severity !== "resolved" && !a.acknowledged
  ).length;

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    resolved: alerts.filter((a) => a.severity === "resolved").length,
  };

  const visibleAlerts =
    activeFilter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === activeFilter);

  const addToast = ({ severity, title, message, alertId, duration = 6000 }) => {
    const id = toastSeq++;
    setToasts((prev) => [...prev, { id, severity, title, message, alertId }]);
    if (duration) {
      const t = setTimeout(() => removeToast(id), duration);
      timeoutsRef.current.push(t);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const acknowledgeAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    if (id === 1) setBannerAcknowledged(true);
  };

  const acknowledgeBanner = () => {
    setBannerAcknowledged(true);
    acknowledgeAlert(1);
  };

  const viewNode = (nodeName) => {
  addToast({
    severity: "info",
    title: "Navigating to Telemetry",
    message: `Loading sensor diagnostics for ${nodeName}...`,
    duration: 3000,
  });

  navigate("/Nodes");
};

  useEffect(() => {
    const t1 = setTimeout(() => {
      addToast({
        severity: "warning",
        title: "Telemetry Event · Node 02",
        message:
          "Abnormal vibration spike detected: 4.82 mm/s · Central Haul Road (Risk 58/100)",
        alertId: 2,
        duration: 6000,
      });
    }, 7000);

    const t2 = setTimeout(() => {
      addToast({
        severity: "critical",
        title: "CRITICAL WARNING · Node 03",
        message:
          "Rapid slope displacement detected: +4.2 mm/hr · South Zone (Risk 92/100 HIGH)",
        alertId: 1,
        duration: 7000,
      });
    }, 15000);

    timeoutsRef.current.push(t1, t2);
    return () => timeoutsRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="alerts-app">
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={removeToast}
            onAcknowledge={acknowledgeAlert}
            onView={viewNode}
          />
        ))}
      </div>

      <Sidebar badgeCount={badgeCount} />

      <div className="alerts-main-wrapper">
        <Header timestamp={timestamp} />

        <main className="alerts-main">
          <div className="alerts-content-inner">
            <CriticalBanner
              acknowledged={bannerAcknowledged}
              onAcknowledge={acknowledgeBanner}
              onView={viewNode}
            />

            <section className="early-warning-section">
              <div>
                <h2 className="section-heading">Early Warning Status</h2>
                <p className="section-subheading">
                  Current node conditions based on incoming sensor alerts
                </p>
              </div>
              <div className="node-status-grid">
                {NODE_STATUS.map((node) => (
                  <NodeStatusCard key={node.id} node={node} />
                ))}
              </div>
            </section>

            <section className="ledger-section">
              <div className="ledger-header-row">
                <div className="ledger-header-copy">
                  <span className="live-eyebrow">
                    <span className="live-eyebrow-dot" />
                    Live Telemetry Stream
                  </span>
                  <h1 className="ledger-title">Incident Ledger</h1>
                  <p className="ledger-subtitle">
                    Active incident feed and recent warning history
                  </p>
                </div>

                <div className="filter-group">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={`filter-btn${
                        activeFilter === f.key ? " filter-btn-active" : ""
                      }`}
                      onClick={() => setActiveFilter(f.key)}
                    >
                      {f.label}{" "}
                      <span className={`filter-count filter-count-${f.key}`}>
                        ({counts[f.key]})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="alert-list">
                {visibleAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                    onView={viewNode}
                  />
                ))}
              </div>
            </section>

            <section className="summary-grid">
              <SummaryCard
                icon={RefreshCw}
                iconTone="primary"
                title="Alert Update"
                subtitle="Real-time telemetry stream · Live"
                badge="ACTIVE"
                badgeTone="primary"
              />
              <SummaryCard
                icon={CheckCircle2}
                iconTone="emerald"
                title="Sensor Health"
                subtitle="3/3 nodes online"
                badge="3/3 ONLINE"
                badgeTone="emerald"
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}