import React, { useState } from "react";
import {
  Brain, Shield, AlertTriangle, XCircle, CheckCircle, CheckSquare,
  AlertOctagon, ExternalLink, Copy, Check, Share2, RotateCcw,
  FileText, Globe, Tag, Download, Search, BarChart2, Users, MapPin,
  Building2, Calendar, Layers, Type
} from "lucide-react";

const LABEL_CONFIG = {
  "Likely True": {
    icon: <CheckCircle size={16} />,
    class: "badge-authentic",
    bg: "rgba(0,255,102,0.05)",
    border: "rgba(0,255,102,0.2)",
    color: "#00FF66",
  },
  "Partially True": {
    icon: <CheckSquare size={16} />,
    class: "badge-partial",
    bg: "rgba(0,212,170,0.05)",
    border: "rgba(0,212,170,0.2)",
    color: "#00D4AA",
  },
  "Needs Verification": {
    icon: <AlertTriangle size={16} />,
    class: "badge-warning",
    bg: "rgba(255,184,0,0.05)",
    border: "rgba(255,184,0,0.2)",
    color: "#FFB800",
  },
  "Misleading / Missing Context": {
    icon: <AlertOctagon size={16} />,
    class: "badge-orange",
    bg: "rgba(255,122,0,0.05)",
    border: "rgba(255,122,0,0.2)",
    color: "#FF7A00",
  },
  "Likely False": {
    icon: <XCircle size={16} />,
    class: "badge-fake",
    bg: "rgba(255,51,102,0.05)",
    border: "rgba(255,51,102,0.2)",
    color: "#FF3366",
  },
  "Conflicting Reports": {
    icon: <AlertOctagon size={16} />,
    class: "badge-conflict",
    bg: "rgba(251,191,36,0.05)",
    border: "rgba(251,191,36,0.2)",
    color: "#FBBF24",
  },
};

const EVIDENCE_TYPE_STYLE = {
  "fact-check": { bg: "#0a1428", border: "rgba(0,102,255,0.35)", text: "#60a5fa" },
  supporting: { bg: "#0a1a10", border: "rgba(0,255,102,0.3)", text: "#4ade80" },
  debunking: { bg: "#1a0b12", border: "rgba(255,51,102,0.3)", text: "#f87171" },
  reference: { bg: "#130b1c", border: "rgba(181,0,255,0.3)", text: "#c084fc" },
};

const STRENGTH_STYLE = {
  Strong: { color: "#00FF66", bg: "rgba(0,255,102,0.08)", border: "rgba(0,255,102,0.25)" },
  Medium: { color: "#FFB800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.25)" },
  Weak:   { color: "#FF7A00", bg: "rgba(255,122,0,0.08)", border: "rgba(255,122,0,0.25)" },
};

const AGREEMENT_STYLE = {
  High:  { color: "#00FF66", bg: "rgba(0,255,102,0.08)", border: "rgba(0,255,102,0.25)" },
  Mixed: { color: "#FFB800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.25)" },
  Low:   { color: "#FF7A00", bg: "rgba(255,122,0,0.08)", border: "rgba(255,122,0,0.25)" },
};

const ENTITY_STYLE = {
  Person:       { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.3)"   },
  Place:        { color: "#4ade80", bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.3)"   },
  Organization: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)"   },
  Date:         { color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.3)"  },
  Event:        { color: "#f472b6", bg: "rgba(244,114,182,0.1)",  border: "rgba(244,114,182,0.3)"  },
  Topic:        { color: "#c084fc", bg: "rgba(192,132,252,0.1)",  border: "rgba(192,132,252,0.3)"  },
};

const ENTITY_ICONS = {
  Person: <Users size={10} />,
  Place: <MapPin size={10} />,
  Organization: <Building2 size={10} />,
  Date: <Calendar size={10} />,
  Event: <Layers size={10} />,
  Topic: <Tag size={10} />,
};

// Clipboard with execCommand fallback for iframe/preview environments
async function safeClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0;pointer-events:none";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    document.body.removeChild(ta);
    return false;
  }
}

