const { query } = require("../config/db");

let eventCache = "";
let lastLoadedAt = null;

const formatTime = (date) => {
    if (!date) return "Chưa cập nhật";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    } catch (e) {
        return String(date);
    }
};

const loadEventDataOnce = async () => {
    try {
        const events = await query(
            `SELECT 
                id, title, description, location, 
                start_time, end_time, status, slug, 
                registration_deadline, event_topic, event_mode,
                registered_count, max_participants, has_lucky_draw, check_in_enabled
             FROM events 
             WHERE status IN (?, ?, ?) 
             ORDER BY start_time ASC`,
            ["PUBLISHED", "ONGOING", "COMPLETED"]
        );

        if (!events || events.length === 0) {
            eventCache = "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
            lastLoadedAt = new Date();
            return eventCache;
        }

        eventCache = events
            .map((ev, index) => {
                return `
                    ID: ${ev.id}
                    Tên: ${ev.title}
                    Địa điểm: ${ev.location || "IUH"}
                    Hạn đăng ký: ${formatTime(ev.registration_deadline)}
                    Bắt đầu: ${formatTime(ev.start_time)}
                    Kết thúc: ${formatTime(ev.end_time)}
                    Trạng thái: ${ev.status}
                    Đã đăng ký: ${ev.registered_count || 0}/${ev.max_participants || "Không giới hạn"}
                    Lucky Draw: ${ev.has_lucky_draw ? "Có" : "Không"}
                    Check-in: ${ev.check_in_enabled ? "Có" : "Không"}
                    ---`.trim();
            })
            .join("\n\n");

        lastLoadedAt = new Date();
        console.log(`Cache Updated: ${events.length} events.`);
        return eventCache;
    } catch (error) {
        console.error("Load event cache error:", error.message);
        eventCache = "Không thể tải dữ liệu sự kiện từ hệ thống.";
        return eventCache;
    }
};

const getEventCache = () => eventCache || "";

module.exports = {
    loadEventDataOnce,
    getEventCache,
};