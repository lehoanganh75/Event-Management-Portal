import React, { useState, useEffect } from 'react';
import {
  Calendar, Share2, ClipboardList, FileText,
  TrendingUp, Eye, Heart, RotateCcw, Download, ChevronDown, Award, Loader2
} from 'lucide-react';
import ActivityChart from '../../components/common/ActivityChart';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import { exportDashboardToExcel } from '../../utils/exportDashboardExcel';

const StatCard = ({ title, count, color, icon: Icon }) => (
  <div className={`
    bg-linear-to-br ${color} rounded-xl p-6 shadow-sm 
    hover:shadow-md hover:-translate-y-1 transition-all duration-300
    flex flex-col justify-between h-36 relative overflow-hidden
  `}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-white/90 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-white text-5xl font-extrabold mt-2 tracking-tight">{count}</h3>
      </div>
      <Icon size={52} className="text-white/30 absolute -bottom-4 -right-4" strokeWidth={1.2} />
    </div>
  </div>
);

const UserRankingItem = ({ name, events }) => (
  <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
      {name.charAt(0)}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{name}</p>
    </div>
    <div className="text-right text-sm font-medium text-gray-600">
      {events} sự kiện
    </div>
  </div>
);

const InfoListCard = ({ title, icon: Icon, items, iconColor = "text-blue-600" }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow transition-shadow duration-300">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
      <Icon size={20} className={`${iconColor}`} strokeWidth={2} />
      <h4 className="font-semibold text-gray-800 text-base">{title}</h4>
    </div>
    <div className="p-5 space-y-3.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center text-sm">
          <span className="text-gray-700 font-medium">{item.label}</span>
          <span className={`font-semibold ${String(item.value || '').includes('♥') ? 'text-pink-600' : 'text-gray-700'}`}>
            {item.value !== undefined ? item.value : item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [selectedKhoa, setSelectedKhoa] = useState('Tất cả khoa');
  const [filterType, setFilterType] = useState('Month'); // Week, Month
  const [filterValue, setFilterValue] = useState(new Date().getMonth() + 1); // Month: 1-12, Week: "start|end"
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ events: 0, posts: 0, plans: 0, recaps: 0 });
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
  const [allEvents, setAllEvents] = useState([]);

  const isWithinFilter = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    
    if (filterType === 'Week') {
      if (typeof filterValue === 'string' && filterValue.includes('|')) {
        const [startStr, endStr] = filterValue.split('|');
        const start = new Date(startStr);
        const end = new Date(endStr);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      // Fallback to last 7 days if no value
      const oneDay = 24 * 60 * 60 * 1000;
      const diff = now - date;
      return diff >= 0 && diff < 7 * oneDay;
    }
    
    if (filterType === 'Month') {
      return date.getMonth() + 1 === parseInt(filterValue) && date.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  const generateWeeks = () => {
    const weeks = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Start from the beginning of the year
    let d = new Date(currentYear, 0, 1);
    // Find first Monday
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    
    while (d <= now || d.getFullYear() === currentYear) {
      const start = new Date(d);
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      
      const label = `Tuần ${weeks.length + 1} (${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1})`;
      const value = `${start.toISOString()}|${end.toISOString()}`;
      
      weeks.push({ label, value, isCurrent: now >= start && now <= end });
      d.setDate(d.getDate() + 7);
      
      if (d.getFullYear() > currentYear) break;
    }
    return weeks.reverse().slice(0, 12); // Show last 12 weeks, newest first
  };

  const weeks = generateWeeks();

  // Set default week if switching to week type
  useEffect(() => {
    if (filterType === 'Week') {
      const currentWeek = weeks.find(w => w.isCurrent) || weeks[0];
      if (currentWeek) setFilterValue(currentWeek.value);
    } else if (filterType === 'Month') {
      setFilterValue(new Date().getMonth() + 1);
    }
  }, [filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, postsRes, usersRes] = await Promise.all([
        eventService.getAdminAllEvents(),
        eventService.getAllPosts({ size: 1000 }),
        authService.getAllAccounts()
      ]);

      const events = eventsRes.data || [];
      const posts = postsRes.data?.content || postsRes.data || [];
      const users = usersRes.data || [];

      setAllEvents(events);

      // Filter based on selected time range
      const filteredEvents = events.filter(e => isWithinFilter(e.createdAt || e.startTime));
      const filteredPosts = posts.filter(p => isWithinFilter(p.createdAt || p.publishedAt));

      // 1. Stat Cards calculation based on FILTERED data
      const plans = filteredEvents.filter(e => ['DRAFT', 'PLAN_PENDING_APPROVAL', 'PLAN_APPROVED'].includes(e.status));
      const recaps = filteredEvents.filter(e => e.status === 'COMPLETED');
      setStats({
        events: filteredEvents.length,
        posts: filteredPosts.length,
        plans: plans.length,
        recaps: recaps.length
      });

      // 2. Map Users
      const userMap = {};
      users.forEach(u => {
        userMap[u.id] = u.profile?.fullName || u.username;
      });

      // 3. Top creators (based on all data or filtered? usually all for ranking, but let's keep it consistent)
      const userEventCount = {};
      events.forEach(e => {
        if (e.createdByAccountId) {
          userEventCount[e.createdByAccountId] = (userEventCount[e.createdByAccountId] || 0) + 1;
        }
      });
      const topU = Object.entries(userEventCount)
        .map(([id, count]) => ({ name: userMap[id] || `User ${id.substring(0,4)}`, events: count }))
        .sort((a, b) => b.events - a.events)
        .slice(0, 4);
      setTopUsers(topU.length > 0 ? topU : [{ name: "Nguyễn Văn An", events: 12 }]);

      // 4. Hot Events (from filtered data)
      const topE = [...filteredEvents]
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 3)
        .map(e => ({ label: e.title || e.eventTopic }));
      setHotEvents(topE.length > 0 ? topE : [{ label: "Chưa có dữ liệu" }]);

      // 5. Top Liked (from filtered data)
      const topL = [...filteredPosts]
        .map(p => ({ label: p.title, value: `${Object.keys(p.reactions || {}).length} ♥` }))
        .sort((a, b) => parseInt(b.value) - parseInt(a.value))
        .slice(0, 3);
      setTopLiked(topL.length > 0 ? topL : [{ label: "Chưa có dữ liệu", value: "0 ♥" }]);

      // 6. Top Viewed
      const topV = [...filteredPosts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map(p => ({ label: p.title, value: p.viewCount || 0 }));
      setTopViewed(topV.length > 0 ? topV : [{ label: "Chưa có dữ liệu", value: "0" }]);

      // 7. Activity Chart (Always yearly)
      const currentYear = new Date().getFullYear();
      const chartMap = Array.from({ length: 12 }).map((_, i) => ({
        name: `T${i + 1}`,
        post: 0, plan: 0, recap: 0, event: 0
      }));

      events.forEach(e => {
        const d = new Date(e.createdAt || e.startTime);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (['DRAFT', 'PLAN_PENDING_APPROVAL', 'PLAN_APPROVED'].includes(e.status)) chartMap[m].plan++;
          else if (e.status === 'COMPLETED') chartMap[m].recap++;
          else chartMap[m].event++;
        }
      });

      posts.forEach(p => {
        const d = new Date(p.createdAt || p.publishedAt);
        if (d.getFullYear() === currentYear) chartMap[d.getMonth()].post++;
      });

      setChartData(chartMap);

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedKhoa, filterType, filterValue]);

  const handleExport = () => {
    exportDashboardToExcel({ stats, topUsers, hotEvents, topLiked, topViewed }, 'Bao_cao_Dashboard_Khoa');
  };

  return (
    <div className="space-y-6 bg-gray-50/70 min-h-screen p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tổng quan</h1>
          <p className="text-gray-600 mt-1.5">Theo dõi toàn bộ hoạt động trong khoa</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Khoa Selector */}
          <div className="relative min-w-40">
            <select
              value={selectedKhoa}
              onChange={e => setSelectedKhoa(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition"
            >
              <option>Tất cả khoa</option>
              <option>CNTT</option>
              <option>Cơ khí</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Filter Type Selector */}
          <div className="relative min-w-32">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition font-medium"
            >
              <option value="Week">Theo Tuần</option>
              <option value="Month">Theo Tháng</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Week Selector */}
          {filterType === 'Week' && (
            <div className="relative min-w-48">
              <select
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition"
              >
                {weeks.map((w, idx) => (
                  <option key={idx} value={w.value}>
                    {w.label} {w.isCurrent ? '(Hiện tại)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Month Selector (Only show if filterType is Month) */}
          {filterType === 'Month' && (
            <div className="relative min-w-32">
              <select
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}

          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition">
            <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>

          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition">
            <Download size={16} />
            Xuất
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-36 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Sự kiện" count={stats.events} color="from-blue-500 to-blue-600" icon={Calendar} />
          <StatCard title="Bài post" count={stats.posts} color="from-pink-500 to-rose-500" icon={Share2} />
          <StatCard title="Kế hoạch" count={stats.plans} color="from-green-500 to-emerald-600" icon={ClipboardList} />
          <StatCard title="Recap" count={stats.recaps} color="from-orange-500 to-amber-600" icon={FileText} />
        </div>
      )}

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-600" />
            Hoạt động năm {new Date().getFullYear()} - Khoa
          </h3>
          {chartData ? <ActivityChart data={chartData} /> : <ActivityChart />}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
            <Award size={20} className="text-amber-600" />
            Top người tạo sự kiện
          </h3>
          <div className="space-y-1">
            {topUsers.map((user, idx) => (
              <UserRankingItem key={idx} {...user} />
            ))}
          </div>
        </div>
      </div>

      {/* Hot Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoListCard title="Từ khóa hot" icon={TrendingUp} items={hotKeywords} iconColor="text-blue-600" />
        <InfoListCard title="Sự kiện hot nhất" icon={Calendar} items={hotEvents} iconColor="text-amber-600" />
        <InfoListCard title="Top bài được yêu thích" icon={Heart} items={topLiked} iconColor="text-pink-600" />
        <InfoListCard title="Top bài được xem nhiều" icon={Eye} items={topViewed} iconColor="text-emerald-600" />
      </div>
    </div>
  );
};

export default Dashboard;
