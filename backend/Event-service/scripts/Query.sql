USE event_db;

-- 0. Nới rộng các cột Enum để tránh lỗi "Data truncated"
ALTER TABLE `event_templates` MODIFY COLUMN `template_type` VARCHAR(50);
ALTER TABLE `events` MODIFY COLUMN `status` VARCHAR(50);
ALTER TABLE `event_posts` MODIFY COLUMN `post_type` VARCHAR(50);
ALTER TABLE `event_posts` MODIFY COLUMN `status` VARCHAR(50);
ALTER TABLE `event_registrations` MODIFY COLUMN `status` VARCHAR(50);
ALTER TABLE `payments` MODIFY COLUMN `status` VARCHAR(50);
ALTER TABLE `checkins` MODIFY COLUMN `method` VARCHAR(50);
ALTER TABLE `recaps` MODIFY COLUMN `status` VARCHAR(50);
ALTER TABLE `event_sessions` MODIFY COLUMN `type` VARCHAR(50);

-- Chèn dữ liệu mới với đầy đủ description và usage_count
INSERT INTO event_templates (
    id, 
    organization_id, 
    template_name, 
    template_type, 
    description, -- Trường mô tả ngắn gọn cho template
    usage_count, -- Trường số lượt dùng
    default_title, 
    default_description,
    default_max_participants, 
    created_at
) VALUES 
(UUID(), 'org-it', 'Workshop React cho người mới', 'Workshop', 'Mẫu kế hoạch dành cho các buổi thực hành lập trình cơ bản.', 120, 'Học ReactJS cơ bản', 'Mô tả chi tiết workshop...', 50, NOW()),
(UUID(), 'org-it', 'Seminar AI trong tương lai', 'Seminar', 'Mẫu chuẩn cho các buổi hội thảo khoa học và công nghệ.', 85, 'AI và đời sống', 'Nội dung buổi Seminar...', 100, NOW()),
(UUID(), 'org-it', 'Talkshow Khởi nghiệp', 'Talkshow', 'Mẫu chương trình giao lưu giữa chuyên gia và sinh viên.', 42, 'Con đường Startup', 'Chia sẻ kinh nghiệm...', 30, NOW());

-- 2. Chèn dữ liệu vào EVENTS (Đã khớp hoàn toàn với Java Entity)
INSERT INTO `events` (
    `id`, 
    `organization_id`, 
    `created_by_account_id`,
    `approved_by_account_id`,
    `title`, 
    `description`, 
    `event_topic`,
    `cover_image`,
    `start_time`, 
    `end_time`, 
    `registration_deadline`, 
    `location`,
    `event_mode`,
    `max_participants`, 
    `type`,
    `status`, 
    `has_lucky_draw`, 
    `finalized`, 
    `archived`,
    `organizer_unit`,
    `notes`,
    `additional_info`,
    `created_at`
) VALUES
(
    'e1', 'org-001', 'admin-01', 'boss-01', 'Java Spring Boot Mastery', 'Học Spring Boot từ cơ bản', 'Backend Development', 
    'cover1.jpg', '2026-10-01 08:00:00', '2026-10-01 17:00:00', '2026-09-25 23:59:59', 'Phòng Lab 502, Tòa H',
    'OFFLINE', 50, 'WORKSHOP', 'Published', 1, 0, 0, 'Bộ môn Kỹ thuật phần mềm', 'Yêu cầu đem laptop', 'Dành cho SV năm 3', NOW()
),
(
    'e2', 'org-001', 'admin-01', 'boss-01', 'Cloud Computing Intro', 'Giới thiệu về AWS và Azure', 'Infrastructure', 
    'cover2.jpg', '2026-11-15 09:00:00', '2026-11-15 12:00:00', '2026-11-10 23:59:59', 'https://meet.google.com/aws-intro-2026',
    'ONLINE', 100, 'WEBINAR', 'Published', 0, 0, 0, 'Bộ môn Hệ thống thông tin', '', '', NOW()
),
(
    'e5', 'org-001', 'user-02', NULL, 'Startup Pitch Day', 'Sân chơi cho các startup trẻ', 'Entrepreneurship', 
    'cover5.jpg', '2026-12-10 14:00:00', '2026-12-10 18:00:00', '2026-12-01 23:59:59', 'Hội trường A1',
    'OFFLINE', 50, 'COMPETITION', 'Draft', 1, 0, 0, 'Khoa Quản trị Kinh doanh', 'Chuẩn bị slide thuyết trình', '', NOW()
),
(
    'e7', 'org-005', 'teacher-01', 'boss-02', 'IELTS Workshop', 'Kỹ năng Writing 8.0', 'Education', 
    'cover7.jpg', '2026-10-12 13:30:00', '2026-10-12 16:30:00', '2026-10-10 23:59:59', 'Zoom Meeting ID: 888 222 555',
    'ONLINE', 40, 'WORKSHOP', 'Ongoing', 0, 0, 0, 'Trung tâm Ngoại ngữ', '', 'Tặng tài liệu PDF', NOW()
),
(
    'e8', 'org-001', 'admin-01', 'boss-01', 'DevOps Workshop', 'CI/CD với Jenkins', 'Operations', 
    'cover8.jpg', '2026-09-01 08:00:00', '2026-09-01 12:00:00', '2026-08-25 23:59:59', 'Phòng máy 302, Tòa X',
    'OFFLINE', 30, 'WORKSHOP', 'Completed', 0, 1, 0, 'Bộ môn Mạng máy tính', '', '', NOW()
);

