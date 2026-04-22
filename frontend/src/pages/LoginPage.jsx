import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleGuestDemo = () => navigate("/analyze");

  return (
    <div className="min-h-screen bg-[#05050A] grid-bg flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck size={32} className="text-cyan-400" />
            <span className="font-heading text-2xl font-bold text-white">Truth<span className="text-cyan-400">Scan</span></span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to access your analysis dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 space-y-6">
          {error && (
            <div
              className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                data-testid="login-email-input"
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
                  placeholder="••••••••"
                  data-testid="login-password-input"
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
              data-testid="login-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-neon font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-zinc-500">
              <span className="px-3 bg-transparent">or</span>
            </div>
          </div>

          <button
            onClick={handleGuestDemo}
            data-testid="guest-demo-btn"
            className="w-full py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            Continue as Guest (Demo)
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors" data-testid="signup-link">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
