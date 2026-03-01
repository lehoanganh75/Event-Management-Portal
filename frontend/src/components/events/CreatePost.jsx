import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";

const CreatePost = () => {
  const navigate = useNavigate();
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
    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung";
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
      navigate("/lecturer/posts");
    } catch {
      alert("Lỗi khi lưu bản nháp!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Đăng bài:", formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("✓ Đã đăng bài viết thành công!");
      navigate("/lecturer/posts");
    } catch {
      alert("Lỗi khi đăng bài!");
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
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/lecturer/posts")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
          <p className="text-gray-600 text-sm mt-1">
            Điền thông tin bên dưới để tạo bài viết
          </p>
        </div>


        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài viết..."
              maxLength={100}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.title.length}/100
              </p>
            </div>
          </div>

          {/* Danh mục & Đối tượng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Danh mục */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm ${
                  errors.category ? "border-red-300" : "border-gray-300"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đối tượng xem <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={formData.visibility.includes(option.id)}
                      onChange={() => handleVisibilityChange(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {option.label}
                    </span>
                  </label>
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

          {/* Ảnh đại diện - Compact Version */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            
            {formData.thumbnail ? (
              <div className="flex items-start gap-3">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn</p>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnail: null }))
                    }
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <X size={14} />
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <Upload size={16} />
                  Chọn ảnh từ máy tính
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF - Tối đa 5MB
                </p>
              </div>
            )}
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Viết nội dung bài viết của bạn..."
              rows={10}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                errors.content ? "border-red-300" : "border-gray-300"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.content && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.content}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">{wordCount} từ</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Send size={16} />
              {isSubmitting ? "Đang xử lý..." : "Đăng bài"}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Save size={16} />
              Lưu nháp
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-600" />
            Lưu ý khi viết bài
          </h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li>• Tiêu đề rõ ràng, không quá 100 ký tự</li>
            <li>• Nội dung tối thiểu 50 từ để đảm bảo chất lượng</li>
            <li>• Chọn đúng danh mục để dễ tìm kiếm</li>
            <li>• Chọn đối tượng xem phù hợp với nội dung</li>
            <li>• Ảnh đại diện nên rõ nét, kích thước dưới 5MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;