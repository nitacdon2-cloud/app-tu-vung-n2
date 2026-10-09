import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ExamQuestion } from '../types/test';
import { 
  Clock, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  Flag, ChevronLeft, ChevronRight, Send, RotateCcw, 
  Award, Trophy, Check, ListChecks, HelpCircle
} from 'lucide-react';

export const ExamRunnerScreen: React.FC = () => {
  const { selectedExam, saveExamResultRecord, setScreen, setActiveModule } = useApp();

  if (!selectedExam) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-600 mb-4">Không tìm thấy bài thi được chọn.</p>
        <button
          onClick={() => {
            setActiveModule('test');
            setScreen('test_center');
          }}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm"
        >
          Quay lại Kho Đề
        </button>
      </div>
    );
  }

  const totalQuestions = selectedExam.questions.length;
  const initialTimeSeconds = totalQuestions * 60; // 1 min per question

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubmitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = selectedExam.questions[currentIndex];

  // Select an answer
  const handleSelectAnswer = (choiceIndex: number) => {
    if (isSubmitted && !isReviewMode) return;
    if (isSubmitted && isReviewMode) return; // Read-only in review

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choiceIndex,
    }));
  };

  // Toggle Flag
  const handleToggleFlag = (id: number) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Submit Exam Calculation
  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0;
    selectedExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) {
        score++;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const timeSpent = initialTimeSeconds - timeLeft;

    const dateStr = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const testType = selectedExam.test_id.startsWith('vocab_') ? 'vocab' : 'kanji';

    saveExamResultRecord({
      test_id: selectedExam.test_id,
      test_type: testType,
      score,
      total: totalQuestions,
      percentage,
      date: dateStr,
      time_spent_seconds: timeSpent,
      user_answers: userAnswers,
    });

    setIsSubmitted(true);
    setShowConfirmModal(false);
  };

  // Retake exam
  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedIds(new Set());
    setTimeLeft(initialTimeSeconds);
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsReviewMode(false);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Score summary values
  const scoreResult = useMemo(() => {
    if (!isSubmitted) return { score: 0, percentage: 0 };
    let score = 0;
    selectedExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) score++;
    });
    return {
      score,
      percentage: Math.round((score / totalQuestions) * 100),
    };
  }, [isSubmitted, userAnswers, selectedExam, totalQuestions]);

  // Choice label (A, B, C, D)
  const choiceLetters = ['1', '2', '3', '4'];

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (!isSubmitted) setShowExitModal(true);
              else {
                setActiveModule('test');
                setScreen('test_center');
              }
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
            title="Thoát bài thi"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              {selectedExam.title}
            </h2>
            <div className="text-[11px] text-slate-500 font-medium">
              {isSubmitted ? 'Xem lại kết quả' : `Câu ${currentIndex + 1} / ${totalQuestions}`}
            </div>
          </div>
        </div>

        {/* Center / Right: Timer & Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isSubmitted && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs sm:text-sm font-black border transition ${
              timeLeft < 300
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveModule('test');
                setScreen('test_center');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Về Kho Đề
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {isSubmitted && !isReviewMode ? (
        /* Result Summary Screen */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            {/* Trophy Icon */}
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4 bg-gradient-to-tr from-amber-400 to-yellow-300 text-white">
              <Trophy className="w-10 h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Kết Quả Bài Thi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedExam.title}
            </p>

            {/* Score Ring / Card */}
            <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-4xl sm:text-5xl font-black text-indigo-600">
                {scoreResult.score} <span className="text-xl sm:text-2xl text-slate-400 font-bold">/ {totalQuestions}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-700 mt-1">
                Độ chính xác: <span className={scoreResult.percentage >= 80 ? 'text-emerald-600' : scoreResult.percentage >= 50 ? 'text-blue-600' : 'text-amber-600'}>{scoreResult.percentage}%</span>
              </div>

              {/* Assessment Message */}
              <div className="mt-3 text-xs font-semibold text-slate-500">
                {scoreResult.percentage >= 90
                  ? '🌟 Xuất sắc! Bạn đã nắm rất vững kiến thức phần này.'
                  : scoreResult.percentage >= 70
                  ? '👏 Rất tốt! Tiếp tục phát huy và ôn lại các câu chưa đúng nhé.'
                  : '💪 Hãy xem lại các câu sai để ghi nhớ từ vựng và chữ Hán tốt hơn.'}
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center justify-between">
                <span>Số câu đúng</span>
                <span className="text-sm font-black">{scoreResult.score}</span>
              </div>
              <div className="p-3 bg-red-50 text-red-800 rounded-xl font-bold flex items-center justify-between">
                <span>Số câu sai</span>
                <span className="text-sm font-black">{totalQuestions - scoreResult.score}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setIsReviewMode(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center justify-center gap-2"
              >
                <ListChecks className="w-4 h-4" />
                <span>Xem lại đáp án chi tiết</span>
              </button>

              <button
                onClick={handleRetake}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại đề này</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Question Answering View / Review View */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Question Column */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between">
              <div>
                {/* Question Type & Flag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-indigo-100 text-indigo-700">
                      Câu {currentIndex + 1}
                    </span>
                    {currentQ.type && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700">
                        {currentQ.type === 'reading' ? 'Chọn cách đọc' : currentQ.type === 'writing' ? 'Chọn chữ Hán' : 'Điền từ'}
                      </span>
                    )}
                  </div>

                  {!isSubmitted && (
                    <button
                      onClick={() => handleToggleFlag(currentQ.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        flaggedIds.has(currentQ.id)
                          ? 'bg-amber-100 text-amber-700 font-black'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${flaggedIds.has(currentQ.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{flaggedIds.has(currentQ.id) ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  )}
                </div>

                {/* Question Prompt Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-4">
                  <p className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Choices (4 Options) */}
                <div className="space-y-3">
                  {currentQ.choices.map((choice, idx) => {
                    const choiceNum = idx + 1;
                    const isSelected = userAnswers[currentQ.id] === choiceNum;
                    const isCorrectAnswer = currentQ.correct_answer === choiceNum;

                    // Styling in Review mode vs Exam mode
                    let buttonClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';
                    let letterClass = 'bg-slate-100 text-slate-700';

                    if (isSubmitted) {
                      if (isCorrectAnswer) {
                        buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm';
                        letterClass = 'bg-emerald-600 text-white';
                      } else if (isSelected && !isCorrectAnswer) {
                        buttonClass = 'bg-red-50 border-red-500 text-red-950 shadow-sm line-through';
                        letterClass = 'bg-red-600 text-white';
                      } else {
                        buttonClass = 'bg-white border-slate-200 text-slate-400 opacity-70';
                      }
                    } else if (isSelected) {
                      buttonClass = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-sm ring-2 ring-indigo-500/20';
                      letterClass = 'bg-indigo-600 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(choiceNum)}
                        disabled={isSubmitted}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] ${buttonClass}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 transition ${letterClass}`}>
                            {choiceLetters[idx]}
                          </div>
                          <span className="text-sm sm:text-base font-medium">{choice}</span>
                        </div>

                        {/* Status Icon */}
                        {isSubmitted ? (
                          isCorrectAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          ) : null
                        ) : isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Nav Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition flex items-center gap-1.5"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : !isSubmitted ? (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition flex items-center gap-1.5"
                  >
                    <span>Nộp bài</span>
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsReviewMode(false);
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                  >
                    Xem tổng kết
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar (Right on desktop, Bottom/Scroll on mobile) */}
          <div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-between flex-shrink-0 z-20">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Bảng câu hỏi ({totalQuestions})
                </h4>
                <div className="text-[11px] font-bold text-indigo-600">
                  {answeredCount}/{totalQuestions} đã làm
                </div>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-7 sm:grid-cols-5 md:grid-cols-5 gap-2 max-h-48 md:max-h-[calc(100vh-280px)] overflow-y-auto p-1">
                {selectedExam.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = currentIndex === idx;
                  const isFlagged = flaggedIds.has(q.id);
                  const isCorrect = isSubmitted && userAnswers[q.id] === q.correct_answer;
                  const isWrong = isSubmitted && isAnswered && !isCorrect;

                  let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

                  if (isSubmitted) {
                    if (isCorrect) btnStyle = 'bg-emerald-500 text-white font-bold';
                    else if (isWrong) btnStyle = 'bg-red-500 text-white font-bold';
                    else btnStyle = 'bg-slate-200 text-slate-400';
                  } else {
                    if (isCurrent) btnStyle = 'bg-indigo-600 text-white font-black ring-2 ring-indigo-400 shadow';
                    else if (isFlagged) btnStyle = 'bg-amber-400 text-slate-900 font-black';
                    else if (isAnswered) btnStyle = 'bg-indigo-100 text-indigo-800 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition active:scale-95 relative ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {!isSubmitted && isFlagged && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-indigo-100" />
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-slate-100" />
                <span>Chưa làm</span>
              </div>
              {!isSubmitted && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-amber-400" />
                  <span>Đánh dấu</span>
                </div>
              )}
              {isSubmitted && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-md bg-emerald-500" />
                    <span>Đúng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-md bg-red-500" />
                    <span>Sai</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">
              Xác nhận nộp bài thi
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Bạn có chắc chắn muốn hoàn thành bài thi này?
            </p>

            <div className="my-4 p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Số câu đã trả lời:</span>
                <span className="font-bold text-indigo-600">{answeredCount}/{totalQuestions}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between font-bold text-amber-600">
                  <span>Số câu chưa trả lời:</span>
                  <span>{unansweredCount} câu</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-slate-600">
                <span>Thời gian còn lại:</span>
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Làm tiếp
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow transition"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">
              Thoát khỏi bài thi?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Bài thi chưa được nộp. Nếu thoát bây giờ, các câu trả lời hiện tại sẽ không được lưu điểm.
            </p>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Ở lại làm tiếp
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setActiveModule('test');
                  setScreen('test_center');
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow transition"
              >
                Vẫn thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
