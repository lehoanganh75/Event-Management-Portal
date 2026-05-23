import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PlusCircle, Search, Loader2, Star, TrendingUp, ChevronRight, FileText, CheckCircle2,
  Calendar, MapPin, Users, Sparkles
} from "lucide-react";
import eventService from "../../services/eventService";
import PromptModal from "../common/PromptModal";
import { useAuth } from "../../context/AuthContext";
import { safeParseAIJson, formatAIDate, calculateSimilarity } from "../../utils/aiUtils";

const mapTemplateToPrefill = (template) => {
  const sessions = template.configData?.sessions || [];
  const presenters = template.configData?.presenters || [];
  const targetObjects = template.configData?.targetObjects ||
    (template.faculty ? [{ type: 'FACULTY', name: template.faculty }] : []);

  return {
    templateId: template.id,
    _templateName: template.templateName,
    eventTitle: template.defaultTitle || "",
    title: template.defaultTitle || "",
    description: template.description || "",
    eventPurpose: template.description || "",
    eventTopic: template.themes?.join(", ") || "",
    themes: template.themes || [],

    location: template.defaultLocation || "",
    eventMode: template.defaultEventMode || "OFFLINE",
    maxParticipants: template.defaultMaxParticipants || 50,

    faculty: template.faculty || "",
    major: template.major || "",

    coverImage: template.defaultCoverImage || "",

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

    hasLuckyDraw: template.configData?.hasLuckyDraw || false,
    interactionSettings: template.configData?.interactionSettings || {
      enableQA: false,
      enablePolls: false,
      allowUserQuestions: false,
    },
  };
};

const fetchUserLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          resolve(data.display_name || `${latitude}, ${longitude}`);
        } catch (error) {
          resolve(`${position.coords.latitude}, ${position.coords.longitude}`);
        }
      },
      (error) => {
        console.warn("Lỗi lấy vị trí:", error);
        resolve("");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300000, // Reuse location cached up to 5 mins
        timeout: 30000 // Wait max 30 seconds for user to click Allow
      }
    );
  });
};

