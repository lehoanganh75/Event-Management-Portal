const {
  getGeminiModel,
  GEMINI_MODELS,
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
  return /sự kiện|event|workshop|đăng ký|diễn ra|lịch|địa điểm|check-?in|lucky|hội thảo|tham gia|tổ chức/i.test(
    prompt
  );
};

const isExternalDataPrompt = (prompt = "") => {
  return /dữ liệu\s*:|dữ liệu sự kiện\s*:|eventdetails|thông tin sự kiện sau|hãy viết|bài đăng truyền thông|facebook|linkedin|trả về json|generate/i.test(
    prompt
  );
};

const pickRelevantEventsFromCache = (eventDbContext = "", userPrompt = "", limit = 5) => {
  const text = toSafeString(eventDbContext);

  if (!text) return "Hiện tại hệ thống chưa có dữ liệu sự kiện.";

  const blocks = text
    .split(/-+\n|\n-{5,}\n|\[SỰ KIỆN\s+\d+\]/i)
    .map((x) => x.trim())
    .filter(Boolean);

  if (blocks.length <= limit) {
    return blocks.join("\n\n---\n\n");
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

  return filtered.slice(0, limit).join("\n\n---\n\n");
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
          maxOutputTokens: isExtraction ? 1024 : 2048,
          temperature: isExtraction ? 0.1 : 0.7,
        },
      });

      return {
        provider: "gemini",
        model: modelName,
        reply: result.response.text(),
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
          num_ctx: Number(process.env.OLLAMA_NUM_CTX) || 4096,
          num_predict: isExtraction ? 512 : 650,
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

    const reply = (data.message?.content || "")
      .replace(/^assistant\s*:/i, "")
      .replace(/^trợ lý\s*:/i, "")
      .replace(/\*\*/g, "")
      .trim();

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
}) => {
  console.log(`[AI-Process] Nhận yêu cầu - Trích xuất: ${isExtraction}`);

  const externalDataPrompt = isExternalDataPrompt(userPrompt);
  const eventQuery = isEventQuery(userPrompt);

  const shouldUseEventDb = eventQuery && !externalDataPrompt;

  let eventDbContext = "";

  if (shouldUseEventDb) {
    eventDbContext = getEventCache();

    if (!eventDbContext || eventDbContext.includes("chưa có dữ liệu")) {
      console.log("[AI-Cache] Cache trống, đang tải lại dữ liệu sự kiện...");
      eventDbContext = await loadEventDataOnce();
    }

    eventDbContext = pickRelevantEventsFromCache(eventDbContext, userPrompt, 5);
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

module.exports = {
  chatWithAI,
};