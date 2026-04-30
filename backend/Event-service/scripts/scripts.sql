-- =============================================================================
-- EVENT MANAGEMENT PORTAL DATABASE INITIALIZATION SCRIPT
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Organizations
INSERT IGNORE INTO organizations (id, name, type, email, phone, owner_account_id, logo_url, office_location, description, is_deleted, created_at)
VALUES 
('org-1', 'Khoa Công nghệ Thông tin', 'FACULTY', 'fit@iuh.edu.vn', '0283.8940.390', 'USE001', 'https://iuh.edu.vn/logo-fit.png', 'Tòa nhà H', 'Khoa đào tạo CNTT hàng đầu.', false, NOW()),
('org-2', 'Đoàn Thanh niên - Hội Sinh viên', 'FACULTY', 'youth@iuh.edu.vn', '0283.8940.390', 'USE002', 'https://iuh.edu.vn/logo-youth.png', 'Văn phòng Đoàn', 'Tổ chức sinh viên lớn nhất trường.', false, NOW()),
('org-3', 'Trung tâm Ngoại ngữ', 'FACULTY', 'cfl@iuh.edu.vn', '0283.8940.390', 'USE003', 'https://iuh.edu.vn/logo-cfl.png', 'Tòa nhà B', 'Đào tạo ngoại ngữ chuyên sâu.', false, NOW()),
('org-4', 'Phòng Công tác Sinh viên', 'FACULTY', 'sa@iuh.edu.vn', '0283.8940.390', 'USE004', 'https://iuh.edu.vn/logo-sa.png', 'Nhà A, Tầng 1', 'Hỗ trợ sinh viên toàn diện.', false, NOW()),
('org-5', 'Câu lạc bộ Văn nghệ xung kích', 'CLUB', 'music@iuh.edu.vn', '0283.8940.390', 'USE005', 'https://iuh.edu.vn/logo-music.png', 'Nhà C', 'Nơi hội tụ các tài năng âm nhạc.', false, NOW()),
('org-6', 'Khoa Quản trị Kinh doanh', 'FACULTY', 'fbm@iuh.edu.vn', '0283.8940.391', 'USE006', 'https://iuh.edu.vn/logo-fbm.png', 'Tòa nhà X', 'Đào tạo quản trị kinh doanh.', false, NOW()),
('org-7', 'Khoa Điện tử', 'FACULTY', 'fee@iuh.edu.vn', '0283.8940.392', 'USE007', 'https://iuh.edu.vn/logo-fee.png', 'Tòa nhà T', 'Khoa công nghệ điện tử.', false, NOW()),
('org-8', 'Câu lạc bộ Tin học', 'CLUB', 'itclub@iuh.edu.vn', '0283.8940.393', 'USE008', 'https://iuh.edu.vn/logo-itclub.png', 'Phòng Lab H', 'Học thuật và công nghệ.', false, NOW()),
('org-9', 'Khoa Công nghệ May Thời trang', 'FACULTY', 'fgat@iuh.edu.vn', '0283.8940.777', 'USE009', 'https://iuh.edu.vn/logo-fashion.png', 'Tòa nhà D', 'Sáng tạo thiết kế thời trang.', false, NOW()),
('org-10', 'Câu lạc bộ Kỹ năng IUH', 'CLUB', 'skills.club@iuh.edu.vn', '0903.456.789', 'USE010', 'https://iuh.edu.vn/logo-skills.png', 'Phòng CLB C1', 'Phát triển kỹ năng mềm.', false, NOW());

