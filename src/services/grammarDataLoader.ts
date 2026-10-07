import { GrammarItem } from '../types/grammar';
import grammarDataRaw from '../data/grammar_n2.json';

const GRAMMAR_STORAGE_KEY = 'jmaster_grammar_progress_v1';

export interface GrammarUserState {
  is_favorite: boolean;
  status: 'chua_nho' | 'da_nho';
  review_count: number;
  correct_count: number;
  wrong_count: number;
}

export type GrammarUserProgress = Record<string, GrammarUserState>;

export const getAllGrammar = (): GrammarItem[] => {
  return grammarDataRaw as GrammarItem[];
};

export const getGrammarByChapter = (chapter: number): GrammarItem[] => {
  return (grammarDataRaw as GrammarItem[]).filter(g => g.chapter === chapter);
};

export const getGrammarChapters = (): { chapter: number; title: string; count: number }[] => {
  const all = grammarDataRaw as GrammarItem[];
  const map = new Map<number, { title: string; count: number }>();
  all.forEach(g => {
    if (!map.has(g.chapter)) {
      map.set(g.chapter, { title: g.chapter_title, count: 0 });
    }
    map.get(g.chapter)!.count += 1;
  });
  return Array.from(map.entries()).map(([chapter, info]) => ({
    chapter,
    title: info.title,
    count: info.count,
  }));
};

export const getStoredGrammarProgress = (): GrammarUserProgress => {
  try {
    const raw = localStorage.getItem(GRAMMAR_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read grammar progress from storage:', e);
    return {};
  }
};

export const saveGrammarProgress = (progress: GrammarUserProgress): void => {
  try {
    localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save grammar progress to storage:', e);
  }
};

export const getGrammarState = (progress: GrammarUserProgress, grammarId: string): GrammarUserState => {
  return progress[grammarId] || {
    is_favorite: false,
    status: 'chua_nho',
    review_count: 0,
    correct_count: 0,
    wrong_count: 0,
  };
};

export const toggleGrammarFavorite = (progress: GrammarUserProgress, grammarId: string): GrammarUserProgress => {
  const current = getGrammarState(progress, grammarId);
  const updated: GrammarUserProgress = {
    ...progress,
    [grammarId]: {
      ...current,
      is_favorite: !current.is_favorite,
    },
  };
  saveGrammarProgress(updated);
  return updated;
};

export const toggleGrammarStatus = (progress: GrammarUserProgress, grammarId: string): GrammarUserProgress => {
  const current = getGrammarState(progress, grammarId);
  const nextStatus = current.status === 'da_nho' ? 'chua_nho' : 'da_nho';
  const updated: GrammarUserProgress = {
    ...progress,
    [grammarId]: {
      ...current,
      status: nextStatus,
    },
  };
  saveGrammarProgress(updated);
  return updated;
};

export const recordGrammarTestAnswer = (
  progress: GrammarUserProgress,
  grammarId: string,
  isCorrect: boolean
): GrammarUserProgress => {
  const current = getGrammarState(progress, grammarId);
  const updated: GrammarUserProgress = {
    ...progress,
    [grammarId]: {
      ...current,
      review_count: current.review_count + 1,
      correct_count: isCorrect ? current.correct_count + 1 : current.correct_count,
      wrong_count: isCorrect ? current.wrong_count : current.wrong_count + 1,
      status: isCorrect ? 'da_nho' : 'chua_nho',
    },
  };
  saveGrammarProgress(updated);
  return updated;
};
