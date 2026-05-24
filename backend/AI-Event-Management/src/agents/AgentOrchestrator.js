const EventPlanningAgent = require("./EventPlanningAgent");
const EventSearchAgent = require("./EventSearchAgent");
const EventContentAgent = require("./EventContentAgent");
const QuizGenerationAgent = require("./QuizGenerationAgent");
const GeneralChatAgent = require("./GeneralChatAgent");

const { isPlanningRequest, isEventQuery, isExternalDataPrompt } = require("../tools/eventTool");

async function chatWithAI({ userPrompt, pdfContext = "", isExtraction = false, accountId = null }) {
  console.log(`[AgentOrchestrator] Routing request...`);

  // 1. LẬP KẾ HOẠCH SỰ KIỆN (Event Planning)
  if (isPlanningRequest(userPrompt)) {
    console.log("[AgentOrchestrator] Intent: EVENT_PLANNING -> Invoking EventPlanningAgent...");
    return await EventPlanningAgent.run(userPrompt, accountId);
  }

  const externalDataPrompt = isExternalDataPrompt(userPrompt);
  const eventQuery = isEventQuery(userPrompt);

  // 2. TẠO NỘI DUNG TRUYỀN THÔNG (Content Generation)
  if (externalDataPrompt && !eventQuery) {
    console.log("[AgentOrchestrator] Intent: CONTENT_GENERATION -> Invoking EventContentAgent...");
    return await EventContentAgent.run({ userPrompt, isExtraction });
  }

  // 3. TẠO CÂU HỎI TRẮC NGHIỆM (Quiz/Trivia Generation)
  if (userPrompt.toLowerCase().includes("trắc nghiệm") || userPrompt.toLowerCase().includes("quiz")) {
    console.log("[AgentOrchestrator] Intent: QUIZ_GENERATION -> Invoking QuizGenerationAgent...");
    return await QuizGenerationAgent.run({ userPrompt, isExtraction });
  }

  // 4. TRA CỨU SỰ KIỆN (Event Query/Search)
  if (eventQuery && !externalDataPrompt) {
    console.log("[AgentOrchestrator] Intent: EVENT_SEARCH -> Invoking EventSearchAgent...");
    return await EventSearchAgent.run({ userPrompt, pdfContext, isExtraction, accountId });
  }

  // 5. TRÒ CHUYỆN THÔNG THƯỜNG (General Chat)
  console.log("[AgentOrchestrator] Intent: GENERAL -> Invoking GeneralChatAgent...");
  return await GeneralChatAgent.run({ userPrompt, pdfContext, isExtraction });
}

module.exports = {
  chatWithAI,
};
