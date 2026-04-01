import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Share2,
  Heart,
  Timer,
  Target,
  CheckCircle,
  X,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Gift,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import {
  getEventById,
  cancelRegistration,
  getRegistrationQR,
} from "../api/eventApi";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import axios from "axios";
import LuckyWheelModal from "../components/luckyWheelModal/LuckyWheelModal";

const organizerMap = {
  cntt: "Khoa CNTT",
  ctsv: "Phòng CTSV",
  "kinh-te": "Khoa Kinh tế",
  "doan-hoi": "Đoàn - Hội",
  club: "CLB sinh viên",
};

const typeMap = {
  seminar: "Hội thảo",
  sport: "Thi đấu thể thao",
  culture: "Văn nghệ",
  career: "Tuyển dụng",
  workshop: "Workshop",
  charity: "Từ thiện",
  networking: "Giao lưu",
};

const targetMap = {
  all: "Tất cả sinh viên",
  "year-1": "Sinh viên năm 1",
  "year-2-3": "Sinh viên năm 2-3",
  "year-4": "Sinh viên năm 4",
  "cntt-only": "Chỉ khoa CNTT",
};

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [register, setRegister] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [registrationId, setRegistrationId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;
      setIsLoading(true);

      try {
        const token = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        const eventRes = await getEventById(eventId);

        if (!eventRes || !eventRes.data) {
          console.error("No event data in response");
          showToast("Không tìm thấy dữ liệu sự kiện", "error");
          setIsLoading(false);
          return;
        }

        setEvent(eventRes.data);

        if (token && userStr) {
          try {
            const regRes = await axios.get(
              `http://localhost:8081/api/registrations/check/${eventId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const myRegData = regRes.data;
            if (myRegData) {
              setRegister(myRegData);
              setIsRegistered(true);
              setRegistrationId(myRegData.id);
              setIsCheckedIn(myRegData.checkedIn || false);
              setQrValue(`REG-${myRegData.id}`);
            }
          } catch (regErr) {
            setIsRegistered(false);
            if (regErr.response?.status !== 404)
              console.error("Lỗi check đăng ký:", regErr);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
        console.error("Error details:", err.response?.data);
        showToast(
          err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  useEffect(() => {
    if (showQRModal && registrationId) {
      getRegistrationQR(registrationId)
        .then((res) => {
          setQrValue(
            res.data?.qrToken || res.data?.token || `REG-${registrationId}`,
          );
        })
        .catch(() => setQrValue(`REG-${registrationId}`));
    }
  }, [showQRModal, registrationId]);

  const handleRegister = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      showToast("Vui lòng đăng nhập để đăng ký!", "error");
      return navigate("/login");
    }

    if (
      event.registrationDeadline &&
      new Date() > new Date(event.registrationDeadline)
    ) {
      showToast("Đã hết hạn đăng ký tham gia sự kiện này!", "error");
      return;
    }

    if (event.registeredCount >= event.maxParticipants) {
      showToast("Sự kiện đã đủ người tham gia!", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await axios.post(
        `http://localhost:8081/api/registrations/${eventId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const newReg = res.data;
      setRegister(newReg);
      setIsRegistered(true);
      setRegistrationId(newReg.id);
      setQrValue(`REG-${newReg.id}`);
      setEvent((prev) => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1,
      }));
      showToast("Đăng ký thành công!", "success");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng ký thất bại.";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const isRegistrationOpen = () => {
    if (!event?.registrationDeadline) return true;
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    return now <= deadline;
  };

  const getRegistrationStatus = () => {
    if (!event) return null;
    if (event.status === "COMPLETED") return "COMPLETED";
    if (!isRegistrationOpen()) return "EXPIRED";
    if (availableSlots <= 0) return "FULL";
    return "OPEN";
  };

  const createDrawEntry = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !event?.luckyDrawId) return;

    try {
      const res = await axios.post(
        `http://localhost:8083/api/draw-entries/${event.luckyDrawId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data) {
        showToast("Đã nhận lượt quay thưởng!", "success");
        setShowLuckyWheel(true);
      }
    } catch (error) {
      console.error("Lỗi tạo lượt quay:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Bạn đã hết lượt quay hoặc không đủ điều kiện";
      showToast(errorMsg, "error");
    }
  };

  const confirmCancelRegistration = async () => {
    setIsProcessing(true);
    setShowCancelModal(false);
    try {
      await cancelRegistration(eventId);

      setIsRegistered(false);
      setRegister(null);
      setRegistrationId(null);
      setEvent((prev) => ({
        ...prev,
        registeredCount: Math.max(0, (prev.registeredCount || 0) - 1),
      }));

      showToast("Đã hủy đăng ký thành công!", "success");
    } catch (error) {
      console.error("Cancel Error:", error.response);
      showToast("Không thể hủy đăng ký lúc này", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải...</p>
      </div>
    );
  }

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy sự kiện.
      </div>
    );

  const registeredCount = event.registeredCount || 0;
  const maxParticipants = event.maxParticipants || 1;
  const availableSlots = Math.max(0, maxParticipants - registeredCount);
  const registrationPercent = Math.min(
    100,
    (registeredCount / maxParticipants) * 100,
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
            className={`fixed top-24 right-6 z-110 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-500" />
            ) : (
              <AlertCircle className="text-rose-500" />
            )}
            <p className="text-sm font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-80 bg-gray-900 overflow-hidden">
        <img
          src={
            event.coverImage ||
            "https://www.cvent.com/sites/default/files/image/2023-11/Business_Travel_Trends_Bleisure_Event-Cvent_CONNECT_2023.jpg"
          }
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 hover:underline"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h1 className="text-4xl font-black">{event.title}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Thông tin sự kiện</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <Calendar className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Ngày
                    </p>
                    <p className="font-bold">
                      {event.eventDate ||
                        new Date(event.startTime).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <MapPin className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Địa điểm
                    </p>
                    <p className="font-bold">{event.location}</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                  <Timer className="text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Hạn đăng ký
                    </p>
                    <p className="font-bold">
                      {event.registrationDeadlineFormatted ||
                        (event.registrationDeadline
                          ? new Date(
                              event.registrationDeadline,
                            ).toLocaleDateString("vi-VN")
                          : "Không giới hạn")}
                    </p>
                    {event.registrationDeadline &&
                      new Date(event.registrationDeadline) < new Date() && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Đã hết hạn đăng ký
                        </p>
                      )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                <Calendar className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Ngày
                  </p>
                  <p className="font-bold">
                    {event.eventDate ||
                      new Date(event.startTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                <MapPin className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Địa điểm
                  </p>
                  <p className="font-bold">{event.location}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.fullDescription || event.description}
            </p>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 sticky top-24">
            <div className="mb-6">
              <div className="flex justify-between mb-2 font-bold">
                <span className="text-gray-400 uppercase text-xs">
                  Đã đăng ký
                </span>
                <span className="text-blue-600">
                  {registeredCount} / {maxParticipants}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000"
                  style={{ width: `${registrationPercent}%` }}
                />
              </div>
              <p className="text-xs mt-2 font-bold text-emerald-500">
                {availableSlots > 0
                  ? `Còn ${availableSlots} chỗ trống`
                  : "Đã hết chỗ"}
              </p>
            </div>
            <div className="space-y-3">
              {event.status !== "COMPLETED" ? (
                <>
                  {register && register.status === "REGISTERED" ? (
                    isCheckedIn ? (
                      <div className="space-y-3">
                        <div className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100 shadow-sm">
                          <ShieldCheck className="w-5 h-5" /> Đã điểm danh
                        </div>
                        {event.luckyDrawId && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={createDrawEntry}
                            className="relative w-20 h-20 bg-linear-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-[0_15px_35px_rgba(234,179,8,0.5)] flex items-center justify-center border-4 border-white overflow-hidden group"
                          >
                            <Gift className="w-10 h-10 text-white animate-bounce" />
                            <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/30 -z-10" />
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all group shadow-lg"
                      >
                        <CheckCircle className="w-5 h-5 group-hover:hidden" />
                        <X className="w-5 h-5 hidden group-hover:block" />
                        <span className="group-hover:hidden">Đã đăng ký</span>
                        <span className="hidden group-hover:block">
                          Hủy đăng ký
                        </span>
                      </button>
                    )
                  ) : // KIỂM TRA THỜI HẠN ĐĂNG KÝ
                  !isRegistrationOpen() ? (
                    <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center border border-gray-200">
                      <Timer className="w-5 h-5 inline mr-2" />
                      Đã hết hạn đăng ký
                    </div>
                  ) : availableSlots <= 0 ? (
                    <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center border border-gray-200">
                      <Users className="w-5 h-5 inline mr-2" />
                      Đã hết chỗ
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isProcessing}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-gray-300 transition-all"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang xử lý...
                        </div>
                      ) : register && register.status === "CANCELLED" ? (
                        "Đăng ký lại"
                      ) : (
                        "Đăng ký tham gia"
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-center border border-gray-200 italic">
                  Sự kiện đã kết thúc
                </div>
              )}

              {register && register.status === "REGISTERED" && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <QrCode size={18} /> Mã vé của tôi
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center relative"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black mb-1">Vé tham gia</h2>
              <p className="text-gray-400 text-sm mb-8 italic">
                Dùng mã này để điểm danh
              </p>
              <div className="bg-white p-6 border-4 border-blue-50 rounded-3xl inline-block shadow-inner">
                {isRegistered ? (
                  <QRCode value={qrValue} size={200} />
                ) : (
                  <div className="p-10 text-rose-500 font-bold">
                    Vui lòng đăng ký trước
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {event?.luckyDrawId && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: 50, opacity: 0 }}
            className="fixed bottom-8 right-8 z-999"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-2xl pointer-events-none"
            >
              🎉 Bạn có lượt quay may mắn!
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowLuckyWheel(true)}
              className="relative w-20 h-20 bg-linear-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-[0_15px_35px_rgba(234,179,8,0.5)] flex items-center justify-center border-4 border-white overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <Gift className="w-10 h-10 text-white animate-bounce" />

              <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/30 -z-10" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {showLuckyWheel && (
        <LuckyWheelModal
          onClose={() => setShowLuckyWheel(false)}
          event_attanded={register}
          luckDrawId={event.luckyDrawId}
        />
      )}

      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Xác nhận hủy?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Hành động này không thể hoàn tác. Bạn chắc chắn muốn hủy chứ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
                >
                  Đóng
                </button>
                <button
                  onClick={confirmCancelRegistration}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default EventDetail;
