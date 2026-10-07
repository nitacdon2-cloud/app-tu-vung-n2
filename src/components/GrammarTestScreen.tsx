import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem, GrammarQuestion, GrammarQuestionType } from '../types/grammar';
import { getGrammarChapters } from '../services/grammarDataLoader';
import { recordGrammarTestAnswer } from '../services/grammarDataLoader';
import { playFeedbackSound, speakJapanese } from '../services/audioService';
import { 
  ArrowLeft, RotateCcw, Trophy, CheckCircle2, XCircle, 
  HelpCircle, Volume2, Star, BookOpen, Layers, Play 
} from 'lucide-react';

export const GrammarTestScreen: React.FC = () => {
  const {
    grammarList,
    grammarProgress,
    setGrammarProgress,
    currentGrammarChapter,
    setScreen,
    getGrammarStateHelper,
  } = useApp();

  // Test setup states
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<number[]>(
    currentGrammarChapter > 0 ? [currentGrammarChapter] : []
  );
  const [testType, setTestType] = useState<'all' | 'meaning' | 'connection'>('all');
  const [testRange, setTestRange] = useState<'tat_ca' | 'chua_nho' | 'thich'>('tat_ca');
  const [questionCount, setQuestionCount] = useState<number>(20);

  // Test runner states
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const chapters = useMemo(() => getGrammarChapters(), []);

  const toggleChapter = (ch: number) => {
    setSelectedChapters(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  // Generate test questions
  const handleStartTest = () => {
    let pool = grammarList;

    // Filter by chapters
    if (selectedChapters.length > 0) {
      pool = pool.filter(g => selectedChapters.includes(g.chapter));
    }

    // Filter by range
    if (testRange === 'chua_nho') {
      pool = pool.filter(g => getGrammarStateHelper(g).status !== 'da_nho');
    } else if (testRange === 'thich') {
      pool = pool.filter(g => getGrammarStateHelper(g).is_favorite);
    }

    if (pool.length < 4) {
      alert('Không đủ ngữ pháp trong phạm vi đã chọn để tạo bài test trắc nghiệm (cần tối thiểu 4 ngữ pháp). Vui lòng chọn thêm chương!');
      return;
    }

    // Shuffle pool
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const count = questionCount > 0 ? Math.min(questionCount, shuffledPool.length) : shuffledPool.length;
    const selectedGrammars = shuffledPool.slice(0, count);

    // Generate questions
    const generated: GrammarQuestion[] = selectedGrammars.map((target, idx) => {
      // Decide question type: 'choose_meaning' vs 'choose_connection'
      let qType: GrammarQuestionType;
      if (testType === 'meaning') {
        qType = 'choose_meaning';
      } else if (testType === 'connection') {
        qType = 'choose_connection';
      } else {
        qType = idx % 2 === 0 ? 'choose_meaning' : 'choose_connection';
      }

      if (qType === 'choose_meaning') {
        // Distractors from other grammar meanings
        const otherMeanings = grammarList
          .filter(g => g.id !== target.id && g.meaning && g.meaning !== target.meaning)
          .map(g => g.meaning);
        const distractors = [...new Set(otherMeanings)]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const options = [target.meaning, ...distractors].sort(() => 0.5 - Math.random());

        return {
          grammarItem: target,
          qType,
          questionTitle: target.grammar,
          questionSub: 'Chọn ý nghĩa tiếng Việt chính xác của ngữ pháp trên:',
          correctAnswer: target.meaning,
          options,
          explanation: `• Cách chia: ${target.connection}\n• Nghĩa: ${target.meaning}\n${target.explanation}`,
        };
      } else {
        // Distractors from other grammar connections
        const otherConnections = grammarList
          .filter(g => g.id !== target.id && g.connection && g.connection !== target.connection)
          .map(g => g.connection);
        const distractors = [...new Set(otherConnections)]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const options = [target.connection, ...distractors].sort(() => 0.5 - Math.random());

        return {
          grammarItem: target,
          qType,
          questionTitle: target.grammar,
          questionSub: 'Chọn dạng kết hợp / cách chia đúng của ngữ pháp trên:',
          correctAnswer: target.connection,
          options,
          explanation: `• Cách chia đúng: ${target.connection}\n• Nghĩa: ${target.meaning}\n${target.explanation}`,
        };
      }
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
    setIsTestStarted(true);
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;

    setSelectedOption(optIdx);
    setIsAnswered(true);

    const chosenText = currentQ.options[optIdx];
    const isCorrect = chosenText === currentQ.correctAnswer;

    if (isCorrect) {
      playFeedbackSound('correct');
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      playFeedbackSound('wrong');
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    // Save test answer
    const updated = recordGrammarTestAnswer(grammarProgress, currentQ.grammarItem.id, isCorrect);
    setGrammarProgress(updated);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  // ==================== SETUP VIEW ====================
  if (!isTestStarted) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col p-4 sm:p-6 max-w-xl mx-auto w-full select-none pb-12 overflow-y-auto space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setScreen('grammar_list')}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách thẻ</span>
          </button>
          <span className="text-xs font-bold text-gray-400">Thiết Lập Bài Kiểm Tra</span>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-6 shadow-xl text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-amber-300">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black">Bài Test Ngữ Pháp N2</h2>
          <p className="text-xs text-blue-100 max-w-sm mx-auto">
            Hỗ trợ 2 dạng câu hỏi cốt lõi: <strong>Chọn nghĩa đúng</strong> và <strong>Chọn cách chia đúng</strong>.
          </p>
        </div>

        {/* 1. Chọn Dạng Câu Hỏi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>1. Dạng Câu Hỏi Trong Bài Test</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTestType('all')}
              className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                testType === 'all'
                  ? 'bg-blue-50 border-primary text-primary shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cả 2 Dạng (Hỗn Hợp)
            </button>
            <button
              onClick={() => setTestType('meaning')}
              className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                testType === 'meaning'
                  ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chọn Nghĩa Đúng
            </button>
            <button
              onClick={() => setTestType('connection')}
              className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                testType === 'connection'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chọn Cách Chia Đúng
            </button>
          </div>
        </div>

        {/* 2. Chọn Phạm Vi Chương */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>2. Chọn Chương ({selectedChapters.length > 0 ? `${selectedChapters.length} chương` : 'Tất cả 19 chương'})</span>
            </h3>
            <button
              onClick={() => {
                if (selectedChapters.length === chapters.length) {
                  setSelectedChapters([]);
                } else {
                  setSelectedChapters(chapters.map(c => c.chapter));
                }
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              {selectedChapters.length === chapters.length ? 'Bỏ chọn' : 'Chọn hết'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {chapters.map(c => {
              const isSelected = selectedChapters.includes(c.chapter);
              return (
                <button
                  key={c.chapter}
                  onClick={() => toggleChapter(c.chapter)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                    isSelected
                      ? 'bg-blue-50 border-primary text-primary shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="line-clamp-1">{c.title}</div>
                  <div className="text-[10px] text-gray-400 font-normal">{c.count} ngữ pháp</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Phạm Vi & Số Lượng Câu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Phạm Vi Từ Vựng</h4>
            <div className="space-y-1.5">
              {[
                { id: 'tat_ca', label: 'Tất cả ngữ pháp' },
                { id: 'chua_nho', label: '⏳ Chỉ câu chưa nhớ' },
                { id: 'thich', label: '⭐ Đã đánh dấu sao' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setTestRange(r.id as any)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition ${
                    testRange === r.id
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Số Lượng Câu Hỏi</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[10, 20, 30, 0].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                    questionCount === cnt
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cnt === 0 ? 'Tất cả' : `${cnt} câu`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartTest}
          className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>BẮT ĐẦU BÀI TEST NGỮ PHÁP</span>
        </button>
      </div>
    );
  }

  // ==================== TEST FINISHED SUMMARY ====================
  if (isFinished) {
    const totalQ = questions.length;
    const accuracy = totalQ > 0 ? Math.round((score.correct / totalQ) * 100) : 0;

    return (
      <div className="flex-1 bg-gray-50 flex flex-col justify-center p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-12 overflow-y-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {accuracy >= 80 ? '🎉 Xuất Sắc Hoàn Thành!' : 'Hoàn Thành Bài Test!'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Bạn đã hoàn thành kiểm tra {totalQ} câu hỏi ngữ pháp N2.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="text-3xl font-black text-emerald-600">{score.correct}</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">Trả lời đúng</div>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <div className="text-3xl font-black text-rose-600">{score.wrong}</div>
              <div className="text-xs font-bold text-rose-700 mt-0.5">Lần chọn sai</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
            <div className="text-4xl font-black text-primary">{accuracy}%</div>
            <div className="text-xs font-bold text-blue-700 mt-1">Độ chính xác bài test</div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleStartTest}
              className="w-full py-4 bg-primary hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Lại Bài Test Này</span>
            </button>

            <button
              onClick={() => setIsTestStarted(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition"
            >
              Đổi Cài Đặt Bài Test
            </button>

            <button
              onClick={() => setScreen('grammar_flashcard')}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition"
            >
              Ôn Lại Bằng Flashcard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TEST RUNNER VIEW ====================
  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-3 sm:p-5 max-w-xl mx-auto w-full select-none pb-8 overflow-y-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs font-extrabold text-gray-800 shadow-sm">
          Câu {currentIndex + 1} / {questions.length}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">
            Đúng {score.correct}
          </div>
          <div className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm">
            Sai {score.wrong}
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-100 text-center space-y-3 relative">
        {/* Question Type Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            currentQ.qType === 'choose_meaning'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
          }`}>
            {currentQ.qType === 'choose_meaning' ? '📖 Chọn Nghĩa Đúng' : '🧩 Chọn Cách Chia Đúng'}
          </span>

          <span className="text-[11px] font-bold text-gray-400 font-mono">
            {currentQ.grammarItem.chapter_title} • #{currentQ.grammarItem.code}
          </span>
        </div>

        {/* Grammar Question Title */}
        <div className="py-2 space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-japanese tracking-wide">
            {currentQ.questionTitle}
          </h2>
          <p className="text-xs text-gray-500 font-medium pt-1">
            {currentQ.questionSub}
          </p>
        </div>

        <button
          onClick={() => speakJapanese(currentQ.grammarItem.grammar)}
          className="p-2 text-primary hover:bg-blue-50 rounded-full transition inline-flex items-center gap-1 text-xs font-semibold"
          title="Nghe phát âm ngữ pháp"
        >
          <Volume2 className="w-4 h-4" />
          <span>Nghe phát âm</span>
        </button>
      </div>

      {/* 4 ANSWER OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isTargetCorrect = opt === currentQ.correctAnswer;

          let btnStyle = 'bg-white border-gray-200 hover:border-blue-400 text-gray-800 shadow-sm';

          if (isAnswered) {
            if (isSelected) {
              if (isTargetCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-lg ring-2 ring-emerald-400';
              } else {
                btnStyle = 'bg-rose-500 border-rose-600 text-white font-black shadow-lg ring-2 ring-rose-400';
              }
            } else if (isTargetCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-between gap-2.5 active:scale-95 ${btnStyle} ${
                currentQ.qType === 'choose_connection' ? 'font-japanese' : ''
              }`}
            >
              <span className="line-clamp-3">{opt}</span>
              {isAnswered && isTargetCorrect && (
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner & CÂU TIẾP button */}
      {isAnswered && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-primary uppercase tracking-wider flex items-center gap-1 text-[11px]">
                <BookOpen className="w-3.5 h-3.5" /> Giải thích đáp án đúng:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                {currentQ.grammarItem.code}
              </span>
            </div>
            <div className="space-y-1 pt-0.5">
              <p className="font-bold text-gray-900">
                • <span className="text-primary font-black">Ngữ pháp:</span> {currentQ.grammarItem.grammar}
              </p>
              <p className="font-bold text-blue-900 font-japanese">
                • <span className="text-blue-700 font-semibold">Cách chia:</span> {currentQ.grammarItem.connection}
              </p>
              <p className="font-bold text-amber-950">
                • <span className="text-amber-800 font-semibold">Nghĩa:</span> {currentQ.grammarItem.meaning}
              </p>
              {currentQ.grammarItem.examples && currentQ.grammarItem.examples[0] && (
                <p className="text-gray-700 font-japanese italic bg-white/70 p-2 rounded-xl border border-blue-100 mt-1">
                  Ví dụ: {currentQ.grammarItem.examples[0]}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/25 transition active:scale-95 cursor-pointer"
          >
            CÂU TIẾP THEO ➔
          </button>
        </div>
      )}
    </div>
  );
};
