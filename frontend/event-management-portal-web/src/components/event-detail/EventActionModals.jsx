import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

import TicketDetail from "../ticket/TicketDetail";
import RegisterModal from "../common/RegisterModal";
import QRScannerModal from "../common/management/QRScannerModal";
import QuizModal from "../quiz/QuizModal";
import SurveyModal from "../survey/SurveyModal";
import QAModal from "../survey/QAModal";
import FeedbackModal from "../engagement/FeedbackModal";

const EventActionModals = ({
  event,
  user,
  t,
  showTicket,
  setShowTicket,
  showRegisterModal,
  setShowRegisterModal,
  confirmRegistration,
  isRegistering,
  registrationError,
  showScanner,
  setShowScanner,
  handleScanSuccess,
  showCancelModal,
  setShowCancelModal,
  handleCancelRegistration,
  showQuizModal,
  setShowQuizModal,
  joiningQuizId,
  setJoiningQuizId,
  showSurveyModal,
  setShowSurveyModal,
  showQAModal,
  setShowQAModal,
  showFeedbackModal,
  setShowFeedbackModal
}) => {
  return (
    <>
      {/* Ticket Modal */}
      {createPortal(
        <AnimatePresence>
          {showTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 20, scale: 0.96 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-xl"
              >
                {/* Close */}
                <button
                  onClick={() => setShowTicket(false)}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <XCircle size={26} />
                </button>

                {/* Content */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <TicketDetail eventId={event.id} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onConfirm={confirmRegistration}
        event={event}
        isRegistering={isRegistering}
        error={registrationError}
        isGuest={!user}
      />

      {/* QR Scanner */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Cancel Registration Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              {/* Top Accent */}
              <div className="h-1.5 bg-gradient-to-r from-rose-500 to-red-500" />

              <div className="p-7 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-5">
                  <XCircle size={30} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {"Hủy đăng ký?"}
                </h3>

                {/* Desc */}
                <p className="text-sm text-slate-500 leading-6 mb-7">
                  {"Bạn chắc chắn muốn hủy tham gia? Bạn có thể mất suất nếu sự kiện đã đủ người."}
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
                  >
                    {"Quay lại"}
                  </button>

                  <button
                    onClick={handleCancelRegistration}
                    className="h-11 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    {"Hủy ngay"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz */}
      {showQuizModal && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => {
            setShowQuizModal(false);
            setJoiningQuizId(null);
          }}
          isOrganizer={false}
          eventId={event.id}
          quizId={joiningQuizId}
        />
      )}

      {/* Survey */}
      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        survey={event.survey}
        eventId={event.id}
      />

      {/* Q&A */}
      <QAModal
        isOpen={showQAModal}
        onClose={() => setShowQAModal(false)}
        eventId={event.id}
        event={event}
        user={user}
      />

      {/* Feedback */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        eventId={event.id}
        user={user}
      />
    </>
  );
};

export default EventActionModals;
