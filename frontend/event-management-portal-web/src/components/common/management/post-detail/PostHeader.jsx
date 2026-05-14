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
        {t('back')}
      </button>

      <div className="mt-4 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100">
            <img 
              src={post.author?.avatarUrl || defaultAvatar} 
              className="w-full h-full object-cover" 
              alt="author" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] text-slate-900">{post.author?.fullName || "Tác giả"}</h3>
              {post.pinned && <Pin size={14} className="text-blue-600 fill-blue-600" />}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span>{getRelativeTime(post.publishedAt || post.createdAt, t)}</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
