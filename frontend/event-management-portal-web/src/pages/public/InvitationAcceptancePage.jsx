import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Briefcase,
  Clock,
  ShieldCheck,
  Loader2,
  Mic,
  XCircle,
  Undo2,
  Send,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

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
  const hasCalled = useRef(false); // Chống double-call đồng bộ

  const token = searchParams.get("token");
  const eventId = searchParams.get("eventId");
  const isPresenter = invitation?.type === "PRESENTER";

  useEffect(() => {
    if (!token || !eventId) {
      setError("Thông tin lời mời không hợp lệ hoặc đã hết hạn.");
      setLoading(false);
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const fetchAndAccept = async () => {
      try {
        // 1. Lấy thông tin lời mời để hiển thị UI
        const res = await eventService.getInvitationDetails(eventId, token);
        const invData = res.data;
        setInvitation(invData);

        // 2. Nếu đã xử lý rồi thì cập nhật UI
        if (invData.status === "ACCEPTED") {
          setAccepted(true);
        } else if (invData.status === "REJECTED") {
          setRejected(true);
        }
      } catch (err) {
        console.error("Fetch invitation error:", err);
        setError(err.response?.data?.message || "Không thể tải thông tin lời mời. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndAccept();
  }, [token, eventId]);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const res = await eventService.acceptInvitation(eventId, token);
      toast.success(res.data.message || "Xác nhận tham gia thành công!");
      setAccepted(true);
    } catch (err) {
      console.error("Accept invitation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xác nhận lời mời.");
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
      await eventService.rejectInvitation(eventId, token, rejectionReason);
      toast.info("Đã gửi phản hồi từ chối.");
      setRejected(true);
      setShowRejectForm(false);
    } catch (err) {
      console.error("Reject invitation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi gửi phản hồi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Đang tải thông tin lời mời...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Rất tiếc!</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
          >
            Về trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepted || rejected) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 rounded-full opacity-40 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 max-w-xl w-full text-center relative z-10 border border-white"
        >
          <div className={`w-20 h-20 ${accepted ? "bg-green-50" : "bg-red-50"} rounded-full flex items-center justify-center mx-auto mb-8`}>
            {accepted ? <CheckCircle className="w-12 h-12 text-green-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">
            {accepted
              ? (isPresenter ? "Chào mừng Diễn giả!" : "Thành viên Ban tổ chức!")
              : "Đã từ chối lời mời"
            }
          </h2>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
            {accepted
              ? (isPresenter
                ? "Cảm ơn bạn đã nhận lời chia sẻ kiến thức tại sự kiện này. Chúng tôi rất mong chờ bài thuyết trình của bạn!"
                : `Chào mừng bạn gia nhập đội ngũ nòng cốt. Hãy cùng nhau tạo nên một sự kiện thật bùng nổ!`)
              : "Chúng tôi đã ghi nhận phản hồi từ chối của bạn. Rất hy vọng được hợp tác cùng bạn trong các sự kiện tới."
            }
          </p>

          <div className="bg-slate-50/50 p-6 rounded-2xl mb-8 border border-slate-100 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Chi tiết phản hồi</h4>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-50">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sự kiện</p>
                  <p className="text-sm font-bold text-slate-700 line-clamp-1">{invitation.event?.title}</p>
                </div>
              </div>

              {!accepted && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-50">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lý do từ chối</p>
                    <p className="text-sm font-medium text-slate-600 italic">"{rejectionReason || invitation.rejectionReason || "Không có lý do cụ thể"}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            Về trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-12 px-4 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden border border-slate-100"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Light Sidebar */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-12 border-r border-slate-100 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-8 border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  IUH Event Portal
                </div>
                <h1 className="text-3xl font-extrabold leading-tight mb-6 text-slate-900">
                  {isPresenter ? "Lời mời Diễn giả" : "Lời mời Ban tổ chức"}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Chào mừng <span className="text-slate-900 font-bold">{invitation.inviteeName}</span>, bạn đã nhận được một lời mời tham gia sự kiện chuyên nghiệp từ IUH.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      {isPresenter ? <Briefcase size={20} className="text-indigo-400" /> : <User size={20} className="text-indigo-400" />}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Vị trí mời</p>
                      <p className="text-sm font-bold">{isPresenter ? "Diễn giả chủ trì" : (invitation.targetRole || "Thành viên")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Thời hạn phản hồi</p>
                      <p className="text-sm font-bold">Hạn chót: {new Date(invitation.expiredAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 md:mt-0 pt-12 border-t border-white/5">
                <p className="text-xs text-slate-500 italic italic">"Sự hiện diện của bạn góp phần làm nên thành công của sự kiện."</p>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="md:w-2/3 p-8 md:p-12">
              <div className="mb-10">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Chi tiết sự kiện</h3>
                <h2 className="text-3xl font-black text-slate-800 mb-6 leading-tight">
                  {invitation.event?.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(invitation.event?.startTime).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Địa điểm</p>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{invitation.event?.location || "Trực tuyến"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {invitation.message && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lời nhắn từ người gửi</h3>
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative italic text-slate-600 leading-relaxed text-sm">
                    "{invitation.message}"
                  </div>
                </div>
              )}

              {isPresenter && invitation.presenterSession && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Chủ đề thuyết trình</h3>
                  <div className="p-5 bg-white border-2 border-indigo-100 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-100">
                      {invitation.presenterSession === "ALL" ? "✨" : "🎙️"}
                    </div>
                    <p className="font-extrabold text-slate-800">
                      {invitation.presenterSession === "ALL" ? "Đảm nhận toàn bộ phiên chương trình" : invitation.presenterSession}
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              {!showRejectForm ? (
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                    Chấp nhận tham gia
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={submitting}
                    className="flex-1 py-4 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    Từ chối lời mời
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-8 bg-red-50/50 rounded-3xl border-2 border-red-100"
                >
                  <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={20} /> Lý do từ chối
                  </h3>
                  <p className="text-red-600/70 text-xs mb-4">Hãy cho chúng tôi biết lý do bạn không thể tham gia để cải thiện quy trình tổ chức.</p>

                  <textarea
                    className="w-full p-4 bg-white rounded-xl border border-red-100 focus:ring-2 focus:ring-red-200 outline-none text-slate-700 text-sm mb-6 min-h-[100px]"
                    placeholder="Nhập lý do tại đây..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={handleReject}
                      disabled={submitting}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                      Xác nhận từ chối
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      disabled={submitting}
                      className="py-3 px-6 bg-white text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Undo2 size={18} /> Quay lại
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationAcceptancePage;
