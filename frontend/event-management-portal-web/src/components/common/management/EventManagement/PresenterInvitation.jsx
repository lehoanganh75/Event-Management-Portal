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
    <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-500" /> Mời diễn giả mới
        </h3>
        <button 
          onClick={() => setIsAddingPresenter(false)} 
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} 
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          AI gợi ý
        </button>
        <button 
          onClick={() => addPresenterInvite()} 
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          Thêm thủ công
        </button>
      </div>

      {showUserSuggestions && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto space-y-2">
          <Input 
            className="rounded-xl border-slate-100 focus:ring-indigo-500" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            value={searchKey} 
            onChange={e => setSearchKey(e.target.value)} 
          />
          {loadingUsers ? (
            <p className="text-center text-gray-400 py-4">Đang tải...</p>
          ) : filteredUsers.map(u => (
            <div 
              key={u.id} 
              onClick={() => { addPresenterInvite(u); setShowUserSuggestions(false); }} 
              className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg border border-transparent hover:border-slate-100 flex items-center gap-3 group transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-100">
                <UserCheck size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold">{u.fullName || u.profile?.fullName || u.username}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {presenterInvitations.map((invite, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
          <button 
            onClick={() => removePresenterInvite(idx)} 
            className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Email *">
              <Input 
                className="h-11 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" 
                value={invite.inviteeEmail} 
                onChange={e => updatePresenterInvite(idx, 'inviteeEmail', e.target.value)} 
              />
            </Field>
            <Field label="Phiên">
              <Select 
                className="h-11 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={invite.session} 
                onChange={e => updatePresenterInvite(idx, 'session', e.target.value)}
              >
                <option value="ALL">Toàn bộ sự kiện</option>
                {event.sessions?.slice().sort((a, b) => a.orderIndex - b.orderIndex).map(s => (
                  <option key={s.id} value={s.title}>Phiên {s.orderIndex}: {s.title}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Lời mời / Thông tin bổ sung">
              <Textarea 
                className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-h-[100px]"
                value={invite.bio} 
                onChange={e => updatePresenterInvite(idx, 'bio', e.target.value)} 
                placeholder="Lời nhắn hoặc giới thiệu ngắn gọn về diễn giả..." 
                rows={3} 
              />
            </Field>
          </div>
        </div>
      ))}

      {presenterInvitations.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={handleSendPresenterInvites} 
            disabled={isInvitingPresenter} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isInvitingPresenter ? "Đang gửi..." : "Gửi lời mời ngay"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PresenterInvitation;
