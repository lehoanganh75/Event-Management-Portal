import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PlusCircle, Search, Loader2, Star, TrendingUp, ChevronRight, FileText, CheckCircle2,
  Calendar, MapPin, Users
} from "lucide-react";
import eventService from "../../services/eventService";

const mapTemplateToPrefill = (template) => {
  // Build AI-suggested sessions from configData if available
  const sessions = template.configData?.sessions || [];
  const presenters = template.configData?.presenters || [];
  const targetObjects = template.configData?.targetObjects || 
    (template.faculty ? [{ type: 'FACULTY', name: template.faculty }] : []);

  return {
    // Template metadata
    templateId: template.id,
    _templateName: template.templateName,

    // Basic info from template
    eventTitle: template.defaultTitle || "",
    title: template.defaultTitle || "",
    description: template.description || "",
    eventPurpose: template.description || "",
    eventTopic: template.themes?.join(", ") || "",
    themes: template.themes || [],

    // Location & logistics
    location: template.defaultLocation || "",
    eventMode: template.defaultEventMode || "OFFLINE",
    maxParticipants: template.defaultMaxParticipants || 50,

    // IUH specific
    faculty: template.faculty || "",
    major: template.major || "",

    // Cover
    coverImage: template.defaultCoverImage || "",

    // Prefilled structured data
    sessions: sessions.map((s, i) => ({
      title: s.title || "",
      type: s.type || "KEYNOTE",
      description: s.description || "",
      room: s.room || "",
      startTime: "",
      endTime: "",
      orderIndex: i + 1,
    })),

    presenters: presenters.map((p, i) => ({
      fullName: p.fullName || p.name || "",
      email: p.email || "",
      position: p.position || "",
      department: p.department || template.faculty || "",
      bio: p.bio || "",
      session: "",
    })),

    targetObjects: targetObjects,
    recipients: template.configData?.recipients || [],
    notes: template.configData?.notes || "",
    additionalInfo: template.configData?.additionalInfo || "",

    // Config
    hasLuckyDraw: template.configData?.hasLuckyDraw || false,
    interactionSettings: template.configData?.interactionSettings || {
      enableQA: false,
      enablePolls: false,
      allowUserQuestions: false,
    },
  };
};

const CreateEventModal = ({ isOpen, onClose, onSelectPlan, onCreateNew }) => {
  const [templates, setTemplates] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchTemplates = async () => {
    setFetching(true);
    try {
      // getAllTemplatesGlobal returns paged result with isStarred per user
      const data = await eventService.getAllTemplates(null, '', { page: 0, size: 100, sortBy: 'usageCount', direction: 'desc' });
      const list = Array.isArray(data?.content) ? data.content
                  : Array.isArray(data) ? data
                  : [];
      setTemplates(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách mẫu:", error);
      setTemplates([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSelected(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleToggleStar = async (e, t) => {
    e.stopPropagation();
    try {
      await eventService.toggleTemplateStar(t.id);
      await fetchTemplates();
    } catch (err) {
      console.error("Lỗi khi đánh dấu sao:", err);
    }
  };

  const sortedTemplates = useMemo(() => {
    let filtered = templates.filter((p) =>
      p.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.defaultTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Ưu tiên: isStarred -> usageCount giảm dần
    return filtered.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
  }, [templates, searchTerm]);

  const maxUsage = Math.max(...templates.map(t => t.usageCount || 0), 1); // Avoid 0

  const handleNext = async () => {
    if (selected) {
      try {
        await eventService.incrementTemplateUsage(selected.id);
      } catch (err) {
        console.error("Lỗi khi tăng lượt dùng mẫu:", err);
      }
      onSelectPlan({ fromPlan: false, initialFormData: mapTemplateToPrefill(selected) });
    } else {
      onCreateNew({ fromPlan: false, initialFormData: {} });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={18} />
          </button>

          <div className="p-8 pb-4 shrink-0 border-b border-gray-100">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Tạo kế hoạch mới</h2>
            <p className="text-slate-500 text-sm mb-6">
              Bạn có thể bắt đầu từ một mẫu có sẵn hoặc tạo trống từ đầu.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => { setSelected(null); handleNext(); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold transition-all"
              >
                <PlusCircle size={18} /> Tạo trống
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu kế hoạch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-8 pt-4 overflow-y-auto custom-scrollbar bg-slate-50">
            {fetching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : sortedTemplates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Không tìm thấy mẫu phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTemplates.map((template) => {
                  const isSelected = selected?.id === template.id;
                  const isPopular = (template.usageCount || 0) === maxUsage && maxUsage > 0;

                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelected(template)}
                      className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Star Toggle */}
                      <div 
                        onClick={(e) => handleToggleStar(e, template)}
                        className={`absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer z-10 ${
                          template.isStarred ? "text-amber-400 bg-amber-50 hover:bg-amber-100" : "text-gray-300 hover:bg-gray-100 hover:text-amber-400"
                        }`}
                      >
                        <Star size={18} fill={template.isStarred ? "currentColor" : "none"} />
                      </div>

                      <div className="flex items-start justify-between pr-8 mb-2">
                        <span className={`font-black text-base line-clamp-2 ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                          {template.templateName}
                        </span>
                      </div>

                      {isPopular && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider mb-3">
                          <TrendingUp size={10} /> Phổ biến nhất
                        </span>
                      )}

                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {template.description || "Không có mô tả."}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <Users size={12} className="text-emerald-500" />
                          {template.defaultMaxParticipants || 0} người
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <CheckCircle2 size={12} className="text-blue-500" />
                          {template.usageCount || 0} lượt dùng
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white shrink-0">
            <span className="text-sm font-medium text-slate-500">
              {selected ? `Đã chọn: ${selected.templateName}` : "Chưa chọn mẫu nào"}
            </span>
            <button
              disabled={!selected}
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
            >
              Tiếp tục <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateEventModal;
