import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Search, Volume2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { getMaziiExternalUrl, fetchMaziiWord, MaziiSearchResult } from '../services/maziiService';
import { speakJapanese } from '../services/audioService';

export const MaziiPopupModal: React.FC = () => {
  const { maziiQuery, setMaziiQuery } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MaziiSearchResult | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!maziiQuery) return;

    setLoading(true);
    setData(null);

    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';

    // Fetch dictionary data via Mazii API
    fetchMaziiWord(maziiQuery)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // ESC key listener to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMaziiQuery(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [maziiQuery, setMaziiQuery]);

  if (!maziiQuery) return null;

  const externalUrl = getMaziiExternalUrl(maziiQuery);

  const handleClose = () => {
    setMaziiQuery(null);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Cửa sổ tra từ Mazii"
    >
      <div
        ref={modalRef}
        className="bg-white w-full sm:w-[85vw] sm:max-w-3xl h-full sm:h-[85vh] sm:max-h-[800px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 cursor-default"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-primary to-indigo-700 text-white px-5 py-3.5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Tra Từ Mazii</h3>
                <span className="bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-lg text-sm font-black font-japanese">
                  {maziiQuery}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 hidden sm:block">
                Tra cứu từ điển tiếng Nhật Mazii trực tiếp trong ứng dụng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* External Link Fallback */}
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="Mở trong tab mới nếu cần"
            >
              <span className="hidden sm:inline">Mở Mazii Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Đóng Cửa Sổ Tra Mazii"
              className="p-2 rounded-full hover:bg-white/20 transition text-white active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-gray-500">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-bold">Đang tải từ điển Mazii cho "{maziiQuery}"...</p>
            </div>
          ) : data && data.means && data.means.length > 0 ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Main Headword Banner */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black font-japanese text-gray-900">
                    {data.word}
                  </h2>
                  {data.phonetic && (
                    <p className="text-base text-primary font-bold font-japanese mt-0.5">
                      「{data.phonetic}」
                    </p>
                  )}
                </div>

                <button
                  onClick={() => speakJapanese(data.word)}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-2xl transition active:scale-95 flex items-center gap-2 font-bold text-xs"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Phát Âm</span>
                </button>
              </div>

              {/* Meanings List */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Kết Quả Giải Nghĩa Mazii</span>
                </h4>
                {data.means.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-primary font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {mIdx + 1}
                      </span>
                      <div>
                        {m.kind && (
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase mr-2">
                            {m.kind}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-gray-900">{m.mean}</span>
                      </div>
                    </div>

                    {/* Examples */}
                    {m.examples && m.examples.length > 0 && (
                      <div className="ml-8 space-y-2 pt-2 border-t border-gray-100">
                        {m.examples.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-gray-50/80 p-3 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-gray-900 font-japanese">{ex.content}</p>
                            {ex.transcription && (
                              <p className="text-[11px] text-gray-500 font-japanese">
                                {ex.transcription}
                              </p>
                            )}
                            <p className="text-gray-700 font-medium">{ex.mean}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-800 text-base">Không thể tải thông tin trực tiếp</h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  Vui lòng bấm nút mở Mazii Web bên dưới để tra cứu trực tiếp trên trang chủ.
                </p>
              </div>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <span>Mở "{maziiQuery}" trên Mazii.net</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <span>Đang tra từ: <strong className="text-gray-900">{maziiQuery}</strong></span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
