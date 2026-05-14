import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";

const PostDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="
              relative
              w-full max-w-sm
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-xl
              p-6
              text-center
            "
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} />
            </div>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Xác nhận xóa?
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  flex-1 h-11
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-600
                  text-sm font-medium
                  hover:bg-slate-50
                  disabled:opacity-60
                  transition
                "
              >
                Hủy bỏ
              </button>

              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="
                  flex-1 h-11
                  rounded-xl
                  bg-red-600
                  text-white
                  text-sm font-medium
                  hover:bg-red-700
                  disabled:bg-red-400
                  transition
                  flex items-center justify-center
                "
              >
                {isSubmitting ? (
                  <Loader2
                    className="animate-spin"
                    size={19}
                  />
                ) : (
                  "Xóa ngay"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostDeleteModal;