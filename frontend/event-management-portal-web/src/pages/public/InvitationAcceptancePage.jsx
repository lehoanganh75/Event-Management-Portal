import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

// Components
import InvitationSidebar from "../../components/events/invitation/InvitationSidebar";
import InvitationEventDetails from "../../components/events/invitation/InvitationEventDetails";
import InvitationActions from "../../components/events/invitation/InvitationActions";
import InvitationResult from "../../components/events/invitation/InvitationResult";

const InvitationAcceptancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const hasCalled = useRef(false);

  const token = searchParams.get("token");
  const eventId = searchParams.get("eventId");

  const isPresenter = invitation?.type === "PRESENTER";

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";

    try {
      const d = new Date(dateString);

      if (isNaN(d.getTime())) return "Chưa xác định";

      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Chưa xác định";
    }
  };

  const formatOnlyDate = (dateString) => {
    if (!dateString) return "Chưa xác định";

    try {
      const d = new Date(dateString);

      if (isNaN(d.getTime())) return "Chưa xác định";

      return d.toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  useEffect(() => {
    if (!token || !eventId) {
      setError("Thông tin lời mời không hợp lệ hoặc đã hết hạn.");
      setLoading(false);
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const fetchInvitation = async () => {
      try {
        const res = await eventService.getInvitationDetails(
          eventId,
          token
        );

        const invData = res.data;

        setInvitation(invData);

        if (invData.status === "ACCEPTED") {
          setAccepted(true);
        }

        if (invData.status === "REJECTED") {
          setRejected(true);
        }
      } catch (err) {
        console.error("Fetch invitation error:", err);

        setError(
          err.response?.data?.message ||
          "Không thể tải thông tin lời mời. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, eventId]);

  const handleAccept = async () => {
    setSubmitting(true);

    try {
      const res = await eventService.acceptInvitation(
        eventId,
        token
      );

      toast.success(
        res.data.message || "Xác nhận tham gia thành công!"
      );

      setAccepted(true);
    } catch (err) {
      console.error("Accept invitation error:", err);

      toast.error(
        err.response?.data?.message ||
        "Lỗi khi xác nhận lời mời."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối.");
      return;
    }

    setSubmitting(true);

    try {
      await eventService.rejectInvitation(
        eventId,
        token,
        rejectionReason
      );

      toast.info("Đã gửi phản hồi từ chối.");

      setRejected(true);
      setShowRejectForm(false);
    } catch (err) {
      console.error("Reject invitation error:", err);

      toast.error(
        err.response?.data?.message ||
        "Lỗi khi gửi phản hồi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[450px] h-[450px] bg-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-3">
            Đang tải lời mời
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed">
            Hệ thống đang xác minh thông tin và tải dữ liệu sự kiện.
          </p>
        </motion.div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-[0.2em] mb-5">
            <Sparkles size={12} />
            Invitation Error
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Không thể truy cập lời mời
          </h2>

          <p className="text-slate-500 leading-relaxed mb-10">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
          >
            Về trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  // Result Screen
  if (accepted || rejected) {
    return (
      <InvitationResult
        accepted={accepted}
        isPresenter={isPresenter}
        invitation={invitation}
        rejectionReason={rejectionReason}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <ShieldCheck size={16} className="text-indigo-600" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">
              IUH Invitation Portal
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-5">
            {isPresenter
              ? "Lời mời diễn giả"
              : "Lời mời tham gia sự kiện"}
          </h1>

          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Xác nhận tham gia và đồng hành cùng chúng tôi trong
            hành trình tạo nên một sự kiện chuyên nghiệp và đáng nhớ.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <InvitationSidebar
              invitation={invitation}
              isPresenter={isPresenter}
              formatOnlyDate={formatOnlyDate}
            />

            {/* Content */}
            <div className="flex-1 p-8 md:p-12 lg:p-14">
              <InvitationEventDetails
                invitation={invitation}
                formatDate={formatDate}
                isPresenter={isPresenter}
              />

              <InvitationActions
                submitting={submitting}
                showRejectForm={showRejectForm}
                setShowRejectForm={setShowRejectForm}
                handleAccept={handleAccept}
                handleReject={handleReject}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationAcceptancePage;
