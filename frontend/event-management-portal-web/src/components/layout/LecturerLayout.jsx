import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  FileText,
  ShieldCheck,
  Bell,
  Layout,
  GraduationCap,
  Shield,
  UserCog,
  RotateCw,
  Library,
  Briefcase,
  MessageSquare,
  Vote,
  Plus
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const LecturerLayout = () => {
  const { user } = useAuth();

  const hasAdminRole = user?.roles?.some(r => r === "ADMIN" || r === "SUPER_ADMIN");

  const menuItems = [
    { name: "Bảng tin sự kiện", icon: LayoutDashboard, path: "/lecturer/events/dashboard" },
    { name: "Quản lý sự kiện", icon: Calendar, path: "/lecturer/events/my-events" },
    { name: "Quản lý kế hoạch", icon: ClipboardList, path: "/lecturer/plans" },
    { name: "Bài viết (Posts)", icon: FileText, path: "/lecturer/posts" }
  ];

  // Nếu là admin, có thể hiển thị thêm các mục quản trị hoặc chỉ dẫn tới trang admin
  if (hasAdminRole) {
    menuItems.push(
      { name: "Trang Quản trị", icon: Shield, path: "/admin" }
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <HeaderAdmin />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout;