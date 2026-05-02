import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PlusCircle, Search, Loader2, Star, TrendingUp, ChevronRight, FileText, CheckCircle2,
  Calendar, MapPin, Users, Sparkles
} from "lucide-react";
import eventService from "../../services/eventService";
import PromptModal from "../common/PromptModal";

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

const CreateEventModal = ({ isOpen, onClose, onSelectPlan, onCreateNew, initialAiText = "" }) => {
  const [templates, setTemplates] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);

  useEffect(() => {
    if (isOpen && initialAiText) {
      setAiText(initialAiText);
      setShowAiInput(true);
      handleAIRecommend(initialAiText);
    }
  }, [isOpen, initialAiText]);

  const handleAIRecommend = async (text = aiText) => {
    if (!text.trim()) return;
    setIsRecommending(true);
    try {
      const recommended = await eventService.recommendTemplates(text);
      if (recommended && recommended.length > 0) {
        setTemplates(recommended);
        // Toast success if needed
      }
    } catch (error) {
      console.error("Lỗi khi AI gợi ý mẫu:", error);
    } finally {
      setIsRecommending(false);
    }
  };

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

  const [isAIPlanning, setIsAIPlanning] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showAiInput, setShowAiInput] = useState(false); // For raw text planning
  
  // AI Prompt Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);

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

  const handleAIPlanFromTemplate = () => {
    if (!selected) return;
    setShowPromptModal(true);
  };

  const confirmAIPlanFromTemplate = async (userContext) => {
    setShowPromptModal(false);
    setIsAIPlanning(true);
    try {
      const res = await eventService.aiPlanning.generateFromTemplate(selected.id, userContext);
      
      if (res.data?.code === 1000) {
        const suggestion = res.data.result;
        // Map suggestion to form data
        const mappedData = {
          ...mapTemplateToPrefill(selected),
          eventTitle: suggestion.title || selected.defaultTitle,
          title: suggestion.title || selected.defaultTitle,
          eventPurpose: suggestion.purpose || selected.description,
          description: suggestion.description || selected.description,
          eventTopic: suggestion.subject || "",
          location: suggestion.suggestedLocation || selected.defaultLocation,
          maxParticipants: suggestion.estimatedParticipants || selected.defaultMaxParticipants,
          sessions: suggestion.programItems?.map((item, idx) => ({
            title: item.title,
            description: item.description,
            durationMinutes: item.durationMinutes,
            startTime: item.startTime,
            endTime: item.endTime,
            speaker: item.speaker,
            room: item.location,
            orderIndex: idx + 1
          })) || [],
          aiReasoning: suggestion.reasoning || ""
        };

        if (suggestion.suggestedStartTime) {
          mappedData.startTime = new Date(suggestion.suggestedStartTime).toISOString().slice(0, 16);
        }
        if (suggestion.suggestedEndTime) {
          mappedData.endTime = new Date(suggestion.suggestedEndTime).toISOString().slice(0, 16);
        }

        onSelectPlan({ fromPlan: false, initialFormData: mappedData, startAtStep: 1 });
        onClose();
      }
    } catch (err) {
      console.error("AI Planning Error:", err);
    } finally {
      setIsAIPlanning(false);
    }
  };

  const handleAIPlanFromRaw = async () => {
    if (!aiText.trim()) return;
    setIsAIPlanning(true);
    try {
      const res = await eventService.aiPlanning.generateFromRawText(aiText);
      if (res.data?.code === 1000 && res.data.result) {
        const suggestion = res.data.result;
        const mappedData = {
          eventTitle: suggestion.title || "",
          title: suggestion.title || "",
          eventPurpose: suggestion.purpose || "",
          description: suggestion.description || "",
          eventTopic: suggestion.subject || "",
          location: suggestion.suggestedLocation || "",
          maxParticipants: suggestion.estimatedParticipants || 50,
          eventType: "WORKSHOP",
          eventMode: "OFFLINE",
          orgSelectionMode: "existing",
          sessions: suggestion.programItems?.map((item, idx) => ({
            title: item.title || "Không tên",
            description: item.description || "",
            durationMinutes: item.durationMinutes || 0,
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            speaker: item.speaker || "",
            room: item.location || "",
            orderIndex: idx + 1
          })) || [],
          // Extract presenters from sessions
          presenters: suggestion.programItems?.reduce((acc, item) => {
            if (item.speaker && !acc.find(p => p.fullName === item.speaker)) {
              acc.push({
                fullName: item.speaker,
                email: "",
                position: "Diễn giả",
                department: "",
                bio: `Diễn giả tại phiên: ${item.title}`,
                targetSessionName: item.title
              });
            }
            return acc;
          }, []) || [],
          interactionSettings: suggestion.additionalData?.interactionSettings || {
            enableQA: false,
            enablePolls: false,
            allowUserQuestions: false
          },
          hasLuckyDraw: suggestion.additionalData?.hasLuckyDraw || false,
          aiReasoning: suggestion.reasoning || ""
        };

        if (suggestion.suggestedStartTime) {
          mappedData.startTime = new Date(suggestion.suggestedStartTime).toISOString().slice(0, 16);
        }
        if (suggestion.suggestedEndTime) {
          mappedData.endTime = new Date(suggestion.suggestedEndTime).toISOString().slice(0, 16);
        }

        onSelectPlan({ fromPlan: false, initialFormData: mappedData, startAtStep: 1 });
        onClose();
      } else {
        throw new Error(res.data?.message || "AI không thể tạo kế hoạch từ văn bản này.");
      }
    } catch (err) {
      console.error("AI Planning Raw Error:", err);
      // Assuming showToast is available or use alert/toast from context
      alert("❌ " + (err.message || "Lỗi khi AI phân tích dữ liệu"));
    } finally {
      setIsAIPlanning(false);
    }
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
              Bắt đầu từ một mẫu có sẵn, tạo trống, hoặc để AI giúp bạn phác thảo.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => { setSelected(null); setShowAiInput(false); handleNext(); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm"
              >
                <PlusCircle size={16} /> Tạo trống
              </button>
              
              <button
                onClick={() => { setSelected(null); setShowAiInput(!showAiInput); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                  showAiInput ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#gemini_grad)" />
                  <defs>
                    <linearGradient id="gemini_grad" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4E8AFF" />
                      <stop offset="0.5" stopColor="#A06FFF" />
                      <stop offset="1" stopColor="#FF7D9F" />
                    </linearGradient>
                  </defs>
                </svg>
                Phân tích AI
              </button>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowAiInput(false); }}
                  className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {showAiInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <textarea 
                    className="w-full p-3 rounded-xl border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mô tả ý tưởng sự kiện của bạn (ví dụ: Tổ chức workshop AI cho 200 sinh viên, có tea break, diễn giả từ Google...)"
                    rows={3}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <button 
                      onClick={() => handleAIRecommend()}
                      disabled={!aiText.trim() || isRecommending}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-xs hover:bg-emerald-100 disabled:opacity-50 transition-all border border-emerald-100"
                    >
                      {isRecommending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      AI Gợi ý mẫu phù hợp
                    </button>
                    <button 
                      onClick={handleAIPlanFromRaw}
                      disabled={!aiText.trim() || isAIPlanning}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-md shadow-indigo-100"
                    >
                      {isAIPlanning ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                      AI Tự lập kế hoạch ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-8 pt-4 overflow-y-auto custom-scrollbar bg-slate-50 relative">
            {isAIPlanning && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-indigo-600 animate-pulse" size={32} />
                  </div>
                  {/* Orbits */}
                  <div className="absolute -inset-4 border border-indigo-200 rounded-full animate-[spin_10s_linear_infinite] opacity-30"></div>
                  <div className="absolute -inset-8 border border-indigo-100 rounded-full animate-[spin_15s_linear_infinite] opacity-20"></div>
                </div>
                
                <h4 className="text-xl font-black text-indigo-900 mb-2">AI Thiên tài đang làm việc</h4>
                <div className="flex flex-col items-center">
                  <motion.p 
                    key={Math.floor(Date.now() / 2000)} // Force re-render for animation
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-indigo-600 font-bold"
                  >
                    {(() => {
                      const messages = [
                        "Đang phân tích yêu cầu của bạn...",
                        "Đang trích xuất dữ liệu từ mẫu...",
                        "Đang kiến tạo chương trình sự kiện...",
                        "Đang tối ưu hóa phân bổ thời gian...",
                        "Đang chuẩn bị bản phác thảo hoàn hảo..."
                      ];
                      return messages[Math.floor((Date.now() / 2000) % messages.length)];
                    })()}
                  </motion.p>
                  <div className="flex gap-1 mt-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                {sortedTemplates.map((template, index) => {
                  const isSelected = selected?.id === template.id;
                  const isPopular = (template.usageCount || 0) === maxUsage && maxUsage > 0;

                  return (
                    <button
                      key={template.id && template.id !== "" ? template.id : `tpl-${index}-${template.templateName || 'noid'}`}
                      onClick={() => { setSelected(template); setShowAiInput(false); }}
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

          <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-white shrink-0">
            <div className="flex-1">
              <span className="text-sm font-bold text-slate-800 block">
                {selected ? selected.templateName : "Hãy chọn một mẫu"}
              </span>
              <span className="text-[11px] text-slate-500">
                {selected ? "Bạn có thể dùng mẫu này hoặc nhờ AI tối ưu" : "Hoặc dùng AI Thiên tài ở trên"}
              </span>
            </div>
            
            <div className="flex gap-2">

              <button
                disabled={!selected || isAIPlanning}
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
              >
                Dùng mẫu gốc <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onConfirm={confirmAIPlanFromTemplate}
        title="Yêu cầu đặc biệt cho AI"
        message="Hãy cho AI biết thêm chi tiết để kế hoạch được tối ưu nhất cho bạn (ví dụ: số lượng khách, phong cách trang trí, ngân sách...)"
        placeholder="Nhập yêu cầu của bạn ở đây..."
      />
    </AnimatePresence>
  );
};

export default CreateEventModal;
