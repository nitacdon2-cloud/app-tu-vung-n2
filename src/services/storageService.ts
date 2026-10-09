import { UserProgress, UserWordState } from '../types/vocab';

const STORAGE_KEY = 'jmaster_user_progress_v1';

export const getStoredProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read progress from storage:', e);
    return {};
  }
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to storage:', e);
  }
};

export const getWordState = (progress: UserProgress, wordKey: string): UserWordState => {
  if (progress[wordKey]) return progress[wordKey];

  // Fallback for legacy key format (e.g., lesson_01_1 -> sec_01_01_1)
  const parts = wordKey.split('_');
  const wordId = parts[parts.length - 1];
  if (wordId) {
    const legacyKey = Object.keys(progress).find((k) => k.endsWith(`_${wordId}`));
    if (legacyKey && progress[legacyKey]) {
      return progress[legacyKey];
    }
  }

  return {
    is_favorite: false,
    status: 'chua_nho',
    review_count: 0,
    correct_count: 0,
    wrong_count: 0,
  };
};

export const toggleFavorite = (progress: UserProgress, wordKey: string): UserProgress => {
  const current = getWordState(progress, wordKey);
  const updated: UserProgress = {
    ...progress,
    [wordKey]: {
      ...current,
      is_favorite: !current.is_favorite,
    },
  };
  saveProgress(updated);
  return updated;
};

export const toggleStatus = (progress: UserProgress, wordKey: string): UserProgress => {
  const current = getWordState(progress, wordKey);
  const nextStatus = current.status === 'da_nho' ? 'chua_nho' : 'da_nho';
  const updated: UserProgress = {
    ...progress,
    [wordKey]: {
      ...current,
      status: nextStatus,
    },
  };
  saveProgress(updated);
  return updated;
};

export const setWordStatus = (
  progress: UserProgress,
  wordKey: string,
  status: 'da_nho' | 'chua_nho'
): UserProgress => {
  const current = getWordState(progress, wordKey);
  const updated: UserProgress = {
    ...progress,
    [wordKey]: {
      ...current,
      status,
      wrong_count: status === 'chua_nho' ? (current.wrong_count || 0) + 1 : current.wrong_count,
    },
  };
  saveProgress(updated);
  return updated;
};

export const recordTestAnswer = (
  progress: UserProgress,
  wordKey: string,
  isCorrect: boolean
): UserProgress => {
  const current = getWordState(progress, wordKey);
  const updated: UserProgress = {
    ...progress,
    [wordKey]: {
      ...current,
      review_count: current.review_count + 1,
      correct_count: isCorrect ? current.correct_count + 1 : current.correct_count,
      wrong_count: isCorrect ? current.wrong_count : current.wrong_count + 1,
      status: isCorrect ? 'da_nho' : 'chua_nho',
    },
  };
  saveProgress(updated);
  return updated;
};
