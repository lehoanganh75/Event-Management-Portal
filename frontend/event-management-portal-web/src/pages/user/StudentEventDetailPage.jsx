import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";
import authService from "../../services/authService";
import EventDetailManagement from "../../components/common/management/EventDetailManagement";

const StudentEventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const pathPrefix = "/Student";

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


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resEvent = await eventService.getEventById(id);

      console.log("Current User Role Data:", resEvent.data?.currentUserRole);

      setEvent(resEvent.data);

      // Fetch summary if completed
      if (resEvent.data?.status === "COMPLETED") {
        try {
          const resSummary = await eventService.getEventSummary(id);
          setEventSummary(resSummary.data);
        } catch (e) {
          console.warn("Chưa có báo cáo tổng kết.");
        }
      }

      if (resEvent.data?.hasLuckyDraw) {
        try {
          const resLucky = await luckyDrawService.findLuckyDrawByEventId(id);
          setLuckyDraw(resLucky.data);
        } catch (e) {
          console.warn("Lucky Draw chưa khởi tạo.");
        }
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
      console.error("Error fetching event details:", err);
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(`Lỗi tải dữ liệu: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);


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
      navigate("/Student/events/my-events");
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

  const handleUpdateCheckInTime = async (registrationId, newTime) => {
    try {
      await eventService.updateCheckInTime(registrationId, newTime);
      toast.success("Đã cập nhật thời gian điểm danh");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thời gian");
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

  const handleRejectLeave = async (organizerId) => {
    try {
      await eventService.rejectLeaveRequest(organizerId);
      toast.success("Đã từ chối yêu cầu rời nhóm");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi từ chối");
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
      onEditInfo={() => navigate(`${pathPrefix}/events/edit/${id}`)}
      onCancelEvent={handleCancelEvent}
      onDeleteEvent={handleDeleteEvent}
      onRemoveMember={handleRemoveMember}
      onLeaveTeam={handleLeaveTeam}
      onApproveLeave={handleApproveLeave}
      onRejectLeave={handleRejectLeave}
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
      onManualCheckIn={handleManualCheckIn}
      onUndoCheckIn={handleUndoCheckIn}
      onUpdateCheckInTime={handleUpdateCheckInTime}
      showQRScanner={showQRScanner}
      setShowQRScanner={setShowQRScanner}
      onQRScanSuccess={handleQRScanSuccess}
      onRefresh={fetchData}
    />
  );
};

export default StudentEventDetailPage;
