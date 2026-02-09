import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Camera } from "lucide-react";

const ProfileUser = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600" />
        
        <div className="px-8 pb-10">
          <div className="relative -mt-12 mb-6 inline-block">
            <div className="w-24 h-24 bg-white rounded-3xl p-1 border-4 border-white shadow-xl overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Lecturer&background=random" alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Camera size={14}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Thông tin cá nhân</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <User size={20} className="text-slate-400" />
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</p><p className="font-bold text-slate-700">Nguyễn Giảng Viên</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <Mail size={20} className="text-slate-400" />
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p><p className="font-bold text-slate-700">lecturer@iuh.edu.vn</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Bảo mật tài khoản</h3>
              <div className="bg-blue-50 p-6 rounded-4xl border border-blue-100 relative overflow-hidden">
                <Shield className="absolute -right-4 -bottom-4 text-blue-100" size={100} />
                <div className="relative z-10">
                   <p className="text-blue-700 font-bold mb-4 text-sm">Xác thực 2 lớp (2FA) đang được kích hoạt cho tài khoản của bạn.</p>
                   <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-100">ĐỔI MẬT KHẨU</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileUser;