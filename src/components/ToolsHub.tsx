import React, { useState, useEffect, useRef } from 'react';
import {
  Languages,
  FileText,
  Camera,
  Smartphone,
  ArrowRightLeft,
  Copy,
  Check,
  Share2,
  Volume2,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Battery,
  BatteryCharging,
  Vibrate,
  Settings,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { triggerHaptic, buildIntentUri } from '../utils/phoneBridge.ts';

interface ToolsHubProps {
  initialTab?: 'translate' | 'summarize' | 'vision' | 'phone';
  preferredLanguage?: string;
  onSaveToNotes?: (note: { title: string; content: string; category: any }) => void;
}

const LANGUAGES = [
  'English',
  'Urdu',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Chinese (Mandarin)',
  'Japanese',
  'Portuguese',
  'Russian',
  'Italian',
  'Turkish',
  'Korean',
];

export const ToolsHub: React.FC<ToolsHubProps> = ({
  initialTab = 'translate',
  preferredLanguage = 'English',
  onSaveToNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'translate' | 'summarize' | 'vision' | 'phone'>(initialTab);

  // Translation State
  const [transSourceText, setTransSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('Auto-detect');
  const [targetLang, setTargetLang] = useState('Urdu');
  const [transResult, setTransResult] = useState<any>(null);
  const [transLoading, setTransLoading] = useState(false);
  const [transCopied, setTransCopied] = useState(false);

  // Summarization State
  const [sumSourceText, setSumSourceText] = useState('');
  const [sumFormat, setSumFormat] = useState('Bullet-point summary');
  const [sumResult, setSumResult] = useState('');
  const [sumLoading, setSumLoading] = useState(false);
  const [sumCopied, setSumCopied] = useState(false);

  // Vision State
  const [visionImageBase64, setVisionImageBase64] = useState<string | null>(null);
  const [visionMimeType, setVisionMimeType] = useState('image/jpeg');
  const [visionTask, setVisionTask] = useState<'describe' | 'ocr' | 'screenshot' | 'qa'>('describe');
  const [visionPrompt, setVisionPrompt] = useState('');
  const [visionResult, setVisionResult] = useState('');
  const [visionLoading, setVisionLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Phone Tools State
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [phoneDialInput, setPhoneDialInput] = useState('+1 555-0199');
  const [smsRecipient, setSmsRecipient] = useState('+1 555-0199');
  const [smsBody, setSmsBody] = useState('Hello from AIPAKO AI Assistant!');
  const [toolStatusMsg, setToolStatusMsg] = useState<string | null>(null);

  // Check battery status on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        });
        battery.addEventListener('levelchange', () => {
          setBatteryInfo({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
          });
        });
        battery.addEventListener('chargingchange', () => {
          setBatteryInfo((prev) => (prev ? { ...prev, charging: battery.charging } : null));
        });
      });
    }
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    triggerHaptic(40);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      alert('Camera access denied or unavailable in this environment.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    triggerHaptic(50);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      setVisionImageBase64(base64);
      setVisionMimeType('image/jpeg');
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setVisionImageBase64(base64);
      setVisionMimeType(file.type || 'image/jpeg');
      setVisionResult('');
    };
    reader.readAsDataURL(file);
  };

  // Translation Handler
  const handleTranslate = async () => {
    if (!transSourceText.trim()) return;
    triggerHaptic(40);
    setTransLoading(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transSourceText,
          sourceLang,
          targetLang,
        }),
      });
      const data = await res.json();
      setTransLoading(false);
      setTransResult(data);
    } catch {
      setTransLoading(false);
    }
  };

  const swapTranslationLanguages = () => {
    triggerHaptic(20);
    if (sourceLang !== 'Auto-detect') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
  };

  // Summarize Handler
  const handleSummarize = async () => {
    if (!sumSourceText.trim()) return;
    triggerHaptic(40);
    setSumLoading(true);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sumSourceText,
          format: sumFormat,
        }),
      });
      const data = await res.json();
      setSumLoading(false);
      setSumResult(data.summary || '');
    } catch {
      setSumLoading(false);
    }
  };

  // Vision Handler
  const handleVisionAnalyze = async () => {
    if (!visionImageBase64) return;
    triggerHaptic(40);
    setVisionLoading(true);

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: visionImageBase64,
          mimeType: visionMimeType,
          task: visionTask,
          prompt: visionPrompt,
        }),
      });
      const data = await res.json();
      setVisionLoading(false);
      setVisionResult(data.result || '');
    } catch {
      setVisionLoading(false);
    }
  };

  // Phone Actions
  const handleLaunchDialer = () => {
    triggerHaptic(40);
    const uri = buildIntentUri('dial', phoneDialInput);
    setToolStatusMsg(`Dispatched Android Intent: android.intent.action.DIAL -> ${uri}`);
    window.location.href = uri;
  };

  const handleLaunchSms = () => {
    triggerHaptic(40);
    const uri = buildIntentUri('sms', smsRecipient, smsBody);
    setToolStatusMsg(`Dispatched Android Intent: android.intent.action.SENDTO -> ${uri}`);
    window.location.href = uri;
  };

  const handleHapticTest = () => {
    const success = triggerHaptic([80, 50, 120]);
    setToolStatusMsg(
      success
        ? 'Haptic feedback pulse triggered via device hardware vibration motor.'
        : 'Vibration API simulated (unsupported on this desktop browser hardware).'
    );
  };

  const handleSystemShare = async () => {
    triggerHaptic(40);
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({
          title: 'AIPAKO AI',
          text: 'Check out AIPAKO AI: Your Smart World, Powered by AI.',
          url: window.location.href,
        });
        setToolStatusMsg('Shared through Android system share sheet!');
      } catch {
        setToolStatusMsg('Share sheet closed or dismissed.');
      }
    } else if (nav && nav.clipboard) {
      nav.clipboard.writeText(window.location.href);
      setToolStatusMsg('URL copied to clipboard (System Share API fallback).');
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Tab Navigation Pill */}
      <div className="grid grid-cols-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('translate');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'translate'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Languages className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Translate</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('summarize');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'summarize'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Summarize</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('vision');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'vision'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Vision AI</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('phone');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'phone'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Phone Tools</span>
        </button>
      </div>

      {/* TAB 1: TRANSLATE */}
      {activeTab === 'translate' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Languages className="w-4 h-4 text-cyan-400" />
              <span>Neural Translation Studio</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
              Gemini Flash 3.8
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            {/* Language selectors and swap button */}
            <div className="flex items-center space-x-2">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Auto-detect">Auto-detect Language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                onClick={swapTranslationLanguages}
                aria-label="Swap translation languages"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Input text */}
            <textarea
              value={transSourceText}
              onChange={(e) => setTransSourceText(e.target.value)}
              rows={4}
              placeholder="Enter or paste text to translate..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {/* Action button */}
            <button
              onClick={handleTranslate}
              disabled={transLoading || !transSourceText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {transLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Translate to {targetLang}</span>
                </>
              )}
            </button>
          </div>

          {/* Translation Result Card */}
          {transResult && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 space-y-3 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Translation ({targetLang})
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transResult.translatedText);
                      setTransCopied(true);
                      setTimeout(() => setTransCopied(false), 2000);
                    }}
                    aria-label="Copy translation"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {transCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (onSaveToNotes) {
                        onSaveToNotes({
                          title: `Translation: ${transSourceText.slice(0, 25)}`,
                          content: transResult.translatedText,
                          category: 'AI Generated',
                        });
                      }
                    }}
                    aria-label="Save translation to notes"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              <p className="text-base text-white font-medium leading-relaxed">
                {transResult.translatedText}
              </p>

              {transResult.pronunciation && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                  <span className="text-cyan-400 font-semibold block mb-0.5">Pronunciation:</span>
                  <span>{transResult.pronunciation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUMMARIZE */}
      {activeTab === 'summarize' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Smart Document & Text Summarizer</span>
            </h3>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-300 shrink-0">Summary Format:</label>
              <select
                value={sumFormat}
                onChange={(e) => setSumFormat(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Bullet-point summary">Bullet-point Summary</option>
                <option value="Short summary">Short & Punchy</option>
                <option value="Detailed summary">Detailed Executive Summary</option>
                <option value="Main ideas">Main Ideas & Core Takeaways</option>
                <option value="Study notes">Study Notes with Key Terms</option>
              </select>
            </div>

            <textarea
              value={sumSourceText}
              onChange={(e) => setSumSourceText(e.target.value)}
              rows={6}
              placeholder="Paste article, meeting notes, essay, or research paper here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleSummarize}
              disabled={sumLoading || !sumSourceText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {sumLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Summarize Text</span>
                </>
              )}
            </button>
          </div>

          {sumResult && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 space-y-3 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Summary Result
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sumResult);
                      setSumCopied(true);
                      setTimeout(() => setSumCopied(false), 2000);
                    }}
                    aria-label="Copy summary"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {sumCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (onSaveToNotes) {
                        onSaveToNotes({
                          title: `Summary: ${sumSourceText.slice(0, 25)}`,
                          content: sumResult,
                          category: 'Study',
                        });
                      }
                    }}
                    aria-label="Save summary to notes"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {sumResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISION AI */}
      {activeTab === 'vision' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Vision & Document Intelligence</span>
            </h3>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            {/* Live Camera View or Upload */}
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-cyan-500/50">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center space-x-3">
                  <button
                    onClick={capturePhoto}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-cyan-400"
                  >
                    Snap Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : visionImageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-64 flex items-center justify-center border border-slate-800">
                <img
                  src={`data:${visionMimeType};base64,${visionImageBase64}`}
                  alt="Vision input"
                  className="max-h-60 object-contain rounded-xl"
                />
                <button
                  onClick={() => setVisionImageBase64(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-xs hover:bg-red-900/80"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  className="p-5 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-400/50 bg-slate-950/60 flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-white transition-all"
                >
                  <Camera className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs font-semibold">Open Camera</span>
                  <span className="text-[10px] text-slate-500">Live snap from device</span>
                </button>

                <label className="p-5 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-400/50 bg-slate-950/60 flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-white transition-all cursor-pointer">
                  <Upload className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-semibold">Upload Image</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, or Screenshot</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* Task selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'describe', label: 'Describe Image' },
                { id: 'ocr', label: 'Extract Text (OCR)' },
                { id: 'screenshot', label: 'Analyze UI / App' },
                { id: 'qa', label: 'Custom Question' },
              ].map((task) => (
                <button
                  key={task.id}
                  onClick={() => setVisionTask(task.id as any)}
                  className={`py-2 px-2 rounded-xl border text-center transition-all ${
                    visionTask === task.id
                      ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {task.label}
                </button>
              ))}
            </div>

            {visionTask === 'qa' && (
              <input
                type="text"
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                placeholder="What would you like to know about this image?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            )}

            <button
              onClick={handleVisionAnalyze}
              disabled={visionLoading || !visionImageBase64}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {visionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Analyze with Gemini Vision</span>
                </>
              )}
            </button>
          </div>

          {visionResult && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 space-y-3 shadow-2xl animate-fadeIn">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Vision Analysis
              </span>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {visionResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANDROID PHONE TOOLS */}
      {activeTab === 'phone' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Android System Bridge & Phone Tools</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              Platform APIs Active
            </span>
          </div>

          {/* Status Feedback Banner */}
          {toolStatusMsg && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{toolStatusMsg}</span>
            </div>
          )}

          {/* Hardware & Diagnostics Card */}
          <div className="grid grid-cols-2 gap-3">
            {/* Battery Tool */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center space-x-1.5">
                  {batteryInfo?.charging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Battery className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>Battery State</span>
                </span>
                <span className="text-white font-mono">{batteryInfo ? `${batteryInfo.level}%` : '85%'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {batteryInfo?.charging ? 'Charging (AC Connected)' : 'Battery Discharging'}
              </p>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                  style={{ width: `${batteryInfo ? batteryInfo.level : 85}%` }}
                />
              </div>
            </div>

            {/* Haptic Vibrate Tool */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <Vibrate className="w-4 h-4 text-purple-400" />
                <span>Haptic Engine</span>
              </div>
              <p className="text-[11px] text-slate-400">Test device vibration pulses</p>
              <button
                onClick={handleHapticTest}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold transition-all active:scale-95"
              >
                Trigger Pulse
              </button>
            </div>
          </div>

          {/* Android Intent Launchers */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Native Android Intents
            </span>

            {/* Phone Dialer Intent */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone Dialer (Intent.ACTION_DIAL)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.CALL_PHONE</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={phoneDialInput}
                  onChange={(e) => setPhoneDialInput(e.target.value)}
                  placeholder="+1 555-0199"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleLaunchDialer}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Dial
                </button>
              </div>
            </div>

            {/* SMS Messenger Intent */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SMS Composer (Intent.ACTION_SENDTO)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.SEND_SMS</span>
              </div>
              <div className="space-y-1.5">
                <input
                  type="tel"
                  value={smsRecipient}
                  onChange={(e) => setSmsRecipient(e.target.value)}
                  placeholder="Recipient phone number"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  placeholder="Draft message body"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleLaunchSms}
                  className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Prepare SMS in Native App
                </button>
              </div>
            </div>

            {/* Share Sheet & System Settings */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSystemShare}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Share Sheet</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(30);
                  setToolStatusMsg('Showing Android System Settings intent guide in developer specs.');
                  window.open('https://support.google.com/android', '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Android Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
