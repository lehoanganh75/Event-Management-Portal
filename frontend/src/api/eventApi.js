import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api" 
});
const mapStatus = (status) => {
  if (!status) return "Draft";
  const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  if (s === "Pendingapproval") return "PendingApproval";
  return s;
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
    customRecipients: Array.isArray(p.customRecipients) ? p.customRecipients : [],
    presenters: Array.isArray(p.presenters) ? p.presenters : [],
    organizingCommittee: Array.isArray(p.organizingCommittee) ? p.organizingCommittee : [],
    attendees: Array.isArray(p.attendees) ? p.attendees : [],
    createdByName: p.createdByName || null,
    approvedByName: p.approvedByName || null,
    approvedByAccountId: p.approvedByAccountId || null,
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
    // Thêm các field cho agenda và speakers nếu có
    agenda: e.agenda || [],
    speakers: e.speakers || [],
    createdByName: e.createdByName || null,
    approvedByName: e.approvedByName || null,
    approvedByAccountId: e.approvedByAccountId || null,
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
  api.get("/events/status", { params: { status } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapEvent) : [],
  }));

export const getFeaturedEvents = () =>
  api.get("/events/featured").then((res) => ({
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

export const getMyEvents = (accountId) =>
  api.get("/events/my", { params: { accountId } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapEvent) : [],
  }));

export const getMyPlans = (accountId) =>
  api.get("/events/plans/my", { params: { accountId } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
  }));

export const getAllPlans = () =>
  api.get("/events/plans").then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
  }));

export const getPlanById = (id) =>
  api.get(`/events/${id}`).then((res) => ({
    ...res,
    data: res.data ? mapPlan(res.data) : null,
  }));

export const createPlan = (planData) =>
  api.post("/events/plans", planData).then((res) => ({
    ...res,
    data: res.data ? mapPlan(res.data) : null,
  }));

export const updatePlan = (id, planData) =>
  api.put(`/events/plans/${id}`, planData).then((res) => ({
    ...res,
    data: res.data ? mapPlan(res.data) : null,
  }));

export const deletePlan = (id) => api.delete(`/events/${id}`);

export const getPlansByStatus = (status, accountId) =>
  api.get(`/events/plans/${status}`, { 
    params: accountId ? { accountId } : {} 
  }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
  }));

export const deleteEvent = (id) => api.delete(`/events/${id}`);

export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData);

export const cancelPlan = (id, accountId) => api.patch(`/events/${id}/reject`, null, { params: { accountId } });

export const approvePlan = (id, approverId, accountId) => api.patch(`/events/${id}/approve`, null, { params: { approverId, accountId } });

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
  api.patch("/registrations/cancel", null, { params: { eventId, userProfileId } });

export const getEventRegistrations = (eventId) =>
  api.get(`/registrations/event/${eventId}`);

export const getUserRegistrations = (userProfileId) =>
  api.get(`/registrations/user/${userProfileId}`);

export const getRegistrationQR = (registrationId) =>
  api.get(`/registrations/${registrationId}/qr`);

export const checkInQR = (qrToken) =>
  api.post("/check-in", { qrToken });