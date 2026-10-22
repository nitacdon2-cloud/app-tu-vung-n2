import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LessonGridScreen } from './components/LessonGridScreen';
import { WordListScreen } from './components/WordListScreen';
import { WordDetailView } from './components/WordDetailView';
import { StudyModePickerModal } from './components/StudyModePickerModal';
import { QuickPreviewModal } from './components/QuickPreviewModal';
import { CardMatchScreen } from './components/CardMatchScreen';
import { WordArrangeScreen } from './components/WordArrangeScreen';
import { TestSetupScreen } from './components/TestSetupScreen';
import { TestRunnerScreen } from './components/TestRunnerScreen';
import { LearningModeScreen } from './components/LearningModeScreen';
import { FlashcardScreen } from './components/FlashcardScreen';
import { GrammarListScreen } from './components/GrammarListScreen';
import { GrammarFlashcardScreen } from './components/GrammarFlashcardScreen';
import { GrammarTestScreen } from './components/GrammarTestScreen';
import { GrammarCardMatchScreen } from './components/GrammarCardMatchScreen';
import { TestCenterScreen } from './components/TestCenterScreen';
import { ExamRunnerScreen } from './components/ExamRunnerScreen';
import { SprintRoadmapScreen } from './components/SprintRoadmapScreen';
import { TextSelectionListener } from './components/TextSelectionListener';

import { BottomTabBar } from './components/BottomTabBar';

const MainContent: React.FC = () => {
  const { currentScreen, isMobileFrame } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lesson_grid':
        return <LessonGridScreen />;
      case 'word_list':
        return <WordListScreen />;
      case 'word_detail':
        return <WordDetailView />;
      case 'flashcard':
        return <FlashcardScreen />;
      case 'card_match':
        return <CardMatchScreen />;
      case 'word_arrange':
        return <WordArrangeScreen />;
      case 'test_setup':
        return <TestSetupScreen />;
      case 'test_runner':
        return <TestRunnerScreen />;
      case 'learning_mode':
        return <LearningModeScreen />;
      case 'grammar_list':
        return <GrammarListScreen />;
      case 'grammar_flashcard':
        return <GrammarFlashcardScreen />;
      case 'grammar_test':
        return <GrammarTestScreen />;
      case 'grammar_card_match':
        return <GrammarCardMatchScreen />;
      case 'test_center':
        return <TestCenterScreen />;
      case 'exam_runner':
        return <ExamRunnerScreen />;
      case 'sprint_roadmap':
        return <SprintRoadmapScreen />;
      default:
        return <LessonGridScreen />;
    }
  };

  return (
    <div className={`h-[100dvh] w-screen bg-gray-100 flex flex-col items-center justify-start overflow-hidden ${isMobileFrame ? 'p-0 sm:p-4 md:p-6' : 'p-0'}`}>
      {/* Outer shell container: fixed height flex container so Header stays pinned at top */}
      <div
        className={`w-full bg-white flex flex-col overflow-hidden relative transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] h-full sm:h-[860px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-gray-900 shadow-2xl'
            : 'max-w-6xl h-full shadow-2xl'
        }`}
      >
        {/* Simulated Dynamic Island Pill for Desktop Mobile Frame Preview */}
        {isMobileFrame && (
          <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 pointer-events-none shadow-md items-center justify-end px-2.5">
            <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-950/80 rounded-full" />
            </div>
          </div>
        )}

        <Header />
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {renderScreen()}
        </main>
        <BottomTabBar />
      </div>

      {/* Global Modals & Listeners */}
      <QuickPreviewModal />
      <StudyModePickerModal />
      <TextSelectionListener />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
