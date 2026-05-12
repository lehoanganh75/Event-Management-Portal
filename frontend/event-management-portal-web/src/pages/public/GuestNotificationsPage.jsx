import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Calendar, ChevronRight, Info, Zap, Megaphone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useLanguage } from '../../context/LanguageContext';
import eventService from '../../services/eventService';

const AnnouncementCard = ({ item, language, isRead, onRead }) => {
  const isEmergency = item.postType === 'EMERGENCY';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-5 border ${isRead ? 'border-slate-200' : 'border-blue-200 shadow-sm'} hover:shadow transition-all group relative`}
    >
      {!isRead && (
        <span className="absolute top-4 right-4 bg-blue-100 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-sm">
          MỚI
        </span>
      )}

      <div className="flex gap-4">
        <div className="flex-shrink-0 hidden sm:block">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEmergency ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
          }`}>
            {isEmergency ? <Zap size={18} /> : <Megaphone size={18} />}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isEmergency ? 'text-red-500' : 'text-blue-500'
            }`}>
              {item.postType || 'THÔNG BÁO'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              {new Date(item.createdAt).toLocaleDateString(language === 'VI' ? 'vi-VN' : 'en-US')}
            </span>
          </div>
          
          <h3 className={`text-base line-clamp-1 mb-1 transition-colors ${!isRead ? 'font-bold text-slate-900 group-hover:text-blue-600' : 'font-medium text-slate-700'}`}>
            {item.title}
          </h3>
          
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {item.content}
          </p>
          
          <div className="flex items-center justify-between">
            <Link 
              to={`/posts/${item.id}`}
              onClick={() => onRead(item.id)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              {language === 'VI' ? 'Xem chi tiết' : 'View details'} 
              <ChevronRight size={14} />
            </Link>
            
            {item.eventTitle && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2.5 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {item.eventTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GuestNotificationsPage = () => {
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [readPosts, setReadPosts] = useState(() => {
    const saved = localStorage.getItem('readPosts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleRead = (id) => {
    if (!readPosts.includes(id)) {
      const newReadPosts = [...readPosts, id];
      setReadPosts(newReadPosts);
      localStorage.setItem('readPosts', JSON.stringify(newReadPosts));
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await eventService.getAllPosts();
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filteredData = announcements.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || item.postType === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200/60 pt-10 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Bell size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('notifications')}</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {language === 'VI' ? 'Thông báo từ IUH' : 'IUH Notifications'}
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  {language === 'VI' ? 'Những cập nhật mới nhất dành cho sinh viên và khách mời' : 'Latest updates for students and guests'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder={language === 'VI' ? 'Tìm kiếm...' : 'Search...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  {['ALL', 'NEWS', 'EMERGENCY'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        filter === cat 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {cat === 'ALL' ? (language === 'VI' ? 'Tất cả' : 'All') : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('loading')}</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="space-y-6">
              {paginatedData.map(item => (
                <AnnouncementCard 
                  key={item.id} 
                  item={item} 
                  language={language} 
                  isRead={readPosts.includes(item.id)}
                  onRead={handleRead}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
                          currentPage === i + 1
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {language === 'VI' ? 'Không tìm thấy thông báo' : 'No announcements found'}
              </h3>
              <p className="text-slate-400">
                {language === 'VI' ? 'Vui lòng thử lại với từ khóa hoặc bộ lọc khác' : 'Please try again with different keywords or filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GuestNotificationsPage;
