import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  X,
  Smartphone,
  Camera,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import jsQR from "jsqr";

import { useEvents } from "../../context/EventContext";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useLanguage } from "../../context/LanguageContext";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const AttendancePage = () => {
  const location = useLocation();
  const isLecturerView =
    location.pathname.includes("/lecturer");

  const { events } = useEvents();
  const { t } = useLanguage();

  const [scanning, setScanning] = useState(false);
  const [scannedStatus, setScannedStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInData, setCheckInData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);       // useRef thay vì useState → tránh re-render race condition
  const requestRef = useRef(null);      // requestAnimationFrame thay vì setInterval

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    // Dừng animation frame
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    // Dừng tất cả tracks của stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Xóa srcObject khỏi video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    try {
      // Dừng tracks cũ (KHÔNG gọi stopCamera() vì nó setScanning(false) → video unmount → videoRef null)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setCameraError(null);
      setScannedStatus(null);
      setCheckInData(null);
      // setScanning(true) TRƯỚC → video element mount vào DOM
      setScanning(true);

      // Chờ React render video element xong
      await new Promise(resolve => setTimeout(resolve, 150));

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        // scanning đã true → useEffect sẽ bắt đầu requestAnimationFrame
      }
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
      if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera đang được ứng dụng khác sử dụng. Hãy đóng các tab/ứng dụng khác rồi thử lại.");
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Quyền truy cập camera bị từ chối. Vui lòng cấp quyền camera trong cài đặt trình duyệt.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("Không tìm thấy camera trên thiết bị này.");
      } else {
        setCameraError("Không thể khởi động camera. Vui lòng thử lại.");
      }
    }
  };

  // Scan bằng requestAnimationFrame thay vì setInterval → mượt & chính xác hơn
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      requestRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

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
      return;
    }
    requestRef.current = requestAnimationFrame(scanQRCode);
  };

  // Bắt đầu scan loop khi scanning = true
  useEffect(() => {
    if (scanning) {
      requestRef.current = requestAnimationFrame(scanQRCode);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [scanning]);

  const handleQRDetected = async (qrData) => {
    if (isProcessing) return;

    setIsProcessing(true);
    stopCamera();

    try {
      let token = qrData;
      try {
        const parsed = JSON.parse(qrData);
        token = parsed.qrToken || parsed.token || qrData;
      } catch (e) { }

      const decoded = parseJwt(token);
      let res;
      if (decoded && decoded.isEventToken) {
        res = await events.checkInByEventToken(token);
      } else {
        res = await events.checkIn({ qrToken: token });
      }

      const data = res.data || res;

      if (data.success === false) {
        const errMsg = data.message || "Mã QR không hợp lệ";
        toast.error(errMsg);
        setErrorMessage(errMsg);
        setScannedStatus("error");
      } else {
        setCheckInData(data);
        setScannedStatus("success");
        const studentName = data.profile?.fullName ? `: ${data.profile.fullName}` : "";
        toast.success((data.message || "Điểm danh thành công!") + studentName);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Mã không hợp lệ hoặc đã được sử dụng trước đó.";
      toast.error(msg);
      setErrorMessage(msg);
      setScannedStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isLecturerView
          ? "bg-transparent"
          : "bg-slate-50"
        }`}
    >
      {!isLecturerView && <Header />}

      <main
        className={`grow max-w-6xl mx-auto w-full px-4 ${isLecturerView
            ? "py-0"
            : "py-10"
          }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#1E40AF]" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    {"Check-in tự động"}
                  </h2>

                  <p className="text-xs text-slate-400">
                    QR Scanner
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                {"Đưa mã QR của sinh viên vào khung quét. Hệ thống sẽ đối soát với danh sách đăng ký và ghi nhận điểm danh ngay lập tức."}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    scanning
                      ? "scan"
                      : scannedStatus ||
                      "idle"
                  }
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="w-full text-center"
                >
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video element LUÔN trong DOM (ẩn khi không scan) để videoRef không bao giờ null */}
                  <div className={scanning ? "relative max-w-[400px] aspect-square mx-auto rounded-2xl overflow-hidden bg-black border-4 border-slate-100 shadow-xl" : "hidden"}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay: 4 góc + scan line */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 relative">
                        <div className="absolute inset-0 border-2 border-white/30 rounded-3xl" />
                        <div className="absolute -top-1 -left-1 w-9 h-9 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl" />
                        <div className="absolute -top-1 -right-1 w-9 h-9 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl" />
                        <div className="absolute -bottom-1 -left-1 w-9 h-9 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl" />
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl" />
                        <motion.div
                          animate={{ top: ["0%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                        />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
                        Đang quét mã...
                      </span>
                    </div>

                    {/* Nút đóng */}
                    <button
                      onClick={stopCamera}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500 transition-all border border-white/20"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {scanning && (
                    <p className="mt-5 text-sm text-slate-500 text-center max-w-xs mx-auto">
                      Đưa mã QR vào khung hình để tự động điểm danh
                    </p>
                  )}

                  {/* Camera Error */}
                  {cameraError && (
                    <div className="w-full text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Không thể mở camera</h3>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 rounded-2xl bg-[#1E40AF] hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2 mx-auto"
                      >
                        <RefreshCw size={16} />
                        Thử lại
                      </button>
                    </div>
                  )}

                  {/* Idle */}
                  {!scanning && !scannedStatus && !cameraError && (
                      <div>
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                          <Smartphone className="w-12 h-12 text-[#1E40AF]" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {"Sẵn sàng điểm danh"}
                        </h2>

                        <p className="text-sm text-slate-400 mb-8">
                          {"Đưa mã QR của sinh viên vào khung quét. Hệ thống sẽ đối soát với danh sách đăng ký và ghi nhận điểm danh ngay lập tức."}
                        </p>

                        <button
                          onClick={
                            startCamera
                          }
                          className="
                            px-6 py-3
                            rounded-2xl
                            bg-[#1E40AF]
                            hover:bg-blue-700
                            text-white
                            font-medium
                            transition-all
                            flex items-center gap-2
                            mx-auto
                          "
                        >
                          <Camera size={18} />
                          {"Mở Camera"}
                        </button>
                      </div>
                    )}



                  {/* Success */}
                  {scannedStatus === "success" && (
                    <div>
                      <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                        <ShieldCheck className="w-12 h-12 text-emerald-600" />
                      </div>

                      <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {"THÀNH CÔNG!"}
                      </h2>

                      {checkInData?.profile?.fullName ? (
                        <div className="mb-8 max-w-sm mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left shadow-sm">
                          <p className="text-sm font-semibold text-slate-700">
                            {checkInData.profile.fullName}
                          </p>
                          {checkInData.profile.email && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {checkInData.profile.email}
                            </p>
                          )}
                          <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1">
                            <p className="text-xs text-slate-500">
                              <span className="font-medium text-slate-600">Mã sinh viên:</span> {checkInData.userProfileId}
                            </p>
                            <p className="text-xs text-slate-500">
                              <span className="font-medium text-slate-600">Sự kiện:</span> {checkInData.eventTitle}
                            </p>
                            {checkInData.checkInTime && (
                              <p className="text-xs text-slate-500">
                                <span className="font-medium text-slate-600">Thời gian:</span> {new Date(checkInData.checkInTime).toLocaleString("vi-VN")}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 mb-8">
                          {"Đã xác nhận sự hiện diện của sinh viên"}
                        </p>
                      )}

                      <button
                        onClick={startCamera}
                        className="
                          px-6 py-3
                          rounded-2xl
                          bg-slate-900
                          hover:bg-[#1E40AF]
                          text-white
                          font-medium
                          transition-all
                          flex items-center gap-2
                          mx-auto
                        "
                      >
                        <RefreshCw size={16} />
                        {"Quét mã tiếp theo"}
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {scannedStatus ===
                    "error" && (
                      <div>
                        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
                          <X className="w-12 h-12 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {"LỖI!"}
                        </h2>

                        <p className="text-sm text-slate-400 mb-8">
                          {errorMessage || "Mã không hợp lệ hoặc đã được sử dụng trước đó."}
                        </p>

                        <button
                          onClick={
                            startCamera
                          }
                          className="
                          px-6 py-3
                          rounded-2xl
                          bg-slate-100
                          hover:bg-slate-200
                          text-slate-700
                          font-medium
                          transition-all
                          flex items-center gap-2
                          mx-auto
                        "
                        >
                          <RefreshCw size={16} />
                          {"THỬ LẠI"}
                        </button>
                      </div>
                    )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {!isLecturerView && <Footer />}
    </div>
  );
};

export default AttendancePage;
