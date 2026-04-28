import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';

import { LayoutDashboard, Calendar, Share2, FileText, ClipboardList, Layout, GraduationCap, ShieldCheck, UserCog, Library, RotateCw, Bell, LogOut } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Quản lý kế hoạch', icon: ClipboardList, path: '/admin/plans' },
    { name: 'Quản lý sự kiện', icon: Calendar, path: '/admin/events' },
    { name: 'Quản lý bài truyền thông', icon: Share2, path: '/admin/posts' },
    { name: 'Quản lý mẫu', icon: Layout, path: '/admin/templates' },
    { name: 'Quản lý khoa', icon: GraduationCap, path: '/admin/departments' },
    { name: 'Quản lý vai trò', icon: ShieldCheck, path: '/admin/roles', superOnly: true },
    { name: 'Quản lý thông báo', icon: Bell, path: '/admin/notifications' },
    { name: 'Quản lý tài khoản', icon: UserCog, path: '/admin/accounts' },
    { name: 'Quản lý vòng quay', icon: RotateCw, path: '/admin/spinner' },
    { name: 'Hồ sơ cá nhân', icon: UserCog, path: '/admin/profile' },
    { name: 'Quay về trang chủ', icon: LogOut, path: '/', isHome: true },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.superOnly || isSuperAdmin);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar menuItems={filteredMenuItems} />
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

export default AdminLayout;