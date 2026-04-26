import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';
import {
  Calendar,
  UserCog,
  Bell,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react';

const StaffLayout = () => {
  const menuItems = [
    { name: "Sự kiện của tôi", icon: Calendar, path: "/staff/events" },
    { name: "Hồ sơ cá nhân", icon: UserCog, path: "/staff/profile" },
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

export default StaffLayout;
