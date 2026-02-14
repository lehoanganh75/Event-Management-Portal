import React from 'react';
import { Save, FileText, ArrowLeft, RefreshCw, Download, Info } from 'lucide-react';

export const PreviewStep = ({ onEdit, onSave }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Xem trước kế hoạch
        </h1>
        <p className="text-sm text-slate-500">
          Kiểm tra thông tin trước khi lưu và tải xuống
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2 text-sm border-b pb-2">
              <FileText size={16} /> Thao tác
            </h3>
            
            <button 
              onClick={onSave}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Save size={16} /> Lưu kế hoạch
            </button>
            
            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <Download size={16} /> Tải về Word
            </button>
            
            <button 
              onClick={onEdit}
              className="w-full bg-slate-500 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft size={16} /> Chỉnh sửa
            </button>
            
            <button className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
              <RefreshCw size={16} /> Tạo mới
            </button>

            {/* Info */}
            <div className="pt-3 border-t space-y-2">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Info size={12} /> Thông tin
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• Mode: Thủ công</p>
                <p>• Bản mẫu: Workshop</p>
                <p>• Trường: 8</p>
                <p>• Trạng thái: Chưa lưu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 
                Chương trình: 1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> 
                Ban tổ chức: 1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 
                Tham dự: 1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span> 
                Tùy chỉnh: 1
              </span>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-slate-100 rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="bg-slate-50 px-4 py-2 rounded-t-lg text-xs font-semibold text-slate-600 flex items-center gap-2 border-b mb-4">
              <FileText size={14}/> Xem trước tài liệu
            </div>
            
            {/* A4 Paper Simulation */}
            <div className="bg-white mx-auto max-w-3xl p-12 shadow-md min-h-[600px] rounded font-serif">
              {/* Header */}
              <div className="flex justify-between text-xs font-bold mb-8">
                <div className="uppercase text-left">
                  TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM <br/>
                  KHOA CÔNG NGHỆ THÔNG TIN
                </div>
                <div className="text-right">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM <br/>
                  Độc lập - Tự do - Hạnh phúc <br/>
                  <span className="font-normal italic">———————</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h3 className="text-base font-bold uppercase mb-2">KẾ HOẠCH</h3>
                <p className="font-semibold text-sm">V/v: AI Nơi Trải Nghiệm Thế Giới Mới</p>
              </div>
              
              {/* Content Sections */}
              <div className="text-left space-y-6 text-sm">
                <div>
                  <p className="font-bold mb-2">1. Mục đích</p>
                  <p className="italic text-slate-400 ml-4">
                    [Nội dung mục đích sẽ hiển thị tại đây...]
                  </p>
                </div>

                <div>
                  <p className="font-bold mb-2">2. Thời gian và địa điểm</p>
                  <p className="italic text-slate-400 ml-4">
                    [Thông tin thời gian và địa điểm...]
                  </p>
                </div>

                <div>
                  <p className="font-bold mb-2">3. Đối tượng tham dự</p>
                  <p className="italic text-slate-400 ml-4">
                    [Danh sách đối tượng tham dự...]
                  </p>
                </div>

                <div>
                  <p className="font-bold mb-2">4. Nội dung chương trình</p>
                  <p className="italic text-slate-400 ml-4">
                    [Chi tiết chương trình...]
                  </p>
                </div>

                <div>
                  <p className="font-bold mb-2">5. Kinh phí dự kiến</p>
                  <p className="italic text-slate-400 ml-4">
                    [Thông tin kinh phí...]
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 flex justify-between text-xs">
                <div className="text-left">
                  <p className="font-bold mb-1">Nơi nhận:</p>
                  <p className="italic text-slate-500">- Như trên;</p>
                  <p className="italic text-slate-500">- Lưu VT.</p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-8">TRƯỞNG KHOA</p>
                  <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};