import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  X,
  Smartphone,
  Camera,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import jsQR from "jsqr";

import { useEvents } from "../../context/EventContext";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useLanguage } from "../../context/LanguageContext";

const AttendancePage = () => {
  const location = useLocation();
  const isLecturerView =
    location.pathname.includes("/lecturer");

  const { events } = useEvents();
  const { t } = useLanguage();

  const [scanning, setScanning] =
    useState(false);
  const [scannedStatus, setScannedStatus] =
    useState(null);
  const [isProcessing, setIsProcessing] =
    useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [stream, setStream] =
    useState(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "environment",
            },
          }
        );

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject =
          mediaStream;

        videoRef.current.setAttribute(
          "playsinline",
          true
        );
      }

      setScanning(true);
      setScannedStatus(null);

      videoRef.current.onloadedmetadata =
        () => {
          scanIntervalRef.current =
            setInterval(
              scanQRCode,
              500
            );
        };
    } catch (err) {
      toast.error(
        t("camera_access_error")
      );
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(
        scanIntervalRef.current
      );

      scanIntervalRef.current = null;
    }

    if (stream) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      setStream(null);
    }

    setScanning(false);
  };

  const scanQRCode = () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      isProcessing
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video.readyState !==
      video.HAVE_ENOUGH_DATA
    )
      return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const code = jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts:
          "dontInvert",
      }
    );

    if (code) {
      handleQRDetected(code.data);
    }
  };

  const handleQRDetected = async (
    qrData
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);
    stopCamera();

    try {
      let token = qrData;

      try {
        const parsed =
          JSON.parse(qrData);

        token =
          parsed.qrToken ||
          parsed.token ||
          qrData;
      } catch (e) { }

      await events.checkIn(token);

      setScannedStatus("success");

      toast.success(
        t("checkin_success_toast")
      );
    } catch (error) {
      const msg =
        error.response?.data
          ?.message ||
        t("invalid_or_used_qr");

      toast.error(msg);

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
                    {t("auto_checkin")}
                  </h2>

                  <p className="text-xs text-slate-400">
                    QR Scanner
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                {t("scanner_desc")}
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
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />

                  {/* Idle */}
                  {!scanning &&
                    !scannedStatus && (
                      <div>
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                          <Smartphone className="w-12 h-12 text-[#1E40AF]" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {t(
                            "ready_to_checkin"
                          )}
                        </h2>

                        <p className="text-sm text-slate-400 mb-8">
                          {t(
                            "scanner_desc"
                          )}
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
                          {t(
                            "open_camera"
                          )}
                        </button>
                      </div>
                    )}

                  {/* Scanning */}
                  {scanning && (
                    <div>
                      <div className="relative max-w-[380px] aspect-square mx-auto rounded-3xl overflow-hidden bg-black border-4 border-slate-100 shadow-lg">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />

                        {/* Frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-60 h-60 border-2 border-white rounded-2xl relative">
                            <motion.div
                              animate={{
                                top: [
                                  "0%",
                                  "100%",
                                  "0%",
                                ],
                              }}
                              transition={{
                                duration: 2,
                                repeat:
                                  Infinity,
                              }}
                              className="absolute left-0 right-0 h-1 bg-blue-400 shadow-lg"
                            />
                          </div>
                        </div>

                        <button
                          onClick={
                            stopCamera
                          }
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <p className="mt-5 text-sm text-slate-500">
                        {t(
                          "scanner_desc"
                        )}
                      </p>
                    </div>
                  )}

                  {/* Success */}
                  {scannedStatus ===
                    "success" && (
                      <div>
                        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                          <ShieldCheck className="w-12 h-12 text-emerald-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {t(
                            "scanning_success"
                          )}
                        </h2>

                        <p className="text-sm text-slate-400 mb-8">
                          {t(
                            "confirmed_presence"
                          )}
                        </p>

                        <button
                          onClick={
                            startCamera
                          }
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
                          {t("scan_next")}
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
                          {t(
                            "scanning_error"
                          )}
                        </h2>

                        <p className="text-sm text-slate-400 mb-8">
                          {t(
                            "invalid_or_used_qr"
                          )}
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
                          {t(
                            "try_again_btn"
                          )}
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
