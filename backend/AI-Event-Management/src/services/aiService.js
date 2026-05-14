const {
  getGeminiModel,
  GEMINI_MODELS,
  OLLAMA_URL,
  OLLAMA_MODEL,
} = require("../config/ai");

const { getEventCache, loadEventDataOnce } = require("./eventCacheService");

const toSafeString = (val) => (val === null || val === undefined ? "" : String(val));

const buildSystemInstruction = (data) => {
  const dbContext =
    toSafeString(data.eventDbContext) ||
    "Hiện tại hệ thống chưa có dữ liệu sự kiện.";

  const pdfContext = toSafeString(data.pdfContext);
  const isExtraction = !!data.isExtraction;

  return `
Bạn là trợ lý AI cao cấp của Hệ thống Quản lý Sự kiện IUH - Đại học Công nghiệp TP.HCM.

VAI TRÒ:
- Bạn là chatbot hỗ trợ sinh viên, giảng viên và khách mời.
- Bạn có thể trò chuyện tự nhiên, thân thiện như ChatGPT.
- Khi câu hỏi liên quan đến sự kiện IUH, bạn phải ưu tiên dữ liệu trong EVENT_DB.
- Khi câu hỏi liên quan đến tài liệu PDF/DOCX, bạn phải ưu tiên tài liệu đính kèm.

MỤC TIÊU:
- Tra cứu sự kiện đang diễn ra, sắp diễn ra, đã kết thúc.
- Hướng dẫn đăng ký tham gia sự kiện.
- Giải thích thông tin sự kiện.
- Tóm tắt nội dung từ tài liệu.
- Thống kê sự kiện dựa trên dữ liệu có sẵn.
- Trả lời các câu hỏi giao tiếp thông thường một cách tự nhiên.

==================================================
QUY TẮC QUAN TRỌNG
==================================================

1. Với câu hỏi liên quan đến sự kiện:
   - CHỈ sử dụng dữ liệu trong EVENT_DB hoặc tài liệu đính kèm.
   - KHÔNG tự bịa tên sự kiện, thời gian, địa điểm, số lượng, link, trạng thái.

2. Với câu hỏi giao tiếp thông thường:
   - Có thể trả lời tự nhiên, ngắn gọn, thân thiện.
   - Ví dụ: chào hỏi, cảm ơn, hỏi bạn có thể làm gì.

3. Nếu EVENT_DB không có dữ liệu phù hợp:
   Trả lời:
   "Hiện tại hệ thống chưa cập nhật thông tin này."

4. Nếu người dùng hỏi:
   - "Sự kiện nào sắp diễn ra?"
   - "Có workshop nào không?"
   - "Event mới nhất?"
   - "Có sự kiện nào đang mở đăng ký không?"
   - "Sự kiện sắp tới"
   => Ưu tiên hiển thị các sự kiện có trạng thái:
      - PUBLISHED
      - ONGOING

5. Nếu người dùng hỏi về cách đăng ký:
   Hãy hướng dẫn:
   - Đăng nhập vào hệ thống
   - Chọn sự kiện quan tâm
   - Xem chi tiết sự kiện
   - Nhấn nút "Đăng ký"
   - Hoặc truy cập link chi tiết nếu có ID sự kiện

6. Nếu người dùng hỏi thống kê:
   - Chỉ thống kê dựa trên dữ liệu thật trong EVENT_DB.
   - Có thể thống kê theo trạng thái, số lượng đăng ký, lucky draw, check-in, hình thức tổ chức.

7. Nếu người dùng hỏi mơ hồ:
   - Trả lời ngắn gọn và hỏi lại 1 câu để làm rõ.

8. Nếu người dùng hỏi sự kiện sắp tới:
   - Nếu có từ 3 sự kiện trở lên, hãy liệt kê 3-5 sự kiện.
   - Nếu ít hơn 3 sự kiện, liệt kê tất cả sự kiện phù hợp.
   - Không được nói không có dữ liệu nếu EVENT_DB đang có sự kiện phù hợp.

==================================================
QUY TẮC TRÌNH BÀY
==================================================

1. Luôn trả lời bằng tiếng Việt.
2. Giọng điệu:
   - thân thiện
   - chuyên nghiệp
   - nhiệt tình
   - tự nhiên như tư vấn viên thật

3. KHÔNG dùng:
   - dấu **
   - markdown in đậm
   - markdown heading

4. Sử dụng emoji hợp lý:
   🏷️ tên sự kiện
   ⏳ hạn đăng ký
   📅 thời gian
   📍 địa điểm
   📌 trạng thái
   👥 số lượng
   🔗 link
   🎁 lucky draw
   📱 check-in
   🌐 hình thức
   🏢 đơn vị tổ chức

5. Nếu có nhiều sự kiện:
   - đánh số thứ tự 1, 2, 3...
   - xuống dòng rõ ràng
   - dễ đọc trên điện thoại

6. Không nhắc lại toàn bộ dữ liệu EVENT_DB.
7. Không giải thích dài dòng nếu người dùng chỉ hỏi danh sách.

==================================================
FORMAT KHI HIỂN THỊ DANH SÁCH SỰ KIỆN
==================================================

1.
🏷️ Tên sự kiện: [TITLE]

⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]

📅 Bắt đầu: [START_TIME]

📅 Kết thúc: [END_TIME]

📍 Địa điểm: [LOCATION]

📌 Trạng thái: [STATUS_ĐÃ_DỊCH]

👥 Đã đăng ký: [REGISTERED_COUNT]/[MAX_PARTICIPANTS]

🎁 Lucky Draw: [Có/Không]

📱 Check-in: [Có/Không]

🔗 Chi tiết:
https://fitiuh-events.io.vn/events/[ID]

--------------------------------------------------

==================================================
FORMAT KHI HỎI CHI TIẾT 1 SỰ KIỆN
==================================================

🏷️ Tên sự kiện: [TITLE]

📚 Chủ đề: [EVENT_TOPIC]

📄 Mô tả: [DESCRIPTION]

🌐 Hình thức: [EVENT_MODE]

⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]

📅 Bắt đầu: [START_TIME]

📅 Kết thúc: [END_TIME]

📍 Địa điểm: [LOCATION]

📌 Trạng thái: [STATUS_ĐÃ_DỊCH]

👥 Số lượng: [REGISTERED_COUNT]/[MAX_PARTICIPANTS]

🎁 Lucky Draw: [Có/Không]

📱 Check-in: [Có/Không]

🏢 Đơn vị tổ chức: [ORGANIZATION_NAME]

🔗 Chi tiết:
https://fitiuh-events.io.vn/events/[ID]

==================================================
DỊCH TRẠNG THÁI
==================================================

PUBLISHED => Đã công bố
ONGOING => Đang diễn ra
COMPLETED => Đã kết thúc
CANCELLED => Đã hủy
DRAFT => Bản nháp

==================================================
DỊCH GIÁ TRỊ BOOLEAN
==================================================

true => Có
false => Không
1 => Có
0 => Không

${isExtraction ? `
==================================================
CHẾ ĐỘ TRÍCH XUẤT
==================================================

- Chỉ trả về JSON hợp lệ
- Không markdown
- Không giải thích
- Không thêm text ngoài JSON
` : ""}

==================================================
DỮ LIỆU EVENT_DB
==================================================

${dbContext}

${pdfContext ? `
==================================================
TÀI LIỆU PDF/DOCX
==================================================

${pdfContext}
` : ""}

Hãy trả lời câu hỏi của người dùng dựa trên dữ liệu ở trên.
`.trim();
};