const CreatePlanModal = ({ isOpen, onClose, onSelectPlan, onCreateNew, initialAiText = "" }) => {
  const [templates, setTemplates] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedTemplates, setRecommendedTemplates] = useState([]);
  const { user } = useAuth();
  const [isAIPlanning, setIsAIPlanning] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await eventService.getAllOrganizations();
        setOrganizations(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn vị:", err);
      }
    };
    if (isOpen) fetchOrgs();
  }, [isOpen]);
  const [aiText, setAiText] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    if (isOpen && initialAiText) {
      setAiText(initialAiText);
      setShowAiInput(true);
      handleAIRecommend(initialAiText);
    }
  }, [isOpen, initialAiText]);

  const handleAIRecommend = async (text = aiText) => {
    console.log("handleAIRecommend called with text:", text);
    if (!text.trim()) {
      console.warn("Empty AI text, aborting.");
      return;
    }
    setIsRecommending(true);
    setRecommendedTemplates([]); // Reset
    try {
      console.log("Calling eventService.recommendTemplates...");
      const recommended = await eventService.recommendTemplates(text, 3);
      console.log("Recommended templates received:", recommended);
      if (recommended && recommended.length > 0) {
        setRecommendedTemplates(recommended.slice(0, 3));
      } else {
        console.warn("No templates recommended by AI.");
      }
    } catch (error) {
      console.error("Lỗi khi AI gợi ý mẫu:", error);
      alert("Lỗi khi gọi AI gợi ý: " + (error.message || "Không xác định"));
    } finally {
      setIsRecommending(false);
    }
  };

  const fetchTemplates = async () => {
    setFetching(true);
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setFetching(false);
    }, 10000);

    try {
      const data = await eventService.getAllTemplates(null, '', { page: 0, size: 100, sortBy: 'usageCount', direction: 'desc' });
      const list = Array.isArray(data?.content) ? data.content
        : Array.isArray(data) ? data
          : [];
      setTemplates(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách mẫu:", error);
      setTemplates([]);
    } finally {
      clearTimeout(safetyTimeout);
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

  const maxUsage = useMemo(() => Math.max(...templates.map(t => t.usageCount || 0), 1), [templates]);

  // AI Prompt Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleNext = async () => {
    if (selected) {
      try {
        await eventService.incrementTemplateUsage(selected.id);
      } catch (err) {
        console.error("Lỗi khi tăng lượt dùng mẫu:", err);
      }
      onSelectPlan({ fromPlan: false, initialFormData: mapTemplateToPrefill(selected), startAtStep: 1 });
    } else {
      onCreateNew({ fromPlan: false, initialFormData: {}, startAtStep: 1 });
    }
    onClose();
  };

  const handleAIPlanFromTemplate = () => {
    if (!selected) return;
    setShowPromptModal(true);
  };

  const confirmAIPlanFromTemplate = async (userContext, overrideTemplate = null) => {
    const targetTemplate = overrideTemplate || selected;
    if (!targetTemplate) return;

    setShowPromptModal(false);
    setIsAIPlanning(true);
    try {
      // ✨ Truyền cả đối tượng targetTemplate để AI có thêm context về mẫu
      const res = await eventService.aiPlanning.generateFromTemplate(
        targetTemplate,
        userContext,
        user?.accountId || user?.id || null
      );

      let rawResult = res.data.reply?.reply || res.data.result;
      if (!rawResult) throw new Error("Không nhận được phản hồi từ AI.");

      const suggestion = safeParseAIJson(rawResult);
      if (!suggestion) throw new Error("AI trả về định dạng không hợp lệ cho mẫu này. Vui lòng thử lại.");

      const mappedData = {
        ...mapTemplateToPrefill(targetTemplate),
        eventTitle: suggestion.title || targetTemplate.defaultTitle,
        title: suggestion.title || targetTemplate.defaultTitle,
        eventPurpose: suggestion.purpose || suggestion.description || targetTemplate.description,
        description: suggestion.description || targetTemplate.description,
        eventTopic: suggestion.subject || "",
        location: suggestion.suggestedLocation || targetTemplate.defaultLocation,
        maxParticipants: suggestion.estimatedParticipants || targetTemplate.defaultMaxParticipants,
        registrationDeadline: formatAIDate(suggestion.registrationDeadline, "23:59"),
        goal: suggestion.goal || "",
        requirement: suggestion.requirement || "",
        sessions: (suggestion.programItems || []).map((item, idx) => ({
          title: item.title || "Không tên",
          description: item.description || "",
          durationMinutes: item.durationMinutes || 30,
          startTime: formatAIDate(item.startTime),
          endTime: formatAIDate(item.endTime),
          speaker: item.speaker || "",
          room: item.location || "",
          orderIndex: idx + 1
        })),
        interactionSettings: {
          enableQA: true,
          enablePolls: false,
          allowUserQuestions: true
        },
        hasLuckyDraw: false,
        aiReasoning: suggestion.reasoning || ""
      };

      // Ensure Golden Times
      mappedData.startTime = formatAIDate(suggestion.suggestedStartTime, "07:00");
      mappedData.endTime = formatAIDate(suggestion.suggestedEndTime, "23:59");
      mappedData.registrationDeadline = formatAIDate(suggestion.registrationDeadline, "23:59");

      // Intelligent Fuzzy Organization Matching
      const currentLocation = await fetchUserLocation();
      const fallbackOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];

      if (suggestion.suggestedOrganizerName && suggestion.suggestedOrganizerName.trim()) {
        let bestMatch = null;
        let highestScore = 0;

        organizations.forEach(o => {
          const score = calculateSimilarity(suggestion.suggestedOrganizerName, o.name || o.organizationName || "");
          if (score > highestScore) {
            highestScore = score;
            bestMatch = o;
          }
        });

        if (bestMatch && highestScore > 0.4) {
          console.log(`Fuzzy match found: ${bestMatch.name || bestMatch.organizationName} (Score: ${highestScore.toFixed(2)})`);
          mappedData.orgSelectionMode = "existing";
          mappedData.organizationId = bestMatch.id;
          mappedData.organizerId = bestMatch.id;
        } else {
          mappedData.orgSelectionMode = "new";
          mappedData.newOrg = {
            name: suggestion.suggestedOrganizerName.trim(),
            description: suggestion.suggestedOrganizerDescription || "",
            email: user?.email || "",
            phone: user?.phone || "",
            type: "OTHER",
            officeLocation: currentLocation
          };
        }
      } else {
        if (fallbackOrg) {
          mappedData.orgSelectionMode = "existing";
          mappedData.organizationId = fallbackOrg.id;
          mappedData.organizerId = fallbackOrg.id;
        } else {
          mappedData.orgSelectionMode = "new";
          mappedData.newOrg = {
            name: "",
            description: "",
            email: user?.email || "",
            phone: user?.phone || "",
            type: "OTHER",
            officeLocation: currentLocation
          };
        }
      }

      onSelectPlan({ fromPlan: false, initialFormData: mappedData, startAtStep: 1 });
      onClose();
    } catch (err) {
      console.error("AI Planning Error:", err);
      alert("❌ " + (err.message || "Lỗi khi AI phân tích dữ liệu mẫu"));
    } finally {
      setIsAIPlanning(false);
    }
  };

  const handleAIPlanFromRaw = async () => {
    if (!aiText.trim()) return;
    setIsAIPlanning(true);
    try {
      const res = await eventService.aiPlanning.generateFromRawText(
        aiText,
        user?.accountId || user?.id || null
      );
      let rawResult = res.data.reply?.reply || res.data.result;

      if (!rawResult) throw new Error("Không nhận được phản hồi từ AI.");

      const suggestion = safeParseAIJson(rawResult);
      if (!suggestion) throw new Error("AI trả về định dạng không hợp lệ. Vui lòng thử lại.");

      // Hậu xử lý để ép giờ theo quy tắc "Giờ Vàng" nếu AI trả về giờ mặc định (00:00)
      const forceStartTime = (suggestion.suggestedStartTime && suggestion.suggestedStartTime.includes('00:00:00')) ? "07:00" : null;
      const forceEndTime = (suggestion.suggestedEndTime && suggestion.suggestedEndTime.includes('00:00:00')) ? "23:59" : null;
      const forceDeadline = (suggestion.registrationDeadline && suggestion.registrationDeadline.includes('00:00:00')) ? "23:59" : null;

      const mappedData = {
        eventTitle: suggestion.title || "",
        title: suggestion.title || "",
        eventPurpose: suggestion.purpose || suggestion.description || "",
        description: suggestion.description || "",
        eventTopic: suggestion.subject || "",
        location: suggestion.suggestedLocation || "",
        maxParticipants: suggestion.estimatedParticipants || 200,
        eventType: "WORKSHOP",
        eventMode: "OFFLINE",
        startTime: formatAIDate(suggestion.suggestedStartTime, forceStartTime || (suggestion.suggestedStartTime?.includes('T07:00') ? null : "07:00")),
        endTime: formatAIDate(suggestion.suggestedEndTime, forceEndTime || "23:59"),
        registrationDeadline: formatAIDate(suggestion.registrationDeadline, forceDeadline || "23:59"),
        goal: suggestion.goal || "",
        requirement: suggestion.requirement || "",
        sessions: (suggestion.programItems || []).map((item, idx) => ({
          title: item.title || "Không tên",
          description: item.description || "",
          durationMinutes: item.durationMinutes || 30,
          startTime: formatAIDate(item.startTime),
          endTime: formatAIDate(item.endTime),
          speaker: item.speaker || "",
          room: item.location || "",
          orderIndex: idx + 1
        })),
        presenters: (suggestion.programItems || []).reduce((acc, item) => {
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
        }, []),
        interactionSettings: {
          enableQA: true,
          enablePolls: false,
          allowUserQuestions: true
        },
        hasLuckyDraw: false,
        aiReasoning: suggestion.reasoning || ""
      };

      // Intelligent Fuzzy Organization Matching
      const currentLocation = await fetchUserLocation();
      const fallbackOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];

      if (suggestion.suggestedOrganizerName && suggestion.suggestedOrganizerName.trim()) {
        let bestMatch = null;
        let highestScore = 0;

        organizations.forEach(o => {
          const score = calculateSimilarity(suggestion.suggestedOrganizerName, o.name || o.organizationName || "");
          if (score > highestScore) {
            highestScore = score;
            bestMatch = o;
          }
        });

        if (bestMatch && highestScore > 0.4) {
          console.log(`Fuzzy match found: ${bestMatch.name || bestMatch.organizationName} (Score: ${highestScore.toFixed(2)})`);
          mappedData.orgSelectionMode = "existing";
          mappedData.organizationId = bestMatch.id;
          mappedData.organizerId = bestMatch.id;
        } else {
          mappedData.orgSelectionMode = "new";
          mappedData.newOrg = {
            name: suggestion.suggestedOrganizerName.trim(),
            description: suggestion.suggestedOrganizerDescription || "",
            email: user?.email || "",
            phone: user?.phone || "",
            type: "OTHER",
            officeLocation: currentLocation
          };
        }
      } else {
        if (fallbackOrg) {
          mappedData.orgSelectionMode = "existing";
          mappedData.organizationId = fallbackOrg.id;
          mappedData.organizerId = fallbackOrg.id;
        } else {
          mappedData.orgSelectionMode = "new";
          mappedData.newOrg = {
            name: "",
            description: "",
            email: user?.email || "",
            phone: user?.phone || "",
            type: "OTHER",
            officeLocation: currentLocation
          };
        }
      }

      console.log("Map data:", mappedData);


      onSelectPlan({ fromPlan: false, initialFormData: mappedData, startAtStep: 1 });
      onClose();
    } catch (err) {
      console.error("AI Planning Raw Error:", err);
      alert(err.message || "Lỗi khi AI phân tích dữ liệu");
    } finally {
      setIsAIPlanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        key="plan-modal-container"
      >
        {/* Overlay */}
        <motion.div
          key="plan-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        {/* Modal */}
        <motion.div
          key="plan-modal-content"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="
          relative bg-white w-full max-w-3xl
          rounded-2xl border border-slate-200
          shadow-lg overflow-hidden
          flex flex-col max-h-[90vh]
        "
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="
            absolute top-4 right-4 z-10
            p-2 rounded-lg
            text-slate-400
            hover:bg-slate-100
            hover:text-slate-700
            transition-colors
          "
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
            <h2 className="text-xl font-semibold text-slate-800">
              Tạo kế hoạch mới
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Chọn mẫu có sẵn, tạo mới hoặc sử dụng AI hỗ trợ.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => {
                  setSelected(null);
                  setShowAiInput(false);
                  handleNext();
                }}
                className="
    flex items-center gap-2
    px-4 py-2
    rounded-lg
    border border-slate-200
    bg-white
    text-slate-600
    text-xs font-medium
    hover:bg-slate-50
    transition-colors
  "
              >
                <PlusCircle size={14} />
                Tạo trống
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  setShowAiInput(!showAiInput);
                }}
                className={`
                  flex items-center gap-2
                  px-4 py-2
                  rounded-lg
                  border
                  text-xs font-medium
                  transition-colors
                  ${showAiInput
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  }
                `}
              >
                <Sparkles size={14} />
                Phân tích AI
              </button>

              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowAiInput(false);
                  }}
                  className="
                  w-full pl-10 pr-4 py-2.5
                  bg-white
                  border border-slate-200
                  rounded-xl
                  text-sm text-slate-700
                  outline-none
                  focus:border-blue-500
                  transition-colors
                "
                />
              </div>
            </div>

            {/* AI Input */}
            {showAiInput && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                mt-5
                bg-slate-50
                border border-slate-200
                rounded-xl
                p-4
              "
              >
                <textarea
                  className="
                  w-full p-3
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-sm text-slate-700
                  placeholder:text-slate-400
                  outline-none
                  resize-none
                  focus:border-indigo-500
                  transition-colors
                "
                  placeholder="Mô tả ý tưởng sự kiện của bạn..."
                  rows={3}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                />

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAIRecommend();
                    }}
                    disabled={!aiText.trim() || isRecommending}
                    className={`
                    flex items-center gap-2
                    px-4 py-2
                    rounded-lg
                    text-xs font-medium
                    border
                    transition-colors
                    ${!aiText.trim() || isRecommending
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      }
                  `}
                  >
                    {isRecommending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}

                    {isRecommending
                      ? "Đang phân tích..."
                      : "AI gợi ý mẫu"}
                  </button>

                  <button
                    onClick={handleAIPlanFromRaw}
                    disabled={!aiText.trim() || isAIPlanning}
                    className="
                    flex items-center gap-2
                    px-4 py-2
                    rounded-lg
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    text-xs font-medium
                    disabled:bg-slate-300
                    transition-colors
                  "
                  >
                    {isAIPlanning ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <TrendingUp size={14} />
                    )}

                    AI lập kế hoạch
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5 relative">
            {/* AI Loading */}
            {isAIPlanning && (
              <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2
                    className="animate-spin text-indigo-600 mx-auto mb-4"
                    size={36}
                  />

                  <h4 className="text-base font-semibold text-slate-800">
                    AI đang tạo kế hoạch
                  </h4>

                  <p className="text-sm text-slate-500 mt-1">
                    Quá trình này có thể mất vài giây...
                  </p>
                </div>
              </div>
            )}

            {/* Fetching */}
            {fetching ? (
              <div className="flex justify-center py-16">
                <Loader2
                  className="animate-spin text-blue-600"
                  size={32}
                />
              </div>
            ) : recommendedTemplates.length === 0 &&
              sortedTemplates.length === 0 ? (
              <div className="text-center py-16">
                <FileText
                  size={40}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-500">
                  Không tìm thấy mẫu phù hợp
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recommended */}
                {recommendedTemplates.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles
                        className="text-emerald-600"
                        size={16}
                      />

                      <h3 className="text-sm font-semibold text-slate-800">
                        Gợi ý từ AI
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendedTemplates.map(
                        (template, index) => (
                          <button
                            key={`rec-${template.id}-${index}`}
                            onClick={() => {
                              setSelected(template);

                              confirmAIPlanFromTemplate(
                                aiText ||
                                "Sử dụng mẫu này",
                                template
                              );
                            }}
                            className="
                            bg-white border border-slate-200
                            rounded-xl p-4
                            text-left
                            hover:border-emerald-300
                            hover:bg-emerald-50/30
                            transition-colors
                          "
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                Gợi ý #{index + 1}
                              </span>

                              <span className="text-xs text-slate-400">
                                {template.usageCount}
                              </span>
                            </div>

                            <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                              {template.templateName}
                            </h4>

                            <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                              {template.description}
                            </p>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Templates */}
                {sortedTemplates.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedTemplates.map(
                      (template, index) => {
                        const isSelected =
                          selected?.id === template.id;

                        const isPopular =
                          (template.usageCount || 0) ===
                          maxUsage && maxUsage > 0;

                        return (
                          <button
                            key={
                              template.id ||
                              `tpl-${index}`
                            }
                            onClick={() => {
                              setSelected(template);
                              setShowAiInput(false);
                            }}
                            className={`
                            relative w-full text-left
                            p-5 rounded-xl border
                            transition-colors
                            ${isSelected
                                ? "border-blue-500 bg-blue-50/40"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                              }
                          `}
                          >
                            {/* Star */}
                            <div
                              onClick={(e) =>
                                handleToggleStar(
                                  e,
                                  template
                                )
                              }
                              className={`
                              absolute top-4 right-4
                              p-1 rounded-md
                              transition-colors
                              ${template.isStarred
                                  ? "text-amber-500 bg-amber-50"
                                  : "text-slate-300 hover:bg-slate-100 hover:text-amber-500"
                                }
                            `}
                            >
                              <Star
                                size={16}
                                fill={
                                  template.isStarred
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </div>

                            <div className="pr-8">
                              <h4
                                className={`
                                font-semibold text-sm line-clamp-2
                                ${isSelected
                                    ? "text-blue-700"
                                    : "text-slate-800"
                                  }
                              `}
                              >
                                {template.templateName}
                              </h4>
                            </div>

                            {isPopular && (
                              <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-[11px] font-medium">
                                <TrendingUp size={11} />
                                Phổ biến
                              </span>
                            )}

                            <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                              {template.description ||
                                "Không có mô tả"}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                <Users
                                  size={11}
                                  className="text-emerald-600"
                                />
                                {template.defaultMaxParticipants ||
                                  0}{" "}
                                người
                              </span>

                              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                <CheckCircle2
                                  size={11}
                                  className="text-blue-600"
                                />
                                {template.usageCount ||
                                  0}{" "}
                                lượt dùng
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">
                {selected
                  ? selected.templateName
                  : "Chưa chọn mẫu"}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {selected
                  ? "Bạn có thể tiếp tục với mẫu này"
                  : "Hãy chọn một mẫu hoặc dùng AI"}
              </p>
            </div>

            <button
              disabled={!selected || isAIPlanning}
              onClick={handleNext}
              className="
              flex items-center gap-2
              px-6 py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm font-medium
              disabled:bg-slate-200
              disabled:text-slate-500
              transition-colors
            "
            >
              Dùng mẫu
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Prompt Modal */}
      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onConfirm={confirmAIPlanFromTemplate}
        title="Yêu cầu đặc biệt cho AI"
        message="Nhập thêm thông tin để AI tối ưu kế hoạch tốt hơn."
        placeholder="Ví dụ: quy mô 300 người, có tea break..."
      />
    </AnimatePresence>
  );
};

export default CreatePlanModal;
