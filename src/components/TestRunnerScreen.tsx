import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { 
  Volume2, Trophy, RotateCcw, User, CheckCircle2, Grid, 
  BookOpen, Eye, EyeOff, Sparkles, Check, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState } from '../services/storageService';

export type TestQuestionType = 'kanji_to_meaning' | 'meaning_to_word' | 'fill_in_blank';

interface QuestionOption {
  text: string;
  wordObj: Word;
}

interface QuestionItem {
  word: Word;
  questionText: string;
  questionSubText?: string;
  originalSentence?: string;
  matchedPart?: string;
  correctAnswer: string;
  qType: TestQuestionType;
  options: QuestionOption[];
}

interface BlankResult {
  blankedJa: string;
  originalJa: string;
  translationVi: string;
  matchedPart: string;
}

// Hàm thông minh tách câu ví dụ thành chỗ trống （　　　）
const findBestBlank = (word: Word): BlankResult | null => {
  if (!word.examples || word.examples.length === 0) return null;

  for (const ex of word.examples) {
    if (!ex.ja) continue;

    // 1. Khớp chính xác từ Kanji / Word
    if (ex.ja.includes(word.word)) {
      return {
        blankedJa: ex.ja.split(word.word).join('（　　　）'),
        originalJa: ex.ja,
        translationVi: ex.vi || '',
        matchedPart: word.word,
      };
    }

    // 2. Khớp theo cách đọc Hiragana
    if (word.reading && ex.ja.includes(word.reading)) {
      return {
        blankedJa: ex.ja.split(word.reading).join('（　　　）'),
        originalJa: ex.ja,
        translationVi: ex.vi || '',
        matchedPart: word.reading,
      };
    }

    // 3. Khớp phần gốc Kanji đối với động từ / tính từ đã chia (Okurigana)
    const kanjiMatches = word.word.match(/[\u4e00-\u9faf]+/g);
    if (kanjiMatches && kanjiMatches.length > 0) {
      const mainKanji = kanjiMatches[0];
      const regex = new RegExp(mainKanji + '[\u3040-\u309f]{0,4}', 'g');
      const matches = ex.ja.match(regex);
      if (matches && matches.length > 0) {
        const target = matches[0];
        return {
          blankedJa: ex.ja.replace(target, '（　　　）'),
          originalJa: ex.ja,
          translationVi: ex.vi || '',
          matchedPart: target,
        };
      }
    }
  }

  // Fallback: nếu không khớp regex, dùng câu ví dụ đầu tiên
  const firstEx = word.examples[0];
  if (firstEx && firstEx.ja) {
    return {
      blankedJa: `（　　　）… ${firstEx.ja}`,
      originalJa: firstEx.ja,
      translationVi: firstEx.vi || '',
      matchedPart: word.word,
    };
  }

  return null;
};

