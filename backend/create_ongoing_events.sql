-- ========================================================
-- ONGOING EVENTS SEEDING SCRIPT
-- ========================================================

USE event_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Organizations (ORG002, ORG003, ORG004)
-- Owner SAs (USE002, USE003, USE004), status APPROVED
INSERT INTO organizations (id, name, description, logo_url, email, phone, office_location, type, owner_account_id, status, created_at, is_deleted) 
VALUES 
('ORG002', 'Trung tâm Phát triển Kỹ năng Mềm', 'Chuyên tổ chức các khóa học kỹ năng mềm cho sinh viên', 'https://picsum.photos/200/200?random=12', 'center.softskills@iuh.edu.vn', '0902345678', 'Phòng B102 - Nhà B', 'CENTER', 'USE002', 'APPROVED', NOW(), 0),
('ORG003', 'CLB Tin học Văn phòng', 'Câu lạc bộ hỗ trợ sinh viên nâng cao năng lực tin học văn phòng', 'https://picsum.photos/200/200?random=13', 'club.officeit@iuh.edu.vn', '0903456789', 'Phòng CLB tầng 2 - Nhà H', 'CLUB', 'USE003', 'APPROVED', NOW(), 0),
('ORG004', 'Khoa Kỹ thuật Điện tử', 'Khoa chuyên ngành Kỹ thuật Điện tử - Viễn thông', 'https://picsum.photos/200/200?random=14', 'faculty.electronics@iuh.edu.vn', '0904567890', 'Phòng 404 - Nhà X', 'FACULTY', 'USE004', 'APPROVED', NOW(), 0)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), status=VALUES(status);

-- 2. Insert 3 Ongoing Events
-- start_time = '2026-05-21 00:00:00', end_time = '2026-05-22 23:59:59', registration_deadline = '2026-05-20 23:59:59'
-- status = 'ONGOING', max_participants = 30
INSERT INTO events (id, slug, title, description, event_topic, cover_image, location, event_mode, start_time, end_time, registration_deadline, created_by_account_id, organization_id, max_participants, type, status, is_deleted, check_in_enabled, feedback_enabled, qr_type, custom_fields_json, registered_count, has_lucky_draw, target_objects, recipients, interactions, interaction_settings, created_at, updated_at) 
VALUES 
('EVT_ONGOING_001', 'hoi-thao-phat-trien-ky-nang-mem', 'Hội thảo Phát triển Kỹ năng Mềm', 'Hội thảo đặc biệt giúp sinh viên cải thiện kỹ năng giao tiếp, làm việc nhóm và thuyết trình.', 'Kỹ năng mềm', 'https://picsum.photos/800/400?random=21', 'Hội trường chính A1, Đại học Công nghiệp TP.HCM', 'OFFLINE', '2026-05-21 00:00:00', '2026-05-22 23:59:59', '2026-05-20 23:59:59', 'USE002', 'ORG002', 30, 'SEMINAR', 'ONGOING', 0, 1, 1, 'STATIC', '{}', 22, 0, '[]', '[]', '[]', '{}', NOW(), NOW()),
('EVT_ONGOING_002', 'giai-vo-dich-tin-hoc-van-phong', 'Giải vô địch Tin học văn phòng', 'Cuộc thi thử thách kỹ năng tin học văn phòng Word, Excel, PowerPoint của sinh viên.', 'Tin học văn phòng', 'https://picsum.photos/800/400?random=22', 'Phòng máy thực hành tầng 4 - Nhà H', 'OFFLINE', '2026-05-21 00:00:00', '2026-05-22 23:59:59', '2026-05-20 23:59:59', 'USE003', 'ORG003', 30, 'COMPETITION', 'ONGOING', 0, 1, 1, 'STATIC', '{}', 25, 0, '[]', '[]', '[]', '{}', NOW(), NOW()),
('EVT_ONGOING_003', 'seminar-nghien-cuu-khoa-hoc-dien-tu', 'Seminar Nghiên cứu Khoa học Điện tử', 'Seminar báo cáo các đề tài nghiên cứu khoa học sinh viên xuất sắc của khoa Điện tử.', 'Kỹ thuật Điện tử', 'https://picsum.photos/800/400?random=23', 'Phòng hội thảo khoa Điện tử - Nhà X', 'OFFLINE', '2026-05-21 00:00:00', '2026-05-22 23:59:59', '2026-05-20 23:59:59', 'USE004', 'ORG004', 30, 'SEMINAR', 'ONGOING', 0, 1, 1, 'STATIC', '{}', 28, 0, '[]', '[]', '[]', '{}', NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title), start_time=VALUES(start_time), end_time=VALUES(end_time), registered_count=VALUES(registered_count), status=VALUES(status);

