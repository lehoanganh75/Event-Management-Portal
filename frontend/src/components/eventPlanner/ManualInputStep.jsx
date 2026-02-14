import React, { useState } from "react";
import {
  Save,
  Calendar,
  MapPin,
  Users,
  FileText,
  Info,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export const ManualInputStep = ({ onBack, onNext }) => {
  const [formData, setFormData] = useState({
    eventType: "",
    eventTitle: "",
    startTime: "",
    endTime: "",
    location: "",
    organizer: "Khoa Công nghệ thông tin",
    recipients: [],
    participants: "",
    budget: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventType) newErrors.eventType = true;
    if (!formData.eventTitle) newErrors.eventTitle = true;
    if (!formData.startTime) newErrors.startTime = true;
    if (!formData.endTime) newErrors.endTime = true;
    if (!formData.location) newErrors.location = true;
    if (formData.recipients.length === 0) newErrors.recipients = true;
    if (!formData.participants) newErrors.participants = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Nhập thông tin kế hoạch
        </h1>
        <p className="text-sm text-slate-500">
          Điền đầy đủ các thông tin bên dưới
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 space-y-6">
        {/* Save Draft Banner */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Info className="text-amber-600" size={16} />
            <span className="text-amber-800">
              Nhớ lưu bản nháp để không mất dữ liệu
            </span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition">
            <Save size={14} />
            Lưu nháp
          </button>
        </div>

        {/* 1. Loại sự kiện */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-blue-600" size={16} />
            Loại sự kiện <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {["Hội thảo", "Workshop", "Seminar", "Tọa đàm", "Thi đấu", "Khác"].map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                  formData.eventType === type
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${errors.eventType && !formData.eventType ? "border-red-300" : ""}`}
              >
                <input
                  type="radio"
                  name="eventType"
                  value={type}
                  className="w-4 h-4 text-blue-600"
                  onChange={(e) =>
                    setFormData({ ...formData, eventType: e.target.value })
                  }
                />
                <span className="text-sm font-medium text-slate-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Tên sự kiện */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-blue-600" size={16} />
            Tên sự kiện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Workshop về AI và Machine Learning"
            className={`w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 ${
              errors.eventTitle ? "border-red-300" : "border-slate-200"
            }`}
            value={formData.eventTitle}
            onChange={(e) =>
              setFormData({ ...formData, eventTitle: e.target.value })
            }
          />
        </div>

        {/* 3. Thời gian */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="text-blue-600" size={16} />
            Thời gian <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                className={`w-full p-2.5 border-2 rounded-lg outline-none focus:border-blue-500 text-sm ${
                  errors.startTime ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Kết thúc
              </label>
              <input
                type="datetime-local"
                className={`w-full p-2.5 border-2 rounded-lg outline-none focus:border-blue-500 text-sm ${
                  errors.endTime ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* 4. Địa điểm */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MapPin className="text-emerald-600" size={16} />
            Địa điểm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Hội trường A1, Tầng 5"
            className={`w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 ${
              errors.location ? "border-red-300" : "border-slate-200"
            }`}
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>

        {/* 5. Đơn vị tổ chức */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="text-purple-600" size={16} />
            Đơn vị tổ chức <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-white border-slate-200"
            value={formData.organizer}
            onChange={(e) =>
              setFormData({ ...formData, organizer: e.target.value })
            }
          >
            <option>Khoa Công nghệ thông tin</option>
            <option>Khoa Kế toán - Kiểm toán</option>
            <option>Khoa Quản trị Kinh doanh</option>
            <option>Phòng Đào tạo</option>
            <option>Phòng CTSV</option>
          </select>
        </div>

        {/* 6. Nơi nhận */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-orange-600" size={16} />
            Nơi nhận <span className="text-red-500">*</span>
          </label>
          <div className={`space-y-2 p-3 rounded-lg ${errors.recipients ? "bg-red-50 border border-red-200" : ""}`}>
            {["Trưởng khoa", "Ban Giám hiệu", "Phòng Đào tạo", "Phòng CTSV", "Các bộ môn"].map(
              (recipient) => (
                <label
                  key={recipient}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.recipients.includes(recipient)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          recipients: [...formData.recipients, recipient],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          recipients: formData.recipients.filter(
                            (r) => r !== recipient
                          ),
                        });
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {recipient}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* 7. Đối tượng tham gia */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="text-blue-600" size={16} />
            Đối tượng tham gia <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["Sinh viên", "Giảng viên", "Cán bộ", "Khách mời"].map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                  formData.participants === type
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${errors.participants && !formData.participants ? "border-red-300" : ""}`}
              >
                <input
                  type="radio"
                  name="participants"
                  value={type}
                  className="w-4 h-4 text-blue-600"
                  onChange={(e) =>
                    setFormData({ ...formData, participants: e.target.value })
                  }
                />
                <span className="text-sm font-medium text-slate-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 8. Ngân sách dự kiến */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-green-600" size={16} />
            Ngân sách dự kiến
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Dưới 5 triệu",
              "5-10 triệu",
              "10-20 triệu",
              "20-50 triệu",
              "Trên 50 triệu",
              "Chưa xác định",
            ].map((budget) => (
              <label
                key={budget}
                className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition ${
                  formData.budget === budget
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="budget"
                  value={budget}
                  className="w-4 h-4 text-green-600"
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
                <span className="text-xs font-medium text-slate-700">
                  {budget}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 9. Ghi chú */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-slate-600" size={16} />
            Ghi chú thêm
          </label>
          <textarea
            rows="4"
            placeholder="Thông tin bổ sung về sự kiện..."
            className="w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 resize-none border-slate-200"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          ></textarea>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <div className="flex items-center gap-3">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                <Info size={16} />
                <span>{Object.keys(errors).length} lỗi cần sửa</span>
              </div>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
            >
              Tiếp tục
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};