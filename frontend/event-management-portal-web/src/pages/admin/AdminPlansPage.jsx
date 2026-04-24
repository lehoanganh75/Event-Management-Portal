import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import PlanManagement from "../../components/common/management/PlanManagement";

const AdminPlansPage = () => {
  const { user } = useAuth();
  const {
    events: eventService,
    approvePlan,
    rejectPlan,
  } = useEvents();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getAllPlans();
      setPlans(res.data || []);
    } catch (e) {
      toast.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user, fetchPlans]);

  const handleApprove = async (plan) => {
    try {
      await approvePlan(plan.id, plan);
      fetchPlans();
    } catch (error) {
      toast.error("Lỗi phê duyệt!");
    }
  };

  const handleReject = async (plan) => {
    const reason = prompt("Nhập lý do từ chối kế hoạch này:");
    if (reason === null) return;

    try {
      await rejectPlan(plan.id, reason, plan);
      fetchPlans();
    } catch (error) {
      toast.error("Lỗi thao tác!");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const currentPlan = plans.find(p => p.id === id);
    if (!currentPlan) return;

    try {
      await eventService.updateEvent(id, { ...currentPlan, status: newStatus });
      fetchPlans();
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  return (
    <PlanManagement
      plans={plans}
      loading={loading}
      onApprove={handleApprove}
      onReject={handleReject}
      onStatusUpdate={handleStatusUpdate}
      title="Quản lý kế hoạch (Admin)"
      description="Xem xét và phê duyệt kế hoạch sự kiện từ các giảng viên"
    />
  );
};

export default AdminPlansPage;