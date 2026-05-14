import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Send, Upload, X, AlertCircle } from "lucide-react";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

const CreatePost = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    eventId: eventId || "",
    category: "",
    content: "",
    thumbnail: null,
    visibility: ["all"],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState("user-test-123");

  const categories = [
    "Thông báo",
    "Tin tức",
    "Quy định",
    "Sự kiện",
    "Học tập",
    "Hoạt động",
  ];
  const visibilityOptions = [
    { id: "all", label: "Tất cả mọi người" },
    { id: "lecturer", label: "Giảng viên" },
    { id: "student", label: "Sinh viên" },
    { id: "guest", label: "Vãng lai" },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      let accountId = null;
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          accountId = user.id || user.accountId || user.account?.id || user.userId;
        } catch (e) { }
      }
      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) { }
        }
      }

      if (accountId) {
        setCurrentAccountId(accountId);
        try {
          const res = await eventService.getMyEvents();
          setUserEvents(res.data || []);
        } catch (error) {
          console.error("Lỗi lấy danh sách sự kiện:", error);
        }
      }
    };
    fetchEvents();
  }, []);

  const mapCategoryToType = (cat) => {
    const map = {
      "Thông báo": "ANNOUNCEMENT",
      "Tin tức": "NEWS",
      "Quy định": "REGULATION",
      "Sự kiện": "EVENT",
      "Học tập": "LEARNING",
      "Hoạt động": "ACTIVITY",
    };
    return map[cat] || "ANNOUNCEMENT";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
        setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!formData.eventId) newErrors.eventId = "Vui lòng chọn sự kiện";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung";
    if (formData.visibility.length === 0)
      newErrors.visibility = "Vui lòng chọn đối tượng";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status) => {
    if (status === "Published" && !validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      postType: mapCategoryToType(formData.category),
      status: status,
      event: {
        id: formData.eventId,
      },
      createdByAccountId: currentAccountId,
      isDeleted: false,
    };

    try {
      console.log("Payload gửi đi:", payload);
      const response = await eventService.createPost(payload);
      console.log("Response:", response);
      toast.success("Tạo bài viết thành công!");
      navigate("/lecturer/posts");
    } catch (err) {
      console.error("Chi tiết lỗi 400:", err.response?.data);
      alert("Lỗi dữ liệu (400): Hãy kiểm tra Console để biết trường bị sai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.content.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1E40AF] transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tạo bài viết mới
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Nhập thông tin bài viết và chọn sự kiện áp dụng
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiêu đề bài viết *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all ${errors.title
                ? "border-red-300 focus:border-red-400"
                : "border-slate-200 focus:border-[#1E40AF]"
                }`}
              placeholder="Nhập tiêu đề bài viết"
            />

            <div className="flex justify-between mt-1.5">
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title}
                </p>
              )}

              <p className="text-xs text-slate-400 ml-auto">
                {formData.title.length}/100
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sự kiện áp dụng *
            </label>

            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none bg-white transition-all ${errors.eventId
                ? "border-red-300 focus:border-red-400"
                : "border-slate-200 focus:border-[#1E40AF]"
                }`}
            >
              <option value="">-- Chọn sự kiện --</option>
              {userEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            {errors.eventId && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                <AlertCircle size={12} /> {errors.eventId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Danh mục *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-11 px-4 rounded-xl border text-sm outline-none bg-white transition-all ${errors.category
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-[#1E40AF]"
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
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                  <AlertCircle size={12} /> {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Đối tượng xem *
              </label>

              <div className="grid grid-cols-2 gap-2">
                {visibilityOptions.map((opt) => {
                  const checked = formData.visibility.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleVisibilityChange(opt.id)}
                      className={`h-10 rounded-xl border text-sm font-medium transition-all ${checked
                        ? "bg-blue-50 border-blue-200 text-[#1E40AF]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {errors.visibility && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                  <AlertCircle size={12} /> {errors.visibility}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ảnh đại diện
            </label>

            {formData.thumbnail ? (
              <div className="flex items-start gap-4">
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                />

                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnail: null,
                    }))
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  <X size={15} />
                  Xóa ảnh
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                <Upload size={16} className="text-[#1E40AF]" />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nội dung *
            </label>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all ${errors.content
                ? "border-red-300 focus:border-red-400"
                : "border-slate-200 focus:border-[#1E40AF]"
                }`}
              placeholder="Nhập nội dung bài viết..."
            />

            <div className="flex justify-between mt-1.5">
              {errors.content && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.content}
                </p>
              )}

              <p className="text-xs text-slate-400 ml-auto">
                {wordCount} từ
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-100">
            <button
              onClick={() => handleSubmit("Published")}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {isSubmitting ? "Đang xử lý..." : "Đăng bài"}
            </button>

            <button
              onClick={() => handleSubmit("Draft")}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Lưu nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
