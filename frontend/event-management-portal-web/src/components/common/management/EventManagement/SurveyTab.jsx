import React, { useState } from "react";
import {
  ClipboardCheck,
  FileUp,
  Plus,
  BarChart2
} from "lucide-react";

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
  const [showResultsModal, setShowResultsModal] =
    useState(false);

  return (
    <div className="space-y-5">
      <input
        type="file"
        ref={surveyFileInputRef}
        className="hidden"
        accept=".docx"
        onChange={handleSurveyWordImport}
      />

      {event.survey ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                  <ClipboardCheck size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Khảo sát sự kiện
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Thu thập phản hồi và đánh giá
                    từ người tham gia
                  </p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                      {event.survey.questions
                        ?.length || 0}{" "}
                      câu hỏi
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold ${event.survey.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {event.survey.isPublished
                        ? "Đã công bố"
                        : "Bản nháp"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setShowResultsModal(true)
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                >
                  <BarChart2 size={16} />
                  Kết quả
                </button>

                <button
                  onClick={() =>
                    surveyFileInputRef.current.click()
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                >
                  <FileUp size={16} />
                  Import Word
                </button>

                {!event.survey.isPublished && (
                  <button
                    onClick={() =>
                      setShowSurveyModal(true)
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="p-5 space-y-3 bg-slate-50/40">
            {(showAllSurveyQuestions
              ? event.survey.questions
              : event.survey.questions?.slice(
                0,
                3
              )
            ).map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-6">
                      {idx + 1}. {q.questionText}
                    </p>

                    <div className="mt-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${q.type ===
                            "MULTIPLE_CHOICE"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {q.type ===
                          "MULTIPLE_CHOICE"
                          ? "Trắc nghiệm"
                          : "Tự luận"}
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                </div>
              </div>
            ))}

            {event.survey.questions?.length >
              3 && (
                <button
                  onClick={() =>
                    setShowAllSurveyQuestions(
                      !showAllSurveyQuestions
                    )
                  }
                  className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors px-1"
                >
                  {showAllSurveyQuestions
                    ? "Thu gọn"
                    : `Xem thêm ${event.survey.questions
                      .length - 3
                    } câu hỏi`}
                </button>
              )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 mb-5 shadow-sm">
            <ClipboardCheck size={28} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Chưa có khảo sát
          </h3>

          <p className="text-sm text-slate-500 max-w-md mx-auto mb-7 leading-6">
            Tạo khảo sát để thu thập phản hồi,
            đánh giá và cải thiện trải nghiệm
            người tham gia.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() =>
                surveyFileInputRef.current.click()
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
            >
              <FileUp size={16} />
              Import Word
            </button>

            <button
              onClick={() =>
                setShowSurveyCreatorModal(true)
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-all shadow-sm"
            >
              <Plus size={16} />
              Tạo khảo sát
            </button>
          </div>
        </div>
      )}

      <SurveyResultsModal
        isOpen={showResultsModal}
        onClose={() =>
          setShowResultsModal(false)
        }
        survey={event.survey}
        eventId={event.id}
      />
    </div>
  );
};

export default SurveyTab;