import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  GitBranch,
  Terminal,
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Package,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Capture PWA install prompt if triggered
  React.useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('cd android && ./gradlew assembleDebug');
    triggerHaptic(20);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleTriggerPWAInstall = async () => {
    triggerHaptic(30);
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
      }
    } else {
      alert(
        'To install directly on Android:\n1. Open this URL in Chrome on your Android phone\n2. Tap the menu (⋮) at top right\n3. Tap "Install app" or "Add to Home screen"'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-8 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close APK modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>Android APK Distribution Center</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-2">
            <span>Get AIPAKO AI for Android</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Choose how you want to build, download, or install the Android application on your device.
          </p>
        </div>

        {/* 4 Methods Grid / Cards */}
        <div className="space-y-3.5">
          {/* Method 1: GitHub Actions Auto-Built APK */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/50 to-slate-900 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>1. Automated GitHub Actions Build (Recommended)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Turnkey CI/CD
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever you push to GitHub, our configured workflow (<code className="text-cyan-400">.github/workflows/build.yml</code>) builds the debug APK automatically.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• Go to your GitHub repository <span className="text-cyan-300">"Actions"</span> tab.</div>
              <div>• Select the latest workflow run.</div>
              <div>• Under <span className="text-cyan-300">Artifacts</span>, click <span className="text-emerald-400">"aipako-ai-debug-apk"</span> to download <code className="text-white">app-debug.apk</code>!</div>
            </div>
          </div>

          {/* Method 2: Download Full Android Studio Source Project (ZIP) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>2. Download Android Studio Project (.ZIP)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Ready to Open
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Download the entire pre-packaged Android Studio project containing <code className="text-cyan-400">build.gradle.kts</code>, <code className="text-cyan-400">AndroidManifest.xml</code>, and <code className="text-cyan-400">MainActivity.kt</code>.
            </p>
            <a
              href="/api/download/android-project"
              download="aipako-android-project.zip"
              onClick={() => triggerHaptic(30)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download Android Project Package (.ZIP)</span>
            </a>
          </div>

          {/* Method 3: Instant Android WebAPK / PWA */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>3. Direct Android Home Screen App (WebAPK)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/40">
                Zero Setup
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Install AIPAKO AI instantly to your phone launcher with full-screen experience and hardware camera/mic access.
            </p>
            <button
              onClick={handleTriggerPWAInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>{installSuccess ? 'Installed on Device!' : 'Install to Android Home Screen'}</span>
            </button>
          </div>

          {/* Method 4: Local Gradle Command */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>4. Local Terminal Gradle Build</span>
              </span>
              <button
                onClick={handleCopyCommand}
                aria-label="Copy terminal command"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              cd android &amp;&amp; ./gradlew assembleDebug
            </div>
            <p className="text-[11px] text-slate-400">
              Outputs APK at: <code className="text-slate-300">android/app/build/outputs/apk/debug/app-debug.apk</code>
            </p>
          </div>
        </div>

        {/* Security / Verification footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Target SDK 34 • Android 7.0 to 14+</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
