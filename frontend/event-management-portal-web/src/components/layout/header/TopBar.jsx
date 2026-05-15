import React from "react";

const TopBar = ({ t, language, setLanguage }) => {
  return (
    <div className="bg-[#1E40AF] border-b border-blue-900/40 text-white">
      <div className="h-11 px-4 lg:px-16 flex items-center justify-between">

        {/* Left */}
        <div className="hidden md:flex items-center gap-4 text-[12px]">

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />

            <span className="font-medium text-white/95">
              {t("system_name")}
            </span>
          </div>


        </div>

        {/* Right */}
        <div className="flex items-center gap-1 ml-auto md:ml-0 text-[12px]">

          <button
            onClick={() => setLanguage("VI")}
            className={`
              px-3 py-1.5 rounded-md transition-all duration-200 font-medium
              ${language === "VI"
                ? "bg-white text-[#1E40AF] shadow-sm"
                : "text-white/75 hover:text-white hover:bg-white/10"
              }
            `}
          >
            Tiếng Việt
          </button>

          <button
            onClick={() => setLanguage("EN")}
            className={`
              px-3 py-1.5 rounded-md transition-all duration-200 font-medium
              ${language === "EN"
                ? "bg-white text-[#1E40AF] shadow-sm"
                : "text-white/75 hover:text-white hover:bg-white/10"
              }
            `}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
