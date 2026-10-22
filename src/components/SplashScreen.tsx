import React, { useEffect, useState } from 'react';
import { AiOrb } from './AiOrb.tsx';
import { Sparkles, Shield, Cpu } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [stage, setStage] = useState('Initializing AIPAKO Neural Core...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStage('Connecting to Gemini Intelligence & Android Bridge...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStage('Restoring Local Encryption & Preferences...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage('Welcome to AIPAKO AI.');
    }, 1350);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14] flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top micro badges */}
      <div className="w-full flex items-center justify-between pt-4 max-w-md text-xs text-slate-500 font-mono">
        <span className="flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>v2.5_MOBILE_PRO</span>
        </span>
        <span className="flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>SECURE_SANDBOX</span>
        </span>
      </div>

      {/* Center Branding & Orb */}
      <div className="flex flex-col items-center justify-center space-y-6 my-auto text-center">
        <AiOrb size="lg" state="thinking" />

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Smart Personal Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            AIPAKO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xs mx-auto">
            Your Smart World, Powered by AI
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Stage */}
      <div className="w-full max-w-xs space-y-3 pb-8 text-center">
        <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-mono text-cyan-400/90 animate-pulse">{stage}</p>

        <button
          onClick={onComplete}
          aria-label="Skip initialization splash"
          className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors pt-2 block mx-auto"
        >
          Tap to enter directly
        </button>
      </div>
    </div>
  );
};
