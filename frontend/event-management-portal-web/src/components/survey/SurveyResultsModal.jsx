import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Users, PieChart as PieIcon, MessageSquare, Download, Loader2, ClipboardCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const SurveyResultsModal = ({ isOpen, onClose, survey, eventId }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    if (isOpen && survey?.id) {
      fetchResponses();
    }
  }, [isOpen, survey?.id]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await eventService.getSurveyResponses(survey.id);
      setResponses(res.data || []);
    } catch (err) {
      console.error("Error fetching survey responses:", err);
      toast.error("Không thể tải kết quả khảo sát");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!survey || !responses.length) return [];

    return survey.questions.map((q, idx) => {
      const questionResponses = responses.map(r => {
        try {
          const answers = JSON.parse(r.answers);
          const ans = answers[q.id];
          // Handle object-style rating { rating, reason }
          if (ans && typeof ans === 'object' && ans.rating !== undefined) {
            return ans.rating;
          }
          return ans;
        } catch (e) {
          return null;
        }
      }).filter(ans => ans !== null && ans !== undefined);

      // Collect reasons for ratings
      const reasons = responses.map(r => {
        try {
          const answers = JSON.parse(r.answers);
          const ans = answers[q.id];
          if (ans && typeof ans === 'object' && ans.reason) {
            return ans.reason;
          }
        } catch (e) {}
        return null;
      }).filter(Boolean);

      if (q.type === 'MULTIPLE_CHOICE') {
        const options = q.options?.split('|') || q.options?.split(',') || [];
        const distribution = options.map(opt => ({
          name: opt.trim(),
          value: questionResponses.filter(ans => ans === opt.trim()).length
        }));
        return { ...q, distribution, total: questionResponses.length };
      } else if (q.type === 'RATING') {
        const distribution = [1, 2, 3, 4, 5].map(star => ({
          name: `${star} Sao`,
          value: questionResponses.filter(ans => ans === star).length
        }));
        return { ...q, distribution, textResponses: reasons, total: questionResponses.length };
      } else {
        return { ...q, textResponses: questionResponses, total: questionResponses.length };
      }
    });
  }, [survey, responses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <BarChart2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kết quả khảo sát</h2>
              <p className="text-sm text-slate-500 font-medium">{survey?.title} • {responses.length} lượt phản hồi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 font-bold animate-pulse">Đang tổng hợp dữ liệu...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Chưa có phản hồi nào</h3>
              <p className="text-slate-400 max-w-xs mt-2 font-medium">Khi có người tham gia hoàn thành khảo sát, kết quả thống kê sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <>
              {/* Question Sidebar */}
              <div className="w-80 border-r border-slate-100 overflow-y-auto bg-slate-50/30 p-6 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Danh sách câu hỏi</p>
                {stats.map((q, idx) => (
                  <button
                    key={q.id || idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                      activeQuestionIdx === idx 
                        ? 'bg-white border-indigo-200 shadow-md shadow-indigo-100/50' 
                        : 'bg-transparent border-transparent hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-black mt-0.5 ${activeQuestionIdx === idx ? 'text-indigo-600' : 'text-slate-400'}`}>
                        Q{idx + 1}
                      </span>
                      <p className={`text-xs font-bold leading-relaxed line-clamp-2 ${activeQuestionIdx === idx ? 'text-slate-800' : 'text-slate-500'}`}>
                        {q.questionText}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-10 bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeQuestionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4">
                          Câu hỏi {activeQuestionIdx + 1} • {
                            stats[activeQuestionIdx]?.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 
                            stats[activeQuestionIdx]?.type === 'RATING' ? 'Đánh giá' : 'Tự luận'
                          }
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">
                          {stats[activeQuestionIdx]?.questionText}
                        </h3>
                      </div>
                      <div className="bg-slate-50 px-6 py-4 rounded-3xl text-center border border-slate-100">
                        <p className="text-2xl font-black text-indigo-600">{stats[activeQuestionIdx]?.total}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phản hồi</p>
                      </div>
                    </div>

                     {stats[activeQuestionIdx]?.type === 'MULTIPLE_CHOICE' || stats[activeQuestionIdx]?.type === 'RATING' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                        {/* Chart */}
                        <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats[activeQuestionIdx].distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {stats[activeQuestionIdx].distribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Breakdown List */}
                        <div className="space-y-4">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                            {stats[activeQuestionIdx].type === 'RATING' ? 'Phân bổ mức điểm' : 'Chi tiết lựa chọn'}
                          </p>
                          {stats[activeQuestionIdx].distribution.map((item, idx) => (
                            <div key={idx} className="group">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                <span className="text-sm font-black text-slate-900">{item.value} ({((item.value / stats[activeQuestionIdx].total) * 100).toFixed(1)}%)</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.value / stats[activeQuestionIdx].total) * 100}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Reasons or Text Responses */}
                    {(stats[activeQuestionIdx]?.type === 'TEXT' || (stats[activeQuestionIdx]?.type === 'RATING' && stats[activeQuestionIdx].textResponses?.length > 0)) && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tất cả câu trả lời</p>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Sắp xếp: Mới nhất</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {stats[activeQuestionIdx].textResponses?.map((ans, idx) => (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              key={idx}
                              className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                  <MessageSquare size={14} />
                                </div>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                  "{ans}"
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
           <button
            onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(responses));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", `survey_results_${survey?.id}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <Download size={18} /> Xuất dữ liệu JSON
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyResultsModal;
