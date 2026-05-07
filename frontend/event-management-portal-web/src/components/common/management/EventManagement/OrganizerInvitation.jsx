import React from "react";
import { Search, Plus, UserCheck, X, Send } from "lucide-react";
import { Input, Select, Field } from "./UIComponents";

const OrganizerInvitation = ({
  isAddingMember,
  setIsAddingMember,
  onFetchUsers,
  showUserSuggestions,
  setShowUserSuggestions,
  searchKey,
  setSearchKey,
  loadingUsers,
  filteredUsers,
  invitations,
  addInvite,
  removeInvite,
  updateInvite,
  handleSendInvites,
  isInviting,
  availableInviteRoles
}) => {
  if (!isAddingMember) return null;

  return (
    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6 mb-8">
      <div className="flex justify-between items-center">
         <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Thêm thành viên mới</h4>
         <button 
           onClick={() => setIsAddingMember(false)} 
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
          onClick={() => addInvite()} 
          className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          Thêm thủ công
        </button>
      </div>

      {showUserSuggestions && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xl max-h-[350px] overflow-y-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              className="pl-10 h-11 rounded-xl border-slate-100 focus:ring-indigo-500" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              value={searchKey} 
              onChange={e => setSearchKey(e.target.value)} 
            />
          </div>
          {loadingUsers ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tìm kiếm nhân sự...</p>
            </div>
          ) : filteredUsers.map(u => (
            <div 
              key={u.id} 
              onClick={() => { addInvite(u); setShowUserSuggestions(false); }} 
              className="p-4 hover:bg-indigo-50/50 cursor-pointer rounded-2xl border border-transparent hover:border-indigo-100 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors">
                  <UserCheck size={20} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{u.fullName || u.profile?.fullName || u.username}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.email}</p>
                </div>
              </div>
              <Plus size={18} className="text-slate-300 group-hover:text-indigo-600" />
            </div>
          ))}
        </div>
      )}

      {invitations.map((invite, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
          <button 
            onClick={() => removeInvite(idx)} 
            className="absolute top-6 right-6 p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Địa chỉ Email nhân sự *">
              <Input 
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="example@domain.com" 
                value={invite.inviteeEmail} 
                onChange={e => updateInvite(idx, 'inviteeEmail', e.target.value)} 
              />
            </Field>
            <Field label="Phân quyền vai trò">
              <Select
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={invite.targetRole}
                onChange={e => updateInvite(idx, 'targetRole', e.target.value)}
              >
                {availableInviteRoles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-6">
            <Field label="Lời nhắn mời tham gia">
              <textarea
                className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-h-[100px]"
                placeholder="Chào bạn, mời bạn tham gia vào ban tổ chức sự kiện..."
                value={invite.message}
                onChange={e => updateInvite(idx, 'message', e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}

      {invitations.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSendInvites}
            disabled={isInviting}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isInviting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
            {isInviting ? "ĐANG GỬI LỜI MỜI..." : "XÁC NHẬN GỬI LỜI MỜI"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizerInvitation;