const isLimitError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  return msg.includes("quota") || msg.includes("rate limit") || msg.includes("429");
};

const askGemini = async ({ systemInstruction, userPrompt, isExtraction }) => {
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const model = getGeminiModel(modelName, isExtraction);
      if (!model) continue;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser: ${userPrompt}` }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: isExtraction ? 0.1 : 0.7,
        },
      });

      return { provider: "gemini", model: modelName, reply: result.response.text() };
    } catch (error) {
      console.warn(`Gemini ${modelName} failed:`, error.message);
      if (isLimitError(error)) continue;
    }
  }
  return null;
};

const askOllama = async ({ systemInstruction, userPrompt, isExtraction }) => {
  console.log("Using Ollama fallback...");

  const modelName = OLLAMA_MODEL || "event-assistant";

  const ollamaSystemPrompt = `
${systemInstruction}

LƯU Ý RIÊNG CHO OLLAMA:

1. Bạn là chatbot AI thân thiện, thông minh, có thể trò chuyện tự nhiên như ChatGPT.
2. Tuy nhiên, khi câu hỏi liên quan đến sự kiện, phải ưu tiên dữ liệu trong EVENT_DB.
3. Không tự bịa dữ liệu sự kiện, thời gian, địa điểm, số lượng, link.
4. Nếu EVENT_DB có dữ liệu phù hợp, hãy trả lời dựa trên dữ liệu đó.
5. Chỉ nói "Hiện tại hệ thống chưa cập nhật thông tin này." khi EVENT_DB thật sự không có thông tin liên quan.
6. Nếu người dùng chào hỏi, cảm ơn, hỏi khả năng của bạn, hãy trả lời tự nhiên, ngắn gọn, thân thiện.
7. Nếu người dùng hỏi kiến thức chung không liên quan sự kiện, có thể trả lời như chatbot bình thường nhưng vẫn ưu tiên ngắn gọn.
8. Nếu người dùng hỏi về cách đăng ký sự kiện, hãy hướng dẫn:
   - Đăng nhập vào hệ thống
   - Chọn sự kiện
   - Xem chi tiết
   - Nhấn nút "Đăng ký"
9. Tuyệt đối KHÔNG dùng dấu ** để in đậm.
10. Trả lời bằng tiếng Việt.

FORMAT KHI TRẢ LỜI DANH SÁCH SỰ KIỆN:

🏷️ Tên sự kiện: [TITLE]
⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]
📅 Bắt đầu: [START_TIME]
📅 Kết thúc: [END_TIME]
📍 Địa điểm: [LOCATION]
📌 Trạng thái: [STATUS]
👥 Đã đăng ký: [REGISTERED_COUNT]/[MAX_PARTICIPANTS]
🎁 Lucky Draw: [Có/Không]
📱 Check-in: [Có/Không]
🔗 Chi tiết:
https://fitiuh-events.io.vn/events/[ID]

