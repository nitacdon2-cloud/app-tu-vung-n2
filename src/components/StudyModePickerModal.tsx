import React from 'react';
import { useApp } from '../context/AppContext';
import { Grid, CheckCircle2, X, LayoutGrid, Layers, Sparkles, BookOpen } from 'lucide-react';

export const StudyModePickerModal: React.FC = () => {
  const { isStudyPickerOpen, setIsStudyPickerOpen, setScreen, setTestConfig, testConfig } = useApp();

  if (!isStudyPickerOpen) return null;

  const handleSelectMode = (mode: 'flashcard' | 'card_match' | 'trac_nghiem' | 'vi_du' | 'word_arrange') => {
    setIsStudyPickerOpen(false);
    if (mode === 'flashcard') {
      setScreen('flashcard');
    } else if (mode === 'card_match') {
      setScreen('card_match');
    } else if (mode === 'word_arrange') {
      setScreen('word_arrange');
    } else if (mode === 'vi_du') {
      setTestConfig({ ...testConfig, testType: 'vi_du' });
      setScreen('test_runner');
    } else {
      setTestConfig({ ...testConfig, testType: 'trac_nghiem' });
      setScreen('test_runner');
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) setIsStudyPickerOpen(false); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div className="bg-white w-full max-w-sm max-h-[90vh] flex flex-col rounded-3xl shadow-2xl p-5 sm:p-6 border border-gray-100 animate-in zoom-in-95 duration-200 relative cursor-default">
        {/* Close Button */}
        <button
          onClick={() => setIsStudyPickerOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-6 flex-shrink-0">
          <h3 className="text-xl font-black text-gray-900 text-left">
            Chọn Chế Độ Luyện Tập
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 text-left">
            Vui lòng chọn 1 trong các chế độ học chất lượng cao
          </p>
        </div>

        <div className="space-y-2.5 pt-2 overflow-y-auto flex-1 pr-0.5">
          {/* Option 0: Học Thẻ Flashcard (NEW) */}
          <button
            onClick={() => handleSelectMode('flashcard')}
            className="w-full p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400 transition-all flex items-center gap-3.5 text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-900 text-base">Học Thẻ Flashcard</h4>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-md uppercase">
                  Lật Thẻ 3D
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Lật thẻ 2 mặt ghi nhớ nhanh từ vựng, âm Hán và ngữ nghĩa
              </p>
            </div>
          </button>

          {/* Option 1: Bài Test Ghép Từ */}
          <button
            onClick={() => handleSelectMode('card_match')}
            className="w-full p-4 rounded-2xl border-2 border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center gap-3.5 text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-900 text-base">Bài Test Ghép Từ</h4>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md uppercase">
                  Mini Game
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Chọn từng cặp từ Nhật - Việt để ghép với nhau
              </p>
            </div>
          </button>

          {/* Option 2: Bài Test Từ Vựng */}
          <button
            onClick={() => handleSelectMode('trac_nghiem')}
            className="w-full p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-3.5 text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-900 text-base">Bài Test Từ Vựng</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md uppercase">
                  Trắc Nghiệm
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Trắc nghiệm 4 đáp án kèm giải thích chi tiết
              </p>
            </div>
          </button>

          {/* Option 2.5: Bài Test Qua Ví Dụ (NEW) */}
          <button
            onClick={() => handleSelectMode('vi_du')}
            className="w-full p-4 rounded-2xl border-2 border-teal-100 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-400 transition-all flex items-center gap-3.5 text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-900 text-base">Bài Test Qua Ví Dụ</h4>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black rounded-md uppercase">
                  Điền Từ
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Điền từ đúng vào câu ví dụ trắc nghiệm 4 đáp án
              </p>
            </div>
          </button>

          {/* Option 3: Sắp Xếp Thành Từ */}
          <button
            onClick={() => handleSelectMode('word_arrange')}
            className="w-full p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 transition-all flex items-center gap-3.5 text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-900 text-base">Sắp Xếp Thành Từ</h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase">
                  Ghép Chữ
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Ghép các chữ Kanji thành từ hoàn chỉnh
              </p>
            </div>
          </button>
        </div>

        <div className="pt-1 text-center">
          <button
            onClick={() => setIsStudyPickerOpen(false)}
            className="w-full py-2.5 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyModePickerModal;
