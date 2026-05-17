import React, { useMemo, useState } from "react";
import {
  QrCode,
  CheckCircle,
  Check,
  Search,
  User,
  Undo2,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CheckInTab = ({
  event,
  checkedInCount,
  handleToggleCheckIn,
  handleUpdateQRType,
  handleShowEventQR,
  userPerms,
  isMember,
  isCoreTeam,
  isAdmin,
  isLeader,
  onUndoCheckIn,
  onManualCheckIn,
  editingTimeId,
  setEditingTimeId,
  newCheckInTime,
  setNewCheckInTime,
  onUpdateCheckInTime,
  formatDateTime,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredRegistrations = useMemo(() => {
    return (event.registrations || []).filter(
      (reg) =>
        (reg.profile?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reg.participantAccountId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reg.ticketCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [event.registrations, searchTerm]);

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistrations.slice(start, start + itemsPerPage);
  }, [filteredRegistrations, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const canManage =
    isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-slate-800">
                Quản lý điểm danh
              </h3>

              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-medium">
                {checkedInCount}/{event.registeredCount}
              </span>
            </div>

            <p className="text-sm text-slate-500">
              Kiểm soát trạng thái check-in người tham gia
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManage && (
              <>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-slate-600">
                    Điểm danh
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={event.checkInEnabled}
                      onChange={(e) =>
                        handleToggleCheckIn(e.target.checked)
                      }
                    />

                    <div className="w-10 h-5 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleUpdateQRType("DYNAMIC")}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${event.qrType === "DYNAMIC"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    QR động
                  </button>

                  <button
                    onClick={() => handleUpdateQRType("STATIC")}
                    className={`px-3 py-2 text-xs font-medium border-l border-slate-200 transition-colors ${event.qrType === "STATIC"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    QR tĩnh
                  </button>
                </div>
              </>
            )}

            {(canManage || isMember) && (
              <button
                onClick={handleShowEventQR}
                disabled={!event.checkInEnabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${event.checkInEnabled
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <QrCode size={16} />
                Hiện QR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Tìm kiếm người tham gia..."
            className="
              w-full pl-9 pr-4 py-2.5
              border border-slate-200
              rounded-lg
              text-sm
              bg-white
              outline-none
              transition-colors
              focus:border-indigo-500
            "
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Người tham gia
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Thời gian
                </th>
                <th className="px-5 py-3 text-right font-medium text-slate-600">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRegistrations.length > 0 ? (
                paginatedRegistrations.map((reg, idx) => {
                  const isChecked = reg.checkedIn;

                  return (
                    <tr
                      key={reg.id || idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                            {reg.profile?.avatarUrl ? (
                              <img
                                src={reg.profile.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} />
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-slate-800">
                              {reg.profile?.fullName || "—"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {reg.participantAccountId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isChecked ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
                            <CheckCircle size={14} />
                            Đã check-in
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                            Chưa check-in
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {editingTimeId === reg.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="datetime-local"
                              value={newCheckInTime}
                              onChange={(e) =>
                                setNewCheckInTime(e.target.value)
                              }
                              className="border border-slate-200 rounded-md px-2 py-1 text-xs"
                            />

                            <button
                              onClick={() =>
                                onUpdateCheckInTime(
                                  reg.id,
                                  newCheckInTime
                                ).then(() => setEditingTimeId(null))
                              }
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 text-sm">
                              {reg.checkInTime
                                ? formatDateTime(reg.checkInTime)
                                : "—"}
                            </span>

                            {isChecked && canManage && (
                              <button
                                onClick={() => {
                                  setEditingTimeId(reg.id);
                                  setNewCheckInTime(
                                    reg.checkInTime
                                      ? reg.checkInTime.substring(0, 16)
                                      : new Date()
                                        .toISOString()
                                        .substring(0, 16)
                                  );
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {canManage &&
                          (isChecked ? (
                            <button
                              onClick={() => onUndoCheckIn(reg.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50 transition-colors"
                            >
                              <Undo2 size={13} />
                              Hủy
                            </button>
                          ) : (
                            <button
                              onClick={() => onManualCheckIn(reg.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                            >
                              Điểm danh
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="
              w-10 h-10
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-400
              flex items-center justify-center
              hover:bg-slate-50
              hover:text-slate-700
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            "
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`
                w-10 h-10
                rounded-xl
                border
                text-sm font-medium
                transition-colors
                ${currentPage === num
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="
              w-10 h-10
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-400
              flex items-center justify-center
              hover:bg-slate-50
              hover:text-slate-700
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-colors
            "
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckInTab;