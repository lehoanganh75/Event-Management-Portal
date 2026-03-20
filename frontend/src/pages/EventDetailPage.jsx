import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Building2,
  Share2,
  Heart,
  Timer,
  Target,
  CheckCircle,
  Award,
  Download,
  X,
  AlertCircle,
  QrCode,
  Camera,
  ShieldCheck,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { getEventById, registerEvent, cancelRegistration, getEventRegistrations, getUserRegistrations, getRegistrationQR } from "../api/eventApi";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

const getCurrentAccountId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.accountId || payload.userId || payload.sub || null;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.accountId || user.userId || null;
    }

    return null;
  } catch (e) {
    return null;
  }
};
const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [registrationId, setRegistrationId] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRoles(payload.roles || []);
      } else {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserRoles(user.roles || []);
        }
      }
    } catch (e) {
      console.error("Lỗi parse roles:", e);
    }

    Promise.all([
      getEventById(id).catch((err) => {
        console.error("Lỗi khi fetch chi tiết sự kiện:", err);
        return { data: null };
      }),
      getEventRegistrations(id).catch((err) => {
        console.error("Lỗi khi fetch danh sách đăng ký:", err);
        return { data: [] };
      })
    ])
      .then(([eventRes, regRes]) => {
        if (eventRes.data) {
          const eventData = eventRes.data;

          eventData.registeredCount = regRes.data?.length || 0;
          setEvent(eventData);
        } else {
          console.error("Không tìm thấy dữ liệu sự kiện");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    const userId = getCurrentAccountId();
    if (userId) {
      getUserRegistrations(userId)
        .then((res) => {
          const regs = res.data || [];
          const reg = regs.find((r) => r.eventId === id || r.event?.id === id);
          if (reg) {
            setIsRegistered(true);
            setRegistrationId(reg.id);
            setIsCheckedIn(reg.checkedIn || false);
          }
        })
        .catch((err) => console.error("Lỗi lấy danh sách đăng ký:", err));
    }
  }, [id]);

  useEffect(() => {
    if (showQRModal && registrationId) {
      getRegistrationQR(registrationId)
        .then((res) => {
          setQrValue(res.data?.qrToken || res.data?.token || JSON.stringify(res.data));
        })
        .catch((err) => console.error("Lỗi lấy QR:", err));
    }
  }, [showQRModal, registrationId]);

  const handleRegister = async () => {
    const userId = getCurrentAccountId();
    if (!userId) {
      showToast("Vui lòng đăng nhập để đăng ký sự kiện!", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await registerEvent(id, userId);
      setIsRegistered(true);
      setRegistrationId(res.data?.id);
      setEvent((prev) => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
      showToast("Đăng ký sự kiện thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.error || "Có lỗi xảy ra khi đăng ký.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRegistration = () => {
    setShowCancelModal(true);
  };

  const confirmCancelRegistration = async () => {
    const userId = getCurrentAccountId();
    if (!userId) {
      setShowCancelModal(false);
      return;
    }

    setIsProcessing(true);
    setShowCancelModal(false);
    try {
      await cancelRegistration(id, userId);
      setIsRegistered(false);
      setRegistrationId(null);
      setEvent((prev) => ({ ...prev, registeredCount: Math.max(0, (prev.registeredCount || 0) - 1) }));
      showToast("Đã hủy đăng ký thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.error || "Có lỗi xảy ra khi hủy đăng ký.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const availableSlots = event.maxParticipants - event.registeredCount;
  const availabilityPercent = (availableSlots / event.maxParticipants) * 100;
  const registrationPercent =
    (event.registeredCount / event.maxParticipants) * 100;

  // Map organizer names
  const organizerMap = {
    cntt: "Khoa CNTT",
    ctsv: "Phòng CTSV",
    "kinh-te": "Khoa Kinh tế",
    "doan-hoi": "Đoàn - Hội",
    club: "CLB sinh viên",
  };

  // Map event types
  const typeMap = {
    seminar: "Hội thảo",
    sport: "Thi đấu thể thao",
    culture: "Văn nghệ",
    career: "Tuyển dụng",
    workshop: "Workshop",
    charity: "Từ thiện",
    networking: "Giao lưu",
  };

  // Map target audience
  const targetMap = {
    all: "Tất cả sinh viên",
    "year-1": "Sinh viên năm 1",
    "year-2-3": "Sinh viên năm 2-3",
    "year-4": "Sinh viên năm 4",
    "cntt-only": "Chỉ khoa CNTT",
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "Đang cập nhật";

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Đang cập nhật";

    const diffMins = Math.floor((endDate - startDate) / (1000 * 60));
    if (diffMins <= 0) return "Đang cập nhật";

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const hDisplay = hours > 0 ? `${hours} giờ ` : "";
    const mDisplay = minutes > 0 ? `${minutes} phút` : "";
    return (hDisplay + mDisplay).trim();
  };

  const hasManagementRole = userRoles.some(role => 
    ["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
              toast.type === "success" ? "border-emerald-100" : "border-rose-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-500" size={24} />
            ) : (
              <AlertCircle className="text-rose-500" size={24} />
            )}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative h-96 bg-linear-to-b from-gray-900 to-gray-800">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition font-semibold text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === "upcoming"
                    ? "bg-blue-500"
                    : event.status === "ongoing"
                      ? "bg-green-500"
                      : "bg-gray-500"
                }`}
              >
                {event.status === "upcoming"
                  ? "Sắp diễn ra"
                  : event.status === "ongoing"
                    ? "Đang diễn ra"
                    : "Đã kết thúc"}
              </span>
              {event.hasPoints && (
                <span className="px-3 py-1 rounded-full bg-purple-500 text-sm font-semibold">
                  Có điểm RL
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-gray-700/80 text-sm font-semibold">
                {typeMap[event.type]}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {event.title}
            </h1>
            <p className="text-lg text-gray-200">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Cards */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thông tin sự kiện
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Ngày diễn ra
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.eventDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Thời gian
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.eventTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Địa điểm
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Đơn vị tổ chức
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {organizerMap[event.organizationId]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Timer className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Thời lượng
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDuration(event.startTime, event.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Đối tượng
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.target
                        ? targetMap[event.target]
                        : "Tất cả sinh viên IUH"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Phí tham gia
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.fee === "free" ? "Miễn phí" : "Có phí"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Điểm rèn luyện
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.hasPoints ? "Có" : "Không"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.fullDescription || event.description}
                </p>
              </div>
            </div>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chương trình
                </h2>
                <div className="space-y-3">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="shrink-0">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700">
                          {item.time}
                        </p>
                        <p className="text-gray-700">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Diễn giả
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {speaker.name}
                        </p>
                        <p className="text-sm text-gray-600">{speaker.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chủ đề
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Registration Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Registration Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Đã đăng ký
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {event.registeredCount} / {event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        availabilityPercent > 20
                          ? "bg-green-500"
                          : availabilityPercent > 0
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${registrationPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {availabilityPercent === 0 ? (
                      <span className="text-red-600 font-semibold">
                        Đã hết chỗ
                      </span>
                    ) : availabilityPercent <= 20 ? (
                      <span className="text-orange-600 font-semibold">
                        Chỉ còn {availableSlots} chỗ
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Còn {availableSlots} chỗ
                      </span>
                    )}
                  </p>
                </div>

                {event.status !== "completed" && (
                  <>
                    {isRegistered ? (
                      isCheckedIn ? (
                        <button
                          disabled
                          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-3 opacity-90 cursor-default shadow-inner"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Đã điểm danh</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelRegistration}
                          disabled={isProcessing}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-3 hover:bg-red-500 hover:text-white transition-colors group disabled:opacity-70"
                        >
                          {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5 group-hover:hidden" /><X className="w-5 h-5 hidden group-hover:block" /></>}
                          <span className="group-hover:hidden">{isProcessing ? "Đang xử lý..." : "Đã đăng ký"}</span>
                          <span className="hidden group-hover:block">Hủy đăng ký</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleRegister}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={availabilityPercent === 0 || isProcessing}
                      >
                        {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {availabilityPercent === 0
                          ? "Đã hết chỗ"
                          : "Đăng ký tham gia"}
                      </button>
                    )}
                  </>
                )}

                <div className="grid grid-cols-4 gap-2 mt-3">
                  <button title="Yêu thích" className="col-span-1 border-2 border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button title="Chia sẻ" className="col-span-1 border-2 border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="col-span-2 border-2 border-blue-600 bg-blue-50 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition text-blue-700 font-bold text-sm"
                  >
                    <QrCode className="w-4 h-4" /> Mã QR
                  </button>
                </div>

                {hasManagementRole && (
                  <button 
                    onClick={() => navigate('/attendance')}
                    className="w-full mt-3 border-2 border-slate-800 text-slate-800 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Quét mã điểm danh
                  </button>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lưu ý
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Vui lòng đến đúng giờ</li>
                  <li>• Mang theo thẻ sinh viên</li>
                  <li>• Trang phục lịch sự</li>
                  {event.hasPoints && <li>• Sẽ được điểm rèn luyện</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative shadow-2xl"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Mã QR Điểm danh</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Sử dụng tính năng quét mã trên ứng dụng để điểm danh
              </p>

              <div className="bg-white p-4 rounded-3xl shadow-inner border border-slate-100 inline-block mb-6">
                {qrValue ? (
                  <QRCode value={qrValue} size={200} level="H" />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400">
                    Đang tải mã QR...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận hủy?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={confirmCancelRegistration}
                  className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Hủy đăng ký
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;
