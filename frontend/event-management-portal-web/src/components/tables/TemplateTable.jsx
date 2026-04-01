import React, { useState } from 'react';
import { 
  Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Layout
} from 'lucide-react';

const allTemplates = [
  { name: "Mẫu tổ chức Hội thảo", type: "Hội thảo", steps: 12, createdAt: "01/09/2025", usedCount: 15, status: "Hoạt động" },
  { name: "Mẫu tổ chức Workshop", type: "Workshop", steps: 8, createdAt: "15/08/2025", usedCount: 23, status: "Hoạt động" },
  { name: "Mẫu tổ chức Cuộc thi", type: "Cuộc thi", steps: 15, createdAt: "01/07/2025", usedCount: 8, status: "Hoạt động" },
  { name: "Mẫu tổ chức Ngày hội", type: "Ngày hội", steps: 20, createdAt: "20/06/2025", usedCount: 5, status: "Hoạt động" },
  { name: "Mẫu tổ chức Talkshow", type: "Talkshow", steps: 10, createdAt: "10/05/2025", usedCount: 12, status: "Hoạt động" },
  { name: "Mẫu cũ - Hội thảo v1", type: "Hội thảo", steps: 10, createdAt: "01/01/2025", usedCount: 3, status: "Lưu trữ" },
  { name: "Mẫu tổ chức Seminar", type: "Seminar", steps: 9, createdAt: "15/04/2025", usedCount: 7, status: "Hoạt động" },
  { name: "Mẫu tổ chức Trại hè", type: "Trại hè", steps: 18, createdAt: "10/03/2025", usedCount: 4, status: "Hoạt động" },
  { name: "Mẫu tổ chức Hội nghị", type: "Hội nghị", steps: 14, createdAt: "05/02/2025", usedCount: 9, status: "Lưu trữ" },
  { name: "Mẫu tổ chức Triển lãm", type: "Triển lãm", steps: 11, createdAt: "20/01/2025", usedCount: 6, status: "Hoạt động" },
];

const ITEMS_PER_PAGE = 6;

const TemplateTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allTemplates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = allTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full">
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden w-full">
        
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {/* Cột tên mẫu để auto rộng */}
                <th className="w-auto px-6 py-4 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Tên mẫu
                </th>
                <th className="w-37.5 px-6 py-4 text-center text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="w-45 px-6 py-4 text-center text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Số bước
                </th>
                <th className="w-37.5 px-6 py-4 text-center text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Lượt dùng
                </th>
                <th className="w-37.5 px-6 py-4 text-center text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-37.5 px-6 py-4 text-center text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((template, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                  {/* Căn trái cho tên mẫu để dễ đọc */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="min-w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                        <Layout size={20} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-slate-800 text-[15px] truncate">{template.name}</span>
                        <span className="text-xs text-slate-400">Ngày tạo: {template.createdAt}</span>
                      </div>
                    </div>
                  </td>

                  {/* Căn giữa cho các cột còn lại */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-tight">
                      {template.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(template.steps / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700 min-w-5">{template.steps}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-slate-600">
                      <span className="font-bold text-slate-900">{template.usedCount}</span> lần
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                        ${template.status === 'Hoạt động' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${template.status === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {template.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Xem" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Eye size={18} />
                      </button>
                      <button title="Sửa" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                        <Pencil size={18} />
                      </button>
                      <button title="Xóa" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section - Đảm bảo w-full */}
        <div className="px-8 py-5 bg-white flex items-center justify-between border-t border-slate-100 w-full">
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            Hiển thị <span className="text-slate-900 font-bold">{startIndex + 1}</span>–<span className="text-slate-900 font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, allTemplates.length)}</span> của <span className="text-slate-900 font-bold">{allTemplates.length}</span> mẫu
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`
                    w-10 h-10 rounded-xl text-sm font-bold transition-all
                    ${currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateTable;