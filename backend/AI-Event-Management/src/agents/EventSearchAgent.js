const { routeLlmCall } = require("../llm/llmRouter");
const { getCachedEventDbContext } = require("../memory/eventMemory");
const { pickRelevantEventsFromCache, toSafeString } = require("../tools/eventTool");

const buildSystemInstruction = ({ eventDbContext, pdfContext, isExtraction }) => {
  const dbContext = eventDbContext ? toSafeString(eventDbContext).trim() : "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
  const safePdfContext = pdfContext ? toSafeString(pdfContext).trim() : "";

  return `Bạn là trợ lý AI cao cấp của Hệ thống Quản lý Sự kiện IUH - Đại học Công nghiệp TP.HCM.

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
- NẾU BẠN GỢI Ý SỰ KIỆN TỪ EVENT_DB: BẠN PHẢI luôn luôn đính kèm khối EVENT_CARDS ở cuối câu trả lời theo đúng định dạng sau (để hệ thống hiển thị Card cho người dùng nhấn vào):
[EVENT_CARDS_START]
[
  {
    "id": 123,
    "title": "Tên sự kiện",
    "date": "Thời gian",
    "reason": "Lý do ngắn gọn gợi ý sự kiện này"
  }
]
[EVENT_CARDS_END]

DỊCH TRẠNG THÁI:
PUBLISHED => Đã công bố
ONGOING => Đang diễn ra
COMPLETED => Đã kết thúc
CANCELLED => Đã hủy
DRAFT => Bản nháp

FORMAT SỰ KIỆN NGẮN:
🏷️ Tên sự kiện: [TITLE]
⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]
📅 Bắt đầu: [START_TIME]
📍 Địa điểm: [LOCATION]
📌 Trạng thái: [STATUS]
🔗 Chi tiết: https://fitiuh-events.io.vn/events/[ID]

${isExtraction ? `
CHẾ ĐỘ TRÍCH XUẤT/JSON:
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

Hãy trả lời dựa trên dữ liệu có sẵn.`;
};

const run = async ({ userPrompt, pdfContext = "", isExtraction = false, accountId = null }) => {
  console.log("[EventSearchAgent] Loading event database context...");
  let eventDbContext = await getCachedEventDbContext(accountId);
  eventDbContext = pickRelevantEventsFromCache(eventDbContext, userPrompt, 10);

  const systemInstruction = buildSystemInstruction({
    eventDbContext,
    pdfContext,
    isExtraction
  });

  const result = await routeLlmCall({
    systemInstruction,
    userPrompt,
    isExtraction
  });

  // Safeguard: Injects event cards if missing or badly formatted
  if (result && eventDbContext) {
    try {
      // Clear any raw unclosed blocks
      result.reply = result.reply.replace(/\[EVENT_CARDS_START\][\s\S]*/, "").trim();

      const blocks = eventDbContext.split('---');
      const cards = [];
      for (const b of blocks) {
        const idMatch = b.match(/ID:\s*([a-zA-Z0-9\-]+)/);
        const nameMatch = b.match(/Tên:\s*([^\n]+)/);
        const dateMatch = b.match(/Bắt đầu:\s*([^\n]+)/);
        
        if (idMatch && nameMatch) {
          const eventName = nameMatch[1].trim();
          cards.push({
            id: idMatch[1],
            title: eventName,
            date: dateMatch ? dateMatch[1].trim() : "",
            reason: "Sự kiện được đề xuất"
          });
        }
      }
      
      const limitedCards = cards.slice(0, 3);
      
      if (limitedCards.length > 0) {
        result.reply += `\n\n[EVENT_CARDS_START]\n${JSON.stringify(limitedCards)}\n[EVENT_CARDS_END]`;
      }
    } catch (e) {
      console.error("[EventSearchAgent] Safeguard card injection error:", e);
    }
  }

  return result;
};

module.exports = {
  run,
};
