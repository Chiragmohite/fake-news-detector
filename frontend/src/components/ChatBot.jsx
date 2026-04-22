import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Brain, ExternalLink, Search,
  AlertTriangle, Loader2, Zap, Shield
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_PROMPTS = [
  { label: "Why this verdict?", q: "Why did you give this verdict? Explain the reasoning." },
  { label: "Conflicting reports?", q: "Are there any conflicting reports or sources that disagree?" },
  { label: "Show entities", q: "What entities (people, places, organizations) are involved in this claim?" },
  { label: "Evidence strength?", q: "How strong is the evidence for this verdict?" },
  { label: "Trusted sources", q: "Show me trusted sources to verify this content" },
  { label: "Safe to share?", q: "Is this content safe to share?" },
];

const VERDICT_COLORS = {
  "Likely True": "#00FF66",
  "Partially True": "#00D4AA",
  "Needs Verification": "#FFB800",
  "Misleading / Missing Context": "#FF7A00",
  "Likely False": "#FF3366",
  "Conflicting Reports": "#FBBF24",
};

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <Brain size={11} className="text-cyan-400" />
        </div>
      )}
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-cyan-500/15 border border-cyan-500/25 text-white rounded-tr-sm"
          : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-sm"
      }`}>
        <div className="whitespace-pre-line">{msg.content}</div>

        {/* Reliability note */}
        {msg.reliability_note && (
          <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
            <span>{msg.reliability_note}</span>
          </div>
        )}

        {/* Source links */}
        {msg.sources?.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Search size={10} /> Sources
            </div>
            {msg.sources.slice(0, 3).map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-black/30 hover:bg-blue-500/10 border border-white/8 hover:border-blue-500/25 transition-all group"
                data-testid={`chat-source-${i}`}
              >
                <ExternalLink size={10} className="text-zinc-600 group-hover:text-blue-400 flex-shrink-0" />
                <span className="text-xs text-zinc-400 group-hover:text-blue-300 truncate">{src.title || src.url}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatBot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const color = VERDICT_COLORS[context?.label] || "#00F0FF";

  // Initialize greeting message when context arrives
  useEffect(() => {
    if (context && messages.length === 0) {
      const evStrength = context.evidence_summary?.evidence_strength || context.evidence_strength || "";
      const srcAgreement = context.evidence_summary?.source_agreement || context.source_agreement || "";
      const entityList = context.entities?.slice(0, 4).map(e => e.text).join(", ");

      let greeting = `Analysis complete!\n\nContent: "${(context.title || "Submitted content").slice(0, 70)}"\nVerdict: ${context.label} (${context.credibility_score}/100)`;
      if (evStrength) greeting += `\nEvidence Strength: ${evStrength}`;
      if (srcAgreement) greeting += ` | Source Agreement: ${srcAgreement}`;
      if (entityList) greeting += `\n\nKey entities: ${entityList}`;
      greeting += `\n\nAsk me why this verdict, show conflicting reports, entities, or check evidence strength.`;

      setMessages([{
        role: "assistant",
        content: greeting,
        sources: [],
        reliability_note: null,
      }]);
    }
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (questionOverride) => {
    const q = questionOverride || input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/chat`, { question: q, context }, { withCredentials: true });
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response,
        sources: data.sources || [],
        reliability_note: data.reliability_note,
        response_type: data.response_type,
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I couldn't process that right now. Please try again.",
        sources: [],
        reliability_note: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleQuick = (q) => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="chatbot-toggle-btn"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
          style={{
            background: "rgba(11,11,20,0.95)",
            border: `1px solid ${color}40`,
            boxShadow: `0 0 20px ${color}25`,
            color: color,
          }}
        >
          <MessageCircle size={18} />
          <span className="font-medium text-sm text-white">Ask AI Assistant</span>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] rounded-2xl flex flex-col shadow-2xl"
          style={{
            height: "520px",
            background: "rgba(8,8,16,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
          data-testid="chatbot-panel"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                <Brain size={15} style={{ color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">TruthScan Assistant</div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                  <Zap size={9} className="text-cyan-500" />
                  DuckDuckGo + Wikipedia
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
              >
                {context?.label}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Brain size={11} className="text-cyan-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleQuick(p.q)}
                  data-testid={`quick-prompt-${p.label.replace(/\s+/g, "-").toLowerCase()}`}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-cyan-400 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a follow-up question..."
              data-testid="chatbot-input"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-500/40 outline-none transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              data-testid="chatbot-send-btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
              style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 pb-2 text-center text-[9px] text-zinc-700 font-mono">
            Free · No API Keys · Powered by DuckDuckGo Search + Wikipedia
          </div>
        </div>
      )}
    </>
  );
}
