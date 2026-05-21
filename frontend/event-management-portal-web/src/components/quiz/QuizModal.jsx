import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, ArrowRight, Zap, CheckCircle2, XCircle, Clock, QrCode, Eye, EyeOff, Maximize2, Lock, Unlock, Users, SkipForward } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';
import { useQuiz } from '../../hooks/useQuiz';
import { useAuth } from "../../context/AuthContext";

// Animal Avatars for participants
const ANIMALS = [
  { emoji: '🐶', name: 'Chó con' }, { emoji: '🐱', name: 'Mèo con' }, { emoji: '🐭', name: 'Chuột nhắt' },
  { emoji: '🐹', name: 'Hamster' }, { emoji: '🐰', name: 'Thỏ bông' }, { emoji: '🦊', name: 'Cáo nhỏ' },
  { emoji: '🐻', name: 'Gấu béo' }, { emoji: '🐼', name: 'Panda' }, { emoji: '🐨', name: 'Koala' },
  { emoji: '🐯', name: 'Hổ con' }, { emoji: '🦁', name: 'Sư tử' }, { emoji: '🐮', name: 'Bò sữa' },
  { emoji: '🐷', name: 'Heo hồng' }, { emoji: '🐸', name: 'Ếch xanh' }, { emoji: '🐵', name: 'Khỉ con' },
  { emoji: '🐧', name: 'Cánh cụt' }, { emoji: '🐦', name: 'Chim sẻ' }, { emoji: '🐤', name: 'Gà chíp' },
  { emoji: '🦉', name: 'Cú mèo' }, { emoji: '🦄', name: 'Kỳ lân' }, { emoji: '🐝', name: 'Ong vàng' }
];

const getAvatarEmoji = (avatar) => {
  if (!avatar) return '👤';
  if (typeof avatar === 'object' && avatar.emoji) return avatar.emoji;
  if (typeof avatar === 'string') {
    const match = avatar.match(/emoji=([^,}\s]+)/);
    if (match) return match[1];
    return avatar;
  }
  return '👤';
};

// ─── Nickname Entry ────────────────────────────────────────
const NicknameEntry = ({ onJoin, defaultNickname }) => {
  const [nickname, setNickname] = useState(defaultNickname || '');
  const [randomAnimal] = useState(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F] p-6 relative overflow-y-auto">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rotate-45 rounded-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 rounded-full" />

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 md:mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
          IUH<span className="text-amber-400">!</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white p-4 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      >
        <div className="space-y-4">
          <div className="border-2 border-slate-200 rounded-md overflow-hidden focus-within:border-slate-400 transition-colors">
            <input
              autoFocus type="text" placeholder="Nickname"
              className="w-full px-4 py-4 text-xl font-bold text-center text-slate-800 outline-none placeholder:text-slate-300"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && nickname.trim() && onJoin(nickname, randomAnimal)}
            />
          </div>
          <button
            onClick={() => nickname.trim() && onJoin(nickname, randomAnimal)}
            disabled={!nickname.trim()}
            className="w-full py-4 bg-[#333333] text-white rounded-md font-bold text-lg hover:bg-black transition-all disabled:opacity-30 active:scale-95"
          >Ok, go</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-6 md:mt-12 flex flex-col items-center gap-2">
        <div className="text-4xl">{randomAnimal.emoji}</div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Bạn sẽ là {randomAnimal.name}</p>
      </motion.div>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────
const Countdown = ({ onDone }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F]">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[10rem] md:text-[20rem] font-black text-white leading-none drop-shadow-2xl"
        >
          {count > 0 ? count : '🚀'}
        </motion.div>
      </AnimatePresence>
      <p className="text-white/60 font-black text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] mt-4 md:mt-8">Chuẩn bị...</p>
    </div>
  );
};

