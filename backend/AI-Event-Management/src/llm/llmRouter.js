const { askGemini } = require("./geminiClient");
const { askOllama } = require("./ollamaClient");
const { generateEmbedding } = require("../config/ai");

const routeLlmCall = async ({ systemInstruction, userPrompt, isExtraction }) => {
  console.log("[LLM-Router] Routing LLM call...");
  const geminiResult = await askGemini({
    systemInstruction,
    userPrompt,
    isExtraction,
  });

  if (geminiResult) {
    console.log(`[LLM-Router] Gemini response successful (${geminiResult.model})`);
    return geminiResult;
  }

  console.log("[LLM-Router] Gemini failed or rate limited. Falling back to Ollama...");
  const ollamaResult = await askOllama({
    systemInstruction,
    userPrompt,
    isExtraction,
  });

  return ollamaResult;
};

module.exports = {
  routeLlmCall,
  generateEmbedding,
};
