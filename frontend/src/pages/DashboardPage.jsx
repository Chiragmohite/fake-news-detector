import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Scan, TrendingUp, CheckCircle, XCircle, AlertTriangle,
  Shield, Clock, RefreshCw, ExternalLink, Activity, GitBranch
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from "recharts";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// v4 label palette
const LABEL_COLORS = {
  "Likely True":                "#00FF66",
  "Partially True":             "#00D4AA",
  "Needs Verification":         "#FFB800",
  "Misleading / Missing Context": "#FF7A00",
  "Likely False":               "#FF3366",
  "Conflicting Reports":        "#FBBF24",
};

const LABEL_BADGES = {
  "Likely True":                "badge-authentic",
  "Partially True":             "badge-partial",
  "Needs Verification":         "badge-warning",
  "Misleading / Missing Context": "badge-orange",
  "Likely False":               "badge-fake",
  "Conflicting Reports":        "badge-conflict",
};

// Score → zone color for the timeline dots
function scoreColor(score) {
  if (score >= 80) return "#00FF66";
  if (score >= 65) return "#00D4AA";
  if (score >= 45) return "#FFB800";
  if (score >= 25) return "#FF7A00";
  return "#FF3366";
}

const ScoreTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs space-y-1.5 max-w-[220px]"
      style={{
        background: "rgba(8,8,16,0.97)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="text-zinc-400 font-mono">{d?.date}</div>
      <div className="font-mono font-bold text-sm" style={{ color: scoreColor(d?.score) }}>
        {d?.score}/100
      </div>
      {d?.label && (
        <div className="font-mono" style={{ color: LABEL_COLORS[d.label] || "#FFB800" }}>
          {d?.label}
        </div>
      )}
      {d?.claim && (
        <div className="text-zinc-400 leading-relaxed pt-0.5 border-t border-white/8">
          {d.claim.slice(0, 90)}{d.claim.length > 90 ? "…" : ""}
        </div>
      )}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: "rgba(8,8,16,0.97)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <span style={{ color: LABEL_COLORS[payload[0].name] || "#FFB800" }}>
        {payload[0].name}: <strong>{payload[0].value}</strong>
      </span>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [histRes, statRes] = await Promise.all([
        axios.get(`${API}/history?limit=50`, { withCredentials: true }),
        axios.get(`${API}/stats`, { withCredentials: true }),
      ]);
      setHistory(histRes.data);
      setStats(statRes.data);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadData(); };

  // Timeline data: chronological order, last 30
  const timelineData = [...history]
    .reverse()
    .slice(-30)
    .map((s, i) => ({
      idx: i + 1,
      date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: s.credibility_score,
      label: s.label,
      claim: s.claim || s.title || "",
    }));

  const avgScore = timelineData.length
    ? Math.round(timelineData.reduce((a, b) => a + b.score, 0) / timelineData.length)
    : 0;

  const pieData = stats?.label_distribution?.filter((s) => s.label) || [];

  const statCards = [
    {
      icon: <BarChart3 size={22} />,
      label: "Total Analyses",
      value: stats?.total || 0,
      color: "#00F0FF",
      bg: "rgba(0,240,255,0.1)",
      testId: "stat-total",
    },
    {
      icon: <XCircle size={22} />,
      label: "Likely False",
      value: pieData.find((s) => s.label === "Likely False")?.count || 0,
      color: "#FF3366",
      bg: "rgba(255,51,102,0.1)",
      testId: "stat-false",
    },
    {
      icon: <CheckCircle size={22} />,
      label: "Likely True",
      value: pieData.find((s) => s.label === "Likely True")?.count || 0,
      color: "#00FF66",
      bg: "rgba(0,255,102,0.1)",
      testId: "stat-true",
    },
    {
      icon: <AlertTriangle size={22} />,
      label: "Needs Verification",
      value: pieData.find((s) => s.label === "Needs Verification")?.count || 0,
      color: "#FFB800",
      bg: "rgba(255,184,0,0.1)",
      testId: "stat-unverified",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] grid-bg pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050A] grid-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-1">ANALYSIS DASHBOARD</div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="gradient-text-cyan">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Track and review all your credibility analyses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              data-testid="dashboard-refresh-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/analyze"
              data-testid="new-analysis-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm btn-neon"
            >
              <Scan size={14} />
              New Analysis
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-1">
          {statCards.map((card, i) => (
            <div key={i} className="glass-card p-5 space-y-3" data-testid={`stat-card-${i}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <div className="font-heading text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-zinc-500 font-body mt-0.5">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {!timelineData.length ? (
          /* Empty state */
          <div className="glass-card p-16 text-center space-y-5 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Scan size={32} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">No Analyses Yet</h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                Start analyzing news articles to see your credibility history, charts, and statistics here.
              </p>
            </div>
            <Link to="/analyze" data-testid="start-analyzing-btn" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-neon font-medium">
              <Scan size={16} />
              Start Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Fact-Check History Timeline ── */}
            <div className="glass-card p-6 space-y-5 animate-fade-in-up stagger-2" data-testid="history-timeline">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
                    <Activity size={11} className="text-cyan-400" />
                    FACT-CHECK HISTORY TIMELINE
                  </div>
                  <h3 className="font-heading font-semibold text-white">Credibility Score Over Time</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <GitBranch size={11} />
                    {timelineData.length} analyses
                  </div>
                  <div className="px-2.5 py-1 rounded-lg" style={{ background: `${scoreColor(avgScore)}15`, border: `1px solid ${scoreColor(avgScore)}30`, color: scoreColor(avgScore) }}>
                    Avg {avgScore}/100
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[10px] font-mono">
                {[
                  ["≥80 Likely True", "#00FF66"],
                  ["≥65 Partially True", "#00D4AA"],
                  ["≥45 Needs Verify", "#FFB800"],
                  ["≥25 Misleading", "#FF7A00"],
                  ["<25 Likely False", "#FF3366"],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5" style={{ color }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  {/* Score zone bands */}
                  <ReferenceLine y={80} stroke="#00FF6620" strokeDasharray="4 4" />
                  <ReferenceLine y={65} stroke="#00D4AA20" strokeDasharray="4 4" />
                  <ReferenceLine y={45} stroke="#FFB80020" strokeDasharray="4 4" />
                  <ReferenceLine y={25} stroke="#FF7A0020" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.1)"
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.1)"
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  />
                  <Tooltip content={<ScoreTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00F0FF"
                    fill="url(#timelineGrad)"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = scoreColor(payload.score);
                      return (
                        <circle
                          key={`dot-${props.index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={color}
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth={1}
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: "#00F0FF", stroke: "rgba(0,240,255,0.4)", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Row: Pie only (timeline replaced the area chart) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
              {/* Verdict Breakdown Pie */}
              <div className="glass-card p-6 space-y-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">VERDICT BREAKDOWN</div>
                  <h3 className="font-heading font-semibold text-white">Label Distribution</h3>
                </div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={72}
                        innerRadius={36}
                        dataKey="count"
                        nameKey="label"
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={LABEL_COLORS[entry.label] || "#8884d8"}
                            stroke="rgba(0,0,0,0.3)"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: LABEL_COLORS[value] || "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "JetBrains Mono" }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">Not enough data yet</div>
                )}
              </div>

              {/* Score distribution summary */}
              <div className="lg:col-span-2 glass-card p-6 space-y-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">SCORE DISTRIBUTION</div>
                  <h3 className="font-heading font-semibold text-white">Verdict Breakdown by Count</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Likely True", color: "#00FF66" },
                    { label: "Partially True", color: "#00D4AA" },
                    { label: "Needs Verification", color: "#FFB800" },
                    { label: "Misleading / Missing Context", color: "#FF7A00" },
                    { label: "Likely False", color: "#FF3366" },
                    { label: "Conflicting Reports", color: "#FBBF24" },
                  ].map(({ label, color }) => {
                    const count = pieData.find((s) => s.label === label)?.count || 0;
                    const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span style={{ color }}>{label}</span>
                          <span className="text-zinc-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="glass-card animate-fade-in-up stagger-4">
              <div className="p-6 border-b border-white/8 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">HISTORY</div>
                  <h3 className="font-heading font-semibold text-white">Recent Analyses</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <Clock size={12} />
                  {history.length} records
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["TITLE / CLAIM", "VERDICT", "SCORE", "EVIDENCE", "DATE"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((item, i) => (
                      <tr key={item.id} className="hover:bg-white/3 transition-colors" data-testid={`history-row-${i}`}>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium text-sm max-w-[220px] truncate">{item.title}</div>
                          {item.claim && item.claim !== item.title && (
                            <div className="text-xs text-zinc-500 mt-0.5 max-w-[220px] truncate">{item.claim}</div>
                          )}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-zinc-600 hover:text-cyan-400 flex items-center gap-1 mt-0.5">
                              <ExternalLink size={10} /> Source
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold ${LABEL_BADGES[item.label] || "badge-warning"}`}>
                            {item.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-base" style={{ color: LABEL_COLORS[item.label] || "#FFB800" }}>
                            {item.credibility_score}
                          </span>
                          <span className="text-zinc-600 text-xs font-mono">/100</span>
                        </td>                        <td className="px-6 py-4">
                          {item.evidence_strength ? (
                            <span className="text-xs font-mono px-2 py-0.5 rounded"
                              style={{
                                color: item.evidence_strength === "Strong" ? "#00FF66" : item.evidence_strength === "Medium" ? "#FFB800" : "#FF7A00",
                                background: item.evidence_strength === "Strong" ? "rgba(0,255,102,0.08)" : item.evidence_strength === "Medium" ? "rgba(255,184,0,0.08)" : "rgba(255,122,0,0.08)",
                              }}>
                              {item.evidence_strength}
                            </span>
                          ) : <span className="text-zinc-600 text-xs">—</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 font-mono whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
