import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PlusCircle, Search, Loader2, Star, TrendingUp, ChevronRight, FileText, CheckCircle2,
  Calendar, MapPin, Users, Sparkles, ClipboardCheck, ArrowRight, ArrowLeft, Check, Info
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
  // Mode: 'choice' | 'from_plan' | 'new'
  const [selectionMode, setSelectionMode] = useState('choice');
  
  const [templates, setTemplates] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectionMode('choice');
      setSelectedTemplate(null);
      setSelectedPlan(null);
      setSearchTerm("");
      
      if (initialAiText) {
        setSelectionMode('new');
        setAiText(initialAiText);
        setShowAiInput(true);
        handleAIRecommend(initialAiText);
      }
    }
  }, [isOpen, initialAiText]);

  const fetchTemplates = async () => {
    setFetching(true);
    const safetyTimeout = setTimeout(() => setFetching(false), 10000);
    try {
      const data = await eventService.getAllTemplates(null, '', { page: 0, size: 100, sortBy: 'usageCount', direction: 'desc' });
      const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      setTemplates(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách mẫu:", error);
      setTemplates([]);
    } finally {
      clearTimeout(safetyTimeout);
      setFetching(false);
    }
  };

  const fetchApprovedPlans = async () => {
    setFetching(true);
    const safetyTimeout = setTimeout(() => setFetching(false), 10000);
    try {
      // Assuming getPlansByStatus or similar exists. Looking at eventService.js, 
      // getPlansByStatus(statusName, accountId) exists (line 228)
      // Or just filter from getMyPlans
      const res = await eventService.getMyPlans();
      const list = (res.data || []).filter(p => p.status === 'PLAN_APPROVED');
      setApprovedPlans(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách kế hoạch:", error);
      setApprovedPlans([]);
    } finally {
      clearTimeout(safetyTimeout);
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (selectionMode === 'new') fetchTemplates();
      if (selectionMode === 'from_plan') fetchApprovedPlans();
    }
  }, [isOpen, selectionMode]);

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
    return filtered.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
  }, [templates, searchTerm]);

  const filteredPlans = useMemo(() => {
    return approvedPlans.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [approvedPlans, searchTerm]);

  const maxUsage = useMemo(() => Math.max(...templates.map(t => t.usageCount || 0), 1), [templates]);

  const [isAIPlanning, setIsAIPlanning] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiText.trim()) return;
    setIsRecommending(true);
    try {
      const response = await eventService.chat.extractFromText(aiText);
      const aiData = response.data || response;
      
      const mappedData = {
        eventTitle: aiData.title || aiData.eventTitle || "",
        eventPurpose: aiData.description || aiData.eventPurpose || aiText,
        location: aiData.location || "",
        maxParticipants: aiData.maxParticipants || 50,
        eventTopic: aiData.topic || aiData.eventTopic || "OTHER",
        // Backend có thể trả thêm các trường khác, form sẽ tự map nếu khớp key
      };
      
      onCreateNew({ fromPlan: false, initialFormData: mappedData, startAtStep: 1 });
      onClose();
    } catch (error) {
      console.error("Lỗi khi AI phân tích prompt:", error);
      // Fallback: Nếu lỗi API, vẫn mở form tạo mới nhưng truyền raw prompt vào mô tả
      onCreateNew({ fromPlan: false, initialFormData: { eventPurpose: aiText }, startAtStep: 1 });
      onClose();
    } finally {
      setIsRecommending(false);
    }
  };

  const handleConfirmChoice = () => {
    if (selectionMode === 'from_plan' && selectedPlan) {
      // Map plan data to prefill
      const prefill = {
        ...selectedPlan,
        eventTitle: selectedPlan.title,
        eventPurpose: selectedPlan.description,
        startTime: selectedPlan.startTime ? new Date(selectedPlan.startTime).toISOString().slice(0, 16) : "",
        endTime: selectedPlan.endTime ? new Date(selectedPlan.endTime).toISOString().slice(0, 16) : "",
        fromPlan: true,
        planId: selectedPlan.id
      };
      onSelectPlan({ fromPlan: true, initialFormData: prefill, startAtStep: 1 });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">
                {selectionMode === 'choice' ? 'Tạo sự kiện mới' : 
                 selectionMode === 'from_plan' ? 'Chọn kế hoạch đã duyệt' : 'Bắt đầu sự kiện mới'}
              </h2>
              <p className="text-slate-500 text-sm">
                {selectionMode === 'choice' ? 'Chọn phương thức khởi tạo sự kiện của bạn' : 
                 selectionMode === 'from_plan' ? 'Sử dụng nội dung từ kế hoạch đã được phê duyệt' : 'Sử dụng mẫu hoặc AI để thiết lập nhanh'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden min-h-[500px] relative">
            {selectionMode === 'choice' ? (
              <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-xl">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Chọn phương thức khởi tạo</h2>
                    <p className="text-slate-500 text-sm">Vui lòng chọn cách bạn muốn bắt đầu để tạo sự kiện mới</p>
                  </div>

                  <div className="space-y-4">
                    {/* Option 1: From Plan */}
                    <button
                      onClick={() => setSelectionMode('from_plan')}
                      className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ClipboardCheck size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-0.5 flex items-center gap-2">
                          Từ kế hoạch đã duyệt
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md uppercase">Khuyên dùng</span>
                        </h3>
                        <p className="text-slate-500 text-xs">Kế thừa toàn bộ dữ liệu từ bản thảo đã được Admin phê duyệt.</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    {/* Option 2: AI Assistant */}
                    <button
                      onClick={() => setSelectionMode('new')}
                      className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Sparkles size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-0.5 flex items-center gap-2">
                          Trợ lý AI phác thảo
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-md uppercase">Mới</span>
                        </h3>
                        <p className="text-slate-500 text-xs">Chỉ cần viết mô tả ý tưởng, AI sẽ tự động phân tích và điền form cho bạn.</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>

                    {/* Option 3: New Event */}
                    <button
                      onClick={() => {
                        onCreateNew({ fromPlan: false, initialFormData: {}, startAtStep: 1 });
                        onClose();
                      }}
                      className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <PlusCircle size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-0.5">Bắt đầu từ form trống</h3>
                        <p className="text-slate-500 text-xs">Tự mình điền tay mọi chi tiết của sự kiện từ đầu.</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-slate-50 p-8 overflow-y-auto custom-scrollbar">
                {selectionMode === 'from_plan' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <button onClick={() => setSelectionMode('choice')} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all">
                        <ArrowLeft size={20} />
                      </button>
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Tìm kiếm kế hoạch..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-400 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {fetching ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                        <p className="text-slate-500 font-medium">Đang tải danh sách kế hoạch...</p>
                      </div>
                    ) : filteredPlans.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                        <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                        <h4 className="text-slate-800 font-bold mb-1">Không tìm thấy kế hoạch nào</h4>
                        <p className="text-slate-400 text-sm">Hãy chắc chắn bạn có kế hoạch đã được phê duyệt.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPlans.map(plan => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan)}
                            className={`p-6 rounded-2xl border-2 transition-all text-left group ${
                              selectedPlan?.id === plan.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-white bg-white hover:border-emerald-200'
                            }`}
                          >
                            <h4 className={`font-bold mb-2 ${selectedPlan?.id === plan.id ? 'text-emerald-700' : 'text-slate-800'}`}>{plan.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{plan.description}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {plan.startTime ? new Date(plan.startTime).toLocaleDateString() : 'Chưa set'}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {plan.location || 'Chưa set'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectionMode === 'new' && (
                  <div className="space-y-6 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-2 shrink-0">
                      <button onClick={() => setSelectionMode('choice')} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all">
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">Trợ lý AI phác thảo</h3>
                        <p className="text-xs text-slate-500">Viết prompt thô để AI tự động điền các thông tin sự kiện</p>
                      </div>
                    </div>

                    <div className="flex-1 bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-sm flex flex-col relative min-h-[250px]">
                      <div className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Sparkles size={20} />
                      </div>
                      <textarea 
                        className="w-full flex-1 p-2 bg-transparent text-slate-700 focus:outline-none resize-none custom-scrollbar text-sm leading-relaxed placeholder:text-slate-300"
                        placeholder="Ví dụ: Tôi muốn tổ chức một buổi hội thảo về Trí tuệ nhân tạo vào thứ 6 tuần sau lúc 8h sáng tại hội trường A. Dự kiến có khoảng 200 sinh viên tham gia..."
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        autoFocus
                      />
                      
                      {/* Tips */}
                      <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2 overflow-x-auto custom-scrollbar pb-2 shrink-0">
                        <button onClick={() => setAiText("Lễ tổng kết năm học kết hợp trao giải sinh viên 5 tốt cấp khoa...")} className="shrink-0 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] rounded-full font-medium transition-all">
                          Lễ tổng kết
                        </button>
                        <button onClick={() => setAiText("Workshop hướng nghiệp ngành CNTT với sự tham gia của các chuyên gia đầu ngành...")} className="shrink-0 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] rounded-full font-medium transition-all">
                          Workshop IT
                        </button>
                        <button onClick={() => setAiText("Cuộc thi lập trình Hackathon 24h với quy mô 50 đội thi dành cho sinh viên...")} className="shrink-0 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] rounded-full font-medium transition-all">
                          Hackathon
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
            <div className="flex-1">
              {selectionMode === 'from_plan' && selectedPlan && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ClipboardCheck size={20} /></div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Đã chọn: {selectedPlan.title}</span>
                    <span className="text-[11px] text-emerald-600 font-bold">Kế hoạch này đã sẵn sàng để chuyển đổi</span>
                  </div>
                </div>
              )}
              {selectionMode === 'new' && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles size={20} /></div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Sẵn sàng phân tích</span>
                    <span className="text-[11px] text-indigo-600 font-bold">AI sẽ tự động tách thông tin và điền vào form cho bạn</span>
                  </div>
                </div>
              )}
              {!selectedPlan && selectionMode !== 'choice' && selectionMode !== 'new' && (
                <span className="text-sm text-slate-400 italic">Vui lòng chọn một mục để tiếp tục</span>
              )}
            </div>

            <div className="flex gap-3">
              {selectionMode === 'from_plan' && (
                <button onClick={handleConfirmChoice} disabled={!selectedPlan} className="flex items-center gap-2 px-10 py-3 rounded-2xl font-bold transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none">
                  Tiếp tục <ArrowRight size={18} />
                </button>
              )}
              {selectionMode === 'new' && (
                <button onClick={handleAIGenerate} disabled={!aiText.trim() || isRecommending} className="flex items-center gap-2 px-10 py-3 rounded-2xl font-bold transition-all shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none">
                  {isRecommending ? <Loader2 size={18} className="animate-spin" /> : "Phân tích AI"} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <PromptModal
        isOpen={showPromptModal} onClose={() => setShowPromptModal(false)} onConfirm={() => {}} 
        title="Yêu cầu đặc biệt cho AI" message="Hãy cho AI biết thêm chi tiết để kế hoạch được tối ưu nhất cho bạn." placeholder="Nhập yêu cầu của bạn ở đây..."
      />
    </AnimatePresence>
  );
};

export default CreateEventModal;
