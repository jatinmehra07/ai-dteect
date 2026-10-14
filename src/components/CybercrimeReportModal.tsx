import React, { useState } from 'react';
import { X, Copy, Check, FileDown, ShieldAlert, ExternalLink, PhoneCall } from 'lucide-react';
import { ForensicReport } from '../types/forensics';

interface CybercrimeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ForensicReport;
}

export const CybercrimeReportModal: React.FC<CybercrimeReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(report.cybercrime_report_draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([report.cybercrime_report_draft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cybercrime_Complaint_Draft_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Official Cybercrime Complaint Draft
              </h2>
              <p className="text-xs text-slate-400">
                Pre-formatted incident report for submission on <span className="text-cyan-400">cybercrime.gov.in</span> or National Helpline <span className="text-amber-400">1930</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout Bar */}
        <div className="my-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-rose-500/30 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Immediate Cyber Fraud Helpline: 1930</div>
              <div className="text-slate-400">Toll-free 24x7 National Cyber Crime Reporting Center</div>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 font-bold text-white transition-colors shadow-md text-xs whitespace-nowrap"
          >
            <span>Open cybercrime.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Text Container */}
        <div className="flex-1 overflow-y-auto mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-rose-500 selection:text-white">
          {report.cybercrime_report_draft}
        </div>

        {/* Extracted Suspect Coordinates Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px] font-mono">
          <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
            <span className="text-slate-400 block text-[9px] uppercase">Suspect Emails</span>
            <span className="text-rose-300 font-semibold truncate block">
              {report.extracted_entities.sender_emails.length > 0
                ? report.extracted_entities.sender_emails.join(', ')
                : 'None isolated'}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
            <span className="text-slate-400 block text-[9px] uppercase">Phone / WhatsApp</span>
            <span className="text-amber-300 font-semibold truncate block">
              {report.extracted_entities.phone_numbers.length > 0
                ? report.extracted_entities.phone_numbers.join(', ')
                : 'None isolated'}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
            <span className="text-slate-400 block text-[9px] uppercase">UPI / Bank Handles</span>
            <span className="text-rose-400 font-semibold truncate block">
              {report.extracted_entities.upi_ids_or_bank_details.length > 0
                ? report.extracted_entities.upi_ids_or_bank_details.join(', ')
                : 'None isolated'}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
            <span className="text-slate-400 block text-[9px] uppercase">Extortion Amount</span>
            <span className="text-rose-400 font-bold truncate block">
              {report.financial_trap_detected.amount_requested || 'Unspecified'}
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Download .TXT</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Incident Draft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
