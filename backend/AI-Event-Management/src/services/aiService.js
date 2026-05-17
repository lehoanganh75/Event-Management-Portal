const {
  genAI,
  getGeminiModel,
  GEMINI_MODELS,
  GEMINI_EMBEDDING_MODELS,
  GEMINI_API_KEY,
  OLLAMA_URL,
  OLLAMA_MODEL,
} = require("../config/ai");

const { getEventCache, loadEventDataOnce } = require("./eventCacheService");

const toSafeString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" && Number.isNaN(val)) return "";
  return String(val);
};

const isLimitError = (error) => {
  const msg = (error?.message || "").toLowerCase();

  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("429")
  );
};

const isEventQuery = (prompt = "") => {
  return /sự kiện|event|workshop|đăng ký|diễn ra|lịch|địa điểm|check-?in|lucky|hội thảo|tham gia|tổ chức|diễn giả|người tham gia/i.test(
    prompt
  );
};

const isExternalDataPrompt = (prompt = "") => {
  return /dữ liệu\s*:|dữ liệu sự kiện\s*:|eventdetails|thông tin sự kiện sau|hãy viết|bài đăng truyền thông|facebook|linkedin|generate|lập kế hoạch|mẫu sự kiện|template/i.test(
    prompt
  );
};

const pickRelevantEventsFromCache = (eventDbContext = "", userPrompt = "", limit = 5) => {
  const text = toSafeString(eventDbContext);

  if (!text) return "Hiện tại hệ thống chưa có dữ liệu sự kiện.";

  // Split but keep the stats block separate
  const parts = text.split(/\[THỐNG KÊ NGƯỜI THAM GIA NHIỀU NHẤT\]/i);
  const eventData = parts[0];
  const statsData = parts.length > 1 ? "[THỐNG KÊ NGƯỜI THAM GIA NHIỀU NHẤT]" + parts[1] : "";

  const blocks = eventData
    .split(/-+\n|\n-{5,}\n|\[SỰ KIỆN\s+\d+\]/i)
    .map((x) => x.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return statsData || "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
  }

  const lowerPrompt = userPrompt.toLowerCase();

  let filtered = blocks;

  if (
    lowerPrompt.includes("sắp diễn ra") ||
    lowerPrompt.includes("sắp tới") ||
    lowerPrompt.includes("mở đăng ký") ||
    lowerPrompt.includes("workshop") ||
    lowerPrompt.includes("event")
  ) {
    filtered = blocks.filter((b) =>
      /PUBLISHED|ONGOING|Đã công bố|Đang diễn ra/i.test(b)
    );
  }

  if (filtered.length === 0) {
    filtered = blocks;
  }

  const result = filtered.slice(0, limit).join("\n\n---\n\n");
  
  return statsData ? result + "\n\n" + statsData : result;
};

const buildGeminiSystemInstruction = ({
  eventDbContext,
  pdfContext,
  isExtraction,
  shouldUseEventDb,
}) => {
  const dbContext =
    shouldUseEventDb
      ? toSafeString(eventDbContext) || "Hiện tại hệ thống chưa có dữ liệu sự kiện."
      : "";

  const safePdfContext = toSafeString(pdfContext);

  return `
Bạn là trợ lý AI cao cấp của Hệ thống Quản lý Sự kiện IUH - Đại học Công nghiệp TP.HCM.

VAI TRÒ:
- Hỗ trợ tra cứu sự kiện, hướng dẫn đăng ký, tóm tắt nội dung và tạo nội dung truyền thông.
- Khi có EVENT_DB, chỉ trả lời sự kiện dựa trên EVENT_DB.
- Khi người dùng đã cung cấp dữ liệu riêng trong prompt, ưu tiên dữ liệu trong prompt của người dùng.
- Không tự bịa thời gian, địa điểm, link, số lượng hoặc trạng thái.

QUY TẮC:
- Trả lời bằng tiếng Việt.
- Không dùng dấu **.
- Nếu không có dữ liệu phù hợp, nói: "Hiện tại hệ thống chưa cập nhật thông tin này."
- Với yêu cầu tạo JSON, chỉ trả JSON hợp lệ, không markdown.

DỊCH TRẠNG THÁI:
PUBLISHED => Đã công bố
ONGOING => Đang diễn ra
COMPLETED => Đã kết thúc
CANCELLED => Đã hủy
DRAFT => Bản nháp

${isExtraction ? `
CHẾ ĐỘ TRÍCH XUẤT:
- Chỉ trả JSON hợp lệ.
- Không markdown.
- Không giải thích thêm.
` : ""}

${dbContext ? `
EVENT_DB:
${dbContext}
` : ""}

${safePdfContext ? `
TÀI LIỆU PDF/DOCX:
${safePdfContext}
` : ""}

Hãy trả lời dựa trên dữ liệu có sẵn.
`.trim();
};

