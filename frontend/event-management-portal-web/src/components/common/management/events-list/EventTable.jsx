import React from "react";
import { Loader2, CalendarX } from "lucide-react";
import EventRow from "./EventRow";

const EventTable = ({
  loading,
  currentEvents,
  mode,
  isAdminMode,
  submittingId,
  handleView,
  handleEdit,
  handleDelete,
  handleExportWord,
  handleSubmitForApproval,
  handleStatusUpdate,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
        <Loader2 className="animate-spin mx-auto text-[#1E40AF]" size={36} />
        <p className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                {mode === "plan" ? "Tên kế hoạch" : "Tên sự kiện"}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                Địa điểm
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                {isAdminMode ? "Người tạo" : "Người duyệt"}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  mode={mode}
                  isAdminMode={isAdminMode}
                  submittingId={submittingId}
                  handleView={handleView}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleExportWord={handleExportWord}
                  handleSubmitForApproval={handleSubmitForApproval}
                  handleStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                      <CalendarX size={28} />
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      {mode === "plan"
                        ? "Không tìm thấy kế hoạch nào"
                        : "Không tìm thấy sự kiện nào"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTable;