const { getEventCache, loadEventDataOnce } = require("../services/eventCacheService");

const getCachedEventDbContext = async (accountId = null) => {
  let eventDbContext = "";

  if (accountId) {
    console.log(`[Event-Memory] Loading personalized event context for Account: ${accountId}`);
    eventDbContext = await loadEventDataOnce(accountId);
  } else {
    eventDbContext = getEventCache();
    if (!eventDbContext || eventDbContext.includes("chưa có dữ liệu")) {
      console.log("[Event-Memory] Cache empty, reloading event context...");
      eventDbContext = await loadEventDataOnce();
    }
  }

  return eventDbContext;
};

module.exports = {
  getCachedEventDbContext,
};
