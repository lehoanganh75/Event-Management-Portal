const { routeLlmCall } = require("../llm/llmRouter");

const buildSystemInstruction = ({ pdfContext }) => {
  const safePdfContext = pdfContext ? String(pdfContext).trim() : "";

  return `Bạn là trợ lý ảo chuyên nghiệp của hệ thống quản lý sự kiện IUH.
Hãy trả lời các câu hỏi thăm hỏi thông thường, hướng dẫn sử dụng hệ thống hoặc giải đáp các thắc mắc chung một cách thân thiện và nhiệt tình bằng tiếng Việt.
Không tự bịa các thông tin không có cơ sở.
Tránh sử dụng dấu ** trong văn bản.

${safePdfContext ? `
TÀI LIỆU NGỮ CẢNH HỖ TRỢ:
${safePdfContext}
` : ""}`;
};

const run = async ({ userPrompt, pdfContext = "", isExtraction = false }) => {
  console.log("[GeneralChatAgent] Running general chat query...");
  const systemInstruction = buildSystemInstruction({ pdfContext });
  return await routeLlmCall({
    systemInstruction,
    userPrompt,
    isExtraction
  });
};

module.exports = {
  run,
};
