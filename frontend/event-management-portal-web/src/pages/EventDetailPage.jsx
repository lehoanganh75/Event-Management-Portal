import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle, X, 
  AlertCircle, QrCode, ShieldCheck, Gift, Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import LuckyWheelModal from "../components/luckyWheelModal/LuckyWheelModal";

// IMPORT CONTEXT
import { useEvent } from "../context/EventContext";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // 1. LẤY SERVICE TỪ USEEVENT
  const { events } = useEvent();

  const [event, setEvent] = useState(null);
  const [register, setRegister] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [registrationId, setRegistrationId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 2. LOAD DATA DÙNG events SERVICE
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;
      setIsLoading(true);

      try {
        // Lấy thông tin sự kiện qua hàm đã fix path /events/events/...
        const eventRes = await events.getEventById(eventId);
        setEvent(eventRes.data);

        try {
          // Kiểm tra đăng ký (Dùng hàm .events để gọi endpoint custom nếu chưa định nghĩa hàm riêng)
          const regRes = await events.checkRegistration(eventId);
          const myRegData = regRes.data;
          if (myRegData) {
            setRegister(myRegData);
            setIsRegistered(true);
            setRegistrationId(myRegData.id);
            setIsCheckedIn(myRegData.checkedIn || false);
            setQrValue(myRegData.qrToken || `REG-${myRegData.id}`);
          }
        } catch (regErr) {
          if (regErr.response?.status !== 404) console.error(regErr);
        }
      } catch (err) {
        showToast("Lỗi tải dữ liệu sự kiện", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadEventData();
  }, [eventId, events]);

  // 3. ĐĂNG KÝ THAM GIA
  const handleRegister = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      showToast("Vui lòng đăng nhập để đăng ký!", "error");
      return navigate("/login");
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      showToast("Đã hết hạn đăng ký!", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await events.registerToEvent(eventId);
      const newReg = res.data;
      setRegister(newReg);
      setIsRegistered(true);
      setRegistrationId(newReg.id);
      setQrValue(newReg.qrToken || `REG-${newReg.id}`);
      setEvent(prev => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
      showToast("Đăng ký thành công!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Đăng ký thất bại", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. HỦY ĐĂNG KÝ
  const confirmCancelRegistration = async () => {
    setIsProcessing(true);
    setShowCancelModal(false);
    try {
      await events.cancelRegistration(eventId);
      setIsRegistered(false);
      setRegister(null);
      setRegistrationId(null);
      setEvent(prev => ({ ...prev, registeredCount: Math.max(0, (prev.registeredCount || 0) - 1) }));
      showToast("Đã hủy đăng ký thành công!", "success");
    } catch (error) {
      showToast("Không thể hủy đăng ký", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. VÒNG QUAY MAY MẮN
  const createDrawEntry = async () => {
    try {
      // Gọi qua API Lucky Draw (nên đưa vào service nếu có thể)
      const res = await events.events.post(`/draw/draw-entries/${event.luckyDrawId}`);
      if (res.data) {
        showToast("Đã nhận lượt quay thưởng!", "success");
        setShowLuckyWheel(true);
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Bạn không đủ điều kiện quay", "error");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Đang tải...</p>
    </div>
  );

  if (!event) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy sự kiện.</div>;

  const registeredCount = event.registeredCount || 0;
  const maxParticipants = event.maxParticipants || 1;
  const availableSlots = Math.max(0, maxParticipants - registeredCount);
  const registrationPercent = Math.min(100, (registeredCount / maxParticipants) * 100);

  const isRegistrationOpen = () => {
    if (!event?.registrationDeadline) return true;
    return new Date() <= new Date(event.registrationDeadline);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`fixed top-24 right-6 z-110 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-80 bg-gray-900 overflow-hidden">
        <img src={event.coverImage || "https://via.placeholder.com/1200x600"} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white max-w-7xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:underline"><ArrowLeft size={18} /> Quay lại</button>
          <h1 className="text-4xl font-black uppercase">{event.title}</h1>
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
                    <p className="text-xs text-gray-500 uppercase font-bold">Ngày tổ chức</p>
                    <p className="font-bold">{new Date(event.startTime).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <MapPin className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Địa điểm</p>
                    <p className="font-bold">{event.location}</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                  <Timer className="text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Hạn đăng ký</p>
                    <p className="font-bold">{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString("vi-VN") : "Không giới hạn"}</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <Clock className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Giờ bắt đầu</p>
                    <p className="font-bold">{new Date(event.startTime).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
            </div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Khối Diễn Giả */}
          {event.presenters && event.presenters.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-orange-500" /> Diễn giả</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.presenters.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border bg-slate-50/50">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shrink-0">
                      <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.fullName}`} className="w-full h-full object-cover" alt=""/>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{p.fullName}</h4>
                      <p className="text-[10px] text-blue-600 font-bold uppercase">{p.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 sticky top-24">
            <div className="mb-6">
              <div className="flex justify-between mb-2 font-bold">
                <span className="text-gray-400 uppercase text-xs">Đã đăng ký</span>
                <span className="text-blue-600">{registeredCount} / {maxParticipants}</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${registrationPercent}%` }} />
              </div>
              <p className="text-xs mt-2 font-bold text-emerald-500">{availableSlots > 0 ? `Còn ${availableSlots} chỗ trống` : "Đã hết chỗ"}</p>
            </div>
            
            <div className="space-y-3">
              {event.status === "COMPLETED" ? (
                <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-center border border-gray-200 italic">Sự kiện đã kết thúc</div>
              ) : (
                <>
                  {isRegistered ? (
                    isCheckedIn ? (
                      <div className="space-y-3">
                        <div className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100 shadow-sm">
                          <ShieldCheck className="w-5 h-5" /> Đã điểm danh
                        </div>
                        {event.luckyDrawId && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={createDrawEntry}
                            className="w-full py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-100">
                            <Gift size={20} /> Quay thưởng ngay
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => setShowCancelModal(true)}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all group">
                        <CheckCircle className="w-5 h-5 group-hover:hidden" />
                        <X className="w-5 h-5 hidden group-hover:block" />
                        <span className="group-hover:hidden">Đã đăng ký</span>
                        <span className="hidden group-hover:block">Hủy đăng ký</span>
                      </button>
                    )
                  ) : !isRegistrationOpen() ? (
                    <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center border border-gray-200">Đã hết hạn đăng ký</div>
                  ) : availableSlots <= 0 ? (
                    <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center border border-gray-200">Đã hết chỗ</div>
                  ) : (
                    <button onClick={handleRegister} disabled={isProcessing}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg disabled:bg-gray-300 transition-all">
                      {isProcessing ? "Đang xử lý..." : "Đăng ký tham gia"}
                    </button>
                  )}
                </>
              )}

              {isRegistered && (
                <button onClick={() => setShowQRModal(true)}
                  className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <QrCode size={18} /> Mã vé của tôi
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center relative">
              <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-1 italic">VÉ THAM GIA</h2>
              <div className="bg-white p-6 border-4 border-blue-50 rounded-3xl inline-block mt-4">
                <QRCode value={qrValue} size={200} />
              </div>
              <p className="mt-4 text-slate-400 font-bold tracking-widest">{register?.ticketCode}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center">
              <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 uppercase">Xác nhận hủy?</h3>
              <p className="text-gray-500 text-sm mb-6 font-medium">Bạn chắc chắn muốn hủy đăng ký tham gia sự kiện này chứ?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Đóng</button>
                <button onClick={confirmCancelRegistration} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-100">Xác nhận hủy</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showLuckyWheel && (
        <LuckyWheelModal onClose={() => setShowLuckyWheel(false)} event_attanded={register} luckDrawId={event.luckyDrawId} />
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;