-- 3. Chèn dữ liệu vào EVENT_SESSIONS
INSERT INTO `event_sessions` (`id`, `event_id`, `title`, `start_time`, `end_time`, `room`, `type`) VALUES
('s1', 'e1', 'Introduction to IoC', '2026-10-01 08:00:00', '2026-10-01 10:00:00', 'Room A', 'TALK'),
('s2', 'e1', 'JPA & Hibernate Deep Dive', '2026-10-01 10:30:00', '2026-10-01 12:00:00', 'Room A', 'WORKSHOP'),
('s3', 'e2', 'AWS Overview', '2026-11-15 09:00:00', '2026-11-15 10:30:00', 'Hall 1', 'TALK'),
('s4', 'e3', 'Opening Ceremony', '2026-12-01 05:00:00', '2026-12-01 05:30:00', 'Main Stage', 'OTHER'),
('s5', 'e6', 'Dinner & Mingling', '2026-11-05 19:00:00', '2026-11-05 20:30:00', 'Grand Ballroom', 'NETWORKING'),
('s6', 'e7', 'Writing Task 1 Tips', '2026-10-12 13:30:00', '2026-10-12 15:00:00', 'Room 302', 'SEMINAR'),
('s7', 'e1', 'Security with Keycloak', '2026-10-01 13:30:00', '2026-10-01 15:30:00', 'Room A', 'WORKSHOP'),
('s8', 'e8', 'Pipeline setup', '2026-09-01 09:00:00', '2026-09-01 11:00:00', 'Lab 1', 'WORKSHOP'),
('s9', 'e10', 'Lighting Basics', '2026-11-20 09:00:00', '2026-11-20 12:00:00', 'Studio 1', 'TALK'),
('s10', 'e10', 'Outdoor Shooting', '2026-11-20 13:00:00', '2026-11-20 16:00:00', 'Garden', 'WORKSHOP');

-- 4. Chèn dữ liệu vào EVENT_REGISTRATIONS
INSERT INTO `event_registrations` (`id`, `event_id`, `user_profile_id`, `status`, `registered_at`, `eligible_for_draw`) VALUES
('r1', 'e1', 'user-001', 'CONFIRMED', NOW(), 1),
('r2', 'e1', 'user-002', 'PENDING', NOW(), 0),
('r3', 'e2', 'user-003', 'CONFIRMED', NOW(), 1),
('r4', 'e3', 'user-004', 'CONFIRMED', NOW(), 1),
('r5', 'e3', 'user-005', 'CANCELLED', NOW(), 0),
('r6', 'e6', 'user-006', 'CONFIRMED', NOW(), 0),
('r7', 'e7', 'user-007', 'CONFIRMED', NOW(), 0),
('r8', 'e8', 'user-008', 'CONFIRMED', NOW(), 1),
('r9', 'e9', 'user-009', 'CONFIRMED', NOW(), 0),
('r10', 'e10', 'user-010', 'CONFIRMED', NOW(), 1);

-- 5. Chèn dữ liệu vào PAYMENTS
INSERT INTO `payments` (`id`, `registration_id`, `amount`, `status`, `paid_at`) VALUES
('pay1', 'r1', 200000.0, 'SUCCESS', NOW()),
('pay2', 'r3', 0.0, 'SUCCESS', NOW()),
('pay3', 'r4', 150000.0, 'SUCCESS', NOW()),
('pay4', 'r6', 500000.0, 'SUCCESS', NOW()),
('pay5', 'r7', 100000.0, 'SUCCESS', NOW()),
('pay6', 'r8', 250000.0, 'SUCCESS', NOW()),
('pay7', 'r9', 50000.0, 'SUCCESS', NOW()),
('pay8', 'r10', 300000.0, 'SUCCESS', NOW()),
('pay9', 'r2', 200000.0, 'PENDING', NULL),
('pay10', 'r5', 150000.0, 'REFUNDED', NOW());

-- 6. Chèn dữ liệu vào CHECKINS
INSERT INTO `checkins` (`id`, `registration_id`, `check_in_time`, `method`) VALUES
('ck1', 'r1', '2026-10-01 07:45:00', 'QR_CODE'),
('ck2', 'r3', '2026-11-15 08:50:00', 'MANUAL'),
('ck3', 'r4', '2026-12-01 04:30:00', 'QR_CODE'),
('ck4', 'r6', '2026-11-05 18:15:00', 'FACE_ID'),
('ck5', 'r7', '2026-10-12 13:10:00', 'QR_CODE'),


('ck6', 'r8', '2026-09-01 07:55:00', 'MANUAL'),
('ck7', 'r9', '2026-10-15 05:50:00', 'QR_CODE'),
('ck8', 'r10', '2026-11-20 08:40:00', 'QR_CODE'),
('ck9', 'r1', '2026-10-01 13:00:00', 'MANUAL'),
('ck10', 'r4', '2026-12-01 09:00:00', 'QR_CODE');
