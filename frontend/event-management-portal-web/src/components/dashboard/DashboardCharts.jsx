import React from "react";
import { TrendingUp, Award } from "lucide-react";
import ActivityChart from "../common/ActivityChart";
import UserRankingItem from "./UserRankingItem";

const DashboardCharts = ({
  chartData,
  dataScope,
  selectedKhoa,
  topUsers = [],
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#1E40AF]" />
              Hoạt động năm {new Date().getFullYear()}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {dataScope === "KHOA" ? selectedKhoa : "Cá nhân"}
            </p>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 rounded-lg bg-blue-50 text-[#1E40AF] text-xs font-medium">
            Thống kê
          </span>
        </div>

        {chartData ? (
          <ActivityChart data={chartData} />
        ) : (
          <ActivityChart />
        )}
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            Top người tạo sự kiện
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Xếp hạng theo số lượng sự kiện
          </p>
        </div>

        <div className="space-y-2">
          {topUsers.length > 0 ? (
            topUsers.map((user, idx) => (
              <UserRankingItem key={idx} {...user} index={idx} />
            ))
          ) : (
            <div className="py-10 text-center text-sm text-slate-400 bg-slate-50 rounded-xl">
              Chưa có dữ liệu xếp hạng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;