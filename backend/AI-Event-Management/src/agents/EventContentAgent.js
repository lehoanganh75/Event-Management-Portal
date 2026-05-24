const { routeLlmCall } = require("../llm/llmRouter");
const { getCachedEventDbContext } = require("../memory/eventMemory");
const { pickRelevantEventsFromCache, querySessionsForEvent, queryPresentersForEvent } = require("../tools/eventTool");

const buildSystemInstruction = (eventContext) => {
  return `Bạn là chuyên gia truyền thông và sáng tạo nội dung sự kiện của IUH.
Nhiệm vụ của bạn là viết các bài đăng mạng xã hội (Facebook, LinkedIn), thông báo email, hoặc nội dung quảng bá cho sự kiện dựa trên dữ liệu EVENT_CONTEXT chính xác được cung cấp dưới đây.

QUY TẮC NGHIÊM NGẶT:
1. CHỈ viết bài dựa trên dữ liệu thật từ EVENT_CONTEXT.
2. TUYỆT ĐỐI KHÔNG tự bịa thời gian, địa điểm, diễn giả hoặc link. Nếu thiếu thông tin nào, hãy ghi là "[Đang cập nhật]".
3. Viết bằng giọng điệu trẻ trung, năng động, cuốn hút, sử dụng các hashtag phù hợp với sinh viên IUH (ví dụ: #IUH, #SinhVienIUH, #FIT_IUH...).
4. Tránh sử dụng dấu ** trong văn bản.

EVENT_CONTEXT:
${eventContext}`;
};

const run = async ({ userPrompt, isExtraction = false, accountId = null }) => {
  console.log("[EventContentAgent] Running content generation with DB-RAG...");

  // 1. Tìm kiếm sự kiện liên quan trong Database Cache
  let eventContext = "";
  let eventId = null;
  let title = "";
  let date = "";

  try {
    const dbContext = await getCachedEventDbContext(accountId);
    // Sử dụng bộ lọc chấm điểm để lấy ra sự kiện khớp nhất
    const matchedContextText = pickRelevantEventsFromCache(dbContext, userPrompt, 1);

    if (matchedContextText && !matchedContextText.includes("chưa có dữ liệu")) {
      const idMatch = matchedContextText.match(/ID:\s*([a-zA-Z0-9\-]+)/);
      const titleMatch = matchedContextText.match(/Tên:\s*([^\n]+)/);
      const locMatch = matchedContextText.match(/Địa điểm:\s*([^\n]+)/);
      const startMatch = matchedContextText.match(/Bắt đầu:\s*([^\n]+)/);

      if (idMatch) {
        eventId = idMatch[1];
        title = titleMatch ? titleMatch[1].trim() : "Sự kiện";
        date = startMatch ? startMatch[1].trim() : "";

        // Tải thêm Sessions và Presenters từ DB thực tế
        const sessions = await querySessionsForEvent(eventId);
        const presenters = await queryPresentersForEvent(eventId);

        eventContext = `
ID sự kiện: ${eventId}
Tên sự kiện: ${title}
Địa điểm: ${locMatch ? locMatch[1].trim() : "Chưa cập nhật"}
Thời gian bắt đầu: ${date}
Diễn giả: ${presenters && presenters.length > 0 ? presenters.map(p => p.presenter_account_id).join(", ") : "Chưa cập nhật"}
Chi tiết các phiên (Sessions):
${sessions && sessions.length > 0 ? sessions.map(s => `- ${s.title} (${s.room || "Sảnh"}): ${s.description || ""}`).join('\n') : "Chưa cập nhật"}
`.trim();
      }
    }
  } catch (err) {
    console.error("[EventContentAgent] Error loading event details:", err.message);
  }

  // 2. Nếu không tìm thấy sự kiện tương thích
  if (!eventId) {
    return {
      provider: "system",
      model: "local",
      reply: "Hiện tại hệ thống chưa tìm thấy sự kiện phù hợp trong Database để viết bài truyền thông. Vui lòng cung cấp chính xác tên sự kiện hoặc nội dung chi tiết của sự kiện."
    };
  }

  console.log(`[EventContentAgent] Found reference event: ${title} (${eventId}). Generating draft...`);
  
  // 3. AI tạo bản thảo bài viết dựa trên dữ liệu thật
  const systemInstruction = buildSystemInstruction(eventContext);
  const aiResult = await routeLlmCall({
    systemInstruction,
    userPrompt: `Yêu cầu viết bài: "${userPrompt}"\n\nHãy viết bài dựa trên EVENT_CONTEXT được cung cấp.`,
    isExtraction: false
  });

  if (!aiResult || !aiResult.reply) {
    return {
      provider: "error",
      model: "none",
      reply: "Đã xảy ra lỗi trong quá trình tạo nội dung bài viết."
    };
  }

  console.log("[EventContentAgent] Running Hallucination Guard to sanitize output...");

  // 4. Kiểm định chất lượng bài viết chống bịa đặt (Hallucination Guard)
  const guardPrompt = `Bạn là chuyên gia kiểm duyệt chất lượng nội dung chống bịa đặt (anti-hallucination) của IUH.
Hãy đối chiếu bài viết dưới đây với NGUỒN NGỮ CẢNH sự kiện chính thức.
Nhiệm vụ của bạn:
- Kiểm tra xem bài viết có tự bịa thêm thông tin ngày giờ, địa điểm, diễn giả hoặc link nằm ngoài NGUỒN NGỮ CẢNH hay không.
- Nếu phát hiện thông tin bịa đặt hoặc sai lệch, hãy chỉnh sửa lại bài viết để loại bỏ chúng (thay bằng "[Đang cập nhật]").
- Giữ nguyên văn phong năng động, trẻ trung của bài đăng gốc.
- Đảm bảo TUYỆT ĐỐI không chứa các dấu markdown ** trong bài viết cuối cùng.

NGUỒN NGỮ CẢNH:
${eventContext}

BÀI VIẾT CẦN KIỂM DUYỆT:
${aiResult.reply}

Hãy trả về duy nhất nội dung bài viết hoàn chỉnh sau khi đã được kiểm duyệt an toàn.`;

  const checkedResult = await routeLlmCall({
    systemInstruction: "Bạn là chuyên gia kiểm duyệt nội dung chống bịa đặt.",
    userPrompt: guardPrompt,
    isExtraction: false
  });

  const finalReplyText = checkedResult ? checkedResult.reply : aiResult.reply;

  // 5. Trả kết quả kèm khối EVENT_CARDS gợi ý liên kết sự kiện
  const cardData = [{
    id: eventId,
    title: title,
    date: date,
    reason: "Xem chi tiết sự kiện và đăng ký tham gia tại đây"
  }];

  return {
    provider: checkedResult ? checkedResult.provider : aiResult.provider,
    model: checkedResult ? checkedResult.model : aiResult.model,
    reply: `${finalReplyText.trim()}\n\n[EVENT_CARDS_START]\n${JSON.stringify(cardData)}\n[EVENT_CARDS_END]`
  };
};

module.exports = {
  run,
};
