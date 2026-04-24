import React from 'react';
import { toast } from 'react-toastify';
import { CheckSquare } from 'lucide-react';

export const showToast = (message, type = 'success') => {
  const content = (
    <div className="custom-toast-message">
      {type === 'success' && <CheckSquare size={18} className="custom-toast-inner-icon" />}
      <span>{message}</span>
    </div>
  );

  const options = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  switch (type) {
    case 'success':
      toast.success(content, options);
      break;
    case 'error':
      toast.error(content, options);
      break;
    case 'info':
      toast.info(content, options);
      break;
    case 'warning':
      toast.warning(content, options);
      break;
    default:
      toast(content, options);
  }
};
