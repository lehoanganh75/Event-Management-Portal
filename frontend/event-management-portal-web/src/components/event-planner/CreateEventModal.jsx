import React, {
  useState,
  useEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PlusCircle,
  Search,
  Loader2,
  ChevronRight,
  FileText,
  Calendar,
  MapPin,
  Sparkles,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import eventService from "../../services/eventService";

const CreateEventModal = ({
  isOpen,
  onClose,
  onSelectPlan,
  onCreateNew,
  initialAiText = "",
}) => {
  const [selectionMode, setSelectionMode] = useState("choice");
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectionMode("choice");
      setSelectedPlan(null);
      setSearchTerm("");

      if (initialAiText) {
        setSelectionMode("new");
        setAiText(initialAiText);
      }
    }
  }, [isOpen, initialAiText]);

  const fetchApprovedPlans = async () => {
    setFetching(true);
    const safetyTimeout = setTimeout(() => setFetching(false), 10000);

    try {
      const res = await eventService.getMyPlans();
      const list = (res.data || []).filter(
        (p) => p.status === "PLAN_APPROVED"
      );
      setApprovedPlans(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách kế hoạch:", error);
      setApprovedPlans([]);
    } finally {
      clearTimeout(safetyTimeout);
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectionMode === "from_plan") {
      fetchApprovedPlans();
    }
  }, [isOpen, selectionMode]);

  const filteredPlans = useMemo(() => {
    return approvedPlans.filter(
      (p) =>
        p.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [approvedPlans, searchTerm]);

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(
      d.getMonth() + 1
    )}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const handleAIGenerate = async () => {
    if (!aiText.trim()) return;

    setIsRecommending(true);

    try {
      const response =
        await eventService.chat.extractFromText(aiText);
      const aiData = response.data || response;

      const mappedData = {
        eventTitle:
          aiData.title || aiData.eventTitle || "",
        eventPurpose:
          aiData.description ||
          aiData.eventPurpose ||
          aiText,
        location: aiData.location || "",
        maxParticipants: aiData.maxParticipants || 50,
        eventTopic:
          aiData.topic || aiData.eventTopic || "OTHER",
      };

      onCreateNew({
        fromPlan: false,
        initialFormData: mappedData,
        startAtStep: 1,
      });

      onClose();
    } catch (error) {
      console.error("Lỗi khi AI phân tích prompt:", error);

      onCreateNew({
        fromPlan: false,
        initialFormData: {
          eventPurpose: aiText,
        },
        startAtStep: 1,
      });

      onClose();
    } finally {
      setIsRecommending(false);
    }
  };

  const handleConfirmChoice = () => {
    if (selectionMode === "from_plan" && selectedPlan) {
      const prefill = {
        ...selectedPlan,
        eventTitle: selectedPlan.title || "",
        eventPurpose: selectedPlan.description || "",
        eventType: selectedPlan.type || "OTHER",
        location: selectedPlan.location || "",
        eventTopic: selectedPlan.eventTopic || "",
        maxParticipants:
          selectedPlan.maxParticipants || 50,
        startTime: toDateTimeLocal(selectedPlan.startTime),
        endTime: toDateTimeLocal(selectedPlan.endTime),
        registrationDeadline: toDateTimeLocal(
          selectedPlan.registrationDeadline
        ),
        targetObjects:
          selectedPlan.targetObjects || [],
        recipients: selectedPlan.recipients || [],
        presenters: (
          selectedPlan.presentersList || []
        ).map((p) => ({
          accountId:
            p.accountId || p.presenterAccountId,
          fullName: p.fullName || "",
          email: p.email || "",
          position: p.title || p.position || "",
          session: p.session || "",
          isConfirmed: true,
        })),
        invitations: (
          selectedPlan.organizersList || []
        ).map((o) => ({
          inviteeAccountId: o.accountId,
          inviteeName: o.fullName || o.name || "",
          inviteeEmail: o.email || "",
          targetRole: o.role || "MEMBER",
          isConfirmed: true,
        })),
        sessions: (
          selectedPlan.sessionsList ||
          selectedPlan.programItems ||
          []
        ).map((s, idx) => ({
          title: s.title || "",
          description: s.description || "",
          startTime: toDateTimeLocal(s.startTime),
          endTime: toDateTimeLocal(s.endTime),
          orderIndex: idx + 1,
          isConfirmed: true,
        })),
        fromPlan: true,
        planId: selectedPlan.id,
      };

      onSelectPlan({
        fromPlan: true,
        initialFormData: prefill,
        startAtStep: 1,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        {/* Modal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 16,
            scale: 0.98,
          }}
          transition={{ duration: 0.18 }}
          className="
            relative
            bg-white
            w-full max-w-3xl
            rounded-2xl
            border border-slate-200
            shadow-lg
            overflow-hidden
            flex flex-col
            max-h-[90vh]
          "
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {selectionMode === "choice"
                  ? "Tạo sự kiện mới"
                  : selectionMode === "from_plan"
                    ? "Chọn kế hoạch"
                    : "Tạo bằng AI"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {selectionMode === "choice"
                  ? "Chọn cách bạn muốn bắt đầu tạo sự kiện"
                  : selectionMode === "from_plan"
                    ? "Sử dụng dữ liệu từ kế hoạch đã được phê duyệt"
                    : "Nhập mô tả để hệ thống hỗ trợ điền thông tin ban đầu"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                p-2 rounded-lg
                text-slate-400
                hover:bg-slate-100
                hover:text-slate-700
                transition-colors
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {selectionMode === "choice" && (
              <div className="max-w-xl mx-auto">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Chọn phương thức khởi tạo
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Bạn có thể tạo từ kế hoạch, dùng AI hỗ trợ hoặc bắt đầu từ form trống.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() =>
                      setSelectionMode("from_plan")
                    }
                    className="
                      w-full flex items-center gap-4
                      p-4 rounded-xl
                      border border-slate-200
                      bg-white text-left
                      hover:border-emerald-300
                      hover:bg-emerald-50/40
                      transition-colors
                    "
                  >
                    <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ClipboardCheck size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">
                          Từ kế hoạch đã duyệt
                        </h4>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                          Khuyên dùng
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        Kế thừa dữ liệu từ bản kế hoạch đã được phê duyệt.
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-400"
                    />
                  </button>

                  <button
                    onClick={() =>
                      setSelectionMode("new")
                    }
                    className="
                      w-full flex items-center gap-4
                      p-4 rounded-xl
                      border border-slate-200
                      bg-white text-left
                      hover:border-indigo-300
                      hover:bg-indigo-50/40
                      transition-colors
                    "
                  >
                    <div className="w-11 h-11 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Sparkles size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">
                          Trợ lý AI phác thảo
                        </h4>

                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
                          Nhanh
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        Nhập mô tả ý tưởng để hệ thống gợi ý thông tin ban đầu.
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-400"
                    />
                  </button>

                  <button
                    onClick={() => {
                      onCreateNew({
                        fromPlan: false,
                        initialFormData: {},
                        startAtStep: 1,
                      });
                      onClose();
                    }}
                    className="
                      w-full flex items-center gap-4
                      p-4 rounded-xl
                      border border-slate-200
                      bg-white text-left
                      hover:border-blue-300
                      hover:bg-blue-50/40
                      transition-colors
                    "
                  >
                    <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <PlusCircle size={20} />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">
                        Bắt đầu từ form trống
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Tự điền toàn bộ thông tin sự kiện từ đầu.
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-400"
                    />
                  </button>
                </div>
              </div>
            )}

            {selectionMode === "from_plan" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setSelectionMode("choice")
                    }
                    className="
                      p-2 rounded-lg
                      text-slate-500
                      hover:bg-white
                      hover:text-slate-800
                      transition-colors
                    "
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Tìm kiếm kế hoạch..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="
                        w-full pl-10 pr-4 py-2.5
                        bg-white
                        border border-slate-200
                        rounded-xl
                        text-sm text-slate-700
                        outline-none
                        focus:border-emerald-500
                        transition-colors
                      "
                    />
                  </div>
                </div>

                {fetching ? (
                  <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
                    <Loader2
                      className="animate-spin text-emerald-600 mx-auto mb-3"
                      size={32}
                    />

                    <p className="text-sm text-slate-500">
                      Đang tải danh sách kế hoạch...
                    </p>
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <FileText
                      className="mx-auto text-slate-300 mb-3"
                      size={42}
                    />

                    <h4 className="text-slate-800 font-semibold">
                      Không tìm thấy kế hoạch nào
                    </h4>

                    <p className="text-slate-500 text-sm mt-1">
                      Hãy chắc chắn bạn có kế hoạch đã được phê duyệt.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPlans.map((plan, idx) => {
                      const active =
                        selectedPlan?.id === plan.id;

                      return (
                        <button
                          key={plan.id || `plan-${idx}`}
                          onClick={() =>
                            setSelectedPlan(plan)
                          }
                          className={`
                            p-4 rounded-xl
                            border
                            bg-white
                            text-left
                            transition-colors
                            ${active
                              ? "border-emerald-500 bg-emerald-50/60"
                              : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                            }
                          `}
                        >
                          <h4
                            className={`font-semibold mb-2 line-clamp-1 ${active
                              ? "text-emerald-700"
                              : "text-slate-800"
                              }`}
                          >
                            {plan.title}
                          </h4>

                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                            {plan.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} />
                              {plan.startTime
                                ? new Date(
                                  plan.startTime
                                ).toLocaleDateString()
                                : "Chưa set"}
                            </span>

                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {plan.location || "Chưa set"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectionMode === "new" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setSelectionMode("choice")
                    }
                    className="
                      p-2 rounded-lg
                      text-slate-500
                      hover:bg-white
                      hover:text-slate-800
                      transition-colors
                    "
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Trợ lý AI phác thảo
                    </h3>

                    <p className="text-sm text-slate-500">
                      Nhập mô tả ngắn về sự kiện bạn muốn tạo.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <textarea
                    className="
                      w-full min-h-[220px]
                      rounded-xl
                      border border-slate-200
                      bg-white px-4 py-3
                      text-sm text-slate-700
                      placeholder:text-slate-400
                      outline-none resize-none
                      focus:border-indigo-500
                      transition-colors
                    "
                    placeholder="Ví dụ: Tôi muốn tổ chức một buổi hội thảo về Trí tuệ nhân tạo vào thứ 6 tuần sau lúc 8h sáng tại hội trường A. Dự kiến có khoảng 200 sinh viên tham gia..."
                    value={aiText}
                    onChange={(e) =>
                      setAiText(e.target.value)
                    }
                    autoFocus
                  />

                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {[
                      "Lễ tổng kết năm học kết hợp trao giải sinh viên 5 tốt cấp khoa...",
                      "Workshop hướng nghiệp ngành CNTT với sự tham gia của chuyên gia...",
                      "Cuộc thi lập trình Hackathon 24h với quy mô 50 đội thi...",
                    ].map((text, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiText(text)}
                        className="
                          shrink-0 px-3 py-2
                          rounded-lg
                          bg-slate-100
                          hover:bg-slate-200
                          text-slate-600
                          text-xs font-medium
                          transition-colors
                        "
                      >
                        {idx === 0
                          ? "Lễ tổng kết"
                          : idx === 1
                            ? "Workshop IT"
                            : "Hackathon"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {selectionMode !== "choice" && (
            <div className="px-6 py-5 border-t border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
              <div className="text-sm">
                {selectionMode === "from_plan" &&
                  selectedPlan && (
                    <div>
                      <p className="font-medium text-slate-800">
                        Đã chọn: {selectedPlan.title}
                      </p>

                      <p className="text-xs text-emerald-600 mt-0.5">
                        Kế hoạch này sẵn sàng để chuyển đổi
                      </p>
                    </div>
                  )}

                {selectionMode === "new" && (
                  <div>
                    <p className="font-medium text-slate-800">
                      Sẵn sàng phân tích
                    </p>

                    <p className="text-xs text-indigo-600 mt-0.5">
                      Hệ thống sẽ dùng mô tả để gợi ý thông tin ban đầu
                    </p>
                  </div>
                )}

                {selectionMode === "from_plan" &&
                  !selectedPlan && (
                    <p className="text-slate-400">
                      Vui lòng chọn một kế hoạch để tiếp tục
                    </p>
                  )}
              </div>

              {selectionMode === "from_plan" && (
                <button
                  onClick={handleConfirmChoice}
                  disabled={!selectedPlan}
                  className="
                    flex items-center gap-2
                    px-5 py-2.5
                    rounded-xl
                    bg-emerald-600
                    text-white
                    text-sm font-medium
                    hover:bg-emerald-700
                    disabled:bg-slate-200
                    disabled:text-slate-500
                    transition-colors
                  "
                >
                  Tiếp tục
                  <ArrowRight size={16} />
                </button>
              )}

              {selectionMode === "new" && (
                <button
                  onClick={handleAIGenerate}
                  disabled={
                    !aiText.trim() ||
                    isRecommending
                  }
                  className="
                    flex items-center gap-2
                    px-5 py-2.5
                    rounded-xl
                    bg-indigo-600
                    text-white
                    text-sm font-medium
                    hover:bg-indigo-700
                    disabled:bg-slate-200
                    disabled:text-slate-500
                    transition-colors
                  "
                >
                  {isRecommending ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    "Phân tích"
                  )}

                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateEventModal;