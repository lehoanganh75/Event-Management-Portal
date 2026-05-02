import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

const PromptModal = ({ isOpen, onClose, onConfirm, title, message, placeholder, defaultValue = "" }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

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
          className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl shadow-indigo-500/20 overflow-hidden"
        >
          {/* Header with Gradient Decor */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {message}
            </p>

            <div className="relative mb-8">
              <textarea
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none h-32"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => onConfirm(value)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Xác nhận
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromptModal;
