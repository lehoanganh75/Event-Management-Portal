import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Send, Upload, X, AlertCircle } from "lucide-react";
import postApi from "../../api/eventPostApi";

const CreatePost = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    thumbnail: null,
    visibility: ["all"],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const finalEventId = eventId || "ea09a473-868c-4f16-9811-094770e5b7c0";

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      postType: mapCategoryToType(formData.category),
      status: status,
      event: {
        id: finalEventId,
      },
      createdByAccountId: "user-test-123",
      isDeleted: false,
    };

    try {
      console.log("Payload gửi đi:", payload);
      const response = await postApi.createPost(payload);
      console.log("Response:", response);
      alert("Thành công!");
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/lecturer/posts")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${errors.title ? "border-red-300" : "border-gray-300"}`}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.title.length}/100
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đối tượng xem *
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.visibility.includes(opt.id)}
                      onChange={() => handleVisibilityChange(opt.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            {formData.thumbnail ? (
              <div className="flex items-start gap-3">
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, thumbnail: null }))
                  }
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <X size={14} /> Xóa
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium">
                <Upload size={16} /> Chọn ảnh
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${errors.content ? "border-red-300" : "border-gray-300"}`}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {wordCount} từ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={() => handleSubmit("Published")}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              <Send size={16} /> {isSubmitting ? "Đang xử lý..." : "Đăng bài"}
            </button>
            <button
              onClick={() => handleSubmit("Draft")}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 text-sm"
            >
              <Save size={16} /> Lưu nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
