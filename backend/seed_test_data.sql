-- ========================================================
-- AI IN STUDYING EVENT TEST DATA SEEDING SCRIPT
-- Generated on: 2026-05-21T00:07:21.602479
-- ========================================================

USE event_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean up existing seeded data to ensure re-runnability
DELETE FROM post_comments WHERE post_id IN (
    SELECT id FROM event_posts WHERE event_id IN (
        SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
    )
);
DELETE FROM quiz_options WHERE question_id IN (
    SELECT id FROM quiz_questions WHERE quiz_id IN (
        SELECT id FROM quizzes WHERE event_id IN (
            SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
        )
    )
);
DELETE FROM quiz_questions WHERE quiz_id IN (
    SELECT id FROM quizzes WHERE event_id IN (
        SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
    )
);
DELETE FROM quizzes WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM event_posts WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM event_sessions WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM event_presenters WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM event_organizers WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM event_registrations WHERE event_id IN (
    SELECT id FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap'
);
DELETE FROM events WHERE slug = 'ung-dung-ai-trong-hoc-tap';
DELETE FROM organizations WHERE name = 'Hội nghiên cứu AI Sinh viên';

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Organization
INSERT INTO organizations (id, name, description, logo_url, email, phone, office_location, type, owner_account_id, status, created_at, is_deleted) 
VALUES ('d68cd9c0-4cb2-4476-9a9f-ecd42ea25516', 'Hội nghiên cứu AI Sinh viên', 'Hội nghiên cứu và ứng dụng Trí tuệ Nhân tạo dành cho Sinh viên', 'https://picsum.photos/200/200?random=10', 'ai.student.association@iuh.edu.vn', '0901234567', 'Phòng CLB tầng 3 - Nhà H', 'CLUB', 'USE001', 'APPROVED', NOW(), 0);

