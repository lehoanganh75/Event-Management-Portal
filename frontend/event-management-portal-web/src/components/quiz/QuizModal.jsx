import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, ArrowRight, Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';
import { useQuiz } from '../../hooks/useQuiz';
import DuckRace from './DuckRace';

// Kahoot shapes & colors
const SHAPES = [
  { bg: '#E21B3C', icon: '▲', label: 'A' },
  { bg: '#1368CE', icon: '◆', label: 'B' },
  { bg: '#D89E00', icon: '●', label: 'C' },
  { bg: '#26890C', icon: '■', label: 'D' },
];

// ─── Countdown 3-2-1 ─────────────────────────────────────
const Countdown = ({ onDone }) => {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#46178F]">
      <AnimatePresence mode="wait">
        <motion.div key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[200px] font-black text-white leading-none"
        >
          {count === 0 ? '🚀' : count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Lobby ────────────────────────────────────────────────
const LobbyScreen = ({ isOrganizer, quizId, onFirstQuestion }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#46178F] relative overflow-hidden">
    {/* Floating dots background */}
    {[...Array(15)].map((_, i) => (
      <motion.div key={i}
        className="absolute rounded-full bg-white/10"
        style={{ width: 8 + (i % 4) * 8, height: 8 + (i % 4) * 8, left: `${(i * 7) % 100}%`, top: `${(i * 11) % 100}%` }}
        animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3 + i * 0.3, repeat: Infinity }}
      />
    ))}

    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
      className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8 shadow-2xl border-4 border-white/30">
      <Trophy size={64} className="text-amber-300" fill="currentColor" />
    </motion.div>

    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">Phòng Chờ</h1>
    <p className="text-white/70 text-lg mb-12">Đang chờ ban tổ chức bắt đầu...</p>

    <div className="flex gap-3 mb-16">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-5 h-5 bg-white rounded-full"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>

    {isOrganizer && (
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onFirstQuestion}
        className="px-16 py-5 bg-white text-[#46178F] rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl flex items-center gap-3">
        <Zap size={26} fill="currentColor" /> Bắt đầu ngay!
      </motion.button>
    )}
  </div>
);

