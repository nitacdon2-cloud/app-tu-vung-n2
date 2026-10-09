import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, CheckCircle, Volume2, Search, RotateCw, ChevronLeft, 
  ChevronRight, Shuffle, Eye, ExternalLink, Sparkles, BookOpen, Globe,
  Keyboard, CheckCircle2, XCircle, ArrowRight, CornerDownLeft, RefreshCw,
  ShieldAlert, Settings2, Trophy, Repeat, RotateCcw
} from 'lucide-react';
import { speakJapanese } from '../services/audioService';
import { getWordState, toggleFavorite, setWordStatus } from '../services/storageService';
import { openMaziiExternal, getOfflineHanViet } from '../services/maziiService';
import { Word } from '../types/vocab';

interface CardItem {
  word: Word;
  lessonId: string;
  lessonName: string;
  sessionCardId?: string;
  isRetry?: boolean;
}

// Hàm chuẩn hóa chuỗi tiếng Việt bỏ dấu và chuyển chữ thường
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

// Chuyển Katakana sang Hiragana nếu người dùng gõ Katakana
const katakanaToHiragana = (str: string): string => {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
};

// Romaji to Hiragana converter (In-app IME - Giúp gõ bàn phím thường mà KHÔNG bị bàn phím ngoài gợi ý từ)
const romajiToHiraganaMap: Record<string, string> = {
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ', 'shi': 'し', 'si': 'し',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ', 'chi': 'ち', 'ti': 'ち', 'tsu': 'つ', 'tu': 'つ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ', 'ji': 'じ', 'zi': 'じ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'sa': 'さ', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'ta': 'た', 'te': 'て', 'to': 'と',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wo': 'を',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'za': 'ざ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'nn': 'ん', "n'": 'ん',
  '-': 'ー'
};

const romajiPatterns = Object.keys(romajiToHiraganaMap).sort((a, b) => b.length - a.length);

const convertRomajiToHiragana = (text: string): string => {
  let s = text.toLowerCase();
  // Xử lý sokuon (âm ngắt っ) khi gõ phụ âm kép: kk, tt, pp, ss...
  s = s.replace(/([bcdfghjklmpqrstvwxyz])\1/g, 'っ$1');

  for (const p of romajiPatterns) {
    s = s.split(p).join(romajiToHiraganaMap[p]);
  }
  return s;
};

