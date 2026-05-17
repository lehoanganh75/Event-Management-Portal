import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Trash2 } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button:
        "bg-red-600 hover:bg-red-700 text-white",
    },

    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      button:
        "bg-amber-500 hover:bg-amber-600 text-white",
    },

    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button:
        "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="
              relative w-full max-w-md
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-xl
            "
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${style.iconBg}
                  `}
                >
                  {type === "danger" ? (
                    <Trash2
                      size={22}
                      className={style.iconColor}
                    />
                  ) : (
                    <AlertTriangle
                      size={22}
                      className={style.iconColor}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="
                  w-9 h-9 rounded-lg
                  flex items-center justify-center
                  text-slate-400
                  hover:text-slate-600
                  hover:bg-slate-100
                  transition-all
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 bg-slate-50 rounded-b-2xl">
              <button
                onClick={onClose}
                className="
                  px-5 py-2.5
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-600
                  text-sm font-medium
                  hover:bg-slate-100
                  transition-all
                "
              >
                {cancelText}
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`
                  px-5 py-2.5
                  rounded-xl
                  text-sm font-medium
                  transition-all
                  shadow-sm
                  ${style.button}
                `}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;