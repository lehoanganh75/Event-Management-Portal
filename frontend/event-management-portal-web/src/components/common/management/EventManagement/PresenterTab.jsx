import React from 'react';
import {
  UserPlus,
  Clock,
  Mail,
  Phone,
  Trash2,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
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
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {isAddingPresenter
                ? "Quản lý diễn giả"
                : `Danh sách diễn giả (${event.presenters?.length || 0})`}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Quản lý diễn giả tham gia sự kiện
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Tìm diễn giả..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="
                  w-[440px]
                  pl-9 pr-3 py-2.5
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-sm text-slate-700
                  placeholder:text-slate-400
                  outline-none
                  focus:border-violet-400
                  transition-colors
                "
              />
            </div>

            {/* Add Presenter */}
            {!isAddingPresenter && userPerms.canManageTeam && (
              <button
                onClick={() => {
                  setIsAddingPresenter(true);
                  addPresenterInvite();
                }}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  text-sm font-medium
                  transition-colors
                "
              >
                <UserPlus size={16} />
                Thêm diễn giả
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invite Section */}
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Diễn giả
                </th>

                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Phiên trình bày
                </th>

                <th className="px-5 py-3 text-left font-medium text-slate-600">
                  Trạng thái
                </th>

                {userPerms.canManageTeam && (
                  <th className="px-5 py-3 text-center font-medium text-slate-600">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(() => {
                const accepted = (event.presenters || []).map((p) => ({
                  ...p,
                  fullName:
                    p.profile?.fullName || "Chưa có tên",
                  avatarUrl: p.profile?.avatarUrl,
                  email: p.profile?.email,
                  phone: p.profile?.phone,
                  isPending: false,
                  displaySessions: p.sessions || [],
                }));

                const pending = (event.invitations || [])
                  .filter(
                    (inv) =>
                      (inv.status === "PENDING" ||
                        inv.status === "REJECTED") &&
                      inv.type === "PRESENTER"
                  )
                  .map((inv) => ({
                    ...inv,
                    isPending: true,
                    fullName:
                      inv.invitee?.fullName ||
                      inv.inviteeEmail,
                    avatarUrl: inv.invitee?.avatarUrl,
                    email:
                      inv.invitee?.email ||
                      inv.inviteeEmail,
                    phone: inv.invitee?.phone,
                    displaySessions: inv.presenterSession
                      ? [
                        {
                          title:
                            inv.presenterSession === "ALL"
                              ? "Tất cả phiên"
                              : inv.presenterSession,
                        },
                      ]
                      : [],
                    createdAt: inv.sentAt,
                  }));

                const combined = [...accepted, ...pending].filter((p) => {
                  const searchLower = searchKey.toLowerCase();
                  return (
                    p.fullName?.toLowerCase().includes(searchLower) ||
                    p.email?.toLowerCase().includes(searchLower) ||
                    p.displaySessions?.some(s => s.title?.toLowerCase().includes(searchLower))
                  );
                });

                if (combined.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={
                          userPerms.canManageTeam ? 4 : 3
                        }
                        className="py-14 text-center text-sm text-slate-400"
                      >
                        Không tìm thấy diễn giả
                      </td>
                    </tr>
                  );
                }

                return combined.map((p, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={
                              p.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                p.fullName
                              )}&background=random`
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-800 truncate">
                              {p.fullName}
                            </p>

                            {p.status === "REJECTED" ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-medium border border-rose-100">
                                Đã từ chối
                              </span>
                            ) : p.isPending ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-medium border border-amber-100">
                                Đang mời
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100">
                                Đã tham gia
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={12} />
                              {p.email || "N/A"}
                            </div>

                            {p.phone && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Phone size={12} />
                                {p.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sessions */}
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        {p.displaySessions?.length > 0 ? (
                          p.displaySessions.map(
                            (s, sIdx) => (
                              <div
                                key={sIdx}
                                className="
                                  px-3 py-2
                                  rounded-lg
                                  bg-slate-50
                                  border border-slate-100
                                "
                              >
                                <p className="text-xs font-medium text-slate-700">
                                  {s.title}
                                </p>
                              </div>
                            )
                          )
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Chưa có phiên
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {p.status === "REJECTED" ? (
                        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3">
                          {p.rejectionReason ||
                            "Không có lý do"}
                        </div>
                      ) : p.isPending ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-xs font-medium">
                          <Clock size={13} />
                          Đã gửi lời mời
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium">
                          Đang hoạt động
                        </div>
                      )}

                      {p.isPending &&
                        p.createdAt && (
                          <p className="text-[11px] text-slate-400 mt-2">
                            {formatDateTime(
                              p.createdAt
                            )}
                          </p>
                        )}
                    </td>

                    {/* Actions */}
                    {userPerms.canManageTeam && (
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => {
                            const isPending =
                              p.isPending;

                            setConfirmConfig({
                              title: isPending
                                ? "Hủy lời mời"
                                : "Gỡ diễn giả",
                              message: `Bạn có chắc muốn ${isPending
                                ? "hủy lời mời tới"
                                : "gỡ"
                                } ${p.fullName}?`,
                              onConfirm: () =>
                                isPending
                                  ? onRemoveMember(p)
                                  : onRemovePresenter(
                                    p.id
                                  ),
                              icon: isPending
                                ? X
                                : Trash2,
                              color: "rose",
                            });

                            setShowConfirmModal(true);
                          }}
                          className="
                            p-2.5
                            rounded-lg
                            text-rose-600
                            hover:bg-rose-50
                            transition-colors
                          "
                        >
                          {p.isPending ? (
                            <X size={17} />
                          ) : (
                            <Trash2 size={17} />
                          )}
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
    </div>
  );
};

export default PresenterTab;