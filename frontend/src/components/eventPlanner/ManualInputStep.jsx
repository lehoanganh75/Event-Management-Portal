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
  Plus,
  X,
} from "lucide-react";

export const ManualInputStep = ({ onBack, onNext, formData: externalFormData, setFormData: setExternalFormData }) => {
  const [formData, setFormData] = useState({
    eventType: (() => {
      const map = { Workshop: "Workshop", Seminar: "Seminar", Talkshow: "Tọa đàm", Competition: "Thi đấu", Other: "Khác" };
      return map[externalFormData?.eventType] || externalFormData?.eventType || "";
    })(),
    eventTypeOther: externalFormData?.eventTypeOther || "",
    eventTitle: externalFormData?.eventTitle || externalFormData?.title || "",
    eventTopic: externalFormData?.eventTopic || "",
    eventPurpose: externalFormData?.eventPurpose || externalFormData?.description || "",
    startTime: externalFormData?.startTime || "",
    endTime: externalFormData?.endTime || "",
    registrationDeadline: externalFormData?.registrationDeadline || "",
    location: externalFormData?.location || "",
    maxParticipants: externalFormData?.maxParticipants || 0,
    organizer: externalFormData?.organizer || "Khoa Công nghệ thông tin",
    organizerUnit: externalFormData?.organizerUnit || "",
    recipients: externalFormData?.recipients || [],
    customRecipients: externalFormData?.customRecipients || [],
    participants: externalFormData?.participants || [],
    notes: externalFormData?.notes || "",
  });

  const [errors, setErrors] = useState({});
  const [newRecipient, setNewRecipient] = useState("");
  const [showAddRecipient, setShowAddRecipient] = useState(false);

  const khoaOrganizers = [
    "Khoa Công nghệ thông tin",
    "Khoa Kế toán - Kiểm toán",
    "Khoa Quản trị Kinh doanh",
  ];

  const isKhoa = khoaOrganizers.includes(formData.organizer);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventType) newErrors.eventType = true;
    if (formData.eventType === "Khác" && !formData.eventTypeOther)
      newErrors.eventTypeOther = true;
    if (!formData.eventTitle) newErrors.eventTitle = true;
    if (!formData.eventPurpose) newErrors.eventPurpose = true;
    if (!formData.startTime) newErrors.startTime = true;
    if (!formData.endTime) newErrors.endTime = true;
    if (!formData.location) newErrors.location = true;
    if (
      formData.recipients.length === 0 &&
      formData.customRecipients.length === 0
    )
      newErrors.recipients = true;
    if (formData.participants.length === 0) newErrors.participants = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const toggleParticipant = (type) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(type)
        ? prev.participants.filter((p) => p !== type)
        : [...prev.participants, type],
    }));
  };

  const addCustomRecipient = () => {
    const trimmed = newRecipient.trim();
    if (trimmed && !formData.customRecipients.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        customRecipients: [...prev.customRecipients, trimmed],
      }));
    }
    setNewRecipient("");
    setShowAddRecipient(false);
  };

  const removeCustomRecipient = (r) => {
    setFormData((prev) => ({
      ...prev,
      customRecipients: prev.customRecipients.filter((x) => x !== r),
    }));
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
        {externalFormData?.templateName && externalFormData?.templateId !== "0" && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg w-fit">
            <FileText className="text-blue-500" size={14} />
            <span className="text-xs font-semibold text-blue-700">
              Đang dùng mẫu: {externalFormData.templateName}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 space-y-6">

        {/* 1. Loại sự kiện */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-blue-600" size={16} />
            Loại sự kiện <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Hội thảo",
              "Workshop",
              "Seminar",
              "Tọa đàm",
              "Thi đấu",
              "Khác",
            ].map((type) => (
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
                  checked={formData.eventType === type}
                  className="w-4 h-4 text-blue-600"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventType: e.target.value,
                      eventTypeOther: "",
                    })
                  }
                />
                <span className="text-sm font-medium text-slate-700">
                  {type}
                </span>
              </label>
            ))}
          </div>
          {formData.eventType === "Khác" && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Nhập loại sự kiện..."
                className={`w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 ${
                  errors.eventTypeOther ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.eventTypeOther}
                onChange={(e) =>
                  setFormData({ ...formData, eventTypeOther: e.target.value })
                }
              />
              {errors.eventTypeOther && (
                <p className="text-red-500 text-xs mt-1">
                  Vui lòng nhập loại sự kiện
                </p>
              )}
            </div>
          )}
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

        {/* 3. Chủ đề sự kiện */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-indigo-600" size={16} />
            Chủ đề sự kiện
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Ứng dụng AI trong giáo dục đại học"
            className="w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 border-slate-200"
            value={formData.eventTopic}
            onChange={(e) =>
              setFormData({ ...formData, eventTopic: e.target.value })
            }
          />
        </div>

        {/* 4. Mục đích tổ chức */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-rose-600" size={16} />
            Mục đích tổ chức <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            placeholder="Mô tả mục tiêu và lý do tổ chức sự kiện..."
            className={`w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 resize-none ${
              errors.eventPurpose ? "border-red-300" : "border-slate-200"
            }`}
            value={formData.eventPurpose}
            onChange={(e) =>
              setFormData({ ...formData, eventPurpose: e.target.value })
            }
          />
          {errors.eventPurpose && (
            <p className="text-red-500 text-xs mt-1">
              Vui lòng nhập mục đích tổ chức
            </p>
          )}
        </div>

        {/* 5. Đối tượng tham gia */}
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
                  formData.participants.includes(type)
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${errors.participants && formData.participants.length === 0 ? "border-red-300" : ""}`}
              >
                <input
                  type="checkbox"
                  value={type}
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={formData.participants.includes(type)}
                  onChange={() => toggleParticipant(type)}
                />
                <span className="text-sm font-medium text-slate-700">
                  {type}
                </span>
              </label>
            ))}
          </div>
          {errors.participants && formData.participants.length === 0 && (
            <p className="text-red-500 text-xs">
              Vui lòng chọn ít nhất một đối tượng tham gia
            </p>
          )}
        </div>

        {/* 6. Thời gian */}
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

        {/* Hạn đăng ký */}
        <div className="space-y-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Calendar className="text-blue-600" size={16} />
            Hạn chót đăng ký <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={`w-full p-2.5 border-2 rounded-lg outline-none focus:border-blue-500 text-sm bg-white ${
              errors.registrationDeadline ? "border-red-300" : "border-slate-200"
            }`}
            value={formData.registrationDeadline}
            onChange={(e) =>
              setFormData({ ...formData, registrationDeadline: e.target.value })
            }
          />
          <p className="text-[10px] text-slate-500 italic">
            * Sau thời gian này, hệ thống sẽ tự động khóa form đăng ký.
          </p>
        </div>

        {/* Số lượng */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="text-blue-600" size={16} />
            Số lượng người tham dự tối đa{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              placeholder="Ví dụ: 30"
              className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
              value={formData.maxParticipants || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxParticipants: parseInt(e.target.value) || 0,
                })
              }
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              Người
            </span>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Hệ thống sẽ tự động đóng đăng ký khi đạt giới hạn này.
          </p>
        </div>

        {/* 7. Địa điểm */}
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

        {/* 8. Đơn vị tổ chức */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="text-purple-600" size={16} />
            Đơn vị tổ chức <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-white border-slate-200"
            value={formData.organizer}
            onChange={(e) =>
              setFormData({
                ...formData,
                organizer: e.target.value,
                organizerUnit: "",
              })
            }
          >
            <option>Khoa Công nghệ thông tin</option>
            <option>Khoa Kế toán - Kiểm toán</option>
            <option>Khoa Quản trị Kinh doanh</option>
            <option>Phòng Đào tạo</option>
            <option>Phòng CTSV</option>
          </select>

          {isKhoa && (
            <div className="mt-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Bộ môn / Chuyên ngành (nếu có)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bộ môn Kỹ thuật phần mềm"
                className="w-full p-3 border-2 rounded-lg text-sm outline-none focus:border-purple-500 border-slate-200 bg-purple-50"
                value={formData.organizerUnit}
                onChange={(e) =>
                  setFormData({ ...formData, organizerUnit: e.target.value })
                }
              />
            </div>
          )}
        </div>

        {/* 9. Nơi nhận */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="text-orange-600" size={16} />
            Nơi nhận <span className="text-red-500">*</span>
          </label>
          <div
            className={`space-y-2 p-3 rounded-lg ${errors.recipients ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}
          >
            {[
              "Trưởng khoa",
              "Ban Giám hiệu",
              "Phòng Đào tạo",
              "Phòng CTSV",
              "Các bộ môn",
            ].map((recipient) => (
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
                          (r) => r !== recipient,
                        ),
                      });
                    }
                  }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {recipient}
                </span>
              </label>
            ))}

            {formData.customRecipients.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked
                  readOnly
                />
                <span className="text-sm font-medium text-slate-700 flex-1">
                  {r}
                </span>
                <button
                  onClick={() => removeCustomRecipient(r)}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {showAddRecipient ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nhập nơi nhận mới..."
                  className="flex-1 p-2 border-2 border-blue-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomRecipient()}
                  autoFocus
                />
                <button
                  onClick={addCustomRecipient}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Thêm
                </button>
                <button
                  onClick={() => {
                    setShowAddRecipient(false);
                    setNewRecipient("");
                  }}
                  className="px-3 py-2 border-2 border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddRecipient(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 transition"
              >
                <Plus size={15} />
                Thêm nơi nhận khác
              </button>
            )}
          </div>
        </div>

        {/* 11. Ghi chú */}
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