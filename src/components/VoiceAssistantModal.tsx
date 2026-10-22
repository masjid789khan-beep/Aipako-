import React, { useState, useEffect, useRef } from 'react';
import { AiOrb } from './AiOrb.tsx';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, RotateCcw, X, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (text: string) => void;
  preferredLanguage?: string;
  voiceName?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  preferredLanguage = 'English',
  voiceName = 'Kore',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [statusText, setStatusText] = useState('Tap microphone to start speaking');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = preferredLanguage === 'Urdu' ? 'ur-PK' : preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setStatusText('Listening... Speak now');
          setPermissionError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setPermissionError('Microphone permission was denied. Please allow microphone access in browser settings.');
            setStatusText('Microphone access blocked');
          } else {
            setStatusText('Could not catch that. Tap microphone to retry.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioPlayback();
    };
  }, [preferredLanguage]);

  if (!isOpen) return null;

  const toggleListening = () => {
    triggerHaptic(60);
    stopAudioPlayback();

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setStatusText('Listening stopped');
    } else {
      setTranscript('');
      setAiResponse('');
      setPermissionError(null);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('SpeechRecognition start error:', e);
        }
      } else {
        // Fallback simulation for unsupported browsers/environments
        setStatusText('Speech recognition not supported in this browser. Please use text fallback.');
      }
    }
  };

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    triggerHaptic(40);
    setIsThinking(true);
    setStatusText('AIPAKO is thinking...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: queryText }],
          preferredLanguage,
        }),
      });

      const data = await response.json();
      setIsThinking(false);

      if (data.reply) {
        setAiResponse(data.reply);
        setStatusText('AIPAKO Responded');
        if (!isMuted) {
          playSpeech(data.reply);
        }
      } else {
        setStatusText(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      setIsThinking(false);
      setStatusText('Network connection error');
    }
  };

  const playSpeech = async (text: string) => {
    stopAudioPlayback();
    setIsSpeaking(true);

    try {
      // Try server Gemini TTS first
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 300),
          voiceName: voiceName || 'Kore',
        }),
      });

      const ttsData = await ttsRes.json();
      if (ttsData.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${ttsData.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audio.play();
        return;
      }
    } catch {}

    // Fallback to Web SpeechSynthesis
    fallbackSpeechSynthesis(text);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const currentOrbState = isListening
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14]/95 backdrop-blur-2xl flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        <button
          onClick={onClose}
          aria-label="Close voice assistant"
          className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Voice Mode</h2>
          <p className="text-xs text-cyan-400 font-mono">{statusText}</p>
        </div>

        <button
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            if (next) stopAudioPlayback();
          }}
          aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          className={`p-2.5 rounded-full border transition-colors ${
            isMuted
              ? 'bg-rose-950/60 border-rose-800 text-rose-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Center Interactive Orb & Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 w-full max-w-md mx-auto">
        <AiOrb size="xl" state={currentOrbState} onClick={toggleListening} />

        {/* Audio Frequency Bars (when listening or speaking) */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center space-x-1.5 h-12 px-6 py-2 rounded-2xl bg-slate-900/80 border border-cyan-500/20">
            {[40, 70, 95, 60, 85, 100, 50, 75, 90, 65, 45].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-600/30 text-amber-200 text-xs flex items-center space-x-2.5 max-w-sm">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Spoken Transcript Bubble */}
        {transcript && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-1">
              You Spoke:
            </span>
            <p className="text-sm text-slate-200">{transcript}</p>
            {!isListening && (
              <button
                onClick={() => handleSendQuery(transcript)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
              >
                Ask AIPAKO
              </button>
            )}
          </div>
        )}

        {/* AI Response Bubble */}
        {aiResponse && (
          <div className="w-full bg-gradient-to-br from-cyan-950/40 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 text-left max-h-48 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                AIPAKO Response:
              </span>
              <button
                onClick={() => playSpeech(aiResponse)}
                aria-label="Replay audio"
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Quick Suggestion chips */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-1 text-xs">
          {['"What is quantum computing?"', '"Summarize my day"', '"Translate to Spanish"'].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(prompt.replace(/"/g, ''));
                handleSendQuery(prompt.replace(/"/g, ''));
              }}
              className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-xs whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-around pt-2">
          {/* Switch to Text Chat */}
          <button
            onClick={() => {
              if (transcript) onSendToChat(transcript);
              onClose();
            }}
            aria-label="Switch to text chat"
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-white"
          >
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Text Chat</span>
          </button>

          {/* Main Giant Mic Toggle */}
          <button
            onClick={toggleListening}
            aria-label={isListening ? 'Stop recording voice' : 'Start recording voice'}
            className={`p-6 rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/40 animate-pulse'
                : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-cyan-500/30 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              stopAudioPlayback();
              setTranscript('');
              setAiResponse('');
              setStatusText('Ready');
            }}
            aria-label="Clear speech transcript"
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-white"
          >
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
