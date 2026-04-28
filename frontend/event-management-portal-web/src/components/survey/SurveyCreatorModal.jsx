import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save, ClipboardEdit, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';

const QUESTION_TYPES = [
  { value: 'RATING', label: '⭐ Đánh giá sao', desc: 'Từ 1 đến 5 sao' },
  { value: 'TEXT', label: '📝 Câu trả lời tự do', desc: 'Văn bản tự do' },
  { value: 'MULTIPLE_CHOICE', label: '🔘 Trắc nghiệm', desc: 'Chọn một hoặc nhiều đáp án' },
];

const SurveyCreatorModal = ({ isOpen, onClose, eventId, onSaved }) => {
  const [survey, setSurvey] = useState({ title: '', description: '', questions: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [existingSurveyId, setExistingSurveyId] = useState(null);

  useEffect(() => {
    if (isOpen && eventId) {
      eventService.getSurveyByEvent(eventId)
        .then(res => {
          if (res.data) {
            setSurvey(res.data);
            setExistingSurveyId(res.data.id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, eventId]);

  const addQuestion = () => {
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        questionText: '',
        type: 'RATING',
        options: '',
        isRequired: true,
        orderIndex: prev.questions.length
      }]
    }));
  };

  const removeQuestion = (id) => {
    setSurvey(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  };

  const updateQuestion = (id, field, value) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  };

  const handleSave = async () => {
    if (!survey.title) return toast.error('Vui lòng nhập tên khảo sát');
    try {
      setIsSaving(true);
      const res = await eventService.createOrUpdateSurvey({ ...survey, eventId });
      setExistingSurveyId(res.data?.id);
      toast.success('Đã lưu khảo sát!');
      onSaved?.();
    } catch {
      toast.error('Lỗi khi lưu khảo sát');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!existingSurveyId) return toast.warning('Hãy lưu khảo sát trước');
    try {
      setIsPublishing(true);
      await eventService.publishSurvey(existingSurveyId);
      toast.success('Đã công bố khảo sát! Người tham gia sẽ nhận được thông báo.');
      onClose();
    } catch {
      toast.error('Lỗi khi công bố khảo sát');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-3">
            <ClipboardEdit size={24} />
            <div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Tạo Form Khảo Sát</h3>
              {existingSurveyId && <p className="text-xs text-white/70">Đã có bản nháp</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Tên khảo sát *</label>
              <input
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold"
                placeholder="VD: Đánh giá chất lượng sự kiện"
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Mô tả ngắn</label>
              <input
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                placeholder="VD: Phản hồi của bạn giúp chúng tôi cải thiện..."
                value={survey.description}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-700">Danh sách câu hỏi ({survey.questions.length})</h4>
              <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all">
                <Plus size={16} /> THÊM CÂU HỎI
              </button>
            </div>

            {survey.questions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">Nhấn "Thêm câu hỏi" để bắt đầu tạo khảo sát</p>
              </div>
            )}

            {survey.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">{idx + 1}</span>
                  <div className="flex-1 space-y-3">
                    <textarea
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold resize-none"
                      rows={2}
                      placeholder="Nhập câu hỏi..."
                      value={q.questionText}
                      onChange={(e) => updateQuestion(q.id, 'questionText', e.target.value)}
                    />
                    <div className="flex gap-3 flex-wrap">
                      <select
                        className="flex-1 min-w-[160px] p-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                      >
                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>

                      <button
                        onClick={() => updateQuestion(q.id, 'isRequired', !q.isRequired)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${q.isRequired ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {q.isRequired ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {q.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
                      </button>
                    </div>

                    {q.type === 'MULTIPLE_CHOICE' && (
                      <input
                        className="w-full p-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs"
                        placeholder="Nhập các đáp án cách nhau bởi dấu phẩy: VD: Rất tệ, Tệ, Bình thường, Tốt, Rất tốt"
                        value={q.options}
                        onChange={(e) => updateQuestion(q.id, 'options', e.target.value)}
                      />
                    )}
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="p-2 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-white flex justify-between items-center gap-3">
          <button onClick={onClose} className="px-5 py-3 text-slate-500 font-bold hover:text-slate-700">Hủy</button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Send size={16} /> {isPublishing ? 'Đang công bố...' : 'Công bố ngay'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyCreatorModal;
