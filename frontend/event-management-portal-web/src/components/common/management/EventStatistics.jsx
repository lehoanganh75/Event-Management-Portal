import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Users, CheckCircle, TrendingUp, Clock, UserPlus, FileBarChart, Award, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import eventService from '../../../services/eventService';
import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const EventStatistics = ({ summary, loading: initialLoading, eventTitle }) => {
  const [aiAnalysis, setAiAnalysis] = React.useState(null);
  const [isAnalysing, setIsAnalysing] = React.useState(false);

  const fetchAiAnalysis = async () => {
    if (!summary || aiAnalysis) return;
    setIsAnalysing(true);
    try {
      const statsData = {
        eventTitle: eventTitle || "Sự kiện",
        totalRegistered: summary.totalRegistered,
        totalCheckedIn: summary.totalCheckedIn,
        attendanceRate: summary.attendanceRate,
        registrationTimeline: summary.detailedAnalysis?.registrationTimeline,
        checkInTimeline: summary.detailedAnalysis?.checkInTimeline
      };
      
      const res = await eventService.chat.analyzeStats(JSON.stringify(statsData));
      if (res.data?.code === 1000 && res.data.result) {
        try {
          // AI returns a JSON string inside the result
          const parsed = JSON.parse(res.data.result.replace(/```json|```/g, '').trim());
          setAiAnalysis(parsed);
        } catch (e) {
          console.error("Failed to parse AI JSON:", e);
          // Fallback if AI returns plain text
          setAiAnalysis({
            summary: res.data.result.substring(0, 200),
            recommendation: "Tiếp tục tối ưu",
            highlight: "Dữ liệu thực tế",
            lessonsLearned: res.data.result
          });
        }
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setIsAnalysing(false);
    }
  };

  React.useEffect(() => {
    if (summary && !initialLoading) {
      fetchAiAnalysis();
    }
  }, [summary, initialLoading]);

  if (initialLoading) return <div className="p-20 text-center text-gray-500">Đang tải phân tích...</div>;
  if (!summary) return (
    <div className="p-20 text-center">
      <FileBarChart size={64} className="mx-auto text-gray-300 mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-gray-400">Chưa có dữ liệu phân tích</h3>
      <p className="text-gray-400 mt-2">Dữ liệu sẽ hiển thị khi có người đăng ký hoặc tham gia.</p>
    </div>
  );

  const { detailedAnalysis, totalRegistered, totalCheckedIn, attendanceRate, isLive } = summary;

  // Process timeline data for charts
  const registrationData = useMemo(() => {
    if (!detailedAnalysis?.registrationTimeline) return [];
    return Object.entries(detailedAnalysis.registrationTimeline).map(([date, count]) => ({
      name: date,
      value: count
    }));
  }, [detailedAnalysis]);

  const checkInData = useMemo(() => {
    if (!detailedAnalysis?.checkInTimeline) return [];
    return Object.entries(detailedAnalysis.checkInTimeline).map(([hour, count]) => ({
      name: `${hour}h`,
      value: count
    }));
  }, [detailedAnalysis]);

  const statusData = useMemo(() => {
    if (!detailedAnalysis?.statusDistribution) return [];
    return Object.entries(detailedAnalysis.statusDistribution).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [detailedAnalysis]);

  const insights = useMemo(() => {
    const strengths = [];
    const improvements = [];

    // Strength analysis
    if (attendanceRate > 75) {
      strengths.push("Tỷ lệ tham gia thực tế rất cao, cho thấy nội dung sự kiện hấp dẫn và công tác nhắc hẹn tốt.");
    } else if (attendanceRate > 50) {
      strengths.push("Tỷ lệ tham gia ở mức khá tốt, duy trì được sự quan tâm của người tham dự.");
    }

    if (totalRegistered > 50) {
      strengths.push(`Sức hút của sự kiện tốt với ${totalRegistered} lượt đăng ký quan tâm.`);
    }

    // Check-in efficiency
    if (totalCheckedIn > 0 && totalCheckedIn === totalRegistered) {
      strengths.push("Tuyệt vời! 100% người đăng ký đã có mặt đầy đủ.");
    }

    // Improvements
    if (attendanceRate < 40) {
      improvements.push("Tỷ lệ tham gia thấp. Cần khảo sát nguyên nhân (thời gian, địa điểm hoặc tính hấp dẫn của nội dung).");
      improvements.push("Tăng cường các kênh truyền thông và nhắc lịch tự động cho người đăng ký.");
    }

    // Check-in speed analysis
    const checkInPeak = Object.entries(detailedAnalysis?.checkInTimeline || {})
      .sort((a, b) => b[1] - a[1])[0];
    if (checkInPeak && checkInPeak[1] > totalCheckedIn * 0.5 && totalCheckedIn > 20) {
      improvements.push(`Người tham dự tập trung check-in dồn dập vào lúc ${checkInPeak[0]}h. Cần mở thêm luồng check-in hoặc đón khách sớm hơn.`);
    }

    if (totalRegistered > 0 && totalCheckedIn === 0) {
      improvements.push("Chưa ghi nhận dữ liệu check-in. Cần kiểm tra lại thiết bị quét mã hoặc quy trình đón khách.");
    }

    if (strengths.length === 0) strengths.push("Sự kiện bước đầu hoàn thành các mục tiêu cơ bản về mặt số lượng.");
    if (improvements.length === 0) improvements.push("Tiếp tục phát huy quy trình hiện tại và theo dõi phản hồi chi tiết từ người dùng.");

    return { strengths, improvements };
  }, [attendanceRate, totalRegistered, detailedAnalysis, totalCheckedIn]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<UserPlus className="text-indigo-600" />} 
          label="Tổng đăng ký" 
          value={totalRegistered} 
          trend="+12%" 
          color="indigo" 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="Đã tham gia" 
          value={totalCheckedIn} 
          trend={`${attendanceRate.toFixed(1)}%`} 
          color="emerald" 
        />
        <StatCard 
          icon={<Clock className="text-amber-600" />} 
          label="Tỷ lệ có mặt" 
          value={`${attendanceRate.toFixed(1)}%`} 
          color="amber" 
        />
        <StatCard 
          icon={<TrendingUp className="text-rose-600" />} 
          label="Độ hiệu quả" 
          value={attendanceRate > 70 ? "Cao" : attendanceRate > 40 ? "Trung bình" : "Thấp"} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Timeline Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Tiến độ đăng ký theo ngày
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black animate-pulse border border-red-100">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                DỮ LIỆU TRỰC TIẾP
              </span>
            )}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Check-in Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            Mật độ check-in theo khung giờ
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Trạng thái đăng ký</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics or other metrics can go here */}
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-200 lg:col-span-2 text-white relative overflow-hidden">
          {isAnalysing ? (
            <div className="relative z-10 h-full flex flex-col justify-center items-center py-10">
              <Loader2 className="animate-spin mb-4 opacity-50" size={40} />
              <p className="text-indigo-100 font-bold animate-pulse">Gemini đang phân tích dữ liệu chuyên sâu...</p>
            </div>
          ) : (
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles size={24} className="text-amber-300" />
                Đánh giá tổng quát
              </h3>
              <p className="text-indigo-50 mb-6 font-medium leading-relaxed">
                {aiAnalysis?.summary || `Dựa trên dữ liệu thu thập được, sự kiện của bạn đã đạt hiệu quả ${attendanceRate > 70 ? 'vượt mong đợi' : attendanceRate > 40 ? 'khá tốt' : 'cần cải thiện'}.`}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-indigo-200 text-xs mb-1 font-bold uppercase tracking-wider">Khuyên dùng</p>
                  <p className="font-black text-lg">{aiAnalysis?.recommendation || (attendanceRate > 60 ? 'Mở rộng quy mô' : 'Tối ưu nội dung')}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-indigo-200 text-xs mb-1 font-bold uppercase tracking-wider">Điểm sáng</p>
                  <p className="font-black text-lg">{aiAnalysis?.highlight || (totalRegistered > 20 ? 'Sức hút tốt' : 'Tiềm năng cao')}</p>
                </div>
              </div>
            </div>
          )}
          <TrendingUp size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
        </div>
      </div>

      {/* Phân tích & Bài học kinh nghiệm */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Lightbulb size={120} className="text-amber-500" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award size={24} className="text-amber-500" />
            Phân tích & Bài học kinh nghiệm
          </h3>
          <div className="text-gray-600 mb-8 leading-relaxed italic text-sm border-l-4 border-amber-200 pl-4 py-2 bg-amber-50/30 rounded-r-2xl">
            {isAnalysing ? (
                <div className="flex items-center gap-3 py-2">
                    <Loader2 size={16} className="animate-spin text-amber-500" />
                    <span>AI đang đúc kết bài học từ dữ liệu...</span>
                </div>
            ) : (
                aiAnalysis?.lessonsLearned || "Thông qua việc phân tích dữ liệu tham gia, phản hồi từ người dùng và hiệu quả hoạt động, nhà trường có thể rút ra những bài học kinh nghiệm, từ đó cải tiến quy trình tổ chức và nâng cao chất lượng sự kiện trong những lần tiếp theo."
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Điểm mạnh & Thành công
              </h4>
              <ul className="space-y-3">
                {insights.strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 transition-all hover:bg-emerald-50">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Đề xuất cải tiến
              </h4>
              <ul className="space-y-3">
                {insights.improvements.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 transition-all hover:bg-indigo-50">
                    <TrendingUp size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 bg-${color}-50 rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      {trend && <span className={`text-${color}-600 text-xs font-bold px-2 py-1 bg-${color}-50 rounded-full`}>{trend}</span>}
    </div>
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <h4 className="text-2xl font-black text-slate-800">{value}</h4>
  </div>
);

export default EventStatistics;
