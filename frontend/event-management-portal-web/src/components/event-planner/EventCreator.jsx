import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ManualInputStep from "./ManualInputStep";
import LuckyDrawStep from "./LuckyDrawStep";
import InteractionStep from "./InteractionStep";
import { EventReviewStep } from "./EventReviewstep";
import { EventProgramStep } from "./Eventprogramstep";
import { exportToWord } from "./WordExporter";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";
import notificationService from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Check,
  Award,
  Users,
  Gift,
  MessageSquare,
  Plus,
  Sparkles,
  FileText,
  Info,
  CheckCircle,
  ChevronRight,
  FileUp,
  Loader2
} from "lucide-react";
import { extractDataFromDocx } from "../../services/docxImportService";

const STEPS = [
  { id: 1, label: "Thông tin cơ bản", icon: FileText },
  { id: 2, label: "Mô tả & Cài đặt", icon: Info },
  { id: 3, label: "Vòng quay may mắn", icon: Gift },
  { id: 4, label: "Tương tác & Q&A", icon: MessageSquare },
  { id: 5, label: "Xem trước & Hoàn tất", icon: CheckCircle },
];

const StepIcon = ({ id, active, completed, icon: Icon }) => {
  if (completed) {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white transition-all duration-300">
        <Check size={20} strokeWidth={3} />
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${active
        ? "bg-indigo-900 text-white shadow-lg shadow-indigo-200"
        : "bg-white text-slate-400 border border-slate-200"
        }`}
    >
      <Icon size={18} />
    </div>
  );
};

export const EventCreator = ({
  onBack,
  initialFormData = {},
  fromPlan = false,
  planId = null,
  isEdit = false,
  startAtStep = 1,
  forceEventMode = false
}) => {
  // Unified to 5 steps
  const { user } = useAuth();
  const isPlanMode = !forceEventMode && !fromPlan && !planId && !isEdit;
  
  const activeSteps = STEPS.map(s => {
    if (s.id === 5) {
      const isAuthority = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
      return { ...s, label: (isAuthority && !isPlanMode) ? "Xem trước & Xuất bản" : "Xem trước & Gửi duyệt" };
    }
    return s;
  });
  const [step, setStep] = useState(startAtStep);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const fillSampleData = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
    const deadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    const sample = {
      eventTitle: "Hội thảo Công nghệ AI & Tương lai 2026",
      eventType: "WORKSHOP",
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
      registrationDeadline: deadline.toISOString().slice(0, 16),
      location: "Hội trường A, Cơ sở Nguyễn Văn Bảo",
      eventPurpose: "Chia sẻ các xu hướng mới nhất về Trí tuệ nhân tạo (AI) và cách ứng dụng vào học tập, nghiên cứu cho sinh viên IUH.",
      eventTopic: "Làm chủ AI để bứt phá trong học tập và sự nghiệp",
      targetObjects: ["Sinh viên tất cả các khóa", "Người yêu thích công nghệ", "Thành viên các CLB học thuật"],
      maxParticipants: 500,
      orgSelectionMode: "new",
      newOrg: {
        name: "CLB Kỹ năng - IUH",
        email: "kynang@iuh.edu.vn",
        phone: "0901234567",
        officeLocation: "Phòng H3.1",
        type: "CLUB",
        description: "Câu lạc bộ kỹ năng dành cho sinh viên IUH"
      },
      invitations: [
        { inviteeName: "Nguyễn Văn A", inviteeEmail: "hiennguyenbuitan@gmail.com", inviteePosition: "Giảng viên", targetRole: "ADVISOR", message: "Mời thầy làm cố vấn chuyên môn" }
      ],
      presenters: [
        { fullName: "Nguyễn Văn A", email: "hiennguyenbuitan@gmail.com", position: "Chuyên gia AI", department: "Google Brain", session: "Tương lai của LLMs", bio: "Hơn 10 năm kinh nghiệm trong lĩnh vực học máy." }
      ],
      sessions: [
        { title: "Đón khách", type: "BREAK", startTime: startTime.toISOString().slice(0, 16), endTime: new Date(startTime.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16), room: "Sảnh", description: "Teabreak & Check-in", orderIndex: 1 },
        { title: "Keynote: AI 2026", type: "KEYNOTE", startTime: new Date(startTime.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16), endTime: new Date(startTime.getTime() + 90 * 60 * 1000).toISOString().slice(0, 16), room: "Hội trường A", description: "Bài phát biểu chính", orderIndex: 2 }
      ],
      interactionSettings: {
        enableQA: false,
        enablePolls: false,
        allowUserQuestions: false,
      },
      hasLuckyDraw: true,
      luckyDrawTitle: "Quay số may mắn: Đêm hội AI 2026",
      luckyDrawDescription: "Tham gia chương trình quay số để có cơ hội nhận được các phần quà công nghệ giá trị từ nhà tài trợ và ban tổ chức.",
      luckyDrawStartTime: startTime.toISOString().slice(0, 16),
      luckyDrawEndTime: endTime.toISOString().slice(0, 16),
      allowMultipleWins: false,
      prizes: [
        { id: 1, name: "iPad Pro M4", count: 1, rate: 1, description: "Máy tính bảng mạnh mẽ nhất với màn hình OLED Tandem và chip M4 siêu nhanh." },
        { id: 2, name: "Bàn phím cơ Keychron", count: 3, rate: 5, description: "Bàn phím cơ không dây hoàn hảo cho làm việc đa thiết bị." },
        { id: 3, name: "Chuột Logitech MX Master 3S", count: 5, rate: 10, description: "Chuột ergonomic biểu tượng, cuộn MagSpeed và cảm biến 8K DPI." },
        { id: 4, name: "Voucher Steam 200k", count: 20, rate: 30, description: "Thẻ quà tặng trị giá 200.000đ áp dụng cho tất cả trò chơi trên Steam." },
        { id: 'consolation', name: "Chúc bạn may mắn lần sau", count: 999, rate: 54, description: "Cảm ơn bạn đã quan tâm, hẹn gặp lại ở sự kiện lần sau nhé!", isDefault: true }
      ],
    };
    setFormData(sample);
    toast.info("✨ Đã tự động điền dữ liệu mẫu!");
  };

  const handleDocxImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      toast.error("Vui lòng chọn file định dạng .docx");
      return;
    }

    setIsImporting(true);
    try {
      toast.info("⏳ Đang phân tích nội dung kế hoạch bằng AI...");
      const extracted = await extractDataFromDocx(file);

      if (extracted) {
        // Map AI result to our form structure
        const mappedData = {
          eventTitle: extracted.title || formData.eventTitle,
          eventTopic: extracted.subject || formData.eventTopic,
          eventPurpose: extracted.purpose || extracted.description || formData.eventPurpose,
          location: extracted.suggestedLocation || formData.location,
          maxParticipants: extracted.estimatedParticipants || formData.maxParticipants,
        };

        // Handle datetimes if present
        if (extracted.suggestedStartTime) {
          mappedData.startTime = new Date(extracted.suggestedStartTime).toISOString().slice(0, 16);
        }
        if (extracted.suggestedEndTime) {
          mappedData.endTime = new Date(extracted.suggestedEndTime).toISOString().slice(0, 16);
        }

        updateFormData(mappedData);
        toast.success("✨ Đã trích xuất thông tin thành công!");
      }
    } catch (err) {
      console.error("Docx import error:", err);
      toast.error("Lỗi khi nhập dữ liệu: " + err.message);
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = "";
    }
  };

  const sendNotifications = async (eventId, eventTitle, isPublished) => {
    try {
      if (!user) return;

      await notificationService.sendNotification({
        userProfileId: user?.accountId || user?.id,
        title: isPublished ? "Sự kiện đã được xuất bản" : "Sự kiện mới đang chờ duyệt",
        message: isPublished
          ? `Chúc mừng! Sự kiện "${eventTitle}" của bạn đã được xuất bản thành công.`
          : `Sự kiện "${eventTitle}" của bạn đã được gửi và đang chờ quản trị viên phê duyệt.`,
        type: isPublished ? "EVENT_APPROVED" : "EVENT_SUBMITTED",
        relatedEntityId: eventId,
        relatedEntityType: "EVENT"
      });
    } catch (err) {
      console.error("Lỗi gửi thông báo:", err);
    }
  };

  const handleSubmit = async (finalData) => {
    setIsSubmitting(true);
    try {
      const accountId = user ? user.id : null;

      // Check roles for auto-approval
      const role = user?.role || "";
      const isSuperAdmin = role === 'SUPER_ADMIN';

      const toISO = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.toISOString();
      };

      let organizationId = formData.organizationId;

      // Handle new organization creation
      if (formData.orgSelectionMode === 'new' && formData.newOrg) {
        try {
          const orgRes = await eventService.createOrganization({
            ...formData.newOrg,
            ownerAccountId: accountId
          });
          organizationId = orgRes.data.id;
        } catch (orgError) {
          console.error("Lỗi tạo ban tổ chức:", orgError);
          toast.error("Không thể tạo ban tổ chức mới. Vui lòng thử lại.");
          return;
        }
      }

      const data = finalData || formData;
      const payload = {
        title: (data.eventTitle || data.title || "").trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        eventTopic: (data.eventTopic || "").trim(),
        location: (data.location || "").trim(),
        eventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        type: data.eventType || data.type || "OTHER",
        startTime: toISO(data.startTime),
        endTime: toISO(data.endTime),
        registrationDeadline: toISO(data.registrationDeadline),
        maxParticipants: Number(data.maxParticipants) || 50,
        hasLuckyDraw: false,
        faculty: data.faculty || "",
        major: data.major || "",
        organizerUnit: data.organizerUnit || data.faculty || "",
        notes: (data.notes || "").trim(),
        additionalInfo: (data.additionalInfo || "").trim(),
        coverImage: data.coverImage || "",
        createdByAccountId: accountId,
        // Plan mode: "Gửi phê duyệt" submits with PLAN_PENDING_APPROVAL
        status: isPlanMode ? 'PLAN_PENDING_APPROVAL' : ((user?.role === 'SUPER_ADMIN') ? 'PUBLISHED' : 'EVENT_PENDING_APPROVAL'),
        approvedByAccountId: (user?.role === 'SUPER_ADMIN' && !isPlanMode) ? accountId : null,
        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects.map(obj => typeof obj === 'string' ? { type: 'CATEGORY', name: obj } : obj)
          : [],
        recipients: Array.isArray(data.recipients)
          ? data.recipients.map(r => typeof r === 'string' ? { name: r } : r)
          : [],
        organization: { id: organizationId },
        invitations: data.invitations || [],
        presenters: data.presenters || [],
        sessions: data.sessions || [],
        prizes: data.prizes || [],
        interactions: data.interactions || [],
        interactionSettings: data.interactionSettings || {},
        templateId: data.templateId || null,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      let response;
      const isEditMode = formData.id && (formData.status && !formData.status.startsWith('PLAN_'));

      if (isEditMode) {
        response = await eventService.updateEvent(formData.id, payload);
      } else if (planId || fromPlan) {
        const id = planId || formData.planId || formData.id;
        response = await eventService.createEventFromPlan(id, payload);
      } else {
        response = await eventService.createEvent({
          event: payload,
          invitations: payload.invitations
        });
      }

      if (response.data?.id) {
        await sendNotifications(response.data.id, payload.title, isSuperAdmin);

        // Lưu dữ liệu Vòng quay may mắn nếu có (only for events, not plans)
        if (data.hasLuckyDraw && !isPlanMode) {
          try {
            const luckyDrawPayload = {
              title: data.luckyDrawTitle || `Vòng quay may mắn - ${payload.title}`,
              description: data.luckyDrawDescription || "Tham gia để nhận những phần quà hấp dẫn từ sự kiện!",
              startTime: toISO(data.luckyDrawStartTime) || payload.startTime,
              endTime: toISO(data.luckyDrawEndTime) || payload.endTime,
              allowMultipleWins: data.allowMultipleWins || false,
              eventId: response.data.id,
              prizes: (data.prizes || []).map(p => ({
                name: p.name,
                description: p.description || "",
                quantity: p.count || p.quantity || 1,
                winProbabilityPercent: p.rate || p.winProbabilityPercent || 10
              }))
            };
            await luckyDrawService.create(luckyDrawPayload);
          } catch (luckyError) {
            console.error("Lỗi tạo vòng quay:", luckyError);
            toast.warning("Sự kiện đã tạo nhưng không thể khởi tạo vòng quay. Bạn có thể cấu hình sau.");
          }
        }
      }

      if (isPlanMode) {
        toast.success("✅ Kế hoạch đã được xử lý!");
      } else if (isEditMode) {
        toast.success("✅ Đã cập nhật thông tin sự kiện!");
      } else if (isSuperAdmin) {
        toast.success("✅ Sự kiện đã được xuất bản trực tiếp!");
      } else {
        toast.success("✅ Gửi phê duyệt thành công!");
      }
      onBack();
    } catch (error) {
      console.error("❌ Lỗi:", error.response?.data || error);
      toast.error("❌ Lỗi: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== PLAN-SPECIFIC HANDLERS =====
  const handleSaveDraft = async (data) => {
    try {
      const accountId = user?.id || null;
      const toISO = (d) => { if (!d) return null; const dt = new Date(d); return isNaN(dt) ? null : dt.toISOString(); };
      let organizationId = data.organizationId;
      if (data.orgSelectionMode === 'new' && data.newOrg) {
        const orgRes = await eventService.createOrganization({ ...data.newOrg, ownerAccountId: accountId });
        organizationId = orgRes.data.id;
      }
      const payload = {
        title: (data.eventTitle || data.title || "").trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        eventTopic: (data.eventTopic || "").trim(),
        location: (data.location || "").trim(),
        eventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        type: data.eventType || data.type || "OTHER",
        startTime: toISO(data.startTime),
        endTime: toISO(data.endTime),
        registrationDeadline: toISO(data.registrationDeadline),
        maxParticipants: Number(data.maxParticipants) || 50,
        hasLuckyDraw: false,
        faculty: data.faculty || "",
        major: data.major || "",
        notes: (data.notes || "").trim(),
        coverImage: data.coverImage || "",
        createdByAccountId: accountId,
        status: 'DRAFT',
        organization: { id: organizationId },
        invitations: data.invitations || [],
        presenters: data.presenters || [],
        sessions: data.sessions || [],
        templateId: data.templateId || null,
        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects.map(obj => typeof obj === 'string' ? { type: 'CATEGORY', name: obj } : obj) : [],
      };
      await eventService.createEvent({ event: payload, invitations: payload.invitations });
      toast.success("✅ Đã lưu bản nháp kế hoạch!");
      onBack();
    } catch (err) {
      toast.error("Lỗi lưu nháp: " + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  const handleSaveTemplate = async (data) => {
    try {
      const templatePayload = {
        templateName: (data.eventTitle || data.title || "Mẫu chưa đặt tên").trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        defaultTitle: (data.eventTitle || data.title || "").trim(),
        defaultLocation: data.location || "",
        defaultEventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        defaultMaxParticipants: Number(data.maxParticipants) || 50,
        faculty: data.faculty || "",
        major: data.major || "",
        themes: data.themes || (data.eventTopic ? [data.eventTopic] : []),
        visibility: "PRIVATE",
        configData: {
          sessions: data.sessions || [],
          presenters: data.presenters || [],
          targetObjects: data.targetObjects || [],
          interactionSettings: data.interactionSettings || {},
          hasLuckyDraw: data.hasLuckyDraw || false,
          notes: data.notes || "",
        },
      };
      await eventService.createTemplate(templatePayload);
      toast.success("✅ Đã lưu bản mẫu từ kế hoạch hiện tại!");
    } catch (err) {
      toast.error("Lỗi lưu mẫu: " + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  const handleExportWord = async (data) => {
    try {
      await exportToWord({
        ...data,
        eventTitle: data.eventTitle || data.title,
        eventPurpose: data.eventPurpose || data.description,
        createdByName: user?.profile?.fullName || user?.username || "",
      }, user?.accountId || user?.id);
      toast.success("✅ Đã xuất file Word!");
    } catch (err) {
      toast.error("Lỗi xuất Word: " + err.message);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setStep(1);
    toast.info("🔄 Đã làm mới toàn bộ form!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="fixed top-16 left-72 right-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-extrabold text-indigo-950 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Sparkles size={22} fill="currentColor" />
                </div>
                {isEdit ? "Cập nhật sự kiện" : (isPlanMode ? "Tạo Kế Hoạch Mới" : "Tạo Sự Kiện Mới")}
              </h1>
              {isPlanMode && formData._templateName && (
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  📌 Từ mẫu: {formData._templateName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'SUPER_ADMIN' && (
                <button
                  onClick={fillSampleData}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all"
                >
                  <Sparkles size={16} /> Dữ liệu mẫu
                </button>
              )}

              <label className={`flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-sm ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  className="hidden"
                  accept=".docx"
                  onChange={handleDocxImport}
                  disabled={isImporting}
                />
                {isImporting ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  <><FileUp size={16} /> Nhập từ Docx (AI)</>
                )}
              </label>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-all"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Stepper Section */}
        <div className="px-8 pb-4">
          <div className="max-w-5xl mx-auto pt-4 px-4">
            <div className="relative flex justify-between">
              {activeSteps.map((s, idx) => {
                const active = step === s.id;
                const completed = step > s.id;
                const isLast = idx === activeSteps.length - 1;

                return (
                  <div key={s.id} className="relative z-10 flex items-center group" style={{ flex: isLast ? '0 0 auto' : '1' }}>
                    <div className="flex flex-col items-center">
                      <StepIcon id={s.id} active={active} completed={completed} icon={s.icon} />
                      <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${active ? "text-indigo-900" : completed ? "text-emerald-600" : "text-slate-500"}`}>
                        {s.label}
                      </span>
                    </div>

                    {!isLast && (
                      <div className="flex-1 px-2 flex items-center justify-center mb-6">
                        <ChevronRight
                          size={16}
                          className={`transition-all duration-500 ${completed ? "text-emerald-500" : "text-slate-300"}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-[190px] pb-6 w-full">
        <div className="min-h-[600px]">
          {step === 1 && (
            <ManualInputStep
              formData={formData}
              setFormData={updateFormData}
              onBack={onBack}
              onNext={(data) => {
                updateFormData(data);
                setStep(2);
              }}
              activeSections={['organization', 'basic']}
              isPlanMode={isPlanMode}
            />
          )}

          {step === 2 && (
            <ManualInputStep
              formData={formData}
              setFormData={updateFormData}
              onBack={() => setStep(1)}
              onNext={(data) => {
                updateFormData(data);
                setStep(isPlanMode ? 3 : 3);
              }}
              activeSections={['details', 'description', 'image', 'attendees']}
              isPlanMode={isPlanMode}
            />
          )}

          {step === 3 && (
            <LuckyDrawStep
              formData={formData}
              setFormData={updateFormData}
              onBack={() => setStep(2)}
              onNext={(data) => {
                updateFormData(data);
                setStep(4);
              }}
            />
          )}

          {step === 4 && (
            <InteractionStep
              formData={formData}
              setFormData={updateFormData}
              onBack={() => setStep(3)}
              onNext={(data) => {
                updateFormData(data);
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <EventReviewStep
              formData={formData}
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isEdit={isEdit}
              isPlanMode={isPlanMode}
              onSaveDraft={handleSaveDraft}
              onSaveTemplate={handleSaveTemplate}
              onExportWord={handleExportWord}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
