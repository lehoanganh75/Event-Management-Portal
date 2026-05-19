import React from "react";
import { Pin, Globe } from "lucide-react";
import { DEFAULT_AVATAR, getRelativeTime } from "./constants";

const PostContent = ({ post, setFullscreenImage, t }) => {
  return (
    <>
      {/* Author Card Info */}
      <div className="px-5 pt-5 pb-3 flex justify-between items-start border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <img 
              src={post.author?.avatarUrl || DEFAULT_AVATAR} 
              className="w-full h-full object-cover" 
              alt="author" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[14px] text-slate-900 leading-tight">
                {post.author?.fullName || "Tác giả"}
              </h3>
              {post.pinned && <Pin size={12} className="text-blue-600 fill-blue-600" />}
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
              <span>{getRelativeTime(post.publishedAt || post.createdAt, t)}</span>
              <span>•</span>
              <Globe size={11} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 mt-4">
        {post.eventTitle && (
          <div className="flex items-center gap-1.5 text-blue-600 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
              {"Sự kiện"}: {post.eventTitle}
            </span>
          </div>
        )}
        <h2 className="text-xl font-bold mb-3 text-slate-800 leading-tight">{post.title}</h2>
        <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">{post.content}</p>
      </div>

      {post.imageUrls?.length > 0 && (
        <div className="bg-slate-50 border-y border-slate-100 overflow-hidden">
          <div className={`grid gap-1 ${post.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.imageUrls.map((url, idx) => (
              <div 
                key={idx} 
                className="cursor-zoom-in overflow-hidden group" 
                onClick={() => setFullscreenImage(url)}
              >
                <img 
                  src={url} 
                  alt={`Post media ${idx}`} 
                  className="w-full h-auto max-h-[500px] object-cover mx-auto group-hover:scale-[1.03] transition-transform duration-500" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PostContent;
