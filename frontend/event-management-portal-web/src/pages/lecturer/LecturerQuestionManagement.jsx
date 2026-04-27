import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp, MessageSquare, Check, X, Clock, Search,
  Filter, ChevronDown, Send, Eye, EyeOff, Trash2
} from "lucide-react";

const MOCK_QUESTIONS = [
  {
    id: 1, author: "Nguyễn Văn A", avatar: "NA", time: "5 phút trước",
    status: "pending", likes: 24, org: "IUH",
    question: "Làm thế nào để áp dụng AI vào dự án thực tế cho sinh viên?",
    reply: "Bạn có thể bắt đầu với các thư viện như TensorFlow hoặc PyTorch và làm các dự án nhỏ như nhận diện chữ viết.",
    hasReply: true,
  },
  {
    id: 2, author: "Trần Thị B", avatar: "TB", time: "8 phút trước",
    status: "pending", likes: 18, org: "IUH",
    question: "Framework nào phù hợp nhất cho người mới bắt đầu học Web?",
    reply: "", hasReply: false,
  },
  {
    id: 3, author: "Lê Minh C", avatar: "LC", time: "12 phút trước",
    status: "approved", likes: 31, org: "IUH",
    question: "Sự khác biệt giữa React và Vue là gì?",
    reply: "React linh hoạt hơn, Vue dễ học hơn. Tùy vào dự án mà chọn phù hợp.",
    hasReply: true,
  },
  {
    id: 4, author: "Phạm Thị D", avatar: "PD", time: "20 phút trước",
    status: "rejected", likes: 5, org: "IUH",
    question: "Câu hỏi trùng lặp về Python cơ bản?",
    reply: "", hasReply: false,
  },
];

const AVATAR_COLORS = ["#3b82f6","#10b981","#8b5cf6","#f43f5e","#f59e0b","#06b6d4"];

const statusConfig = {
  pending:  { label: "Chờ duyệt",  bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200" },
  approved: { label: "Đã hiển thị", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  rejected: { label: "Đã ẩn",      bg: "bg-slate-100", text: "text-slate-500",   border: "border-slate-200" },
};

export default function LecturerQuestionManagement() {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [replies, setReplies] = useState({});

  const stats = {
    pending:  questions.filter(q => q.status === "pending").length,
    approved: questions.filter(q => q.status === "approved").length,
    likes:    questions.reduce((s, q) => s + q.likes, 0),
  };

  const filtered = questions.filter(q => {
    const matchFilter = filter === "all" || q.status === filter;
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
                        q.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const approve = (id) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, status: "approved" } : q));
  const reject  = (id) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, status: "rejected" } : q));
  const remove  = (id) => setQuestions(qs => qs.filter(q => q.id !== id));

  const sendReply = (id) => {
    const text = replies[id]?.trim();
    if (!text) return;
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, reply: text, hasReply: true, status: "approved" } : q));
    setReplies(r => ({ ...r, [id]: "" }));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          Quản lý sự kiện
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
          Duyệt câu hỏi
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "CHỜ DUYỆT", value: stats.pending, color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
          { label: "ĐÃ HIỂN THỊ", value: stats.approved, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "YÊU THÍCH", value: stats.likes, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 14, padding: "18px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: "0.08em" }}>{s.label}</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Quy tắc */}
      <div style={{
        background: "#1e293b", borderRadius: 14, padding: "20px 24px",
        marginBottom: 28, display: "flex", gap: 14, alignItems: "flex-start"
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageSquare size={16} color="#94a3b8" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px" }}>QUY TẮC DUYỆT NỘI DUNG</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", lineHeight: 1.6 }}>Ưu tiên các câu hỏi có lượt Like cao.</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Những câu hỏi trùng lặp hoặc không phù hợp văn hóa học đường nên bị từ chối để làm sạch bảng tin.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Left sidebar filters */}
        <div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16 }}>
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Đang chờ" },
              { key: "approved", label: "Đã ẩn" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                width: "100%", padding: "12px 16px", textAlign: "left",
                fontSize: 13, fontWeight: filter === f.key ? 700 : 500,
                color: filter === f.key ? "#2563eb" : "#64748b",
                background: filter === f.key ? "#eff6ff" : "transparent",
                border: "none", cursor: "pointer",
                borderBottom: "1px solid #f1f5f9",
                transition: "all .15s",
              }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Tìm câu hỏi hoặc tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 36px",
                border: "1px solid #e2e8f0", borderRadius: 10,
                fontSize: 13, outline: "none", background: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Questions list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AnimatePresence>
            {filtered.map((q, i) => {
              const sc = statusConfig[q.status];
              return (
                <motion.div key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}
                >
                  <div style={{ padding: "18px 20px" }}>
                    {/* Author row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                      }}>{q.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{q.author}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#64748b" }}>{q.org}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={11} /> {q.time}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, border: `1px solid`, className: sc.border }}
                        className={`${sc.bg} ${sc.text} ${sc.border}`}>
                        {sc.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                        <ThumbsUp size={13} color="#3b82f6" /> {q.likes}
                      </div>
                    </div>

                    {/* Question */}
                    <p style={{
                      fontSize: 14, color: "#1e293b", fontWeight: 500,
                      margin: "0 0 14px", lineHeight: 1.6,
                      padding: "10px 14px", background: "#f8fafc",
                      borderRadius: 10, borderLeft: "3px solid #e2e8f0"
                    }}>
                      "{q.question}"
                    </p>

                    {/* Existing reply */}
                    {q.hasReply && (
                      <div style={{
                        padding: "10px 14px", background: "#f0fdf4",
                        borderLeft: "3px solid #10b981", borderRadius: 10, marginBottom: 14
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#10b981", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={11} /> Phản hồi từ Admin
                        </p>
                        <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.6 }}>"{q.reply}"</p>
                      </div>
                    )}

                    {/* Reply input */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        placeholder="Nhập nội dung phản hồi trực tiếp..."
                        value={replies[q.id] || ""}
                        onChange={e => setReplies(r => ({ ...r, [q.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && sendReply(q.id)}
                        style={{
                          flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0",
                          borderRadius: 10, fontSize: 13, outline: "none", background: "#f8fafc"
                        }}
                      />
                      <button onClick={() => sendReply(q.id)} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 18px", background: "#1e293b", color: "#fff",
                        border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: "pointer"
                      }}>
                        <Send size={13} /> TRẢ LỜI
                      </button>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div style={{
                    padding: "10px 20px", background: "#f8fafc",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex", gap: 8
                  }}>
                    {q.status !== "approved" && (
                      <button onClick={() => approve(q.id)} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", background: "#f0fdf4", color: "#10b981",
                        border: "1px solid #bbf7d0", borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}>
                        <Eye size={13} /> Duyệt hiển thị
                      </button>
                    )}
                    {q.status !== "rejected" && (
                      <button onClick={() => reject(q.id)} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", background: "#f8fafc", color: "#64748b",
                        border: "1px solid #e2e8f0", borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}>
                        <EyeOff size={13} /> Ẩn câu hỏi
                      </button>
                    )}
                    <button onClick={() => remove(q.id)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", background: "#fff5f5", color: "#ef4444",
                      border: "1px solid #fecaca", borderRadius: 8,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: "auto"
                    }}>
                      <Trash2 size={13} /> Xóa
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <MessageSquare size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Không có câu hỏi nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}