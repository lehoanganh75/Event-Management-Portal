import React from "react";
import { Globe } from "lucide-react";

const LanguageSelector = ({ language, setLanguage }) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
      <Globe size={15} className="text-[#1E40AF]" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setLanguage("VI")}
          className={`
            px-2.5 py-1
            rounded-lg
            text-[12px]
            font-semibold
            transition-all
            ${language === "VI"
              ? "bg-blue-50 text-[#1E40AF]"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }
          `}
        >
          VI
        </button>

        <button
          onClick={() => setLanguage("EN")}
          className={`
            px-2.5 py-1
            rounded-lg
            text-[12px]
            font-semibold
            transition-all
            ${language === "EN"
              ? "bg-blue-50 text-[#1E40AF]"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }
          `}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
