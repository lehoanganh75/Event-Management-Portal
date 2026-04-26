import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Users, Info, Clock, Type, Tag, Upload, Image as ImageIcon } from "lucide-react";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";

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
    coverImage: "",
    notes: "",
    additionalInfo: "",
    status: "DRAFT",
    sessions: [],
    presenters: []
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const formatForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        location: event.location || "",
        registrationDeadline: formatForInput(event.registrationDeadline),
        eventTopic: event.eventTopic || "",
        type: event.type || "",
        maxParticipants: event.maxParticipants || 100,
        eventMode: event.eventMode || "OFFLINE",
        coverImage: event.coverImage || "",
        notes: event.notes || "",
        additionalInfo: event.additionalInfo || "",
        status: event.status || "DRAFT",
        sessions: [...(event.sessions || [])],
        presenters: [...(event.presenters || [])]
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setUploading(true);
    try {
      const res = await eventService.uploadImage(formDataUpload);
      // Assuming response is the URL directly or { url: "..." }
      const imageUrl = typeof res.data === 'string' ? res.data : res.data.url;
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Trạng thái sự kiện" icon={Tag}>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PLAN_PENDING_APPROVAL">Chờ duyệt kế hoạch</option>
                <option value="PLAN_APPROVED">Đã duyệt kế hoạch</option>
                <option value="EVENT_PENDING_APPROVAL">Chờ duyệt sự kiện</option>
                <option value="PUBLISHED">Đã công khai</option>
                <option value="ONGOING">Đang diễn ra</option>
                <option value="COMPLETED">Đã kết thúc</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="REJECTED">Đã từ chối</option>
                <option value="CONVERTED">Đã chuyển đổi</option>
              </select>
            </InputField>
          </div>

          <InputField label="Ảnh bìa sự kiện" icon={ImageIcon}>
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {!formData.coverImage ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-[2/1] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Tải ảnh bìa lên</p>
                    <p className="text-xs text-slate-400 mt-1">Định dạng JPG, PNG (Tối đa 5MB)</p>
                  </div>
                </button>
              ) : (
                <div className="relative group rounded-3xl overflow-hidden border border-slate-200 aspect-[2/1] bg-slate-100 shadow-sm">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current.click()}
                      className="px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      Thay đổi ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: "" })}
                      className="px-5 py-2.5 bg-red-500 text-white rounded-2xl text-xs font-bold shadow-xl hover:bg-red-600 transition-all"
                    >
                      Gỡ ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </InputField>

          <InputField label="Lưu ý quan trọng" icon={Info}>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] text-sm leading-relaxed"
              placeholder="VD: Mang theo thẻ sinh viên khi tham dự..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </InputField>

          <InputField label="Thông tin bổ sung" icon={Info}>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] text-sm leading-relaxed"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </InputField>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  Chương trình chi tiết ({formData.sessions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    sessions: [...formData.sessions, { id: `new-${Date.now()}`, title: "", startTime: "", endTime: "", description: "" }]
                  })}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  + Thêm phiên
                </button>
              </div>
              <div className="space-y-3">
                {formData.sessions.map((session, idx) => (
                  <div key={session.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Tên phiên (VD: Khai mạc)"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                        value={session.title}
                        onChange={(e) => {
                          const newSessions = [...formData.sessions];
                          newSessions[idx].title = e.target.value;
                          setFormData({ ...formData, sessions: newSessions });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sessions: formData.sessions.filter((_, i) => i !== idx) })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                        value={formatForInput(session.startTime)}
                        onChange={(e) => {
                          const newSessions = [...formData.sessions];
                          newSessions[idx].startTime = e.target.value;
                          setFormData({ ...formData, sessions: newSessions });
                        }}
                      />
                      <input
                        type="datetime-local"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                        value={formatForInput(session.endTime)}
                        onChange={(e) => {
                          const newSessions = [...formData.sessions];
                          newSessions[idx].endTime = e.target.value;
                          setFormData({ ...formData, sessions: newSessions });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users size={16} className="text-purple-500" />
                  Diễn giả / Người thuyết trình ({formData.presenters.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    presenters: [...formData.presenters, { id: `new-${Date.now()}`, fullName: "", position: "", email: "" }]
                  })}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  + Thêm diễn giả
                </button>
              </div>
              <div className="space-y-3">
                {formData.presenters.map((presenter, idx) => (
                  <div key={presenter.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Họ và tên diễn giả"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                        value={presenter.fullName}
                        onChange={(e) => {
                          const newPresenters = [...formData.presenters];
                          newPresenters[idx].fullName = e.target.value;
                          setFormData({ ...formData, presenters: newPresenters });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, presenters: formData.presenters.filter((_, i) => i !== idx) })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Chức vụ/Vị trí"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                        value={presenter.position}
                        onChange={(e) => {
                          const newPresenters = [...formData.presenters];
                          newPresenters[idx].position = e.target.value;
                          setFormData({ ...formData, presenters: newPresenters });
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                        value={presenter.email}
                        onChange={(e) => {
                          const newPresenters = [...formData.presenters];
                          newPresenters[idx].email = e.target.value;
                          setFormData({ ...formData, presenters: newPresenters });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
