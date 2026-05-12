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
  setConfirmConfig
}) => {
  if (!event) return null;

  return (
    <div className="space-y-8">
      {/* Organization Info Header */}
      {event.organization && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/30 shadow-inner">
              <img
                src={event.organization.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Org Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
              />
            </div>
            <div className="text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                  {event.organization.type || "ORGANIZATION"}
                </span>
                <span className="text-indigo-100 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Đơn vị tổ chức xác thực
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">{event.organization.name}</h2>
              <p className="text-indigo-100/80 text-sm font-medium max-w-xl">
                Chịu trách nhiệm điều phối và quản lý toàn diện các hoạt động trong khuôn khổ sự kiện.
              </p>
            </div>

            <div className="md:ml-auto flex items-center gap-6 border-l border-white/10 pl-8 hidden lg:flex">
              <div className="text-center">
                <div className="text-2xl font-black">{(event.organizers?.length || 0)}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Nhân sự</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{event.organizers?.filter(o => o.role === 'LEADER').length || 0}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Lãnh đạo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-600 rounded-full" />
          <h3 className="font-black text-xl text-slate-800">Đội ngũ vận hành</h3>
        </div>

        <div className="flex items-center gap-3">
          {!isAddingMember && userPerms.canManageTeam && (
            <button
              onClick={() => {
                setIsAddingMember(true);
                addInvite();
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              <UserPlus size={18} /> Mời thành viên
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-100 mb-8 gap-8 overflow-x-auto no-scrollbar">
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
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.1em] transition-all relative ${subTabOrganizer === tab.key ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
            {tab.count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${subTabOrganizer === tab.key ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>{tab.count}</span>}
            {subTabOrganizer === tab.key && <motion.div layoutId="subTabOrganizer" className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin thành viên</th>
              <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Vai trò</th>
              <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Liên hệ</th>
              <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</th>
              <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Lý do</th>
              <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
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
                return <tr><td colSpan={6} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users size={40} className="text-slate-200" />
                    <p className="text-sm font-bold text-slate-400 italic">Không tìm thấy nhân sự phù hợp</p>
                  </div>
                </td></tr>;
              }

              return filtered.map((org, idx) => {
                const isMe = org.accountId === authUser?.id || org.id === authUser?.id || org.email === authUser?.email;
                const roleData = getOrganizerRole(org.role);
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-all group ${org.isPending ? "bg-amber-50/10" : ""}`}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt="Avatar"
                            className={`w-12 h-12 rounded-2xl object-cover border-2 shadow-sm ${org.isPending ? "border-amber-200" : "border-white"}`}
                          />
                          {isMe && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                          {org.isPending && org.status === 'PENDING' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                              <Clock size={10} className="text-white animate-spin-slow" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black tracking-tight ${isMe ? "text-indigo-600" : "text-slate-800"}`}>
                              {org.fullName}
                            </span>
                            {isMe && <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md uppercase tracking-widest">TÔI</span>}
                            {org.status === 'REJECTED' ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-rose-200">Đã từ chối</span>
                            ) : org.isPending && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-amber-200">Đang mời</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1 max-w-[200px]" title={org.bio}>
                            {org.bio || "Thành viên Ban tổ chức"}
                          </p>
                          {org.isPending && org.status === 'PENDING' && (
                            <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold">
                              <Clock size={10} />
                              Mời lúc: {formatDateTime(org.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${roleData.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current opacity-50`} />
                        {roleData.label}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold">{org.email}</span>
                        </div>
                        {org.phone && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold">{org.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {org.status === 'REJECTED' ? (
                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100">
                          TỪ CHỐI
                        </span>
                      ) : org.isPending ? (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-100 animate-pulse">
                          ĐANG MỜI
                        </span>
                      ) : org.status === 'LEAVING_PENDING' ? (
                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100 animate-pulse">
                          XIN RỜI
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                          {org.status === 'ACTIVE' || !org.status ? 'CHÍNH THỨC' : org.status}
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      {org.status === 'REJECTED' && (
                        <div className="text-[11px] text-rose-600 font-bold max-w-[150px] italic">
                          "{org.rejectionReason || "Không có lý do"}"
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 transition-opacity">
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
                              className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                              title="Hủy lời mời"
                            >
                              <X size={18} />
                            </button>
                          )
                        ) : org.status === 'LEAVING_PENDING' ? (
                          (() => {
                            const userRole = event.currentUserRole?.organizerRole;
                            const canHandle = (org.role === 'COORDINATOR' || org.role === 'ADVISOR') ? userRole === 'LEADER' : (userRole === 'LEADER' || userRole === 'COORDINATOR');

                            if (!canHandle) return <span className="text-[10px] text-slate-400 italic font-bold">Đang xử lý...</span>;

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
                                  className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" title="Chấp nhận"
                                >
                                  <CheckCircle size={18} />
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
                                  className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all" title="Từ chối"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            );
                          })()
                        ) : (
                          (isAdmin || userPerms.canManageTeam) && org.role !== 'LEADER' && (
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
                              className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                              title="Gỡ bỏ"
                            >
                              <Trash2 size={18} />
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
  );
};

export default OrganizerTab;
