import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Share2,
  BookmarkPlus,
  RefreshCw,
  Mail,
  FileText,
  MessageSquare,
  BookOpen,
  Share,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { triggerHaptic } from '../utils/phoneBridge.ts';
import { Note } from '../types/index.ts';

interface WritingStudioProps {
  onSaveToNotes: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  preferredLanguage?: string;
}

const TEMPLATES = [
  { id: 'email', label: 'Email', icon: Mail, desc: 'Professional emails, pitches & follow-ups' },
  { id: 'message', label: 'Message', icon: MessageSquare, desc: 'Friendly SMS, Slack & chat messages' },
  { id: 'social', label: 'Social Post', icon: Share, desc: 'X/Twitter, LinkedIn & Instagram copy' },
  { id: 'document', label: 'Document', icon: FileText, desc: 'Proposals, executive summaries & reports' },
  { id: 'story', label: 'Story / Script', icon: BookOpen, desc: 'Creative fiction, scripts & narrative plots' },
  { id: 'rewrite', label: 'Tone Rewriter', icon: Sliders, desc: 'Polishing grammar, tone & clarity' },
];

export const WritingStudio: React.FC<WritingStudioProps> = ({
  onSaveToNotes,
  preferredLanguage = 'English',
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('email');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [audience, setAudience] = useState('Colleagues / Clients');
  const [language, setLanguage] = useState(preferredLanguage);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    triggerHaptic(50);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTemplate,
          topic,
          style,
          length,
          audience,
          language,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.content) {
        setGeneratedContent(data.content);
        setIsEditing(false);
      } else {
        setErrorMessage(data.error || 'Failed to generate content. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Network error occurred while generating.');
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    triggerHaptic(30);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!generatedContent) return;
    triggerHaptic(30);
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `AIPAKO AI: ${selectedTemplate.toUpperCase()} Output`,
          text: generatedContent,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleSave = () => {
    if (!generatedContent) return;
    triggerHaptic(40);
    onSaveToNotes({
      title: `${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}: ${topic.slice(0, 30)}`,
      content: generatedContent,
      category: 'AI Generated',
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Banner */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <PenTool className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">AI Writing Studio</h2>
          </div>
          <p className="text-xs text-slate-400">
            Compose high-impact messages, emails, creative stories, and documents with AIPAKO AI.
          </p>
        </div>
      </div>

      {/* Template Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplate(tmpl.id);
                triggerHaptic(20);
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-900/60 to-cyan-950/60 border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {tmpl.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{tmpl.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Configuration & Input Form */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            What would you like AIPAKO to write?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder={
              selectedTemplate === 'email'
                ? 'E.g., Polite follow-up email to client regarding contract review and schedule for next Tuesday.'
                : selectedTemplate === 'rewrite'
                ? 'Paste the text you want polished, simplified, or adjusted...'
                : 'E.g., Compelling introduction for a new smart fitness app, highlighting privacy and AI coaching.'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Writing Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Professional">Professional</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
              <option value="Creative & Engaging">Creative & Engaging</option>
              <option value="Persuasive & Bold">Persuasive & Bold</option>
              <option value="Academic & Detailed">Academic & Detailed</option>
              <option value="Concise & Direct">Concise & Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Short & Punchy">Short & Punchy (1-2 paragraphs)</option>
              <option value="Medium">Medium (3-4 paragraphs)</option>
              <option value="In-depth & Comprehensive">In-depth & Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="E.g. Clients, Team, General Public"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Response Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Arabic">Arabic (العربية)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          aria-label="Generate content with AI"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating with AIPAKO AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Content</span>
            </>
          )}
        </button>

        {errorMessage && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 p-2.5 rounded-xl">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Output Studio Section */}
      {generatedContent && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Generated Result
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                {isEditing ? 'Done Editing' : 'Edit'}
              </button>
              <button
                onClick={handleCopy}
                aria-label="Copy output"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                aria-label="Share output"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                aria-label="Save to notes"
                className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50 transition-colors"
                title="Save to Notes"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleGenerate}
                aria-label="Regenerate"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {savedNotification && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to your AIPAKO Notes!</span>
            </div>
          )}

          {isEditing ? (
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={10}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-cyan-400"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {generatedContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
