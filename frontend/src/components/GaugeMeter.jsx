import React, { useState, useEffect } from "react";

const getColor = (score) => {
  if (score >= 70) return "#00FF66";
  if (score >= 50) return "#FFB800";
  if (score >= 28) return "#FF7A00";
  return "#FF3366";
};

const getLabel = (score) => {
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score >= 28) return "LOW";
  return "CRITICAL";
};

export default function GaugeMeter({ score = 0, size = 200 }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(timer);
  }, [score]);

  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const halfCirc = circumference / 2;
  const progress = (Math.max(0, Math.min(100, animated)) / 100) * halfCirc;
  const color = getColor(score);
  const credLabel = getLabel(score);
  const svgH = size * 0.65;

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];
  const tickElements = ticks.map((t) => {
    const angle = Math.PI - (t / 100) * Math.PI;
    const x1 = cx + (r - size * 0.04) * Math.cos(angle);
    const y1 = cy - (r - size * 0.04) * Math.sin(angle);
    const x2 = cx + (r + size * 0.04) * Math.cos(angle);
    const y2 = cy - (r + size * 0.04) * Math.sin(angle);
    return { x1, y1, x2, y2, t };
  });

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={svgH}
        viewBox={`0 0 ${size} ${svgH}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`bg-grad-${score}`} cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx={cx} cy={cy} rx={r + 10} ry={r + 10} fill={`url(#bg-grad-${score})`} />

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={size * 0.055}
          strokeDasharray={`${halfCirc} ${circumference}`}
          transform={`rotate(180, ${cx}, ${cy})`}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.055}
          strokeDasharray={`${progress} ${circumference}`}
          transform={`rotate(180, ${cx}, ${cy})`}
          strokeLinecap="round"
          filter={`url(#glow-${score})`}
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)" }}
        />

        {/* Tick marks */}
        {tickElements.map(({ x1, y1, x2, y2, t }) => (
          <line
            key={t}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1.5}
          />
        ))}

        {/* Score number */}
        <text
          x={cx} y={cy - size * 0.04}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.2}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
          dominantBaseline="middle"
        >
          {animated}
        </text>

        {/* /100 */}
        <text
          x={cx} y={cy + size * 0.13}
          textAnchor="middle"
          fill="rgba(161,161,170,0.7)"
          fontSize={size * 0.065}
          fontFamily="'IBM Plex Sans', sans-serif"
          letterSpacing="1"
        >
          /100
        </text>
      </svg>

      {/* Credibility label */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase"
        style={{
          color: color,
          background: `${color}15`,
          border: `1px solid ${color}40`,
          textShadow: `0 0 8px ${color}60`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        {credLabel} CREDIBILITY
      </div>
    </div>
  );
}
