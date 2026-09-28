import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, X, BookOpen } from 'lucide-react';
import { speakJapanese } from '../services/audioService';

export const QuickPreviewModal: React.FC = () => {
  const { selectedWord, setSelectedWord, setDetailWord, setScreen, setMaziiQuery } = useApp();

  if (!selectedWord) return null;

  const handleSpeech = (text: string) => {
    speakJapanese(text);
  };

  const handleOpenDetail = () => {
    setDetailWord(selectedWord);
    setSelectedWord(null);
    setScreen('word_detail');
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) setSelectedWord(null); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] cursor-default">
        {/* Header Block */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-5 relative">
          <button
            onClick={() => setSelectedWord(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between pr-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-japanese flex items-center gap-3">
                <span>{selectedWord.word}</span>
                <button
                  onClick={() => handleSpeech(selectedWord.word)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition active:scale-95"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </h2>
              <p className="text-lg text-blue-100 font-medium mt-0.5 font-japanese">
                「{selectedWord.reading}」
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 divide-y divide-gray-100">
          {/* Hán Việt & Meaning */}
          <div className="pt-2">
            {selectedWord.han_viet && (
              <div className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-md uppercase tracking-wider mb-2 border border-amber-200">
                [{selectedWord.han_viet}]
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                {selectedWord.word_type || 'Từ vựng'}
              </span>
            </div>
            <p className="text-base text-gray-800 font-medium leading-relaxed">
              {selectedWord.meaning}
            </p>
          </div>

          {/* Examples Block */}
          {selectedWord.examples && selectedWord.examples.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Câu ví dụ ({selectedWord.examples.length})</span>
              </h4>

              <div className="space-y-3">
                {selectedWord.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-medium text-gray-900 font-japanese leading-snug">
                        {ex.ja}
                      </p>
                      <button
                        onClick={() => handleSpeech(ex.ja)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition flex-shrink-0"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {ex.reading && (
                      <p className="text-xs text-gray-500 font-japanese">
                        {ex.reading}
                      </p>
                    )}

                    <p className="text-sm text-gray-700 italic border-l-2 border-primary/40 pl-2 mt-1">
                      {ex.vi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setMaziiQuery(selectedWord.word);
            }}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Xem Chi Tiết (Mazii)</span>
          </button>
          <button
            onClick={() => setSelectedWord(null)}
            className="px-5 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
