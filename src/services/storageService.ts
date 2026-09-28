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
  return progress[wordKey] || {
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
