import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

const HeaderAdmin = () => {
  return (
    <header 
      className="
        h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/70 
        flex items-center justify-between px-6 md:px-8 
        sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        transition-all duration-200
      "
    >
      {/* Left - Welcome */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-slate-800 tracking-tight">
            EMS Admin
          </h1>
          <p className="text-xs text-slate-500">
            Đại học Công nghiệp TP. Hồ Chí Minh
          </p>
        </div>
        
        {/* Mobile fallback */}
        <div className="sm:hidden text-sm font-medium text-slate-700">
          EMS Admin
        </div>
      </div>

      {/* Right - User & Actions */}
      <div className="flex items-center gap-5 md:gap-7">
        {/* Quick stats / roles (có thể ẩn trên mobile nếu cần) */}
        <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
          <button className="hover:text-blue-600 transition-colors">
            Giảng viên
          </button>
          <button className="hover:text-blue-600 transition-colors">
            Sinh viên
          </button>
          <button className="hover:text-blue-600 transition-colors">
            Email
          </button>
        </div>

        {/* Notification */}
        <button 
          className="
            relative p-2 text-slate-500 hover:text-blue-600 
            hover:bg-blue-50 rounded-full transition-all duration-200
          "
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              Nguyễn Văn A
            </p>
            <p className="text-[11px] font-medium text-blue-600">
              Super Admin
            </p>
          </div>

          <div className="relative">
            <div 
              className="
                w-10 h-10 rounded-full overflow-hidden border-2 border-white 
                shadow-md ring-1 ring-slate-200/60 transition-transform 
                group-hover:scale-105 duration-200
              "
            >
              {/* Thay bằng ảnh thật nếu có */}
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          </div>

          <ChevronDown 
            size={16} 
            className="text-slate-400 group-hover:text-slate-600 transition-colors" 
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;