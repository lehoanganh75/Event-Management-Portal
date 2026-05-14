import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Eye, Loader2 } from "lucide-react";

const PostModals = ({
  fullscreenImage,
  setFullscreenImage,
  actionModal,
  setActionModal,
  isProcessingAction,
  handleDeleteComment,
  handleHideComment,
  t,
  language
}) => {
  return (
    <>
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullscreenImage}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              alt="fullscreen"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionModal({ show: false, type: null, commentId: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${actionModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                {actionModal.type === 'delete' ? <Trash2 size={36} /> : <Eye size={36} />}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                {actionModal.type === 'delete' ? t('delete_confirm_title') : (language === 'VI' ? 'Xác nhận ẩn' : 'Confirm hide')}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                {actionModal.type === 'delete' ? t('delete_confirm_desc') : (language === 'VI' ? 'Bạn có chắc muốn ẩn bình luận này khỏi bài viết?' : 'Are you sure you want to hide this comment?') }
              </p>
              <div className="flex gap-4">
                <button
                  disabled={isProcessingAction}
                  onClick={() => setActionModal({ show: false, type: null, commentId: null })}
                  className="flex-1 px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  disabled={isProcessingAction}
                  onClick={async () => {
                    setIsProcessingAction(true);
                    if (actionModal.type === 'delete') {
                      await handleDeleteComment(actionModal.commentId);
                    } else {
                      await handleHideComment(actionModal.commentId);
                    }
                    setIsProcessingAction(false);
                    setActionModal({ show: false, type: null, commentId: null });
                  }}
                  className={`flex-1 px-6 py-3.5 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${actionModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                >
                  {isProcessingAction ? <Loader2 size={18} className="animate-spin" /> : (actionModal.type === 'delete' ? t('delete') : t('confirm'))}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostModals;
