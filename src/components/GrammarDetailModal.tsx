import React from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem } from '../types/grammar';
import { X, Volume2, Star, CheckCircle, Clock, BookOpen, Layers, Sparkles } from 'lucide-react';
import { speakJapanese } from '../services/audioService';

interface GrammarDetailModalProps {
  item: GrammarItem | null;
  onClose: () => void;
}

export const GrammarDetailModal: React.FC<GrammarDetailModalProps> = ({ item, onClose }) => {
  const {
    handleToggleGrammarFavorite,
    handleToggleGrammarStatus,
    getGrammarStateHelper,
    setMaziiQuery,
  } = useApp();

  if (!item) return null;

  const state = getGrammarStateHelper(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-start justify-between gap-3 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white backdrop-blur-sm">
                {item.chapter_title} • {item.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                Ngữ pháp N2
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide font-japanese mt-1">
              {item.grammar}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggleGrammarFavorite(item)}
              className="p-2 rounded-full hover:bg-white/20 transition active:scale-95 text-white"
              title="Đánh dấu yêu thích"
            >
              <Star className={`w-5 h-5 ${state.is_favorite ? 'fill-amber-300 text-amber-300' : 'text-white'}`} />
            </button>
            <button
              onClick={() => speakJapanese(item.grammar)}
              className="p-2 rounded-full hover:bg-white/20 transition active:scale-95 text-white"
              title="Phát âm tên ngữ pháp"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition active:scale-95 text-white"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Meaning Block */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
            <div className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" /> Ý Nghĩa Tiếng Việt
            </div>
            <p className="text-base sm:text-lg font-black text-amber-950 leading-snug">
              {item.meaning || 'Chưa cập nhật nghĩa'}
            </p>
          </div>

          {/* Connection Block (Cách chia kết hợp) */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 space-y-1.5">
            <div className="text-[11px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Cách Chia & Kết Hợp (接続)
            </div>
            <div className="p-3 bg-white rounded-xl border border-blue-100 text-sm sm:text-base font-bold text-blue-900 font-japanese tracking-wide">
              {item.connection || 'Xem giải thích chi tiết bên dưới'}
            </div>
          </div>

          {/* Explanation Block (Giải thích cách dùng) */}
          {item.explanation && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Giải Thích Chi Tiết Cách Dùng (使い方)
              </div>
              <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 leading-relaxed whitespace-pre-line">
                {item.explanation}
              </div>
            </div>
          )}

          {/* Examples Block (Các câu ví dụ từ sách) */}
          {item.examples && item.examples.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Câu Ví Dụ Mẫu ({item.examples.length})</span>
                <span className="text-[11px] text-gray-400 font-normal">Chạm loa để nghe phát âm</span>
              </div>

              <div className="space-y-2">
                {item.examples.map((ex, exIdx) => (
                  <div 
                    key={exIdx} 
                    className="p-3.5 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-200/70 transition space-y-1 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm sm:text-base font-bold text-gray-900 font-japanese leading-relaxed">
                        {ex}
                      </p>
                      <button
                        onClick={() => speakJapanese(ex.replace(/^[①②③④⑤⑥⑦⑧⑨⑩\d\.]\s*/, ''))}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition shrink-0"
                        title="Nghe phát âm câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={() => handleToggleGrammarStatus(item)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border shadow-sm ${
              state.status === 'da_nho'
                ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {state.status === 'da_nho' ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Đã Nhớ (+1 ✅)</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Đánh Dấu Đã Nhớ</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
