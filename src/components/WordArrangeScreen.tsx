import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState } from '../services/storageService';
import { RotateCcw, Trophy, User, Volume2, CheckCircle2 } from 'lucide-react';

interface ArrangeQuestion {
  word: Word;
  meaningPrompt: string;
  correctKanji: string;
  shuffledKanjiChars: string[];
}

export const WordArrangeScreen: React.FC = () => {
  const { currentLesson, lessons, testConfig, userProgress, setScreen, getWordKey } = useApp();

  const [questions, setQuestions] = useState<ArrangeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedChars, setPlacedChars] = useState<{ id: string; char: string }[]>([]);
  const [availableChars, setAvailableChars] = useState<{ id: string; char: string }[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Word Arrange questions
  useEffect(() => {
    let pool: Word[] = [];

    if (testConfig.selectedLessons && testConfig.selectedLessons.length > 0) {
      lessons.forEach((l) => {
        if (testConfig.selectedLessons.includes(l.lesson_id)) {
          l.words.forEach((word) => {
            const key = `${l.lesson_id}_${word.id}`;
            const state = getWordState(userProgress, key);

            if (testConfig.range === 'chua_nho' && state.status !== 'chua_nho') return;
            if (testConfig.range === 'da_nho' && state.status !== 'da_nho') return;
            if (testConfig.range === 'thich' && !state.is_favorite) return;

            pool.push(word);
          });
        }
      });
    } else if (currentLesson && currentLesson.words) {
      currentLesson.words.forEach((word) => {
        const key = `${currentLesson.lesson_id}_${word.id}`;
        const state = getWordState(userProgress, key);

        if (testConfig.range === 'chua_nho' && state.status !== 'chua_nho') return;
        if (testConfig.range === 'da_nho' && state.status !== 'da_nho') return;
        if (testConfig.range === 'thich' && !state.is_favorite) return;

        pool.push(word);
      });
    } else if (lessons.length > 0) {
      pool = [...lessons[0].words];
    }

    if (pool.length === 0) return;

    // Pick 6 words for a set (as shown in Screenshot 2: "1/6")
    const setSize = Math.min(6, pool.length);
    const selectedWords = [...pool].sort(() => 0.5 - Math.random()).slice(0, setSize);

    const generated: ArrangeQuestion[] = selectedWords.map((word) => {
      const chars = word.word.split('');
      const shuffled = [...chars].sort(() => 0.5 - Math.random());
      return {
        word,
        meaningPrompt: word.meaning,
        correctKanji: word.word,
        shuffledKanjiChars: shuffled,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
  }, []);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!currentQ) return;

    const tiles = currentQ.shuffledKanjiChars.map((c, idx) => ({
      id: `char_${idx}_${Math.random()}`,
      char: c,
    }));

    setAvailableChars(tiles);
    setPlacedChars([]);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex, currentQ]);

  if (!currentQ) return null;

  const handleTileClick = (tile: { id: string; char: string }) => {
    if (isAnswered) return;

    setAvailableChars((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedChars((prev) => [...prev, tile]);
  };

  const handlePlacedTileClick = (tile: { id: string; char: string }) => {
    if (isAnswered) return;

    setPlacedChars((prev) => prev.filter((t) => t.id !== tile.id));
    setAvailableChars((prev) => [...prev, tile]);
  };

  const handleCheckAnswer = () => {
    if (isAnswered || placedChars.length === 0) return;

    const userWord = placedChars.map((t) => t.char).join('');
    const correct = userWord === currentQ.correctKanji;

    setIsCorrect(correct);
    setIsAnswered(true);

    playFeedbackSound(correct ? 'correct' : 'wrong');
    speakJapanese(currentQ.word.word);

    recordTestAnswer(userProgress, getWordKey(currentQ.word), correct);

    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Finished Screen
  if (isFinished) {
    return (
      <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-12 overflow-y-auto">
        <div className="my-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-[#2563EB] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Hoàn Thành Sắp Xếp Thành Từ!</h2>
            <p className="text-sm text-gray-500 mt-1">Đúng {score.correct} / {questions.length} câu</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFinished(false);
              }}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm Lại Bài Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-8 overflow-y-auto">
      {/* Top Banner (Exact layout from Screenshot 2) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 relative mb-3 text-center">
        <span className="text-xs text-gray-500 font-bold block mb-1">Chọn để ghép thành từ</span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2563EB]">
          {currentQ.meaningPrompt}
        </h2>
        <div className="absolute right-4 top-4 px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200">
          {currentIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Middle Large Workspace Box for placed tiles */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm min-h-[200px] flex flex-wrap items-center justify-center gap-2 mb-4">
        {placedChars.length === 0 ? (
          <span className="text-sm text-gray-400 italic">Chạm vào các ký tự bên dưới để sắp xếp</span>
        ) : (
          placedChars.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handlePlacedTileClick(tile)}
              disabled={isAnswered}
              className="w-14 h-14 bg-blue-50 border-2 border-[#2563EB] text-[#2563EB] rounded-2xl text-2xl font-bold font-japanese shadow-sm flex items-center justify-center active:scale-95 transition"
            >
              {tile.char}
            </button>
          ))
        )}
      </div>

      {/* Bottom Available Character Tiles */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {availableChars.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            disabled={isAnswered}
            className="w-14 h-14 bg-white border border-gray-200/90 rounded-2xl text-2xl font-bold font-japanese text-gray-800 shadow-sm hover:border-blue-400 active:scale-95 transition flex items-center justify-center"
          >
            {tile.char}
          </button>
        ))}
      </div>

      {/* Action Buttons: KIỂM TRA & CÂU TIẾP (Exact layout from Screenshot 2) */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handleCheckAnswer}
          disabled={isAnswered || placedChars.length === 0}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase shadow-md transition active:scale-95 ${
            !isAnswered && placedChars.length > 0
              ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          KIỂM TRA
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!isAnswered}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase shadow-md transition active:scale-95 ${
            isAnswered
              ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          CÂU TIẾP
        </button>
      </div>

      {/* Bottom Result & Explanation Banner */}
      {isAnswered && (
        <div
          className={`rounded-3xl p-4 sm:p-5 border shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
            isCorrect
              ? 'bg-[#DCFCE7] border-emerald-200/80 text-[#166534]'
              : 'bg-[#FFEBEB] border-rose-200/80 text-[#EF4444]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-xs">
                    ✓
                  </div>
                  <span className="font-extrabold text-base text-[#16A34A]">Xuất sắc!</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-black text-xs">
                    ✕
                  </div>
                  <span className="font-extrabold text-base text-[#EF4444]">Không Chính Xác</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00BCD4] text-white flex items-center justify-center">
                <User className="w-4 h-4 fill-white text-[#00BCD4]" />
              </div>
              <button
                onClick={() => speakJapanese(currentQ.word.word)}
                className="w-8 h-8 rounded-full bg-[#00BCD4] text-white flex items-center justify-center hover:bg-cyan-600 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-0.5 pt-1">
            <div className={`text-xl font-bold font-japanese ${isCorrect ? 'text-[#166534]' : 'text-[#EF4444]'}`}>
              {currentQ.word.word}
            </div>
            <div className={`text-sm font-medium font-japanese ${isCorrect ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
              {currentQ.word.reading}
            </div>
            <div className={`text-sm font-medium ${isCorrect ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
              {currentQ.word.meaning}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordArrangeScreen;