-- 3. Cleanup existing data for re-runnability (delete children tables first)
DELETE FROM post_comments WHERE post_id IN (SELECT id FROM event_posts WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003'));
DELETE FROM event_posts WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003')));
DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003'));
DELETE FROM quizzes WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM survey_responses WHERE survey_id IN (SELECT id FROM event_surveys WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003'));
DELETE FROM survey_questions WHERE survey_id IN (SELECT id FROM event_surveys WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003'));
DELETE FROM event_surveys WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM event_sessions WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM event_presenters WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM event_organizers WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');
DELETE FROM event_registrations WHERE event_id IN ('EVT_ONGOING_001', 'EVT_ONGOING_002', 'EVT_ONGOING_003');

-- 4. Insert Presenters (3 per event)
-- EVT_ONGOING_001: USE011 (Đặng Văn Quang - LECTURER), USE012 (Võ Thị Ngọc - LECTURER), USE013 (Huỳnh Thị Linh - LECTURER)
-- EVT_ONGOING_002: USE014 (Võ Thị Uyên - LECTURER), USE015 (Võ Văn Hải - LECTURER), USE066 (Nguyễn Thị Bình - GUEST)
-- EVT_ONGOING_003: USE067 (Võ Văn Thảo - GUEST), USE068 (Phạm Thị Phong - GUEST), USE069 (Huỳnh Thị Dũng - GUEST)
INSERT INTO event_presenters (id, assigned_at, is_deleted, presenter_account_id, event_id) VALUES
('PRES_ONGOING_001_1', NOW(), 0, 'USE011', 'EVT_ONGOING_001'),
('PRES_ONGOING_001_2', NOW(), 0, 'USE012', 'EVT_ONGOING_001'),
('PRES_ONGOING_001_3', NOW(), 0, 'USE013', 'EVT_ONGOING_001'),
('PRES_ONGOING_002_1', NOW(), 0, 'USE014', 'EVT_ONGOING_002'),
('PRES_ONGOING_002_2', NOW(), 0, 'USE015', 'EVT_ONGOING_002'),
('PRES_ONGOING_002_3', NOW(), 0, 'USE066', 'EVT_ONGOING_002'),
('PRES_ONGOING_003_1', NOW(), 0, 'USE067', 'EVT_ONGOING_003'),
('PRES_ONGOING_003_2', NOW(), 0, 'USE068', 'EVT_ONGOING_003'),
('PRES_ONGOING_003_3', NOW(), 0, 'USE069', 'EVT_ONGOING_003');

-- 5. Insert Organizers (3 per event: LEADER, COORDINATOR, MEMBER)
-- EVT_ONGOING_001: USE002 (Phan Thị Bình - SA), USE006 (Nguyễn Bùi Tấn Hiển AD - ADMIN), USE007 (Võ Văn Hải - ADMIN)
-- EVT_ONGOING_002: USE003 (Phan Văn Linh - SA), USE008 (Phan Văn Oanh - ADMIN), USE009 (Hoàng Văn Vinh - ADMIN)
-- EVT_ONGOING_003: USE004 (Phạm Văn Em - SA), USE010 (Phan Thị Phong - ADMIN), USE011 (Đặng Văn Quang - LECTURER)
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) VALUES
('ORG_LEADER_001', 'USE002', 'USE002', NOW(), 0, 'LEADER', 'ACTIVE', 'EVT_ONGOING_001', 'ORG002'),
('ORG_COORD_001', 'USE006', 'USE002', NOW(), 0, 'COORDINATOR', 'ACTIVE', 'EVT_ONGOING_001', 'ORG002'),
('ORG_MEMBER_001', 'USE007', 'USE002', NOW(), 0, 'MEMBER', 'ACTIVE', 'EVT_ONGOING_001', 'ORG002'),
('ORG_LEADER_002', 'USE003', 'USE003', NOW(), 0, 'LEADER', 'ACTIVE', 'EVT_ONGOING_002', 'ORG003'),
('ORG_COORD_002', 'USE008', 'USE003', NOW(), 0, 'COORDINATOR', 'ACTIVE', 'EVT_ONGOING_002', 'ORG003'),
('ORG_MEMBER_002', 'USE009', 'USE003', NOW(), 0, 'MEMBER', 'ACTIVE', 'EVT_ONGOING_002', 'ORG003'),
('ORG_LEADER_003', 'USE004', 'USE004', NOW(), 0, 'LEADER', 'ACTIVE', 'EVT_ONGOING_003', 'ORG004'),
('ORG_COORD_003', 'USE010', 'USE004', NOW(), 0, 'COORDINATOR', 'ACTIVE', 'EVT_ONGOING_003', 'ORG004'),
('ORG_MEMBER_003', 'USE011', 'USE004', NOW(), 0, 'MEMBER', 'ACTIVE', 'EVT_ONGOING_003', 'ORG004');

-- 6. Insert Sessions (3 per event, linked to presenters via presenter_id)
INSERT INTO event_sessions (id, event_id, created_at, description, end_time, is_deleted, order_index, room, start_time, title, type, updated_at, presenter_id) VALUES
-- EVT_ONGOING_001 Sessions
('SESS_ONGOING_001_1', 'EVT_ONGOING_001', NOW(), 'Khai mạc hội thảo và chia sẻ tầm quan trọng của kỹ năng mềm trong kỷ nguyên số.', '2026-05-21 11:30:00', 0, 1, 'Hội trường chính A1', '2026-05-21 08:30:00', 'Kỹ năng giao tiếp và tạo lập mối quan hệ', 'KEYNOTE', NOW(), 'PRES_ONGOING_001_1'),
('SESS_ONGOING_001_2', 'EVT_ONGOING_001', NOW(), 'Thực hành làm việc nhóm giải quyết các tình huống thực tế.', '2026-05-21 16:30:00', 0, 2, 'Hội trường phụ A1.2', '2026-05-21 13:30:00', 'Làm việc nhóm và Quản lý thời gian', 'WORKSHOP', NOW(), 'PRES_ONGOING_001_2'),
('SESS_ONGOING_001_3', 'EVT_ONGOING_001', NOW(), 'Tổng kết và chia sẻ bí quyết thuyết trình chuyên nghiệp trước đám đông.', '2026-05-22 16:30:00', 0, 3, 'Hội trường chính A1', '2026-05-22 13:30:00', 'Nghệ thuật thuyết trình và Tư duy phản biện', 'PANEL', NOW(), 'PRES_ONGOING_001_3'),

-- EVT_ONGOING_002 Sessions
('SESS_ONGOING_002_1', 'EVT_ONGOING_002', NOW(), 'Phần thi lý thuyết và kỹ năng sử dụng Microsoft Word.', '2026-05-21 11:30:00', 0, 1, 'Phòng máy thực hành tầng 4 - Nhà H', '2026-05-21 08:30:00', 'Kỹ năng soạn thảo văn bản Word nâng cao', 'WORKSHOP', NOW(), 'PRES_ONGOING_002_1'),
('SESS_ONGOING_002_2', 'EVT_ONGOING_002', NOW(), 'Phần thi thực hành kỹ năng xử lý dữ liệu với Excel và trình bày PowerPoint.', '2026-05-21 16:30:00', 0, 2, 'Phòng máy thực hành tầng 4 - Nhà H', '2026-05-21 13:30:00', 'Xử lý dữ liệu Excel & Trình diễn PowerPoint', 'WORKSHOP', NOW(), 'PRES_ONGOING_002_2'),
('SESS_ONGOING_002_3', 'EVT_ONGOING_002', NOW(), 'Vòng chung kết và trao giải cuộc thi Tin học Văn phòng.', '2026-05-22 16:30:00', 0, 3, 'Phòng máy thực hành tầng 4 - Nhà H', '2026-05-22 13:30:00', 'Chung kết và Trao giải Tin học Văn phòng', 'KEYNOTE', NOW(), 'PRES_ONGOING_002_3'),

-- EVT_ONGOING_003 Sessions
('SESS_ONGOING_003_1', 'EVT_ONGOING_003', NOW(), 'Báo cáo các đề tài nghiên cứu về IoT và hệ thống nhúng.', '2026-05-21 11:30:00', 0, 1, 'Phòng hội thảo khoa Điện tử', '2026-05-21 08:30:00', 'IoT và Hệ thống nhúng thế hệ mới', 'KEYNOTE', NOW(), 'PRES_ONGOING_003_1'),
('SESS_ONGOING_003_2', 'EVT_ONGOING_003', NOW(), 'Báo cáo các đề tài nghiên cứu về Robot và Trí tuệ nhân tạo biên (Edge AI).', '2026-05-21 16:30:00', 0, 2, 'Phòng hội thảo khoa Điện tử', '2026-05-21 13:30:00', 'Ứng dụng Edge AI và Robotics', 'PANEL', NOW(), 'PRES_ONGOING_003_2'),
('SESS_ONGOING_003_3', 'EVT_ONGOING_003', NOW(), 'Tổng kết seminar và trao chứng nhận cho các đề tài nghiên cứu xuất sắc.', '2026-05-22 16:30:00', 0, 3, 'Phòng hội thảo khoa Điện tử', '2026-05-22 13:30:00', 'Tổng kết và Trao chứng nhận nghiên cứu', 'WORKSHOP', NOW(), 'PRES_ONGOING_003_3');

-- 7. Insert Registrations for Event 1 (22 participants: USE016 to USE037)
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES
('REG_001_USE016', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE016', 'token-ongoing-001-016', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-016', NOW()),
('REG_001_USE017', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE017', 'token-ongoing-001-017', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-017', NOW()),
('REG_001_USE018', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE018', 'token-ongoing-001-018', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-018', NOW()),
('REG_001_USE019', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE019', 'token-ongoing-001-019', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-019', NOW()),
('REG_001_USE020', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE020', 'token-ongoing-001-020', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-020', NOW()),
('REG_001_USE021', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE021', 'token-ongoing-001-021', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-021', NOW()),
('REG_001_USE022', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE022', 'token-ongoing-001-022', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-022', NOW()),
('REG_001_USE023', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE023', 'token-ongoing-001-023', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-023', NOW()),
('REG_001_USE024', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE024', 'token-ongoing-001-024', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-024', NOW()),
('REG_001_USE025', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE025', 'token-ongoing-001-025', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-025', NOW()),
('REG_001_USE026', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE026', 'token-ongoing-001-026', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-026', NOW()),
('REG_001_USE027', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE027', 'token-ongoing-001-027', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-027', NOW()),
('REG_001_USE028', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE028', 'token-ongoing-001-028', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-028', NOW()),
('REG_001_USE029', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE029', 'token-ongoing-001-029', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-029', NOW()),
('REG_001_USE030', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE030', 'token-ongoing-001-030', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-030', NOW()),
('REG_001_USE031', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE031', 'token-ongoing-001-031', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-031', NOW()),
('REG_001_USE032', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE032', 'token-ongoing-001-032', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-032', NOW()),
('REG_001_USE033', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE033', 'token-ongoing-001-033', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-033', NOW()),
('REG_001_USE034', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE034', 'token-ongoing-001-034', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-034', NOW()),
('REG_001_USE035', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE035', 'token-ongoing-001-035', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-035', NOW()),
('REG_001_USE036', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE036', 'token-ongoing-001-036', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-036', NOW()),
('REG_001_USE037', 'EVT_ONGOING_001', '{}', NULL, 0, NULL, 0, 'USE037', 'token-ongoing-001-037', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-001-037', NOW());

-- 8. Insert Registrations for Event 2 (25 participants: USE016 to USE040)
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES
('REG_002_USE016', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE016', 'token-ongoing-002-016', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-016', NOW()),
('REG_002_USE017', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE017', 'token-ongoing-002-017', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-017', NOW()),
('REG_002_USE018', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE018', 'token-ongoing-002-018', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-018', NOW()),
('REG_002_USE019', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE019', 'token-ongoing-002-019', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-019', NOW()),
('REG_002_USE020', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE020', 'token-ongoing-002-020', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-020', NOW()),
('REG_002_USE021', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE021', 'token-ongoing-002-021', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-021', NOW()),
('REG_002_USE022', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE022', 'token-ongoing-002-022', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-022', NOW()),
('REG_002_USE023', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE023', 'token-ongoing-002-023', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-023', NOW()),
('REG_002_USE024', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE024', 'token-ongoing-002-024', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-024', NOW()),
('REG_002_USE025', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE025', 'token-ongoing-002-025', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-025', NOW()),
('REG_002_USE026', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE026', 'token-ongoing-002-026', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-026', NOW()),
('REG_002_USE027', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE027', 'token-ongoing-002-027', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-027', NOW()),
('REG_002_USE028', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE028', 'token-ongoing-002-028', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-028', NOW()),
('REG_002_USE029', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE029', 'token-ongoing-002-029', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-029', NOW()),
('REG_002_USE030', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE030', 'token-ongoing-002-030', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-030', NOW()),
('REG_002_USE031', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE031', 'token-ongoing-002-031', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-031', NOW()),
('REG_002_USE032', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE032', 'token-ongoing-002-032', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-032', NOW()),
('REG_002_USE033', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE033', 'token-ongoing-002-033', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-033', NOW()),
('REG_002_USE034', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE034', 'token-ongoing-002-034', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-034', NOW()),
('REG_002_USE035', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE035', 'token-ongoing-002-035', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-035', NOW()),
('REG_002_USE036', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE036', 'token-ongoing-002-036', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-036', NOW()),
('REG_002_USE037', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE037', 'token-ongoing-002-037', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-037', NOW()),
('REG_002_USE038', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE038', 'token-ongoing-002-038', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-038', NOW()),
('REG_002_USE039', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE039', 'token-ongoing-002-039', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-039', NOW()),
('REG_002_USE040', 'EVT_ONGOING_002', '{}', NULL, 0, NULL, 0, 'USE040', 'token-ongoing-002-040', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-002-040', NOW());

-- 9. Insert Registrations for Event 3 (28 participants: USE016 to USE043)
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES
('REG_003_USE016', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE016', 'token-ongoing-003-016', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-016', NOW()),
('REG_003_USE017', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE017', 'token-ongoing-003-017', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-017', NOW()),
('REG_003_USE018', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE018', 'token-ongoing-003-018', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-018', NOW()),
('REG_003_USE019', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE019', 'token-ongoing-003-019', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-019', NOW()),
('REG_003_USE020', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE020', 'token-ongoing-003-020', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-020', NOW()),
('REG_003_USE021', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE021', 'token-ongoing-003-021', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-021', NOW()),
('REG_003_USE022', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE022', 'token-ongoing-003-022', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-022', NOW()),
('REG_003_USE023', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE023', 'token-ongoing-003-023', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-023', NOW()),
('REG_003_USE024', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE024', 'token-ongoing-003-024', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-024', NOW()),
('REG_003_USE025', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE025', 'token-ongoing-003-025', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-025', NOW()),
('REG_003_USE026', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE026', 'token-ongoing-003-026', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-026', NOW()),
('REG_003_USE027', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE027', 'token-ongoing-003-027', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-027', NOW()),
('REG_003_USE028', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE028', 'token-ongoing-003-028', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-028', NOW()),
('REG_003_USE029', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE029', 'token-ongoing-003-029', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-029', NOW()),
('REG_003_USE030', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE030', 'token-ongoing-003-030', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-030', NOW()),
('REG_003_USE031', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE031', 'token-ongoing-003-031', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-031', NOW()),
('REG_003_USE032', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE032', 'token-ongoing-003-032', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-032', NOW()),
('REG_003_USE033', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE033', 'token-ongoing-003-033', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-033', NOW()),
('REG_003_USE034', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE034', 'token-ongoing-003-034', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-034', NOW()),
('REG_003_USE035', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE035', 'token-ongoing-003-035', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-035', NOW()),
('REG_003_USE036', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE036', 'token-ongoing-003-036', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-036', NOW()),
('REG_003_USE037', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE037', 'token-ongoing-003-037', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-037', NOW()),
('REG_003_USE038', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE038', 'token-ongoing-003-038', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-038', NOW()),
('REG_003_USE039', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE039', 'token-ongoing-003-039', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-039', NOW()),
('REG_003_USE040', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE040', 'token-ongoing-003-040', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-040', NOW()),
('REG_003_USE041', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE041', 'token-ongoing-003-041', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-041', NOW()),
('REG_003_USE042', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE042', 'token-ongoing-003-042', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-042', NOW()),
('REG_003_USE043', 'EVT_ONGOING_003', '{}', NULL, 0, NULL, 0, 'USE043', 'token-ongoing-003-043', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-ONGOING-003-043', NOW());

-- 10. Insert 5 Event Posts per Event with 3 Comments each
-- Post for EVT_ONGOING_001
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_001_1', 'EVT_ONGOING_001', 1, 'USE002', 'Chương trình hội thảo chính thức bắt đầu từ ngày hôm nay! Ban tổ chức rất vui mừng được đón tiếp hơn 20 bạn sinh viên đã đăng ký tham gia. Hãy chuẩn bị tinh thần học hỏi và giao lưu nhé!', NOW(), '["https://picsum.photos/600/300?random=120"]', 0, 1, 'ANNOUNCEMENT', NOW(), '{}', 'chao-mung-ky-nang-mem-p1', 'PUBLISHED', 'Chào mừng các bạn sinh viên đến với Hội thảo Phát triển Kỹ năng Mềm!', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_1_1', 'USE016', 'Em rất mong chờ chương trình này ạ!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_1_2', 'USE017', 'Hội thảo diễn ra ở hội trường A1 đúng không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_1_3', 'USE018', 'Chúc chương trình thành công tốt đẹp!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_1', 0, NULL);

-- Post for EVT_ONGOING_001
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_001_2', 'EVT_ONGOING_001', 1, 'USE002', 'Chúng ta sẽ được lắng nghe chia sẻ từ 3 diễn giả vô cùng tâm huyết: Thầy Đặng Văn Quang, Cô Võ Thị Ngọc và Cô Huỳnh Thị Linh. Các thầy cô đều là những giảng viên giàu kinh nghiệm về kỹ năng giao tiếp và thuyết trình.', NOW(), '["https://picsum.photos/600/300?random=121"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'gioi-thieu-dien-gia-p2', 'PUBLISHED', 'Giới thiệu các diễn giả giàu kinh nghiệm của hội thảo', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_2_1', 'USE019', 'Các thầy cô dạy siêu hay và nhiệt tình lắm luôn.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_2_2', 'USE020', 'Em đăng ký tham gia chủ yếu để nghe cô Ngọc chia sẻ.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_2_3', 'USE021', 'Tuyệt vời quá ban tổ chức ơi!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_2', 0, NULL);

-- Post for EVT_ONGOING_001
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_001_3', 'EVT_ONGOING_001', 1, 'USE002', 'Hôm nay chúng ta sẽ có 2 phiên chính: Sáng (8h30 - 11h30) về Kỹ năng giao tiếp và Chiều (13h30 - 16h30) về Làm việc nhóm. Ngày mai sẽ là phiên Thuyết trình và Tư duy phản biện.', NOW(), '["https://picsum.photos/600/300?random=122"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'lich-trinh-chi-tiet-p3', 'PUBLISHED', 'Lịch trình chi tiết các phiên thảo luận chuyên đề', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_3_1', 'USE022', 'Lịch trình rất rõ ràng và hợp lý.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_3_2', 'USE023', 'Chiều nay có phần thực hành tình huống không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_3_3', 'USE024', 'Em thích nhất phần kỹ năng làm việc nhóm.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_3', 0, NULL);

-- Post for EVT_ONGOING_001
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_001_4', 'EVT_ONGOING_001', 1, 'USE002', 'Trong mỗi phiên thảo luận, các bạn sẽ được chia thành các nhóm nhỏ từ 5-6 người để thảo luận tình huống. Hãy quét mã QR tại bàn để tải tài liệu hướng dẫn giải bài tập nhóm.', NOW(), '["https://picsum.photos/600/300?random=123"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'huong-dan-thao-luan-p4', 'PUBLISHED', 'Hướng dẫn tham gia hoạt động nhóm và nhận tài liệu', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_4_1', 'USE025', 'Có cần mang theo laptop không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_4_2', 'USE026', 'Nhóm em đã sẵn sàng rồi!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_4_3', 'USE027', 'Tài liệu biên soạn rất chi tiết, cảm ơn BTC!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_4', 0, NULL);

-- Post for EVT_ONGOING_001
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_001_5', 'EVT_ONGOING_001', 1, 'USE002', 'Ngày đầu tiên đã diễn ra cực kỳ bùng nổ với nhiều hoạt động tương tác thú vị. Cảm ơn sự tham gia nhiệt tình của tất cả các bạn sinh viên!', NOW(), '["https://picsum.photos/600/300?random=124"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'hinh-anh-hoat-dong-p5', 'PUBLISHED', 'Cập nhật hình ảnh hoạt động sôi nổi ngày đầu tiên', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_5_1', 'USE028', 'Rất vui vì được làm quen với nhiều bạn mới.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_5_2', 'USE029', 'Nhiều bài học thực tế cực kỳ bổ ích luôn ạ.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_001_5_3', 'USE030', 'Hóng ảnh ngày thứ hai quá đi.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_001_5', 0, NULL);

-- Post for EVT_ONGOING_002
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_002_1', 'EVT_ONGOING_002', 1, 'USE003', 'Cuộc thi chính thức khởi động! Đây là cơ hội để các bạn sinh viên thể hiện kỹ năng sử dụng Word, Excel và PowerPoint để chuẩn bị cho công việc thực tế trong tương lai. Chúc các thí sinh bình tĩnh, tự tin và đạt kết quả cao!', NOW(), '["https://picsum.photos/600/300?random=125"]', 0, 1, 'ANNOUNCEMENT', NOW(), '{}', 'khai-mac-tin-hoc-p1', 'PUBLISHED', 'Khai mạc Giải vô địch Tin học văn phòng cấp Trường!', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_1_1', 'USE021', 'Đề thi năm nay nghe nói có phần Excel nâng cao đúng không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_1_2', 'USE022', 'Chúc các bạn thi tốt nha!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_1_3', 'USE023', 'Phòng máy lạnh mát mẻ, máy chạy rất mượt.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_1', 0, NULL);

-- Post for EVT_ONGOING_002
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_002_2', 'EVT_ONGOING_002', 1, 'USE003', 'Đội ngũ cố vấn và ban giám khảo gồm có Cô Võ Thị Uyên, Thầy Võ Văn Hải và Cô Nguyễn Thị Bình. Đây đều là những chuyên gia có nhiều năm kinh nghiệm giảng dạy tin học văn phòng.', NOW(), '["https://picsum.photos/600/300?random=126"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'ban-giam-khao-p2', 'PUBLISHED', 'Giới thiệu ban giám khảo và cố vấn chuyên môn', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_2_1', 'USE024', 'Cô Uyên chấm thi rất công tâm và nghiêm túc.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_2_2', 'USE025', 'Hy vọng được thầy Hải hướng dẫn thêm về hàm Excel.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_2_3', 'USE026', 'Đội ngũ ban giám khảo chất lượng quá.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_2', 0, NULL);

-- Post for EVT_ONGOING_002
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_002_3', 'EVT_ONGOING_002', 1, 'USE003', 'Các thí sinh lưu ý: Không được sử dụng tài liệu ngoài và Internet trong quá trình thi. Bài thi Word chiếm 30%, Excel 40%, PowerPoint 30%. Thời gian làm bài mỗi phần là 60 phút.', NOW(), '["https://picsum.photos/600/300?random=127"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'quy-che-phong-thi-p3', 'PUBLISHED', 'Quy chế phòng thi và cách tính điểm chi tiết', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_3_1', 'USE027', 'Có được mang nháp vào không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_3_2', 'USE028', 'Thời gian 60 phút cho Excel hơi căng nhỉ.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_3_3', 'USE029', 'Em sẽ cố gắng hết sức!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_3', 0, NULL);

-- Post for EVT_ONGOING_002
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_002_4', 'EVT_ONGOING_002', 1, 'USE003', 'BTC gửi tặng các thí sinh bảng tổng hợp các phím tắt thông dụng nhất trong bộ ứng dụng Office. Việc sử dụng phím tắt thành thạo sẽ giúp các bạn tiết kiệm rất nhiều thời gian làm bài.', NOW(), '["https://picsum.photos/600/300?random=128"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'tai-lieu-on-tap-p4', 'PUBLISHED', 'Tài liệu ôn tập và các phím tắt thông dụng', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_4_1', 'USE030', 'Tài liệu hữu ích quá, cảm ơn thầy cô!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_4_2', 'USE031', 'Phím tắt giúp thao tác nhanh gấp đôi luôn.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_4_3', 'USE032', 'Đã tải về và ôn tập gấp.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_4', 0, NULL);

-- Post for EVT_ONGOING_002
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_002_5', 'EVT_ONGOING_002', 1, 'USE003', 'Kết quả vòng thi thực hành đã có! Lễ tổng kết và trao giải sẽ diễn ra vào chiều mai lúc 13h30 tại Phòng máy thực hành tầng 4 - Nhà H. Các bạn nhớ có mặt đúng giờ nhé!', NOW(), '["https://picsum.photos/600/300?random=129"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'thong-bao-ket-qua-p5', 'PUBLISHED', 'Thông báo kết quả và thời gian lễ trao giải', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_5_1', 'USE033', 'Hồi hộp chờ đợi kết quả quá.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_5_2', 'USE034', 'Giải thưởng năm nay có gì hot không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_002_5_3', 'USE035', 'Chúc mừng các bạn xuất sắc đạt giải!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_002_5', 0, NULL);

-- Post for EVT_ONGOING_003
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_003_1', 'EVT_ONGOING_003', 1, 'USE004', 'Seminar là diễn đàn học thuật giúp sinh viên ngành Điện tử công bố và thảo luận các kết quả nghiên cứu mới nhất về IoT, Robotics và Trí tuệ nhân tạo biên (Edge AI). Chúc seminar diễn ra thành công!', NOW(), '["https://picsum.photos/600/300?random=130"]', 0, 1, 'ANNOUNCEMENT', NOW(), '{}', 'chao-mung-dien-tu-p1', 'PUBLISHED', 'Chào mừng đến với Seminar Nghiên cứu Khoa học Điện tử!', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_1_1', 'USE026', 'Nhiều đề tài nghiên cứu rất thực tiễn.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_1_2', 'USE027', 'Em rất muốn tìm hiểu về Edge AI.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_1', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_1_3', 'USE028', 'Chúc các nhóm báo cáo tự tin!', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_1', 0, NULL);

-- Post for EVT_ONGOING_003
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_003_2', 'EVT_ONGOING_003', 1, 'USE004', 'Chúng tôi vinh dự được đón tiếp các chuyên gia phản biện: Thầy Võ Văn Thảo, Cô Phạm Thị Phong và Thầy Huỳnh Thị Dũng. Những nhận xét của hội đồng sẽ giúp hoàn thiện các đề tài.', NOW(), '["https://picsum.photos/600/300?random=131"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'gioi-thieu-giam-khao-p2', 'PUBLISHED', 'Giới thiệu các báo cáo viên và chuyên gia phản biện', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_2_1', 'USE029', 'Thầy Thảo phản biện rất sắc bén và thực tế.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_2_2', 'USE030', 'Cơ hội tốt để học hỏi phương pháp nghiên cứu.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_2', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_2_3', 'USE031', 'Hội đồng chuyên môn rất uy tín.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_2', 0, NULL);

-- Post for EVT_ONGOING_003
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_003_3', 'EVT_ONGOING_003', 1, 'USE004', 'Phiên sáng nay sẽ có 3 đề tài: Hệ thống giám sát nông nghiệp thông minh, Thiết bị hỗ trợ y tế đeo tay, và Mạng cảm biến không dây tiết kiệm năng lượng. Kính mời các bạn đón xem.', NOW(), '["https://picsum.photos/600/300?random=132"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'danh-sach-de-tai-sang-p3', 'PUBLISHED', 'Danh sách các đề tài báo cáo phiên buổi sáng (IoT & Embedded Systems)', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_3_1', 'USE032', 'Đề tài giám sát nông nghiệp rất thiết thực.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_3_2', 'USE033', 'Em muốn hỏi về giao thức truyền thông của thiết bị y tế.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_3_3', 'USE034', 'Các bạn chuẩn bị slide rất chuyên nghiệp.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_3', 0, NULL);

-- Post for EVT_ONGOING_003
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_003_4', 'EVT_ONGOING_003', 1, 'USE004', 'Phiên chiều sẽ tập trung vào Edge AI và Robotics: Xe tự hành tránh vật cản dùng LiDAR, Nhận diện khuôn mặt trên vi điều khiển ESP32-CAM, và Robot cộng tác trong công nghiệp.', NOW(), '["https://picsum.photos/600/300?random=133"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'danh-sach-de-tai-chieu-p4', 'PUBLISHED', 'Danh sách các đề tài báo cáo phiên buổi chiều (Edge AI & Robotics)', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_4_1', 'USE035', 'ESP32-CAM chạy Edge AI có bị chậm không nhỉ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_4_2', 'USE036', 'Xe tự hành dùng thuật toán gì thế ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_4', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_4_3', 'USE037', 'Đề tài robot cộng tác rất hấp dẫn.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_4', 0, NULL);

-- Post for EVT_ONGOING_003
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('POST_OG_003_5', 'EVT_ONGOING_003', 1, 'USE004', 'Bên lề hội thảo, BTC có bố trí khu vực trưng bày các mô hình, sản phẩm chạy thử nghiệm thực tế của các đề tài. Kính mời thầy cô và các bạn sinh viên đến tham quan và trải nghiệm trực tiếp!', NOW(), '["https://picsum.photos/600/300?random=134"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'trien-lam-san-pham-p5', 'PUBLISHED', 'Khai mạc triển lãm sản phẩm nghiên cứu thực tế', NOW(), 25);

  -- Comments for Post
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_5_1', 'USE038', 'Sản phẩm chạy rất mượt mà.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_5_2', 'USE039', 'Được sờ tận tay mô hình robot thích quá.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_5', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('CMT_OG_003_5_3', 'USE040', 'Khâm phục tinh thần tự chế tạo của các bạn sinh viên.', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'POST_OG_003_5', 0, NULL);


-- 11. Insert 1 Quiz per Event with 20 Questions (4 options each)
-- Quiz for EVT_ONGOING_001
INSERT INTO quizzes (id, event_id, created_at, description, is_active, require_check_in, title) 
VALUES ('QZOG01', 'EVT_ONGOING_001', NOW(), 'Bài trắc nghiệm đánh giá kiến thức về kỹ năng giao tiếp, làm việc nhóm và thuyết trình hiệu quả.', 1, 1, 'Trắc nghiệm Kỹ năng Mềm và Làm việc Nhóm');

  -- Question 1
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_01', 'QZOG01', 5, 'Kỹ năng nào được coi là nền tảng của mọi mối quan hệ xã hội?', NULL, 'Kỹ năng cơ bản', 1, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_01_A', 'QUES_OG_001_01', 'Giao tiếp', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_01_B', 'QUES_OG_001_01', 'Quản lý thời gian', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_01_C', 'QUES_OG_001_01', 'Lập kế hoạch', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_01_D', 'QUES_OG_001_01', 'Sử dụng máy tính', 0, NULL);

  -- Question 2
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_02', 'QZOG01', 5, 'Khi nghe người khác nói, hành vi nào thể hiện sự tôn trọng nhất?', NULL, 'Lắng nghe', 2, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_02_A', 'QUES_OG_001_02', 'Ngắt lời họ để nêu ý kiến', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_02_B', 'QUES_OG_001_02', 'Lắng nghe chủ động và phản hồi tích cực', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_02_C', 'QUES_OG_001_02', 'Nhìn đi chỗ khác', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_02_D', 'QUES_OG_001_02', 'Kiểm tra điện thoại', 0, NULL);

  -- Question 3
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_03', 'QZOG01', 5, 'Yếu tố nào sau đây KHÔNG phải là một phần của giao tiếp phi ngôn ngữ?', NULL, 'Phi ngôn ngữ', 3, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_03_A', 'QUES_OG_001_03', 'Ánh mắt', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_03_B', 'QUES_OG_001_03', 'Cử chỉ tay', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_03_C', 'QUES_OG_001_03', 'Giọng nói và ngữ điệu', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_03_D', 'QUES_OG_001_03', 'Lựa chọn từ ngữ', 1, NULL);

  -- Question 4
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_04', 'QZOG01', 5, 'Trong làm việc nhóm, xung đột nên được giải quyết như thế nào?', NULL, 'Giải quyết xung đột', 4, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_04_A', 'QUES_OG_001_04', 'Tránh né xung đột để giữ hòa khí', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_04_B', 'QUES_OG_001_04', 'Thảo luận cởi mở để tìm giải pháp chung', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_04_C', 'QUES_OG_001_04', 'Người có chức vụ cao nhất quyết định', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_04_D', 'QUES_OG_001_04', 'Chia rẽ nhóm thành các phe cánh', 0, NULL);

  -- Question 5
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_05', 'QZOG01', 5, 'Nguyên tắc ''SMART'' trong lập mục tiêu có chữ ''M'' viết tắt cho từ gì?', NULL, 'SMART', 5, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_05_A', 'QUES_OG_001_05', 'Measurable - Đo lường được', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_05_B', 'QUES_OG_001_05', 'Manageable - Quản lý được', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_05_C', 'QUES_OG_001_05', 'Meaningful - Ý nghĩa', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_05_D', 'QUES_OG_001_05', 'Motivational - Tạo động lực', 0, NULL);

  -- Question 6
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_06', 'QZOG01', 5, 'Kỹ năng thuyết trình tốt đòi hỏi người nói phải làm gì đầu tiên?', NULL, 'Thuyết trình', 6, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_06_A', 'QUES_OG_001_06', 'Chuẩn bị slide thật nhiều chữ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_06_B', 'QUES_OG_001_06', 'Xác định rõ đối tượng thính giả', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_06_C', 'QUES_OG_001_06', 'Mua trang phục đắt tiền', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_06_D', 'QUES_OG_001_06', 'Học thuộc lòng toàn bộ bài nói', 0, NULL);

  -- Question 7
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_07', 'QZOG01', 5, 'Cách hiệu quả nhất để giảm bớt căng thẳng trước khi thuyết trình là gì?', NULL, 'Thuyết trình', 7, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_07_A', 'QUES_OG_001_07', 'Uống nhiều cà phê', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_07_B', 'QUES_OG_001_07', 'Hít thở sâu và chuẩn bị kỹ lưỡng nội dung', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_07_C', 'QUES_OG_001_07', 'Tránh nhìn vào khán giả', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_07_D', 'QUES_OG_001_07', 'Đi thật nhanh qua phần mở đầu', 0, NULL);

  -- Question 8
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_08', 'QZOG01', 5, 'Để quản lý thời gian hiệu quả, ta nên ưu tiên công việc theo ma trận Eisenhower dựa trên hai yếu tố nào?', NULL, 'Quản lý thời gian', 8, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_08_A', 'QUES_OG_001_08', 'Độ khó và Độ dễ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_08_B', 'QUES_OG_001_08', 'Tầm quan trọng và Tính khẩn cấp', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_08_C', 'QUES_OG_001_08', 'Chi phí và Lợi nhuận', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_08_D', 'QUES_OG_001_08', 'Thời gian bắt đầu và kết thúc', 0, NULL);

  -- Question 9
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_09', 'QZOG01', 5, 'Trong mô hình phát triển nhóm của Tuckman, giai đoạn nào các thành viên bắt đầu giải quyết xung đột và làm quen với nhau?', NULL, 'Tuckman', 9, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_09_A', 'QUES_OG_001_09', 'Forming (Hình thành)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_09_B', 'QUES_OG_001_09', 'Storming (Sóng gió)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_09_C', 'QUES_OG_001_09', 'Norming (Ổn định)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_09_D', 'QUES_OG_001_09', 'Performing (Hoạt động hiệu quả)', 0, NULL);

  -- Question 10
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_10', 'QZOG01', 5, 'Kỹ năng giao tiếp ứng xử thông minh giúp ta làm gì khi nhận lời phê bình?', NULL, 'Ứng xử', 10, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_10_A', 'QUES_OG_001_10', 'Phản ứng gay gắt để tự bảo vệ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_10_B', 'QUES_OG_001_10', 'Đổ lỗi cho hoàn cảnh', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_10_C', 'QUES_OG_001_10', 'Lắng nghe, phân tích và rút kinh nghiệm', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_10_D', 'QUES_OG_001_10', 'Im lặng và tỏ thái độ bất hợp tác', 0, NULL);

  -- Question 11
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_11', 'QZOG01', 5, 'Tư duy phản biện (Critical Thinking) là gì?', NULL, 'Tư duy phản biện', 11, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_11_A', 'QUES_OG_001_11', 'Luôn luôn bác bỏ ý kiến của người khác', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_11_B', 'QUES_OG_001_11', 'Khả năng suy nghĩ độc lập, logic và khách quan để giải quyết vấn đề', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_11_C', 'QUES_OG_001_11', 'Thói quen chỉ trích lỗi lầm của đồng nghiệp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_11_D', 'QUES_OG_001_11', 'Sự chấp nhận thông tin không cần kiểm chứng', 0, NULL);

  -- Question 12
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_12', 'QZOG01', 5, 'Khi thuyết trình, tỷ lệ giao tiếp bằng ánh mắt (eye contact) với khán giả nên duy trì khoảng bao nhiêu?', NULL, 'Ánh mắt', 12, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_12_A', 'QUES_OG_001_12', 'Dưới 10%', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_12_B', 'QUES_OG_001_12', 'Không cần nhìn khán giả', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_12_C', 'QUES_OG_001_12', 'Khoảng 60% - 70% thời gian', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_12_D', 'QUES_OG_001_12', 'Luôn luôn nhìn vào slide', 0, NULL);

  -- Question 13
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_13', 'QZOG01', 5, 'Điều gì giúp tăng tính thuyết phục của bài thuyết trình?', NULL, 'Thuyết phục', 13, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_13_A', 'QUES_OG_001_13', 'Sử dụng các số liệu và ví dụ minh họa thực tế', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_13_B', 'QUES_OG_001_13', 'Nói thật nhanh và không ngừng nghỉ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_13_C', 'QUES_OG_001_13', 'Dùng thuật ngữ chuyên ngành phức tạp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_13_D', 'QUES_OG_001_13', 'Slide có thật nhiều màu sắc sặc sỡ', 0, NULL);

  -- Question 14
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_14', 'QZOG01', 5, 'Trí tuệ cảm xúc (EQ) bao gồm khả năng nào sau đây?', NULL, 'EQ', 14, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_14_A', 'QUES_OG_001_14', 'Tính toán số liệu nhanh', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_14_B', 'QUES_OG_001_14', 'Nhận biết, hiểu và quản lý cảm xúc bản thân và người khác', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_14_C', 'QUES_OG_001_14', 'Trí nhớ siêu phàm', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_14_D', 'QUES_OG_001_14', 'Khả năng thuyết phục người khác bằng mọi giá', 0, NULL);

  -- Question 15
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_15', 'QZOG01', 5, 'Trong một cuộc họp nhóm, khi ai đó đưa ra ý kiến không khả thi, bạn nên ứng xử thế nào?', NULL, 'Ý kiến trái chiều', 15, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_15_A', 'QUES_OG_001_15', 'Cười cợt và gạt đi ngay', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_15_B', 'QUES_OG_001_15', 'Ghi nhận sự đóng góp và giải thích nhẹ nhàng lý do chưa phù hợp', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_15_C', 'QUES_OG_001_15', 'Im lặng bỏ qua', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_15_D', 'QUES_OG_001_15', 'Tuyên bố ý kiến đó thật ngớ ngẩn', 0, NULL);

  -- Question 16
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_16', 'QZOG01', 5, 'Nguyên tắc 80/20 (Pareto Principle) trong quản lý thời gian chỉ ra điều gì?', NULL, '80/20', 16, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_16_A', 'QUES_OG_001_16', '80% kết quả đến từ 20% nỗ lực/công việc quan trọng', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_16_B', 'QUES_OG_001_16', 'Nên làm việc 80 tiếng một tuần', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_16_C', 'QUES_OG_001_16', '80% thời gian dành cho giải trí, 20% dành cho công việc', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_16_D', 'QUES_OG_001_16', 'Chỉ nên hoàn thành 80% kế hoạch đề ra', 0, NULL);

  -- Question 17
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_17', 'QZOG01', 5, 'Tư thế đứng như thế nào thể hiện sự tự tin khi thuyết trình?', NULL, 'Tư thế thuyết trình', 17, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_17_A', 'QUES_OG_001_17', 'Đứng khoanh tay trước ngực', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_17_B', 'QUES_OG_001_17', 'Đứng thẳng, hai chân rộng bằng vai, tay mở tự nhiên', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_17_C', 'QUES_OG_001_17', 'Bỏ tay vào túi quần và tựa người vào bục', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_17_D', 'QUES_OG_001_17', 'Đứng cúi đầu và nhìn xuống sàn', 0, NULL);

  -- Question 18
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_18', 'QZOG01', 5, 'Trong làm việc nhóm, vai trò của người Trưởng nhóm (Leader) là gì?', NULL, 'Leader', 18, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_18_A', 'QUES_OG_001_18', 'Tự mình làm hết mọi việc lớn nhỏ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_18_B', 'QUES_OG_001_18', 'Định hướng, phân công công việc hợp lý và hỗ trợ các thành viên', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_18_C', 'QUES_OG_001_18', 'Đổ hết trách nhiệm khi nhóm thất bại', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_18_D', 'QUES_OG_001_18', 'Chỉ ra lệnh mà không cần lắng nghe phản hồi', 0, NULL);

  -- Question 19
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_19', 'QZOG01', 5, 'Phương pháp ''Brainstorming'' (Não công) được sử dụng để làm gì?', NULL, 'Brainstorming', 19, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_19_A', 'QUES_OG_001_19', 'Đánh giá hiệu suất làm việc', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_19_B', 'QUES_OG_001_19', 'Tìm kiếm thật nhiều ý tưởng sáng tạo trong thời gian ngắn', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_19_C', 'QUES_OG_001_19', 'Soạn thảo hợp đồng', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_19_D', 'QUES_OG_001_19', 'Phân tích báo cáo tài chính', 0, NULL);

  -- Question 20
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_001_20', 'QZOG01', 5, 'Kỹ năng đàm phán thành công hướng tới kết quả nào sau đây?', NULL, 'Đàm phán', 20, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_20_A', 'QUES_OG_001_20', 'Thắng - Thua (Một bên chiếm ưu thế hoàn toàn)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_20_B', 'QUES_OG_001_20', 'Thắng - Thắng (Cả hai bên cùng có lợi)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_20_C', 'QUES_OG_001_20', 'Thua - Thua (Cả hai bên đều nhượng bộ quá nhiều)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_001_20_D', 'QUES_OG_001_20', 'Không đạt được thỏa thuận nào', 0, NULL);

-- Quiz for EVT_ONGOING_002
INSERT INTO quizzes (id, event_id, created_at, description, is_active, require_check_in, title) 
VALUES ('QZOG02', 'EVT_ONGOING_002', NOW(), 'Bài đánh giá năng lực sử dụng các công cụ Word, Excel, PowerPoint cơ bản và nâng cao.', 1, 1, 'Trắc nghiệm Kiến thức Tin học Văn phòng');

  -- Question 1
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_01', 'QZOG02', 5, 'Phím tắt nào được dùng để căn đều hai bên (Justify) đoạn văn bản trong MS Word?', NULL, 'Word phím tắt', 1, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_01_A', 'QUES_OG_002_01', 'Ctrl + J', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_01_B', 'QUES_OG_002_01', 'Ctrl + E', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_01_C', 'QUES_OG_002_01', 'Ctrl + L', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_01_D', 'QUES_OG_002_01', 'Ctrl + R', 0, NULL);

  -- Question 2
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_02', 'QZOG02', 5, 'Trong MS Excel, hàm nào được dùng để đếm số ô có chứa dữ liệu số?', NULL, 'Excel hàm', 2, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_02_A', 'QUES_OG_002_02', 'COUNTA', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_02_B', 'QUES_OG_002_02', 'COUNT', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_02_C', 'QUES_OG_002_02', 'COUNTIF', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_02_D', 'QUES_OG_002_02', 'SUM', 0, NULL);

  -- Question 3
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_03', 'QZOG02', 5, 'Tổ hợp phím nào dùng để tạo một slide mới trong MS PowerPoint?', NULL, 'PowerPoint phím tắt', 3, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_03_A', 'QUES_OG_002_03', 'Ctrl + N', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_03_B', 'QUES_OG_002_03', 'Ctrl + M', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_03_C', 'QUES_OG_002_03', 'Ctrl + S', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_03_D', 'QUES_OG_002_03', 'Ctrl + P', 0, NULL);

  -- Question 4
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_04', 'QZOG02', 5, 'Địa chỉ ô $C$5 trong Excel là loại địa chỉ nào?', NULL, 'Excel địa chỉ ô', 4, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_04_A', 'QUES_OG_002_04', 'Địa chỉ tương đối', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_04_B', 'QUES_OG_002_04', 'Địa chỉ tuyệt đối', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_04_C', 'QUES_OG_002_04', 'Địa chỉ hỗn hợp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_04_D', 'QUES_OG_002_04', 'Địa chỉ ảo', 0, NULL);

  -- Question 5
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_05', 'QZOG02', 5, 'Trong MS Word, phím tắt nào dùng để sao chép định dạng văn bản (Format Painter)?', NULL, 'Word phím tắt', 5, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_05_A', 'QUES_OG_002_05', 'Ctrl + Shift + C', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_05_B', 'QUES_OG_002_05', 'Ctrl + C', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_05_C', 'QUES_OG_002_05', 'Ctrl + Shift + V', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_05_D', 'QUES_OG_002_05', 'Ctrl + Alt + C', 0, NULL);

  -- Question 6
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_06', 'QZOG02', 5, 'Trong Excel, kết quả của công thức =MOD(10, 3) là bao nhiêu?', NULL, 'Excel tính toán', 6, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_06_A', 'QUES_OG_002_06', '3', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_06_B', 'QUES_OG_002_06', '1', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_06_C', 'QUES_OG_002_06', '0', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_06_D', 'QUES_OG_002_06', '0.33', 0, NULL);

  -- Question 7
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_07', 'QZOG02', 5, 'Tính năng nào trong PowerPoint giúp tạo hiệu ứng chuyển tiếp giữa các slide?', NULL, 'PowerPoint chuyển tiếp', 7, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_07_A', 'QUES_OG_002_07', 'Animation', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_07_B', 'QUES_OG_002_07', 'Transition', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_07_C', 'QUES_OG_002_07', 'Slide Show', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_07_D', 'QUES_OG_002_07', 'Design Ideas', 0, NULL);

  -- Question 8
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_08', 'QZOG02', 5, 'Để cố định dòng đầu tiên trong bảng tính Excel khi cuộn xuống, ta dùng tính năng nào?', NULL, 'Excel dòng', 8, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_08_A', 'QUES_OG_002_08', 'Split', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_08_B', 'QUES_OG_002_08', 'Freeze Top Row', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_08_C', 'QUES_OG_002_08', 'Filter', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_08_D', 'QUES_OG_002_08', 'Sort', 0, NULL);

  -- Question 9
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_09', 'QZOG02', 5, 'Trong Word, tổ hợp phím nào dùng để ngắt trang (Page Break) ngay lập tức?', NULL, 'Word ngắt trang', 9, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_09_A', 'QUES_OG_002_09', 'Ctrl + Enter', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_09_B', 'QUES_OG_002_09', 'Shift + Enter', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_09_C', 'QUES_OG_002_09', 'Alt + Enter', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_09_D', 'QUES_OG_002_09', 'Ctrl + Shift + Enter', 0, NULL);

  -- Question 10
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_10', 'QZOG02', 5, 'Hàm VLOOKUP trong Excel dùng để làm gì?', NULL, 'Excel tra cứu', 10, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_10_A', 'QUES_OG_002_10', 'Tìm kiếm giá trị theo chiều ngang', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_10_B', 'QUES_OG_002_10', 'Tìm kiếm giá trị theo cột dọc (nhìn sang phải)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_10_C', 'QUES_OG_002_10', 'Tính tổng các ô thỏa mãn điều kiện', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_10_D', 'QUES_OG_002_10', 'Định dạng dữ liệu tự động', 0, NULL);

  -- Question 11
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_11', 'QZOG02', 5, 'Trong Excel, công thức =AND(TRUE, FALSE, TRUE) trả về giá trị nào?', NULL, 'Excel logic', 11, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_11_A', 'QUES_OG_002_11', 'TRUE', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_11_B', 'QUES_OG_002_11', 'FALSE', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_11_C', 'QUES_OG_002_11', 'ERROR', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_11_D', 'QUES_OG_002_11', 'NULL', 0, NULL);

  -- Question 12
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_12', 'QZOG02', 5, 'Để chèn ký tự đặc biệt như ©, ®, ™ vào Word, ta chọn thẻ nào trên thanh Ribbon?', NULL, 'Word ký tự', 12, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_12_A', 'QUES_OG_002_12', 'Home', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_12_B', 'QUES_OG_002_12', 'Insert', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_12_C', 'QUES_OG_002_12', 'Layout', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_12_D', 'QUES_OG_002_12', 'Review', 0, NULL);

  -- Question 13
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_13', 'QZOG02', 5, 'Chế độ hiển thị nào trong PowerPoint giúp xem toàn bộ các slide dưới dạng thu nhỏ (thumbnail)?', NULL, 'PowerPoint hiển thị', 13, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_13_A', 'QUES_OG_002_13', 'Normal', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_13_B', 'QUES_OG_002_13', 'Slide Sorter', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_13_C', 'QUES_OG_002_13', 'Reading View', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_13_D', 'QUES_OG_002_13', 'Slide Master', 0, NULL);

  -- Question 14
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_14', 'QZOG02', 5, 'Trong Excel, nếu muốn tính trung bình cộng có điều kiện, ta dùng hàm nào?', NULL, 'Excel hàm điều kiện', 14, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_14_A', 'QUES_OG_002_14', 'AVERAGE', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_14_B', 'QUES_OG_002_14', 'AVERAGEIF', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_14_C', 'QUES_OG_002_14', 'SUMIF', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_14_D', 'QUES_OG_002_14', 'COUNTIF', 0, NULL);

  -- Question 15
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_15', 'QZOG02', 5, 'Chức năng ''Mail Merge'' trong MS Word dùng để làm gì?', NULL, 'Word trộn thư', 15, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_15_A', 'QUES_OG_002_15', 'Gửi email hàng loạt từ hòm thư Outlook', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_15_B', 'QUES_OG_002_15', 'Trộn thư/Tạo hàng loạt văn bản giống nhau nhưng có thông tin riêng biệt', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_15_C', 'QUES_OG_002_15', 'Kiểm tra lỗi chính tả tiếng Anh', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_15_D', 'QUES_OG_002_15', 'Nén file Word thành file nhỏ hơn', 0, NULL);

  -- Question 16
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_16', 'QZOG02', 5, 'Trong Excel, lỗi #VALUE! xuất hiện khi nào?', NULL, 'Excel lỗi', 16, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_16_A', 'QUES_OG_002_16', 'Sai tên hàm', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_16_B', 'QUES_OG_002_16', 'Kiểu dữ liệu trong công thức không phù hợp (ví dụ cộng số với chữ)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_16_C', 'QUES_OG_002_16', 'Chia cho số 0', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_16_D', 'QUES_OG_002_16', 'Không tìm thấy dữ liệu tham chiếu', 0, NULL);

  -- Question 17
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_17', 'QZOG02', 5, 'Cách nhanh nhất để bắt đầu trình chiếu PowerPoint từ slide đầu tiên là nhấn phím nào?', NULL, 'PowerPoint phím tắt', 17, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_17_A', 'QUES_OG_002_17', 'F5', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_17_B', 'QUES_OG_002_17', 'Shift + F5', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_17_C', 'QUES_OG_002_17', 'F11', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_17_D', 'QUES_OG_002_17', 'Spacebar', 0, NULL);

  -- Question 18
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_18', 'QZOG02', 5, 'Trong Excel, tổ hợp phím nào dùng để chuyển đổi nhanh giữa các loại địa chỉ ô (tương đối, tuyệt đối)?', NULL, 'Excel địa chỉ ô', 18, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_18_A', 'QUES_OG_002_18', 'F2', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_18_B', 'QUES_OG_002_18', 'F4', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_18_C', 'QUES_OG_002_18', 'F9', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_18_D', 'QUES_OG_002_18', 'F12', 0, NULL);

  -- Question 19
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_19', 'QZOG02', 5, 'Để tạo bảng chỉ mục tự động (Mục lục) trong Word, ta sử dụng tính năng nào trong thẻ References?', NULL, 'Word mục lục', 19, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_19_A', 'QUES_OG_002_19', 'Table of Contents', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_19_B', 'QUES_OG_002_19', 'Insert Caption', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_19_C', 'QUES_OG_002_19', 'Bibliography', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_19_D', 'QUES_OG_002_19', 'Index', 0, NULL);

  -- Question 20
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_002_20', 'QZOG02', 5, 'File Excel được lưu mặc định với phần mở rộng nào từ phiên bản 2007 đến nay?', NULL, 'Excel lưu trữ', 20, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_20_A', 'QUES_OG_002_20', '.xls', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_20_B', 'QUES_OG_002_20', '.xlsx', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_20_C', 'QUES_OG_002_20', '.doc', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_002_20_D', 'QUES_OG_002_20', '.csv', 0, NULL);

-- Quiz for EVT_ONGOING_003
INSERT INTO quizzes (id, event_id, created_at, description, is_active, require_check_in, title) 
VALUES ('QZOG03', 'EVT_ONGOING_003', NOW(), 'Bài trắc nghiệm đánh giá kiến thức cơ bản về IoT, lập trình nhúng, thiết kế mạch điện tử và Robotics.', 1, 0, 'Trắc nghiệm Kiến thức Kỹ thuật Điện tử và IoT');

  -- Question 1
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_01', 'QZOG03', 5, 'Giao thức truyền thông nào sau đây hoạt động theo mô hình Publish/Subscribe rất phổ biến trong IoT?', NULL, 'IoT giao thức', 1, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_01_A', 'QUES_OG_003_01', 'HTTP', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_01_B', 'QUES_OG_003_01', 'MQTT', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_01_C', 'QUES_OG_003_01', 'FTP', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_01_D', 'QUES_OG_003_01', 'SMTP', 0, NULL);

  -- Question 2
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_02', 'QZOG03', 5, 'Vi điều khiển phổ biến ESP32 tích hợp sẵn những chuẩn kết nối không dây nào?', NULL, 'ESP32', 2, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_02_A', 'QUES_OG_003_02', 'Chỉ có Wifi', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_02_B', 'QUES_OG_003_02', 'Wi-Fi và Bluetooth', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_02_C', 'QUES_OG_003_02', 'Zigbee và LoRa', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_02_D', 'QUES_OG_003_02', 'NFC và RFID', 0, NULL);

  -- Question 3
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_03', 'QZOG03', 5, 'Định luật Ohm phát biểu mối quan hệ giữa Cường độ dòng điện (I), Hiệu điện thế (U) và Điện trở (R) như thế nào?', NULL, 'Điện tử cơ bản', 3, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_03_A', 'QUES_OG_003_03', 'I = U / R', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_03_B', 'QUES_OG_003_03', 'I = U * R', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_03_C', 'QUES_OG_003_03', 'I = R / U', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_03_D', 'QUES_OG_003_03', 'U = I / R', 0, NULL);

  -- Question 4
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_04', 'QZOG03', 5, 'Trong các cảm biến sau, cảm biến nào dùng để đo độ ẩm đất?', NULL, 'Cảm biến', 4, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_04_A', 'QUES_OG_003_04', 'DHT11', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_04_B', 'QUES_OG_003_04', 'Soil Moisture Sensor', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_04_C', 'QUES_OG_003_04', 'HC-SR04', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_04_D', 'QUES_OG_003_04', 'LDR', 0, NULL);

  -- Question 5
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_05', 'QZOG03', 5, 'Thuật ngữ ''Edge AI'' nghĩa là gì?', NULL, 'Edge AI', 5, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_05_A', 'QUES_OG_003_05', 'Chạy các thuật toán AI trên máy chủ đám mây cực mạnh', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_05_B', 'QUES_OG_003_05', 'Chạy trực tiếp các mô hình AI trên các thiết bị phần cứng ở biên (thiết bị nhúng)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_05_C', 'QUES_OG_003_05', 'Sử dụng AI để thiết kế vỏ thiết bị', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_05_D', 'QUES_OG_003_05', 'Một thuật toán AI chuyên vẽ đồ họa đường biên', 0, NULL);

  -- Question 6
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_06', 'QZOG03', 5, 'Trong thiết kế mạch điện tử, ''PCB'' viết tắt của từ gì?', NULL, 'Mạch in', 6, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_06_A', 'QUES_OG_003_06', 'Printed Circuit Board', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_06_B', 'QUES_OG_003_06', 'Personal Computer Board', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_06_C', 'QUES_OG_003_06', 'Power Circuit Breaker', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_06_D', 'QUES_OG_003_06', 'Parallel Control Bus', 0, NULL);

  -- Question 7
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_07', 'QZOG03', 5, 'Linh kiện bán dẫn nào chỉ cho dòng điện đi qua theo một chiều duy nhất?', NULL, 'Linh kiện', 7, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_07_A', 'QUES_OG_003_07', 'Điện trở', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_07_B', 'QUES_OG_003_07', 'Tụ điện', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_07_C', 'QUES_OG_003_07', 'Diode', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_07_D', 'QUES_OG_003_07', 'Cuộn cảm', 0, NULL);

  -- Question 8
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_08', 'QZOG03', 5, 'Trong lập trình Arduino, hàm setup() chạy bao nhiêu lần khi thiết bị khởi động?', NULL, 'Arduino', 8, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_08_A', 'QUES_OG_003_08', 'Chạy lặp đi lặp lại vô hạn', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_08_B', 'QUES_OG_003_08', 'Chạy đúng 1 lần', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_08_C', 'QUES_OG_003_08', 'Chạy 2 lần', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_08_D', 'QUES_OG_003_08', 'Không chạy lần nào', 0, NULL);

  -- Question 9
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_09', 'QZOG03', 5, 'Cảm biến siêu âm HC-SR04 đo khoảng cách bằng cách nào?', NULL, 'Cảm biến siêu âm', 9, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_09_A', 'QUES_OG_003_09', 'Phát tia hồng ngoại', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_09_B', 'QUES_OG_003_09', 'Phát sóng siêu âm và đo thời gian sóng phản hồi lại', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_09_C', 'QUES_OG_003_09', 'Đo cường độ ánh sáng', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_09_D', 'QUES_OG_003_09', 'Cảm ứng từ trường', 0, NULL);

  -- Question 10
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_10', 'QZOG03', 5, 'Động cơ nào sau đây cho phép điều khiển chính xác góc quay (thường dùng trong cánh tay Robot)?', NULL, 'Robotics', 10, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_10_A', 'QUES_OG_003_10', 'Động cơ DC thường', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_10_B', 'QUES_OG_003_10', 'Động cơ Servo', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_10_C', 'QUES_OG_003_10', 'Động cơ xoay chiều AC', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_10_D', 'QUES_OG_003_10', 'Động cơ phản lực', 0, NULL);

  -- Question 11
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_11', 'QZOG03', 5, 'Chức năng chính của Tụ điện trong mạch lọc nguồn điện là gì?', NULL, 'Điện tử cơ bản', 11, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_11_A', 'QUES_OG_003_11', 'Cản trở dòng điện xoay chiều', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_11_B', 'QUES_OG_003_11', 'Tích trữ điện năng và san phẳng điện áp một chiều nhấp nhô', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_11_C', 'QUES_OG_003_11', 'Khuếch đại tín hiệu điện áp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_11_D', 'QUES_OG_003_11', 'Phát sáng khi có dòng điện đi qua', 0, NULL);

  -- Question 12
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_12', 'QZOG03', 5, 'Giao tiếp I2C sử dụng mấy đường dây tín hiệu chính để truyền nhận dữ liệu?', NULL, 'Giao tiếp I2C', 12, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_12_A', 'QUES_OG_003_12', '1 đường dây', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_12_B', 'QUES_OG_003_12', '2 đường dây (SDA và SCL)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_12_C', 'QUES_OG_003_12', '4 đường dây', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_12_D', 'QUES_OG_003_12', '8 đường dây', 0, NULL);

  -- Question 13
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_13', 'QZOG03', 5, 'Trong IoT, công nghệ truyền thông không dây LoRa (Long Range) có đặc điểm nổi bật nào?', NULL, 'LoRa', 13, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_13_A', 'QUES_OG_003_13', 'Khoảng cách truyền rất xa, tiêu thụ năng lượng thấp, tốc độ truyền dữ liệu thấp', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_13_B', 'QUES_OG_003_13', 'Tốc độ truyền cực kỳ cao, khoảng cách ngắn', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_13_C', 'QUES_OG_003_13', 'Tiêu thụ năng lượng rất cao, khoảng cách trung bình', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_13_D', 'QUES_OG_003_13', 'Chỉ truyền được trong phòng kín', 0, NULL);

  -- Question 14
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_14', 'QZOG03', 5, 'Linh kiện nào dùng để khuếch đại dòng điện hoặc đóng cắt mạch điện như một khóa điện tử?', NULL, 'Transistor', 14, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_14_A', 'QUES_OG_003_14', 'Transistor', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_14_B', 'QUES_OG_003_14', 'Điện trở nhiệt', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_14_C', 'QUES_OG_003_14', 'Biến áp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_14_D', 'QUES_OG_003_14', 'Cầu chì', 0, NULL);

  -- Question 15
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_15', 'QZOG03', 5, 'Hệ điều hành mã nguồn mở nào rất phổ biến được dùng trên máy tính nhúng Raspberry Pi?', NULL, 'Raspberry Pi', 15, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_15_A', 'QUES_OG_003_15', 'Windows 11', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_15_B', 'QUES_OG_003_15', 'Linux (Raspbian/Raspberry Pi OS)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_15_C', 'QUES_OG_003_15', 'macOS', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_15_D', 'QUES_OG_003_15', 'Android', 0, NULL);

  -- Question 16
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_16', 'QZOG03', 5, 'Gateway trong kiến trúc hệ thống IoT đóng vai trò gì?', NULL, 'Gateway', 16, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_16_A', 'QUES_OG_003_16', 'Cung cấp nguồn điện cho các cảm biến', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_16_B', 'QUES_OG_003_16', 'Trung chuyển và chuyển đổi giao thức truyền thông giữa mạng cảm biến biên và đám mây', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_16_C', 'QUES_OG_003_16', 'Hiển thị dữ liệu lên màn hình LCD', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_16_D', 'QUES_OG_003_16', 'Đo nhiệt độ môi trường', 0, NULL);

  -- Question 17
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_17', 'QZOG03', 5, 'Cảm biến LDR (Light Dependent Resistor) thay đổi điện trở theo yếu tố nào?', NULL, 'LDR', 17, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_17_A', 'QUES_OG_003_17', 'Nhiệt độ', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_17_B', 'QUES_OG_003_17', 'Cường độ ánh sáng', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_17_C', 'QUES_OG_003_17', 'Độ ẩm không khí', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_17_D', 'QUES_OG_003_17', 'Áp suất khí quyển', 0, NULL);

  -- Question 18
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_18', 'QZOG03', 5, 'Trong lập trình vi điều khiển, ''ADC'' (Analog-to-Digital Converter) dùng để làm gì?', NULL, 'ADC', 18, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_18_A', 'QUES_OG_003_18', 'Chuyển tín hiệu số thành tín hiệu tương tự', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_18_B', 'QUES_OG_003_18', 'Chuyển tín hiệu tương tự (điện áp liên tục) thành tín hiệu số', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_18_C', 'QUES_OG_003_18', 'Tăng điện áp nguồn cấp', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_18_D', 'QUES_OG_003_18', 'Đo tần số sóng wifi', 0, NULL);

  -- Question 19
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_19', 'QZOG03', 5, 'Để lập trình cho robot tự hành dò đường (Line Follower Robot), người ta thường dùng loại cảm biến nào?', NULL, 'Robotics cảm biến', 19, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_19_A', 'QUES_OG_003_19', 'Cảm biến hồng ngoại (IR Sensor) để nhận biết vạch đen/trắng', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_19_B', 'QUES_OG_003_19', 'Cảm biến khí gas', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_19_C', 'QUES_OG_003_19', 'Cảm biến gia tốc IMU', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_19_D', 'QUES_OG_003_19', 'Cảm biến dòng điện', 0, NULL);

  -- Question 20
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('QUES_OG_003_20', 'QZOG03', 5, 'Chu kỳ nhiệm vụ (Duty Cycle) là khái niệm thuộc phương pháp điều chế nào thường dùng để điều khiển tốc độ động cơ DC?', NULL, 'Robotics', 20, 60, 'MULTIPLE_CHOICE');

    -- Options for Question
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_20_A', 'QUES_OG_003_20', 'AM (Điều chế biên độ)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_20_B', 'QUES_OG_003_20', 'PWM (Điều chế độ rộng xung)', 1, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_20_C', 'QUES_OG_003_20', 'FM (Điều chế tần số)', 0, NULL);
    INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
    VALUES ('OPT_OG_003_20_D', 'QUES_OG_003_20', 'PCM (Điều chế mã xung)', 0, NULL);


-- 12. Insert 1 Survey per Event with 10 Questions each
-- Survey for EVT_ONGOING_001
INSERT INTO event_surveys (id, event_id, created_at, description, is_published, title) 
VALUES ('SRV_OG_001', 'EVT_ONGOING_001', NOW(), 'Chúng tôi rất mong nhận được những phản hồi quý báu từ bạn để cải thiện chất lượng các hội thảo tiếp theo.', 1, 'Khảo sát ý kiến về Hội thảo Phát triển Kỹ năng Mềm');

  -- Question 1
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_01', 'SRV_OG_001', 1, NULL, 0, 'Bạn đánh giá thế nào về chất lượng tổng thể của hội thảo?', 'RATING');
  -- Question 2
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_02', 'SRV_OG_001', 1, 'Kỹ năng giao tiếp và tạo lập mối quan hệ|Làm việc nhóm và Quản lý thời gian|Nghệ thuật thuyết trình và Tư duy phản biện', 1, 'Phiên thảo luận nào mang lại nhiều giá trị nhất cho bạn?', 'MULTIPLE_CHOICE');
  -- Question 3
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_03', 'SRV_OG_001', 1, NULL, 2, 'Nội dung chia sẻ của các diễn giả có dễ hiểu và thiết thực không?', 'RATING');
  -- Question 4
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_04', 'SRV_OG_001', 1, NULL, 3, 'Thời lượng của chương trình và phân bổ các phiên thảo luận như thế nào?', 'RATING');
  -- Question 5
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_05', 'SRV_OG_001', 1, 'Rất chu đáo và chuyên nghiệp|Tốt nhưng cần cải thiện một số khâu|Bình thường|Chưa đạt yêu cầu', 4, 'Bạn đánh giá thế nào về công tác tổ chức và hỗ trợ từ Ban tổ chức?', 'MULTIPLE_CHOICE');
  -- Question 6
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_06', 'SRV_OG_001', 1, NULL, 5, 'Cơ sở vật chất, âm thanh, ánh sáng tại hội trường chính A1 như thế nào?', 'RATING');
  -- Question 7
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_07', 'SRV_OG_001', 1, 'Chắc chắn tham gia|Có thể tham gia nếu sắp xếp được thời gian|Không tham gia', 6, 'Bạn có muốn tiếp tục tham gia các buổi chia sẻ chuyên đề tương tự không?', 'MULTIPLE_CHOICE');
  -- Question 8
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_08', 'SRV_OG_001', 1, 'Fanpage câu lạc bộ/trường|Bạn bè giới thiệu|Email từ ban tổ chức|Bảng tin hoặc tờ rơi', 7, 'Kênh thông tin nào đã giúp bạn biết đến hội thảo này?', 'MULTIPLE_CHOICE');
  -- Question 9
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_09', 'SRV_OG_001', 0, NULL, 8, 'Diễn giả nào để lại cho bạn ấn tượng sâu sắc nhất và vì sao?', 'TEXT');
  -- Question 10
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_001_10', 'SRV_OG_001', 0, NULL, 9, 'Hãy chia sẻ ý kiến đóng góp hoặc đề xuất chuyên đề bạn mong muốn xuất hiện trong tương lai:', 'TEXT');

