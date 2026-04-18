import {
  getAdminAllEvents,
  getAllActiveEvents,
  getFeaturedEvents,
  getMyEventsByRole,
  getMyRegistrations,
  getOngoingEvents,
  getUpcomingWeekEvents,
} from "@/services/events";
import { Event } from "@/types/event";
import React, { createContext, useCallback, useContext, useState } from "react";

interface EventContextType {
  all: Event[];
  ongoing: Event[];
  upcomingWeek: Event[];
  featured: Event[];
  adminAll: Event[];
  myOrganizing: Event[];
  myPresenting: Event[];
  myRegistrations: any[];
  myAll: Event[];
  loading: boolean;
  fetchOngoing: () => Promise<void>;
  fetchUpcomingWeek: () => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchAdminAll: () => Promise<void>;
  fetchMyOrganizing: () => Promise<void>;
  fetchMyPresenting: () => Promise<void>;
  fetchMyRegistrations: () => Promise<void>;
  fetchMyAll: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Helper để đảm bảo dữ liệu luôn là mảng
const ensureArray = (data: any) => (Array.isArray(data) ? data : []);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [all, setAll] = useState<Event[]>([]);
  const [ongoing, setOngoing] = useState<Event[]>([]);
  const [upcomingWeek, setUpcomingWeek] = useState<Event[]>([]);
  const [featured, setFeatured] = useState<Event[]>([]);
  const [adminAll, setAdminAll] = useState<Event[]>([]);
  const [myOrganizing, setMyOrganizing] = useState<Event[]>([]);
  const [myPresenting, setMyPresenting] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [myAll, setMyAll] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOngoing = useCallback(async () => {
    try {
      const res = await getOngoingEvents();
      setOngoing(ensureArray(res));
    } catch (err) {
      console.error("fetchOngoing error:", err);
      setOngoing([]);
    }
  }, []);

  const fetchUpcomingWeek = useCallback(async () => {
    try {
      const res = await getUpcomingWeekEvents();
      setUpcomingWeek(ensureArray(res));
    } catch (err) {
      console.error("fetchUpcomingWeek error:", err);
      setUpcomingWeek([]);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await getFeaturedEvents();
      setFeatured(ensureArray(res));
    } catch (err) {
      setFeatured([]);
    }
  }, []);

  const fetchAdminAll = useCallback(async () => {
    try {
      const res = await getAdminAllEvents();
      setAdminAll(ensureArray(res));
    } catch (err) {
      setAdminAll([]);
    }
  }, []);

  const fetchMyOrganizing = useCallback(async () => {
    try {
      const res = await getMyEventsByRole("ORGANIZER");
      setMyOrganizing(ensureArray(res));
    } catch (err) {
      setMyOrganizing([]);
    }
  }, []);

  const fetchMyPresenting = useCallback(async () => {
    try {
      const res = await getMyEventsByRole("PRESENTER");
      setMyPresenting(ensureArray(res));
    } catch (err) {
      setMyPresenting([]);
    }
  }, []);

  const fetchMyRegistrations = useCallback(async () => {
    try {
      const res = await getMyRegistrations();
      setMyRegistrations(ensureArray(res));
    } catch (err) {
      setMyRegistrations([]);
    }
  }, []);

  const fetchMyAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getAllActiveEvents(),
        getOngoingEvents(),
        getUpcomingWeekEvents(),
        getFeaturedEvents(),
      ]);

      if (results[0].status === "fulfilled")
        setAll(ensureArray(results[0].value));
      if (results[1].status === "fulfilled")
        setOngoing(ensureArray(results[1].value));
      if (results[2].status === "fulfilled")
        setUpcomingWeek(ensureArray(results[2].value));
      if (results[3].status === "fulfilled")
        setFeatured(ensureArray(results[3].value));
    } catch (err) {
      console.error("fetchMyAll error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <EventContext.Provider
      value={{
        all,
        ongoing,
        upcomingWeek,
        featured,
        adminAll,
        myOrganizing,
        myPresenting,
        myRegistrations,
        myAll,
        loading,
        fetchOngoing,
        fetchUpcomingWeek,
        fetchFeatured,
        fetchAdminAll,
        fetchMyOrganizing,
        fetchMyPresenting,
        fetchMyRegistrations,
        fetchMyAll,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context)
    throw new Error("useEventContext must be used within an EventProvider");
  return context;
};
