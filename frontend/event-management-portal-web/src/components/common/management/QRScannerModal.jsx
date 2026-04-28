import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'framer-motion';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const requestRef = useRef();
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      stopCamera();
      // Chờ một chút để trình duyệt giải phóng camera hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 500));

      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      if (err.name === 'NotReadableError') {
        setError("Camera đang bận hoặc chưa sẵn sàng. Vui lòng thử lại sau giây lát.");
      } else {
        setError("Không thể truy cập camera. Vui lòng thử lại.");
      }
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsScanning(false);
  };

  const scan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        onScanSuccess(code.data);
        return; // Dừng scan khi thành công
      }
    }
    requestRef.current = requestAnimationFrame(scan);
  };

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMounted) startCamera();
      }, 300);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isScanning) {
      requestRef.current = requestAnimationFrame(scan);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Quét mã vé sự kiện</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={startCamera}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Thử lại
              </button>
            </div>
          ) : (
            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden border-4 border-slate-100 shadow-inner">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay frames */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />

                  {/* Scanning line animation */}
                  <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                  />
                </div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                  Đang quét mã...
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng đưa mã QR trên vé của người tham gia vào khung hình camera để tự động thực hiện điểm danh.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScannerModal;
