import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { speakJapanese, playFeedbackSound } from '../services/audioService';

export const DictationScreen: React.FC = () => {
  const { currentLesson } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const words = currentLesson?.words || [];
  const currentWord = words[currentIndex];

  if (!currentWord) return null;

  const handleCheck = () => {
    const cleanInput = inputVal.trim();
    const targetWord = currentWord.word.trim();
    const targetReading = currentWord.reading.trim();

    const correct = cleanInput === targetWord || cleanInput === targetReading;
    setIsCorrect(correct);
    setIsChecked(true);
    playFeedbackSound(correct ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    setInputVal('');
    setIsChecked(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-6 max-w-lg mx-auto w-full select-none pb-12 overflow-y-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Luyện Nghe Viết (Dictation)</h2>
        <p className="text-xs text-gray-500">Nghe âm thanh và gõ lại từ vựng chính xác</p>
      </div>

      <div className="my-auto bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xl text-center space-y-6">
        <div className="text-sm font-bold text-gray-400">
          {currentIndex + 1} / {words.length}
        </div>

        {/* Audio Button */}
        <div>
          <button
            onClick={() => speakJapanese(currentWord.word)}
            className="w-24 h-24 bg-primary hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition mx-auto active:scale-95 border-4 border-white"
            title="Nghe phát âm"
          >
            <Volume2 className="w-12 h-12" />
          </button>
          <p className="text-xs text-gray-400 font-semibold mt-2">Bấm để nghe âm thanh từ vựng</p>
        </div>

        {/* Text Input Field */}
        <div className="space-y-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isChecked}
            placeholder="Nhập Kanji hoặc Hiragana..."
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-2xl text-center text-xl font-bold font-japanese outline-none transition"
            onKeyDown={(e) => e.key === 'Enter' && !isChecked && handleCheck()}
          />

          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={!inputVal.trim()}
              className="w-full py-3.5 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition active:scale-95"
            >
              Kiểm Tra
            </button>
          ) : (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-left ${
                  isCorrect
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold text-base">
                    {isCorrect ? 'Chính xác!' : 'Chưa chính xác'}
                  </p>
                  <p className="text-xs mt-0.5">
                    Đáp án đúng: <span className="font-japanese font-bold">{currentWord.word}</span> (
                    {currentWord.reading}) - {currentWord.meaning}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Từ Tiếp Theo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
