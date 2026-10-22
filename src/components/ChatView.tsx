import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Volume2,
  Square,
  AlertCircle,
  Sparkles,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { Conversation, ChatMessage } from '../types/index.ts';
import { MarkdownView } from './MarkdownView.tsx';
import { addMessageToConversation, pruneConversationForContext } from '../utils/chatManager.ts';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface ChatViewProps {
  conversation: Conversation;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onUpdateConversation: (updated: Conversation) => void;
  onOpenVoice: () => void;
  preferredLanguage?: string;
  voiceName?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  conversations,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onUpdateConversation,
  onOpenVoice,
  preferredLanguage = 'English',
  voiceName = 'Kore',
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showConvList, setShowConvList] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isGenerating]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content && !attachedImage) return;

    triggerHaptic(40);
    setInputText('');
    const currentAttached = attachedImage;
    setAttachedImage(null);

    // Add user message to conversation
    const updatedWithUser = addMessageToConversation(conversation, 'user', content, {
      image: currentAttached
        ? {
            data: currentAttached.data,
            mimeType: currentAttached.mimeType,
            previewUrl: currentAttached.previewUrl,
          }
        : undefined,
    });
    onUpdateConversation(updatedWithUser);

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      // Build context for API
      const contextMessages = pruneConversationForContext(updatedWithUser.messages, 10);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: contextMessages,
          preferredLanguage,
          image: currentAttached
            ? {
                data: currentAttached.data,
                mimeType: currentAttached.mimeType,
              }
            : undefined,
        }),
      });

      const data = await response.json();
      setIsGenerating(false);

      if (data.reply) {
        const finalConv = addMessageToConversation(updatedWithUser, 'assistant', data.reply);
        onUpdateConversation(finalConv);
      } else {
        const errConv = addMessageToConversation(
          updatedWithUser,
          'assistant',
          data.error || 'Failed to reach AIPAKO Gemini core.',
          { error: true }
        );
        onUpdateConversation(errConv);
      }
    } catch (err: any) {
      setIsGenerating(false);
      if (err.name === 'AbortError') return;

      const errConv = addMessageToConversation(
        updatedWithUser,
        'assistant',
        'Network error: unable to reach Gemini model.',
        { error: true }
      );
      onUpdateConversation(errConv);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      triggerHaptic(30);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setAttachedImage({
        data: base64,
        mimeType: file.type || 'image/jpeg',
        previewUrl: result,
      });
      triggerHaptic(20);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic(20);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const playSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] bg-slate-950/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      {/* Top Conversation Header */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={() => setShowConvList(!showConvList)}
            aria-label="Toggle conversations list"
            className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <span>Chats ({conversations.length})</span>
          </button>

          <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {conversation.title}
          </h3>
        </div>

        <button
          onClick={onNewConversation}
          aria-label="Start new chat"
          className="p-1.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 transition-colors"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slide-out Conversations Drawer */}
      {showConvList && (
        <div className="absolute inset-x-0 top-12 z-20 bg-slate-900/95 border-b border-slate-800 p-4 shadow-2xl max-h-72 overflow-y-auto space-y-2 animate-fadeIn backdrop-blur-md">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
              Recent Conversations
            </span>
            <button
              onClick={() => setShowConvList(false)}
              className="text-xs text-cyan-400 hover:underline"
            >
              Close
            </button>
          </div>

          {conversations.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                c.id === conversation.id
                  ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {editingTitleId === c.id ? (
                <div className="flex items-center space-x-2 flex-1 mr-2">
                  <input
                    type="text"
                    value={editTitleText}
                    onChange={(e) => setEditTitleText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (editTitleText.trim()) onRenameConversation(c.id, editTitleText.trim());
                      setEditingTitleId(null);
                    }}
                    className="text-xs text-emerald-400 font-bold px-2 py-1"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSelectConversation(c.id);
                    setShowConvList(false);
                  }}
                  className="text-xs font-medium truncate text-left flex-1"
                >
                  {c.title}
                </button>
              )}

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingTitleId(c.id);
                    setEditTitleText(c.title);
                  }}
                  className="p-1 text-slate-500 hover:text-slate-300"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {conversations.length > 1 && (
                  <button
                    onClick={() => onDeleteConversation(c.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {conversation.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-lg ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.error
                    ? 'bg-red-950/60 border border-red-800/60 text-red-200 rounded-tl-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Optional Attached Image preview */}
                {msg.image?.previewUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-48">
                    <img
                      src={msg.image.previewUrl}
                      alt="Uploaded attachment"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* Message Text with Markdown */}
                <MarkdownView content={msg.content} />

                {/* Message Bottom Toolbar */}
                <div
                  className={`flex items-center justify-between pt-1.5 mt-1 border-t text-[10px] ${
                    isUser ? 'border-blue-500/40 text-blue-200' : 'border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center space-x-1.5">
                      {msg.error && (
                        <button
                          onClick={() => {
                            // Find previous user message
                            const idx = conversation.messages.findIndex((m) => m.id === msg.id);
                            const prevUserMsg = conversation.messages.slice(0, idx).reverse().find((m) => m.role === 'user');
                            if (prevUserMsg) {
                              handleSendMessage(prevUserMsg.content);
                            }
                          }}
                          aria-label="Retry generating response"
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                      <button
                        onClick={() => playSpeech(msg.content)}
                        aria-label="Speak message"
                        className="hover:text-cyan-400 transition-colors p-0.5"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        aria-label="Copy message"
                        className="hover:text-cyan-400 transition-colors p-0.5"
                        title="Copy"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono p-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AIPAKO is thinking & streaming response...</span>
            <button
              onClick={handleStopGeneration}
              className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <Square className="w-3 h-3 text-red-400 fill-red-400" />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Tag before sending */}
      {attachedImage && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300">Image attached (ready for analysis)</span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-xs text-slate-400 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      )}

      {/* Bottom Input Field */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach photo or image"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Upload image"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenVoice}
          aria-label="Open voice mode"
          className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 transition-colors"
          title="Voice Assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask AIPAKO anything..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() && !attachedImage}
          aria-label="Send message"
          className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