export default function ResultCard({ result, onReset }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const cfg = LABEL_CONFIG[result.label] || LABEL_CONFIG["Needs Verification"];

  const handleCopy = async () => {
    const strength = result.evidence_summary?.evidence_strength || result.evidence_strength || "";
    const agreement = result.evidence_summary?.source_agreement || result.source_agreement || "";
    const entityLine = result.entities?.length
      ? `Entities: ${result.entities.map(e => `${e.text} (${e.type})`).join(", ")}`
      : "";
    const text = [
      `TruthScan Analysis Report`,
      ``,
      `Title: ${result.title || "Untitled"}`,
      `Verdict: ${result.label}`,
      `Credibility Score: ${result.credibility_score}/100`,
      `Confidence: ${result.confidence}%`,
      strength ? `Evidence Strength: ${strength}` : "",
      agreement ? `Source Agreement: ${agreement}` : "",
      entityLine,
      ``,
      `AI Reasoning:`,
      ...result.reasoning.map((r, i) => `${i + 1}. ${r}`),
      ``,
      result.suspicious_phrases?.length ? `Suspicious Phrases: ${result.suspicious_phrases.join(", ")}` : "",
      ``,
      `Analyzed: ${new Date(result.created_at).toLocaleString()}`,
      `Powered by TruthScan AI v4`,
    ].filter(Boolean).join("\n");
    await safeClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `TruthScan rated "${(result.title || "this content").slice(0, 60)}" as "${result.label}" (${result.credibility_score}/100 credibility score).\n\nVerify news before sharing — powered by TruthScan AI (free, no API keys).\n${window.location.href}`;
    await safeClipboard(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div
      className="glass-card p-6 md:p-8 animate-fade-in-up space-y-6"
      data-testid="result-card"
      style={{ borderColor: cfg.border, background: `linear-gradient(135deg, ${cfg.bg}, rgba(11,11,20,0.95))` }}
    >
      {/* ── Verdict ── */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">VERDICT</div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold font-mono tracking-wide ${cfg.class}`}
            data-testid="result-label"
          >
            {cfg.icon}
            {result.label}
          </div>

          {/* Credibility % — always aligned with verdict color */}
          <div
            className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl font-mono"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}35` }}
            data-testid="credibility-score"
          >
            <span className="text-xs text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Credibility</span>
            <span className="text-lg font-bold leading-none" style={{ color: cfg.color }}>
              {result.credibility_score}%
            </span>
          </div>

          {/* Input metadata */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Type size={11} />
            <span>{result.word_count} words</span>
            <span className="text-zinc-700">·</span>
            <span className="capitalize">{result.input_type || "text"} input</span>
          </div>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed">{result.label_description}</p>
      </div>

      {/* ── Claim Extracted ── */}
      {result.claim && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-white/10" style={{ background: "#0d0e18" }} data-testid="claim-section">
          <Search size={13} className="text-zinc-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Claim Verified</div>
            <div className="text-sm text-zinc-300 leading-relaxed">{result.claim}</div>
          </div>
        </div>
      )}

      {/* ── Evidence Summary ── */}
      {result.evidence_summary && (
        <div className="flex flex-wrap gap-2" data-testid="evidence-summary">
          {[
            { label: "Sources Found", val: result.evidence_summary.sources_found ?? 0, color: "#00F0FF" },
            { label: "Credible News", val: result.evidence_summary.credible_sources ?? 0, color: "#00FF66" },
            { label: "Fact-Checkers", val: result.evidence_summary.fact_checkers ?? 0, color: "#B500FF" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
              style={{ background: `${color}10`, border: `1px solid ${color}25`, color: val > 0 ? color : "#52525b" }}>
              <BarChart2 size={11} />
              <span>{val} {label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Evidence Strength + Source Agreement ── */}
      {(result.evidence_summary?.evidence_strength || result.evidence_strength) && (
        <div className="flex flex-wrap gap-2" data-testid="evidence-metrics">
          {(() => {
            const strength = result.evidence_summary?.evidence_strength || result.evidence_strength;
            const agreement = result.evidence_summary?.source_agreement || result.source_agreement;
            const ss = STRENGTH_STYLE[strength] || STRENGTH_STYLE.Weak;
            const as_ = AGREEMENT_STYLE[agreement] || AGREEMENT_STYLE.Low;
            return (
              <>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                  style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }}
                  data-testid="evidence-strength-badge"
                >
                  <Shield size={11} />
                  <span>Evidence Strength: <strong>{strength}</strong></span>
                </div>
                {agreement && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                    style={{ background: as_.bg, border: `1px solid ${as_.border}`, color: as_.color }}
                    data-testid="source-agreement-badge"
                  >
                    <BarChart2 size={11} />
                    <span>Source Agreement: <strong>{agreement}</strong></span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ── Detected Entities ── */}
      {result.entities?.length > 0 && (
        <div className="space-y-2" data-testid="entities-section">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-zinc-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Detected Entities</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.entities.map((entity, i) => {
              const es = ENTITY_STYLE[entity.type] || ENTITY_STYLE.Topic;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
                  style={{ background: es.bg, border: `1px solid ${es.border}`, color: es.color }}
                  data-testid={`entity-chip-${i}`}
                >
                  {ENTITY_ICONS[entity.type] || <Tag size={10} />}
                  {entity.text}
                  <span className="opacity-50 text-[9px]">{entity.type}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── OCR Extracted Text (image only) ── */}
      {result.ocr_text && (
        <div className="space-y-2" data-testid="ocr-text-section">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400">OCR Extracted Text</h3>
          </div>
          <div className="p-3 rounded-lg bg-black/30 border border-purple-500/20 text-xs text-zinc-400 font-mono leading-relaxed max-h-28 overflow-y-auto">
            {result.ocr_text}
          </div>
        </div>
      )}

      {/* ── URL Metadata ── */}
      {result.extracted_title && (
        <div className="flex flex-wrap gap-4 p-3 rounded-lg border border-white/8 text-xs text-zinc-400 font-mono" style={{ background: "#0d0e18" }}>
          {result.extracted_title && <span><span className="text-zinc-500">Title:</span> {result.extracted_title}</span>}
          {result.extracted_author && <span><span className="text-zinc-500">Author:</span> {result.extracted_author}</span>}
          {result.extracted_date && <span><span className="text-zinc-500">Date:</span> {result.extracted_date}</span>}
        </div>
      )}

      {/* ── Suspicious Phrases ── */}
      {result.suspicious_phrases?.length > 0 && (
        <div className="space-y-3" data-testid="suspicious-phrases-section">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: cfg.color }} />
            <h3 className="text-xs font-mono uppercase tracking-widest" style={{ color: cfg.color }}>
              Suspicious Phrases Detected
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.suspicious_phrases.map((phrase, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded text-xs font-mono"
                style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`, color: cfg.color }}
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Reasoning ── */}
      <div className="space-y-3" data-testid="ai-reasoning-section">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">AI Reasoning</h3>
        </div>
        <div className="space-y-2">
          {result.reasoning.map((point, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-white/8" style={{ background: "#0d0e18" }}>
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                {i + 1}
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Evidence Links ── */}
      {result.evidence_links?.length > 0 && (
        <div className="space-y-3" data-testid="evidence-links-section">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-blue-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-blue-400">
              Evidence &amp; Fact-Check Links
            </h3>
            <span className="flex items-center gap-1.5 ml-1 text-[10px] font-mono text-green-400/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              LIVE
            </span>
          </div>
          <div className="space-y-2">
            {result.evidence_links.map((link, i) => {
              const st = EVIDENCE_TYPE_STYLE[link.type] || EVIDENCE_TYPE_STYLE.reference;
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border transition-all group hover:-translate-y-0.5"
                  style={{ background: `${st.bg}`, borderColor: `${st.border}` }}
                  data-testid={`evidence-link-${i}`}
                >
                  <ExternalLink size={13} className="flex-shrink-0 mt-0.5" style={{ color: st.text }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-blue-300 truncate">{link.title}</div>
                    {link.snippet && <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{link.snippet}</div>}
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{ background: `${st.text}18`, color: st.text, border: `1px solid ${st.text}35` }}
                  >
                    {link.type}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Trusted Sources ── */}
      {result.trusted_sources?.length > 0 && (
        <div className="space-y-3" data-testid="trusted-sources-section">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400">Verify With Trusted Sources</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {result.trusted_sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                style={{ background: "#0d0e18" }}
                data-testid={`source-link-${i}`}
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">{src.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{src.category}</div>
                </div>
                <ExternalLink size={11} className="text-zinc-600 group-hover:text-purple-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/8">
        <button
          onClick={handleCopy}
          data-testid="copy-result-btn"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
          style={{ background: "#0d0e18" }}
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Report"}
        </button>
        <button
          onClick={handleShare}
          data-testid="share-btn"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
          style={{ background: "#0d0e18" }}
        >
          {shared ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
          {shared ? "Copied!" : "Share"}
        </button>
        <button
          onClick={handleExportPdf}
          data-testid="export-pdf-btn"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
          style={{ background: "#0d0e18" }}
        >
          <Download size={14} />
          Export PDF
        </button>
        {onReset && (
          <button
            onClick={onReset}
            data-testid="analyze-another-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm btn-neon ml-auto"
          >
            <RotateCcw size={14} />
            Analyze Another
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
        <FileText size={11} />
        <span>Analyzed {new Date(result.created_at).toLocaleString()} · {result.word_count} words · TruthScan AI v4</span>
      </div>
    </div>
  );
}
