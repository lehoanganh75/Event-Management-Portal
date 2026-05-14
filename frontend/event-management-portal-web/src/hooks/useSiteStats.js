import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_VISITS = 288_704_603;
const BASE_ONLINE = 212;
const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/events/site-stats';

/**
 * Realtime site stats fetching from backend Redis:
 * - totalVisits: increments on each new session
 * - online: tracks active heartbeats
 */
export function useSiteStats() {
  const [totalVisits, setTotalVisits] = useState(BASE_VISITS);
  const [online, setOnline] = useState(BASE_ONLINE);
  const [displayVisits, setDisplayVisits] = useState(BASE_VISITS);
  const animRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Initialize session ID
  if (!sessionIdRef.current) {
    let sid = sessionStorage.getItem("site_session_id");
    if (!sid) {
      sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("site_session_id", sid);
      
      // First visit for this session
      axios.post(`${API_URL}/visit`).catch(() => {});
    }
    sessionIdRef.current = sid;
  }

  const fetchStats = async () => {
    try {
      const response = await axios.post(`${API_URL}/heartbeat?sessionId=${sessionIdRef.current}`);
      const { totalVisits: tv, online: onl } = response.data;
      setTotalVisits(tv);
      setOnline(onl);
    } catch (err) {
      // Fallback or ignore
    }
  };

  // ── Initial Fetch & Heartbeat ──────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Heartbeat every 15s
    return () => clearInterval(interval);
  }, []);

  // ── Animate visit counter on change ──────────────────────────────────────────
  useEffect(() => {
    const target = totalVisits;
    const start = displayVisits;
    let current = start;

    const step = () => {
      if (Math.abs(target - current) < 1) {
        setDisplayVisits(target);
        return;
      }
      current += (target - current) / 10;
      setDisplayVisits(Math.round(current));
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [totalVisits]);

  return {
    totalVisits: displayVisits,
    online,
  };
}

/** Format number with commas: 288704603 → "288,704,603" */
export function formatCount(n) {
  return n.toLocaleString("en-US");
}
