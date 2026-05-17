import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({
  templateToDelete,
  setTemplateToDelete,
  handleDelete,
  isDeleting
}) => {
  return (
    <AnimatePresence>
      {templateToDelete && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTemplateToDelete(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa mẫu?</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Bạn đang thực hiện xóa mẫu <span className="text-gray-800 font-semibold">"{templateToDelete.templateName}"</span>. Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận xóa"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
