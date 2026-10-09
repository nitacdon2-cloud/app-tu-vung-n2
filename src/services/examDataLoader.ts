import { ExamTest, ExamResultRecord, ExamResultsMap } from '../types/test';
import vocabTestsRaw from '../data/tests_vocab_data.json';
import kanjiTestsRaw from '../data/tests_kanji_data.json';

const STORAGE_KEY_EXAM_RESULTS = 'jmaster_n2_exam_results_v1';

export const getVocabTests = (): ExamTest[] => {
  return vocabTestsRaw as ExamTest[];
};

export const getKanjiTests = (): ExamTest[] => {
  return kanjiTestsRaw as ExamTest[];
};

export const getExamById = (testId: string): ExamTest | undefined => {
  const all = [...(vocabTestsRaw as ExamTest[]), ...(kanjiTestsRaw as ExamTest[])];
  return all.find(t => t.test_id === testId);
};

export const getStoredExamResults = (): ExamResultsMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXAM_RESULTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load exam results from storage:', err);
    return {};
  }
};

export const saveExamResult = (record: ExamResultRecord): ExamResultsMap => {
  try {
    const existing = getStoredExamResults();
    // Only update if better score or newer
    existing[record.test_id] = record;
    localStorage.setItem(STORAGE_KEY_EXAM_RESULTS, JSON.stringify(existing));
    return existing;
  } catch (err) {
    console.error('Failed to save exam result:', err);
    return getStoredExamResults();
  }
};
