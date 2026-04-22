import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Menu, X, Scan, BarChart3, Info, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze", icon: <Scan size={14} /> },
  { to: "/dashboard", label: "Dashboard", icon: <BarChart3 size={14} /> },
  { to: "/about", label: "About", icon: <Info size={14} /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-black/70 border-b border-white/10 shadow-lg shadow-black/30" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <div className="relative">
              <ShieldCheck size={26} className="text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all duration-300" />
            </div>
            <span className="font-heading font-bold text-white text-lg tracking-tight">
              Truth<span className="text-cyan-400">Scan</span>
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-cyan-500/60 border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-500/5">
              AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <User size={14} className="text-cyan-400" />
                  <span className="text-sm text-white font-medium max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  data-testid="logout-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-btn"
                  className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  data-testid="nav-signup-btn"
                  className="px-4 py-2 rounded-lg text-sm btn-neon font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-toggle"
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-xl bg-black/90 border-b border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive(link.to)
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-zinc-400">Signed in as <span className="text-white">{user.name}</span></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">Login</Link>
                  <Link to="/signup" className="block px-4 py-3 rounded-lg text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
