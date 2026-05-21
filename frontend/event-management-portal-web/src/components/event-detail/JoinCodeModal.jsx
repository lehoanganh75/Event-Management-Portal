import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, QrCode } from "lucide-react";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

const JoinCodeModal = ({ 
  isOpen, 
  onClose, 
  pinInput, 
  setPinInput, 
  setJoiningQuizId, 
  setShowQuizModal, 
  setShowQuizScanner,
  user,
  role,
  event
}) => {
  const handleJoin = async () => {
    const cleanedPin = pinInput.replace(/\s+/g, "").toUpperCase();
    if (!cleanedPin || cleanedPin.length < 6) {
      toast.warning("Vui lòng nhập đủ 6 ký tự mã PIN");
      return;
    }
    try {
      const res = await eventService.getQuizByPin(cleanedPin);
      if (res.data?.id) {
        // Enforce Check-in logic
        const isSystemAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role?.toUpperCase());
        const isLecturer = user?.role?.toUpperCase() === "LECTURER";
        const roleData = event?.currentUserRole || {};
        const isTeam = roleData?.creator || roleData?.approver || !!roleData?.organizerRole;
        const canBypassCheckIn = isSystemAdmin || isLecturer || isTeam;

        if (res.data.requireCheckIn && !canBypassCheckIn) {
          if (!user) {
            toast.error("Vui lòng đăng nhập và check-in để tham gia thử thách này.");
            return;
          }
          if (!roleData?.registered || !roleData?.registration?.checkedIn) {
            toast.error("Bạn cần hoàn tất Check-in tại quầy để tham gia thử thách này!");
            return;
          }
        }

        setJoiningQuizId(res.data.id);
        setShowQuizModal(true);
        onClose();
        setPinInput("");
        toast.success("Kết nối thành công!");
      } else {
        toast.error("Mã PIN không đúng hoặc trò chơi chưa được tạo");
      }
    } catch {
      toast.error("Mã PIN không đúng hoặc trò chơi chưa được tạo");
      setTimeout(() => setPinInput(""), 800);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[10000] bg-[#46178F] overflow-y-auto px-4 py-8 md:p-6"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="fixed top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md z-[10001]"
          >
            <X size={24} className="md:w-7 md:h-7" />
          </button>

          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i} 
                className="absolute rounded-full bg-white/10"
                style={{ 
                  width: 10 + (i % 5) * 15, 
                  height: 10 + (i % 5) * 15, 
                  left: `${(i * 13) % 100}%`, 
                  top: `${(i * 17) % 100}%` 
                }}
                animate={{ y: [0, -50, 0], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
              />
            ))}
          </div>

          <div className="relative z-10 min-h-full w-full flex flex-col items-center justify-center py-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 md:mb-12 border-4 border-white/30 shadow-2xl"
            >
              <Trophy className="w-10 h-10 md:w-16 md:h-16 text-amber-300" fill="currentColor" />
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4 text-center">Tham gia ngay!</h2>
            <p className="text-white/60 text-xs md:text-lg font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-8 md:mb-16 text-center">Nhập mã PIN hoặc quét QR để bắt đầu</p>
            
            <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 w-full max-w-md md:max-w-2xl px-2">
              {/* CENTER: PIN INPUT */}
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="MÃ PIN"
                    maxLength={6}
                    value={pinInput}
                    className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] px-4 py-4 md:px-8 md:py-8 text-2xl md:text-4xl font-black text-center uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#46178F] shadow-[0_15px_35px_rgba(0,0,0,0.3)] focus:ring-4 md:focus:ring-8 focus:ring-white/20 outline-none transition-all placeholder:tracking-normal placeholder:font-black placeholder:text-slate-300"
                    onChange={(e) => setPinInput(e.target.value.replace(/\s+/g, "").toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJoin();
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoin}
                  className="w-full py-4 md:py-5 bg-amber-400 text-slate-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-amber-300 transition-all"
                >
                  Tham gia →
                </motion.button>
              </div>

              {/* RIGHT: QR SCANNER BUTTON */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <button 
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      setShowQuizScanner(true);
                    }, 300);
                  }}
                  className="w-full md:w-32 h-14 md:h-auto bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] md:rounded-[2rem] flex md:flex-col items-center justify-center gap-3 md:gap-2 px-6 md:px-0 hover:scale-105 transition-all border border-white/20 shadow-2xl group"
                >
                  <QrCode className="w-6 h-6 md:w-10 md:h-10 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs md:text-[10px] font-black uppercase tracking-widest">Quét QR</span>
                </button>
              </div>
            </div>

            <p className="mt-8 md:mt-16 text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse text-center">Đang đợi bạn nhập mã...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default JoinCodeModal;
