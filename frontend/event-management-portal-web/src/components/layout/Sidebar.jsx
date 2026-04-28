import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Home } from 'lucide-react';

const Sidebar = ({ menuItems }) => {
  const { unreadCount } = useNotification();
  const { user } = useAuth();

  // Kiểm tra nếu là Leader thì ẩn "Quay về trang chủ"
  const isLeader = user?.eventRoles?.some(role => role.toUpperCase() === 'LEADER');

  return (
    <aside
      className="
        w-72 bg-linear-to-b from-white to-slate-50/50 
        border-r border-slate-200/70 
        h-screen sticky top-0 flex flex-col 
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        backdrop-blur-[1px] z-20
      "
    >
      {/* Header / Logo (Emptied per user request) */}
      <div className="p-6 pb-4 flex justify-center items-center">
        {/* Logo removed */}
      </div>

      {/* Section Label */}
      <div className="px-6 pt-6 pb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">
          Bảng điều khiển
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              // THÊM: outline-none ở đây để bỏ viền đen khi click trên một số trình duyệt
              className="outline-none block"
            >
              {({ isActive }) => (
                <div
                  className={`
                    group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-250 ease-out
                    outline-none select-none
                    ${isActive
                      ? 'bg-linear-to-r from-blue-600/10 to-indigo-500/10 text-blue-700 font-semibold shadow-inner border border-blue-200/40'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-800 hover:shadow-sm'
                    }
                  `}
                >
                  {/* Icon wrapper */}
                  <div
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/90 group-hover:text-slate-700'
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>

                  <span className="truncate flex-1">{item.name}</span>

                  {/* Notification badge */}
                  {item.name?.toLowerCase().includes('thông báo') && unreadCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-sm" />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Return Home Link (Fixed at the bottom) */}
      <div className="p-4 border-t border-slate-100 bg-white/50">
        <NavLink to="/" className="outline-none block">
          <div className="group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 border border-transparent hover:border-indigo-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <Home size={20} strokeWidth={2} />
            </div>
            <span className="truncate flex-1">Quay về trang chủ</span>
          </div>
        </NavLink>
      </div>

    </aside>
  );
};
export default Sidebar;