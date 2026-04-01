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