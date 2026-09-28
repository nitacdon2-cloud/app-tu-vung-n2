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

export const getMaziiExternalUrl = (query: string): string => {
  const cleanQuery = encodeURIComponent(query.trim());
  return `https://mazii.net/vi-VN/search/word/javi/${cleanQuery}`;
};

export const getMaziiKanjiUrl = (kanji: string): string => {
  const cleanKanji = encodeURIComponent(kanji.trim());
  return `https://mazii.net/vi-VN/search/kanji/javi/${cleanKanji}`;
};

export const fetchMaziiWord = async (query: string): Promise<MaziiSearchResult | null> => {
  try {
    const res = await fetch('https://mazii.net/api/search', {
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
    if (!res.ok) return null;
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
    return null;
  } catch (e) {
    console.warn('Mazii API fetch failed:', e);
    return null;
  }
};
