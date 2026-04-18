import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Loader2,
  Sparkles,
  Wand2,
  X,
  Star,
  TrendingUp,
  ArrowRight,
  Check,
} from "lucide-react";
import { contentApi } from "../../api/contentApi";

const SmartSuggestionPanel = ({ templates, onSelect, onClose }) => {
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const analyzeDescription = async () => {
    if (description.trim().length < 10) return;
    setIsAnalyzing(true);
    setSuggestions(null);
    setError(null);

    try {
      const templateList = templates
        .filter((t) => t.id !== "0")
        .map(
          (t) =>
            `- ID: ${t.id} | Tên: ${t.templateName} | Mô tả: ${t.description || t.defaultTitle || ""}`,
        )
        .join("\n");

      const prompt = `Bạn là trợ lý gợi ý mẫu kế hoạch sự kiện. Người dùng mô tả sự kiện như sau:
"${description}"

Danh sách mẫu có sẵn:
${templateList || "Không có mẫu nào (chỉ có mẫu trống)."}

Hãy gợi ý tối đa 3 mẫu phù hợp nhất. Trả về JSON (không markdown):
{
  "suggestions": [
    {
      "id": "<id của mẫu, dùng '0' nếu là mẫu trống>",
      "score": <điểm phù hợp 1-100>,
      "reason": "<lý do ngắn gọn bằng tiếng Việt, 1-2 câu>"
    }
  ],
  "summary": "<nhận xét tổng quan ngắn về sự kiện, 1 câu>"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const enriched = parsed.suggestions
        .map((s) => {
          const tpl =
            s.id === "0"
              ? {
                  id: "0",
                  templateName: "Bản mẫu trống",
                  description: "Bắt đầu kế hoạch mới với thông tin trống.",
                }
              : templates.find((t) => String(t.id) === String(s.id));
          if (!tpl) return null;
          return { ...tpl, score: s.score, reason: s.reason };
        })
        .filter(Boolean);

      setSuggestions({ items: enriched, summary: parsed.summary });
    } catch (e) {
      console.error(e);
      setError("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreBadge = (score) => {
    if (score >= 80) return { bg: "#f0fdf4", color: "#16a34a" };
    if (score >= 60) return { bg: "#eff6ff", color: "#2563eb" };
    return { bg: "#fffbeb", color: "#d97706" };
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
          animation: "panelUp .2s ease",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={15} color="#2563eb" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
              Gợi ý thông minh
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              borderRadius: 6,
              transition: "all .12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#555";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#aaa";
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Mô tả sự kiện
          </p>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Workshop về AI cho sinh viên năm 3, quy mô 50 người..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              fontSize: 13,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              color: "#111",
              lineHeight: 1.6,
              boxSizing: "border-box",
              transition: "border .15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e5e5";
              e.target.style.background = "#fafafa";
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: description.length < 10 ? "#bbb" : "#22c55e",
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            {description.length < 10
              ? `Còn ${10 - description.length} ký tự`
              : `✓ ${description.length} ký tự`}
          </div>

          <button
            onClick={analyzeDescription}
            disabled={description.trim().length < 10 || isAnalyzing}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              border: "none",
              borderRadius: 10,
              cursor:
                description.trim().length < 10 || isAnalyzing
                  ? "not-allowed"
                  : "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: 13,
              transition: "all .15s",
              background:
                description.trim().length >= 10 && !isAnalyzing
                  ? "#2563eb"
                  : "#f0f0f0",
              color:
                description.trim().length >= 10 && !isAnalyzing
                  ? "#fff"
                  : "#bbb",
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2
                  size={13}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Đang phân tích...
              </>
            ) : (
              <>
                <Wand2 size={13} /> Phân tích
              </>
            )}
          </button>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: 8,
                fontSize: 12,
                color: "#e11d48",
              }}
            >
              {error}
            </div>
          )}

          {suggestions?.items?.length > 0 && (
            <div style={{ marginTop: 18, animation: "panelUp .25s ease" }}>
              {suggestions.summary && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "#eff6ff",
                    border: "1px solid #dbeafe",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <TrendingUp
                    size={13}
                    color="#2563eb"
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <span
                    style={{ fontSize: 12, color: "#1d4ed8", lineHeight: 1.5 }}
                  >
                    {suggestions.summary}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Gợi ý
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestions.items.map((tpl, i) => {
                  const badge = scoreBadge(tpl.score);
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        onSelect(tpl);
                        onClose();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        border: "1px solid #ebebeb",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        transition: "all .12s",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#bfdbfe";
                        e.currentTarget.style.background = "#f8fbff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#ebebeb";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: i === 0 ? "#fef3c7" : "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i === 0 ? (
                          <Star size={12} color="#d97706" fill="#d97706" />
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#aaa",
                            }}
                          >
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111",
                            }}
                          >
                            {tpl.templateName}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 7px",
                              borderRadius: 99,
                              background: badge.bg,
                              color: badge.color,
                            }}
                          >
                            {tpl.score}%
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#999",
                            lineHeight: 1.4,
                            margin: 0,
                          }}
                        >
                          {tpl.reason}
                        </p>
                      </div>
                      <ChevronRight size={13} color="#ddd" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes panelUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

const TemplateCard = ({ template: t, isSelected, isEmpty, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(t)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 18,
        border: `1px ${isEmpty ? "dashed" : "solid"} ${isSelected ? "#2563eb" : hovered ? "#d0d0d0" : "#ebebeb"}`,
        borderRadius: 12,
        cursor: "pointer",
        background: isSelected ? "#f0f7ff" : "#fff",
        transition: "all .15s",
        position: "relative",
        boxShadow:
          hovered && !isSelected ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
        display: "flex",
        flexDirection: "column",
        minHeight: "140px",
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={10} color="#fff" strokeWidth={3} />
        </div>
      )}

      {t.templateType && (
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#bbb",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 10px",
          }}
        >
          {t.templateType}
        </p>
      )}

      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: isSelected ? "#1d4ed8" : "#111",
          margin: "0 0 6px",
          letterSpacing: "-0.01em",
        }}
      >
        {t.templateName}
      </p>

      <p
        style={{
          fontSize: 12,
          color: "#999",
          margin: "0 0 12px",
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {t.description || t.defaultTitle}
      </p>

      {!isEmpty && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: "auto",
          }}
        >
          <TrendingUp
            size={12}
            color={t.usageCount > 50 ? "#22c55e" : "#bbb"}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.usageCount > 50 ? "#16a34a" : "#aaa",
            }}
          >
            {t.usageCount || 0} lượt dùng
          </span>
        </div>
      )}
    </div>
  );
};

export const TemplateSelectionStep = ({
  onTemplateSelect,
  onNext,
  organizationId,
}) => {
  const eventTypeLabels = {
    WORKSHOP: "Workshop",
    SEMINAR: "Seminar",
    TALKSHOW: "Talkshow",
    COMPETITION: "Cuộc thi",
    CONFERENCE: "Hội nghị",
    WEBINAR: "Webinar",
    CONCERT: "Buổi biểu diễn",
    OTHER: "Khác",
  };

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const [activeType, setActiveType] = useState("TẤT CẢ");
  const [pageData, setPageData] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);

  const eventTypes = [
    "TẤT CẢ",
    "WORKSHOP",
    "SEMINAR",
    "TALKSHOW",
    "COMPETITION",
    "CONFERENCE",
    "WEBINAR",
    "CONCERT",
    "OTHER",
  ];

  const fetchTemplates = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await contentApi.templates.getAll(
        organizationId,
        searchTerm,
        pageNumber,
        6
      );
      const emptyTemplate = {
        id: "0",
        templateName: "Bản mẫu trống",
        defaultTitle: "",
        description: "Bắt đầu kế hoạch mới với thông tin hoàn toàn trống.",
      };

      const processedContent =
        pageNumber === 0
          ? [emptyTemplate, ...(response.content || [])]
          : (response.content || []);

      setPageData({ ...response, content: processedContent });
    } catch (error) {
      console.error("Lỗi khi tải bản mẫu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchTemplates(0);
  }, [organizationId, searchTerm]);

  const handleSelect = (template) => {
    setSelectedTemplateId(template.id);
    onTemplateSelect(template);
  };

  const getDisplayTemplates = () => {
    let list = [...pageData.content];
    if (activeType !== "TẤT CẢ") {
      list = list.filter(
        (t) => t.id === "0" || t.templateType === activeType
      );
    }
    return list;
  };

  if (loading && pageData.content.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          gap: 12,
        }}
      >
        <Loader2
          size={26}
          color="#2563eb"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p
          style={{
            fontSize: 13,
            color: "#aaa",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Đang tải bản mẫu...
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const displayed = getDisplayTemplates();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      {showSmartPanel && (
        <SmartSuggestionPanel
          templates={pageData.content}
          onSelect={handleSelect}
          onClose={() => setShowSmartPanel(false)}
        />
      )}

      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            color: "#bbb",
            fontWeight: 500,
            marginBottom: 6,
            letterSpacing: "0.04em",
            margin: "0 0 6px",
          }}
        >
          Bước 1 / 3
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#111",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Chọn bản mẫu
        </h2>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          Chọn một mẫu để bắt đầu tạo kế hoạch sự kiện
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <Search
            size={14}
            color="#ccc"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              background: "#fff",
              color: "#111",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border .15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
          />
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .12s",
                borderColor: activeType === type ? "#2563eb" : "#e5e5e5",
                background: activeType === type ? "#eff6ff" : "#fff",
                color: activeType === type ? "#2563eb" : "#666",
              }}
            >
              {eventTypeLabels[type] || type}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowSmartPanel(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            background: "#111",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Sparkles size={13} /> AI gợi ý
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          opacity: loading ? 0.5 : 1,
          transition: "opacity .2s",
        }}
      >
        {displayed.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSelected={selectedTemplateId === t.id}
            isEmpty={t.id === "0"}
            onSelect={handleSelect}
          />
        ))}

        {displayed.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "48px 0",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#999",
                margin: "0 0 4px",
              }}
            >
              Không tìm thấy mẫu
            </p>
            <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>
              Thử thay đổi từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid #f0f0f0",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "#bbb" }}>
          {pageData.totalElements} bản mẫu
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#fafafa",
            padding: 4,
            borderRadius: 10,
            border: "1px solid #ebebeb",
          }}
        >
          <button
            disabled={pageData.number === 0 || loading}
            onClick={() => fetchTemplates(pageData.number - 1)}
            style={{
              width: 30,
              height: 30,
              border: "none",
              background: "none",
              cursor:
                pageData.number === 0 || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: pageData.number === 0 ? "#ddd" : "#555",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => {
              if (pageData.number > 0 && !loading)
                e.currentTarget.style.background = "#fff";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <ChevronLeft size={15} />
          </button>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#555",
              padding: "0 12px",
            }}
          >
            {pageData.number + 1} / {pageData.totalPages || 1}
          </span>
          <button
            disabled={pageData.number + 1 >= pageData.totalPages || loading}
            onClick={() => fetchTemplates(pageData.number + 1)}
            style={{
              width: 30,
              height: 30,
              border: "none",
              background: "none",
              cursor:
                pageData.number + 1 >= pageData.totalPages || loading
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                pageData.number + 1 >= pageData.totalPages ? "#ddd" : "#555",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => {
              if (pageData.number + 1 < pageData.totalPages && !loading)
                e.currentTarget.style.background = "#fff";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <button
          disabled={selectedTemplateId === null}
          onClick={onNext}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            fontFamily: "inherit",
            fontWeight: 500,
            fontSize: 13,
            cursor: selectedTemplateId ? "pointer" : "not-allowed",
            transition: "all .15s",
            background: selectedTemplateId ? "#2563eb" : "#f0f0f0",
            color: selectedTemplateId ? "#fff" : "#bbb",
          }}
          onMouseEnter={(e) => {
            if (selectedTemplateId)
              e.currentTarget.style.background = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            if (selectedTemplateId)
              e.currentTarget.style.background = "#2563eb";
          }}
        >
          Tiếp theo <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: #ccc; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};