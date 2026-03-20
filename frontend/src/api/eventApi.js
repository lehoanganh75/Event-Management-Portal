import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
});

const mapStatus = (status) => {
  switch (status) {
    case "Published":
      return "upcoming";
    case "Ongoing":
      return "ongoing";
    case "Completed":
      return "completed";
    case "PendingApproval":
      return "pending";
    case "Draft":
      return "draft";
    default:
      return "upcoming";
  }
};

const mapPlan = (p) => {
  const start = p.startTime ? new Date(p.startTime) : null;
  const end = p.endTime ? new Date(p.endTime) : null;

  return {
    id: p.id,
    title: p.title || "",
    description: p.description || "",
    coverImage: p.coverImage || "",
    imageUrl:
      p.coverImage ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
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
    createdAt: p.createdAt ? new Date(p.createdAt + "Z") : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt + "Z") : null,
    deletedAt: p.deletedAt ? new Date(p.deletedAt + "Z") : null,
  };
};

const mapEvent = (e) => {
  const start = e.startTime ? new Date(e.startTime) : null;
  const end = e.endTime ? new Date(e.endTime) : null;

  return {
    id: e.id,
    title: e.title || "",
    description: e.description || "",
    imageUrl:
      e.coverImage ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
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
    hasPoints: false,
    fee: "free",
    tags: [],
    organizationId: e.organizationId,
  };
};

export const getAllEvents = () =>
  api.get("/events").then((res) => ({
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

export const getPlansByStatus = (status) =>
  api.get(`/events/plans/${status}`).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapPlan) : [],
  }));

export const createEvent = (eventData) =>
  api.post("/events", eventData).then((res) => ({
    ...res,
    data: res.data ? mapEvent(res.data) : null,
  }));
