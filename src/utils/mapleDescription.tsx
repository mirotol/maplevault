import type { ReactNode } from "react";

/**
 * Formats MapleStory description codes into React elements.
 * Handles:
 * - #c: Colored text (orange info text)
 * - #k: End current formatting
 * - #: End current formatting
 * - \n / \r\n / \\n / \\r\\n: New line
 */
export const formatDescription = (text: string | undefined): ReactNode => {
  if (!text) return null;

  // Pre-process all variants of newlines and formatting codes
  const processedText = text
    // Normalize escaped and literal newlines to a single format (\n)
    .replace(/\\\\r\\\\n/g, "\n")
    .replace(/\\\\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    // Handle the |r| pattern seen in some descriptions
    .replace(/\|r\|/g, "\n")
    // Fix n followed by Uppercase (nSuccess, nIf) when not preceded by a letter
    .replace(/(^|[^a-zA-Z])n([A-Z])/g, "$1\n$2")
    // Fix n preceded by punctuation or a digit and followed by any letter (e.g., ",naccuracy", "2nIf")
    .replace(/([.,\d])n([a-zA-Z])/g, "$1\n$2")
    // Fix n before formatting code # (e.g., ".n#c")
    .replace(/n#/g, "\n#")
    // Fix n between lowercase and uppercase (e.g., "TowernSpeed")
    .replace(/([a-z])n([A-Z])/g, "$1\n$2");

  // Split the text by the special codes and literal newlines
  const parts = processedText.split(/(#c|#k|#|\r\n|\n)/g);
  const elements: ReactNode[] = [];
  let isOrange = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part === "#c") {
      isOrange = true;
    } else if (part === "#k" || part === "#") {
      isOrange = false;
    } else if (part === "\n" || part === "\r\n") {
      elements.push(<br key={`br-${i}`} />);
    } else {
      if (isOrange) {
        elements.push(
          <span key={`orange-${i}`} className="text-orange-400">
            {part}
          </span>,
        );
      } else {
        elements.push(<span key={`text-${i}`}>{part}</span>);
      }
    }
  }

  return elements;
};
