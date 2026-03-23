import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PlusCircle,
  FileText,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Search,
} from "lucide-react";
import { getPlansByStatus } from "../../api/eventApi";

const ChooseModeStep = ({ onChoose }) => (
  <div className="p-8">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">
        Tạo sự kiện mới
      </h2>
      <p className="text-slate-500 text-sm mt-1">
        Chọn cách bạn muốn tạo sự kiện
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => onChoose("plan")}
        className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all text-left"
      >
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
          <BookOpen size={22} />
        </div>
        <span className="font-black text-slate-800 text-base mb-1">
          Từ kế hoạch có sẵn
        </span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Chọn từ các kế hoạch đã được phê duyệt. Thông tin sẽ được điền tự
          động, chỉ cần gửi phê duyệt.
        </p>
        <div className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold">
          Chọn kế hoạch <ChevronRight size={14} />
        </div>
      </button>

      <button
        onClick={() => onChoose("new")}
        className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 transition-all text-left"
      >
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
          <PlusCircle size={22} />
        </div>
        <span className="font-black text-slate-800 text-base mb-1">
          Tạo mới trực tiếp
        </span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Nhập đầy đủ thông tin sự kiện qua các bước chi tiết và gửi phê duyệt.
        </p>
        <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
          Tạo mới <ChevronRight size={14} />
        </div>
      </button>
    </div>
  </div>
);

const SelectPlanStep = ({ onSelectPlan, onBack }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let accountId = null;
    
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        accountId = user.id || user.accountId || user.account?.id || user.userId;
      } catch (error) {
        console.error("Lỗi parse user data:", error);
      }
    }

    if (!accountId) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          accountId = payload.accountId || payload.sub || payload.userId || payload.id;
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
      }
    }

    getPlansByStatus("PLAN_APPROVED", accountId)
      .then((res) => {
        console.log("Dữ liệu kế hoạch đã duyệt (API):", res.data);
        setPlans(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("Lỗi lấy danh sách kế hoạch đã duyệt:", error);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại
      </button>
      <h2 className="text-xl font-black text-slate-800 mb-1">Chọn kế hoạch</h2>
      <p className="text-slate-500 text-sm mb-4">
        Các kế hoạch đã được phê duyệt
      </p>

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={15}
        />
        <input
          type="text"
          placeholder="Tìm kiếm kế hoạch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {searchTerm
              ? "Không tìm thấy kế hoạch phù hợp"
              : "Chưa có kế hoạch nào được phê duyệt"}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map((plan) => {
            const isSelected = selected?.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`font-bold text-[13px] line-clamp-1 ${isSelected ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {plan.title}
                  </span>
                  {isSelected && (
                    <CheckCircle2
                      size={16}
                      className="text-blue-500 shrink-0 mt-0.5"
                    />
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                  {plan.startTime && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-blue-400" />
                      {new Date(plan.startTime).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                  {plan.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-rose-400" />
                      {plan.location}
                    </span>
                  )}
                  {plan.maxParticipants > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-emerald-400" />
                      {plan.maxParticipants} người
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          disabled={!selected}
          onClick={() => {
            console.log("📋 Plan raw data:", selected);
            onSelectPlan(selected);
          }}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
        >
          Tiếp theo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const formatForInput = (val) => {
  if (!val) return "";
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 16);
};

const toPersonObject = (nameOrObj, index) => {
  if (typeof nameOrObj === "object" && nameOrObj !== null) return nameOrObj;
  const name = String(nameOrObj).trim();
  const avatar =
    name
      .split(" ")
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase() || "NG";
  return {
    id: `plan_person_${index}_${Date.now()}`,
    name,
    title: "",
    org: "",
    avatar,
    isManual: true,
  };
};

const mapPlanToPrefill = (plan) => ({
  planId: plan.id,
  organizationId: plan.organizationId || "",
  title: plan.title || "",
  eventTitle: plan.title || "",
  description: plan.description || "",
  eventPurpose: plan.description || "",
  eventTopic: plan.eventTopic || "",
  themes: plan.eventTopic ? [plan.eventTopic] : [],
  eventType: plan.type || "",
  eventMode: plan.eventMode || "OFFLINE",
  location: plan.location || "",
  startTime: formatForInput(plan.startTime),
  endTime: formatForInput(plan.endTime),
  registrationDeadline: formatForInput(plan.registrationDeadline),
  maxParticipants: plan.maxParticipants || 50,
  faculty: plan.faculty || "",
  major: plan.major || "",
  participants: Array.isArray(plan.participants) ? plan.participants : [],
  recipients: Array.isArray(plan.recipients) ? plan.recipients : [],
  customRecipients: Array.isArray(plan.customRecipients)
    ? plan.customRecipients
    : [],
  presenters: Array.isArray(plan.presenters)
    ? plan.presenters.map(toPersonObject)
    : [],
  organizers: Array.isArray(plan.organizingCommittee)
    ? plan.organizingCommittee.map(toPersonObject)
    : [],
  attendees: Array.isArray(plan.attendees)
    ? plan.attendees.map(toPersonObject)
    : [],
  programItems: [],
  customFields: [],
  notes: plan.notes || "",
  additionalInfo: plan.additionalInfo || "",
  coverImage: plan.coverImage || "",
  templateId: plan.templateId || null,
  hasLuckyDraw: plan.hasLuckyDraw || false,
  mode: "event",
  _selectedPlanId: plan.id,
});

const CreateEventModal = ({
  isOpen,
  onClose,
  onCreated,
  onSelectPlan,
  onCreateNew,
}) => {
  const [step, setStep] = useState("choose");

  const reset = () => setStep("choose");

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChoose = (mode) => {
    if (mode === "plan") {
      setStep("selectPlan");
    } else {
      onCreateNew({ fromPlan: false, initialFormData: {} });
      handleClose();
    }
  };

  const handleSelectPlan = (plan) => {
    const prefillData = mapPlanToPrefill(plan);
    onSelectPlan({ fromPlan: true, initialFormData: prefillData });
    handleClose();
  };

  const animationProps = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {step === "choose" && (
                <motion.div key="choose" {...animationProps}>
                  <ChooseModeStep onChoose={handleChoose} />
                </motion.div>
              )}
              {step === "selectPlan" && (
                <motion.div key="selectPlan" {...animationProps}>
                  <SelectPlanStep
                    onSelectPlan={handleSelectPlan}
                    onBack={() => setStep("choose")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;
