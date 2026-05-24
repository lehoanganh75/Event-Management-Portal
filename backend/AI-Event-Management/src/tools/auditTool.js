const { query } = require("../config/db");

const logPlanningAudit = async ({
  sessionId,
  userPrompt,
  intent,
  selectedEvents,
  validationErrors,
  repairAttempts,
  finalPlan
}) => {
  try {
    console.log("[SmartPlanning] Logging execution details into audit table...");
    await query(
      `INSERT INTO ai_planning_audit_logs 
       (session_id, user_prompt, intent_extracted, events_retrieved, best_events_selected, validation_errors, repair_attempts, final_output)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userPrompt,
        JSON.stringify(intent),
        JSON.stringify(selectedEvents.map(e => ({ id: e.id, title: e.title, score: e.finalScore }))),
        JSON.stringify(selectedEvents.map(e => e.id)),
        JSON.stringify(validationErrors),
        repairAttempts,
        JSON.stringify(finalPlan)
      ]
    );
    console.log("[SmartPlanning] Audit logged successfully.");
  } catch (err) {
    console.error("[SmartPlanning] Audit logging failed:", err.message);
  }
};

module.exports = {
  logPlanningAudit,
};
