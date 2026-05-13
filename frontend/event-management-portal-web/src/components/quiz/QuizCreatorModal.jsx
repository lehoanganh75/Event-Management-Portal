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
         {/* Modal Container */}
         <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden relative z-10 flex flex-col border border-slate-200"
         >
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur">
                        <BrainCircuit size={22} className="text-indigo-200" />
                     </div>

                     <div>
                        <h3 className="font-bold text-lg tracking-tight">
                           Tạo bộ câu hỏi tương tác
                        </h3>

                        <p className="text-xs text-slate-300 mt-1">
                           Thiết lập quiz cho sự kiện nhanh chóng và trực quan
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={onClose}
                     className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/70 px-7 py-6 space-y-6">
               {/* Basic Info */}
               <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                           Tên bộ câu hỏi
                        </label>

                        <input
                           className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition-all text-sm font-medium"
                           placeholder="VD: Đố vui kiến thức IT"
                           value={quizData.title}
                           onChange={(e) =>
                              setQuizData({
                                 ...quizData,
                                 title: e.target.value
                              })
                           }
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                           Mô tả
                        </label>

                        <input
                           className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition-all text-sm font-medium"
                           placeholder="Mô tả ngắn..."
                           value={quizData.description}
                           onChange={(e) =>
                              setQuizData({
                                 ...quizData,
                                 description: e.target.value
                              })
                           }
                        />
                     </div>
                  </div>
               </div>

               {/* Question Header */}
               <div className="flex items-center justify-between">
                  <div>
                     <h4 className="text-base font-bold text-slate-800">
                        Danh sách câu hỏi
                     </h4>

                     <p className="text-xs text-slate-400 mt-1">
                        {quizData.questions.length} câu hỏi hiện có
                     </p>
                  </div>

                  <button
                     onClick={addQuestion}
                     className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                  >
                     <Plus size={16} />
                     Thêm câu hỏi
                  </button>
               </div>

               {/* Questions */}
               <div className="space-y-5">
                  {quizData.questions.map((q, idx) => (
                     <div
                        key={q.id}
                        className="bg-white border border-slate-200 rounded-[26px] p-5 shadow-sm hover:shadow-md transition-all"
                     >
                        {/* Top */}
                        <div className="flex justify-between items-start gap-4 mb-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                 {idx + 1}
                              </div>

                              <div>
                                 <p className="text-sm font-bold text-slate-800">
                                    Câu hỏi {idx + 1}
                                 </p>

                                 <p className="text-xs text-slate-400">
                                    Thiết lập nội dung và đáp án
                                 </p>
                              </div>
                           </div>

                           <button
                              onClick={() => removeQuestion(q.id)}
                              className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
                           <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                 Nội dung
                              </label>

                              <textarea
                                 rows={3}
                                 className="w-full rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition-all p-4 text-sm"
                                 placeholder="Nhập nội dung câu hỏi..."
                                 value={q.content}
                                 onChange={(e) =>
                                    updateQuestion(
                                       q.id,
                                       "content",
                                       e.target.value
                                    )
                                 }
                              />
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Loại
                                 </label>

                                 <select
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none"
                                    value={q.type}
                                    onChange={(e) =>
                                       updateQuestion(
                                          q.id,
                                          "type",
                                          e.target.value
                                       )
                                    }
                                 >
                                    <option value="MULTIPLE_CHOICE">
                                       Trắc nghiệm
                                    </option>

                                    <option value="WORD_SCRAMBLE">
                                       Ghép chữ
                                    </option>

                                    <option value="MATCHING">
                                       Nối cặp
                                    </option>
                                 </select>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Thời gian
                                 </label>

                                 <div className="h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                                    <Clock
                                       size={15}
                                       className="text-slate-400"
                                    />

                                    <input
                                       type="number"
                                       className="bg-transparent w-full outline-none text-sm font-semibold"
                                       value={q.timeLimit}
                                       onChange={(e) =>
                                          updateQuestion(
                                             q.id,
                                             "timeLimit",
                                             parseInt(e.target.value)
                                          )
                                       }
                                    />

                                    <span className="text-xs text-slate-400">
                                       s
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Hint */}
                        <div className="mt-4">
                           <div className="h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                              <HelpCircle
                                 size={16}
                                 className="text-slate-400"
                              />

                              <input
                                 className="bg-transparent w-full outline-none text-sm"
                                 placeholder="Thêm gợi ý..."
                                 value={q.hint}
                                 onChange={(e) =>
                                    updateQuestion(
                                       q.id,
                                       "hint",
                                       e.target.value
                                    )
                                 }
                              />
                           </div>
                        </div>

                        {/* Multiple Choice */}
                        {q.type === "MULTIPLE_CHOICE" && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                              {q.options.map((opt, oIdx) => (
                                 <div
                                    key={opt.id}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${opt.isCorrect
                                          ? "border-emerald-200 bg-emerald-50"
                                          : "border-slate-200 bg-slate-50"
                                       }`}
                                 >
                                    <button
                                       onClick={() => {
                                          const newOpts = q.options.map(
                                             (o) => ({
                                                ...o,
                                                isCorrect:
                                                   o.id === opt.id
                                             })
                                          );

                                          updateQuestion(
                                             q.id,
                                             "options",
                                             newOpts
                                          );
                                       }}
                                       className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${opt.isCorrect
                                             ? "border-emerald-500 bg-emerald-500"
                                             : "border-slate-300"
                                          }`}
                                    >
                                       {opt.isCorrect && (
                                          <div className="w-2 h-2 bg-white rounded-full" />
                                       )}
                                    </button>

                                    <input
                                       className="flex-1 bg-transparent outline-none text-sm"
                                       placeholder={`Đáp án ${oIdx + 1}`}
                                       value={opt.content}
                                       onChange={(e) => {
                                          const newOpts =
                                             q.options.map((o) =>
                                                o.id === opt.id
                                                   ? {
                                                      ...o,
                                                      content:
                                                         e.target.value
                                                   }
                                                   : o
                                             );

                                          updateQuestion(
                                             q.id,
                                             "options",
                                             newOpts
                                          );
                                       }}
                                    />
                                 </div>
                              ))}

                              <button
                                 onClick={() => addOption(q.id)}
                                 className="h-12 rounded-2xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-all"
                              >
                                 + Thêm đáp án
                              </button>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
               <button
                  onClick={onClose}
                  className="h-11 px-5 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
               >
                  Hủy
               </button>

               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
               >
                  {isSaving ? (
                     "Đang lưu..."
                  ) : (
                     <>
                        <Save size={16} />
                        Lưu bộ câu hỏi
                     </>
                  )}
               </button>
            </div>
         </motion.div>
      </div>
   );
};

export default QuizCreatorModal;
