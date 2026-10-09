export type ExamType = 'vocab' | 'kanji';

export interface ExamQuestion {
  id: number;
  question: string;
  prompt?: string;
  type?: 'reading' | 'writing' | 'context';
  choices: string[];
  correct_answer: number; // 1-based index (1..4)
}

export interface ExamTest {
  test_id: string;
  test_number: string;
  title: string;
  category: string;
  total_questions: number;
  time_limit_minutes?: number;
  questions: ExamQuestion[];
}

export interface ExamResultRecord {
  test_id: string;
  test_type: ExamType;
  score: number;
  total: number;
  percentage: number;
  date: string;
  time_spent_seconds: number;
  user_answers: Record<number, number>; // question id -> selected choice (1..4)
}

export type ExamResultsMap = Record<string, ExamResultRecord>;
