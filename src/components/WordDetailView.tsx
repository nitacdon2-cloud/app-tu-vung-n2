import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Volume2, BookOpen, ExternalLink, Search, Sparkles, Lightbulb, 
  MessageSquare, Layers, ChevronRight, Hash, Compass 
} from 'lucide-react';
import { speakJapanese } from '../services/audioService';
import { 
  fetchMaziiKanji, openMaziiExternal, MaziiKanjiDetail, getOfflineHanViet 
} from '../services/maziiService';

export const WordDetailView: React.FC = () => {
  const { detailWord } = useApp();
  const [activeKanjiIndex, setActiveKanjiIndex] = useState(0);
  const [kanjiDetails, setKanjiDetails] = useState<Record<string, MaziiKanjiDetail | null>>({});
  const [isLoadingKanji, setIsLoadingKanji] = useState<Record<string, boolean>>({});

  if (!detailWord) return null;

  // Extract individual Kanji characters from word
  const kanjiChars = Array.from(
    new Set(
      detailWord.word.split('').filter((c) => '\u4e00' <= c && c <= '\u9fff')
    )
  );

  // Compute fallback or full Hán Việt for the whole word
  const computedHanViet = detailWord.han_viet || kanjiChars.map(k => getOfflineHanViet(k)).filter(Boolean).join(' ');

  // Fetch Mazii Kanji info for each Kanji character
  useEffect(() => {
    setActiveKanjiIndex(0);
    kanjiChars.forEach((k) => {
      if (!kanjiDetails[k]) {
        setIsLoadingKanji(prev => ({ ...prev, [k]: true }));
        fetchMaziiKanji(k).then(detail => {
          setKanjiDetails(prev => ({ ...prev, [k]: detail }));
          setIsLoadingKanji(prev => ({ ...prev, [k]: false }));
        }).catch(() => {
          setIsLoadingKanji(prev => ({ ...prev, [k]: false }));
        });
      }
    });
  }, [detailWord.word]);

  const meaningsList = detailWord.meaning
    .split(';')
    .map((m) => m.trim())
    .filter(Boolean);

  const activeKanji = kanjiChars[activeKanjiIndex] || kanjiChars[0];
  const activeDetail = activeKanji ? kanjiDetails[activeKanji] : null;
  const activeLoading = activeKanji ? isLoadingKanji[activeKanji] : false;
  const activeOfflineHanViet = activeKanji ? getOfflineHanViet(activeKanji) : '';

  // Clean HTML from tips (such as <ruby>, <rt>, <u>, etc.)
  const formatTipsHtml = (htmlStr?: string) => {
    if (!htmlStr) return null;
    return (
      <div 
        className="text-sm leading-relaxed text-gray-800 space-y-1 [&_u]:font-bold [&_u]:text-blue-700 [&_a]:text-emerald-700 [&_a]:font-bold [&_ruby]:font-japanese [&_rt]:text-[10px] [&_rt]:text-gray-400"
        dangerouslySetInnerHTML={{ __html: htmlStr }}
      />
    );
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative select-none pb-20 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
        
        {/* Main Word Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-primary font-japanese tracking-tight">
                  {detailWord.word}
                </h1>
                {computedHanViet && (
                  <span className="px-3 py-1 bg-amber-100/90 text-amber-900 border border-amber-200/80 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wide">
                    [{computedHanViet}]
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl text-gray-500 font-medium font-japanese mt-1">
                「{detailWord.reading}」
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => speakJapanese(detailWord.word)}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-2xl transition active:scale-95 shadow-sm border border-blue-200/60"
                title="Nghe phát âm"
              >
                <Volume2 className="w-6 h-6" />
              </button>

              <button
                onClick={() => openMaziiExternal(detailWord.word, 'word')}
                className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition active:scale-95 shadow-md shadow-sky-500/30 flex items-center gap-1.5 text-xs font-bold"
                title="Mở trực tiếp trên từ điển Mazii"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Mở Mazii</span>
              </button>
            </div>
          </div>

          {/* Word Type & Meanings List */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">
                ☆ {detailWord.word_type || 'Từ vựng'}
              </span>
            </div>

            <div className="space-y-1.5 pl-1">
              {meaningsList.map((m, idx) => (
                <div key={idx} className="text-base font-semibold text-gray-800 flex items-start gap-2.5">
                  <span className="text-primary font-black mt-0.5">•</span>
                  <span className="leading-snug">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Examples Block */}
        {detailWord.examples && detailWord.examples.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>CỤM TỪ / CÂU VÍ DỤ LIÊN QUAN</span>
            </h3>

            <div className="space-y-3">
              {detailWord.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl border border-blue-100/70 flex items-start gap-3 transition"
                >
                  <button
                    onClick={() => speakJapanese(ex.ja)}
                    className="p-2 bg-white text-primary hover:bg-primary hover:text-white rounded-xl transition shadow-sm flex-shrink-0 mt-0.5 border border-blue-100"
                    title="Nghe phát âm ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className="text-base font-bold text-gray-900 font-japanese">
                      {ex.ja}
                    </p>
                    {ex.reading && (
                      <p className="text-xs text-gray-500 font-japanese">{ex.reading}</p>
                    )}
                    <p className="text-sm text-gray-700 font-medium">{ex.vi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* KANJI BREAKDOWN & COMMENTARY BOARD WITH TABS */}
        {/* ========================================================================= */}
        {kanjiChars.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md overflow-hidden space-y-0">
            {/* Header Title */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Bảng Hán Tự, Mẹo Nhớ & Bình Luận ({kanjiChars.length} chữ)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-gray-400">Dữ liệu Mazii VIP</span>
            </div>

            {/* TAB BAR AT THE TOP: 1 tab per Kanji (if 2 kanji => 2 tabs) */}
            <div className="bg-slate-50/90 p-2 flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
              {kanjiChars.map((k, idx) => {
                const kDetail = kanjiDetails[k];
                const kHanViet = kDetail?.mean || getOfflineHanViet(k) || detailWord.han_viet.split(' ')[idx] || '';
                const isActive = activeKanjiIndex === idx;

                return (
                  <button
                    key={k}
                    onClick={() => setActiveKanjiIndex(idx)}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/25 border-2 border-primary scale-[1.01]'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <span className="text-xl font-black font-japanese leading-none">
                      {k}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg uppercase font-black tracking-wide ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-blue-50 text-primary border border-blue-100'
                      }`}
                    >
                      {kHanViet || `Hán tự ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: Display information for active Kanji tab */}
            <div className="p-5 space-y-4">
              {activeLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-gray-500">Đang tải thông tin Hán tự Mazii...</p>
                </div>
              ) : (
                <>
                  {/* Row 1: Kanji Glyph & Readings card */}
                  <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Big Kanji glyph */}
                      <div className="w-20 h-20 bg-white rounded-2xl border-2 border-primary/20 shadow-md flex items-center justify-center text-5xl font-black text-primary font-japanese flex-shrink-0">
                        {activeKanji}
                      </div>

                      <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <h4 className="text-2xl font-black text-gray-900 uppercase">
                            {activeDetail?.mean || activeOfflineHanViet || 'HÁN TỰ'}
                          </h4>
                          {activeDetail?.stroke_count && (
                            <span className="px-2 py-0.5 bg-gray-200/80 text-gray-700 text-xs font-bold rounded-md">
                              {activeDetail.stroke_count} nét
                            </span>
                          )}
                          {activeDetail?.level && activeDetail.level.length > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-md">
                              {activeDetail.level.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* On / Kun readings */}
                        <div className="text-xs space-y-0.5 pt-1">
                          {activeDetail?.on && (
                            <div className="text-gray-700 font-semibold">
                              <span className="font-bold text-indigo-600">Âm On:</span>{' '}
                              <span className="font-japanese text-sm text-gray-900">{activeDetail.on}</span>
                            </div>
                          )}
                          {activeDetail?.kun && (
                            <div className="text-gray-700 font-semibold">
                              <span className="font-bold text-emerald-600">Âm Kun:</span>{' '}
                              <span className="font-japanese text-sm text-gray-900">{activeDetail.kun}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Open Mazii external button */}
                    <button
                      onClick={() => openMaziiExternal(activeKanji, 'kanji')}
                      className="px-3.5 py-2 bg-white hover:bg-primary hover:text-white text-primary border border-primary/30 rounded-xl transition text-xs font-bold shadow-sm flex items-center gap-1.5 self-center sm:self-start flex-shrink-0"
                      title="Mở trực tiếp chữ này trên Mazii"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Nét Vẽ Mazii ↗</span>
                    </button>
                  </div>

                  {/* Row 2: Bộ Thủ / Thành Phần Chiết Tự Cấu Tạo */}
                  {activeDetail?.compDetail && activeDetail.compDetail.length > 0 && (
                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                      <div className="text-xs font-extrabold text-gray-600 uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>Bộ Thủ / Chiết Tự Cấu Tạo:</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {activeDetail.compDetail.map((comp, cIdx) => (
                          <div
                            key={cIdx}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center gap-1.5 text-xs font-bold"
                          >
                            <span className="text-base text-primary font-japanese">{comp.w}</span>
                            {comp.h && <span className="text-gray-600">[{comp.h}]</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 3: Mẹo Nhớ / Câu Chuyện Ghi Nhớ Chữ Hán */}
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-amber-900 uppercase flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400" />
                        <span>Mẹo Nhớ Của Chữ Hán ({activeKanji})</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-md">
                        Mẹo Nhớ Hay
                      </span>
                    </div>

                    {activeDetail?.tips?.vi ? (
                      formatTipsHtml(activeDetail.tips.vi)
                    ) : (
                      <p className="text-xs text-gray-600 italic">
                        Chữ {activeKanji} mang âm Hán Việt là [{activeDetail?.mean || activeOfflineHanViet}]. Hãy phân tích các bộ thủ và liên kết với từ vựng '{detailWord.word}' để ghi nhớ sâu nhất!
                      </p>
                    )}
                  </div>

                  {/* Row 4: Bình Luận Của Chữ Kanji & Ý Kiến Đóng Góp */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>Bình Luận Của Chữ Kanji & Thảo Luận Mazii</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                        Cộng Đồng
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 space-y-2">
                      <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
                        <p className="font-semibold text-gray-800">
                          💬 Bạn muốn xem thêm hàng chục bình luận, mẹo nhớ biến tấu và ví dụ minh họa của chữ <strong className="text-primary font-japanese">{activeKanji}</strong>?
                        </p>
                        <p className="text-gray-500">
                          Nhấn nút bên dưới để chuyển trực tiếp đến trang cộng đồng Mazii của chữ Hán này (không popup)!
                        </p>
                      </div>

                      <button
                        onClick={() => openMaziiExternal(activeKanji, 'kanji')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở Trang Mazii Đọc Toàn Bộ Bình Luận Chữ "{activeKanji}"</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 5: Giải Nghĩa & Từ Ghép Tiêu Biểu */}
                  {activeDetail?.detail && (
                    <div className="p-4 bg-white rounded-2xl border border-gray-200/80 space-y-2">
                      <div className="text-xs font-extrabold text-gray-700 uppercase flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>Ý Nghĩa & Từ Ghép Thường Gặp</span>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                        {activeDetail.detail}
                      </p>
                    </div>
                  )}

                  {/* Row 6: Từ Ghép Tiêu Biểu (Examples) */}
                  {activeDetail?.examples && activeDetail.examples.length > 0 && (
                    <div className="p-4 bg-white rounded-2xl border border-gray-200/80 space-y-2.5">
                      <div className="text-xs font-extrabold text-gray-600 uppercase flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        <span>Các Từ Vựng Chứa Chữ "{activeKanji}"</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDetail.examples.slice(0, 6).map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-japanese font-bold text-gray-900 text-sm">{ex.w}</span>
                                {ex.p && <span className="text-[11px] text-gray-500 font-japanese">({ex.p.trim()})</span>}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{ex.m}</p>
                            </div>
                            {ex.h && (
                              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                {ex.h}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Floating Search Button: Directly opens word on Mazii */}
      <button
        onClick={() => openMaziiExternal(detailWord.word, 'word')}
        className="fixed bottom-6 right-6 z-30 px-4 py-3 bg-primary hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center gap-2 transition active:scale-95 border-2 border-white font-bold text-xs"
        title="Tra từ trên Mazii trực tiếp"
      >
        <Search className="w-5 h-5" />
        <span className="hidden sm:inline">Tra Mazii</span>
      </button>
    </div>
  );
};

export default WordDetailView;
