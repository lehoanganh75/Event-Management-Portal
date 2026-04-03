package src.main.eventservice.constant;

public class RedisConstant {
    // Prefix cho token mời tham gia sự kiện
    public static final String EVENT_INVITE_PREFIX = "event:invite:";

    // Thời gian hết hạn mặc định (giây) - Bạn có thể tùy chỉnh
    public static final long INVITE_EXPIRY_SECONDS = 30; // 1 giờ
}