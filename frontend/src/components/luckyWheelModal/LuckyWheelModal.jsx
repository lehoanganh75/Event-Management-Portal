import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const prizes = [
  "50 điểm",
  "Chúc may mắn",
  "100 điểm",
  "Vé tham dự",
  "Quà bí mật",
  "Thêm lượt",
];

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#FF8B94",
  "#C7CEEA",
];

const LuckyWheelModal = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  // 🔊 ÂM THANH TICK
  const tickSound = useRef(null);
  const lastTickIndex = useRef(null);

  useEffect(() => {
    tickSound.current = new Audio("/tick.mp3");
  }, []);

  // 🎨 VẼ VÒNG QUAY
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const arc = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, size, size);

    prizes.forEach((text, i) => {
      const start = angle + i * arc;
      const end = start + arc;

      // Nan quạt
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, start, end);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      // ✍️ TEXT CĂN GIỮA & THẲNG
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + arc / 2);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px sans-serif";

      // Đẩy chữ ra giữa nan
      ctx.translate(center - 60, 0);
      ctx.rotate(Math.PI / 2); // xoay chữ đứng thẳng

      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  }, [angle]);

  // 🎯 QUAY
  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    const arcDeg = 360 / prizes.length;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const spinAngle = 360 * 8 + randomIndex * arcDeg + arcDeg / 2;

    const start = performance.now();
    const duration = 4500;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentAngle = (spinAngle * easeOut * Math.PI) / 180;
      setAngle(currentAngle);

      // 🔊 TICK TICK THEO Ô
      const arc = (2 * Math.PI) / prizes.length;
      let a = currentAngle % (2 * Math.PI);
      if (a < 0) a += 2 * Math.PI;

      const tickIndex = Math.floor((a + Math.PI / 2) / arc);

      if (lastTickIndex.current !== tickIndex) {
        lastTickIndex.current = tickIndex;
        tickSound.current?.play();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);

        // 🎁 TÍNH Ô TRÚNG CHUẨN
        let finalAngle = currentAngle % (2 * Math.PI);
        if (finalAngle < 0) finalAngle += 2 * Math.PI;

        const adjustedAngle = finalAngle + Math.PI / 2;
        let index = Math.floor(adjustedAngle / arc);
        index = prizes.length - index - 1;
        if (index < 0) index += prizes.length;

        setResult(prizes[index]);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-[#2D1B69] rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all flex items-center justify-center z-50"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* LEFT */}
          <div className="text-white space-y-6 text-center lg:text-left">
            <div>
              <span className="inline-block bg-yellow-400 text-[#2D1B69] px-4 py-1 rounded-full text-xs font-black tracking-widest mb-4">
                MINIGAME
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Vòng Quay <br />
                <span className="text-yellow-400">May Mắn</span>
              </h2>
            </div>

            <p className="text-blue-100/80 text-lg max-w-md mx-auto lg:mx-0">
              Tham gia check-in sự kiện để nhận lượt quay miễn phí.
            </p>

            <p className="text-blue-100/80 text-lg">
              Số điểm hiện có: 100 điểm
            </p>

            {/* 🎁 HIỂN THỊ KẾT QUẢ */}
            {result && (
              <div className="mt-6 bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-4">
                <div className="text-yellow-300 font-bold mb-1">
                  🎉 Bạn trúng:
                </div>
                <div className="text-2xl font-black text-yellow-400">
                  {result}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex justify-center relative">
            {/* Kim */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30">
              <div
                className="w-10 h-12 bg-linear-to-b from-yellow-300 via-yellow-400 to-yellow-500"
                style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
              />
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={350}
                height={350}
                className="rounded-full border-10 border-yellow-400 shadow-lg bg-[#1e1247]"
              />

              <button
                onClick={spin}
                disabled={spinning}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-24 h-24 rounded-full z-40 bg-yellow-400 
                  font-black text-[#2D1B69] text-lg
                  ${spinning ? "opacity-70 cursor-not-allowed" : "hover:scale-110"}
                `}
              >
                {spinning ? "" : "QUAY"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelModal;
