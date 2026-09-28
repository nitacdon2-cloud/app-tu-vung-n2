import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Word } from '../types/vocab';
import { speakJapanese, playFeedbackSound } from '../services/audioService';
import { recordTestAnswer, getWordState } from '../services/storageService';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

interface MatchCardItem {
  instanceId: string;
  wordId: number;
  wordObj: Word;
  type: 'ja' | 'vi';
  text: string;
  subText?: string;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
}

export const CardMatchScreen: React.FC = () => {
  const { currentLesson, lessons, testConfig, userProgress, setScreen, getWordKey } = useApp();

  const [cards, setCards] = useState<MatchCardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCardItem[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalPairs, setTotalPairs] = useState(6);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Card Match round with 6 pairs (12 cards) as shown in reference screenshot
  const initGame = () => {
    let pool: Word[] = [];

    if (testConfig.selectedLessons && testConfig.selectedLessons.length > 0) {
      lessons.forEach((l) => {
        if (testConfig.selectedLessons.includes(l.lesson_id)) {
          l.words.forEach((word) => {
            const key = `${l.lesson_id}_${word.id}`;
            const state = getWordState(userProgress, key);

            if (testConfig.range === 'chua_nho' && state.status !== 'chua_nho') return;
            if (testConfig.range === 'da_nho' && state.status !== 'da_nho') return;
            if (testConfig.range === 'thich' && !state.is_favorite) return;

            pool.push(word);
          });
        }
      });
    } else if (currentLesson && currentLesson.words) {
      currentLesson.words.forEach((word) => {
        const key = `${currentLesson.lesson_id}_${word.id}`;
        const state = getWordState(userProgress, key);

        if (testConfig.range === 'chua_nho' && state.status !== 'chua_nho') return;
        if (testConfig.range === 'da_nho' && state.status !== 'da_nho') return;
        if (testConfig.range === 'thich' && !state.is_favorite) return;

        pool.push(word);
      });
    } else if (lessons.length > 0) {
      pool = [...lessons[0].words];
    }

    if (pool.length === 0) return;

    // Standard 6 pairs (12 cards total) for 3x4 grid as shown in reference image
    const pairCount = Math.min(6, pool.length);
    const selectedWords = [...pool].sort(() => 0.5 - Math.random()).slice(0, pairCount);

    const generatedCards: MatchCardItem[] = [];

    selectedWords.forEach((word) => {
      // Japanese Card
      generatedCards.push({
        instanceId: `ja_${word.id}_${Math.random()}`,
        wordId: word.id,
        wordObj: word,
        type: 'ja',
        text: word.word,
        subText: word.reading,
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });

      // Vietnamese Card
      generatedCards.push({
        instanceId: `vi_${word.id}_${Math.random()}`,
        wordId: word.id,
        wordObj: word,
        type: 'vi',
        text: word.meaning,
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });
    });

    // Shuffle cards
    setCards(generatedCards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedCount(0);
    setTotalPairs(pairCount);
    setIsFinished(false);
  };

  useEffect(() => {
    initGame();
  }, [currentLesson]);

  const handleCardClick = (clickedCard: MatchCardItem) => {
    if (clickedCard.isMatched || clickedCard.isSelected || selectedCards.length >= 2 || isFinished) {
      return;
    }

    // Play Japanese TTS on Japanese card tap
    if (clickedCard.type === 'ja') {
      speakJapanese(clickedCard.wordObj.word);
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

      if (card1.wordId === card2.wordId && card1.type !== card2.type) {
        // MATCH SUCCESS!
        playFeedbackSound('correct');
        recordTestAnswer(userProgress, getWordKey(card1.wordObj), true);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordId === card1.wordId
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
        }, 300);
      } else {
        // MATCH ERROR!
        playFeedbackSound('wrong');
        recordTestAnswer(userProgress, getWordKey(card1.wordObj), false);

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

  // Victory Result View
  if (isFinished) {
    return (
      <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-12 overflow-y-auto">
        <div className="my-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Hoàn Thành Ghép Từ!</h2>
            <p className="text-sm text-gray-500 mt-1">Đã ghép đúng tất cả {totalPairs} cặp từ vựng</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={initGame}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Chơi Bộ Tiếp Theo</span>
            </button>

            <button
              onClick={() => setScreen('test_runner')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Sang Bài Test Từ Vựng</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F7FC] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full select-none pb-10 overflow-y-auto">
      {/* Top Banner (Exact design from Screenshot 1) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 text-center mb-2">
        <h3 className="text-base sm:text-lg font-bold text-[#2563EB]">
          Chọn từng cặp từ để ghép với nhau
        </h3>
      </div>

      {/* 3 Columns x 4 Rows Grid (Exact layout from Screenshot 1) */}
      <div className="my-auto py-2 grid grid-cols-3 gap-3">
        {cards.map((card) => {
          let cardStyle =
            'bg-white border-gray-200/90 text-gray-900 shadow-sm hover:border-blue-400 hover:shadow-md active:scale-95';

          if (card.isMatched) {
            cardStyle =
              'bg-emerald-50 border-2 border-emerald-400 text-emerald-700 opacity-25 cursor-default scale-95 pointer-events-none';
          } else if (card.isWrong) {
            cardStyle =
              'bg-rose-500 border-2 border-rose-600 text-white font-bold shadow-lg animate-shake';
          } else if (card.isSelected) {
            cardStyle =
              'bg-blue-50 border-2 border-[#2563EB] text-[#2563EB] font-bold shadow-md scale-[1.02]';
          }

          return (
            <button
              key={card.instanceId}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched}
              className={`h-[92px] sm:h-[110px] p-2 sm:p-2.5 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center text-center relative overflow-hidden select-none ${cardStyle}`}
            >
              {card.type === 'ja' ? (
                <span className="text-base sm:text-lg font-bold font-japanese tracking-wide leading-tight">
                  {card.text}
                </span>
              ) : (
                <span className="text-[11px] sm:text-xs font-semibold leading-tight line-clamp-3">
                  {card.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={initGame}
          className="px-4 py-2 bg-white text-gray-700 font-bold text-xs rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đổi bộ từ khác</span>
        </button>

        <span className="text-xs font-bold text-gray-500">
          Đã ghép: {matchedCount} / {totalPairs} cặp
        </span>
      </div>
    </div>
  );
};

export default CardMatchScreen;
