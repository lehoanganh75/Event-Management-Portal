INSERT INTO organizations (
    id, name, type, email, phone,
    owner_account_id,
    logo_url,
    office_location,
    description,
    is_deleted,
    created_at
)
VALUES

-- 1
('org-1', 'Khoa Công nghệ Thông tin', 'FACULTY',
 'fit@iuh.edu.vn', '0283.8940.390', 'USE001',
 'https://moon-s3-demo.s3.ap-southeast-1.amazonaws.com/logo-fit.png',
 'Tòa nhà H, IUH',
 'Đơn vị đào tạo kỹ sư CNTT chất lượng cao.',
 false, NOW()),

-- 2
('org-2', 'Câu lạc bộ Tin học HIT', 'CLUB',
 'hit.club@iuh.edu.vn', '0901.234.567', 'USE002',
 'https://iuh.edu.vn/logo-hit.png',
 'Phòng CLB H1',
 'Nơi sinh hoạt học thuật và lập trình của sinh viên IT.',
 false, NOW()),

-- 3
('org-3', 'Đoàn Thanh niên IUH', 'DEPARTMENT',
 'doanthanhnien@iuh.edu.vn', '0283.111.222', 'USE003',
 'https://iuh.edu.vn/logo-doan.png',
 'Tòa nhà A',
 'Tổ chức các hoạt động phong trào và thiện nguyện.',
 false, NOW()),

-- 4
('org-4', 'Khoa Quản trị Kinh doanh', 'FACULTY',
 'fba@iuh.edu.vn', '0283.8940.444', 'USE004',
 'https://iuh.edu.vn/logo-fba.png',
 'Tòa nhà B',
 'Khoa đào tạo các nhà quản lý tương lai.',
 false, NOW()),

-- 5
('org-5', 'Phòng Công tác Sinh viên', 'DEPARTMENT',
 'ctsv@iuh.edu.vn', '0283.8940.555', 'USE005',
 'https://iuh.edu.vn/logo-ctsv.png',
 'Tòa nhà A',
 'Hỗ trợ sinh viên về chính sách và học bổng.',
 false, NOW()),

-- 6
('org-6', 'Câu lạc bộ Tiếng Anh IEC', 'CLUB',
 'iec.club@iuh.edu.vn', '0902.345.678', 'USE006',
 'https://iuh.edu.vn/logo-iec.png',
 'Phòng CLB B2',
 'Môi trường luyện giao tiếp tiếng Anh cho sinh viên.',
 false, NOW()),

-- 7
('org-7', 'Hội Sinh viên IUH', 'DEPARTMENT',
 'hoisinhvien@iuh.edu.vn', '0283.333.444', 'USE007',
 'https://iuh.edu.vn/logo-hsv.png',
 'Tòa nhà A',
 'Bảo vệ quyền lợi và hỗ trợ đời sống sinh viên.',
 false, NOW()),

-- 8
('org-8', 'Trung tâm Đào tạo Quốc tế', 'DEPARTMENT',
 'ie@iuh.edu.vn', '0283.8940.666', 'USE008',
 'https://iuh.edu.vn/logo-iet.png',
 'Tòa nhà C',
 'Quản lý các chương trình liên kết quốc tế.',
 false, NOW()),

-- 9
('org-9', 'Khoa May Thời trang', 'FACULTY',
 'fgat@iuh.edu.vn', '0283.8940.777', 'USE009',
 'https://iuh.edu.vn/logo-fashion.png',
 'Tòa nhà D',
 'Nơi khơi nguồn sáng tạo thiết kế thời trang.',
 false, NOW()),

-- 10
('org-10', 'Câu lạc bộ Kỹ năng IUH', 'CLUB',
 'skills.club@iuh.edu.vn', '0903.456.789', 'USE010',
 'https://iuh.edu.vn/logo-skills.png',
 'Phòng CLB C1',
 'Phát triển kỹ năng mềm và kỹ năng sống.',
 false, NOW());

INSERT INTO event_templates (
    id, template_name, description, template_type, custom_template_type,
    default_title, default_cover_image, default_location, default_event_mode, default_max_participants,
    faculty, major, usage_count, config_data, is_public, created_at, updated_at, is_deleted, organization_id
)
VALUES

-- 1. Workshop IT
(UUID(), 'Workshop Java Spring Boot',
 'Template cho workshop backend Java',
 'WORKSHOP', 'COURSE',
 'Workshop: Java Spring Boot Master',
 'https://iuh.edu.vn/template/java.jpg',
 'Phòng Lab H', 'OFFLINE', 50,
 'CNTT', 'Kỹ thuật phần mềm', 120,
 '{"requireApproval": true, "checkInRequired": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-1'),

-- 2. Seminar AI
(UUID(), 'Seminar AI',
 'Seminar về trí tuệ nhân tạo',
 'SEMINAR', NULL,
 'Seminar: AI Trends 2026',
 'https://iuh.edu.vn/template/ai.jpg',
 'Hội trường A7', 'OFFLINE', 300,
 'CNTT', 'AI', 95,
 '{"requireApproval": false, "certificate": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-1'),

