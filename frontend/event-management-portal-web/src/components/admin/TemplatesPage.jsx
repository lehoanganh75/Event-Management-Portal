import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Edit2, Trash2, Eye, X, ChevronLeft, ChevronRight,
  Layout, CheckCircle, XCircle, AlertTriangle, Loader2, BarChart3,
  Copy, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { contentApi } from '../../api/contentApi' 

const CATEGORY_LABELS = {
  WORKSHOP: "Workshop", SEMINAR: "Hội thảo", COMPETITION: "Cuộc thi",
  TEAM_BUILDING: "Team Building", CONFERENCE: "Hội nghị",
  WEBINAR: "Webinar", OTHER: "Khác",
};

const CATEGORY_COLORS = {
  WORKSHOP: "bg-blue-100 text-blue-700",
  SEMINAR: "bg-purple-100 text-purple-700",
  COMPETITION: "bg-orange-100 text-orange-700",
  TEAM_BUILDING: "bg-green-100 text-green-700",
  CONFERENCE: "bg-indigo-100 text-indigo-700",
  WEBINAR: "bg-cyan-100 text-cyan-700",
  OTHER: "bg-slate-100 text-slate-600",
};

const ITEMS_PER_PAGE = 10;

const getOrgId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return "org-it";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.organizationId || "org-it";
  } catch { return "org-it"; }
};

const mapTemplate = (t) => ({
  ...t,
  name: t.templateName || t.name || "",
  category: t.templateType || t.type || t.category || "OTHER",
  isActive: t.isActive !== undefined ? t.isActive : true,
  usageCount: t.usageCount || 0,
  createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "—",
});

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState({ name: "", description: "", category: "WORKSHOP", isActive: true });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
  };

  const fetchTemplates = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    try {
      // Gọi qua contentApi đã gộp
      const res = await contentApi.templates.getAll(getOrgId(), search, page, ITEMS_PER_PAGE);
      
      setTemplates((res.content || []).map(mapTemplate));
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (e) {
      console.error("Lỗi fetchTemplates:", e);
      showToast("Lỗi tải dữ liệu!", "error");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(currentPage, searchTerm); }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      fetchTemplates(0, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtered = useMemo(() =>
    categoryFilter === "All" ? templates : templates.filter(t => t.category === categoryFilter),
    [templates, categoryFilter]
  );

  const openCreate = () => {
    setFormData({ name: "", description: "", category: "WORKSHOP", isActive: true });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEdit = (t) => {
    setFormData({ name: t.name, description: t.description, category: t.category, isActive: t.isActive });
    setSelectedTemplate(t);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { showToast("Tên mẫu không được để trống!", "error"); return; }
    setIsSaving(true);
    try {
      const payload = {
        templateName: formData.name,
        description: formData.description,
        templateType: formData.category,
        isActive: formData.isActive,
        organizationId: getOrgId(),
      };

      if (modalMode === "create") {
        // Dùng contentApi thay cho eventTemplateApi
        await contentApi.templates.create(payload);
        showToast("Tạo mẫu thành công!");
      } else {
        await contentApi.templates.update(selectedTemplate.id, payload);
        showToast("Cập nhật mẫu thành công!");
      }
      setIsModalOpen(false);
      fetchTemplates(currentPage);
    } catch (error) {
      showToast("Có lỗi xảy ra!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Dùng contentApi thay cho eventTemplateApi
      await contentApi.templates.delete(templateToDelete.id);
      showToast("Xóa mẫu thành công!");
      fetchTemplates(currentPage);
      setIsDeleteOpen(false);
    } catch {
      showToast("Lỗi khi xóa!", "error");
      setIsDeleteOpen(false);
    }
  };


  const stats = {
    total: totalElements,
    active: templates.filter(t => t.isActive).length,
    totalUsage: templates.reduce((s, t) => s + (t.usageCount || 0), 0),
    topUsed: [...templates].sort((a, b) => b.usageCount - a.usageCount)[0]?.name || "—",
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <button onClick={() => setToast(p => ({ ...p, show: false }))} className="cursor-pointer"><X size={16} className="text-slate-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Mẫu kế hoạch</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý các template sự kiện tái sử dụng</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer active:scale-95">
          <Plus size={18} /> Tạo mẫu mới
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng mẫu", value: stats.total, color: "blue" },
          { label: "Đang hoạt động", value: stats.active, color: "emerald" },
          { label: "Tổng lượt dùng", value: stats.totalUsage, color: "purple" },
          { label: "Dùng nhiều nhất", value: stats.topUsed, color: "orange", small: true },
        ].map(({ label, value, color, small }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className={`${small ? "text-sm" : "text-2xl"} font-black text-${color}-600 truncate`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm kiếm mẫu kế hoạch..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-medium">
            <option value="All">Tất cả loại</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Layout size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Không có mẫu nào</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Tên mẫu</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4 text-center">Lượt dùng</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.OTHER}`}>
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 size={14} className="text-blue-500" />
                        <span className="text-sm font-bold text-slate-700">{t.usageCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{t.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setViewTemplate(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Eye size={15} /></button>
                        <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Edit2 size={15} /></button>
                        <button onClick={() => { setTemplateToDelete(t); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">Trang {currentPage + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"><ChevronLeft size={16} /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)}
                  className={`w-9 h-9 rounded-xl text-xs font-black cursor-pointer ${currentPage === i ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">{modalMode === "create" ? "Tạo mẫu mới" : "Chỉnh sửa mẫu"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              </div>
              <div className="p-7 space-y-4">
                {[{ label: "Tên mẫu", field: "name", placeholder: "Nhập tên mẫu" }, { label: "Mô tả", field: "description", placeholder: "Nhập mô tả" }].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
                    <input value={formData[field] || ""} onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Loại sự kiện</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer">Hủy</button>
                <button onClick={handleSave} disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-200 disabled:opacity-60 flex items-center gap-2">
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  {modalMode === "create" ? "Tạo mẫu" : "Lưu thay đổi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && templateToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-rose-500" /></div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h2>
              <p className="text-slate-500 text-sm mb-6">Xóa mẫu <span className="font-bold text-slate-700">"{templateToDelete.name}"</span>? Mẫu đã được dùng <strong>{templateToDelete.usageCount}</strong> lần.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-100 cursor-pointer">Hủy</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer">Xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewTemplate && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewTemplate(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Chi tiết mẫu</h2>
                <button onClick={() => setViewTemplate(null)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              </div>
              <div className="p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black ${CATEGORY_COLORS[viewTemplate.category] || CATEGORY_COLORS.OTHER}`}>
                    {CATEGORY_LABELS[viewTemplate.category]}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${viewTemplate.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {viewTemplate.isActive ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-800">{viewTemplate.name}</h3>
                <p className="text-sm text-slate-600">{viewTemplate.description || "Không có mô tả"}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1"><BarChart3 size={12} /> {viewTemplate.usageCount} lượt dùng</div>
                  <div className="flex items-center gap-1"><Clock size={12} /> Tạo {viewTemplate.createdAt}</div>
                </div>
              </div>
              <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => { openEdit(viewTemplate); setViewTemplate(null); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2">
                  <Edit2 size={15} /> Chỉnh sửa
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