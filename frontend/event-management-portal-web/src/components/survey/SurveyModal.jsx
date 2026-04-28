import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ClipboardCheck, Star, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';

const SurveyModal = ({ isOpen, onClose, eventId }) => {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchSurvey();
    }
  }, [isOpen, eventId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const res = await eventService.getSurveyByEvent(eventId);
      if (res.data) {
        setSurvey(res.data);
        const subRes = await eventService.checkSurveySubmission(res.data.id);
        setHasSubmitted(subRes.data.submitted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;
    try {
      setIsSubmitting(true);
      await eventService.submitSurveyResponse(survey.id, JSON.stringify(answers));
      setHasSubmitted(true);
      toast.success('Cảm ơn bạn đã thực hiện khảo sát!');
    } catch (err) {
      toast.error('Lỗi khi gửi khảo sát');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <ClipboardCheck size={24} />
            <h3 className="font-bold text-lg">Khảo sát ý kiến</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : !survey || !survey.isPublished ? (
            <div className="text-center py-20">
              <p className="text-slate-500">Khảo sát hiện chưa sẵn sàng.</p>
            </div>
          ) : hasSubmitted ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Đã hoàn thành!</h4>
              <p className="text-slate-500">Bạn đã thực hiện khảo sát này. Cảm ơn ý kiến đóng góp của bạn.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{survey.title}</h2>
                <p className="text-slate-500 mt-2">{survey.description}</p>
              </div>

              {survey.questions?.map((q) => (
                <div key={q.id} className="space-y-3">
                  <label className="font-bold text-slate-700 flex gap-1">
                    {q.questionText} {q.isRequired && <span className="text-rose-500">*</span>}
                  </label>

                  {q.type === 'RATING' && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: star }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            answers[q.id] >= star ? 'bg-amber-50 border-amber-400 text-amber-500' : 'bg-white border-slate-100 text-slate-300'
                          }`}
                        >
                          <Star size={24} fill={answers[q.id] >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'TEXT' && (
                    <textarea
                      className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                      placeholder="Nhập ý kiến của bạn..."
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  )}

                  {q.type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {q.options.split(',').map(opt => opt.trim()).filter(Boolean).map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                            answers[q.id] === opt
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {isSubmitting ? 'Đang gửi...' : <><Send size={20} /> Gửi khảo sát</>}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyModal;
