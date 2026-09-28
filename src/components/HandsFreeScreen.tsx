import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, Sparkles } from 'lucide-react';
import { speakJapanese, speakVietnamese } from '../services/audioService';

export const HandsFreeScreen: React.FC = () => {
  const { currentLesson } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const words = currentLesson?.words || [];
  const currentWord = words[currentIndex];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isPlaying && currentWord) {
      // Step 1: Speak Japanese
      speakJapanese(currentWord.word).then(() => {
        // Step 2: Pause 1 sec then speak Vietnamese meaning
        timeoutId = setTimeout(() => {
          speakVietnamese(currentWord.meaning).then(() => {
            // Step 3: Pause 1.5 sec then move to next word
            timeoutId = setTimeout(() => {
              if (currentIndex < words.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                setCurrentIndex(0);
              }
            }, 1500);
          });
        }, 1000);
      });
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, isPlaying, currentWord]);

  if (!currentWord) return null;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-6 max-w-lg mx-auto w-full select-none pb-12 overflow-y-auto">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Chế độ Nghe & Xem (Hands-Free)</span>
        </div>
        <p className="text-xs text-gray-500">Tự động phát âm thanh và chuyển bài không cần chạm</p>
      </div>

      {/* Main Card View */}
      <div className="my-auto bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xl text-center space-y-6">
        <div className="text-sm font-bold text-gray-400">
          {currentIndex + 1} / {words.length}
        </div>

        <div className="space-y-2">
          <h2 className="text-5xl font-black text-primary font-japanese tracking-tight">
            {currentWord.word}
          </h2>
          <p className="text-2xl text-gray-500 font-medium font-japanese">
            「{currentWord.reading}」
          </p>
          {currentWord.han_viet && (
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-md uppercase">
              [{currentWord.han_viet}]
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xl font-bold text-gray-800">{currentWord.meaning}</p>
        </div>

        {currentWord.examples && currentWord.examples[0] && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs space-y-1">
            <p className="font-japanese font-bold text-gray-900 text-sm">
              {currentWord.examples[0].ja}
            </p>
            <p className="text-gray-600 italic">{currentWord.examples[0].vi}</p>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1))}
          className="p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow border border-gray-200 transition active:scale-95"
          title="Từ trước"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 bg-primary hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition active:scale-95 border-2 border-white"
          title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-white ml-1" />}
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0))}
          className="p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow border border-gray-200 transition active:scale-95"
          title="Từ kế tiếp"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
