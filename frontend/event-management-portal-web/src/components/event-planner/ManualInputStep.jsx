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
import { useAuth } from "../../context/AuthContext";
import { safeParseAIJson, formatAIDate } from "../../utils/aiUtils";
import { toast } from "react-toastify";

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
  const { user } = useAuth();
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
      const res = await authService.getAllAccounts();
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

  useEffect(() => {
    if (user) {
      const leaderAccountId = user.accountId || user.id;
      const leaderEmail = user.email;
      const invites = formData.invitations || [];
      const hasLeader = invites.some(inv =>
        inv.inviteeAccountId === leaderAccountId ||
        (inv.inviteeEmail && leaderEmail && inv.inviteeEmail.toLowerCase() === leaderEmail.toLowerCase())
      );
      if (!hasLeader) {
        const leaderInvite = {
          inviteeAccountId: leaderAccountId,
          inviteeEmail: leaderEmail || "",
          inviteeName: user.fullName || user.username || "Chưa rõ tên",
          targetRole: "LEADER",
          message: "Người tạo sự kiện",
          isConfirmed: true,
          isCreator: true
        };
        setFormData({
          ...formData,
          invitations: [leaderInvite, ...invites]
        });
      }
    }
  }, [user, formData.invitations?.length]);

  // --- AI HANDLERS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAILoading(true);
    try {
      const uploadRes = await eventService.localAi.parseFile(file);
      const text = uploadRes.data.message;
      const extractRes = await eventService.aiPlanning.generateFromRawText(text);

      const aiReply = extractRes.data?.reply;
      const resultText = typeof aiReply === 'object' ? aiReply.reply : aiReply;

      const data = safeParseAIJson(resultText);

      if (data) {
        setFormData(prev => ({
          ...prev,
          eventTitle: data.title || prev.eventTitle,
          description: data.description || prev.description,
          location: data.suggestedLocation || prev.location,
          maxParticipants: data.estimatedParticipants || prev.maxParticipants,
          startTime: formatAIDate(data.suggestedStartTime) || prev.startTime,
          endTime: formatAIDate(data.suggestedEndTime) || prev.endTime,
          registrationDeadline: formatAIDate(data.registrationDeadline) || prev.registrationDeadline,
          sessions: (data.programItems || prev.sessions).map(s => ({
            ...s,
            startTime: formatAIDate(s.startTime),
            endTime: formatAIDate(s.endTime)
          }))
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

      const res = await eventService.localAi.chat(prompt);
      const aiReply = res.data?.reply;
      const resultText = typeof aiReply === 'object' ? aiReply.reply : aiReply;

      const data = safeParseAIJson(resultText);

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
      console.error("Lỗi Smart Suggestion:", err);
      import("react-toastify").then(({ toast }) => toast.error("Không thể lấy gợi ý từ AI."));
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

      const res = await eventService.localAi.chat(prompt);
      const aiReply = res.data?.reply;
      const aiContent = typeof aiReply === 'object' ? aiReply.reply : aiReply;

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

  const handleAIPresenterSuggestion = async () => {
    setIsAILoading(true);
    try {
      const prompt = `Dựa trên dữ liệu thống kê EVENT_DB, đặc biệt là danh sách [THỐNG KÊ DIỄN GIẢ THÂN QUEN] (những người tôi đã từng mời làm diễn giả trong các sự kiện tôi đã tạo), 
                     hãy gợi ý 5 người (AccountID) tham gia làm diễn giả nhiều nhất để tiếp tục mời cho sự kiện "${formData.eventTitle}".
                     Yêu cầu: Trả về JSON duy nhất có cấu trúc: {"suggestedAccountIds": ["id1", "id2", ...]}.`;

      const res = await eventService.localAi.chat(prompt, true, user?.id || user?.accountId);
      const aiReply = res.data?.reply;
      const resultText = typeof aiReply === 'object' ? aiReply.reply : aiReply;

      let ids = [];
      try {
        const data = typeof resultText === 'string' ? JSON.parse(resultText) : resultText;
        ids = data.suggestedAccountIds || [];
      } catch (e) {
        const match = resultText.match(/\["[\s\S]*"\]/);
        if (match) ids = JSON.parse(match[0]);
      }

      if (ids.length > 0) {
        setLoadingUsers(true);
        setShowPresenterSuggestions(true);
        try {
          const profileRes = await authService.getUsersByIds(ids);
          setSystemUsers(profileRes.data || []);
          import("react-toastify").then(({ toast }) => toast.info("AI đã tìm thấy các gương mặt triển vọng dựa trên lịch sử tham gia!"));
        } catch (err) {
          console.error("Lỗi lấy profile diễn giả gợi ý:", err);
        } finally {
          setLoadingUsers(false);
        }
      } else {
        import("react-toastify").then(({ toast }) => toast.warn("AI không tìm thấy người tham gia phù hợp để gợi ý."));
      }
    } catch (err) {
      console.error("Lỗi gợi ý diễn giả AI:", err);
      import("react-toastify").then(({ toast }) => toast.error("Lỗi kết nối AI khi gợi ý diễn giả."));
    } finally {
      setIsAILoading(false);
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
      inviteeAccountId: user.accountId || user.id,
      inviteeEmail: user.email || "",
      inviteeName: user.fullName || user.profile?.fullName || user.username || "",
      targetRole: "MEMBER",
      message: "",
      isConfirmed: true
    } : { inviteeAccountId: null, inviteeEmail: "", inviteeName: "", targetRole: "MEMBER", message: "", isConfirmed: false };
    setFormData({ ...formData, invitations: [...invites, newInvite] });
  };

  const confirmInvite = async (index) => {
    const invites = [...(formData.invitations || [])];
    const email = invites[index].inviteeEmail?.trim();
    if (!email) {
      toast.error("Vui lòng nhập Email người được mời!");
      return;
    }

    const invite = invites[index];
    if (!invite.message?.trim()) {
      toast.error("Vui lòng nhập Lời nhắn cho thành viên!");
      return;
    }

    const myEmail = user?.email || user?.account?.email;
    if (myEmail && email.toLowerCase() === myEmail.toLowerCase()) {
      toast.error("Không thể mời chính bạn vì bạn là người tạo sự kiện!");
      return;
    }

    try {
      const checkRes = await authService.checkEmail(email);
      const exists = checkRes.data === true;

      if (!exists) {
        toast.error(`Email ${email} không tồn tại trong hệ thống!`);
        return;
      }

      try {
        const searchRes = await authService.searchUsers(email);
        const users = searchRes.data || [];
        const exactUser = users.find(u =>
          (u.email || "").toLowerCase() === email.toLowerCase() ||
          (u.account?.email || "").toLowerCase() === email.toLowerCase()
        );

        if (exactUser) {
          invites[index].inviteeAccountId = exactUser.accountId || exactUser.id;
          invites[index].accountId = exactUser.accountId || exactUser.id;
          invites[index].inviteeName = exactUser.fullName || exactUser.username || email.split("@")[0] || "";
        }
      } catch (err) {
        console.warn("Không thể tải profile cho email", email);
      }

      invites[index].isConfirmed = true;
      setFormData({ ...formData, invitations: invites });

      toast.success(`Đã xác nhận thành viên: ${email}`);
    } catch (err) {
      console.error("Lỗi xác thực email:", err);
      toast.error(`Lỗi khi kiểm tra email ${email}. Vui lòng thử lại!`);
    }
  };

  const updateInvite = (index, field, value) => {
    const invite = (formData.invitations || [])[index];
    const isCreator = invite && (
      invite.isCreator ||
      invite.inviteeAccountId === (user?.accountId || user?.id) ||
      (invite.inviteeEmail && user?.email && invite.inviteeEmail.toLowerCase() === user.email.toLowerCase())
    );
    if (isCreator) {
      toast.error("Không thể sửa thông tin của Trưởng ban tổ chức (Người tạo)!");
      return;
    }
    const invites = [...(formData.invitations || [])];
    invites[index][field] = value;
    setFormData({ ...formData, invitations: invites });
  };

  const removeInvite = (index) => {
    const invite = (formData.invitations || [])[index];
    const isCreator = invite && (
      invite.isCreator ||
      invite.inviteeAccountId === (user?.accountId || user?.id) ||
      (invite.inviteeEmail && user?.email && invite.inviteeEmail.toLowerCase() === user.email.toLowerCase())
    );
    if (isCreator) {
      toast.error("Không thể xóa Trưởng ban tổ chức (Người tạo)!");
      return;
    }
    setFormData({ ...formData, invitations: (formData.invitations || []).filter((_, i) => i !== index) });
  };

  const addPresenter = (selectedUser = null) => {
    if (selectedUser && user && (selectedUser.email || "").toLowerCase() === (user.email || "").toLowerCase()) {
      toast.error("Không thể thêm chính mình (Người tạo) làm diễn giả!");
      return;
    }
    const presenters = formData.presenters || [];
    const newPresenter = selectedUser ? {
      presenterAccountId: selectedUser.accountId || selectedUser.id,
      accountId: selectedUser.accountId || selectedUser.id,
      email: selectedUser.email || "",
      fullName: selectedUser.fullName || selectedUser.profile?.fullName || selectedUser.username || "",
      message: "",
      bio: "",
      isConfirmed: true
    } : { email: "", fullName: "", message: "", bio: "", isConfirmed: false };
    setFormData({ ...formData, presenters: [...presenters, newPresenter] });
  };

  const confirmPresenter = async (index) => {
    const presenters = [...(formData.presenters || [])];
    const email = presenters[index].email?.trim();
    if (!email) {
      toast.error("Vui lòng nhập Email người trình bày!");
      return;
    }

    if (user && email.toLowerCase() === (user.email || "").toLowerCase()) {
      toast.error("Không thể thêm chính mình (Người tạo) làm diễn giả!");
      return;
    }

    const presenter = presenters[index];

    if (!presenter.message?.trim() && !presenter.bio?.trim()) {
      toast.error("Vui lòng nhập Lời nhắn cho diễn giả!");
      return;
    }

    if (!presenter.targetSessionId || presenter.targetSessionId === "") {
      toast.error("Vui lòng chọn Phiên đảm nhiệm cho diễn giả!");
      return;
    }

    try {
      const checkRes = await authService.checkEmail(email);
      const exists = checkRes.data === true;

      if (!exists) {
        toast.error(`Email ${email} không tồn tại trong hệ thống!`);
        return;
      }

      try {
        const searchRes = await authService.searchUsers(email);
        const users = searchRes.data || [];
        const exactUser = users.find(u =>
          (u.email || "").toLowerCase() === email.toLowerCase() ||
          (u.account?.email || "").toLowerCase() === email.toLowerCase()
        );

        if (exactUser) {
          presenters[index].presenterAccountId = exactUser.accountId || exactUser.id;
          presenters[index].accountId = exactUser.accountId || exactUser.id;
          presenters[index].fullName = exactUser.fullName || exactUser.username || email.split("@")[0] || "";
        }
      } catch (err) {
        console.warn("Không thể tải profile cho diễn giả", email);
      }

      presenters[index].isConfirmed = true;
      setFormData({ ...formData, presenters });

      toast.success(`Đã xác nhận diễn giả: ${email}`);
    } catch (err) {
      console.error("Lỗi xác thực email diễn giả:", err);
      toast.error(`Lỗi khi kiểm tra email ${email}. Vui lòng thử lại!`);
    }
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

  const confirmAllSessions = () => {
    const sessions = [...(formData.sessions || [])];
    const invalidSession = sessions.find(s => !s.title?.trim());
    if (invalidSession) {
      toast.error(`Phiên thứ ${invalidSession.orderIndex} chưa có Tên phiên! Vui lòng nhập tên phiên trước.`);
      return;
    }
    const updated = sessions.map(s => ({ ...s, isConfirmed: true }));
    setFormData({ ...formData, sessions: updated });
    toast.success("Đã xác nhận tất cả các phiên thành công!");
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

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "0" }}>
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
            confirmAllSessions={confirmAllSessions}
          />
        )}

        {isVisible('presenters') && (
          <PresentersSection
            formData={formData} setFormData={setFormData} systemUsers={systemUsers} loadingUsers={loadingUsers}
            presenterSearchKey={presenterSearchKey} setPresenterSearchKey={setPresenterSearchKey}
            showPresenterSuggestions={showPresenterSuggestions} setShowPresenterSuggestions={setShowPresenterSuggestions}
            fetchUsers={fetchUsers}
            handleAIPresenterSuggestion={handleAIPresenterSuggestion}
            addPresenter={addPresenter}
            updatePresenter={updatePresenter} removePresenter={removePresenter} confirmPresenter={confirmPresenter}
          />
        )}
      </div>
    </div>
  );
}
