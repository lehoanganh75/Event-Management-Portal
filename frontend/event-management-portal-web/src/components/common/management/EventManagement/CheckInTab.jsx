import React, { useState } from "react";
import { QrCode, CheckCircle, Loader2, Check, X, Edit3, Search, User, Undo2 } from "lucide-react";

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
  isUpdatingTime,
  onUpdateCheckInTime,
  formatDateTime
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRegistrations = (event.registrations || []).filter(reg => 
    (reg.profile?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reg.participantAccountId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reg.ticketCode || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManage = isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam;

  return (
    <div className="space-y-6">
      {/* 1. MANAGEMENT HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Điều khiển Điểm danh</h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full">
                {checkedInCount} / {event.registeredCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Quản lý mã QR và trạng thái có mặt của người tham gia</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManage && (
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={event.checkInEnabled}
                      onChange={(e) => handleToggleCheckIn(e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="w-px h-4 bg-slate-200" />

                <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <button
                    onClick={() => handleUpdateQRType("DYNAMIC")}
                    className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${event.qrType === "DYNAMIC" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    QR ĐỘNG
                  </button>
                  <button
                    onClick={() => handleUpdateQRType("STATIC")}
                    className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${event.qrType === "STATIC" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    QR TĨNH
                  </button>
                </div>
              </div>
            )}

            {canManage && (
              <button
                onClick={handleShowEventQR}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                <QrCode size={16} /> Hiện mã QR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. ATTENDANCE TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc MSSV..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người tham gia</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg, idx) => {
                  const isChecked = reg.checkedIn;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300">
                            {reg.profile?.avatarUrl ? (
                              <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{reg.profile?.fullName || "—"}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{reg.participantAccountId} • <span className="font-mono">{reg.ticketCode || "N/A"}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isChecked ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                              <CheckCircle size={12} /> Đã có mặt
                            </span>
                            {reg.checkedInBy && (
                              <p className="text-[9px] text-slate-400 italic">Bởi: {reg.checkedInBy.fullName}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider italic">Chưa check-in</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingTimeId === reg.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="datetime-local"
                                value={newCheckInTime}
                                onChange={(e) => setNewCheckInTime(e.target.value)}
                                className="text-[10px] p-1 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => onUpdateCheckInTime(reg.id, newCheckInTime).then(() => setEditingTimeId(null))}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[11px] text-slate-600 font-medium">
                                {reg.checkInTime ? formatDateTime(reg.checkInTime) : "—"}
                              </span>
                              {isChecked && canManage && (
                                <button
                                  onClick={() => {
                                    setEditingTimeId(reg.id);
                                    setNewCheckInTime(reg.checkInTime ? reg.checkInTime.substring(0, 16) : new Date().toISOString().substring(0, 16));
                                  }}
                                  className="p-1 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Edit3 size={12} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage && (
                          isChecked ? (
                            <button
                              onClick={() => onUndoCheckIn(reg.id)}
                              className="text-[9px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                              title="Hủy điểm danh"
                            >
                              <Undo2 size={12} className="inline mr-1" /> Hủy
                            </button>
                          ) : (
                            <button
                              onClick={() => onManualCheckIn(reg.id)}
                              className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all active:scale-95"
                            >
                              Điểm danh ngay
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-xs">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;
