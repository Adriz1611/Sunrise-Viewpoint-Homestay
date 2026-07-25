import type { ReactNode } from "react";

/**
 * Section titles are plain text in Payload, where *asterisks* mark the word
 * rendered in the celadon accent — e.g. "All of them face *east*." This keeps
 * one italic word from requiring a whole rich-text editor.
 */
export function renderEmphasis(text: string): ReactNode {
  const pattern = /\*([^*]+)\*/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <em key={match.index} className="text-celadon">
        {match[1]}
      </em>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
