import React, { useState } from "react";
import { ClipboardCheck, FileUp, Plus, BarChart2 } from "lucide-react";
import SurveyResultsModal from "../../../survey/SurveyResultsModal";

const SurveyTab = ({ 
  event, 
  surveyFileInputRef, 
  handleSurveyWordImport, 
  setShowSurveyModal, 
  setShowSurveyCreatorModal, 
  showAllSurveyQuestions, 
  setShowAllSurveyQuestions 
}) => {
  const [showResultsModal, setShowResultsModal] = useState(false);

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={surveyFileInputRef}
        className="hidden"
        accept=".docx"
        onChange={handleSurveyWordImport}
      />
      {event.survey ? (
        <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                <ClipboardCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{event.survey.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{event.survey.description || "Không có mô tả"}</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase">
                    {event.survey.questions?.length || 0} CÂU HỎI
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${event.survey.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {event.survey.isPublished ? 'ĐÃ CÔNG BỐ' : 'BẢN NHÁP'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResultsModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
              >
                <BarChart2 size={18} /> Xem kết quả
              </button>
              <button
                onClick={() => surveyFileInputRef.current.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f3ff] text-[#5c59f2] rounded-xl text-sm font-bold hover:bg-[#e8ebff] transition-all"
              >
                <FileUp size={18} /> Ghi đè từ Word
              </button>
              {!event.survey.isPublished && (
                <button
                  onClick={() => setShowSurveyModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a61ff] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#0051ff] transition-all"
                >
                  <Plus size={18} /> Chỉnh sửa & Công bố
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(showAllSurveyQuestions ? event.survey.questions : event.survey.questions?.slice(0, 3)).map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-700 flex items-start gap-2">
                  <span className="text-indigo-600">Q{idx + 1}.</span> {q.questionText}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}</p>
              </div>
            ))}
            {event.survey.questions?.length > 3 && (
              <button
                onClick={() => setShowAllSurveyQuestions(!showAllSurveyQuestions)}
                className="w-full py-2 text-center text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-all"
              >
                {showAllSurveyQuestions ? 'Thu gọn' : `...và ${event.survey.questions.length - 3} câu hỏi khác (Bấm để xem tất cả)`}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-[3.5rem] text-center">
          <div className="w-20 h-20 bg-white text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-100/50">
            <ClipboardCheck size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Chưa có khảo sát</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">Bạn có thể tạo form khảo sát để lắng nghe ý kiến đóng góp từ những người đã tham gia sự kiện.</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => surveyFileInputRef.current.click()}
              className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95"
            >
              <FileUp size={20} /> Import từ Word
            </button>
            <button
              onClick={() => setShowSurveyCreatorModal(true)}
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus size={20} /> Tạo mới khảo sát
            </button>
          </div>
        </div>
      )}

      <SurveyResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        survey={event.survey}
        eventId={event.id}
      />
    </div>
  );
};

export default SurveyTab;
