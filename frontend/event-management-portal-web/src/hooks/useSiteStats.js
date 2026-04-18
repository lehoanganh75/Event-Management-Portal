import { useState, useEffect, useRef } from "react";

const BASE_VISITS = 288_704_603;
const BASE_ONLINE = 218;
const STORAGE_KEY = "iuh_site_stats";

/**
 * Simulates realtime site stats:
 * - totalVisits: persisted in localStorage, increments on each new session
 * - online: fluctuates randomly around a base value every few seconds
 */
export function useSiteStats() {
  const initStats = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const visits = saved.visits || BASE_VISITS;
      const sessionCounted = sessionStorage.getItem("iuh_session_counted");

      if (!sessionCounted) {
        // New session → increment visits
        const newVisits = visits + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: newVisits }));
        sessionStorage.setItem("iuh_session_counted", "1");
        return newVisits;
      }
      return visits;
    } catch {
      return BASE_VISITS;
    }
  };

  const [totalVisits, setTotalVisits] = useState(initStats);
  const [online, setOnline] = useState(BASE_ONLINE);
  const [displayVisits, setDisplayVisits] = useState(totalVisits);
  const animRef = useRef(null);

  // ── Animate visit counter on mount ──────────────────────────────────────────
  useEffect(() => {
    const target = totalVisits;
    const start = target - 120; // animate last 120 numbers
    let current = start;

    const step = () => {
      current += Math.ceil((target - current) / 8);
      setDisplayVisits(current);
      if (current < target) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayVisits(target);
      }
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [totalVisits]);

  // ── Fluctuate online count every 4-8 seconds ─────────────────────────────
  useEffect(() => {
    const tick = () => {
      setOnline((prev) => {
        // Random walk: ±1 to ±5, clamped between 150 and 400
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.min(400, Math.max(150, prev + delta));
      });
    };

    const schedule = () => {
      const delay = 4000 + Math.random() * 4000; // 4-8s
      return setTimeout(() => {
        tick();
        const id = schedule();
        return id;
      }, delay);
    };

    const id = schedule();
    return () => clearTimeout(id);
  }, []);

  // ── Increment visits slowly over time (simulate other users) ─────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalVisits((prev) => {
        const newVal = prev + 1;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: newVal }));
        } catch {}
        return newVal;
      });
    }, 30_000); // +1 every 30s

    return () => clearInterval(interval);
  }, []);

  return {
    totalVisits: displayVisits,
    online,
  };
}

/** Format number with commas: 288704603 → "288,704,603" */
export function formatCount(n) {
  return n.toLocaleString("en-US");
}
