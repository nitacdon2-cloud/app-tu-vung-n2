export interface GrammarItem {
  id: string;
  chapter: number;
  chapter_title: string;
  num: number;
  code: string;
  title: string;
  grammar: string;
  connection: string;
  meaning: string;
  explanation: string;
  examples: string[];
}

export interface GrammarMaskSettings {
  showConnection: boolean; // Option hiển thị cách chia
  showMeaning: boolean;    // Option hiển thị nghĩa
}

export type GrammarQuestionType = 'choose_meaning' | 'choose_connection';

export interface GrammarQuestion {
  grammarItem: GrammarItem;
  qType: GrammarQuestionType;
  questionTitle: string;
  questionSub?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export interface GrammarTestConfig {
  selectedChapters: number[];
  questionCount: number;
  questionType: 'all' | 'meaning_only' | 'connection_only';
  range: 'tat_ca' | 'chua_nho' | 'thich';
}
