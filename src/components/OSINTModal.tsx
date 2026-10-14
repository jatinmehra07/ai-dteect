import React, { useState } from 'react';
import { X, Search, CheckCircle2, XCircle, AlertTriangle, Building2, Globe, Shield, ExternalLink } from 'lucide-react';
import { validateCINFormat, CINValidationResult } from '../utils/cinValidator';

interface OSINTModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCIN?: string;
}

export const OSINTModal: React.FC<OSINTModalProps> = ({
  isOpen,
  onClose,
  initialCIN = '',
}) => {
  const [cinInput, setCinInput] = useState(initialCIN || 'L85110KA1981PLC013115'); // Genuine Infosys default
  const [cinResult, setCinResult] = useState<CINValidationResult | null>(() =>
    validateCINFormat(initialCIN || 'L85110KA1981PLC013115')
  );

  const [domainInput, setDomainInput] = useState('careers@tcs-india-hiring.com');
  const [domainAnalysis, setDomainAnalysis] = useState<any>(null);

  if (!isOpen) return null;

  const handleCinCheck = (val: string) => {
    setCinInput(val);
    if (val.trim()) {
      setCinResult(validateCINFormat(val));
    } else {
      setCinResult(null);
    }
  };

  const handleDomainCheck = () => {
    const raw = domainInput.trim().toLowerCase();
    const domain = raw.includes('@') ? raw.split('@')[1] : raw.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    
    const freeWebmail = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'].includes(domain);
    const suspiciousTld = ['.online', '.xyz', '.site', '.top', '.click', '.club', '.work'].some(t => domain.endsWith(t));
    const isTyposquat = /(tcs|wipro|infosys|amazon|google|microsoft)[-_]?(hiring|careers|jobs|support|india)/i.test(domain);

    setDomainAnalysis({
      domain,
      freeWebmail,
      suspiciousTld,
      isTyposquat,
      verdict: freeWebmail || isTyposquat || suspiciousTld ? 'HIGH_RISK_SPOOF' : 'STANDARD_DOMAIN',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Corporate OSINT &amp; Legal Forensics Sandbox
              </h2>
              <p className="text-xs text-slate-400">
                Validate Indian Ministry of Corporate Affairs (MCA) CINs and inspect domain typosquatting.
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* CIN Validator section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Indian Corporate Identification Number (CIN) Inspector</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80">MCA 21-Char Standard</span>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={cinInput}
                onChange={(e) => handleCinCheck(e.target.value)}
                maxLength={21}
                placeholder="e.g. L85110KA1981PLC013115 or U72200MH1995PTC999999"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none uppercase tracking-wider"
              />
              <div className="absolute right-3 top-3 text-[11px] font-mono text-slate-400">
                {cinInput.length}/21
              </div>
            </div>

            {/* Preset quick test buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[11px] text-slate-400 py-1">Quick Test:</span>
              <button
                type="button"
                onClick={() => handleCinCheck('L85110KA1981PLC013115')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              >
                Genuine Infosys (Valid)
              </button>
              <button
                type="button"
                onClick={() => handleCinCheck('L72200MH1995PLC085600')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              >
                Genuine TCS (Valid)
              </button>
              <button
                type="button"
                onClick={() => handleCinCheck('U72200MH1995PTC999999')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
              >
                Forged Scam Letter CIN
              </button>
            </div>

            {/* CIN Breakdown card */}
            {cinResult && (
              <div
                className={`rounded-lg p-3.5 border ${
                  cinResult.isValidFormat
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-2">
                  {cinResult.isValidFormat ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{cinResult.explanation}</span>
                </div>

                {cinResult.isValidFormat && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Class / Listing</span>
                      <span className="text-white font-bold">{cinResult.listing}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">State Jurisdiction</span>
                      <span className="text-white font-bold">{cinResult.stateName} ({cinResult.stateCode})</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Incorporation Year</span>
                      <span className="text-white font-bold">{cinResult.incorporationYear}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ownership Structure</span>
                      <span className="text-white font-bold">{cinResult.ownershipDescription}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 col-span-2">
                      <span className="text-[10px] text-slate-400 block">Industry NIC Code</span>
                      <span className="text-white truncate block">{cinResult.industryCode}: {cinResult.industryDescription}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Domain & Spoofing Analyzer */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Domain Typosquatting &amp; Impersonation Scanner</span>
              </div>
              <span className="text-[11px] text-slate-400">DNS &amp; Lookalike Heuristics</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter recruiter email or domain (e.g. hr@wipro-career.online)"
                className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleDomainCheck}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Analyze</span>
              </button>
            </div>

            {domainAnalysis && (
              <div
                className={`rounded-lg p-3.5 border ${
                  domainAnalysis.verdict === 'HIGH_RISK_SPOOF'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-2">
                  {domainAnalysis.verdict === 'HIGH_RISK_SPOOF' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span
                    className={
                      domainAnalysis.verdict === 'HIGH_RISK_SPOOF'
                        ? 'text-rose-300'
                        : 'text-emerald-300'
                    }
                  >
                    Target Domain: {domainAnalysis.domain}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {domainAnalysis.freeWebmail && (
                    <div className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      Free webmail provider used. Real corporate HR never hires via personal Gmail/Yahoo/Outlook.
                    </div>
                  )}
                  {domainAnalysis.isTyposquat && (
                    <div className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      Combines genuine brand name with generic hiring suffixes (-hiring, -careers, -india). High-confidence typosquat.
                    </div>
                  )}
                  {domainAnalysis.suspiciousTld && (
                    <div className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Uses cheap/disposable TLD frequently abused in recruitment fraud.
                    </div>
                  )}
                  {!domainAnalysis.freeWebmail && !domainAnalysis.isTyposquat && !domainAnalysis.suspiciousTld && (
                    <div className="text-emerald-300">
                      Standard corporate domain syntax with no immediate spoofing indicators.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <a
            href="https://www.mca.gov.in/content/mca/global/en/home.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:underline"
          >
            <span>Verify on official MCA Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
