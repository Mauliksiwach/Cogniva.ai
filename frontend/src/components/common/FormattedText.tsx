import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, safe Markdown renderer component that transforms raw markdown
 * (### headers, **bold**, *italics*, blockquotes, lists, code snippets)
 * into rich, beautifully styled React elements matching ChatGPT & Gemini UI.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines for structured block processing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushBlockquote = (keyIndex: number) => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <div
          key={`bq_${keyIndex}`}
          className="my-3 p-3.5 rounded-xl bg-slate-950/80 border-l-4 border-brand-500 text-slate-300 text-xs leading-relaxed font-sans shadow-inner italic"
        >
          {blockquoteLines.map((bLine, bIdx) => (
            <p key={bIdx}>{renderInlineMarkdown(bLine)}</p>
          ))}
        </div>
      );
      blockquoteLines = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for blockquote line
    if (trimmed.startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s*/, ''));
      return;
    } else if (inBlockquote) {
      inBlockquote = false;
      flushBlockquote(idx);
    }

    // Empty line -> spacing
    if (!trimmed) {
      elements.push(<div key={`sp_${idx}`} className="h-2" />);
      return;
    }

    // Headers (### Header or ## Header)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3_${idx}`}
          className="text-sm font-bold text-brand-300 tracking-tight mt-3 mb-1.5 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h2_${idx}`}
          className="text-base font-extrabold text-white tracking-tight mt-4 mb-2 pb-1 border-b border-slate-800"
        >
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1_${idx}`}
          className="text-lg font-black text-white tracking-tight mt-4 mb-2"
        >
          {renderInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
        </h2>
      );
      return;
    }

    // Numbered Lists (1. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num_${idx}`} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-200">
          <span className="w-5 h-5 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed">{renderInlineMarkdown(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet Lists (• or - or *)
    const bulletMatch = trimmed.match(/^([•\-\*])\s+(.*)/);
    if (bulletMatch) {
      elements.push(
        <div key={`bul_${idx}`} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2 ml-1" />
          <div className="flex-1 leading-relaxed">{renderInlineMarkdown(bulletMatch[2])}</div>
        </div>
      );
      return;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p_${idx}`} className="my-1.5 text-xs text-slate-200 leading-relaxed font-sans">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  // Flush any trailing blockquote
  if (blockquoteLines.length > 0) {
    flushBlockquote(lines.length);
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};

/** Render inline Markdown elements: **bold**, *italic*, `code` */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex tokenizer for **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('**')) {
      // Bold
      parts.push(
        <strong key={`b_${match.index}`} className="font-bold text-white">
          {match[2]}
        </strong>
      );
    } else if (fullMatch.startsWith('`')) {
      // Inline Code
      parts.push(
        <code
          key={`c_${match.index}`}
          className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-brand-300 font-mono text-[11px]"
        >
          {match[4]}
        </code>
      );
    } else if (fullMatch.startsWith('*')) {
      // Italic
      parts.push(
        <em key={`i_${match.index}`} className="italic text-slate-300">
          {match[3]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
