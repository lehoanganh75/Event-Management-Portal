INSERT INTO events (id, title, description, event_topic, status, type, location, event_mode, max_participants, organization_id, created_by_account_id, approved_by_account_id, start_time, end_time, registration_deadline, is_deleted, finalized, archived, created_at) VALUES
('EVT001', 'Hội thảo AI & Future', 'Khám phá tương lai công nghệ', 'Technology', 'PUBLISHED', 'SEMINAR', 'Hội trường A1', 'OFFLINE', 100, 'FPTU-IT', 'ad80e87e-c1a1-48b7-9303-14e8d2979a0e', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-22 08:00:00', '2026-03-22 12:00:00', '2026-03-21 23:59:59', 0, 1, 0, NOW()),
('EVT002', 'Workshop React Advanced', 'Thực hành React chuyên sâu', 'Technology', 'PUBLISHED', 'WORKSHOP', 'Phòng Lab 2', 'OFFLINE', 50, 'GDSC-HCM', 'ad80e87e-c1a1-48b7-9303-14e8d2979a0e', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-23 13:30:00', '2026-03-23 17:00:00', '2026-03-22 23:59:59', 0, 0, 0, NOW()),
('EVT003', 'Webinar: Startup 101', 'Kiến thức khởi nghiệp cơ bản', 'Business', 'PUBLISHED', 'WEBINAR', 'Zoom Meetings', 'ONLINE', 500, 'CLB-STU', 'USE001', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-24 19:00:00', '2026-03-24 21:00:00', '2026-03-24 12:00:00', 0, 1, 0, NOW()),
('EVT004', 'Giải đấu Cờ Vua', 'Sân chơi trí tuệ', 'Sport', 'PUBLISHED', 'OTHER', 'Sảnh tòa nhà Alpha', 'OFFLINE', 64, 'FPTU-IT', 'ad80e87e-c1a1-48b7-9303-14e8d2979a0e', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-25 08:00:00', '2026-03-25 17:00:00', '2026-03-24 23:59:59', 0, 0, 0, NOW()),
('EVT005', 'Đêm nhạc Acoustic tháng 3', 'Giao lưu văn nghệ', 'Music', 'PUBLISHED', 'OTHER', 'Sân khấu trung tâm', 'OFFLINE', 200, 'CLB-AM', 'USE002', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-26 18:30:00', '2026-03-26 21:30:00', '2026-03-26 12:00:00', 0, 0, 0, NOW()),
('EVT006', 'Tọa đàm: Kỹ năng Viết CV', 'Chuẩn bị cho mùa thực tập', 'Career', 'PUBLISHED', 'TALKSHOW', 'Phòng B204', 'OFFLINE', 80, 'K-SE', 'USE003', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-20 09:00:00', '2026-03-20 11:30:00', '2026-03-19 23:59:59', 0, 1, 0, NOW()),
('EVT007', 'Workshop UI/UX Design', 'Thiết kế Mobile App', 'Design', 'PUBLISHED', 'WORKSHOP', 'Figma Online', 'ONLINE', 100, 'K-Digital', 'USE004', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-21 14:00:00', '2026-03-21 17:00:00', '2026-03-20 23:59:59', 0, 0, 0, NOW()),
('EVT008', 'Giải chạy Marathon Sinh viên', 'Rèn luyện thể chất', 'Sport', 'PUBLISHED', 'OTHER', 'Đường nội khu', 'OFFLINE', 1000, 'CLB-Vovinam', 'USE005', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-22 05:30:00', '2026-03-22 09:30:00', '2026-03-15 23:59:59', 0, 1, 0, NOW()),
('EVT009', 'Học thuật: Data Science', 'Ứng dụng Python trong Big Data', 'Technology', 'PUBLISHED', 'SEMINAR', 'Hội trường B', 'OFFLINE', 150, 'K-AI', 'USE006', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-23 08:30:00', '2026-03-23 11:30:00', '2026-03-22 23:59:59', 0, 0, 0, NOW()),
('EVT010', 'English Speaking Club', 'Chủ đề: Global Citizen', 'Education', 'PUBLISHED', 'OTHER', 'Phòng tự học 1', 'OFFLINE', 40, 'CLB-English', 'USE007', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-24 15:00:00', '2026-03-24 17:00:00', '2026-03-23 23:59:59', 0, 0, 0, NOW()),
('EVT011', 'Zalo Pay Integration', 'Tích hợp thanh toán vào App', 'Technology', 'PUBLISHED', 'WORKSHOP', 'Văn phòng Zalo', 'OFFLINE', 30, 'Zalo-Team', 'USE008', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-25 09:00:00', '2026-03-25 12:00:00', '2026-03-24 23:59:59', 0, 1, 0, NOW()),
('EVT012', 'Webinar: Logistics 4.0', 'Xu hướng vận tải hiện đại', 'Infrastructure', 'PUBLISHED', 'WEBINAR', 'Microsoft Teams', 'ONLINE', 300, 'K-Logistics', 'USE009', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-26 14:00:00', '2026-03-26 16:00:00', '2026-03-25 23:59:59', 0, 0, 0, NOW()),
('EVT013', 'Giao lưu cùng cựu sinh viên', 'Chia sẻ lộ trình nghề nghiệp', 'Career', 'PUBLISHED', 'TALKSHOW', 'Hội trường A2', 'OFFLINE', 200, 'FPT-SOFT', 'USE010', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-27 08:30:00', '2026-03-27 11:00:00', '2026-03-26 23:59:59', 0, 1, 0, NOW()),
('EVT014', 'Giải đấu Robotics Mini', 'Sáng tạo và lập trình robot', 'Technology', 'PUBLISHED', 'OTHER', 'Sân tập Robotics', 'OFFLINE', 20, 'CLB-Robotics', 'USE011', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-28 08:00:00', '2026-03-28 17:00:00', '2026-03-25 23:59:59', 0, 0, 0, NOW()),
('EVT015', 'Workshop Photography', 'Bắt trọn khoảnh khắc sự kiện', 'Art', 'PUBLISHED', 'WORKSHOP', 'Công viên xanh', 'OFFLINE', 25, 'CLB-Event', 'USE012', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-29 07:00:00', '2026-03-29 10:00:00', '2026-03-28 23:59:59', 0, 1, 0, NOW()),
('EVT016', 'Webinar: Quản lý Tài chính', 'Tiết kiệm và đầu tư từ sớm', 'Finance', 'PUBLISHED', 'WEBINAR', 'Google Meet', 'ONLINE', 1000, 'K-Finance', 'USE013', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-30 20:00:00', '2026-03-30 21:30:00', '2026-03-30 12:00:00', 0, 0, 0, NOW()),
('EVT017', 'Đại hội Dance Cover', 'Sân chơi vũ đạo sinh viên', 'Art', 'PUBLISHED', 'OTHER', 'Nhà văn hóa', 'OFFLINE', 500, 'CLB-Dance', 'USE014', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-31 18:00:00', '2026-03-31 22:00:00', '2026-03-30 23:59:59', 0, 1, 0, NOW()),
('EVT018', 'Workshop Momo Mini App', 'Phát triển ứng dụng trên Momo', 'Technology', 'PUBLISHED', 'WORKSHOP', 'Momo Campus', 'OFFLINE', 40, 'Momo-Fintech', 'USE015', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-19 09:00:00', '2026-03-19 12:00:00', '2026-03-18 23:59:59', 0, 0, 0, NOW()),
('EVT019', 'Tọa đàm: Văn hóa Nhật Bản', 'Trải nghiệm trà đạo và thư pháp', 'Culture', 'PUBLISHED', 'TALKSHOW', 'Phòng trà', 'OFFLINE', 30, 'JS-Club', 'USE016', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-20 14:00:00', '2026-03-20 16:30:00', '2026-03-19 23:59:59', 0, 1, 0, NOW()),
('EVT020', 'Webinar: Cloud Security', 'Bảo mật hạ tầng đám mây', 'Technology', 'PUBLISHED', 'WEBINAR', 'Webex', 'ONLINE', 400, 'VNG-Corp', 'USE017', '16685b22-4114-4afd-90f1-41d7cb8b259e', '2026-03-21 19:30:00', '2026-03-21 21:00:00', '2026-03-21 12:00:00', 0, 0, 0, NOW());


INSERT INTO event_sessions (id, event_id, title, start_time, end_time, room, type)
SELECT CONCAT('SES-', id), id, CONCAT('Phần 1: ', title), start_time, DATE_ADD(start_time, INTERVAL 1 HOUR), location, 'KEYNOTE'
FROM events LIMIT 20;

-- 20 Posts thông báo
INSERT INTO event_posts (id, event_id, created_by_account_id, title, content, post_type, status, created_at, is_deleted)
SELECT CONCAT('POST-', id), id, created_by_account_id, 'Sự kiện sắp bắt đầu!', 'Mọi người nhớ đến đúng giờ nhé.', 'ANNOUNCEMENT', 'PUBLISHED', NOW(), 0
FROM events LIMIT 20;

-- Thêm 100 lượt đăng ký ngẫu nhiên (Mỗi user đăng ký vào 5 sự kiện)
INSERT INTO event_db.event_registrations (id, event_id, user_registration_id, status, registered_at, checked_in, qr_token, eligible_for_draw)
SELECT
    UUID(),
    e.id,
    u.id,
    'REGISTERED',
    NOW(),
    IF(RAND() > 0.7, 1, 0),
    CONCAT('QR-', e.id, '-', u.id),
    1
FROM event_db.events e
         CROSS JOIN identity_db.accounts u -- Gọi trực tiếp sang database identity
WHERE u.id LIKE 'USE%' AND e.id LIKE 'EVT%'
  AND RAND() < 0.25;