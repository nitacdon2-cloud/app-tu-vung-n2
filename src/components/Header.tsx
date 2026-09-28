import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, ChevronDown, MoreVertical, Smartphone, Monitor, BookOpen, RotateCcw, Info 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentScreen, setScreen, lessons, currentLessonId, setCurrentLessonId,
    currentLesson, isMobileFrame, setIsMobileFrame
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside listener to close dropdowns when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getHeaderTitle = () => {
    if (currentScreen === 'lesson_grid') return 'N2 Từ Vựng';
    if (currentScreen === 'word_list') return currentLesson ? `N2 ${currentLesson.lesson_name.split(':')[1]?.trim() || currentLesson.lesson_id}` : 'N2 Lesson';
    if (currentScreen === 'word_detail') return 'Chi Tiết Từ Vựng';
    if (currentScreen === 'card_match') return 'Bài Test Ghép Từ';
    if (currentScreen === 'test_setup') return 'Thiết Lập Luyện Tập';
    if (currentScreen === 'test_runner') return 'Bài Test Từ Vựng';
    if (currentScreen === 'learning_mode') return 'Chế Độ Học';
    if (currentScreen === 'word_arrange') return 'Sắp Xếp Thành Từ';
    return 'JMaster N2';
  };

  const handleBack = () => {
    if (currentScreen === 'word_detail' || currentScreen === 'card_match' || currentScreen === 'flashcard' || currentScreen === 'word_arrange' || currentScreen === 'learning_mode') {
      setScreen('word_list');
    } else if (currentScreen === 'word_list' || currentScreen === 'test_setup') {
      setScreen('lesson_grid');
    } else if (currentScreen === 'test_runner') {
      setScreen('test_setup');
    } else {
      setScreen('lesson_grid');
    }
  };

  return (
    <header className="bg-primary text-white h-14 px-4 flex items-center justify-between shadow-md sticky top-0 z-40 select-none flex-shrink-0">
      {/* Left: Back button or Home icon */}
      <div className="flex items-center gap-3">
        {currentScreen !== 'lesson_grid' ? (
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="p-1.5 bg-white/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Title with optional Lesson Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 font-semibold text-base sm:text-lg hover:opacity-90 transition text-left"
          >
            <span className="truncate max-w-[140px] sm:max-w-xs">{getHeaderTitle()}</span>
            <ChevronDown className="w-4 h-4 opacity-80 flex-shrink-0" />
          </button>

          {/* Lesson Select Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Danh sách bài học</span>
                <span className="px-2 py-0.5 bg-blue-50 text-primary rounded-full">{lessons.length}</span>
              </div>
              {lessons.map((lesson) => (
                <button
                  key={lesson.lesson_id}
                  onClick={() => {
                    setCurrentLessonId(lesson.lesson_id);
                    setIsDropdownOpen(false);
                    if (currentScreen === 'lesson_grid') setScreen('word_list');
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-primary/5 transition ${
                    currentLessonId === lesson.lesson_id ? 'bg-primary/10 text-primary font-bold' : ''
                  }`}
                >
                  <span className="truncate">{lesson.lesson_name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{lesson.words.length} từ</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Toggle Frame View Mode */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="p-1.5 rounded-full hover:bg-white/10 transition flex items-center gap-1 text-xs"
          title={isMobileFrame ? 'Chế độ Desktop' : 'Khung xem Mobile'}
        >
          {isMobileFrame ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
        </button>

        {/* User profile icon */}
        <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-sm shadow-inner border border-amber-300">
          N2
        </div>

        {/* 3-dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setScreen('learning_mode');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2.5 font-bold text-primary"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Chế độ học</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setScreen('lesson_grid');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
              >
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span>Danh sách bài học</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setScreen('test_setup');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Luyện tập & Test</span>
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  alert('Ứng dụng Học Từ Vựng Tiếng Nhật N2 - Chuẩn JMaster UX/UI.\nHỗ trợ Cross-Platform: Web, Mobile, Desktop.');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-600"
              >
                <Info className="w-4 h-4 text-gray-400" />
                <span>Thông tin ứng dụng</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
