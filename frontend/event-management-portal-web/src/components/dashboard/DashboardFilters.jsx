import React from "react";
import {
  ChevronDown,
  RotateCcw,
  Download,
} from "lucide-react";

const DashboardFilters = ({
  isManager,
  dataScope,
  setDataScope,
  setSelectedKhoa,
  selectedKhoa,
  availableKhoas,
  filterType,
  setFilterType,
  filterValue,
  setFilterValue,
  weeks,
  loading,
  fetchData,
  handleExport,
}) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Tổng quan
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Theo dõi hoạt động và thống kê sự kiện
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Scope */}
        {isManager && (
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => {
                setDataScope("PERSONAL");
                setSelectedKhoa("Tất cả khoa");
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${dataScope === "PERSONAL"
                  ? "bg-white text-[#1E40AF] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              Cá nhân
            </button>

            <button
              onClick={() => setDataScope("KHOA")}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${dataScope === "KHOA"
                  ? "bg-white text-[#1E40AF] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              Khoa
            </button>
          </div>
        )}

        {/* Khoa */}
        {dataScope === "KHOA" && (
          <div className="relative">
            <select
              value={selectedKhoa}
              onChange={(e) =>
                setSelectedKhoa(e.target.value)
              }
              className="
                appearance-none
                bg-white
                border border-slate-200
                rounded-xl
                px-4 py-2.5 pr-10
                text-sm
                text-slate-700
                focus:outline-none
                focus:border-[#1E40AF]
                transition-all
              "
            >
              <option value="Tất cả khoa">
                Tất cả khoa
              </option>

              {availableKhoas.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />
          </div>
        )}

        {/* Filter Type */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value)
            }
            className="
              appearance-none
              bg-white
              border border-slate-200
              rounded-xl
              px-4 py-2.5 pr-10
              text-sm
              text-slate-700
              focus:outline-none
              focus:border-[#1E40AF]
              transition-all
            "
          >
            <option value="Week">
              Theo tuần
            </option>

            <option value="Month">
              Theo tháng
            </option>
          </select>

          <ChevronDown
            size={16}
            className="
              absolute right-3 top-1/2
              -translate-y-1/2
              text-slate-400
              pointer-events-none
            "
          />
        </div>

        {/* Week */}
        {filterType === "Week" && weeks && (
          <div className="relative">
            <select
              value={filterValue}
              onChange={(e) =>
                setFilterValue(e.target.value)
              }
              className="
                appearance-none
                bg-white
                border border-slate-200
                rounded-xl
                px-4 py-2.5 pr-10
                text-sm
                text-slate-700
                focus:outline-none
                focus:border-[#1E40AF]
                transition-all
              "
            >
              {weeks.map((w, idx) => (
                <option
                  key={idx}
                  value={w.value}
                >
                  {w.label}{" "}
                  {w.isCurrent
                    ? "(Hiện tại)"
                    : ""}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />
          </div>
        )}

        {/* Month */}
        {filterType === "Month" && (
          <div className="relative">
            <select
              value={filterValue}
              onChange={(e) =>
                setFilterValue(e.target.value)
              }
              className="
                appearance-none
                bg-white
                border border-slate-200
                rounded-xl
                px-4 py-2.5 pr-10
                text-sm
                text-slate-700
                focus:outline-none
                focus:border-[#1E40AF]
                transition-all
              "
            >
              {Array.from({
                length: 12,
              }).map((_, i) => (
                <option
                  key={i + 1}
                  value={i + 1}
                >
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />
          </div>
        )}

        {/* Reload */}
        <button
          onClick={fetchData}
          className="
            flex items-center gap-2
            px-4 py-2.5
            rounded-xl
            bg-[#1E40AF]
            text-white
            text-sm font-medium
            hover:bg-blue-800
            transition-all
          "
        >
          <RotateCcw
            size={16}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Tải lại
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="
            flex items-center gap-2
            px-4 py-2.5
            rounded-xl
            border border-emerald-200
            bg-emerald-50
            text-emerald-700
            text-sm font-medium
            hover:bg-emerald-100
            transition-all
          "
        >
          <Download size={16} />

          Xuất file
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
