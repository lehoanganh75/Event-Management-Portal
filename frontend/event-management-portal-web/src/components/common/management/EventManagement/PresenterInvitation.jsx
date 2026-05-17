import React from "react";
import { Sparkles, UserCheck, X, Plus } from "lucide-react";
import { Field, Input, Select, Textarea } from "./UIComponents";

const PresenterInvitation = ({
  isAddingPresenter,
  setIsAddingPresenter,
  onFetchUsers,
  showUserSuggestions,
  setShowUserSuggestions,
  searchKey,
  setSearchKey,
  loadingUsers,
  filteredUsers,
  presenterInvitations,
  addPresenterInvite,
  removePresenterInvite,
  updatePresenterInvite,
  handleSendPresenterInvites,
  isInvitingPresenter,
  event
}) => {
  if (!isAddingPresenter) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Sparkles size={18} className="text-indigo-600" />
            Mời diễn giả
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Gửi lời mời tham gia trình bày tại sự kiện
          </p>
        </div>

        <button
          onClick={() => setIsAddingPresenter(false)}
          className="
            p-2 rounded-lg
            text-slate-500
            hover:bg-slate-100
            transition-colors
          "
        >
          <X size={18} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            onFetchUsers();
            setShowUserSuggestions(!showUserSuggestions);
          }}
          className="
            inline-flex items-center gap-2
            px-4 py-2.5
            rounded-xl
            border border-violet-200
            bg-violet-50/70
            text-violet-600
            text-sm font-semibold
            hover:bg-violet-100
            hover:border-violet-300
            transition-colors
          "
        >
          <Sparkles size={16} strokeWidth={2.3} />
          AI gợi ý thành viên
        </button>

        <button
          onClick={() => addPresenterInvite()}
          className="
            px-4 py-2.5
            rounded-lg
            border border-slate-200
            bg-white
            hover:bg-slate-50
            text-slate-700
            text-sm
            font-medium
            transition-colors
            flex items-center gap-2
          "
        >
          <Plus size={16} />
          Thêm thủ công
        </button>
      </div>

      {/* User Suggestions */}
      {showUserSuggestions && (
        <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
          <Input
            className="
              h-11
              rounded-lg
              border border-slate-200
              bg-white
              focus:ring-0
              focus:border-indigo-500
            "
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />

          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
            {loadingUsers ? (
              <p className="text-center text-sm text-slate-400 py-6">
                Đang tải...
              </p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    addPresenterInvite(u);
                    setShowUserSuggestions(false);
                  }}
                  className="
                    w-full
                    flex items-center gap-3
                    p-3
                    rounded-lg
                    bg-white
                    border border-slate-200
                    hover:border-indigo-200
                    hover:bg-indigo-50/40
                    transition-colors
                    text-left
                  "
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <UserCheck
                      size={16}
                      className="text-slate-500"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {u.fullName ||
                        u.profile?.fullName ||
                        u.username}
                    </p>

                    <p className="text-xs text-slate-400 truncate">
                      {u.email}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 py-6">
                Không tìm thấy người dùng
              </p>
            )}
          </div>
        </div>
      )}

      {/* Invitations */}
      <div className="space-y-4">
        {presenterInvitations.map((invite, idx) => (
          <div
            key={idx}
            className="
              relative
              border border-slate-200
              rounded-xl
              p-5
              bg-slate-50/50
            "
          >
            {/* Remove */}
            <button
              onClick={() => removePresenterInvite(idx)}
              className="
                absolute top-4 right-4
                p-2
                rounded-lg
                text-rose-500
                hover:bg-rose-50
                transition-colors
              "
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Email *">
                <Input
                  className="
                    h-11
                    rounded-lg
                    border border-slate-200
                    bg-white
                    focus:ring-0
                    focus:border-indigo-500
                  "
                  value={invite.inviteeEmail}
                  onChange={(e) =>
                    updatePresenterInvite(
                      idx,
                      "inviteeEmail",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Phiên trình bày">
                <Select
                  className="
                    h-11
                    rounded-lg
                    border border-slate-200
                    bg-white
                    focus:ring-0
                    focus:border-indigo-500
                  "
                  value={invite.session}
                  onChange={(e) =>
                    updatePresenterInvite(
                      idx,
                      "session",
                      e.target.value
                    )
                  }
                >
                  <option value="ALL">
                    Toàn bộ sự kiện
                  </option>

                  {event.sessions
                    ?.slice()
                    .sort(
                      (a, b) =>
                        a.orderIndex - b.orderIndex
                    )
                    .map((s) => (
                      <option
                        key={s.id}
                        value={s.title}
                      >
                        Phiên {s.orderIndex}: {s.title}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Thông tin bổ sung">
                <Textarea
                  className="
                    w-full
                    min-h-[100px]
                    p-4
                    rounded-lg
                    border border-slate-200
                    bg-white
                    focus:ring-0
                    focus:border-indigo-500
                    text-sm
                  "
                  value={invite.bio}
                  onChange={(e) =>
                    updatePresenterInvite(
                      idx,
                      "bio",
                      e.target.value
                    )
                  }
                  placeholder="Lời nhắn hoặc giới thiệu ngắn gọn..."
                  rows={3}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      {presenterInvitations.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSendPresenterInvites}
            disabled={isInvitingPresenter}
            className="
              px-6 py-3
              rounded-lg
              bg-indigo-600
              hover:bg-indigo-700
              disabled:bg-indigo-400
              text-white
              text-sm
              font-medium
              transition-colors
            "
          >
            {isInvitingPresenter
              ? "Đang gửi..."
              : "Gửi lời mời"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PresenterInvitation;