// ─── Lobby ─────────────────────────────────────────────────
const LobbyScreen = ({ isOrganizer, quizId, participants = [], onFirstQuestion }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const joinCode = quizId?.substring(0, 6).toUpperCase();
  const displayPin = joinCode ? `${joinCode.substring(0, 3)} ${joinCode.substring(3)}` : '000 000';

  return (
    <div className="w-full h-full flex flex-col bg-[#46178F] relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      {isOrganizer && (
        <div className="relative z-50 w-full bg-white shadow-2xl flex flex-col md:flex-row items-stretch pr-14 md:pr-20">
          <div className="flex-1 flex flex-col justify-center px-4 py-3 md:px-10 md:py-4 border-b md:border-b-0 md:border-r border-slate-100">
            <p className="text-slate-500 text-xs md:text-sm font-bold">Ban tổ chức vừa kích hoạt một thử thách mới. Hãy tham gia ngay! <span className="text-slate-900">fitiuh-events.io.vn</span></p>
            <p className="text-slate-400 text-[10px] md:text-xs font-medium">hoặc sử dụng ứng dụng IUH!</p>
          </div>
          <div className="px-4 py-3 md:px-12 md:py-4 flex items-center justify-between md:justify-center bg-white border-b md:border-b-0 md:border-r border-slate-100 flex-1 md:flex-initial gap-4">
            <div className="flex flex-col md:items-center">
              <span className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Mã PIN trò chơi:</span>
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">{displayPin}</h2>
            </div>
            <div className="p-1 bg-white flex items-center justify-center">
              <button onClick={() => setShowLargeQR(true)}
                className="p-1 border border-slate-900 rounded hover:scale-110 transition-transform bg-white group relative">
                <QRCode value={joinCode || ""} size={32} className="md:hidden" />
                <QRCode value={joinCode || ""} size={60} className="hidden md:block" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="text-slate-900 w-3 h-3 md:w-4 md:h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start pt-8 md:pt-20 relative z-10 overflow-hidden w-full">
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-4xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-8 md:mb-20"
        >IUH<span className="text-amber-400">!</span></motion.h1>

        <div className="w-full flex-1 overflow-y-auto px-4 md:px-12 pb-24">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <AnimatePresence>
              {participants.map((p, i) => (
                <motion.div
                  key={p.participantAccountId || i}
                  initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center bg-black/30 backdrop-blur-md rounded-lg overflow-hidden min-w-[140px] md:min-w-[200px] shadow-lg border border-white/5"
                >
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-black/20 flex items-center justify-center text-2xl md:text-4xl border-r border-white/5">
                    {getAvatarEmoji(p.avatar)}
                  </div>
                  <div className="flex-1 px-3 py-2 md:px-4 md:py-3">
                    <span className="text-white font-black text-sm md:text-lg truncate block max-w-[80px] md:max-w-[150px]">
                      {p.nickname || p.fullName}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {participants.length === 0 && (
              <div className="flex flex-col items-center gap-4 opacity-30 mt-20">
                <div className="flex gap-3">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-4 h-4 bg-white rounded-full"
                      animate={{ y: [0, -15, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
                <p className="text-white font-black text-2xl uppercase tracking-widest">Đang đợi người chơi...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOrganizer && (
        <div className="fixed bottom-6 right-6 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-2xl flex p-1">
            <button onClick={() => setIsLocked(!isLocked)}
              className={`p-3 rounded-md transition-all ${isLocked ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-400 hover:text-slate-900'}`}>
              {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
            <button onClick={onFirstQuestion}
              className="px-6 py-3 bg-white text-slate-900 font-black uppercase text-sm hover:bg-slate-50 transition-all border-l border-slate-100">
              Bắt đầu
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-6 md:absolute md:bottom-8 md:left-8 z-50 flex items-center gap-2 md:gap-3">
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-black/40 flex items-center justify-center text-white">
          <Users className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        <span className="text-xl md:text-3xl font-black text-white">{participants.length}</span>
      </div>

      <AnimatePresence>
        {showLargeQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLargeQR(false)}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 cursor-zoom-out">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8"
              onClick={e => e.stopPropagation()}>
              <QRCode value={joinCode || ""} size={window.innerHeight * 0.6} />
              <div className="text-center">
                <p className="text-slate-400 font-black uppercase tracking-[0.5em] mb-2 text-xs">Mã PIN dự phòng</p>
                <h2 className="text-6xl font-black text-slate-900 tracking-widest">{joinCode}</h2>
              </div>
              <button onClick={() => setShowLargeQR(false)}
                className="mt-4 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Waiting For Start ─────────────────────────────────────
const WaitingForStartScreen = ({ quizId }) => {
  const joinCode = quizId?.substring(0, 6).toUpperCase();
  const displayPin = joinCode ? `${joinCode.substring(0, 3)} ${joinCode.substring(3)}` : '000 000';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F] p-6 relative overflow-y-auto font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-14 h-14 md:w-24 md:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-8 border-4 border-white/20 shadow-2xl relative">
        <motion.div className="absolute inset-0 rounded-full border-4 border-amber-300"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <Clock className="w-6 h-6 md:w-10 md:h-10 text-amber-300" />
      </motion.div>

      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-xl md:text-5xl font-black text-white text-center tracking-tight mb-2 md:mb-4">
        IUH<span className="text-amber-400">!</span> Thử thách
      </motion.h1>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 md:px-8 md:py-4 rounded-2xl mb-4 md:mb-8 flex flex-col items-center">
        <span className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Mã PIN:</span>
        <span className="text-white text-xl md:text-3xl font-black tracking-widest">{displayPin}</span>
      </motion.div>

      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center gap-2 md:gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2.5 h-2.5 md:w-3 md:h-3 bg-amber-400 rounded-full"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <p className="text-white text-sm md:text-lg font-extrabold uppercase tracking-wider text-center mt-1 md:mt-2">
          Đang đợi ban tổ chức bắt đầu...
        </p>
      </motion.div>
    </div>
  );
};

// ─── Kahoot-style shapes ────────────────────────────────────
const SHAPES = [
  { bg: '#E21B3C', icon: '▲', shadow: 'shadow-rose-900' },
  { bg: '#1368CE', icon: '◆', shadow: 'shadow-blue-900' },
  { bg: '#D89E00', icon: '●', shadow: 'shadow-yellow-900' },
  { bg: '#26890C', icon: '■', shadow: 'shadow-green-900' },
];

// ─── Timer bar ─────────────────────────────────────────────
const TimerBar = ({ timeLeft, totalTime }) => {
  const pct = (timeLeft / totalTime) * 100;
  return (
    <div className="relative h-3 bg-white/10">
      <div className="h-full transition-all duration-1000 ease-linear" style={{ width: `${pct}%`, backgroundColor: '#fff' }} />
    </div>
  );
};

// ─── Word Scramble ─────────────────────────────────────────
const WordScrambleInline = ({ data, onAnswer, done }) => {
  const [chars, setChars] = useState([]);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setChars(data.split('').sort(() => Math.random() - 0.5).map((c, i) => ({ id: i, char: c, used: false })));
    setTyped('');
  }, [data]);

  const pick = (item) => {
    if (done || item.used) return;
    const n = typed + item.char;
    setTyped(n);
    setChars(p => p.map(c => c.id === item.id ? { ...c, used: true } : c));
    if (n.length === data.length) onAnswer(n);
  };

  return (
    <div className="col-span-2 flex flex-col items-center gap-6">
      <div className="min-h-[70px] w-full max-w-md bg-white/10 border-4 border-dashed border-white/30 rounded-2xl flex items-center justify-center gap-2 p-3">
        {typed ? typed.split('').map((c, i) => (
          <span key={i} className="w-12 h-12 bg-white rounded-xl font-black text-2xl text-[#46178F] flex items-center justify-center shadow">{c}</span>
        )) : <span className="text-white/40 font-bold">Chọn chữ cái bên dưới...</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {chars.map(c => (
          <button key={c.id} onClick={() => pick(c)} disabled={done || c.used}
            className={`w-14 h-14 rounded-xl font-black text-2xl text-[#46178F] shadow-lg transition-all ${c.used ? 'bg-white/20 text-white/20' : 'bg-white hover:scale-110'}`}>
            {c.char}
          </button>
        ))}
      </div>
      <button onClick={() => { setTyped(''); setChars(p => p.map(c => ({ ...c, used: false }))); }}
        className="text-white/50 text-xs font-bold uppercase hover:text-white">Làm lại</button>
    </div>
  );
};

// ─── Question Screen ────────────────────────────────────────
// phase: 'answering' | 'revealing' | 'summarizing'
const QuestionScreen = ({
  question,
  questionNumber,
  isOrganizer,
  onAnswer,
  onTimerEnd,      // called when timer hits 0 (organizer triggers leaderboard after reveal)
  quizId,
  totalQuestions
}) => {
  const totalTime = question.timeLimit || 30;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [answered, setAnswered] = useState(null);        // option id chosen
  const [result, setResult] = useState(null);            // { points, correct }
  const [subPhase, setSubPhase] = useState('answering'); // 'answering' | 'revealing' | 'summarizing'
  const [stats, setStats] = useState({});
  const [revealCountdown, setRevealCountdown] = useState(5);

  const timerRef = useRef(null);
  const startRef = useRef(Date.now());
  const timerEndedRef = useRef(false);

  // Reset when question changes
  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(totalTime);
    setAnswered(null);
    setResult(null);
    setSubPhase('answering');
    timerEndedRef.current = false;
    setRevealCountdown(5);
    setStats({});

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question.id]);

  // When timer hits 0 → go to revealing phase
  useEffect(() => {
    if (timeLeft === 0 && subPhase === 'answering' && !timerEndedRef.current) {
      timerEndedRef.current = true;
      setSubPhase('revealing');
    }
  }, [timeLeft, subPhase]);

  // Fetch statistics when timer hits 0 (revealing phase)
  useEffect(() => {
    if (subPhase === 'revealing' && question?.id) {
      eventService.getQuizQuestionStats(question.id)
        .then(res => {
          if (res.data) {
            setStats(res.data);
          }
        })
        .catch(err => console.error("[QuizModal] Error fetching stats:", err));
    }
  }, [subPhase, question?.id]);

  const getWordScrambleCorrectCount = () => {
    if (!question.correctData) return 0;
    const correctKey = question.correctData.trim().toLowerCase();
    let total = 0;
    Object.keys(stats).forEach(ans => {
      if (ans.trim().toLowerCase() === correctKey) {
        total += stats[ans];
      }
    });
    return total;
  };
  
  const getWordScrambleTotalSubmissions = () => {
    let total = 0;
    Object.values(stats).forEach(v => { total += v; });
    return total;
  };

  // Revealing phase: show correct/wrong 2s, then summarizing 5s countdown
  useEffect(() => {
    if (subPhase === 'revealing') {
      const t = setTimeout(() => {
        setSubPhase('summarizing');
        setRevealCountdown(5);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [subPhase]);

  // Summarizing phase: countdown from 5 → 0 then call onTimerEnd
  useEffect(() => {
    if (subPhase !== 'summarizing') return;
    if (revealCountdown <= 0) {
      onTimerEnd();
      return;
    }
    const t = setTimeout(() => setRevealCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [subPhase, revealCountdown, onTimerEnd]);

  const handleAnswer = async (optId) => {
    if (answered || subPhase !== 'answering' || isOrganizer) return;
    clearInterval(timerRef.current);
    setAnswered(optId);
    const responseTime = (Date.now() - startRef.current) / 1000;
    try {
      const res = await onAnswer(optId, responseTime);
      setResult(res);
    } catch { }
  };

  const timerColor = timeLeft > 10 ? 'text-white' : timeLeft > 5 ? 'text-amber-300' : 'text-rose-400 animate-pulse';
  const locked = subPhase !== 'answering';

  // ── ORGANIZER VIEW ──────────────────────────────────────
  if (isOrganizer) {
    return (
      <div className="w-full h-full flex flex-col bg-[#46178F]">
        {/* Header */}
        <div className="flex items-center justify-between pl-4 pr-14 py-3 md:pl-8 md:pr-24 md:py-4 bg-black/30">
          <div className="flex items-center gap-3">
            <div className={`text-2xl md:text-4xl font-black ${subPhase === 'answering' ? timerColor : 'text-white/40'}`}>
              {subPhase === 'answering' ? `${timeLeft}s` : '—'}
            </div>
            {subPhase === 'summarizing' && (
              <div className="text-sm font-bold text-amber-300 animate-pulse">
                BXH sau {revealCountdown}s
              </div>
            )}
          </div>
        </div>

        {subPhase === 'answering' && <TimerBar timeLeft={timeLeft} totalTime={totalTime} />}

        {/* Question */}
        <div className="bg-white mx-3 mt-3 md:mx-6 md:mt-5 rounded-2xl px-4 py-3 md:px-8 md:py-5 text-center shadow-2xl">
          <p className="text-base md:text-3xl font-black text-gray-900 leading-snug">{question.content}</p>
          {question.hint && (
            <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 font-medium">💡 Gợi ý: {question.hint}</p>
          )}
        </div>

        {/* Answer options with correct indicators */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 md:p-6 overflow-y-auto">
          {question.type === 'MULTIPLE_CHOICE' && question.options?.map((opt, i) => {
            const shape = SHAPES[i % 4];
            const showResult = subPhase === 'revealing' || subPhase === 'summarizing';
            return (
              <div
                key={opt.id}
                style={{ backgroundColor: shape.bg }}
                className={`rounded-xl md:rounded-2xl text-white font-black text-sm md:text-lg flex items-center gap-2 md:gap-4 px-3 py-3 md:px-6 md:py-4 shadow-xl relative transition-all
                  ${showResult && opt.isCorrect ? 'ring-2 md:ring-4 ring-white scale-[1.02]' : ''}
                  ${showResult && !opt.isCorrect ? 'opacity-50' : ''}`}
              >
                <span className="text-2xl md:text-4xl opacity-70 shrink-0">{shape.icon}</span>
                <span className="flex-1 leading-snug">{opt.content}</span>
                {showResult && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-black flex items-center gap-1">
                      👥 {stats[opt.id] || 0}
                    </span>
                    {opt.isCorrect
                      ? <CheckCircle2 className="text-white drop-shadow w-5 h-5 md:w-7 md:h-7" />
                      : <XCircle className="text-white/40 w-5 h-5 md:w-7 md:h-7" />
                    }
                  </div>
                )}
              </div>
            );
          })}

          {question.type === 'WORD_SCRAMBLE' && (
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-4">
              <div className="bg-white/10 border-2 border-white/30 rounded-2xl px-8 py-4 text-center">
                <p className="text-white/60 text-sm font-bold uppercase mb-2">Đáp án đúng:</p>
                <p className="text-white font-black text-3xl tracking-widest">{question.correctData}</p>
              </div>
              {showResult && (
                <div className="bg-white/5 rounded-xl px-6 py-3 text-center border border-white/10">
                  <p className="text-white text-sm font-bold">
                    👥 {getWordScrambleCorrectCount()} / {getWordScrambleTotalSubmissions()} người trả lời đúng
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summarizing overlay with answer distribution countdown */}
        <AnimatePresence>
          {subPhase === 'summarizing' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-6"
            >
              <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full text-center">
                <p className="text-white/60 text-sm font-black uppercase tracking-widest mb-2">Tổng hợp bảng xếp hạng</p>
                <div className="text-8xl font-black text-amber-400 leading-none mb-4">{revealCountdown}</div>
                <p className="text-white text-lg font-bold">giây nữa hiển thị BXH</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── PLAYER VIEW ────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col bg-[#46178F] relative">
      {/* Header */}
      <div className="flex items-center justify-between pl-4 pr-14 py-3 bg-black/30">
        <div className={`text-2xl md:text-4xl font-black ${subPhase === 'answering' ? timerColor : 'text-white/40'}`}>
          {subPhase === 'answering' ? timeLeft : '—'}
        </div>
      </div>

      {subPhase === 'answering' && <TimerBar timeLeft={timeLeft} totalTime={totalTime} />}

      {/* Question */}
      <div className="bg-white mx-3 mt-3 md:mx-4 md:mt-4 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-5 text-center shadow-2xl">
        <p className="text-base md:text-2xl font-black text-gray-900 leading-snug">{question.content}</p>
        {question.hint && (
          <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 font-medium">💡 {question.hint}</p>
        )}
      </div>

      {/* Answer buttons - shape only while answering, reveal text after */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 md:gap-4 p-3 pb-6 md:p-4">
        {question.type === 'MULTIPLE_CHOICE' && question.options?.map((opt, i) => {
          const shape = SHAPES[i % 4];
          const isSelected = answered === opt.id;
          const showResult = subPhase === 'revealing' || subPhase === 'summarizing';

          let extra = '';
          if (showResult) {
            if (opt.isCorrect) extra = 'ring-4 ring-white scale-105';
            else if (isSelected && !opt.isCorrect) extra = 'opacity-50';
            else extra = 'opacity-30 scale-95';
          } else if (answered && isSelected) {
            extra = 'ring-4 ring-white/50'; // Show selection but no right/wrong yet
          } else if (answered && !isSelected) {
            extra = 'opacity-50'; // Dim other options
          }

          return (
            <motion.button
              key={opt.id}
              whileHover={!locked ? { scale: 1.04 } : {}}
              whileTap={!locked ? { scale: 0.96 } : {}}
              onClick={() => handleAnswer(opt.id)}
              disabled={locked}
              style={{ backgroundColor: shape.bg }}
              className={`rounded-2xl md:rounded-3xl text-white font-black flex flex-col items-center justify-center gap-1 md:gap-3 shadow-2xl transition-all ${shape.shadow} ${extra}`}
            >
              <span className="text-4xl md:text-7xl" style={{ lineHeight: 1 }}>{shape.icon}</span>

              {/* After locking: show text */}
              {(answered || locked) && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs md:text-sm font-bold text-white/90 px-2 text-center leading-snug"
                >
                  {opt.content}
                </motion.span>
              )}

              {/* Result icons and selection stats in revealing/summarizing */}
              {showResult && (
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="flex items-center gap-1">
                    {opt.isCorrect && <CheckCircle2 className="text-white drop-shadow-lg w-6 h-6 md:w-7 md:h-7" />}
                    {isSelected && !opt.isCorrect && <XCircle className="text-white drop-shadow-lg w-6 h-6 md:w-7 md:h-7" />}
                  </div>
                  <span className="px-2 py-0.5 bg-black/20 rounded-full text-[10px] md:text-xs font-black flex items-center gap-1">
                    👥 {stats[opt.id] || 0} chọn
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}

        {question.type === 'WORD_SCRAMBLE' && (
          <div className="col-span-2 flex flex-col items-center gap-4 w-full">
            <WordScrambleInline data={question.correctData || ''} onAnswer={handleAnswer} done={locked} />
            {showResult && (
              <div className="bg-white/10 rounded-xl px-6 py-3 text-center border border-white/20 mt-4">
                <p className="text-white text-sm font-bold">
                  👥 {getWordScrambleCorrectCount()} / {getWordScrambleTotalSubmissions()} người trả lời đúng
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom status banners */}
      <AnimatePresence>
        {/* After answering, before timer ends: "Đã chọn, chờ..." */}
        {answered && subPhase === 'answering' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 text-center z-50 bg-slate-800"
          >
            <p className="text-white font-black text-lg">Đã chọn! Chờ đáp án...</p>
          </motion.div>
        )}

        {/* Timer ended - no answer */}
        {subPhase === 'revealing' && !answered && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 text-center z-50 bg-slate-800"
          >
            <p className="text-white font-black text-lg">⏰ Hết giờ!</p>
          </motion.div>
        )}

        {/* Revealing phase - show result */}
        {subPhase === 'revealing' && answered && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className={`fixed bottom-0 left-0 right-0 p-4 text-center z-50 ${result?.points > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}
          >
            <p className="text-white font-black text-xl">
              {result?.points > 0 ? `✅ Chính xác! +${result.points} điểm` : '❌ Sai rồi...'}
            </p>
          </motion.div>
        )}

        {/* Summarizing phase */}
        {subPhase === 'summarizing' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 text-center z-50 bg-slate-900"
          >
            <p className="text-white/60 text-sm font-bold">
              {answered
                ? (result?.points > 0 ? `✅ +${result.points} điểm` : '❌ Sai rồi...')
                : '⏰ Hết giờ!'}
            </p>
            <p className="text-amber-400 font-black text-base animate-pulse">Đang tổng hợp bảng xếp hạng...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Leaderboard Screen ─────────────────────────────────────
const LeaderboardScreen = ({ leaderboard, isOrganizer, onNext, onEnd, quizId, autoCountdown = 10 }) => {
  const [countdown, setCountdown] = useState(autoCountdown);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!isOrganizer) return; // Only auto-advance for organizer
    setCountdown(autoCountdown);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [isOrganizer, autoCountdown]);

  // Auto-advance when countdown hits 0
  useEffect(() => {
    if (countdown === 0 && isOrganizer) {
      onNext();
    }
  }, [countdown, isOrganizer, onNext]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#46178F] to-[#1a0a3b]">
      {/* Header */}
      <div className="flex items-center justify-between pl-4 pr-14 py-3 md:pl-8 md:pr-24 md:py-5 bg-black/30">
        <h2 className="text-lg md:text-2xl font-black text-white uppercase flex items-center gap-2 md:gap-3">
          🏆 BXH
        </h2>
        <div className="flex items-center gap-4">
          {isOrganizer && (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm font-bold">Tiếp theo sau:</span>
              <span className="text-amber-400 font-black text-2xl">{countdown}s</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Mã PIN:</span>
            <span className="text-white font-black text-base md:text-lg tracking-widest">
              {quizId?.substring(0, 6).toUpperCase() || "—— ——"}
            </span>
          </div>
        </div>
      </div>

      {/* Countdown bar for organizer */}
      {isOrganizer && (
        <div className="h-1.5 bg-white/10">
          <motion.div
            className="h-full bg-amber-400"
            initial={{ width: '100%' }}
            animate={{ width: `${(countdown / autoCountdown) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}

      {/* Leaderboard content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28">
        {/* Top 3 podium */}
        {leaderboard.length > 0 && (
          <div className="flex items-end justify-center gap-2 md:gap-4 mb-6 md:mb-8 h-28 md:h-40">
            {[1, 0, 2].map(pos => {
              const entry = leaderboard[pos];
              if (!entry) return <div key={pos} className="w-20 md:w-28" />;
              const heights = ['h-28 md:h-40', 'h-20 md:h-28', 'h-14 md:h-20'];
              const labels = ['🥇', '🥈', '🥉'];
              const colors = ['bg-amber-500', 'bg-slate-400', 'bg-amber-700'];
              return (
                <motion.div key={pos}
                  initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: pos * 0.15 }}
                  className={`flex flex-col items-center justify-end w-20 md:w-28 ${heights[pos]} ${colors[pos]} rounded-t-xl md:rounded-t-2xl pb-2 md:pb-3 shadow-xl`}>
                  <span className="text-3xl">{labels[pos]}</span>
                  <p className="text-white font-black text-[10px] text-center truncate w-full px-2">{entry.nickname || entry.fullName}</p>
                  <p className="text-white/80 font-bold text-xs">{entry.totalScore} pts</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, i) => (
            <motion.div key={entry.participantAccountId || i}
              initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
              <span className="text-white/50 font-black text-base md:text-lg w-7">#{i + 1}</span>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-base md:text-lg overflow-hidden">
                {getAvatarEmoji(entry.avatar)}
              </div>
              <span className="flex-1 text-white font-bold text-sm md:text-base">{entry.nickname || entry.fullName}</span>
              <span className="text-amber-300 font-black text-base md:text-lg">{entry.totalScore}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Organizer controls - fixed bottom */}
      {isOrganizer && (
        <div className="fixed bottom-0 left-0 right-0 p-3 md:p-5 bg-black/80 backdrop-blur-md flex justify-center gap-3 md:gap-4 z-50">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { clearInterval(countdownRef.current); onNext(); }}
            className="px-6 py-3 md:px-10 md:py-4 bg-white text-[#46178F] rounded-2xl font-black uppercase tracking-wider flex items-center gap-2 shadow-xl text-sm md:text-base">
            Tiếp tục <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { clearInterval(countdownRef.current); onEnd(); }}
            className="px-6 py-3 md:px-10 md:py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl text-sm md:text-base">
            Kết thúc
          </motion.button>
        </div>
      )}
    </div>
  );
};

// ─── Main QuizModal ─────────────────────────────────────────
const QuizModal = (props) => {
  const hasParentProps = props.quizControls !== undefined || props.quizState !== undefined;
  if (hasParentProps) return <QuizModalContent {...props} />;
  return <QuizModalWithLocalHook {...props} />;
};

const QuizModalWithLocalHook = (props) => {
  const localQuizControls = useQuiz(props.eventId);
  return <QuizModalContent {...props} localQuizControls={localQuizControls} />;
};

const QuizModalContent = ({
  isOpen,
  onClose,
  eventId,
  isOrganizer,
  quizId: propQuizId,
  quizControls,
  localQuizControls,
  quizState: parentQuizState,
  leaderboard: parentLeaderboard,
  participants: parentParticipants,
  activeQuizId: parentActiveQuizId,
  joinQuiz: parentJoinQuiz,
  leaveQuiz: parentLeaveQuiz,
  closeQuiz: parentCloseQuiz,
  joinedQuizzes: parentJoinedQuizzes,
  setJoinedQuizzes: parentSetJoinedQuizzes,
  lastQuestionIndex: parentLastQuestionIndex,
  lastQuestionId: parentLastQuestionId
}) => {
  const { user } = useAuth();

  const quizState = quizControls?.quizState || parentQuizState || localQuizControls?.quizState;
  const leaderboard = quizControls?.leaderboard || parentLeaderboard || localQuizControls?.leaderboard;
  const participants = quizControls?.participants || parentParticipants || localQuizControls?.participants;
  const activeQuizId = quizControls?.activeQuizId || parentActiveQuizId || localQuizControls?.activeQuizId;
  const joinQuiz = quizControls?.joinQuiz || parentJoinQuiz || localQuizControls?.joinQuiz;
  const leaveQuiz = quizControls?.leaveQuiz || parentLeaveQuiz || localQuizControls?.leaveQuiz;
  const closeQuiz = quizControls?.closeQuiz || parentCloseQuiz || localQuizControls?.closeQuiz;
  const joinedQuizzes = quizControls?.joinedQuizzes || parentJoinedQuizzes || localQuizControls?.joinedQuizzes;
  const setJoinedQuizzes = quizControls?.setJoinedQuizzes || parentSetJoinedQuizzes || localQuizControls?.setJoinedQuizzes;

  const resolvedQuizId = propQuizId || activeQuizId;
  const joinedInfo = joinedQuizzes?.[resolvedQuizId];
  const joined = !!joinedInfo;
  const participantId = joinedInfo?.participantId || null;
  const effectiveIsOrganizer = isOrganizer && !joined;

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [phase, setPhase] = useState('lobby');
  const [fetchingStatus, setFetchingStatus] = useState(!effectiveIsOrganizer);
  const [quizDetails, setQuizDetails] = useState(null);

  const lastQuestionIndex = quizControls?.lastQuestionIndex !== undefined
    ? quizControls.lastQuestionIndex
    : (parentLastQuestionIndex !== undefined
        ? parentLastQuestionIndex
        : (localQuizControls?.lastQuestionIndex || 0));

  const lastQuestionId = quizControls?.lastQuestionId !== undefined
    ? quizControls.lastQuestionId
    : (parentLastQuestionId !== undefined
        ? parentLastQuestionId
        : (localQuizControls?.lastQuestionId || null));

  const staleStateRef = useRef(null);

  // Fetch quiz details on mount
  useEffect(() => {
    if (!isOpen || !resolvedQuizId) {
      setFetchingStatus(false);
      return;
    }

    let isMounted = true;
    const fetchQuizDetails = async () => {
      try {
        if (!effectiveIsOrganizer) setFetchingStatus(true);
        const pin = resolvedQuizId.substring(0, 6).toUpperCase();
        const res = await eventService.getQuizByPin(pin);
        if (isMounted && res.data) {
          setQuizDetails(res.data);
          if (!effectiveIsOrganizer) {
            const active = !!res.data?.active;
            setFetchingStatus(false);
            if (!active && quizState?.type === 'WAITING') {
              setPhase('waiting_for_start');
            } else if (active && quizState?.type === 'WAITING') {
              setPhase('lobby');
            }
          }
        }
      } catch (err) {
        console.error("[QuizModal] Error fetching quiz details:", err);
      } finally {
        if (isMounted && !effectiveIsOrganizer) setFetchingStatus(false);
      }
    };

    fetchQuizDetails();
    return () => { isMounted = false; };
  }, [isOpen, resolvedQuizId, effectiveIsOrganizer]);

  // Reset phase when modal opens
  useEffect(() => {
    if (isOpen) {
      staleStateRef.current = quizState?.type;
      if (quizState?.type === 'WAITING') {
        if (effectiveIsOrganizer) setPhase('lobby');
      } else if (quizState?.type === 'START') {
        setPhase('lobby');
      } else if (quizState?.type === 'NEXT_QUESTION') {
        setPhase('countdown');
      } else if (quizState?.type === 'LEADERBOARD') {
        setPhase('leaderboard');
      } else if (quizState?.type === 'END') {
        setPhase('end');
      } else {
        setPhase('lobby');
      }
    }
  }, [isOpen]);

  // Drive phase from WebSocket
  useEffect(() => {
    if (!isOpen) return;
    if (staleStateRef.current === quizState?.type && ['FORCE_CLOSE', 'END'].includes(quizState?.type)) {
      staleStateRef.current = null;
      return;
    }
    staleStateRef.current = null;

    if (quizState?.type === 'FORCE_CLOSE') {
      onClose();
      if (!effectiveIsOrganizer) toast.info('Trò chơi đã kết thúc bởi ban tổ chức');
      return;
    }
    if (quizState?.type === 'WAITING') {
      setPhase(effectiveIsOrganizer ? 'lobby' : 'waiting_for_start');
      setJoinedQuizzes(prev => {
        if (prev && prev[resolvedQuizId]) {
          const copy = { ...prev };
          delete copy[resolvedQuizId];
          return copy;
        }
        return prev;
      });
    }
    if (quizState?.type === 'START') setPhase('lobby');
    if (quizState?.type === 'NEXT_QUESTION') setPhase('countdown');
    if (quizState?.type === 'LEADERBOARD') setPhase('leaderboard');
    if (quizState?.type === 'END') setPhase('end');
  }, [quizState?.type, isOpen, isOrganizer]);

  // ── Handlers ────────────────────────────────────────────

  const handleFirstQuestion = async () => {
    try {
      await eventService.startQuiz(resolvedQuizId);
      await eventService.nextQuizQuestion(resolvedQuizId, 0);
    } catch {
      toast.error('Lỗi khi bắt đầu thử thách');
    }
  };

  // Called when the question timer + reveal phase finishes (organizer perspective)
  // → show leaderboard by calling backend endpoint which broadcasts LEADERBOARD to all
  const handleQuestionTimerEnd = useCallback(async () => {
    if (!effectiveIsOrganizer) return;
    try {
      await eventService.showQuizLeaderboard(resolvedQuizId);
    } catch {
      // Fallback: just switch to leaderboard locally
      setPhase('leaderboard');
    }
  }, [effectiveIsOrganizer, resolvedQuizId]);

  // Called from leaderboard "Next" button or auto-countdown
  const handleNextQuestion = useCallback(() => {
    let nextIdx = 0;
    const sortedQuestions = quizDetails?.questions
      ? [...quizDetails.questions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      : [];

    const currentQuestionId = lastQuestionId || quizState?.data?.id;
    if (currentQuestionId && sortedQuestions.length > 0) {
      const currentListIdx = sortedQuestions.findIndex(q => q.id === currentQuestionId);
      if (currentListIdx !== -1) {
        nextIdx = currentListIdx + 1;
      } else {
        // Fallback: orderIndex is 1-based, backend uses 0-based array index
        // lastQuestionIndex holds the orderIndex value, so the next 0-based index = lastQuestionIndex
        nextIdx = lastQuestionIndex;
      }
    } else {
      nextIdx = lastQuestionIndex;
    }

    eventService.nextQuizQuestion(resolvedQuizId, nextIdx).catch(() => toast.error('Lỗi'));
  }, [quizDetails, lastQuestionId, lastQuestionIndex, quizState?.data?.id, resolvedQuizId]);

  const handleEndQuiz = async () => {
    try {
      await eventService.endQuiz(resolvedQuizId);
    } catch { }
    setPhase('end');
  };

  const handleResetQuiz = async () => {
    try {
      await eventService.resetQuiz(resolvedQuizId);
      setJoinedQuizzes(prev => {
        if (prev && prev[resolvedQuizId]) {
          const copy = { ...prev };
          delete copy[resolvedQuizId];
          return copy;
        }
        return prev;
      });
      toast.success('Đã làm mới thử thách!');
    } catch {
      toast.error('Lỗi khi làm mới thử thách');
    }
  };

  const handleSubmitAnswer = async (answer, responseTime) => {
    const res = await eventService.submitQuizAnswer({
      quizId: resolvedQuizId,
      questionId: quizState.data?.id,
      answer,
      responseTime
    });
    return res.data;
  };

  const handleJoin = (nickname, avatar) => {
    const userId = user?.id || user?.accountId;
    if (joinQuiz(resolvedQuizId, nickname, avatar, userId)) {
      toast.success(`Chào mừng ${nickname}!`);
    } else {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const handleAttemptClose = () => {
    if (effectiveIsOrganizer) {
      setShowConfirmClose(true);
    } else {
      if (joined && participantId) leaveQuiz(resolvedQuizId, participantId);
      onClose();
    }
  };

  const handleConfirmClose = () => {
    closeQuiz(resolvedQuizId);
    setShowConfirmClose(false);
    onClose();
  };

  // Compute current question number
  const getQuestionNumber = () => {
    if (!quizState?.data) return 1;
    if (quizDetails?.questions) {
      const sorted = [...quizDetails.questions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      const idx = sorted.findIndex(q => q.id === quizState.data.id);
      if (idx !== -1) return idx + 1;
    }
    const ord = quizState.data.orderIndex ?? 0;
    return ord === 0 ? 1 : ord;
  };

  const totalQuestions = quizDetails?.questions?.length || 20;

  if (!isOpen) return null;

  if (fetchingStatus) {
    return createPortal(
      <div className="fixed inset-0 z-[5000] overflow-y-auto flex flex-col items-center justify-center bg-[#46178F] font-sans px-4 py-8">
        <button onClick={handleAttemptClose}
          className="fixed top-3 right-3 md:top-5 md:right-5 z-[300] p-2 md:p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-white font-extrabold uppercase tracking-widest animate-pulse">Đang kết nối thử thách...</p>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[5000] overflow-hidden bg-[#46178F] font-sans">
      {/* Close button */}
      <button onClick={handleAttemptClose}
        className="fixed top-3 right-3 md:top-5 md:right-5 z-[300] p-2 md:p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm">
        <X size={20} />
      </button>

      {/* Confirm close modal */}
      <AnimatePresence>
        {showConfirmClose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Đóng phòng Quiz?</h3>
              <p className="text-slate-500 mb-8">Hành động này sẽ kết thúc trò chơi và mời tất cả người chơi ra ngoài.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowConfirmClose(false)}
                  className="py-3 px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  Hủy bỏ
                </button>
                <button onClick={handleConfirmClose}
                  className="py-3 px-6 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                  Đóng phòng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* WAITING FOR START */}
        {phase === 'waiting_for_start' && !effectiveIsOrganizer && (
          <motion.div key="waiting-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <WaitingForStartScreen quizId={resolvedQuizId} />
          </motion.div>
        )}

        {/* NICKNAME ENTRY */}
        {!effectiveIsOrganizer && !joined && phase !== 'end' && phase !== 'waiting_for_start' && (
          <motion.div key="nick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <NicknameEntry onJoin={handleJoin} defaultNickname={user?.fullName} />
          </motion.div>
        )}

        {/* LOBBY */}
        {phase === 'lobby' && (effectiveIsOrganizer || joined) && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <LobbyScreen
              isOrganizer={effectiveIsOrganizer}
              quizId={resolvedQuizId}
              participants={participants}
              onFirstQuestion={handleFirstQuestion}
            />
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <Countdown onDone={() => setPhase('question')} />
          </motion.div>
        )}

        {/* QUESTION LOADING */}
        {phase === 'question' && !quizState?.data && (
          <motion.div key="q-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center bg-[#46178F]">
            <div className="flex gap-3 mb-6">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-5 h-5 bg-white rounded-full"
                  animate={{ y: [0, -20, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
            <p className="text-white font-black text-2xl uppercase tracking-widest">Đang tải câu hỏi...</p>
          </motion.div>
        )}

        {/* QUESTION */}
        {phase === 'question' && quizState?.data && (
          <motion.div
            key={`q-${quizState.data.id}`}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="w-full h-full"
          >
            <QuestionScreen
              question={quizState.data}
              questionNumber={getQuestionNumber()}
              totalQuestions={totalQuestions}
              isOrganizer={effectiveIsOrganizer}
              onAnswer={handleSubmitAnswer}
              onTimerEnd={handleQuestionTimerEnd}
              quizId={resolvedQuizId}
            />
          </motion.div>
        )}

        {/* LEADERBOARD */}
        {phase === 'leaderboard' && (
          <motion.div key="lb" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="w-full h-full">
            <LeaderboardScreen
              leaderboard={leaderboard}
              isOrganizer={effectiveIsOrganizer}
              onNext={handleNextQuestion}
              onEnd={handleEndQuiz}
              quizId={resolvedQuizId}
              autoCountdown={10}
            />
          </motion.div>
        )}

        {/* END */}
        {phase === 'end' && (
          <motion.div key="end" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#46178F] to-[#1a0a3b] py-8 px-4 overflow-y-auto">
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mb-4 md:mb-6" fill="currentColor" />
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 md:mb-3">Kết thúc!</h1>
            <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-10">Cảm ơn tất cả đã tham gia 🎉</p>
            <div className="w-full max-w-lg px-6 space-y-2 mb-6 md:mb-10 overflow-y-auto max-h-48 md:max-h-64">
              {leaderboard.slice(0, 10).map((e, i) => (
                <div key={e.participantAccountId || i} className="flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
                  <span className="text-xl md:text-2xl w-8 shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg shrink-0">
                    {getAvatarEmoji(e.avatar)}
                  </div>
                  <span className="flex-1 text-white font-bold truncate">{e.nickname || e.fullName}</span>
                  <span className="text-amber-300 font-black shrink-0">{e.totalScore} pts</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {effectiveIsOrganizer && (
                <button onClick={handleResetQuiz}
                  className="px-8 py-3 md:px-12 md:py-4 bg-amber-500 text-white rounded-2xl font-black text-base md:text-lg uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                  <Play size={20} fill="currentColor" /> Chơi lại
                </button>
              )}
              <button onClick={onClose}
                className="px-8 py-3 md:px-12 md:py-4 bg-white text-[#46178F] rounded-2xl font-black text-base md:text-lg uppercase shadow-2xl hover:scale-105 transition-all">
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default QuizModal;
