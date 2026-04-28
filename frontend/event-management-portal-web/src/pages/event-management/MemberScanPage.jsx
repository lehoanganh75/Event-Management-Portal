import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, History, Volume2, VolumeX, ArrowLeft, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from "jsqr";
import { toast } from "react-toastify";
import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

const MemberScanPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [sound, setSound] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await events.getEventById(eventId);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch event", err);
      }
    };
    fetchEvent();
  }, [eventId, events]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

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
      setIsScanning(true);
      setResult(null);

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
    setIsScanning(false);
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

    if (code) handleQRDetected(code.data);
  };

  const handleQRDetected = async (qrData) => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopCamera();

    try {
      let token = qrData;
      try {
        const parsed = JSON.parse(qrData);
        token = parsed.qrToken || parsed.token || qrData;
      } catch (e) {}

      const response = await events.checkIn(token, user?.id);
      const checkInData = response.data;
      
      const newResult = {
        success: true,
        name: checkInData.fullName || checkInData.userProfileId || "Người tham gia",
        time: new Date().toLocaleTimeString(),
        message: "Check-in thành công!",
        eventTitle: checkInData.eventTitle,
        avatarUrl: checkInData.avatarUrl
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 5));
      toast.success("Điểm danh thành công!");
      
      if (sound) {
        // play success sound
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Mã QR không hợp lệ hoặc đã check-in!";
      const newResult = {
        success: false,
        name: "Unknown",
        time: new Date().toLocaleTimeString(),
        message: msg
      };
      setResult(newResult);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
            <QrCode size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Máy quét điểm danh</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {event?.currentUserRole?.organizerRole === 'LEADER' ? 'TRƯỞNG BAN' : 
               event?.currentUserRole?.organizerRole === 'COORDINATOR' ? 'ĐIỀU PHỐI VIÊN' : 
               event?.currentUserRole?.organizerRole || "STAFF"} AUTHORIZED
            </p>
          </div>
        </div>
        <button onClick={() => setSound(!sound)} className="p-3 bg-slate-800 rounded-2xl text-slate-400">
          {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      <div className="relative w-full max-w-md aspect-square bg-slate-800 rounded-[3rem] border-4 border-slate-700 overflow-hidden shadow-2xl mb-10">
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isScanning ? (
            <div className="w-full h-full relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                </div>
              </div>
              <button 
                onClick={stopCamera} 
                className="absolute top-4 right-4 p-3 bg-rose-500/80 backdrop-blur-md rounded-2xl text-white shadow-lg shadow-rose-500/20"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button onClick={startCamera} className="flex flex-col items-center gap-6 group">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
                <Camera size={40} />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">Nhấn để bắt đầu quét</p>
            </button>
          )}
        </div>
        
        {/* Animated Scan Line */}
        {isScanning && (
          <motion.div 
            animate={{ top: ['10%', '90%'] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute left-8 right-8 h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-20"
          />
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 ${
              result.success ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white'
            }`}
          >
            <div className="p-1 bg-white/20 rounded-2xl overflow-hidden flex-shrink-0 w-14 h-14">
              {result.avatarUrl ? (
                <img src={result.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {result.success ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight">{result.message}</h2>
              <p className="text-sm font-bold opacity-80">{result.name} • {result.time}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md mt-10">
        <div className="flex items-center gap-2 mb-4 opacity-40">
          <History size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Recent History</h3>
        </div>
        <div className="space-y-3">
          {history.length > 0 ? history.map((item, i) => (
            <div key={i} className="p-4 bg-slate-800/50 rounded-2xl flex justify-between items-center border border-white/5">
              <div className="flex items-center gap-3 text-xs font-bold">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                  {item.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                  <p className="font-black">{item.name}</p>
                  <p className="text-[9px] opacity-40 uppercase">{item.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
            </div>
          )) : (
            <div className="py-10 text-center opacity-20">
               <p className="text-[10px] font-black uppercase tracking-widest">No scans yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberScanPage;
