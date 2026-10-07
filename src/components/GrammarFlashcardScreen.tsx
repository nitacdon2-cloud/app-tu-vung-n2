import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem } from '../types/grammar';
import { getGrammarChapters } from '../services/grammarDataLoader';
import { 
  ArrowLeft, ArrowRight, RotateCcw, Shuffle, Volume2, Star, 
  CheckCircle, Clock, Eye, EyeOff, Layers, BookOpen, Sparkles 
} from 'lucide-react';
import { speakJapanese } from '../services/audioService';

export const GrammarFlashcardScreen: React.FC = () => {
  const {
    grammarList,
    grammarProgress,
    grammarMask,
    setGrammarMask,
    currentGrammarChapter,
    setCurrentGrammarChapter,
    setScreen,
    handleToggleGrammarFavorite,
    handleToggleGrammarStatus,
    getGrammarStateHelper,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'chua_nho' | 'da_nho'>('all');

  const chapters = useMemo(() => getGrammarChapters(), []);

  // Filter list of flashcards
  const filteredGrammars = useMemo(() => {
    let list = grammarList;

    if (currentGrammarChapter > 0) {
      list = list.filter(g => g.chapter === currentGrammarChapter);
    }

    if (statusFilter === 'chua_nho') {
      list = list.filter(g => getGrammarStateHelper(g).status !== 'da_nho');
    } else if (statusFilter === 'da_nho') {
      list = list.filter(g => getGrammarStateHelper(g).status === 'da_nho');
    }

    if (isShuffled) {
      return [...list].sort(() => 0.5 - Math.random());
    }
    return list;
  }, [grammarList, currentGrammarChapter, statusFilter, isShuffled, grammarProgress]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentGrammarChapter, statusFilter, isShuffled]);

  const currentItem: GrammarItem | undefined = filteredGrammars[currentIndex];
  const currentState = currentItem ? getGrammarStateHelper(currentItem) : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredGrammars.length]);

  const handleNext = () => {
    if (filteredGrammars.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < filteredGrammars.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (filteredGrammars.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredGrammars.length - 1));
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col p-3 sm:p-5 max-w-2xl mx-auto w-full select-none pb-12 overflow-y-auto space-y-4">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setScreen('grammar_list')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách thẻ</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Chapter Selector */}
          <select
            value={currentGrammarChapter}
            onChange={(e) => setCurrentGrammarChapter(Number(e.target.value))}
            className="py-1.5 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={0}>Tất cả chương ({grammarList.length})</option>
            {chapters.map(c => (
              <option key={c.chapter} value={c.chapter}>
                {c.title} ({c.count} ngữ pháp)
              </option>
            ))}
          </select>

          {/* Shuffle Button */}
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              isShuffled
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
            title="Đảo thứ tự thẻ"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mask Option Switches (MANDATORY REQUIREMENT) */}
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-500">
          <span>Tùy chọn hiển thị:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGrammarMask(prev => ({ ...prev, showConnection: !prev.showConnection }))}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 border ${
              grammarMask.showConnection
                ? 'bg-blue-50 text-primary border-blue-200 shadow-sm'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {grammarMask.showConnection ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Cách chia</span>
          </button>

          <button
            onClick={() => setGrammarMask(prev => ({ ...prev, showMeaning: !prev.showMeaning }))}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 border ${
              grammarMask.showMeaning
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {grammarMask.showMeaning ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Nghĩa</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard */}
      {currentItem ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[380px] sm:min-h-[440px] bg-white rounded-3xl shadow-xl border-2 border-gray-200 hover:border-indigo-400 p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-mono text-xs font-black border border-indigo-100">
                #{currentItem.code} • Thẻ {currentIndex + 1}/{filteredGrammars.length}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => speakJapanese(currentItem.grammar)}
                  className="p-2 text-primary hover:bg-blue-50 rounded-full transition"
                  title="Nghe phát âm ngữ pháp"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleGrammarFavorite(currentItem)}
                  className="p-2 text-gray-400 hover:text-amber-500 rounded-full transition"
                  title="Yêu thích"
                >
                  <Star className={`w-5 h-5 ${currentState?.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleToggleGrammarStatus(currentItem)}
                  className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border transition ${
                    currentState?.status === 'da_nho'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {currentState?.status === 'da_nho' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{currentState?.status === 'da_nho' ? 'ĐÃ THUỘC' : 'CHƯA THUỘC'}</span>
                </button>
              </div>
            </div>

            {/* FRONT SIDE: NGỮ PHÁP LUÔN HIỆN DIỆN + TÙY CHỌN CÁCH CHIA VÀ NGHĨA */}
            {!isFlipped ? (
              <div className="my-auto text-center py-6 space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {currentItem.chapter_title}
                  </span>
                  {/* MANDATORY: NGỮ PHÁP LUÔN HIỂN THỊ */}
                  <h2 className="text-4xl sm:text-6xl font-black text-gray-900 font-japanese tracking-wide leading-tight">
                    {currentItem.grammar}
                  </h2>
                </div>

                {/* Option: Cách chia */}
                {grammarMask.showConnection ? (
                  <div className="inline-block p-3.5 bg-blue-50 border border-blue-200 rounded-2xl max-w-md">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Cách chia kết hợp:</p>
                    <p className="text-sm sm:text-base font-bold text-blue-950 font-japanese">
                      {currentItem.connection || 'Xem mặt sau'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    [ Cách chia đã ẩn • Nhấn vào thẻ để lật xem ]
                  </p>
                )}

                {/* Option: Nghĩa */}
                {grammarMask.showMeaning ? (
                  <div className="inline-block p-3.5 bg-amber-50 border border-amber-200 rounded-2xl max-w-md">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">Ý nghĩa tiếng Việt:</p>
                    <p className="text-base sm:text-lg font-black text-amber-950">
                      {currentItem.meaning || 'Chưa cập nhật nghĩa'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    [ Nghĩa tiếng Việt đã ẩn • Nhấn vào thẻ để lật xem ]
                  </p>
                )}

                <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-semibold">
                  <RotateCcw className="w-4 h-4 animate-spin-slow" />
                  <span>Chạm vào thẻ để lật xem Giải thích & Ví dụ</span>
                </div>
              </div>
            ) : (
              /* BACK SIDE: ĐẦY ĐỦ THÔNG TIN (GIẢI THÍCH & VÍ DỤ) */
              <div className="my-auto py-2 space-y-4 text-left animate-in fade-in duration-200 max-h-[460px] overflow-y-auto pr-1">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-japanese">
                      {currentItem.grammar}
                    </h2>
                    <span className="text-xs font-bold text-gray-400">{currentItem.chapter_title}</span>
                  </div>
                  <p className="text-base font-black text-amber-900 mt-1">
                    {currentItem.meaning}
                  </p>
                </div>

                {/* Full Connection */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Cách chia:</span>
                  <p className="text-sm font-bold text-blue-950 font-japanese">
                    {currentItem.connection}
                  </p>
                </div>

                {/* Full Explanation */}
                {currentItem.explanation && (
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Giải thích cách dùng:
                    </span>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {currentItem.explanation}
                    </p>
                  </div>
                )}

                {/* Full Examples */}
                {currentItem.examples && currentItem.examples.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Câu ví dụ mẫu ({currentItem.examples.length}):
                    </span>
                    <div className="space-y-1.5">
                      {currentItem.examples.map((ex, exIdx) => (
                        <div 
                          key={exIdx} 
                          className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-2"
                        >
                          <p className="text-xs sm:text-sm font-bold text-gray-900 font-japanese leading-relaxed">
                            {ex}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakJapanese(ex.replace(/^[①②③④⑤⑥⑦⑧⑨⑩\d\.]\s*/, ''));
                            }}
                            className="p-1 text-primary hover:bg-blue-100 rounded transition shrink-0"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card Footer */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-400">
              <span>JLPT N2 Ngữ Pháp</span>
              <span>Chạm thẻ để lật lại</span>
            </div>
          </div>

          {/* Action Buttons: Đã Thuộc / Chưa Thuộc */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleToggleGrammarStatus(currentItem)}
              className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition shadow-sm ${
                currentState?.status !== 'da_nho'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Chưa Nhớ</span>
            </button>

            <button
              onClick={() => handleToggleGrammarStatus(currentItem)}
              className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition shadow-sm ${
                currentState?.status === 'da_nho'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Đã Nhớ (+1 ✅)</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handlePrev}
              className="flex-1 py-3.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-700 text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Thẻ trước
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              Thẻ tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">Không có thẻ nào trong bộ lọc này</h3>
          <p className="text-xs text-gray-400">Hãy chọn "Tất cả chương" để tiếp tục học nhé.</p>
        </div>
      )}
    </div>
  );
};
