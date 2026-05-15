import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const InvitationResult = ({
  accepted,
  isPresenter,
  invitation,
  rejectionReason,
  navigate,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Top status */}
        <div
          className={`px-8 pt-10 pb-8 text-center ${accepted
              ? "bg-gradient-to-b from-emerald-50 to-white"
              : "bg-gradient-to-b from-red-50 to-white"
            }`}
        >
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm ${accepted
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
              }`}
          >
            {accepted ? (
              <CheckCircle2 size={52} />
            ) : (
              <XCircle size={52} />
            )}
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
            {accepted
              ? isPresenter
                ? "Chào mừng Diễn giả!"
                : "Chào mừng thành viên BTC!"
              : "Đã từ chối lời mời"}
          </h2>

          <p className="text-slate-500 leading-7 text-[15px] max-w-md mx-auto">
            {accepted
              ? isPresenter
                ? "Cảm ơn bạn đã đồng hành và chia sẻ kiến thức tại sự kiện. Chúng tôi rất mong chờ phần trình bày của bạn."
                : "Bạn đã chính thức tham gia vào đội ngũ tổ chức sự kiện. Hãy cùng tạo nên một chương trình thật thành công."
              : "Chúng tôi đã ghi nhận phản hồi của bạn. Hy vọng sẽ có cơ hội hợp tác trong những sự kiện tiếp theo."}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <CalendarDays
                  size={20}
                  className="text-indigo-500"
                />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Sự kiện
                </p>

                <p className="font-semibold text-slate-700 leading-6">
                  {invitation.event?.title}
                </p>
              </div>
            </div>

            {!accepted && (
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  <AlertCircle
                    size={20}
                    className="text-red-500"
                  />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Lý do từ chối
                  </p>

                  <p className="text-slate-600 italic leading-6">
                    “
                    {rejectionReason ||
                      invitation.rejectionReason ||
                      "Không có lý do cụ thể"}
                    ”
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={() => navigate("/")}
            className="w-full mt-8 h-14 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            Về trang chủ
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InvitationResult;
