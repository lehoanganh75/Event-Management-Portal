import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import HeaderAdmin from '../../components/header/HeaderAdmin';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <HeaderAdmin />

        {/* Main Content Area */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;