import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RegistrationTab = ({
  event,
  getRegistrationStatus,
  formatDateTime,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const registrations = event.registrations || [];
  const totalPages = Math.ceil(registrations.length / itemsPerPage);

  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return registrations.slice(start, start + itemsPerPage);
  }, [registrations, currentPage]);

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-lg text-slate-800">
        Danh sách đăng ký ({event.registeredCount})
      </h3>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-600 w-[150px]">
                  Mã vé
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Người tham gia
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Đăng ký lúc
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRegistrations.length > 0 ? (
                paginatedRegistrations.map((reg, idx) => {
                  const statusDisplay = getRegistrationStatus(reg.status);

                  return (
                    <tr
                      key={reg.id || idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-blue-600">
                        {reg.ticketCode || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            {reg.profile?.avatarUrl ? (
                              <img
                                src={reg.profile.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold uppercase">
                                {(reg.profile?.fullName ||
                                  reg.participantAccountId)?.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-slate-800 text-sm leading-tight">
                              {reg.profile?.fullName || "—"}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {reg.participantAccountId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${statusDisplay.color}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600 text-xs">
                        {formatDateTime(reg.registeredAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    Chưa có người đăng ký nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-10 h-10 rounded-xl border text-sm font-medium transition-colors ${currentPage === num
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationTab;