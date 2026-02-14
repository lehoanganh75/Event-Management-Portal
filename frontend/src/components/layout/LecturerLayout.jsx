import React from "react";
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
  ClipboardList // Thêm Icon cho Kế hoạch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../common/Header";
import Footer from "../common/Footer";

const LecturerLayout = () => {
  const location = useLocation();

  const sidebars = [
    {
      name: "Bảng tin sự kiện",
      path: "/lecturer/events/feed",
      icon: LayoutDashboard,
    },
    {
      name: "Quản lý sự kiện",
      path: "/lecturer/events/my-events",
      icon: Calendar,
    },
    { 
      name: "Quản lý kế hoạch", // Đã thêm mục này
      path: "/lecturer/plans", 
      icon: ClipboardList 
    },
    { name: "Bài viết (Posts)", path: "/lecturer/posts", icon: FileText },
    { name: "Điểm danh QR", path: "/lecturer/attendance", icon: ShieldCheck },
    { name: "Thông báo", path: "/lecturer/notifications", icon: Bell },
    { name: "Cài đặt", path: "/lecturer/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 relative">
        {/* SIDEBAR - Thiết kế lại cho gọn (Basic) */}
        <aside className="w-64 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-64px)] hidden md:flex flex-col z-20">
          <nav className="flex-1 px-3 py-6 space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
              Menu Quản lý
            </p>

            {sidebars.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[13px] font-semibold">
                      {item.name}
                    </span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 mt-auto border-t border-slate-50">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 font-bold text-xs hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <LogOut size={16} /> Đăng xuất
            </button>
            <div className="mt-4 text-center">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                System v1.0.2 • 2026
              </p>
            </div>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <div className="flex-1 overflow-hidden">
          <main className="p-6 md:p-8 max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LecturerLayout;