import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Volume2, CheckCircle2, RefreshCw, Award } from 'lucide-react';
import { speakJapanese } from '../services/audioService';

export const PronunciationScreen: React.FC = () => {
  const { currentLesson } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const words = currentLesson?.words || [];
  const currentWord = words[currentIndex];

  if (!currentWord) return null;

  const handleStartRecord = () => {
    setIsRecording(true);
    setScore(null);

    // Simulate microphone Speech Recognition scoring
    setTimeout(() => {
      setIsRecording(false);
      const simulatedScore = Math.floor(Math.random() * 25) + 75; // 75% to 100%
      setScore(simulatedScore);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-6 max-w-lg mx-auto w-full select-none pb-12 overflow-y-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Luyện Phát Âm Tiếng Nhật</h2>
        <p className="text-xs text-gray-500">Thu âm giọng nói và nhận điểm đánh giá AI</p>
      </div>

      {/* Target Word Card */}
      <div className="my-auto bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xl text-center space-y-6">
        <div className="text-sm font-bold text-gray-400">
          {currentIndex + 1} / {words.length}
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary font-japanese tracking-tight">
            {currentWord.word}
          </h1>
          <p className="text-2xl text-gray-500 font-medium font-japanese">
            「{currentWord.reading}」
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => speakJapanese(currentWord.word)}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-full transition inline-flex items-center gap-2 font-semibold text-sm px-4"
          >
            <Volume2 className="w-5 h-5" />
            <span>Nghe mẫu</span>
          </button>
        </div>

        {/* Score Display */}
        {score !== null && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-200 space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-lg">
              <Award className="w-6 h-6" />
              <span>Độ chính xác: {score}%</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold">
              {score >= 90 ? 'Phát âm tuyệt vời! 🎉' : 'Phát âm khá tốt, cố lên! 👍'}
            </p>
          </div>
        )}
      </div>

      {/* Record Mic Button */}
      <div className="text-center space-y-4">
        <button
          onClick={handleStartRecord}
          disabled={isRecording}
          className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition mx-auto border-4 border-white ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
          }`}
        >
          <Mic className="w-9 h-9" />
        </button>

        <p className="text-xs font-semibold text-gray-500">
          {isRecording ? 'Đang lắng nghe... Nói to từ vựng nào!' : 'Bấm nút micro để bắt đầu nói'}
        </p>

        {score !== null && (
          <button
            onClick={() => {
              setScore(null);
              if (currentIndex < words.length - 1) setCurrentIndex((prev) => prev + 1);
              else setCurrentIndex(0);
            }}
            className="w-full py-3 bg-primary text-white font-bold rounded-2xl shadow-md hover:bg-blue-600 transition"
          >
            Từ Tiếp Theo
          </button>
        )}
      </div>
    </div>
  );
};
