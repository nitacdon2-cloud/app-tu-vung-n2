import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lesson, Word, ScreenName, UserProgress, BlindMaskSettings, StatusFilter, TestConfig
} from '../types/vocab';
import {
  GrammarItem, GrammarMaskSettings, GrammarTestConfig
} from '../types/grammar';
import { getAllLessons } from '../services/dataLoader';
import { getStoredProgress, toggleFavorite, toggleStatus } from '../services/storageService';
import {
  getAllGrammar, getStoredGrammarProgress, toggleGrammarFavorite, toggleGrammarStatus,
  getGrammarState, GrammarUserProgress, GrammarUserState
} from '../services/grammarDataLoader';
import { openMaziiExternal } from '../services/maziiService';

import {
  ExamTest, ExamResultRecord, ExamResultsMap
} from '../types/test';
import {
  getStoredExamResults, saveExamResult
} from '../services/examDataLoader';

interface AppContextType {
  // Navigation Module: Vocab vs Grammar vs Test
  activeModule: 'vocab' | 'grammar' | 'test';
  setActiveModule: (module: 'vocab' | 'grammar' | 'test') => void;

  // Exam / Test Center State
  selectedExam: ExamTest | null;
  examResults: ExamResultsMap;
  startExam: (test: ExamTest) => void;
  saveExamResultRecord: (record: ExamResultRecord) => void;

  // Vocab State
  lessons: Lesson[];
  currentLesson: Lesson | null;
  currentLessonId: string;
  currentScreen: ScreenName;
  userProgress: UserProgress;
  blindMask: BlindMaskSettings;
  statusFilter: StatusFilter;
  selectedWord: Word | null;
  detailWord: Word | null;
  maziiQuery: string | null;
  isStudyPickerOpen: boolean;
  isMobileFrame: boolean;
  testConfig: TestConfig;

  // Grammar State
  grammarList: GrammarItem[];
  grammarProgress: GrammarUserProgress;
  grammarMask: GrammarMaskSettings;
  currentGrammarChapter: number;
  detailGrammar: GrammarItem | null;
  grammarTestConfig: GrammarTestConfig;

  // Actions
  setScreen: (screen: ScreenName) => void;
  setCurrentLessonId: (id: string) => void;
  setBlindMask: React.Dispatch<React.SetStateAction<BlindMaskSettings>>;
  setStatusFilter: (filter: StatusFilter) => void;
  setSelectedWord: (word: Word | null) => void;
  setDetailWord: (word: Word | null) => void;
  setMaziiQuery: (query: string | null) => void;
  setIsStudyPickerOpen: (open: boolean) => void;
  setIsMobileFrame: React.Dispatch<React.SetStateAction<boolean>>;
  setTestConfig: React.Dispatch<React.SetStateAction<TestConfig>>;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;

  // Grammar Actions
  setGrammarMask: React.Dispatch<React.SetStateAction<GrammarMaskSettings>>;
  setCurrentGrammarChapter: (ch: number) => void;
  setDetailGrammar: (item: GrammarItem | null) => void;
  setGrammarProgress: React.Dispatch<React.SetStateAction<GrammarUserProgress>>;
  setGrammarTestConfig: React.Dispatch<React.SetStateAction<GrammarTestConfig>>;
  handleToggleGrammarFavorite: (item: GrammarItem) => void;
  handleToggleGrammarStatus: (item: GrammarItem) => void;
  getGrammarStateHelper: (item: GrammarItem) => GrammarUserState;

  // Vocab Progress helpers
  handleToggleFavorite: (word: Word) => void;
  handleToggleStatus: (word: Word) => void;
  getWordKey: (word: Word) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<'vocab' | 'grammar' | 'test'>('vocab');

  // Exam / Test Center state
  const [selectedExam, setSelectedExam] = useState<ExamTest | null>(null);
  const [examResults, setExamResults] = useState<ExamResultsMap>(getStoredExamResults);

