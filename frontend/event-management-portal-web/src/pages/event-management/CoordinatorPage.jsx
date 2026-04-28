import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ClipboardList, AlertCircle, Search, ArrowLeft } from 'lucide-react';

const CoordinatorPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm mb-4"
            >
              <ArrowLeft size={18} />
              Trang chi tiết sự kiện
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-indigo-200">
                Coordinator Hub
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Operations Management</h1>
            <p className="text-slate-500 font-medium">Monitoring event flow and staff coordination</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 flex items-center gap-2">
              <Search size={18} />
              Find Participant
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staff Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-indigo-600" />
                  Staff Members
                </h2>
                <button className="text-sm font-bold text-indigo-600">+ Add Support</button>
              </div>
              <div className="space-y-4">
                {['Hoàng Anh', 'Minh Khôi', 'Thanh Trúc'].map((name, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400">{name[0]}</div>
                      <div>
                        <p className="font-bold text-slate-800">{name}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase">MEMBER ROLE</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <ClipboardList className="text-indigo-600" />
                Live Attendance
              </h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-xs">
                Real-time chart pending...
              </div>
            </div>
          </div>

          {/* Logistics Alerts */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <AlertCircle className="text-amber-400" />
                Alerts
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Critical</p>
                  <p className="text-sm font-medium">Entrance B reporting high traffic jam. Re-route staff.</p>
                </div>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Update</p>
                  <p className="text-sm font-medium">Lunch catering arriving in 15 mins. Notify Member team.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
              <h3 className="text-lg font-black uppercase tracking-tight mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-left px-4 transition-colors">Broadcast to Staff</button>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-left px-4 transition-colors">Export Participant List</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorPage;
