import React from 'react';
import { useApp } from '../context/AppContext';
import { TestType, StatusFilter } from '../types/vocab';
import { Play, Check, BookOpen, Target, ListChecks, Sliders, Grid, CheckCircle2 } from 'lucide-react';

export const TestSetupScreen: React.FC = () => {
  const { lessons, testConfig, setTestConfig, setScreen } = useApp();

  const handleToggleLesson = (lessonId: string) => {
    const isSelected = testConfig.selectedLessons.includes(lessonId);
    let updated: string[];

    if (isSelected) {
      updated = testConfig.selectedLessons.filter((id) => id !== lessonId);
    } else {
      updated = [...testConfig.selectedLessons, lessonId];
    }

    setTestConfig({ ...testConfig, selectedLessons: updated });
  };

  const handleSelectAllLessons = () => {
    if (testConfig.selectedLessons.length === lessons.length) {
      setTestConfig({ ...testConfig, selectedLessons: [lessons[0]?.lesson_id || 'lesson_01'] });
    } else {
      setTestConfig({
        ...testConfig,
        selectedLessons: lessons.map((l) => l.lesson_id),
      });
    }
  };

  const handleStartTest = () => {
    if (testConfig.selectedLessons.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài học để làm bài test!');
      return;
    }

    if (testConfig.testType === 'ghep_tu') {
      setScreen('card_match');
    } else {
      setScreen('test_runner');
    }
  };

  const isAllSelected = testConfig.selectedLessons.length === lessons.length;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-between p-4 sm:p-6 max-w-2xl mx-auto w-full select-none pb-24 overflow-y-auto">
      <div className="space-y-5">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base">JLPT N2 Từ Vựng</span>
            <p className="text-xs text-gray-500">Chương trình luyện tập từ vựng chuẩn JMaster</p>
          </div>
        </div>

        {/* Section 1: Chọn Bài Học */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Chọn bài học</span>
            </h3>
            <button
              onClick={handleSelectAllLessons}
              className="text-xs font-bold text-primary hover:underline"
            >
              {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1">
            {lessons.map((lesson, idx) => {
              const isSelected = testConfig.selectedLessons.includes(lesson.lesson_id);
              return (
                <button
                  key={lesson.lesson_id}
                  onClick={() => handleToggleLesson(lesson.lesson_id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-blue-50 border-primary text-primary font-bold shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition flex-shrink-0 ${
                      isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate">Lesson {idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Chọn Phạm Vi Test */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            <span>Chọn phạm vi test</span>
          </h3>

          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'tat_ca', label: 'Tất Cả' },
              { id: 'chua_nho', label: 'Chưa Nhớ' },
              { id: 'da_nho', label: 'Đã Nhớ' },
              { id: 'thich', label: 'Thích' },
            ].map((item) => {
              const isActive = testConfig.range === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setTestConfig({ ...testConfig, range: item.id as StatusFilter })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-blue-50 border-primary text-primary font-bold shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isActive ? 'border-primary border-4 bg-white' : 'border-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Chọn Loại Bài Test (Chỉ 2 Chức Năng Chính) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-purple-600" />
            <span>Chọn chế độ làm bài</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Ghép Thẻ */}
            <button
              onClick={() => setTestConfig({ ...testConfig, testType: 'ghep_tu' })}
              className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                testConfig.testType === 'ghep_tu'
                  ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  testConfig.testType === 'ghep_tu'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Grid className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Ghép Thẻ</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">Nối cặp từ Nhật - Việt</p>
              </div>
            </button>

            {/* Mode 2: Chọn Đáp Án Đúng (Từ vựng) */}
            <button
              onClick={() => setTestConfig({ ...testConfig, testType: 'trac_nghiem' })}
              className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                testConfig.testType === 'trac_nghiem'
                  ? 'bg-blue-50 border-primary text-primary shadow-sm font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  testConfig.testType === 'trac_nghiem'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Từ & Nghĩa</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">Trắc nghiệm 4 lựa chọn</p>
              </div>
            </button>

            {/* Mode 3: Test Qua Ví Dụ (NEW) */}
            <button
              onClick={() => setTestConfig({ ...testConfig, testType: 'vi_du' })}
              className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                testConfig.testType === 'vi_du'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  testConfig.testType === 'vi_du'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-sm">Test Ví Dụ</h4>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">Mới</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">Điền từ vào câu ví dụ</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 4: Cài Đặt Bổ Sung */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>Cài đặt bổ sung</span>
          </h3>

          <div className="space-y-3 text-sm">
            {/* Max questions dropdown */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Số câu hỏi tối đa</span>
              <select
                value={testConfig.maxQuestions}
                onChange={(e) =>
                  setTestConfig({ ...testConfig, maxQuestions: parseInt(e.target.value, 10) })
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-800 outline-none focus:border-primary"
              >
                <option value={10}>10 câu</option>
                <option value={20}>20 câu</option>
                <option value={50}>50 câu</option>
                <option value={0}>Tất cả</option>
              </select>
            </div>

            {/* Auto Next Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-700">Tự động chuyển sang câu hỏi kế</span>
              <button
                onClick={() => setTestConfig({ ...testConfig, autoNext: !testConfig.autoNext })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                  testConfig.autoNext ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    testConfig.autoNext ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom "LÀM BÀI" Blue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-30 flex justify-center">
        <button
          onClick={handleStartTest}
          className="w-full max-w-lg py-4 bg-primary hover:bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition border-2 border-white"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>BẮT ĐẦU LUYỆN TẬP</span>
        </button>
      </div>
    </div>
  );
};

export default TestSetupScreen;