const buildOllamaSystemInstruction = ({
  eventDbContext,
  pdfContext,
  isExtraction,
  shouldUseEventDb,
}) => {
  const dbContext =
    shouldUseEventDb
      ? toSafeString(eventDbContext) || "Hiện tại hệ thống chưa có dữ liệu sự kiện."
      : "";

  const safePdfContext = toSafeString(pdfContext);

  return `
Bạn là trợ lý AI của hệ thống sự kiện IUH.

QUY TẮC:
- Trả lời tiếng Việt, ngắn gọn, rõ ràng.
- Không dùng dấu **.
- Không tự bịa thông tin sự kiện.
- Nếu người dùng đã cung cấp dữ liệu trong prompt, ưu tiên dữ liệu đó.
- Nếu hỏi sự kiện và có EVENT_DB, chỉ dùng EVENT_DB.
- Nếu không có dữ liệu phù hợp, trả lời: "Hiện tại hệ thống chưa cập nhật thông tin này."
- Nếu yêu cầu JSON, chỉ trả JSON hợp lệ, không markdown.

FORMAT SỰ KIỆN NGẮN:
🏷️ Tên sự kiện: [TITLE]
⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]
📅 Bắt đầu: [START_TIME]
📅 Kết thúc: [END_TIME]
📍 Địa điểm: [LOCATION]
📌 Trạng thái: [STATUS]
🔗 Chi tiết: https://fitiuh-events.io.vn/events/[ID]

${isExtraction ? "CHẾ ĐỘ JSON: Chỉ trả JSON hợp lệ." : ""}

${dbContext ? `
EVENT_DB:
${dbContext}
` : ""}

${safePdfContext ? `
PDF/DOCX:
${safePdfContext}
` : ""}
`.trim();
};

const cleanJsonResponse = (text) => {
  if (!text) return "";
  let clean = text.trim();

  // Remove markdown code blocks if present
  if (clean.includes("```")) {
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      clean = match[1].trim();
    } else {
      // If we can't find a proper block, just strip the backticks
      clean = clean.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    }
  }

  // Remove any leading/trailing text that isn't part of the JSON object/array
  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");
  const lastBrace = clean.lastIndexOf("}");
  const lastBracket = clean.lastIndexOf("]");

  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = lastBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = lastBracket;
  }

  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.substring(start, end + 1);
  }

  return clean;
};

const tryRepairTruncatedJson = (json) => {
  if (!json || typeof json !== "string") return json;
  let trimmed = cleanJsonResponse(json);

  // Basic attempt to close unclosed strings and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === '"' && (i === 0 || trimmed[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }

  let repaired = trimmed;

  if (inString) {
    repaired += '"';
  }

  repaired = repaired.trim().replace(/,$/, "");

  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  return repaired;
};

