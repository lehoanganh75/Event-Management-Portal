import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, FileText, BarChart3, MessageSquare, ArrowLeft, Shield } from 'lucide-react';

const AdvisorPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm mb-4"
            >
              <ArrowLeft size={18} />
              Trang chi tiết sự kiện
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-amber-100">
                Advisor / Supervisor
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Event Oversight</h1>
            <p className="text-gray-500 font-medium">Read-only access to monitoring and feedback</p>
          </div>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
            <Shield size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Safe Mode (Read-Only)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Event Insight', icon: Eye, color: 'blue', desc: 'Monitoring live data and staff activity' },
            { label: 'Full Reports', icon: BarChart3, color: 'indigo', desc: 'Accessing all statistical data' },
            { label: 'Activity Logs', icon: FileText, color: 'slate', desc: 'Reviewing audit logs and changes' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 flex items-center justify-center mb-6`}>
                <item.icon className={`text-${item.color}-600`} size={28} />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">{item.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <MessageSquare className="text-amber-500" />
              Supervisor Feedback
            </h2>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200">
              Send Feedback
            </button>
          </div>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No feedback submitted yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPage;
