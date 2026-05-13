import React from "react";
import { Plus, Trophy, Clock, PlayCircle, FileUp, Loader2, FileText, Info } from "lucide-react";

const QuizTab = ({ 
  event, 
  quizzes = [], 
  loadingQuizzes = false,
  setShowQuizCreatorModal, 
  handleStartQuiz,
  fileInputRef,
  handleWordImport,
  importingWord = false,
}) => {
  const [visiblePins, setVisiblePins] = React.useState({});
  const [showGuide, setShowGuide] = React.useState(false);

  const togglePin = (id) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input - onChange calls the parent's handleWordImport(e) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc"
        className="hidden"
        onChange={handleWordImport}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thử thách (Quizzes)</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tăng tương tác cho sự kiện của bạn</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Import Word Button */}
          <div className="relative">
            <button
              onClick={() => fileInputRef?.current?.click()}
              disabled={importingWord}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {importingWord ? (
                <><Loader2 size={16} className="animate-spin" /> Đang import...</>
              ) : (
                <><FileUp size={16} /> Import Word</>
              )}
            </button>

            {/* Guide tooltip trigger */}
            <button
              onClick={() => setShowGuide(g => !g)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center hover:bg-indigo-200 hover:text-indigo-700 transition-colors z-10"
              title="Xem hướng dẫn định dạng file Word"
            >
              <Info size={11} />
            </button>
          </div>

          {/* Create New Button */}
          <button
            onClick={() => setShowQuizCreatorModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Tạo thử thách mới
          </button>
        </div>
      </div>

      {/* Word Format Guide */}
      {showGuide && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-2">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-black text-indigo-800 text-sm uppercase tracking-wide mb-3">
                📄 Định dạng file Word để import câu hỏi
              </h4>
              <div className="text-xs text-indigo-700 space-y-2 font-medium leading-relaxed">
                <p><strong>Câu hỏi</strong> bắt đầu bằng: <code className="bg-indigo-100 px-1 rounded">Câu 1.</code> hoặc <code className="bg-indigo-100 px-1 rounded">1.</code></p>
                <p><strong>Đáp án sai</strong>: <code className="bg-indigo-100 px-1 rounded">A. Nội dung</code></p>
                <p><strong>Đáp án đúng</strong>: <code className="bg-indigo-100 px-1 rounded">*A. Nội dung</code> (thêm <code className="bg-indigo-100 px-1 rounded">*</code> trước)</p>
                <p className="mt-3 text-indigo-600 border-t border-indigo-200 pt-3">
                  <strong>Ví dụ:</strong>
                </p>
                <pre className="bg-white border border-indigo-100 rounded-xl p-3 text-indigo-800 text-xs whitespace-pre-wrap">
{`Câu 1. Thủ đô của Việt Nam là?
A. Đà Nẵng
*B. Hà Nội
C. Hồ Chí Minh
D. Cần Thơ

Câu 2. 2 + 2 = ?
A. 3
*B. 4
C. 5
D. 6`}
                </pre>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="mt-4 text-xs text-indigo-500 hover:text-indigo-800 font-bold uppercase tracking-wider"
              >
                Đóng hướng dẫn ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz List */}
      {loadingQuizzes ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, idx) => {
            const joinCode = quiz.id?.substring(0, 6).toUpperCase();
            const displayPin = joinCode ? `${joinCode.substring(0, 3)} ${joinCode.substring(3)}` : '--- ---';

            return (
              <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy size={24} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {quiz.questions?.length || 0} câu hỏi
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">{quiz.title}</h4>
                <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{quiz.description || "Chương trình thử thách kiến thức và nhận quà hấp dẫn."}</p>

                {/* PIN Display */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mã PIN:</span>
                  <span className="font-black text-slate-700 tracking-widest text-sm">{displayPin}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold">Sẵn sàng</span>
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg hover:scale-110 active:scale-95 group/btn"
                    title="Bắt đầu ngay"
                  >
                    <PlayCircle size={28} className="group-hover/btn:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <Trophy size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium mb-2">Chưa có bộ câu hỏi nào cho sự kiện này.</p>
          <p className="text-slate-300 text-xs">Tạo mới hoặc import từ file Word để bắt đầu.</p>
        </div>
      )}
    </div>
  );
};

export default QuizTab;
