import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LessonGridScreen } from './components/LessonGridScreen';
import { WordListScreen } from './components/WordListScreen';
import { WordDetailView } from './components/WordDetailView';
import { StudyModePickerModal } from './components/StudyModePickerModal';
import { QuickPreviewModal } from './components/QuickPreviewModal';
import { MaziiPopupModal } from './components/MaziiPopupModal';
import { CardMatchScreen } from './components/CardMatchScreen';
import { WordArrangeScreen } from './components/WordArrangeScreen';
import { TestSetupScreen } from './components/TestSetupScreen';
import { TestRunnerScreen } from './components/TestRunnerScreen';
import { LearningModeScreen } from './components/LearningModeScreen';
import { TextSelectionListener } from './components/TextSelectionListener';

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
      default:
        return <LessonGridScreen />;
    }
  };

  return (
    <div className={`h-screen w-screen bg-gray-100 flex flex-col items-center justify-start overflow-hidden ${isMobileFrame ? 'p-0 sm:p-4 md:p-6' : 'p-0'}`}>
      {/* Outer shell container: fixed height flex container so Header stays pinned at top */}
      <div
        className={`w-full bg-white flex flex-col overflow-hidden relative transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] h-full sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] sm:border-[8px] sm:border-gray-900 shadow-2xl'
            : 'max-w-6xl h-full shadow-2xl'
        }`}
      >
        <Header />
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {renderScreen()}
        </main>
      </div>

      {/* Global Modals & Listeners */}
      <QuickPreviewModal />
      <StudyModePickerModal />
      <MaziiPopupModal />
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