export const TestRunnerScreen: React.FC = () => {
  const { lessons, currentLesson, testConfig, userProgress, setScreen, getWordKey, setMaziiQuery } = useApp();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Single selected option state (index of the ONE currently selected option)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasScoredCurrentQuestion, setHasScoredCurrentQuestion] = useState<boolean>(false);
  const [showVietnameseHint, setShowVietnameseHint] = useState<boolean>(true);

  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isExampleTest = testConfig.testType === 'vi_du';

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

    // Nếu là bài test qua câu ví dụ, lọc các từ có câu ví dụ
    if (isExampleTest) {
      scopedPool = scopedPool.filter((w) => w.examples && w.examples.length > 0);
    }

    // Handle empty filtered pool gracefully
    if (scopedPool.length === 0) {
      alert(
        isExampleTest
          ? 'Không tìm thấy từ vựng nào có câu ví dụ phù hợp với phạm vi bài test! Vui lòng chọn lại phạm vi.'
          : 'Không có từ vựng nào phù hợp với cài đặt phạm vi bài test! Vui lòng kiểm tra lại bộ lọc.'
      );
      setScreen('test_setup');
      return;
    }

    // Select questions from scopedPool
    let questionWords = [...scopedPool].sort(() => 0.5 - Math.random());
    if (testConfig.maxQuestions > 0 && questionWords.length > testConfig.maxQuestions) {
      questionWords = questionWords.slice(0, testConfig.maxQuestions);
    }

    const qTypes: TestQuestionType[] = isExampleTest 
      ? ['fill_in_blank']
      : ['kanji_to_meaning', 'meaning_to_word', 'fill_in_blank'];

    // Generate 4 options for each question STRICTLY from scopedPool
    const generatedQuestions: QuestionItem[] = questionWords.map((word, idx) => {
      const correctWord = word;
      let qType = qTypes[idx % qTypes.length];

      const blankRes = findBestBlank(correctWord);
      if (qType === 'fill_in_blank' && !blankRes) {
        qType = isExampleTest ? 'fill_in_blank' : 'kanji_to_meaning';
      }

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
      let qSubText = '';
      let originalSentence = '';
      let matchedPart = '';
      let correctAns = '';

      if (qType === 'fill_in_blank' && blankRes) {
        qText = blankRes.blankedJa;
        qSubText = blankRes.translationVi;
        originalSentence = blankRes.originalJa;
        matchedPart = blankRes.matchedPart;
        correctAns = word.word;
        opts = optionWords.map((w) => ({ text: w.word, wordObj: w }));
      } else if (qType === 'meaning_to_word') {
        qText = word.meaning;
        correctAns = word.word;
        opts = optionWords.map((w) => ({ text: w.word, wordObj: w }));
      } else {
        qText = word.word;
        correctAns = word.meaning;
        opts = optionWords.map((w) => ({ text: w.meaning, wordObj: w }));
      }

      return {
        word: correctWord,
        questionText: qText,
        questionSubText: qSubText,
        originalSentence,
        matchedPart,
        correctAnswer: correctAns,
        qType,
        options: opts,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
  }, [isExampleTest]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOptionIndex(null);
    setHasScoredCurrentQuestion(false);

    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    if (currentQ && currentQ.word) {
      if (currentQ.qType === 'kanji_to_meaning') {
        speakJapanese(currentQ.word.word);
      }
    }

    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, [currentIndex]);

  if (!currentQ) return null;

  const handleSelectOption = (idx: number) => {
    const option = currentQ.options[idx];
    if (!option) return;

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

    // Audio feedback
    playFeedbackSound(isCorrect ? 'correct' : 'wrong');
    speakJapanese(option.wordObj.word);

    // Tự động chuyển câu nếu bật autoNext và người dùng chọn đúng
    if (isCorrect && testConfig.autoNext) {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 1400);
    }
  };

  const handleNextQuestion = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePlaySentenceAudio = () => {
    if (currentQ.originalSentence) {
      speakJapanese(currentQ.originalSentence);
    } else {
      speakJapanese(currentQ.word.word);
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
            <h2 className="text-2xl font-black text-gray-900">
              {isExampleTest ? 'Kết Quả Test Qua Ví Dụ' : 'Kết Quả Bài Test Từ Vựng'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isExampleTest
                ? 'Hoàn thành bài kiểm tra chọn từ điền vào câu ví dụ'
                : 'Hoàn thành bài kiểm tra trắc nghiệm 4 lựa chọn'}
            </p>
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

            <button
              onClick={() => setScreen('test_setup')}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              Quay lại màn hình thiết lập test
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
        {/* Left Pill: Question Index & Mode Tag */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white border border-gray-200/90 rounded-2xl text-sm font-extrabold text-gray-900 shadow-sm min-w-[70px] text-center">
            {currentIndex + 1}/{questions.length}
          </div>
          {isExampleTest && (
            <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black rounded-xl">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Ví dụ</span>
            </span>
          )}
        </div>

        {/* Right Pills: Correct & Wrong count */}
        <div className="flex items-center gap-2">
          {/* Blue Pill: Đúng */}
          <div className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm">
            Đúng {score.correct}
          </div>

          {/* Red Pill: Sai */}
          <div className="px-3.5 py-1.5 bg-[#FF5252] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm">
            Sai {score.wrong}
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100/80 text-center mb-3 relative">
        {currentQ.qType === 'fill_in_blank' ? (
          <div className="space-y-3">
            {/* Header row in card */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-b border-gray-100 pb-2">
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Điền từ vào chỗ trống:</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Toggle Show/Hide Vietnamese Hint */}
                <button
                  onClick={() => setShowVietnameseHint(!showVietnameseHint)}
                  className={`p-1.5 rounded-lg transition ${
                    showVietnameseHint 
                      ? 'text-teal-600 hover:bg-teal-50' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={showVietnameseHint ? 'Ẩn dịch nghĩa tiếng Việt' : 'Hiện dịch nghĩa tiếng Việt'}
                >
                  {showVietnameseHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Speak Sentence Button */}
                <button
                  onClick={handlePlaySentenceAudio}
                  className="p-1.5 rounded-lg text-primary hover:bg-blue-50 transition"
                  title="Nghe câu ví dụ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sentence with Blank */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed font-japanese tracking-wide text-left pt-1">
              {currentQ.questionText.split('（　　　）').map((part, pIdx, arr) => (
                <React.Fragment key={pIdx}>
                  <span>{part}</span>
                  {pIdx < arr.length - 1 && (
                    <span className="inline-block mx-1.5 px-3 py-0.5 bg-blue-50 border-2 border-primary/60 text-primary font-black rounded-xl text-base shadow-sm">
                      （　？　）
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h2>

            {/* Vietnamese Translation (Toggleable) */}
            {currentQ.questionSubText && (
              <div className="text-left pt-1">
                {showVietnameseHint ? (
                  <p className="text-xs sm:text-sm text-gray-600 font-medium italic bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    💡 <b>Dịch:</b> {currentQ.questionSubText}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowVietnameseHint(true)}
                    className="text-[11px] text-gray-400 hover:text-primary underline"
                  >
                    Bấm để xem gợi ý dịch nghĩa tiếng Việt
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              {currentQ.qType === 'meaning_to_word' ? 'Chọn từ tiếng Nhật tương ứng:' : 'Chọn nghĩa tiếng Việt của từ:'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2563EB] leading-snug font-japanese">
              {currentQ.questionText}
            </h2>
          </div>
        )}
      </div>

      {/* 2x2 OPTIONS GRID */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isOptionCorrect = option.text === currentQ.correctAnswer;
          const hasAnswered = selectedOptionIndex !== null;

          let buttonStyle = 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 shadow-sm';

          if (hasAnswered) {
            if (isSelected) {
              if (isOptionCorrect) {
                buttonStyle = 'bg-[#DCFCE7] border-emerald-400 text-[#166534] font-bold shadow-md';
              } else {
                buttonStyle = 'bg-[#FF5252] border-transparent text-white font-bold shadow-md animate-shake';
              }
            } else if (isOptionCorrect) {
              // Highlight true correct option when user picked wrong
              buttonStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-bold';
            } else {
              buttonStyle = 'bg-white/70 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[72px] sm:min-h-[85px] p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all duration-150 flex flex-col items-center justify-center text-center active:scale-95 ${buttonStyle}`}
            >
              <span className={`text-base sm:text-lg font-bold ${
                (currentQ.qType === 'meaning_to_word' || currentQ.qType === 'fill_in_blank') ? 'font-japanese' : ''
              }`}>
                {option.text}
              </span>
              {(currentQ.qType === 'meaning_to_word' || currentQ.qType === 'fill_in_blank') && option.wordObj.reading !== option.wordObj.word && (
                <span className="text-[11px] opacity-75 font-japanese mt-0.5 font-medium">
                  {option.wordObj.reading}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button Below Grid: CÂU TIẾP */}
      <div className="flex justify-center mb-3">
        <button
          onClick={handleNextQuestion}
          disabled={selectedOptionIndex === null}
          className={`px-10 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedOptionIndex !== null
              ? 'bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <span>CÂU TIẾP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Result & Explanation Banner */}
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
                  <div>
                    <span className="font-extrabold text-base text-[#EF4444]">Chưa Chính Xác</span>
                    <span className="block text-xs font-bold text-gray-700">
                      Đáp án đúng: <b className="text-emerald-700 font-japanese font-black">{currentQ.correctAnswer}</b>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Cyan Avatar (Tra Mazii) & Speaker buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaziiQuery(currentQ.word.word)}
                className="w-8 h-8 rounded-full bg-[#00BCD4] hover:bg-cyan-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition"
                title="Tra từ điển Mazii"
              >
                <User className="w-4 h-4 fill-white text-[#00BCD4]" />
              </button>
              <button
                onClick={() => speakJapanese(currentQ.word.word)}
                className="w-8 h-8 rounded-full bg-[#00BCD4] hover:bg-cyan-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition"
                title="Phát âm từ"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Completed Sentence Preview if fill_in_blank */}
          {currentQ.qType === 'fill_in_blank' && currentQ.originalSentence && (
            <div className="p-3 bg-white/70 rounded-2xl border border-emerald-200/60 mb-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Câu hoàn chỉnh:</span>
                <button
                  onClick={() => speakJapanese(currentQ.originalSentence || '')}
                  className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px] font-bold"
                  title="Nghe lại toàn bộ câu"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe câu</span>
                </button>
              </div>
              <p className="text-sm font-bold text-gray-900 font-japanese leading-snug">
                {currentQ.originalSentence}
              </p>
              {currentQ.questionSubText && (
                <p className="text-xs text-gray-600 italic">
                  {currentQ.questionSubText}
                </p>
              )}
            </div>
          )}

          {/* Explanation Text Details for Target Word */}
          <div className="space-y-0.5 pt-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-xl font-black font-japanese ${isSelectedCorrect ? 'text-[#166534]' : 'text-gray-900'}`}>
                {currentQ.word.word}
              </span>
              <span className={`text-sm font-bold font-japanese ${isSelectedCorrect ? 'text-[#15803D]' : 'text-gray-600'}`}>
                「{currentQ.word.reading}」
              </span>
              {currentQ.word.han_viet && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded uppercase">
                  [{currentQ.word.han_viet}]
                </span>
              )}
            </div>
            <div className={`text-sm font-semibold ${isSelectedCorrect ? 'text-[#15803D]' : 'text-gray-700'}`}>
              {currentQ.word.meaning}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunnerScreen;
