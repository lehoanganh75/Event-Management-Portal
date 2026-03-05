import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, PlusCircle, FileText, ChevronRight, Loader2,
  Calendar, MapPin, Users, Clock, Image, AlignLeft,
  BookOpen, Send, CheckCircle2, ArrowLeft, Upload, Globe, Wifi
} from "lucide-react";

// ─── Step 0: Choose creation mode ──────────────────────────────────────────
const ChooseModeStep = ({ onChoose }) => (
  <div className="p-8">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tạo sự kiện mới</h2>
      <p className="text-slate-500 text-sm mt-1">Chọn cách bạn muốn tạo sự kiện</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Option 1: From plan */}
      <button
        onClick={() => onChoose("plan")}
        className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all text-left"
      >
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
          <BookOpen size={22} />
        </div>
        <span className="font-black text-slate-800 text-base mb-1">Từ kế hoạch có sẵn</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Chọn từ các kế hoạch đã được phê duyệt. Thông tin sẽ được điền tự động, chỉ cần gửi phê duyệt.
        </p>
        <div className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold">
          Chọn kế hoạch <ChevronRight size={14} />
        </div>
      </button>

      {/* Option 2: Create new directly */}
      <button
        onClick={() => onChoose("new")}
        className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 transition-all text-left"
      >
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
          <PlusCircle size={22} />
        </div>
        <span className="font-black text-slate-800 text-base mb-1">Tạo mới trực tiếp</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Nhập đầy đủ thông tin sự kiện và đăng ngay lập tức với trạng thái <span className="font-bold text-emerald-600">Published</span>.
        </p>
        <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
          Tạo mới <ChevronRight size={14} />
        </div>
      </button>
    </div>
  </div>
);

