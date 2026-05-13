import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  ClipboardCheck,
  Star,
  Send,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";
import eventService from "../../services/eventService";

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

        const subRes = await eventService.checkSurveySubmission(
          res.data.id
        );

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

      await eventService.submitSurveyResponse(
        survey.id,
        JSON.stringify(answers)
      );

      setHasSubmitted(true);

      toast.success("Cảm ơn bạn đã thực hiện khảo sát!");
    } catch (err) {
      toast.error("Lỗi khi gửi khảo sát");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <ClipboardCheck size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold">
                Khảo sát sự kiện
              </h3>

              <p className="text-xs text-white/70 mt-0.5">
                Chia sẻ trải nghiệm của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !survey ||
            (!survey.isPublished && !survey.published) ? (
            <div className="text-center py-20">
              <ClipboardCheck
                size={40}
                className="mx-auto text-slate-300 mb-4"
              />

              <p className="text-slate-500">
                Khảo sát hiện chưa sẵn sàng.
              </p>
            </div>
          ) : hasSubmitted ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={42} />
              </div>

              <h4 className="text-2xl font-bold text-slate-800 mb-2">
                Đã gửi khảo sát
              </h4>

              <p className="text-slate-500">
                Cảm ơn bạn đã đóng góp ý kiến.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Survey Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">
                  {survey.title}
                </h2>

                <p className="text-slate-500 mt-2 leading-relaxed">
                  {survey.description}
                </p>
              </div>

              {/* Questions */}
              {survey.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {q.questionText}
                      </h4>

                      {q.isRequired && (
                        <span className="text-xs text-rose-500 font-medium">
                          * Bắt buộc
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {q.type === "RATING" && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const current =
                            typeof answers[q.id] === "object"
                              ? answers[q.id]?.rating
                              : answers[q.id];

                          return (
                            <button
                              key={star}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: {
                                    rating: star,
                                    reason:
                                      prev[q.id]?.reason || ""
                                  }
                                }))
                              }
                              className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center ${current >= star
                                  ? "bg-amber-50 border-amber-300 text-amber-500"
                                  : "bg-white border-slate-200 text-slate-300"
                                }`}
                            >
                              <Star
                                size={22}
                                fill={
                                  current >= star
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          );
                        })}
                      </div>

                      {(typeof answers[q.id] === "object" ||
                        answers[q.id]) && (
                          <textarea
                            value={
                              answers[q.id]?.reason || ""
                            }
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: {
                                  ...prev[q.id],
                                  reason: e.target.value
                                }
                              }))
                            }
                            placeholder="Lý do đánh giá..."
                            className="w-full min-h-[90px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                          />
                        )}
                    </div>
                  )}

                  {/* Text */}
                  {q.type === "TEXT" && (
                    <textarea
                      placeholder="Nhập ý kiến của bạn..."
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value
                        }))
                      }
                      className="w-full min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  )}

                  {/* Multiple Choice */}
                  {q.type === "MULTIPLE_CHOICE" &&
                    q.options && (
                      <div className="flex flex-wrap gap-2">
                        {q.options
                          .split(",")
                          .map((opt) => opt.trim())
                          .filter(Boolean)
                          .map((opt, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: opt
                                }))
                              }
                              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${answers[q.id] === opt
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              ))}

              {/* Submit */}
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send size={18} />
                    Gửi khảo sát
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyModal;