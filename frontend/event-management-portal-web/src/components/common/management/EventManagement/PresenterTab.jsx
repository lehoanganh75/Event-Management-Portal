import React from 'react';
import { UserPlus, Sparkles, UserCheck, X, Clock, Mail, Phone, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from './UIComponents';
import PresenterInvitation from './PresenterInvitation';

const PresenterTab = ({
  event,
  userPerms,
  isAddingPresenter,
  setIsAddingPresenter,
  addPresenterInvite,
  onFetchUsers,
  showUserSuggestions,
  setShowUserSuggestions,
  searchKey,
  setSearchKey,
  loadingUsers,
  filteredUsers,
  presenterInvitations,
  removePresenterInvite,
  updatePresenterInvite,
  handleSendPresenterInvites,
  isInvitingPresenter,
  formatDateTime,
  setConfirmConfig,
  setShowConfirmModal,
  onRemoveMember,
  onRemovePresenter
}) => {
  if (!event) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          {isAddingPresenter ? "Quản lý diễn giả" : `Danh sách diễn giả (${event.presenters?.length || 0} người)`}
        </h3>
        {!isAddingPresenter && userPerms.canManageTeam && (
          <button 
            onClick={() => { setIsAddingPresenter(true); addPresenterInvite(); }} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <UserPlus size={18} /> Thêm diễn giả
          </button>
        )}
      </div>

      <PresenterInvitation
        isAddingPresenter={isAddingPresenter}
        setIsAddingPresenter={setIsAddingPresenter}
        onFetchUsers={onFetchUsers}
        showUserSuggestions={showUserSuggestions}
        setShowUserSuggestions={setShowUserSuggestions}
        searchKey={searchKey}
        setSearchKey={setSearchKey}
        loadingUsers={loadingUsers}
        filteredUsers={filteredUsers}
        presenterInvitations={presenterInvitations}
        addPresenterInvite={addPresenterInvite}
        removePresenterInvite={removePresenterInvite}
        updatePresenterInvite={updatePresenterInvite}
        handleSendPresenterInvites={handleSendPresenterInvites}
        isInvitingPresenter={isInvitingPresenter}
        event={event}
      />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-center text-gray-600">Thông tin diễn giả</th>
              <th className="p-4 text-left text-gray-600">Phiên</th>
              <th className="p-4 text-left text-gray-600">Lý do từ chối</th>
              {userPerms.canManageTeam && <th className="p-4 text-center text-gray-600">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(() => {
              const accepted = (event.presenters || []).map(p => ({
                ...p,
                fullName: p.profile?.fullName || "Chưa có tên",
                avatarUrl: p.profile?.avatarUrl,
                email: p.profile?.email,
                phone: p.profile?.phone,
                bio: p.profile?.bio,
                isPending: false,
                displaySessions: p.sessions || []
              }));

              const pending = (event.invitations || [])
                .filter(inv => (inv.status === 'PENDING' || inv.status === 'REJECTED') && inv.type === 'PRESENTER')
                .map(inv => ({
                  ...inv,
                  isPending: true,
                  fullName: inv.invitee?.fullName || inv.inviteeEmail,
                  avatarUrl: inv.invitee?.avatarUrl,
                  email: inv.invitee?.email || inv.inviteeEmail,
                  phone: inv.invitee?.phone,
                  bio: inv.presenterBio || "Lời mời diễn giả đang chờ xác nhận",
                  displaySessions: inv.presenterSession ? [{ title: inv.presenterSession === "ALL" ? "Tất cả các phiên" : inv.presenterSession }] : [],
                  createdAt: inv.sentAt
                }));

              const combined = [...accepted, ...pending];

              if (combined.length === 0) {
                return <tr><td colSpan={userPerms.canManageTeam ? "4" : "3"} className="p-20 text-center text-gray-500 italic bg-slate-50/30">Chưa có diễn giả tham gia sự kiện này</td></tr>;
              }

              return combined.map((p, idx) => (
                <tr key={idx} className={`group hover:bg-slate-50/80 transition-all ${p.isPending ? "bg-amber-50/20" : ""}`}>
                  <td className="p-5">
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm transition-transform group-hover:scale-105 ${p.isPending ? "border-amber-200" : "border-white"}`}>
                          <img
                            src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=random`}
                            alt="Avatar"
                            className={`w-full h-full object-cover ${p.isPending ? "grayscale-[0.3]" : ""}`}
                          />
                        </div>
                        {p.isPending && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                            <Clock size={10} className="text-white animate-spin-slow" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-slate-900 truncate text-base">{p.fullName}</p>
                          {p.status === 'REJECTED' ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-rose-200">Đã từ chối</span>
                          ) : p.isPending && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-amber-200">Đang mời</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 italic font-medium mb-2" title={p.bio}>
                          {p.bio || "Diễn giả tham gia sự kiện"}
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-[11px] font-semibold">{p.email || "N/A"}</span>
                          </div>
                          {p.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-4">
                              <Phone size={12} className="text-slate-400" />
                              <span className="text-[11px] font-semibold">{p.phone}</span>
                            </div>
                          )}
                          {p.isPending && (
                            <div className="flex items-center gap-1.5 text-amber-600 border-l border-slate-200 pl-4">
                              <Clock size={12} className="text-amber-400" />
                              <span className="text-[10px] font-bold">Mời lúc: {formatDateTime(p.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-3 max-w-[400px] mx-auto">
                      {p.displaySessions?.length > 0 ? (
                        p.displaySessions.map((s, sIdx) => (
                          <div key={sIdx} className="relative pl-6 last:pb-0 pb-3 group/sess">
                            {/* Vertical line connector */}
                            {p.displaySessions.length > 1 && sIdx !== p.displaySessions.length - 1 && (
                              <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-slate-100 group-hover/sess:bg-indigo-100 transition-colors" />
                            )}

                            {/* Dot indicator */}
                            <div className={`absolute left-0 top-[6px] w-[16px] h-[16px] rounded-full border-2 z-10 flex items-center justify-center transition-all ${p.isPending ? "bg-amber-50 border-amber-200 text-amber-500" : "bg-white border-indigo-200 text-indigo-500 group-hover/sess:border-indigo-400"}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            </div>

                            <div className="flex flex-col">
                              <p className={`text-[11px] font-black uppercase tracking-tight mb-1 ${p.isPending ? "text-amber-700" : "text-slate-800 group-hover/sess:text-indigo-700"} transition-colors`}>
                                {s.title}
                              </p>

                              {!p.isPending && s.startTime ? (
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold opacity-80">
                                  <div className="flex items-center gap-1">
                                    <Clock size={10} className="text-slate-400" />
                                    <span>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              ) : (
                                p.isPending && <span className="text-[9px] text-amber-600 font-bold italic">Tất cả các phiên</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Chưa xác định phiên</p>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    {p.status === 'REJECTED' && (
                      <div className="text-[11px] text-rose-600 font-bold italic bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        Lý do: "{p.rejectionReason || "Không có lý do cụ thể"}"
                      </div>
                    )}
                  </td>
                  {userPerms.canManageTeam && (
                    <td className="p-5 text-center">
                      <button
                        onClick={() => {
                          const isPending = p.isPending;
                          setConfirmConfig({
                            title: isPending ? "Hủy lời mời" : "Gỡ diễn giả",
                            message: `Bạn có chắc muốn ${isPending ? "hủy lời mời tới" : "gỡ"} diễn giả ${p.fullName}?`,
                            onConfirm: () => isPending ? onRemoveMember(p) : onRemovePresenter(p.id),
                            icon: isPending ? X : Trash2,
                            color: "rose"
                          });
                          setShowConfirmModal(true);
                        }}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-rose-100 border border-transparent hover:border-rose-100"
                        title={p.isPending ? "Hủy lời mời" : "Gỡ bỏ"}
                      >
                        {p.isPending ? <X size={20} /> : <Trash2 size={20} />}
                      </button>
                    </td>
                  )}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PresenterTab;
