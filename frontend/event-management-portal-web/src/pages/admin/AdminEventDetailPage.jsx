import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";
import authService from "../../services/authService";
import EventDetailManagement from "../../components/common/management/EventDetailManagement";
import EditEventModal from "../../components/common/management/EditEventModal";

const AdminEventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [luckyDraw, setLuckyDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      setEvent(resEvent.data);
      if (resEvent.data?.hasLuckyDraw) {
        try {
          const resLucky = await luckyDrawService.findLuckyDrawByEventId(id);
          setLuckyDraw(resLucky.data);
        } catch (e) {
          console.warn("Lucky Draw chưa khởi tạo.");
        }
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
      console.log("Đang xóa sự kiện chính và các nội dung liên quan (xử lý tại backend)...");
      await eventService.deleteEvent(id);

      toast.success("Đã xóa sự kiện và các nội dung liên quan thành công");
      navigate("/admin/events");
    } catch (err) {
      console.error("Lỗi khi xóa sự kiện:", err);
      toast.error("Lỗi khi xóa sự kiện hoặc dữ liệu liên quan");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdateEvent = async (updatedData) => {
    try {
      await eventService.updateEvent(id, updatedData);
      toast.success("Cập nhật thông tin thành công!");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi cập nhật thông tin");
      throw err;
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await eventService.removeOrganizer(memberId);
      toast.success("Đã gỡ thành viên khỏi Ban tổ chức");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi gỡ thành viên");
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
      if (!user?.id) return;
      await eventService.manualCheckIn(registrationId, user.id);
      toast.success("Điểm danh thủ công thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi điểm danh");
    }
  };

  const handleUndoCheckIn = async (registrationId) => {
    try {
      await eventService.undoCheckIn(registrationId);
      toast.success("Đã hủy trạng thái điểm danh");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi hủy điểm danh");
    }
  };

  const handleQRScanSuccess = async (qrToken) => {
    setShowQRScanner(false);
    try {
      if (!user?.id) return;
      await eventService.checkIn(qrToken, user.id);
      toast.success("Điểm danh qua mã QR thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã vé không hợp lệ hoặc đã sử dụng");
    }
  };

  const addInvite = (user = null) => {
    const newInvite = user ? {
      inviteeEmail: user.email || "",
      targetRole: "MEMBER",
      message: ""
    } : { inviteeEmail: "", targetRole: "MEMBER", message: "" };
    setInvitations([...invitations, newInvite]);
  };

  const handleSendInvites = async () => {
    try {
      const validInvites = invitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;
      setIsInviting(true);
      await eventService.sendOrganizerInvitations(id, { invitations: validInvites });
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
      session: "ALL",
      bio: ""
    } : { inviteeEmail: "", session: "ALL", bio: "" };
    setPresenterInvitations([...presenterInvitations, newInvite]);
  };

  const handleSendPresenterInvites = async () => {
    try {
      const validInvites = presenterInvitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;
      setIsInvitingPresenter(true);
      await eventService.sendPresenterInvitations(id, { invitations: validInvites });
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

  const filteredUsers = useMemo(() => {
    return systemUsers.filter(u =>
      (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchKey.toLowerCase())
    );
  }, [systemUsers, searchKey]);

  if (loading) return null; // Or a loader if needed

  return (
    <>
      <EventDetailManagement
        event={event}
        luckyDraw={luckyDraw}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canEdit={event?.currentUserRole?.canEditEvent}
        onBack={() => navigate(-1)}
        onEditInfo={() => setIsEditModalOpen(true)}
        onCancelEvent={handleCancelEvent}
        onDeleteEvent={handleDeleteEvent}
        onRemoveMember={handleRemoveMember}
        onRemovePresenter={handleRemovePresenter}
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
        onManualCheckIn={handleManualCheckIn}
        onUndoCheckIn={handleUndoCheckIn}
        showQRScanner={showQRScanner}
        setShowQRScanner={setShowQRScanner}
        onQRScanSuccess={handleQRScanSuccess}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onSave={handleUpdateEvent}
      />
    </>
  );
};

export default AdminEventDetailPage;
