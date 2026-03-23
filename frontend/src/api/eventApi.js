import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_EVENT_API_URL || "http://localhost:8081",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const mapStatus = (status) => {
  if (!status) return "DRAFT";
  return status;
};

const mapPlan = (p) => {
  const start = p.startTime ? new Date(p.startTime) : null;
  const end = p.endTime ? new Date(p.endTime) : null;

  return {
    id: p.id,
    title: p.title || "",
    description: p.description || "",
    coverImage: p.coverImage || "",
    imageUrl: p.coverImage,
    eventDate: start ? start.toLocaleDateString("vi-VN") : "",
    eventTime:
      start && end
        ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
        : "",
    startTime: start,
    endTime: end,
    registrationDeadline: p.registrationDeadline
      ? new Date(p.registrationDeadline)
      : null,
    maxParticipants: p.maxParticipants || 100,
    type: p.type || "GENERAL",
    status: mapStatus(p.status),
    location: p.location || "",
    eventMode: p.eventMode || "Offline",
    registeredCount: p.registeredCount || 0,
    hasLuckyDraw: p.hasLuckyDraw || false,
    hasPoints: p.hasPoints || false,
    fee: p.fee || "free",
    tags: p.tags || [],
    organizationId: p.organizationId,
    faculty: p.faculty || "",
    major: p.major || "",
    createdAt: p.createdAt ? new Date(p.createdAt + "Z") : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt + "Z") : null,
    deletedAt: p.deletedAt ? new Date(p.deletedAt + "Z") : null,
    eventTopic: p.eventTopic || "",
    templateId: p.templateId || null,
    notes: p.notes || "",
    additionalInfo: p.additionalInfo || "",
    organizerUnit: p.organizerUnit || "",
    participants: Array.isArray(p.participants) ? p.participants : [],
    recipients: Array.isArray(p.recipients) ? p.recipients : [],
    customRecipients: Array.isArray(p.customRecipients)
      ? p.customRecipients
      : [],
    presenters: Array.isArray(p.presenters) ? p.presenters : [],
    organizingCommittee: Array.isArray(p.organizingCommittee)
      ? p.organizingCommittee
      : [],
    attendees: Array.isArray(p.attendees) ? p.attendees : [],
    createdByName: p.createdByName || null,
    approvedByName: p.approvedByName || null,
    approvedByAccountId: p.approvedByAccountId || null,
    createdByAccountId: p.createdByAccountId || null,
  };
};

const mapEvent = (e) => {
  const start = e.startTime ? new Date(e.startTime) : null;
  const end = e.endTime ? new Date(e.endTime) : null;

  return {
    id: e.id,
    title: e.title || "",
    description: e.description || "",
    fullDescription: e.fullDescription || e.description || "",
    imageUrl: e.coverImage || e.imageUrl || "",
    eventDate: start ? start.toLocaleDateString("vi-VN") : "",
    eventTime:
      start && end
        ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
        : "",
    registeredCount: e.registeredCount || 0,
    startTime: start,
    endTime: end,
    maxParticipants: e.maxParticipants || 100,
    status: mapStatus(e.status),
    location: e.location || "",
    eventMode: e.eventMode || "Offline",
    hasPoints: e.hasPoints || false,
    fee: e.fee || "free",
    tags: e.tags || [],
    organizationId: e.organizationId,
    faculty: e.faculty || "",
    major: e.major || "",
    type: e.type || "seminar",
    target: e.target || "all",
    eventTopic: e.eventTopic || "",
    organizerUnit: e.organizerUnit || "",
    agenda: e.agenda || [],
    speakers: e.speakers || [],
    createdByName: e.createdByName || null,
    approvedByName: e.approvedByName || null,
    approvedByAccountId: e.approvedByAccountId || null,
    createdByAccountId: e.createdByAccountId || null,
  };
};

export const getAllEvents = () =>
  api.get("/events").then((res) => {
    const rawData = res.data;
    const events = Array.isArray(rawData) ? rawData : rawData?.content || [];
    return {
      ...res,
      data: events.map(mapEvent),
    };
  });

export const getEventsByStatus = (status) =>
  api
    .get("/events/status", {
      params: { status: status ? status.toUpperCase() : status },
    })
    .then((res) => ({
      ...res,
      data: Array.isArray(res.data) ? res.data.map(mapEvent) : [],
    }));

export const getTotalParticipants = () =>
  api.get("/events").then((res) => {
    const events = Array.isArray(res.data) ? res.data : [];
    const total = events.reduce(
      (sum, event) => sum + (event.registeredCount || 0),
      0,
    );
    return total;
  });

export const getEventById = (id) =>
  api.get(`/events/${id}`).then((res) => ({
    ...res,
    data: res.data ? mapEvent(res.data) : null,
  }));

export const getMyPlans = async (accountId) => {
  try {
    const response = await api.get("/events/plans/my");
    return response;
  } catch (error) {
    console.error("Error fetching my plans:", error);
    return { data: [] };
  }
};

export const getAllPlans = () =>
  api.get("/events/plans").then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
  }));

export const getPlanById = (id) =>
  api.get(`/events/plans/${id}`).then((res) => ({
    ...res,
    data: res.data ? mapPlan(res.data) : null,
  }));

