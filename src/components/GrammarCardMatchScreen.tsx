import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem } from '../types/grammar';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordGrammarTestAnswer, getGrammarChapters } from '../services/grammarDataLoader';
import { 
  RotateCcw, Trophy, CheckCircle2, ArrowRight, Grid, Sparkles, 
  Clock, Eye, EyeOff, Layers, BookOpen, Star, SlidersHorizontal, 
  Volume2, ArrowLeft, Check
} from 'lucide-react';

interface GrammarMatchCardItem {
  instanceId: string;
  grammarId: string;
  grammarItem: GrammarItem;
  type: 'grammar' | 'meaning';
  text: string;
  subText?: string;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
}

const PAIR_OPTIONS = [
  { pairs: 6, label: '6 cặp', desc: '12 thẻ' },
  { pairs: 10, label: '10 cặp', desc: '20 thẻ' },
  { pairs: 15, label: '15 cặp', desc: '30 thẻ' },
  { pairs: 20, label: '20 cặp', desc: '40 thẻ' },
  { pairs: 0, label: 'Tất cả', desc: 'Toàn bộ' },
];

export const GrammarCardMatchScreen: React.FC = () => {
  const {
    grammarList,
    grammarProgress,
    setGrammarProgress,
    currentGrammarChapter,
    setScreen,
    getGrammarStateHelper,
  } = useApp();

  // Selected chapters (empty = all chapters)
  const [selectedChapters, setSelectedChapters] = useState<number[]>(() => {
    return currentGrammarChapter > 0 ? [currentGrammarChapter] : [];
  });

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);

  // Target pairs configuration
  const [targetPairs, setTargetPairs] = useState<number>(() => {
    const saved = localStorage.getItem('grammar_card_match_target_pairs');
    if (saved !== null) {
      const num = parseInt(saved, 10);
      if (!isNaN(num)) return num;
    }
    return 10; // Mặc định 10 cặp = 20 thẻ
  });

  // Filter scope: 'tat_ca' | 'chua_nho' | 'thich'
  const [filterScope, setFilterScope] = useState<'tat_ca' | 'chua_nho' | 'thich'>('tat_ca');

  // Toggle hide matched cards
  const [hideMatched, setHideMatched] = useState<boolean>(() => {
    return localStorage.getItem('grammar_card_match_hide_matched') === 'true';
  });

  // Game state
  const [cards, setCards] = useState<GrammarMatchCardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<GrammarMatchCardItem[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalPairs, setTotalPairs] = useState(6);
  const [isFinished, setIsFinished] = useState(false);

  // Stopwatch timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const chapters = useMemo(() => getGrammarChapters(), []);

  // Filter pool based on chapters & scope
  const availablePool = useMemo(() => {
    let pool = grammarList;

    if (selectedChapters.length > 0) {
      pool = pool.filter(g => selectedChapters.includes(g.chapter));
    }

    if (filterScope === 'chua_nho') {
      pool = pool.filter(g => getGrammarStateHelper(g).status !== 'da_nho');
    } else if (filterScope === 'thich') {
      pool = pool.filter(g => getGrammarStateHelper(g).is_favorite);
    }

    return pool;
  }, [grammarList, selectedChapters, filterScope, grammarProgress, getGrammarStateHelper]);

  // Chapter display title
  const chapterDisplayTitle = useMemo(() => {
    if (selectedChapters.length === 0) return 'Tất cả 19 chương';
    if (selectedChapters.length === 1) return `Chương ${selectedChapters[0]}`;
    if (selectedChapters.length === chapters.length) return 'Tất cả 19 chương';
    return `${selectedChapters.length} chương đã chọn`;
  }, [selectedChapters, chapters]);

  // Init game board
  const initGame = useCallback(() => {
    if (availablePool.length === 0) {
      setCards([]);
      setSelectedCards([]);
      setMatchedCount(0);
      setTotalPairs(0);
      setIsFinished(false);
      return;
    }

    let pairCount = targetPairs === 0 ? availablePool.length : targetPairs;
    pairCount = Math.min(pairCount, availablePool.length);
    if (pairCount < 2) pairCount = Math.min(2, availablePool.length);

    // Pick random items
    const shuffledPool = [...availablePool].sort(() => 0.5 - Math.random());
    const selectedItems = shuffledPool.slice(0, pairCount);

    const generatedCards: GrammarMatchCardItem[] = [];

    selectedItems.forEach((g) => {
      // 1. Japanese Grammar Card
      generatedCards.push({
        instanceId: `g_ja_${g.id}_${Math.random()}`,
        grammarId: g.id,
        grammarItem: g,
        type: 'grammar',
        text: g.grammar,
        subText: `${g.chapter_title} • #${g.code}`,
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });

      // 2. Vietnamese Meaning Card
      generatedCards.push({
        instanceId: `g_vi_${g.id}_${Math.random()}`,
        grammarId: g.id,
        grammarItem: g,
        type: 'meaning',
        text: g.meaning,
        subText: 'Ý nghĩa tiếng Việt',
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });
    });

    setCards(generatedCards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedCount(0);
    setTotalPairs(pairCount);
    setIsFinished(false);
    setSecondsElapsed(0);
  }, [availablePool, targetPairs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer runner
  useEffect(() => {
    if (isFinished || totalPairs === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, totalPairs]);

  const handleSelectTargetPairs = (count: number) => {
    setTargetPairs(count);
    localStorage.setItem('grammar_card_match_target_pairs', count.toString());
  };

  const handleToggleHideMatched = () => {
    const next = !hideMatched;
    setHideMatched(next);
    localStorage.setItem('grammar_card_match_hide_matched', String(next));
  };

  const handleCardClick = (clickedCard: GrammarMatchCardItem) => {
    if (clickedCard.isMatched || clickedCard.isSelected || selectedCards.length >= 2 || isFinished) {
      return;
    }

    if (clickedCard.type === 'grammar') {
      speakJapanese(clickedCard.grammarItem.grammar);
    }

    const newCards = cards.map((c) =>
      c.instanceId === clickedCard.instanceId ? { ...c, isSelected: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    // If 2 selected cards, evaluate match
    if (newSelected.length === 2) {
      const [card1, card2] = newSelected;

      if (card1.grammarId === card2.grammarId && card1.type !== card2.type) {
        // MATCH SUCCESS!
        playFeedbackSound('correct');
        const updated = recordGrammarTestAnswer(grammarProgress, card1.grammarId, true);
        setGrammarProgress(updated);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.grammarId === card1.grammarId
                ? { ...c, isMatched: true, isSelected: false }
                : c
            )
          );
          setSelectedCards([]);
          setMatchedCount((prev) => {
            const next = prev + 1;
            if (next >= totalPairs) {
              setIsFinished(true);
            }
            return next;
          });
        }, 300);
      } else {
        // MATCH WRONG!
        playFeedbackSound('wrong');

        setCards((prev) =>
          prev.map((c) =>
            c.instanceId === card1.instanceId || c.instanceId === card2.instanceId
              ? { ...c, isWrong: true }
              : c
          )
        );

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.instanceId === card1.instanceId || c.instanceId === card2.instanceId
                ? { ...c, isSelected: false, isWrong: false }
                : c
            )
          );
          setSelectedCards([]);
        }, 700);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleChapter = (ch: number) => {
    setSelectedChapters(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 relative select-none">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Chapter Selector & Scope Button */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition active:scale-95 truncate"
              title="Chọn chương cần luyện"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{chapterDisplayTitle}</span>
              <SlidersHorizontal className="w-3 h-3 text-blue-500 shrink-0 ml-0.5" />
            </button>

            {/* Scope Filter Pill */}
            <div className="hidden xs:flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-[11px] font-bold">
              {(['tat_ca', 'chua_nho', 'thich'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setFilterScope(sc)}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterScope === sc
                      ? 'bg-white text-gray-900 shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {sc === 'tat_ca' ? 'Tất cả' : sc === 'chua_nho' ? 'Chưa nhớ' : 'Đã thích'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats: Timer & Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-mono font-black text-amber-900">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            {/* Re-shuffle */}
            <button
              onClick={initGame}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 active:scale-95 transition"
              title="Chia lại thẻ mới"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Row: Pair Selectors & Hide Matched Toggle */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Pair counts selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-gray-400 mr-1 hidden sm:inline">Số cặp:</span>
            {PAIR_OPTIONS.map((opt) => (
              <button
                key={opt.pairs}
                onClick={() => handleSelectTargetPairs(opt.pairs)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 border ${
                  targetPairs === opt.pairs
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Hide matched toggle */}
          <button
            onClick={handleToggleHideMatched}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 border ${
              hideMatched
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
            title="Ẩn các thẻ đã ghép để thoáng bàn chơi"
          >
            {hideMatched ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
            <span className="hidden xs:inline">{hideMatched ? 'Đang ẩn thẻ khớp' : 'Ẩn thẻ khớp'}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 2. MAIN BOARD - CARD GRID */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {availablePool.length < 2 ? (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-sm space-y-4">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-black text-gray-800">Không đủ ngữ pháp trong phạm vi đã chọn</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vui lòng chọn thêm chương hoặc chuyển phạm vi sang <strong>Tất cả</strong> để có tối thiểu 2 ngữ pháp tạo thẻ ghép.
            </p>
            <button
              onClick={() => {
                setSelectedChapters([]);
                setFilterScope('tat_ca');
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              Chọn tất cả 19 chương
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-5xl mx-auto pb-8">
            {cards.map((card) => {
              if (hideMatched && card.isMatched) {
                return (
                  <div 
                    key={card.instanceId} 
                    className="h-24 sm:h-28 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/40 pointer-events-none opacity-40 transition-all duration-300" 
                  />
                );
              }

              // Card styling state
              let cardStyle = 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md text-gray-900';
              if (card.isSelected) {
                cardStyle = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-lg ring-2 ring-indigo-400 scale-[0.98]';
              } else if (card.isWrong) {
                cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 shadow-md animate-shake';
              } else if (card.isMatched) {
                cardStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 opacity-50 pointer-events-none';
              }

              return (
                <div
                  key={card.instanceId}
                  onClick={() => handleCardClick(card)}
                  className={`relative h-24 sm:h-28 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none active:scale-95 ${cardStyle}`}
                >
                  {/* Top Sub Header Tag */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      card.type === 'grammar' 
                        ? 'bg-indigo-100 text-indigo-900' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {card.type === 'grammar' ? 'Ngữ pháp' : 'Ý nghĩa'}
                    </span>

                    {card.type === 'grammar' && (
                      <span className="text-[10px] text-gray-400 font-mono font-bold">
                        {card.grammarItem.code}
                      </span>
                    )}

                    {card.isMatched && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="my-auto flex items-center justify-center text-center px-1">
                    {card.type === 'grammar' ? (
                      <p className="text-base sm:text-lg font-black font-japanese text-gray-950 leading-tight">
                        {card.text}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm font-extrabold text-amber-950 leading-snug line-clamp-3">
                        {card.text}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="truncate max-w-[80%] font-medium">
                      {card.type === 'grammar' ? card.grammarItem.chapter_title : ''}
                    </span>
                    {card.type === 'grammar' && (
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500 opacity-60" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. VICTORY MODAL */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 text-white">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[11px] font-black uppercase">
                Hoàn Thành Xuất Sắc!
              </span>
              <h3 className="text-2xl font-black text-gray-900 pt-1">
                Ghép Thẻ Thành Công!
              </h3>
              <p className="text-xs text-gray-500">
                Bạn đã ghép đúng tất cả các thẻ ngữ pháp N2.
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Tổng số cặp</span>
                <span className="text-lg font-black text-indigo-700">{totalPairs} cặp ({totalPairs * 2} thẻ)</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Thời gian hoàn thành</span>
                <span className="text-lg font-black text-amber-700 font-mono">{formatTime(secondsElapsed)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={initGame}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Ván Mới</span>
              </button>

              <button
                onClick={() => setScreen('grammar_list')}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition active:scale-95"
              >
                Về Danh Sách Ngữ Pháp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHAPTER SELECTOR MODAL */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Chọn Chương Ngữ Pháp</h3>
                <p className="text-[11px] text-blue-100">Chọn các chương bạn muốn luyện tập ghép thẻ</p>
              </div>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold">
              <button
                onClick={() => setSelectedChapters(chapters.map(c => c.chapter))}
                className="text-primary hover:underline"
              >
                Chọn tất cả 19 chương
              </button>
              <button
                onClick={() => setSelectedChapters([])}
                className="text-gray-500 hover:underline"
              >
                Xóa tất cả (Mặc định)
              </button>
            </div>

            {/* Chapters Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2">
              {chapters.map((c) => {
                const isSelected = selectedChapters.includes(c.chapter);
                return (
                  <button
                    key={c.chapter}
                    onClick={() => toggleChapter(c.chapter)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-primary text-primary font-black shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{c.title}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{c.count} ngữ pháp</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md hover:bg-blue-700 transition"
              >
                Xác Nhận & Bắt Đầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
