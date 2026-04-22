// src/components/common/ImageUpload.jsx
import React, { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const ImageUpload = ({ value, onChange, label = "Ảnh nền sự kiện", hint = "Dung lượng tối đa 5MB. Định dạng: JPG, PNG, WEBP" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Gọi API upload qua axiosClient
      // axiosClient sẽ tự động định tuyến sang http://localhost:8082/... dựa trên tiền tố /event/
      const res = await axiosClient.post("/event/events/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.url) {
        onChange(res.data.url);
        toast.success("Tải ảnh lên thành công!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
        <ImageIcon size={14} className="text-blue-500" />
        {label}
      </label>

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer border-2 border-dashed rounded-2xl overflow-hidden
          transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center
          ${value ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="text-xs font-medium text-slate-500">Đang tải ảnh lên...</span>
          </div>
        ) : value ? (
          <div className="relative w-full h-full min-h-[160px]">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                type="button"
                className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition-colors text-white"
                title="Thay đổi ảnh"
              >
                <Upload size={20} />
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="bg-rose-500/80 p-2 rounded-full hover:bg-rose-600 transition-colors text-white"
                title="Xóa ảnh"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấp để tải ảnh</p>
              <p className="text-[11px] text-slate-400">{hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
