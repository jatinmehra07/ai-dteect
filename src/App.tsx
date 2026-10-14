import React, { useState, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileText,
  Image as ImageIcon,
  Mic,
  Cpu,
  Building2,
  RefreshCw,
  PhoneCall,
  CheckCircle,
  X,
  Sparkles,
  Link2,
} from 'lucide-react';
import { AttachedFile, ForensicReport, ThreatPreset } from './types/forensics';
import { THREAT_PRESETS } from './data/threatPresets';
import { AudioRecorder } from './components/AudioRecorder';
import { ResultsDashboard } from './components/ResultsDashboard';
import { OSINTModal } from './components/OSINTModal';
import { CybercrimeReportModal } from './components/CybercrimeReportModal';

type InputMode = 'text' | 'file' | 'audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<InputMode>('text');

  // Input states
  const [rawText, setRawText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [audioFile, setAudioFile] = useState<AttachedFile | null>(null);

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isOsintModalOpen, setIsOsintModalOpen] = useState(false);
  const [isCybercrimeModalOpen, setIsCybercrimeModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load preset sample
  const handleSelectPreset = (preset: ThreatPreset) => {
    setRawText(preset.text);
    if (preset.file) {
      setAttachedFiles([preset.file]);
      setActiveTab('file');
    } else if (preset.category === 'Fraudulent HR Call') {
      setActiveTab('text');
    } else {
      setActiveTab('text');
    }
    setAudioFile(null);
    setReport(null);
    setErrorMessage(null);
  };

  // Upload file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
        const newAttached: AttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: file.name,
          type: isPdf ? 'pdf' : 'image',
          mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png'),
          base64: base64Data,
          previewUrl,
          sizeBytes: file.size,
        };
        setAttachedFiles((prev) => [...prev, newAttached]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Run Forensic Analysis
  const handleRunForensics = async () => {
    if (!rawText.trim() && attachedFiles.length === 0 && !audioFile) {
      setErrorMessage('Please paste a job message, upload an offer letter, or record an HR call first.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep('Checking for scam patterns & fee requests...');

    const steps = [
      'Extracting company names, emails & phone numbers...',
      'Checking official corporate website & domain age...',
      'Validating Indian Corporate Identification Number (CIN)...',
      'Synthesizing final scam safety verdict...',
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setAnalysisStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 800);

    try {
      const payloadFiles = [...attachedFiles];
      if (audioFile) {
        payloadFiles.push(audioFile);
      }

      const response = await fetch('/api/forensics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          files: payloadFiles,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.data) {
        setReport(data.data);
      } else {
        throw new Error('Could not parse forensic result.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Forensic analysis failed:', err);
      setErrorMessage(err.message || 'Unable to scan this job. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleReset = () => {
    setReport(null);
    setRawText('');
    setAttachedFiles([]);
    setAudioFile(null);
    setErrorMessage(null);
  };

  const hasAnyInput = rawText.trim().length > 0 || attachedFiles.length > 0 || audioFile !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. CLEAN TOP HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                HireShield<span className="text-cyan-400">.AI</span>
              </span>
              <p className="text-[11px] text-slate-400">Free Job Scam &amp; Offer Letter Detector</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOsintModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify Company CIN</span>
            </button>

            <a
              href="tel:1930"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Helpline: 1930</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {report ? (
          <ResultsDashboard
            report={report}
            onOpenCybercrimeModal={() => setIsCybercrimeModalOpen(true)}
            onReset={handleReset}
          />
        ) : (
          <div className="space-y-6">
            {/* Friendly Title & Quick Tagline */}
            <div className="text-center max-w-2xl mx-auto pt-2 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                100% Free • Protect Your Money &amp; Identity
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Check If a Job Offer Is Fake or Real
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Paste any message, upload a letter or screenshot, or test an HR phone call. We'll tell you if it's a scam in seconds.
              </p>
            </div>

            {/* Quick Demo Buttons (Try it with 1 click) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                ⚡ Or Try an Example Job Offer:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {THREAT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <span>{preset.threatLevel === 'CRITICAL' ? '🚨' : '✅'}</span>
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Simple 3-Tab Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 space-y-5">
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'text'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'file'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Upload Letter / Image</span>
                  {attachedFiles.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'audio'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Check HR Call</span>
                  {audioFile && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </button>
              </div>

              {/* Tab 1: Text */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <textarea
                    rows={7}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the WhatsApp message, email, job description, or payment instructions you received..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed transition-colors"
                  />
                  {rawText && (
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Ready to analyze</span>
                      <button
                        type="button"
                        onClick={() => setRawText('')}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        Clear text
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Upload Image / PDF */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950 p-8 text-center cursor-pointer transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 mb-3 shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white">Click to Upload Offer Letter or Screenshot</span>
                    <span className="text-xs text-slate-400 mt-1">
                      PDF offer letters, WhatsApp screenshots, or job ads (PNG, JPG, PDF)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Attached Documents ({attachedFiles.length})
                      </span>
                      {attachedFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {f.previewUrl ? (
                              <img
                                src={f.previewUrl}
                                alt={f.name}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-700 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="truncate">
                              <span className="text-xs font-bold text-white truncate block">{f.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {f.type} • {f.sizeBytes ? Math.round(f.sizeBytes / 1024) + ' KB' : 'Attached'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(f.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Check HR Call Audio */}
              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Did the "HR recruiter" call you, pressure you for money, or tell you to download AnyDesk? Record or upload the call recording below.
                  </p>
                  <AudioRecorder
                    onAudioReady={(audio) => setAudioFile(audio)}
                    onRemove={() => setAudioFile(null)}
                    existingAudio={audioFile}
                  />
                </div>
              )}

              {/* Summary of What's Attached */}
              {hasAnyInput && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold">Ready to scan:</span>
                    {rawText.trim() && <span>Message text ✓</span>}
                    {attachedFiles.length > 0 && <span>{attachedFiles.length} document(s) ✓</span>}
                    {audioFile && <span>Call audio ✓</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-slate-400 hover:text-rose-400 text-[11px]"
                  >
                    Reset all
                  </button>
                </div>
              )}

              {/* 3. BIG PRIMARY SCAN BUTTON */}
              <button
                type="button"
                disabled={isAnalyzing || !hasAnyInput}
                onClick={handleRunForensics}
                className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>Analyzing... Please wait</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 text-slate-950" />
                    <span>Check This Job Now</span>
                  </>
                )}
              </button>

              {/* Real-time progress label */}
              {isAnalyzing && (
                <div className="text-center text-xs font-mono text-cyan-300 animate-pulse">
                  {analysisStep}
                </div>
              )}
            </div>

            {/* 3 Simple Rules Everyone Should Know */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                💡 3 Golden Rules to Never Get Scammed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">1. NEVER PAY FOR LAPTOPS</span>
                  <p className="text-slate-400 leading-relaxed">
                    Real companies send company laptops for free. Asking for a "refundable deposit" is 100% a scam.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">2. NO GMAIL HR EMAILS</span>
                  <p className="text-slate-400 leading-relaxed">
                    Companies like TCS, Infosys, and Amazon never email from @gmail.com or @yahoo.com.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">3. NO ANYDESK DOWNLOADS</span>
                  <p className="text-slate-400 leading-relaxed">
                    Never install AnyDesk or TeamViewer during an interview. It gives scammers access to your bank.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Corporate OSINT Sandbox Modal */}
      <OSINTModal
        isOpen={isOsintModalOpen}
        onClose={() => setIsOsintModalOpen(false)}
      />

      {/* Cybercrime Ready-to-File Complaint Modal */}
      {report && (
        <CybercrimeReportModal
          isOpen={isCybercrimeModalOpen}
          onClose={() => setIsCybercrimeModalOpen(false)}
          report={report}
        />
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireShield AI — Free Recruitment Threat Forensics</span>
          <span>National Cyber Crime Helpline: 1930</span>
        </div>
      </footer>
    </div>
  );
}
