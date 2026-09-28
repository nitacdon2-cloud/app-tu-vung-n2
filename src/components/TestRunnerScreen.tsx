import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { Volume2, Trophy, RotateCcw, User, CheckCircle2, Grid } from 'lucide-react';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState } from '../services/storageService';

export type TestQuestionType = 'kanji_to_meaning' | 'meaning_to_word' | 'audio_to_meaning';

interface QuestionOption {
  text: string;
  wordObj: Word;
}

interface QuestionItem {
  word: Word;
  questionText: string;
  correctAnswer: string;
  qType: TestQuestionType;
  options: QuestionOption[];
}

export const TestRunnerScreen: React.FC = () => {
  const { lessons, currentLesson, testConfig, userProgress, setScreen, getWordKey, setMaziiQuery } = useApp();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Single selected option state (index of the ONE currently selected option)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasScoredCurrentQuestion, setHasScoredCurrentQuestion] = useState<boolean>(false);

  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Quiz test pool strictly within selected scope
  useEffect(() => {
    let scopedPool: Word[] = [];

    if (testConfig.selectedLessons && testConfig.selectedLessons.length > 0) {
      lessons.forEach((lesson) => {
        if (testConfig.selectedLessons.includes(lesson.lesson_id)) {
          lesson.words.forEach((word) => {
            const key = `${lesson.lesson_id}_${word.id}`;
            const state = getWordState(userProgress, key);

            if (testConfig.range === 'chua_nho' && state.status !== 'chua_nho') return;
            if (testConfig.range === 'da_nho' && state.status !== 'da_nho') return;
            if (testConfig.range === 'thich' && !state.is_favorite) return;

            scopedPool.push(word);
          });
        }
      });
    } else if (currentLesson && currentLesson.words) {
      scopedPool = [...currentLesson.words];
    } else if (lessons.length > 0) {
      scopedPool = [...lessons[0].words];
    }

    // Handle empty filtered pool gracefully
    if (scopedPool.length === 0) {
      alert('Không có từ vựng nào phù hợp với cài đặt phạm vi bài test! Vui lòng kiểm tra lại bộ lọc.');
      setScreen('test_setup');
      return;
    }

    // Select questions from scopedPool
    let questionWords = [...scopedPool].sort(() => 0.5 - Math.random());
    if (testConfig.maxQuestions > 0 && questionWords.length > testConfig.maxQuestions) {
      questionWords = questionWords.slice(0, testConfig.maxQuestions);
    }

    const qTypes: TestQuestionType[] = ['kanji_to_meaning', 'meaning_to_word', 'audio_to_meaning'];

    // Generate 4 options for each question STRICTLY from scopedPool
    const generatedQuestions: QuestionItem[] = questionWords.map((word, idx) => {
      const correctWord = word;
      const qType = qTypes[idx % qTypes.length];

      // Primary distractors: drawn STRICTLY from scopedPool (excluding current question word)
      let distractorCandidates = scopedPool.filter(
        (w) => w.id !== word.id && w.word !== word.word
      );

      // Fallback only if scopedPool has fewer than 3 distractors
      if (distractorCandidates.length < 3) {
        const fallbackCandidates = lessons
          .filter((l) => testConfig.selectedLessons.includes(l.lesson_id))
          .flatMap((l) => l.words)
          .filter(
            (w) =>
              w.id !== word.id &&
              w.word !== word.word &&
              !distractorCandidates.some((d) => d.id === w.id)
          );

        distractorCandidates = [...distractorCandidates, ...fallbackCandidates];
      }

      const chosenDistractors = distractorCandidates
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const optionWords = [correctWord, ...chosenDistractors].sort(() => 0.5 - Math.random());

      let opts: QuestionOption[] = [];
      let qText = '';
      let correctAns = '';

      if (qType === 'meaning_to_word') {
        qText = word.meaning;
        correctAns = word.word;
        opts = optionWords.map((w) => ({ text: w.word, wordObj: w }));
      } else if (qType === 'audio_to_meaning') {
        qText = '? (Click để nghe lại)';
        correctAns = word.meaning;
        opts = optionWords.map((w) => ({ text: w.meaning, wordObj: w }));
      } else {
        qText = word.word;
        correctAns = word.meaning;
        opts = optionWords.map((w) => ({ text: w.meaning, wordObj: w }));
      }

      return {
        word: correctWord,
        questionText: qText,
        correctAnswer: correctAns,
        qType,
        options: opts,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
  }, []);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOptionIndex(null);
    setHasScoredCurrentQuestion(false);
    if (currentQ && currentQ.word) {
      if (currentQ.qType === 'audio_to_meaning' || currentQ.qType === 'kanji_to_meaning') {
        speakJapanese(currentQ.word.word);
      }
    }
  }, [currentIndex]);

  if (!currentQ) return null;

  const handleSelectOption = (idx: number) => {
    const option = currentQ.options[idx];
    if (!option) return;

    // Single option selection: replaces previous selection
    setSelectedOptionIndex(idx);

    const isCorrect = option.text === currentQ.correctAnswer;
    const key = getWordKey(currentQ.word);

    // Record score once for the current question
    if (!hasScoredCurrentQuestion) {
      setHasScoredCurrentQuestion(true);
      recordTestAnswer(userProgress, key, isCorrect);
      if (isCorrect) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
      }
    }

    // Audio sound & TTS
    playFeedbackSound(isCorrect ? 'correct' : 'wrong');
    speakJapanese(option.wordObj.word);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Test Results Screen
  if (isFinished) {
    const totalQ = questions.length;
    const accuracy = totalQ > 0 ? Math.round((score.correct / totalQ) * 100) : 0;

    return (
      <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-12 overflow-y-auto">
        <div className="my-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-[#2563EB] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Kết Quả Bài Test Từ Vựng</h2>
            <p className="text-sm text-gray-500 mt-1">Hoàn thành bài kiểm tra chọn đáp án đúng</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="text-3xl font-black text-emerald-600">{score.correct}</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">Trả lời đúng</div>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <div className="text-3xl font-black text-rose-600">{score.wrong}</div>
              <div className="text-xs font-bold text-rose-700 mt-0.5">Lần trả lời sai</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
            <div className="text-4xl font-black text-[#2563EB]">{accuracy}%</div>
            <div className="text-xs font-bold text-blue-700 mt-1">Độ chính xác</div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore({ correct: 0, wrong: 0 });
                setIsFinished(false);
              }}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm Lại Bài Test</span>
            </button>

            <button
              onClick={() => setScreen('card_match')}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Grid className="w-5 h-5" />
              <span>Chuyển Sang Ghép Từ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active selected option details
  const activeOption = selectedOptionIndex !== null ? currentQ.options[selectedOptionIndex] : null;
  const isSelectedCorrect = activeOption ? activeOption.text === currentQ.correctAnswer : false;

  return (
    <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-8 overflow-y-auto">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Left Pill: Question Index */}
        <div className="px-5 py-2 bg-white border border-gray-200/90 rounded-2xl text-sm font-extrabold text-gray-900 shadow-sm min-w-[75px] text-center">
          {currentIndex + 1}/{questions.length}
        </div>

        {/* Right Pills: Correct & Wrong count */}
        <div className="flex items-center gap-2">
          {/* Blue Pill: Đúng */}
          <div className="px-4 py-2 bg-[#2563EB] text-white rounded-2xl text-sm font-bold shadow-sm">
            Đúng {score.correct}
          </div>

          {/* Red Pill: Sai */}
          <div className="px-4 py-2 bg-[#FF5252] text-white rounded-2xl text-sm font-bold shadow-sm">
            Sai {score.wrong}
          </div>
        </div>
      </div>

      {/* QUESTION CARD (NO HIRAGANA) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 text-center mb-3">
        {currentQ.qType === 'audio_to_meaning' ? (
          <button
            onClick={() => speakJapanese(currentQ.word.word)}
            className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-extrabold text-base rounded-xl transition flex items-center justify-center gap-2 border border-blue-200"
          >
            <Volume2 className="w-5 h-5" />
            <span>? (Click để nghe lại)</span>
          </button>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold text-[#2563EB] leading-snug font-japanese">
            {currentQ.questionText}
          </h2>
        )}
      </div>

      {/* 2x2 OPTIONS GRID */}
      <div className="grid grid-cols-2 gap-3.5 mb-4">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isOptionCorrect = option.text === currentQ.correctAnswer;

          let buttonStyle = 'bg-white border-gray-200/90 text-gray-800 hover:border-blue-400 shadow-sm';

          if (isSelected) {
            if (isOptionCorrect) {
              buttonStyle = 'bg-[#DCFCE7] border-emerald-300 text-[#166534] font-bold shadow-md';
            } else {
              buttonStyle = 'bg-[#FF5252] border-transparent text-white font-bold shadow-md animate-shake';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[90px] p-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-center text-center text-base sm:text-lg font-bold active:scale-95 ${buttonStyle} ${
                currentQ.qType === 'meaning_to_word' ? 'font-japanese' : ''
              }`}
            >
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Action Button Below Grid: CÂU TIẾP */}
      <div className="flex justify-center mb-3">
        <button
          onClick={handleNextQuestion}
          disabled={selectedOptionIndex === null}
          className={`px-10 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 ${
            selectedOptionIndex !== null
              ? 'bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          CÂU TIẾP
        </button>
      </div>

      {/* Bottom Result & Explanation Banner (Shows the ONLY currently selected option's details!) */}
      {activeOption && (
        <div
          className={`rounded-3xl p-4 sm:p-5 border shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
            isSelectedCorrect
              ? 'bg-[#DCFCE7] border-emerald-200/80 text-[#166534]'
              : 'bg-[#FFEBEB] border-rose-200/80 text-[#EF4444]'
          }`}
        >
          {/* Top Row: Icon + Status Text on left, Avatar & Speaker on right */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isSelectedCorrect ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-xs shadow-sm">
                    ✓
                  </div>
                  <span className="font-extrabold text-base text-[#16A34A]">Chính Xác!</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-black text-xs shadow-sm">
                    ✕
                  </div>
                  <span className="font-extrabold text-base text-[#EF4444]">Không Chính Xác</span>
                </>
              )}
            </div>

            {/* Cyan Avatar (Tra Mazii) & Speaker buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaziiQuery(activeOption.wordObj.word)}
                className="w-8 h-8 rounded-full bg-[#00BCD4] hover:bg-cyan-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition"
                title="Tra Mazii"
              >
                <User className="w-4 h-4 fill-white text-[#00BCD4]" />
              </button>
              <button
                onClick={() => speakJapanese(activeOption.wordObj.word)}
                className="w-8 h-8 rounded-full bg-[#00BCD4] hover:bg-cyan-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition"
                title="Phát âm"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Explanation Text Details for activeOption */}
          <div className="space-y-0.5 pt-1">
            <div className={`text-xl font-bold font-japanese ${isSelectedCorrect ? 'text-[#166534]' : 'text-[#EF4444]'}`}>
              {activeOption.wordObj.word}
            </div>
            <div className={`text-sm font-medium font-japanese ${isSelectedCorrect ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
              {activeOption.wordObj.reading}
            </div>
            <div className={`text-sm font-medium ${isSelectedCorrect ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
              {activeOption.wordObj.meaning}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
