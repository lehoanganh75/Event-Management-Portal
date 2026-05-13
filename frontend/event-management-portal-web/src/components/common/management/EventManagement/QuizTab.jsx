import React from "react";
import {
  Plus,
  Trophy,
  FileUp,
  Loader2,
  FileText,
  Info,
  Play,
  Sparkles,
  Timer,
  CheckCircle2
} from "lucide-react";

const QuizTab = ({
  event,
  quizzes = [],
  loadingQuizzes = false,
  setShowQuizCreatorModal,
  handleStartQuiz,
  fileInputRef,
  handleWordImport,
  importingWord = false,
}) => {
  const [visiblePins, setVisiblePins] = React.useState({});
  const [showGuide, setShowGuide] = React.useState(false);

  const togglePin = (id) => {
    setVisiblePins((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc"
        className="hidden"
        onChange={handleWordImport}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <Trophy size={26} className="text-amber-300" />
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                Quiz & Thử thách
                <Sparkles
                  size={18}
                  className="text-amber-300"
                />
              </h3>

              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-xl">
                Tạo hoạt động tương tác trực tiếp cho người tham gia
                với câu hỏi, xếp hạng và mini game thời gian thực.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() =>
                  fileInputRef?.current?.click()
                }
                disabled={importingWord}
                className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold transition-all flex items-center gap-2"
              >
                {importingWord ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Đang import...
                  </>
                ) : (
                  <>
                    <FileUp size={16} />
                    Import Word
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  setShowGuide((g) => !g)
                }
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow"
              >
                <Info size={11} />
              </button>
            </div>

            <button
              onClick={() =>
                setShowQuizCreatorModal(true)
              }
              className="h-11 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={17} />
              Tạo Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tổng Quiz"
          value={quizzes.length}
          color="indigo"
        />

        <StatCard
          label="Đã hoàn thành"
          value={
            quizzes.filter(
              (q) => q.status === "COMPLETED"
            ).length
          }
          color="emerald"
        />

        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-1">
                Hỗ trợ Import
              </p>

              <p className="text-sm font-semibold leading-relaxed">
                Upload file Word để tạo câu hỏi nhanh
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-indigo-900 mb-3">
                Hướng dẫn định dạng file Word
              </h4>

              <div className="space-y-2 text-sm text-indigo-800 leading-relaxed">
                <p>
                  • Câu hỏi bắt đầu bằng:
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-indigo-100">
                    Câu 1.
                  </code>
                </p>

                <p>
                  • Đáp án đúng thêm dấu
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-indigo-100">
                    *
                  </code>
                  phía trước.
                </p>
              </div>

              <pre className="mt-4 bg-white border border-indigo-100 rounded-xl p-4 text-xs text-slate-700 overflow-auto leading-6">
                {`Câu 1. Thủ đô Việt Nam là?
                  A. Đà Nẵng
                  *B. Hà Nội
                  C. Cần Thơ
                  D. Huế`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Quiz List */}
      {loadingQuizzes ? (
        <div className="flex items-center justify-center py-24">
          <Loader2
            size={34}
            className="animate-spin text-slate-400"
          />
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group relative bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Top Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400" />

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${quiz.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  <Trophy size={20} />
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {quiz.questions?.length || 0} câu
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${quiz.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {quiz.status === "COMPLETED"
                      ? "Đã kết thúc"
                      : "Sẵn sàng"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div>
                <h4 className="text-base font-bold text-slate-800 leading-6 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {quiz.title}
                </h4>

                <p className="text-sm text-slate-500 leading-6 line-clamp-2 min-h-[48px]">
                  {quiz.description ||
                    "Tạo trải nghiệm tương tác hấp dẫn với người tham gia."}
                </p>
              </div>

              {/* Info */}
              <div className="mt-5 flex items-center justify-between py-4 border-y border-slate-100">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    PIN
                  </p>

                  <p className="font-mono text-sm font-bold tracking-widest text-slate-700">
                    {visiblePins[quiz.id]
                      ? quiz.pinCode
                      : "••••••"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    togglePin(quiz.id)
                  }
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {visiblePins[quiz.id]
                    ? "Ẩn"
                    : "Hiện"}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Timer size={14} />
                  Quiz trực tiếp
                </div>

                <button
                  onClick={() =>
                    handleStartQuiz(quiz.id)
                  }
                  className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  <Play
                    size={14}
                    fill="currentColor"
                  />
                  Bắt đầu
                </button>
              </div>

              {/* Hover BG */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Trophy
              size={28}
              className="text-slate-300"
            />
          </div>

          <h4 className="text-lg font-bold text-slate-700 mb-2">
            Chưa có Quiz nào
          </h4>

          <p className="text-sm text-slate-500 mb-6">
            Tạo mới hoặc import từ Word để bắt đầu.
          </p>

          <button
            onClick={() =>
              setShowQuizCreatorModal(true)
            }
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            Tạo Quiz đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color = "indigo",
}) => {
  const colorMap = {
    indigo:
      "from-indigo-50 to-indigo-100 border-indigo-100 text-indigo-700",
    emerald:
      "from-emerald-50 to-emerald-100 border-emerald-100 text-emerald-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5`}
    >
      <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-2">
        {label}
      </p>

      <h4 className="text-3xl font-black">
        {value}
      </h4>
    </div>
  );
};

export default QuizTab;