import React from "react";
import {
  Gift,
  Trophy,
  Waves,
  Plus,
  Sparkles,
  Users,
  Award
} from "lucide-react";

const LuckyDrawTab = ({
  event,
  luckyDraw,
  handleOpenDuckRace,
  onRefresh,
  isAdmin,
  navigate,
  onOpenCreator
}) => {
  // Empty state
  if (!luckyDraw) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-14 text-center shadow-sm">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200 mb-5">
          <Gift size={34} />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Chưa có vòng quay may mắn
        </h3>

        <p className="text-sm text-slate-500 max-w-md mx-auto leading-6 mb-8">
          Tạo chương trình quay thưởng để tăng tương tác
          và mang lại trải nghiệm thú vị hơn cho người tham gia.
        </p>

        <button
          onClick={onOpenCreator}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-amber-200"
        >
          <Plus size={18} />
          Tạo vòng quay
        </button>
      </div>
    );
  }

  const drawData = luckyDraw?.luckyDraw || luckyDraw;

  const prizes = drawData?.prizes || [];
  const entries = drawData?.entries || [];
  const results =
    luckyDraw?.enrichedResults ||
    luckyDraw?.results ||
    [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles size={180} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <Trophy size={30} className="text-amber-300" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {drawData?.title || "Vòng quay may mắn"}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${drawData?.status === "ACTIVE"
                      ? "bg-green-400 animate-pulse"
                      : "bg-slate-400"
                    }`}
                />

                <p className="text-sm text-slate-300">
                  {drawData?.status === "PENDING"
                    ? "Chờ bắt đầu"
                    : drawData?.status === "ACTIVE"
                      ? "Đang diễn ra"
                      : drawData?.status === "COMPLETED"
                        ? "Đã kết thúc"
                        : "Đã hủy"}
                </p>
              </div>
            </div>
          </div>

          {(isAdmin ||
            event?.currentUserRole?.organizerRole ===
            "LEADER") && (
              <button
                onClick={handleOpenDuckRace}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20"
              >
                <Waves size={18} />
                Đua vịt LIVE
              </button>
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <StatCard
            icon={<Gift size={18} />}
            label="Giải thưởng"
            value={prizes.length}
            color="amber"
          />

          <StatCard
            icon={<Users size={18} />}
            label="Người tham gia"
            value={entries.length}
            color="blue"
          />

          <StatCard
            icon={<Award size={18} />}
            label="Đã trúng"
            value={results.length}
            color="emerald"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Prize List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              🎁 Giải thưởng
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {prizes.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Chưa có giải thưởng
              </div>
            ) : (
              prizes.map((p) => {
                const total = p.quantity || 1;

                const remaining =
                  p.remainingQuantity ??
                  p.quantity ??
                  1;

                const percent =
                  (remaining / total) * 100;

                return (
                  <div
                    key={p.id}
                    className="p-5 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {p.name || p.prizeName}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {p.description ||
                            "Quà tặng"}
                        </p>
                      </div>

                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                        {remaining}/{total}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        style={{
                          width: `${percent}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              👥 Người tham gia
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Chưa có người tham gia
              </div>
            ) : (
              entries.map((entry) => {
                const user =
                  entry?.profile ||
                  entry?.user ||
                  entry?.participant ||
                  {};

                return (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                        {user.fullName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {user.fullName || "N/A"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {user.email ||
                            "Không có email"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${entry.status === "VALID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {entry.status === "VALID"
                        ? "Hợp lệ"
                        : entry.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Winners */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">
            🏆 Danh sách trúng thưởng
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chưa có kết quả
            </div>
          ) : (
            results.map((res) => {
              const r = res?.result || res;

              const winner = r.winner || {};

              return (
                <div
                  key={r.id}
                  className="p-5 flex items-center justify-between hover:bg-amber-50/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-semibold shadow-sm">
                      {winner.avatarUrl ? (
                        <img
                          src={winner.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        winner.fullName
                          ?.charAt(0)
                          ?.toUpperCase()
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {winner.fullName || "N/A"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {winner.email ||
                          "Không có email"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      🎁{" "}
                      {r.wonPrize?.name ||
                        r.prize?.name ||
                        "Giải thưởng"}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      {r.winTime
                        ? new Date(
                          r.winTime
                        ).toLocaleTimeString(
                          "vi-VN"
                        )
                        : "Vừa xong"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color
}) => {
  const styles = {
    amber:
      "from-amber-500/20 to-orange-500/10 text-amber-300",
    blue:
      "from-blue-500/20 to-indigo-500/10 text-blue-300",
    emerald:
      "from-emerald-500/20 to-green-500/10 text-emerald-300"
  };

  return (
    <div
      className={`bg-gradient-to-br ${styles[color]} border border-white/10 rounded-2xl p-4 backdrop-blur`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>

        <span className="text-2xl font-bold text-white">
          {value}
        </span>
      </div>

      <p className="text-xs text-slate-300">
        {label}
      </p>
    </div>
  );
};

export default LuckyDrawTab;
