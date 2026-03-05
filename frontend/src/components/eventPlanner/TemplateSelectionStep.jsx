import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight, ChevronLeft, FileEdit, Search, Loader2,
  CheckCircle2, FileText, Sparkles, Wand2, X, Star, TrendingUp
} from "lucide-react";
import { eventTemplateApi } from "../../api/eventTemplateApi";

/* ─── AI Suggestion Panel ──────────────────────────────────────── */
const SmartSuggestionPanel = ({ templates, onSelect, onClose }) => {
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const analyzeDescription = async () => {
    if (description.trim().length < 10) return;

    setIsAnalyzing(true);
    setSuggestions([]);
    setError(null);

    try {
      const templateList = templates
        .filter((t) => t.id !== "0")
        .map((t) => `- ID: ${t.id} | Tên: ${t.templateName} | Mô tả: ${t.description || t.defaultTitle || ""}`)
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

      // Map suggestions back to full template objects
      const enriched = parsed.suggestions
        .map((s) => {
          const tpl =
            s.id === "0"
              ? { id: "0", templateName: "Bản mẫu trống", description: "Bắt đầu kế hoạch mới với thông tin trống." }
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

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    return "text-amber-600 bg-amber-50";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-white" size={20} />
            <span className="text-white font-bold text-base">Gợi ý thông minh</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Input area */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Mô tả sự kiện của bạn
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về sự kiện bạn muốn tổ chức... (VD: Tổ chức workshop về AI cho sinh viên năm 3, 4)"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-slate-400"
            />
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[11px] ${description.length < 10 ? "text-slate-400" : "text-emerald-500"}`}>
                {description.length < 10 ? `Tối thiểu 10 ký tự (còn ${10 - description.length})` : `✓ ${description.length} ký tự`}
              </span>
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={analyzeDescription}
            disabled={description.trim().length < 10 || isAnalyzing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang phân tích...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Phân tích mô tả
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{error}</div>
          )}

          {/* Results */}
          {suggestions?.items?.length > 0 && (
            <div className="mt-5">
              {suggestions.summary && (
                <div className="mb-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-700 flex items-start gap-1.5">
                    <TrendingUp size={13} className="mt-0.5 shrink-0" />
                    {suggestions.summary}
                  </p>
                </div>
              )}

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Mẫu được đề xuất
              </p>

              <div className="flex flex-col gap-2">
                {suggestions.items.map((tpl, i) => (
                  <button
                    key={tpl.id}
                    onClick={() => { onSelect(tpl); onClose(); }}
                    className="group text-left flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    {/* Rank badge */}
                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                      {i === 0 ? <Star size={13} /> : i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[13px] text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                          {tpl.templateName}
                        </span>
                        <span className={`shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full ${scoreColor(tpl.score)}`}>
                          {tpl.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.reason}</p>
                    </div>

                    <ChevronRight size={14} className="shrink-0 text-slate-300 group-hover:text-blue-400 mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-in { animation: animate-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────────────── */
export const TemplateSelectionStep = ({ onTemplateSelect, onNext, organizationId }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const [searchMode, setSearchMode] = useState("manual"); // "manual" | "smart"
  const [pageData, setPageData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await eventTemplateApi.getAllTemplates(organizationId, searchTerm, pageNumber, 6);
      const emptyTemplate = {
        id: "0",
        templateName: "Bản mẫu trống",
        defaultTitle: "",
        description: "Bắt đầu kế hoạch mới với thông tin trống.",
      };
      const processedContent = pageNumber === 0 ? [emptyTemplate, ...response.content] : response.content;
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

  const handleSmartSelect = (template) => {
    handleSelect(template);
    // Scroll to / highlight the card if visible
  };

  if (loading && pageData.content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="text-blue-600 animate-spin" size={32} />
        <p className="text-slate-500 text-sm">Đang tải bản mẫu...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-8">
      {/* Smart panel overlay */}
      {showSmartPanel && (
        <SmartSuggestionPanel
          templates={pageData.content}
          onSelect={handleSmartSelect}
          onClose={() => setShowSmartPanel(false)}
        />
      )}

      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
          <FileEdit className="text-blue-600" size={18} />
          Chọn mẫu kế hoạch
        </h2>
        <p className="text-slate-500 text-sm mt-1">Chọn một mẫu phù hợp để bắt đầu tạo kế hoạch sự kiện</p>
      </div>

      {/* Search mode toggle + input */}
      <div className="mb-5 max-w-xl mx-auto">
        {/* Toggle tabs */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 mb-3">
          <button
            onClick={() => setSearchMode("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              searchMode === "manual"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Search size={13} />
            Tìm thủ công
          </button>
          <button
            onClick={() => { setSearchMode("smart"); setShowSmartPanel(true); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              searchMode === "smart"
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles size={13} />
            Gợi ý thông minh
          </button>
        </div>

        {/* Manual search input */}
        {searchMode === "manual" && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* Smart mode hint */}
        {searchMode === "smart" && (
          <button
            onClick={() => setShowSmartPanel(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm text-blue-600 hover:from-blue-100 hover:to-indigo-100 transition-all"
          >
            <Wand2 size={15} />
            <span className="font-medium">Mô tả sự kiện để AI gợi ý mẫu phù hợp...</span>
            <ChevronRight size={14} className="ml-auto" />
          </button>
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-70">
        {pageData.content.map((t) => {
          const isSelected = selectedTemplateId === t.id;
          const isEmpty = t.id === "0";
          return (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-slate-50"
              } ${isEmpty ? "border-dashed" : ""}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="text-blue-500" size={20} />
                </div>
              )}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isSelected ? "bg-blue-100" : "bg-slate-100"}`}>
                <FileText className={isSelected ? "text-blue-600" : "text-slate-400"} size={14} />
              </div>
              <span className={`font-semibold text-[13px] mb-1 ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                {t.templateName}
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {t.description || t.defaultTitle}
              </span>
              {t.templateType && t.id !== "0" && (
                <span className="mt-3 self-start px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wide">
                  {t.templateType}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 px-1">
        <span className="text-[11px] text-slate-500">
          Tổng: <strong>{pageData.totalElements}</strong> mẫu
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={pageData.number === 0 || loading}
            onClick={() => fetchTemplates(pageData.number - 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-700">
            Trang {pageData.number + 1} / {pageData.totalPages || 1}
          </span>
          <button
            disabled={pageData.number + 1 >= pageData.totalPages || loading}
            onClick={() => fetchTemplates(pageData.number + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-6 flex justify-center">
        <button
          disabled={selectedTemplateId === null}
          onClick={onNext}
          className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 disabled:shadow-none"
        >
          Tiếp theo
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};