  // Vocab states
  const [lessons] = useState<Lesson[]>(getAllLessons);
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    lessons[0]?.lesson_id || 'sec_1_1'
  );
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('lesson_grid');
  const [userProgress, setUserProgress] = useState<UserProgress>(getStoredProgress);

  const [blindMask, setBlindMask] = useState<BlindMaskSettings>({
    showWord: true,
    showReading: true,
    showHanViet: false,
    showMeaning: true,
    isSwapped: false,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('chua_nho');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [detailWord, setDetailWord] = useState<Word | null>(null);
  const [maziiQuery, setMaziiQuery] = useState<string | null>(null);
  const [isStudyPickerOpen, setIsStudyPickerOpen] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const [testConfig, setTestConfig] = useState<TestConfig>({
    selectedLessons: [currentLessonId],
    range: 'chua_nho',
    testType: 'trac_nghiem',
    maxQuestions: 20,
    autoNext: false,
  });

  // Grammar states
  const [grammarList] = useState<GrammarItem[]>(getAllGrammar);
  const [grammarProgress, setGrammarProgress] = useState<GrammarUserProgress>(getStoredGrammarProgress);
  const [grammarMask, setGrammarMask] = useState<GrammarMaskSettings>({
    showConnection: true,
    showMeaning: true,
  });
  const [currentGrammarChapter, setCurrentGrammarChapter] = useState<number>(0); // 0 = Tất cả chương
  const [detailGrammar, setDetailGrammar] = useState<GrammarItem | null>(null);

  const [grammarTestConfig, setGrammarTestConfig] = useState<GrammarTestConfig>({
    selectedChapters: [], // Empty means all
    questionCount: 20,
    questionType: 'all',
    range: 'tat_ca',
  });

  const currentLesson = lessons.find((l) => l.lesson_id === currentLessonId) || lessons[0] || null;

  const getWordKey = (word: Word): string => {
    return `${currentLessonId}_${word.id}`;
  };

  const handleToggleFavorite = (word: Word) => {
    const key = getWordKey(word);
    const updated = toggleFavorite(userProgress, key);
    setUserProgress(updated);
  };

  const handleToggleStatus = (word: Word) => {
    const key = getWordKey(word);
    const updated = toggleStatus(userProgress, key);
    setUserProgress(updated);
  };

  const handleSetMaziiQuery = (query: string | null) => {
    if (query && query.trim()) {
      openMaziiExternal(query);
    }
  };

  // Grammar helpers
  const handleToggleGrammarFavorite = (item: GrammarItem) => {
    const updated = toggleGrammarFavorite(grammarProgress, item.id);
    setGrammarProgress(updated);
  };

  const handleToggleGrammarStatus = (item: GrammarItem) => {
    const updated = toggleGrammarStatus(grammarProgress, item.id);
    setGrammarProgress(updated);
  };

  const getGrammarStateHelper = (item: GrammarItem): GrammarUserState => {
    return getGrammarState(grammarProgress, item.id);
  };

  const startExam = (test: ExamTest) => {
    setSelectedExam(test);
    setCurrentScreen('exam_runner');
  };

  const saveExamResultRecord = (record: ExamResultRecord) => {
    const updated = saveExamResult(record);
    setExamResults({ ...updated });
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,

        selectedExam,
        examResults,
        startExam,
        saveExamResultRecord,

        lessons,
        currentLesson,
        currentLessonId,
        currentScreen,
        userProgress,
        blindMask,
        statusFilter,
        selectedWord,
        detailWord,
        maziiQuery,
        isStudyPickerOpen,
        isMobileFrame,
        testConfig,

        grammarList,
        grammarProgress,
        grammarMask,
        currentGrammarChapter,
        detailGrammar,
        grammarTestConfig,

        setScreen: setCurrentScreen,
        setCurrentLessonId,
        setBlindMask,
        setStatusFilter,
        setSelectedWord,
        setDetailWord,
        setMaziiQuery: handleSetMaziiQuery,
        setIsStudyPickerOpen,
        setIsMobileFrame,
        setTestConfig,
        setUserProgress,

        setGrammarMask,
        setCurrentGrammarChapter,
        setDetailGrammar,
        setGrammarProgress,
        setGrammarTestConfig,
        handleToggleGrammarFavorite,
        handleToggleGrammarStatus,
        getGrammarStateHelper,

        handleToggleFavorite,
        handleToggleStatus,
        getWordKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

