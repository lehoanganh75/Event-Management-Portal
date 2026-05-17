import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp } from "lucide-react";

const ImportOverlay = ({ isImporting }) => {
  return (
    <AnimatePresence>
      {isImporting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed inset-0 z-[200]
            flex items-center justify-center
            bg-slate-900/50
            px-4
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="
              w-full max-w-sm
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-xl
              p-8
              text-center
            "
          >
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-2xl bg-blue-50" />

              <div className="absolute inset-0 flex items-center justify-center">
                <FileUp size={30} className="text-[#1E40AF]" />
              </div>

              <div className="absolute -right-1 -top-1 w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin bg-white" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Đang phân tích kế hoạch
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed">
              AI đang trích xuất thông tin từ file Word của bạn. Vui lòng chờ trong giây lát.
            </p>

            <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-[#1E40AF] rounded-full animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportOverlay;