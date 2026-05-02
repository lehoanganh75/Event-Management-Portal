import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const EventCardMini = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/events/${event.slug || event.id}`)}
      className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 w-64 shrink-0 group cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={event.image || '/placeholder-event.jpg'} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h4>
        
        {event.date && (
          <div className="flex items-center text-[10px] text-slate-500 mb-1">
            <Calendar size={12} className="mr-1 text-blue-500" />
            {event.date}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-medium text-blue-600">Khám phá ngay</span>
          <button 
            onClick={() => navigate(`/events/${event.slug || event.id}`)}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCardMini;
