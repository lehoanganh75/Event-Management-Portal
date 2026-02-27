import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorNotification = ({
  toastVisible,
  setToastVisible,
  notification = "Đăng ký thất bại!",
  message = "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.",
  duration = 5000,
}) => {
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toastVisible, setToastVisible, duration]);

  if (!toastVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out
      ${toastVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-12 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative overflow-hidden w-full max-w-xl
          bg-linear-to-r from-red-600 via-rose-600 to-pink-600
          text-white rounded-2xl shadow-2xl shadow-red-900/40
          border border-white/10 backdrop-blur-xl">

        {/* Progress bar đỏ */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-white/70 animate-progress"
          style={{ animationDuration: `${duration}ms` }}
        />

        <div className="flex items-start gap-4 p-6">

          {/* Icon cảnh báo */}
          <div className="shrink-0">
            <div className="w-12 h-12 flex items-center justify-center
                rounded-full bg-white/15 backdrop-blur-md
                border border-white/20 shadow-inner">
              <AlertCircle size={26} className="text-white drop-shadow-md" />
            </div>
          </div>

          {/* Nội dung lỗi */}
          <div className="flex-1">
            <p className="font-semibold text-lg tracking-tight">
              {notification}
            </p>
            <p className="mt-1 text-white/90 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Nút đóng */}
          <button
            onClick={() => setToastVisible(false)}
            className="shrink-0 p-2 rounded-full
                hover:bg-white/15 transition duration-200"
            aria-label="Đóng thông báo"
          >
            <X size={20} className="text-white/80 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;