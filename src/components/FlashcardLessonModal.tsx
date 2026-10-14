import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Check, BookOpen, Layers, Search, CheckCircle2, RotateCcw, 
  Sparkles, Filter, CheckSquare, Square
} from 'lucide-react';
import { getWordState } from '../services/storageService';

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

interface FlashcardLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLessonIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

export const FlashcardLessonModal: React.FC<FlashcardLessonModalProps> = ({
  isOpen,
  onClose,
  selectedLessonIds,
  onConfirm,
}) => {
  const { lessons, currentLessonId, userProgress } = useApp();

  const [tempSelected, setTempSelected] = useState<string[]>(selectedLessonIds);
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync internal state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedLessonIds.length > 0 ? selectedLessonIds : [currentLessonId]);
      setSearchQuery('');
    }
  }, [isOpen, selectedLessonIds, currentLessonId]);

  // Compute lesson progress
  const getLessonProgress = (lessonId: string, wordCount: number) => {
    let learned = 0;
    Object.keys(userProgress).forEach((key) => {
      if (key.startsWith(`${lessonId}_`) && userProgress[key]?.status === 'da_nho') {
        learned++;
      }
    });
    return {
      learned,
      percentage: wordCount > 0 ? Math.round((learned / wordCount) * 100) : 0,
    };
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      if (selectedChapter !== 0 && l.chapter !== selectedChapter) {
        return false;
      }
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

  // Total words & stats in currently selected lessons
  const stats = useMemo(() => {
    let totalWords = 0;
    let learnedWords = 0;
    let unlearnedWords = 0;

    lessons.forEach((l) => {
      if (tempSelected.includes(l.lesson_id)) {
        l.words.forEach((w) => {
          totalWords++;
          const state = getWordState(userProgress, `${l.lesson_id}_${w.id}`);
          if (state.status === 'da_nho') {
            learnedWords++;
          } else {
            unlearnedWords++;
          }
        });
      }
    });

    return { totalWords, learnedWords, unlearnedWords };
  }, [lessons, tempSelected, userProgress]);

  if (!isOpen) return null;

  const handleToggleLesson = (id: string) => {
    if (tempSelected.includes(id)) {
      if (tempSelected.length > 1) {
        setTempSelected(tempSelected.filter((lId) => lId !== id));
      } else {
        // Keep at least 1 lesson selected
        setTempSelected([]);
      }
    } else {
      setTempSelected([...tempSelected, id]);
    }
  };

  const handleSelectAll = () => {
    if (tempSelected.length === lessons.length) {
      setTempSelected([currentLessonId]);
    } else {
      setTempSelected(lessons.map((l) => l.lesson_id));
    }
  };

  const handleSelectChapter = () => {
    if (selectedChapter === 0) {
      handleSelectAll();
      return;
    }
    const chapterLessonIds = lessons
      .filter((l) => l.chapter === selectedChapter)
      .map((l) => l.lesson_id);

    // If all in this chapter are already selected, unselect them (leave at least current or 1)
    const allInChapterSelected = chapterLessonIds.every((id) => tempSelected.includes(id));
    if (allInChapterSelected) {
      const remaining = tempSelected.filter((id) => !chapterLessonIds.includes(id));
      setTempSelected(remaining.length > 0 ? remaining : [chapterLessonIds[0]]);
    } else {
      const merged = Array.from(new Set([...tempSelected, ...chapterLessonIds]));
      setTempSelected(merged);
    }
  };

  const handleSelectOnlyCurrent = () => {
    setTempSelected([currentLessonId]);
  };

  const isAllSelected = tempSelected.length === lessons.length;

  const handleConfirm = () => {
    if (tempSelected.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài học!');
      return;
    }
    onConfirm(tempSelected);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden cursor-default">
        {/* Header Block */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner flex-shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Chọn Bài Học Flashcard
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase">
                  {tempSelected.length} / {lessons.length} bài
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Chọn 1 hoặc nhiều bài để tạo bộ thẻ từ vựng tổng hợp
              </p>
            </div>
          </div>
        </div>

        {/* Search & Chapter Bar */}
        <div className="p-3 sm:px-5 sm:pt-4 border-b border-gray-100 space-y-2.5 bg-gray-50/70 flex-shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài học (vd: 1.1, Động từ, Katakana...)"
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition shadow-2xs"
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

          {/* Chapter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {CHAPTER_TABS.map((tab) => {
              const isSelected = selectedChapter === tab.id;
              const countInChapter =
                tab.id === 0 ? lessons.length : lessons.filter((l) => l.chapter === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedChapter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {countInChapter}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSelectAll}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
              >
                {isAllSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                    <span>Bỏ chọn tất cả</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chọn tất cả ({lessons.length})</span>
                  </>
                )}
              </button>

              {selectedChapter > 0 && (
                <button
                  onClick={handleSelectChapter}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-lg transition text-[11px]"
                >
                  Chọn cả chương này
                </button>
              )}
            </div>

            <button
              onClick={handleSelectOnlyCurrent}
              className="text-[11px] font-bold text-amber-700 hover:underline"
            >
              Chỉ bài hiện tại
            </button>
          </div>
        </div>

        {/* Lesson List / Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-white">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs">Không tìm thấy bài học phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {filteredLessons.map((l, idx) => {
                const isSelected = tempSelected.includes(l.lesson_id);
                const { learned, percentage } = getLessonProgress(l.lesson_id, l.words.length);

                return (
                  <button
                    key={l.lesson_id}
                    onClick={() => handleToggleLesson(l.lesson_id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 relative group ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-400'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {l.section_tag ? `Bài ${l.section_tag}` : `Bài ${idx + 1}`}
                      </span>

                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <h4
                        className={`font-bold text-xs line-clamp-1 ${
                          isSelected ? 'text-amber-950 font-black' : 'text-gray-800'
                        }`}
                      >
                        {l.lesson_name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                        <span>{l.words.length} từ</span>
                        <span className={percentage === 100 ? 'text-emerald-600 font-bold' : ''}>
                          {learned}/{l.words.length} ({percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 sm:p-5 border-t border-gray-200 bg-gray-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-left w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Đã chọn:</span>
              <span className="text-sm font-black text-amber-600">
                {tempSelected.length} bài học
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm font-black text-gray-800">
                {stats.totalWords} từ vựng
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
              <span className="text-rose-600 font-semibold">{stats.unlearnedWords} chưa thuộc</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{stats.learnedWords} đã thuộc</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={tempSelected.length === 0}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs text-white shadow-md transition flex items-center justify-center gap-1.5 ${
                tempSelected.length === 0
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 shadow-amber-500/25'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Học Ngay ({tempSelected.length} bài)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardLessonModal;
