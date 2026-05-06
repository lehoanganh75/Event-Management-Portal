import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertCircle, FileText, TrendingUp, Star, Lightbulb, Heart, MessageSquare } from 'lucide-react';
import analyticsService from '../../../services/analyticsService';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const EventAIAnalysis = ({ eventId }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportData, statsData] = await Promise.all([
        analyticsService.getAISummary(eventId),
        analyticsService.getEventStats(eventId)
      ]);

      if (reportData) setReport(reportData);
      if (statsData) setAnalytics(statsData);

    } catch (err) {
      console.error('Error fetching AI report:', err);
      setError('Chưa có báo cáo AI cho sự kiện này.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.generateAISummary(eventId);
      setReport(data);
      // Refresh stats too
      const stats = await analyticsService.getEventStats(eventId);
      setAnalytics(stats);
      toast.success('Đã khởi tạo phân tích AI thành công!');
    } catch (err) {
      console.error('Error generating AI report:', err);
      toast.error('Không thể khởi tạo phân tích AI. Vui lòng thử lại sau.');
      setError('Lỗi khi khởi tạo phân tích AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportAISummary(eventId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Báo cáo sự kiện_${eventId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Đang tải xuống báo cáo Word...');
    } catch (err) {
      console.error('Error exporting Word:', err);
      toast.error('Không thể xuất file Word. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchReport();
    }
  }, [eventId]);

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Đang thu thập và phân tích dữ liệu bằng AI...</p>
      </div>
    );
  }

  // Nếu không có báo cáo hoặc có lỗi (không tìm thấy trong DB), hiển thị màn hình bắt đầu
  if (!report) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
          <Bot className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">Phân tích sự kiện bằng AI</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          Hệ thống AI sẽ giúp bạn tổng hợp kết quả, đánh giá chất lượng và đề xuất các điểm cải thiện cho sự kiện tiếp theo dựa trên dữ liệu thực tế.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center mx-auto gap-3 shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Bot className="w-6 h-6" />}
          BẮT ĐẦU PHÂN TÍCH NGAY
        </button>
      </div>
    );
  }

  const renderBoldNumbers = (text) => {
    if (!text) return null;
    // Regex tìm số, số thập phân, phần trăm
    const parts = text.split(/(\d+(?:\.\d+)?%?)/g);
    return parts.map((part, i) =>
      /^\d+(?:\.\d+)?%?$/.test(part) ? (
        <span key={i} className="font-bold text-indigo-600">{part}</span>
      ) : part
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo tổng kết AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            XUẤT WORD
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 text-sm p-2 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Cập nhật phân tích
          </button>
        </div>
      </div>

      {/* Visual Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Tỷ lệ tham gia thực tế
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Tham gia', value: analytics.totalAttendees },
                      { name: 'Vắng mặt', value: Math.max(0, analytics.totalRegistrations - analytics.totalAttendees) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Chỉ số tương tác & Đánh giá
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Lượt thích', value: analytics.totalLikes },
                    { name: 'Bình luận', value: analytics.totalComments },
                    { name: 'Đánh giá x10', value: analytics.averageRating * 10 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Thống kê chi tiết
          </div>
          <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {renderBoldNumbers(report.quantitativeAnalysis) || 'Đang cập nhật...'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Đánh giá chuyên sâu
          </div>
          <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {renderBoldNumbers(report.qualitativeAnalysis) || 'Đang cập nhật...'}
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-indigo-50 p-5 border-b border-gray-100 flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="font-black text-indigo-900 uppercase tracking-tight text-sm">Báo cáo tổng kết chi tiết</span>
        </div>
        <div className="p-8 prose max-w-none prose-indigo">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
            {renderBoldNumbers(report.summaryReport)}
          </div>
        </div>
      </div>

      {/* Proposals Section if AI Processed */}
      {report.aiProcessed && report.improvementProposals && (
        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-100">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Đề xuất cải thiện cho tương lai</h3>
          </div>
          <div className="text-emerald-800 leading-relaxed whitespace-pre-wrap text-sm font-medium bg-white/50 p-6 rounded-2xl border border-emerald-100/50">
            {renderBoldNumbers(report.improvementProposals)}
          </div>
        </div>
      )}

      {!report.aiProcessed && (
        <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Báo cáo chưa được AI xử lý hoàn tất</p>
            <p className="text-red-600 text-sm">Vui lòng kiểm tra log lỗi: {report.aiErrorLog}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAIAnalysis;
