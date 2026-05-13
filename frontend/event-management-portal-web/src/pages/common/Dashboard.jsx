import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Share2, ClipboardList, FileText,
  TrendingUp, Eye, Heart, RotateCcw, Download, ChevronDown, Award, Loader2
} from 'lucide-react';
import ActivityChart from '../../components/common/ActivityChart';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
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

const isWithinFilter = (dateStr, type, value) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (type === 'Month') {
    return date.getMonth() + 1 === parseInt(value) && date.getFullYear() === new Date().getFullYear();
  }
  if (type === 'Week' && typeof value === 'string') {
    const [start, end] = value.split('|').map(d => new Date(d));
    return date >= start && date <= end;
  }
  return true;
};

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => {
    const roles = user?.roles || (user?.role ? [{ name: user.role }] : []);
    return roles.some(r => {
      const name = (typeof r === 'string' ? r : r.name)?.toUpperCase();
      return name === 'ADMIN' || name === 'SUPER_ADMIN';
    });
  }, [user]);

  const isManager = useMemo(() => {
    if (isAdmin) return true;
    const roles = user?.roles || (user?.role ? [{ name: user.role }] : []);
    return roles.some(r => {
      const name = (typeof r === 'string' ? r : r.name)?.toUpperCase();
      return ['ORGANIZER', 'MANAGER'].includes(name);
    });
  }, [user, isAdmin]);

  const [selectedKhoa, setSelectedKhoa] = useState('Tất cả khoa');
  const [dataScope, setDataScope] = useState(isAdmin ? 'KHOA' : 'PERSONAL'); // KHOA or PERSONAL
  const [filterType, setFilterType] = useState('Month'); // Week, Month
  const [filterValue, setFilterValue] = useState(new Date().getMonth() + 1); // Month: 1-12, Week: "start|end"
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);

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
  const availableKhoas = useMemo(() => {
    const names = new Set();
    // Use raw allEvents which isn't filtered by time yet
    allEvents.forEach(e => {
      if (e.organization?.name) names.add(e.organization.name);
    });
    return Array.from(names).sort();
  }, [allEvents]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const requests = [];

      if (dataScope === 'KHOA' && isAdmin) {
        requests.push(eventService.getAdminAllEvents());
        requests.push(eventService.getAllPosts({ size: 1000 }));
        requests.push(authService.getAllAccounts());
      } else if (dataScope === 'KHOA' && !isAdmin) {
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

      // Save raw events for the Khoa list
      if (dataScope === 'KHOA') {
        setAllEvents(events);
      }

      // Filter by Khoa if applicable
      if (dataScope === 'KHOA' && selectedKhoa !== 'Tất cả khoa') {
        events = events.filter(e => e.organization?.name === selectedKhoa);
        const filteredEventIds = new Set(events.map(e => e.id));
        posts = posts.filter(p => {
          const eId = p.eventId || p.event?.id;
          return filteredEventIds.has(eId);
        });
      }

      // If personal view, filter posts by current user ID
      if (dataScope === 'PERSONAL' && user?.id) {
        posts = posts.filter(p => p.author?.id === user.id || p.authorId === user.id);
      }

      // Filter based on selected time range
      const filteredEvents = events.filter(e => isWithinFilter(e.createdAt || e.startTime, filterType, filterValue));
      const filteredPosts = posts.filter(p => isWithinFilter(p.createdAt || p.publishedAt, filterType, filterValue));

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

      // 3. Top creators
      const userEventCount = {};
      events.forEach(e => {
        if (e.createdByAccountId) {
          userEventCount[e.createdByAccountId] = (userEventCount[e.createdByAccountId] || 0) + 1;
        }
      });
      const topU = Object.entries(userEventCount)
        .map(([id, count]) => ({ name: userMap[id] || `Thành viên ${id.substring(0, 4)}`, events: count }))
        .sort((a, b) => b.events - a.events)
        .slice(0, 4);
      setTopUsers(topU.length > 0 ? topU : [
        { name: "Lê Hoàng Anh", events: 8 },
        { name: "Nguyễn Minh Khoa", events: 5 },
        { name: "Trần Thị Bé", events: 3 }
      ]);

      // 4. Hot Events
      const topE = [...filteredEvents]
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 3)
        .map(e => ({ label: e.title || e.eventTopic }));
      setHotEvents(topE);

      // 5. Top Liked
      const topL = [...filteredPosts]
        .map(p => ({ label: p.title, value: `${Object.keys(p.reactions || {}).length} ♥` }))
        .sort((a, b) => parseInt(b.value) - parseInt(a.value))
        .slice(0, 3);
      setTopLiked(topL);

      // 6. Top Viewed
      const topV = [...filteredPosts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map(p => ({ label: p.title, value: p.viewCount || 0 }));
      setTopViewed(topV);

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
  }, [selectedKhoa, dataScope, filterType, filterValue]);

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
          {/* Data Scope Toggle (Only for Admin/Manager) */}
          {isManager && (
            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => {
                  setDataScope('PERSONAL');
                  setSelectedKhoa('Tất cả khoa');
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${dataScope === 'PERSONAL' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Cá nhân
              </button>
              <button
                onClick={() => setDataScope('KHOA')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${dataScope === 'KHOA' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Khoa
              </button>
            </div>
          )}

          {/* Khoa Selector */}
          {dataScope === 'KHOA' && (
            <div className="relative min-w-40">
              <select
                value={selectedKhoa}
                onChange={e => setSelectedKhoa(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition"
              >
                <option value="Tất cả khoa">Tất cả khoa</option>
                {availableKhoas.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}


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
            Hoạt động năm {new Date().getFullYear()} - {dataScope === 'KHOA' ? selectedKhoa : 'Cá nhân'}
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
