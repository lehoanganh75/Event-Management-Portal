import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, CheckCircle2 } from "lucide-react";

const RegisterModal = ({ isOpen, onClose, onConfirm, event, isRegistering, error }) => {
  if (!isOpen) return null;

  const formatDateTime = (iso) => {
    if (!iso) return "Chưa cập nhật";
    const d = new Date(iso);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with Image */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={event?.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"}
                alt={event?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-8 pt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Xác nhận đăng ký</h3>
                  <p className="text-gray-500 text-sm">Bạn đang thực hiện đăng ký tham gia sự kiện</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                <h4 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2">
                  {event?.title}
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <Calendar size={16} className="text-blue-500" />
                    <span>{formatDateTime(event?.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="truncate">{event?.location}</span>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center text-red-600 text-sm font-medium"
                >
                  <X size={18} className="shrink-0 bg-red-100 rounded-full p-0.5" />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isRegistering}
                  className="flex-1 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    "Xác nhận ngay"
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                Bằng cách nhấn xác nhận, bạn đồng ý với các điều khoản tham gia của sự kiện này.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;
