import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

const mapStatus = (status) => {
  switch (status) {
    case "Published":
      return "upcoming";
    case "Ongoing":
      return "ongoing";
    case "Completed":
      return "completed";
    case "Draft":
      return "draft";
    default:
      return "upcoming";
  }
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

// --- API FUNCTIONS ---

// Lấy tất cả sự kiện
export const getAllEvents = () =>
  api.get("/events").then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(mapEvent) : [],
  }));

// Lấy 2 sự kiện nổi bật
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
