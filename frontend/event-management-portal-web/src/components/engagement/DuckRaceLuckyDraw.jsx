import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Waves, Zap, Flag, Timer, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import luckyDrawService from '../../services/luckyDrawService';
import { showToast } from '../../utils/toast';

/* ================= DUCK COMPONENT ================= */
const DuckIcon = ({ color = "#FFD700", name = "", isWinner = false, isRacing = false, currentSpeed = 0 }) => {
    // Độ nghiêng dựa trên vận tốc
    const tilt = isRacing ? Math.min(currentSpeed * 2, 15) : 0;

    return (
        <div className="relative flex flex-col items-center select-none group">
            {/* Name Tag (Always visible and styled) */}
            <div className={`absolute -top-12 px-4 py-1.5 rounded-2xl border shadow-xl transition-all duration-500 whitespace-nowrap z-20 flex items-center gap-2
                ${isWinner ? 'bg-amber-500 border-amber-400 text-white font-black scale-110 shadow-amber-500/50' : 'bg-slate-900/80 border-white/10 text-slate-200 font-bold'}`}>
                <span className="text-[11px] uppercase tracking-wider">{name}</span>
            </div>

            {/* Duck Body */}
            <motion.div
                animate={isRacing ? {
                    rotate: [tilt, tilt - 7, tilt + 7, tilt],
                    y: [0, -5, 3, 0],
                    x: [0, 2, -2, 0]
                } : {}}
                transition={isRacing ? {
                    repeat: Infinity,
                    duration: 0.12,
                    ease: "linear"
                } : { duration: 0.4 }}
                className="relative"
            >
                {/* Speed Trail Effect */}
                {isRacing && currentSpeed > 5 && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-50">
                        <motion.div animate={{ x: [0, -50], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.2 }} className="h-1 w-12 bg-white rounded-full" />
                        <motion.div animate={{ x: [0, -30], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }} className="h-0.5 w-8 bg-white/50 rounded-full" />
                    </div>
                )}

                <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 0.2 }} />
                        </linearGradient>
                    </defs>
                    {/* Main Body */}
                    <path d="M10 60C10 76.5 23.5 90 40 90C56.5 90 70 76.5 70 60C70 43.5 56.5 35 40 35C23.5 35 10 43.5 10 60Z" fill={color} />
                    <path d="M10 60C10 76.5 23.5 90 40 90C56.5 90 70 76.5 70 60C70 43.5 56.5 35 40 35C23.5 35 10 43.5 10 60Z" fill={`url(#grad-${color})`} opacity="0.4" />

                    <motion.g animate={isRacing ? { y: [0, -2, 2, 0] } : {}} transition={{ repeat: Infinity, duration: 0.2 }}>
                        <circle cx="75" cy="40" r="22" fill={color} />
                        <path d="M92 40L108 45L92 50V40Z" fill="#FF4500" />
                        <path d="M92 40L102 43L92 46V40Z" fill="#FF8C00" />
                        <circle cx="82" cy="35" r="5" fill="white" />
                        <circle cx="84" cy="35" r="2.5" fill="black" />
                    </motion.g>

                    <motion.path
                        d="M25 65C25 65 35 55 50 55C65 55 70 65 70 65"
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        animate={isRacing ? { scaleY: [1, 0.5, 1], originY: "65px" } : {}}
                        transition={{ repeat: Infinity, duration: 0.15 }}
                    />
                </svg>

                {/* Turbo Effect */}
                {isRacing && currentSpeed > 8 && (
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0] }} transition={{ repeat: Infinity, duration: 0.2 }} className="absolute -left-4 top-1/2 -translate-y-1/2 text-orange-400">
                        <Zap size={24} fill="currentColor" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */
