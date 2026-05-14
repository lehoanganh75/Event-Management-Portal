import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import eventService from "../../services/eventService";
import authService from "../../services/authService";
import analyticsService from "../../services/analyticsService";
import { useAuth } from "../../context/AuthContext";
import { exportDashboardToExcel } from "../../utils/exportDashboardExcel";

// New modular components
import DashboardFilters from "../../components/dashboard/DashboardFilters";
import DashboardStats from "../../components/dashboard/DashboardStats";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import HotLists from "../../components/dashboard/HotLists";

const isWithinFilter = (dateStr, type, value) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (type === "Month") {
    return (
      date.getMonth() + 1 === parseInt(value) &&
      date.getFullYear() === new Date().getFullYear()
    );
  }
  if (type === "Week" && typeof value === "string") {
    const [start, end] = value.split("|").map((d) => new Date(d));
    return date >= start && date <= end;
  }
  return true;
};

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => {
    const roles = user?.roles || (user?.role ? [{ name: user.role }] : []);
    return roles.some((r) => {
      const name = (typeof r === "string" ? r : r.name)?.toUpperCase();
      return name === "ADMIN" || name === "SUPER_ADMIN";
    });
  }, [user]);

  const isManager = useMemo(() => {
    if (isAdmin) return true;
    const roles = user?.roles || (user?.role ? [{ name: user.role }] : []);
    return roles.some((r) => {
      const name = (typeof r === "string" ? r : r.name)?.toUpperCase();
      return ["ORGANIZER", "MANAGER", "LECTURER", "MEMBER"].includes(name);
    });
  }, [user, isAdmin]);

  const [selectedKhoa, setSelectedKhoa] = useState("Tất cả khoa");
  const [dataScope, setDataScope] = useState(isAdmin ? "KHOA" : "PERSONAL");
  const [filterType, setFilterType] = useState("Month");
  const [filterValue, setFilterValue] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    events: 0,
    posts: 0,
    plans: 0,
    recaps: 0,
  });
  const [topUsers, setTopUsers] = useState([]);
  const [hotKeywords, setHotKeywords] = useState([
    { label: "#HoiThaoKhoaHoc", value: "156" },
    { label: "#SinhVienIUH", value: "142" },
    { label: "#TuThienCongDong", value: "128" },
    { label: "#ThiDauTheThao", value: "98" },
  ]);
  const [hotEvents, setHotEvents] = useState([]);
  const [topLiked, setTopLiked] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Generate weeks for the filter
  const weeks = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + 1 - i * 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const label = `Tuần ${start.getDate()}/${start.getMonth() + 1
        } - ${end.getDate()}/${end.getMonth() + 1}`;
      const value = `${start.toISOString()}|${end.toISOString()}`;

      result.push({ label, value, isCurrent: i === 0 });
    }
    return result;
  }, []);

  const availableKhoas = useMemo(() => {
    const names = new Set();
    allEvents.forEach((e) => {
      if (e.organization?.name) names.add(e.organization.name);
    });
    return Array.from(names).sort();
  }, [allEvents]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const requests = [];

      if (dataScope === "KHOA" && isAdmin) {
        requests.push(eventService.getAdminAllEvents());
        requests.push(eventService.getAllPosts({ size: 1000 }));
        requests.push(authService.getAllAccounts());
      } else if (dataScope === "KHOA" && !isAdmin) {
        requests.push(eventService.getEventsForUser({ size: 1000 }));
        requests.push(eventService.getAllPosts({ size: 1000 }));
        requests.push(Promise.resolve({ data: [] }));
      } else {
        requests.push(eventService.getMyEvents());
        requests.push(eventService.getAllPosts({ size: 1000 }));
        requests.push(Promise.resolve({ data: [] }));
      }

      const [eventsRes, postsRes, usersRes] = await Promise.all(requests);

      let events = eventsRes.data || [];
      let posts = postsRes.data?.content || postsRes.data || [];
      const users = usersRes.data || [];

      if (dataScope === "KHOA") {
        setAllEvents(events);
      }

      if (dataScope === "KHOA" && selectedKhoa !== "Tất cả khoa") {
        events = events.filter((e) => e.organization?.name === selectedKhoa);
        const filteredEventIds = new Set(events.map((e) => e.id));
        posts = posts.filter((p) => {
          const eId = p.eventId || p.event?.id;
          return filteredEventIds.has(eId);
        });
      }

      if (dataScope === "PERSONAL" && user?.id) {
        posts = posts.filter(
          (p) => p.author?.id === user.id || p.authorId === user.id
        );
      }

      const filteredEvents = events.filter((e) =>
        isWithinFilter(e.createdAt || e.startTime, filterType, filterValue)
      );
      const filteredPosts = posts.filter((p) =>
        isWithinFilter(p.createdAt || p.publishedAt, filterType, filterValue)
      );

      // Try to get aggregated stats from analytics service if in KHOA scope
      let aggregatedStats = null;
      if (dataScope === "KHOA" && isAdmin) {
        try {
          aggregatedStats = await analyticsService.getAdminDashboard();
        } catch (err) {
          console.warn("Analytics service unavailable, falling back to client-side aggregation");
        }
      }

      const plans = filteredEvents.filter((e) =>
        ["DRAFT", "PLAN_PENDING_APPROVAL", "PLAN_APPROVED"].includes(e.status)
      );
      const recaps = filteredEvents.filter((e) => e.status === "COMPLETED");

      setStats({
        events: aggregatedStats?.totalEvents || filteredEvents.length,
        posts: aggregatedStats?.totalPosts || filteredPosts.length,
        plans: aggregatedStats?.totalPlans || plans.length,
        recaps: aggregatedStats?.totalCompletedEvents || recaps.length,
      });

      const userMap = {};
      users.forEach((u) => {
        userMap[u.id] = u.profile?.fullName || u.username;
      });

      const userEventCount = {};
      events.forEach((e) => {
        if (e.createdByAccountId) {
          userEventCount[e.createdByAccountId] =
            (userEventCount[e.createdByAccountId] || 0) + 1;
        }
      });
      const topU = Object.entries(userEventCount)
        .map(([id, count]) => ({
          name: userMap[id] || `Thành viên ${id.substring(0, 4)}`,
          events: count,
        }))
        .sort((a, b) => b.events - a.events)
        .slice(0, 4);
      setTopUsers(
        topU.length > 0
          ? topU
          : [
            { name: "Lê Hoàng Anh", events: 8 },
            { name: "Nguyễn Minh Khoa", events: 5 },
            { name: "Trần Thị Bé", events: 3 },
          ]
      );

      // 4. Hot Events
      const topE = [...filteredEvents]
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 5)
        .map((e) => ({ label: e.title || e.eventTopic, value: e.registeredCount || 0 }));
      setHotEvents(topE);

      // 4.1. Extract Hot Keywords from posts (assuming they have tags or hashtags)
      const keywordMap = {};
      posts.forEach(p => {
        const tags = p.tags || p.hashtags || [];
        tags.forEach(tag => {
          const tagName = tag.name || tag;
          keywordMap[tagName] = (keywordMap[tagName] || 0) + 1;
        });
      });
      const topKeywords = Object.entries(keywordMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({ label: `#${label.replace(/^#/, '')}`, value: value.toString() }));

      if (topKeywords.length > 0) {
        setHotKeywords(topKeywords);
      }

      const topL = [...filteredPosts]
        .map((p) => ({
          label: p.title,
          value: `${Object.keys(p.reactions || {}).length} ♥`,
        }))
        .sort((a, b) => parseInt(b.value) - parseInt(a.value))
        .slice(0, 3);
      setTopLiked(topL);

      const topV = [...filteredPosts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map((p) => ({ label: p.title, value: p.viewCount || 0 }));
      setTopViewed(topV);

      const currentYear = new Date().getFullYear();
      const chartMap = Array.from({ length: 12 }).map((_, i) => ({
        name: `T${i + 1}`,
        post: 0,
        plan: 0,
        recap: 0,
        event: 0,
      }));

      events.forEach((e) => {
        const d = new Date(e.createdAt || e.startTime);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (
            ["DRAFT", "PLAN_PENDING_APPROVAL", "PLAN_APPROVED"].includes(
              e.status
            )
          )
            chartMap[m].plan++;
          else if (e.status === "COMPLETED") chartMap[m].recap++;
          else chartMap[m].event++;
        }
      });

      posts.forEach((p) => {
        const d = new Date(p.createdAt || p.publishedAt);
        if (d.getFullYear() === currentYear) chartMap[d.getMonth()].post++;
      });

      setChartData(chartMap);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [dataScope, isAdmin, selectedKhoa, user, filterType, filterValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    exportDashboardToExcel(
      { stats, topUsers, hotEvents, topLiked, topViewed },
      "Bao_cao_Dashboard_Khoa"
    );
  };

  return (
    <div className="space-y-6 bg-gray-50/70 min-h-screen p-6">
      <DashboardFilters
        isManager={isManager}
        dataScope={dataScope}
        setDataScope={setDataScope}
        setSelectedKhoa={setSelectedKhoa}
        selectedKhoa={selectedKhoa}
        availableKhoas={availableKhoas}
        filterType={filterType}
        setFilterType={setFilterType}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        weeks={weeks}
        loading={loading}
        fetchData={fetchData}
        handleExport={handleExport}
      />

      <DashboardStats loading={loading} stats={stats} />

      <DashboardCharts
        chartData={chartData}
        dataScope={dataScope}
        selectedKhoa={selectedKhoa}
        topUsers={topUsers}
      />

      <HotLists
        hotKeywords={hotKeywords}
        hotEvents={hotEvents}
        topLiked={topLiked}
        topViewed={topViewed}
      />
    </div>
  );
};

export default Dashboard;
