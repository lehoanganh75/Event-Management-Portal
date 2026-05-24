const selfNormalizePlan = (plan, userPrompt = "") => {
  if (!plan) plan = {};

  plan.title = plan.title || "Sự kiện IUH mới";
  plan.purpose = plan.purpose || "Mục đích sự kiện";
  plan.description = plan.description || "Mô tả sự kiện";
  plan.subject = plan.subject || "Chủ đề sự kiện";
  plan.suggestedLocation = plan.suggestedLocation || "Hội trường E4";
  plan.goal = plan.goal || "Nâng cao kiến thức và phát triển kỹ năng thực hành cho sinh viên.";
  plan.requirement = plan.requirement || "Sinh viên đăng ký tham gia đúng hạn, mang theo dụng cụ học tập hoặc laptop nếu có yêu cầu.";
  
  if (typeof plan.estimatedParticipants === "string") {
    plan.estimatedParticipants = parseInt(plan.estimatedParticipants, 10) || 200;
  } else if (!plan.estimatedParticipants) {
    plan.estimatedParticipants = 200;
  }

  plan.suggestedOrganizerName = plan.suggestedOrganizerName || "Đoàn Thanh niên IUH";
  plan.suggestedOrganizerDescription = plan.suggestedOrganizerDescription || "Ban tổ chức sự kiện chuyên nghiệp IUH";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = (userPrompt || "").toLowerCase();
  const isTodayRequested = p.includes("hôm nay") || p.includes("today") || p.includes("khẩn cấp") || p.includes("gấp");

  let regDeadline = new Date(plan.registrationDeadline);
  let startTime = new Date(plan.suggestedStartTime);
  let endTime = new Date(plan.suggestedEndTime);

  // Fallbacks for invalid dates
  if (isNaN(startTime.getTime())) {
    startTime = new Date(today.getTime() + (isTodayRequested ? 0 : 2) * 24 * 60 * 60 * 1000);
    startTime.setHours(7, 0, 0, 0);
  }
  if (isNaN(endTime.getTime())) {
    endTime = new Date(startTime.getTime());
    endTime.setHours(23, 59, 59, 999);
  }
  if (isNaN(regDeadline.getTime())) {
    regDeadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    regDeadline.setHours(23, 59, 59, 999);
  }

  // Calculate shift difference relative to target event date
  const eventDateOnly = new Date(startTime.getTime());
  eventDateOnly.setHours(0, 0, 0, 0);

  let targetEventDate = new Date(eventDateOnly.getTime());

  if (eventDateOnly < today || isTodayRequested) {
    if (isTodayRequested) {
      targetEventDate = new Date(today.getTime());
    } else {
      targetEventDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    }
  }

  const diffMs = targetEventDate.getTime() - eventDateOnly.getTime();

  if (diffMs !== 0) {
    startTime = new Date(startTime.getTime() + diffMs);
    endTime = new Date(endTime.getTime() + diffMs);
    regDeadline = new Date(regDeadline.getTime() + diffMs);
  }

  startTime.setHours(7, 0, 0, 0);
  endTime.setHours(23, 59, 59, 999);

  // Enforce deadline constraint
  if (regDeadline > startTime) {
    regDeadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    regDeadline.setHours(23, 59, 59, 999);
  }

  // Enforce today's check
  if (regDeadline < today && !isTodayRequested) {
    regDeadline = new Date(today.getTime());
    regDeadline.setHours(23, 59, 59, 999);
    if (startTime < regDeadline) {
      startTime = new Date(regDeadline.getTime() + 24 * 60 * 60 * 1000);
      startTime.setHours(7, 0, 0, 0);
      endTime = new Date(startTime.getTime());
      endTime.setHours(23, 59, 59, 999);
    }
  }

  const formatDateISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  plan.registrationDeadline = formatDateISO(regDeadline);
  plan.suggestedStartTime = formatDateISO(startTime);
  plan.suggestedEndTime = formatDateISO(endTime);

  let items = plan.programItems || [];
  if (!Array.isArray(items) || items.length === 0) {
    items = [{
      title: "Phiên khai mạc và định hướng",
      description: "Giới thiệu sự kiện và các nội dung chính",
      startTime: plan.suggestedStartTime,
      endTime: formatDateISO(new Date(startTime.getTime() + 2 * 60 * 60 * 1000)),
      durationMinutes: 120,
      speaker: "Ban tổ chức",
      location: plan.suggestedLocation
    }];
  }

  let currentSessionTime = new Date(startTime.getTime());
  currentSessionTime.setHours(8, 0, 0, 0);

  items.forEach((item, idx) => {
    item.title = item.title || `Phiên chương trình ${idx + 1}`;
    item.description = item.description || `Mô tả chi tiết phiên chương trình ${idx + 1}`;
    item.speaker = item.speaker || "Diễn giả đề xuất";
    item.location = item.location || plan.suggestedLocation;
    
    let duration = parseInt(item.durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      duration = 60;
    }
    item.durationMinutes = duration;

    let sTime = new Date(item.startTime);
    let eTime = new Date(item.endTime);

    // Apply shift if it was a valid date
    if (!isNaN(sTime.getTime()) && diffMs !== 0) {
      sTime = new Date(sTime.getTime() + diffMs);
      item.startTime = formatDateISO(sTime);
    }
    if (!isNaN(eTime.getTime()) && diffMs !== 0) {
      eTime = new Date(eTime.getTime() + diffMs);
      item.endTime = formatDateISO(eTime);
    }

    // Fallback if times are invalid
    if (isNaN(sTime.getTime()) || isNaN(eTime.getTime())) {
      if (currentSessionTime >= endTime) {
        const daysDiff = Math.floor((currentSessionTime - startTime) / (24 * 60 * 60 * 1000));
        currentSessionTime = new Date(startTime.getTime() + (daysDiff + 1) * 24 * 60 * 60 * 1000);
        currentSessionTime.setHours(8, 0, 0, 0);
      }

      item.startTime = formatDateISO(currentSessionTime);
      const sessionEndTime = new Date(currentSessionTime.getTime() + duration * 60 * 1000);
      item.endTime = formatDateISO(sessionEndTime);

      currentSessionTime = new Date(sessionEndTime.getTime() + 15 * 60 * 1000);
    } else {
      currentSessionTime = new Date(eTime.getTime() + 15 * 60 * 1000);
    }
  });

  plan.programItems = items;
  return plan;
};

module.exports = {
  selfNormalizePlan,
};
