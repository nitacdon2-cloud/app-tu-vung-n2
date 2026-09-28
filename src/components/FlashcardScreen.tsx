import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Star, CheckCircle, Volume2, Search, RotateCw } from 'lucide-react';
import { speakJapanese } from '../services/audioService';
import { getWordState } from '../services/storageService';

export const FlashcardScreen: React.FC = () => {
  const {
    currentLesson,
    userProgress,
    handleToggleFavorite,
    handleToggleStatus,
    getWordKey,
    setMaziiQuery,
    setScreen,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterScope, setFilterScope] = useState<'tat_ca' | 'chua_nho' | 'da_nho'>('chua_nho');
  const [showWordFront, setShowWordFront] = useState(true);
  const [showReadingFront, setShowReadingFront] = useState(false);
  const [showMeaningFront, setShowMeaningFront] = useState(false);

  if (!currentLesson || !currentLesson.words.length) return null;

  // Filter words by scope
  const cardWords = currentLesson.words.filter((word) => {
    const key = getWordKey(word);
    const state = getWordState(userProgress, key);
    if (filterScope === 'chua_nho') return state.status === 'chua_nho';
    if (filterScope === 'da_nho') return state.status === 'da_nho';
    return true;
  });

  const currentWord = cardWords[currentIndex] || cardWords[0] || currentLesson.words[0];
  const currentKey = currentWord ? getWordKey(currentWord) : '';
  const currentWordState = getWordState(userProgress, currentKey);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, filterScope]);

  const handleNext = (markAsLearned: boolean) => {
    if (currentWord && markAsLearned) {
      handleToggleStatus(currentWord);
    }
    setIsFlipped(false);
    if (currentIndex < cardWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleSpeech = (text: string) => {
    speakJapanese(text);
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-4 max-w-lg mx-auto w-full select-none pb-8 overflow-y-auto">
      {/* Top Filter Controls */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm space-y-2">
        {/* Checkbox Mask Row */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 px-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWordFront}
              onChange={(e) => setShowWordFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Từ</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showReadingFront}
              onChange={(e) => setShowReadingFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Hiragana</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showMeaningFront}
              onChange={(e) => setShowMeaningFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Nghĩa</span>
          </label>
        </div>

        {/* Scope Radio Row */}
        <div className="flex items-center justify-between gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          {(['tat_ca', 'chua_nho', 'da_nho'] as const).map((scope) => {
            const label = scope === 'tat_ca' ? 'Tất Cả' : scope === 'chua_nho' ? 'Chưa Nhớ' : 'Đã Nhớ';
            const isActive = filterScope === scope;
            return (
              <button
                key={scope}
                onClick={() => {
                  setFilterScope(scope);
                  setCurrentIndex(0);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-white text-primary font-bold shadow-sm' : 'text-gray-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Quick Card Match Practice Link */}
        <div className="text-center pt-1">
          <button
            onClick={() => setScreen('card_match')}
            className="text-xs font-bold text-primary hover:underline"
          >
            Ghép thẻ từ vựng
          </button>
        </div>
      </div>

      {/* 3D Flipping Flashcard Container */}
      {cardWords.length === 0 ? (
        <div className="my-12 text-center p-8 bg-white rounded-3xl border border-gray-200">
          <p className="font-bold text-gray-700">Đã hoàn thành tất cả từ vựng trong mục này!</p>
          <button
            onClick={() => setFilterScope('tat_ca')}
            className="mt-4 px-4 py-2 bg-primary text-white font-semibold text-xs rounded-xl shadow"
          >
            Xem lại tất cả từ
          </button>
        </div>
      ) : (
        <div className="my-4 perspective-1000 min-h-[380px] flex flex-col">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full flex-1 bg-white rounded-3xl border border-gray-200/90 shadow-lg p-6 flex flex-col justify-between cursor-pointer transition-transform duration-500 transform-style-3d relative ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front & Back Overlay Header */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-full">
                {currentIndex + 1}/{cardWords.length}
              </span>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleToggleFavorite(currentWord)}
                  className="p-2 hover:bg-amber-50 rounded-full transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      currentWordState.is_favorite
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleToggleStatus(currentWord)}
                  className="p-2 hover:bg-emerald-50 rounded-full transition"
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      currentWordState.status === 'da_nho'
                        ? 'fill-emerald-500 text-white'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Front Side Content */}
            {!isFlipped ? (
              <div className="my-auto text-center space-y-3 p-4">
                {showWordFront && (
                  <h2 className="text-5xl font-black text-primary font-japanese tracking-tight">
                    {currentWord.word}
                  </h2>
                )}
                {showReadingFront && (
                  <p className="text-2xl text-gray-500 font-japanese">
                    {currentWord.reading}
                  </p>
                )}
                {showMeaningFront && (
                  <p className="text-lg text-gray-800 font-medium">
                    {currentWord.meaning}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeech(currentWord.word);
                    }}
                    className="p-3 bg-blue-50 text-primary hover:bg-blue-100 rounded-full transition mx-auto inline-flex items-center justify-center"
                    title="Phát âm"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              /* Back Side Content */
              <div className="my-auto space-y-4 p-2 rotate-y-180 text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-primary font-japanese">
                      {currentWord.word}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeech(currentWord.word);
                      }}
                      className="p-2 bg-blue-50 text-primary rounded-full hover:bg-blue-100"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg font-medium text-gray-600 font-japanese mt-0.5">
                    「{currentWord.reading}」
                  </p>
                </div>

                {currentWord.han_viet && (
                  <div className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-md uppercase">
                    [{currentWord.han_viet}]
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-base font-bold text-gray-800">{currentWord.meaning}</p>
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                    <p className="font-japanese font-bold text-gray-900">
                      {currentWord.examples[0].ja}
                    </p>
                    <p className="text-gray-600 italic">{currentWord.examples[0].vi}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Flip Indicator */}
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 pt-2">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm vào thẻ để lật mặt {isFlipped ? 'trước' : 'sau'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="space-y-3">
        <p className="text-center text-xs text-gray-400 italic">
          * Click nút Chưa/Đã Nhớ để chuyển thẻ *
        </p>

        <div className="flex items-center gap-3 relative">
          {/* Button "Chưa Nhớ" (White/Gray) */}
          <button
            onClick={() => handleNext(false)}
            className="flex-1 py-3.5 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-2xl border border-gray-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
              <span className="text-xs font-black text-gray-500">✓</span>
            </div>
            <span>Chưa Nhớ</span>
          </button>

          {/* Button "Đã Nhớ" (Blue) */}
          <button
            onClick={() => handleNext(true)}
            className="flex-1 py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <CheckCircle className="w-6 h-6 fill-white text-primary" />
            <span>Đã Nhớ</span>
          </button>

          {/* Search Lens Button */}
          <button
            onClick={() => currentWord && setMaziiQuery(currentWord.word)}
            className="w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition active:scale-90 flex-shrink-0"
            title="Tra Mazii"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
