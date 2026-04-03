import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, ShieldCheck, X, Smartphone, Camera, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import jsQR from "jsqr";
// SỬA: Import eventApi từ file gộp trung tâm
import { eventApi } from "../../api/eventApi";

const AttendancePage = () => {
  const location = useLocation();
  const isLecturerView = location.pathname.includes("/lecturer");

  const [scanning, setScanning] = useState(false);
  const [scannedStatus, setScannedStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Cleanup camera khi unmount component
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // --- LOGIC QUÉT MÃ ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute("playsinline", true);
      }
      setScanning(true);
      setScannedStatus(null);

      // Đợi metadata tải xong mới bắt đầu quét
      videoRef.current.onloadedmetadata = () => {
        scanIntervalRef.current = setInterval(scanQRCode, 500);
      };
    } catch (err) {
      toast.error("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      handleQRDetected(code.data);
    }
  };

  const handleQRDetected = async (qrData) => {
    if (isProcessing) return;
    setIsProcessing(true);

    stopCamera(); // Dừng camera ngay khi tìm thấy mã

    try {
      let token = qrData;
      // Thử parse nếu qrData là một JSON object string
      try {
        const parsed = JSON.parse(qrData);
        token = parsed.qrToken || parsed.token || qrData;
      } catch (e) {
        // Giữ nguyên qrData nếu không phải JSON
      }

      // SỬA: Gọi API thông qua eventApi object đã gộp
      // axiosClient bên trong sẽ tự đính kèm Token của quản trị viên thực hiện check-in
      await eventApi.registrations.checkIn(token);
      
      setScannedStatus("success");
      toast.success("Check-in thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || "Mã QR không hợp lệ hoặc đã check-in!";
      toast.error(msg);
      setScannedStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isLecturerView ? 'bg-transparent' : 'bg-slate-50'}`}>
      {!isLecturerView && <Header />}
      
      <main className={`grow container mx-auto px-4 ${isLecturerView ? 'py-0' : 'py-8'} max-w-6xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT THÔNG TIN */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Hệ thống điểm danh</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Dành cho Ban tổ chức</p>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed">
                Sử dụng camera để quét mã QR trên điện thoại của người tham dự. 
                Hệ thống sẽ tự động xác thực và ghi nhận thời gian tham gia sự kiện.
              </p>
            </div>
          </motion.div>

          {/* CỘT TÁC VỤ CHÍNH */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-white text-center min-h-145 flex flex-col justify-center relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                <motion.div key={scanning ? "scanning" : scannedStatus || "idle"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Giao diện chờ quét */}
                  {!scanning && !scannedStatus && (
                    <div className="py-10">
                      <div className="w-24 h-24 bg-blue-50 rounded-4xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-inner">
                        <Smartphone className="text-blue-600 w-12 h-12 -rotate-12" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mb-4">Quét QR Check-in</h2>
                      <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm font-medium">Bấm nút bên dưới để mở camera và bắt đầu điểm danh sinh viên.</p>
                      <button onClick={startCamera} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                        <Camera size={20} /> BẮT ĐẦU QUÉT
                      </button>
                    </div>
                  )}
                  
                  {/* Giao diện đang quét */}
                  {scanning && (
                    <div className="relative aspect-square max-w-100 mx-auto bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white/40 rounded-3xl relative">
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                          <motion.div 
                            className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_#3b82f6]"
                            animate={{ top: ['5%', '95%', '5%'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                      <button onClick={stopCamera} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all shadow-2xl">
                         <X size={20} />
                      </button>
                    </div>
                  )}

                  {/* Kết quả thành công */}
                  {scannedStatus === "success" && (
                    <div className="py-10">
                      <div className="relative w-24 h-24 mx-auto mb-8">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-100 rounded-full" />
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                          <ShieldCheck size={48} />
                        </motion.div>
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">ĐIỂM DANH THÀNH CÔNG!</h2>
                      <p className="text-slate-400 mb-10 font-bold text-sm uppercase tracking-widest">Dữ liệu đã được cập nhật vào hệ thống</p>
                      <button onClick={startCamera} className="px-10 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto">
                         <RefreshCw size={16} /> QUÉT MÃ TIẾP THEO
                      </button>
                    </div>
                  )}
                  
                  {/* Kết quả lỗi */}
                  {scannedStatus === "error" && (
                    <div className="py-10">
                      <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <X size={48} className="text-rose-500" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2">LỖI XÁC THỰC!</h2>
                      <p className="text-slate-400 mb-10 font-bold text-sm">Mã QR không hợp lệ, đã hết hạn hoặc sinh viên chưa đăng ký.</p>
                      <button onClick={startCamera} className="px-10 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto">
                         <RefreshCw size={16} /> THỬ LẠI
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {!isLecturerView && <Footer />}
    </div>
  );
};

export default AttendancePage;