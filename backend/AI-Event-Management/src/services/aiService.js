const AgentOrchestrator = require("../agents/AgentOrchestrator");
const EventPlanningAgent = require("../agents/EventPlanningAgent");
const { generateEmbedding } = require("../llm/llmRouter");
const { trainOllamaModel } = require("../llm/ollamaClient");

const chatWithAI = async ({ userPrompt, pdfContext = "", isExtraction = false, accountId = null }) => {
  return await AgentOrchestrator.chatWithAI({ userPrompt, pdfContext, isExtraction, accountId });
};

const runSmartPlanningPipeline = async (userPrompt, accountId = null, template = null) => {
  return await EventPlanningAgent.run(userPrompt, accountId, template);
};

module.exports = {
  chatWithAI,
  generateEmbedding,
  runSmartPlanningPipeline,
  trainOllamaModel,
};