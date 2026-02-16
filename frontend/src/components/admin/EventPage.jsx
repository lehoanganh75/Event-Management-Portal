import React from 'react';
import TemplateTable from "../tables/TemplateTable";
import { Plus, Search } from 'lucide-react';

const EventPage = () => {
  return (
    <div className="space-y-6 bg-gray-50/60">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý sự kiện
          </h2>
          <p className="mt-1.5 text-gray-600">
            Dưới đây là danh sách tất cả các sự kiện đã được tạo. Bạn có thể xem chi tiết, chỉnh sửa hoặc xóa.
          </p>
        </div>

        {/* Nút tạo mới */}
        <button
          className="
            inline-flex items-center gap-2 
            px-5 py-2.5 
            bg-linear-to-r from-green-600 to-green-700 
            hover:from-green-700 hover:to-green-800
            text-white font-medium rounded-lg shadow-md 
            hover:shadow-lg active:scale-[0.98] 
            transition-all duration-200
          "
        >
          <Plus size={18} />
          Tạo sự kiện mới
        </button>
      </div>

      {/* Search Bar */}
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện theo tên, loại, ngày tạo..."
            className="
              w-full pl-10 pr-4 py-2.5 
              bg-white border border-gray-300 rounded-lg 
              text-gray-800 placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 
              shadow-sm transition-all duration-200
            "
          />

          <button className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition">
            Tìm kiếm
          </button>
        </div>

        {/* Table Container */}
        <TemplateTable />
    </div>
  );
};

export default EventPage;