-- 3. Webinar Cloud
(UUID(), 'Webinar Cloud',
 'Template webinar online',
 'SEMINAR', NULL,
 'Webinar: Cloud Computing 101',
 'https://iuh.edu.vn/template/cloud.jpg',
 'Google Meet', 'ONLINE', 500,
 'CNTT', 'Cloud', 80,
 '{"platform": "Google Meet", "record": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-1'),

-- 4. Hackathon
(UUID(), 'Hackathon Template',
 'Template thi đấu lập trình',
 'COMPETITION', NULL,
 'Hackathon Coding 24h',
 'https://iuh.edu.vn/template/hackathon.jpg',
 'Hội trường E4', 'OFFLINE', 200,
 'CNTT', 'Khoa học máy tính', 60,
 '{"teamSize": 3, "durationHours": 24}',
 TRUE, NOW(), NOW(), FALSE, 'org-2'),

-- 5. Talkshow Career
(UUID(), 'Talkshow Career',
 'Talkshow định hướng nghề nghiệp',
 'SEMINAR', 'COURSE',
 'Talkshow: Career Path IT',
 'https://iuh.edu.vn/template/career.jpg',
 'Hội trường A7', 'OFFLINE', 250,
 'CNTT', 'Hệ thống thông tin', 70,
 '{"guestSpeaker": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-2'),

-- 6. Orientation
(UUID(), 'Orientation Sinh viên',
 'Chào đón tân sinh viên',
 'FESTIVAL', 'COURSE',
 'Chào đón tân sinh viên IUH',
 'https://iuh.edu.vn/template/orientation.jpg',
 'Sân trường', 'OFFLINE', 1000,
 'CNTT', 'General', 150,
 '{"welcomeKit": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-1'),

-- 7. Training Linux
(UUID(), 'Training Linux',
 'Đào tạo Linux cơ bản',
 'WORKSHOP', 'COURSE',
 'Training Linux Basic',
 'https://iuh.edu.vn/template/linux.jpg',
 'Lab 4.2', 'OFFLINE', 40,
 'CNTT', 'Hệ điều hành', 55,
 '{"practiceRequired": true}',
 FALSE, NOW(), NOW(), FALSE, 'org-2'),

-- 8. Online Course
(UUID(), 'Online Course Template',
 'Khóa học online nhiều buổi',
 'OTHER', 'COURSE',
 'Khóa học lập trình online',
 'https://iuh.edu.vn/template/course.jpg',
 'Zoom', 'ONLINE', 200,
 'CNTT', 'Fullstack', 30,
 '{"sessions": 10}',
 TRUE, NOW(), NOW(), FALSE, 'org-1'),

-- 9. Startup Pitch
(UUID(), 'Startup Pitch',
 'Trình bày ý tưởng startup',
 'COMPETITION', 'COURSE',
 'Startup Pitch Day',
 'https://iuh.edu.vn/template/startup.jpg',
 'Hội trường B', 'OFFLINE', 150,
 'Kinh tế', 'Quản trị kinh doanh', 40,
 '{"pitchTime": 10}',
 TRUE, NOW(), NOW(), FALSE, 'org-3'),

-- 10. Volunteer Event
(UUID(), 'Volunteer Event',
 'Hoạt động tình nguyện',
 'FESTIVAL', 'COURSE',
 'Chiến dịch Mùa hè xanh',
 'https://iuh.edu.vn/template/volunteer.jpg',
 'Ngoại thành', 'OFFLINE', 300,
 'Xã hội', 'Công tác xã hội', 65,
 '{"outdoor": true}',
 TRUE, NOW(), NOW(), FALSE, 'org-2');

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'TECH' FROM event_templates WHERE template_name = 'Workshop Java Spring Boot';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'AI' FROM event_templates WHERE template_name = 'Seminar AI';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'CLOUD' FROM event_templates WHERE template_name = 'Webinar Cloud';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'COMPETITION' FROM event_templates WHERE template_name = 'Hackathon Template';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'CAREER' FROM event_templates WHERE template_name = 'Talkshow Career';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'STUDENT' FROM event_templates WHERE template_name = 'Orientation Sinh viên';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'LINUX' FROM event_templates WHERE template_name = 'Training Linux';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'ONLINE' FROM event_templates WHERE template_name = 'Online Course Template';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'STARTUP' FROM event_templates WHERE template_name = 'Startup Pitch';

INSERT INTO event_template_themes (template_id, theme)
SELECT id, 'VOLUNTEER' FROM event_templates WHERE template_name = 'Volunteer Event';

INSERT INTO events (
    id, approved_by_account_id, slug, title, description,
    event_topic, cover_image,
    location, event_mode,
    start_time, end_time, registration_deadline,
    max_participants,
    type, status,
    recipients,
    organization_id,
    notes,
    created_by_account_id,
    template_id,
    is_deleted, archived, finalized,
    created_at
)
VALUES

