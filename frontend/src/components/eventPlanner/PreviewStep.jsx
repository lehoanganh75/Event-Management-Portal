import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Save,
  FileText,
  ArrowLeft,
  RefreshCw,
  Download,
  Maximize2,
  X,
  Star,
} from "lucide-react";

import { DocumentContent } from "./DocumentContent";
import { exportToWord } from "./WordExporter";
import { eventTemplateApi } from "../../api/eventTemplateApi";

export const PreviewStep = ({
  onEdit,
  onSave,
  onReset,
  onGoToStep2,
  data = {},
  isSubmitting = false,
  mode = "plan",
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportWord = async () => {
    setExporting(true);
    try {
      await exportToWord(data);
      toast.success("Xuất file Word thành công!");
    } catch (e) {
      toast.error("Xuất file thất bại: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (onGoToStep2) onGoToStep2();
    else if (onReset) onReset();
  };

  const handleSaveTemplate = async () => {
    console.log("templateId:", data.templateId);
    if (!templateName.trim()) {
      toast.warning("Vui lòng nhập tên bản mẫu!");
      return;
    }

    setSavingTemplate(true);

    try {
      const templatePayload = {
        templateName: templateName.trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        organizationId: data.organizationId || "org-it",
        defaultTitle: (data.eventTitle || data.title || "").trim(),
        defaultLocation: data.location || "",
        defaultEventMode: data.eventMode || "OFFLINE",
        defaultMaxParticipants: Number(data.maxParticipants) || 50,
        templateType: data.eventType || "OTHER",
        defaultCoverImage: data.coverImage || "",
        themes: data.themes || [],
        faculty: data.faculty || "",
        major: data.major || "",
        configData: JSON.stringify({
          programItems: data.programItems || [],
          participants: data.participants || [],
          presenters: data.presenters || [],
          organizers: data.organizers || [],
          attendees: data.attendees || [],
          targetObjects: data.targetObjects || [],
          recipients: data.recipients || [],
          customFields: data.customFields || [],
        }),
        usageCount: 0,
        isPublic: false,
      };

      const newTemplate =
        await eventTemplateApi.createTemplate(templatePayload);

      if (data?.templateId) {
        try {
          await eventTemplateApi.applyTemplate(data.templateId, "anonymous");
        } catch (e) {
          console.warn("Không tăng usage template:", e);
        }
      }

      toast.success(
        data.templateId
          ? `Đã tạo bản mẫu mới "${templateName}" thành công!`
          : `Đã lưu bản mẫu "${templateName}" thành công!`,
      );

      setShowTemplateModal(false);
      setTemplateName("");
    } catch (err) {
      toast.error(
        "Lưu bản mẫu thất bại: " + (err.message || "Lỗi không xác định"),
      );
      console.error(err);
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Xem trước văn bản
          </h1>
          <p className="text-slate-500 text-sm italic">
            Hệ thống đang mô phỏng định dạng in ấn thực tế
          </p>
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
        >
          <Maximize2 size={18} /> Phóng to toàn màn hình
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 sticky top-6">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              CÔNG CỤ QUẢN LÝ
            </p>

            <button
              onClick={() => onSave && onSave(data)}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {mode === "event" ? "Gửi phê duyệt" : "Lưu kế hoạch"}
                </>
              )}
            </button>

            <button
              onClick={handleExportWord}
              disabled={exporting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Đang xuất...
                </>
              ) : (
                <>
                  <Download size={18} /> Xuất file Word
                </>
              )}
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
            >
              <Star size={18} /> Lưu bản mẫu
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={onEdit}
              className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-slate-400 hover:text-slate-800 transition-all"
            >
              <ArrowLeft size={18} /> Quay lại sửa
            </button>

            <button
              onClick={handleReset}
              className="w-full text-rose-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
            >
              <RefreshCw size={18} /> Làm mới nội dung
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-200/50 rounded-3xl p-8 border border-slate-200 overflow-auto shadow-inner flex justify-center">
            <div className="origin-top transform-gpu">
              <DocumentContent data={data} />
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col">
          <div className="flex justify-between items-center px-8 py-4 border-b border-white/10 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText size={20} />
              </div>
              <span className="font-bold text-lg">
                Chế độ xem tập trung (A4 Mode)
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-white/10 p-2 rounded-full hover:bg-rose-500 transition-all hover:cursor-pointer"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-8 flex justify-center">
            <DocumentContent data={data} />
          </div>
          <div className="p-6 bg-white/5 border-t border-white/10 flex justify-center gap-4 flex-shrink-0">
            <button
              onClick={handleExportWord}
              disabled={exporting}
              className="px-8 py-3 bg-blue-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-60"
            >
              <Download size={20} /> {exporting ? "Đang xuất..." : "Xuất Word"}
            </button>
            <button
              onClick={() => {
                setIsFullscreen(false);
                onSave && onSave(data);
              }}
              disabled={isSubmitting}
              className="px-10 py-3 bg-emerald-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {mode === "event" ? "XÁC NHẬN GỬI" : "XÁC NHẬN LƯU"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <Star size={48} className="mx-auto text-amber-500 mb-3" />
              <h3 className="text-2xl font-bold text-slate-800">
                {data.templateId
                  ? "Áp dụng lại & tăng sử dụng"
                  : "Lưu thành bản mẫu mới"}
              </h3>
              <p className="text-slate-500 mt-2">
                {data.templateId
                  ? "Sẽ tăng số lần sử dụng bản mẫu lên 1"
                  : "Tạo bản mẫu mới để dùng lại sau này"}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tên bản mẫu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ví dụ: Hội thảo Công nghệ 2025"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Bản mẫu sẽ lưu các thông tin chính:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tiêu đề & mục đích sự kiện</li>
                  <li>Loại hình & chế độ tổ chức</li>
                  <li>Chương trình chi tiết (nếu có)</li>
                  <li>Danh sách người tham gia mẫu (nếu có)</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 py-3 border-2 border-slate-300 rounded-xl font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate || !templateName.trim()}
                  className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingTemplate ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : data.templateId ? (
                    "Áp dụng lại"
                  ) : (
                    "Lưu bản mẫu"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewStep;
