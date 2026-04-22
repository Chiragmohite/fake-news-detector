import React from "react";
import { Link } from "react-router-dom";
import {
  Brain, Shield, Scan, Code2, Database, Cpu,
  Github, Linkedin, ArrowRight, CheckCircle
} from "lucide-react";

const TECH_STACK = [
  { name: "React.js", desc: "Frontend UI library", color: "#00F0FF", icon: <Code2 size={20} /> },
  { name: "Tailwind CSS", desc: "Utility-first CSS", color: "#0066FF", icon: <Code2 size={20} /> },
  { name: "FastAPI", desc: "Python web framework", color: "#00FF66", icon: <Cpu size={20} /> },
  { name: "MongoDB", desc: "NoSQL database", color: "#00FF66", icon: <Database size={20} /> },
  { name: "NLP Engine", desc: "Custom heuristics", color: "#B500FF", icon: <Brain size={20} /> },
  { name: "Recharts", desc: "Data visualization", color: "#FFB800", icon: <Scan size={20} /> },
];

const ALGORITHM_STEPS = [
  { step: "01", title: "Text Preprocessing", desc: "Content is tokenized and normalized for analysis." },
  { step: "02", title: "Phrase Scanning", desc: "50+ known misinformation, clickbait, and conspiracy phrases are detected." },
  { step: "03", title: "Source Attribution Check", desc: "Presence of credible vs. vague source references is analyzed." },
  { step: "04", title: "Linguistic Analysis", desc: "Emotional manipulation, excessive capitalization, and punctuation overuse are flagged." },
  { step: "05", title: "Credibility Scoring", desc: "A weighted score (0–100) is calculated from all detected indicators." },
  { step: "06", title: "Explainable Output", desc: "Human-readable reasoning is generated for each analysis decision." },
];

const TEAM = [
  { name: "AI Research Lead", role: "NLP Algorithm Design", emoji: "1" },
  { name: "Full-Stack Engineer", role: "React + FastAPI", emoji: "2" },
  { name: "Data Scientist", role: "Heuristics & Modeling", emoji: "3" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#05050A] grid-bg pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500">ABOUT TRUTHSCAN</div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Fighting Misinformation with{" "}
            <span className="gradient-text-cyan">AI</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed">
            TruthScan is an AI-powered platform that uses advanced NLP heuristics to analyze
            news content and help users identify fake news, misleading articles, and credible journalism.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/analyze" className="flex items-center gap-2 px-6 py-3 rounded-xl btn-neon font-medium group">
              <Scan size={16} />
              Try It Now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#0B0B14] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-500">OUR MISSION</div>
              <h2 className="font-heading text-3xl font-bold text-white">
                Making the internet
                <br /><span className="gradient-text-cyan">truthful again</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                In an era where misinformation spreads faster than verified news, TruthScan provides
                individuals, journalists, and researchers with an accessible tool to verify content
                credibility using transparent, explainable AI.
              </p>
              <div className="space-y-3">
                {[
                  "Modular architecture — swap AI engines via environment variables",
                  "Transparent reasoning — every verdict explained step by step",
                  "Guest-accessible — no sign-up required to analyze content",
                  "Open source friendly — designed for academic and research use",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/a158118b-a259-491f-8471-f9e3d36f0e02/images/0c67fe93c41e2a5ae558f3f2576f34c1941b921de0445b2df71ff658006dcf70.png"
                alt="Abstract AI visualization"
                className="w-full rounded-2xl border border-white/10"
                style={{ filter: "brightness(0.8) saturate(1.2)" }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#05050A] to-transparent opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">HOW IT WORKS</div>
          <h2 className="font-heading text-3xl font-bold text-white">
            The Detection <span className="gradient-text-purple">Algorithm</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
            A rule-based NLP pipeline analyzes content across 6 dimensions to produce a credibility verdict.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALGORITHM_STEPS.map((step, i) => (
            <div
              key={i}
              className="glass-card p-6 space-y-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400/60">{step.step}</span>
                <div className="flex-1 h-px bg-cyan-500/20" />
              </div>
              <h3 className="font-heading font-semibold text-white text-base">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-[#0B0B14] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-3">TECH STACK</div>
            <h2 className="font-heading text-3xl font-bold text-white">Built With Modern Technologies</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TECH_STACK.map((tech, i) => (
              <div
                key={i}
                className="glass-card p-5 text-center space-y-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
                  style={{ background: `${tech.color}15`, color: tech.color, border: `1px solid ${tech.color}25` }}
                >
                  {tech.icon}
                </div>
                <div>
                  <div className="font-heading font-bold text-white text-sm">{tech.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Provider Note */}
          <div className="mt-8 glass-card p-5 border-cyan-500/20" style={{ borderColor: "rgba(0,240,255,0.15)" }}>
            <div className="flex items-start gap-3">
              <Brain size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-semibold text-white text-sm mb-1">Modular AI Architecture</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Currently powered by rule-based NLP heuristics. The architecture is designed to support
                  OpenAI GPT, Google Gemini, or Anthropic Claude by simply adding an API key via environment variable.
                  No code changes required.
                </p>
                <div className="flex gap-2 mt-3">
                  {["OpenAI GPT", "Gemini Flash", "Claude Haiku"].map((model) => (
                    <span key={model} className="px-2 py-1 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                      {model} ready
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-500">THE TEAM</div>
            <h2 className="font-heading text-3xl font-bold text-white">
              Built by passionate{" "}
              <span className="gradient-text-cyan">developers</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              TruthScan was built as a final-year project and hackathon submission, combining
              expertise in NLP, full-stack engineering, and data science to address the global
              challenge of misinformation.
            </p>
            <div className="space-y-3">
              {TEAM.map((member, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white font-mono">
                    {member.emoji}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{member.name}</div>
                    <div className="text-xs text-zinc-500">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/a158118b-a259-491f-8471-f9e3d36f0e02/images/f88a21eaf1ad2530ea93469166000e90fec04c407d1841644025e8cb64a26ce5.png"
              alt="Team"
              className="w-full rounded-2xl border border-white/10"
              style={{ filter: "brightness(0.75) saturate(0.9)" }}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-50" />
            <div className="absolute bottom-6 left-6 glass px-4 py-3 rounded-xl">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Project Status</div>
              <div className="text-white font-bold text-sm mt-0.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Production Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B0B14] border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-heading text-3xl font-bold text-white">
            Ready to fight fake news?
          </h2>
          <p className="text-zinc-400">
            Start analyzing articles right now — no account required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/analyze" className="flex items-center gap-2 px-8 py-3 rounded-xl btn-neon font-bold group">
              <Scan size={16} />
              Analyze Now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/signup" className="flex items-center gap-2 px-8 py-3 rounded-xl text-zinc-300 border border-white/15 hover:bg-white/5 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