// ─── Step 1 (plan mode): Pick a plan ───────────────────────────────────────
const SelectPlanStep = ({ onSelectPlan, onBack }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/plans?status=Approved")
      .then((r) => r.json())
      .then((data) => setPlans(data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Quay lại
      </button>
      <h2 className="text-xl font-black text-slate-800 mb-1">Chọn kế hoạch</h2>
      <p className="text-slate-500 text-sm mb-6">Các kế hoạch đã được phê duyệt</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Chưa có kế hoạch nào được phê duyệt</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selected?.id === plan.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-[13px] text-slate-800 line-clamp-1">{plan.title}</span>
                {selected?.id === plan.id && <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={11} />{new Date(plan.startTime).toLocaleDateString("vi-VN")}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{plan.location}</span>
                <span className="flex items-center gap-1"><Users size={11} />{plan.maxParticipants} người</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          disabled={!selected}
          onClick={() => onSelectPlan(selected)}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
        >
          Tiếp theo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Shared: Event form ─────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all";

const Field = ({ label, value, onChange, placeholder }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">{label}</p>
    <input value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
  </div>
);

const EventForm = ({ initialData, mode, onSubmit, onBack, submitting }) => {
  const [form, setForm] = useState({
    title: "", shortDescription: "", description: "", postTitle: "",
    coverImage: "", location: "", eventMode: "Offline",
    startTime: "", endTime: "", registrationDeadline: "",
    maxParticipants: 50,
    status: mode === "new" ? "Published" : "PendingApproval",
    ...initialData,
  });
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImage || "");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCoverPreview(ev.target.result); setForm((f) => ({ ...f, coverImage: ev.target.result })); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-h-[78vh] overflow-y-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {mode === "plan" ? "Xác nhận & gửi phê duyệt" : "Tạo sự kiện mới"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === "plan"
              ? "Thông tin từ kế hoạch đã điền sẵn. Bổ sung nội dung truyền thông và gửi phê duyệt."
              : "Điền đầy đủ thông tin để đăng sự kiện ngay lập tức."}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
        form.status === "Published" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${form.status === "Published" ? "bg-emerald-500" : "bg-amber-500"}`} />
        {form.status === "Published" ? "Đăng ngay sau khi tạo" : "Gửi phê duyệt sau khi tạo"}
      </div>

      {/* Cover image */}
      <section>
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Image size={12} /> Ảnh bìa sự kiện</p>
        <div
          className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
          onClick={() => document.getElementById("coverInput").click()}
        >
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                <Upload size={22} className="text-white" />
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400">
              <Upload size={26} className="mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-medium">Nhấn để tải ảnh bìa</p>
            </div>
          )}
          <input id="coverInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
      </section>

      {/* Basic info */}
      <section>
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Globe size={12} /> Thông tin cơ bản</p>
        <div className="bg-slate-50/80 rounded-2xl p-5 space-y-4 border border-slate-100">
          <Field label="Tên sự kiện *" value={form.title} onChange={set("title")} placeholder="VD: Workshop AI cho sinh viên" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Địa điểm / Link *</p>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={form.location} onChange={set("location")} className={`${inputCls} pl-8`} placeholder="Tòa A - Phòng 301" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Chế độ *</p>
              <select value={form.eventMode} onChange={set("eventMode")} className={inputCls}>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Bắt đầu *</p>
              <input type="datetime-local" value={form.startTime} onChange={set("startTime")} className={inputCls} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Kết thúc *</p>
              <input type="datetime-local" value={form.endTime} onChange={set("endTime")} className={inputCls} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Hạn đăng ký</p>
              <input type="datetime-local" value={form.registrationDeadline} onChange={set("registrationDeadline")} className={inputCls} />
            </div>
          </div>
          <div className="w-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Số người tối đa *</p>
            <div className="relative">
              <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="number" value={form.maxParticipants} onChange={set("maxParticipants")} className={`${inputCls} pl-8`} />
            </div>
          </div>
        </div>
      </section>

      {/* PR content */}
      <section>
        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><AlignLeft size={12} /> Nội dung truyền thông</p>
        <div className="bg-slate-50/80 rounded-2xl p-5 space-y-4 border border-slate-100">
          <Field label="Tiêu đề bài viết *" value={form.postTitle} onChange={set("postTitle")} placeholder="VD: 🚀 Workshop AI lớn nhất năm — Đừng bỏ lỡ!" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Mô tả ngắn *</p>
            <textarea rows={2} value={form.shortDescription} onChange={set("shortDescription")} placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ sự kiện..." className={`${inputCls} resize-none`} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Mô tả chi tiết *</p>
            <textarea rows={5} value={form.description} onChange={set("description")} placeholder="Nội dung chi tiết cho bài đăng truyền thông — chương trình, khách mời, lợi ích tham dự..." className={`${inputCls} resize-none`} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1 pb-2">
        <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-200 text-sm">Hủy</button>
        <button
          onClick={() => onSubmit(form)}
          disabled={submitting || !form.title || !form.location || !form.startTime}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            form.status === "Published"
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
          }`}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {form.status === "Published" ? "Đăng sự kiện" : "Gửi phê duyệt"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Modal ─────────────────────────────────────────────────────────────
const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const [step, setStep] = useState("choose");
  const [mode, setMode] = useState(null);
  const [prefill, setPrefill] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setStep("choose"); setMode(null); setPrefill({}); };
  const handleClose = () => { reset(); onClose(); };

  const handleChoose = (m) => { setMode(m); setStep(m === "plan" ? "selectPlan" : "form"); };

  const handleSelectPlan = (plan) => {
    setPrefill({
      title: plan.title, description: plan.description,
      location: plan.location, eventMode: plan.eventMode,
      startTime: plan.startTime, endTime: plan.endTime,
      registrationDeadline: plan.registrationDeadline,
      maxParticipants: plan.maxParticipants, planId: plan.id,
    });
    setStep("form");
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) { onCreated?.(); handleClose(); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
              <X size={18} />
            </button>
            <AnimatePresence mode="wait">
              {step === "choose" && (
                <motion.div key="choose" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <ChooseModeStep onChoose={handleChoose} />
                </motion.div>
              )}
              {step === "selectPlan" && (
                <motion.div key="selectPlan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SelectPlanStep onSelectPlan={handleSelectPlan} onBack={() => setStep("choose")} />
                </motion.div>
              )}
              {step === "form" && (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <EventForm initialData={prefill} mode={mode} onSubmit={handleSubmit}
                    onBack={() => setStep(mode === "plan" ? "selectPlan" : "choose")} submitting={submitting} />
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