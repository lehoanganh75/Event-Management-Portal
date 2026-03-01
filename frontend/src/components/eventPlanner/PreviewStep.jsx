import React, { useState } from 'react';
import { 
  Save, FileText, ArrowLeft, RefreshCw, 
  Download, Maximize2, X 
} from 'lucide-react';

const DocumentContent = ({ isModal = false }) => (
  <div className={`bg-white mx-auto shadow-lg rounded font-serif transition-all duration-300 ${
    isModal ? "max-w-4xl p-16 my-8" : "max-w-3xl p-12"
  } min-h-262 text-black`}>
    
    <div className="flex justify-between text-[13px] font-bold mb-10 leading-tight">
      <div className="text-center uppercase">
        <p>Bộ Giáo dục và Đào tạo</p>
        <p className="font-bold">Trường Đại học Công nghiệp TP.HCM</p>
        <div className="w-24 h-px bg-black mx-auto mt-1"></div>
      </div>
      <div className="text-center">
        <p className="uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
        <p className="font-bold">Độc lập - Tự do - Hạnh phúc</p>
        <div className="w-32 h-px bg-black mx-auto mt-1"></div>
      </div>
    </div>

    {/* Tiêu đề văn bản */}
    <div className="text-center mb-10">
      <h3 className="text-xl font-bold uppercase tracking-tight">KẾ HOẠCH</h3>
      <p className="font-bold text-base mt-2 underline underline-offset-4">
        V/v: AI Nơi Trải Nghiệm Thế Giới Mới
      </p>
    </div>
    
    <div className="text-left space-y-8 text-[16px] leading-relaxed">
      {[
        { title: "I. MỤC ĐÍCH", content: "Nội dung mục đích thực hiện kế hoạch nhằm nâng cao kiến thức về công nghệ trí tuệ nhân tạo cho sinh viên..." },
        { title: "II. THỜI GIAN VÀ ĐỊA ĐIỂM", content: "Thời gian: 08:00 ngày 20/04/2024. Địa điểm: Hội trường E4." },
        { title: "III. ĐỐI TƯỢNG THAM DỰ", content: "Sinh viên khoa Công nghệ thông tin và các cá nhân có quan tâm." },
        { title: "IV. NỘI DUNG CHƯƠNG TRÌNH", content: "Bao gồm các phiên thảo luận về Machine Learning, GenAI và ứng dụng thực tiễn." },
        { title: "V. KINH PHÍ DỰ KIẾN", content: "Tổng kinh phí dự kiến: 10.000.000 VNĐ (Mười triệu đồng chẵn)." },
      ].map((item, index) => (
        <div key={index}>
          <p className="font-bold mb-2 uppercase">{item.title}</p>
          <p className="text-justify ml-4">{item.content}</p>
        </div>
      ))}
    </div>

    <div className="mt-20 flex justify-between text-[15px]">
      <div className="text-left w-1/3">
        <p className="font-bold mb-1 italic underline">Nơi nhận:</p>
        <p className="text-sm">- Ban Giám hiệu (để b/c);</p>
        <p className="text-sm">- Như điều III;</p>
        <p className="text-sm">- Lưu VT, Khoa.</p>
      </div>
      <div className="text-center w-1/2">
        <p className="italic mb-1">TP. Hồ Chí Minh, ngày .... tháng .... năm 2024</p>
        <p className="font-bold mb-24 uppercase">TRƯỞNG KHOA</p>
        <p className="font-bold uppercase text-blue-800/20 text-xs text-center border-t border-dashed pt-2">
          (Ký và ghi rõ họ tên)
        </p>
      </div>
    </div>
  </div>
);

export const PreviewStep = ({ onEdit, onSave }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Xem trước văn bản</h1>
          <p className="text-slate-500 text-sm italic">Hệ thống đang mô phỏng định dạng in ấn thực tế</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <Maximize2 size={18} /> Phóng to toàn màn hình
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 sticky top-6">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Công cụ quản lý</p>
            
            <button onClick={onSave} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
              <Save size={18} /> Lưu kế hoạch
            </button>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
              <Download size={18} /> Xuất file Word
            </button>

            <div className="h-px bg-slate-100 my-4"></div>
            
            <button onClick={onEdit} className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-slate-400 hover:text-slate-800 transition-all">
              <ArrowLeft size={18} /> Quay lại sửa
            </button>
            
            <button className="w-full text-rose-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors">
              <RefreshCw size={18} /> Làm mới nội dung
            </button>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-slate-200/50 rounded-3xl p-10 border border-slate-200 overflow-hidden shadow-inner flex justify-center">
             <div className="scale-[0.85] origin-top transform-gpu">
                <DocumentContent />
             </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-100 bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center px-8 py-4 border-b border-white/10">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-500 rounded-lg text-white"><FileText size={20}/></div>
               <span className="text-white font-bold text-lg">Chế độ xem tập trung (A4 Mode)</span>
            </div>
            <button 
              onClick={() => setIsFullscreen(false)}
              className="bg-white/10 p-2 rounded-full text-white hover:bg-rose-500 transition-all"
            >
              <X size={32} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex justify-center scrollbar-hide">
            <DocumentContent isModal={true} />
          </div>

          <div className="p-6 bg-white/5 border-t border-white/10 flex justify-center gap-6">
             <button onClick={onSave} className="px-10 py-3 bg-emerald-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all">
                <Save size={20} /> XÁC NHẬN LƯU
             </button>
          </div>
        </div>
      )}
    </div>
  );
};