const askGemini = async ({ systemInstruction, userPrompt, isExtraction }) => {
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Gemini] Đang thử model: ${modelName}`);

      const model = getGeminiModel(modelName, isExtraction);

      if (!model) {
        console.warn(`[Gemini] Model ${modelName} không khởi tạo được`);
        continue;
      }

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nUser: ${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: isExtraction ? 4096 : 2048,
          temperature: isExtraction ? 0.1 : 0.7,
        },
      });

      let reply = result.response.text();
      if (isExtraction) {
        reply = tryRepairTruncatedJson(reply);
      }

      return {
        provider: "gemini",
        model: modelName,
        reply: reply,
      };
    } catch (error) {
      console.warn(`[Gemini] Model ${modelName} thất bại: ${error.message}`);

      if (isLimitError(error)) {
        console.warn(`[Gemini] Model ${modelName} hết quota/rate limit`);
      }
    }
  }

  return null;
};

const askOllama = async ({ systemInstruction, userPrompt, isExtraction }) => {
  console.log("Using Ollama fallback...");

  const modelName = OLLAMA_MODEL || "qwen2.5:3b";

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        stream: false,
        keep_alive: "30m",
        options: {
          temperature: isExtraction ? 0.1 : 0.3,
          num_ctx: Number(process.env.OLLAMA_NUM_CTX) || 8192,
          num_predict: isExtraction ? 4096 : 1024,
          top_k: 20,
          top_p: 0.8,
          repeat_penalty: 1.15,
          num_thread: Number(process.env.OLLAMA_NUM_THREAD) || 4,
          stop: ["User:", "System:", "Assistant:", "Người dùng:"],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama error ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = await response.json();

    let reply = (data.message?.content || "")
      .replace(/^assistant\s*:/i, "")
      .replace(/^trợ lý\s*:/i, "")
      .replace(/\*\*/g, "")
      .trim();

    if (isExtraction) {
      reply = tryRepairTruncatedJson(reply);
    }

    return {
      provider: "ollama",
      model: modelName,
      reply: reply || "Hiện tại hệ thống chưa cập nhật thông tin này.",
    };
  } catch (err) {
    console.error("Ollama Connection Error:", err.message);

    return {
      provider: "error",
      model: modelName,
      reply: `Lỗi kết nối AI Ollama: ${err.message}`,
    };
  }
};

const chatWithAI = async ({
  userPrompt,
  pdfContext = "",
  isExtraction = false,
  accountId = null,
}) => {
  console.log(`[AI-Process] Nhận yêu cầu - Trích xuất: ${isExtraction}`);

  const externalDataPrompt = isExternalDataPrompt(userPrompt);
  const eventQuery = isEventQuery(userPrompt);

  const shouldUseEventDb = eventQuery && !externalDataPrompt;

  let eventDbContext = "";

  if (shouldUseEventDb) {
    // Nếu có accountId, chúng ta nên load lại để lấy thống kê cá nhân hóa
    if (accountId) {
      console.log(`[AI-Cache] Đang tải dữ liệu cá nhân hóa cho Account: ${accountId}`);
      eventDbContext = await loadEventDataOnce(accountId);
    } else {
      eventDbContext = getEventCache();
      if (!eventDbContext || eventDbContext.includes("chưa có dữ liệu")) {
        console.log("[AI-Cache] Cache trống, đang tải lại dữ liệu sự kiện...");
        eventDbContext = await loadEventDataOnce();
      }
    }
    
    eventDbContext = pickRelevantEventsFromCache(eventDbContext, userPrompt, 10);
  }

  const geminiSystemInstruction = buildGeminiSystemInstruction({
    eventDbContext,
    pdfContext,
    isExtraction,
    shouldUseEventDb,
  });

  const ollamaSystemInstruction = buildOllamaSystemInstruction({
    eventDbContext,
    pdfContext,
    isExtraction,
    shouldUseEventDb,
  });

  console.log(
    `[AI-Context] shouldUseEventDb=${shouldUseEventDb}, externalDataPrompt=${externalDataPrompt}`
  );

  console.log("[AI-Orchestrator] Đang thử kết nối Gemini...");

  const geminiResult = await askGemini({
    systemInstruction: geminiSystemInstruction,
    userPrompt,
    isExtraction,
  });

  if (geminiResult) {
    console.log(`[AI-Success] Gemini phản hồi thành công (${geminiResult.model})`);
    return geminiResult;
  }

  console.log("[AI-Fallback] Gemini thất bại hoặc hết lượt. Đang chuyển sang Ollama...");

  const ollamaResult = await askOllama({
    systemInstruction: ollamaSystemInstruction,
    userPrompt,
    isExtraction,
  });

  console.log(`[AI-Result] Kết quả từ ${ollamaResult.provider} (${ollamaResult.model})`);

  return ollamaResult;
};

const generateEmbedding = async (text) => {
  if (!text) return [];

  try {
    if (genAI && GEMINI_API_KEY) {
      for (const modelName of GEMINI_EMBEDDING_MODELS) {
        try {
          console.log(
            `[Gemini-Embedding] Đang thử: ${modelName}`
          );

          const model = genAI.getGenerativeModel({
            model: modelName,
          });

          const result = await model.embedContent(text);

          const embedding =
            result?.embedding?.values || [];

          if (embedding.length > 0) {
            return embedding;
          }
        } catch (error) {
          console.warn(
            `[Gemini-Embedding] ${modelName} thất bại:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.warn(
      "[Gemini-Embedding] Tổng lỗi:",
      error.message
    );
  }

  try {
    console.log("[Ollama-Embedding] Fallback...");

    const response = await fetch(
      `${OLLAMA_URL}/api/embeddings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: OLLAMA_MODEL || "qwen2.5:3b",
          prompt: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Ollama embedding error: ${response.status}`
      );
    }

    const data = await response.json();

    return data.embedding || [];
  } catch (error) {
    console.error(
      "[Ollama-Embedding] Thất bại:",
      error.message
    );

    return [];
  }
};

module.exports = {
  chatWithAI,
  generateEmbedding,
};