const { routeLlmCall } = require("../llm/llmRouter");

const buildSystemInstruction = () => {
  return `Bạn là chuyên gia thiết kế trò chơi học tập và câu hỏi trắc nghiệm tương tác của IUH.
Nhiệm vụ của bạn là tạo các câu hỏi trắc nghiệm (quiz) sinh động, kiểm tra kiến thức về các chủ đề khoa học, công nghệ hoặc thông tin sự kiện.
Mỗi câu hỏi phải đi kèm 4 đáp án lựa chọn (A, B, C, D) và chỉ rõ đáp án đúng cùng giải thích ngắn gọn.
Tránh sử dụng dấu ** trong văn bản.`;
};

const run = async ({ userPrompt, isExtraction = false }) => {
  console.log("[QuizGenerationAgent] Running quiz generation...");
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
