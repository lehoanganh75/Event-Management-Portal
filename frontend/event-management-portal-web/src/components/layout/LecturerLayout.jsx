import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  FileText,
  Bell,
  UserCog,
  MessageSquare,
  Vote,
  RotateCw,
  Layout
} from 'lucide-react';

const LecturerLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isSystemAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isLecturer = user?.role?.toUpperCase() === 'LECTURER';
  const isLeader = user?.eventRoles?.some(role => role.toUpperCase() === 'LEADER');
  
  // Dashboard và Vòng quay chỉ dành cho Admin hệ thống hoặc Giảng viên (Ẩn đối với Leader/Member theo yêu cầu)
  const canAccessDashboard = isSystemAdmin || isLecturer;
  const shouldHideDashboard = !canAccessDashboard;
  
  // Các mục quản lý cấp cao (Kế hoạch, Bài viết, Mẫu) chỉ dành cho Giảng viên hoặc Admin
  const isLecturerOrAdmin = isLecturer || isSystemAdmin;
  const shouldHideAdvanced = !isLecturerOrAdmin;

  // Chặn truy cập trực tiếp vào dashboard nếu không có quyền
  if (location.pathname === '/lecturer/dashboard' && shouldHideDashboard) {
    return <Navigate to="/lecturer/events" replace />;
  }

  const allMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/lecturer/dashboard", hidden: shouldHideDashboard },
    { name: "Quản lý kế hoạch", icon: ClipboardList, path: "/lecturer/plans", hidden: shouldHideAdvanced },
    { name: "Quản lý sự kiện", icon: Calendar, path: "/lecturer/events" },
    { name: "Quản lý bài truyền thông", icon: FileText, path: "/lecturer/posts", hidden: shouldHideAdvanced },
    { name: "Quản lý mẫu", icon: Layout, path: "/lecturer/templates", hidden: shouldHideAdvanced },
    { name: "Quản lý thông báo", icon: Bell, path: "/lecturer/notifications" },
    { name: 'Quản lý vòng quay', icon: RotateCw, path: '/lecturer/spinner', hidden: shouldHideDashboard },
    { name: "Hồ sơ cá nhân", icon: UserCog, path: "/lecturer/profile" },
  ];

  const menuItems = allMenuItems.filter(item => !item.hidden);

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