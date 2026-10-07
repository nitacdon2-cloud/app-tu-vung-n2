import kanjiHanvietMap from '../data/kanji_hanviet_map.json';

export interface MaziiExample {
  content: string;
  mean: string;
  transcription?: string;
}

export interface MaziiMeaning {
  kind?: string;
  mean: string;
  examples?: MaziiExample[];
}

export interface MaziiSearchResult {
  word: string;
  phonetic?: string;
  kanji?: string;
  means: MaziiMeaning[];
}

export interface KanjiCompDetail {
  w: string;
  h: string | null;
}

export interface KanjiWordExample {
  w: string;
  m: string;
  h?: string;
  p?: string;
}

export interface MaziiKanjiDetail {
  kanji: string;
  mean: string; // Âm Hán Việt (e.g. "TÂN")
  detail?: string; // Giải nghĩa chi tiết
  on?: string; // Onyomi (e.g. "シン")
  kun?: string; // Kunyomi (e.g. "あたら.しい")
  stroke_count?: string | number;
  level?: string[];
  tips?: {
    vi?: string; // Mẹo nhớ câu chuyện chữ Hán
  };
  compDetail?: KanjiCompDetail[]; // Các bộ thủ / thành phần cấu tạo
  examples?: KanjiWordExample[];
  example_kun?: Record<string, KanjiWordExample[]>;
  example_on?: Record<string, KanjiWordExample[]>;
}

export const getMaziiExternalUrl = (query: string): string => {
  const cleanQuery = encodeURIComponent(query.trim());
  return `https://mazii.net/vi-VN/search/word/javi/${cleanQuery}`;
};

export const getMaziiKanjiUrl = (kanji: string): string => {
  const cleanKanji = encodeURIComponent(kanji.trim());
  return `https://mazii.net/vi-VN/search/kanji/javi/${cleanKanji}`;
};

/**
 * Mở trực tiếp trang tra từ Mazii trong tab mới (không mở popup)
 */
export const openMaziiExternal = (query: string, type: 'word' | 'kanji' = 'word'): void => {
  if (!query || !query.trim()) return;
  const url = type === 'kanji' ? getMaziiKanjiUrl(query) : getMaziiExternalUrl(query);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Lấy âm Hán Việt offline từ bản đồ kanji_hanviet_map
 */
export const getOfflineHanViet = (kanjiChar: string): string => {
  return (kanjiHanvietMap as Record<string, string>)[kanjiChar] || '';
};

// Cache kết quả Kanji để chuyển tab siêu mượt và không gọi API lặp lại
const kanjiCache: Record<string, MaziiKanjiDetail> = {};

/**
 * Tra cứu chi tiết chữ Kanji từ Mazii (Âm Hán, mẹo nhớ, chiết tự, âm On/Kun, bình luận/ví dụ)
 */
export const fetchMaziiKanji = async (kanji: string): Promise<MaziiKanjiDetail | null> => {
  const cleanKanji = kanji.trim();
  if (!cleanKanji) return null;

  // 1. Kiểm tra cache bộ nhớ
  if (kanjiCache[cleanKanji]) {
    return kanjiCache[cleanKanji];
  }

  // 2. Kiểm tra cache localStorage
  try {
    const cachedStr = localStorage.getItem(`mazii_kanji_${cleanKanji}`);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      kanjiCache[cleanKanji] = parsed;
      return parsed;
    }
  } catch (e) {
    // Ignore storage parse error
  }

  // 3. Gọi API Mazii (thử qua dev proxy hoặc gọi trực tiếp)
  const apiUrls = [
    '/mazii-embed/api/search',
    'https://mazii.net/api/search'
  ];

  for (const apiUrl of apiUrls) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dict: 'javi',
          type: 'kanji',
          query: cleanKanji,
          page: 1,
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.status === 200 && data.results && data.results.length > 0) {
        const item = data.results[0];
        const offlineHv = getOfflineHanViet(cleanKanji);

        const kanjiDetail: MaziiKanjiDetail = {
          kanji: item.kanji || cleanKanji,
          mean: item.mean || offlineHv || 'HÁN TỰ',
          detail: item.detail || '',
          on: item.on || '',
          kun: item.kun || '',
          stroke_count: item.stroke_count || '',
          level: item.level || [],
          tips: item.tips || {},
          compDetail: item.compDetail || [],
          examples: item.examples || [],
          example_kun: item.example_kun || {},
          example_on: item.example_on || {},
        };

        // Lưu cache
        kanjiCache[cleanKanji] = kanjiDetail;
        try {
          localStorage.setItem(`mazii_kanji_${cleanKanji}`, JSON.stringify(kanjiDetail));
        } catch (e) {}

        return kanjiDetail;
      }
    } catch (e) {
      // Try next url
    }
  }

  // Fallback offline nếu mạng lỗi: vẫn trả về âm Hán từ map
  const fallbackHv = getOfflineHanViet(cleanKanji);
  if (fallbackHv) {
    const fallbackItem: MaziiKanjiDetail = {
      kanji: cleanKanji,
      mean: fallbackHv,
      detail: `Âm Hán Việt: ${fallbackHv}`,
      tips: { vi: `Chữ Hán: ${cleanKanji} [${fallbackHv}]` }
    };
    return fallbackItem;
  }

  return null;
};

export const fetchMaziiWord = async (query: string): Promise<MaziiSearchResult | null> => {
  const apiUrls = [
    '/mazii-embed/api/search',
    'https://mazii.net/api/search'
  ];

  for (const apiUrl of apiUrls) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dict: 'javi',
          type: 'word',
          query: query.trim(),
          page: 1,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.status === 200 && data.data && data.data.length > 0) {
        const item = data.data[0];
        return {
          word: item.word || query,
          phonetic: item.phonetic || '',
          kanji: item.kanji || '',
          means: (item.means || []).map((m: any) => ({
            kind: m.kind || '',
            mean: m.mean || '',
            examples: (m.examples || []).map((ex: any) => ({
              content: ex.content || '',
              mean: ex.mean || '',
              transcription: ex.transcription || '',
            })),
          })),
        };
      }
    } catch (e) {
      // Try next url
    }
  }
  return null;
};
