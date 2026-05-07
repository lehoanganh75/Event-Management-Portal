import React from "react";
import { Settings, Edit3, Trash2, ShieldCheck, Mail, LogOut, Bot, Info, Trash } from "lucide-react";

const SettingsTab = ({ 
  event, 
  isAdmin, 
  userPerms, 
  onEdit, 
  setShowDeleteConfirm, 
  onResetStatistics 
}) => {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NHÓM 1: QUẢN LÝ SỰ KIỆN */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cấu hình chung</h3>
              <p className="text-xs text-slate-400 font-bold">Chỉnh sửa thông tin và quyền riêng tư</p>
            </div>
          </div>

          <div className="space-y-3">
            {(isAdmin || userPerms.canEditEvent) && (
              <button
                onClick={onEdit}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group border border-transparent hover:border-indigo-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Edit3 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Chỉnh sửa thông tin</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tên, mô tả, thời gian, địa điểm...</p>
                  </div>
                </div>
              </button>
            )}

            {(isAdmin || userPerms.canEditEvent) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-5 bg-rose-50/30 hover:bg-rose-50 rounded-2xl transition-all group border border-transparent hover:border-rose-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                    <Trash2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-rose-600">Xóa sự kiện</p>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Hủy bỏ và xóa toàn bộ dữ liệu</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* NHÓM 2: DỮ LIỆU & HỆ THỐNG */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Hệ thống</h3>
              <p className="text-xs text-slate-400 font-bold">Quản lý dữ liệu và thông báo</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-amber-50 rounded-2xl transition-all group border border-transparent hover:border-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gửi Email thông báo</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thông báo cho tất cả người tham gia</p>
                </div>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={onResetStatistics}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Trash size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Làm mới thống kê</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Xóa bộ nhớ đệm và tính toán lại</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK INFO FOOTER */}
      <div className="mt-10 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
          <Bot size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Bot className="text-indigo-400" size={20} />
              <h4 className="text-lg font-black uppercase tracking-widest">Trợ lý Event Management</h4>
            </div>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Các cài đặt quan trọng như xóa sự kiện sẽ ảnh hưởng đến tất cả dữ liệu liên quan. Vui lòng kiểm tra kỹ trước khi thực hiện.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Tài liệu HD</button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/50">Hỗ trợ 24/7</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
