import React from 'react';
import { useApp } from '../context/AppContext';
import { Word, StatusFilter } from '../types/vocab';
import { Star, CheckCircle, Play, Edit3, Eye, EyeOff, Layers } from 'lucide-react';
import { getWordState } from '../services/storageService';

export const WordListScreen: React.FC = () => {
  const {
    currentLesson,
    blindMask,
    setBlindMask,
    statusFilter,
    setStatusFilter,
    userProgress,
    handleToggleFavorite,
    handleToggleStatus,
    getWordKey,
    setSelectedWord,
    setIsStudyPickerOpen,
    setScreen,
  } = useApp();

  if (!currentLesson) return null;

  // Filter words by StatusFilter
  const filteredWords = currentLesson.words.filter((word) => {
    const key = getWordKey(word);
    const state = getWordState(userProgress, key);

    if (statusFilter === 'chua_nho') return state.status === 'chua_nho';
    if (statusFilter === 'da_nho') return state.status === 'da_nho';
    if (statusFilter === 'thich') return state.is_favorite;
    return true; // 'tat_ca'
  });

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative select-none pb-20 overflow-y-auto">
      {/* Top Filter Panel */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Row 1: Blind Mask Checkboxes */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between overflow-x-auto gap-3 text-xs font-semibold text-gray-700 no-scrollbar">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={blindMask.showWord}
              onChange={(e) => setBlindMask({ ...blindMask, showWord: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Từ</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={blindMask.showReading}
              onChange={(e) => setBlindMask({ ...blindMask, showReading: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Hira</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={blindMask.showHanViet}
              onChange={(e) => setBlindMask({ ...blindMask, showHanViet: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Hán Việt</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={blindMask.showMeaning}
              onChange={(e) => setBlindMask({ ...blindMask, showMeaning: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Nghĩa</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={blindMask.isSwapped}
              onChange={(e) => setBlindMask({ ...blindMask, isSwapped: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Đảo</span>
          </label>
        </div>

        {/* Row 2: Status Filter Radio Tabs */}
        <div className="px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            {(['tat_ca', 'chua_nho', 'da_nho', 'thich'] as StatusFilter[]).map((tab) => {
              const label =
                tab === 'tat_ca'
                  ? 'Tất Cả'
                  : tab === 'chua_nho'
                  ? 'Chưa Nhớ'
                  : tab === 'da_nho'
                  ? 'Đã Nhớ'
                  : 'Thích';

              const isActive = statusFilter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-primary font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setScreen('flashcard')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 text-xs"
              title="Học thẻ Flashcard từ vựng bài này"
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>Flashcard</span>
            </button>

            <button
              onClick={() => alert('Chức năng Ghi Chú / Vẽ Nhanh')}
              className="p-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl transition"
              title="Ghi chú nhanh"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Word Cards List */}
      <div className="p-4 max-w-4xl mx-auto w-full space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <EyeOff className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-700">Không tìm thấy từ vựng nào</h4>
            <p className="text-xs text-gray-400 mt-1">
              Thử chuyển tab lọc (Tất Cả / Chưa Nhớ / Đã Nhớ)
            </p>
          </div>
        ) : (
          filteredWords.map((word, index) => {
            const key = getWordKey(word);
            const state = getWordState(userProgress, key);

            // Check if this word starts a new sub-section (e.g. "2.1 動名詞")
            const prevWord = index > 0 ? filteredWords[index - 1] : null;
            const showSubSectionHeader =
              word.sub_section && (!prevWord || prevWord.sub_section !== word.sub_section);

            // Blind Mask variables
            const renderKanji = blindMask.showWord ? word.word : '';
            const renderHira = blindMask.showReading ? word.reading : '';
            const renderHanViet = blindMask.showHanViet && word.han_viet ? `[${word.han_viet}]` : '';
            const renderMeaning = blindMask.showMeaning ? word.meaning : '';

            return (
              <React.Fragment key={word.id}>
                {/* Sub-section Header Divider (e.g. 📌 2.1 動名詞) */}
                {showSubSectionHeader && (
                  <div className="pt-3 pb-1 flex items-center gap-2">
                    <div className="h-0.5 bg-blue-200/80 flex-1 rounded" />
                    <span className="px-3.5 py-1 bg-blue-50 text-primary border border-blue-200 font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1.5">
                      <span>📌</span>
                      <span>{word.sub_section}</span>
                    </span>
                    <div className="h-0.5 bg-blue-200/80 flex-1 rounded" />
                  </div>
                )}

                {/* THẺ CHA (PARENT PREFIX/SUFFIX HEADER CARD) */}
                {word.is_parent_header ? (
                  <div className="mt-4 mb-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 inline-block px-2.5 py-0.5 rounded-full mb-1">
                        THẺ CHA — {word.word_type || 'TIỀN TỐ / HẬU TỐ'}
                      </div>
                      <h3 className="text-xl font-extrabold font-japanese flex items-center gap-2 flex-wrap">
                        <span>{word.word}</span>
                        <span className="text-sm font-normal text-blue-100">「{word.reading}」</span>
                        {word.han_viet && (
                          <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded font-mono font-bold">
                            {word.han_viet}
                          </span>
                        )}
                        {word.grammar_equiv && (
                          <span className="text-xs bg-amber-300 text-slate-900 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-sm">
                            <span className="text-[11px] font-semibold text-slate-800">Ngữ pháp:</span>
                            <span className="font-japanese font-extrabold text-sm">{word.grammar_equiv}</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-blue-50 font-medium mt-1">{word.meaning}</p>
                    </div>
                  </div>
                ) : (
                  /* REGULAR CARD & INDENTED THẺ CON */
                  <div
                    onClick={() => setSelectedWord(word)}
                    className={`bg-white rounded-2xl p-3.5 sm:p-4 border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between gap-2.5 active:scale-[0.99] ${
                      word.parent_prefix
                        ? 'ml-3 sm:ml-6 border-l-4 border-l-blue-500 border-gray-200 bg-blue-50/20'
                        : 'border-gray-200/80'
                    }`}
                  >
                    {/* Left Content */}
                    <div className="flex-1 space-y-1">
                      {blindMask.isSwapped ? (
                        <>
                          <div className="text-base font-bold text-gray-800 line-clamp-1 min-h-[1.5rem]">
                            {word.id}/ {renderMeaning}
                          </div>
                          <div className="text-sm font-medium text-primary font-japanese flex items-center gap-2 flex-wrap min-h-[1.25rem]">
                            {renderKanji && <span>{renderKanji}</span>}
                            {renderHira && <span className="text-xs text-gray-500">「{renderHira}」</span>}
                            {renderHanViet && (
                              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                {renderHanViet}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-base font-bold text-primary font-japanese flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                            <span>{word.id}/ {renderKanji}</span>
                            {renderHira && (
                              <span className="text-sm font-medium text-gray-500 font-japanese">
                                {renderHira}
                              </span>
                            )}
                            {renderHanViet && (
                              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                {renderHanViet}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 font-medium line-clamp-2 min-h-[1.25rem]">
                            {renderMeaning}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Action Icons (Star & Checkmark) */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleFavorite(word)}
                        className="p-2 hover:bg-amber-50 rounded-full transition text-gray-300 hover:text-amber-400"
                        title={state.is_favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                      >
                        <Star
                          className={`w-6 h-6 transition ${
                            state.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(word)}
                        className="p-2 hover:bg-emerald-50 rounded-full transition text-gray-300 hover:text-emerald-500"
                        title={state.status === 'da_nho' ? 'Đánh dấu Chưa thuộc' : 'Đánh dấu Đã thuộc'}
                      >
                        <CheckCircle
                          className={`w-6 h-6 transition ${
                            state.status === 'da_nho'
                              ? 'fill-emerald-500 text-white'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* FAB (Play Button ▶) */}
      <button
        onClick={() => setIsStudyPickerOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 border-2 border-white"
        title="Chọn chế độ học"
      >
        <Play className="w-7 h-7 fill-white ml-1" />
      </button>
    </div>
  );
};
