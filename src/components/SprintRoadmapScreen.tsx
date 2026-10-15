import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SPRINT_PLAN_DATA, DayPlanItem } from '../data/sprintPlanData';
import { 
  Target, CheckCircle2, Circle, Calendar, BookOpen, Sparkles, 
  Headphones, ChevronRight, Filter, Award, RotateCcw, AlertCircle,
  Clock, ArrowUpRight
} from 'lucide-react';

const STORAGE_KEY = 'jmaster_sprint_progress_v1';

export const SprintRoadmapScreen: React.FC = () => {
  const { 
    setScreen, setCurrentLessonId, setCurrentGrammarChapter, 
    setActiveModule, lessons 
  } = useApp();

  // Load progress from localStorage: array of completed day numbers
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activePhaseFilter, setActivePhaseFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDays));
    } catch (e) {
      console.error('Failed to save sprint progress', e);
    }
  }, [completedDays]);

  const toggleDay = (day: number) => {
    setCompletedDays((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleResetProgress = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ lộ trình 53 ngày không?')) {
      setCompletedDays([]);
    }
  };

  // Jump to Vocab Lesson
  const handleGoToVocab = (lessonId?: string) => {
    if (!lessonId) {
      setActiveModule('vocab');
      setScreen('lesson_grid');
      return;
    }
    // Find lesson in loaded lessons
    const found = lessons.find((l) => l.lesson_id === lessonId);
    if (found) {
      setCurrentLessonId(found.lesson_id);
      setActiveModule('vocab');
      setScreen('word_list');
    } else {
      setActiveModule('vocab');
      setScreen('lesson_grid');
    }
  };

  // Jump to Grammar Chapter
  const handleGoToGrammar = (chapter?: number) => {
    if (chapter) {
      setCurrentGrammarChapter(chapter);
    }
    setActiveModule('grammar');
    setScreen('grammar_list');
  };

  // Filtered days
  const filteredDays = useMemo(() => {
    return SPRINT_PLAN_DATA.filter((item) => {
      if (activePhaseFilter !== 'all' && item.phase !== activePhaseFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          `d${item.day}`.includes(q) ||
          `ngày ${item.day}`.includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.vocabTask.toLowerCase().includes(q) ||
          item.grammarTask.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activePhaseFilter, searchQuery]);

  const totalDays = SPRINT_PLAN_DATA.length; // 53
  const completedCount = completedDays.length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto pb-16">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Mục tiêu: 95 – 100 Điểm N2</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                Lộ Trình Tác Chiến 53 Ngày Đỗ N2
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Kế hoạch từng ngày thực chiến — Đánh dấu hoàn thành để kiểm soát nhịp độ thi đấu.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex items-center gap-4 min-w-[200px] justify-between">
              <div>
                <div className="text-[11px] text-blue-200 font-medium">Tiến độ tổng thể</div>
                <div className="text-2xl font-black text-white">
                  {completedCount}<span className="text-sm font-normal text-blue-200"> / {totalDays} ngày</span>
                </div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/20"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-amber-400"
                    fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-amber-300">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="mt-4 bg-black/20 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Phase Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActivePhaseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activePhaseFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả (53)
            </button>
            <button
              onClick={() => setActivePhaseFilter(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activePhaseFilter === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              GĐ 1: Nạp Tốc Hành (D1-D20)
            </button>
            <button
              onClick={() => setActivePhaseFilter(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activePhaseFilter === 2
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              GĐ 2: Power Drill (D21-D40)
            </button>
            <button
              onClick={() => setActivePhaseFilter(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activePhaseFilter === 3
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              GĐ 3: Đề Thi Thật (D41-D53)
            </button>
          </div>

          {/* Search box & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm ngày (vd: 1, D5, tiền tố...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 sm:w-56 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {completedCount > 0 && (
              <button
                onClick={handleResetProgress}
                title="Đặt lại tiến độ"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Days List */}
      <div className="max-w-4xl mx-auto w-full px-4 py-5 flex flex-col gap-3.5">
        {filteredDays.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không tìm thấy ngày nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          filteredDays.map((item) => {
            const isDone = completedDays.includes(item.day);

            return (
              <div
                key={item.day}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-sm opacity-90'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {/* Header Row: Day badge, Title, Main Checkbox */}
                <div 
                  onClick={() => toggleDay(item.day)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-transparent to-gray-50/50 hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                        isDone ? 'text-emerald-600' : 'text-gray-300 hover:text-blue-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          NGÀY {item.day}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                          {item.phaseTitle}
                        </span>
                      </div>
                      <h3 className={`text-sm sm:text-base font-bold mt-0.5 ${
                        isDone ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {isDone ? (
                      <span className="text-emerald-600 hidden sm:inline">Đã hoàn thành</span>
                    ) : (
                      <span className="text-gray-400 hidden sm:inline">Bấm để đánh dấu</span>
                    )}
                  </div>
                </div>

                {/* Task Breakdown Grid */}
                <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-gray-700 border-t border-gray-100/80">
                  {/* Task 1: Vocab */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-gray-100 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Từ vựng & Kanji</div>
                        <div className="font-semibold text-gray-800 mt-0.5">{item.vocabTask}</div>
                      </div>
                    </div>
                    {item.vocabLessonId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToVocab(item.vocabLessonId);
                        }}
                        className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold text-[10px] flex items-center gap-0.5 flex-shrink-0 transition active:scale-95"
                      >
                        <span>Học ngay</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Task 2: Grammar */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-gray-100 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngữ pháp N2</div>
                        <div className="font-semibold text-gray-800 mt-0.5">{item.grammarTask}</div>
                      </div>
                    </div>
                    {item.grammarChapter && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToGrammar(item.grammarChapter);
                        }}
                        className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold text-[10px] flex items-center gap-0.5 flex-shrink-0 transition active:scale-95"
                      >
                        <span>Học ngay</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Task 3: Reading */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-gray-100 flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đọc hiểu Dokkai</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{item.readingTask}</div>
                    </div>
                  </div>

                  {/* Task 4: Listening */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-gray-100 flex items-start gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nghe hiểu Choukai</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{item.listeningTask}</div>
                    </div>
                  </div>
                </div>

                {/* Optional Tip Footer */}
                {item.tip && (
                  <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100/60 text-[11px] text-amber-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span><strong>Mẹo tác chiến:</strong> {item.tip}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
