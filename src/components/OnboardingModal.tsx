import React, { useState } from 'react';
import { Bot, Mic, PenTool, Smartphone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingModalProps {
  onFinish: () => void;
}

const ONBOARDING_SLIDES = [
  {
    icon: Bot,
    badge: 'Meet Your AI',
    title: 'Welcome to AIPAKO AI',
    description:
      'Your next-generation personal assistant designed for fluid conversation, question answering, creative generation, and daily productivity.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Mic,
    badge: 'Voice Assistant',
    title: 'Talk to AIPAKO Using Voice',
    description:
      'Seamless real-time speech recognition and lifelike neural voice synthesis. Have natural two-way spoken dialogues on the go.',
    color: 'from-cyan-400 to-teal-400',
  },
  {
    icon: PenTool,
    badge: 'Creative & Writing Studio',
    title: 'Write, Summarize & Translate',
    description:
      'Craft professional emails, stories, social posts, study guides, and instant translations across 15+ languages with precision.',
    color: 'from-purple-500 to-blue-500',
  },
  {
    icon: Smartphone,
    badge: 'Android Phone Tools',
    title: 'System & Device Integrations',
    description:
      'Dial numbers, trigger SMS drafts, query battery status, inspect camera views, and share content through supported Android system intents.',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    icon: ShieldCheck,
    badge: 'Privacy & Ownership',
    title: 'Your Data Stays Yours',
    description:
      'Private offline notes, secure session authentication, granular permission prompts, and complete data export control.',
    color: 'from-emerald-400 to-cyan-500',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[500px]">
        {/* Header with Skip */}
        <div className="flex items-center justify-between pb-4">
          <span className="text-xs font-mono text-cyan-400/90 font-semibold tracking-wider uppercase">
            Step {currentSlide + 1} of {ONBOARDING_SLIDES.length}
          </span>
          <button
            onClick={onFinish}
            aria-label="Skip onboarding walkthrough"
            className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Center Card Content */}
        <div className="flex flex-col items-center text-center my-auto space-y-6 px-2">
          {/* Icon Badge */}
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${slide.color} flex items-center justify-center shadow-lg shadow-cyan-500/20`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-400/30 to-blue-500/30 blur-md -z-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-300 text-xs font-semibold">
              {slide.badge}
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">{slide.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">{slide.description}</p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          {/* Dots Indicator */}
          <div className="flex justify-center items-center space-x-2">
            {ONBOARDING_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-7 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {currentSlide > 0 && (
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="p-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={nextSlide}
              aria-label={currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next slide'}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <span>{currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
