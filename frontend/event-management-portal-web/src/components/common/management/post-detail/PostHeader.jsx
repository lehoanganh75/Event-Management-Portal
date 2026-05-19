import React from "react";
import { ArrowLeft, Pin, Globe } from "lucide-react";

const PostHeader = ({ post, navigate, backPath, hideHeader, getRelativeTime, t, defaultAvatar }) => {
  if (hideHeader) return null;

  return (
    <div className="w-full mb-4">
      <button 
        onClick={() => navigate(backPath)} 
        className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-all"
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
          <ArrowLeft size={16} />
        </div>
        {"Quay lại"}
      </button>
    </div>
  );
};

export default PostHeader;