-- 1
('evt-1', 'USE001', 'iuh-tech-day-2026',
 'IUH Tech Day 2026',
 'Sự kiện công nghệ lớn nhất năm',
 'Công nghệ',
 'https://iuh.edu.vn/techday.jpg',
 'Hội trường A7', 'OFFLINE',
 '2026-05-15 08:00:00', '2026-05-15 17:00:00', '2026-05-10 23:59:59',
 500,
 'WORKSHOP', 'PUBLISHED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Sự kiện quy mô lớn toàn trường',
 'e72a02c5-82fc-43bf-b888-f72f6938c151',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 2
('evt-2', 'USE001', 'webinar-cloud-computing',
 'Webinar: Cloud Computing 101',
 'Giới thiệu cloud cơ bản',
 'Điện toán đám mây',
 'https://iuh.edu.vn/techday.jpg',
 'Google Meet', 'ONLINE',
 '2026-04-20 19:00:00', '2026-04-20 21:00:00', '2026-04-19 12:00:00',
 300,
 'SEMINAR', 'PUBLISHED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Sự kiện online giới thiệu về điện toán đám mây',
 'e72a02c5-82fc-43bf-b888-f72f6938c151',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 3
('evt-3', 'USE002', 'workshop-java-spring',
 'Workshop: Java Spring Boot Master',
 'Workshop backend',
 'Lập trình Backend',
 'https://iuh.edu.vn/techday.jpg',
 'Phòng máy nhà H', 'OFFLINE',
 '2026-05-02 08:00:00', '2026-05-02 12:00:00', '2026-04-30 23:59:59',
 50,
 'WORKSHOP', 'PLAN_APPROVED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Thực hành xây dựng ứng dụng Spring Boot',
 'USE001',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 4
('evt-4', 'USE001', 'hit-code-war-2026',
 'HIT Code War 2026',
 'Thi đấu lập trình',
 'Thi đấu lập trình',
 'https://iuh.edu.vn/techday.jpg',
 'Hội trường E4', 'OFFLINE',
 '2026-06-10 07:30:00', '2026-06-10 12:00:00', '2026-06-05 23:59:59',
 100,
 'COMPETITION', 'PUBLISHED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-2',
 'Cuộc thi lập trình thường niên của CLB HIT',
 'USE002',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 5
('evt-5', 'USE002', 'offline-tan-sinh-vien-it',
 'Offline Tân sinh viên IT',
 'Giao lưu sinh viên',
 'Giao lưu',
 'https://iuh.edu.vn/techday.jpg',
 'Sân nhà A', 'OFFLINE',
 '2026-09-15 15:00:00', '2026-09-15 18:00:00', '2026-09-10 23:59:59',
 400,
 'FESTIVAL', 'DRAFT',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-2',
 'Sự kiện chào đón tân sinh viên IT năm 2026',
 'USE001',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 6
('evt-6', 'USE001', 'hit-talkshow-career',
 'Talkshow: Lộ trình sự nghiệp IT',
 'Định hướng nghề nghiệp',
 'Định hướng',
 'https://iuh.edu.vn/techday.jpg',
 'Hội trường A7', 'OFFLINE',
 '2026-04-15 14:00:00', '2026-04-15 17:00:00', '2026-04-14 12:00:00',
 250,
 'SEMINAR', 'PUBLISHED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-2',
 'Talkshow định hướng nghề nghiệp cho sinh viên IT',
 'USE001',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 7
('evt-7', 'USE001', 'training-linux-basic',
 'Training Linux Cơ bản',
 'Học Linux',
 'Hệ điều hành',
 'https://iuh.edu.vn/techday.jpg',
 'Phòng Lab 4.2', 'OFFLINE',
 '2026-03-01 08:00:00', '2026-03-01 11:00:00', '2026-02-28 23:59:59',
 30,
 'WORKSHOP', 'COMPLETED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-2',
 'Sự kiện đào tạo Linux cơ bản cho sinh viên',
 'USE010',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, true, true,
 '2026-02-15 10:00:00'),

-- 8
('evt-8', 'USE010', 'hackathon-green-city',
 'Hackathon: Green City',
 'Hackathon môi trường',
 'Môi trường',
 'https://iuh.edu.vn/techday.jpg',
 'Sảnh nhà H', 'OFFLINE',
 '2026-07-20 08:00:00', '2026-07-21 17:00:00', '2026-07-10 23:59:59',
 150,
 'COMPETITION', 'PLAN_PENDING_APPROVAL',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Cuộc thi lập trình về giải pháp thành phố xanh',
 'USE008',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW()),

-- 9
('evt-9', 'USE001', 'test-event-deleted',
 'Sự kiện Test',
 'Event test',
 'Test',
 'https://iuh.edu.vn/techday.jpg',
 'Phòng ảo', 'ONLINE',
 '2026-04-01 00:00:00', '2026-04-01 01:00:00', '2026-03-30 00:00:00',
 10,
 'OTHER', 'CANCELLED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Sự kiện này',
 'USE007',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 true, false, false,
 NOW()),

-- 10
('evt-10', 'USE001', 'workshop-ai-gen',
 'Workshop: Generative AI',
 'Học AI',
 'AI',
 'https://iuh.edu.vn/techday.jpg',
 'Google Meet', 'ONLINE',
 '2026-05-25 19:30:00', '2026-05-25 21:30:00', '2026-05-24 12:00:00',
 500,
 'WORKSHOP', 'PUBLISHED',
 '[{"type":"STUDENT","faculty":"CNTT"}]',
 'org-1',
 'Sự kiện đào tạo về AI thế hệ mới',
 'USE003',
 'a2311a05-2f22-11f1-a793-726639b4c8d6',
 false, false, false,
 NOW());

-- Lịch trình cho IUH Tech Day (evt-1)
INSERT INTO event_sessions (id, event_id, title, description, room, type, start_time, end_time, max_participants, order_index, status, created_at, is_deleted)
VALUES
    (UUID(), 'evt-1', 'Khai mạc & Keynote AI 2026', 'Giới thiệu xu hướng AI mới nhất', 'Hội trường A7', 'KEYNOTE', '2026-05-15 08:30:00', '2026-05-15 09:30:00', 500, 1, 'KEYNOTE', NOW(),false),
    (UUID(), 'evt-1', 'Tiệc trà giữa giờ', 'Giao lưu và dùng teabreak', 'Sảnh A7', 'BREAK', '2026-05-15 09:30:00', '2026-05-15 10:00:00', 500, 2, 'BREAK', NOW(),false),
    (UUID(), 'evt-1', 'Workshop: Microservices với Spring Boot', 'Thực hành xây dựng hệ thống phân tán', 'Phòng H5.1', 'WORKSHOP', '2026-05-15 10:00:00', '2026-05-15 12:00:00', 50, 3, 'WORKSHOP', NOW(),false),
    (UUID(), 'evt-1', 'Thảo luận: Cơ hội việc làm IT', 'Hỏi đáp cùng các chuyên gia doanh nghiệp', 'Hội trường A7', 'WORKSHOP', '2026-05-15 13:30:00', '2026-05-15 15:30:00', 300, 4, 'WORKSHOP', NOW(), false);

-- Lịch trình cho HIT Code War (evt-4)
INSERT INTO event_sessions (id, event_id, title, description, room, type, start_time, end_time, max_participants, order_index, status, created_at, is_deleted)
VALUES
    (UUID(), 'evt-4', 'Check-in & Phát số báo danh', 'Nhận tài khoản thi đấu', 'E4.1', 'BREAK', '2026-06-10 07:00:00', '2026-06-10 08:00:00', 100, 1, 'BREAK', NOW(),false),
    (UUID(), 'evt-4', 'Vòng thi đấu chính thức', 'Giải quyết 10 bài toán thuật toán', 'Phòng máy E4', 'KEYNOTE', '2026-06-10 08:00:00', '2026-06-10 11:30:00', 100, 2, 'KEYNOTE', NOW(),false),
    (UUID(), 'evt-4', 'Trao giải & Bế mạc', 'Công bố bảng xếp hạng', 'Hội trường E4', 'KEYNOTE', '2026-06-10 11:30:00', '2026-06-10 12:00:00', 100, 3, 'KEYNOTE', NOW(), false);

INSERT INTO event_presenters (
    id, event_id, presenter_account_id,
    linked_in_url, phone, assigned_at,
    full_name, email, position, department,
    bio, session, avatar_url, is_deleted
)
VALUES

-- Tech Day
(UUID(), 'evt-1', 'USE001',
 'https://linkedin.com/in/nguyenvanan', '0901000001', NOW(),
 'TS. Nguyễn Văn An', 'an.nv@iuh.edu.vn',
 'Trưởng bộ môn', 'Khoa CNTT - IUH',
 'Chuyên gia 20 năm kinh nghiệm mảng Cloud & Big Data.',
 'Keynote: Tương lai Cloud 2026',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', false),

(UUID(), 'evt-1', 'USE001',
 'https://linkedin.com/in/stevehoang', '0901000002', NOW(),
 'Mr. Steve Hoàng', 'steve.h@google.com',
 'Senior Developer', 'Google Vietnam',
 'Cựu sinh viên IUH, hiện làm việc tại Google.',
 'Workshop: Scaling Microservices',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Steve', false),

(UUID(), 'evt-1', 'USE001',
 'https://linkedin.com/in/stevehoang', '0901000003', NOW(),
 'Lê Thị Bình', 'binh.lt@student.iuh.edu.vn',
 'Sinh viên tiêu biểu', 'CLB IEC',
 'Giải nhất Hùng biện tiếng Anh cấp TP.',
 'Talkshow: Kỹ năng mềm cho Dev',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh', false),

-- Code War
(UUID(), 'evt-4', 'USE002',
 'https://linkedin.com/in/stevehoang', '0902000001', NOW(),
 'ThS. Trần Minh Đức', 'duc.tm@iuh.edu.vn',
 'Giảng viên', 'Khoa CNTT - IUH',
 'Trọng tài ICPC quốc gia.',
 'Trưởng ban đề thi',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Duc', false),

(UUID(), 'evt-4', 'USE002',
 'https://linkedin.com/in/stevehoang', '0902000002', NOW(),
 'Nguyễn Quốc Cường', 'cuong.nq@vng.com.vn',
 'Lead Engineer', 'ZaloPay',
 'Chuyên gia tối ưu hệ thống thanh toán.',
 'Giám khảo khách mời',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong', false),

-- Other events
(UUID(), 'evt-2', 'USE003',
 'https://linkedin.com/in/stevehoang', '0903000001', NOW(),
 'TS. Phạm Hải Nam', 'nam.ph@iuh.edu.vn',
 'Phó khoa', 'Khoa CNTT',
 'Chuyên gia bảo mật hệ thống.',
 'Bảo mật trong Cloud',
 'https://linkedin.com/in/stevehoang', false),

(UUID(), 'evt-3', 'USE003',
 'https://linkedin.com/in/stevehoang', '0903000002', NOW(),
 'Trần Văn Master', 'master.t@java.org',
 'Java Champion', 'Oracle Partner',
 'Tác giả sách Java.',
 'Spring Boot 3.x',
 'https://linkedin.com/in/stevehoang', false),

(UUID(), 'evt-6', 'USE002',
 'https://linkedin.com/in/stevehoang', '0902000003', NOW(),
 'Nguyễn Minh Tuấn', 'tuan.nm@student.iuh.edu.vn',
 'Chủ nhiệm CLB', 'CLB HIT',
 'Intern tại VinAI.',
 'Career path IT',
 'https://linkedin.com/in/stevehoang', false),

(UUID(), 'evt-10', 'USE003',
 'https://linkedin.com/in/stevehoang', '0903000003', NOW(),
 'Dr. Emily Watson', 'emily@openai.com',
 'Research Scientist', 'OpenAI',
 'Chuyên gia LLM.',
 'Generative AI',
 'https://linkedin.com/in/stevehoang', false),

(UUID(), 'evt-8', 'USE005',
 'https://linkedin.com/in/stevehoang', '0905000001', NOW(),
 'Hoàng Thu Thủy', 'thuy.ht@iuh.edu.vn',
 'Giảng viên', 'Khoa QTKD',
 'Chuyên gia startup.',
 'Khởi nghiệp xanh',
 'https://linkedin.com/in/stevehoang', false);

-- 1. Tạo lời mời mẫu (Invitations) cho IUH Tech Day (evt-1)
INSERT INTO event_invitations (
    id,
    event_id,
    invitee_account_id,
    inviter_account_id,
    invitee_email,
    target_role,
    status,
    message,
    rejection_reason,
    responded_at,
    sent_at,
    expired_at
)
VALUES

-- EVT-1 (Tech Day)
(UUID(), 'evt-1', 'USE001', 'USE002',
 'sv1_cntt@iuh.edu.vn', 'MEMBER', 'PENDING',
 'Mời bạn hỗ trợ kỹ thuật cho Tech Day nhé!',
 NULL, NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),

(UUID(), 'evt-1', 'USE003', 'USE004',
 'sv2_marketing@iuh.edu.vn', 'MEMBER', 'ACCEPTED',
 'Mời bạn làm truyền thông cho sự kiện.',
 NULL, NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),

-- EVT-4 (Code War)
(UUID(), 'evt-4', 'USE003', 'USE005',
 'clb_it_vp@iuh.edu.vn', 'LEADER', 'REJECTED',
 'Mời bạn làm phó ban tổ chức.',
 'Bận lịch cá nhân',
 NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)),

(UUID(), 'evt-4', 'USE004', 'USE010',
 'clb_media@iuh.edu.vn', 'MEMBER', 'PENDING',
 'Mời bạn hỗ trợ truyền thông cho Code War.',
 NULL, NULL,
 NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)),

-- EVT-2 (Webinar Cloud)
(UUID(), 'evt-2', 'USE005', 'USE009',
 'cloud.team@iuh.edu.vn', 'MEMBER', 'ACCEPTED',
 'Mời bạn hỗ trợ kỹ thuật webinar.',
 NULL, NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY)),

-- EVT-3 (Workshop Java)
(UUID(), 'evt-3', 'USE006', 'USE008',
 'java.team@iuh.edu.vn', 'MEMBER', 'PENDING',
 'Hỗ trợ lab cho workshop Java.',
 NULL, NULL,
 NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY)),

-- EVT-6 (Talkshow)
(UUID(), 'evt-6', 'USE007', 'USE005',
 'speaker.support@iuh.edu.vn', 'MEMBER', 'ACCEPTED',
 'Điều phối diễn giả talkshow.',
 NULL, NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 6 DAY)),

-- EVT-8 (Hackathon)
(UUID(), 'evt-8', 'USE008', 'USE009',
 'hackathon@iuh.edu.vn', 'MEMBER', 'PENDING',
 'Mời bạn làm mentor cho hackathon.',
 NULL, NULL,
 NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY)),

-- EVT-5 (Offline SV)
(UUID(), 'evt-5', 'USE009', 'USE010',
 'offline.team@iuh.edu.vn', 'MEMBER', 'PENDING',
 'Hỗ trợ tổ chức offline tân sinh viên.',
 NULL, NULL,
 NOW(), DATE_ADD(NOW(), INTERVAL 8 DAY)),

-- EVT-10 (AI Workshop)
(UUID(), 'evt-10', 'USE010', 'USE008',
 'ai.team@iuh.edu.vn', 'MEMBER', 'ACCEPTED',
 'Hỗ trợ setup buổi AI workshop.',
 NULL, NOW(),
 NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

INSERT INTO event_organizers (id, event_id, account_id, full_name, email, position, role, assigned_at, is_deleted)
VALUES
-- BTC Khoa CNTT (Sự kiện evt-1: IUH Tech Day)
(UUID(), 'evt-1', 'USE001', 'ThS. Nguyễn Văn Quản Lý', 'quanly.fit@iuh.edu.vn', 'Giảng viên', 'LEADER', NOW(), false),
(UUID(), 'evt-1', 'USE001', 'Lê Hoàng Anh', 'hoanganh.staff@iuh.edu.vn', 'Chuyên viên', 'COORDINATOR', NOW(), false),
(UUID(), 'evt-1', 'USE001', 'Trần Minh Tuấn', 'tuan.sv@student.iuh.edu.vn', 'Sinh viên', 'MEMBER', NOW(), false),

-- BTC CLB HIT (Sự kiện evt-4: HIT Code War)
(UUID(), 'evt-4', 'USE001', 'Nguyễn Văn Chủ Nhiệm', 'chunhiem.hit@gmail.com', 'Chủ nhiệm CLB', 'LEADER', NOW(), false),
(UUID(), 'evt-4', 'USE005', 'Đặng Thu Thảo', 'thao.hit@student.iuh.edu.vn', 'Thành viên BCN', 'MEMBER', NOW(), false),
(UUID(), 'evt-4', 'USE006', 'Vũ Minh Quân', 'quan.hit@student.iuh.edu.vn', 'Trưởng ban chuyên môn', 'MEMBER', NOW(), false),
(UUID(), 'evt-4', 'USE007', 'Hoàng Anh Đức', 'duc.hit@student.iuh.edu.vn', 'Cộng tác viên', 'MEMBER', NOW(), false);

INSERT INTO event_registrations (
    id,
    event_id,
    participant_account_id,
    status,
    answers_json,
    ticket_code,
    qr_token,
    checked_in,
    check_in_time,
    checked_in_by_account_id,
    qr_token_expiry,
    registered_at,
    is_deleted
)
VALUES

-- ===== EVT-1: TECH DAY =====
(UUID(), 'evt-1', 'USE001', 'ATTENDED',
 '{"shirtSize": "L", "lunch": "Chay"}',
 'TIC-TD-001', 'token-abc-123',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-1', 'USE002', 'ATTENDED',
 '{"shirtSize": "M", "lunch": "Mặn"}',
 'TIC-TD-002', 'token-def-456',
 TRUE, '2026-05-15 08:15:00', 'acc-staff-01',
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-1', 'USE003', 'PENDING',
 '{"shirtSize": "XL", "lunch": "Mặn"}',
 NULL, NULL,
 FALSE, NULL, NULL,
 NULL,
 NOW(), FALSE),

(UUID(), 'evt-1', 'USE004', 'ATTENDED',
 '{"shirtSize": "S", "lunch": "Mặn"}',
 'TIC-TD-004', 'token-ghi-789',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-1', 'USE005', 'CANCELLED',
 '{"shirtSize": "M"}',
 NULL, NULL,
 FALSE, NULL, NULL,
 NULL,
 NOW(), FALSE),

-- ===== EVT-4: CODE WAR =====
(UUID(), 'evt-4', 'USE006', 'ATTENDED',
 '{"teamName": "BugMaker", "language": "Java"}',
 'CW-2026-001', 'token-cw-001',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 2 DAY),
 NOW(), FALSE),

(UUID(), 'evt-4', 'USE007', 'ATTENDED',
 '{"teamName": "CleanCode", "language": "C++"}',
 'CW-2026-002', 'token-cw-002',
 TRUE, '2026-06-10 07:45:00', 'acc-student-hit',
 DATE_ADD(NOW(), INTERVAL 2 DAY),
 NOW(), FALSE),

(UUID(), 'evt-4', 'USE008', 'ATTENDED',
 '{"teamName": "IUH-IT", "language": "Python"}',
 'CW-2026-003', 'token-cw-003',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 2 DAY),
 NOW(), FALSE),

(UUID(), 'evt-4', 'USE009', 'PENDING',
 '{"teamName": "NoBug", "language": "Go"}',
 NULL, NULL,
 FALSE, NULL, NULL,
 NULL,
 NOW(), FALSE),

-- ===== EVT-2: WEBINAR =====
(UUID(), 'evt-2', 'USE010', 'ATTENDED',
 '{}',
 'WB-001', 'token-wb-001',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-2', 'USE011', 'ATTENDED',
 '{}',
 'WB-002', 'token-wb-002',
 TRUE, '2026-04-20 19:05:00', 'acc-admin-fit',
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

-- ===== EVT-3: WORKSHOP =====
(UUID(), 'evt-3', 'USE012', 'ATTENDED',
 '{"experience": "Basic"}',
 'WS-JAVA-001', 'token-ws-001',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-3', 'USE013', 'PENDING',
 '{"experience": "Intermediate"}',
 NULL, NULL,
 FALSE, NULL, NULL,
 NULL,
 NOW(), FALSE),

-- ===== EVT-10: AI =====
(UUID(), 'evt-10', 'USE014', 'ATTENDED',
 '{"interest": "NLP"}',
 'AI-001', 'token-ai-001',
 FALSE, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE),

(UUID(), 'evt-10', 'USE015', 'ATTENDED',
 '{"interest": "CV"}',
 'AI-002', 'token-ai-002',
 TRUE, '2026-05-25 19:35:00', 'acc-admin-fit',
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NOW(), FALSE);

INSERT INTO event_participants (
    id,
    event_id,
    participant_account_id,
    full_name,
    email,
    student_code,
    participant_code,
    status,
    checked_in,
    attended_at,
    position,
    organization,
    is_deleted
)
VALUES
-- Khách mời VIP
(UUID(), 'evt-1', NULL, 'GS.TS Nguyễn Văn X', 'x.nv@iuh.edu.vn', NULL, 'VIP-001', 'ATTENDED', FALSE, NULL, 'Hiệu trưởng', 'IUH', FALSE),
(UUID(), 'evt-1', NULL, 'Ông Trần Văn Y', 'y.tv@fpt.com', NULL, 'VIP-002', 'ATTENDED', FALSE, NULL, 'Giám đốc nhân sự', 'FPT Software', FALSE),

-- Sinh viên evt-1
(UUID(), 'evt-1', 'acc-sv-001', 'Trần Minh Tuấn', 'tuan.sv@student.iuh.edu.vn', '21012345', 'PART-001', 'ATTENDED', FALSE, NULL, 'Sinh viên', 'Khoa CNTT', FALSE),
(UUID(), 'evt-1', 'acc-sv-005', 'Nguyễn Minh Anh', 'anh.sv@student.iuh.edu.vn', '22099887', 'PART-003', 'ATTENDED', FALSE, NULL, 'Sinh viên', 'Khoa Ngoại Ngữ', FALSE),

-- Webinar evt-2
(UUID(), 'evt-2', 'acc-sv-008', 'Hoàng Văn Đức', 'duc.sv@student.iuh.edu.vn', '23000444', 'WEB-001', 'ATTENDED', FALSE, NULL, 'Sinh viên', 'Khoa CNTT', FALSE),

-- HIT Code War evt-4
(UUID(), 'evt-4', 'acc-sv-006', 'Phạm Hoàng Long', 'long.sv@student.iuh.edu.vn', '21000111', 'CW-001', 'ATTENDED', FALSE, NOW(), 'Thí sinh', 'CLB HIT', FALSE),
(UUID(), 'evt-4', 'acc-sv-007', 'Vũ Thị Ngọc', 'ngoc.sv@student.iuh.edu.vn', '21000222', 'CW-002', 'ATTENDED', FALSE, NULL, 'Thí sinh', 'Khoa CNTT', FALSE),
(UUID(), 'evt-4', NULL, 'Anh Lê Văn Cường', 'cuong.l@zalo.vn', NULL, 'CW-EXP-001', 'ATTENDED', FALSE, NULL, 'Kỹ sư chuyên gia', 'ZaloPay', FALSE),

-- Workshop evt-3
(UUID(), 'evt-3', 'acc-sv-009', 'Nguyễn Thị Thắm', 'tham.sv@student.iuh.edu.vn', '21000555', 'WS-001', 'ATTENDED', FALSE, NULL, 'Sinh viên', 'Khoa CNTT', FALSE);

INSERT INTO event_posts (
    id, event_id, slug, author_account_id, title, content, view_count,
    post_type, status, is_pinned, image_urls, published_at, allow_comments, is_deleted
)
VALUES
    (UUID(), 'evt-1', 'huong-dan-gui-xe-techday', 'acc-admin-fit',
     'Hướng dẫn gửi xe tại sự kiện Tech Day',
     'Các bạn sinh viên vui lòng gửi xe tại hầm nhà H hoặc bãi xe khu C...',
     0,
     'NEWS', 'PUBLISHED', TRUE,
     '["https://iuh.edu.vn/map-parking.jpg"]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-1', 'thong-bao-thay-doi-dien-gia', 'acc-admin-fit',
     'Thông báo thay đổi diễn giả Keynote',
     'Do lý do sức khỏe, diễn giả Steve Hoàng sẽ được thay thế bởi...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '[]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-1', 'lo-trinh-su-kien-chi-tiet', 'acc-staff-01',
     'Lộ trình chi tiết các phiên Workshop',
     'Dưới đây là sơ đồ các phòng máy...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '["https://iuh.edu.vn/agenda.png"]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-4', 'quy-che-thi-dau-hit-codewar', 'acc-student-hit',
     'Quy chế thi đấu chính thức Code War 2026',
     'Các đội thi không được sử dụng tài liệu mạng...',
     0,
     'NEWS', 'PUBLISHED', TRUE,
     '[]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-4', 'he-lo-giai-thuong-khung', 'acc-student-hit',
     'Hé lộ giải thưởng cực khủng năm nay',
     'Giải nhất bao gồm laptop gaming...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '["https://iuh.edu.vn/prizes.jpg"]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-1', 'recap-techday-2026', 'acc-admin-fit',
     'Tổng kết những khoảnh khắc đáng nhớ',
     'Cảm ơn hơn 500 sinh viên...',
     0,
     'NEWS', 'DRAFT', FALSE,
     '["img1.jpg","img2.jpg"]', NULL, FALSE, TRUE),

    (UUID(), 'evt-2', 'tai-lieu-webinar-cloud', 'acc-admin-fit',
     'Slide bài giảng Webinar Cloud Computing',
     'Các bạn có thể tải slide...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '[]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-4', 'danh-sach-doi-thi-chinh-thuc', 'acc-student-hit',
     'Công bố 20 đội thi xuất sắc nhất',
     'Chúc mừng các đội...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '[]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-3', 'luu-y-truoc-khi-den-workshop', 'acc-staff-01',
     'Lưu ý: Cài đặt sẵn JDK 21',
     'Chuẩn bị môi trường...',
     0,
     'NEWS', 'PUBLISHED', FALSE,
     '[]', NOW(), TRUE, FALSE),

    (UUID(), 'evt-10', 'ai-gen-workshop-update', 'acc-admin-fit',
     'Cập nhật link Google Meet mới',
     'Chuyển sang Zoom...',
     0,
     'NEWS', 'PUBLISHED', TRUE,
     '[]', NOW(), TRUE, FALSE);

-- 1. Các bình luận gốc (Level 0)
-- Level 0
INSERT INTO post_comments (id, post_id, parent_id, commenter_account_id, content, is_edited, is_deleted)
VALUES
    ('cmt-1', (SELECT id FROM event_posts WHERE slug='huong-dan-gui-xe-techday'), NULL, 'acc-sv-001', 'Sự kiện này có được cộng điểm rèn luyện không ạ?', FALSE, FALSE),
    ('cmt-2', (SELECT id FROM event_posts WHERE slug='huong-dan-gui-xe-techday'), NULL, 'acc-sv-002', 'Cho mình hỏi Workshop Docker có cần cài trước gì không?', FALSE, FALSE),
    ('cmt-3', (SELECT id FROM event_posts WHERE slug='quy-che-thi-dau-hit-codewar'), NULL, 'acc-sv-005', 'Năm nay đề thi có phần Web không Ban tổ chức?', FALSE, FALSE);
-- 2. Các phản hồi (Level 1 - Trả lời cho cmt-1 và cmt-2)
INSERT INTO post_comments (id, post_id, parent_id, commenter_account_id, content, is_edited, is_deleted)
VALUES
    (UUID(), (SELECT id FROM event_posts WHERE slug='huong-dan-gui-xe-techday'), 'cmt-1', 'acc-admin-fit', 'Có bạn nhé, tham gia đầy đủ được cộng 5 điểm rèn luyện.', FALSE, FALSE),
    (UUID(), (SELECT id FROM event_posts WHERE slug='huong-dan-gui-xe-techday'), 'cmt-1', 'acc-sv-001', 'Dạ em cảm ơn thầy ạ!', FALSE, FALSE),
    (UUID(), (SELECT id FROM event_posts WHERE slug='huong-dan-gui-xe-techday'), 'cmt-2', 'acc-staff-01', 'Bạn nên cài sẵn Docker Desktop...', FALSE, FALSE),
    (UUID(), (SELECT id FROM event_posts WHERE slug='quy-che-thi-dau-hit-codewar'), 'cmt-3', 'acc-student-hit', 'Đề năm nay tập trung vào thuật toán...', FALSE, FALSE);

INSERT INTO recaps (
    id, event_id, author_account_id, title, content,
    image_urls, video_highlight_url, status, published_at,
    like_count, view_count, is_deleted
)
VALUES
    (UUID(), 'evt-7', 'acc-student-hit',
     'Tổng kết buổi Training Linux: Hơn cả mong đợi!',
     'Buổi training đã diễn ra thành công...',
     '["https://iuh.edu.vn/recap/linux-1.jpg", "https://iuh.edu.vn/recap/linux-2.jpg"]',
     'https://youtube.com/watch?v=linux-recap',
     'PUBLISHED', '2026-03-02 10:00:00',
     0, 0, FALSE),

    (UUID(), 'evt-2', 'acc-admin-fit',
     'Nhìn lại Webinar Cloud Computing 101',
     'Cảm ơn các diễn giả từ Google...',
     '["https://iuh.edu.vn/recap/cloud-1.jpg"]',
     NULL,
     'PUBLISHED', '2026-04-01 08:00:00',
     0, 0, FALSE);