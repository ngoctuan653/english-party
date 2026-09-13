import React from 'react';

interface ReadingPassageProps {
  content: string;
  className?: string;
}

/**
 * Parses markdown-style tables and rich text blocks in TOEIC reading passages.
 * Handles table structures, circled answers (e.g. (4), (NP), ⊙, [✓]),
 * bold formatting (**text**), headings (###), and sentence tags [S1].
 */
export const ReadingPassage: React.FC<ReadingPassageProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content into lines
  const lines = content.split('\n');
  const blocks: Array<{ type: 'text' | 'table'; lines: string[] }> = [];

  let currentBlock: { type: 'text' | 'table'; lines: string[] } | null = null;

  const isTableLine = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
  };

  const isTableSeparator = (line: string) => {
    const trimmed = line.trim();
    return /^\|(\s*:?-+:?\s*\|)+$/.test(trimmed);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTbl = isTableLine(line);

    if (isTbl) {
      if (!currentBlock || currentBlock.type !== 'table') {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'table', lines: [line] };
      } else {
        currentBlock.lines.push(line);
      }
    } else {
      if (!currentBlock || currentBlock.type !== 'text') {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'text', lines: [line] };
      } else {
        currentBlock.lines.push(line);
      }
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  // Helper to render cell content with circled/selected badges
  const renderCellContent = (cellText: string) => {
    const trimmed = cellText.trim();
    if (!trimmed) return <span className="text-slate-300">-</span>;

    const isCircled =
      !trimmed.includes('<br') &&
      !trimmed.includes('<BR') &&
      ((trimmed.startsWith('(') && trimmed.endsWith(')')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        trimmed.startsWith('⊙') ||
        trimmed === '✓' ||
        trimmed === '✔');

    if (isCircled) {
      const val = trimmed.replace(/[()\[\]⊙]/g, '').trim();
      return (
        <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full border-2 border-indigo-600 bg-indigo-50 font-black text-indigo-700 text-xs shadow-2xs">
          {val || '✓'}
        </span>
      );
    }

    return parseInlineFormatting(trimmed);
  };

  // Helper to parse line breaks (<br>), bold (**text**), italics (*text*), sentence badges, and text
  const parseInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split by <br>, <br/>, <br /> (case-insensitive)
    const brTokens = text.split(/(<br\s*\/?>)/i);

    return brTokens.map((brToken, brIdx) => {
      if (/^<br\s*\/?>$/i.test(brToken)) {
        return <br key={`br-${brIdx}`} />;
      }

      // Tokenize bold (**text**), italics (*text*), sentence markers [S1], blanks [131]
      const tokens = brToken.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[S\d+\]|\[\d{3}\])/g);
      return (
        <React.Fragment key={`part-${brIdx}`}>
          {tokens.map((token, idx) => {
            if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
              return (
                <strong key={idx} className="font-bold text-slate-900">
                  {token.slice(2, -2)}
                </strong>
              );
            }
            if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
              return (
                <em key={idx} className="italic text-slate-600">
                  {token.slice(1, -1)}
                </em>
              );
            }
            if (/^\[S\d+\]$/.test(token)) {
              return (
                <span
                  key={idx}
                  className="inline-block mx-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100/80 text-indigo-700 select-none align-middle"
                >
                  {token.replace(/[\[\]]/g, '')}
                </span>
              );
            }
            if (/^\[\d{3}\]$/.test(token)) {
              return (
                <span
                  key={idx}
                  className="inline-block mx-1 px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs shadow-2xs"
                >
                  {token}
                </span>
              );
            }
            return <React.Fragment key={idx}>{token}</React.Fragment>;
          })}
        </React.Fragment>
      );
    });
  };

  // Render a paragraph or heading line
  const renderLine = (line: string, lIdx: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={lIdx} className="h-2" />;

    if (trimmed === '---' || trimmed === '***') {
      return <hr key={lIdx} className="my-3 border-slate-200" />;
    }

    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={lIdx} className="text-lg font-black text-slate-900 tracking-tight mt-3 mb-1">
          {parseInlineFormatting(trimmed.slice(2))}
        </h2>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={lIdx} className="text-base font-bold text-slate-800 tracking-tight mt-2.5 mb-1">
          {parseInlineFormatting(trimmed.slice(3))}
        </h3>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={lIdx} className="text-sm font-bold uppercase tracking-wider text-indigo-700 mt-3 mb-1">
          {parseInlineFormatting(trimmed.slice(4))}
        </h4>
      );
    }

    return (
      <p key={lIdx} className="leading-relaxed text-slate-700">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  };

  return (
    <div className={`space-y-2.5 font-sans text-slate-800 ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          // Parse table rows
          const rawRows = block.lines
            .map((l) => l.trim())
            .filter((l) => !isTableSeparator(l));

          if (rawRows.length === 0) return null;

          const headerCells = rawRows[0]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

          const bodyRows = rawRows.slice(1).map((r) =>
            r
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

          return (
            <div key={bIdx} className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs my-3">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-700 font-bold">
                    {headerCells.map((cell, cIdx) => (
                      <th
                        key={cIdx}
                        className={`px-3 py-2.5 sm:px-4 sm:py-3 border-r border-slate-200 last:border-r-0 ${
                          cIdx > 0 ? 'text-center' : ''
                        }`}
                      >
                        {cell ? parseInlineFormatting(cell) : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? 'bg-white hover:bg-indigo-50/20' : 'bg-slate-50/60 hover:bg-indigo-50/20'}
                    >
                      {row.map((cell, cIdx) => {
                        const hasBr = cell.includes('<br') || cell.includes('<BR');
                        return (
                          <td
                            key={cIdx}
                            className={`px-3 py-2.5 sm:px-4 sm:py-3 border-r border-slate-100 last:border-r-0 leading-relaxed align-middle ${
                              cIdx > 0 && !hasBr
                                ? 'text-center font-medium'
                                : 'text-left font-normal text-slate-800'
                            }`}
                          >
                            {renderCellContent(cell)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Text block: render each line with appropriate spacing & styles
        return (
          <div key={bIdx} className="space-y-1">
            {block.lines.map((line, lIdx) => renderLine(line, lIdx))}
          </div>
        );
      })}
    </div>
  );
};
export default ReadingPassage;
