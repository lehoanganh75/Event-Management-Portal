const { routeLlmCall } = require("../llm/llmRouter");

const buildSystemInstruction = () => {
  return `Bạn là chuyên gia truyền thông và sáng tạo nội dung sự kiện của IUH.
Nhiệm vụ của bạn là viết các bài đăng mạng xã hội (Facebook, LinkedIn), thông báo email, hoặc nội dung quảng bá cho sự kiện dựa trên dữ liệu đầu vào.
Hãy viết bằng giọng điệu trẻ trung, năng động, cuốn hút, sử dụng các hashtag phù hợp với sinh viên IUH (ví dụ: #IUH, #SinhVienIUH, #FIT_IUH...).
Tránh sử dụng dấu ** trong văn bản.`;
};

const run = async ({ userPrompt, isExtraction = false }) => {
  console.log("[EventContentAgent] Running content generation...");
  const systemInstruction = buildSystemInstruction();
  return await routeLlmCall({
    systemInstruction,
    userPrompt,
    isExtraction
  });
};

module.exports = {
  run,
};
