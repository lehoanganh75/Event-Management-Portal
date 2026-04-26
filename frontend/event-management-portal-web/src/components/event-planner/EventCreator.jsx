import React, { useState } from "react";
import { toast } from "react-toastify";
import ManualInputStep from "./ManualInputStep";
import LuckyDrawStep from "./LuckyDrawStep";
import InteractionStep from "./InteractionStep";
import { EventReviewStep } from "./EventReviewstep";
import { EventProgramStep } from "./Eventprogramstep";
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
  ChevronRight
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Thông tin cơ bản", icon: FileText },
  { id: 2, label: "Mô tả & Cài đặt", icon: Info },
  { id: 3, label: "Vòng quay may mắn", icon: Gift },
  { id: 4, label: "Tương tác & Q&A", icon: MessageSquare },
  { id: 5, label: "Xem trước & Xuất bản", icon: CheckCircle },
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
  planId = null
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const fillSampleData = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày tới
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // Kéo dài 4 tiếng
    const deadline = new Date(startTime.getTime() - 2 * 24 * 60 * 60 * 1000); // Hạn đăng ký trước 2 ngày

    const sample = {
      eventTitle: "Hội thảo Công nghệ AI & Tương lai 2026",
      eventType: "WORKSHOP",
      eventMode: "OFFLINE",
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
      registrationDeadline: deadline.toISOString().slice(0, 16),
      location: "Hội trường A, Cơ sở Nguyễn Văn Bảo, IUH",
      eventPurpose: "Chia sẻ các xu hướng mới nhất về Trí tuệ nhân tạo (AI), Generative AI và cách ứng dụng thực tiễn vào học tập, nghiên cứu cho sinh viên.",
      eventTopic: "Làm chủ AI để bứt phá trong kỷ nguyên số",
      targetObjects: [
        { type: "CATEGORY", name: "Sinh viên Công nghệ thông tin" },
        { type: "CATEGORY", name: "Người yêu thích AI & Robot" },
        { type: "CATEGORY", name: "Thành viên các CLB học thuật" }
      ],
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
        {
          inviteeEmail: "hnguyenbuitan2810@gmail.com",
          targetRole: "MEMBER",
          message: "Trân trọng kính mời Thầy tham gia với vai trò cố vấn chuyên môn cho sự kiện."
        }
      ],
      presenters: [
        {
          email: "hnguyenbuitan@gmail.com",
          session: "ALL",
          bio: "Trân trọng kính mời Thầy tham gia với vai trò diễn giả chính cho hội thảo công nghệ AI."
        }
      ],
      sessions: [
        {
          title: "Đón khách & Check-in",
          type: "BREAK",
          startTime: startTime.toISOString().slice(0, 16),
          endTime: new Date(startTime.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16),
          room: "Sảnh Hội trường A",
          description: "Teabreak & nhận tài liệu hội thảo",
          orderIndex: 1
        },
        {
          title: "Keynote: Kỷ nguyên AI 2026",
          type: "KEYNOTE",
          startTime: new Date(startTime.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16),
          endTime: new Date(startTime.getTime() + 90 * 60 * 1000).toISOString().slice(0, 16),
          room: "Hội trường A",
          description: "Bài phát biểu chính về xu hướng AI",
          orderIndex: 2
        }
      ],
      interactionSettings: {
        enableQA: true,
        enablePolls: true,
        allowUserQuestions: true,
      },
      hasLuckyDraw: true,
      luckyDrawTitle: "Quay số may mắn: Đêm hội AI 2026",
      luckyDrawDescription: "Tham gia chương trình quay số để có cơ hội nhận được các phần quà công nghệ giá trị từ nhà tài trợ.",
      luckyDrawStartTime: new Date(startTime.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16),
      luckyDrawEndTime: endTime.toISOString().slice(0, 16),
      allowMultipleWins: false,
      prizes: [
        { id: 1, name: "iPad Pro M4", count: 1, rate: 1, description: "Máy tính bảng mạnh mẽ nhất với chip M4." },
        { id: 2, name: "Bàn phím Keychron K2", count: 3, rate: 5, description: "Bàn phím cơ không dây chất lượng." },
        { id: 3, name: "Chuột Logitech MX Master 3S", count: 5, rate: 10, description: "Chuột ergonomic tốt nhất." },
        { id: 'consolation', name: "Chúc bạn may mắn lần sau", count: 999, rate: 84, description: "Cảm ơn bạn đã tham gia!", isDefault: true }
      ],
    };

    setFormData(sample);
    toast.info("✨ Đã tự động điền dữ liệu mẫu chất lượng cao!");
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

      const data = finalData || formData;
      let organizationId = data.organizationId;

      // Handle new organization creation
      if (data.orgSelectionMode === 'new' && data.newOrg) {
        try {
          const orgRes = await eventService.createOrganization({
            ...data.newOrg,
            ownerAccountId: accountId
          });
          organizationId = orgRes.data.id;
        } catch (orgError) {
          console.error("Lỗi tạo ban tổ chức:", orgError);
          toast.error("Không thể tạo ban tổ chức mới. Vui lòng thử lại.");
          return;
        }
      }

      // Map presenters for Event entity (Backend handles invitations if accountId is missing)
      const mappedPresenters = (data.presenters || []).map(p => ({
        fullName: p.fullName,
        email: p.email,
        bio: p.bio,
        targetSessionName: p.session || p.targetSessionName,
        presenterAccountId: p.accountId || p.presenterAccountId
      }));

      const eventPayload = {
        title: (data.title || data.eventTitle || "").trim(),
        description: (data.description || data.eventPurpose || "").trim(),
        eventTopic: (data.eventTopic || "").trim(),
        location: (data.location || "").trim(),
        eventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        type: data.type || data.eventType || "OTHER",
        startTime: toISO(data.startTime),
        endTime: toISO(data.endTime),
        registrationDeadline: toISO(data.registrationDeadline),
        maxParticipants: Number(data.maxParticipants) || 50,
        hasLuckyDraw: false, // Để lucky-draw-service tự cập nhật sau
        faculty: data.faculty || "",
        major: data.major || "",
        organizerUnit: data.organizerUnit || data.faculty || "",
        notes: (data.notes || "").trim(),
        coverImage: data.coverImage || "",
        createdByAccountId: accountId,
        status: (user?.role === 'SUPER_ADMIN') ? 'PUBLISHED' : 'EVENT_PENDING_APPROVAL',
        approvedByAccountId: (user?.role === 'SUPER_ADMIN') ? accountId : null,
        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects.map(obj => typeof obj === 'string' ? { type: 'CATEGORY', name: obj } : obj)
          : [],
        recipients: Array.isArray(data.recipients)
          ? data.recipients.map(r => typeof r === 'string' ? { name: r } : r)
          : [],
        organization: { id: organizationId },
        sessions: (data.sessions || []).map(s => ({ ...s, startTime: toISO(s.startTime), endTime: toISO(s.endTime) })),
        presenters: mappedPresenters,
        interactionSettings: data.interactionSettings || {},
      };

      // Clean up payload
      Object.keys(eventPayload).forEach((key) => {
        if (eventPayload[key] === undefined || eventPayload[key] === null) {
          delete eventPayload[key];
        }
      });

      let response;
      if (planId || fromPlan) {
        const id = planId || data.planId || data.id;
        response = await eventService.createEventFromPlan(id, eventPayload);
      } else {
        // Construct the CreateEventRequest structure
        const createRequest = {
          event: eventPayload,
          organizerIds: data.organizerIds || [],
          presenterIds: (data.presenters || [])
            .filter(p => p.accountId)
            .map(p => ({ accountId: p.accountId, bio: p.bio, session: p.session })),
          invitations: data.invitations || []
        };
        response = await eventService.createEvent(createRequest);
      }


      if (response.data?.id) {
        await sendNotifications(response.data.id, eventPayload.title, isSuperAdmin);

        // Lưu dữ liệu Vòng quay may mắn nếu có
        if (data.hasLuckyDraw) {
          try {
            const luckyDrawPayload = {
              title: data.luckyDrawTitle || `Vòng quay may mắn - ${eventPayload.title}`,
              description: data.luckyDrawDescription || "Tham gia để nhận những phần quà hấp dẫn từ sự kiện!",
              startTime: toISO(data.luckyDrawStartTime) || eventPayload.startTime,
              endTime: toISO(data.luckyDrawEndTime) || eventPayload.endTime,
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


      if (isSuperAdmin) {
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
                Tạo Sự Kiện Mới
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fillSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all"
              >
                <Sparkles size={16} /> Dữ liệu mẫu
              </button>
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
              {STEPS.map((s, idx) => {
                const active = step === s.id;
                const completed = step > s.id;
                const isLast = idx === STEPS.length - 1;

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
            />
          )}

          {step === 2 && (
            <ManualInputStep
              formData={formData}
              setFormData={updateFormData}
              onBack={() => setStep(1)}
              onNext={(data) => {
                updateFormData(data);
                setStep(3);
              }}
              activeSections={['details', 'description', 'image', 'attendees']}
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
