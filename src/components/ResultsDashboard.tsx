import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  CreditCard,
  Globe,
  FileWarning,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PhoneCall,
  Check,
} from 'lucide-react';
import { ForensicReport } from '../types/forensics';
import { TrustGauge } from './TrustGauge';

interface ResultsDashboardProps {
  report: ForensicReport;
  onOpenCybercrimeModal: () => void;
  onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  report,
  onOpenCybercrimeModal,
  onReset,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const isScam = report.verdict === 'SCAM_DETECTED' || report.trust_score <= 35;
  const isSuspicious = report.verdict === 'SUSPICIOUS' || (!isScam && report.trust_score < 70);

  const handleCopyComplaint = () => {
    if (report.cybercrime_report_draft) {
      navigator.clipboard.writeText(report.cybercrime_report_draft);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    } else {
      onOpenCybercrimeModal();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. BIG VISUAL VERDICT BANNER (Understood in 1 second) */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left ${
          isScam
            ? 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-500/50 shadow-rose-950/30'
            : isSuspicious
            ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-500/50 shadow-amber-950/30'
            : 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/50 shadow-emerald-950/30'
        }`}
      >
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
            isScam
              ? 'bg-rose-600 text-white animate-bounce'
              : isSuspicious
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-500 text-slate-950'
          }`}
        >
          {isScam ? (
            <ShieldAlert className="w-12 h-12" />
          ) : isSuspicious ? (
            <AlertTriangle className="w-12 h-12" />
          ) : (
            <ShieldCheck className="w-12 h-12" />
          )}
        </div>

        <div className="flex-1">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 font-mono bg-black/40 border border-white/10">
            {isScam ? '🚨 DANGER: CONFIRMED SCAM' : isSuspicious ? '⚠️ HIGH SUSPICION' : '✅ LIKELY LEGITIMATE'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isScam
              ? 'Do NOT Pay Any Money or Share Documents'
              : isSuspicious
              ? 'Proceed with Extreme Caution'
              : 'Standard Corporate Hiring Detected'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            {report.executive_summary}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Check Another Job</span>
          </button>
        </div>
      </div>

      {/* 2. THE 3 SIMPLEST QUESTIONS (Plain English) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Money Question */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between ${
            report.financial_trap_detected.asks_for_money
              ? 'bg-rose-950/30 border-rose-500/40'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard
                className={`w-5 h-5 ${
                  report.financial_trap_detected.asks_for_money ? 'text-rose-400' : 'text-emerald-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Did they ask for money?
              </span>
            </div>

            <div className="mt-2">
              {report.financial_trap_detected.asks_for_money ? (
                <div>
                  <span className="text-lg font-black text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-5 h-5" />
                    YES (Scam Trap)
                  </span>
                  <div className="mt-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200">
                    <div className="font-bold text-white text-sm">
                      Amount: {report.financial_trap_detected.amount_requested || 'Money demanded'}
                    </div>
                    <div className="mt-0.5 opacity-90">
                      Reason: {report.financial_trap_detected.stated_reason || 'Deposit / Courier / Registration'}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-rose-300 font-semibold">
                    ⚠️ Real companies NEVER charge for laptops, onboarding, or training.
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" />
                    NO
                  </span>
                  <p className="mt-2 text-xs text-slate-300">
                    No upfront fees, deposit requests, or UPI demands were found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Company Verification */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Who are they claiming to be?
              </span>
            </div>

            <div className="mt-2 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Claimed Company:</span>
                <span className="text-sm font-bold text-white">
                  {report.extracted_entities.company_name_claimed || 'Unspecified / Individual'}
                </span>
              </div>

              {report.extracted_entities.official_domain_expected && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Real Official Website:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {report.extracted_entities.official_domain_expected}
                  </span>
                </div>
              )}

              {report.extracted_entities.sender_emails.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Sender's Email / Domain:</span>
                  <span className="text-amber-400 font-mono font-medium truncate block">
                    {report.extracted_entities.sender_emails[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Trust Score Gauge */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            3. Safety Trust Score
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className={`text-5xl font-black font-mono ${
                isScam ? 'text-rose-500' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {report.trust_score}
            </span>
            <span className="text-xl font-bold text-slate-400 font-mono">/100</span>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mt-1 ${
              isScam
                ? 'bg-rose-500/20 text-rose-300'
                : isSuspicious
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {isScam ? 'High-Risk Scam' : isSuspicious ? 'Suspicious' : 'Safe to Proceed'}
          </span>
          <span className="text-[11px] text-slate-400 mt-2">
            AI Engine Confidence: {report.confidence_score}%
          </span>
        </div>
      </div>

      {/* 3. REASONS WHY THIS IS FAKE (Simple bullet points) */}
      <div className="rounded-2xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <FileWarning className="w-4 h-4 text-rose-400" />
          Clear Warning Signs Found
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {report.forensic_breakdown.document_and_image_flags.map((flag, idx) => (
            <div
              key={`doc-${idx}`}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-slate-200"
            >
              <span className="text-rose-400 font-bold mt-0.5">⚠️</span>
              <span className="leading-relaxed">{flag}</span>
            </div>
          ))}

          {report.forensic_breakdown.email_and_url_flags.map((flag, idx) => (
            <div
              key={`email-${idx}`}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-slate-200"
            >
              <span className="text-amber-400 font-bold mt-0.5">⚠️</span>
              <span className="leading-relaxed">{flag}</span>
            </div>
          ))}

          {report.forensic_breakdown.audio_call_flags.map((flag, idx) => (
            <div
              key={`audio-${idx}`}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-slate-200"
            >
              <span className="text-cyan-400 font-bold mt-0.5">📞</span>
              <span className="leading-relaxed">{flag}</span>
            </div>
          ))}

          {report.forensic_breakdown.company_legitimacy_flags.map((flag, idx) => (
            <div
              key={`comp-${idx}`}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-slate-200"
            >
              <span className="text-indigo-400 font-bold mt-0.5">🏢</span>
              <span className="leading-relaxed">{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WHAT SHOULD YOU DO RIGHT NOW? (Simple checklist & 1-click complaint) */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>What Should You Do Right Now?</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Take these immediate steps to protect yourself and your bank account.
            </p>
          </div>

          {report.cybercrime_report_draft && (
            <button
              onClick={handleCopyComplaint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              {copiedDraft ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDraft ? 'Copied to Clipboard!' : '1-Click Copy Police Complaint'}</span>
            </button>
          )}
        </div>

        {/* Action List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.recommended_actions.map((action, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-[11px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <span className="leading-relaxed font-medium">{action}</span>
            </div>
          ))}
        </div>

        {/* Emergency Helpline Banner */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Did you already transfer money? Call 1930 immediately.</div>
              <div className="text-slate-300">National Cyber Crime Helpline (24x7 Free) can freeze fraudulent UPI transfers within hours.</div>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs whitespace-nowrap shadow-md transition-colors"
          >
            File on cybercrime.gov.in
          </a>
        </div>
      </div>

      {/* 5. ADVANCED TECHNICAL FORENSICS (Collapsed by default so beginners are not confused) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Detailed Technical Evidence (CIN, Phone, UPI IDs, Domains)</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-cyan-400">
            {showTechnicalDetails ? 'Hide technical data' : 'Show technical data'}
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Suspect Phone / WhatsApp:</span>
                <span className="text-white font-semibold">
                  {report.extracted_entities.phone_numbers.join(', ') || 'None found'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Suspect Payment UPI Handles:</span>
                <span className="text-rose-400 font-semibold">
                  {report.extracted_entities.upi_ids_or_bank_details.join(', ') || 'None found'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Claimed Indian CIN:</span>
                <span className="text-white font-semibold">
                  {report.extracted_entities.cin_or_registration_number || 'None found'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Extracted Links:</span>
                <span className="text-cyan-400 truncate block">
                  {report.extracted_entities.urls_found.join(', ') || 'None found'}
                </span>
              </div>
            </div>

            {report.cybercrime_report_draft && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Formal Incident Draft:</span>
                <pre className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {report.cybercrime_report_draft}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
