import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  CheckCircle, QrCode, Camera, X, AlertCircle, 
  Smartphone, CalendarCheck, Clock, MapPin, RefreshCw 
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";

const AttendancePage = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedEvent, setScannedEvent] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null); // Fixed type syntax
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const mockEventData = {
    eventPostId: "123",
    title: "Hội thảo Khoa học: AI và Machine Learning",
    eventStartDateTime: "2025-02-10T08:00:00",
    eventEndDateTime: "2025-02-10T11:30:00",
    attendanceStartTime: "2025-02-10T07:45:00",
    location: "Hội trường A",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setScanning(false);
  }, [stream]);

  const handleQRScanned = useCallback(async (qrCode) => {
    console.log("QR Code detected:", qrCode);
    stopCamera();

    const checkingToast = toast.info("Đang xác thực và điểm danh...", { autoClose: false });

    setTimeout(() => {
      const isOnTime = Math.random() > 0.3;
      const status = isOnTime ? "success" : "late";

      setScannedEvent(mockEventData);
      setCheckInStatus(status);

      toast.update(checkingToast, {
        render: isOnTime ? "Điểm danh đúng giờ!" : "Điểm danh muộn!",
        type: isOnTime ? "success" : "warning",
        autoClose: 3000,
        isLoading: false,
      });
    }, 1500);
  }, [stopCamera]); // Removed mockEventData from deps to avoid re-renders

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setScanning(true);
    } catch {
      toast.error("Không thể truy cập camera. Vui lòng cấp quyền camera.");
    }
  };

  // Trigger fake scan when camera is "active"
  useEffect(() => {
    let timer;
    if (scanning) {
      timer = setTimeout(() => {
        handleQRScanned("EVENT_QR_CODE_123");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [scanning, handleQRScanned]);

  const handleReset = () => {
    setScannedEvent(null);
    setCheckInStatus(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12"> {/* Changed bg for better contrast */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <QrCode className="w-9 h-9 text-blue-600" />
            Điểm danh QR
          </h1>
        </header>

        {/* Action Area */}
        <main>
          {!scanning && !scannedEvent && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center"
            >
              <Smartphone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">Sẵn sàng điểm danh?</h2>
              <button
                onClick={startCamera}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
              >
                Bắt đầu Quét mã
              </button>
            </motion.div>
          )}

          {scanning && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl bg-black aspect-video shadow-2xl"
             >
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-70" />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-3xl animate-pulse" />
                    <motion.div 
                      className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>

                <button 
                  onClick={stopCamera}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition"
                >
                  <X size={24} />
                </button>
             </motion.div>
          )}

          {scannedEvent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
            >
              <div className={`p-6 text-center text-white font-bold ${checkInStatus === 'success' ? 'bg-green-500' : 'bg-amber-500'}`}>
                {checkInStatus === 'success' ? 'ĐIỂM DANH THÀNH CÔNG' : 'ĐIỂM DANH MUỘN'}
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <img src={scannedEvent.coverImage} className="w-full md:w-48 h-32 object-cover rounded-xl" alt="Event" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{scannedEvent.title}</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2"><MapPin size={18} /> {scannedEvent.location}</div>
                      <div className="flex items-center gap-2"><Clock size={18} /> {format(new Date(), "HH:mm:ss - dd/MM/yyyy")}</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleReset}
                  className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  <RefreshCw size={20} /> Quét mã khác
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendancePage;