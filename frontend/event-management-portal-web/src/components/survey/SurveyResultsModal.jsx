import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BarChart2,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#4f46e5",
];

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

    return survey.questions.map((q) => {
      const questionResponses = responses
        .map((r) => {
          try {
            const answers = JSON.parse(r.answers);
            const ans = answers[q.id];

            if (ans && typeof ans === "object" && ans.rating !== undefined) {
              return ans.rating;
            }

            return ans;
          } catch {
            return null;
          }
        })
        .filter((ans) => ans !== null && ans !== undefined);

      const reasons = responses
        .map((r) => {
          try {
            const answers = JSON.parse(r.answers);
            const ans = answers[q.id];

            if (ans && typeof ans === "object" && ans.reason) {
              return ans.reason;
            }
          } catch {}

          return null;
        })
        .filter(Boolean);

      if (q.type === "MULTIPLE_CHOICE") {
        const options = q.options?.split("|") || q.options?.split(",") || [];

        const distribution = options.map((opt) => ({
          name: opt.trim(),
          value: questionResponses.filter((ans) => ans === opt.trim()).length,
        }));

        return {
          ...q,
          distribution,
          total: questionResponses.length,
        };
      }

      if (q.type === "RATING") {
        const distribution = [1, 2, 3, 4, 5].map((star) => ({
          name: `${star} Sao`,
          value: questionResponses.filter((ans) => ans === star).length,
        }));

        return {
          ...q,
          distribution,
          textResponses: reasons,
          total: questionResponses.length,
        };
      }

      return {
        ...q,
        textResponses: questionResponses,
        total: questionResponses.length,
      };
    });
  }, [survey, responses]);

  const activeQuestion = stats[activeQuestionIdx];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50"
      />

      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 12 }}
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BarChart2 size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Kết quả khảo sát
              </h2>
              <p className="text-sm text-slate-500">
                {survey?.title} • {responses.length} lượt phản hồi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Loader2 className="mb-3 h-9 w-9 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-500">
                Đang tổng hợp dữ liệu...
              </p>
            </div>
          ) : responses.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Users size={32} />
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                Chưa có phản hồi nào
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Khi người tham gia hoàn thành khảo sát, dữ liệu thống kê sẽ
                được hiển thị tại đây.
              </p>
            </div>
          ) : (
            <>
              <div className="w-80 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Danh sách câu hỏi
                </p>

                <div className="space-y-2">
                  {stats.map((q, idx) => (
                    <button
                      key={q.id || idx}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        activeQuestionIdx === idx
                          ? "border-blue-200 bg-white shadow-sm"
                          : "border-transparent bg-transparent hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-xs font-semibold ${
                            activeQuestionIdx === idx
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        >
                          Q{idx + 1}
                        </span>

                        <p
                          className={`line-clamp-2 text-sm leading-5 ${
                            activeQuestionIdx === idx
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-600"
                          }`}
                        >
                          {q.questionText}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeQuestionIdx}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex-1">
                        <span className="mb-3 inline-flex rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          Câu hỏi {activeQuestionIdx + 1} •{" "}
                          {activeQuestion?.type === "MULTIPLE_CHOICE"
                            ? "Trắc nghiệm"
                            : activeQuestion?.type === "RATING"
                            ? "Đánh giá"
                            : "Tự luận"}
                        </span>

                        <h3 className="text-xl font-semibold leading-snug text-slate-900">
                          {activeQuestion?.questionText}
                        </h3>
                      </div>

                      <div className="min-w-[100px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                        <p className="text-2xl font-semibold text-blue-600">
                          {activeQuestion?.total}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          Phản hồi
                        </p>
                      </div>
                    </div>

                    {(activeQuestion?.type === "MULTIPLE_CHOICE" ||
                      activeQuestion?.type === "RATING") && (
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="h-[320px] w-full rounded-lg border border-slate-200 bg-white p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={activeQuestion.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={105}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {activeQuestion.distribution.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>

                              <Tooltip
                                contentStyle={{
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  boxShadow:
                                    "0 10px 15px -3px rgb(0 0 0 / 0.08)",
                                }}
                              />

                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {activeQuestion.type === "RATING"
                              ? "Phân bổ mức điểm"
                              : "Chi tiết lựa chọn"}
                          </p>

                          <div className="space-y-4">
                            {activeQuestion.distribution.map((item, idx) => {
                              const percent =
                                activeQuestion.total > 0
                                  ? (item.value / activeQuestion.total) * 100
                                  : 0;

                              return (
                                <div key={idx}>
                                  <div className="mb-2 flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-slate-700">
                                      {item.name}
                                    </span>

                                    <span className="text-sm font-semibold text-slate-900">
                                      {item.value} ({percent.toFixed(1)}%)
                                    </span>
                                  </div>

                                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percent}%` }}
                                      transition={{
                                        duration: 0.8,
                                        ease: "easeOut",
                                      }}
                                      className="h-full rounded-full"
                                      style={{
                                        backgroundColor:
                                          COLORS[idx % COLORS.length],
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {(activeQuestion?.type === "TEXT" ||
                      (activeQuestion?.type === "RATING" &&
                        activeQuestion.textResponses?.length > 0)) && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Tất cả câu trả lời
                          </p>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            Mới nhất
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {activeQuestion.textResponses?.map((ans, idx) => (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              key={idx}
                              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                                  <MessageSquare size={15} />
                                </div>

                                <p className="text-sm leading-6 text-slate-700">
                                  {ans}
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

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyResultsModal;