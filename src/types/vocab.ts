export interface Example {
  ja: string;
  reading: string;
  vi: string;
}

export interface Word {
  id: number;
  word: string;
  reading: string;
  han_viet: string;
  word_type: string;
  meaning: string;
  examples: Example[];
  sub_section?: string;
  is_parent_header?: boolean;
  parent_prefix?: string;
  grammar_equiv?: string;
}

export interface Lesson {
  lesson_id: string;
  lesson_name: string;
  level: string;
  words: Word[];
}

export type WordStatus = 'chua_nho' | 'da_nho';

export interface UserWordState {
  is_favorite: boolean;
  status: WordStatus;
  review_count: number;
  correct_count: number;
  wrong_count: number;
  note?: string;
}

export interface UserProgress {
  [wordKey: string]: UserWordState; // Keyed by `${lesson_id}_${word.id}` or word.word
}

export interface BlindMaskSettings {
  showWord: boolean;      // [x] Từ
  showReading: boolean;   // [x] Hira
  showHanViet: boolean;   // [ ] Hán Việt
  showMeaning: boolean;   // [x] Nghĩa
  isSwapped: boolean;     // [ ] Đảo (swap Japanese and Vietnamese)
}

export type StatusFilter = 'tat_ca' | 'chua_nho' | 'da_nho' | 'thich';

export type TestType = 
  | 'trac_nghiem'       // Chọn Đáp Án Đúng (4 đáp án)
  | 'vi_du'             // Test Qua Ví Dụ (Điền vào câu ví dụ - 4 đáp án)
  | 'ghep_tu';          // Ghép Thẻ (Card Matching)

export interface TestConfig {
  selectedLessons: string[]; // lesson_id list
  range: StatusFilter | 'on_tap';
  testType: TestType;
  maxQuestions: number;      // 10, 20, 50, 0 (all)
  autoNext: boolean;
}

export type ScreenName = 
  | 'lesson_grid'
  | 'word_list'
  | 'word_detail'
  | 'card_match'
  | 'word_arrange'
  | 'test_setup'
  | 'test_runner'
  | 'flashcard'
  | 'learning_mode'
  | 'grammar_list'
  | 'grammar_flashcard'
  | 'grammar_test';

