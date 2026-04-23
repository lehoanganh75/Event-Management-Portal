import React, { useEffect } from 'react';
import { XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorNotification = ({ toastVisible, setToastVisible, notification = "Lỗi", message }) => {
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible, setToastVisible]);

  return (
    <AnimatePresence>
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-6 left-1/2 z-50 flex items-center w-full max-w-sm p-4 space-x-3 text-gray-600 bg-white border-l-4 border-red-500 rounded-lg shadow-xl"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-full">
            <XCircle size={20} />
          </div>
          <div className="ml-3 text-sm font-normal flex-1">
            <span className="mb-1 text-sm font-bold text-gray-900 block">{notification}</span>
            <div className="text-sm font-medium text-gray-600 leading-snug">{message}</div>
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 transition-colors"
            onClick={() => setToastVisible(false)}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorNotification;