-- 2. Event Templates
INSERT IGNORE INTO event_templates (id, template_name, description, template_type, custom_template_type, default_title, default_cover_image, default_location, default_event_topic, default_event_mode, default_max_participants, default_qr_type, default_check_in_enabled, default_has_lucky_draw, usage_count, config_data, is_public, created_by_account_id, created_at, updated_at, is_deleted, organization_id)
VALUES 
('temp-001', 'Workshop Java Spring Boot', 'Template cho workshop backend Java', 'WORKSHOP', 'COURSE', 'Workshop: Java Spring Boot Master', 'https://iuh.edu.vn/template/java.jpg', 'Phòng Lab H', 'Lập trình', 'OFFLINE', 50, 'DYNAMIC', TRUE, FALSE, 120, '{"requireApproval": true, "checkInRequired": true}', TRUE, 'USE001', NOW(), NOW(), FALSE, 'org-1'),
('temp-002', 'Seminar AI', 'Seminar về trí tuệ nhân tạo', 'SEMINAR', 'TECH_TALK', 'Seminar: AI Trends 2026', 'https://iuh.edu.vn/template/ai.jpg', 'Hội trường A7', 'Trí tuệ nhân tạo', 'OFFLINE', 300, 'STATIC', FALSE, FALSE, 95, '{"requireApproval": false, "certificate": true}', TRUE, 'USE002', NOW(), NOW(), FALSE, 'org-1'),
('temp-003', 'Webinar Cloud', 'Template webinar online', 'SEMINAR', 'WEBINAR', 'Webinar: Cloud Computing 101', 'https://iuh.edu.vn/template/cloud.jpg', 'Google Meet', 'Điện toán đám mây', 'ONLINE', 500, 'STATIC', FALSE, FALSE, 80, '{"platform": "Google Meet", "record": true}', TRUE, 'USE003', NOW(), NOW(), FALSE, 'org-1'),
('temp-004', 'Hackathon Template', 'Template thi đấu lập trình', 'COMPETITION', 'HACKATHON', 'Hackathon Coding 24h', 'https://iuh.edu.vn/template/hackathon.jpg', 'Hội trường E4', 'Thi đấu lập trình', 'OFFLINE', 200, 'DYNAMIC', TRUE, TRUE, 60, '{"teamSize": 3, "durationHours": 24}', TRUE, 'USE004', NOW(), NOW(), FALSE, 'org-2'),
('temp-005', 'Talkshow Career', 'Talkshow định hướng nghề nghiệp', 'SEMINAR', 'COURSE', 'Talkshow: Career Path IT', 'https://iuh.edu.vn/template/career.jpg', 'Hội trường A7', 'Định hướng nghề nghiệp', 'OFFLINE', 250, 'STATIC', FALSE, FALSE, 70, '{"guest": "HR Manager"}', TRUE, 'USE005', NOW(), NOW(), FALSE, 'org-3'),
('temp-006', 'Job Fair Template', 'Template ngày hội việc làm', 'SEMINAR', 'CAREER_FAIR', 'Ngày hội việc làm IUH 2026', 'https://iuh.edu.vn/template/jobfair.jpg', 'Sân nhà A', 'Tuyển dụng', 'OFFLINE', 1000, 'STATIC', FALSE, FALSE, 45, '{"boothCount": 50}', TRUE, 'USE006', NOW(), NOW(), FALSE, 'org-4'),
('temp-007', 'Music Festival', 'Template sự kiện âm nhạc', 'FESTIVAL', 'CONCERT', 'IUH Music Night', 'https://iuh.edu.vn/template/music.jpg', 'Sân vận động', 'Âm nhạc & Nghệ thuật', 'OFFLINE', 2000, 'DYNAMIC', TRUE, TRUE, 30, '{}', TRUE, 'USE007', NOW(), NOW(), FALSE, 'org-5'),
('temp-008', 'Sports Day', 'Template hội thao sinh viên', 'SEMINAR', 'TOURNAMENT', 'Đại hội Thể thao IUH', 'https://iuh.edu.vn/template/sports.jpg', 'Nhà thi đấu', 'Thể thao', 'OFFLINE', 500, 'DYNAMIC', TRUE, TRUE, 25, '{}', TRUE, 'USE008', NOW(), NOW(), FALSE, 'org-6'),
('temp-009', 'Academic Contest', 'Template cuộc thi học thuật', 'COMPETITION', 'OLYMPIAD', 'Olympic Tin học IUH', 'https://iuh.edu.vn/template/contest.jpg', 'Phòng Lab', 'Học thuật', 'OFFLINE', 100, 'DYNAMIC', TRUE, FALSE, 40, '{}', TRUE, 'USE009', NOW(), NOW(), FALSE, 'org-7'),
('temp-010', 'Community Service', 'Template hoạt động tình nguyện', 'OTHER', 'COMMUNITY', 'Mùa hè xanh IUH', 'https://iuh.edu.vn/template/volunteer.jpg', 'Địa phương', 'Tình nguyện', 'OFFLINE', 100, 'STATIC', FALSE, FALSE, 55, '{}', TRUE, 'USE010', NOW(), NOW(), FALSE, 'org-10');

