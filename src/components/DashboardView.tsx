import React, { useState } from 'react';
import {
  MessageSquare,
  Mic,
  PenTool,
  Languages,
  FileText,
  Lightbulb,
  GraduationCap,
  Sparkles,
  Bookmark,
  Smartphone,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { AiOrb } from './AiOrb.tsx';
import { UserProfile } from '../types/index.ts';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (tab: 'home' | 'chats' | 'create' | 'tools' | 'profile', subTab?: string) => void;
  onStartChatWithPrompt: (prompt: string) => void;
  onOpenVoice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onStartChatWithPrompt,
  onOpenVoice,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    triggerHaptic(40);
    onStartChatWithPrompt(quickPrompt.trim());
    setQuickPrompt('');
  };

  const ACTION_CARDS = [
    {
      id: 'ask_ai',
      title: 'Ask AI',
      desc: 'Ask complex questions, get code & explanations',
      icon: MessageSquare,
      color: 'from-blue-600 to-cyan-500',
      action: () => onNavigate('chats'),
    },
    {
      id: 'voice_assistant',
      title: 'Voice Assistant',
      desc: 'Real-time spoken conversation & TTS',
      icon: Mic,
      color: 'from-cyan-500 to-teal-400',
      action: () => onOpenVoice(),
    },
    {
      id: 'write_for_me',
      title: 'Write for Me',
      desc: 'Emails, stories, documents & social posts',
      icon: PenTool,
      color: 'from-purple-600 to-blue-500',
      action: () => onNavigate('create'),
    },
    {
      id: 'translate',
      title: 'Translate',
      desc: 'Accurate translations across 15+ languages',
      icon: Languages,
      color: 'from-emerald-500 to-cyan-500',
      action: () => onNavigate('tools', 'translate'),
    },
    {
      id: 'summarize',
      title: 'Summarize',
      desc: 'Distill articles, PDFs & text into key points',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      action: () => onNavigate('tools', 'summarize'),
    },
    {
      id: 'explain_anything',
      title: 'Explain Anything',
      desc: 'Break down complex topics into simple words',
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-500',
      action: () => onStartChatWithPrompt('Explain quantum computing and superposition in simple terms with everyday analogies.'),
    },
    {
      id: 'study_assistant',
      title: 'Study Assistant',
      desc: 'Interactive quiz master, math & exam prep',
      icon: GraduationCap,
      color: 'from-indigo-500 to-purple-600',
      action: () => onStartChatWithPrompt('Act as my interactive study coach. Quiz me on modern software architecture and system design concepts.'),
    },
    {
      id: 'creative_writer',
      title: 'Creative Writer',
      desc: 'Brainstorm plots, sci-fi scripts & lyrics',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500',
      action: () => onNavigate('create'),
    },
    {
      id: 'notes_and_tasks',
      title: 'Notes and Tasks',
      desc: 'Organize private notes, tasks & reminders',
      icon: Bookmark,
      color: 'from-teal-500 to-emerald-600',
      action: () => onNavigate('tools', 'productivity'),
    },
    {
      id: 'phone_tools',
      title: 'Phone Tools',
      desc: 'Dialer, SMS, Camera, Battery & Intents',
      icon: Smartphone,
      color: 'from-blue-700 to-cyan-600',
      action: () => onNavigate('tools', 'phone'),
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Greeting Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            {getGreeting()}
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {user.name}
          </h2>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          aria-label="View user profile"
          className="p-1 rounded-2xl border border-slate-800 bg-slate-900 hover:border-cyan-500/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-base font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>

      {/* Main AI Orb Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent border border-slate-800/80 p-6 flex flex-col items-center text-center shadow-xl overflow-hidden">
        {/* Subtle ambient light */}
        <div className="absolute -top-12 inset-x-0 mx-auto w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <AiOrb size="lg" state="idle" onClick={onOpenVoice} className="mb-4" />

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Hello! I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AIPAKO</span>.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs">
            How can I help you today? Ask questions, write, translate, or use phone tools.
          </p>
        </div>

        {/* Large Conversational Input */}
        <form onSubmit={handleQuickSubmit} className="w-full max-w-md relative">
          <input
            type="text"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="Ask anything or type a prompt..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-4 pr-24 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner transition-colors"
          />

          <div className="absolute right-2 top-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={onOpenVoice}
              aria-label="Open voice input"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              aria-label="Send prompt"
              className="p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 10 Quick Action Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Quick Assistant Capabilities</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            10 Tools Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  triggerHaptic(30);
                  card.action();
                }}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all text-left group shadow-lg flex flex-col justify-between min-h-[105px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shadow-cyan-500/10`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
