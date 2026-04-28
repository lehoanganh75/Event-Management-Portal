import React from 'react';
import { motion } from 'framer-motion';

const DuckRace = ({ leaderboard }) => {
  // Sort by score and take top 10
  const topParticipants = [...leaderboard].sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
  const maxScore = topParticipants[0]?.totalScore || 1;

  return (
    <div className="w-full bg-blue-50/50 rounded-[3rem] p-8 border-4 border-white shadow-2xl relative overflow-hidden min-h-[400px]">
      {/* Water Lanes */}
      <div className="space-y-4 relative z-10">
        {topParticipants.map((p, index) => {
          const progress = (p.totalScore / maxScore) * 100;
          
          return (
            <div key={p.participantAccountId} className="relative h-16 flex items-center">
              {/* Lane Background */}
              <div className="absolute inset-0 bg-blue-100/50 rounded-full border border-blue-200/50" />
              
              {/* Duck and Info */}
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                className="absolute flex items-center gap-3 transform -translate-x-1/2"
                style={{ zIndex: 10 - index }}
              >
                <div className="flex flex-col items-center">
                    {/* Duck Body */}
                    <div className="relative">
                        <span className="text-4xl drop-shadow-lg">🦆</span>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                            <p className="text-[10px] font-black whitespace-nowrap text-slate-800">{p.fullName}</p>
                        </div>
                    </div>
                </div>
                
                {/* Score Badge */}
                <div className="bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                    {p.totalScore}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-200/30 blur-2xl -z-0" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-100/50 rounded-full -translate-x-16 -translate-y-16 blur-3xl" />
    </div>
  );
};

export default DuckRace;