-- 3. Template Themes
INSERT IGNORE INTO event_template_themes (template_id, theme) VALUES 
('temp-001', 'TECH'), ('temp-002', 'AI'), ('temp-003', 'CLOUD'), ('temp-004', 'COMPETITION'), 
('temp-005', 'CAREER'), ('temp-006', 'JOB'), ('temp-007', 'MUSIC'), ('temp-008', 'SPORTS'), 
('temp-009', 'ACADEMIC'), ('temp-010', 'VOLUNTEER');

-- 4. Events
INSERT IGNORE INTO events (id, approved_by_account_id, slug, title, description, event_topic, cover_image, location, event_mode, start_time, end_time, registration_deadline, max_participants, type, status, recipients, target_objects, interactions, interaction_settings, custom_fields_json, additional_info, notes, created_by_account_id, organization_id, template_id, has_lucky_draw, check_in_enabled, qr_type, is_deleted, created_at)
VALUES 
('evt-1', 'USE001', 'iuh-tech-day-2026', 'IUH Tech Day 2026', 'Sự kiện công nghệ lớn nhất năm', 'Công nghệ', 'https://iuh.edu.vn/techday.jpg', 'Hội trường A7', 'OFFLINE', NOW(), '2026-05-15 17:00:00', '2026-05-10 23:59:59', 500, 'WORKSHOP', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Sự kiện quy mô lớn', 'USE004', 'org-1', 'temp-001', false, true, 'DYNAMIC', false, NOW()),
('evt-2', 'USE001', 'webinar-cloud-computing', 'Webinar: Cloud Computing 101', 'Giới thiệu cloud', 'Đám mây', 'https://iuh.edu.vn/cloud.jpg', 'Google Meet', 'ONLINE', NOW(), '2026-06-20 21:00:00', '2026-06-19 12:00:00', 300, 'SEMINAR', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Online', 'USE004', 'org-1', 'temp-003', false, false, 'STATIC', false, NOW()),
('evt-3', 'USE001', 'workshop-java-spring', 'Workshop: Java Spring Boot Master', 'Backend', 'Lập trình', 'https://iuh.edu.vn/java.jpg', 'Phòng máy H', 'OFFLINE', NOW(), '2026-07-02 12:00:00', '2026-06-30 23:59:59', 50, 'WORKSHOP', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Thực hành', 'USE004', 'org-1', 'temp-001', false, true, 'DYNAMIC', false, NOW()),
('evt-4', 'USE001', 'hackathon-coding-24h', 'Hackathon Coding 24h', 'Thi lập trình', 'Thi đấu', 'https://iuh.edu.vn/hack.jpg', 'Hội trường E4', 'OFFLINE', NOW(), '2026-08-01 09:00:00', '2026-07-25 00:00:00', 200, 'COMPETITION', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Hackathon', 'USE004', 'org-2', 'temp-004', false, true, 'DYNAMIC', false, NOW()),
('evt-5', 'USE001', 'career-path-it', 'Talkshow: Career Path IT', 'Định hướng', 'Nghề nghiệp', 'https://iuh.edu.vn/career.jpg', 'Hội trường A7', 'OFFLINE', NOW(), '2026-09-10 10:00:00', '2026-09-05 00:00:00', 250, 'SEMINAR', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Talkshow', 'USE004', 'org-3', 'temp-005', false, false, 'STATIC', false, NOW()),
('evt-6', 'USE001', 'job-fair-2026', 'Ngày hội việc làm 2026', 'Kết nối', 'Việc làm', 'https://iuh.edu.vn/job.jpg', 'Sân nhà A', 'OFFLINE', NOW(), '2026-10-20 16:00:00', '2026-10-15 00:00:00', 1000, 'OTHER', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Job Fair', 'USE004', 'org-4', 'temp-006', false, false, 'STATIC', false, NOW()),
('evt-7', 'USE001', 'music-night-iuh', 'IUH Music Night', 'Âm nhạc', 'Nghệ thuật', 'https://iuh.edu.vn/music.jpg', 'Sân vận động', 'OFFLINE', NOW(), '2026-11-15 22:00:00', '2026-11-10 00:00:00', 2000, 'FESTIVAL', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Music', 'USE004', 'org-5', 'temp-007', false, true, 'DYNAMIC', false, NOW()),
('evt-8', 'USE001', 'marathon-2026', 'IUH Marathon 2026', 'Chạy bộ', 'Thể thao', 'https://iuh.edu.vn/sports.jpg', 'Quanh IUH', 'OFFLINE', NOW(), '2026-12-15 09:00:00', '2026-12-10 00:00:00', 500, 'OTHER', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Marathon', 'USE004', 'org-6', 'temp-008', false, true, 'DYNAMIC', false, NOW()),
('evt-9', 'USE001', 'olympic-tin-hoc', 'Olympic Tin học 2026', 'Thi thuật toán', 'Học thuật', 'https://iuh.edu.vn/contest.jpg', 'Phòng Lab', 'OFFLINE', NOW(), '2027-01-20 12:00:00', '2027-01-15 00:00:00', 100, 'COMPETITION', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Olympic', 'USE004', 'org-7', 'temp-009', false, true, 'DYNAMIC', false, NOW()),
('evt-10', 'USE001', 'mua-he-xanh-2026', 'Mùa hè xanh 2026', 'Tình nguyện', 'Tình nguyện', 'https://iuh.edu.vn/volunteer.jpg', 'Miền Tây', 'OFFLINE', NOW(), '2026-08-31 17:00:00', '2026-07-15 00:00:00', 100, 'OTHER', 'PUBLISHED', '[]', '[]', '[]', '{}', '{}', '{}', 'Volunteer', 'USE004', 'org-10', 'temp-010', false, true, 'DYNAMIC', false, NOW());

-- 5. Sessions
INSERT IGNORE INTO event_sessions (id, event_id, title, description, room, type, start_time, end_time, order_index, is_deleted, created_at)
VALUES 
('sess-1', 'evt-1', 'Khai mạc', 'Lễ khai mạc sự kiện', 'Hội trường A7', 'KEYNOTE', NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 1, false, NOW()),
('sess-2', 'evt-1', 'Keynote: Tương lai công nghệ', 'Bài phát biểu chính về xu hướng công nghệ', 'Hội trường A7', 'KEYNOTE', DATE_ADD(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 1 HOUR), 2, false, NOW()),
('sess-3', 'evt-1', 'Workshop: AI trong thực tế', 'Thực hành AI với các case study', 'Phòng Lab H', 'WORKSHOP', DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), 3, false, NOW()),
('sess-4', 'evt-1', 'Panel: Công nghệ và xã hội', 'Thảo luận về tác động của công nghệ', 'Hội trường A7', 'PANEL', DATE_ADD(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 4, false, NOW()),
('sess-5', 'evt-1', 'Bế mạc và bốc thăm may mắn', 'Kết thúc sự kiện và trao giải', 'Hội trường A7', 'KEYNOTE', DATE_ADD(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 5, false, NOW()),
('sess-6', 'evt-2', 'Mở đầu Webinar', 'Giới thiệu nội dung', 'Zoom', 'KEYNOTE', NOW(), DATE_ADD(NOW(), INTERVAL 15 MINUTE), 1, false, NOW()),
('sess-7', 'evt-2', 'Cloud 101', 'Kiến thức cơ bản', 'Zoom', 'KEYNOTE', DATE_ADD(NOW(), INTERVAL 15 MINUTE), DATE_ADD(NOW(), INTERVAL 1 HOUR), 2, false, NOW());

-- 6. Presenters
INSERT IGNORE INTO event_presenters (id, event_id, presenter_account_id, assigned_at, is_deleted)
VALUES 
('pre-1', 'evt-1', 'USE001', NOW(), false),
('pre-2', 'evt-1', 'USE002', NOW(), false),
('pre-3', 'evt-2', 'USE003', NOW(), false);

-- 7. Organizers (5 per event)
INSERT INTO event_organizers (id, account_id, organization_id, event_id, role, status, added_by_account_id, assigned_at, is_deleted)
VALUES 
-- evt-1
('orgz-1-1', 'USE001', 'org-1', 'evt-1', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-1-2', 'USE002', 'org-1', 'evt-1', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-1-3', 'USE003', 'org-1', 'evt-1', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-1-4', 'USE004', 'org-1', 'evt-1', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-2
('orgz-2-1', 'USE002', 'org-1', 'evt-2', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-2-2', 'USE003', 'org-1', 'evt-2', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-2-3', 'USE004', 'org-1', 'evt-2', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-2-4', 'USE005', 'org-1', 'evt-2', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-3
('orgz-3-1', 'USE003', 'org-1', 'evt-3', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-3-2', 'USE004', 'org-1', 'evt-3', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-3-3', 'USE005', 'org-1', 'evt-3', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-3-4', 'USE006', 'org-1', 'evt-3', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-4
('orgz-4-1', 'USE004', 'org-2', 'evt-4', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-4-2', 'USE005', 'org-2', 'evt-4', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-4-3', 'USE006', 'org-2', 'evt-4', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-4-4', 'USE007', 'org-2', 'evt-4', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-5
('orgz-5-1', 'USE005', 'org-3', 'evt-5', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-5-2', 'USE006', 'org-3', 'evt-5', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-5-3', 'USE007', 'org-3', 'evt-5', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-5-4', 'USE008', 'org-3', 'evt-5', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-6
('orgz-6-1', 'USE006', 'org-4', 'evt-6', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-6-2', 'USE007', 'org-4', 'evt-6', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-6-3', 'USE008', 'org-4', 'evt-6', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-6-4', 'USE009', 'org-4', 'evt-6', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-7
('orgz-7-1', 'USE007', 'org-5', 'evt-7', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-7-2', 'USE008', 'org-5', 'evt-7', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-7-3', 'USE009', 'org-5', 'evt-7', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-7-4', 'USE010', 'org-5', 'evt-7', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-8
('orgz-8-1', 'USE008', 'org-6', 'evt-8', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-8-2', 'USE009', 'org-6', 'evt-8', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-8-3', 'USE010', 'org-6', 'evt-8', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-8-4', 'USE001', 'org-6', 'evt-8', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-9
('orgz-9-1', 'USE009', 'org-7', 'evt-9', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-9-2', 'USE010', 'org-7', 'evt-9', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-9-3', 'USE001', 'org-7', 'evt-9', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-9-4', 'USE002', 'org-7', 'evt-9', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false),
-- evt-10
('orgz-10-1', 'USE010', 'org-10', 'evt-10', 'LEADER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-10-2', 'USE001', 'org-10', 'evt-10', 'COORDINATOR', 'ACTIVE', 'USE001', NOW(), false),
('orgz-10-3', 'USE002', 'org-10', 'evt-10', 'MEMBER', 'ACTIVE', 'USE001', NOW(), false),
('orgz-10-4', 'USE003', 'org-10', 'evt-10', 'ADVISOR', 'ACTIVE', 'USE001', NOW(), false)
ON DUPLICATE KEY UPDATE 
    role = VALUES(role),
    status = VALUES(status),
    added_by_account_id = VALUES(added_by_account_id),
    is_deleted = VALUES(is_deleted);

-- 8. Invitations
INSERT IGNORE INTO event_invitations (id, event_id, inviter_account_id, invitee_email, type, target_role, status, message, token, sent_at, expired_at, is_deleted)
VALUES 
(UUID(), 'evt-1', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'MEMBER', 'PENDING', 'Mời bạn tham gia ban tổ chức', 'token-inv-1', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-1', 'USE001', 'student01@gmail.com', 'PRESENTER', NULL, 'PENDING', 'Mời bạn làm diễn giả', 'token-inv-2', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-2', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'COORDINATOR', 'PENDING', 'Mời bạn hỗ trợ webinar', 'token-inv-3', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-3', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'MEMBER', 'ACCEPTED', 'Mời bạn tham gia workshop', 'token-inv-4', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-4', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'LEADER', 'REJECTED', 'Mời bạn dẫn dắt hackathon', 'token-inv-5', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-5', 'USE001', 'student01@gmail.com', 'PRESENTER', NULL, 'PENDING', 'Mời bạn chia sẻ định hướng', 'token-inv-6', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-6', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'MEMBER', 'PENDING', 'Mời bạn hỗ trợ job fair', 'token-inv-7', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-7', 'USE001', 'student01@gmail.com', 'PRESENTER', NULL, 'PENDING', 'Mời bạn biểu diễn', 'token-inv-8', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-8', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'COORDINATOR', 'PENDING', 'Mời bạn điều phối marathon', 'token-inv-9', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false),
(UUID(), 'evt-10', 'USE001', 'student01@gmail.com', 'ORGANIZER', 'MEMBER', 'PENDING', 'Mời bạn tham gia ban giám khảo', 'token-inv-10', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false);

-- 9. Registrations
INSERT IGNORE INTO event_registrations (id, event_id, participant_account_id, status, answers_json, ticket_code, qr_token, checked_in, check_in_time, registered_at, is_deleted)
VALUES 
(UUID(), 'evt-1', 'USE001', 'REGISTERED', '{}', 'TIC-001', 'token-1', false, NULL, NOW(), false),
(UUID(), 'evt-1', 'USE002', 'REGISTERED', '{}', 'TIC-002', 'token-2', false, NULL, NOW(), false),
(UUID(), 'evt-1', 'USE003', 'REGISTERED', '{}', 'TIC-003', 'token-3', false, NULL, NOW(), false),
(UUID(), 'evt-2', 'USE001', 'REGISTERED', '{}', 'TIC-004', 'token-4', false, NULL, NOW(), false),
(UUID(), 'evt-2', 'USE004', 'REGISTERED', '{}', 'TIC-005', 'token-5', false, NULL, NOW(), false),
(UUID(), 'evt-3', 'USE005', 'REGISTERED', '{}', 'TIC-006', 'token-6', false, NULL, NOW(), false),
(UUID(), 'evt-4', 'USE006', 'REGISTERED', '{}', 'TIC-007', 'token-7', false, NULL, NOW(), false),
(UUID(), 'evt-5', 'USE007', 'REGISTERED', '{}', 'TIC-008', 'token-8', false, NULL, NOW(), false),
(UUID(), 'evt-6', 'USE008', 'REGISTERED', '{}', 'TIC-009', 'token-9', false, NULL, NOW(), false),
(UUID(), 'evt-7', 'USE009', 'REGISTERED', '{}', 'TIC-010', 'token-10', false, NULL, NOW(), false);

SET FOREIGN_KEY_CHECKS = 1;
