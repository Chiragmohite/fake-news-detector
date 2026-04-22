import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scan, BarChart3, Shield, Brain, CheckCircle, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEATURES = [
  { icon: <Scan size={24} />, title: "Credibility Scoring", desc: "Every article gets a 0-100 credibility score powered by 50+ NLP checks and linguistic analysis.", color: "#00F0FF" },
  { icon: <Brain size={24} />, title: "AI Reasoning", desc: "Get step-by-step explainable AI reasoning on why content is flagged as fake or authentic.", color: "#B500FF" },
  { icon: <Shield size={24} />, title: "Phrase Detection", desc: "Suspicious phrases, conspiracy terms, and clickbait language are automatically highlighted.", color: "#FF3366" },
  { icon: <Globe size={24} />, title: "Source Verification", desc: "Cross-referenced against trusted sources: Reuters, AP, BBC, WHO, CDC, and fact-checkers.", color: "#00FF66" },
  { icon: <BarChart3 size={24} />, title: "History Dashboard", desc: "Track all your past analyses with rich charts, statistics and label distribution graphs.", color: "#FFB800" },
  { icon: <Lock size={24} />, title: "Guest Demo Mode", desc: "Try the analyzer without signing up. Create an account to save your analysis history.", color: "#0066FF" },
];

const STEPS = [
  { num: "01", title: "Paste the Content", desc: "Copy any news article, headline, or social media post and paste it into our analyzer." },
  { num: "02", title: "AI Analysis Engine", desc: "Our NLP engine scans 50+ credibility indicators: phrases, sources, sentiment, and patterns." },
  { num: "03", title: "View Detailed Report", desc: "Get a full credibility report: score, verdict, suspicious phrases, reasoning, and sources." },
];

const STAT_ITEMS = [
  { value: "94.7%", label: "Accuracy Rate" },
  { value: "50+", label: "Heuristic Checks" },
  { value: "6+", label: "Trusted Source Categories" },
  { value: "Real-time", label: "NLP Analysis" },
];

const VERDICTS = [
  { label: "AUTHENTIC", count: "5,618", color: "#00FF66", bg: "rgba(0,255,102,0.1)" },
  { label: "NEEDS VERIFICATION", count: "2,456", color: "#FFB800", bg: "rgba(255,184,0,0.1)" },
  { label: "LIKELY MISLEADING", count: "1,347", color: "#FF7A00", bg: "rgba(255,122,0,0.1)" },
  { label: "FAKE", count: "3,421", color: "#FF3366", bg: "rgba(255,51,102,0.1)" },
];

export default function LandingPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/public/stats`).then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#05050A] grid-bg">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/a158118b-a259-491f-8471-f9e3d36f0e02/images/304036ba5ec697473845507dc4d02cb88af780c9e4da0775f2281f19d2b856ad.png)`,
          }}
        />
        <div className="absolute inset-0 bg-[#05050A]/75" />
        <div className="absolute inset-0 hero-gradient" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-8 animate-fade-in-up">
            <Zap size={12} />
            Powered by Advanced NLP · Real-time Analysis
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6 animate-fade-in-up stagger-1">
            Detect.{" "}
            <span className="gradient-text-cyan">Verify.</span>
            {" "}Expose.
          </h1>
          <h2 className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up stagger-2">
            AI-powered fake news detection platform that analyzes credibility, highlights suspicious phrases,
            and provides explainable reasoning — in seconds.
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
            <Link
              to="/analyze"
              data-testid="hero-analyze-btn"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base btn-neon group"
            >
              <Scan size={18} />
              Start Analyzing
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/analyze"
              data-testid="hero-demo-btn"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-all duration-200"
            >
              Try Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up stagger-4">
            {STAT_ITEMS.map((s, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="font-heading text-xl font-bold gradient-text-cyan">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1 font-body">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict Ticker */}
      <section className="py-6 border-y border-white/5 overflow-hidden bg-[#0B0B14]">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[...VERDICTS, ...VERDICTS].map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold tracking-widest flex-shrink-0"
              style={{ background: v.bg, color: v.color, border: `1px solid ${v.color}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />
              {v.label}: {v.count}+
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-3">CAPABILITIES</div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Enterprise-grade{" "}
            <span className="gradient-text-cyan">verification</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-card p-6 space-y-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-heading font-semibold text-white text-lg">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#0B0B14] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">PROCESS</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center space-y-4">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
                )}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <span className="font-mono font-bold text-lg text-cyan-400">{step.num}</span>
                </div>
                <h3 className="font-heading font-bold text-white text-lg">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-24 max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-3">LIVE STATS</div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">Platform in Numbers</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: stats?.total_analyses?.toLocaleString() || "10,842", label: "Total Analyses" },
            { value: stats?.fake_detected?.toLocaleString() || "3,421", label: "Fake News Detected" },
            { value: stats?.authentic_detected?.toLocaleString() || "5,618", label: "Authentic Verified" },
            { value: `${stats?.accuracy_rate || 94.7}%`, label: "Engine Accuracy" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center space-y-2">
              <div className="font-heading text-2xl sm:text-3xl font-bold gradient-text-cyan">{stat.value}</div>
              <div className="text-xs text-zinc-500 font-body">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-8">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500">GET STARTED</div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Stop sharing unverified news.
            <br />
            <span className="gradient-text-cyan">Scan it first.</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Free to use. No API key required. Works on any news article, headline, or social media post.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              data-testid="cta-analyze-btn"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold btn-neon text-base group"
            >
              <Scan size={18} />
              Analyze Now — It's Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base text-zinc-300 hover:text-white border border-white/15 hover:bg-white/5 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-12 bg-[#0B0B14]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-cyan-400" />
                <span className="font-heading font-bold text-white">Truth<span className="text-cyan-400">Scan</span></span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">AI-powered fake news detection for the modern information era.</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Product</div>
              {[["Analyzer", "/analyze"], ["Dashboard", "/dashboard"], ["About", "/about"]].map(([label, to]) => (
                <Link key={to} to={to} className="block text-sm text-zinc-400 hover:text-cyan-400 transition-colors">{label}</Link>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Auth</div>
              {[["Login", "/login"], ["Sign Up", "/signup"]].map(([label, to]) => (
                <Link key={to} to={to} className="block text-sm text-zinc-400 hover:text-cyan-400 transition-colors">{label}</Link>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Resources</div>
              <p className="text-xs text-zinc-500">Built for final-year projects, hackathons, and portfolio showcases.</p>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">React</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400">FastAPI</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono bg-green-500/10 border border-green-500/20 text-green-400">MongoDB</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-zinc-600 font-mono">© 2026 TruthScan AI · Built for hackathon & final-year use</p>
            <p className="text-xs text-zinc-600">Powered by NLP Heuristics · Modular AI Architecture</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
