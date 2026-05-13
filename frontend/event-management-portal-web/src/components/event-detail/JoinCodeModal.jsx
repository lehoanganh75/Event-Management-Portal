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
  setShowScanner 
}) => {
  const handleJoin = async () => {
    if (!pinInput.trim() || pinInput.trim().length < 6) {
      toast.warning("Vui lòng nhập đủ 6 ký tự mã PIN");
      return;
    }
    try {
      const res = await eventService.getQuizByPin(pinInput.trim());
      if (res.data?.id) {
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
          className="fixed inset-0 z-[10000] bg-[#46178F] flex flex-col items-center justify-center p-6 overflow-hidden"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
          >
            <X size={28} />
          </button>

          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i} 
                className="absolute rounded-full bg-white/10"
                style={{ 
                  width: 10 + (i % 5) * 20, 
                  height: 10 + (i % 5) * 20, 
                  left: `${(i * 13) % 100}%`, 
                  top: `${(i * 17) % 100}%` 
                }}
                animate={{ y: [0, -50, 0], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-12 border-4 border-white/30 shadow-2xl"
            >
              <Trophy size={64} className="text-amber-300" fill="currentColor" />
            </motion.div>

            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 text-center">Tham gia ngay!</h2>
            <p className="text-white/60 text-lg font-bold uppercase tracking-[0.3em] mb-16 text-center">Nhập mã PIN hoặc quét QR để bắt đầu</p>
            
            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
              {/* CENTER: PIN INPUT */}
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="MÃ PIN (6 KÝ TỰ)"
                    maxLength={6}
                    value={pinInput}
                    className="w-full bg-white rounded-[2rem] px-8 py-8 text-4xl font-black text-center uppercase tracking-[0.4em] text-[#46178F] shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus:ring-8 focus:ring-white/20 outline-none transition-all placeholder:tracking-normal placeholder:font-black placeholder:text-slate-200"
                    onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJoin();
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoin}
                  className="w-full py-5 bg-amber-400 text-slate-900 rounded-[2rem] font-black text-xl uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-amber-300 transition-all"
                >
                  Tham gia →
                </motion.button>
              </div>

              {/* RIGHT: QR SCANNER BUTTON */}
              <div className="flex-shrink-0">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="w-24 h-24 md:w-32 md:h-32 bg-amber-400 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-amber-300 hover:scale-105 transition-all shadow-2xl group"
                >
                  <QrCode size={40} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Quét QR</span>
                </button>
              </div>
            </div>

            <p className="mt-16 text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">Đang đợi bạn nhập mã...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default JoinCodeModal;
