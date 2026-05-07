import React from "react";
import { Flag, UserCheck, UserPlus, Info, Users, CheckCircle } from "lucide-react";

const OverviewTab = ({ 
  event, 
  userRoles, 
  isAdmin, 
  userPerms, 
  isMember, 
  isCoreTeam, 
  formatDate, 
  formatFullDateTime 
}) => {
  return (
    <div className="space-y-8">
      {/* TIMELINE SECTION (Simplified) */}
      <div className="pb-16">
        <h3 className="font-bold text-sm mb-16 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
          <Flag className="text-amber-500" size={18} /> Lộ trình thời gian
        </h3>

        <div className="relative px-4">
          <div className="mx-20 relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />

            {/* Calculation of positions */}
            {(() => {
              const now = new Date();
              const deadline = new Date(event.registrationDeadline);
              const start = new Date(event.startTime);
              const end = new Date(event.endTime);

              const allDates = [deadline, start, end, now].filter(d => !isNaN(d.getTime())).sort((a, b) => a - b);
              if (allDates.length < 2) return null;

              const minDate = allDates[0];
              const maxDate = allDates[allDates.length - 1];
              const totalSpan = maxDate - minDate || 1;

              const getPos = (date) => Math.min(Math.max(((date - minDate) / totalSpan) * 100, 0), 100);

              const deadlinePos = getPos(deadline);
              const startPos = getPos(start);
              const endPos = getPos(end);
              const nowPos = getPos(now);
              const isPast = (date) => now > date;

              return (
                <>
                  {/* Progress Line */}
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                    style={{ width: `${nowPos}%` }}
                  />

                  {/* MILESTONE: DEADLINE */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${deadlinePos}%` }}>
                    <div className={`w-3 h-3 rounded-full border-2 ${isPast(deadline) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                    <div className="absolute top-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center w-32">
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Hạn đăng ký</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.registrationDeadline)}</p>
                    </div>
                  </div>

                  {/* MILESTONE: START */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${startPos}%` }}>
                    <div className={`w-3 h-3 rounded-full border-2 ${isPast(start) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                    <div className="absolute bottom-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-32">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Bắt đầu</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.startTime)}</p>
                    </div>
                  </div>

                  {/* MILESTONE: END */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${endPos}%` }}>
                    <div className={`w-3 h-3 rounded-full border-2 ${isPast(end) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                    <div className="absolute top-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center w-32">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Kết thúc</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.endTime)}</p>
                    </div>
                  </div>

                  {/* CURRENT TIME INDICATOR */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                    style={{ left: `${nowPos}%` }}
                  >
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse border-2 border-white">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                      HÔM NAY
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-32">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Hiện tại</p>
                      <p className="text-[11px] font-black text-slate-900">{formatFullDateTime(now)}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* CỘT 1: QUYỀN HẠN CỦA BẠN */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden group h-full">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserCheck size={80} />
          </div>
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
            <UserPlus size={18} className="text-indigo-600" /> Quyền hạn của bạn
          </h3>
          {userRoles.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vị trí hiện tại</span>
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((r, i) => (
                    <span key={i} className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${r.color}`}>
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khả năng thao tác</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {(isAdmin || userPerms.canEditEvent) && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Chỉnh sửa sự kiện</div>}
                  {(isAdmin || userPerms.canManageTeam) && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Quản lý nhân sự</div>}
                  {(isAdmin || userPerms.canCheckIn || isMember || isCoreTeam) && <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Thực hiện điểm danh</div>}
                  {(isAdmin || userPerms.canViewAnalytics) && <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Xem báo cáo thống kê</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-slate-400 italic">Bạn đang xem với tư cách khách</p>
            </div>
          )}
        </div>

        {/* CỘT 2: THÔNG TIN CHUNG */}
        <div className="h-full">
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Info size={18} className="text-blue-600" /> Thông tin chung</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Chủ đề</span><span className="text-slate-700 font-medium">{event.eventTopic}</span></div>
            <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Loại sự kiện</span><span className="text-slate-700 font-medium">{event.type}</span></div>
            <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Số lượng tối đa</span><span className="text-slate-700 font-medium">{event.maxParticipants} người</span></div>
          </div>
        </div>

        {/* CỘT 3: ĐỐI TƯỢNG */}
        <div className="h-full">
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> Đối tượng & Đơn vị</h3>
          <div className="space-y-4 text-sm">
            <div><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider mb-1 block">Đối tượng mục tiêu</span>
              <div className="flex flex-wrap gap-1.5 mt-1">{event.targetObjects?.length > 0 ? event.targetObjects.map((obj, i) => (<span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-medium border border-emerald-100">{obj.name}</span>)) : <span className="text-gray-400 italic">Không giới hạn</span>}</div>
            </div>
          </div>
        </div>

        {/* CỘT 4: NHÂN SỰ PHỤ TRÁCH */}
        <div className="h-full">
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><UserCheck size={18} className="text-blue-600" /> Nhân sự phụ trách</h3>
          <div className="space-y-3">
            {event.creator && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                <img src={event.creator.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-9 h-9 rounded-full" alt="" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{event.creator.fullName}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Người tạo sự kiện</p>
                </div>
              </div>
            )}
            {event.approver && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                <img src={event.approver.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-9 h-9 rounded-full" alt="" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{event.approver.fullName}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Người duyệt sự kiện</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
