import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getVocabTests, getKanjiTests } from '../services/examDataLoader';
import { ExamTest, ExamType } from '../types/test';
import { 
  Award, Clock, CheckCircle2, ChevronRight, FileText, 
  Search, RotateCcw, Flame, Check, HelpCircle, BookOpen, Layers
} from 'lucide-react';

export const TestCenterScreen: React.FC = () => {
  const { examResults, startExam, setScreen } = useApp();
  const [selectedTab, setSelectedTab] = useState<ExamType>('vocab');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const vocabTests = useMemo(() => getVocabTests(), []);
  const kanjiTests = useMemo(() => getKanjiTests(), []);

  const currentTests = selectedTab === 'vocab' ? vocabTests : kanjiTests;

  // Categories list for vocab
  const categories = useMemo(() => {
    if (selectedTab !== 'vocab') return [];
    const set = new Set(vocabTests.map(t => t.category));
    return Array.from(set);
  }, [vocabTests, selectedTab]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return currentTests.filter(t => {
      const matchQuery = !searchQuery.trim() || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.test_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [currentTests, searchQuery, selectedCategory]);

  // Overall Statistics for current tab
  const stats = useMemo(() => {
    const testIds = currentTests.map(t => t.test_id);
    let completedCount = 0;
    let totalScore = 0;
    let totalMaxScore = 0;

    testIds.forEach(id => {
      const res = examResults[id];
      if (res) {
        completedCount++;
        totalScore += res.score;
        totalMaxScore += res.total;
      }
    });

    const avgPercent = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    return {
      total: currentTests.length,
      completed: completedCount,
      avgPercent,
    };
  }, [currentTests, examResults]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-5 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-blue-100 mb-1.5 backdrop-blur-sm">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>JLPT N2 Test Center</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Kho Đề Thi & Bài Test N2
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                Luyện tập trắc nghiệm điền từ & chữ Hán theo đề thi thực chiến. Tự động chấm điểm, lưu lịch sử và phân tích lỗi sai.
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-around">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-black text-amber-300">
                  {stats.completed}/{stats.total}
                </div>
                <div className="text-[11px] text-blue-100 font-medium">Đã làm</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-lg sm:text-xl font-black text-emerald-300">
                  {stats.avgPercent}%
                </div>
                <div className="text-[11px] text-blue-100 font-medium">Độ chính xác</div>
              </div>
            </div>
          </div>

          {/* Test Tabs: Vocab vs Kanji */}
          <div className="flex gap-2 mt-5 p-1 bg-black/25 rounded-xl max-w-md backdrop-blur-sm border border-white/10">
            <button
              onClick={() => {
                setSelectedTab('vocab');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                selectedTab === 'vocab'
                  ? 'bg-white text-indigo-900 shadow-md font-black'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Test Từ Vựng ({vocabTests.length})</span>
            </button>
            <button
              onClick={() => {
                setSelectedTab('kanji');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                selectedTab === 'kanji'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Test Kanji ({kanjiTests.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={selectedTab === 'vocab' ? 'Tìm bài test từ vựng (ví dụ: 1.1, Động từ)...' : 'Tìm đề test Kanji (ví dụ: Đề 1, 10)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Category Chips for Vocab */}
          {selectedTab === 'vocab' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({vocabTests.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test List Grid */}
      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredTests.map((test) => {
            const result = examResults[test.test_id];
            const isCompleted = !!result;

            return (
              <div
                key={test.test_id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-300"
              >
                <div>
                  {/* Card Header: Category badge & Score badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                      {test.category}
                    </span>

                    {isCompleted ? (
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                        result.percentage >= 90
                          ? 'bg-emerald-100 text-emerald-700'
                          : result.percentage >= 70
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{result.score}/{result.total} ({result.percentage}%)</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400">
                        Chưa làm
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {test.title}
                  </h3>

                  {/* Meta Details */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.total_questions} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.total_questions === 25 ? '25 phút' : '20 phút'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isCompleted ? (
                    <>
                      <span className="text-[11px] text-slate-400">
                        Đã nộp bài: {result.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startExam(test)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Làm lại</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => startExam(test)}
                      className="w-full py-2 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
                    >
                      <span>Bắt đầu làm bài</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Không tìm thấy bài test nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};
