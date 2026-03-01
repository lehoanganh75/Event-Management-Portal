import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản trị hệ thống",
  EVENT_MANAGER: "Quản lý sự kiện",
  LECTURER: "Giảng viên",
  ORGANIZER: "Ban Tổ Chức",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
};

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lấy dữ liệu user khi component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
          <h1 className="text-base font-bold text-slate-800 tracking-tight uppercase">
            EMS Admin Portal
          </h1>
          <p className="text-[11px] font-medium text-slate-500 italic">
            Industrial University of Ho Chi Minh City
          </p>
        </div>
        
        {/* Mobile fallback */}
        <div className="sm:hidden text-sm font-bold text-blue-700">
          EMS ADMIN
        </div>
      </div>

      {/* Right - User & Actions */}
      <div className="flex items-center gap-5 md:gap-7">
        
        {/* Quick Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
          <button className="hover:text-blue-600 transition-colors">Giảng viên</button>
          <button className="hover:text-blue-600 transition-colors">Sinh viên</button>
          <button className="hover:text-blue-600 transition-colors">Báo cáo</button>
        </div>

        {/* Notification */}
        <button 
          className="
            relative p-2.5 text-slate-500 hover:text-blue-600 
            hover:bg-blue-50 rounded-xl transition-all duration-200
          "
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {currentUser?.username || "Admin IUH"}
              </p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                {roleMap[currentUser?.roles?.[0]] || "Quản trị viên"}
              </p>
            </div>

            <div className="relative">
              <div 
                className="
                  w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-50 
                  shadow-sm ring-1 ring-slate-200/60 transition-transform 
                  group-hover:scale-105 duration-200
                "
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            <ChevronDown 
              size={16} 
              className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          {/* Dropdown Menu Overlay */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{currentUser?.username}</p>
                    <p className="text-[10px] text-blue-600 font-bold">{roleMap[currentUser?.roles?.[0]]}</p>
                </div>
                
                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <User size={18} className="text-slate-400" />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <Settings size={18} className="text-slate-400" />
                  Cài đặt hệ thống
                </button>
                
                <div className="h-px bg-slate-100 my-1 mx-2" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;