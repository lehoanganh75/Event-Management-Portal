import React from 'react';
import logo_iuh from '../../assets/images/logo_iuh.png';

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#eef8fb]">
      <div className="flex flex-col items-center">
        <div className="mb-5">
          <img 
            src={logo_iuh} 
            alt="Industrial University of Ho Chi Minh City" 
            className="w-56 h-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#004a99] rounded-full animate-[pulse_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]"></div>
          <div className="w-2.5 h-2.5 bg-[#004a99] rounded-full animate-[pulse_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]"></div>
          <div className="w-2.5 h-2.5 bg-[#004a99] rounded-full animate-[pulse_1.4s_infinite_ease-in-out_both]"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;