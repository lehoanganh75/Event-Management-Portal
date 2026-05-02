import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  // Invitation States
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Presenter Invitation States
  const [isAddingPresenter, setIsAddingPresenter] = useState(false);
  const [presenterInvitations, setPresenterInvitations] = useState([]);
  const [isInvitingPresenter, setIsInvitingPresenter] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resEvent = await eventService.getEventById(id);
      
      // ✅ Nếu không còn là ban tổ chức (và không phải Admin hệ thống) thì đá ra ngoài Home
      const roles = user?.roles || (user?.role ? [user.role] : []);
      const isSystemAdmin = roles.some(r => ["SUPER_ADMIN", "ADMIN"].includes(r?.toUpperCase()));

      if (!resEvent.data?.currentUserRole?.organizerRole && !isSystemAdmin) {
        toast.info("Bạn không còn thuộc ban tổ chức sự kiện này.");
        navigate('/');
        return;
      }

      setEvent(resEvent.data);

      if (resEvent.data?.status === 'COMPLETED') {
        try {
          const resSummary = await eventService.getEventSummary(id);
          setEventSummary(resSummary.data);
        } catch (e) {
          console.warn("Chưa có báo cáo tổng kết");
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
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authService.getAllAccounts();
      setSystemUsers(res.data || []);
    } catch (err) {
      toast.error("Lỗi lấy danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const addInvite = (user = null) => {
    const newInvite = user ? {
      inviteeEmail: user.email || "",
      inviteeAccountId: user.id || "",
      fullName: user.fullName || user.profile?.fullName || user.username || "",
      targetRole: "MEMBER",
      message: ""
    } : { inviteeEmail: "", inviteeAccountId: "", fullName: "", targetRole: "MEMBER", message: "" };

    if (user) {
      const emptyIdx = invitations.findIndex(inv => !inv.inviteeEmail);
      if (emptyIdx !== -1) {
        const newList = [...invitations];
        newList[emptyIdx] = newInvite;
        setInvitations(newList);
        return;
      }
    }
    setInvitations([...invitations, newInvite]);
  };

  const handleSendInvites = async () => {
    try {
      const validInvites = invitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;
      setIsInviting(true);
      const payload = validInvites.map(inv => ({
        ...inv,
        inviteeEmail: inv.inviteeEmail?.trim()
      }));
      await eventService.sendOrganizerInvitations(id, { invitations: payload });
      toast.success("Đã gửi lời mời!");
      setInvitations([]);
      setIsAddingMember(false);
      fetchData();
    } catch (err) {
      toast.error("Lỗi gửi lời mời");
    } finally {
      setIsInviting(false);
    }
  };

  const addPresenterInvite = (user = null) => {
    const newInvite = user ? {
      inviteeEmail: user.email || "",
      inviteeAccountId: user.id || "",
      fullName: user.fullName || user.profile?.fullName || user.username || "",
      session: "ALL",
      bio: ""
    } : { inviteeEmail: "", inviteeAccountId: "", fullName: "", session: "ALL", bio: "" };

    if (user) {
      const emptyIdx = presenterInvitations.findIndex(inv => !inv.inviteeEmail);
      if (emptyIdx !== -1) {
        const newList = [...presenterInvitations];
        newList[emptyIdx] = newInvite;
        setPresenterInvitations(newList);
        return;
      }
    }
    setPresenterInvitations([...presenterInvitations, newInvite]);
  };

  const handleSendPresenterInvites = async () => {
    try {
      const validInvites = presenterInvitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;
      setIsInvitingPresenter(true);
      const payload = validInvites.map(inv => ({
        ...inv,
        inviteeEmail: inv.inviteeEmail?.trim()
      }));
      await eventService.sendPresenterInvitations(id, { invitations: payload });
      toast.success("Đã gửi lời mời diễn giả!");
      setPresenterInvitations([]);
      setIsAddingPresenter(false);
      fetchData();
    } catch (err) {
      toast.error("Lỗi gửi lời mời");
    } finally {
      setIsInvitingPresenter(false);
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

  const filteredUsers = useMemo(() => {
    return systemUsers.filter(u =>
      (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchKey.toLowerCase())
    );
  }, [systemUsers, searchKey]);

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
      isAddingMember={isAddingMember}
      setIsAddingMember={setIsAddingMember}
      showUserSuggestions={showUserSuggestions}
      setShowUserSuggestions={setShowUserSuggestions}
      searchKey={searchKey}
      setSearchKey={setSearchKey}
      loadingUsers={loadingUsers}
      filteredUsers={filteredUsers}
      invitations={invitations}
      addInvite={addInvite}
      updateInvite={(idx, field, val) => {
        const newList = [...invitations];
        newList[idx][field] = val;
        setInvitations(newList);
      }}
      removeInvite={(idx) => setInvitations(invitations.filter((_, i) => i !== idx))}
      handleSendInvites={handleSendInvites}
      isInviting={isInviting}
      isAddingPresenter={isAddingPresenter}
      setIsAddingPresenter={setIsAddingPresenter}
      presenterInvitations={presenterInvitations}
      addPresenterInvite={addPresenterInvite}
      updatePresenterInvite={(idx, field, val) => {
        const newList = [...presenterInvitations];
        newList[idx][field] = val;
        setPresenterInvitations(newList);
      }}
      removePresenterInvite={(idx) => setPresenterInvitations(presenterInvitations.filter((_, i) => i !== idx))}
      handleSendPresenterInvites={handleSendPresenterInvites}
      isInvitingPresenter={isInvitingPresenter}
      showCancelInput={showCancelInput}
      setShowCancelInput={setShowCancelInput}
      cancelReason={cancelReason}
      setCancelReason={setCancelReason}
      isCancelling={isCancelling}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
      isDeleting={isDeleting}
      onFetchUsers={fetchUsers}
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
