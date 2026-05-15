import React, { useState, useEffect } from "react";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Search,
  Loader2
} from "lucide-react";
import eventService from "../../services/eventService";
import authService from "../../services/authService";

// Sub-components
import BasicInfoSection from "./manual-input/components/BasicInfoSection";
import InteractionAndSettingsSection from "./manual-input/components/InteractionAndSettingsSection";
import OrganizationSection from "./manual-input/components/OrganizationSection";
import SessionsSection from "./manual-input/components/SessionsSection";
import PresentersSection from "./manual-input/components/PresentersSection";

export default function ManualInputStep({
  formData,
  setFormData,
  onNext,
  onBack,
  activeSections = [],
  isPlanMode = false,
}) {
  const term = isPlanMode ? "kế hoạch" : "sự kiện";
  const [errors, setErrors] = useState({});
  const [showOrgAISuggestions, setShowOrgAISuggestions] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);

  const [orgs, setOrgs] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiLoadingFields, setAiLoadingFields] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [showSessionAISuggestions, setShowSessionAISuggestions] = useState(false);
  const [showPresenterSuggestions, setShowPresenterSuggestions] = useState(false);
  const [presenterSearchKey, setPresenterSearchKey] = useState("");

  const isVisible = (section) => activeSections.length === 0 || activeSections.includes(section);

  // --- API FETCHERS ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authService.getAllUsers();
      setSystemUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const res = await eventService.getAllOrganizations();
        setOrgs(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn vị:", err);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  // --- AI HANDLERS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAILoading(true);
    try {
      const uploadRes = await eventService.localAi.parseFile(file);
      const text = uploadRes.data.message;
      const extractRes = await eventService.aiPlanning.generateFromRawText(text);
      const data = extractRes.data.result;
      if (data) {
        setFormData(prev => ({
          ...prev,
          eventTitle: data.title || prev.eventTitle,
          description: data.description || prev.description,
          location: data.suggestedLocation || prev.location,
          maxParticipants: data.estimatedParticipants || prev.maxParticipants,
          startTime: data.suggestedStartTime || prev.startTime,
          endTime: data.suggestedEndTime || prev.endTime,
          sessions: data.programItems || prev.sessions
        }));
        import("react-toastify").then(({ toast }) => toast.success("Đã tự động điền dữ liệu từ tài liệu!"));
      }
    } catch (err) {
      console.error("AI Error:", err);
      import("react-toastify").then(({ toast }) => toast.error("Lỗi khi xử lý tài liệu với AI."));
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSmartSuggestion = async () => {
    if (!formData.eventTitle) {
      import("react-toastify").then(({ toast }) => toast.warn("Vui lòng nhập tiêu đề để AI có cơ sở gợi ý"));
      return;
    }
    setIsAILoading(true);
    try {
      const prompt = `Gợi ý mô tả và lịch trình cho sự kiện: "${formData.eventTitle}". 
                     Dữ liệu đã có: Địa điểm ${formData.location || 'chưa rõ'}.
                     Hãy trả về JSON gồm các trường: description, programItems (title, description, durationMinutes).`;
      const res = await eventService.aiPlanning.generateFromRawText(prompt);
      const data = res.data.result;
      if (data) {
        setFormData(prev => ({
          ...prev,
          description: data.description || prev.description,
          sessions: data.programItems?.map((s, i) => ({
            ...s,
            orderIndex: i + 1,
            isConfirmed: true,
            startTime: prev.startTime,
            endTime: prev.endTime
          })) || prev.sessions
        }));
        import("react-toastify").then(({ toast }) => toast.success("AI đã hoàn thiện nội dung cho bạn!"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAIFieldSuggestion = async (fieldName, fieldLabel, customPrompt) => {
    if (!formData.eventTitle && fieldName !== 'eventTitle') {
      import("react-toastify").then(({ toast }) => toast.warn("Vui lòng nhập tiêu đề sự kiện để AI có cơ sở gợi ý!"));
      return;
    }
    setAiLoadingFields(prev => ({ ...prev, [fieldName]: true }));
    setAiSuggestions(prev => ({ ...prev, [fieldName]: { show: true, items: [] } }));
    try {
      let prompt = customPrompt || `Dựa trên tiêu đề sự kiện: "${formData.eventTitle}", hãy gợi ý 3 lựa chọn ngắn gọn cho trường "${fieldLabel}". 
        Yêu cầu: Chỉ trả về 3 dòng, mỗi dòng là một lựa chọn, không có số thứ tự.`;
      const res = await eventService.chat.extractFromText(prompt);
      const result = res.data?.result;
      const aiContent = result?.description || result?.purpose || "";
      if (aiContent) {
        const suggestions = aiContent.split('\n')
          .map(s => s.replace(/^[0-9\.\-\*\s]+/, '').trim())
          .filter(s => s.length > 2)
          .slice(0, 3);
        setAiSuggestions(prev => ({
          ...prev,
          [fieldName]: { show: true, items: suggestions.length > 0 ? suggestions : ["AI chưa có ý tưởng, hãy thử lại!"] }
        }));
      }
    } catch (err) {
      console.error(`Lỗi gợi ý AI cho ${fieldName}:`, err);
      setAiSuggestions(prev => ({ ...prev, [fieldName]: { show: true, items: ["Lỗi kết nối AI"] } }));
    } finally {
      setAiLoadingFields(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleGenerateDescriptionWithAI = () => {
    handleAIFieldSuggestion('eventPurpose', 'Mô tả sự kiện', `Hãy đóng vai một chuyên gia tổ chức sự kiện chuyên nghiệp. 
      Dựa trên tiêu đề sự kiện: "${formData.eventTitle}" ${formData.eventTopic ? `và chủ đề: "${formData.eventTopic}"` : ''},
      hãy viết cho tôi 3 mẫu mô tả sự kiện (khoảng 3-5 câu mỗi mẫu) theo các phong cách khác nhau. Vui lòng chỉ trả về 3 mẫu văn bản, ngăn cách nhau bởi xuống dòng.`);
  };

  // --- CRUD HANDLERS ---
  const addInvite = (user = null) => {
    const invites = formData.invitations || [];
    const newInvite = user ? {
      inviteeAccountId: user.id,
      inviteeEmail: user.email || "",
      inviteeName: user.profile?.fullName || user.username || "",
      targetRole: "MEMBER",
      message: "",
      isConfirmed: true
    } : { inviteeAccountId: null, inviteeEmail: "", inviteeName: "", targetRole: "MEMBER", message: "", isConfirmed: false };
    setFormData({ ...formData, invitations: [...invites, newInvite] });
  };

  const confirmInvite = (index) => {
    const invites = [...(formData.invitations || [])];
    if (!invites[index].inviteeEmail) return;
    invites[index].isConfirmed = true;
    setFormData({ ...formData, invitations: invites });
  };

  const updateInvite = (index, field, value) => {
    const invites = [...(formData.invitations || [])];
    invites[index][field] = value;
    setFormData({ ...formData, invitations: invites });
  };

  const removeInvite = (index) => {
    setFormData({ ...formData, invitations: (formData.invitations || []).filter((_, i) => i !== index) });
  };

  const addPresenter = (user = null) => {
    const presenters = formData.presenters || [];
    const newPresenter = user ? {
      presenterAccountId: user.id,
      email: user.email || "",
      fullName: user.profile?.fullName || user.username || "",
      isConfirmed: true
    } : { email: "", fullName: "", isConfirmed: false };
    setFormData({ ...formData, presenters: [...presenters, newPresenter] });
  };

  const confirmPresenter = (index) => {
    const presenters = [...(formData.presenters || [])];
    if (!presenters[index].email) return;
    presenters[index].isConfirmed = true;
    setFormData({ ...formData, presenters: presenters });
  };

  const updatePresenter = (index, field, value) => {
    const presenters = [...(formData.presenters || [])];
    presenters[index][field] = value;
    setFormData({ ...formData, presenters });
  };

  const removePresenter = (index) => {
    setFormData({ ...formData, presenters: (formData.presenters || []).filter((_, i) => i !== index) });
  };

  const addSession = () => {
    const sessions = formData.sessions || [];
    setFormData({
      ...formData,
      sessions: [...sessions, {
        title: "",
        startTime: formData.startTime || "",
        endTime: formData.endTime || "",
        type: "KEYNOTE",
        orderIndex: sessions.length + 1,
        isConfirmed: false
      }]
    });
  };

  const confirmSession = (index) => {
    const sessions = [...(formData.sessions || [])];
    if (!sessions[index].title.trim()) return;
    sessions[index].isConfirmed = true;
    setFormData({ ...formData, sessions });
  };

  const updateSession = (index, field, value) => {
    const sessions = [...(formData.sessions || [])];
    sessions[index][field] = value;
    setFormData({ ...formData, sessions });
  };

  const removeSession = (index) => {
    const sessions = (formData.sessions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, sessions: sessions.map((s, i) => ({ ...s, orderIndex: i + 1 })) });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventTitle?.trim()) newErrors.eventTitle = "Tên không được để trống";
    if (!formData.startTime) newErrors.startTime = "Chưa chọn bắt đầu";
    if (!formData.endTime) newErrors.endTime = "Chưa chọn kết thúc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
    else import("react-toastify").then(({ toast }) => toast.error("Vui lòng hoàn thiện các trường bắt đầu bằng *"));
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* AI TOOLBAR */}
        <div style={{ background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 12, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", boxShadow: "0 2px 4px rgba(139, 92, 246, 0.1)" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>Công cụ hỗ trợ AI</div>
              <div style={{ fontSize: 12, color: "#7c3aed" }}>Tự động điền dữ liệu thông minh</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Tải lên tài liệu
              <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
            </label>
            <button onClick={handleSmartSuggestion} disabled={isAILoading} style={{ display: "flex", alignItems: "center", gap: 8, background: "#8b5cf6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              AI Gợi ý nhanh
            </button>
          </div>
        </div>

        {/* SECTIONS */}
        {isVisible('organization') && (
          <OrganizationSection
            formData={formData} setFormData={setFormData} errors={errors} orgs={orgs}
            showOrgAISuggestions={showOrgAISuggestions} setShowOrgAISuggestions={setShowOrgAISuggestions}
            showUserSuggestions={showUserSuggestions} setShowUserSuggestions={setShowUserSuggestions}
            systemUsers={systemUsers} loadingUsers={loadingUsers} searchKey={searchKey} setSearchKey={setSearchKey}
            fetchUsers={fetchUsers} addInvite={addInvite} updateInvite={updateInvite} removeInvite={removeInvite} confirmInvite={confirmInvite} term={term}
          />
        )}

        {isVisible('basic') && (
          <BasicInfoSection
            formData={formData} setFormData={setFormData} errors={errors} term={term}
            aiLoadingFields={aiLoadingFields} aiSuggestions={aiSuggestions}
            handleAIFieldSuggestion={handleAIFieldSuggestion} setAiSuggestions={setAiSuggestions}
          />
        )}

        {(isVisible('details') || isVisible('description') || isVisible('attendees')) && (
          <InteractionAndSettingsSection
            formData={formData} setFormData={setFormData} errors={errors} term={term}
            aiLoadingFields={aiLoadingFields} aiSuggestions={aiSuggestions}
            handleAIFieldSuggestion={handleAIFieldSuggestion} setAiSuggestions={setAiSuggestions}
            handleGenerateDescriptionWithAI={handleGenerateDescriptionWithAI}
          />
        )}

        {isVisible('sessions') && (
          <SessionsSection
            formData={formData} setFormData={setFormData} term={term}
            showSessionAISuggestions={showSessionAISuggestions} setShowSessionAISuggestions={setShowSessionAISuggestions}
            addSession={addSession} updateSession={updateSession} removeSession={removeSession} confirmSession={confirmSession}
          />
        )}

        {isVisible('presenters') && (
          <PresentersSection
            formData={formData} setFormData={setFormData} systemUsers={systemUsers} loadingUsers={loadingUsers}
            presenterSearchKey={presenterSearchKey} setPresenterSearchKey={setPresenterSearchKey}
            showPresenterSuggestions={showPresenterSuggestions} setShowPresenterSuggestions={setShowPresenterSuggestions}
            fetchUsers={fetchUsers} addPresenter={addPresenter} updatePresenter={updatePresenter} removePresenter={removePresenter} confirmPresenter={confirmPresenter}
          />
        )}

        {/* NAV BUTTONS */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <button onClick={handleNext} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 10, border: "none", background: "#1e1b4b", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(30, 27, 75, 0.2)" }}>
            Tiếp theo <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
