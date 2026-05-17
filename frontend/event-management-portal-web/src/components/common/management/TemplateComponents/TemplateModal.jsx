import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Plus, X, Tag, Layers, Users, Globe, FileText, MapPin, Settings, CheckCircle2, Lock, Save, Loader2, Info } from "lucide-react";

/* ================= COMPONENT: INFO ROW ================= */
const InfoRow = ({ label, value, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-600 bg-slate-50",
    rose: "text-rose-600 bg-rose-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${colors[color] || colors.blue}`}>
        <Icon size={16} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-800 truncate">{value || "Chưa cập nhật"}</span>
      </div>
    </div>
  );
};

/* ================= COMPONENT: SECTION ================= */
const Section = ({ title, icon: Icon, children, color = "blue" }) => {
  const titleColors = {
    blue: "text-blue-700",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    slate: "text-slate-700",
    purple: "text-purple-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Icon size={18} className={titleColors[color] || titleColors.blue} />
        <h3 className={`text-sm font-bold ${titleColors[color] || titleColors.blue}`}>
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

const TemplateModal = ({
  isModalOpen,
  closeModal,
  modalMode,
  selectedTemplate,
  setSelectedTemplate,
  handleSave,
  isSaving,
  EVENT_TYPE_OPTIONS
}) => {
  if (!selectedTemplate) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* MODAL HEADER */}
            <div className="px-6 py-5 flex justify-between items-center bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${modalMode === "view" ? "bg-blue-600" : "bg-amber-600"}`}>
                  {modalMode === "view" ? <Eye size={20} /> : (modalMode === "edit" ? <Pencil size={20} /> : <Plus size={20} />)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {modalMode === "view" ? "Chi tiết mẫu" : (modalMode === "edit" ? "Chỉnh sửa mẫu" : "Tạo mẫu mới")}
                  </h2>
                  <p className="text-xs text-gray-500">Cấu hình thông tin sự kiện mẫu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
              <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto">
                {modalMode === "view" ? (
                  /* VIEW MODE */
                  <div className="space-y-8">
                    <Section title="Thông tin cơ bản" icon={Info} color="blue">
                      <InfoRow label="Tên mẫu" value={selectedTemplate.templateName} icon={Tag} />
                      <InfoRow label="Loại sự kiện" value={EVENT_TYPE_OPTIONS[selectedTemplate.templateType]} icon={Layers} color="purple" />
                      <InfoRow label="Khoa/Đơn vị" value={selectedTemplate.faculty} icon={Users} color="emerald" />
                      <InfoRow label="Phạm vi" value={selectedTemplate.public ? "Công khai" : "Nội bộ"} icon={Globe} color="amber" />
                    </Section>

                    <Section title="Mô tả mẫu" icon={FileText} color="slate">
                      <div className="col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
                        {selectedTemplate.description || "Không có mô tả chi tiết."}
                      </div>
                    </Section>

                    <Section title="Thiết lập sự kiện mặc định" icon={Settings} color="amber">
                      <InfoRow label="Tiêu đề gợi ý" value={selectedTemplate.defaultTitle} icon={FileText} color="blue" />
                      <InfoRow label="Địa điểm mặc định" value={selectedTemplate.defaultLocation} icon={MapPin} color="rose" />
                      <InfoRow label="Hình thức" value={selectedTemplate.defaultEventMode} icon={Globe} color="purple" />
                      <InfoRow label="Số người tối đa" value={selectedTemplate.defaultMaxParticipants} icon={Users} color="emerald" />
                    </Section>

                    <Section title="Cấu hình hệ thống" icon={Settings} color="emerald">
                      <div className="flex flex-col sm:flex-row gap-4 col-span-2">
                        <div className={`flex-1 p-4 rounded-xl border ${selectedTemplate.configData?.certificate ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${selectedTemplate.configData?.certificate ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-0.5">Chứng chỉ</p>
                              <p className={`text-sm font-bold ${selectedTemplate.configData?.certificate ? 'text-emerald-700' : 'text-gray-600'}`}>
                                {selectedTemplate.configData?.certificate ? 'Có cấp chứng chỉ' : 'Không có'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={`flex-1 p-4 rounded-xl border ${selectedTemplate.configData?.requireApproval ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${selectedTemplate.configData?.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`}>
                              {selectedTemplate.configData?.requireApproval ? <Settings size={16} /> : <CheckCircle2 size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-0.5">Duyệt đăng ký</p>
                              <p className={`text-sm font-bold ${selectedTemplate.configData?.requireApproval ? 'text-amber-700' : 'text-blue-700'}`}>
                                {selectedTemplate.configData?.requireApproval ? 'Thủ công' : 'Tự động'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Section>
                  </div>
                ) : (
                  /* EDIT / CREATE MODE */
                  <div className="space-y-8">
                    <Section title="Thông tin chung" icon={Info} color="blue">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Tên mẫu kế hoạch <span className="text-red-500">*</span></label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-medium text-gray-800"
                          placeholder="Ví dụ: Mẫu workshop học thuật"
                          value={selectedTemplate.templateName}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, templateName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Loại sự kiện</label>
                        <select
                          className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-medium text-gray-800"
                          value={selectedTemplate.templateType}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, templateType: e.target.value })}
                        >
                          {Object.entries(EVENT_TYPE_OPTIONS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Khoa / Đơn vị</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-medium text-gray-800"
                          placeholder="Ví dụ: CNTT, FME..."
                          value={selectedTemplate.faculty}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, faculty: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Phạm vi mẫu</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate({ ...selectedTemplate, public: true })}
                            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors border ${selectedTemplate.public ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                          >
                            Công khai
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate({ ...selectedTemplate, public: false })}
                            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors border ${!selectedTemplate.public ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                          >
                            Nội bộ
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Mô tả tóm tắt</label>
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-medium text-gray-800 resize-none"
                          placeholder="Mô tả mục đích của mẫu kế hoạch này..."
                          value={selectedTemplate.description}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                        />
                      </div>
                    </Section>

                    <Section title="Giá trị mặc định cho sự kiện" icon={FileText} color="amber">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-amber-700">Tiêu đề sự kiện mặc định</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-sm font-medium text-gray-800"
                          placeholder="Tên sự kiện khi áp dụng mẫu"
                          value={selectedTemplate.defaultTitle}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-amber-700">Địa điểm</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-sm font-medium text-gray-800"
                          placeholder="Vị trí mặc định"
                          value={selectedTemplate.defaultLocation}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultLocation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-amber-700">Số người tối đa</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-sm font-medium text-gray-800"
                          value={selectedTemplate.defaultMaxParticipants}
                          onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultMaxParticipants: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </Section>

                    <Section title="Cấu hình nâng cao" icon={Settings} color="emerald">
                      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate({
                            ...selectedTemplate,
                            configData: { ...selectedTemplate.configData, certificate: !selectedTemplate.configData.certificate }
                          })}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedTemplate.configData.certificate ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${selectedTemplate.configData.certificate ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <span className={`text-sm font-semibold ${selectedTemplate.configData.certificate ? 'text-emerald-700' : 'text-gray-600'}`}>Cấp chứng chỉ</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${selectedTemplate.configData.certificate ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedTemplate.configData.certificate ? 'right-1' : 'left-1'}`} />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTemplate({
                            ...selectedTemplate,
                            configData: { ...selectedTemplate.configData, requireApproval: !selectedTemplate.configData.requireApproval }
                          })}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedTemplate.configData.requireApproval ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${selectedTemplate.configData.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`}>
                              {selectedTemplate.configData.requireApproval ? <Lock size={16} /> : <CheckCircle2 size={16} />}
                            </div>
                            <span className={`text-sm font-semibold ${selectedTemplate.configData.requireApproval ? 'text-amber-700' : 'text-blue-700'}`}>Duyệt thủ công</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${selectedTemplate.configData.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedTemplate.configData.requireApproval ? 'right-1' : 'left-1'}`} />
                          </div>
                        </button>
                      </div>
                    </Section>
                  </div>
                )}

                {/* MODAL FOOTER */}
                <div className="pt-6 flex justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-transparent"
                  >
                    Đóng
                  </button>
                  {modalMode !== "view" && (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Lưu Mẫu Kế Hoạch
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplateModal;
