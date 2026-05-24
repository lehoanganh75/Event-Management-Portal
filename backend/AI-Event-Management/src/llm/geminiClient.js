const { GEMINI_MODELS, getGeminiModel, isGeminiLimitError } = require("../config/ai");
const { tryRepairTruncatedJson } = require("../validators/jsonValidator");

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

      if (isGeminiLimitError(error)) {
        console.warn(`[Gemini] Model ${modelName} hết quota/rate limit`);
      }
    }
  }

  return null;
};

module.exports = {
  askGemini,
};
