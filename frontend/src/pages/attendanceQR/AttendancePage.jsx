import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  MapPin, Users, Settings, Share2, 
  Download, ShieldCheck, Maximize2, X, 
  Calendar, Clock, Info, Smartphone, Camera, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const AttendancePage = () => {
  const location = useLocation();
  const isLecturerView = location.pathname.includes("/lecturer");

  // State quản lý vai trò và các tác vụ
  const [role, setRole] = useState(isLecturerView ? "admin" : "student"); 
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrValue, setQrValue] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedStatus, setScannedStatus] = useState(null);
  
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const isInitialMount = useRef(true);

  const eventInfo = {
    id: "EVENT_2026_AI_ML",
    title: "Hội thảo Khoa học: AI và Machine Learning trong Kỷ nguyên Số",
    location: "Hội trường A - Tầng 2, Tòa nhà Innovation",
    time: "08:00 - 11:30",
    date: "15/02/2026",
    expectedStudents: 150,
    presenter: "TS. Nguyễn Văn A",
    department: "Khoa Công nghệ Thông tin"
  };

  // --- LOGIC CHO ADMIN (TẠO MÃ QR) ---
  const generateNewQR = useCallback(() => {
    const token = Math.random().toString(36).substring(7);
    const data = JSON.stringify({ id: eventInfo.id, token, timestamp: Date.now() });
    setQrValue(data);
    setTimeLeft(30);
  }, [eventInfo.id]);

  useEffect(() => {
    if (role === "admin") {
      if (isInitialMount.current) {
        generateNewQR();
        isInitialMount.current = false;
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            generateNewQR();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [role, generateNewQR]);

  // --- LOGIC CHO SINH VIÊN (QUÉT MÃ) ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setScanning(true);
      // Giả lập quét thành công
      setTimeout(() => {
        setScannedStatus("success");
        stopCamera();
        toast.success("Điểm danh thành công!");
      }, 3000);
    } catch {
      toast.error("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setScanning(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isLecturerView ? 'bg-transparent' : 'bg-slate-50'}`}>
      {!isLecturerView && <Header />}
      
      <main className={`grow container mx-auto px-4 ${isLecturerView ? 'py-0' : 'py-8'} max-w-6xl`}>
        
        {/* Nút chuyển Role chỉ hiện ở trang public */}
        {!isLecturerView && (
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
              <button 
                onClick={() => { setRole("student"); stopCamera(); setScannedStatus(null); }} 
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Sinh viên
              </button>
              <button 
                onClick={() => setRole("admin")} 
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Quản lý
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT THÔNG TIN (4/12) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  {role === "admin" ? <Settings size={24} /> : <Info size={24} />}
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                    {role === "admin" ? "Bảng điều khiển" : "Thông tin sự kiện"}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{eventInfo.department}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Tên sự kiện</label>
                  <p className="text-slate-700 font-extrabold leading-tight text-lg">{eventInfo.title}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin size={18} className="text-rose-500" />
                    <span className="text-sm font-semibold">{eventInfo.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Calendar size={18} className="text-blue-500" />
                    <span className="text-sm font-semibold">{eventInfo.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Clock size={18} className="text-emerald-500" />
                    <span className="text-sm font-semibold">{eventInfo.time}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-slate-200">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-400">Dự kiến tham gia:</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-black text-sm">{eventInfo.expectedStudents} SV</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  <Download size={14} /> {role === 'admin' ? "Báo cáo" : "Minh chứng"}
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all">
                  <Share2 size={14} /> Chia sẻ
                </button>
              </div>
            </div>
          </motion.div>

          {/* CỘT TÁC VỤ CHÍNH (8/12) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-white text-center min-h-145 flex flex-col justify-center relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {role === "admin" ? (
                  <motion.div key="admin-mode" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                      <ShieldCheck size={14} /> Hệ thống bảo mật đang hoạt động
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Mã QR Điểm danh</h2>
                    <p className="text-slate-400 mb-12 text-sm font-medium tracking-tight">Vui lòng trình chiếu mã này để sinh viên thực hiện quét mã xác nhận</p>
                    
                    <div 
                      className="relative inline-block bg-white p-8 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-50 cursor-zoom-in group mx-auto transition-transform hover:scale-105 active:scale-95"
                      onClick={() => setIsZoomed(true)}
                    >
                      <QRCode value={qrValue || "initial"} size={240} level="H" />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/0 group-hover:bg-white/10 backdrop-blur-[2px] rounded-[3.5rem] transition-all opacity-0 group-hover:opacity-100">
                        <div className="bg-slate-900 text-white p-4 rounded-full shadow-2xl">
                          <Maximize2 size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-14 max-w-sm mx-auto w-full px-6">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">
                        <span>Tự động làm mới</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{timeLeft}S</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-linear-to-r from-indigo-500 to-blue-500" 
                          animate={{ width: `${(timeLeft / 30) * 100}%` }} 
                          transition={{ duration: 1, ease: "linear" }} 
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="student-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {!scanning && !scannedStatus && (
                      <div className="py-10">
                        <div className="w-24 h-24 bg-blue-50 rounded-4xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-inner">
                          <Smartphone className="text-blue-600 w-12 h-12 -rotate-12" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4">Sẵn sàng điểm danh?</h2>
                        <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm font-medium">Hướng camera điện thoại về phía mã QR đang được trình chiếu trên màn hình.</p>
                        <button onClick={startCamera} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                          <Camera size={20} /> BẮT ĐẦU QUÉT
                        </button>
                      </div>
                    )}
                    
                    {scanning && (
                      <div className="relative aspect-square max-w-100 mx-auto bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-2 border-white/40 rounded-3xl relative">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                            <motion.div 
                              className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_#3b82f6]"
                              animate={{ top: ['5%', '95%', '5%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </div>
                        </div>
                        <button onClick={stopCamera} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all shadow-2xl">
                           <X size={20} />
                        </button>
                      </div>
                    )}

                    {scannedStatus === "success" && (
                      <div className="py-10">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-100 rounded-full" />
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                              <ShieldCheck size={48} />
                           </motion.div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">ĐIỂM DANH THÀNH CÔNG!</h2>
                        <p className="text-slate-400 mb-10 font-bold text-sm uppercase tracking-widest">Hệ thống đã ghi nhận sự tham gia của bạn</p>
                        <button onClick={() => setScannedStatus(null)} className="px-10 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto">
                           <RefreshCw size={16} /> QUÉT LẠI MÃ KHÁC
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      </main>

      {!isLecturerView && <Footer />}

      {/* MODAL PHÓNG TO (FULL SCREEN) */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 bg-white/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setIsZoomed(false)} 
              className="absolute top-10 right-10 p-5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 shadow-sm transition-all"
            >
              <X size={32} />
            </button>
            <motion.div 
              initial={{ scale: 0.7, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 50 }} 
              className="bg-white p-16 rounded-[5rem] shadow-[0_64px_128px_-24px_rgba(0,0,0,0.1)] border-12 border-slate-50"
            >
              <QRCode value={qrValue || "initial"} size={480} level="H" />
            </motion.div>
            <h3 className="mt-16 text-4xl font-black text-slate-900 tracking-tighter uppercase">Quét để điểm danh</h3>
            <div className="mt-6 flex items-center gap-4 text-indigo-600 font-black text-2xl">
               <span className="w-3 h-3 bg-indigo-600 rounded-full animate-ping" />
               MÃ MỚI SAU {timeLeft} GIÂY
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePage;