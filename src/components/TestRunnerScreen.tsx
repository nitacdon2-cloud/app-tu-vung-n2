import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { 
  Volume2, Trophy, RotateCcw, User, CheckCircle2, Grid, 
  BookOpen, Eye, EyeOff, Sparkles, Check, ArrowRight, CornerDownLeft,
  Lightbulb, Languages, ExternalLink, HelpCircle
} from 'lucide-react';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState } from '../services/storageService';
import { getAllGrammar } from '../services/grammarDataLoader';
import { GrammarItem } from '../types/grammar';
import { getOfflineHanViet, openMaziiExternal } from '../services/maziiService';

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

// Trích xuất các từ khóa đặc trưng từ mẫu ngữ pháp để quét trong câu ví dụ
const extractSearchKeywords = (grammar: string): string[] => {
  const parts = grammar.split(/[・／/,、]/).map((p) => p.trim());
  const keywords: string[] = [];
  for (const part of parts) {
    const clean = part.replace(/[〜～~()（）\s]/g, '').trim();
    if (clean.length >= 2) {
      keywords.push(clean);
    }
  }
  return keywords;
};

// Tìm các mẫu ngữ pháp N2 xuất hiện trong câu ví dụ
const findGrammarInSentence = (sentence: string, allGrammar: GrammarItem[]): GrammarItem[] => {
  if (!sentence || sentence.length < 3) return [];
  const matched: { item: GrammarItem; score: number }[] = [];

  for (const g of allGrammar) {
    const keywords = extractSearchKeywords(g.grammar);
    let bestScore = 0;
    for (const kw of keywords) {
      if (sentence.includes(kw)) {
        if (kw.length > bestScore) {
          bestScore = kw.length;
        }
      }
    }
    if (bestScore > 0) {
      matched.push({ item: g, score: bestScore });
    }
  }

  // Ưu tiên mẫu dài hơn (độ khớp cao hơn)
  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, 2).map((m) => m.item);
};

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
  const [attemptedIndices, setAttemptedIndices] = useState<number[]>([]);
  const [hasScoredCurrentQuestion, setHasScoredCurrentQuestion] = useState<boolean>(false);
  
  // Trạng thái người dùng bấm xem trước gợi ý nghĩa trước khi trả lời (mặc định là ẨN)
  const [userRevealedHint, setUserRevealedHint] = useState<boolean>(false);

  // Tab phân tích sau khi trả lời: 'giai_thich' (Mặc định) | 'tu_vung' | 'ngu_phap'
  const [activeExplanationTab, setActiveExplanationTab] = useState<'giai_thich' | 'tu_vung' | 'ngu_phap'>('giai_thich');

  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

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
    setAttemptedIndices([]);
    setHasScoredCurrentQuestion(false);
    setUserRevealedHint(false);
    setActiveExplanationTab('giai_thich');

    if (currentQ && currentQ.word) {
      if (currentQ.qType === 'kanji_to_meaning') {
        speakJapanese(currentQ.word.word);
      }
    }
  }, [currentIndex]);

  const allGrammar = useMemo(() => getAllGrammar(), []);

  // Nhận diện mẫu ngữ pháp N2 xuất hiện trong câu ví dụ
  const matchedGrammar = useMemo(() => {
    if (!currentQ || !currentQ.originalSentence) return [];
    return findGrammarInSentence(currentQ.originalSentence, allGrammar);
  }, [currentQ, allGrammar]);

  // Quét các từ vựng N2 khác có trong câu ví dụ
  const sentenceWords = useMemo(() => {
    if (!currentQ || !currentQ.originalSentence) return [];
    const sentence = currentQ.originalSentence;
    const targetWord = currentQ.word.word;
    const found: Word[] = [];
    const seen = new Set<string>();
    seen.add(targetWord);

    for (const l of lessons) {
      for (const w of l.words) {
        if (w.word.length >= 2 && !seen.has(w.word) && sentence.includes(w.word)) {
          seen.add(w.word);
          found.push(w);
          if (found.length >= 4) break;
        }
      }
      if (found.length >= 4) break;
    }
    return found;
  }, [currentQ, lessons]);

  // Danh sách các phương án sai để đối chiếu giải thích
  const distractorOptions = useMemo(() => {
    if (!currentQ) return [];
    return currentQ.options.filter((opt) => opt.text !== currentQ.correctAnswer);
  }, [currentQ]);

  // Âm Hán Việt của từ đang kiểm tra
  const currentWordHanViet = useMemo(() => {
    if (!currentQ || !currentQ.word) return '';
    if (currentQ.word.han_viet) return currentQ.word.han_viet;
    return currentQ.word.word
      .split('')
      .filter((c) => '\u4e00' <= c && c <= '\u9fff')
      .map((k) => getOfflineHanViet(k))
      .filter(Boolean)
      .join(' ');
  }, [currentQ]);

  // Điều kiện hiển thị nghĩa tiếng Việt: Chỉ hiển thị sau khi đã trả lời hoặc chủ động bấm xem gợi ý
  const shouldShowTranslation = selectedOptionIndex !== null || userRevealedHint;

  if (!currentQ) return null;

  const handleSelectOption = (idx: number) => {
    const option = currentQ.options[idx];
    if (!option) return;

    setSelectedOptionIndex(idx);
    setAttemptedIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]));

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
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePlaySentenceAudio = () => {
    if (selectedOptionIndex !== null && currentQ.originalSentence) {
      speakJapanese(currentQ.originalSentence);
    } else if (currentQ.questionText) {
      // Trước khi trả lời, đọc lướt câu và chừa trống để không làm lộ đáp án
      speakJapanese(currentQ.questionText.replace(/（　　　）/g, ' '));
    } else {
      speakJapanese(currentQ.word.word);
    }
  };

  // Test Results Screen
  if (isFinished) {
    const totalQ = questions.length;
    const accuracy = totalQ > 0 ? Math.round((score.correct / totalQ) * 100) : 0;

    return (
      <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
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
    <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
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

            {/* Vietnamese Translation (Ẩn trước khi trả lời, hiện sau khi trả lời) */}
            {currentQ.questionSubText && (
              <div className="text-left pt-1">
                {shouldShowTranslation ? (
                  <p className="text-xs sm:text-sm text-gray-700 font-medium italic bg-teal-50/70 p-2.5 rounded-xl border border-teal-100 animate-in fade-in duration-200">
                    💡 <b>Dịch:</b> {currentQ.questionSubText}
                  </p>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <span className="text-[11px] text-gray-400 italic">
                      💡 Nghĩa, giải thích & ngữ pháp sẽ mở khóa sau khi bạn chọn đáp án
                    </span>
                    <button
                      onClick={() => setUserRevealedHint(true)}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-teal-50 transition flex-shrink-0"
                      title="Xem trước gợi ý dịch nghĩa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Gợi ý nghĩa</span>
                    </button>
                  </div>
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
          const isAttempted = attemptedIndices.includes(idx);

          let buttonStyle = 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 shadow-sm';

          if (isAttempted) {
            if (isOptionCorrect) {
              buttonStyle = isSelected
                ? 'bg-[#DCFCE7] border-emerald-500 text-[#166534] font-black shadow-md ring-2 ring-emerald-400'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
            } else {
              buttonStyle = isSelected
                ? 'bg-[#FF5252] border-rose-600 text-white font-bold shadow-md ring-2 ring-rose-400'
                : 'bg-rose-50 border-rose-300 text-rose-700 font-semibold';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[72px] sm:min-h-[85px] p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all duration-150 flex flex-col items-center justify-center text-center active:scale-95 cursor-pointer ${buttonStyle}`}
            >
              <span className={`text-base sm:text-lg font-bold ${
                (currentQ.qType === 'meaning_to_word' || currentQ.qType === 'fill_in_blank') ? 'font-japanese' : ''
              }`}>
                {option.text}
              </span>
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

      {/* Bottom Result & Explanation Card */}
      {activeOption && (
        <div
          className={`rounded-3xl p-4 sm:p-5 border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 space-y-3.5 ${
            isSelectedCorrect
              ? 'bg-[#DCFCE7]/90 border-emerald-300/80 text-[#166534]'
              : 'bg-[#FFF1F2]/95 border-rose-300/80 text-[#9F1239]'
          }`}
        >
          {/* Top Row: Icon + Status Text on left, Mazii & Speaker on right */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/50">
            <div className="flex items-center gap-2.5">
              {isSelectedCorrect ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20 flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-emerald-800">Chính Xác!</span>
                    <span className="block text-xs font-semibold text-emerald-700">
                      Rất tốt, bạn đã chọn đúng từ phù hợp với câu.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/20 flex-shrink-0">
                    ✕
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-rose-600">Chưa Chính Xác</span>
                    <span className="block text-xs font-bold text-gray-800">
                      Đáp án đúng: <b className="text-emerald-700 font-japanese font-black text-sm">{currentQ.correctAnswer}</b>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tra Mazii & Audio Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setMaziiQuery(currentQ.word.word)}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95"
                title="Tra từ điển Mazii"
              >
                <User className="w-4 h-4 fill-white" />
                <span className="hidden xs:inline">Tra Mazii</span>
              </button>
              <button
                onClick={() => speakJapanese(currentQ.word.word)}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs active:scale-95"
                title="Phát âm từ vựng"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Completed Sentence Preview if fill_in_blank */}
          {currentQ.originalSentence && (
            <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 shadow-xs space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Câu hoàn chỉnh:</span>
                </span>
                <button
                  onClick={() => speakJapanese(currentQ.originalSentence || '')}
                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 text-[11px] font-bold transition shadow-2xs active:scale-95"
                  title="Nghe lại toàn bộ câu"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nghe câu</span>
                </button>
              </div>
              <p className="text-base font-bold text-gray-900 font-japanese leading-relaxed">
                {currentQ.matchedPart ? (
                  currentQ.originalSentence.split(currentQ.matchedPart).map((part, pIdx, arr) => (
                    <React.Fragment key={pIdx}>
                      <span>{part}</span>
                      {pIdx < arr.length - 1 && (
                        <span className="inline-block mx-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-lg border border-emerald-300 shadow-2xs">
                          {currentQ.matchedPart}
                        </span>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  currentQ.originalSentence
                )}
              </p>
              {currentQ.questionSubText && (
                <p className="text-xs text-gray-700 font-medium italic pt-1 border-t border-gray-100">
                  💡 <b>Dịch nghĩa:</b> {currentQ.questionSubText}
                </p>
              )}
            </div>
          )}

          {/* 3 Nav Tabs: [Giải Thích] - [Từ Vựng] - [Ngữ Pháp] */}
          <div className="flex items-center gap-1 p-1 bg-white/80 rounded-2xl text-xs font-bold border border-gray-200/60 shadow-2xs">
            <button
              onClick={() => setActiveExplanationTab('giai_thich')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeExplanationTab === 'giai_thich'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Giải Thích</span>
            </button>

            <button
              onClick={() => setActiveExplanationTab('tu_vung')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeExplanationTab === 'tu_vung'
                  ? 'bg-teal-600 text-white shadow-xs font-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Từ Vựng</span>
            </button>

            <button
              onClick={() => setActiveExplanationTab('ngu_phap')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeExplanationTab === 'ngu_phap'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ngữ Pháp</span>
            </button>
          </div>

          {/* Tab 1: Giải Thích Chi Tiết & Dịch */}
          {activeExplanationTab === 'giai_thich' && (
            <div className="space-y-2.5 pt-1 text-left text-xs animate-in fade-in duration-150">
              <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-primary text-base font-japanese">
                    {currentQ.word.word}
                  </span>
                  {currentQ.word.reading && (
                    <span className="text-gray-600 font-bold font-japanese">
                      「{currentQ.word.reading}」
                    </span>
                  )}
                  {currentWordHanViet && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded uppercase">
                      [{currentWordHanViet}]
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-bold text-xs">
                  👉 <b>Ý nghĩa từ:</b> {currentQ.word.meaning}
                </p>
                {currentQ.word.word_type && (
                  <p className="text-gray-500 text-[11px]">
                    📌 <b>Từ loại:</b> {currentQ.word.word_type}
                  </p>
                )}
                <div className="text-gray-700 text-[11px] leading-relaxed border-t border-gray-100 pt-2 space-y-1">
                  <p>
                    💬 <b>Lý do chọn:</b> Trong câu ví dụ trên, ngữ cảnh yêu cầu một từ có nghĩa là <b>"{currentQ.word.meaning}"</b> để ghép với câu tạo thành ý nghĩa hoàn chỉnh: <i>"{currentQ.questionSubText}"</i>.
                  </p>
                </div>
              </div>

              {/* So sánh với các phương án còn lại */}
              {distractorOptions.length > 0 && (
                <div className="p-3 bg-white/80 rounded-2xl border border-gray-200/70 space-y-2 shadow-2xs">
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">
                    Đối chiếu các phương án còn lại:
                  </span>
                  <div className="space-y-1.5">
                    {distractorOptions.map((opt, oIdx) => {
                      const optHanViet = opt.wordObj.han_viet || opt.wordObj.word.split('').filter(c => '\u4e00' <= c && c <= '\u9fff').map(k => getOfflineHanViet(k)).filter(Boolean).join(' ');
                      return (
                        <div key={oIdx} className="p-2 bg-gray-50 rounded-xl border border-gray-200/70 flex items-start justify-between gap-2 text-[11px]">
                          <div>
                            <span className="font-bold text-gray-900 font-japanese mr-1">
                              {opt.wordObj.word}
                            </span>
                            {opt.wordObj.reading && (
                              <span className="text-gray-500 mr-1 font-japanese">
                                ({opt.wordObj.reading})
                              </span>
                            )}
                            {optHanViet && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded uppercase mr-1">
                                [{optHanViet}]
                              </span>
                            )}
                            <span className="text-gray-700 font-medium">
                              : {opt.wordObj.meaning}
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-500 font-bold flex-shrink-0">
                            ✕ Không hợp nghĩa
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Từ Vựng Trong Câu */}
          {activeExplanationTab === 'tu_vung' && (
            <div className="space-y-2.5 pt-1 text-left text-xs animate-in fade-in duration-150">
              {/* Từ vựng trọng tâm */}
              <div className="p-3 bg-white/90 rounded-2xl border border-teal-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">
                    Từ vựng trọng tâm:
                  </span>
                  <button
                    onClick={() => speakJapanese(currentQ.word.word)}
                    className="text-teal-700 hover:text-teal-900 flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Phát âm</span>
                  </button>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black text-gray-900 font-japanese">
                    {currentQ.word.word}
                  </span>
                  {currentQ.word.reading && (
                    <span className="text-sm font-bold text-teal-700 font-japanese">
                      「{currentQ.word.reading}」
                    </span>
                  )}
                  {currentWordHanViet && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded uppercase">
                      [{currentWordHanViet}]
                    </span>
                  )}
                </div>
                <p className="text-gray-800 font-bold text-xs">
                  {currentQ.word.meaning}
                </p>
                {currentQ.word.word_type && (
                  <p className="text-gray-500 text-[10px]">
                    Từ loại: {currentQ.word.word_type}
                  </p>
                )}
              </div>

              {/* Các từ vựng N2 khác trong câu */}
              {sentenceWords.length > 0 ? (
                <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">
                    Các từ vựng khác xuất hiện trong câu:
                  </span>
                  <div className="space-y-1.5">
                    {sentenceWords.map((sw, sIdx) => {
                      const sHanViet = sw.han_viet || sw.word.split('').filter(c => '\u4e00' <= c && c <= '\u9fff').map(k => getOfflineHanViet(k)).filter(Boolean).join(' ');
                      return (
                        <div key={sIdx} className="p-2 bg-gray-50 rounded-xl border border-gray-200/70 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 font-japanese text-sm">
                                {sw.word}
                              </span>
                              {sw.reading && (
                                <span className="text-gray-500 text-xs font-japanese">
                                  ({sw.reading})
                                </span>
                              )}
                              {sHanViet && (
                                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded uppercase">
                                  [{sHanViet}]
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-xs mt-0.5 truncate">
                              {sw.meaning}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => openMaziiExternal(sw.word, 'word')}
                              className="p-1.5 text-cyan-600 hover:text-cyan-800 rounded-lg hover:bg-cyan-50 transition"
                              title="Tra Mazii"
                            >
                              <User className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => speakJapanese(sw.word)}
                              className="p-1.5 text-gray-400 hover:text-primary transition"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/70 rounded-2xl border border-gray-200 text-center text-gray-500 text-[11px]">
                  Câu ví dụ ngắn gọn, tập trung chủ yếu vào từ vựng trọng tâm trên.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Ngữ Pháp Câu */}
          {activeExplanationTab === 'ngu_phap' && (
            <div className="space-y-2.5 pt-1 text-left text-xs animate-in fade-in duration-150">
              {matchedGrammar.length > 0 ? (
                <div className="space-y-2">
                  {matchedGrammar.map((gm, gIdx) => (
                    <div key={gIdx} className="p-3 bg-white/95 rounded-2xl border border-purple-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-black text-[10px] rounded-md uppercase">
                          Ngữ pháp N2 {gm.code ? `(${gm.code})` : ''}
                        </span>
                        <span className="text-xs font-black text-purple-700 font-japanese">
                          {gm.grammar}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm font-japanese">
                        {gm.title}
                      </h4>
                      <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1">
                        <p className="font-bold text-purple-900">
                          💡 <b>Ý nghĩa:</b> {gm.meaning}
                        </p>
                        {gm.connection && (
                          <p className="text-gray-700 text-[11px]">
                            🔗 <b>Cấu trúc kết nối:</b> <span className="font-mono font-medium">{gm.connection}</span>
                          </p>
                        )}
                      </div>
                      {gm.explanation && (
                        <p className="text-gray-700 text-[11px] whitespace-pre-line leading-relaxed pt-0.5">
                          {gm.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">
                    Cấu trúc câu & Điểm ngữ pháp sử dụng:
                  </span>
                  <p className="text-gray-800 text-xs leading-relaxed">
                    Câu ví dụ này kết hợp các trợ từ tiếng Nhật chuẩn xác để biểu đạt quan hệ giữa các thành phần trong câu:
                  </p>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1.5 text-[11px] text-gray-700">
                    <p>• <b>Chủ ngữ & Trạng từ:</b> Bổ nghĩa về thời gian, địa điểm hoặc mức độ của hành động.</p>
                    <p>• <b>Trợ từ kết nối:</b> Sử dụng các trợ từ quen thuộc như を (tân ngữ trực tiếp), に (mục tiêu/đối tượng), で (nơi chốn/phương tiện)...</p>
                    <p>• <b>Thể của từ:</b> Từ vựng được kết hợp hài hòa theo ngữ cảnh tự nhiên của kỳ thi JLPT N2.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestRunnerScreen;
