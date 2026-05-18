import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  XCircle,
  CheckCircle,
} from "lucide-react";

import ConfirmModal from "../../ConfirmModal";
import PromptModal from "../../PromptModal";
import EventReviewStep from "../../../event-planner/EventReviewstep";
import CreateEventModal from "../../../event-planner/CreateEventModal";
import CreatePlanModal from "../../../event-planner/CreatePlanModal";

const ManagementModals = ({
  mode,
  isAdminMode,
  deleteModal,
  setDeleteModal,
  handleDelete,
  cancelModal,
  setCancelModal,
  handleCancel,
  promptModal,
  setPromptModal,
  previewModal,
  setPreviewModal,
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleSelectPlan,
  handleCreateNew,
  handleExportWord,
  handleStatusUpdate,
}) => {
  return (
    <>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        confirmText="Xóa ngay"
        type="danger"
      />

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        title="Xác nhận hủy"
        message="Bạn có chắc chắn muốn hủy sự kiện này? Hệ thống sẽ thông báo tới người tham gia."
        onConfirm={handleCancel}
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        confirmText="Xác nhận hủy"
        type="warning"
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        message={promptModal.message}
        placeholder={promptModal.placeholder}
        defaultValue={promptModal.defaultValue}
        onConfirm={promptModal.onConfirm}
        onCancel={() =>
          setPromptModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setPreviewModal({
                  isOpen: false,
                  event: null,
                })
              }
              className="absolute inset-0 bg-slate-900/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="
                relative
                bg-white
                w-full
                max-w-5xl
                h-[90vh]
                rounded-2xl
                border border-slate-200
                shadow-2xl
                overflow-hidden
                flex flex-col
              "
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center shadow-sm">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Chi tiết kế hoạch
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Xem trước nội dung đề xuất
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setPreviewModal({
                      isOpen: false,
                      event: null,
                    })
                  }
                  className="
                    w-10 h-10
                    rounded-xl
                    border border-slate-200
                    bg-white
                    flex items-center justify-center
                    text-slate-500
                    hover:bg-slate-100
                    hover:text-slate-700
                    transition-all
                  "
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <div className="p-6 md:p-8">
                  <EventReviewStep
                    formData={{
                      ...previewModal.event,
                      eventTitle: previewModal.event.title,
                      eventPurpose: previewModal.event.description,
                    }}
                    isPlanMode={true}
                    onBack={() =>
                      setPreviewModal({
                        isOpen: false,
                        event: null,
                      })
                    }
                    isReadOnly={true}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={() =>
                    handleExportWord(previewModal.event)
                  }
                  className="
                    mr-auto
                    flex items-center gap-2
                    px-5 py-2.5
                    rounded-xl
                    bg-indigo-50
                    text-indigo-700
                    border border-indigo-100
                    text-sm font-medium
                    hover:bg-indigo-100
                    transition-all
                  "
                >
                  <Download size={17} />
                  Xuất Word
                </button>

                {isAdminMode &&
                  previewModal.event.status ===
                  "PLAN_PENDING_APPROVAL" && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            previewModal.event.id,
                            "REJECTED"
                          );

                          setPreviewModal({
                            isOpen: false,
                            event: null,
                          });
                        }}
                        className="
                          flex items-center gap-2
                          px-5 py-2.5
                          rounded-xl
                          bg-rose-50
                          text-rose-700
                          border border-rose-100
                          text-sm font-medium
                          hover:bg-rose-100
                          transition-all
                        "
                      >
                        <XCircle size={17} />
                        Từ chối
                      </button>

                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            previewModal.event.id,
                            "PLAN_APPROVED"
                          );

                          setPreviewModal({
                            isOpen: false,
                            event: null,
                          });
                        }}
                        className="
                          flex items-center gap-2
                          px-5 py-2.5
                          rounded-xl
                          bg-emerald-600
                          text-white
                          text-sm font-medium
                          hover:bg-emerald-700
                          transition-all
                          shadow-sm
                        "
                      >
                        <CheckCircle size={17} />
                        Phê duyệt
                      </button>
                    </>
                  )}

                {isAdminMode &&
                  previewModal.event.status ===
                  "EVENT_PENDING_APPROVAL" && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            previewModal.event.id,
                            "REJECTED"
                          );

                          setPreviewModal({
                            isOpen: false,
                            event: null,
                          });
                        }}
                        className="
                          flex items-center gap-2
                          px-5 py-2.5
                          rounded-xl
                          bg-rose-50
                          text-rose-700
                          border border-rose-100
                          text-sm font-medium
                          hover:bg-rose-100
                          transition-all
                        "
                      >
                        <XCircle size={17} />
                        Từ chối
                      </button>

                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            previewModal.event.id,
                            "PUBLISHED"
                          );

                          setPreviewModal({
                            isOpen: false,
                            event: null,
                          });
                        }}
                        className="
                          flex items-center gap-2
                          px-5 py-2.5
                          rounded-xl
                          bg-emerald-600
                          text-white
                          text-sm font-medium
                          hover:bg-emerald-700
                          transition-all
                          shadow-sm
                        "
                      >
                        <CheckCircle size={17} />
                        Đăng tải
                      </button>
                    </>
                  )}

                <button
                  onClick={() =>
                    setPreviewModal({
                      isOpen: false,
                      event: null,
                    })
                  }
                  className="
                    px-6 py-2.5
                    rounded-xl
                    bg-slate-800
                    text-white
                    text-sm font-medium
                    hover:bg-slate-900
                    transition-all
                  "
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {mode === "plan" ? (
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSelectPlan={handleSelectPlan}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSelectPlan={handleSelectPlan}
          onCreateNew={handleCreateNew}
        />
      )}
    </>
  );
};

export default ManagementModals;