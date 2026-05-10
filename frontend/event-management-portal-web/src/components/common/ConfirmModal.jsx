import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = "danger" }) => {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header Decor */}
          <div className={`absolute top-0 left-0 right-0 h-2 ${isDanger ? "bg-rose-500" : "bg-indigo-500"}`} />
          
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className={`${isDanger ? "bg-rose-50" : "bg-indigo-50"} p-4 rounded-full`}>
                {isDanger ? (
                  <AlertCircle className="text-rose-600" size={32} />
                ) : (
                  <CheckCircle2 className="text-indigo-600" size={32} />
                )}
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 ${isDanger ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"} text-white rounded-xl font-bold shadow-lg transition-all`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
