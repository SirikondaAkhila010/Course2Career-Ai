import React from 'react';

const boldRegex = /\*\*(.*?)\*\*/g;
const bulletRegex = /^(\*|-)\s+(.*)/;

const parseInlineMarkdown = (text: string) => {
  if (!text) return text;
  
  const parts = text.split(boldRegex);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) {
    return null;
  }

  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-4 text-gray-700 dark:text-base-content">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  text.split('\n').forEach((line, index) => {
    const bulletMatch = line.match(bulletRegex);
    if (bulletMatch) {
      currentList.push(<li key={index}>{parseInlineMarkdown(bulletMatch[2])}</li>);
    } else {
      flushList();
      if (line.trim()) {
        elements.push(<p key={index} className="text-gray-700 dark:text-base-content font-sans">{parseInlineMarkdown(line)}</p>);
      }
    }
  });

  flushList();

  return <div className="space-y-2">{elements}</div>;
};

export default MarkdownRenderer;