import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lesson, Word, ScreenName, UserProgress, BlindMaskSettings, StatusFilter, TestConfig
} from '../types/vocab';
import { getAllLessons } from '../services/dataLoader';
import { getStoredProgress, toggleFavorite, toggleStatus } from '../services/storageService';

interface AppContextType {
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

  // Progress helpers
  handleToggleFavorite: (word: Word) => void;
  handleToggleStatus: (word: Word) => void;
  getWordKey: (word: Word) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessons] = useState<Lesson[]>(getAllLessons);
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    lessons[0]?.lesson_id || 'lesson_01'
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
    autoNext: true,
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
    setMaziiQuery(query);
  };

  return (
    <AppContext.Provider
      value={{
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
