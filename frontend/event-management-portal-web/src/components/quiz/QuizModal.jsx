import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, ArrowRight, Zap, CheckCircle2, XCircle, Clock, QrCode, Eye, EyeOff, Maximize2, Lock, Unlock, Users } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';
import { useQuiz } from '../../hooks/useQuiz';
import { useAuth } from "../../context/AuthContext";
import DuckRace from './DuckRace';

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

// ─── Nickname Entry (For Students) ────────────────────────
const NicknameEntry = ({ onJoin, defaultNickname }) => {
  const [nickname, setNickname] = useState(defaultNickname || '');
  const [randomAnimal] = useState(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F] p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rotate-45 rounded-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 rounded-full" />

      {/* Stylized Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <h1 className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_5px_0_rgba(0,0,0,0.2)]">
          IUH<span className="text-amber-400">!</span>
        </h1>
      </motion.div>

      {/* Kahoot-style White Box */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white p-4 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      >
        <div className="space-y-4">
          <div className="border-2 border-slate-200 rounded-md overflow-hidden focus-within:border-slate-400 transition-colors">
            <input
              autoFocus
              type="text"
              placeholder="Nickname"
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
          >
            Ok, go
          </button>
        </div>
      </motion.div>

      {/* Secret Avatar Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col items-center gap-2"
      >
        <div className="text-4xl">{randomAnimal.emoji}</div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Bạn sẽ là {randomAnimal.name}</p>
      </motion.div>
    </div>
  );
};

// ─── Countdown ───────────────────────────────────────────
const Countdown = ({ onDone }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F]">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[20rem] font-black text-white leading-none drop-shadow-2xl"
        >
          {count > 0 ? count : '🚀'}
        </motion.div>
      </AnimatePresence>
      <p className="text-white/60 font-black text-xl uppercase tracking-[0.3em] mt-8">Chuẩn bị...</p>
    </div>
  );
};

// ─── Lobby ────────────────────────────────────────────────
const LobbyScreen = ({ isOrganizer, quizId, participants = [], onFirstQuestion }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const joinCode = quizId?.substring(0, 6).toUpperCase();
  const displayPin = joinCode ? `${joinCode.substring(0, 3)} ${joinCode.substring(3)}` : '000 000';

  return (
    <div className="w-full h-full flex flex-col bg-[#46178F] relative overflow-hidden font-sans">
      {/* Space Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      {/* TOP WHITE BAR (Kahoot Style) */}
      <div className="relative z-50 w-full bg-white shadow-2xl flex items-stretch pr-20">
        {/* Instructions */}
        <div className="flex-1 flex flex-col justify-center px-10 py-4 border-r border-slate-100">
          <p className="text-slate-500 text-sm font-bold">Tham gia tại <span className="text-slate-900">fitiuh-events.io.vn</span></p>
          <p className="text-slate-400 text-xs font-medium">hoặc sử dụng ứng dụng IUH!</p>
        </div>

        {/* PIN DISPLAY */}
        <div className="px-12 py-4 flex flex-col items-center justify-center bg-white border-r border-slate-100">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mã PIN trò chơi:</span>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{displayPin}</h2>
        </div>

        {/* QR CODE (Clickable to enlarge) */}
        <div className="p-3 bg-white flex items-center justify-center">
          <button
            onClick={() => setShowLargeQR(true)}
            className="p-1 border-2 border-slate-900 rounded-md hover:scale-110 transition-transform bg-white group relative"
          >
            <QRCode value={joinCode || ""} size={60} />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 size={16} className="text-slate-900" />
            </div>
          </button>
        </div>
      </div>

      {/* CENTER LOGO */}
      <div className="flex-1 flex flex-col items-center justify-start pt-20 relative z-10">
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-20"
        >
          IUH<span className="text-amber-400">!</span>
        </motion.h1>

        {/* PARTICIPANTS GRID */}
        <div className="w-full px-12 pb-20">
          <div className="flex flex-wrap justify-center gap-4">
            <AnimatePresence>
              {participants.map((p, i) => (
                <motion.div
                  key={p.participantAccountId || i}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center bg-black/30 backdrop-blur-md rounded-lg overflow-hidden min-w-[200px] shadow-lg border border-white/5"
                >
                  <div className="w-16 h-16 bg-black/20 flex items-center justify-center text-4xl border-r border-white/5">
                    {p.avatar?.emoji || '👤'}
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <span className="text-white font-black text-lg truncate block max-w-[150px]">
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
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <p className="text-white font-black text-2xl uppercase tracking-widest">Đang đợi người chơi...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE CONTROLS (Floating) - ONLY FOR ORGANIZER */}
      {isOrganizer && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-2xl flex p-1">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-3 rounded-md transition-all ${isLocked ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-400 hover:text-slate-900'}`}
            >
              {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
            <button
              onClick={onFirstQuestion}
              className="px-6 py-3 bg-white text-slate-900 font-black uppercase text-sm hover:bg-slate-50 transition-all border-l border-slate-100"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      )}

      {/* FOOTER PLAYER COUNT */}
      <div className="absolute bottom-8 left-8 z-50 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white">
          <Users size={24} />
        </div>
        <span className="text-3xl font-black text-white">{participants.length}</span>
      </div>

      {/* LARGE QR OVERLAY */}
      <AnimatePresence>
        {showLargeQR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLargeQR(false)}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8"
              onClick={e => e.stopPropagation()}
            >
              <QRCode value={joinCode || ""} size={window.innerHeight * 0.6} />
              <div className="text-center">
                <p className="text-slate-400 font-black uppercase tracking-[0.5em] mb-2 text-xs">Mã PIN dự phòng</p>
                <h2 className="text-6xl font-black text-slate-900 tracking-widest">{joinCode}</h2>
              </div>
              <button
                onClick={() => setShowLargeQR(false)}
                className="mt-4 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Question Screen ──────────────────────────────────────
// Kahoot-style shape/color definitions
const SHAPES = [
  { bg: '#E21B3C', icon: '▲', label: 'Tam giác', shadow: 'shadow-rose-900' },
  { bg: '#1368CE', icon: '◆', label: 'Thoi', shadow: 'shadow-blue-900' },
  { bg: '#D89E00', icon: '●', label: 'Tròn', shadow: 'shadow-yellow-900' },
  { bg: '#26890C', icon: '■', label: 'Vuông', shadow: 'shadow-green-900' },
];

// ─── Timer bar shared ───────────────────────────────────────
const TimerBar = ({ timeLeft, totalTime }) => {
  const pct = (timeLeft / totalTime) * 100;
  const timerColor = timeLeft > 10 ? '#46178F' : timeLeft > 5 ? '#D89E00' : '#E21B3C';
  return (
    <div className="relative h-3 bg-white/10">
      <div
        className="h-full transition-all duration-1000 ease-linear"
        style={{ width: `${pct}%`, backgroundColor: '#fff' }}
      />
    </div>
  );
};

// ─── Question Screen ──────────────────────────────────────
const QuestionScreen = ({ question, isOrganizer, onAnswer, onNext, timeLimit, quizId }) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 30);
  const [answered, setAnswered] = useState(null);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());
  const totalTime = question.timeLimit || 30;

  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(totalTime);
    setAnswered(null);
    setResult(null);
    setDone(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question]);

  const handleAnswer = async (optId) => {
    if (answered || done || isOrganizer) return;
    clearInterval(timerRef.current);
    setAnswered(optId);
    const responseTime = (Date.now() - startRef.current) / 1000;
    try {
      const res = await onAnswer(optId, responseTime);
      setResult(res);
    } catch { }
  };

  const timerColor = timeLeft > 10 ? 'text-white' : timeLeft > 5 ? 'text-amber-300' : 'text-rose-400 animate-pulse';

  // ── ORGANIZER VIEW ──────────────────────────────────────
  if (isOrganizer) {
    return (
      <div className="w-full h-full flex flex-col bg-[#46178F]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-black/30">
          <span className="text-white/60 font-bold text-sm uppercase tracking-widest">
            Câu {(question.orderIndex ?? 0) + 1}
          </span>
          <div className={`text-4xl font-black ${timerColor}`}>{timeLeft}s</div>
          <div className="flex flex-col items-end">
            <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Mã PIN:</span>
            <span className="text-white font-black text-sm tracking-widest">
              {quizId?.substring(0, 6).toUpperCase() || "—— ——"}
            </span>
          </div>
        </div>

        <TimerBar timeLeft={timeLeft} totalTime={totalTime} />

        {/* Question */}
        <div className="bg-white mx-6 mt-5 rounded-2xl px-8 py-5 text-center shadow-2xl">
          <p className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">{question.content}</p>
          {question.hint && (
            <p className="text-sm text-gray-400 mt-2 font-medium">💡 Gợi ý: {question.hint}</p>
          )}
        </div>

        {/* Answer options – full text + correct indicator */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-6">
          {question.type === 'MULTIPLE_CHOICE' && question.options?.map((opt, i) => {
            const shape = SHAPES[i % 4];
            return (
              <div
                key={opt.id}
                style={{ backgroundColor: shape.bg }}
                className={`rounded-2xl text-white font-black text-lg flex items-center gap-4 px-6 py-4 shadow-xl relative
                  ${opt.isCorrect ? 'ring-4 ring-white scale-[1.02]' : 'opacity-90'}`}
              >
                {/* Shape icon */}
                <span className="text-4xl opacity-70 shrink-0">{shape.icon}</span>
                {/* Answer text */}
                <span className="flex-1 leading-snug">{opt.content}</span>
                {/* Correct/Wrong badge */}
                {opt.isCorrect
                  ? <CheckCircle2 size={28} className="shrink-0 text-white drop-shadow" />
                  : <XCircle size={28} className="shrink-0 text-white/40" />
                }
              </div>
            );
          })}

          {question.type === 'WORD_SCRAMBLE' && (
            <div className="col-span-2 flex items-center justify-center">
              <div className="bg-white/10 border-2 border-white/30 rounded-2xl px-8 py-4 text-center">
                <p className="text-white/60 text-sm font-bold uppercase mb-2">Đáp án đúng:</p>
                <p className="text-white font-black text-3xl tracking-widest">{question.correctData}</p>
              </div>
            </div>
          )}
        </div>

        {/* Next question button */}
        <div className="p-5 bg-black/20 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-12 py-4 bg-white text-[#46178F] rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl text-sm"
          >
            Câu tiếp theo <ArrowRight size={22} />
          </motion.button>
        </div>
      </div>
    );
  }

  // ── PLAYER VIEW (Kahoot-style) ──────────────────────────
  return (
    <div className="w-full h-full flex flex-col bg-[#46178F] relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30">
        <span className="text-white/60 font-bold text-xs uppercase tracking-widest">
          Câu {(question.orderIndex ?? 0) + 1}
        </span>
        <div className={`text-4xl font-black ${timerColor}`}>{timeLeft}</div>
        <div className="flex flex-col items-end">
          <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Mã PIN:</span>
          <span className="text-white font-black text-sm tracking-widest">
            {quizId?.substring(0, 6).toUpperCase() || "—— ——"}
          </span>
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} totalTime={totalTime} />

      {/* Question box */}
      <div className="bg-white mx-4 mt-4 rounded-2xl px-6 py-5 text-center shadow-2xl">
        <p className="text-xl md:text-2xl font-black text-gray-900 leading-snug">{question.content}</p>
        {question.hint && (
          <p className="text-xs text-gray-400 mt-1 font-medium">💡 {question.hint}</p>
        )}
      </div>

      {/* Big Kahoot-style buttons — shape only, no answer text */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 pb-6">
        {question.type === 'MULTIPLE_CHOICE' && question.options?.map((opt, i) => {
          const shape = SHAPES[i % 4];
          const isSelected = answered === opt.id;
          const isCorrect = opt.isCorrect;

          let extra = '';
          if (answered) {
            if (isCorrect) extra = 'ring-4 ring-white scale-105';
            else if (!isSelected) extra = 'opacity-30 scale-95';
          }

          return (
            <motion.button
              key={opt.id}
              whileHover={!answered ? { scale: 1.04 } : {}}
              whileTap={!answered ? { scale: 0.96 } : {}}
              onClick={() => handleAnswer(opt.id)}
              disabled={!!answered || done}
              style={{ backgroundColor: shape.bg }}
              className={`rounded-3xl text-white font-black flex flex-col items-center justify-center gap-3 shadow-2xl transition-all ${shape.shadow} ${extra}`}
            >
              {/* Giant shape icon */}
              <span className="text-6xl md:text-7xl" style={{ lineHeight: 1 }}>{shape.icon}</span>

              {/* After answering: reveal answer text */}
              {answered && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-bold text-white/90 px-3 text-center leading-snug"
                >
                  {opt.content}
                </motion.span>
              )}

              {/* Result icons */}
              {answered && isCorrect && <CheckCircle2 size={32} className="text-white drop-shadow-lg" />}
              {answered && isSelected && !isCorrect && <XCircle size={32} className="text-white drop-shadow-lg" />}
            </motion.button>
          );
        })}

        {question.type === 'WORD_SCRAMBLE' && (
          <WordScrambleInline data={question.correctData || ''} onAnswer={handleAnswer} done={!!answered || done} />
        )}
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {answered && result !== null && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className={`absolute bottom-0 left-0 right-0 p-6 text-center ${result?.points > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}
          >
            <p className="text-white font-black text-2xl">
              {result?.points > 0 ? `✅ Chính xác! +${result.points} điểm` : '❌ Sai rồi...'}
            </p>
            <p className="text-white/70 text-sm mt-1">Chờ ban tổ chức chuyển câu tiếp theo...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting state (timer ended without answer) */}
      {done && !answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 p-6 text-center bg-slate-800"
        >
          <p className="text-white font-black text-xl">⏰ Hết giờ!</p>
        </motion.div>
      )}
    </div>
  );
};


// Simple word scramble inline for question screen
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

// ─── Leaderboard (Duck Race) ──────────────────────────────
const LeaderboardScreen = ({ leaderboard, isOrganizer, onNext, onEnd, quizId }) => (
  <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#46178F] to-[#1a0a3b]">
    <div className="flex items-center justify-between px-8 py-5 bg-black/30">
      <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
        🦆 Đua Vịt — Bảng xếp hạng
      </h2>
      <div className="flex flex-col items-end">
        <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Mã PIN:</span>
        <span className="text-white font-black text-lg tracking-widest">
          {quizId?.substring(0, 6).toUpperCase() || "—— ——"}
        </span>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-6">
      {/* Top 3 podium */}
      {leaderboard.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8 h-40">
          {[1, 0, 2].map(pos => {
            const entry = leaderboard[pos];
            if (!entry) return <div key={pos} className="w-28" />;
            const heights = ['h-28', 'h-40', 'h-20'];
            const labels = ['🥇', '🥈', '🥉'];
            const colors = ['bg-amber-500', 'bg-slate-400', 'bg-amber-700'];
            return (
              <motion.div key={pos}
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: pos * 0.15 }}
                className={`flex flex-col items-center justify-end w-28 ${heights[pos]} ${colors[pos]} rounded-t-2xl pb-3 shadow-xl`}>
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
            className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3">
            <span className="text-white/50 font-black text-lg w-7">#{i + 1}</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-lg overflow-hidden">
              {entry.avatar?.emoji || (entry.nickname || entry.fullName)?.[0] || '?'}
            </div>
            <span className="flex-1 text-white font-bold">{entry.nickname || entry.fullName}</span>
            <span className="text-amber-300 font-black text-lg">{entry.totalScore}</span>
          </motion.div>
        ))}
      </div>
    </div>

    {isOrganizer && (
      <div className="p-5 bg-black/30 flex justify-center gap-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext}
          className="px-10 py-4 bg-white text-[#46178F] rounded-2xl font-black uppercase tracking-wider flex items-center gap-2 shadow-xl">
          Tiếp tục <ArrowRight size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onEnd}
          className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl">
          Kết thúc
        </motion.button>
      </div>
    )}
  </div>
);

// ─── Main QuizModal ───────────────────────────────────────
const QuizModal = ({ isOpen, onClose, eventId, isOrganizer, quizId: propQuizId }) => {
  const { user } = useAuth();
  const { quizState, leaderboard, participants, activeQuizId, joinQuiz } = useQuiz(eventId);
  const resolvedQuizId = propQuizId || activeQuizId;
  const [phase, setPhase] = useState('lobby'); // lobby | countdown | question | leaderboard | end
  const [joined, setJoined] = useState(false);
  // Track which quizId the player has already joined to prevent duplicate entries
  const joinedQuizRef = useRef(null);

  // Drive phase from WebSocket state
  useEffect(() => {
    if (!isOpen) return;
    if (quizState.type === 'WAITING') {
      setPhase('lobby');
      // Only reset joined if this is a genuine reset (player hasn't joined this quiz yet)
      // or if the joined quiz is a different one
      if (joinedQuizRef.current !== resolvedQuizId) {
        setJoined(false);
      }
    }
    // START: quiz is now active — guests go to countdown, admin stays in lobby waiting for first question
    if (quizState.type === 'START') setPhase(isOrganizer ? 'lobby' : 'countdown');
    // NEXT_QUESTION: organizer goes to question screen, guests go to countdown first
    if (quizState.type === 'NEXT_QUESTION') setPhase(isOrganizer ? 'question' : 'countdown');
    if (quizState.type === 'LEADERBOARD') setPhase('leaderboard');
    if (quizState.type === 'END') setPhase('end');
  }, [quizState.type, isOpen, isOrganizer]);

  // Reset phase to lobby when modal first opens (in case previous game ended)
  useEffect(() => {
    if (isOpen) {
      setPhase('lobby');
      // If opening for a different quiz, clear join state
      if (resolvedQuizId && joinedQuizRef.current !== resolvedQuizId) {
        setJoined(false);
        joinedQuizRef.current = null;
      }
    }
  }, [isOpen]);

  const handleFirstQuestion = async () => {
    try {
      // Start the quiz (sets isActive=true, broadcasts START)
      await eventService.startQuiz(resolvedQuizId);
      // Send the first question (broadcasts NEXT_QUESTION)
      await eventService.nextQuizQuestion(resolvedQuizId, 0);
    } catch {
      toast.error('Lỗi khi bắt đầu thử thách');
    }
  };

  const handleNextQuestion = () => {
    const idx = (quizState.data?.orderIndex ?? 0) + 1;
    eventService.nextQuizQuestion(resolvedQuizId, idx).catch(() => toast.error('Lỗi'));
  };

  const handleEndQuiz = async () => {
    try {
      await eventService.endQuiz(resolvedQuizId); // call the real end API
    } catch { }
    setPhase('end');
  };

  const handleResetQuiz = async () => {
    try {
      await eventService.resetQuiz(resolvedQuizId);
      // Backend broadcasts WAITING → useEffect resets phase to 'lobby'
      // Clear joinedQuizRef so players can re-enter nickname
      joinedQuizRef.current = null;
      setJoined(false);
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
      setJoined(true);
      joinedQuizRef.current = resolvedQuizId; // Remember this quiz so we don't ask again
      toast.success(`Chào mừng ${nickname}!`);
    } else {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Close button - always visible */}
      <button onClick={onClose}
        className="absolute top-5 right-5 z-[300] p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm">
        <X size={22} />
      </button>

      <AnimatePresence mode="wait">
        {/* NICKNAME ENTRY FOR STUDENTS */}
        {!isOrganizer && !joined && phase !== 'end' && (
          <motion.div key="nick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <NicknameEntry onJoin={handleJoin} defaultNickname={user?.fullName} />
          </motion.div>
        )}

        {/* LOBBY */}
        {phase === 'lobby' && (isOrganizer || joined) && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <LobbyScreen
              isOrganizer={isOrganizer}
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

        {/* QUESTION */}
        {phase === 'question' && !quizState.data && (
          <motion.div key="q-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center bg-[#46178F]">
            <div className="flex gap-3 mb-6">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-5 h-5 bg-white rounded-full"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-white font-black text-2xl uppercase tracking-widest">Đang tải câu hỏi...</p>
          </motion.div>
        )}

        {phase === 'question' && quizState.data && (
          <motion.div key={`q-${quizState.data.id}`} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.35 }} className="w-full h-full">
            <QuestionScreen
              question={quizState.data}
              isOrganizer={isOrganizer}
              onAnswer={handleSubmitAnswer}
              onNext={handleNextQuestion}
              quizId={resolvedQuizId}
            />
          </motion.div>
        )}

        {/* LEADERBOARD */}
        {phase === 'leaderboard' && (
          <motion.div key="lb" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="w-full h-full">
            <LeaderboardScreen
              leaderboard={leaderboard}
              isOrganizer={isOrganizer}
              onNext={handleNextQuestion}
              onEnd={handleEndQuiz}
              quizId={resolvedQuizId}
            />
          </motion.div>
        )}

        {/* END */}
        {phase === 'end' && (
          <motion.div key="end" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#46178F] to-[#1a0a3b]">
            <Trophy size={100} className="text-amber-400 mb-6" fill="currentColor" />
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-3">Kết thúc!</h1>
            <p className="text-white/60 text-lg mb-10">Cảm ơn tất cả đã tham gia 🎉</p>
            <div className="w-full max-w-lg px-6 space-y-2 mb-10 overflow-y-auto max-h-64">
              {leaderboard.slice(0, 10).map((e, i) => (
                <div key={e.participantAccountId || i} className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3">
                  <span className="text-2xl w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <span className="flex-1 text-white font-bold">{e.nickname || e.fullName}</span>
                  <span className="text-amber-300 font-black">{e.totalScore} pts</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {isOrganizer && (
                <button
                  onClick={handleResetQuiz}
                  className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-lg uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Play size={24} fill="currentColor" /> Chơi lại
                </button>
              )}
              <button onClick={onClose} className="px-12 py-4 bg-white text-[#46178F] rounded-2xl font-black text-lg uppercase shadow-2xl hover:scale-105 transition-all">Đóng</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default QuizModal;
