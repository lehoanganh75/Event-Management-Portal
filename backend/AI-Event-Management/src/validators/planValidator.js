const validatePlan = (plan) => {
  const errors = [];
  if (!plan) {
    errors.push("Bản kế hoạch trống hoặc không hợp lệ");
    return errors;
  }

  const requiredFields = [
    "title", "purpose", "description", "subject", "suggestedLocation",
    "estimatedParticipants", "suggestedOrganizerName", "suggestedStartTime",
    "suggestedEndTime", "registrationDeadline", "programItems"
  ];

  requiredFields.forEach(f => {
    if (plan[f] === undefined || plan[f] === null || plan[f] === "") {
      errors.push(`Thiếu trường thông tin bắt buộc: ${f}`);
    }
  });

  if (plan.suggestedStartTime && plan.suggestedEndTime) {
    const start = new Date(plan.suggestedStartTime);
    const end = new Date(plan.suggestedEndTime);
    if (isNaN(start.getTime())) errors.push("Định dạng suggestedStartTime không hợp lệ");
    if (isNaN(end.getTime())) errors.push("Định dạng suggestedEndTime không hợp lệ");
    if (start >= end) errors.push("suggestedStartTime phải trước suggestedEndTime");
  }

  if (plan.registrationDeadline && plan.suggestedStartTime) {
    const deadline = new Date(plan.registrationDeadline);
    const start = new Date(plan.suggestedStartTime);
    if (isNaN(deadline.getTime())) errors.push("Định dạng registrationDeadline không hợp lệ");
    if (deadline > start) errors.push("registrationDeadline phải trước hoặc bằng suggestedStartTime");
  }

  const items = plan.programItems;
  if (Array.isArray(items)) {
    if (items.length === 0) {
      errors.push("Danh sách programItems không được để trống");
    } else {
      items.forEach((item, idx) => {
        if (!item.title) errors.push(`Phiên thứ ${idx + 1} thiếu tiêu đề`);
        if (!item.startTime) errors.push(`Phiên thứ ${idx + 1} thiếu startTime`);
        if (!item.endTime) errors.push(`Phiên thứ ${idx + 1} thiếu endTime`);
        if (item.startTime && item.endTime) {
          const s = new Date(item.startTime);
          const e = new Date(item.endTime);
          if (isNaN(s.getTime())) errors.push(`Phiên thứ ${idx + 1} có startTime không hợp lệ`);
          if (isNaN(e.getTime())) errors.push(`Phiên thứ ${idx + 1} có endTime không hợp lệ`);
          if (s >= e) errors.push(`Phiên thứ ${idx + 1} có startTime phải trước endTime`);
        }
      });
    }
  } else if (items) {
    errors.push("programItems phải là một mảng");
  }

  return errors;
};

module.exports = {
  validatePlan,
};
