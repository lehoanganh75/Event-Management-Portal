import React from "react";
import { Newspaper } from "lucide-react";

const NewsBanner = ({ t }) => {
  return (
    <div className="bg-[#1E40AF] text-white relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 relative z-10">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
            <Newspaper size={28} className="text-white" />
          </div>

          {/* Content */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
              {"Bảng tin sự kiện"}
            </h1>

            <p className="text-sm md:text-base text-blue-100">
              {"Khám phá các câu chuyện và khoảnh khắc từ sự kiện của chúng tôi"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsBanner;