export const createPlan = (planData, submit = false) => {
  return api
    .post(`/events/plans?submit=${submit}`, planData)
    .then((res) => {
      return {
        ...res,
        data: res.data ? mapPlan(res.data) : null,
      };
    })
    .catch((error) => {
      console.error("❌ CreatePlan error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      });

      if (error.response?.data) {
        console.error(
          "❌ Server error message:",
          error.response.data.message || error.response.data,
        );
        console.error(
          "❌ Full server response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }

      throw error;
    });
};

export const updatePlan = (id, planData) => {
  const cleanData = {
    title: planData.title,
    description: planData.description,
    coverImage: planData.coverImage,
    startTime: planData.startTime,
    endTime: planData.endTime,
    registrationDeadline: planData.registrationDeadline,
    maxParticipants: planData.maxParticipants,
    type: planData.type,
    location: planData.location,
    eventMode: planData.eventMode,
    eventTopic: planData.eventTopic,
    faculty: planData.faculty,
    major: planData.major,
    organizerUnit: planData.organizerUnit,
    notes: planData.notes,
    additionalInfo: planData.additionalInfo,
    hasLuckyDraw: planData.hasLuckyDraw,
    participants: planData.participants,
    recipients: planData.recipients,
    customRecipients: planData.customRecipients,
    presenters: planData.presenters,
    organizingCommittee: planData.organizingCommittee,
    attendees: planData.attendees,
    customFieldsJson: planData.customFieldsJson,
  };

  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === undefined || cleanData[key] === null) {
      delete cleanData[key];
    }
  });

  return api.put(`/events/plans/${id}`, cleanData).then((res) => ({
    ...res,
    data: res.data ? mapPlan(res.data) : null,
  }));
};
export const deletePlan = (planId) => {
  console.log("🗑️ Xóa kế hoạch:", planId);
  return api.delete(`/events/plans/${planId}`);
};

export const getPlansByStatus = (status, accountId) =>
  api
    .get(`/events/plans/status/${status ? status.toUpperCase() : status}`, {
      params: accountId ? { accountId } : {},
    })
    .then((res) => ({
      ...res,
      data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
    }));

export const deleteEvent = (id) => {
  console.log("🗑️ Xóa sự kiện:", id);
  return api.put(`/events/delete/${id}`);
};

export const updateEvent = (id, eventData) =>
  api.put(`/events/update/${id}`, eventData);

export const submitPlanForApproval = (id) =>
  api.post(`/events/plans/${id}/submit`);

export const approvePlan = (id) =>
  api.patch(`/events/admin/plans/${id}/approve`);

export const cancelPlan = async (planId, reason = "") => {
  try {
    const response = await api.patch(
      `/events/admin/plans/${planId}/reject?reason=${encodeURIComponent(reason)}`,
      {},
    );
    return response;
  } catch (error) {
    console.error(
      "❌ Cancel plan error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createEventFromPlan = (planId, eventData, submit = false) =>
  api
    .post(`/events/plans/${planId}/create-event?submit=${submit}`, eventData)
    .then((res) => ({
      ...res,
      data: res.data ? mapEvent(res.data) : null,
    }));

export const submitEventForApproval = (id) => api.post(`/events/${id}/submit`);

export const approveEvent = (id) =>
  api.patch(`/events/admin/events/${id}/approve`);

export const rejectEvent = (id, reason) =>
  api.patch(`/events/admin/events/${id}/reject`, null, { params: { reason } });

export const createEvent = (eventData) =>
  api.post("/events", eventData).then((res) => ({
    ...res,
    data: res.data ? mapEvent(res.data) : null,
  }));

export const checkRegistration = (eventId, userProfileId) =>
  api.get("/registrations/check", { params: { eventId, userProfileId } });

export const registerEvent = (eventId, userProfileId) =>
  api.post(`/events/${eventId}/register`, null, { params: { userProfileId } });

export const cancelRegistration = (eventId, userProfileId) =>
  api.patch("/registrations/cancel", null, {
    params: { eventId, userProfileId },
  });

export const getEventRegistrations = (eventId) =>
  api.get(`/registrations/event/${eventId}`);

export const getUserRegistrations = (userProfileId) =>
  api.get(`/registrations/user/${userProfileId}`);

export const getRegistrationQR = (registrationId) =>
  api.get(`/registrations/${registrationId}/qr`);

export const checkInQR = (qrToken) => api.post("/check-in", { qrToken });

export const getAttendedEvents = (userProfileId) =>
  api.get(`/registrations/user/${userProfileId}`).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data : [],
  }));

export const getFeaturedEvents = () =>
  api.get("/events/featured").then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapEvent) : [],
  }));
export const getMyEvents = async (accountId) => {
  try {
    const response = await api.get("/events/my-events", {
      params: { accountId: accountId },
    });
    return response;
  } catch (error) {
    console.error("Error fetching my events:", error);
    try {
      const fallbackResponse = await api.get("/events");
      const allEvents = fallbackResponse.data || [];
      const myEvents = allEvents.filter(
        (event) => event.createdByAccountId === accountId,
      );
      return { data: myEvents };
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return { data: [] };
    }
  }
};
