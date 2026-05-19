export const EMOJIS = ["❤️", "👍", "🔥", "😊", "🎉", "👏", "😮", "😢", "🙌", "✨", "🙏", "💯", "🤣", "😍", "💡"];

export const getReactionLabels = (t) => ({
  "👍": "Thích",
  "❤️": "Yêu thích",
  "🔥": "Tuyệt vời",
  "😊": "Hạnh phúc",
  "🎉": "Chúc mừng",
  "👏": "Tán thưởng",
  "😮": "Ngạc nhiên",
  "😢": "Chia buồn",
  "🤣": "Haha",
  "😍": "Yêu thích",
  "🙌": "Tuyệt quá",
  "✨": "Lấp lánh",
  "🙏": "Trân trọng",
  "💯": "Tuyệt đối",
  "💡": "Hữu ích"
});

export const REACTION_COLORS = {
  "👍": "text-blue-600",
  "❤️": "text-red-500",
  "🔥": "text-orange-500",
  "😊": "text-amber-500",
  "🎉": "text-amber-500",
  "👏": "text-amber-500",
  "😮": "text-amber-500",
  "😢": "text-blue-400",
  "🤣": "text-amber-500",
  "😍": "text-red-400",
  "🙌": "text-amber-500",
  "✨": "text-amber-500",
  "🙏": "text-amber-500",
  "💯": "text-red-600",
  "💡": "text-amber-400"
};

export const ANONYMOUS_IDENTITIES = [
  { name: "Thỏ ẩn danh", icon: "🐰", color: "bg-pink-50 text-pink-500" },
  { name: "Sói ẩn danh", icon: "🐺", color: "bg-slate-100 text-slate-600" },
  { name: "Gấu ẩn danh", icon: "🐻", color: "bg-orange-50 text-orange-600" },
  { name: "Cáo ẩn danh", icon: "🦊", color: "bg-orange-100 text-orange-500" },
  { name: "Mèo ẩn danh", icon: "🐱", color: "bg-yellow-50 text-yellow-600" },
  { name: "Hổ ẩn danh", icon: "🐯", color: "bg-amber-50 text-amber-600" },
  { name: "Sư tử ẩn danh", icon: "🦁", color: "bg-yellow-100 text-yellow-700" },
  { name: "Ếch ẩn danh", icon: "🐸", color: "bg-green-50 text-green-600" },
  { name: "Khỉ ẩn danh", icon: "🐵", color: "bg-brown-50 text-amber-800" },
  { name: "Gấu trúc ẩn danh", icon: "🐼", color: "bg-slate-50 text-slate-800" }
];

export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

export const getRelativeTime = (date, t) => {
  const now = new Date();
  let past;
  
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+')) {
    past = new Date(date.replace(' ', 'T') + 'Z');
  } else {
    past = new Date(date);
  }
  
  const diffInMs = Math.max(0, now.getTime() - past.getTime());
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);

  if (diffInSec < 60) return "Đăng mới đây vừa xong";
  if (diffInMin < 60) return `${diffInMin} ${"phút"}`;
  if (diffInHour < 24) return `${diffInHour} ${"giờ"}`;
  if (diffInDay < 7) return `${diffInDay} ${"ngày"}`;
  return past.toLocaleDateString();
};