-- 2. Event
INSERT INTO events (id, slug, title, description, event_topic, cover_image, location, event_mode, start_time, end_time, registration_deadline, created_by_account_id, organization_id, max_participants, type, status, is_deleted, check_in_enabled, feedback_enabled, qr_type, custom_fields_json, registered_count, has_lucky_draw, target_objects, recipients, interactions, interaction_settings, created_at, updated_at) 
VALUES ('d0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'ung-dung-ai-trong-hoc-tap', 'Ứng dụng AI trong học tập', 'Sự kiện chuyên đề đặc biệt hướng dẫn sinh viên khai thác tối đa sức mạnh của AI trong việc tự học, nghiên cứu khoa học và chuẩn bị hành trang sự nghiệp.', 'Trí tuệ nhân tạo và Giáo dục', 'https://picsum.photos/800/400?random=11', 'Hội trường chính A1, Đại học Công nghiệp TP.HCM', 'OFFLINE', '2026-05-21 00:00:00', '2026-05-23 23:59:50', '2026-05-20 23:59:59', 'USE001', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516', 30, 'SEMINAR', 'PUBLISHED', 0, 1, 1, 'STATIC', '{}', 30, 0, '[{"type": "STUDENT_YEAR", "values": [3, 4]}]', '[]', '[]', '{}', NOW(), NOW());

-- 3. Event Presenters
INSERT INTO event_presenters (id, assigned_at, is_deleted, presenter_account_id, event_id) VALUES 
('31423fc2-50c2-42d5-bf53-e02e341ec1b0', NOW(), 0, 'USE002', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a'),
('7ac244d2-d32a-4703-b832-1d636aeb9d46', NOW(), 0, 'USE003', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a'),
('1f3eb350-cd6c-4eec-b658-1873ec03175e', NOW(), 0, 'USE004', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a');

-- 4. Event Sessions
INSERT INTO event_sessions (id, event_id, created_at, description, end_time, is_deleted, order_index, room, start_time, title, type, updated_at, presenter_id) VALUES 
('35e4770c-727d-436d-bd9f-780ccf382922', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', NOW(), 'Khai phá các công cụ AI hỗ trợ ghi nhớ, tóm tắt tài liệu và lập lộ trình học tập hiệu quả.', '2026-05-21 11:00:00', 0, 1, 'Hội trường A1.1', '2026-05-21 09:00:00', 'AI hỗ trợ học tập', 'KEYNOTE', NOW(), '31423fc2-50c2-42d5-bf53-e02e341ec1b0'),
('77eb8e0a-20ed-499a-b3f0-56c1d4793d21', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', NOW(), 'Thực hành tạo slide thuyết trình, viết bài luận và biên tập video bằng AI chỉ trong vài phút.', '2026-05-22 16:00:00', 0, 2, 'Hội trường A1.2', '2026-05-22 14:00:00', 'AI tạo nội dung & thuyết trình', 'WORKSHOP', NOW(), '7ac244d2-d32a-4703-b832-1d636aeb9d46'),
('969c8d04-3d64-43ed-a6ad-b57eb44d587b', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', NOW(), 'Tọa đàm về ảnh hưởng của AI đến tương lai các ngành nghề và phương pháp thích ứng của sinh viên.', '2026-05-23 11:00:00', 0, 3, 'Hội trường A1.3', '2026-05-23 09:00:00', 'AI và tương lai giáo dục', 'PANEL', NOW(), '1f3eb350-cd6c-4eec-b658-1873ec03175e');

-- 4.5 Event Organizers
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) 
VALUES ('1f7310fd-58f4-4f90-b43d-29d1ef9d3c72', 'USE001', 'USE001', NOW(), 0, 'LEADER', 'ACTIVE', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516');
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) 
VALUES ('71154e9a-c16c-40b6-98ba-86d2820702e8', 'USE011', 'USE001', NOW(), 0, 'ADVISOR', 'ACTIVE', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516');
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) 
VALUES ('f39f0538-6d13-41de-9a2e-67f121331634', 'USE012', 'USE001', NOW(), 0, 'COORDINATOR', 'ACTIVE', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516');
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) 
VALUES ('50a0f54b-d86f-44a5-9164-d5fd315f999d', 'USE013', 'USE001', NOW(), 0, 'MEMBER', 'ACTIVE', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516');
INSERT INTO event_organizers (id, account_id, added_by_account_id, assigned_at, is_deleted, role, status, event_id, organization_id) 
VALUES ('7a8273d7-2ec6-48c8-afe9-ca2b047406e8', 'USE014', 'USE001', NOW(), 0, 'MEMBER', 'ACTIVE', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 'd68cd9c0-4cb2-4476-9a9f-ecd42ea25516');

-- 5. Event Registrations
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('ed5dc9b2-bb7a-473b-98d1-e52e92c5e3ac', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE016', 'token-ai-16', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-016', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('ff933f61-0d95-4e02-b28b-7e3254dbcacf', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE017', 'token-ai-17', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-017', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('4cb5699e-0c33-4069-9034-b38db28c52a5', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE018', 'token-ai-18', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-018', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('8849dbe8-e39d-456e-bce3-0853df5e10ad', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE019', 'token-ai-19', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-019', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('e26dc05a-5ba5-43d4-8c22-edf03a20ebbc', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE020', 'token-ai-20', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-020', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('51d798a9-4f6c-4370-9f06-0b5dc1bc550c', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE021', 'token-ai-21', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-021', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('a75b6128-99e3-4ac0-aa35-c2dbabcdcbc3', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE022', 'token-ai-22', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-022', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('af753a15-dc41-4a50-bc8e-e16f85e41c28', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE023', 'token-ai-23', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-023', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('4a8d5d3f-cd8a-42a2-8b77-3ccc8be83b15', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE024', 'token-ai-24', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-024', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('dde3acd0-ce9f-44c5-9db2-c2f9a029ac9e', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE025', 'token-ai-25', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-025', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('035df436-3988-45f1-af28-085ae3dc56a9', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE026', 'token-ai-26', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-026', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('4effeae9-b84e-4f59-b629-8e27aeb2c45f', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE027', 'token-ai-27', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-027', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('ead8240a-1f36-42b5-af02-e111efaf7b2e', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE028', 'token-ai-28', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-028', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('274a796e-5afb-4ff2-ad82-7e37df8ae68d', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE029', 'token-ai-29', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-029', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('f257f143-ed6c-4008-826c-8233ef4a946f', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE030', 'token-ai-30', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-030', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('9608fba7-c1bf-49a4-a396-938f99cc221b', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE031', 'token-ai-31', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-031', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('38b12c69-916d-4bc7-923e-20ee51ea3883', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE032', 'token-ai-32', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-032', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('e9cd919f-7c93-4346-adee-4a279785bb0e', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE033', 'token-ai-33', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-033', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('6dbeee7d-f90a-435e-ab3b-fce0409761a4', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE034', 'token-ai-34', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-034', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('59883613-bccc-4b05-9510-c208e7b1340f', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE035', 'token-ai-35', '2026-05-24 00:00:00', NOW(), 'REGISTERED', 'TKT-AI-035', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('5e9274a9-f618-4b56-99ab-338b6f295107', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE036', 'token-ai-36', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-036', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('86a78460-13d7-47e0-9303-3c0d4cbeea03', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE037', 'token-ai-37', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-037', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('30147338-804f-4f52-8057-f3ad841ac5c9', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE038', 'token-ai-38', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-038', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('62c8cd39-16d3-4243-bc60-3521e8227185', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE039', 'token-ai-39', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-039', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('73ca58f1-e085-4172-82c8-49ed79675ff6', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE040', 'token-ai-40', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-040', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('e556b365-0d06-4169-a552-c2f8d8ff9882', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE041', 'token-ai-41', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-041', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('c430ae9b-498b-49fd-9351-68c59404f0da', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE042', 'token-ai-42', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-042', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('792ddfb2-ebbb-44cc-8834-5c77fb34ce9a', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', '2026-05-21 08:30:00', 1, 'USE001', 0, 'USE043', 'token-ai-43', '2026-05-24 00:00:00', NOW(), 'ATTENDED', 'TKT-AI-043', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('a2299b67-72cb-4612-b758-8a05285f6d15', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE044', 'token-ai-44', '2026-05-24 00:00:00', NOW(), 'CANCELLED', 'TKT-AI-044', NOW());
INSERT INTO event_registrations (id, event_id, answers_json, check_in_time, checked_in, checked_in_by_account_id, is_deleted, participant_account_id, qr_token, qr_token_expiry, registered_at, status, ticket_code, updated_at) 
VALUES ('ae3a7cd6-b489-4135-a2db-990fd483f180', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', '{}', NULL, 0, NULL, 0, 'USE045', 'token-ai-45', '2026-05-24 00:00:00', NOW(), 'CANCELLED', 'TKT-AI-045', NOW());

-- 6. 5 Event Posts with 3 Comments each
-- Post 1
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('9ebe4f1d-5848-4aa2-b19b-a2a12920a42e', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 1, 'USE001', 'Chính thức công bố sự kiện chuyên đề hot nhất năm dành cho sinh viên muốn làm chủ tương lai học tập bằng Trí tuệ Nhân tạo.', NOW(), '["https://picsum.photos/600/300?random=120"]', 0, 1, 'ANNOUNCEMENT', NOW(), '{}', 'post-ai-in-studying-p-1', 'PUBLISHED', 'Công bố sự kiện: Ứng dụng AI trong học tập', NOW(), 25);

  -- Comments for Post 1
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('f5657de8-8359-456b-831e-d693d7964141', 'USE034', 'Chương trình chất lượng', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '9ebe4f1d-5848-4aa2-b19b-a2a12920a42e', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('6f6b7af2-3aeb-4281-82ed-f054fe712387', 'USE028', 'Rất bổ ích ạ', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '9ebe4f1d-5848-4aa2-b19b-a2a12920a42e', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('6312ac8e-0940-4f56-bf3e-89df9d0776d0', 'USE016', 'AI đang rất hot', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '9ebe4f1d-5848-4aa2-b19b-a2a12920a42e', 0, NULL);

-- Post 2
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('1bc9b2da-3354-4d84-9f78-e0f56223e8f3', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 1, 'USE001', 'Giới thiệu 3 diễn giả cực chất của chương trình: super_admin_002, 003, và 004 từ Viện nghiên cứu AI.', NOW(), '["https://picsum.photos/600/300?random=121"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'post-ai-in-studying-p-2', 'PUBLISHED', 'Giới thiệu diễn giả: Đội ngũ chuyên gia AI hàng đầu', NOW(), 25);

  -- Comments for Post 2
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('e36e14d4-0afc-4ae3-95a8-e6f219d836b0', 'USE023', 'Rất bổ ích ạ', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '1bc9b2da-3354-4d84-9f78-e0f56223e8f3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('be6383ae-8003-402d-8888-78a05d3b0e99', 'USE021', 'AI đang rất hot', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '1bc9b2da-3354-4d84-9f78-e0f56223e8f3', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('ef155922-0b69-4906-b4c7-6747272bf4d2', 'USE022', 'Chủ đề hay quá', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '1bc9b2da-3354-4d84-9f78-e0f56223e8f3', 0, NULL);

-- Post 3
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('0d189940-e5b4-44a7-ada3-8413ba8d9d6e', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 1, 'USE001', 'Chi tiết lịch trình 3 phiên thảo luận chất lượng cao diễn ra từ ngày 21 đến ngày 23 tháng 5 năm 2026.', NOW(), '["https://picsum.photos/600/300?random=122"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'post-ai-in-studying-p-3', 'PUBLISHED', 'Lịch trình chương trình chi tiết', NOW(), 25);

  -- Comments for Post 3
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('3426bef0-d49f-411c-878e-734b7f8b64e0', 'USE031', 'Diễn giả xịn quá', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '0d189940-e5b4-44a7-ada3-8413ba8d9d6e', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('b7637682-9997-4ff6-a317-34a8fba5bf9b', 'USE018', 'Cho em xin tài liệu thuyết trình với ạ', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '0d189940-e5b4-44a7-ada3-8413ba8d9d6e', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('719ec19d-8c31-41fe-a4d2-f2a5a45706f4', 'USE029', 'AI đỉnh thật', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '0d189940-e5b4-44a7-ada3-8413ba8d9d6e', 0, NULL);

-- Post 4
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('bde7488f-70c1-49af-ac31-941bde4401f0', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 1, 'USE001', 'Bài viết hướng dẫn sinh viên quét mã QR tĩnh tại cửa hội trường để thực hiện điểm danh và nhận tài liệu.', NOW(), '["https://picsum.photos/600/300?random=123"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'post-ai-in-studying-p-4', 'PUBLISHED', 'Hướng dẫn check-in tham gia sự kiện', NOW(), 25);

  -- Comments for Post 4
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('a0f779b6-50fc-4342-9520-83142456b1cd', 'USE033', 'Tuyệt vời', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'bde7488f-70c1-49af-ac31-941bde4401f0', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('d2c0ce23-0cfb-4c64-8e3a-5e00c36ec7d2', 'USE040', 'Mong chờ quá đi', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'bde7488f-70c1-49af-ac31-941bde4401f0', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('84cec91d-c6f3-4207-a35e-5a7d5c6fe53e', 'USE027', 'Chương trình chất lượng', NOW(), '[]', 0, 0, '{}', NOW(), NULL, 'bde7488f-70c1-49af-ac31-941bde4401f0', 0, NULL);

-- Post 5
INSERT INTO event_posts (id, event_id, allow_comments, author_account_id, content, created_at, image_urls, is_deleted, is_pinned, post_type, published_at, reactions, slug, status, title, updated_at, view_count) 
VALUES ('5d1d150a-feab-4f2e-9bfa-6061870e04f6', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', 1, 'USE001', 'Tổng kết các kết quả đạt được, hình ảnh đẹp nhất của chuỗi hoạt động 3 ngày vừa qua. Hẹn gặp lại các bạn!', NOW(), '["https://picsum.photos/600/300?random=124"]', 0, 0, 'ANNOUNCEMENT', NOW(), '{}', 'post-ai-in-studying-p-5', 'PUBLISHED', 'Tổng kết sự kiện và trao giải thưởng', NOW(), 25);

  -- Comments for Post 5
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('afe3f24d-5396-49ff-91e8-caeabdfb786d', 'USE016', 'Tuyệt vời', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '5d1d150a-feab-4f2e-9bfa-6061870e04f6', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('ad70deab-bb5d-4241-bf02-977791b89734', 'USE026', 'AI đang rất hot', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '5d1d150a-feab-4f2e-9bfa-6061870e04f6', 0, NULL);
  INSERT INTO post_comments (id, commenter_account_id, content, created_at, image_urls, is_deleted, is_edited, reactions, updated_at, parent_id, post_id, is_anonymous, anonymous_identity) 
  VALUES ('f2eaa2d6-f4df-404b-a820-f85ee724eb8b', 'USE034', 'Có record không ạ?', NOW(), '[]', 0, 0, '{}', NOW(), NULL, '5d1d150a-feab-4f2e-9bfa-6061870e04f6', 0, NULL);

-- 7. Quiz
INSERT INTO quizzes (id, event_id, created_at, description, is_active, title) 
VALUES ('8b58bdb2-391f-42b3-a794-a623c375cf38', 'd0cb306c-3e5e-4de7-98d8-9d2788ac599a', NOW(), 'Quiz khảo sát và kiểm tra kiến thức về Trí tuệ Nhân tạo hỗ trợ học tập hiệu quả. Điểm đạt: 70/100.', 1, 'Quiz kiến thức AI trong học tập');

  -- Question 1 (AI cơ bản)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('6ce6619e-d17b-4b36-af45-771fcd545d40', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'AI viết tắt của từ tiếng Anh nào?', NULL, 'AI cơ bản', 1, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 1
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('1e52e7bb-293a-40b7-b9fc-aa5dcb756d3e', '6ce6619e-d17b-4b36-af45-771fcd545d40', 'Artificial Intelligence', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('0aa22dea-2731-468d-a1e5-37be6931e1af', '6ce6619e-d17b-4b36-af45-771fcd545d40', 'Automated Information', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ddd2acb1-00cd-4a22-b0b9-da66eeeed0e9', '6ce6619e-d17b-4b36-af45-771fcd545d40', 'Advanced Integration', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('0c3299b3-59d3-452c-88d9-dba859187a96', '6ce6619e-d17b-4b36-af45-771fcd545d40', 'Agentic Initiative', 0, NULL);

  -- Question 2 (AI cơ bản)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('b6fb6282-d00d-4ce7-8c81-727b67a343a1', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Ai được mệnh danh là cha đẻ của ngành Trí tuệ Nhân tạo?', NULL, 'AI cơ bản', 2, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 2
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('a04288bf-729c-4daf-87fd-6cb503680f96', 'b6fb6282-d00d-4ce7-8c81-727b67a343a1', 'John McCarthy', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('39146db2-374d-4e78-9ecd-59c1c15f9f2b', 'b6fb6282-d00d-4ce7-8c81-727b67a343a1', 'Bill Gates', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('7c9b0990-f2b6-4e31-a8d7-15a1e64b4f9b', 'b6fb6282-d00d-4ce7-8c81-727b67a343a1', 'Ada Lovelace', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('270eaf6f-02e4-4502-a887-658d89426205', 'b6fb6282-d00d-4ce7-8c81-727b67a343a1', 'Alan Turing', 0, NULL);

  -- Question 3 (AI cơ bản)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('6172811c-3188-476b-88d5-1774a2ab9f98', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Phép thử Turing dùng để làm gì?', NULL, 'AI cơ bản', 3, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 3
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('c1e64408-2f5b-4e4a-b032-e6c36469b142', '6172811c-3188-476b-88d5-1774a2ab9f98', 'Kiểm tra tính bảo mật của mạng máy tính', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('18f18700-85b5-423d-8cfa-8cc66be62e20', '6172811c-3188-476b-88d5-1774a2ab9f98', 'Đánh giá khả năng suy nghĩ giống con người của máy tính', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ce579a29-67c3-47b1-9e50-1ad099fce0ba', '6172811c-3188-476b-88d5-1774a2ab9f98', 'Đo tốc độ xử lý của vi xử lý', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('f5c9e89c-70b1-46a8-9f02-eefb50d5b35f', '6172811c-3188-476b-88d5-1774a2ab9f98', 'Xác định dung lượng lưu trữ tối đa', 0, NULL);

  -- Question 4 (AI cơ bản)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('ce273c9b-3c4f-4c9d-806b-773715b406c9', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Đâu là một nhánh chính của AI tập trung vào việc học từ dữ liệu?', NULL, 'AI cơ bản', 4, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 4
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('e3d7c63c-2edb-4eb5-84d2-f859761306a1', 'ce273c9b-3c4f-4c9d-806b-773715b406c9', 'Machine Learning (Học máy)', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('1fb38f74-8b74-4c7e-9b82-279184878259', 'ce273c9b-3c4f-4c9d-806b-773715b406c9', 'Web Development (Phát triển Web)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('89b9dc4a-757c-4323-be65-a01eb141813b', 'ce273c9b-3c4f-4c9d-806b-773715b406c9', 'Cryptography (Mật mã học)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('eb580d8e-e92e-4674-a781-095853df22d9', 'ce273c9b-3c4f-4c9d-806b-773715b406c9', 'Database Management (Quản lý CSDL)', 0, NULL);

  -- Question 5 (AI cơ bản)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('09badbc0-7f0e-4490-9b74-fd742454aa82', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Hệ chuyên gia (Expert System) thuộc thế hệ AI nào?', NULL, 'AI cơ bản', 5, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 5
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('9327e1a9-9a08-47d4-9169-df226e5cca1e', '09badbc0-7f0e-4490-9b74-fd742454aa82', 'Thế hệ AI cổ điển (Luật và suy luận logic)', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('34cbf0c1-c4a0-4dd0-89ee-038409b03281', '09badbc0-7f0e-4490-9b74-fd742454aa82', 'Thế hệ học sâu (Deep Learning)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('700208bb-4d63-41f6-8aca-07b2c8a9c878', '09badbc0-7f0e-4490-9b74-fd742454aa82', 'Thế hệ mạng Transformer', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('fb48c4cd-6725-49ed-b8b2-682fc9bb6643', '09badbc0-7f0e-4490-9b74-fd742454aa82', 'Thế hệ tác nhân tự chủ (AI Agents)', 0, NULL);

  -- Question 6 (ChatGPT)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('a429aec9-0288-4beb-9aae-351cd5c20019', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'ChatGPT được phát triển bởi tổ chức nào?', NULL, 'ChatGPT', 6, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 6
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('d297d97f-8a8f-42db-9781-bc4fc1f7a836', 'a429aec9-0288-4beb-9aae-351cd5c20019', 'OpenAI', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('bede120f-c56f-4d0d-b7a1-6efdd0c664d5', 'a429aec9-0288-4beb-9aae-351cd5c20019', 'Google DeepMind', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('975e28bf-e65d-4918-9f60-7455c273c225', 'a429aec9-0288-4beb-9aae-351cd5c20019', 'Microsoft Research', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('51bcb224-b3dd-41bd-b9f2-c43e1e09302b', 'a429aec9-0288-4beb-9aae-351cd5c20019', 'Meta AI', 0, NULL);

  -- Question 7 (ChatGPT)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('fbf6cfc8-0808-4601-aa31-6a77ef8ec50b', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Chữ G trong GPT là viết tắt của từ gì?', NULL, 'ChatGPT', 7, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 7
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('90a3f6b8-e0be-4849-b2fa-af7ab51f5831', 'fbf6cfc8-0808-4601-aa31-6a77ef8ec50b', 'General', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('892003d5-aeae-4891-8ab0-47c504c19278', 'fbf6cfc8-0808-4601-aa31-6a77ef8ec50b', 'Global', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('945a012c-8427-4562-9efe-2fcb227bcc08', 'fbf6cfc8-0808-4601-aa31-6a77ef8ec50b', 'Generative', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('927276b8-8f4d-4940-bfea-aee349d948da', 'fbf6cfc8-0808-4601-aa31-6a77ef8ec50b', 'Graphic', 0, NULL);

  -- Question 8 (ChatGPT)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('7c4dfc3c-de23-45cd-b048-abbac6e5d8e5', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Mô hình ngôn ngữ lớn (LLM) hoạt động dựa trên cấu trúc mạng nào?', NULL, 'ChatGPT', 8, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 8
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('b9f4462c-e4a8-4ea5-ac2c-1bd1c3c249c1', '7c4dfc3c-de23-45cd-b048-abbac6e5d8e5', 'Convolutional Neural Network (CNN)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('2468e00d-f466-48c7-9f50-c865e18455ca', '7c4dfc3c-de23-45cd-b048-abbac6e5d8e5', 'Support Vector Machine (SVM)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('e1e07073-8538-4dbf-b9c7-2a53168636d3', '7c4dfc3c-de23-45cd-b048-abbac6e5d8e5', 'Recurrent Neural Network (RNN)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('6f759137-4431-48bd-ae9d-a98b551cb94a', '7c4dfc3c-de23-45cd-b048-abbac6e5d8e5', 'Transformer', 1, NULL);

  -- Question 9 (ChatGPT)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('b9327045-83d6-4fb2-9843-4c88f4bc7911', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Tính năng chính của ChatGPT là gì?', NULL, 'ChatGPT', 9, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 9
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('c354880f-2683-439b-b9eb-62dbcc416b8b', 'b9327045-83d6-4fb2-9843-4c88f4bc7911', 'Quét virus và bảo mật hệ thống', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('473b011d-3379-4596-b395-442f0874af7c', 'b9327045-83d6-4fb2-9843-4c88f4bc7911', 'Lưu trữ dữ liệu đám mây', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('cada6de2-8796-4a2d-aa97-299f632fbc68', 'b9327045-83d6-4fb2-9843-4c88f4bc7911', 'Tạo văn bản và trả lời tự động qua giao tiếp hội thoại', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('53bf4b36-4f67-4898-a0d7-141dc81f1d2f', 'b9327045-83d6-4fb2-9843-4c88f4bc7911', 'Dịch ngôn ngữ trực tiếp qua cuộc gọi', 0, NULL);

  -- Question 10 (ChatGPT)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('6eae2a80-2572-4cf9-acf3-40bc4eb1f67b', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Phiên bản GPT-4 được ra mắt lần đầu vào năm nào?', NULL, 'ChatGPT', 10, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 10
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('a1e2c335-7e34-48a1-b6f3-8404019d30dd', '6eae2a80-2572-4cf9-acf3-40bc4eb1f67b', '2023', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('2b14a240-3f42-46d3-ba41-b1fd3e088953', '6eae2a80-2572-4cf9-acf3-40bc4eb1f67b', '2021', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('6cc7e519-8c36-47b4-89fe-f50c7b121650', '6eae2a80-2572-4cf9-acf3-40bc4eb1f67b', '2024', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('73307acf-c56e-4608-841c-3b613242ad9e', '6eae2a80-2572-4cf9-acf3-40bc4eb1f67b', '2022', 0, NULL);

  -- Question 11 (AI học tập)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('f330c6f8-f324-4e9c-bad2-e446ccbd514f', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Ứng dụng nào dùng AI để giúp học từ vựng tiếng Anh qua hội thoại?', NULL, 'AI học tập', 11, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 11
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('1d1c876f-350d-4b49-8693-a3ebdab6d7ef', 'f330c6f8-f324-4e9c-bad2-e446ccbd514f', 'Photomath', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('56df017f-e316-4921-a4b3-2de03b15de4a', 'f330c6f8-f324-4e9c-bad2-e446ccbd514f', 'Coursera', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('918fbe4c-4d1f-4b4c-9f2f-c977e036fa01', 'f330c6f8-f324-4e9c-bad2-e446ccbd514f', 'Wikipedia', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('d9122a24-cae4-42aa-87be-777443eeeed6', 'f330c6f8-f324-4e9c-bad2-e446ccbd514f', 'Duolingo', 1, NULL);

  -- Question 12 (AI học tập)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('5fa570db-8287-44f5-aa2f-f898a43ff665', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'AI giúp ích gì trong việc cá nhân hóa lộ trình học tập?', NULL, 'AI học tập', 12, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 12
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('74bb37ea-7131-4441-9fdf-b66c0876253b', '5fa570db-8287-44f5-aa2f-f898a43ff665', 'Tự động đề xuất bài học dựa trên năng lực cá nhân', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('06942c47-6db1-4a71-abf7-639d8560be1d', '5fa570db-8287-44f5-aa2f-f898a43ff665', 'Thay thế hoàn toàn vai trò của giáo viên', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('68567f9d-184f-4fef-a6a1-7fc86f2db16c', '5fa570db-8287-44f5-aa2f-f898a43ff665', 'Giảm thời gian tự học của học sinh xuống 0', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('40eba5c5-c54e-4dac-9881-8ba176afcd88', '5fa570db-8287-44f5-aa2f-f898a43ff665', 'Tự động cho điểm 10 cho mọi bài kiểm tra', 0, NULL);

  -- Question 13 (AI học tập)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('c7e85dc0-ccb4-4e74-a2a9-3cb3a534abb3', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Đâu là công cụ AI hỗ trợ viết và chỉnh sửa ngữ pháp tiếng Anh phổ biến?', NULL, 'AI học tập', 13, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 13
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('794ceb18-1caf-4d02-8eac-79697e9a8545', 'c7e85dc0-ccb4-4e74-a2a9-3cb3a534abb3', 'Midjourney', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('765d1289-ce75-4faf-a4bc-a7a3473ff85b', 'c7e85dc0-ccb4-4e74-a2a9-3cb3a534abb3', 'Grammarly', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ed8000b2-723e-4b4d-9424-6c4c3b60f332', 'c7e85dc0-ccb4-4e74-a2a9-3cb3a534abb3', 'Canva', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ca9d34a7-c43b-4286-b057-3c5db703ebe4', 'c7e85dc0-ccb4-4e74-a2a9-3cb3a534abb3', 'GitHub Copilot', 0, NULL);

  -- Question 14 (AI học tập)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('d65d1cb8-4bde-44aa-93f7-c81ce6c1805b', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Công cụ nào của Google hỗ trợ tìm kiếm bài báo khoa học và công trình nghiên cứu?', NULL, 'AI học tập', 14, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 14
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('8f40f9eb-9cad-49d3-b46f-d7d9684f42b2', 'd65d1cb8-4bde-44aa-93f7-c81ce6c1805b', 'Google Images', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('6929ca87-1365-4936-9df1-f859db312b62', 'd65d1cb8-4bde-44aa-93f7-c81ce6c1805b', 'Google Translate', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('9051bc1f-5780-438d-86a5-4634f3af8fc4', 'd65d1cb8-4bde-44aa-93f7-c81ce6c1805b', 'Google Drive', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('7f62888c-890a-43a1-8099-b3088b000e97', 'd65d1cb8-4bde-44aa-93f7-c81ce6c1805b', 'Google Scholar', 1, NULL);

  -- Question 15 (AI học tập)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('f1a88d77-5c4c-4fc5-89a8-d666e60b5155', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'AI hỗ trợ giáo viên chấm bài tự động dựa trên công nghệ nào?', NULL, 'AI học tập', 15, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 15
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('1e6b8199-a14d-4dbd-8c51-ca078a825727', 'f1a88d77-5c4c-4fc5-89a8-d666e60b5155', 'Công nghệ Blockchain', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('2ce5f8eb-8935-4b60-a58e-bc30af923648', 'f1a88d77-5c4c-4fc5-89a8-d666e60b5155', 'Nhận dạng ký tự quang học (OCR) và xử lý ngôn ngữ tự nhiên (NLP)', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('bd6b03c7-cbe4-4869-8e08-0d62c8af6216', 'f1a88d77-5c4c-4fc5-89a8-d666e60b5155', 'Đồ họa máy tính 3D', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ad032ada-883b-47d9-b416-f0399d00614a', 'f1a88d77-5c4c-4fc5-89a8-d666e60b5155', 'Lập trình nhúng vi điều khiển', 0, NULL);

  -- Question 16 (Đạo đức AI)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('121557f8-f131-4ce3-a4e8-8aec555bc6e4', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Hiện tượng AI tạo ra thông tin không có thực nhưng trình bày như thật gọi là gì?', NULL, 'Đạo đức AI', 16, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 16
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('ec783552-6c70-4099-88bd-b4d7289b5e56', '121557f8-f131-4ce3-a4e8-8aec555bc6e4', 'Sự quá khớp (Overfitting)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('b5a53745-5018-4cb3-a922-55013e7a0919', '121557f8-f131-4ce3-a4e8-8aec555bc6e4', 'Lỗi tràn bộ nhớ (Buffer Overflow)', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('5bedcc01-2305-49a1-b18e-62256e9bfd16', '121557f8-f131-4ce3-a4e8-8aec555bc6e4', 'Sự ảo tưởng (Hallucination)', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('00f712b7-5c56-4f6c-97fc-5ed3f69f54f3', '121557f8-f131-4ce3-a4e8-8aec555bc6e4', 'Độ trễ phản hồi (Latency)', 0, NULL);

  -- Question 17 (Đạo đức AI)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('5ff898da-ddf7-41f6-8848-0d9da6b10424', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Tại sao việc bảo mật dữ liệu cá nhân lại quan trọng khi dùng AI?', NULL, 'Đạo đức AI', 17, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 17
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('7605caee-66a6-4c6e-a048-aba591408242', '5ff898da-ddf7-41f6-8848-0d9da6b10424', 'Tránh rò rỉ thông tin cá nhân dùng để huấn luyện mô hình', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('fec9682e-8c9f-4f6a-b1a7-02acda20ea6f', '5ff898da-ddf7-41f6-8848-0d9da6b10424', 'Để tránh quảng cáo trực tuyến', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('2a0d2642-8e26-4628-9682-19ff9e009f92', '5ff898da-ddf7-41f6-8848-0d9da6b10424', 'Để máy tính chạy nhanh hơn', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('e6f11036-0daf-4d37-a37a-0bb17a65fe36', '5ff898da-ddf7-41f6-8848-0d9da6b10424', 'Để tăng dung lượng ổ cứng', 0, NULL);

  -- Question 18 (Đạo đức AI)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('de8ef621-977d-47be-b6dc-24a2f8d8aeb9', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Đạo đức AI (AI Ethics) tập trung giải quyết vấn đề nào sau đây?', NULL, 'Đạo đức AI', 18, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 18
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('8bf6a0f9-c970-498d-a4fa-ab69213efee7', 'de8ef621-977d-47be-b6dc-24a2f8d8aeb9', 'Loại bỏ hoàn toàn lập trình viên con người', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('12fcea49-38f8-4e15-a161-3cc2e8a22b6a', 'de8ef621-977d-47be-b6dc-24a2f8d8aeb9', 'Đảm bảo sự công bằng, minh bạch và an toàn của AI', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('6f18996a-9297-4005-b450-2f5d0e55d00b', 'de8ef621-977d-47be-b6dc-24a2f8d8aeb9', 'Tăng tốc độ phát triển của các phần cứng máy tính', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('078b7353-2c16-4443-b70a-e644c1e75046', 'de8ef621-977d-47be-b6dc-24a2f8d8aeb9', 'Tối ưu hóa lợi nhuận của doanh nghiệp công nghệ', 0, NULL);

  -- Question 19 (Đạo đức AI)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('26741c8f-c65a-4819-ae69-1dcacb9dd232', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Plagiarism (Đạo văn) liên quan thế nào đến việc sử dụng AI học tập?', NULL, 'Đạo đức AI', 19, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 19
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('400fc1c5-adf7-4d5d-881b-b64a4d7017be', '26741c8f-c65a-4819-ae69-1dcacb9dd232', 'Gửi bài viết cho bạn bè cùng lớp tham khảo', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('d0da7728-88f9-4bd2-b9ca-9ef3c090aecf', '26741c8f-c65a-4819-ae69-1dcacb9dd232', 'Copy nguyên văn bài làm do AI sinh ra mà không trích dẫn hoặc tự làm', 1, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('30989bda-6af6-49cf-8503-ff4efd7fc579', '26741c8f-c65a-4819-ae69-1dcacb9dd232', 'Sử dụng AI để sửa lỗi chính tả tự động', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('8920a806-3455-4231-8f1d-7008aa54a6d4', '26741c8f-c65a-4819-ae69-1dcacb9dd232', 'Tham khảo ý tưởng của AI rồi tự viết lại bằng giọng văn riêng', 0, NULL);

  -- Question 20 (Đạo đức AI)
  INSERT INTO quiz_questions (id, quiz_id, base_points, content, correct_data, hint, order_index, time_limit, type) 
  VALUES ('87f2cc1b-cdbd-4d44-b068-5ed339216ad4', '8b58bdb2-391f-42b3-a794-a623c375cf38', 5, 'Nguyên tắc hàng đầu khi sử dụng AI trong nghiên cứu học thuật là gì?', NULL, 'Đạo đức AI', 20, 60, 'MULTIPLE_CHOICE');

  -- Options for Question 20
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('d480741e-1738-4627-b3bc-d8aabecf7108', '87f2cc1b-cdbd-4d44-b068-5ed339216ad4', 'Không cần kiểm tra lại độ chính xác của thông tin do AI đưa ra', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('f7bb5687-90f9-4b4c-b95f-ef5c0ab3ce06', '87f2cc1b-cdbd-4d44-b068-5ed339216ad4', 'Chia sẻ tài khoản trả phí cho nhiều người cùng dùng', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('b345690d-d988-4fc1-8de9-fbe5b6f2ce39', '87f2cc1b-cdbd-4d44-b068-5ed339216ad4', 'Để AI viết hoàn toàn 100% nội dung bài luận', 0, NULL);
  INSERT INTO quiz_options (id, question_id, content, is_correct, matching_key) 
  VALUES ('6feded61-7fe1-4b6a-bc36-b35d50994600', '87f2cc1b-cdbd-4d44-b068-5ed339216ad4', 'Sử dụng như công cụ hỗ trợ và tự chịu trách nhiệm về nội dung', 1, NULL);