const DuckRaceLuckyDraw = ({
    isOpen,
    onClose,
    participants = [],
    onSpin,
    campaignTitle = "Duck Race Championship",
    prizes = [],
    luckyDrawId
}) => {
    const [phase, setPhase] = useState('READY'); // READY, STARTING, RACING, FINISHED
    const [racers, setRacers] = useState([]);
    const [winner, setWinner] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [selectedPrizeId, setSelectedPrizeId] = useState("");
    const [currentPrizes, setCurrentPrizes] = useState(prizes);

    const [validUserIds, setValidUserIds] = useState([]);
    const [drawResults, setDrawResults] = useState([]);
    const [showResultsPanel, setShowResultsPanel] = useState(true);

    const racersRef = useRef([]);
    const winningIdRef = useRef(null);
    const idxRef = useRef({});

    const [userEntry, setUserEntry] = useState(null);
    const [userPrize, setUserPrize] = useState(null);
    const [entryLoading, setEntryLoading] = useState(false);

    const DUCK_COLORS = ["#FFD700", "#FF6B6B", "#4DABF7", "#51CF66", "#FCC419", "#FF922B", "#845EF7", "#F06595", "#20C997", "#FA5252"];

    const [raceDuration, setRaceDuration] = useState(15);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef();
    const startTimeRef = useRef();

    // Fetch latest prizes and user's draw entry status when opening
    const fetchLatestAndEntry = async () => {
        if (!isOpen || !luckyDrawId) return;
        setEntryLoading(true);
        try {
            console.log("Fetching lucky draw data for ID:", luckyDrawId);
            const res = await luckyDrawService.getById(luckyDrawId);
            console.log("Lucky Draw data fetched:", res.data);
            if (res.data?.prizes) {
                setCurrentPrizes(res.data.prizes);
                const sorted = [...res.data.prizes].sort((a, b) => b.remainingQuantity - a.remainingQuantity);
                if (sorted.length > 0) {
                    setSelectedPrizeId(sorted[0].id);
                }
            }

            if (res.data?.entries) {
                const validIds = res.data.entries
                    .filter(e => e.status === 'VALID')
                    .map(e => e.userProfileId || e.profile?.id)
                    .filter(Boolean);
                setValidUserIds(validIds);
                console.log("Valid user profile IDs from entries:", validIds);
            }
            if (res.data?.results) {
                setDrawResults(res.data.results);
                console.log("Initial draw results:", res.data.results);
            }

            // Fetch user's draw entry
            console.log("Fetching user's draw entry for luckyDrawId:", luckyDrawId);
            const entryRes = await luckyDrawService.getEntry(luckyDrawId);
            console.log("User's draw entry fetched:", entryRes.data);
            if (entryRes.data) {
                setUserEntry(entryRes.data);

                // If already USED, find what prize was won
                if (entryRes.data.status === 'USED') {
                    console.log("Entry status is USED, fetching all results for campaign:", luckyDrawId);
                    const resultsRes = await luckyDrawService.getResultsByCampaign(luckyDrawId);
                    console.log("Results for campaign fetched:", resultsRes.data);
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const userResult = (resultsRes.data || []).find(r => r.winner?.id === currentUser.id || r.userProfileId === currentUser.id);
                    if (userResult && userResult.wonPrize) {
                        console.log("User matched result:", userResult);
                        setUserPrize(userResult.wonPrize.name);
                    }
                }
            } else {
                setUserEntry(null);
                setUserPrize(null);
            }
        } catch (err) {
            console.error("Fetch entry/prizes error:", err);
            setUserEntry(null);
            setUserPrize(null);
        } finally {
            setEntryLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && luckyDrawId) {
            fetchLatestAndEntry();
        }
    }, [isOpen, luckyDrawId]);

    const handleJoinDraw = async () => {
        try {
            console.log("Submitting join draw request for luckyDrawId:", luckyDrawId);
            const joinRes = await luckyDrawService.joinDraw(luckyDrawId);
            console.log("Join draw response received:", joinRes.data);
            if (joinRes.data) {
                setUserEntry(joinRes.data);
                alert("Tham gia vòng quay thành công!");
            }
        } catch (err) {
            console.error("Join draw error:", err);
            alert(err.response?.data?.message || err.message || "Không thể tham gia vòng quay.");
        }
    };

    const updatePhysics = useCallback(() => {
        if (phase !== 'RACING') return;

        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);

        const currentWinningId = winningIdRef.current;
        let anyFinished = false;
        const progress = Math.min(1, elapsed / raceDuration);

        setRacers(prev => prev.map(racer => {
            if (racer.finished) return racer;

            const isWinner = racer.id === currentWinningId;
            const targetPos = isWinner ? progress * 100 : progress * (90 + (idxRef.current[racer.id] % 5));
            const jitterScale = (1 - progress) * 8;
            const jitter = (Math.random() - 0.5) * jitterScale;

            let newPos = targetPos + jitter;
            if (progress > 0.85 && !isWinner) newPos = Math.min(newPos, 90 + (Math.random() * 5));
            if (progress >= 1 && isWinner) {
                newPos = 100;
                anyFinished = true;
            }

            newPos = Math.max(racer.position, newPos);
            return { ...racer, position: newPos, speed: 1, finished: newPos >= 100 };
        }));

        if (anyFinished || elapsed >= raceDuration) {
            clearInterval(intervalRef.current);
            setTimeout(() => {
                setPhase('FINISHED');
                confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            }, 600);
        }
    }, [phase, raceDuration]);

    useEffect(() => {
        if (participants && participants.length > 0) {
            const idsToUse = (validUserIds && validUserIds.length > 0) ? validUserIds : participants.map(p => p.id || p.accountId);
            const initialRacers = participants
                .filter(p => idsToUse.includes(p.id) || idsToUse.includes(p.accountId))
                .map((p, i) => {
                    idxRef.current[p.id] = i;
                    return {
                        id: p.id,
                        name: p.fullName || p.username || "Anonymous",
                        color: DUCK_COLORS[i % DUCK_COLORS.length],
                        position: 0,
                        speed: 0,
                        finished: false
                    };
                });
            setRacers(initialRacers);
            racersRef.current = initialRacers;
        } else {
            setRacers([]);
            racersRef.current = [];
        }
    }, [participants, validUserIds]);

    useEffect(() => {
        if (phase === 'FINISHED' && winner) {
            setDrawResults(prev => {
                const exists = prev.some(r => r.id === winner.id);
                if (!exists) {
                    return [winner, ...prev];
                }
                return prev;
            });

            const checkAndClose = async () => {
                try {
                    const res = await luckyDrawService.getById(luckyDrawId);

                    if (res.data?.prizes) {
                        setCurrentPrizes(res.data.prizes);
                        const sorted = [...res.data.prizes].sort((a, b) => b.remainingQuantity - a.remainingQuantity);
                        const stillHasSelected = res.data.prizes.find(p => p.id === selectedPrizeId && p.remainingQuantity > 0);
                        if (!stillHasSelected && sorted.length > 0) {
                            setSelectedPrizeId(sorted[0].id);
                        }
                    }

                    const validIds = (res.data?.entries || [])
                        .filter(e => e.status === 'VALID')
                        .map(e => e.userProfileId || e.profile?.id)
                        .filter(Boolean);

                    if (validIds.length === 0) {
                        alert("Không còn người tham gia hợp lệ nào. Kết thúc cuộc đua!");
                        onClose();
                    }
                } catch (err) {
                    console.error("Lỗi khi kiểm tra danh sách người tham gia:", err);
                }
            };
            checkAndClose();
        }
    }, [phase, winner, luckyDrawId, onClose]);

    useEffect(() => {
        if (phase === 'RACING') {
            startTimeRef.current = Date.now();
            setElapsedTime(0);
            intervalRef.current = setInterval(updatePhysics, 50);
        }
        return () => clearInterval(intervalRef.current);
    }, [phase, updatePhysics]);

    const startRace = async () => {
        if (phase !== 'READY') return;
        try {
            console.log("Starting Duck Race onSpin with selectedPrizeId:", selectedPrizeId);
            const result = await onSpin(selectedPrizeId);
            console.log("Spinning result received:", result);
            if (!result?.winner?.id) throw new Error("Invalid draw data");

            setWinner(result);
            winningIdRef.current = result.winner.id;
            setPhase('STARTING');
            setCountdown(3);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setPhase('RACING');
                        return null;
                    }
                    return prev - 1;
                });
            }, 800);
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Error");
            setPhase('READY');
        }
    };

    const resetRace = () => {
        setPhase('READY');
        setWinner(null);
        setCountdown(null);
        setElapsedTime(0);
        setRacers(prev => prev.map(r => ({ ...r, position: 0, speed: 0, finished: false })));
    };

    const formatElapsedTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-[#020617] flex flex-col font-sans overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 px-8 py-6 flex justify-between items-center bg-white/5 border-b border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] text-white">
                        <Waves size={32} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{campaignTitle}</h2>
                        <div className="flex items-center gap-4 text-indigo-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-1">
                            <span className="flex items-center gap-1"><Timer size={12} /> Live Race Engine</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span>Participants: {participants.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {phase === 'READY' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3">Thời gian:</span>
                                {[10, 15, 30, 45].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setRaceDuration(d)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${raceDuration === d ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400'}`}
                                    >
                                        {d}s
                                    </button>
                                ))}
                            </div>
                            <select
                                value={selectedPrizeId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const p = currentPrizes.find(item => item.id === val);
                                        if (p && p.remainingQuantity === 0) {
                                            showToast(`Giải thưởng ${p.name} đã hết phần thưởng`, "warning");
                                            return;
                                        }
                                    }
                                    setSelectedPrizeId(val);
                                }}
                                className="bg-slate-800/50 border border-white/10 text-white text-[10px] font-black rounded-xl px-4 py-2.5 outline-none min-w-[180px] uppercase tracking-wider"
                            >
                                <option value="">-- Chọn giải thưởng (Ngẫu nhiên) --</option>
                                {[...currentPrizes].sort((a, b) => b.remainingQuantity - a.remainingQuantity).map(p => (
                                    <option key={p.id} value={p.id} className="bg-slate-900">{(p.name || '').toUpperCase()} ({p.remainingQuantity})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => setShowResultsPanel(!showResultsPanel)}
                        className={`h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${showResultsPanel ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
                    >
                        <Trophy size={14} /> {showResultsPanel ? "Ẩn DS Trúng Giải" : "Hiện DS Trúng Giải"}
                    </button>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-white rounded-full transition-all border border-white/10">
                        <X size={24} />
                    </button>
                </div>
            </div>


            <div className="flex-1 flex gap-6 m-6 mt-4 min-h-0">
                <div className="flex-1 relative rounded-[3rem] bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/5 overflow-hidden">
                    <AnimatePresence>
                        {(phase === 'RACING' || phase === 'FINISHED' || phase === 'READY') && (
                            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-10 left-1/2 -translate-x-1/2 z-[60]">
                                <div className="bg-[#0f172a]/80 backdrop-blur-2xl border-2 border-white/20 px-10 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    <span className="text-5xl font-mono font-black text-white tabular-nums tracking-[0.2em]">{formatElapsedTime(elapsedTime)}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {winner && (phase === 'STARTING' || phase === 'RACING') && (
                            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute top-6 left-6 z-[60] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Gift size={20} /></div>
                                <div>
                                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Phần quà:</p>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{winner.prize?.name || winner.wonPrize?.name || winner.prize?.prizeName || winner.wonPrize?.prizeName || "Giải thưởng"}</h3>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_transparent_100%)] opacity-30" />
                        <div className="water-waves opacity-20 absolute inset-0" />
                    </div>

                    <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-blue-500/10 to-transparent border-r-2 border-white/10 z-1" />
                    <div className="absolute right-0 top-0 bottom-0 w-60 z-1 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 to-transparent" />
                        <div className="h-full w-12 ml-auto flex flex-col justify-around">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`h-4 w-full ${i % 2 === 0 ? 'bg-white' : 'bg-black'} opacity-80`} />
                            ))}
                        </div>
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 rotate-90 text-white/5 font-black text-[120px] select-none uppercase">Finish</div>
                    </div>

                    <div className="absolute inset-0 z-10 flex flex-col justify-center py-10 overflow-y-auto px-20">
                        <div className="space-y-4">
                            {racers.map((r) => (
                                <div key={r.id} className="relative h-24 flex items-center group">
                                    <div className="absolute inset-x-0 h-px bg-white/5" />
                                    <div className="absolute" style={{ left: `calc(${r.position}% - 40px)`, transition: phase === 'RACING' ? 'none' : 'left 0.5s ease-out' }}>
                                        <DuckIcon
                                            color={r.color}
                                            name={r.name}
                                            isWinner={phase === 'FINISHED' && winner?.winner?.id === r.id}
                                            isRacing={phase === 'RACING'}
                                            currentSpeed={r.speed * 10}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {phase === 'READY' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-40">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRace} className="group relative px-16 py-8 bg-indigo-600 text-white font-black text-3xl rounded-[2.5rem] shadow-2xl transition-all overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 flex items-center gap-4 uppercase italic tracking-tighter"><Flag size={32} /> Khởi động cuộc đua</span>
                                </motion.button>
                            </motion.div>
                        )}

                        {phase === 'STARTING' && countdown && (
                            <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                                <span className="text-[250px] font-black text-amber-500 italic drop-shadow-2xl">{countdown}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {phase === 'FINISHED' && winner && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-3xl z-50 p-6">
                                <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} className="bg-white rounded-[4rem] p-16 max-w-xl w-full text-center relative shadow-2xl">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-2xl border-4 border-white rotate-12"><Trophy size={48} /></div>
                                    <div className="space-y-6 mt-6">
                                        <h3 className="text-amber-600 font-black tracking-[0.4em] uppercase text-sm italic">Grand Champion</h3>
                                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">{winner.winner?.fullName}</h2>
                                        <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-bold"><Zap size={20} className="text-amber-500 fill-amber-500" /> {winner.prize?.name || winner.wonPrize?.name || winner.prize?.prizeName || winner.wonPrize?.prizeName || "Giải thưởng"}</div>
                                    </div>
                                    <div className="mt-12 flex flex-col gap-4">
                                        <button onClick={resetRace} className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase text-lg tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center gap-3"><Timer size={24} /> Vòng đua tiếp theo</button>
                                        <button onClick={onClose} className="py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Rời khỏi khán đài</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar on the right for winners list */}
                {showResultsPanel && (
                    <div className="w-96 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 flex flex-col min-h-0 text-white select-none">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Trophy className="text-amber-500" size={18} /> Người Trúng Giải
                            </h3>
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-wider">
                                Tổng: {drawResults.length}
                            </span>
                        </div>
                        {drawResults.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-bold text-xs uppercase tracking-wider gap-2">
                                <Gift size={24} className="opacity-30" />
                                Chưa có ai trúng giải
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                {drawResults.map((res, index) => (
                                    <div key={res.id || index} className="p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white truncate">{res.winner?.fullName || res.winnerProfileId}</p>
                                            <p className="text-[10px] font-bold text-amber-400 mt-1 tracking-wide flex items-center gap-1">
                                                <Gift size={11} /> {res.prize?.name || res.wonPrize?.name || res.prize?.prizeName || res.wonPrize?.prizeName || "Giải thưởng"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const newClaimed = !res.claimed;
                                                    await luckyDrawService.updateClaimed(res.id, newClaimed);
                                                    setDrawResults(prev => prev.map(r => r.id === res.id ? { ...r, claimed: newClaimed } : r));
                                                    await fetchLatestAndEntry();
                                                } catch (err) {
                                                    console.error("Lỗi khi cập nhật trạng thái nhận thưởng", err);
                                                }
                                            }}
                                            className={`px-3 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-wider shrink-0 border transition-all ${res.claimed
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                                }`}
                                        >
                                            {res.claimed ? 'Đã nhận quà' : 'Chưa nhận quà'}
                                        </button>
                                        <div className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider shrink-0 border border-amber-500/20">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .water-waves {
                    background: linear-gradient(180deg, transparent 0%, rgba(37, 99, 235, 0.1) 50%, transparent 100%);
                    background-size: 100% 40px;
                    animation: waves 2s linear infinite;
                }
                @keyframes waves { from { background-position: 0 0; } to { background-position: 0 80px; } }
            `}</style>
        </div>
    );
};

export default DuckRaceLuckyDraw;