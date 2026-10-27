import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Sparkles, Layers, Target } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const { currentScreen, setScreen, activeModule, setActiveModule, isMobileFrame } = useApp();

  // Hide bottom tab bar during immersive test / practice runner / setup screens
  const isImmersiveMode = [
    'exam_runner',
    'test_runner',
    'test_setup',
    'grammar_test',
    'grammar_card_match',
    'card_match',
    'word_arrange',
    'flashcard',
    'learning_mode',
    'dictation',
    'hands_free',
    'pronunciation'
  ].includes(currentScreen);

  if (isImmersiveMode) return null;

  const isVocab = activeModule === 'vocab' && !currentScreen.startsWith('grammar_') && currentScreen !== 'test_center' && currentScreen !== 'sprint_roadmap';
  const isGrammar = activeModule === 'grammar' || currentScreen.startsWith('grammar_');
  const isTest = activeModule === 'test' || currentScreen === 'test_center';
  const isRoadmap = activeModule === 'roadmap' || currentScreen === 'sprint_roadmap';

  return (
    <nav
      className={`${isMobileFrame ? 'flex' : 'flex md:hidden'} bg-white/95 backdrop-blur-lg border-t border-gray-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-30 flex-shrink-0 select-none transition-all duration-200`}
      style={{
        paddingBottom: isMobileFrame ? '12px' : 'max(0.35rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Điều hướng chính"
    >
      <div className="flex items-center justify-around h-13 px-2 pt-1 max-w-lg mx-auto">
        {/* Tab 1: Từ Vựng */}
        <button
          id="tab-vocab"
          onClick={() => {
            setActiveModule('vocab');
            if (currentScreen !== 'word_list') {
              setScreen('lesson_grid');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition active:scale-95 cursor-pointer relative ${
            isVocab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 transition-transform ${isVocab ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            {isVocab && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isVocab ? 'font-black' : 'font-medium'}`}>
            Từ Vựng
          </span>
        </button>

        {/* Tab 2: Ngữ Pháp */}
        <button
          id="tab-grammar"
          onClick={() => {
            setActiveModule('grammar');
            setScreen('grammar_list');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition active:scale-95 cursor-pointer relative ${
            isGrammar ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 transition-transform ${isGrammar ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full leading-tight shadow-xs">
              112
            </span>
            {isGrammar && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isGrammar ? 'font-black' : 'font-medium'}`}>
            Ngữ Pháp
          </span>
        </button>

        {/* Tab 3: Luyện Test */}
        <button
          id="tab-test"
          onClick={() => {
            setActiveModule('test');
            setScreen('test_center');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition active:scale-95 cursor-pointer relative ${
            isTest ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Layers className={`w-5 h-5 transition-transform ${isTest ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-black rounded-full leading-tight shadow-xs">
              59
            </span>
            {isTest && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isTest ? 'font-black' : 'font-medium'}`}>
            Luyện Test
          </span>
        </button>

        {/* Tab 4: Lộ Trình */}
        <button
          id="tab-roadmap"
          onClick={() => {
            setActiveModule('roadmap');
            setScreen('sprint_roadmap');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition active:scale-95 cursor-pointer relative ${
            isRoadmap ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Target className={`w-5 h-5 transition-transform ${isRoadmap ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full leading-tight shadow-xs">
              40N
            </span>
            {isRoadmap && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isRoadmap ? 'font-black' : 'font-medium'}`}>
            Lộ Trình
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomTabBar;
