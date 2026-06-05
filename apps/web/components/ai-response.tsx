import * as React from 'react';

const tableDividerPattern = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/;

const renderInlineMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const renderCellContent = (cell: string) =>
  cell.split(/\s*<br\s*\/?>\s*/i).map((part, index) => {
    const trimmedPart = part.trim();
    const listText = trimmedPart.replace(/^[•-]\s*/, '');

    if (!trimmedPart) {
      return null;
    }

    if (/^[•-]\s*/.test(trimmedPart)) {
      return (
        <div key={index} className="flex gap-2">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
          <span>{renderInlineMarkdown(listText)}</span>
        </div>
      );
    }

    return <p key={index}>{renderInlineMarkdown(trimmedPart)}</p>;
  });

export function AiResponse({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      elements.push(<div key={index} className="h-3" />);
      continue;
    }

    if (
      trimmedLine.includes('|') &&
      lines[index + 1] &&
      tableDividerPattern.test(lines[index + 1].trim())
    ) {
      const headers = splitTableRow(trimmedLine);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].trim().includes('|')) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      index -= 1;

      elements.push(
        <div key={index} className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className="border bg-muted px-3 py-2 font-medium"
                  >
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border px-3 py-2">
                      <div className="space-y-1">{renderCellContent(cell)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (trimmedLine.startsWith('- ')) {
      elements.push(
        <div key={index} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <p>{renderInlineMarkdown(trimmedLine.slice(2))}</p>
        </div>,
      );
      continue;
    }

    elements.push(<p key={index}>{renderInlineMarkdown(trimmedLine)}</p>);
  }

  return (
    <div
      className={`rounded-lg border bg-muted/40 p-4 text-sm leading-6 ${className}`}
    >
      <div className="space-y-2">{elements}</div>
    </div>
  );
}

