import React from "react";
import { QrCode, CheckCircle, Loader2, Check, X, Edit3 } from "lucide-react";

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
  return (
    <div>
      <div className="flex items-center justify-between mb-6 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
        <div>
          <h3 className="font-bold text-lg text-indigo-900">Điểm danh ({checkedInCount} / {event.registeredCount})</h3>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Ban tổ chức kiểm soát việc mở/đóng và hiển thị mã quét</p>
        </div>

        <div className="flex items-center gap-4">
          {(isLeader || isAdmin) && (
            <>
              {/* Toggle Switch */}
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-indigo-200 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Trạng thái</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={event.checkInEnabled}
                    onChange={(e) => handleToggleCheckIn(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* QR Type Switch */}
              <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-2xl border border-indigo-100 shadow-sm">
                <button
                  onClick={() => handleUpdateQRType("DYNAMIC")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${event.qrType === "DYNAMIC"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  QR ĐỘNG
                </button>
                <button
                  onClick={() => handleUpdateQRType("STATIC")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${event.qrType === "STATIC"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  QR TĨNH
                </button>
              </div>
            </>
          )}

          {(userPerms.canCheckIn || isMember || isCoreTeam || isAdmin) && (
            <button
              onClick={handleShowEventQR}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <QrCode size={18} /> Hiển thị mã QR
            </button>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left text-gray-600">Mã vé</th>
              <th className="p-4 text-left text-gray-600">Người tham gia</th>
              <th className="p-4 text-left text-gray-600">Check-in</th>
              <th className="p-4 text-left text-gray-600">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {event.registrations?.length > 0 ? (
              event.registrations.map((reg, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-blue-600">{reg.ticketCode || "—"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-100">
                        {reg.profile?.avatarUrl ? (
                          <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                            {(reg.profile?.fullName || reg.participantAccountId)?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight text-xs">{reg.profile?.fullName || "—"}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{reg.participantAccountId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {reg.checkedIn ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs uppercase">
                            <CheckCircle size={14} /> Đã điểm danh
                          </span>
                          {(isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                            <button
                              onClick={() => onUndoCheckIn(reg.id)}
                              className="ml-auto text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase transition-colors underline decoration-dotted"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                        {reg.checkedInBy && (
                          <div className="flex items-center gap-1.5 opacity-60">
                            <img src={reg.checkedInBy.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-3.5 h-3.5 rounded-full" alt="" />
                            <span className="text-[9px] font-bold text-slate-500">Bởi: {reg.checkedInBy.fullName}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-tight italic">Chưa check-in</span>
                        {(isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                          <button
                            onClick={() => onManualCheckIn(reg.id)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase transition-all border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50"
                          >
                            Check-in thủ công
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingTimeId === reg.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={newCheckInTime}
                          onChange={(e) => setNewCheckInTime(e.target.value)}
                          className="text-[11px] p-1 border rounded"
                        />
                        <button
                          disabled={isUpdatingTime}
                          onClick={async () => {
                            try {
                              await onUpdateCheckInTime(reg.id, newCheckInTime);
                              setEditingTimeId(null);
                            } finally {
                            }
                          }}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {isUpdatingTime ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => setEditingTimeId(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          {reg.checkInTime ? formatDateTime(reg.checkInTime) : "—"}
                        </span>
                        {reg.checkedIn && (isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                          <button
                            onClick={() => {
                              setEditingTimeId(reg.id);
                              setNewCheckInTime(reg.checkInTime ? reg.checkInTime.substring(0, 16) : new Date().toISOString().substring(0, 16));
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Chỉnh sửa thời gian"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-500">Chưa có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckInTab;
