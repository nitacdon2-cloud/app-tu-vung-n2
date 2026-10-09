import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { Volume2, Trophy, RotateCcw, CheckCircle2, Star, BookOpen, Play, X, User, HelpCircle } from 'lucide-react';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState, saveProgress } from '../services/storageService';

export type QuestionType = 'kanji_to_meaning' | 'meaning_to_word' | 'fill_in_blank';

export interface LearningQuestion {
  word: Word;
  lessonId: string;
  qType: QuestionType;
  questionText?: string;
  questionSubText?: string;
  options: Word[];
}

export const LearningModeScreen: React.FC = () => {
  const { lessons, currentLesson, userProgress, setUserProgress, setMaziiQuery } = useApp();

  const [selectedLessons, setSelectedLessons] = useState<string[]>(
    currentLesson ? [currentLesson.lesson_id] : (lessons[0] ? [lessons[0].lesson_id] : [])
  );
  const [range, setRange] = useState<'tat_ca' | 'thich' | 'chua_nho'>('tat_ca');
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptedIndices, setAttemptedIndices] = useState<number[]>([]);
  const [hasScoredCurrentQuestion, setHasScoredCurrentQuestion] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Pool of all words across all lessons for generating random distractors
  const allGlobalWords = lessons.flatMap((l) => l.words);

  const toggleLessonSelect = (id: string) => {
    if (selectedLessons.includes(id)) {
      if (selectedLessons.length > 1) {
        setSelectedLessons(selectedLessons.filter((lId) => lId !== id));
      }
    } else {
      setSelectedLessons([...selectedLessons, id]);
    }
  };

  const handleStartLearning = () => {
    let scopedPool: { word: Word; lessonId: string }[] = [];

    lessons.forEach((lesson) => {
      if (selectedLessons.includes(lesson.lesson_id)) {
        lesson.words.forEach((word) => {
          const key = `${lesson.lesson_id}_${word.id}`;
          const state = getWordState(userProgress, key);

          if (range === 'chua_nho' && state.status !== 'chua_nho') return;
          if (range === 'thich' && !state.is_favorite) return;

          scopedPool.push({ word, lessonId: lesson.lesson_id });
        });
      }
    });

    if (scopedPool.length === 0) {
      alert('Không có từ vựng nào phù hợp với phạm vi đã chọn! Vui lòng chọn lại.');
      return;
    }

    // Shuffle question pool
    const shuffledPool = [...scopedPool].sort(() => 0.5 - Math.random());

    const qTypes: QuestionType[] = ['kanji_to_meaning', 'meaning_to_word', 'fill_in_blank'];

    // Generate questions with 3 randomized question formats
    const generated: LearningQuestion[] = shuffledPool.map((item, idx) => {
      const correctWord = item.word;

      // Distractor candidates drawn from allGlobalWords
      const distractorCandidates = allGlobalWords.filter(
        (w) => w.id !== correctWord.id && w.word !== correctWord.word
      );

      const chosenDistractors = distractorCandidates
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [correctWord, ...chosenDistractors].sort(() => 0.5 - Math.random());
      let randomQType = qTypes[idx % qTypes.length];
      
      const validExamples = correctWord.examples?.filter(ex => ex.ja.includes(correctWord.word) || ex.ja.includes(correctWord.reading)) || [];
      if (randomQType === 'fill_in_blank' && validExamples.length === 0) {
        randomQType = 'kanji_to_meaning';
      }

      let qText = '';
      let qSubText = '';
      if (randomQType === 'fill_in_blank') {
        const example = validExamples[Math.floor(Math.random() * validExamples.length)];
        if (example.ja.includes(correctWord.word)) {
          qText = example.ja.replace(new RegExp(correctWord.word, 'g'), '（　　　）');
        } else {
          qText = example.ja.replace(new RegExp(correctWord.reading, 'g'), '（　　　）');
        }
        qSubText = example.vi;
      }

      return {
        word: correctWord,
        lessonId: item.lessonId,
        qType: randomQType,
        questionText: qText,
        questionSubText: qSubText,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setSelectedOption(null);
    setAttemptedIndices([]);
    setHasScoredCurrentQuestion(false);
    setIsAnswered(false);
    setIsFinished(false);
    setIsQuizStarted(true);
  };

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (isQuizStarted && currentQ && currentQ.word) {
      if (currentQ.qType === 'kanji_to_meaning') {
        speakJapanese(currentQ.word.word);
      }
    }
  }, [currentIndex, isQuizStarted]);

  const handleSelectOption = (optIndex: number) => {
    const chosenWord = currentQ?.options[optIndex];
    if (!chosenWord) return;

    setSelectedOption(optIndex);
    setIsAnswered(true);
    setAttemptedIndices((prev) => (prev.includes(optIndex) ? prev : [...prev, optIndex]));

    const isCorrect = chosenWord.word === currentQ.word.word;
    const wordKey = `${currentQ.lessonId}_${currentQ.word.id}`;

    // Only record score and progress on first attempt for this question
    if (!hasScoredCurrentQuestion) {
      setHasScoredCurrentQuestion(true);
      if (isCorrect) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));

        // AUTOMATICALLY MARK WORD AS "ĐÃ NHỚ" (THUỘC) IN USER PROGRESS
        const currentState = getWordState(userProgress, wordKey);
        const updatedProgress = {
          ...userProgress,
          [wordKey]: {
            ...currentState,
            status: 'da_nho' as const,
            correct_count: (currentState.correct_count || 0) + 1,
            review_count: (currentState.review_count || 0) + 1,
          },
        };
        setUserProgress(updatedProgress);
        saveProgress(updatedProgress);
      } else {
        setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));

        const updatedProgress = recordTestAnswer(userProgress, wordKey, false);
        setUserProgress(updatedProgress);
        saveProgress(updatedProgress);
      }
    }

    playFeedbackSound(isCorrect ? 'correct' : 'wrong');
    speakJapanese(chosenWord.word);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setAttemptedIndices([]);
      setHasScoredCurrentQuestion(false);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  // SETUP VIEW
  if (!isQuizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center justify-center gap-2">
              <span>📖</span>
              <span>Chế Độ Học Từ Vựng</span>
            </h2>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              Tích hợp đa dạng câu hỏi (Từ ➔ Nghĩa, Nghĩa ➔ Từ, Điền từ vào câu). Trả lời đúng tự động tích <strong>Đã Thuộc</strong>!
            </p>
          </div>
        </div>

        {/* Lesson Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Chọn Bài Học ({selectedLessons.length}/{lessons.length})</span>
            </h3>
            <button
              onClick={() => {
                if (selectedLessons.length === lessons.length) {
                  setSelectedLessons(lessons.slice(0, 1).map((l) => l.lesson_id));
                } else {
                  setSelectedLessons(lessons.map((l) => l.lesson_id));
                }
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              {selectedLessons.length === lessons.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {lessons.map((l) => {
              const isSelected = selectedLessons.includes(l.lesson_id);
              return (
                <button
                  key={l.lesson_id}
                  onClick={() => toggleLessonSelect(l.lesson_id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-blue-50 text-primary shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="line-clamp-1">{l.lesson_name}</div>
                  <div className="text-[10px] text-gray-400 font-normal mt-0.5">{l.words.length} từ</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Range Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-extrabold text-gray-800 text-base">Phạm Vi Từ Vựng</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setRange('tat_ca')}
              className={`p-3.5 rounded-xl border text-xs font-extrabold transition-all text-center ${
                range === 'tat_ca'
                  ? 'border-primary bg-blue-50 text-primary shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tất Cả Từ Vựng
            </button>
            <button
              onClick={() => setRange('thich')}
              className={`p-3.5 rounded-xl border text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 ${
                range === 'thich'
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Đã Đánh Sao ⭐</span>
            </button>
            <button
              onClick={() => setRange('chua_nho')}
              className={`p-3.5 rounded-xl border text-xs font-extrabold transition-all text-center ${
                range === 'chua_nho'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chưa Thuộc
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartLearning}
          className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>BẮT ĐẦU CHẾ ĐỘ HỌC</span>
        </button>
      </div>
    );
  }

  // SUMMARY VIEW
  if (isFinished) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Hoàn Thành Chế Độ Học!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Bạn đã hoàn thành lượt học bài này.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="text-3xl font-black text-emerald-600">{score.correct}</div>
              <div className="text-xs font-bold text-emerald-700 mt-1">Đã thuộc (+1 ✅)</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
              <div className="text-3xl font-black text-rose-600">{score.wrong}</div>
              <div className="text-xs font-bold text-rose-700 mt-1">Chưa nhớ (❌)</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsQuizStarted(false)}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-sm transition"
            >
              Cài Đặt Lại
            </button>
            <button
              onClick={handleStartLearning}
              className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Học Lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chosenOptionWord = selectedOption !== null ? currentQ.options[selectedOption] : null;
  const isCorrectChoice = chosenOptionWord ? chosenOptionWord.word === currentQ.word.word : false;

  // QUIZ VIEW
  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="text-xs font-extrabold text-gray-600">
          Câu {currentIndex + 1} / {questions.length}
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-emerald-600 font-black">Thuộc: {score.correct}</span>
          <span className="text-rose-500 font-black">Chưa nhớ: {score.wrong}</span>
        </div>
      </div>

      {/* QUESTION CARD (NO HIRAGANA ON CARD) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 text-center space-y-3 relative">
        <div className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full inline-block">
          {currentQ.word.word_type || 'Từ vựng'}
        </div>

        {currentQ.qType === 'fill_in_blank' ? (
          <div className="py-2 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2563EB] leading-snug font-japanese tracking-wide">
              {currentQ.questionText}
            </h2>
            {currentQ.questionSubText && (
              <p className="text-sm text-gray-500 font-medium italic">
                {currentQ.questionSubText}
              </p>
            )}
            <p className="text-xs text-gray-400 font-semibold mt-2">Chọn từ thích hợp điền vào chỗ trống</p>
          </div>
        ) : currentQ.qType === 'meaning_to_word' ? (
          /* MEANING TO WORD QUESTION TYPE */
          <div className="py-2 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
              {currentQ.word.meaning}
            </h2>
            <p className="text-xs text-gray-400 font-semibold">Hãy chọn Từ vựng tiếng Nhật tương ứng</p>
          </div>
        ) : (
          /* KANJI TO MEANING QUESTION TYPE (NO HIRAGANA) */
          <div className="flex items-center justify-center gap-3 py-2">
            <h2 className="text-3xl sm:text-4xl font-black font-japanese text-gray-900">
              {currentQ.word.word}
            </h2>
            <button
              onClick={() => speakJapanese(currentQ.word.word)}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-full transition active:scale-95 shadow-sm"
              title="Phát âm"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* 4 ANSWER OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isOptionCorrect = opt.word === currentQ.word.word;
          const isAttempted = attemptedIndices.includes(idx);

          let btnStyle = 'bg-white border-gray-200 hover:border-blue-400 text-gray-800 shadow-sm';

          if (isAttempted) {
            if (isOptionCorrect) {
              btnStyle = isSelected
                ? 'bg-emerald-500 border-emerald-600 text-white font-black shadow-lg ring-2 ring-emerald-400'
                : 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
            } else {
              btnStyle = isSelected
                ? 'bg-rose-500 border-rose-600 text-white font-black shadow-lg ring-2 ring-rose-400'
                : 'bg-rose-50 border-rose-300 text-rose-700 font-semibold';
            }
          }

          // Option text: If question is meaning_to_word or fill_in_blank, display Kanji. Else display Meaning.
          const displayText = (currentQ.qType === 'meaning_to_word' || currentQ.qType === 'fill_in_blank') ? opt.word : opt.meaning;

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-bold transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${btnStyle} ${
                (currentQ.qType === 'meaning_to_word' || currentQ.qType === 'fill_in_blank') ? 'font-japanese' : ''
              }`}
            >
              <span className="line-clamp-2">{displayText}</span>
              {isAttempted && isOptionCorrect && (
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ANSWER EXPLANATION CARD (Shows details of chosenOptionWord whether right or wrong!) */}
      {chosenOptionWord && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`p-5 rounded-2xl border text-left space-y-2.5 shadow-md ${
              isCorrectChoice
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between">
              {isCorrectChoice ? (
                <div className="flex items-center gap-2 font-black text-base text-emerald-700">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>Chính Xác!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-black text-base text-rose-700">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    ✕
                  </div>
                  <div>
                    <span>Không Chính Xác</span>
                    <span className="block text-xs font-bold text-gray-700">
                      Đáp án đúng:{' '}
                      <b className="text-emerald-700 font-japanese font-black">
                        {currentQ.word.word}
                        {currentQ.word.reading ? ` (${currentQ.word.reading})` : ''} - {currentQ.word.meaning}
                      </b>
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Tra Mazii & Audio for chosenOptionWord */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMaziiQuery(chosenOptionWord.word)}
                  className="p-1.5 bg-white text-gray-700 hover:text-primary rounded-xl border border-gray-200 shadow-sm transition flex items-center gap-1 px-2.5 text-xs font-bold cursor-pointer"
                  title="Tra từ Mazii"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>i</span>
                </button>
                <button
                  onClick={() => speakJapanese(chosenOptionWord.word)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Vocabulary Explanation Lines for chosenOptionWord */}
            <div className="space-y-0.5 pt-1 font-japanese">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-gray-900">
                  {chosenOptionWord.word}
                </span>
                {chosenOptionWord.reading && (
                  <span className="text-sm font-semibold text-gray-600">
                    「{chosenOptionWord.reading}」
                  </span>
                )}
                {chosenOptionWord.han_viet && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded uppercase font-sans">
                    [{chosenOptionWord.han_viet}]
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-gray-800 font-sans pt-0.5">
                {chosenOptionWord.meaning}
              </div>
            </div>
          </div>

          {/* CÂU TIẾP BUTTON */}
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/30 transition active:scale-[0.98] cursor-pointer"
          >
            CÂU TIẾP ➔
          </button>
        </div>
      )}
    </div>
  );
};
