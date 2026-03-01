import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ClipboardList,
  Menu,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../common/Header";

const LecturerLayout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const sidebars = [
    { name: "Bảng tin sự kiện", path: "/lecturer/events/feed", icon: LayoutDashboard },
    { name: "Quản lý sự kiện", path: "/lecturer/events/my-events", icon: Calendar },
    { name: "Quản lý kế hoạch", path: "/lecturer/plans", icon: ClipboardList },
    { name: "Bài viết (Posts)", path: "/lecturer/posts", icon: FileText },
    { name: "Điểm danh QR", path: "/lecturer/attendance", icon: ShieldCheck },
    { name: "Thông báo", path: "/lecturer/notifications", icon: Bell },
    { name: "Cài đặt", path: "/lecturer/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 relative">
        <aside 
          className={`bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-64px)] hidden md:flex flex-col z-20 transition-all duration-300 shadow-sm ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Header Sidebar: Nút điều khiển dịch sang phải */}
          <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-end"}`}>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="py-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Menu Quản lý
              </p>
            )}

            {sidebars.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center rounded-xl transition-all ${
                    isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3 justify-between"
                  } ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {!isCollapsed && (
                      <span className="text-[13px] font-semibold whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {isActive && !isCollapsed && <ChevronRight size={14} className="opacity-50" />}

                  {isCollapsed && (
                    <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-800 text-white text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap z-50 shadow-xl pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={`p-10 mt-auto border-t border-slate-50 flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
            <button className={`flex items-center gap-3 text-slate-500 font-bold hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ${
              isCollapsed ? "h-12 w-12 justify-center" : "px-4 py-3 text-xs w-full"
            }`}>
              <LogOut size={20} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
            <div className="text-center py-2">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                {isCollapsed ? "v1.0" : "System v1.0.2 • 2026"}
              </p>
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-hidden">
          <main className="p-4 md:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout;