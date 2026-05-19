import React from "react";
import { Flag, User, Info, Users, CheckCircle, QrCode as QrIcon, MapPin, ChevronRight } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import QRCode from "react-qr-code";

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
  const { t } = useLanguage();

  const isParticipant = userPerms?.isRegistered || userPerms?.registered || userPerms?.registration;
  
  const currentRoleLabel = userRoles?.[0]?.label || t('guest');
  const permsList = [
    (isAdmin || userPerms?.canEditEvent) && "Chỉnh sửa sự kiện",
    (isAdmin || userPerms?.canManageTeam) && "Quản lý nhân sự",
    (isAdmin || userPerms?.canCheckIn || isMember || isCoreTeam) && "Thực hiện điểm danh",
    (isAdmin || userPerms?.canViewAnalytics) && "Xem báo cáo thống kê"
  ].filter(Boolean);

  const InfoItem = ({ icon, label, value }) => (
    <div className="flex gap-3">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 py-4">
      {/* 1. CONNECTED HORIZONTAL TIMELINE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-1 h-5 bg-indigo-600 rounded-full" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">{"Lộ trình thời gian"}</h3>
        </div>

        <div className="relative">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {(() => {
              const now = new Date();
              const items = [
                event.registrationDeadline && !isNaN(new Date(event.registrationDeadline).getTime()) && { 
                  label: "Hạn đăng ký", 
                  date: new Date(event.registrationDeadline), 
                  color: 'text-rose-600', 
                  dot: 'bg-rose-500', 
                  icon: '📝' 
                },
                event.startTime && !isNaN(new Date(event.startTime).getTime()) && { 
                  label: "Bắt đầu", 
                  date: new Date(event.startTime), 
                  color: 'text-indigo-600', 
                  dot: 'bg-indigo-600', 
                  icon: '🚀' 
                },
                { 
                  label: "Hiện tại", 
                  date: now, 
                  color: 'text-slate-900', 
                  dot: 'bg-slate-900', 
                  isNow: true, 
                  icon: '📍' 
                },
                event.endTime && !isNaN(new Date(event.endTime).getTime()) && { 
                  label: "Kết thúc", 
                  date: new Date(event.endTime), 
                  color: 'text-emerald-600', 
                  dot: 'bg-emerald-500', 
                  icon: '🏁' 
                }
              ].filter(Boolean).sort((a, b) => a.date - b.date);

              return items.map((item, idx) => {
                const isPast = now > item.date;
                return (
                  <div key={idx} className="relative group">
                    {/* Visual Connector for Mobile/Tablet (Vertical) */}
                    {idx < items.length - 1 && (
                      <div className="absolute left-4 top-10 w-0.5 h-full bg-slate-50 lg:hidden" />
                    )}

                    <div className={`flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 p-4 rounded-2xl transition-all ${item.isNow ? 'bg-indigo-50/50 border border-indigo-100 ring-4 ring-indigo-50/20' : 'bg-white hover:bg-slate-50'}`}>
                      {/* Icon & Dot Container */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm border-2 border-white ${item.isNow ? 'bg-slate-900' : isPast ? 'bg-slate-100' : 'bg-white'}`}>
                          {item.icon}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${item.dot}`} />
                      </div>

                      {/* Content */}
                      <div className="text-left lg:text-center">
                        <div className="flex items-center lg:justify-center gap-1.5 mb-1">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</p>
                          {item.isNow && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />}
                        </div>
                        <p className="text-[11px] text-slate-800 font-bold leading-tight">
                          {formatFullDateTime(item.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* 2. CORE INFORMATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-2">
        {/* Left Column: Access */}
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">QUYỀN HẠN CỦA BẠN</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Vị trí hiện tại</p>
                <span className="inline-block px-2.5 py-1 bg-slate-800 text-white text-[10px] font-black rounded uppercase tracking-wider">
                  {currentRoleLabel}
                </span>
              </div>
              <div className="space-y-1.5">
                {permsList.map((perm, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
                    <CheckCircle className="text-emerald-500" size={14} /> {perm}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isParticipant && (
            <div className="pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">VÉ CỦA BẠN</h4>
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center">
                <div className="p-2 bg-slate-50 rounded-lg mb-3">
                  <QRCode value={event.registrations?.find(r => r.participantAccountId === user?.username)?.ticketCode || "Không"} size={100} />
                </div>
                <p className="font-mono text-[10px] text-indigo-600 font-black tracking-widest">
                  {event.registrations?.find(r => r.participantAccountId === user?.username)?.ticketCode || "---"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Thông tin chi tiết</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <InfoItem icon={<Info size={16} />} label="Chủ đề" value={event.topicName || "Không"} />
              <InfoItem icon={<Flag size={16} />} label="Loại sự kiện" value={event.typeName || "Không"} />
              <InfoItem icon={<Users size={16} />} label="Số lượng tối đa" value={`${event.maxParticipants} người`} />
              <InfoItem icon={<MapPin size={16} />} label="Địa điểm" value={event.location || "Không"} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Đối tượng tham gia</h4>
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              {event.targetAudience || "Không"}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nhân sự phụ trách</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.organizers?.filter(o => o.role === 'LEADER' || o.role === 'ADMIN' || o.role === 'COORDINATOR').slice(0, 4).map((org, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                  <img src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-none">{org.fullName}</p>
                    <p className="text-[9px] text-indigo-500 font-black uppercase mt-1 tracking-tighter">{t(`role_${org.role.toLowerCase()}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
