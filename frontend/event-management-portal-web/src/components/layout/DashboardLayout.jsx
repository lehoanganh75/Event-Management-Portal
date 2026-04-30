import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar - w-72 hoặc w-20, dùng sticky nên content bên phải tự động co dãn */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <DashboardHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
