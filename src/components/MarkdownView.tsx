import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockCount = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderFormattedText(textBefore, `text_${lastIndex}`));
    }

    const lang = match[1] || 'code';
    const code = match[2];
    const currentIndex = blockCount;

    parts.push(
      <div key={`code_${match.index}`} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 shadow-md">
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span className="uppercase tracking-wider font-semibold text-cyan-400/90">{lang}</span>
          <button
            onClick={() => copyCode(code, currentIndex)}
            aria-label="Copy code block"
            className="flex items-center space-x-1 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700/80"
          >
            {copiedIndex === currentIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-100 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );

    blockCount++;
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderFormattedText(remainingText, `text_end`));
  }

  return <div className={`space-y-2 leading-relaxed text-sm sm:text-base break-words ${className}`}>{parts}</div>;
};

function renderFormattedText(text: string, keyPrefix: string): React.ReactNode {
  const lines = text.split('\n');

  return (
    <div key={keyPrefix} className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={`${keyPrefix}_line_${idx}`} className="h-1" />;
        }

        // Heading 1
        if (line.startsWith('# ')) {
          return (
            <h2 key={`${keyPrefix}_h1_${idx}`} className="text-lg sm:text-xl font-bold text-white pt-2 pb-1 border-b border-slate-800">
              {formatInlineStyles(line.slice(2))}
            </h2>
          );
        }

        // Heading 2
        if (line.startsWith('## ')) {
          return (
            <h3 key={`${keyPrefix}_h2_${idx}`} className="text-base sm:text-lg font-semibold text-cyan-300 pt-1.5">
              {formatInlineStyles(line.slice(3))}
            </h3>
          );
        }

        // Heading 3
        if (line.startsWith('### ')) {
          return (
            <h4 key={`${keyPrefix}_h3_${idx}`} className="text-sm sm:text-base font-semibold text-sky-200 pt-1">
              {formatInlineStyles(line.slice(4))}
            </h4>
          );
        }

        // Bullet list
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={`${keyPrefix}_bullet_${idx}`} className="flex items-start space-x-2 pl-2">
              <span className="text-cyan-400 font-bold leading-5">•</span>
              <span className="flex-1">{formatInlineStyles(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered list (e.g. 1. 2. 3.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={`${keyPrefix}_num_${idx}`} className="flex items-start space-x-2 pl-2">
              <span className="text-cyan-400 font-medium font-mono text-xs mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1">{formatInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={`${keyPrefix}_quote_${idx}`} className="border-l-2 border-cyan-500/50 pl-3 py-1 my-1 italic text-slate-300 bg-slate-900/40 rounded-r">
              {formatInlineStyles(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Standard line
        return <p key={`${keyPrefix}_p_${idx}`}>{formatInlineStyles(line)}</p>;
      })}
    </div>
  );
}

function formatInlineStyles(text: string): React.ReactNode[] {
  // Parses **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b_${match.index}`} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`c_${match.index}`} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs font-mono border border-slate-700/50">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i_${match.index}`} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}
