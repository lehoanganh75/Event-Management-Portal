import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Search, BarChart3, ChevronLeft, ChevronRight, Loader2, Eye, X,
  Globe, Lock, Users, MapPin, Layers, Settings, Tag, Calendar,
  FileText, CheckCircle2, Info, Pencil, Trash2, Save, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

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
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors[color] || colors.blue}`}>
        <Icon size={16} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-slate-700 truncate">{value || "Chưa cập nhật"}</span>
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
        <Icon size={14} className={titleColors[color] || titleColors.blue} />
        <h3 className={`text-xs font-black uppercase tracking-widest ${titleColors[color] || titleColors.blue}`}>
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
};

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");

  /* --- Modal States --- */
  const [modalMode, setModalMode] = useState("view"); // view, edit, create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const ITEMS_PER_PAGE = 8;

  const EVENT_TYPE_OPTIONS = {
    SEMINAR: "Hội thảo",
    WORKSHOP: "Workshop",
    CONTEST: "Cuộc thi",
    OTHER: "Khác",
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách mẫu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = (t.templateName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.defaultTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "all" || t.templateType === typeFilter;
      const matchTab = activeTab === "Tất cả" || (activeTab === "Công khai" && t.public) || (activeTab === "Nội bộ" && !t.public);
      return matchSearch && matchType && matchTab;
    });
  }, [templates, searchTerm, typeFilter, activeTab]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const currentTemplates = filteredTemplates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ================= HANDLERS ================= */
  const openModal = (template = null, mode = "view") => {
    setModalMode(mode);
    if (template) {
      setSelectedTemplate({
        ...template,
        configData: template.configData || { certificate: false, requireApproval: false }
      });
    } else {
      setSelectedTemplate({
        templateName: "",
        description: "",
        templateType: "OTHER",
        faculty: "CNTT",
        defaultTitle: "",
        defaultLocation: "",
        defaultEventMode: "OFFLINE",
        defaultMaxParticipants: 100,
        public: true,
        configData: { certificate: false, requireApproval: false },
        themes: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedTemplate.templateName) {
      toast.warning("Vui lòng nhập tên mẫu");
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === "edit") {
        await eventService.updateTemplate(selectedTemplate.id, selectedTemplate);
        toast.success("Cập nhật mẫu thành công");
      } else {
        await eventService.createTemplate(selectedTemplate);
        toast.success("Tạo mẫu mới thành công");
      }
      fetchTemplates();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu mẫu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      await eventService.deleteTemplate(templateToDelete.id);
      toast.success("Đã xóa mẫu kế hoạch");
      fetchTemplates();
      setTemplateToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa mẫu");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-left font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Mẫu kế hoạch</h1>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Quản lý cấu hình mẫu sự kiện</p>
          </div>
        </div>
        <button
          onClick={() => openModal(null, "create")}
          className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          TẠO MẪU MỚI
        </button>
      </div>

      {/* TABS (Styled like AccountsPage) */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Layers, count: templates.length },
          { id: "Công khai", label: "Công khai", icon: Globe, count: templates.filter(t => t.public).length },
          { id: "Nội bộ", label: "Nội bộ", icon: Lock, count: templates.filter(t => !t.public).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
            placeholder="Tìm kiếm mẫu kế hoạch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-100 bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 focus:outline-none min-w-[180px] cursor-pointer"
        >
          <option value="all">Tất cả loại sự kiện</option>
          {Object.entries(EVENT_TYPE_OPTIONS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-3 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-600">Thông tin mẫu</th>
                  <th className="p-4 text-left font-medium text-gray-600">Thiết lập mặc định</th>
                  <th className="p-4 text-left font-medium text-gray-600">Hệ thống</th>
                  <th className="p-4 text-center font-medium text-gray-600">Thống kê</th>
                  <th className="p-4 text-right font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-800">{t.templateName}</span>
                        <p className="text-xs text-gray-500 line-clamp-1">{t.description || "Không có mô tả"}</p>
                        <div className="mt-1">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                            {t.faculty || "CHUNG"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <FileText size={14} className="text-blue-500" />
                          <span className="truncate max-w-[150px]">{t.defaultTitle || "Sự kiện mẫu"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <MapPin size={14} className="text-rose-500" />
                          {t.defaultLocation || "Trực tuyến"}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {t.public ?
                          <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                            <Globe size={12} /> Công khai
                          </span> :
                          <span className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium bg-gray-100 w-fit px-2 py-0.5 rounded-full">
                            <Lock size={12} /> Nội bộ
                          </span>
                        }
                        <div className="flex gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${t.configData?.certificate ? 'bg-emerald-500' : 'bg-gray-300'}`} title="Chứng chỉ" />
                          <div className={`w-2 h-2 rounded-full ${t.configData?.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`} title="Phê duyệt" />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <BarChart3 size={16} className="text-blue-600" /> {t.usageCount || 0}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openModal(t, "view")}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openModal(t, "edit")}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-amber-600 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => setTemplateToDelete(t)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-rose-600 transition-all"
                          title="Xóa mẫu"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${currentPage === num
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 hover:bg-gray-50"
                }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL: VIEW / EDIT / CREATE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col"
            >
              {/* MODAL HEADER */}
              <div className="px-10 py-8 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl ${modalMode === "view" ? "bg-blue-600 shadow-blue-100" : "bg-amber-600 shadow-amber-100"
                    }`}>
                    {modalMode === "view" ? <Eye size={28} /> : (modalMode === "edit" ? <Pencil size={28} /> : <Plus size={28} />)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      {modalMode === "view" ? "Chi tiết mẫu" : (modalMode === "edit" ? "Chỉnh sửa mẫu" : "Tạo mẫu mới")}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Cấu hình thông tin sự kiện mẫu</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-slate-800 hover:shadow-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto px-10 py-10">
                <form onSubmit={handleSave} className="space-y-10">
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
                        <div className="col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
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
                        <div className="flex gap-4 col-span-2">
                          <div className={`flex-1 p-5 rounded-[2rem] border transition-all ${selectedTemplate.configData?.certificate ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 grayscale opacity-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTemplate.configData?.certificate ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                                <CheckCircle2 size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Chứng chỉ</p>
                                <p className={`text-sm font-black uppercase ${selectedTemplate.configData?.certificate ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {selectedTemplate.configData?.certificate ? 'CÓ CẤP CHỨNG CHỈ' : 'KHÔNG CHỨNG CHỈ'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className={`flex-1 p-5 rounded-[2rem] border transition-all ${selectedTemplate.configData?.requireApproval ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${selectedTemplate.configData?.requireApproval ? 'bg-amber-500 shadow-amber-100' : 'bg-blue-500 shadow-blue-100'}`}>
                                {selectedTemplate.configData?.requireApproval ? <Settings size={18} /> : <CheckCircle2 size={18} />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duyệt đăng ký</p>
                                <p className={`text-sm font-black uppercase ${selectedTemplate.configData?.requireApproval ? 'text-amber-700' : 'text-blue-700'}`}>
                                  {selectedTemplate.configData?.requireApproval ? 'DUYỆT THỦ CÔNG' : 'DUYỆT TỰ ĐỘNG'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Section>
                    </div>
                  ) : (
                    /* EDIT / CREATE MODE */
                    <div className="space-y-10">
                      <Section title="Thông tin chung" icon={Info} color="blue">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên mẫu kế hoạch *</label>
                          <input
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                            placeholder="Ví dụ: Mẫu workshop học thuật"
                            value={selectedTemplate.templateName}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, templateName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại sự kiện</label>
                          <select
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                            value={selectedTemplate.templateType}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, templateType: e.target.value })}
                          >
                            {Object.entries(EVENT_TYPE_OPTIONS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khoa / Đơn vị</label>
                          <input
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                            placeholder="Ví dụ: CNTT, FME..."
                            value={selectedTemplate.faculty}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, faculty: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phạm vi mẫu</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTemplate({ ...selectedTemplate, public: true })}
                              className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all ${selectedTemplate.public ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                            >
                              CÔNG KHAI
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTemplate({ ...selectedTemplate, public: false })}
                              className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all ${!selectedTemplate.public ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                            >
                              NỘI BỘ
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả tóm tắt</label>
                          <textarea
                            rows={3}
                            className="w-full px-5 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-medium text-slate-600 resize-none"
                            placeholder="Mô tả mục đích của mẫu kế hoạch này..."
                            value={selectedTemplate.description}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                          />
                        </div>
                      </Section>

                      <Section title="Giá trị mặc định cho sự kiện" icon={FileText} color="amber">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-amber-600">Tiêu đề sự kiện mặc định</label>
                          <input
                            className="w-full px-5 py-3.5 rounded-2xl bg-amber-50/30 border border-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all font-bold text-slate-700"
                            placeholder="Tên sự kiện khi áp dụng mẫu"
                            value={selectedTemplate.defaultTitle}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-amber-600">Địa điểm</label>
                          <input
                            className="w-full px-5 py-3.5 rounded-2xl bg-amber-50/30 border border-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all font-bold text-slate-700"
                            placeholder="Vị trí mặc định"
                            value={selectedTemplate.defaultLocation}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultLocation: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-amber-600">Số người tối đa</label>
                          <input
                            type="number"
                            className="w-full px-5 py-3.5 rounded-2xl bg-amber-50/30 border border-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all font-bold text-slate-700"
                            value={selectedTemplate.defaultMaxParticipants}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, defaultMaxParticipants: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </Section>

                      <Section title="Cấu hình nâng cao" icon={Settings} color="emerald">
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate({
                              ...selectedTemplate,
                              configData: { ...selectedTemplate.configData, certificate: !selectedTemplate.configData.certificate }
                            })}
                            className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${selectedTemplate.configData.certificate ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTemplate.configData.certificate ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <CheckCircle2 size={18} />
                              </div>
                              <span className={`text-xs font-black uppercase tracking-wider ${selectedTemplate.configData.certificate ? 'text-emerald-700' : 'text-slate-400'}`}>Cấp chứng chỉ</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-all ${selectedTemplate.configData.certificate ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedTemplate.configData.certificate ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTemplate({
                              ...selectedTemplate,
                              configData: { ...selectedTemplate.configData, requireApproval: !selectedTemplate.configData.requireApproval }
                            })}
                            className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${selectedTemplate.configData.requireApproval ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedTemplate.configData.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                {selectedTemplate.configData.requireApproval ? <Lock size={18} /> : <CheckCircle2 size={18} />}
                              </div>
                              <span className={`text-xs font-black uppercase tracking-wider ${selectedTemplate.configData.requireApproval ? 'text-amber-700' : 'text-blue-700'}`}>Duyệt thủ công</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-all ${selectedTemplate.configData.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedTemplate.configData.requireApproval ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>
                        </div>
                      </Section>
                    </div>
                  )}

                  {/* MODAL FOOTER */}
                  <div className="pt-8 flex justify-end gap-3 border-t border-slate-100 mt-10">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      ĐÓNG
                    </button>
                    {modalMode !== "view" && (
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        LƯU MẪU KẾ HOẠCH
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {templateToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTemplateToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Xác nhận xóa mẫu?</h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                Bạn đang thực hiện xóa mẫu <span className="text-slate-800 font-black">"{templateToDelete.templateName}"</span>. Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTemplateToDelete(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  HỦY BỎ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "XÁC NHẬN XÓA"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatesPage;
