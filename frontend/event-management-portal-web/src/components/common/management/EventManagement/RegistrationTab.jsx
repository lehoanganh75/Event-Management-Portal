import React from "react";

const RegistrationTab = ({ event, getRegistrationStatus, formatDateTime }) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-6">Danh sách đăng ký ({event.registeredCount})</h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left text-gray-600 w-[150px]">Mã vé</th>
              <th className="p-4 text-left text-gray-600">Người tham gia</th>
              <th className="p-4 text-left text-gray-600">Trạng thái</th>
              <th className="p-4 text-left text-gray-600">Đăng ký lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {event.registrations?.length > 0 ? (
              event.registrations.map((reg, idx) => {
                const statusDisplay = getRegistrationStatus(reg.status);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-blue-600">{reg.ticketCode || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                          {reg.profile?.avatarUrl ? (
                            <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-black uppercase">
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-xs">{formatDateTime(reg.registeredAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-500">Chưa có người đăng ký nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationTab;
