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

const loadEventDataOnce = async (creatorId = null) => {
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

        let cacheText = "";

        if (!events || events.length === 0) {
            cacheText = "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
        } else {
            cacheText = events
                .map((ev) => {
                    return `
                    ID: ${ev.id}
                    Tên: ${ev.title}
                    Địa điểm: ${ev.location || "IUH"}
                    Bắt đầu: ${formatTime(ev.start_time)}
                    Trạng thái: ${ev.status}
                    Đã đăng ký: ${ev.registered_count || 0}/${ev.max_participants || "Không giới hạn"}
                    ---`.trim();
                })
                .join("\n\n");
        }

        // --- Load Top Presenters Stats (Primary for presenter suggestions) ---
        try {
            const topPresenters = await query(
                `SELECT p.presenter_account_id, COUNT(*) as count 
                 FROM event_presenters p
                 JOIN events e ON p.event_id = e.id
                 WHERE p.is_deleted = false
                 ${creatorId ? "AND e.created_by_account_id = ?" : ""}
                 GROUP BY p.presenter_account_id 
                 ORDER BY count DESC 
                 LIMIT 10`,
                creatorId ? [creatorId] : []
            );

            if (topPresenters && topPresenters.length > 0) {
                cacheText += "\n\n[THỐNG KÊ DIỄN GIẢ THÂN QUEN]\n";
                topPresenters.forEach((p, i) => {
                    cacheText += `${i + 1}. AccountID: ${p.presenter_account_id} (Làm diễn giả ${p.count} lần)\n`;
                });
            }
        } catch (e) {
            console.error("Error loading top presenters:", e.message);
        }

        // --- Load Top Participants Stats ---
        try {
            const topParticipants = await query(
                `SELECT r.participant_account_id, COUNT(*) as join_count 
                 FROM event_registrations r
                 JOIN events e ON r.event_id = e.id
                 WHERE r.is_deleted = false AND r.status != 'CANCELLED'
                 ${creatorId ? "AND e.created_by_account_id = ?" : ""}
                 GROUP BY r.participant_account_id 
                 ORDER BY join_count DESC 
                 LIMIT 10`,
                creatorId ? [creatorId] : []
            );

            if (topParticipants && topParticipants.length > 0) {
                cacheText += "\n\n[THỐNG KÊ NGƯỜI THAM GIA NHIỀU NHẤT]\n";
                topParticipants.forEach((p, i) => {
                    cacheText += `${i + 1}. AccountID: ${p.participant_account_id} (Tham gia ${p.join_count} sự kiện)\n`;
                });
            }
        } catch (e) {
            console.error("Error loading top participants:", e.message);
        }

        eventCache = cacheText;
        lastLoadedAt = new Date();
        console.log(`Cache Updated: ${events.length} events and top participants.`);
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