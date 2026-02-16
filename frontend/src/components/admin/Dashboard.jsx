import React, { useState } from 'react';
import { 
  Calendar, Share2, ClipboardList, FileText, 
  TrendingUp, Eye, Heart, RotateCcw, Download, ChevronDown, Award 
} from 'lucide-react';
import ActivityChart from '../charts/ActivityChart';

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
          <span className={`font-semibold ${item.value?.includes('♥') ? 'text-pink-600' : 'text-gray-700'}`}>
            {item.value || item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [selectedKhoa, setSelectedKhoa] = useState('Tất cả khoa');
  const [selectedMonth, setSelectedMonth] = useState('Theo Tháng');

  const topUsers = [
    { name: "Nguyễn Văn An", events: 12 },
    { name: "Trần Thị Bình", events: 10 },
    { name: "Lê Hoàng Cường", events: 8 },
    { name: "Phạm Thị Dung", events: 6 },
  ];

  const hotKeywords = [
    { label: "#HoiThaoKhoaHoc", value: "156" },
    { label: "#SinhVienIUH", value: "142" },
    { label: "#TuThienCongDong", value: "128" },
    { label: "#ThiDauTheThao", value: "98" },
  ];

  const hotEvents = [
    { label: "Hội thảo AI & Machine Learning" },
    { label: "Ngày hội việc làm 2026" },
    { label: "Giải bóng đá sinh viên" },
  ];

  const topLiked = [
    { label: "Chương trình trao học bổng", value: "245 ♥" },
    { label: "Cuộc thi Startup IUH", value: "198 ♥" },
    { label: "Workshop kỹ năng mềm", value: "167 ♥" },
  ];

  const topViewed = [
    { label: "Lịch thi học kỳ 2", value: "1.2K" },
    { label: "Thông báo học phí", value: "987" },
    { label: "Kết quả tuyển sinh", value: "856" },
  ];

  return (
    <div className="space-y-6 bg-gray-50/70 min-h-screen">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tổng quan</h1>
          <p className="text-gray-600 mt-1.5">Theo dõi toàn bộ hoạt động trong khoa</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-40">
            <select
              value={selectedKhoa}
              onChange={e => setSelectedKhoa(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 shadow-sm transition"
            >
              <option>Tất cả khoa</option>
              <option>CNTT</option>
              <option>Cơ khí</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative min-w-40">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 shadow-sm transition"
            >
              <option>Theo Tháng</option>
              <option>Tháng 1</option>
              <option>Tháng 2</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition">
            <Calendar size={16} />
            Tháng Giêng 2
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition">
            <RotateCcw size={16} />
            Tải lại
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition">
            <Download size={16} />
            Xuất
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Sự kiện" count="38" color="from-blue-500 to-blue-600" icon={Calendar} />
        <StatCard title="Bài post" count="42" color="from-pink-500 to-rose-500" icon={Share2} />
        <StatCard title="Kế hoạch" count="41" color="from-green-500 to-emerald-600" icon={ClipboardList} />
        <StatCard title="Recap" count="32" color="from-orange-500 to-amber-600" icon={FileText} />
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-600" />
            Hoạt động tháng 01/2026 - Khoa
          </h3>
          <ActivityChart />
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