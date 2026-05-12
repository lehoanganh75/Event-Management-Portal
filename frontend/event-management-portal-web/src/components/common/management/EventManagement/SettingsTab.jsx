import React from "react";
import { Settings, Edit3, Trash2, ShieldCheck, Mail, LogOut, Bot, Info, Trash } from "lucide-react";

const SettingsTab = ({ 
  event, 
  isAdmin, 
  userPerms = {}, 
  onEdit, 
  setShowDeleteConfirm, 
  onResetStatistics 
}) => {
  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="space-y-8">
        {/* SECTION 1: CẤU HÌNH CHUNG */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <Settings className="text-slate-400" size={20} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cấu hình cơ bản</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {(isAdmin || userPerms.canEditEvent) && (
              <button
                onClick={onEdit}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit3 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Chỉnh sửa thông tin sự kiện</p>
                    <p className="text-xs text-slate-400">Tên, mô tả, thời gian, địa điểm và các thông tin cơ bản khác.</p>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <Settings size={16} />
                </div>
              </button>
            )}
            
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Cài đặt quyền riêng tư</p>
                  <p className="text-xs text-slate-400">Kiểm soát ai có thể xem và tham gia sự kiện của bạn.</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: HỆ THỐNG & DỮ LIỆU */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <ShieldCheck className="text-slate-400" size={20} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Hệ thống & Dữ liệu</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gửi thông báo Email</p>
                  <p className="text-xs text-slate-400">Gửi cập nhật hoặc lời nhắc cho tất cả người tham gia.</p>
                </div>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={onResetStatistics}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Làm mới dữ liệu thống kê</p>
                    <p className="text-xs text-slate-400">Xóa bộ nhớ đệm và tính toán lại các số liệu báo cáo.</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: VÙNG NGUY HIỂM */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <Trash2 className="text-rose-400" size={20} />
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Vùng nguy hiểm</h3>
          </div>
          <div className="bg-rose-50/20 border border-rose-100 rounded-2xl overflow-hidden">
            {(isAdmin || userPerms.canEditEvent) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Trash2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-rose-600">Xóa vĩnh viễn sự kiện</p>
                    <p className="text-xs text-rose-400">Tất cả dữ liệu, bài viết và thống kê sẽ bị xóa và không thể khôi phục.</p>
                  </div>
                </div>
                <div className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-rose-200">
                  Thực hiện
                </div>
              </button>
            )}
          </div>
          <p className="mt-4 px-4 text-[11px] text-slate-400 italic">
            * Lưu ý: Các thay đổi trong vùng nguy hiểm có thể ảnh hưởng đến toàn bộ hệ thống dữ liệu của sự kiện.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
