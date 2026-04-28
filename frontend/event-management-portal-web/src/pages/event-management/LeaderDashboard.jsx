import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Trophy, Activity, ArrowLeft } from 'lucide-react';

const LeaderDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
            >
              <ArrowLeft size={18} />
              Trang chi tiết sự kiện
            </button>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-blue-200">
                Leader Dashboard
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Event Strategic <span className="text-blue-600">Control</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Registrations', value: '1,240', change: '+12%', icon: Users, color: 'blue' },
            { label: 'Check-in Rate', value: '85%', change: 'Live', icon: Activity, color: 'emerald' },
            { label: 'Staff Active', value: '12', change: 'Online', icon: Settings, color: 'indigo' },
            { label: 'Engagement', value: '4.8/5', change: '+0.2', icon: Trophy, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <span className="text-[10px] font-bold text-emerald-500">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lucky Draw Controller */}
          <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <Trophy className="text-amber-400" />
                Lucky Draw
              </h2>
              <div className="aspect-square bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center mb-8">
                <Trophy size={60} className="text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-center px-6">
                  Draw random winners from checked-in participants
                </p>
              </div>
              <button className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-amber-400/10">
                Trigger Draw
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-8">Management Overview</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400">#0{i+1}</div>
                    <div>
                      <p className="font-bold text-slate-800">Operational Milestone {i+1}</p>
                      <p className="text-xs text-slate-500 font-medium">Status: In Progress</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Details</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;
