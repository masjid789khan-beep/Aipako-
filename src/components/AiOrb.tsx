import React from 'react';

interface AiOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  onClick?: () => void;
  className?: string;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  size = 'md',
  state = 'idle',
  onClick,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56',
  };

  const glowColors = {
    idle: 'from-blue-600/30 via-cyan-500/20 to-transparent',
    listening: 'from-cyan-400/50 via-teal-400/30 to-blue-600/20',
    thinking: 'from-purple-600/40 via-blue-500/30 to-cyan-400/20',
    speaking: 'from-emerald-400/40 via-cyan-400/40 to-blue-600/30',
  };

  const coreColors = {
    idle: 'from-blue-500 via-cyan-400 to-indigo-600',
    listening: 'from-cyan-300 via-sky-400 to-teal-500',
    thinking: 'from-indigo-500 via-purple-400 to-cyan-400',
    speaking: 'from-teal-300 via-cyan-400 to-blue-500',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`AIPAKO AI Orb (${state} state)`}
      className={`relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 ${
        onClick ? 'hover:scale-105 active:scale-95' : ''
      } ${sizeMap[size]} ${className}`}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full bg-radial ${glowColors[state]} blur-xl animate-orb-pulse pointer-events-none`}
        style={{
          transform: 'scale(1.4)',
        }}
      />

      {/* Outer energy rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-orb-spin pointer-events-none" />
      <div
        className="absolute inset-1 rounded-full border border-dashed border-blue-400/20 animate-orb-spin pointer-events-none"
        style={{ animationDirection: 'reverse', animationDuration: '28s' }}
      />

      {/* Dynamic sound ripple rings when listening or speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <div className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
          <div
            className="absolute -inset-4 rounded-full border border-blue-500/30 animate-pulse pointer-events-none"
            style={{ animationDuration: '1.2s' }}
          />
        </>
      )}

      {/* Core sphere with fluid gradient */}
      <div
        className={`relative w-4/5 h-4/5 rounded-full bg-gradient-to-tr ${coreColors[state]} shadow-2xl flex items-center justify-center overflow-hidden animate-orb-float`}
        style={{
          boxShadow: '0 0 35px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Inner highlights and optical refraction */}
        <div className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full bg-white/40 blur-[1px]" />
        <div className="absolute bottom-2 right-2 w-1/4 h-1/4 rounded-full bg-blue-900/60 blur-[2px]" />

        {/* Central neural nodes */}
        <div className="relative z-10 flex items-center justify-center space-x-1">
          {state === 'thinking' ? (
            <div className="flex space-x-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : state === 'listening' || state === 'speaking' ? (
            <div className="flex items-center space-x-0.5 h-6">
              <div className="w-1 bg-white/90 rounded-full animate-pulse h-3" />
              <div className="w-1 bg-white rounded-full animate-pulse h-5" style={{ animationDelay: '100ms' }} />
              <div className="w-1 bg-white/90 rounded-full animate-pulse h-6" style={{ animationDelay: '200ms' }} />
              <div className="w-1 bg-white rounded-full animate-pulse h-4" style={{ animationDelay: '300ms' }} />
              <div className="w-1 bg-white/80 rounded-full animate-pulse h-2" style={{ animationDelay: '400ms' }} />
            </div>
          ) : (
            <div className="w-3 h-3 rounded-full bg-white/90 shadow-sm shadow-white animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
