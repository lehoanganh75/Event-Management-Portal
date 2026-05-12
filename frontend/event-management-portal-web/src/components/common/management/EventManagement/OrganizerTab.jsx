import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, UserPlus, Users, Clock, Mail, Phone, X, CheckCircle, XCircle, Trash2 
} from 'lucide-react';

const OrganizerTab = ({
  event,
  userPerms,
  authUser,
  isAdmin,
  isAddingMember,
  subTabOrganizer,
  setSubTabOrganizer,
  setIsAddingMember,
  addInvite,
  onRemoveMember,
  onApproveLeave,
  onRejectLeave,
  formatDateTime,
  getOrganizerRole,
  setShowConfirmModal,
  setConfirmConfig,
  onUpdateOrganizerRole
}) => {
  if (!event) return null;

  const ORGANIZER_ROLES = [
    { label: 'Trưởng ban tổ chức', value: "LEADER" },
    { label: 'Điều phối viên', value: "COORDINATOR" },
    { label: 'Thành viên', value: "MEMBER" },
    { label: 'Cố vấn', value: "ADVISOR" },
  ];

  return (
    <div className="space-y-8">
      {/* Organization Info Header */}
      {event.organization && (
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/15 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-28 md:w-36 md:h-36 bg-white/15 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/25 shadow-2xl relative group-hover:scale-105 transition-transform duration-500"
            >
              <img
                src={event.organization.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Org Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 shadow-sm">
                  {event.organization.type || "ORGANIZATION"}
                </span>
                <div className="h-1 w-1 bg-white/40 rounded-full" />
                <span className="text-indigo-50 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Đơn vị tổ chức xác thực
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">{event.organization.name}</h2>
              <p className="text-indigo-100/90 text-sm font-medium max-w-2xl leading-relaxed">
                {event.organization.description || "Chịu trách nhiệm điều phối và quản lý toàn diện các hoạt động trong khuôn khổ sự kiện."}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-8 bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20">
              <div className="text-center px-4">
                <div className="text-3xl font-black tabular-nums">{(event.organizers?.length || 0)}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mt-1">Nhân sự</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center px-4">
                <div className="text-3xl font-black tabular-nums text-emerald-400">{event.organizers?.filter(o => o.role === 'LEADER').length || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mt-1">Lãnh đạo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100" />
          <div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">Đội ngũ vận hành</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Management Team</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAddingMember && userPerms.canManageTeam && (
            <button
              onClick={() => {
                setIsAddingMember(true);
                addInvite();
              }}
              className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-black flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 group"
            >
              <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> 
              <span>Mời thành viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Design */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[2rem] border border-slate-200/50 w-fit">
        {[
          { key: "ALL", label: "Tất cả", count: (event.organizers?.length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER').length || 0) },
          { key: "LEADER", label: "Ban tổ chức", count: (event.organizers?.filter(o => o.role === 'LEADER').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'LEADER').length || 0) },
          { key: "COORDINATOR", label: "Điều phối viên", count: (event.organizers?.filter(o => o.role === 'COORDINATOR').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'COORDINATOR').length || 0) },
          { key: "MEMBER", label: "Thành viên", count: (event.organizers?.filter(o => o.role === 'MEMBER').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'MEMBER').length || 0) },
          { key: "ADVISOR", label: "Cố vấn", count: (event.organizers?.filter(o => o.role === 'ADVISOR').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'ADVISOR').length || 0) },
          { key: "INVITATION", label: "Lời mời", count: event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER').length || 0 },
          { key: "LEAVING", label: "Yêu cầu rời", count: event.organizers?.filter(o => o.status === 'LEAVING_PENDING').length || 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTabOrganizer(tab.key)}
            className={`px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${subTabOrganizer === tab.key ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
            {tab.count > 0 && <span className={`px-2 py-0.5 rounded-lg text-[9px] ${subTabOrganizer === tab.key ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200/60 rounded-[3rem] overflow-hidden shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông tin nhân sự</th>
                <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò / Nhiệm vụ</th>
                <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông tin liên hệ</th>
                <th className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {(() => {
                const accepted = (event.organizers || []).map(o => ({
                  ...o,
                  fullName: o.profile?.fullName || o.fullName,
                  avatarUrl: o.profile?.avatarUrl || o.avatarUrl,
                  email: o.profile?.email || o.email,
                  bio: o.profile?.bio || o.bio,
                  phone: o.profile?.phone || o.phone,
                  isPending: false
                }));

                const pending = (event.invitations || [])
                  .filter(inv => (inv.status === 'PENDING' || inv.status === 'REJECTED') && inv.type === 'ORGANIZER')
                  .map(inv => ({
                    ...inv,
                    fullName: inv.invitee?.fullName || inv.inviteeEmail,
                    avatarUrl: inv.invitee?.avatarUrl,
                    email: inv.invitee?.email || inv.inviteeEmail,
                    bio: inv.message || "Lời mời ban tổ chức đang chờ xác nhận",
                    role: inv.targetRole,
                    isPending: true,
                    createdAt: inv.sentAt
                  }));

                const combined = [...accepted, ...pending];

                const visibleByRole = combined.filter(org => {
                  const requesterRole = userPerms.organizerRole;
                  const requesterId = authUser?.id;
                  if (userPerms.isCreator || isAdmin || requesterRole === 'LEADER' || requesterRole === 'ADVISOR') return true;
                  if (org.role === 'LEADER' || org.role === 'COORDINATOR') return true;
                  if (requesterRole === 'COORDINATOR') {
                    if (org.role === 'MEMBER' && (org.addedByAccountId === requesterId || org.inviterAccountId === requesterId)) return true;
                    return false;
                  }
                  if (requesterRole === 'MEMBER') return org.role === 'MEMBER';
                  return true;
                });

                const filtered = visibleByRole.filter(org => {
                  if (subTabOrganizer === "ALL") return true;
                  if (subTabOrganizer === "INVITATION") return org.isPending;
                  if (subTabOrganizer === "LEAVING") return org.status === 'LEAVING_PENDING';
                  return org.role === subTabOrganizer;
                });

                if (filtered.length === 0) {
                  return <tr><td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Users size={32} className="text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 italic">Không tìm thấy nhân sự trong danh mục này</p>
                    </div>
                  </td></tr>;
                }

                return filtered.map((org, idx) => {
                  const isMe = org.accountId === authUser?.id || org.id === authUser?.id || org.email === authUser?.email;
                  const roleData = getOrganizerRole(org.role);
                  const canManageThisUser = (isAdmin || userPerms.canManageTeam) && org.role !== 'LEADER' && !isMe;
                  
                  return (
                    <tr key={idx} className={`hover:bg-indigo-50/30 transition-all group ${org.isPending ? "bg-amber-50/10" : ""}`}>
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className={`p-1 rounded-[1.8rem] border-2 transition-all group-hover:scale-105 ${org.isPending ? "border-amber-200 bg-amber-50" : "border-white bg-white shadow-sm"}`}>
                              <img
                                src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                alt="Avatar"
                                className="w-14 h-14 rounded-[1.5rem] object-cover"
                              />
                            </div>
                            {isMe && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 border-[3px] border-white rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              </div>
                            )}
                            {org.isPending && org.status === 'PENDING' && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
                                <Clock size={12} className="text-white animate-spin-slow" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-base font-black tracking-tight ${isMe ? "text-indigo-600" : "text-slate-800"}`}>
                                {org.fullName}
                              </span>
                              {isMe && (
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm shadow-indigo-100">
                                  (Bạn)
                                </span>
                              )}
                              {org.status === 'REJECTED' ? (
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-xl uppercase tracking-wider border border-rose-100">Từ chối</span>
                              ) : org.isPending && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-xl uppercase tracking-wider border border-amber-100">Đang mời</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-1 max-w-[250px]" title={org.bio}>
                              {org.bio || "Thành viên Ban tổ chức"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        {canManageThisUser ? (
                          <div className="relative w-fit group/select">
                            <select
                              value={org.role}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                setConfirmConfig({
                                  title: "Thay đổi vai trò",
                                  message: `Bạn muốn thay đổi vai trò của ${org.fullName} sang ${ORGANIZER_ROLES.find(r => r.value === newRole)?.label}?`,
                                  onConfirm: () => onUpdateOrganizerRole(org.id, newRole),
                                  icon: ShieldCheck,
                                  color: "indigo"
                                });
                                setShowConfirmModal(true);
                              }}
                              className={`appearance-none pl-4 pr-10 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:ring-4 focus:ring-indigo-100 outline-none ${roleData.color} border-current/20 hover:border-current/40`}
                            >
                              {ORGANIZER_ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                              <Edit3 size={12} />
                            </div>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${roleData.color} border border-current/10 shadow-sm`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                            {roleData.label}
                          </span>
                        )}
                      </td>
                      <td className="p-8">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors cursor-default">
                            <div className="w-7 h-7 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                              <Mail size={14} className="text-slate-400 group-hover:text-indigo-500" />
                            </div>
                            <span className="text-[11px] font-bold">{org.email}</span>
                          </div>
                          {org.phone && (
                            <div className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors cursor-default">
                              <div className="w-7 h-7 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <Phone size={14} className="text-slate-400 group-hover:text-indigo-500" />
                              </div>
                              <span className="text-[11px] font-bold">{org.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        {org.status === 'REJECTED' ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-rose-100">TỪ CHỐI</span>
                            <span className="text-[9px] text-rose-400 font-bold italic line-clamp-1 max-w-[100px]" title={org.rejectionReason}>"{org.rejectionReason}"</span>
                          </div>
                        ) : org.isPending ? (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-amber-100 animate-pulse">ĐANG MỜI</span>
                        ) : org.status === 'LEAVING_PENDING' ? (
                          <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-rose-100 animate-pulse">XIN RỜI</span>
                        ) : (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-emerald-100">CHÍNH THỨC</span>
                        )}
                      </td>
                      <td className="p-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {org.isPending ? (
                            (isAdmin || userPerms.canManageTeam) && (
                              <button
                                onClick={() => {
                                  setConfirmConfig({
                                    title: "Hủy lời mời",
                                    message: `Bạn có chắc muốn hủy lời mời tới ${org.fullName}?`,
                                    onConfirm: () => onRemoveMember(org),
                                    icon: X,
                                    color: "rose"
                                  });
                                  setShowConfirmModal(true);
                                }}
                                className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-rose-100"
                                title="Hủy lời mời"
                              >
                                <X size={20} />
                              </button>
                            )
                          ) : org.status === 'LEAVING_PENDING' ? (
                            (() => {
                              const userRole = event.currentUserRole?.organizerRole;
                              const canHandle = (org.role === 'COORDINATOR' || org.role === 'ADVISOR') ? userRole === 'LEADER' : (userRole === 'LEADER' || userRole === 'COORDINATOR');

                              if (!canHandle) return <div className="p-2 bg-slate-50 rounded-xl text-[9px] text-slate-400 font-black uppercase tracking-widest">Đang xử lý</div>;

                              return (
                                <>
                                  <button
                                    onClick={() => {
                                      setConfirmConfig({
                                        title: "Phê duyệt rời nhóm",
                                        message: `Chấp nhận yêu cầu rời ban tổ chức của ${org.fullName}?`,
                                        onConfirm: () => onApproveLeave(org.id),
                                        icon: CheckCircle,
                                        color: "emerald"
                                      });
                                      setShowConfirmModal(true);
                                    }}
                                    className="p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all shadow-sm" title="Chấp nhận"
                                  >
                                    <CheckCircle size={20} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmConfig({
                                        title: "Từ chối rời nhóm",
                                        message: `Từ chối yêu cầu rời ban tổ chức của ${org.fullName}?`,
                                        onConfirm: () => onRejectLeave(org.id),
                                        icon: XCircle,
                                        color: "rose"
                                      });
                                      setShowConfirmModal(true);
                                    }}
                                    className="p-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all shadow-sm" title="Từ chối"
                                  >
                                    <XCircle size={20} />
                                  </button>
                                </>
                              );
                            })()
                          ) : (
                            canManageThisUser && (
                              <button
                                onClick={() => {
                                  setConfirmConfig({
                                    title: "Gỡ thành viên",
                                    message: `Bạn có chắc muốn gỡ ${org.fullName} khỏi ban tổ chức?`,
                                    onConfirm: () => onRemoveMember(org),
                                    icon: Trash2,
                                    color: "rose"
                                  });
                                  setShowConfirmModal(true);
                                }}
                                className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-rose-100"
                                title="Gỡ bỏ"
                              >
                                <Trash2 size={20} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerTab;
