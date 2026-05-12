import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, UserPlus, Users, Clock, Mail, Phone, X, CheckCircle, XCircle, Trash2, Edit3, Check
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
  const [selectedOrgForRole, setSelectedOrgForRole] = React.useState(null);
  const [newRole, setNewRole] = React.useState("");

  if (!event) return null;

  const ORGANIZER_ROLES = [
    { label: 'Trưởng ban tổ chức', value: "LEADER" },
    { label: 'Điều phối viên', value: "COORDINATOR" },
    { label: 'Thành viên', value: "MEMBER" },
    { label: 'Cố vấn', value: "ADVISOR" },
  ];

  const handleOpenRoleModal = (org) => {
    setSelectedOrgForRole(org);
    setNewRole(org.role);
  };

  const handleConfirmRoleChange = () => {
    console.log("🔄 Confirming role change:", { id: selectedOrgForRole.id, newRole });
    if (selectedOrgForRole && newRole !== selectedOrgForRole.role) {
      onUpdateOrganizerRole(selectedOrgForRole.id, newRole);
    } else {
      console.warn("⚠️ No change detected or no member selected");
    }
    setSelectedOrgForRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Role Update Modal */}
      {selectedOrgForRole && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedOrgForRole(null)}
        >
          <div 
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Thay đổi vai trò</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Update Member Role</p>
              </div>
              <button 
                onClick={() => setSelectedOrgForRole(null)} 
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                <img 
                  src={selectedOrgForRole.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" 
                />
                <div>
                  <div className="font-black text-slate-800 text-sm">{selectedOrgForRole.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{selectedOrgForRole.email}</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Chọn vai trò mới</label>
                <div className="grid gap-2">
                  {ORGANIZER_ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setNewRole(role.value)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all group ${newRole === role.value ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                    >
                      <span className={`font-bold text-sm ${newRole === role.value ? "text-indigo-700" : "text-slate-600"}`}>{role.label}</span>
                      {newRole === role.value ? (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-slate-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-3">
              <button 
                onClick={() => setSelectedOrgForRole(null)} 
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmRoleChange} 
                disabled={newRole === selectedOrgForRole.role}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Header */}
      {event.organization && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
            <img
              src={event.organization.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="Org Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                {event.organization.type || "ORGANIZATION"}
              </span>
              <ShieldCheck size={14} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{event.organization.name}</h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-2xl">
              {event.organization.description || "Đơn vị chịu trách nhiệm tổ chức và quản lý nhân sự cho sự kiện."}
            </p>
          </div>
          <div className="flex gap-4 px-6 border-l border-slate-100 hidden md:flex">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{event.organizers?.length || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Nhân sự</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{event.organizers?.filter(o => o.role === 'LEADER').length || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Lãnh đạo</div>
            </div>
          </div>
        </div>
      )}

      {/* Control Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "LEADER", label: "BTC" },
            { key: "COORDINATOR", label: "Điều phối" },
            { key: "MEMBER", label: "Thành viên" },
            { key: "INVITATION", label: "Lời mời" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSubTabOrganizer(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTabOrganizer === tab.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {userPerms.canManageTeam && !isAddingMember && (
          <button
            onClick={() => {
              setIsAddingMember(true);
              addInvite();
            }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
          >
            <UserPlus size={18} /> Mời thành viên
          </button>
        )}
      </div>

      {/* Simple Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">Thành viên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">Liên hệ</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    bio: inv.message || "Đang chờ xác nhận lời mời",
                    role: inv.targetRole,
                    isPending: true,
                    createdAt: inv.sentAt
                  }));

                const combined = [...accepted, ...pending];

                const filtered = combined.filter(org => {
                  if (subTabOrganizer === "ALL") return true;
                  if (subTabOrganizer === "INVITATION") return org.isPending;
                  return org.role === subTabOrganizer;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Users size={32} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 text-sm font-medium">Không có dữ liệu</p>
                      </td>
                    </tr>
                  );
                }

                return filtered.map((org, idx) => {
                  const isMe = org.accountId === authUser?.id || org.id === authUser?.id || org.email === authUser?.email;
                  const roleData = getOrganizerRole(org.role);
                  const canManage = (isAdmin || userPerms.canManageTeam) && org.role !== 'LEADER' && !isMe;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">{org.fullName}</span>
                              {isMe && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">(Bạn)</span>}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{org.bio || "Thành viên BTC"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${roleData.color}`}>
                            {roleData.label}
                          </span>
                          {canManage && !org.isPending && (
                            <button 
                              onClick={() => handleOpenRoleModal(org)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                              title="Thay đổi vai trò"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Mail size={12} /> {org.email}</span>
                          {org.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {org.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {org.isPending ? (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Đang mời</span>
                        ) : org.status === 'LEAVING_PENDING' ? (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Xin rời</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Chính thức</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canManage && (
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  title: org.isPending ? "Hủy lời mời" : "Gỡ thành viên",
                                  message: `Xác nhận gỡ ${org.fullName} khỏi ban tổ chức?`,
                                  onConfirm: () => onRemoveMember(org),
                                  icon: Trash2,
                                  color: "rose"
                                });
                                setShowConfirmModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
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
