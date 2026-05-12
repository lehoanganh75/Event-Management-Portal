import React from "react";
import { Plus, Trophy, Clock, PlayCircle, QrCode, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const QuizTab = ({ 
  event, 
  quizzes, 
  setShowQuizCreatorModal, 
  handleStartQuiz 
}) => {
  const [visiblePins, setVisiblePins] = React.useState({});

  const togglePin = (id) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thử thách (Quizzes)</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tăng tương tác cho sự kiện của bạn</p>
          </div>
        </div>
        <button
          onClick={() => setShowQuizCreatorModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} /> Tạo thử thách mới
        </button>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, idx) => {
            const joinCode = quiz.id?.substring(0, 6).toUpperCase();
            const isVisible = visiblePins[quiz.id];

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
                <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{quiz.description || "Chương trình thử thách kiến thức và nhận quà hấp dẫn."}</p>

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400">15 Phút</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400">3 Giải thưởng</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  {/* ONLY PLAY BUTTON ON THE CARD */}
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg hover:scale-110 active:scale-95 group"
                    title="Bắt đầu ngay"
                  >
                    <PlayCircle size={28} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">Chưa có bộ câu hỏi nào cho sự kiện này.</p>
        </div>
      )}
    </div>
  );
};

export default QuizTab;
