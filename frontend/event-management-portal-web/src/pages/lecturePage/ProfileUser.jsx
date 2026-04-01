import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Camera, Briefcase, Calendar, CheckCircle } from "lucide-react";

const ProfileUser = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-5xl mx-auto p-6"
    >
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-24 bg-slate-800" />
        <div className="px-8 pb-6">
          <div className="relative -mt-12 flex items-end gap-6 mb-4">
            <div className="relative">
              <div className="w-28 h-28 bg-white rounded-2xl p-1 shadow-md border border-slate-100">
                <img 
                  src="https://ui-avatars.com/api/?name=Lecturer&background=0284c7&color=fff" 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-600 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                <Camera size={16}/>
              </button>
            </div>
            
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">Nguyễn Giảng Viên</h2>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <CheckCircle size={12} /> ĐANG HOẠT ĐỘNG
                </span>
              </div>
              <p className="text-slate-500 text-sm">Mã nhân viên: GV-2024-001</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin cơ bản */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <User size={16} /> Thông tin chi tiết
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <InfoItem label="Họ và tên" value="Nguyễn Giảng Viên" icon={<User size={18}/>} />
              <InfoItem label="Email liên hệ" value="lecturer@iuh.edu.vn" icon={<Mail size={18}/>} />
              <InfoItem label="Chức vụ" value="Giảng viên cơ hữu" icon={<Briefcase size={18}/>} />
              <InfoItem label="Ngày tham gia" value="15/05/2020" icon={<Calendar size={18}/>} />
            </div>
          </div>
        </div>

        {/* Cột phải: Bảo mật & Trạng thái */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={16} /> Bảo mật
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Trạng thái 2FA</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">BẬT</span>
              </div>
              <hr className="border-slate-200" />
              <button className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                ĐỔI MẬT KHẨU
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component con để tái sử dụng
const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);

export default ProfileUser;