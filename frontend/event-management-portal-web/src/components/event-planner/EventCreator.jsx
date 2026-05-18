import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ManualInputStep from "./ManualInputStep";
import EventReviewStep from "./EventReviewstep";
import EventProgramStep from "./Eventprogramstep";
import { exportToWord } from "./WordExporter";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";
import notificationService from "../../services/notificationService";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
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
  Loader2,
  Type,
  X,
  Save,
  Download,
  RefreshCw,
  Send,
  BookmarkPlus,
  FileDown
} from "lucide-react";
import { extractDataFromDocx } from "../../services/docxImportService";

const STEPS = [
  { id: 1, label: "Thông tin cơ bản", icon: FileText },
  { id: 2, label: "Mô tả & Cài đặt", icon: Info },
  { id: 3, label: "Xem trước & Hoàn tất", icon: CheckCircle },
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
  const { user } = useAuth();
  const isAuthority = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isPlanMode = !forceEventMode && (
    (initialFormData?.status?.startsWith('PLAN_')) ||
    (!planId && !fromPlan && (!initialFormData?.id || initialFormData?.status?.startsWith('PLAN_')))
  );

  const activeSteps = STEPS.map(s => {
    if (s.id === 3) {
      const label = isAuthority
        ? (isPlanMode ? "Xem trước & Phê duyệt" : "Xem trước & Xuất bản")
        : "Xem trước & Gửi duyệt";
      return { ...s, label };
    }
    return s;
  });
  const [step, setStep] = useState(startAtStep);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
    if (!isPlanMode || isEdit || isSubmitting) return;

    // Chỉ tự động lưu nếu đã có tiêu đề
    if (!formData.eventTitle || formData.eventTitle.trim().length < 3) return;

    const timer = setTimeout(() => {
      autoSaveDraft();
    }, 15000); // Tự động lưu sau 15s không thao tác

    return () => clearTimeout(timer);
  }, [formData, isPlanMode]);

  const preparePlanPayload = (data) => {
    const accountId = user?.accountId || user?.id || null;
    const toISO = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      const pad = (n) => n < 10 ? '0' + n : n;
      return dt.getFullYear() + '-' +
        pad(dt.getMonth() + 1) + '-' +
        pad(dt.getDate()) + 'T' +
        pad(dt.getHours()) + ':' +
        pad(dt.getMinutes()) + ':' +
        pad(dt.getSeconds());
    };

    return {
      organizationId: data.organizationId || null,
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
      faculty: data.faculty || "",
      major: data.major || "",
      createdByAccountId: accountId,
      notes: (data.notes || "").trim(),
      coverImage: data.coverImage || "",
      presenters: (data.presenters || [])
        .filter(p => p.isConfirmed)
        .map(p => ({
          accountId: p.presenterAccountId || p.accountId,
          presenterAccountId: p.presenterAccountId || p.accountId,
          email: p.email,
          title: p.position || p.title,
          session: p.targetSessionName || p.session
        })),
      organizers: (data.invitations || [])
        .filter(inv => inv.isConfirmed)
        .map(inv => ({
          accountId: inv.inviteeAccountId || inv.accountId,
          role: inv.targetRole || "MEMBER"
        })),
      programItems: (data.sessions || []).map(s => ({
        title: s.title,
        description: s.description,
        startTime: toISO(s.startTime),
        endTime: toISO(s.endTime),
        type: s.type || "KEYNOTE"
      })),
      targetObjects: Array.isArray(data.targetObjects)
        ? data.targetObjects.map(obj => typeof obj === 'string' ? { type: 'CATEGORY', name: obj } : obj)
        : [],
      recipients: Array.isArray(data.recipients)
        ? data.recipients.map(r => typeof r === 'string' ? { name: r } : r)
        : [],
      customFieldsJson: JSON.stringify(data.customFields || {}),
    };
  };

  const autoSaveDraft = async () => {
    if (isAutoSaving) return;

    try {
      setIsAutoSaving(true);

      let organizationId = formData.organizationId;
      if (formData.orgSelectionMode === 'new' && formData.newOrg) {
        try {
          const orgRes = await eventService.createOrganization({
            ...formData.newOrg,
            ownerAccountId: user?.accountId || user?.id || null
          });
          organizationId = orgRes.data.id;
          updateFormData({
            organizationId,
            orgSelectionMode: 'existing'
          });
        } catch (orgError) {
          console.warn("Auto-save failed to create organization:", orgError);
          return; // Abort this auto-save run if organization creation fails
        }
      }

      const payload = preparePlanPayload({ ...formData, organizationId });

      let res;
      if (formData.id) {
        res = await eventService.updatePlan(formData.id, payload);
      } else {
        res = await eventService.createPlan(payload);
        if (res.data?.id) {
          updateFormData({ id: res.data.id });
        }
      }

      setLastSavedTime(new Date());
    } catch (err) {
      console.warn("Auto-save failed:", err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const fillSampleData = () => {
    const formatLocal = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const now = new Date();
    const startTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
    const deadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    const sample = {
      eventTitle: "Hội thảo Công nghệ AI & Tương lai 2026",
      eventType: "WORKSHOP",
      startTime: formatLocal(startTime),
      endTime: formatLocal(endTime),
      registrationDeadline: formatLocal(deadline),
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
        { title: "Đón khách", type: "BREAK", startTime: formatLocal(startTime), endTime: formatLocal(new Date(startTime.getTime() + 30 * 60 * 1000)), room: "Sảnh", description: "Teabreak & Check-in", orderIndex: 1 },
        { title: "Keynote: AI 2026", type: "KEYNOTE", startTime: formatLocal(new Date(startTime.getTime() + 30 * 60 * 1000)), endTime: formatLocal(new Date(startTime.getTime() + 90 * 60 * 1000)), room: "Hội trường A", description: "Bài phát biểu chính", orderIndex: 2 }
      ],
      interactionSettings: {
        enableQA: false,
        enablePolls: false,
        allowUserQuestions: false,
      },
      hasLuckyDraw: true,
      luckyDrawTitle: "Quay số may mắn: Đêm hội AI 2026",
      luckyDrawDescription: "Tham gia chương trình quay số để có cơ hội nhận được các phần quà công nghệ giá trị từ nhà tài trợ và ban tổ chức.",
      luckyDrawStartTime: formatLocal(startTime),
      luckyDrawEndTime: formatLocal(endTime),
      allowMultipleWins: false,
      prizes: [
        { id: 1, name: "iPad Pro M4", count: 1, description: "Máy tính bảng mạnh mẽ nhất với màn hình OLED Tandem và chip M4 siêu nhanh." },
        { id: 2, name: "Bàn phím cơ Keychron", count: 3, description: "Bàn phím cơ không dây hoàn hảo cho làm việc đa thiết bị." },
        { id: 3, name: "Chuột Logitech MX Master 3S", count: 5, description: "Chuột ergonomic biểu tượng, cuộn MagSpeed và cảm biến 8K DPI." },
        { id: 4, name: "Voucher Steam 200k", count: 20, description: "Thẻ quà tặng trị giá 200.000đ áp dụng cho tất cả trò chơi trên Steam." }
      ],
    };
    setFormData(sample);
    toast.info("Đã tự động điền dữ liệu mẫu!");
  };

  const [showRawTextInput, setShowRawTextInput] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isAnalysingRaw, setIsAnalysingRaw] = useState(false);

  const handleRawTextImport = async () => {
    if (!rawText.trim()) return;
    setIsAnalysingRaw(true);
    try {
      toast.info("⏳ AI đang phân tích văn bản của bạn...");
      const res = await eventService.aiPlanning.generateFromRawText(rawText);
      if (res.data?.code === 1000 && res.data.result) {
        const extracted = res.data.result;
        const mappedData = {
          eventTitle: extracted.title || formData.eventTitle,
          eventTopic: extracted.subject || formData.eventTopic,
          eventPurpose: extracted.purpose || extracted.description || formData.eventPurpose,
          location: extracted.suggestedLocation || formData.location,
          maxParticipants: extracted.estimatedParticipants || formData.maxParticipants,
          eventType: "WORKSHOP",
          eventMode: "OFFLINE",
          sessions: extracted.programItems?.map((item, idx) => ({
            title: item.title || "Không tên",
            description: item.description || "",
            durationMinutes: item.durationMinutes || 0,
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            speaker: item.speaker || "",
            room: item.location || "",
            orderIndex: idx + 1,
            isConfirmed: true // Auto-confirm sessions from AI
          })) || [],
          presenters: extracted.programItems?.reduce((acc, item) => {
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
          }, []) || []
        };

        if (extracted.suggestedStartTime) {
          mappedData.startTime = new Date(extracted.suggestedStartTime).toISOString().slice(0, 16);
        }
        if (extracted.suggestedEndTime) {
          mappedData.endTime = new Date(extracted.suggestedEndTime).toISOString().slice(0, 16);
        }

        updateFormData(mappedData);
        toast.success("✨ Đã phân tích và điền thông tin thành công!");
        setShowRawTextInput(false);
        setRawText("");
      }
    } catch (err) {
      console.error("Raw text import error:", err);
      toast.error("Lỗi khi phân tích văn bản: " + err.message);
    } finally {
      setIsAnalysingRaw(false);
    }
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
      const data = await extractDataFromDocx(file);

      if (data && data.extracted) {
        const extracted = data.extracted;

        // Map AI result to our form structure
        const formatForInput = (isoStr) => {
          if (!isoStr) return "";
          try {
            // Nếu AI trả về định dạng YYYY-MM-DDTHH:mm:ss, ta chỉ lấy phần cần thiết
            if (typeof isoStr === 'string' && isoStr.includes('T')) {
              return isoStr.substring(0, 16);
            }
            const date = new Date(isoStr);
            if (isNaN(date)) return "";

            // Chuyển đổi sang giờ địa phương YYYY-MM-DDTHH:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch (e) {
            return "";
          }
        };

        const mappedData = {
          eventTitle: extracted.title || formData.eventTitle,
          eventTopic: extracted.subject || formData.eventTopic,
          eventPurpose: extracted.purpose || extracted.description || formData.eventPurpose,
          location: extracted.suggestedLocation || formData.location,
          maxParticipants: extracted.estimatedParticipants || formData.maxParticipants,
          startTime: formatForInput(extracted.suggestedStartTime) || formData.startTime,
          endTime: formatForInput(extracted.suggestedEndTime) || formData.endTime,
          registrationDeadline: formatForInput(extracted.registrationDeadline) || formData.registrationDeadline,
          eventType: "WORKSHOP",
          eventMode: "OFFLINE",
          sessions: extracted.programItems?.map((item, idx) => ({
            title: item.title || "Không tên",
            description: item.description || "",
            durationMinutes: item.durationMinutes || 0,
            startTime: formatForInput(item.startTime) || "",
            endTime: formatForInput(item.endTime) || "",
            speaker: item.speaker || "",
            room: item.location || "",
            orderIndex: idx + 1,
            isConfirmed: true
          })) || [],
          // Extract unique presenters from sessions
          presenters: extracted.programItems?.reduce((acc, item) => {
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
          }, []) || []
        };

        // Fallback for Title and Purpose if empty
        if (!mappedData.eventTitle && data.rawText) {
          const lines = data.rawText.split('\n') || [];
          const targetLine = lines.find(l => l.includes("V/v") || l.includes("KẾ HOẠCH"));
          if (targetLine) {
            mappedData.eventTitle = targetLine.replace(/V\/v:?\s*/i, "").trim().substring(0, 100);
          } else {
            mappedData.eventTitle = lines.find(l =>
              l.trim().length > 10 &&
              !l.includes("TRƯỜNG") &&
              !l.includes("KHOA") &&
              !l.includes("CỘNG HÒA")
            )?.trim().substring(0, 70) || "Kế hoạch sự kiện (Nhập từ file)";
          }
        }
        if (!mappedData.eventPurpose && data.rawText) {
          mappedData.eventPurpose = data.rawText;
        }

        updateFormData(mappedData);
        toast.success("✨ Đã trích xuất thông tin thành công!");

        // Force browser to recalculate height and scroll to top of content
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else if (data && data.rawText) {
        toast.warning("AI không thể trích xuất dữ liệu chi tiết, nhưng đã đọc được văn bản. Bạn có thể tự điền dựa trên nội dung.");
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
      const role = user?.role || "";
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

      // 1. Notify the creator (only if ADMIN/SUPER_ADMIN, since LECTURER has backend self-notification)
      if (isAdmin || isPublished) {
        await notificationService.sendNotification({
          userProfileId: user?.accountId || user?.id,
          title: isPublished ? "Sự kiện đã được xuất bản" : "Kế hoạch đã được tạo thành công",
          message: isPublished
            ? `Chúc mừng! Sự kiện "${eventTitle}" của bạn đã được xuất bản thành công.`
            : `Kế hoạch "${eventTitle}" của bạn đã được tạo thành công.`,
          type: isPublished ? "EVENT_APPROVED" : "EVENT_SUBMITTED",
          relatedEntityId: eventId,
          relatedEntityType: "EVENT"
        });
      }

      // 2. Notify all admins if it's pending approval
      if (!isPublished) {
        try {
          const accountsRes = await authService.getAllAccounts();
          const allAccounts = Array.isArray(accountsRes.data) ? accountsRes.data : (accountsRes.data?.content || []);

          const admins = allAccounts.filter(acc =>
            acc.role === 'ADMIN' || acc.role === 'SUPER_ADMIN' ||
            acc.roles?.includes('ADMIN') || acc.roles?.includes('SUPER_ADMIN')
          );

          if (admins.length > 0) {
            const adminIds = admins.map(a => a.id);
            const bulkPayload = {
              userIds: adminIds,
              title: "Yêu cầu phê duyệt mới",
              message: `${user?.fullName || user?.username} đã gửi một ${isPlanMode ? 'kế hoạch' : 'sự kiện'} mới: "${eventTitle}"`,
              type: isPlanMode ? "PLAN_SUBMITTED" : "EVENT_SUBMITTED",
              actionUrl: isPlanMode ? '/admin/plans' : '/admin/events'
            };

            // Try bulk first, if not available or fails, send individually
            try {
              await notificationService.sendBulk(bulkPayload);
            } catch (err) {
              for (const adminId of adminIds) {
                await notificationService.sendNotification({
                  userProfileId: adminId,
                  title: bulkPayload.title,
                  message: bulkPayload.message,
                  type: bulkPayload.type,
                  actionUrl: bulkPayload.actionUrl
                }).catch(() => { });
              }
            }
          }
        } catch (adminErr) {
          console.error("Lỗi gửi thông báo cho Admin:", adminErr);
        }
      }

      // 3. Notify all invited members (Organizers & Presenters) - ONLY for Events, not Plans
      if (!isPlanMode) {
        // Organizers
        const organizerIds = [];
        if (formData.invitations && formData.invitations.length > 0) {
          formData.invitations.forEach(inv => {
            if (inv.inviteeAccountId) organizerIds.push(inv.inviteeAccountId);
          });
        }
        if (organizerIds.length > 0) {
          const orgBulk = {
            userIds: organizerIds,
            title: "Lời mời tham gia ban tổ chức",
            message: `Bạn được mời tham gia ban tổ chức cho sự kiện: "${eventTitle}"`,
            type: "INVITATION",
            actionUrl: `/events/invitations?id=${eventId}`
          };
          try {
            await notificationService.sendBulk(orgBulk);
          } catch (err) {
            for (const id of organizerIds) {
              await notificationService.sendNotification({ ...orgBulk, userProfileId: id, userIds: undefined }).catch(() => { });
            }
          }
        }

        // Presenters
        const presenterIds = [];
        if (formData.presenters && formData.presenters.length > 0) {
          formData.presenters.forEach(pres => {
            if (pres.presenterAccountId) presenterIds.push(pres.presenterAccountId);
          });
        }
        if (presenterIds.length > 0) {
          const presBulk = {
            userIds: presenterIds,
            title: "Lời mời làm diễn giả",
            message: `Bạn được mời làm diễn giả cho sự kiện: "${eventTitle}"`,
            type: "INVITATION",
            actionUrl: `/events/invitations?id=${eventId}`
          };
          try {
            await notificationService.sendBulk(presBulk);
          } catch (err) {
            for (const id of presenterIds) {
              await notificationService.sendNotification({ ...presBulk, userProfileId: id, userIds: undefined }).catch(() => { });
            }
          }
        }
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo:", err);
    }
  };

  const handleSubmit = async (finalData = null, isDraft = false) => {
    setIsSubmitting(true);
    try {
      const accountId = user?.accountId || user?.id || null;

      // Check roles for auto-approval
      const role = user?.role || "";
      const isSuperAdmin = role === 'SUPER_ADMIN';

      const toISO = (dateStr) => {
        if (!dateStr) return null;
        const dt = new Date(dateStr);
        if (isNaN(dt.getTime())) return null;
        const pad = (n) => n < 10 ? '0' + n : n;
        return dt.getFullYear() + '-' +
          pad(dt.getMonth() + 1) + '-' +
          pad(dt.getDate()) + 'T' +
          pad(dt.getHours()) + ':' +
          pad(dt.getMinutes()) + ':' +
          pad(dt.getSeconds());
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
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

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
        // Auto-approval logic for Admin/SuperAdmin
        status: isDraft
          ? 'DRAFT'
          : isPlanMode
            ? (isAdmin ? 'PLAN_APPROVED' : 'PLAN_PENDING_APPROVAL')
            : (isAdmin ? 'PUBLISHED' : 'EVENT_PENDING_APPROVAL'),
        approvedByAccountId: (isAdmin && !isDraft) ? accountId : null,
        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects.map(obj => typeof obj === 'string' ? { type: 'CATEGORY', name: obj } : obj)
          : [],
        recipients: Array.isArray(data.recipients)
          ? data.recipients.map(r => typeof r === 'string' ? { name: r } : r)
          : [],
        organization: { id: organizationId },
        invitations: (data.invitations || []).filter(inv => inv.isConfirmed),
        organizers: (data.invitations || [])
          .filter(inv => inv.isConfirmed)
          .map(inv => ({
            accountId: inv.inviteeAccountId || inv.accountId,
            role: inv.targetRole || "MEMBER"
          })),
        presenters: (data.presenters || [])
          .filter(p => p.isConfirmed)
          .map(p => ({
            accountId: p.presenterAccountId || p.accountId,
            presenterAccountId: p.presenterAccountId || p.accountId,
            email: p.email?.trim() || null,
            title: p.position || p.title,
            session: p.session
          })),
        sessions: (data.sessions || []).map(s => ({
          ...s,
          startTime: toISO(s.startTime),
          endTime: toISO(s.endTime)
        })),
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

      if (isPlanMode) {
        const planPayload = preparePlanPayload(data);
        if (formData.id) {
          response = await eventService.updatePlan(formData.id, planPayload);
          if (!isDraft) {
            await eventService.submitPlanForApproval(formData.id);
          }
        } else {
          response = await eventService.createPlan(planPayload, !isDraft);
        }
      } else if (isEditMode) {
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

      if (response.data?.id && !isDraft) {
        const eventId = response.data.id;
        await sendNotifications(eventId, payload.title, isSuperAdmin);

        // Send Organizer Invitations (only when NOT from plan - plan conversion handles its own invitations)
        if (!isPlanMode && !fromPlan && payload.invitations && payload.invitations.length > 0) {
          try {
            await eventService.sendOrganizerInvitations(eventId, { invitations: payload.invitations });
          } catch (invErr) {
            console.error("Lỗi gửi lời mời ban tổ chức:", invErr);
          }
        }

        // Send Presenter Invitations (only when NOT from plan)
        if (!isPlanMode && !fromPlan && payload.presenters && payload.presenters.length > 0) {
          const validPresenters = payload.presenters
            .filter(p => p.email && p.email.trim() !== "")
            .map(p => ({
              inviteeEmail: p.email || p.inviteeEmail || "",
              inviteeAccountId: p.accountId || p.inviteeAccountId || null,
              session: p.targetSessionName || p.session || "",
              message: p.message || "",
            }));
          if (validPresenters.length > 0) {
            try {
              await eventService.sendPresenterInvitations(eventId, { invitations: validPresenters });
            } catch (presErr) {
              console.error("Lỗi gửi lời mời diễn giả:", presErr);
            }
          }
        }

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
                quantity: p.count || p.quantity || 1
              }))
            };
            await luckyDrawService.create(luckyDrawPayload);
          } catch (luckyError) {
            console.error("Lỗi tạo vòng quay:", luckyError);
            toast.warning("Sự kiện đã tạo nhưng không thể khởi tạo vòng quay. Bạn có thể cấu hình sau.");
          }
        }
      }

      if (isDraft) {
        toast.success(isPlanMode ? "Đã lưu bản nháp kế hoạch!" : "Đã lưu bản nháp sự kiện thành công!");
      } else if (isPlanMode) {
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          toast.success("Kế hoạch đã được tạo thành công!");
        } else {
          toast.success("Gửi yêu cầu phê duyệt thành công!");
        }
      } else if (isEditMode) {
        toast.success("Đã cập nhật thông tin sự kiện!");
      } else if (isSuperAdmin || role === 'ADMIN') {
        toast.success(isPlanMode ? "Kế hoạch đã được tạo thành công!" : "Sự kiện đã được tạo thành công!");
      } else {
        toast.success("Gửi yêu cầu phê duyệt thành công!");
      }
      onBack();
    } catch (error) {
      console.error("Lỗi:", error.response?.data || error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = async () => {
    try {
      if (isPlanMode) {
        await handleSaveDraft(formData);
      } else {
        await handleSubmit(formData, true);
      }
    } catch (err) {
      console.error("Lỗi khi lưu nháp:", err);
    }
  };

  // ===== PLAN-SPECIFIC HANDLERS =====
  const handleSaveDraft = async (data) => {
    try {
      let organizationId = data.organizationId;
      if (data.orgSelectionMode === 'new' && data.newOrg) {
        const orgRes = await eventService.createOrganization({
          ...data.newOrg,
          ownerAccountId: user?.accountId || user?.id || null
        });
        organizationId = orgRes.data.id;
      }

      const payload = preparePlanPayload({ ...data, organizationId });

      if (data.id) {
        await eventService.updatePlan(data.id, payload);
      } else {
        await eventService.createPlan(payload);
      }

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
          presenters: (data.presenters || []).filter(p => p.isConfirmed),
          targetObjects: data.targetObjects || [],
          interactionSettings: data.interactionSettings || {},
          hasLuckyDraw: data.hasLuckyDraw || false,
          notes: data.notes || "",
        },
      };
      await eventService.createTemplate(templatePayload);
      toast.success("Đã lưu bản mẫu từ kế hoạch hiện tại!");
      onBack();
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
        presenters: (data.presenters || []).filter(p => p.isConfirmed),
        invitations: (data.invitations || []).filter(inv => inv.isConfirmed),
      }, user?.accountId || user?.id);
      toast.success("✅ Đã xuất file Word!");
    } catch (err) {
      toast.error("Lỗi xuất Word: " + err.message);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setStep(1);
    toast.info("Đã làm mới toàn bộ form!");
  };

  const handleGlobalBack = () => {
    if (step === 1) {
      onBack();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleGlobalNext = () => {
    if (step === 1) {
      if (!formData.eventTitle?.trim()) {
        toast.error("Vui lòng nhập tên sự kiện/kế hoạch!");
        return;
      }
      if (!formData.startTime) {
        toast.error("Vui lòng chọn thời gian bắt đầu!");
        return;
      }
      if (!formData.endTime) {
        toast.error("Vui lòng chọn thời gian kết thúc!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const sessions = formData.sessions || [];
      const hasUnconfirmed = sessions.some(s => !s.isConfirmed);
      if (hasUnconfirmed) {
        toast.error("Vui lòng xác nhận tất cả các phiên chi tiết trước khi tiếp tục!");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-5">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {isEdit
                  ? "Cập nhật sự kiện"
                  : isPlanMode
                    ? "Tạo kế hoạch mới"
                    : "Tạo sự kiện mới"}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Điền thông tin và cấu hình nội dung sự kiện
              </p>

              {isPlanMode && (
                <div className="flex items-center gap-3 mt-3">
                  {formData._templateName && (
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-100">
                      Từ mẫu: {formData._templateName}
                    </span>
                  )}

                  {isAutoSaving ? (
                    <span className="flex items-center gap-1.5 text-xs text-indigo-600">
                      <Loader2 size={12} className="animate-spin" />
                      Đang tự động lưu...
                    </span>
                  ) : lastSavedTime ? (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Check size={12} />
                      Đã lưu lúc{" "}
                      {lastSavedTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">

              <label
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm hover:bg-amber-100 cursor-pointer ${isImporting ? "opacity-60 pointer-events-none" : ""
                  }`}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".docx"
                  onChange={handleDocxImport}
                  disabled={isImporting}
                />

                {isImporting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FileUp size={15} />
                    Nhập Docx
                  </>
                )}
              </label>

              <button
                onClick={() => setShowRawTextInput(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-600 text-sm hover:bg-indigo-50"
              >
                <Sparkles size={15} />
                Phân tích AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEPPER */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex justify-center overflow-x-auto">
          <div className="flex items-start gap-6 min-w-max">
            {activeSteps.map((s, idx) => {
              const active = step === s.id;
              const completed = step > s.id;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center min-w-[88px]">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${active
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-white border-slate-300 text-slate-500"
                        }`}
                    >
                      <s.icon size={16} />
                    </div>

                    <p
                      className={`mt-2 text-xs text-center ${active
                        ? "text-indigo-700 font-medium"
                        : completed
                          ? "text-emerald-600"
                          : "text-slate-500"
                        }`}
                    >
                      {s.label}
                    </p>
                  </div>

                  {idx !== activeSteps.length - 1 && (
                    <div className="pt-3">
                      <ChevronRight
                        size={16}
                        className={completed ? "text-emerald-400" : "text-slate-300"}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 pt-6 pb-24">
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
              activeSections={["organization", "basic"]}
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
                setStep(3);
              }}
              activeSections={[
                "details",
                "description",
                "image",
                "attendees",
                "sessions",
                "presenters",
              ]}
              isPlanMode={isPlanMode}
            />
          )}

          {step === 3 && (
            <EventReviewStep
              formData={formData}
              onBack={() => setStep(2)}
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

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 md:left-72 right-0 z-50 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleGlobalBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Quay lại
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-sm hover:bg-rose-100"
          >
            <RefreshCw size={15} />
            Làm mới
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {step === 3 && (
            <>
              <button
                onClick={handleSaveDraftClick}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                Lưu nháp
              </button>

              {isPlanMode && (
                <>
                  <button
                    onClick={() => handleSaveTemplate(formData)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 text-sm hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <BookmarkPlus size={15} />
                    Lưu mẫu
                  </button>

                  <button
                    onClick={() => handleExportWord(formData)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 text-sm hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <FileDown size={15} />
                    Xuất Word
                  </button>
                </>
              )}
            </>
          )}

          <button
            onClick={handleGlobalNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-700 text-white text-sm hover:bg-indigo-800 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý...
              </>
            ) : step === 3 ? (
              <>
                <Send size={15} />
                {isEdit
                  ? "Cập nhật sự kiện"
                  : isAuthority
                    ? isPlanMode
                      ? "Lưu"
                      : "Xuất bản"
                    : "Gửi phê duyệt"}
              </>
            ) : (
              <>
                Tiếp theo
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI MODAL */}
      {showRawTextInput && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Phân tích bằng AI
                </h3>
                <p className="text-sm text-slate-500">
                  AI sẽ hỗ trợ điền dữ liệu ban đầu
                </p>
              </div>

              <button
                onClick={() => setShowRawTextInput(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <textarea
                className="w-full h-60 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-indigo-500"
                placeholder="Ví dụ: Hội thảo AI cho sinh viên CNTT..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowRawTextInput(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                disabled={!rawText.trim() || isAnalysingRaw}
                onClick={handleRawTextImport}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:bg-slate-300"
              >
                {isAnalysingRaw ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Bắt đầu phân tích
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventCreator;
