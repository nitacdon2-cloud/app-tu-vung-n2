import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart2, CheckCircle, Sparkles, Search, Layers, BookOpen } from 'lucide-react';

const CHAPTER_TABS = [
  { id: 0, label: 'Tất Cả' },
  { id: 1, label: '1. Động từ' },
  { id: 2, label: '2. Động danh từ' },
  { id: 3, label: '3. Danh từ' },
  { id: 4, label: '4. Tính từ -i' },
  { id: 5, label: '5. Tính từ -na' },
  { id: 6, label: '6. Phó từ' },
  { id: 7, label: '7. Động từ ghép' },
  { id: 8, label: '8. Katakana' },
  { id: 9, label: '9. Tổng hợp' },
  { id: 10, label: '10. Phân biệt từ' },
  { id: 11, label: '11. Tiền/Hậu tố' },
];

export const LessonGridScreen: React.FC = () => {
  const { lessons, setCurrentLessonId, setScreen, userProgress, isMobileFrame } = useApp();
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute learned progress for a lesson
  const getLessonProgress = (lessonId: string, wordCount: number) => {
    let learned = 0;
    Object.keys(userProgress).forEach((key) => {
      if (key.startsWith(`${lessonId}_`) && userProgress[key]?.status === 'da_nho') {
        learned++;
      }
    });
    const percentage = wordCount > 0 ? Math.round((learned / wordCount) * 100) : 0;
    return { learned, percentage };
  };

  const totalLearned = Object.values(userProgress).filter((p) => p.status === 'da_nho').length;
  const totalWords = lessons.reduce((acc, l) => acc + l.words.length, 0);

  // Filter lessons by Chapter & Search Query
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      // Chapter filter
      if (selectedChapter !== 0 && l.chapter !== selectedChapter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTag = l.section_tag?.toLowerCase().includes(q);
        const matchName = l.lesson_name.toLowerCase().includes(q);
        const matchCh = l.chapter_name?.toLowerCase().includes(q);
        return matchTag || matchName || matchCh;
      }
      return true;
    });
  }, [lessons, selectedChapter, searchQuery]);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative select-none pb-24 overflow-y-auto">
      {/* Banner Header */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white p-4 sm:p-5 shadow-inner">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-sm mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>N2 Giáo Trình Từ Vựng Chuẩn</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Từ Vựng N2 Theo Mục Lục</h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              {lessons.length} Bài học (1.1 → 11.10) • {totalWords} Từ vựng
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-amber-300 leading-tight">
                {totalLearned}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-100 font-medium">Đã thuộc</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Chapter Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-3.5 py-2.5 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài học (vd: 1.1, 1.4, Động từ, Katakana...)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chapter Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {CHAPTER_TABS.map((tab) => {
              const isSelected = selectedChapter === tab.id;
              const countInChapter = tab.id === 0 
                ? lessons.length 
                : lessons.filter((l) => l.chapter === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedChapter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {countInChapter}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-5xl mx-auto w-full p-3.5 sm:p-6">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-2">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 text-sm">Không tìm thấy bài học phù hợp</h3>
            <p className="text-xs text-gray-400">Hãy thử nhập từ khóa khác hoặc chọn "Tất Cả"</p>
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
            {filteredLessons.map((lesson) => {
              const { percentage } = getLessonProgress(
                lesson.lesson_id,
                lesson.words.length
              );

              return (
                <button
                  key={lesson.lesson_id}
                  onClick={() => {
                    setCurrentLessonId(lesson.lesson_id);
                    setScreen('word_list');
                  }}
                  className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 active:scale-95 text-left flex flex-col justify-between min-h-[136px] overflow-hidden"
                >
                  {/* Background section tag number */}
                  <div className="absolute right-1 -bottom-2 text-4xl sm:text-5xl font-black text-gray-100/60 group-hover:text-primary/10 transition-colors select-none pointer-events-none">
                    {lesson.section_tag || lesson.lesson_id}
                  </div>

                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 text-primary border border-blue-100">
                        Bài {lesson.section_tag || ''}
                      </span>
                      {percentage === 100 && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {lesson.lesson_name}
                    </h3>
                  </div>

                  {/* Progress bar footer */}
                  <div className="relative z-10 w-full pt-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">
                      <span>{lesson.words.length} từ</span>
                      <span className="text-primary font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) - Test Setup Icon */}
      <button
        onClick={() => setScreen('test_setup')}
        className="fixed bottom-6 right-6 z-30 w-13 h-13 sm:w-14 sm:h-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 group border-2 border-white"
        title="Thiết lập bài test từ vựng"
      >
        <BarChart2 className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

export default LessonGridScreen;