-- Survey for EVT_ONGOING_002
INSERT INTO event_surveys (id, event_id, created_at, description, is_published, title) 
VALUES ('SRV_OG_002', 'EVT_ONGOING_002', NOW(), 'Khảo sát nhằm ghi nhận ý kiến của thí sinh về công tác tổ chức, đề thi và hỗ trợ kỹ thuật tại cuộc thi.', 1, 'Khảo sát phản hồi về Giải vô địch Tin học văn phòng');

  -- Question 1
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_01', 'SRV_OG_002', 1, NULL, 0, 'Bạn đánh giá thế nào về công tác chuẩn bị phòng máy và trang thiết bị thi?', 'RATING');
  -- Question 2
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_02', 'SRV_OG_002', 1, 'Kỹ năng soạn thảo văn bản Word nâng cao|Xử lý dữ liệu Excel|Trình diễn PowerPoint chuyên nghiệp', 1, 'Phần thi nào bạn cảm thấy độ khó cao nhất?', 'MULTIPLE_CHOICE');
  -- Question 3
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_03', 'SRV_OG_002', 1, NULL, 2, 'Độ khó của đề thi năm nay có phù hợp với năng lực sinh viên không?', 'RATING');
  -- Question 4
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_04', 'SRV_OG_002', 1, NULL, 3, 'Thời gian làm bài cho mỗi phần thi (60 phút) có hợp lý không?', 'RATING');
  -- Question 5
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_05', 'SRV_OG_002', 1, NULL, 4, 'Quy chế phòng thi và sự hỗ trợ từ giám thị phòng máy như thế nào?', 'RATING');
  -- Question 6
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_06', 'SRV_OG_002', 1, 'Thiếu thời gian làm bài|Máy tính/phần mềm gặp sự cố|Đề thi quá khó|Không gặp khó khăn nào', 5, 'Bạn gặp khó khăn gì lớn nhất trong quá trình làm bài thi thực hành?', 'MULTIPLE_CHOICE');
  -- Question 7
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_07', 'SRV_OG_002', 1, NULL, 6, 'Lễ trao giải và công bố kết quả có được tổ chức trang trọng, công bằng không?', 'RATING');
  -- Question 8
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_08', 'SRV_OG_002', 1, 'Thử sức bản thân|Lấy chứng nhận cộng điểm rèn luyện|Giành giải thưởng|Giao lưu học hỏi', 7, 'Mục đích lớn nhất khi bạn đăng ký tham gia cuộc thi này là gì?', 'MULTIPLE_CHOICE');
  -- Question 9
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_09', 'SRV_OG_002', 0, NULL, 8, 'Theo bạn, đề thi hoặc cách thức tổ chức thi cần cải tiến điểm gì nhất?', 'TEXT');
  -- Question 10
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_002_10', 'SRV_OG_002', 0, NULL, 9, 'Góp ý khác dành cho ban tổ chức cuộc thi:', 'TEXT');

