import React from "react";
import { Loader2, FileText, MapPin, Globe, Lock, BarChart3, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const TemplatesTable = ({
  loading,
  currentTemplates,
  totalPages,
  currentPage,
  setCurrentPage,
  openModal,
  setTemplateToDelete,
  currentUserId
}) => {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
            <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : currentTemplates.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="text-gray-400" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-medium">Không tìm thấy mẫu kế hoạch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="p-4 whitespace-nowrap">Thông tin mẫu</th>
                  <th className="p-4 whitespace-nowrap">Thiết lập mặc định</th>
                  <th className="p-4 whitespace-nowrap">Hệ thống</th>
                  <th className="p-4 text-center whitespace-nowrap">Thống kê</th>
                  <th className="p-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">{t.templateName}</span>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{t.description || "Không có mô tả"}</p>
                        <div className="mt-1">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                            {t.faculty || "CHUNG"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <FileText size={14} className="text-blue-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{t.defaultTitle || "Sự kiện mẫu"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={14} className="text-rose-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{t.defaultLocation || "Trực tuyến"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {t.public ?
                          <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium bg-emerald-50 w-fit px-2 py-1 rounded">
                            <Globe size={12} /> Công khai
                          </span> :
                          <span className="flex items-center gap-1.5 text-gray-600 text-xs font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                            <Lock size={12} /> Nội bộ
                          </span>
                        }
                        <div className="flex gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${t.configData?.certificate ? 'bg-emerald-500' : 'bg-gray-300'}`} title="Chứng chỉ" />
                          <div className={`w-2.5 h-2.5 rounded-full ${t.configData?.requireApproval ? 'bg-amber-500' : 'bg-blue-500'}`} title="Phê duyệt" />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-gray-700 font-semibold bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                          <BarChart3 size={14} className="text-blue-600" /> {t.usageCount || 0}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openModal(t, "view")}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {t.createdByAccountId === currentUserId && (
                          <>
                            <button
                              onClick={() => openModal(t, "edit")}
                              className="p-2 hover:bg-amber-50 rounded-lg text-gray-500 hover:text-amber-600 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => setTemplateToDelete(t)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-gray-500 hover:text-rose-600 transition-colors"
                              title="Xóa mẫu"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 text-gray-600"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`min-w-[36px] h-[36px] px-2 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
                currentPage === num
                  ? "bg-blue-600 text-white border border-blue-600"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 text-gray-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default TemplatesTable;