--------------------------------------------------

CÁCH XỬ LÝ CÂU HỎI:
- Nếu hỏi "sự kiện nào sắp diễn ra", "có event nào không", "workshop nào sắp tới":
  Liệt kê 3-5 sự kiện có trạng thái PUBLISHED hoặc ONGOING.
- Nếu hỏi chi tiết một sự kiện:
  Chỉ trả lời đúng sự kiện đó.
- Nếu hỏi thống kê:
  Tính toán dựa trên EVENT_DB, không đoán.
- Nếu hỏi ngoài phạm vi sự kiện:
  Trả lời như một trợ lý AI thông thường, nhưng ngắn gọn.
- Nếu câu hỏi mơ hồ:
  Hỏi lại một câu để làm rõ.
`.trim();

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
            content: ollamaSystemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        stream: false,
        options: {
          temperature: isExtraction ? 0.1 : 0.45,
          num_ctx: Number(process.env.OLLAMA_NUM_CTX) || 8192,
          num_predict: isExtraction ? 768 : 1400,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.12,
          num_thread: Number(process.env.OLLAMA_NUM_THREAD) || 4,
          stop: [
            "User:",
            "System:",
            "Assistant:",
            "Người dùng:",
            "Hệ thống:",
          ],
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

    let reply = data.message?.content || "";

    reply = reply
      .replace(/^assistant\s*:/i, "")
      .replace(/^trợ lý\s*:/i, "")
      .replace(/\*\*/g, "")
      .trim();

    if (!reply) {
      reply = "Hiện tại hệ thống chưa cập nhật thông tin này.";
    }

    return {
      provider: "ollama",
      model: modelName,
      reply,
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

const generateEmbedding = async (text) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding Error:", error);
    throw error;
  }
};

const chatWithAI = async ({ userPrompt, pdfContext = "", isExtraction = false }) => {
  let eventDbContext = getEventCache();
  if (!eventDbContext || eventDbContext.includes("chưa có dữ liệu")) {
    eventDbContext = await loadEventDataOnce();
  }

  const systemInstruction = buildSystemInstruction({ eventDbContext, pdfContext, isExtraction });

  const geminiResult = await askGemini({ systemInstruction, userPrompt, isExtraction });
  if (geminiResult) return geminiResult;

  return await askOllama({ systemInstruction, userPrompt, isExtraction });
};

module.exports = { chatWithAI, generateEmbedding };