import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Users, Info, Clock, Type, Tag } from "lucide-react";

const EditEventModal = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    registrationDeadline: "",
    eventTopic: "",
    type: "",
    maxParticipants: 100,
    eventMode: "OFFLINE",
    coverImage: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "",
        location: event.location || "",
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : "",
        eventTopic: event.eventTopic || "",
        type: event.type || "",
        maxParticipants: event.maxParticipants || 100,
        eventMode: event.eventMode || "OFFLINE",
        coverImage: event.coverImage || ""
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, children }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa thông tin sự kiện</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cập nhật các thông tin cơ bản của sự kiện</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <InputField label="Tên sự kiện" icon={Type}>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </InputField>

          <InputField label="Mô tả" icon={Info}>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] text-sm leading-relaxed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </InputField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Chủ đề" icon={Tag}>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.eventTopic}
                onChange={(e) => setFormData({ ...formData, eventTopic: e.target.value })}
              />
            </InputField>
            <InputField label="Loại sự kiện" icon={Type}>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="CONFERENCE">Conference</option>
                <option value="TALKSHOW">Talkshow</option>
                <option value="COMPETITION">Competition</option>
                <option value="OTHER">Khác</option>
              </select>
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Thời gian bắt đầu" icon={Clock}>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </InputField>
            <InputField label="Thời gian kết thúc" icon={Clock}>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Hạn đăng ký" icon={Calendar}>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </InputField>
            <InputField label="Địa điểm" icon={MapPin}>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Số lượng tối đa" icon={Users}>
              <input
                type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              />
            </InputField>
            <InputField label="Hình thức" icon={Info}>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                value={formData.eventMode}
                onChange={(e) => setFormData({ ...formData, eventMode: e.target.value })}
              >
                <option value="OFFLINE">Trực tiếp (Offline)</option>
                <option value="ONLINE">Trực tuyến (Online)</option>
                <option value="HYBRID">Kết hợp (Hybrid)</option>
              </select>
            </InputField>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