export const FlashcardScreen: React.FC = () => {
  const {
    lessons,
    currentLesson,
    userProgress,
    setUserProgress,
    setScreen,
    setDetailWord,
    statusFilter,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterScope, setFilterScope] = useState<'tat_ca' | 'chua_nho' | 'da_nho' | 'thich'>(() => {
    if (statusFilter === 'thich') return 'thich';
    return 'chua_nho';
  });
  const [starredScope, setStarredScope] = useState<'current' | 'all'>('current');
  const [showWordFront, setShowWordFront] = useState(true);
  const [showReadingFront, setShowReadingFront] = useState(false);
  const [showHanVietFront, setShowHanVietFront] = useState(false);
  const [showMeaningFront, setShowMeaningFront] = useState(false);

  // ── Đảo thứ tự thẻ (Shuffle Mode) ──
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  // ── Chế độ Luyện gõ nhớ sâu (Active Recall Typing) ──
  const [typingMode, setTypingMode] = useState<boolean>(() => {
    return localStorage.getItem('flashcard_typing_mode') !== 'false';
  });
  // Tự động convert Romaji -> Hiragana để KHÔNG bị bàn phím ngoài gợi ý từ
  const [autoConvertRomaji, setAutoConvertRomaji] = useState<boolean>(() => {
    return localStorage.getItem('flashcard_auto_romaji') !== 'false';
  });

  // Tùy chọn lặp lại từ viết sai cho tới khi viết đúng (Mastery Mode)
  const [repeatWrongUntilMastered, setRepeatWrongUntilMastered] = useState<boolean>(() => {
    return localStorage.getItem('flashcard_repeat_wrong') !== 'false';
  });

  // State nhập liệu và kiểm tra
  const [inputAnswer, setInputAnswer] = useState('');
  const [checkResult, setCheckResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [matchedType, setMatchedType] = useState<'reading' | 'han_viet' | null>(null);
  
  // Đánh dấu thẻ hiện tại từng bị gõ sai trước khi gõ lại đúng
  const [currentCardHadError, setCurrentCardHadError] = useState<boolean>(false);
  
  // Trạng thái hoàn thành toàn bộ hàng đợi phiên học
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!currentLesson || !currentLesson.words.length) return null;

  // Calculate counts for badges
  const counts = useMemo(() => {
    let tatCa = currentLesson.words.length;
    let chuaNho = 0;
    let daNho = 0;
    let thichCurrent = 0;
    let thichAll = 0;

    currentLesson.words.forEach((w) => {
      const k = `${currentLesson.lesson_id}_${w.id}`;
      const state = getWordState(userProgress, k);
      if (state.status === 'chua_nho') chuaNho++;
      if (state.status === 'da_nho') daNho++;
      if (state.is_favorite) thichCurrent++;
    });

    lessons.forEach((l) => {
      l.words.forEach((w) => {
        const k = `${l.lesson_id}_${w.id}`;
        const state = getWordState(userProgress, k);
        if (state.is_favorite) thichAll++;
      });
    });

    return { tatCa, chuaNho, daNho, thichCurrent, thichAll };
  }, [lessons, currentLesson, userProgress]);

  // Danh sách thẻ gốc theo bộ lọc
  const baseCardItems: CardItem[] = useMemo(() => {
    let items: CardItem[] = [];
    if (filterScope === 'thich' && starredScope === 'all') {
      const allStarred: CardItem[] = [];
      lessons.forEach((l) => {
        l.words.forEach((w) => {
          const k = `${l.lesson_id}_${w.id}`;
          const state = getWordState(userProgress, k);
          if (state.is_favorite) {
            allStarred.push({ word: w, lessonId: l.lesson_id, lessonName: l.lesson_name });
          }
        });
      });
      items = allStarred;
    } else {
      items = currentLesson.words
        .filter((word) => {
          const key = `${currentLesson.lesson_id}_${word.id}`;
          const state = getWordState(userProgress, key);
          if (filterScope === 'chua_nho') return state.status === 'chua_nho';
          if (filterScope === 'da_nho') return state.status === 'da_nho';
          if (filterScope === 'thich') return state.is_favorite;
          return true;
        })
        .map((word) => ({
          word,
          lessonId: currentLesson.lesson_id,
          lessonName: currentLesson.lesson_name,
        }));
    }

    if (isShuffled && items.length > 1) {
      const shuffled = [...items];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return items;
  }, [lessons, currentLesson, filterScope, starredScope, isShuffled, shuffleKey]);

  // Hàng đợi thẻ trong phiên học (Session Queue)
  const [sessionQueue, setSessionQueue] = useState<CardItem[]>([]);

  // Khởi tạo hàng đợi phiên học khi baseCardItems hoặc bộ lọc thay đổi
  useEffect(() => {
    const queue = baseCardItems.map((item, idx) => ({
      ...item,
      sessionCardId: `${item.lessonId}_${item.word.id}_init_${idx}`,
      isRetry: false,
    }));
    setSessionQueue(queue);
    setCurrentIndex(0);
    setIsSessionFinished(false);
  }, [baseCardItems]);

  const currentItem = sessionQueue[currentIndex] || sessionQueue[0];
  const currentWord = currentItem ? currentItem.word : currentLesson.words[0];
  const currentKey = currentItem ? `${currentItem.lessonId}_${currentItem.word.id}` : '';
  const currentWordState = getWordState(userProgress, currentKey);

  // Compute Han Viet if missing
  const kanjiChars = currentWord ? currentWord.word.split('').filter(c => '\u4e00' <= c && c <= '\u9fff') : [];
  const currentHanViet = currentWord?.han_viet || kanjiChars.map(k => getOfflineHanViet(k)).filter(Boolean).join(' ');

  // Reset states on card switch
  useEffect(() => {
    setIsFlipped(false);
    setInputAnswer('');
    setCheckResult('idle');
    setMatchedType(null);
    setCurrentCardHadError(false);

    // Auto focus vào input khi sang thẻ mới nếu bật typing mode
    if (typingMode) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, typingMode]);

  const handleToggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        setShuffleKey((k) => k + 1);
      }
      return next;
    });
    setCurrentIndex(0);
    setIsSessionFinished(false);
  }, []);

  const handleReshuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
    setCurrentIndex(0);
    setIsSessionFinished(false);
  }, []);

  const handleCardToggleFavorite = useCallback(() => {
    if (!currentItem) return;
    const key = `${currentItem.lessonId}_${currentItem.word.id}`;
    const updated = toggleFavorite(userProgress, key);
    setUserProgress(updated);
  }, [currentItem, userProgress, setUserProgress]);

  const handleCardToggleStatus = useCallback(() => {
    if (!currentItem) return;
    const key = `${currentItem.lessonId}_${currentItem.word.id}`;
    const nextStatus = currentWordState.status === 'da_nho' ? 'chua_nho' : 'da_nho';
    const updated = setWordStatus(userProgress, key, nextStatus);
    setUserProgress(updated);
  }, [currentItem, currentWordState.status, userProgress, setUserProgress]);

  // Chuyển sang thẻ tiếp theo trong hàng đợi
  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setInputAnswer('');
    setCheckResult('idle');
    setMatchedType(null);
    setCurrentCardHadError(false);

    if (currentIndex < sessionQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
    }
  }, [currentIndex, sessionQueue.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setInputAnswer('');
    setCheckResult('idle');
    setMatchedType(null);
    setCurrentCardHadError(false);

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(sessionQueue.length - 1);
    }
  }, [currentIndex, sessionQueue.length]);

  // Nút Chưa Thuộc ở footer: Đánh dấu Chưa Thuộc và đẩy về cuối hàng đợi
  const handleMarkAsUnlearned = useCallback(() => {
    if (!currentItem) return;
    const key = `${currentItem.lessonId}_${currentItem.word.id}`;
    const updated = setWordStatus(userProgress, key, 'chua_nho');
    setUserProgress(updated);

    if (repeatWrongUntilMastered) {
      setSessionQueue((prev) => [
        ...prev,
        {
          ...currentItem,
          sessionCardId: `${currentItem.lessonId}_${currentItem.word.id}_retry_${Date.now()}`,
          isRetry: true,
        },
      ]);
    }

    handleNextCard();
  }, [currentItem, userProgress, setUserProgress, repeatWrongUntilMastered, handleNextCard]);

  // Nút Đã Thuộc ở footer
  const handleMarkAsLearned = useCallback(() => {
    if (!currentItem) return;
    const key = `${currentItem.lessonId}_${currentItem.word.id}`;
    const updated = setWordStatus(userProgress, key, 'da_nho');
    setUserProgress(updated);
    handleNextCard();
  }, [currentItem, userProgress, setUserProgress, handleNextCard]);

  const handleSpeech = (text: string) => {
    speakJapanese(text);
  };

  const handleViewWordDetail = () => {
    if (currentWord) {
      setDetailWord(currentWord);
      setScreen('word_detail');
    }
  };

  // ── Xử lý khi người dùng gõ vào input ──
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Tự động chuyển Romaji -> Hiragana nếu bật
    if (autoConvertRomaji && /^[a-zA-Z\s\-'぀-ゟ]+$/.test(val)) {
      const isAllUpper = val.length > 1 && val === val.toUpperCase();
      if (!isAllUpper) {
        val = convertRomajiToHiragana(val);
      }
    }

    setInputAnswer(val);
    if (checkResult !== 'idle') {
      setCheckResult('idle');
      setMatchedType(null);
    }
  };

  // ── Kiểm tra đáp án người dùng nhập (Hiragana hoặc Hán Việt) ──
  const handleCheckAnswer = useCallback(() => {
    if (!currentWord || !currentItem) return;
    const rawInput = inputAnswer.trim();
    if (!rawInput) return;

    // Chuyển romaji nếu còn sót (như chữ 'n' cuối từ)
    const convertedInput = convertRomajiToHiragana(rawInput).replace(/n$/, 'ん');
    const normalizedInput = katakanaToHiragana(convertedInput.toLowerCase().replace(/\s+/g, ' '));
    const normalizedReading = katakanaToHiragana((currentWord.reading || '').toLowerCase().replace(/\s+/g, ' '));

    // 1. Kiểm tra cách đọc Hiragana
    const readingVariants = normalizedReading.split(/[・／,]/).map(r => r.trim()).filter(Boolean);
    const isReadingMatch = readingVariants.some(r => r === normalizedInput) || normalizedInput === normalizedReading;

    // 2. Kiểm tra Âm Hán Việt
    let isHvMatch = false;
    if (currentHanViet) {
      const inputNoTone = removeVietnameseTones(rawInput);
      const hvVariants = currentHanViet.split(/[/／]/).map(v => v.trim()).filter(Boolean);

      isHvMatch = hvVariants.some(v => {
        const vLower = v.toLowerCase();
        const vNoTone = removeVietnameseTones(v);
        return (
          rawInput.toLowerCase() === vLower ||
          inputNoTone === vNoTone ||
          inputNoTone === vNoTone.replace(/\s+/g, '') ||
          inputNoTone.replace(/\s+/g, '') === removeVietnameseTones(currentHanViet).replace(/[\s/]/g, '')
        );
      });
    }

    if (isReadingMatch || isHvMatch) {
      setCheckResult('correct');
      setMatchedType(isReadingMatch ? 'reading' : 'han_viet');
      speakJapanese(currentWord.word);
      setTimeout(() => setIsFlipped(true), 400);

      // Nếu từ này từng bị gõ sai trước khi gõ lại đúng:
      if (currentCardHadError) {
        // VIẾT SAI COI NHƯ CHƯA THUỘC! Giữ nguyên là 'chua_nho'
        const updated = setWordStatus(userProgress, currentKey, 'chua_nho');
        setUserProgress(updated);

        // VÀ VIẾT TỚI ĐÚNG THÌ THÔI: Đẩy từ này về cuối hàng đợi để tự viết lại ở cuối bài
        if (repeatWrongUntilMastered) {
          setSessionQueue((prev) => [
            ...prev,
            {
              ...currentItem,
              sessionCardId: `${currentItem.lessonId}_${currentItem.word.id}_retry_${Date.now()}`,
              isRetry: true,
            },
          ]);
        }
      } else {
        // Tự viết đúng ngay từ đầu -> Đánh dấu Đã Thuộc
        const updated = setWordStatus(userProgress, currentKey, 'da_nho');
        setUserProgress(updated);
      }
      return;
    }

    // ── NẾU GÕ SAI: ──
    // 1. Coi như từ đó CHƯA THUỘC ngay lập tức
    setCurrentCardHadError(true);
    const updated = setWordStatus(userProgress, currentKey, 'chua_nho');
    setUserProgress(updated);

    // 2. Đánh dấu wrong - Bắt buộc người dùng viết lại cho tới khi đúng thì thôi!
    setCheckResult('wrong');
  }, [currentWord, currentItem, inputAnswer, currentHanViet, currentCardHadError, userProgress, currentKey, repeatWrongUntilMastered, setUserProgress]);

  // Xử lý phím Enter trong ô input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (checkResult === 'idle') {
        handleCheckAnswer();
      } else if (checkResult === 'correct') {
        // Đúng rồi -> Enter chuyển sang thẻ kế tiếp
        handleNextCard();
      } else if (checkResult === 'wrong') {
        // Đang sai: Không cho chuyển từ! Kiểm tra lại xem người dùng đã gõ đúng chưa
        handleCheckAnswer();
      }
    }
  };

  // Keyboard navigation toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextCard, handlePrevCard]);

  // Khởi động lại phiên học
  const handleRestartSession = () => {
    const queue = baseCardItems.map((item, idx) => ({
      ...item,
      sessionCardId: `${item.lessonId}_${item.word.id}_restart_${idx}`,
      isRetry: false,
    }));
    setSessionQueue(queue);
    setCurrentIndex(0);
    setIsSessionFinished(false);
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-4 max-w-lg mx-auto w-full select-none pb-8 overflow-y-auto">
      {/* Top Filter Controls */}
      <div className="bg-white rounded-3xl p-3.5 border border-gray-200/90 shadow-sm space-y-3">
        {/* Checkbox Mask Row */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 px-2 flex-wrap gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={showWordFront}
              onChange={(e) => setShowWordFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Từ Kanji</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={showReadingFront}
              onChange={(e) => setShowReadingFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Hiragana</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={showHanVietFront}
              onChange={(e) => setShowHanVietFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Hán Việt</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition">
            <input
              type="checkbox"
              checked={showMeaningFront}
              onChange={(e) => setShowMeaningFront(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300"
            />
            <span>Nghĩa</span>
          </label>
        </div>

        {/* Scope Radio Row */}
        <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-2xl text-[11px] font-bold">
          <button
            onClick={() => {
              setFilterScope('tat_ca');
              setCurrentIndex(0);
            }}
            className={`py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
              filterScope === 'tat_ca'
                ? 'bg-white text-primary font-black shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Tất Cả</span>
            <span className="text-[10px] opacity-75">({counts.tatCa})</span>
          </button>

          <button
            onClick={() => {
              setFilterScope('chua_nho');
              setCurrentIndex(0);
            }}
            className={`py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
              filterScope === 'chua_nho'
                ? 'bg-white text-rose-600 font-black shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Chưa Nhớ</span>
            <span className="text-[10px] opacity-75">({counts.chuaNho})</span>
          </button>

          <button
            onClick={() => {
              setFilterScope('da_nho');
              setCurrentIndex(0);
            }}
            className={`py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
              filterScope === 'da_nho'
                ? 'bg-white text-emerald-600 font-black shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Đã Nhớ</span>
            <span className="text-[10px] opacity-75">({counts.daNho})</span>
          </button>

          <button
            onClick={() => {
              setFilterScope('thich');
              setCurrentIndex(0);
            }}
            className={`py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
              filterScope === 'thich'
                ? 'bg-white text-amber-600 font-black shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                filterScope === 'thich' ? 'fill-amber-400 text-amber-500' : 'text-gray-400'
              }`}
            />
            <span>Có Sao</span>
            <span className="text-[10px] opacity-75">
              ({starredScope === 'all' ? counts.thichAll : counts.thichCurrent})
            </span>
          </button>
        </div>

        {/* Sub-selector when "Có Sao" is active */}
        {filterScope === 'thich' && (
          <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-xl p-1 text-xs">
            <span className="text-amber-800 font-bold px-2 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Học từ có sao:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setStarredScope('current');
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  starredScope === 'current'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                Bài Này ({counts.thichCurrent})
              </button>
              <button
                onClick={() => {
                  setStarredScope('all');
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  starredScope === 'all'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                Tất Cả Bài ({counts.thichAll})
              </button>
            </div>
          </div>
        )}

        {/* Shuffle & Mastery Control Bar */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200/90 rounded-2xl p-1.5 px-2.5 text-xs flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleShuffle}
              className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1.5 border shadow-sm text-[11px] ${
                isShuffled
                  ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/20'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              title={isShuffled ? 'Bấm để khôi phục thứ tự theo bài' : 'Bấm để đảo ngẫu nhiên thứ tự thẻ'}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffled ? 'animate-pulse' : ''}`} />
              <span>{isShuffled ? 'Đang Đảo' : 'Đảo Thẻ'}</span>
            </button>

            {isShuffled && (
              <button
                onClick={handleReshuffle}
                className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl transition flex items-center gap-1 text-[11px]"
                title="Xáo trộn lại một lần nữa"
              >
                <RotateCw className="w-3 h-3" />
                <span>Xáo lại</span>
              </button>
            )}
          </div>

          {/* Toggle Lặp lại từ sai */}
          <button
            onClick={() => {
              const next = !repeatWrongUntilMastered;
              setRepeatWrongUntilMastered(next);
              localStorage.setItem('flashcard_repeat_wrong', String(next));
            }}
            title="Khi gõ sai: Đánh dấu Chưa Thuộc và lặp lại từ đó ở cuối bài cho tới khi viết đúng"
            className={`text-[10px] font-bold px-2 py-1 rounded-xl transition flex items-center gap-1 border ${
              repeatWrongUntilMastered
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
            }`}
          >
            <Repeat className={`w-3 h-3 ${repeatWrongUntilMastered ? 'text-amber-600' : 'text-gray-400'}`} />
            <span>Lặp từ sai: {repeatWrongUntilMastered ? 'BẬT' : 'TẮT'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {sessionQueue.length > 0 && !isSessionFinished && (
        <div className="px-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1 px-1">
            <span>Tiến độ học</span>
            <span>{currentIndex + 1} / {sessionQueue.length} thẻ</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / sessionQueue.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── MÀN HÌNH HOÀN THÀNH PHIÊN HỌC (SESSION FINISHED) ── */}
      {isSessionFinished ? (
        <div className="my-8 text-center p-8 bg-white rounded-3xl border border-gray-200 shadow-lg space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-black text-gray-900 text-xl">
              Tuyệt Vời! Đã Hoàn Thành!
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
              Bạn đã vượt qua toàn bộ từ vựng trong bài! Tất cả các từ viết sai đã được rèn luyện và viết đúng thành công.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs flex justify-around font-bold">
            <div>
              <span className="text-gray-500 block text-[10px]">ĐÃ THUỘC</span>
              <span className="text-emerald-600 text-lg font-black">{counts.daNho} từ</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 block text-[10px]">CHƯA THUỘC</span>
              <span className="text-rose-600 text-lg font-black">{counts.chuaNho} từ</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 block text-[10px]">TỔNG BÀI</span>
              <span className="text-primary text-lg font-black">{currentLesson.words.length} từ</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
            <button
              onClick={handleRestartSession}
              className="w-full py-3 bg-primary hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Học lại bài này</span>
            </button>
            <button
              onClick={() => {
                setFilterScope('chua_nho');
                setCurrentIndex(0);
                setIsSessionFinished(false);
              }}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-2"
            >
              <span>Chỉ ôn các từ chưa thuộc ({counts.chuaNho})</span>
            </button>
          </div>
        </div>
      ) : sessionQueue.length === 0 ? (
        /* Empty State */
        <div className="my-12 text-center p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            {filterScope === 'thich' ? (
              <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
            ) : (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 text-base">
              {filterScope === 'thich'
                ? starredScope === 'current'
                  ? 'Chưa có từ nào được đánh dấu sao trong bài này ⭐'
                  : 'Chưa có từ nào được đánh dấu sao trong toàn bộ các bài ⭐'
                : 'Đã ôn hết danh sách này!'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              {filterScope === 'thich'
                ? 'Hãy bấm vào biểu tượng ngôi sao ⭐ trên thẻ hoặc danh sách từ vựng để lưu lại các từ cần ưu tiên học kỹ.'
                : 'Bạn có thể chuyển sang mục "Tất Cả" để ôn tập lại toàn bộ bài học.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
            {filterScope === 'thich' && starredScope === 'current' && counts.thichAll > 0 && (
              <button
                onClick={() => setStarredScope('all')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Xem {counts.thichAll} từ có dấu sao ở tất cả các bài</span>
              </button>
            )}
            <button
              onClick={() => setFilterScope('tat_ca')}
              className="px-5 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Xem lại tất cả từ bài này ({currentLesson.words.length})
            </button>
          </div>
        </div>
      ) : (
        /* 3D Flipping Flashcard Container */
        <div className="my-3 min-h-[350px] flex flex-col">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full flex-1 bg-white rounded-3xl border border-gray-200/90 shadow-xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 relative hover:border-primary/30"
          >
            {/* Front & Back Overlay Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 font-extrabold text-xs rounded-full shadow-inner">
                  {currentIndex + 1} / {sessionQueue.length}
                </span>

                {/* Huy hiệu thẻ đang lặp lại vì từng viết sai */}
                {currentItem?.isRetry && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] rounded-full flex items-center gap-1 animate-pulse">
                    <Repeat className="w-3 h-3 text-amber-700" />
                    <span>Ôn lại từ sai</span>
                  </span>
                )}

                {filterScope === 'thich' && starredScope === 'all' && currentItem?.lessonName && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                    {currentItem.lessonName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {/* Shuffle icon button on card */}
                <button
                  onClick={handleToggleShuffle}
                  className={`p-2 rounded-xl transition ${
                    isShuffled
                      ? 'bg-purple-100 text-purple-700 font-bold'
                      : 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                  }`}
                  title={isShuffled ? 'Đang đảo thẻ ngẫu nhiên' : 'Đảo thứ tự thẻ'}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                {/* View Detail button */}
                <button
                  onClick={handleViewWordDetail}
                  className="p-2 hover:bg-blue-50 text-gray-400 hover:text-primary rounded-xl transition"
                  title="Xem chi tiết Hán tự & ví dụ"
                >
                  <Eye className="w-5 h-5" />
                </button>

                <button
                  onClick={handleCardToggleFavorite}
                  className="p-2 hover:bg-amber-50 rounded-xl transition"
                  title="Yêu thích / Đánh dấu sao"
                >
                  <Star
                    className={`w-5 h-5 ${
                      currentWordState.is_favorite
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>

                <button
                  onClick={handleCardToggleStatus}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition"
                  title="Đánh dấu đã nhớ"
                >
                  <CheckCircle
                    className={`w-5 h-5 ${
                      currentWordState.status === 'da_nho'
                        ? 'fill-emerald-500 text-white'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Front Side Content */}
            {!isFlipped ? (
              <div className="my-auto text-center space-y-3 p-3 animate-in fade-in duration-200">
                {showWordFront && (
                  <h2 className="text-5xl sm:text-6xl font-black text-primary font-japanese tracking-tight">
                    {currentWord.word}
                  </h2>
                )}
                {showReadingFront && (
                  <p className="text-2xl text-gray-500 font-japanese">
                    「{currentWord.reading}」
                  </p>
                )}
                {showHanVietFront && currentHanViet && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-lg uppercase tracking-wide">
                    [{currentHanViet}]
                  </span>
                )}
                {showMeaningFront && (
                  <p className="text-lg text-gray-800 font-semibold max-w-sm mx-auto">
                    {currentWord.meaning}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeech(currentWord.word);
                    }}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-2xl transition mx-auto inline-flex items-center justify-center border border-blue-100 shadow-sm active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              /* Back Side Content */
              <div className="my-auto space-y-2.5 p-2 text-left animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-primary font-japanese">
                      {currentWord.word}
                    </h2>
                    <p className="text-lg font-bold text-gray-500 font-japanese mt-0.5">
                      「{currentWord.reading}」
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeech(currentWord.word);
                    }}
                    className="p-2.5 bg-blue-50 text-primary rounded-xl hover:bg-blue-100 border border-blue-100"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {currentHanViet && (
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-lg uppercase tracking-wide">
                    [{currentHanViet}]
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-base font-bold text-gray-900 leading-snug">{currentWord.meaning}</p>
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-1">
                    <p className="font-japanese font-bold text-gray-900">
                      {currentWord.examples[0].ja}
                    </p>
                    <p className="text-gray-600 italic font-medium">{currentWord.examples[0].vi}</p>
                  </div>
                )}

                {/* Quick link to Kanji Breakdown Table */}
                {kanjiChars.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewWordDetail();
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xem Bảng Mẹo Nhớ & Bình Luận ({kanjiChars.join(' ')})</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Flip Indicator */}
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100">
              <RotateCw className="w-3.5 h-3.5 text-primary" />
              <span>Chạm thẻ để lật ({isFlipped ? 'mặt trước' : 'mặt sau'})</span>
            </div>
          </div>
        </div>
      )}

      {/* ── KHUNG LUYỆN GÕ NHỚ SÂU (ACTIVE RECALL TYPING) ── */}
      {sessionQueue.length > 0 && !isSessionFinished && (
        <div className="mb-3 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-3 space-y-2">
          {/* Header với nút bật tắt chế độ gõ và chế độ chống gợi ý */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Keyboard className="w-4 h-4 text-primary" />
              <span>Luyện gõ nhớ sâu:</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Chống gợi ý
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const next = !autoConvertRomaji;
                  setAutoConvertRomaji(next);
                  localStorage.setItem('flashcard_auto_romaji', String(next));
                }}
                title={autoConvertRomaji ? "Gõ bàn phím tiếng Anh thường sẽ tự chuyển Hiragana" : "Đang dùng gõ tự do"}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                  autoConvertRomaji
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>Romaji→かな: {autoConvertRomaji ? 'BẬT' : 'TẮT'}</span>
              </button>

              <button
                onClick={() => {
                  const next = !typingMode;
                  setTypingMode(next);
                  localStorage.setItem('flashcard_typing_mode', String(next));
                }}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                  typingMode
                    ? 'bg-blue-50 text-primary border border-blue-200'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{typingMode ? 'BẬT' : 'TẮT'}</span>
              </button>
            </div>
          </div>

          {typingMode && (
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputAnswer}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-form-type="other"
                    name="anti_autocomplete_word_answer"
                    id="anti_autocomplete_word_answer"
                    placeholder={
                      autoConvertRomaji 
                        ? "Gõ phím thường (vd: hiku) hoặc Hán Việt..." 
                        : "Nhập Hiragana hoặc Hán Việt..."
                    }
                    className={`w-full text-sm px-3.5 py-2.5 rounded-xl border transition-all duration-200 outline-none font-japanese ${
                      checkResult === 'correct'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold'
                        : checkResult === 'wrong'
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 font-bold'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50'
                    }`}
                  />

                  {/* Status Indicator Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {checkResult === 'correct' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in" />
                    )}
                    {checkResult === 'wrong' && (
                      <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in" />
                    )}
                  </div>
                </div>

                {/* Nút Kiểm tra hoặc Tiếp theo */}
                <button
                  onClick={() => {
                    if (checkResult === 'idle' || checkResult === 'wrong') {
                      handleCheckAnswer();
                    } else if (checkResult === 'correct') {
                      handleNextCard();
                    }
                  }}
                  className={`px-3.5 py-2.5 text-xs font-black rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1 flex-shrink-0 ${
                    checkResult === 'correct'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : checkResult === 'wrong'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-primary hover:bg-blue-600 text-white'
                  }`}
                >
                  {checkResult === 'correct' ? (
                    <>
                      <span>Từ tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : checkResult === 'wrong' ? (
                    <>
                      <span>Gõ lại</span>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Kiểm tra</span>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
                    </>
                  )}
                </button>
              </div>

              {/* Dòng hướng dẫn mẹo chống gợi ý */}
              {autoConvertRomaji && checkResult === 'idle' && (
                <div className="text-[10px] text-gray-400 flex items-center justify-between px-1">
                  <span>💡 <b>Mẹo:</b> Để bàn phím tiếng Anh gõ (vd: <i>kawaigaru</i> tự thành <i>かわいがる</i>), bàn phím sẽ <b>không gợi ý</b> từ!</span>
                </div>
              )}

              {/* Feedback messages: Khi Đúng */}
              {checkResult === 'correct' && (
                <div className={`text-xs rounded-xl p-2.5 space-y-1 animate-in fade-in duration-200 border ${
                  currentCardHadError
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-100/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      {currentCardHadError ? (
                        <>
                          <Repeat className="w-4 h-4 text-amber-600" />
                          <span>Đã viết đúng! (Tính là CHƯA THUỘC vì từng viết sai)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>🎉 Chính xác! Đã thuộc:</span>
                        </>
                      )}
                      <span className="font-japanese font-extrabold text-primary">「{currentWord.reading}」</span>
                      {currentHanViet && (
                        <span className="bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px]">
                          [{currentHanViet}]
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] italic font-semibold">Nhấn Enter để sang từ kế</span>
                  </div>
                  {currentCardHadError && repeatWrongUntilMastered && (
                    <p className="text-[11px] text-amber-800">
                      👉 Từ này đã được thêm vào cuối bài để bạn tự viết lại không cần xem đáp án!
                    </p>
                  )}
                </div>
              )}

              {/* Feedback messages: Khi Viết Sai */}
              {checkResult === 'wrong' && (
                <div className="text-xs bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-2.5 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-rose-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa đúng! • Đã tính là CHƯA THUỘC ⚠️</span>
                    </span>
                    <button
                      onClick={() => {
                        setInputAnswer('');
                        setCheckResult('idle');
                        inputRef.current?.focus();
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-800 underline font-bold flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Xóa & gõ lại</span>
                    </button>
                  </div>

                  <div className="bg-white/90 p-2 rounded-lg border border-rose-100 flex items-center gap-2 flex-wrap">
                    <span className="text-gray-600 font-medium text-[11px]">Đáp án đúng:</span>
                    <span className="font-black text-primary font-japanese text-sm">
                      「{currentWord.reading}」
                    </span>
                    {currentHanViet && (
                      <span className="bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded text-[11px]">
                        [{currentHanViet}]
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-rose-700 italic">
                    ✍️ Bạn phải nhập đúng đáp án ở trên vào ô gõ thì mới được tiếp tục!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Action Buttons */}
      {!isSessionFinished && sessionQueue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 px-2">
            <button
              onClick={handlePrevCard}
              className="flex items-center gap-1 hover:text-gray-700 font-bold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ trước</span>
            </button>
            <span className="italic">Space: Lật thẻ • Enter: Gõ/Kiểm tra</span>
            <button
              onClick={handleNextCard}
              className="flex items-center gap-1 hover:text-gray-700 font-bold transition"
            >
              <span>Thẻ sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Button "Chưa Thuộc" (White/Gray) */}
            <button
              onClick={handleMarkAsUnlearned}
              className="flex-1 py-3.5 bg-white hover:bg-gray-100 text-gray-800 font-extrabold rounded-2xl border border-gray-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <span className="text-[10px] font-black text-gray-500">✕</span>
              </div>
              <span>Chưa Thuộc</span>
            </button>

            {/* Button "Đã Thuộc" (Blue) */}
            <button
              onClick={handleMarkAsLearned}
              className="flex-1 py-3.5 bg-primary hover:bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <CheckCircle className="w-5 h-5 fill-white text-primary" />
              <span>Đã Thuộc</span>
            </button>

            {/* Search Lens Button: Tra từ Mazii */}
            <button
              onClick={() => currentWord && openMaziiExternal(currentWord.word, 'word')}
              className="w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-center transition active:scale-90 flex-shrink-0"
              title="Tra trực tiếp trên Mazii.net"
            >
              <ExternalLink className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardScreen;