-- Survey for EVT_ONGOING_003
INSERT INTO event_surveys (id, event_id, created_at, description, is_published, title) 
VALUES ('SRV_OG_003', 'EVT_ONGOING_003', NOW(), 'Ý kiến đóng góp của quý thầy cô và các bạn sinh viên sẽ giúp nâng cao chất lượng học thuật cho các kỳ seminar tiếp theo.', 1, 'Khảo sát ý kiến phản hồi về Seminar Nghiên cứu Khoa học Điện tử');

  -- Question 1
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_01', 'SRV_OG_003', 1, NULL, 0, 'Bạn đánh giá thế nào về hàm lượng khoa học của các đề tài báo cáo tại seminar?', 'RATING');
  -- Question 2
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_02', 'SRV_OG_003', 1, 'IoT và Hệ thống nhúng thế hệ mới|Ứng dụng Edge AI và Robotics|Thiết bị y tế và cảm biến thông minh', 1, 'Chủ đề nghiên cứu nào bạn quan tâm nhiều nhất trong seminar?', 'MULTIPLE_CHOICE');
  -- Question 3
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_03', 'SRV_OG_003', 1, NULL, 2, 'Kỹ năng thuyết trình và chuẩn bị slide của các nhóm sinh viên báo cáo như thế nào?', 'RATING');
  -- Question 4
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_04', 'SRV_OG_003', 1, NULL, 3, 'Ý kiến nhận xét và câu hỏi phản biện từ Hội đồng chuyên môn có giúp ích nhiều không?', 'RATING');
  -- Question 5
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_05', 'SRV_OG_003', 1, NULL, 4, 'Khu vực triển lãm và chạy thử nghiệm sản phẩm thực tế có hấp dẫn bạn không?', 'RATING');
  -- Question 6
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_06', 'SRV_OG_003', 1, 'Quá ngắn, cần nhiều thời gian hỏi đáp hơn|Vừa đủ để trao đổi|Hơi dài dòng', 5, 'Bạn thấy thời gian dành cho phần thảo luận và đặt câu hỏi ở mỗi phiên thế nào?', 'MULTIPLE_CHOICE');
  -- Question 7
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_07', 'SRV_OG_003', 1, NULL, 6, 'Khâu tiếp đón, chuẩn bị nước uống và tài liệu học thuật cho người tham dự như thế nào?', 'RATING');
  -- Question 8
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_08', 'SRV_OG_003', 1, 'Chắc chắn có và đang chuẩn bị ý tưởng|Có thể tham gia nếu tìm được giảng viên hướng dẫn|Chưa có ý định|Chỉ tham dự học hỏi', 7, 'Sau buổi seminar này, bạn có ý định tham gia nghiên cứu khoa học tại khoa Điện tử không?', 'MULTIPLE_CHOICE');
  -- Question 9
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_09', 'SRV_OG_003', 0, NULL, 8, 'Đề tài báo cáo hoặc sản phẩm triển lãm nào khiến bạn cảm thấy ấn tượng nhất? Vì sao?', 'TEXT');
  -- Question 10
  INSERT INTO survey_questions (id, survey_id, is_required, options, order_index, question_text, type) 
  VALUES ('SQ_OG_003_10', 'SRV_OG_003', 0, NULL, 9, 'Quý thầy cô/Các bạn sinh viên có đề xuất gì để thúc đẩy phong trào nghiên cứu khoa học của khoa Điện tử phát triển hơn?', 'TEXT');


