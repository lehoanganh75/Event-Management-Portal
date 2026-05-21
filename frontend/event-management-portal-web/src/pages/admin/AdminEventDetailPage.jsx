import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { toast } from "react-toastify";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";
import authService from "../../services/authService";
import EventDetailManagement from "../../components/common/management/EventDetailManagement";

const AdminEventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [luckyDraw, setLuckyDraw] = useState(null);
  const [eventSummary, setEventSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { notifications } = useNotification();
  const lastHandledNotificationRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resEvent = await eventService.getEventById(id);

      setEvent(resEvent.data);

      if (resEvent.data?.status === 'COMPLETED') {
        try {
          const resSummary = await eventService.getEventSummary(id);
          setEventSummary(resSummary.data);
        } catch (e) {
          console.warn("Chưa có báo cáo tổng kết");
        }
      }

      // Cố gắng tải dữ liệu Vòng quay may mắn
      try {
        const resLucky = await luckyDrawService.findLuckyDrawByEventId(id);
        if (resLucky.data) {
          setLuckyDraw(resLucky.data);
        }
      } catch (e) {
        console.warn("Lucky Draw chưa khởi tạo hoặc lỗi tải.");
        setLuckyDraw(null);
      }

      // Fetch registrations for stats and management
      try {
        const resRegs = await eventService.getUsersByEvent(id);
        setEvent(prev => ({
          ...prev,
          registrations: resRegs.data || []
        }));
      } catch (e) {
        console.warn("Không thể tải danh sách đăng ký");
      }
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);

  // Tự động làm mới danh sách điểm danh mỗi 3 giây khi đang ở tab "Điểm danh"
  useEffect(() => {
    if (activeTab !== "Điểm danh" || !id) return;

    const interval = setInterval(async () => {
      try {
        const resRegs = await eventService.getUsersByEvent(id);
        setEvent(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            registrations: resRegs.data || []
          };
        });
      } catch (e) {
        console.warn("Lỗi tự động cập nhật danh sách điểm danh:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab, id]);

  // Real-time data refreshing when notifications arrive
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latest = notifications[0];

    // Avoid re-processing the exact same notification object
    if (lastHandledNotificationRef.current === latest) return;
    lastHandledNotificationRef.current = latest;

    const relevantTypes = [
      'INVITATION_ACCEPTED',
      'INVITATION_REJECTED',
      'INVITATION_CANCELLED',
      'REGISTRATION_CREATED',
      'REGISTRATION_APPROVED',
      'REGISTRATION_REJECTED',
      'LEAVE_REQUEST_APPROVED',
      'LEAVE_REQUEST_REJECTED',
      'LEAVE_REQUEST_CANCELLED'
    ];

    const entityId = String(latest.relatedEntityId || '');
    const currentId = String(id || '');
    const currentUuid = String(event?.id || '');

    const isRelevantEvent = entityId === currentId ||
      (currentUuid && entityId === currentUuid) ||
      (latest.actionUrl && latest.actionUrl.includes(currentId)) ||
      (latest.actionUrl && currentUuid && latest.actionUrl.includes(currentUuid));

    if (relevantTypes.includes(latest.type) && isRelevantEvent) {
      console.log(`🔄 [Realtime] Refreshing data for event ${id} due to ${latest.type}`);
      // Small delay to ensure backend transaction is committed
      const timer = setTimeout(() => {
        fetchData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [notifications, id, event?.id, fetchData]);


  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) {
      toast.warning("Vui lòng nhập lý do");
      return;
    }
    setIsCancelling(true);
    try {
      await eventService.cancelEvent(id, cancelReason);
      toast.success("Đã hủy sự kiện");
      setShowCancelInput(false);
      setCancelReason("");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi hủy");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(id);
      toast.success("Đã xóa sự kiện");
      navigate("/admin/events");
    } catch (err) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEvent = async () => {
    try {
      await eventService.startEvent(id);
      toast.success("Sự kiện đã bắt đầu!");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi bắt đầu sự kiện");
    }
  };

  const handleCompleteEvent = async () => {
    try {
      await eventService.completeEvent(id);
      toast.success("Sự kiện đã kết thúc & báo cáo đã được tạo!");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi kết thúc sự kiện");
    }
  };

  const handleRemovePresenter = async (presenterId) => {
    try {
      await eventService.removePresenter(presenterId);
      toast.success("Đã gỡ diễn giả khỏi sự kiện");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi gỡ diễn giả");
    }
  };

  const handleManualCheckIn = async (registrationId) => {
    try {
      if (!user?.id) {
        toast.error("Không xác định được người thực hiện");
        return;
      }
      await eventService.manualCheckIn(registrationId, user.id);
      toast.success("Điểm danh thủ công thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi điểm danh");
    }
  };

  const handleQRScanSuccess = async (qrToken) => {
    setShowQRScanner(false);
    try {
      await eventService.checkIn({ qrToken });
      toast.success("Điểm danh qua mã QR thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã vé không hợp lệ hoặc đã sử dụng");
    }
  };

  const handleUndoCheckIn = async (registrationId) => {
    try {
      await eventService.undoCheckIn(registrationId);
      toast.success("Đã hủy trạng thái điểm danh");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi hủy điểm danh");
    }
  };

  const handleApprove = async () => {
    try {
      if (event.status === "PLAN_PENDING_APPROVAL") {
        await eventService.approvePlan(id);
      } else if (event.status === "EVENT_PENDING_APPROVAL") {
        await eventService.approveEvent(id);
      }
      toast.success("Đã phê duyệt thành công!");
      fetchData();
    } catch (err) {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Nhập lý do từ chối:", "Thông tin chưa đầy đủ");
    if (!reason) return;
    try {
      await eventService.rejectPlan(id, reason);
      toast.success("Đã từ chối kế hoạch");
      fetchData();
    } catch (err) {
      toast.error("Từ chối thất bại");
    }
  };


  const handleApproveRegistration = async (reg) => {
    try {
      await eventService.approveRegistration(id, reg.participantAccountId);
      toast.success("Đã duyệt đăng ký!");
      fetchData();
    } catch (err) {
      toast.error("Duyệt thất bại");
    }
  };

  const handleRejectRegistration = async (reg) => {
    const reason = prompt("Lý do từ chối:", "Thông tin không hợp lệ");
    if (!reason) return;
    try {
      await eventService.rejectRegistration(id, reg.participantAccountId, reason);
      toast.success("Đã từ chối đăng ký");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi từ chối");
    }
  };


  const handleRemoveMember = async (member) => {
    try {
      if (member.isPending) {
        await eventService.cancelInvitation(member.id);
        toast.success("Đã hủy lời mời");
      } else {
        await eventService.removeOrganizer(member.id);
        toast.success("Đã gỡ thành viên khỏi ban tổ chức");
      }
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi thực hiện thao tác");
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await eventService.leaveTeam(id);
      toast.success("Thao tác thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thực hiện rời nhóm");
    }
  };

  const handleApproveLeave = async (organizerId) => {
    try {
      await eventService.approveLeaveRequest(organizerId);
      toast.success("Đã phê duyệt yêu cầu rời nhóm");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi phê duyệt");
    }
  };

  const handleRejectLeave = async (organizerId, reason) => {
    try {
      await eventService.rejectLeaveRequest(organizerId, reason);
      toast.success("Đã từ chối yêu cầu rời nhóm");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi từ chối");
    }
  };

  const handleUpdateOrganizerRole = async (organizerId, role) => {
    try {
      await eventService.updateOrganizerRole(organizerId, role);
      toast.success("Đã cập nhật vai trò thành viên");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật vai trò");
    }
  };

  return (
    <EventDetailManagement
      event={event}
      luckyDraw={luckyDraw}
      eventSummary={eventSummary}
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      canEdit={event?.currentUserRole?.canEditEvent}
      onBack={() => navigate(-1)}
      onEditInfo={() => navigate(`/admin/events/edit/${id}`)}
      onApprove={handleApprove}
      onReject={handleReject}
      onCancelEvent={handleCancelEvent}
      onDeleteEvent={handleDeleteEvent}
      onRemoveMember={handleRemoveMember}
      onRemovePresenter={handleRemovePresenter}
      onLeaveTeam={handleLeaveTeam}
      onApproveLeave={handleApproveLeave}
      onRejectLeave={handleRejectLeave}
      onUpdateOrganizerRole={handleUpdateOrganizerRole}
      showCancelInput={showCancelInput}
      setShowCancelInput={setShowCancelInput}
      cancelReason={cancelReason}
      setCancelReason={setCancelReason}
      isCancelling={isCancelling}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
      isDeleting={isDeleting}
      onStartEvent={handleStartEvent}
      onCompleteEvent={handleCompleteEvent}
      onApproveRegistration={handleApproveRegistration}
      onRejectRegistration={handleRejectRegistration}
      onManualCheckIn={handleManualCheckIn}
      onUndoCheckIn={handleUndoCheckIn}
      showQRScanner={showQRScanner}
      setShowQRScanner={setShowQRScanner}
      onQRScanSuccess={handleQRScanSuccess}
      onRefresh={fetchData}
    />
  );
};

export default AdminEventDetailPage;
