import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Flag, Timer, Gift, Users, Cloud, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import luckyDrawService from '../../services/luckyDrawService';
import { showToast } from '../../utils/toast';

/* ================= DUCK COMPONENT ================= */
const DuckIcon = ({ color = "#FFD700", name = "", isWinner = false, isRacing = false, currentSpeed = 0, size = 50 }) => {
    const tilt = isRacing ? Math.min(currentSpeed * 2, 10) : 0;
    const labelOffset = size < 40 ? "-top-6" : size < 50 ? "-top-7" : "-top-8";
    const labelTextSize = size < 40 ? "text-[7px]" : size < 50 ? "text-[8px]" : "text-[9px]";
    const labelPadding = size < 40 ? "px-1.5 py-0.5" : size < 50 ? "px-2 py-0.5" : "px-3 py-1";

    return (
        <div className="relative flex flex-col items-center select-none" style={{ width: size }}>
            <div className={`absolute ${labelOffset} ${labelPadding} bg-slate-950/20 rounded-md pointer-events-none z-30`}>
                <span className={`${labelTextSize} font-extrabold text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>{name}</span>
            </div>

            <motion.div
                animate={isRacing ? {
                    rotate: [tilt, tilt - 4, tilt + 4, tilt],
                    y: [0, -3, 1, 0]
                } : {}}
                transition={isRacing ? { repeat: Infinity, duration: 0.15, ease: "linear" } : { duration: 0.4 }}
                className="relative"
            >
                {isRacing && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-white rounded-full blur-sm -z-10"
                    />
                )}

                <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
                    <path d="M10 60C10 80 30 90 50 90C70 90 90 80 90 60C90 40 70 30 50 30C30 30 10 40 10 60Z" fill={color} />
                    <circle cx="75" cy="40" r="22" fill={color} />
                    <path d="M92 40L108 45L92 50V40Z" fill="#FF4500" />
                    <circle cx="82" cy="35" r="5" fill="white" />
                    <circle cx="84" cy="35" r="2.5" fill="black" />
                    <path d="M30 65C30 65 40 55 55 55C70 55 75 65 75 65" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
            </motion.div>
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */
const DuckRaceLuckyDraw = ({
    isOpen,
    onClose,
    campaignTitle = "Duck Race Championship",
    luckyDrawId,
    onFinish
}) => {
    const [phase, setPhase] = useState('READY');
    const [racers, setRacers] = useState([]);
    const [winner, setWinner] = useState(null);
    const [selectedPrizeId, setSelectedPrizeId] = useState("");
    const [currentPrizes, setCurrentPrizes] = useState([]);
    const [drawResults, setDrawResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [raceDuration, setRaceDuration] = useState(8000); // Mặc định 8 giây
    const [autoClose, setAutoClose] = useState(false); // Tự động đóng khi xong
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(null); // ID của kết quả đang cập nhật
    const [timeLeft, setTimeLeft] = useState(0); // Thời gian còn lại (ms)
    const [showResults, setShowResults] = useState(true); // Hiển thị bảng vàng

    const racersRef = useRef([]);
    const winningIdRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (!isOpen || !luckyDrawId) return;
        setLoading(true);
        try {
            console.log("Đang tải dữ liệu đua vịt cho campaign:", luckyDrawId);
            const res = await luckyDrawService.getById(luckyDrawId);
            const data = res.data;

            if (data) {
                setCurrentPrizes(data.prizes || []);
                const availablePrizes = (data.prizes || []).filter(p => p.remainingQuantity > 0);
                if (availablePrizes.length > 0 && !selectedPrizeId) {
                    setSelectedPrizeId(availablePrizes[0].id);
                }

                const winnersIds = new Set((data.results || []).map(r => r.winner?.id || r.participantAccountId));
                setDrawResults(data.results || []);

                const eligibleRacers = (data.entries || [])
                    .filter(entry => entry.status === 'VALID')
                    .map(entry => ({
                        id: entry.profile?.id || entry.userProfileId,
                        name: entry.profile?.fullName || "Người dùng",
                        color: ["#FFD700", "#FF4757", "#2ED573", "#1E90FF", "#FFA502", "#A29BFE", "#E84393"][Math.floor(Math.random() * 7)],
                        progress: 0,
                        speed: 0
                    }))
                    .filter(racer => !winnersIds.has(racer.id));

                console.log("Danh sách vận động viên hợp lệ:", eligibleRacers.length);
                setRacers(eligibleRacers);
                racersRef.current = eligibleRacers;
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu đua vịt:", err);
            showToast("Không thể tải dữ liệu đường đua", "error");
        } finally {
            setLoading(false);
        }
    }, [isOpen, luckyDrawId, selectedPrizeId]);

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen, fetchData]);

    const startRace = async () => {
        if (!selectedPrizeId) return showToast("Vui lòng chọn giải thưởng trước!", "error");

        if (racers.length === 0) {
            showToast("Không còn người chơi hợp lệ để tham gia đua", "info");
            setTimeout(() => {
                onClose();
            }, 1500);
            return;
        }

        console.log("Bắt đầu quay số cho giải thưởng:", selectedPrizeId);
        setPhase('STARTING'); // Chuyển sang trạng thái chuẩn bị để báo hiệu người dùng

        try {
            // 1. Gọi API bốc thăm trước
            const spinRes = await luckyDrawService.adminSpin(luckyDrawId, selectedPrizeId);
            const winnerDataFromApi = spinRes.data?.winner || spinRes.data?.participant;
            const realWinnerId = winnerDataFromApi?.id || spinRes.data?.participantAccountId;

            console.log("Kết quả từ API - Người thắng:", realWinnerId);

            if (!realWinnerId) {
                throw new Error("Không xác định được người thắng từ API");
            }

            // Kiểm tra xem người thắng có trong danh sách đua không
            const exists = racersRef.current.some(r => r.id === realWinnerId);
            if (!exists) {
                console.warn("Người thắng không nằm trong danh sách racers hiện tại. Đang cập nhật lại...");
            }

            winningIdRef.current = realWinnerId;
            setPhase('RACING');
            setWinner(null);

            let duration = raceDuration;
            let start = Date.now();
            setTimeLeft(duration);

            const frame = () => {
                const now = Date.now();
                const elapsed = now - start;
                const p = Math.min(elapsed / duration, 1);

                setTimeLeft(Math.max(0, duration - elapsed));

                racersRef.current = racersRef.current.map(r => {
                    const isRealWinner = r.id === winningIdRef.current;
                    let targetProgress;

                    if (p < 0.85) {
                        // Giai đoạn chạy chung: ngẫu nhiên trong khoảng 0-80%
                        // Dùng seed cố định dựa trên id để vịt không bị giật
                        const seed = r.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                        targetProgress = p * (75 + (seed % 15));
                    } else {
                        // Giai đoạn nước rút
                        if (isRealWinner) {
                            targetProgress = 80 + (p - 0.85) / 0.15 * 20; // Tiến tới 100
                        } else {
                            const seed = r.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                            targetProgress = 80 + (seed % 10); // Dừng lại ở khoảng 80-90
                        }
                    }

                    return { ...r, progress: Math.min(targetProgress, isRealWinner ? 100 : 95), speed: 5 + Math.random() * 10 };
                });

                setRacers([...racersRef.current]);

                if (p < 1) {
                    requestAnimationFrame(frame);
                } else {
                    const finalWinner = racersRef.current.find(r => r.id === winningIdRef.current);
                    setWinner(finalWinner || { name: winnerDataFromApi?.fullName || "Người thắng ẩn danh" });
                    setPhase('FINISHED');
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

                    // Tự động đánh dấu đã nhận quà (auto = 1)
                    const resultId = spinRes.data?.id;
                    if (resultId) {
                        luckyDrawService.updateClaimed(resultId, true)
                            .then(() => fetchData())
                            .catch(err => {
                                console.error("Lỗi auto-claim:", err);
                                fetchData();
                            });
                    } else {
                        fetchData();
                    }

                    // Gọi callback nếu có
                    if (onFinish) {
                        onFinish(finalWinner || { name: winnerDataFromApi?.fullName || "Người thắng ẩn danh" });
                    }

                    // Tự động đóng nếu được chọn
                    if (autoClose) {
                        setTimeout(() => {
                            onClose();
                        }, 2500); // Đợi 2.5s để người dùng thấy hiệu ứng pháo hoa
                    }
                    setTimeLeft(0);
                }
            };

            requestAnimationFrame(frame);
        } catch (err) {
            console.error("Lỗi khi bắt đầu đua:", err);
            setPhase('READY');
            showToast(err.response?.data?.message || "Lỗi hệ thống khi quay số", "error");
        }
    };

    const handleToggleClaimed = async (resultId, currentStatus) => {
        setIsUpdatingStatus(resultId);
        try {
            await luckyDrawService.updateClaimed(resultId, !currentStatus);
            showToast("Cập nhật trạng thái nhận quà thành công", "success");
            fetchData(); // Tải lại dữ liệu để đồng bộ
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            showToast("Không thể cập nhật trạng thái", "error");
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-sky-950/80 backdrop-blur-sm p-2 sm:p-6">
            <div className="relative w-full max-w-6xl bg-sky-400 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-[95vh] border-8 border-white/20">

                {/* SKY BACKGROUND */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-10 left-10 opacity-40"><Cloud size={100} className="text-white fill-white" /></div>
                    <div className="absolute top-40 right-20 opacity-30"><Cloud size={80} className="text-white fill-white" /></div>
                    <div className="absolute top-80 left-1/4 opacity-20"><Cloud size={120} className="text-white fill-white" /></div>
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900/40 to-transparent clip-cave" />
                </div>

                {/* Header */}
                <div className="relative z-10 p-4 flex items-center justify-between mx-6 mt-6 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30">
                    <div className="flex items-center gap-3 px-2">
                        <Trophy className="text-amber-300 drop-shadow-md" size={24} />
                        <h2 className="text-xl font-black text-white uppercase drop-shadow-md tracking-tight">{campaignTitle}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResults(!showResults)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                                ${showResults
                                    ? 'bg-amber-400 text-amber-900 border-amber-500 shadow-lg'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                        >
                            <Trophy size={16} />
                            {showResults ? 'Ẩn bảng vàng' : 'Hiện bảng vàng'}
                        </button>
                        <button onClick={onClose} className="p-2 text-white/80 hover:text-white transition-all bg-white/10 rounded-2xl">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* TIMER OVERLAY */}
                {phase === 'RACING' && (
                    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-black/40 backdrop-blur-xl border-4 border-white/30 px-8 py-4 rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Timer size={24} className="text-amber-900" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] leading-none mb-1">Thời gian còn lại</span>
                                <span className="text-4xl font-black text-white tabular-nums drop-shadow-lg">
                                    {(timeLeft / 1000).toFixed(1)}<span className="text-lg ml-1 text-white/50">s</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}

                <div className="flex-1 relative z-10 flex flex-col lg:flex-row overflow-hidden mt-4">
                    <div className="flex-1 relative flex flex-col overflow-hidden px-6 pb-6">
                        {/* Shared river playground */}
                        <div className="flex-1 relative bg-gradient-to-b from-sky-400 via-sky-300 to-sky-400 rounded-[2rem] border-4 border-white/20 overflow-hidden shadow-inner">
                            {/* Slanted Checkered Finish Line at 80% */}
                            <div className="absolute left-[80%] top-0 bottom-0 w-16 checkered-line skew-x-[-15deg] z-10 opacity-70 border-l-4 border-r-4 border-white/40 shadow-lg" />
                            
                            {/* River Waves Background lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white border-t border-dashed border-white/30" />
                                <div className="absolute top-2/4 left-0 right-0 h-0.5 bg-white border-t border-dashed border-white/30" />
                                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white border-t border-dashed border-white/30" />
                            </div>

                            {/* River Bank Forest top shadow/vibe */}
                            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-900/10 to-transparent z-10" />

                            <div className="absolute inset-0 p-4">
                                {racers.map((racer, index) => {
                                    // Sizing scale based on total count
                                    const duckSize = racers.length > 40 ? 32 : racers.length > 25 ? 40 : racers.length > 12 ? 48 : 56;
                                    
                                    // Distribute ducks evenly from top to bottom
                                    const topPercent = racers.length > 1 ? (index / (racers.length - 1)) * 74 + 10 : 45;
                                    
                                    // Small deterministic wobble to feel natural and offset
                                    const seed = racer.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                                    const offset = (seed % 8) - 4;
                                    const top = Math.min(88, Math.max(8, topPercent + offset));

                                    return (
                                        <motion.div
                                            key={racer.id}
                                            className="absolute"
                                            style={{
                                                left: `${racer.progress * 0.82}%`,
                                                top: `${top}%`,
                                                zIndex: 20 + Math.floor(top) // overlap lower ducks on top of higher ones
                                            }}
                                            transition={{ type: "spring", damping: 15 }}
                                        >
                                            <DuckIcon
                                                color={racer.color}
                                                name={racer.name}
                                                isRacing={phase === 'RACING'}
                                                currentSpeed={racer.speed}
                                                isWinner={winner?.id === racer.id}
                                                size={duckSize}
                                            />
                                        </motion.div>
                                    );
                                })}

                                {racers.length === 0 && !loading && (
                                    <div className="h-full flex flex-col items-center justify-center text-white/40">
                                        <Users size={64} className="mb-4 opacity-10" />
                                        <p className="font-bold uppercase tracking-widest text-[10px]">Chưa có người đua hoặc mọi người đã trúng giải</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/40 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className="md:col-span-4 flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Giải thưởng</label>
                                    <select
                                        className="w-full h-[52px] px-5 bg-slate-800/50 border border-white/10 rounded-2xl outline-none focus:border-amber-400/50 text-white font-bold transition-all appearance-none cursor-pointer hover:bg-slate-800/80"
                                        value={selectedPrizeId}
                                        onChange={(e) => setSelectedPrizeId(e.target.value)}
                                        disabled={phase !== 'READY'}
                                    >
                                        <option value="" className="text-slate-900">-- Chọn giải thưởng --</option>
                                        {currentPrizes.filter(p => p.remainingQuantity > 0).map(p => (
                                            <option key={p.id} value={p.id} className="text-slate-900">
                                                {p.name} (Còn {p.remainingQuantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Thời gian đua</label>
                                    <select
                                        className="w-full h-[52px] px-5 bg-slate-800/50 border border-white/10 rounded-2xl outline-none focus:border-amber-400/50 text-white font-bold transition-all appearance-none cursor-pointer hover:bg-slate-800/80"
                                        value={raceDuration}
                                        onChange={(e) => setRaceDuration(Number(e.target.value))}
                                        disabled={phase !== 'READY'}
                                    >
                                        <option value={5000} className="text-slate-900">5 Giây</option>
                                        <option value={8000} className="text-slate-900">8 Giây</option>
                                        <option value={15000} className="text-slate-900">15 Giây</option>
                                        <option value={30000} className="text-slate-900">30 Giây</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-2 items-center">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tự động đóng</label>
                                    <button
                                        onClick={() => setAutoClose(!autoClose)}
                                        disabled={phase !== 'READY'}
                                        className={`w-14 h-[52px] rounded-2xl transition-all relative border flex items-center justify-center
                                            ${autoClose ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                                        title={autoClose ? "Đang bật tự động đóng" : "Đang tắt tự động đóng"}
                                    >
                                        <motion.div
                                            animate={autoClose ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Timer size={20} />
                                        </motion.div>
                                    </button>
                                </div>

                                <div className="md:col-span-3">
                                    <button
                                        onClick={startRace}
                                        disabled={phase !== 'READY' || !selectedPrizeId}
                                        className={`w-full h-[52px] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
                                            ${phase !== 'READY'
                                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                                : 'bg-amber-400 text-amber-950 hover:bg-amber-300 hover:scale-[1.02] active:scale-95 shadow-amber-900/20'}`}
                                    >
                                        {phase === 'STARTING' ? <Timer className="animate-spin" size={18} /> : <Zap size={18} />}
                                        {phase === 'READY' ? 'Bắt đầu đua' : phase === 'STARTING' ? 'Chuẩn bị...' : 'Đang đua...'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showResults && (
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-full lg:w-72 bg-black/10 backdrop-blur-lg border-l border-white/10 flex flex-col shrink-0 overflow-hidden"
                            >
                                <div className="p-5 border-b border-white/10">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Trophy size={16} className="text-amber-400" /> Bảng vàng kết quả
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {drawResults.map((res, idx) => (
                                        <div key={res.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-3 group relative">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-400/20 text-amber-300 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-white truncate">{res.winner?.fullName || "Người thắng"}</p>
                                                    <p className="text-[10px] text-white/50 font-bold truncate uppercase tracking-tighter">
                                                        {res.wonPrize?.name || res.prize?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end pt-2 border-t border-white/5">
                                                <div className="flex gap-2 w-full">
                                                    {(res.isClaimed || res.claimed) ? (
                                                        <button
                                                            onClick={() => handleToggleClaimed(res.id, true)}
                                                            disabled={isUpdatingStatus === res.id}
                                                            className="flex-1 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                                        >
                                                            {isUpdatingStatus === res.id ? (
                                                                <Timer size={12} className="animate-spin" />
                                                            ) : (
                                                                <X size={12} />
                                                            )}
                                                            Hủy bỏ nhận quà
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggleClaimed(res.id, false)}
                                                            disabled={isUpdatingStatus === res.id}
                                                            className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                                        >
                                                            {isUpdatingStatus === res.id ? (
                                                                <Timer size={12} className="animate-spin" />
                                                            ) : (
                                                                <Check size={12} />
                                                            )}
                                                            Xác nhận đã nhận
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {drawResults.length === 0 && (
                                        <div className="py-10 text-center">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Chưa có kết quả</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Winner Modal */}
                <AnimatePresence>
                    {phase === 'FINISHED' && winner && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }}
                                className="bg-white p-12 rounded-[3rem] text-center shadow-2xl max-w-sm w-full relative"
                            >
                                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy size={60} className="text-amber-500" />
                                </div>
                                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Người chiến thắng</h4>
                                <h3 className="text-2xl font-black text-slate-800 mb-8">{winner.name}</h3>
                                <button
                                    onClick={() => setPhase('READY')}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    Tiếp tục
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .checkered-line {
                    background-color: #ffffff;
                    background-image: 
                        linear-gradient(45deg, #000 25%, transparent 25%), 
                        linear-gradient(-45deg, #000 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #000 75%), 
                        linear-gradient(-45deg, transparent 75%, #000 75%);
                    background-size: 40px 40px;
                    background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
                }
                .clip-cave {
                    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 80% 80%, 60% 100%, 40% 70%, 20% 90%, 0% 60%);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default DuckRaceLuckyDraw;
