import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart2, BookOpen, CheckCircle, Sparkles } from 'lucide-react';

export const LessonGridScreen: React.FC = () => {
  const { lessons, setCurrentLessonId, setScreen, userProgress, isMobileFrame } = useApp();

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

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative select-none pb-24 overflow-y-auto">
      {/* Banner Header */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white p-4 sm:p-5 shadow-inner">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-sm mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>JLPT N2 Vocabulary Master</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Cấu Trúc Từ Vựng N2</h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              {lessons.length} Bài học • {lessons.reduce((acc, l) => acc + l.words.length, 0)} Từ vựng
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 bg-white/15 px-3 py-2 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-amber-300 leading-tight">
                {totalLearned}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-100 font-medium">Đã thuộc</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-5xl mx-auto w-full p-3.5 sm:p-6">
        <div className={`grid gap-3 sm:gap-4 ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {lessons.map((lesson, idx) => {
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
                className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 active:scale-95 text-left flex flex-col justify-between min-h-[128px] overflow-hidden"
              >
                {/* Background badge number */}
                <div className="absolute right-1 -bottom-2 text-5xl sm:text-6xl font-black text-gray-100/70 group-hover:text-primary/10 transition-colors select-none pointer-events-none">
                  {idx + 1}
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-primary border border-blue-100">
                      Lesson {idx + 1}
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
