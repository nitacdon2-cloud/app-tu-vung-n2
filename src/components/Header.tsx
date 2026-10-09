import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, ChevronDown, MoreVertical, Smartphone, Monitor, BookOpen, RotateCcw, Info,
  Sparkles, Layers, HelpCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentScreen, setScreen, lessons, currentLessonId, setCurrentLessonId,
    currentLesson, isMobileFrame, setIsMobileFrame, activeModule, setActiveModule,
    grammarList, currentGrammarChapter, setCurrentGrammarChapter, testConfig, selectedExam
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
    if (currentScreen === 'test_center') return 'Kho Đề Thi N2';
    if (currentScreen === 'exam_runner') return selectedExam ? selectedExam.title : 'Bài Thi N2';
    if (currentScreen === 'grammar_list') return 'N2 Ngữ Pháp';
    if (currentScreen === 'grammar_flashcard') return 'Học Thẻ Ngữ Pháp';
    if (currentScreen === 'grammar_test') return 'Test Ngữ Pháp';
    if (currentScreen === 'lesson_grid') return 'N2 Từ Vựng';
    if (currentScreen === 'word_list') return currentLesson ? currentLesson.lesson_name : 'N2 Từ Vựng';
    if (currentScreen === 'word_detail') return 'Chi Tiết Từ Vựng';
    if (currentScreen === 'card_match') return 'Bài Test Ghép Từ';
    if (currentScreen === 'test_setup') return 'Thiết Lập Luyện Tập';
    if (currentScreen === 'test_runner') return testConfig.testType === 'vi_du' ? 'Bài Test Qua Ví Dụ' : 'Bài Test Từ Vựng';
    if (currentScreen === 'learning_mode') return 'Chế Độ Học';
    if (currentScreen === 'word_arrange') return 'Sắp Xếp Thành Từ';
    if (currentScreen === 'flashcard') return 'Flashcard Từ Vựng';
    return 'JMaster N2';
  };

  const handleBack = () => {
    if (currentScreen === 'exam_runner') {
      setScreen('test_center');
    } else if (currentScreen === 'test_center') {
      setScreen('lesson_grid');
      setActiveModule('vocab');
    } else if (currentScreen === 'grammar_flashcard' || currentScreen === 'grammar_test') {
      setScreen('grammar_list');
    } else if (currentScreen === 'grammar_list') {
      setScreen('lesson_grid');
      setActiveModule('vocab');
    } else if (currentScreen === 'word_detail' || currentScreen === 'card_match' || currentScreen === 'flashcard' || currentScreen === 'word_arrange' || currentScreen === 'learning_mode') {
      setScreen('word_list');
    } else if (currentScreen === 'word_list' || currentScreen === 'test_setup') {
      setScreen('lesson_grid');
    } else if (currentScreen === 'test_runner') {
      setScreen('test_setup');
    } else {
      setScreen('lesson_grid');
    }
  };

  const isGrammarMode = currentScreen.startsWith('grammar_');
  const isTestMode = currentScreen === 'test_center' || currentScreen === 'exam_runner';

  return (
    <header className="bg-primary text-white h-14 px-3 sm:px-4 flex items-center justify-between shadow-md sticky top-0 z-40 select-none flex-shrink-0">
      {/* Left: Back button or Home icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentScreen !== 'lesson_grid' ? (
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        ) : (
          <div className="p-1.5 bg-white/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Title with optional Lesson / Chapter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {!isGrammarMode && !isTestMode ? (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 font-semibold text-sm sm:text-base hover:opacity-90 transition text-left"
            >
              <span className="truncate max-w-[130px] sm:max-w-xs">{getHeaderTitle()}</span>
              <ChevronDown className="w-4 h-4 opacity-80 flex-shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
              <span className="truncate max-w-[130px] sm:max-w-xs">{getHeaderTitle()}</span>
              {isGrammarMode && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                  112 Thẻ
                </span>
              )}
              {isTestMode && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-400 text-slate-950 uppercase">
                  59 Đề
                </span>
              )}
            </div>
          )}

          {/* Lesson Select Dropdown (Vocab mode) */}
          {isDropdownOpen && !isGrammarMode && !isTestMode && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100">
                <span>Danh sách bài học (1.1 → 11.10)</span>
                <span className="px-2 py-0.5 bg-blue-50 text-primary rounded-full">{lessons.length} bài</span>
              </div>
              {lessons.map((lesson) => (
                <button
                  key={lesson.lesson_id}
                  onClick={() => {
                    setCurrentLessonId(lesson.lesson_id);
                    setIsDropdownOpen(false);
                    if (currentScreen === 'lesson_grid') setScreen('word_list');
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-primary/5 transition ${
                    currentLessonId === lesson.lesson_id ? 'bg-primary/10 text-primary font-bold' : ''
                  }`}
                >
                  <span className="truncate">{lesson.lesson_name}</span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{lesson.words.length} từ</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Module Switcher (TỪ VỰNG vs NGỮ PHÁP vs LUYỆN TEST) */}
      <div className="flex items-center bg-black/20 p-1 rounded-xl text-xs font-bold border border-white/10">
        <button
          onClick={() => {
            setActiveModule('vocab');
            if (isGrammarMode || isTestMode) setScreen('lesson_grid');
          }}
          className={`px-2 sm:px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
            !isGrammarMode && !isTestMode
              ? 'bg-white text-primary shadow-sm font-black'
              : 'text-blue-100 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Từ Vựng</span>
          <span className="xs:hidden">TV</span>
        </button>

        <button
          onClick={() => {
            setActiveModule('grammar');
            setScreen('grammar_list');
          }}
          className={`px-2 sm:px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
            isGrammarMode
              ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
              : 'text-blue-100 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Ngữ Pháp</span>
          <span className="xs:hidden">NP</span>
        </button>

        <button
          onClick={() => {
            setActiveModule('test');
            setScreen('test_center');
          }}
          className={`px-2 sm:px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
            isTestMode
              ? 'bg-emerald-400 text-slate-950 shadow-sm font-black'
              : 'text-blue-100 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Luyện Test</span>
          <span className="xs:hidden">Test</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Toggle Frame View Mode */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="p-1.5 rounded-full hover:bg-white/10 transition flex items-center gap-1 text-xs"
          title={isMobileFrame ? 'Chế độ Desktop' : 'Khung xem Mobile'}
        >
          {isMobileFrame ? <Monitor className="w-4.5 h-4.5" /> : <Smartphone className="w-4.5 h-4.5" />}
        </button>

        {/* 3-dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50">
              {/* Grammar Group */}
              <div className="px-3 py-1 text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                Ngữ Pháp N2 (19 Chương)
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('grammar');
                  setScreen('grammar_list');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-indigo-50 flex items-center gap-2.5 font-bold text-indigo-700"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Danh sách 112 thẻ</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('grammar');
                  setScreen('grammar_flashcard');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-indigo-50 flex items-center gap-2.5 font-bold text-indigo-700"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Chế độ học (Flashcard)</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('grammar');
                  setScreen('grammar_test');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-indigo-50 flex items-center gap-2.5 font-bold text-indigo-700"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Bài Test (Nghĩa & Chia)</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              {/* Vocab Group */}
              <div className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Từ Vựng N2
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('vocab');
                  setScreen('lesson_grid');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
              >
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span>Danh sách bài học từ vựng</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('vocab');
                  setScreen('flashcard');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-amber-50 flex items-center gap-2.5 text-amber-900 font-bold"
              >
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Học thẻ Flashcard</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('vocab');
                  setScreen('learning_mode');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Chế độ học từ vựng</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModule('vocab');
                  setScreen('test_setup');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Test từ vựng</span>
              </button>

              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  alert('Ứng dụng Học Từ Vựng & Ngữ Pháp Tiếng Nhật N2 - Chuẩn Sách VIP 15 N2.\nTích hợp Flashcard, Bộ lọc Cách chia/Nghĩa, Test trắc nghiệm.');
                }}
                className="w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-500"
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

