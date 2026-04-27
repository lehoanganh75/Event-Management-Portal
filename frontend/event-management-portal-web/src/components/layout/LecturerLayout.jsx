import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  FileText,
  Bell,
  UserCog,
  MessageSquare,
  Vote,
  RotateCw
} from 'lucide-react';

const LecturerLayout = () => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/lecturer/dashboard" },
    { name: "Quản lý sự kiện", icon: Calendar, path: "/lecturer/events" },
    { name: "Quản lý bài truyền thông", icon: FileText, path: "/lecturer/posts" },
    { name: "Quản lý thông báo", icon: Bell, path: "/lecturer/notifications" },
    { name: 'Quản lý vòng quay', icon: RotateCw, path: '/lecturer/spinner' },
    { name: "Hồ sơ cá nhân", icon: UserCog, path: "/lecturer/profile" },
  ];

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