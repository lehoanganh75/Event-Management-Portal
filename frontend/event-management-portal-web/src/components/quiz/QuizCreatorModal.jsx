import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, HelpCircle, Save, Clock, BrainCircuit } from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';

const QuizCreatorModal = ({ isOpen, onClose, eventId, onCreated }) => {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: [
      {
        id: Date.now(),
        content: "",
        type: "MULTIPLE_CHOICE",
        timeLimit: 30,
        hint: "",
        options: [
          { id: 1, content: "", isCorrect: true },
          { id: 2, content: "", isCorrect: false }
        ]
      }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        content: "",
        type: "MULTIPLE_CHOICE",
        timeLimit: 30,
        hint: "",
        options: [{ id: 1, content: "", isCorrect: true }]
      }]
    }));
  };

  const removeQuestion = (qId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  const updateQuestion = (qId, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
    }));
  };

  const addOption = (qId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === qId ? { ...q, options: [...q.options, { id: Date.now(), content: "", isCorrect: false }] } : q
      )
    }));
  };

  const handleSave = async () => {
    if (!quizData.title) return toast.error("Vui lòng nhập tên bộ câu hỏi");
    if (quizData.questions.some(q => !q.content)) return toast.error("Vui lòng nhập nội dung câu hỏi");

    const payload = {
      ...quizData,
      eventId,
      questions: quizData.questions.map((q, idx) => {
        const formattedQ = {
          ...q,
          orderIndex: idx,
          basePoints: 100 // Default base points
        };

        if (q.type === 'MATCHING' && q.matchingPairs) {
          // Convert matching pairs to options for backend
          formattedQ.options = q.matchingPairs.map(p => ({
             content: p.value,
             matchingKey: p.key,
             isCorrect: true
          }));
        }

        return formattedQ;
      })
    };

    try {
      setIsSaving(true);
      await eventService.createQuiz(payload);
      toast.success("Đã tạo bộ câu hỏi thành công!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo bộ câu hỏi");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
             <BrainCircuit size={24} />
             <h3 className="font-bold text-lg uppercase tracking-tight">Tạo bộ câu hỏi tương tác</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-100">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase">Tên bộ câu hỏi</label>
                 <input 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    placeholder="VD: Đố vui kiến thức IT"
                    value={quizData.title}
                    onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase">Mô tả ngắn</label>
                 <input 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    placeholder="VD: Dành cho tất cả sinh viên tham gia"
                    value={quizData.description}
                    onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                 />
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="font-bold text-slate-700">Danh sách câu hỏi ({quizData.questions.length})</h4>
                 <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all">
                    <Plus size={16} /> THÊM CÂU HỎI
                 </button>
              </div>

              {quizData.questions.map((q, idx) => (
                 <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative group">
                    <button 
                       onClick={() => removeQuestion(q.id)} 
                       className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shadow-sm flex items-center justify-center"
                       title="Xóa câu hỏi"
                    >
                       <Trash2 size={16} />
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                       <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung câu {idx + 1}</label>
                          <textarea 
                             className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold"
                             rows={2}
                             placeholder="Nhập câu hỏi của bạn..."
                             value={q.content}
                             onChange={(e) => updateQuestion(q.id, 'content', e.target.value)}
                          />
                       </div>
                       <div className="w-full md:w-48 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại trò chơi</label>
                          <select 
                             className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                             value={q.type}
                             onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                          >
                             <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                             <option value="WORD_SCRAMBLE">Ghép chữ</option>
                             <option value="MATCHING">Nối cặp</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                       <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                          <Clock size={16} className="text-slate-400" />
                          <input 
                             type="number"
                             className="bg-transparent text-sm font-bold w-12 outline-none"
                             value={q.timeLimit}
                             onChange={(e) => updateQuestion(q.id, 'timeLimit', parseInt(e.target.value))}
                          />
                          <span className="text-[10px] font-bold text-slate-400">giây</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl col-span-2">
                          <HelpCircle size={16} className="text-slate-400" />
                          <input 
                             className="bg-transparent text-sm font-bold w-full outline-none"
                             placeholder="Thêm gợi ý..."
                             value={q.hint}
                             onChange={(e) => updateQuestion(q.id, 'hint', e.target.value)}
                          />
                       </div>
                    </div>

                    {q.type === 'MULTIPLE_CHOICE' && (
                       <div className="grid grid-cols-2 gap-3 mt-4">
                          {q.options.map((opt, oIdx) => (
                             <div key={opt.id} className="flex items-center gap-2">
                                <button 
                                   onClick={() => {
                                      const newOpts = q.options.map(o => ({...o, isCorrect: o.id === opt.id}));
                                      updateQuestion(q.id, 'options', newOpts);
                                   }}
                                   className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${opt.isCorrect ? "bg-emerald-500 border-emerald-500" : "border-slate-200"}`}
                                >
                                   {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                                </button>
                                <input 
                                   className="flex-1 p-2 rounded-lg bg-slate-50 border border-transparent focus:border-indigo-200 outline-none text-xs"
                                   placeholder={`Đáp án ${oIdx + 1}`}
                                   value={opt.content}
                                   onChange={(e) => {
                                      const newOpts = q.options.map(o => o.id === opt.id ? {...o, content: e.target.value} : o);
                                      updateQuestion(q.id, 'options', newOpts);
                                   }}
                                />
                             </div>
                          ))}
                          <button onClick={() => addOption(q.id)} className="text-[10px] font-black text-indigo-600 hover:underline text-left">+ THÊM ĐÁP ÁN</button>
                       </div>
                    )}

                    {q.type === 'WORD_SCRAMBLE' && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                           <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Đáp án chính xác (Hệ thống sẽ tự xáo trộn)</p>
                           <input 
                              className="w-full p-2 rounded-lg bg-white border border-amber-200 outline-none text-sm font-black uppercase tracking-widest"
                              placeholder="VD: JAVASCRIPT"
                              value={q.correctData || ""}
                              onChange={(e) => updateQuestion(q.id, 'correctData', e.target.value.toUpperCase())}
                           />
                        </div>
                    )}

                    {q.type === 'MATCHING' && (
                        <div className="mt-4 space-y-3">
                           <p className="text-[10px] font-bold text-indigo-700 uppercase">Thiết lập cặp nối chính xác</p>
                           {(q.matchingPairs || [{id: 1, key: "", value: ""}]).map((pair, pIdx) => (
                              <div key={pair.id} className="flex gap-2">
                                 <input 
                                    className="flex-1 p-2 rounded-lg bg-slate-50 border border-transparent focus:border-indigo-200 outline-none text-xs font-bold"
                                    placeholder={`Vế A ${pIdx + 1}`}
                                    value={pair.key}
                                    onChange={(e) => {
                                       const newPairs = (q.matchingPairs || [{id: 1, key: "", value: ""}]).map(p => p.id === pair.id ? {...p, key: e.target.value} : p);
                                       updateQuestion(q.id, 'matchingPairs', newPairs);
                                    }}
                                 />
                                 <div className="flex items-center text-slate-300">➜</div>
                                 <input 
                                    className="flex-1 p-2 rounded-lg bg-slate-50 border border-transparent focus:border-indigo-200 outline-none text-xs font-bold"
                                    placeholder={`Vế B ${pIdx + 1}`}
                                    value={pair.value}
                                    onChange={(e) => {
                                       const newPairs = (q.matchingPairs || [{id: 1, key: "", value: ""}]).map(p => p.id === pair.id ? {...p, value: e.target.value} : p);
                                       updateQuestion(q.id, 'matchingPairs', newPairs);
                                    }}
                                 />
                                 <button 
                                    onClick={() => {
                                       const newPairs = (q.matchingPairs || []).filter(p => p.id !== pair.id);
                                       updateQuestion(q.id, 'matchingPairs', newPairs);
                                    }}
                                    className="p-2 text-rose-300 hover:text-rose-500"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                           <button 
                              onClick={() => {
                                 const currentPairs = q.matchingPairs || [];
                                 updateQuestion(q.id, 'matchingPairs', [...currentPairs, {id: Date.now(), key: "", value: ""}]);
                              }}
                              className="text-[10px] font-black text-indigo-600 hover:underline"
                           >
                              + THÊM CẶP NỐI
                           </button>
                        </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700">Hủy</button>
           <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
           >
              {isSaving ? "Đang lưu..." : <><Save size={18} /> LƯU BỘ CÂU HỎI</>}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizCreatorModal;
