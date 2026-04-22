import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PERKS = [
  "Save unlimited analysis history",
  "View analytics dashboard & charts",
  "Export analysis reports",
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] grid-bg flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck size={32} className="text-cyan-400" />
            <span className="font-heading text-2xl font-bold text-white">Truth<span className="text-cyan-400">Scan</span></span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-sm text-zinc-400">Join thousands of users fighting misinformation</p>
        </div>

        {/* Perks */}
        <div className="glass-card px-6 py-4 mb-6 space-y-2">
          {PERKS.map((perk, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-cyan-400" />
              </div>
              <span className="text-zinc-300">{perk}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8 space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="signup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                data-testid="signup-name-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                data-testid="signup-email-input"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  data-testid="signup-password-input"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white placeholder-zinc-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="signup-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-neon font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors" data-testid="login-link">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-zinc-600 mt-3">
          Or{" "}
          <Link to="/analyze" className="text-zinc-400 hover:text-white transition-colors">
            continue as guest
          </Link>{" "}
          to try without an account
        </p>
      </div>
    </div>
  );
}
