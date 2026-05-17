import React, { useState, useEffect, useMemo, useCallback } from "react";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";
import TemplatesHeader from "./TemplateComponents/TemplatesHeader";
import TemplatesTable from "./TemplateComponents/TemplatesTable";
import TemplateModal from "./TemplateComponents/TemplateModal";
import DeleteConfirmModal from "./TemplateComponents/DeleteConfirmModal";

const TemplatesManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;

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
      const matchTab = 
        activeTab === "Tất cả" || 
        (activeTab === "Công khai" && t.public) || 
        (activeTab === "Nội bộ" && !t.public) ||
        (activeTab === "Của bản thân" && t.createdByAccountId === currentUserId);
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
      <TemplatesHeader 
        templates={templates}
        openModal={openModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        EVENT_TYPE_OPTIONS={EVENT_TYPE_OPTIONS}
        currentUserId={currentUserId}
      />

      <TemplatesTable 
        loading={loading}
        currentTemplates={currentTemplates}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        openModal={openModal}
        setTemplateToDelete={setTemplateToDelete}
        currentUserId={currentUserId}
      />

      <TemplateModal 
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        modalMode={modalMode}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        handleSave={handleSave}
        isSaving={isSaving}
        EVENT_TYPE_OPTIONS={EVENT_TYPE_OPTIONS}
      />

      <DeleteConfirmModal 
        templateToDelete={templateToDelete}
        setTemplateToDelete={setTemplateToDelete}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TemplatesManagement;
