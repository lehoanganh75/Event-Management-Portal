import React from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Send,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InvitationActions = ({
  submitting,
  showRejectForm,
  setShowRejectForm,
  handleAccept,
  handleReject,
  rejectionReason,
  setRejectionReason,
}) => {
  return (
    <div className="mt-8">
      <AnimatePresence mode="wait">
        {!showRejectForm ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Accept */}
            <button
              onClick={handleAccept}
              disabled={submitting}
              className="
                h-12
                rounded-xl
                bg-[#1E40AF]
                text-white
                font-semibold
                flex items-center justify-center gap-2
                hover:bg-blue-700
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {submitting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={18} />
              )}

              <span>
                Chấp nhận tham gia
              </span>
            </button>

            {/* Reject */}
            <button
              onClick={() =>
                setShowRejectForm(true)
              }
              disabled={submitting}
              className="
                h-12
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-700
                font-semibold
                flex items-center justify-center gap-2
                hover:bg-slate-50
                hover:border-slate-300
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <XCircle size={18} />

              <span>
                Từ chối lời mời
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="reject-form"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="
              border border-red-100
              bg-red-50/40
              rounded-2xl
              p-6
            "
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div
                className="
                  w-10 h-10
                  rounded-xl
                  bg-red-100
                  text-red-600
                  flex items-center justify-center
                  shrink-0
                "
              >
                <AlertTriangle size={18} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Lý do từ chối
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Vui lòng cho biết lý do
                  bạn không thể tham gia.
                </p>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(
                  e.target.value
                )
              }
              placeholder="Nhập lý do tại đây..."
              className="
                w-full
                min-h-[110px]
                rounded-xl
                border border-slate-200
                bg-white
                px-4 py-3
                text-sm text-slate-700
                outline-none
                resize-none
                focus:border-red-300
                focus:ring-4
                focus:ring-red-100
                transition-all
              "
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={handleReject}
                disabled={submitting}
                className="
                  flex-1
                  h-11
                  rounded-xl
                  bg-red-600
                  text-white
                  font-semibold
                  flex items-center justify-center gap-2
                  hover:bg-red-700
                  transition-all
                  disabled:opacity-50
                "
              >
                {submitting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}

                <span>
                  Xác nhận từ chối
                </span>
              </button>

              <button
                onClick={() =>
                  setShowRejectForm(false)
                }
                disabled={submitting}
                className="
                  h-11
                  px-5
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-600
                  font-medium
                  flex items-center justify-center gap-2
                  hover:bg-slate-50
                  transition-all
                "
              >
                <ArrowLeft size={16} />

                <span>Quay lại</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationActions;
