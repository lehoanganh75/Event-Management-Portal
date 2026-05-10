export const formatDate = (dateStr, format = "full") => {
  if (!dateStr) return "....................";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "....................";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  if (format === "short") return `${day} tháng ${month} năm ${year}`;
  return `${hour}:${min} ngày ${day}/${month}/${year}`;
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  
  // Xử lý múi giờ: Nếu chuỗi không có múi giờ, coi như là UTC (thêm Z)
  let normalizedDate = dateStr;
  if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
    normalizedDate = dateStr.includes('T') ? `${dateStr}Z` : `${dateStr.replace(' ', 'T')}Z`;
  }
  
  const date = new Date(normalizedDate);
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  // Nếu thời gian ở tương lai (do lệch clock nhẹ), trả về vừa xong
  if (seconds < 0) return "Vừa xong";
  if (seconds < 60) return "Vừa xong";
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  
  interval = seconds / 604800;
  if (interval > 1) return Math.floor(interval) + " tuần trước";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  
  return "Vừa xong";
};