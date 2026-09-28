import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';

export const TextSelectionListener: React.FC = () => {
  const { setMaziiQuery } = useApp();
  const [selectedText, setSelectedText] = useState<string>('');
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText('');
        setCoords(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0) {
        setSelectedText(text);
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setCoords({
            x: Math.min(window.innerWidth - 120, Math.max(10, rect.left + rect.width / 2 - 50)),
            y: Math.max(10, rect.top - 45),
          });
        } catch (e) {
          setCoords(null);
        }
      } else {
        setSelectedText('');
        setCoords(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  if (!selectedText || !coords) return null;

  return (
    <div
      style={{ top: `${coords.y}px`, left: `${coords.x}px` }}
      className="fixed z-50 animate-in fade-in zoom-in-90 duration-150"
    >
      <button
        onClick={() => {
          setMaziiQuery(selectedText);
          setSelectedText('');
          setCoords(null);
          window.getSelection()?.removeAllRanges();
        }}
        className="px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 border border-white/30 hover:bg-blue-600 transition active:scale-95"
      >
        <Search className="w-3.5 h-3.5 text-amber-300" />
        <span>Tra từ Mazii</span>
      </button>
    </div>
  );
};
