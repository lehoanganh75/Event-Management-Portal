-- Lucky Draw cho Training Linux Basic
INSERT INTO lucky_draws (id, event_id, created_by_account_id, title, description, status, allow_multiple_wins, start_time, end_time, is_deleted, created_at, updated_at)
VALUES (UUID(), 'evt-7', 'USE001', 'Vòng quay may mắn: Linux Basic', 'Quà tặng cho sinh viên tham gia training Linux', 'PENDING', false, '2026-05-10T09:00:00', '2026-05-10T11:00:00', false, NOW(), NOW());

-- Lucky Draw cho Workshop UI/UX Design V2
INSERT INTO lucky_draws (id, event_id, created_by_account_id, title, description, status, allow_multiple_wins, start_time, end_time, is_deleted, created_at, updated_at)
VALUES (UUID(), 'evt-021', 'USE001', 'Lucky Draw: UI/UX Workshop', 'Phần thưởng dành cho các thiết kế ấn tượng nhất', 'PENDING', false, '2026-05-15T14:00:00', '2026-05-15T17:00:00', false, NOW(), NOW());

-- Lucky Draw cho CLB Tiếng Anh 2026
INSERT INTO lucky_draws (id, event_id, created_by_account_id, title, description, status, allow_multiple_wins, start_time, end_time, is_deleted, created_at, updated_at)
VALUES (UUID(), 'evt-022', 'USE001', 'English Club Monthly Gift', 'Bốc thăm may mắn hàng tháng tại CLB', 'PENDING', false, '2026-06-01T18:00:00', '2026-06-01T20:00:00', false, NOW(), NOW());

INSERT INTO prizes (id, lucky_draw_id, name, quantity, remaining_quantity, description, win_probability_percent, is_deleted, created_at, updated_at)
VALUES
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'SSD Samsung 500GB', 1, 1, 'Giải đặc biệt cho Admin Linux', 1.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Sách The Linux Command Line', 2, 2, 'Cẩm nang cho người mới', 4.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Áo Hoodie Tux Penguin', 3, 3, 'Size L, Cotton', 5.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'USB 32GB Bootable Linux', 5, 5, 'Sẵn bản cài Ubuntu', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Lót chuột Linux', 10, 10, 'In phím tắt Terminal', 15.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Sticker bộ gõ', 20, 20, 'Chống nước', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Bình nước nhựa IUH', 5, 5, 'Dùng tập gym', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Bút bi IUH', 50, 50, 'Bút viết xanh', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Voucher Photo 20k', 100, 100, 'Dùng tại thư viện', 5.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-7' LIMIT 1), 'Sổ tay Linux Notes', 10, 10, 'Ghi chép lệnh', 5.00, false, NOW(), NOW());

INSERT INTO prizes (id, lucky_draw_id, name, quantity, remaining_quantity, description, win_probability_percent, is_deleted, created_at, updated_at)
VALUES
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Bảng vẽ Wacom Intuos', 1, 1, 'Giải thiết kế xuất sắc', 0.50, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Chuột Logitech G502', 2, 2, 'Cảm biến HERO', 1.50, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Tài khoản Figma Pro 1 năm', 5, 5, 'Full tính năng', 3.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Túi chống sốc Laptop', 10, 10, 'Vải canvas xịn', 5.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Sổ tay phác thảo (Sketch)', 20, 20, 'Giấy định lượng 120gsm', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Bút vẽ cảm ứng (Stylus)', 15, 15, 'Dành cho iPad/Tablet', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Gấu bông Figma', 5, 5, 'Mascot đáng yêu', 5.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Sticker UI Kit', 100, 100, 'Icon đa dạng', 30.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Voucher trà sữa 30k', 30, 30, 'Áp dụng tại căng tin', 15.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-021' LIMIT 1), 'Thước kẻ chuyên dụng', 20, 20, 'Thước đo tỷ lệ pixel', 5.00, false, NOW(), NOW());

INSERT INTO prizes (id, lucky_draw_id, name, quantity, remaining_quantity, description, win_probability_percent, is_deleted, created_at, updated_at)
VALUES
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Sách Oxford Advanced Learner', 1, 1, 'Từ điển Anh-Anh chuyên sâu', 1.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Loa Bluetooth Sony SRS-XB13', 1, 1, 'Âm thanh cực chất cho party', 1.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Thẻ quà tặng Amazon $10', 2, 2, 'Dùng mua sách/app quốc tế', 3.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Bình giữ nhiệt IUH Elite', 5, 5, 'Phiên bản giới hạn CLB', 5.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Voucher Phúc Long 50k', 10, 10, 'Thẻ quà tặng đồ uống', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Túi vải Canvas English Club', 15, 15, 'Túi bảo vệ môi trường', 15.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Sổ tay từ vựng (Vocab Builder)', 20, 20, 'Thiết kế chuyên dụng note từ', 15.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Bút viết ký cao cấp', 10, 10, 'Bút kim loại sang trọng', 10.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Móc khóa "I Love English"', 50, 50, 'Quà lưu niệm CLB', 20.00, false, NOW(), NOW()),
    (UUID(), (SELECT id FROM lucky_draws WHERE event_id = 'evt-022' LIMIT 1), 'Sticker vương quốc Anh', 100, 100, 'Dán laptop/điện thoại', 15.00, false, NOW(), NOW());