-- 13. Insert Mock Survey Responses (10 per survey)
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('a2f0f94b-330d-49e2-9b4d-efe102c8f8e4', '{"SQ_OG_001_01": {"rating": 5, "reason": "Hội thảo rất bổ ích, giúp ích nhiều cho việc làm việc nhóm."}, "SQ_OG_001_02": "Kỹ năng giao tiếp và tạo lập mối quan hệ", "SQ_OG_001_03": {"rating": 4, "reason": "Nội dung hay nhưng thời gian thảo luận hơi ngắn."}, "SQ_OG_001_04": {"rating": 5, "reason": "Tuyệt vời! Em học được cách quản lý thời gian hiệu quả."}, "SQ_OG_001_05": "Rất chu đáo và chuyên nghiệp", "SQ_OG_001_06": {"rating": 4, "reason": "Rất tốt, cảm ơn các thầy cô nhiều."}, "SQ_OG_001_07": "Chắc chắn tham gia", "SQ_OG_001_08": "Fanpage câu lạc bộ/trường"}', 'USE016', DATE_SUB(NOW(), INTERVAL 0 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('bd3e6405-ea92-430c-886d-4f62df151b89', '{"SQ_OG_002_01": {"rating": 5, "reason": "Phòng máy chạy rất tốt, phần mềm đầy đủ."}, "SQ_OG_002_02": "Kỹ năng soạn thảo văn bản Word nâng cao", "SQ_OG_002_03": {"rating": 4, "reason": "Thời gian 60 phút cho Excel hơi ngắn, nhưng chấp nhận được."}, "SQ_OG_002_04": {"rating": 3, "reason": "Đề thi hơi dài, em không kịp làm xong phần PowerPoint."}, "SQ_OG_002_05": {"rating": 4, "reason": "Công bố kết quả nhanh và lễ trao giải rất trang trọng."}, "SQ_OG_002_06": "Thiếu thời gian làm bài", "SQ_OG_002_07": {"rating": 5, "reason": "Em đã học hỏi được rất nhiều từ cuộc thi."}, "SQ_OG_002_08": "Thử sức bản thân"}', 'USE016', DATE_SUB(NOW(), INTERVAL 0 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('bd64df1a-f1be-4c5b-81fb-d6547f7679d2', '{"SQ_OG_003_01": {"rating": 5, "reason": "Hàm lượng khoa học của các đề tài rất cao."}, "SQ_OG_003_02": "IoT và Hệ thống nhúng thế hệ mới", "SQ_OG_003_03": {"rating": 4, "reason": "Slide thuyết trình đẹp, sinh viên tự tin."}, "SQ_OG_003_04": {"rating": 3, "reason": "Thời gian hỏi đáp hơi ít, muốn thảo luận nhiều hơn."}, "SQ_OG_003_05": {"rating": 4, "reason": "Khơi dậy được đam mê nghiên cứu khoa học cho em."}, "SQ_OG_003_06": "Quá ngắn, cần nhiều thời gian hỏi đáp hơn", "SQ_OG_003_07": {"rating": 4, "reason": "Học hỏi được nhiều kinh nghiệm làm mạch và viết báo cáo."}, "SQ_OG_003_08": "Chắc chắn có và đang chuẩn bị ý tưởng"}', 'USE016', DATE_SUB(NOW(), INTERVAL 0 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('b35fa5ec-964b-42ed-8a6c-172bab909f32', '{"SQ_OG_001_01": {"rating": 5, "reason": "Diễn giả chia sẻ cực kỳ lôi cuốn và nhiệt huyết."}, "SQ_OG_001_02": "Làm việc nhóm và Quản lý thời gian", "SQ_OG_001_03": {"rating": 4, "reason": "Ban tổ chức chuẩn bị chu đáo, hội trường đẹp."}, "SQ_OG_001_04": {"rating": 3, "reason": "Bình thường, em thấy lý thuyết hơi nhiều."}, "SQ_OG_001_05": "Tốt nhưng cần cải thiện một số khâu", "SQ_OG_001_06": {"rating": 5, "reason": "Buổi chia sẻ ý nghĩa, mong trường tổ chức thêm."}, "SQ_OG_001_07": "Có thể tham gia nếu sắp xếp được thời gian", "SQ_OG_001_08": "Bạn bè giới thiệu", "SQ_OG_001_09": "Thầy Quang với phong thái đĩnh đạc và câu chuyện truyền cảm hứng.", "SQ_OG_001_10": "Cần nhiều thời gian hơn cho phần hỏi đáp trực tiếp."}', 'USE017', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('3d7d9a12-e47a-4dac-9093-37b109f06440', '{"SQ_OG_002_01": {"rating": 4, "reason": "Đề thi năm nay khá thử thách nhưng rất thực tế."}, "SQ_OG_002_02": "Xử lý dữ liệu Excel", "SQ_OG_002_03": {"rating": 5, "reason": "Giám thị thân thiện và hướng dẫn quy chế rõ ràng."}, "SQ_OG_002_04": {"rating": 5, "reason": "Cuộc thi được tổ chức chuyên nghiệp và nghiêm túc."}, "SQ_OG_002_05": {"rating": 4, "reason": "Thử thách rất tốt cho kỹ năng văn phòng của em."}, "SQ_OG_002_06": "Không gặp khó khăn nào", "SQ_OG_002_07": {"rating": 5, "reason": "Rất hài lòng với công tác chuẩn bị của CLB."}, "SQ_OG_002_08": "Lấy chứng nhận cộng điểm rèn luyện", "SQ_OG_002_09": "Đề nghị bổ sung thêm hướng dẫn giải chi tiết sau cuộc thi.", "SQ_OG_002_10": "Mong cuộc thi sẽ được duy trì thường niên."}', 'USE017', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('083256a0-19e0-40ef-ae9f-525aa298f62c', '{"SQ_OG_003_01": {"rating": 5, "reason": "Các sản phẩm triển lãm chạy thực tế rất ấn tượng."}, "SQ_OG_003_02": "Ứng dụng Edge AI và Robotics", "SQ_OG_003_03": {"rating": 4, "reason": "Hội đồng phản biện rất chuyên sâu và đưa ra nhiều góp ý quý báu."}, "SQ_OG_003_04": {"rating": 5, "reason": "Tiếp đón chu đáo, nước uống đầy đủ."}, "SQ_OG_003_05": {"rating": 5, "reason": "Seminar rất chất lượng, các đề tài có tính ứng dụng cao."}, "SQ_OG_003_06": "Vừa đủ để trao đổi", "SQ_OG_003_07": {"rating": 5, "reason": "Rất thích khu triển lãm robot và xe tự hành."}, "SQ_OG_003_08": "Có thể tham gia nếu tìm được giảng viên hướng dẫn", "SQ_OG_003_09": "Mô hình giám sát nông nghiệp thông minh vì tính thực tiễn cao.", "SQ_OG_003_10": "Nên kết nối với các doanh nghiệp để thương mại hóa sản phẩm."}', 'USE017', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('09aaf9c8-600c-4c14-bde5-76df0c15a204', '{"SQ_OG_001_01": {"rating": 4, "reason": "Nội dung hay nhưng thời gian thảo luận hơi ngắn."}, "SQ_OG_001_02": "Nghệ thuật thuyết trình và Tư duy phản biện", "SQ_OG_001_03": {"rating": 5, "reason": "Tuyệt vời! Em học được cách quản lý thời gian hiệu quả."}, "SQ_OG_001_04": {"rating": 4, "reason": "Rất tốt, cảm ơn các thầy cô nhiều."}, "SQ_OG_001_05": "Bình thường", "SQ_OG_001_06": {"rating": 4, "reason": "Diễn giả rất giỏi, tổ chức chuyên nghiệp."}, "SQ_OG_001_07": "Chắc chắn tham gia", "SQ_OG_001_08": "Email từ ban tổ chức", "SQ_OG_001_09": "Cô Linh với các bài tập tình huống thực tế cực kỳ vui nhộn.", "SQ_OG_001_10": "Chuyên đề quản lý tài chính cá nhân cho sinh viên."}', 'USE018', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('9e3bdb68-61d5-4156-88ad-34e8fec4bc24', '{"SQ_OG_002_01": {"rating": 4, "reason": "Thời gian 60 phút cho Excel hơi ngắn, nhưng chấp nhận được."}, "SQ_OG_002_02": "Trình diễn PowerPoint chuyên nghiệp", "SQ_OG_002_03": {"rating": 3, "reason": "Đề thi hơi dài, em không kịp làm xong phần PowerPoint."}, "SQ_OG_002_04": {"rating": 4, "reason": "Công bố kết quả nhanh và lễ trao giải rất trang trọng."}, "SQ_OG_002_05": {"rating": 5, "reason": "Em đã học hỏi được rất nhiều từ cuộc thi."}, "SQ_OG_002_06": "Đề thi quá khó", "SQ_OG_002_07": {"rating": 5, "reason": "Phòng máy chạy rất tốt, phần mềm đầy đủ."}, "SQ_OG_002_08": "Giao lưu học hỏi", "SQ_OG_002_09": "Không cần cải tiến gì, đề thi đã rất hay.", "SQ_OG_002_10": "Giải thưởng nên đa dạng hơn cho các bạn đạt giải khuyến khích."}', 'USE018', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('b3ed19b0-fe34-4f88-a759-96a511fcaecc', '{"SQ_OG_003_01": {"rating": 4, "reason": "Slide thuyết trình đẹp, sinh viên tự tin."}, "SQ_OG_003_02": "Thiết bị y tế và cảm biến thông minh", "SQ_OG_003_03": {"rating": 3, "reason": "Thời gian hỏi đáp hơi ít, muốn thảo luận nhiều hơn."}, "SQ_OG_003_04": {"rating": 4, "reason": "Khơi dậy được đam mê nghiên cứu khoa học cho em."}, "SQ_OG_003_05": {"rating": 4, "reason": "Học hỏi được nhiều kinh nghiệm làm mạch và viết báo cáo."}, "SQ_OG_003_06": "Quá ngắn, cần nhiều thời gian hỏi đáp hơn", "SQ_OG_003_07": {"rating": 5, "reason": "Hàm lượng khoa học của các đề tài rất cao."}, "SQ_OG_003_08": "Chỉ tham dự học hỏi", "SQ_OG_003_09": "Robot cộng tác công nghiệp, chế tạo rất chuyên nghiệp.", "SQ_OG_003_10": "Tổ chức thêm các workshop định hướng đề tài nghiên cứu."}', 'USE018', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('ecc95003-b464-4e39-a3e0-9385beebcd4f', '{"SQ_OG_001_01": {"rating": 4, "reason": "Ban tổ chức chuẩn bị chu đáo, hội trường đẹp."}, "SQ_OG_001_02": "Kỹ năng giao tiếp và tạo lập mối quan hệ", "SQ_OG_001_03": {"rating": 3, "reason": "Bình thường, em thấy lý thuyết hơi nhiều."}, "SQ_OG_001_04": {"rating": 5, "reason": "Buổi chia sẻ ý nghĩa, mong trường tổ chức thêm."}, "SQ_OG_001_05": "Rất chu đáo và chuyên nghiệp", "SQ_OG_001_06": {"rating": 5, "reason": "Thực sự hữu ích cho sinh viên năm cuối."}, "SQ_OG_001_07": "Có thể tham gia nếu sắp xếp được thời gian", "SQ_OG_001_08": "Fanpage câu lạc bộ/trường", "SQ_OG_001_09": "Cả ba thầy cô đều để lại ấn tượng tốt.", "SQ_OG_001_10": "Không có đóng góp gì thêm, chương trình đã rất tuyệt vời."}', 'USE019', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('c5f9a91d-8c74-4d5f-8c15-a4aa2f57c132', '{"SQ_OG_002_01": {"rating": 5, "reason": "Giám thị thân thiện và hướng dẫn quy chế rõ ràng."}, "SQ_OG_002_02": "Kỹ năng soạn thảo văn bản Word nâng cao", "SQ_OG_002_03": {"rating": 5, "reason": "Cuộc thi được tổ chức chuyên nghiệp và nghiêm túc."}, "SQ_OG_002_04": {"rating": 4, "reason": "Thử thách rất tốt cho kỹ năng văn phòng của em."}, "SQ_OG_002_05": {"rating": 5, "reason": "Rất hài lòng với công tác chuẩn bị của CLB."}, "SQ_OG_002_06": "Thiếu thời gian làm bài", "SQ_OG_002_07": {"rating": 4, "reason": "Đề thi năm nay khá thử thách nhưng rất thực tế."}, "SQ_OG_002_08": "Giành giải thưởng", "SQ_OG_002_09": "Nên nâng cấp phiên bản Office trên máy phòng thực hành lên 2021.", "SQ_OG_002_10": "Rất mong có thêm các khóa ôn luyện trước khi thi."}', 'USE019', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('7d899104-d6e5-48cc-8cb9-d1366c2d0763', '{"SQ_OG_003_01": {"rating": 4, "reason": "Hội đồng phản biện rất chuyên sâu và đưa ra nhiều góp ý quý báu."}, "SQ_OG_003_02": "IoT và Hệ thống nhúng thế hệ mới", "SQ_OG_003_03": {"rating": 5, "reason": "Tiếp đón chu đáo, nước uống đầy đủ."}, "SQ_OG_003_04": {"rating": 5, "reason": "Seminar rất chất lượng, các đề tài có tính ứng dụng cao."}, "SQ_OG_003_05": {"rating": 5, "reason": "Rất thích khu triển lãm robot và xe tự hành."}, "SQ_OG_003_06": "Vừa đủ để trao đổi", "SQ_OG_003_07": {"rating": 5, "reason": "Các sản phẩm triển lãm chạy thực tế rất ấn tượng."}, "SQ_OG_003_08": "Chắc chắn có và đang chuẩn bị ý tưởng", "SQ_OG_003_09": "Nhận diện khuôn mặt trên ESP32-CAM.", "SQ_OG_003_10": "Không có đóng góp gì thêm, buổi seminar rất thành công."}', 'USE019', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('2ba14e98-ef69-4784-b471-ce1e04e6c4ae', '{"SQ_OG_001_01": {"rating": 5, "reason": "Tuyệt vời! Em học được cách quản lý thời gian hiệu quả."}, "SQ_OG_001_02": "Làm việc nhóm và Quản lý thời gian", "SQ_OG_001_03": {"rating": 4, "reason": "Rất tốt, cảm ơn các thầy cô nhiều."}, "SQ_OG_001_04": {"rating": 4, "reason": "Diễn giả rất giỏi, tổ chức chuyên nghiệp."}, "SQ_OG_001_05": "Tốt nhưng cần cải thiện một số khâu", "SQ_OG_001_06": {"rating": 5, "reason": "Hội thảo rất bổ ích, giúp ích nhiều cho việc làm việc nhóm."}, "SQ_OG_001_07": "Chắc chắn tham gia", "SQ_OG_001_08": "Bạn bè giới thiệu", "SQ_OG_001_09": "Em thích nhất phần chia sẻ của cô Ngọc về kỹ năng viết email.", "SQ_OG_001_10": "Mong ban tổ chức cung cấp slide tài liệu sau buổi học."}', 'USE020', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('0ee5351c-f018-4836-b48c-fdcc17627989', '{"SQ_OG_002_01": {"rating": 3, "reason": "Đề thi hơi dài, em không kịp làm xong phần PowerPoint."}, "SQ_OG_002_02": "Xử lý dữ liệu Excel", "SQ_OG_002_03": {"rating": 4, "reason": "Công bố kết quả nhanh và lễ trao giải rất trang trọng."}, "SQ_OG_002_04": {"rating": 5, "reason": "Em đã học hỏi được rất nhiều từ cuộc thi."}, "SQ_OG_002_05": {"rating": 5, "reason": "Phòng máy chạy rất tốt, phần mềm đầy đủ."}, "SQ_OG_002_06": "Không gặp khó khăn nào", "SQ_OG_002_07": {"rating": 4, "reason": "Thời gian 60 phút cho Excel hơi ngắn, nhưng chấp nhận được."}, "SQ_OG_002_08": "Thử sức bản thân", "SQ_OG_002_09": "Các bài tập Excel nên bớt các hàm lồng nhau quá phức tạp.", "SQ_OG_002_10": "Cảm ơn các thầy cô và CLB đã tạo ra sân chơi bổ ích này."}', 'USE020', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('9be1f2f2-c6d0-4ea6-9b37-95bc81d72031', '{"SQ_OG_003_01": {"rating": 3, "reason": "Thời gian hỏi đáp hơi ít, muốn thảo luận nhiều hơn."}, "SQ_OG_003_02": "Ứng dụng Edge AI và Robotics", "SQ_OG_003_03": {"rating": 4, "reason": "Khơi dậy được đam mê nghiên cứu khoa học cho em."}, "SQ_OG_003_04": {"rating": 4, "reason": "Học hỏi được nhiều kinh nghiệm làm mạch và viết báo cáo."}, "SQ_OG_003_05": {"rating": 5, "reason": "Hàm lượng khoa học của các đề tài rất cao."}, "SQ_OG_003_06": "Quá ngắn, cần nhiều thời gian hỏi đáp hơn", "SQ_OG_003_07": {"rating": 4, "reason": "Slide thuyết trình đẹp, sinh viên tự tin."}, "SQ_OG_003_08": "Có thể tham gia nếu tìm được giảng viên hướng dẫn", "SQ_OG_003_09": "Thích nhất mô hình thiết bị y tế đeo tay đo nhịp tim.", "SQ_OG_003_10": "Mong khoa tài trợ thêm kinh phí cho sinh viên làm phần cứng."}', 'USE020', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('6f438f79-a172-4033-b13b-094d820a95e0', '{"SQ_OG_001_01": {"rating": 3, "reason": "Bình thường, em thấy lý thuyết hơi nhiều."}, "SQ_OG_001_02": "Nghệ thuật thuyết trình và Tư duy phản biện", "SQ_OG_001_03": {"rating": 5, "reason": "Buổi chia sẻ ý nghĩa, mong trường tổ chức thêm."}, "SQ_OG_001_04": {"rating": 5, "reason": "Thực sự hữu ích cho sinh viên năm cuối."}, "SQ_OG_001_05": "Bình thường", "SQ_OG_001_06": {"rating": 5, "reason": "Diễn giả chia sẻ cực kỳ lôi cuốn và nhiệt huyết."}, "SQ_OG_001_07": "Có thể tham gia nếu sắp xếp được thời gian", "SQ_OG_001_08": "Email từ ban tổ chức"}', 'USE021', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('4b0a06c0-fb06-4cfb-97e5-fff9483d7d3d', '{"SQ_OG_002_01": {"rating": 5, "reason": "Cuộc thi được tổ chức chuyên nghiệp và nghiêm túc."}, "SQ_OG_002_02": "Trình diễn PowerPoint chuyên nghiệp", "SQ_OG_002_03": {"rating": 4, "reason": "Thử thách rất tốt cho kỹ năng văn phòng của em."}, "SQ_OG_002_04": {"rating": 5, "reason": "Rất hài lòng với công tác chuẩn bị của CLB."}, "SQ_OG_002_05": {"rating": 4, "reason": "Đề thi năm nay khá thử thách nhưng rất thực tế."}, "SQ_OG_002_06": "Đề thi quá khó", "SQ_OG_002_07": {"rating": 5, "reason": "Giám thị thân thiện và hướng dẫn quy chế rõ ràng."}, "SQ_OG_002_08": "Lấy chứng nhận cộng điểm rèn luyện"}', 'USE021', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('7f2ea093-f0bd-4d6b-8817-6a6cb29dde59', '{"SQ_OG_003_01": {"rating": 5, "reason": "Tiếp đón chu đáo, nước uống đầy đủ."}, "SQ_OG_003_02": "Thiết bị y tế và cảm biến thông minh", "SQ_OG_003_03": {"rating": 5, "reason": "Seminar rất chất lượng, các đề tài có tính ứng dụng cao."}, "SQ_OG_003_04": {"rating": 5, "reason": "Rất thích khu triển lãm robot và xe tự hành."}, "SQ_OG_003_05": {"rating": 5, "reason": "Các sản phẩm triển lãm chạy thực tế rất ấn tượng."}, "SQ_OG_003_06": "Vừa đủ để trao đổi", "SQ_OG_003_07": {"rating": 4, "reason": "Hội đồng phản biện rất chuyên sâu và đưa ra nhiều góp ý quý báu."}, "SQ_OG_003_08": "Chỉ tham dự học hỏi"}', 'USE021', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('29fa5d8f-1c9b-4dae-9190-b33fe4fbaa54', '{"SQ_OG_001_01": {"rating": 4, "reason": "Rất tốt, cảm ơn các thầy cô nhiều."}, "SQ_OG_001_02": "Kỹ năng giao tiếp và tạo lập mối quan hệ", "SQ_OG_001_03": {"rating": 4, "reason": "Diễn giả rất giỏi, tổ chức chuyên nghiệp."}, "SQ_OG_001_04": {"rating": 5, "reason": "Hội thảo rất bổ ích, giúp ích nhiều cho việc làm việc nhóm."}, "SQ_OG_001_05": "Rất chu đáo và chuyên nghiệp", "SQ_OG_001_06": {"rating": 4, "reason": "Nội dung hay nhưng thời gian thảo luận hơi ngắn."}, "SQ_OG_001_07": "Chắc chắn tham gia", "SQ_OG_001_08": "Fanpage câu lạc bộ/trường", "SQ_OG_001_09": "Cô Ngọc vì cô giảng rất dễ thương và thực tế.", "SQ_OG_001_10": "Mong muốn ban tổ chức chia sẻ thêm về kỹ năng viết CV và phỏng vấn."}', 'USE022', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('14b17674-3049-42ad-a80f-a554c4bbea97', '{"SQ_OG_002_01": {"rating": 4, "reason": "Công bố kết quả nhanh và lễ trao giải rất trang trọng."}, "SQ_OG_002_02": "Kỹ năng soạn thảo văn bản Word nâng cao", "SQ_OG_002_03": {"rating": 5, "reason": "Em đã học hỏi được rất nhiều từ cuộc thi."}, "SQ_OG_002_04": {"rating": 5, "reason": "Phòng máy chạy rất tốt, phần mềm đầy đủ."}, "SQ_OG_002_05": {"rating": 4, "reason": "Thời gian 60 phút cho Excel hơi ngắn, nhưng chấp nhận được."}, "SQ_OG_002_06": "Thiếu thời gian làm bài", "SQ_OG_002_07": {"rating": 3, "reason": "Đề thi hơi dài, em không kịp làm xong phần PowerPoint."}, "SQ_OG_002_08": "Giao lưu học hỏi", "SQ_OG_002_09": "Nên tăng thời gian thi Excel lên 75 phút.", "SQ_OG_002_10": "Giải thưởng nên đa dạng hơn cho các bạn đạt giải khuyến khích."}', 'USE022', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('be6f9a33-fad4-4d88-ae99-d70bf2f4ea81', '{"SQ_OG_003_01": {"rating": 4, "reason": "Khơi dậy được đam mê nghiên cứu khoa học cho em."}, "SQ_OG_003_02": "IoT và Hệ thống nhúng thế hệ mới", "SQ_OG_003_03": {"rating": 4, "reason": "Học hỏi được nhiều kinh nghiệm làm mạch và viết báo cáo."}, "SQ_OG_003_04": {"rating": 5, "reason": "Hàm lượng khoa học của các đề tài rất cao."}, "SQ_OG_003_05": {"rating": 4, "reason": "Slide thuyết trình đẹp, sinh viên tự tin."}, "SQ_OG_003_06": "Quá ngắn, cần nhiều thời gian hỏi đáp hơn", "SQ_OG_003_07": {"rating": 3, "reason": "Thời gian hỏi đáp hơi ít, muốn thảo luận nhiều hơn."}, "SQ_OG_003_08": "Chắc chắn có và đang chuẩn bị ý tưởng", "SQ_OG_003_09": "Mô hình giám sát nông nghiệp thông minh vì tính thực tiễn cao.", "SQ_OG_003_10": "Tổ chức thêm các workshop định hướng đề tài nghiên cứu."}', 'USE022', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('e797aa44-dc54-47ab-8d86-4d225845a927', '{"SQ_OG_001_01": {"rating": 5, "reason": "Buổi chia sẻ ý nghĩa, mong trường tổ chức thêm."}, "SQ_OG_001_02": "Làm việc nhóm và Quản lý thời gian", "SQ_OG_001_03": {"rating": 5, "reason": "Thực sự hữu ích cho sinh viên năm cuối."}, "SQ_OG_001_04": {"rating": 5, "reason": "Diễn giả chia sẻ cực kỳ lôi cuốn và nhiệt huyết."}, "SQ_OG_001_05": "Tốt nhưng cần cải thiện một số khâu", "SQ_OG_001_06": {"rating": 4, "reason": "Ban tổ chức chuẩn bị chu đáo, hội trường đẹp."}, "SQ_OG_001_07": "Có thể tham gia nếu sắp xếp được thời gian", "SQ_OG_001_08": "Bạn bè giới thiệu", "SQ_OG_001_09": "Thầy Quang với phong thái đĩnh đạc và câu chuyện truyền cảm hứng.", "SQ_OG_001_10": "Cần nhiều thời gian hơn cho phần hỏi đáp trực tiếp."}', 'USE023', DATE_SUB(NOW(), INTERVAL 7 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('dc6abb6c-0f30-4c8c-a16e-5eb38d29bee1', '{"SQ_OG_002_01": {"rating": 4, "reason": "Thử thách rất tốt cho kỹ năng văn phòng của em."}, "SQ_OG_002_02": "Xử lý dữ liệu Excel", "SQ_OG_002_03": {"rating": 5, "reason": "Rất hài lòng với công tác chuẩn bị của CLB."}, "SQ_OG_002_04": {"rating": 4, "reason": "Đề thi năm nay khá thử thách nhưng rất thực tế."}, "SQ_OG_002_05": {"rating": 5, "reason": "Giám thị thân thiện và hướng dẫn quy chế rõ ràng."}, "SQ_OG_002_06": "Không gặp khó khăn nào", "SQ_OG_002_07": {"rating": 5, "reason": "Cuộc thi được tổ chức chuyên nghiệp và nghiêm túc."}, "SQ_OG_002_08": "Giành giải thưởng", "SQ_OG_002_09": "Đề nghị bổ sung thêm hướng dẫn giải chi tiết sau cuộc thi.", "SQ_OG_002_10": "Rất mong có thêm các khóa ôn luyện trước khi thi."}', 'USE023', DATE_SUB(NOW(), INTERVAL 7 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('13c69347-2eda-42ae-99f1-793769d80ed6', '{"SQ_OG_003_01": {"rating": 5, "reason": "Seminar rất chất lượng, các đề tài có tính ứng dụng cao."}, "SQ_OG_003_02": "Ứng dụng Edge AI và Robotics", "SQ_OG_003_03": {"rating": 5, "reason": "Rất thích khu triển lãm robot và xe tự hành."}, "SQ_OG_003_04": {"rating": 5, "reason": "Các sản phẩm triển lãm chạy thực tế rất ấn tượng."}, "SQ_OG_003_05": {"rating": 4, "reason": "Hội đồng phản biện rất chuyên sâu và đưa ra nhiều góp ý quý báu."}, "SQ_OG_003_06": "Vừa đủ để trao đổi", "SQ_OG_003_07": {"rating": 5, "reason": "Tiếp đón chu đáo, nước uống đầy đủ."}, "SQ_OG_003_08": "Có thể tham gia nếu tìm được giảng viên hướng dẫn", "SQ_OG_003_09": "Robot cộng tác công nghiệp, chế tạo rất chuyên nghiệp.", "SQ_OG_003_10": "Không có đóng góp gì thêm, buổi seminar rất thành công."}', 'USE023', DATE_SUB(NOW(), INTERVAL 7 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('ca27b0e1-5ffb-414d-8f24-6dd8653b12b8', '{"SQ_OG_001_01": {"rating": 4, "reason": "Diễn giả rất giỏi, tổ chức chuyên nghiệp."}, "SQ_OG_001_02": "Nghệ thuật thuyết trình và Tư duy phản biện", "SQ_OG_001_03": {"rating": 5, "reason": "Hội thảo rất bổ ích, giúp ích nhiều cho việc làm việc nhóm."}, "SQ_OG_001_04": {"rating": 4, "reason": "Nội dung hay nhưng thời gian thảo luận hơi ngắn."}, "SQ_OG_001_05": "Bình thường", "SQ_OG_001_06": {"rating": 5, "reason": "Tuyệt vời! Em học được cách quản lý thời gian hiệu quả."}, "SQ_OG_001_07": "Chắc chắn tham gia", "SQ_OG_001_08": "Email từ ban tổ chức", "SQ_OG_001_09": "Cô Linh với các bài tập tình huống thực tế cực kỳ vui nhộn.", "SQ_OG_001_10": "Chuyên đề quản lý tài chính cá nhân cho sinh viên."}', 'USE024', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('9dafce98-2e0b-4b99-916c-3ad34d5cdd4f', '{"SQ_OG_002_01": {"rating": 5, "reason": "Em đã học hỏi được rất nhiều từ cuộc thi."}, "SQ_OG_002_02": "Trình diễn PowerPoint chuyên nghiệp", "SQ_OG_002_03": {"rating": 5, "reason": "Phòng máy chạy rất tốt, phần mềm đầy đủ."}, "SQ_OG_002_04": {"rating": 4, "reason": "Thời gian 60 phút cho Excel hơi ngắn, nhưng chấp nhận được."}, "SQ_OG_002_05": {"rating": 3, "reason": "Đề thi hơi dài, em không kịp làm xong phần PowerPoint."}, "SQ_OG_002_06": "Đề thi quá khó", "SQ_OG_002_07": {"rating": 4, "reason": "Công bố kết quả nhanh và lễ trao giải rất trang trọng."}, "SQ_OG_002_08": "Thử sức bản thân", "SQ_OG_002_09": "Không cần cải tiến gì, đề thi đã rất hay.", "SQ_OG_002_10": "Cảm ơn các thầy cô và CLB đã tạo ra sân chơi bổ ích này."}', 'USE024', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('14590d6b-a5aa-4bfd-8b20-de1d67429849', '{"SQ_OG_003_01": {"rating": 4, "reason": "Học hỏi được nhiều kinh nghiệm làm mạch và viết báo cáo."}, "SQ_OG_003_02": "Thiết bị y tế và cảm biến thông minh", "SQ_OG_003_03": {"rating": 5, "reason": "Hàm lượng khoa học của các đề tài rất cao."}, "SQ_OG_003_04": {"rating": 4, "reason": "Slide thuyết trình đẹp, sinh viên tự tin."}, "SQ_OG_003_05": {"rating": 3, "reason": "Thời gian hỏi đáp hơi ít, muốn thảo luận nhiều hơn."}, "SQ_OG_003_06": "Quá ngắn, cần nhiều thời gian hỏi đáp hơn", "SQ_OG_003_07": {"rating": 4, "reason": "Khơi dậy được đam mê nghiên cứu khoa học cho em."}, "SQ_OG_003_08": "Chỉ tham dự học hỏi", "SQ_OG_003_09": "Nhận diện khuôn mặt trên ESP32-CAM.", "SQ_OG_003_10": "Mong khoa tài trợ thêm kinh phí cho sinh viên làm phần cứng."}', 'USE024', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'SRV_OG_003');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('1a45c9c3-00cb-443e-8188-a2edb777788d', '{"SQ_OG_001_01": {"rating": 5, "reason": "Thực sự hữu ích cho sinh viên năm cuối."}, "SQ_OG_001_02": "Kỹ năng giao tiếp và tạo lập mối quan hệ", "SQ_OG_001_03": {"rating": 5, "reason": "Diễn giả chia sẻ cực kỳ lôi cuốn và nhiệt huyết."}, "SQ_OG_001_04": {"rating": 4, "reason": "Ban tổ chức chuẩn bị chu đáo, hội trường đẹp."}, "SQ_OG_001_05": "Rất chu đáo và chuyên nghiệp", "SQ_OG_001_06": {"rating": 3, "reason": "Bình thường, em thấy lý thuyết hơi nhiều."}, "SQ_OG_001_07": "Có thể tham gia nếu sắp xếp được thời gian", "SQ_OG_001_08": "Fanpage câu lạc bộ/trường", "SQ_OG_001_09": "Cả ba thầy cô đều để lại ấn tượng tốt.", "SQ_OG_001_10": "Không có đóng góp gì thêm, chương trình đã rất tuyệt vời."}', 'USE025', DATE_SUB(NOW(), INTERVAL 9 HOUR), 'SRV_OG_001');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('853f294a-423d-44c6-9982-0694867c1575', '{"SQ_OG_002_01": {"rating": 5, "reason": "Rất hài lòng với công tác chuẩn bị của CLB."}, "SQ_OG_002_02": "Kỹ năng soạn thảo văn bản Word nâng cao", "SQ_OG_002_03": {"rating": 4, "reason": "Đề thi năm nay khá thử thách nhưng rất thực tế."}, "SQ_OG_002_04": {"rating": 5, "reason": "Giám thị thân thiện và hướng dẫn quy chế rõ ràng."}, "SQ_OG_002_05": {"rating": 5, "reason": "Cuộc thi được tổ chức chuyên nghiệp và nghiêm túc."}, "SQ_OG_002_06": "Thiếu thời gian làm bài", "SQ_OG_002_07": {"rating": 4, "reason": "Thử thách rất tốt cho kỹ năng văn phòng của em."}, "SQ_OG_002_08": "Lấy chứng nhận cộng điểm rèn luyện", "SQ_OG_002_09": "Nên nâng cấp phiên bản Office trên máy phòng thực hành lên 2021.", "SQ_OG_002_10": "Mong cuộc thi sẽ được duy trì thường niên."}', 'USE025', DATE_SUB(NOW(), INTERVAL 9 HOUR), 'SRV_OG_002');
INSERT INTO survey_responses (id, answers, participant_account_id, submitted_at, survey_id) VALUES ('a8d33ec4-b688-479a-a39c-be862aed4f31', '{"SQ_OG_003_01": {"rating": 5, "reason": "Rất thích khu triển lãm robot và xe tự hành."}, "SQ_OG_003_02": "IoT và Hệ thống nhúng thế hệ mới", "SQ_OG_003_03": {"rating": 5, "reason": "Các sản phẩm triển lãm chạy thực tế rất ấn tượng."}, "SQ_OG_003_04": {"rating": 4, "reason": "Hội đồng phản biện rất chuyên sâu và đưa ra nhiều góp ý quý báu."}, "SQ_OG_003_05": {"rating": 5, "reason": "Tiếp đón chu đáo, nước uống đầy đủ."}, "SQ_OG_003_06": "Vừa đủ để trao đổi", "SQ_OG_003_07": {"rating": 5, "reason": "Seminar rất chất lượng, các đề tài có tính ứng dụng cao."}, "SQ_OG_003_08": "Chắc chắn có và đang chuẩn bị ý tưởng", "SQ_OG_003_09": "Thích nhất mô hình thiết bị y tế đeo tay đo nhịp tim.", "SQ_OG_003_10": "Nên kết nối với các doanh nghiệp để thương mại hóa sản phẩm."}', 'USE025', DATE_SUB(NOW(), INTERVAL 9 HOUR), 'SRV_OG_003');

SET FOREIGN_KEY_CHECKS = 1;
