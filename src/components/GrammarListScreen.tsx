import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem } from '../types/grammar';
import { getGrammarChapters } from '../services/grammarDataLoader';
import { GrammarDetailModal } from './GrammarDetailModal';
import { 
  Search, Eye, EyeOff, Star, CheckCircle, Clock, Volume2, 
  Layers, HelpCircle, BookOpen, Sparkles, Filter, ChevronRight, Award
} from 'lucide-react';
import { speakJapanese } from '../services/audioService';

export const GrammarListScreen: React.FC = () => {
  const {
    grammarList,
    grammarProgress,
    grammarMask,
    setGrammarMask,
    currentGrammarChapter,
    setCurrentGrammarChapter,
    detailGrammar,
    setDetailGrammar,
    setScreen,
    handleToggleGrammarFavorite,
    handleToggleGrammarStatus,
    getGrammarStateHelper,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'chua_nho' | 'da_nho' | 'thich'>('all');
  const [revealedItems, setRevealedItems] = useState<Record<string, { connection?: boolean; meaning?: boolean }>>({});

  const chapters = useMemo(() => getGrammarChapters(), []);

  // Filter grammar items
  const filteredItems = useMemo(() => {
    let result = grammarList;

    // Filter by Chapter
    if (currentGrammarChapter > 0) {
      result = result.filter(g => g.chapter === currentGrammarChapter);
    }

    // Filter by Status
    if (statusTab === 'chua_nho') {
      result = result.filter(g => getGrammarStateHelper(g).status !== 'da_nho');
    } else if (statusTab === 'da_nho') {
      result = result.filter(g => getGrammarStateHelper(g).status === 'da_nho');
    } else if (statusTab === 'thich') {
      result = result.filter(g => getGrammarStateHelper(g).is_favorite);
    }

    // Filter by Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(g => 
        g.grammar.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        g.connection.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.explanation.toLowerCase().includes(q)
      );
    }

    return result;
  }, [grammarList, currentGrammarChapter, statusTab, searchTerm, grammarProgress]);

  // Overall stats
  const totalLearned = useMemo(() => {
    return grammarList.filter(g => getGrammarStateHelper(g).status === 'da_nho').length;
  }, [grammarList, grammarProgress]);

  const toggleReveal = (id: string, type: 'connection' | 'meaning', e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: !prev[id]?.[type]
      }
    }));
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col p-3 sm:p-5 max-w-5xl mx-auto w-full select-none pb-12 overflow-y-auto space-y-4">
      {/* Top Banner & Quick Navigation */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> JLPT N2 • 19 Chương Ngữ Pháp Cốt Lõi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kho Ngữ Pháp N2 Chuẩn Sách
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-md">
            Ngữ pháp luôn hiển thị sẵn • Tùy chọn ẩn/hiện cách chia & nghĩa • Chạm thẻ xem chi tiết giải thích & ví dụ.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 w-full sm:w-auto">
          <button
            onClick={() => setScreen('grammar_flashcard')}
            className="flex-1 sm:flex-initial px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95"
            title="Vào chế độ học Flashcard"
          >
            <BookOpen className="w-4 h-4" />
            <span>Chế Độ Học (Flashcard)</span>
          </button>

          <button
            onClick={() => setScreen('grammar_test')}
            className="flex-1 sm:flex-initial px-4 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
            title="Làm bài kiểm tra trắc nghiệm"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>Bài Test</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Chapter Filter + Mask Options + Search */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm space-y-3">
        {/* Row 1: Search & Mask Options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm ngữ pháp, nghĩa tiếng Việt, cách chia..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>

          {/* Mask Options (MANDATORY REQUIREMENT) */}
          <div className="flex items-center gap-2">
            {/* Toggle Cách Chia */}
            <button
              onClick={() => setGrammarMask(prev => ({ ...prev, showConnection: !prev.showConnection }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                grammarMask.showConnection
                  ? 'bg-blue-50 text-primary border-blue-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
              title="Bật/Tắt hiển thị cách chia trên thẻ"
            >
              {grammarMask.showConnection ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{grammarMask.showConnection ? 'Hiện cách chia' : 'Ẩn cách chia'}</span>
            </button>

            {/* Toggle Nghĩa */}
            <button
              onClick={() => setGrammarMask(prev => ({ ...prev, showMeaning: !prev.showMeaning }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                grammarMask.showMeaning
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
              title="Bật/Tắt hiển thị nghĩa tiếng Việt trên thẻ"
            >
              {grammarMask.showMeaning ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{grammarMask.showMeaning ? 'Hiện nghĩa' : 'Ẩn nghĩa'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Tabs & Chapter Select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({grammarList.length})
            </button>
            <button
              onClick={() => setStatusTab('chua_nho')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                statusTab === 'chua_nho' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chưa nhớ ({grammarList.length - totalLearned})
            </button>
            <button
              onClick={() => setStatusTab('da_nho')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                statusTab === 'da_nho' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đã nhớ ({totalLearned})
            </button>
            <button
              onClick={() => setStatusTab('thich')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                statusTab === 'thich' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⭐ Yêu thích
            </button>
          </div>

          {/* Chapter Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">Chương:</span>
            <select
              value={currentGrammarChapter}
              onChange={(e) => setCurrentGrammarChapter(Number(e.target.value))}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={0}>Tất cả các chương (19 Chương)</option>
              {chapters.map(c => (
                <option key={c.chapter} value={c.chapter}>
                  {c.title} ({c.count} ngữ pháp)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grammar Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const state = getGrammarStateHelper(item);
            const isRevealedConn = revealedItems[item.id]?.connection;
            const isRevealedMean = revealedItems[item.id]?.meaning;

            const shouldShowConn = grammarMask.showConnection || isRevealedConn;
            const shouldShowMean = grammarMask.showMeaning || isRevealedMean;

            return (
              <div
                key={item.id}
                onClick={() => setDetailGrammar(item)}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.99] relative"
              >
                {/* Card Top: Code Badge + Grammar Always Shown + Action buttons */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 font-mono border border-indigo-100">
                        #{item.code}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {item.chapter_title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => speakJapanese(item.grammar)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleGrammarFavorite(item)}
                        className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg transition"
                        title="Đánh dấu yêu thích"
                      >
                        <Star className={`w-4 h-4 ${state.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleToggleGrammarStatus(item)}
                        className={`p-1.5 rounded-lg transition ${
                          state.status === 'da_nho' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:text-emerald-500'
                        }`}
                        title="Đánh dấu đã nhớ"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* MANDATORY: NGỮ PHÁP LUÔN HIỂN THỊ */}
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-japanese tracking-wide group-hover:text-primary transition-colors">
                    {item.grammar}
                  </h3>
                </div>

                {/* Card Middle: Connection & Meaning with Mask Options */}
                <div className="my-3 space-y-2">
                  {/* Connection (Cách chia) */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                      <span>Cách chia (接続)</span>
                      {!grammarMask.showConnection && (
                        <button
                          onClick={(e) => toggleReveal(item.id, 'connection', e)}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          {isRevealedConn ? 'Ẩn' : 'Xem'}
                        </button>
                      )}
                    </div>
                    {shouldShowConn ? (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs sm:text-sm font-bold text-blue-900 font-japanese leading-relaxed">
                        {item.connection || 'Xem giải thích chi tiết'}
                      </div>
                    ) : (
                      <div
                        onClick={(e) => toggleReveal(item.id, 'connection', e)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200/80 rounded-xl text-xs font-bold text-gray-400 text-center cursor-pointer transition select-none flex items-center justify-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Chạm để hiển thị cách chia</span>
                      </div>
                    )}
                  </div>

                  {/* Meaning (Nghĩa) */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                      <span>Nghĩa tiếng Việt</span>
                      {!grammarMask.showMeaning && (
                        <button
                          onClick={(e) => toggleReveal(item.id, 'meaning', e)}
                          className="text-[10px] font-semibold text-amber-700 hover:underline"
                        >
                          {isRevealedMean ? 'Ẩn' : 'Xem'}
                        </button>
                      )}
                    </div>
                    {shouldShowMean ? (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs sm:text-sm font-black text-amber-950 leading-relaxed">
                        {item.meaning || 'Chưa cập nhật nghĩa'}
                      </div>
                    ) : (
                      <div
                        onClick={(e) => toggleReveal(item.id, 'meaning', e)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200/80 rounded-xl text-xs font-bold text-gray-400 text-center cursor-pointer transition select-none flex items-center justify-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Chạm để hiển thị nghĩa</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Tap Hint & Examples Count */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.examples.length} câu ví dụ mẫu</span>
                  </span>
                  <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center">
                    Chi tiết & ví dụ <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm space-y-3">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700 text-base">Không tìm thấy ngữ pháp phù hợp</h3>
          <p className="text-xs text-gray-400">Vui lòng thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm.</p>
        </div>
      )}

      {/* Detail Modal */}
      <GrammarDetailModal
        item={detailGrammar}
        onClose={() => setDetailGrammar(null)}
      />
    </div>
  );
};
