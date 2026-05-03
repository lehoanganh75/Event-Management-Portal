import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import eventService from "../../services/eventService";
import { useAuth } from "../../context/AuthContext";
import EventDetailManagement from "../../components/common/management/EventDetailManagement";

const StaffEventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [eventSummary, setEventSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resEvent = await eventService.getEventById(id);
      setEvent(resEvent.data);

      if (['PUBLISHED', 'ONGOING', 'COMPLETED'].includes(resEvent.data?.status)) {
        try {
          const resSummary = await eventService.getEventSummary(id);
          setEventSummary(resSummary.data);
        } catch (e) {
          console.warn("Chưa có báo cáo tổng kết");
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

  const handleManualCheckIn = async (registrationId) => {
    try {
      if (!user?.id) return;
      await eventService.manualCheckIn(registrationId, user.id);
      toast.success("Điểm danh thành công!");
      fetchData(); // Refresh data
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

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <EventDetailManagement
      event={event}
      eventSummary={eventSummary}
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBack={() => navigate(-1)}
      onManualCheckIn={handleManualCheckIn}
      onUndoCheckIn={handleUndoCheckIn}
      showQRScanner={showQRScanner}
      setShowQRScanner={setShowQRScanner}
      onQRScanSuccess={handleQRScanSuccess}
    // Nhân viên không có các quyền admin nên không cần truyền các handler chỉnh sửa/xóa
    />
  );
};

export default StaffEventDetailPage;
