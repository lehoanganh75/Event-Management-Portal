import React, { useState, useEffect, useCallback } from "react";
import { EventPlanner } from "../../components/event-planner/EventPlanner";
import eventService from "../../services/eventService";
import notificationService from "../../services/notificationService";
import authService from "../../services/authService";
import { exportToWord } from "../../components/event-planner/WordExporter";
import PlanManagement from "../../components/common/management/PlanManagement";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Edit2, Save, Trash2, Info } from "lucide-react";

const LecturerPlansPage = () => {
  const [viewMode, setViewMode] = useState("LIST");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyPlans();
      setPlans(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách kế hoạch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const getCurrentUser = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        return {
          accountId: payload.accountId || payload.sub || payload.userId || payload.id,
          name: payload.name || payload.fullName || "Người dùng",
          email: payload.email,
        };
      }
    } catch (e) { }
    return null;
  };

  const sendNotifications = async (planId, planTitle) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const accountsResponse = await authService.getAllAccounts();
      const allAccounts = accountsResponse.data || [];
      const adminAccounts = allAccounts.filter(a => ["ADMIN", "SUPER_ADMIN"].includes(a.role?.toUpperCase()));

      for (const admin of adminAccounts) {
        const adminUserId = admin.id || admin.userProfileId || admin.accountId;
        if (!adminUserId || String(adminUserId) === String(currentUser.accountId)) continue;
        await notificationService.sendNotification({
          userProfileId: adminUserId,
          type: "EVENT_SUBMITTED",
          title: "🚀 Kế hoạch mới cần phê duyệt! 📋",
          message: `${currentUser.name} đã gửi kế hoạch "${planTitle}" để phê duyệt.`,
          relatedEntityId: planId,
          relatedEntityType: "PLAN",
          actionUrl: `/manage-plans/${planId}`,
          priority: 1,
        });
      }

      await notificationService.sendNotification({
        userProfileId: currentUser.accountId,
        type: "GENERAL",
        title: "🚀 Đã gửi phê duyệt thành công! ✅",
        message: `Kế hoạch "${planTitle}" đã được gửi và đang chờ phê duyệt.`,
        relatedEntityId: planId,
        relatedEntityType: "PLAN",
        actionUrl: `/manage-plans/${planId}`,
        priority: 2,
      });
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
    }
  };

  const handleSubmitForApproval = async (plan) => {
    const planId = plan.id;
    setSubmittingId(planId);
    try {
      await eventService.submitPlanForApproval(planId);
      await sendNotifications(planId, plan.title);
      toast.success("Đã gửi yêu cầu phê duyệt thành công");
      await fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.error || "Gửi phê duyệt thất bại");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan({ ...plan });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (new Date(selectedPlan.endTime) <= new Date(selectedPlan.startTime)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }
    try {
      await eventService.updatePlan(selectedPlan.id, selectedPlan);
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...selectedPlan, updatedAt: new Date() } : p));
      setIsModalOpen(false);
      toast.success("Cập nhật kế hoạch thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật dữ liệu");
    }
  };

  const handleDelete = async () => {
    try {
      await eventService.deletePlan(planToDelete.id);
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      toast.success("Đã xóa kế hoạch thành công");
    } catch {
      toast.error("Xóa kế hoạch thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  if (viewMode === "CREATE") {
    return <EventPlanner onBack={() => { setViewMode("LIST"); fetchPlans(); }} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <PlanManagement
        plans={plans}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(p) => { setPlanToDelete(p); setIsDeleteModalOpen(true); }}
        onSubmitForApproval={handleSubmitForApproval}
        onExport={exportToWord}
        title="Quản lý kế hoạch"
        description="Lập lịch và theo dõi tiến độ các kế hoạch sự kiện."
      />

      <div className="absolute top-6 right-6">
        <button onClick={() => setViewMode("CREATE")} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
          Tạo kế hoạch mới
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600"><Edit2 size={20} /></div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Chỉnh sửa kế hoạch</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>
              <div className="p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tên kế hoạch</label>
                    <input type="text" value={selectedPlan.title || ""} onChange={(e) => setSelectedPlan({ ...selectedPlan, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Mô tả</label>
                    <textarea rows={4} value={selectedPlan.description || ""} onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={18} /> Lưu thay đổi</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Bạn có chắc chắn muốn xóa kế hoạch này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Hủy</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all">Xóa ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LecturerPlansPage;
