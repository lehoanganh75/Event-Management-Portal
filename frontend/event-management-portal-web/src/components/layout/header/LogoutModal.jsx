import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

const LogoutModal = ({
  isOpen,
  setIsOpen,
  handleLogout,
  t,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="
            fixed inset-0 z-[9999]
            flex items-center justify-center
            p-4
          "
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="
              absolute inset-0
              bg-black/40
              backdrop-blur-[3px]
            "
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              relative
              w-full max-w-md
              bg-white
              rounded-3xl
              border border-slate-200
              shadow-[0_20px_60px_rgba(15,23,42,0.18)]
              overflow-hidden
            "
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="
                absolute top-4 right-4
                w-9 h-9
                rounded-xl
                flex items-center justify-center
                text-slate-400
                hover:text-slate-700
                hover:bg-slate-100
                transition
              "
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="px-7 pt-7 pb-6">
              {/* Icon */}
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-rose-50
                  text-rose-600
                  flex items-center justify-center
                  mb-5
                "
              >
                <LogOut size={24} />
              </div>

              {/* Title */}
              <h3
                className="
                  text-[22px]
                  font-semibold
                  text-slate-900
                  leading-tight
                  mb-2
                "
              >
                {"Đăng xuất?"}
              </h3>

              {/* Desc */}
              <p
                className="
                  text-[14px]
                  text-slate-500
                  leading-relaxed
                "
              >
                {"Bạn có chắc chắn muốn rời khỏi hệ thống ngay bây giờ không?"}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    border border-slate-200
                    text-slate-600
                    text-[14px]
                    font-medium
                    hover:bg-slate-50
                    transition
                  "
                >
                  {"Hủy"}
                </button>

                <button
                  onClick={handleLogout}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-rose-500
                    hover:bg-rose-600
                    text-white
                    text-[14px]
                    font-medium
                    transition
                    shadow-sm
                  "
                >
                  {"Đăng xuất"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
