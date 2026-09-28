import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, ChevronRight, BookOpen, ExternalLink, Search } from 'lucide-react';
import { speakJapanese } from '../services/audioService';
import { getMaziiKanjiUrl } from '../services/maziiService';

export const WordDetailView: React.FC = () => {
  const { detailWord, setMaziiQuery } = useApp();

  if (!detailWord) return null;

  // Extract individual Kanji characters from word
  const kanjiChars = Array.from(
    new Set(
      detailWord.word.split('').filter((c) => '\u4e00' <= c && c <= '\u9fff')
    )
  );

  const meaningsList = detailWord.meaning
    .split(';')
    .map((m) => m.trim())
    .filter(Boolean);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative select-none pb-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
        {/* Main Word Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary font-japanese tracking-tight">
                {detailWord.word}
              </h1>
              <p className="text-xl text-gray-500 font-medium font-japanese mt-1">
                「{detailWord.reading}」
              </p>
            </div>

            <button
              onClick={() => speakJapanese(detailWord.word)}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-full transition active:scale-95 shadow-sm"
              title="Nghe phát âm"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>

          {/* Word Type & Meanings List */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="text-sm font-bold text-indigo-700 flex items-center gap-1">
              <span>☆ {detailWord.word_type || 'Từ vựng'}</span>
            </div>

            <div className="space-y-1.5 pl-2">
              {meaningsList.map((m, idx) => (
                <div key={idx} className="text-base font-semibold text-gray-800 flex items-start gap-2">
                  <span className="text-gray-400 font-bold">-</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Examples Block */}
        {detailWord.examples && detailWord.examples.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>CỤM TỪ / CÂU VÍ DỤ LIÊN QUAN</span>
            </h3>

            <div className="space-y-3">
              {detailWord.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60 flex items-start gap-3"
                >
                  <button
                    onClick={() => speakJapanese(ex.ja)}
                    className="p-2 bg-white text-primary hover:bg-primary hover:text-white rounded-full transition shadow-sm flex-shrink-0 mt-0.5"
                    title="Nghe phát âm ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-base font-bold text-gray-900 font-japanese">
                      {ex.ja}
                    </p>
                    {ex.reading && (
                      <p className="text-xs text-gray-500 font-japanese">{ex.reading}</p>
                    )}
                    <p className="text-sm text-gray-700">{ex.vi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanji Breakdown Section */}
        {kanjiChars.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              HÁN TỰ LIÊN QUAN
            </h3>

            <div className="space-y-3">
              {kanjiChars.map((kanji, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 hover:bg-blue-50/30 rounded-xl border border-gray-200/80 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-primary font-japanese w-12 text-center">
                      {kanji}
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">
                        {detailWord.han_viet.split(' ')[idx] || 'HÁN TỰ'}
                      </div>
                      <div className="text-xs text-gray-500">Chi tiết Hán tự & thứ tự nét vẽ</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMaziiQuery(kanji)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <span>Xem Cách Vẽ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Search Button */}
      <button
        onClick={() => setMaziiQuery(detailWord.word)}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-95 hover:bg-blue-600"
        title="Tra từ trên Mazii"
      >
        <Search className="w-6 h-6" />
      </button>
    </div>
  );
};
