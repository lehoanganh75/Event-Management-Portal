import { X, Gift, CheckCircle, AlertCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const defaultColors = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94", "#C7CEEA",
  "#95E1D3", "#F38181", "#B8E994", "#F8C291"
];

const LuckyWheelModal = ({ onClose, register, luckDrawId }) => {
  const canvasRef = useRef(null);
  const [luckyDrawData, setLuckyDrawData] = useState(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quản lý thông báo
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const tickSound = useRef(null);
  const lastTickIndex = useRef(null);

  useEffect(() => {
    tickSound.current = new Audio("/tick.mp3");
  }, []);

  useEffect(() => {
    const fetchLuckyDraw = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${import.meta.env.VITE_DRAW_API_URL || API_URL}/lucky-draws/${luckDrawId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLuckyDrawData(res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin vòng quay:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (luckDrawId) fetchLuckyDraw();
  }, [luckDrawId]);

  useEffect(() => {
    if (!luckyDrawData?.prizes?.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const currentPrizes = luckyDrawData.prizes;
    const arc = (2 * Math.PI) / currentPrizes.length;

    ctx.clearRect(0, 0, size, size);
    currentPrizes.forEach((prize, i) => {
      const start = angle + i * arc;
      const end = start + arc;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, start, end);
      ctx.fillStyle = defaultColors[i % defaultColors.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.translate(center - 70, 0);
      ctx.rotate(Math.PI / 2);
      const text = prize.name.length > 15 ? prize.name.substring(0, 12) + "..." : prize.name;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  }, [angle, luckyDrawData]);

  const spin = async () => {
    if (spinning || !luckyDrawData?.prizes) return;

    try {
      const token = localStorage.getItem("accessToken");
      
      // GỌI BACKEND
      const res = await axios.post(
        `${import.meta.env.VITE_DRAW_API_URL || API_URL}/lucky-draws/${luckDrawId}/spin`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const winData = res.data;
      const currentPrizes = luckyDrawData.prizes;
      const numPrizes = currentPrizes.length;
      const arcDeg = 360 / numPrizes;

      let winningIndex = -1;
      if (winData.prize) {
        winningIndex = currentPrizes.findIndex(p => p.id === winData.prize.id);
      } else {
        winningIndex = currentPrizes.findIndex(p => p.name.toLowerCase().includes("may mắn"));
        if (winningIndex === -1) winningIndex = 0; 
      }

      setSpinning(true);
      setResult(null);

      const rotationToPrize = (numPrizes - winningIndex) * arcDeg - (arcDeg / 2);
      const totalRotation = (360 * 10) + rotationToPrize + 270; 

      const start = performance.now();
      const duration = 5000; 

      const animate = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentRotation = totalRotation * easeOut;
        setAngle((currentRotation * Math.PI) / 180);

        const tickIndex = Math.floor((currentRotation % 360) / arcDeg);
        if (lastTickIndex.current !== tickIndex) {
          lastTickIndex.current = tickIndex;
          if (tickSound.current) {
            tickSound.current.currentTime = 0;
            tickSound.current.play().catch(() => {});
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setSpinning(false);
          setResult(winData.message);
        }
      };
      requestAnimationFrame(animate);

    } catch (error) {
      console.error("Lỗi quay thưởng:", error);
      // LẤY MESSAGE TỪ BACKEND TRẢ VỀ (IllegalArgumentException)
      const errorMsg = error.response?.data?.message || "Hệ thống bận, vui lòng thử lại!";
      showNotification(errorMsg, "error");
    }
  };

  if (isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* THÔNG BÁO LỖI (TOAST) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 20 }} 
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-0 z-[110] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${
              toast.type === "success" ? "bg-emerald-500 border-emerald-400" : "bg-rose-500 border-rose-400"
            } text-white font-bold`}
          >
            {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-4xl bg-[#2D1B69] rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all flex items-center justify-center z-50">
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white space-y-6 text-center lg:text-left">
            <div>
              <span className="inline-block bg-yellow-400 text-[#2D1B69] px-4 py-1 rounded-full text-xs font-black tracking-widest mb-4 uppercase">
                {luckyDrawData?.title || "MINIGAME"}
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Vòng Quay <br /> <span className="text-yellow-400">May Mắn</span>
              </h2>
            </div>
            <p className="text-blue-100/80 text-lg">
              {luckyDrawData?.description || "Chúc bạn may mắn nhận được phần quà giá trị!"}
            </p>

            {result && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-4">
                <div className="text-yellow-300 font-bold mb-1 italic">🎉 Kết quả:</div>
                <div className="text-2xl font-black text-yellow-400 uppercase tracking-wide">{result}</div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30">
              <div className="w-10 h-12 bg-linear-to-b from-yellow-300 via-yellow-400 to-yellow-500" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
            </div>
            <div className="relative">
              <canvas ref={canvasRef} width={350} height={350} className="rounded-full border-10 border-yellow-400 shadow-2xl bg-[#1e1247]" />
              <button
                onClick={spin}
                disabled={spinning || !luckyDrawData?.prizes}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full z-40 bg-yellow-400 font-black text-[#2D1B69] text-lg shadow-inner transition-all ${spinning ? "opacity-50" : "hover:scale-110 active:scale-95"}`}
              >
                {spinning ? "..." : "QUAY"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelModal;