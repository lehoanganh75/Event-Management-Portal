export const EMOJIS = ["❤️", "👍", "🔥", "😊", "🎉", "👏", "😮", "😢", "🙌", "✨", "🙏", "💯", "🤣", "😍", "💡"];

export const getReactionLabels = (t) => ({
  "👍": t('like'),
  "❤️": t('react_love'),
  "🔥": t('react_awesome'),
  "😊": t('react_happy'),
  "🎉": t('react_congrats'),
  "👏": t('react_applause'),
  "😮": t('react_wow'),
  "😢": t('react_sad'),
  "🤣": t('react_haha'),
  "😍": t('react_love'),
  "🙌": t('react_great'),
  "✨": t('react_sparkle'),
  "🙏": t('react_respect'),
  "💯": t('react_perfect'),
  "💡": t('react_useful')
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

  if (diffInSec < 60) return t('time_now');
  if (diffInMin < 60) return `${diffInMin} ${t('time_min')}`;
  if (diffInHour < 24) return `${diffInHour} ${t('time_hour')}`;
  if (diffInDay < 7) return `${diffInDay} ${t('time_day')}`;
  return past.toLocaleDateString();
};