// ─── Question Screen ──────────────────────────────────────
const QuestionScreen = ({ question, isOrganizer, onAnswer, onNext, timeLimit }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit || 30);
  const [answered, setAnswered] = useState(null);
  const [result, setResult] = useState(null); // {points, correct}
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(question.timeLimit || 30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question]);

  const handleAnswer = async (optId) => {
    if (answered || done) return;
    clearInterval(timerRef.current);
    setAnswered(optId);
    const responseTime = (Date.now() - startRef.current) / 1000;
    try {
      const res = await onAnswer(optId, responseTime);
      setResult(res);
    } catch { }
  };

  const pct = ((question.timeLimit || 30) - timeLeft) / (question.timeLimit || 30);
  const timerColor = timeLeft > 10 ? '#46178F' : timeLeft > 5 ? '#D89E00' : '#E21B3C';

  return (
    <div className="w-full h-full flex flex-col bg-[#46178F]">
      {/* Timer + question number bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-black/30">
        <span className="text-white/60 font-bold text-sm uppercase tracking-widest">
          Câu {(question.orderIndex ?? 0) + 1}
        </span>

        {/* Circular timer */}
        <div className="relative w-16 h-16">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke="white" strokeOpacity="0.2" strokeWidth="6" fill="none" />
            <circle cx="32" cy="32" r="28" stroke={timerColor} strokeWidth="6" fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * pct}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center font-black text-xl ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}
          </span>
        </div>

        <div className="w-20" />
      </div>

      {/* Timer progress bar */}
      <div className="h-2 bg-white/10">
        <motion.div className="h-full bg-white/80" style={{ width: `${(timeLeft / (question.timeLimit || 30)) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }} />
      </div>

      {/* Question text */}
      <div className="bg-white mx-6 mt-6 rounded-2xl px-8 py-6 text-center shadow-2xl">
        <p className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">{question.content}</p>
        {question.hint && (
          <p className="text-sm text-gray-400 mt-2 font-medium">💡 Gợi ý: {question.hint}</p>
        )}
      </div>

      {/* Answers */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-6">
        {question.type === 'MULTIPLE_CHOICE' && question.options?.map((opt, i) => {
          const shape = SHAPES[i % 4];
          const isSelected = answered === opt.id;
          const isCorrect = opt.isCorrect;
          let cls = 'opacity-100';
          if (answered && !isSelected && !isCorrect) cls = 'opacity-40 scale-95';
          if (answered && isCorrect) cls = 'ring-4 ring-white';

          return (
            <motion.button key={opt.id}
              whileHover={!answered ? { scale: 1.03 } : {}}
              whileTap={!answered ? { scale: 0.97 } : {}}
              onClick={() => handleAnswer(opt.id)}
              disabled={!!answered || done}
              style={{ backgroundColor: shape.bg }}
              className={`rounded-2xl text-white font-black text-lg flex flex-col items-center justify-center gap-2 p-4 shadow-xl relative transition-all ${cls}`}
            >
              <span className="text-3xl opacity-50">{shape.icon}</span>
              <span className="text-center leading-tight">{opt.content}</span>
              {answered && isCorrect && <CheckCircle2 size={28} className="absolute top-3 right-3 text-white" />}
              {answered && isSelected && !isCorrect && <XCircle size={28} className="absolute top-3 right-3 text-white" />}
            </motion.button>
          );
        })}

        {question.type === 'WORD_SCRAMBLE' && (
          <WordScrambleInline data={question.correctData || ''} onAnswer={handleAnswer} done={!!answered || done} />
        )}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {answered && result !== null && !isOrganizer && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className={`absolute bottom-0 left-0 right-0 p-6 text-center ${result?.points > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            <p className="text-white font-black text-2xl">
              {result?.points > 0 ? `✅ Chính xác! +${result.points} điểm` : '❌ Sai rồi...'}
            </p>
            <p className="text-white/80 text-sm mt-1">Chờ câu tiếp theo...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organizer next button */}
      {isOrganizer && (
        <div className="p-4 flex justify-center bg-black/20">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-3 bg-white text-[#46178F] rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
            Câu tiếp theo <ArrowRight size={20} />
          </motion.button>
        </div>
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
const LeaderboardScreen = ({ leaderboard, isOrganizer, onNext, onEnd }) => (
  <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#46178F] to-[#1a0a3b]">
    <div className="flex items-center justify-between px-8 py-5 bg-black/30">
      <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
        🦆 Đua Vịt — Bảng xếp hạng
      </h2>
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
                <p className="text-white font-black text-xs text-center truncate w-full px-2">{entry.fullName}</p>
                <p className="text-white/80 font-bold text-xs">{entry.totalScore} pts</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, i) => (
          <motion.div key={entry.participantAccountId}
            initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3">
            <span className="text-white/50 font-black text-lg w-7">#{i + 1}</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-lg">
              {entry.fullName?.[0] || '?'}
            </div>
            <span className="flex-1 text-white font-bold">{entry.fullName}</span>
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
  const { quizState, leaderboard, activeQuizId } = useQuiz(eventId);
  const resolvedQuizId = propQuizId || activeQuizId;
  const [phase, setPhase] = useState('lobby'); // lobby | countdown | question | leaderboard | end

  // Drive phase from WebSocket state
  useEffect(() => {
    if (!isOpen) return;
    if (quizState.type === 'WAITING') setPhase('lobby');
    if (quizState.type === 'START') setPhase(isOrganizer ? 'lobby' : 'countdown');
    if (quizState.type === 'NEXT_QUESTION') setPhase(isOrganizer ? 'question' : 'countdown');
    if (quizState.type === 'LEADERBOARD') setPhase('leaderboard');
    if (quizState.type === 'END') setPhase('end');
  }, [quizState.type, isOpen]);

  const handleFirstQuestion = () => {
    eventService.nextQuizQuestion(resolvedQuizId, 0).catch(() => toast.error('Lỗi'));
  };

  const handleNextQuestion = () => {
    const idx = (quizState.data?.orderIndex ?? 0) + 1;
    eventService.nextQuizQuestion(resolvedQuizId, idx).catch(() => toast.error('Lỗi'));
  };

  const handleEndQuiz = async () => {
    try {
      await eventService.startQuiz(resolvedQuizId); // call end if available, fallback
      setPhase('end');
    } catch { setPhase('end'); }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Close button - always visible */}
      <button onClick={onClose}
        className="absolute top-5 right-5 z-[200] p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm">
        <X size={22} />
      </button>

      <AnimatePresence mode="wait">
        {/* LOBBY */}
        {phase === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <LobbyScreen isOrganizer={isOrganizer} quizId={resolvedQuizId} onFirstQuestion={handleFirstQuestion} />
          </motion.div>
        )}

        {/* COUNTDOWN → then show question */}
        {phase === 'countdown' && (
          <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <Countdown onDone={() => setPhase('question')} />
          </motion.div>
        )}

        {/* QUESTION */}
        {phase === 'question' && quizState.data && (
          <motion.div key={`q-${quizState.data.id}`} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.35 }} className="w-full h-full">
            <QuestionScreen
              question={quizState.data}
              isOrganizer={isOrganizer}
              onAnswer={handleSubmitAnswer}
              onNext={handleNextQuestion}
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
            />
          </motion.div>
        )}

        {/* END */}
        {phase === 'end' && (
          <motion.div key="end" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#46178F] to-[#1a0a3b]">
            <Trophy size={100} className="text-amber-400 mb-6" fill="currentColor" />
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-3">Kết thúc!</h1>
            <p className="text-white/60 text-lg mb-10">Cảm ơn tất cả đã tham gia 🎉</p>
            <div className="w-full max-w-lg px-6 space-y-2 mb-10">
              {leaderboard.slice(0, 3).map((e, i) => (
                <div key={e.participantAccountId} className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3">
                  <span className="text-3xl">{['🥇', '🥈', '🥉'][i]}</span>
                  <span className="flex-1 text-white font-bold">{e.fullName}</span>
                  <span className="text-amber-300 font-black">{e.totalScore} pts</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="px-12 py-4 bg-white text-[#46178F] rounded-2xl font-black text-lg uppercase">Đóng</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizModal;
