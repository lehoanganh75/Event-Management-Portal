import React from "react";

const PostContent = ({ post, setFullscreenImage, t }) => {
  return (
    <>
      <div className="px-4 pb-4 mt-2">
        {post.eventTitle && (
          <div className="flex items-center gap-1.5 text-blue-600 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
              {t('event_label')}: {post.eventTitle}
            </span>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-3 text-slate-800 leading-tight">{post.title}</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 whitespace-pre-line">{post.content}</p>
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
