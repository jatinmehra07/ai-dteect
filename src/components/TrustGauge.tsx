import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface TrustGaugeProps {
  score: number; // 0 to 100
  verdict: 'SCAM_DETECTED' | 'SUSPICIOUS' | 'LEGITIMATE';
  confidence: number;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ score, verdict, confidence }) => {
  // SVG circular arc calculations
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // We'll use 75% of circle (270 degrees)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  // Determine color scheme based on verdict / score
  let colorClass = 'text-rose-500';
  let strokeColor = '#ef4444';
  let bgGlow = 'rgba(239, 68, 68, 0.15)';
  let verdictLabel = 'CRITICAL SCAM DETECTED';
  let Icon = ShieldAlert;
  let badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  if (verdict === 'LEGITIMATE' || score >= 70) {
    colorClass = 'text-emerald-400';
    strokeColor = '#10b981';
    bgGlow = 'rgba(16, 185, 129, 0.15)';
    verdictLabel = 'LIKELY LEGITIMATE OFFER';
    Icon = ShieldCheck;
    badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (verdict === 'SUSPICIOUS' || (score >= 31 && score <= 69)) {
    colorClass = 'text-amber-400';
    strokeColor = '#f59e0b';
    bgGlow = 'rgba(245, 158, 11, 0.15)';
    verdictLabel = 'SUSPICIOUS / UNVERIFIED';
    Icon = AlertTriangle;
    badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden"
      style={{ boxShadow: `0 0 50px ${bgGlow}` }}
    >
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${strokeColor} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Arc Gauge */}
      <div className="relative w-[220px] h-[220px] flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-135"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="text-slate-800"
          />
          {/* Colored progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
          <Icon className={`w-8 h-8 mb-1 ${colorClass}`} />
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-black tracking-tight text-white font-mono">
              {score}
            </span>
            <span className="text-xl font-bold text-slate-400 font-mono">/100</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Trust Score
          </span>
        </div>
      </div>

      {/* Threat Verdict Badge */}
      <div className="mt-2 flex flex-col items-center gap-1.5 z-10">
        <div
          className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${badgeClass} shadow-lg`}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: strokeColor }} />
          {verdictLabel}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>AI Engine Confidence:</span>
          <span className="font-mono font-semibold text-slate-200">{confidence}%</span>
        </div>
      </div>

      {/* Trust Rating Scale Reference */}
      <div className="w-full mt-5 pt-4 border-t border-slate-800/80 flex justify-between text-[10px] font-mono text-slate-400 px-2">
        <span className="text-rose-400">0-30: Scam</span>
        <span className="text-amber-400">31-69: Suspicious</span>
        <span className="text-emerald-400">70-100: Legitimate</span>
      </div>
    </div>
  );
};
