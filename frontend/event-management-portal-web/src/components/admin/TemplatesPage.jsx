import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Search, BarChart3, ChevronLeft, ChevronRight, Loader2, Eye, X, 
  Globe, Lock, Users, MapPin, Layers, Settings, Tag, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const ITEMS_PER_PAGE = 8;

  const TYPE_LABELS = {
    SEMINAR: { label: "Hội thảo", color: "bg-blue-100 text-blue-700 border-blue-200" },
    WORKSHOP: { label: "Workshop", color: "bg-purple-100 text-purple-700 border-purple-200" },
    CONTEST: { label: "Cuộc thi", color: "bg-amber-100 text-amber-700 border-amber-200" },
    OTHER: { label: "Khác", color: "bg-slate-100 text-slate-700 border-slate-200" }
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getTemplates();
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.defaultTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "all" || t.templateType === typeFilter;
      const matchTab = activeTab === "Tất cả" || (activeTab === "Công khai" && t.public) || (activeTab === "Nội bộ" && !t.public);
      return matchSearch && matchType && matchTab;
    });
  }, [templates, searchTerm, typeFilter, activeTab]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-left font-sans">
      {/* HEADER & STATS (Giữ nguyên như UI cũ của bạn) */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Layers size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Mẫu kế hoạch</h1>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
          <Plus size={18} /> Tạo mẫu mới
        </button>
      </div>

      {/* TABLE BẮT ĐẦU HIỂN THỊ FULL INFO */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold text-slate-600">Thông tin chung</th>
                <th className="p-4 text-left font-semibold text-slate-600">Thiết lập mặc định</th>
                <th className="p-4 text-left font-semibold text-slate-600">Cấu hình hệ thống</th>
                <th className="p-4 text-center font-semibold text-slate-600">Thống kê</th>
                <th className="p-4 text-center font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTemplates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* CỘT 1: THÔNG TIN CHUNG (Name, Desc, Faculty, Themes) */}
                  <td className="p-4 max-w-[280px]">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-blue-600 text-base">{t.templateName}</span>
                      <p className="text-xs text-slate-500 line-clamp-1 italic">"{t.description}"</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                          {t.faculty}
                        </span>
                        {t.themes.map(tag => (
                          <span key={tag} className="bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 font-medium">
                            <Tag size={8}/> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* CỘT 2: THIẾT LẬP MẶC ĐỊNH (Title, Location, Mode, Participants) */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{t.defaultTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <MapPin size={14} className="text-rose-500" />
                        {t.defaultLocation} 
                        <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600">{t.defaultEventMode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={14} className="text-emerald-500" />
                        Tối đa {t.defaultMaxParticipants} người
                      </div>
                    </div>
                  </td>

                  {/* CỘT 3: CẤU HÌNH HỆ THỐNG (Approval, Certificate, Public) */}
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {t.public ? 
                          <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold uppercase"><Globe size={12}/> Công khai</span> : 
                          <span className="flex items-center gap-1 text-slate-400 text-[11px] font-bold uppercase"><Lock size={12}/> Nội bộ</span>
                        }
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${t.configData.certificate ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                          {t.configData.certificate ? 'CẤP CHỨNG CHỈ' : 'KHÔNG CHỨNG CHỈ'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${t.configData.requireApproval ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {t.configData.requireApproval ? 'DUYỆT TAY' : 'TỰ ĐỘNG DUYỆT'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 4: THỐNG KÊ (Usage, CreatedAt) */}
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-bold mb-1">
                        <BarChart3 size={14} /> {t.usageCount}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Tạo: {new Date(t.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>

                  {/* CỘT 5: HÀNH ĐỘNG */}
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><Eye size={18} /></button>
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-all"><Settings size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;