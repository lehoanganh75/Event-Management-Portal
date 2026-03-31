import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  LogOut,
  ClipboardList,
  Menu,
  ChevronLeft,
  Plus,
  MessageSquare,
  Vote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../common/Header";

const LecturerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({ "/lecturer/events/my-events": true });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleMenu = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const sidebars = [
    {
      name: "Bảng tin sự kiện",
      path: "/lecturer/events/dashboard", // Cập nhật đường dẫn để khớp với route thực tế
      icon: LayoutDashboard,
    },
    {
      name: "Quản lý sự kiện",
      path: "/lecturer/events/my-events",
      icon: Calendar,
      children: [
        { name: "Tạo sự kiện", path: "/lecturer/events/my-events", icon: Plus },
        { name: "Duyệt câu hỏi", path: "/lecturer/events/questions", icon: MessageSquare },
        { name: "Tạo bình chọn", path: "/lecturer/events/polls", icon: Vote },
      ],
    },
    {
      name: "Quản lý kế hoạch",
      path: "/lecturer/plans",
      icon: ClipboardList,
    },
    {
      name: "Bài viết (Posts)",
      path: "/lecturer/posts",
      icon: FileText,
    },
    {
      name: "Điểm danh QR",
      path: "/lecturer/attendance",
      icon: ShieldCheck,
    },
    {
      name: "Thông báo",
      path: "/lecturer/notifications",
      icon: Bell,
    },
    {
      name: "Cài đặt",
      path: "/lecturer/profile",
      icon: Settings,
    },
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
          <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="py-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Menu Quản lý
              </p>
            )}

            {sidebars.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const hasChildren = item.children?.length > 0;
              const isOpen = openMenus[item.path];
              const Icon = item.icon;

              return (
                <div key={item.path}>
                  {/* Parent item */}
                  {hasChildren ? (
                    <button
                      onClick={() => !isCollapsed && toggleMenu(item.path)}
                      className={`group relative w-full flex items-center rounded-xl transition-all ${
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

                      {!isCollapsed && (
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={14} className="opacity-50" />
                        </motion.div>
                      )}

                      {/* Tooltip khi collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-800 text-white text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap z-50 shadow-xl pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </button>
                  ) : (
                    <Link
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
                  )}

                  {/* Submenu */}
                  <AnimatePresence initial={false}>
                    {hasChildren && isOpen && !isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-4 border-l-2 border-slate-100 mt-1 mb-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = location.pathname === child.path;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                                  isChildActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                                }`}
                              >
                                <ChildIcon size={15} strokeWidth={isChildActive ? 2.5 : 2} />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className={`p-10 mt-auto border-t border-slate-50 flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`flex items-center gap-3 text-slate-500 font-bold hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ${
                isCollapsed ? "h-12 w-12 justify-center" : "px-4 py-3 text-xs w-full"
              }`}
            >
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

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận đăng xuất?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LecturerLayout;