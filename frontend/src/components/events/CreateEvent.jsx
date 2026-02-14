import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  Upload,
  AlertCircle,
  Save,
  Send,
  X,
} from "lucide-react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    content: "",
    thumbnail: null,
    category: "",
    visibility: ["all"],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Hội thảo",
    "Seminar",
    "Workshop",
    "Tọa đàm",
    "Thi đấu",
    "Văn nghệ",
  ];

  const visibilityOptions = [
    { id: "all", label: "Tất cả mọi người" },
    { id: "lecturer", label: "Giảng viên" },
    { id: "student", label: "Sinh viên" },
    { id: "guest", label: "Vãng lai" },
  ];

  // Event info from plan (read-only)
  const eventInfo = {
    startTime: "13:00:00 15/2/2026",
    endTime: "18:00:00 17/2/2026",
    location: "Hội trường A7",
    format: "Trực tiếp",
    maxAttendees: "150 người",
    deadline: "09:01:00 15/2/2026",
  };

  const wordCount = formData.content.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0;
  const titleLen = formData.title.length;
  const descLen = formData.shortDesc.length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVisibilityChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      visibility: prev.visibility.includes(id)
        ? prev.visibility.filter((v) => v !== id)
        : [...prev.visibility, id],
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }
    if (!formData.shortDesc.trim()) {
      newErrors.shortDesc = "Vui lòng nhập mô tả ngắn";
    } else if (formData.shortDesc.length < 50) {
      newErrors.shortDesc = "Mô tả phải có ít nhất 50 ký tự";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung";
    }
    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    if (formData.visibility.length === 0) {
      newErrors.visibility = "Vui lòng chọn ít nhất một đối tượng";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      console.log("Lưu bản nháp:", formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("✓ Đã lưu bản nháp thành công!");
      navigate("/lecturer/events/my-events");
    } catch {
      alert("Lỗi khi lưu bản nháp!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Gửi phê duyệt:", formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("✓ Đã gửi bài viết để phê duyệt!");
      navigate("/lecturer/events/my-events");
    } catch {
      alert("Lỗi khi gửi phê duyệt!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-3 font-medium text-sm"
          >
            <ChevronLeft size={18} /> Quay lại
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            Tạo bài truyền thông sự kiện
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tạo bài truyền thông từ kế hoạch đã được phê duyệt
          </p>
        </div>


        {/* Event Info Card */}
        <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-blue-100 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Info size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 text-sm mb-3">
                Thông tin sự kiện từ kế hoạch
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem label="Thời gian bắt đầu" value={eventInfo.startTime} />
                <InfoItem label="Thời gian kết thúc" value={eventInfo.endTime} />
                <InfoItem label="Địa điểm" value={eventInfo.location} />
                <InfoItem label="Hình thức" value={eventInfo.format} />
                <InfoItem label="Số lượng tối đa" value={eventInfo.maxAttendees} />
                <InfoItem label="Hạn đăng ký" value={eventInfo.deadline} />
              </div>
              <p className="text-xs italic text-blue-500 mt-3">
                * Các thông tin trên được lấy từ kế hoạch và không thể chỉnh sửa
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài viết..."
              maxLength={100}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.title ? "border-red-300" : "border-slate-200"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-slate-500 ml-auto">{titleLen}/100</p>
            </div>
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleInputChange}
              placeholder="Viết mô tả ngắn về sự kiện..."
              rows={3}
              maxLength={250}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                errors.shortDesc ? "border-red-300" : "border-slate-200"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.shortDesc && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.shortDesc}
                </p>
              )}
              <p
                className={`text-xs ml-auto ${
                  descLen < 50 ? "text-red-500" : "text-slate-500"
                }`}
              >
                {descLen}/250
              </p>
            </div>
          </div>

          {/* Danh mục & Đối tượng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Danh mục */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm ${
                  errors.category ? "border-red-300" : "border-slate-200"
                }`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Đối tượng xem */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Đối tượng xem <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {visibilityOptions.map((option) => (
                  <Checkbox
                    key={option.id}
                    label={option.label}
                    checked={formData.visibility.includes(option.id)}
                    onChange={() => handleVisibilityChange(option.id)}
                  />
                ))}
              </div>
              {errors.visibility && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.visibility}
                </p>
              )}
            </div>
          </div>

          {/* Ảnh bìa */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ảnh bìa
            </label>

            {formData.thumbnail ? (
              <div className="flex items-start gap-3">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-2">Ảnh đã chọn</p>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnail: null }))
                    }
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <X size={14} />
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  <Upload size={16} />
                  Chọn ảnh từ máy tính
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  PNG, JPG, GIF, WEBP - Tối đa 5MB
                </p>
              </div>
            )}
          </div>

          {/* Nội dung chi tiết */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Nhập nội dung bài viết tại đây..."
              rows={12}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                errors.content ? "border-red-300" : "border-slate-200"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.content && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.content}
                </p>
              )}
              <p className="text-xs text-slate-500 ml-auto">{wordCount} từ</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Send size={16} />
              {isSubmitting ? "Đang xử lý..." : "Gửi phê duyệt"}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Save size={16} />
              Lưu nháp
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
            <span className="text-lg">✨</span> Gợi ý cải thiện
          </h3>
          <div className="space-y-2">
            {wordCount < 200 && (
              <AlertCard
                title="Nội dung bài viết quá ngắn"
                desc={`Bạn chỉ mới viết ${wordCount} từ. Một bài viết chất lượng thường có từ 200-2000 từ.`}
              />
            )}
            {descLen < 50 && (
              <AlertCard
                title="Mô tả ngắn chưa đạt yêu cầu"
                desc="Mô tả ngắn giúp hiển thị tốt trên mạng xã hội. Bạn nên viết từ 50-250 ký tự."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-blue-600 font-medium mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-blue-900">{value}</p>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
    />
    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
      {label}
    </span>
  </label>
);

const AlertCard = ({ title, desc }) => (
  <div className="p-3 bg-orange-100/50 border border-orange-200 rounded-lg flex gap-3">
    <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
    <div>
      <h4 className="text-xs font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  </div>
);

const FileTextIcon = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

export default CreateEvent;