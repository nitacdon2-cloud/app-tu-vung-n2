import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem } from '../types/grammar';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { 
  recordGrammarTestAnswer, 
  getGrammarChapters, 
  getStoredGrammarProgress 
} from '../services/grammarDataLoader';
import { 
  RotateCcw, Trophy, CheckCircle2, Grid, Clock, Eye, EyeOff, 
  Layers, BookOpen, Star, SlidersHorizontal, Check, X 
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

// Preset card count options: Pairs -> Total cards
const PAIR_OPTIONS = [
  { pairs: 6, label: '6 cặp', cards: 12, desc: '12 thẻ' },
  { pairs: 10, label: '10 cặp', cards: 20, desc: '20 thẻ' },
  { pairs: 15, label: '15 cặp', cards: 30, desc: '30 thẻ' },
  { pairs: 20, label: '20 cặp', cards: 40, desc: '40 thẻ' },
  { pairs: 0, label: 'Tất cả', cards: 0, desc: 'Toàn bộ' },
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

  // Selected chapters (current grammar chapter or all if 0)
  const [selectedChapters, setSelectedChapters] = useState<number[]>(() => {
    return currentGrammarChapter > 0 ? [currentGrammarChapter] : [];
  });

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [tempSelectedChapters, setTempSelectedChapters] = useState<number[]>(selectedChapters);

  // Sync tempSelectedChapters whenever modal is opened
  useEffect(() => {
    if (isChapterModalOpen) {
      setTempSelectedChapters(selectedChapters);
    }
  }, [isChapterModalOpen, selectedChapters]);

  // Target pairs configuration (saved in localStorage)
  // Default to 15 pairs (30 cards) or stored preference
  const [targetPairs, setTargetPairs] = useState<number>(() => {
    const saved = localStorage.getItem('grammar_card_match_target_pairs');
    if (saved !== null) {
      const num = parseInt(saved, 10);
      if (!isNaN(num)) return num;
    }
    return 15;
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

  // Stop-watch timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const chapters = useMemo(() => getGrammarChapters(), []);

  // Sync grammar progress into AppContext upon finish or unmount so other views reflect the saved state
  useEffect(() => {
    if (isFinished) {
      setGrammarProgress(getStoredGrammarProgress());
    }
  }, [isFinished, setGrammarProgress]);

  useEffect(() => {
    return () => {
      setGrammarProgress(getStoredGrammarProgress());
    };
  }, [setGrammarProgress]);

  // Build the pool of available grammar items
  // IMPORTANT: Do NOT include grammarProgress in dependencies to avoid mid-game reshuffling when answers are recorded!
  const availablePool = useMemo(() => {
    let pool = grammarList;

    if (selectedChapters.length > 0) {
      pool = pool.filter((g) => selectedChapters.includes(g.chapter));
    }

    if (filterScope === 'chua_nho') {
      pool = pool.filter((g) => getGrammarStateHelper(g).status !== 'da_nho');
    } else if (filterScope === 'thich') {
      pool = pool.filter((g) => getGrammarStateHelper(g).is_favorite);
    }

    return pool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grammarList, selectedChapters, filterScope]);

  // Chapter display title
  const chapterDisplayTitle = useMemo(() => {
    if (selectedChapters.length === 0) return 'Tất cả 19 chương';
    if (selectedChapters.length === 1) {
      const chObj = chapters.find((c) => c.chapter === selectedChapters[0]);
      return chObj ? chObj.title : `Chương ${selectedChapters[0]}`;
    }
    if (selectedChapters.length === chapters.length) return 'Tất cả 19 chương';
    return `${selectedChapters.length} chương đã chọn`;
  }, [selectedChapters, chapters]);

  // Initialize or re-shuffle card match game
  const initGame = useCallback(() => {
    if (availablePool.length === 0) {
      setCards([]);
      setSelectedCards([]);
      setMatchedCount(0);
      setTotalPairs(0);
      setIsFinished(false);
      return;
    }

    // Determine pair count
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
        subText: `#${g.code} • ${g.chapter_title}`,
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
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });
    });

    // Shuffle all generated cards
    setCards(generatedCards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedCount(0);
    setTotalPairs(pairCount);
    setIsFinished(false);
    setSecondsElapsed(0);
  }, [availablePool, targetPairs]);

  // Re-init on pool or target pairs change
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

  // Handle changing target pair count
  const handleSelectTargetPairs = (count: number) => {
    setTargetPairs(count);
    localStorage.setItem('grammar_card_match_target_pairs', count.toString());
  };

  // Toggle hide matched
  const handleToggleHideMatched = () => {
    const next = !hideMatched;
    setHideMatched(next);
    localStorage.setItem('grammar_card_match_hide_matched', String(next));
  };

  const handleCardClick = (clickedCard: GrammarMatchCardItem) => {
    if (clickedCard.isMatched || clickedCard.isSelected || selectedCards.length >= 2 || isFinished) {
      return;
    }

    // Play Japanese audio when clicking a Japanese grammar card
    if (clickedCard.type === 'grammar') {
      speakJapanese(clickedCard.grammarItem.grammar);
    }

    const newCards = cards.map((c) =>
      c.instanceId === clickedCard.instanceId ? { ...c, isSelected: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    // If 2 cards selected, evaluate match
    if (newSelected.length === 2) {
      const [card1, card2] = newSelected;

      if (card1.grammarId === card2.grammarId && card1.type !== card2.type) {
        // MATCH SUCCESS!
        playFeedbackSound('correct');
        recordGrammarTestAnswer(grammarProgress, card1.grammarId, true);

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
            if (next === totalPairs) {
              setIsFinished(true);
            }
            return next;
          });
        }, 250);
      } else {
        // MATCH ERROR!
        playFeedbackSound('wrong');
        recordGrammarTestAnswer(grammarProgress, card1.grammarId, false);

        // Flash red wrong state
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
        }, 600);
      }
    }
  };

  // Format timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTempChapter = (ch: number) => {
    setTempSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  // Dynamic grid classes based on total card count
  const totalCardsCount = cards.length;
  const gridLayoutClass = useMemo(() => {
    if (totalCardsCount <= 12) {
      // 6 pairs: Standard 3 columns on mobile, 4 on tablet/desktop
      return 'grid-cols-3 sm:grid-cols-4';
    } else if (totalCardsCount <= 20) {
      // 10 pairs (20 cards): 4 columns on mobile/tablet, 5 on desktop
      return 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5';
    } else if (totalCardsCount <= 30) {
      // 15 pairs (30 cards): 3-4 cols on mobile, 5 cols on tablet, 6 cols on desktop
      return 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6';
    } else {
      // 20+ pairs (40+ cards): 4 cols on mobile, 5-6 cols on desktop
      return 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8';
    }
  }, [totalCardsCount]);

  // Card size class: slightly more compact when there are 20-30+ cards
  const cardSizeClass = useMemo(() => {
    if (totalCardsCount <= 12) {
      return 'min-h-[92px] sm:min-h-[105px] p-2 sm:p-2.5';
    } else if (totalCardsCount <= 20) {
      return 'min-h-[82px] sm:min-h-[94px] p-2';
    } else {
      // 30+ cards: compact to fit easily on screen
      return 'min-h-[74px] sm:min-h-[86px] p-1.5 sm:p-2';
    }
  }, [totalCardsCount]);

  // Victory Result View
  if (isFinished) {
    return (
      <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto w-full select-none pb-12 overflow-y-auto">
        <div className="my-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Hoàn Thành Ghép Ngữ Pháp!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Đã ghép đúng xuất sắc tất cả <span className="font-bold text-blue-600">{totalPairs} cặp</span> ({totalPairs * 2} thẻ)
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Thời Gian</span>
              <span className="text-lg font-black text-gray-800 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-blue-500" />
                {formatTime(secondsElapsed)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Tổng Số Thẻ</span>
              <span className="text-lg font-black text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                <Grid className="w-4 h-4 text-emerald-500" />
                {totalPairs * 2} thẻ
              </span>
            </div>
          </div>

          {/* Quick options to replay or increase card count */}
          <div className="pt-1">
            <span className="text-xs font-bold text-gray-500 block mb-2">Thử thách tiếp theo:</span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { count: 10, label: '20 Thẻ' },
                { count: 15, label: '30 Thẻ' },
                { count: 20, label: '40 Thẻ' },
                { count: 0, label: 'Tất cả ngữ pháp' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  onClick={() => {
                    handleSelectTargetPairs(opt.count);
                    initGame();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                    targetPairs === opt.count
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={initGame}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Chơi Lại Bộ Này</span>
            </button>

            <button
              onClick={() => setScreen('grammar_test')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Sang Bài Test Ngữ Pháp</span>
            </button>

            <button
              onClick={() => setScreen('grammar_list')}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition"
            >
              Về Danh Sách Ngữ Pháp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-3 sm:p-5 max-w-4xl lg:max-w-5xl mx-auto w-full select-none pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto space-y-3">
      {/* ── TOP HEADER CONTROL BAR ── */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-gray-100/90 space-y-3">
        {/* Row 1: Chapter title & Change Chapter Button */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-black">
              <Grid className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  Ghép Thẻ Ngữ Pháp
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  {availablePool.length} ngữ pháp khả dụng
                </span>
              </div>
              <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm truncate mt-0.5" title={chapterDisplayTitle}>
                {chapterDisplayTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Đổi chương</span>
            </button>

            {/* Hide/Show matched toggle */}
            <button
              onClick={handleToggleHideMatched}
              title={hideMatched ? 'Đang ẩn thẻ đã ghép (bấm để hiện)' : 'Bấm để ẩn thẻ khi ghép đúng (giúp thoáng bàn cờ)'}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1 ${
                hideMatched
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {hideMatched ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{hideMatched ? 'Đang ẩn thẻ khớp' : 'Ẩn thẻ đã ghép'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Select Card Count (6, 10, 15, 20, All) */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1 flex items-center gap-1 flex-shrink-0">
              <SlidersHorizontal className="w-3 h-3 text-gray-400" />
              <span>Số thẻ:</span>
            </span>

            {PAIR_OPTIONS.map((opt) => {
              const isSelected = targetPairs === opt.pairs;
              return (
                <button
                  key={opt.pairs}
                  onClick={() => handleSelectTargetPairs(opt.pairs)}
                  className={`px-2.5 py-1 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 flex-shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 scale-105'
                      : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] font-semibold opacity-80 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    ({opt.desc})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Scope Filter Chips */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-0.5 rounded-xl text-[11px] font-bold ml-auto">
            <button
              onClick={() => setFilterScope('tat_ca')}
              className={`px-2 py-1 rounded-lg transition ${
                filterScope === 'tat_ca' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterScope('chua_nho')}
              className={`px-2 py-1 rounded-lg transition ${
                filterScope === 'chua_nho' ? 'bg-white text-rose-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Chưa nhớ
            </button>
            <button
              onClick={() => setFilterScope('thich')}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-0.5 ${
                filterScope === 'thich' ? 'bg-white text-amber-600 shadow-2xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>Sao</span>
            </button>
          </div>
        </div>

        {/* Row 3: Progress Bar & Stopwatch */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 flex items-center gap-1.5">
              <span>Tiến độ ghép:</span>
              <span className="text-blue-600 font-black">
                {matchedCount} / {totalPairs} cặp
              </span>
              <span className="text-gray-400 font-semibold">
                ({matchedCount * 2} / {cards.length} thẻ)
              </span>
            </span>

            <span className="text-gray-600 flex items-center gap-1 font-mono font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {formatTime(secondsElapsed)}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: totalPairs > 0 ? `${(matchedCount / totalPairs) * 100}%` : '0%',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD MATCHING GRID ── */}
      {availablePool.length === 0 ? (
        <div className="my-auto bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="font-bold text-gray-800">Không có ngữ pháp nào trong phạm vi này</h4>
          <p className="text-xs text-gray-500">
            {filterScope === 'chua_nho' 
              ? 'Tất cả ngữ pháp trong chương đã chọn đã được nhớ! Hãy chọn phạm vi "Tất cả" hoặc đổi chương.'
              : 'Vui lòng chọn chương khác để ghép thẻ.'}
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setFilterScope('tat_ca')}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
            >
              Xem Tất Cả
            </button>
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
            >
              Chọn Chương Khác
            </button>
          </div>
        </div>
      ) : (
        <div className={`my-auto py-1 grid gap-2 sm:gap-2.5 md:gap-3 ${gridLayoutClass}`}>
          {cards.map((card) => {
            // If hide matched is on and card is matched, hide it invisibly
            if (hideMatched && card.isMatched) {
              return (
                <div
                  key={card.instanceId}
                  className={`${cardSizeClass} rounded-2xl invisible pointer-events-none opacity-0 transition-all duration-300`}
                />
              );
            }

            let cardStyle =
              'bg-white border-gray-200/90 text-gray-800 shadow-2xs hover:border-blue-400 hover:shadow-md active:scale-95 cursor-pointer';

            if (card.isMatched) {
              cardStyle =
                'bg-emerald-50/70 border-2 border-emerald-400 text-emerald-700 opacity-20 cursor-default scale-95 pointer-events-none';
            } else if (card.isWrong) {
              cardStyle =
                'bg-rose-500 border-2 border-rose-600 text-white font-bold shadow-lg animate-shake';
            } else if (card.isSelected) {
              cardStyle =
                'bg-blue-50 border-2 border-[#2563EB] text-[#2563EB] font-bold shadow-md scale-[1.02] ring-2 ring-blue-400/30';
            }

            return (
              <button
                key={card.instanceId}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched}
                className={`${cardSizeClass} rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center text-center relative overflow-hidden select-none ${cardStyle}`}
              >
                {card.type === 'grammar' ? (
                  <div className="flex flex-col items-center justify-center px-1">
                    <span className="text-base sm:text-lg md:text-xl font-bold font-japanese tracking-wide leading-tight">
                      {card.text}
                    </span>
                    {card.subText && totalCardsCount <= 20 && (
                      <span className="text-[10px] sm:text-[11px] text-gray-400 font-japanese mt-0.5 line-clamp-1">
                        {card.subText}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] sm:text-xs md:text-sm font-semibold leading-snug line-clamp-2 sm:line-clamp-3 px-1">
                    {card.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── FOOTER CONTROLS ── */}
      <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={initGame}
          className="px-4 py-2 bg-white text-gray-700 font-bold text-xs rounded-xl shadow-xs border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>Đổi bộ ngữ pháp khác</span>
        </button>

        <span className="text-xs font-bold text-gray-500">
          Còn lại: <span className="text-gray-800 font-black">{totalPairs - matchedCount}</span> cặp
        </span>
      </div>

      {/* Chapter selector modal */}
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
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold">
              <button
                onClick={() => setTempSelectedChapters(chapters.map((c) => c.chapter))}
                className="text-blue-600 hover:underline"
              >
                Chọn tất cả 19 chương
              </button>
              <button
                onClick={() => setTempSelectedChapters([])}
                className="text-gray-500 hover:underline"
              >
                Xóa tất cả (Mặc định)
              </button>
            </div>

            {/* Chapters Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2">
              {chapters.map((c) => {
                const isSelected = tempSelectedChapters.includes(c.chapter);
                return (
                  <button
                    key={c.chapter}
                    onClick={() => toggleTempChapter(c.chapter)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-black shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{c.title}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{c.count} ngữ pháp</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-bold text-xs hover:bg-gray-200 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setSelectedChapters(tempSelectedChapters);
                  setIsChapterModalOpen(false);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-blue-700 transition"
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

export default GrammarCardMatchScreen;
