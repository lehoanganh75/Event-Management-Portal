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
    { name: "Bài viết (Posts)", path: "/lecturer/posts", icon: FileText },
    { name: "Điểm danh QR", path: "/lecturer/attendance", icon: ShieldCheck },
    { name: "Thông báo", path: "/lecturer/notifications", icon: Bell },
    { name: "Cài đặt", path: "/lecturer/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 relative">
        {/* SIDEBAR BÊN TRÁI */}
        <aside className="w-72 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-64px)] hidden md:flex flex-col z-20">
          <nav className="flex-1 px-4 overflow-y-auto space-y-2 pt-8">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Hệ thống
            </p>

            {sidebars.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <div className="flex items-center gap-3 z-10">
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-white"
                          : "group-hover:scale-110 transition-transform"
                      }
                    />
                    <span className="font-bold text-sm tracking-tight">
                      {item.name}
                    </span>
                  </div>

                  {isActive ? (
                    <motion.div layoutId="activeArrow">
                      <ChevronRight size={16} className="text-white/70" />
                    </motion.div>
                  ) : (
                    <ChevronRight
                      size={16}
                      className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section at Bottom of Sidebar */}
          <div className="p-4 mt-auto">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <button className="w-full flex items-center justify-center gap-2 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-colors">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
                Build 2026 • v1.0.2
              </p>
            </div>
          </div>
        </aside>

        {/* NỘI DUNG BÊN PHẢI */}
        <div className="flex-1 bg-[#f8fafc]">
          <main className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
