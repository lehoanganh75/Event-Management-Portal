-- 1. Xóa dữ liệu cũ nếu có
DELETE FROM event_surveys;
DELETE FROM quizzes;
DELETE FROM recaps;
DELETE FROM event_invitations;
DELETE FROM event_feedbacks;
DELETE FROM event_posts;
DELETE FROM event_registrations;
DELETE FROM event_sessions;
DELETE FROM event_presenters;
DELETE FROM event_organizers;
DELETE FROM events;
DELETE FROM organizations;

-- 2. Thêm Organizations
INSERT INTO organizations (id, name, description, type, owner_account_id, is_deleted, created_at) VALUES
('e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'Khoa Công Nghệ Thông Tin', 'Khoa Công Nghệ Thông Tin - Đại học Công nghiệp TP.HCM', 'FACULTY', 'USE001', 0, NOW()),
('519e8daf-6a91-4509-acff-5f263733a7f2', 'CLB Kỹ Năng Mềm', 'Câu lạc bộ kỹ năng mềm IUH', 'CLUB', 'USE006', 0, NOW()),
('4517fa9b-1834-4542-ae5e-7a77f69f3a31', 'Phòng Công Tác Sinh Viên', 'Phòng quản lý công tác sinh viên IUH', 'DEPARTMENT', 'USE002', 0, NOW());

-- 3. Thêm Events
INSERT INTO events (id, slug, title, description, event_topic, location, event_mode, start_time, end_time, registration_deadline, created_by_account_id, organization_id, max_participants, type, status, is_deleted, check_in_enabled, qr_type, created_at, updated_at, has_lucky_draw, registered_count, custom_fields_json, target_objects, recipients, interactions, interaction_settings) VALUES
('d1f55432-3b93-4366-9226-09a2e5af8f8a', 'event-1-1322', 'Hội thảo Trí tuệ nhân tạo (AI)', 'Mô tả sự kiện Hội thảo Trí tuệ nhân tạo (AI)', 'Career', 'Hội trường E4', 'OFFLINE', '2026-05-17 09:19:50', '2026-05-17 13:19:50', '2026-05-12 09:19:50', 'USE004', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'SEMINAR', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('20a1d148-811b-439a-9a54-1983082e66fb', 'event-2-4678', 'Cuộc thi Lập trình sinh viên quốc tế', 'Mô tả sự kiện Cuộc thi Lập trình sinh viên quốc tế', 'Education', 'Hội trường E4', 'OFFLINE', '2026-06-26 08:33:29', '2026-06-26 14:33:29', '2026-06-22 08:33:29', 'USE003', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 200, 'WORKSHOP', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69', 'event-3-2716', 'Ngày hội Việc làm IT Job Fair 2026', 'Mô tả sự kiện Ngày hội Việc làm IT Job Fair 2026', 'Education', 'Hội trường A1', 'OFFLINE', '2026-05-16 19:45:14', '2026-05-16 23:45:14', '2026-05-14 19:45:14', 'USE015', '519e8daf-6a91-4509-acff-5f263733a7f2', 100, 'WORKSHOP', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('ca1e952b-505d-4fc4-b5cb-f2120481ab5c', 'event-4-4338', 'Workshop: Kỹ năng viết CV ấn tượng', 'Mô tả sự kiện Workshop: Kỹ năng viết CV ấn tượng', 'Education', 'Hội trường E4', 'ONLINE', '2026-06-17 17:39:09', '2026-06-17 20:39:09', '2026-06-12 17:39:09', 'USE002', '519e8daf-6a91-4509-acff-5f263733a7f2', 100, 'WORKSHOP', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('bf2f2b1a-98a7-488f-8c6a-a08540364f6d', 'event-5-2562', 'Talkshow: Khởi nghiệp công nghệ', 'Mô tả sự kiện Talkshow: Khởi nghiệp công nghệ', 'Technology', 'Hội trường A1', 'ONLINE', '2026-06-08 21:36:57', '2026-06-09 02:36:57', '2026-06-06 21:36:57', 'USE004', '519e8daf-6a91-4509-acff-5f263733a7f2', 100, 'SEMINAR', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('55b8e55c-88e1-48dd-b5d7-2a35b5ea4167', 'event-6-9118', 'Giao lưu văn nghệ', 'Mô tả sự kiện Giao lưu văn nghệ', 'Soft Skills', 'Hội trường E4', 'OFFLINE', '2026-05-04 19:17:18', '2026-05-04 22:17:18', '2026-04-29 19:17:18', 'USE004', '519e8daf-6a91-4509-acff-5f263733a7f2', 200, 'SEMINAR', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('67c55754-8ab3-4026-a00b-567b1f86629d', 'event-7-9981', 'Lễ vinh danh sinh viên xuất sắc', 'Mô tả sự kiện Lễ vinh danh sinh viên xuất sắc', 'Technology', 'Hội trường E4', 'ONLINE', '2026-06-17 18:49:17', '2026-06-17 20:49:17', '2026-06-12 18:49:17', 'USE004', '4517fa9b-1834-4542-ae5e-7a77f69f3a31', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('c094cee4-2043-4f99-842e-38a171613fef', 'event-8-7317', 'Tập huấn PCCC', 'Mô tả sự kiện Tập huấn PCCC', 'Entertainment', 'Hội trường E4', 'ONLINE', '2026-06-17 06:26:07', '2026-06-17 10:26:07', '2026-06-13 06:26:07', 'USE012', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'SEMINAR', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('fbe6b4e3-eb13-46fc-9153-af02edcab02e', 'event-9-2340', 'Cuộc thi Hùng biện tiếng Anh', 'Mô tả sự kiện Cuộc thi Hùng biện tiếng Anh', 'Career', 'Hội trường A1', 'ONLINE', '2026-04-22 14:36:08', '2026-04-22 18:36:08', '2026-04-19 14:36:08', 'USE002', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('b67c6385-fa6d-4745-9419-de07372bd6b6', 'event-10-3149', 'Sinh hoạt chuyên đề Khoa CNTT', 'Mô tả sự kiện Sinh hoạt chuyên đề Khoa CNTT', 'Soft Skills', 'Hội trường A1', 'ONLINE', '2026-06-29 10:04:07', '2026-06-29 16:04:07', '2026-06-25 10:04:07', 'USE005', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('30585fce-bf04-422a-921d-384360791f73', 'event-11-3609', 'Giải bóng đá nam', 'Mô tả sự kiện Giải bóng đá nam', 'Career', 'Hội trường E4', 'OFFLINE', '2026-04-23 01:03:09', '2026-04-23 07:03:09', '2026-04-19 01:03:09', 'USE007', '4517fa9b-1834-4542-ae5e-7a77f69f3a31', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('3b405567-6542-47a4-8f18-f5efe4d26cf0', 'event-12-8876', 'Tọa đàm: Blockchain', 'Mô tả sự kiện Tọa đàm: Blockchain', 'Career', 'Hội trường E4', 'OFFLINE', '2026-04-06 12:49:30', '2026-04-06 14:49:30', '2026-04-01 12:49:30', 'USE005', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 200, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('f3f1e457-1211-4604-b54b-0c57a270c55a', 'event-13-2722', 'Webinar: Kỹ năng phỏng vấn', 'Mô tả sự kiện Webinar: Kỹ năng phỏng vấn', 'Entertainment', 'Hội trường E4', 'ONLINE', '2026-04-09 21:00:25', '2026-04-09 23:00:25', '2026-04-04 21:00:25', 'USE011', '519e8daf-6a91-4509-acff-5f263733a7f2', 100, 'SEMINAR', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1', 'event-14-8803', 'Hội thao truyền thống', 'Mô tả sự kiện Hội thao truyền thống', 'Technology', 'Hội trường A1', 'ONLINE', '2026-04-07 14:45:17', '2026-04-07 16:45:17', '2026-04-06 14:45:17', 'USE001', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'WORKSHOP', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('7ff7ceda-73b0-4df1-98ab-d8394a706048', 'event-15-9776', 'Lớp học kỹ năng mềm', 'Mô tả sự kiện Lớp học kỹ năng mềm', 'Career', 'Hội trường E4', 'OFFLINE', '2026-06-25 20:37:37', '2026-06-26 02:37:37', '2026-06-20 20:37:37', 'USE004', '4517fa9b-1834-4542-ae5e-7a77f69f3a31', 100, 'SEMINAR', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('ec4cab90-f1f0-4432-91e7-7901e9dd8454', 'event-16-2992', 'Seminar: Bảo mật', 'Mô tả sự kiện Seminar: Bảo mật', 'Education', 'Hội trường E4', 'OFFLINE', '2026-04-14 20:01:14', '2026-04-15 01:01:14', '2026-04-10 20:01:14', 'USE008', 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('314aa2e8-c30a-4bdd-8ed6-5c8edf994a87', 'event-17-1044', 'Cuộc thi Hackathon Mùa xuân', 'Mô tả sự kiện Cuộc thi Hackathon Mùa xuân', 'Entertainment', 'Hội trường E4', 'OFFLINE', '2026-06-08 14:26:09', '2026-06-08 16:26:09', '2026-06-07 14:26:09', 'USE001', '4517fa9b-1834-4542-ae5e-7a77f69f3a31', 200, 'SEMINAR', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('19d92c5a-11d8-4b03-abd8-6964c698a27d', 'event-18-5123', 'Lễ hội mùa đông', 'Mô tả sự kiện Lễ hội mùa đông', 'Soft Skills', 'Hội trường A1', 'ONLINE', '2026-06-12 05:43:10', '2026-06-12 10:43:10', '2026-06-08 05:43:10', 'USE013', '519e8daf-6a91-4509-acff-5f263733a7f2', 200, 'WORKSHOP', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f', 'event-19-4535', 'Talkshow: Định hướng nghề nghiệp', 'Mô tả sự kiện Talkshow: Định hướng nghề nghiệp', 'Career', 'Hội trường E4', 'ONLINE', '2026-05-02 10:15:03', '2026-05-02 14:15:03', '2026-05-01 10:15:03', 'USE006', '519e8daf-6a91-4509-acff-5f263733a7f2', 100, 'WORKSHOP', 'COMPLETED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}'),
('0f979dfd-532b-4e44-9d40-a52dcbe6e616', 'event-20-3933', 'Hội nghị nghiên cứu khoa học', 'Mô tả sự kiện Hội nghị nghiên cứu khoa học', 'Soft Skills', 'Hội trường A1', 'OFFLINE', '2026-04-29 05:35:38', '2026-04-29 11:35:38', '2026-04-24 05:35:38', 'USE012', '519e8daf-6a91-4509-acff-5f263733a7f2', 200, 'SEMINAR', 'PUBLISHED', 0, 1, 'DYNAMIC', NOW(), NOW(), 0, 0, '{}', '[]', '[]', '[]', '{}');

INSERT INTO event_organizers (id, account_id, role, status, is_deleted, added_by_account_id, assigned_at, organization_id, event_id) VALUES
('5570ccad-2148-439e-8345-f46c7d25b409', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE004', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('9720ed46-bf19-49ec-a273-b5f4458c0047', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE003', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', '20a1d148-811b-439a-9a54-1983082e66fb'),
('1765b341-c694-4216-8582-dfe838fd0bb6', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE015', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('168e525a-5509-4fe2-a647-1fdee6a8743e', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE002', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('8b3fe26f-cbd6-413e-bc20-4dbbb5ba8ec1', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE004', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('e3ed6d6e-0e40-4676-bb59-4a6b00eab934', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE004', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('d820a913-2f1c-4871-8ab1-d4148b49bae9', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE004', NOW(), '4517fa9b-1834-4542-ae5e-7a77f69f3a31', '67c55754-8ab3-4026-a00b-567b1f86629d'),
('1c7ace3d-5dfd-4edb-976d-8d6f0cd0e5a3', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE012', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'c094cee4-2043-4f99-842e-38a171613fef'),
('52c8c147-17f0-4d14-9944-efaad0aead85', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE002', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('fb001cd6-f344-489e-92e8-42395e2b4201', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE005', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('25afd97b-7034-4d87-b408-3a349ce89d84', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE007', NOW(), '4517fa9b-1834-4542-ae5e-7a77f69f3a31', '30585fce-bf04-422a-921d-384360791f73'),
('3ad7f723-d6b5-45e1-9125-59f4df32f67a', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE005', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('7f901bf5-c153-46e9-9fd0-8df6e92a1968', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE011', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('848486bb-2883-4599-a229-34097baf2b38', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE001', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('6da54ec0-36f9-4b29-866e-1836a18a14c4', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE004', NOW(), '4517fa9b-1834-4542-ae5e-7a77f69f3a31', '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('8ca02e29-8fec-44a4-85ab-64f44d1cfab7', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE008', NOW(), 'e8abc366-9acb-41bf-80b0-56b575f8dc6b', 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('66cb5d61-23d3-40f4-b8e0-2b5967db4037', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE001', NOW(), '4517fa9b-1834-4542-ae5e-7a77f69f3a31', '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('a49adac4-4338-4580-b8e3-fb7dd3924928', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE013', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('cded145a-ccbb-46ca-814d-9f75beca8424', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE006', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('c7816aa1-ac37-474a-838b-bb036e4d6855', 'USE001', 'COORDINATOR', 'ACTIVE', 0, 'USE012', NOW(), '519e8daf-6a91-4509-acff-5f263733a7f2', '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_presenters (id, presenter_account_id, is_deleted, assigned_at, event_id) VALUES
('c8a0f600-fe74-4e8f-9451-e07fc88bc59d', 'USE011', 0, NOW(), 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('c35bff95-8f38-4a5d-8b68-5b6f15b1881e', 'USE011', 0, NOW(), '20a1d148-811b-439a-9a54-1983082e66fb'),
('4cda5bad-6c6a-484e-98a8-a2257bd3a8f8', 'USE011', 0, NOW(), '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('3567e054-6b55-4436-9fc5-47b73d2d45fc', 'USE011', 0, NOW(), 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('b0d209cd-cb77-4b13-be8d-c18aa1f68bde', 'USE011', 0, NOW(), 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('7b8cc8ea-093d-4031-b57c-f4ae796dc51a', 'USE011', 0, NOW(), '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('d1cd5b4c-c65d-481f-a22d-293dd119dd25', 'USE011', 0, NOW(), '67c55754-8ab3-4026-a00b-567b1f86629d'),
('578a7844-78bd-47c8-b6b8-1997ede6c4d5', 'USE011', 0, NOW(), 'c094cee4-2043-4f99-842e-38a171613fef'),
('b4d1e2e4-081b-4a0e-ac51-48115f92e8a8', 'USE011', 0, NOW(), 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('173acf2b-ff17-4ee0-b507-47e3a26b37d5', 'USE011', 0, NOW(), 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('a6a1da16-f7fe-4fad-9f99-31c5b181b0c2', 'USE011', 0, NOW(), '30585fce-bf04-422a-921d-384360791f73'),
('0fde5dfb-c0d7-4263-b08e-bd21f5326fc7', 'USE011', 0, NOW(), '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('74f73aa5-7892-4c3d-90e5-216d1faa04de', 'USE011', 0, NOW(), 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('79827863-03d3-4383-a9ac-9f62bf91cd5f', 'USE011', 0, NOW(), 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('d76c4c86-3aae-46cb-bf11-2d813277ac99', 'USE011', 0, NOW(), '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('d15845a7-9bd2-4cc8-9e8e-a1542bbf1c5e', 'USE011', 0, NOW(), 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('a6f22709-bc53-4b91-904a-177b049a2a18', 'USE011', 0, NOW(), '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('5f9cf87f-8db6-4761-8f1f-43e8ea3c2a56', 'USE011', 0, NOW(), '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('227cd492-90fd-4eef-8048-5818f4f7012e', 'USE011', 0, NOW(), '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('1c8af3f5-d355-44ab-b4a2-e3623eadedde', 'USE011', 0, NOW(), '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_sessions (id, title, description, room, type, start_time, end_time, order_index, is_deleted, created_at, updated_at, event_id, presenter_id) VALUES
('f69fce60-6a52-4145-8818-43b3162bbfbc', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-05-17 09:19:50', '2026-05-17 13:19:50', 1, 0, NOW(), NOW(), 'd1f55432-3b93-4366-9226-09a2e5af8f8a', 'c8a0f600-fe74-4e8f-9451-e07fc88bc59d'),
('f36c062e-6721-4ff8-979a-1b2c7e8a1452', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-26 08:33:29', '2026-06-26 14:33:29', 1, 0, NOW(), NOW(), '20a1d148-811b-439a-9a54-1983082e66fb', 'c35bff95-8f38-4a5d-8b68-5b6f15b1881e'),
('bb2bb34a-1380-4fce-9815-aca4666e379c', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-05-16 19:45:14', '2026-05-16 23:45:14', 1, 0, NOW(), NOW(), '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69', '4cda5bad-6c6a-484e-98a8-a2257bd3a8f8'),
('b5c4744f-0c06-4727-8b38-f33643bb1e73', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-17 17:39:09', '2026-06-17 20:39:09', 1, 0, NOW(), NOW(), 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c', '3567e054-6b55-4436-9fc5-47b73d2d45fc'),
('705d12ad-1dba-457e-b534-b9957bd88c1a', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-08 21:36:57', '2026-06-09 02:36:57', 1, 0, NOW(), NOW(), 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d', 'b0d209cd-cb77-4b13-be8d-c18aa1f68bde'),
('5d2035a3-1f78-4b2d-b7ba-f6bb6893e556', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-05-04 19:17:18', '2026-05-04 22:17:18', 1, 0, NOW(), NOW(), '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167', '7b8cc8ea-093d-4031-b57c-f4ae796dc51a'),
('1fee131a-8f4c-4a3a-ba25-33f8b3623fa9', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-17 18:49:17', '2026-06-17 20:49:17', 1, 0, NOW(), NOW(), '67c55754-8ab3-4026-a00b-567b1f86629d', 'd1cd5b4c-c65d-481f-a22d-293dd119dd25'),
('0d1c3732-1633-459c-850c-41e1c84a7281', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-17 06:26:07', '2026-06-17 10:26:07', 1, 0, NOW(), NOW(), 'c094cee4-2043-4f99-842e-38a171613fef', '578a7844-78bd-47c8-b6b8-1997ede6c4d5'),
('7d6b68cf-687f-4684-95e6-9b761a289169', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-22 14:36:08', '2026-04-22 18:36:08', 1, 0, NOW(), NOW(), 'fbe6b4e3-eb13-46fc-9153-af02edcab02e', 'b4d1e2e4-081b-4a0e-ac51-48115f92e8a8'),
('a0dbf9eb-cdc7-4d88-b517-39fbf8c8021b', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-29 10:04:07', '2026-06-29 16:04:07', 1, 0, NOW(), NOW(), 'b67c6385-fa6d-4745-9419-de07372bd6b6', '173acf2b-ff17-4ee0-b507-47e3a26b37d5'),
('b6e1c12d-7181-4b15-ac0a-357299f003a2', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-23 01:03:09', '2026-04-23 07:03:09', 1, 0, NOW(), NOW(), '30585fce-bf04-422a-921d-384360791f73', 'a6a1da16-f7fe-4fad-9f99-31c5b181b0c2'),
('cff1e5f0-2c65-4519-946d-ed8d2ead8862', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-06 12:49:30', '2026-04-06 14:49:30', 1, 0, NOW(), NOW(), '3b405567-6542-47a4-8f18-f5efe4d26cf0', '0fde5dfb-c0d7-4263-b08e-bd21f5326fc7'),
('1bebe7d5-9903-4b96-9e48-01be47448341', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-09 21:00:25', '2026-04-09 23:00:25', 1, 0, NOW(), NOW(), 'f3f1e457-1211-4604-b54b-0c57a270c55a', '74f73aa5-7892-4c3d-90e5-216d1faa04de'),
('c83f2a01-4474-487c-a61e-75b65c6edc26', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-07 14:45:17', '2026-04-07 16:45:17', 1, 0, NOW(), NOW(), 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1', '79827863-03d3-4383-a9ac-9f62bf91cd5f'),
('d04c9d4a-4248-4556-89fe-d2814a1862aa', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-25 20:37:37', '2026-06-26 02:37:37', 1, 0, NOW(), NOW(), '7ff7ceda-73b0-4df1-98ab-d8394a706048', 'd76c4c86-3aae-46cb-bf11-2d813277ac99'),
('cca06ca7-c083-47ea-bd31-943e486f60aa', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-14 20:01:14', '2026-04-15 01:01:14', 1, 0, NOW(), NOW(), 'ec4cab90-f1f0-4432-91e7-7901e9dd8454', 'd15845a7-9bd2-4cc8-9e8e-a1542bbf1c5e'),
('ba406736-a247-4628-8811-0247d2ff6e44', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-08 14:26:09', '2026-06-08 16:26:09', 1, 0, NOW(), NOW(), '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87', 'a6f22709-bc53-4b91-904a-177b049a2a18'),
('7b689216-d534-43f7-a5e5-d65003274cff', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-06-12 05:43:10', '2026-06-12 10:43:10', 1, 0, NOW(), NOW(), '19d92c5a-11d8-4b03-abd8-6964c698a27d', '5f9cf87f-8db6-4761-8f1f-43e8ea3c2a56'),
('e1dd6379-8fe3-4c9d-8cb2-c7f319f56349', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-05-02 10:15:03', '2026-05-02 14:15:03', 1, 0, NOW(), NOW(), '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f', '227cd492-90fd-4eef-8048-5818f4f7012e'),
('7f4703c9-fac0-4f03-a189-3bfbf334abd1', 'Phiên 1', 'Mô tả', 'Phòng A1', 'WORKSHOP', '2026-04-29 05:35:38', '2026-04-29 11:35:38', 1, 0, NOW(), NOW(), '0f979dfd-532b-4e44-9d40-a52dcbe6e616', '1c8af3f5-d355-44ab-b4a2-e3623eadedde');

INSERT INTO event_registrations (id, participant_account_id, status, answers_json, ticket_code, qr_token, qr_token_expiry, checked_in, check_in_time, checked_in_by_account_id, registered_at, updated_at, is_deleted, event_id) VALUES
('ebcf058f-ae72-4f32-8aa0-4804e3950961', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('5904c5d5-cc35-4e19-a4d1-a93855a67cde', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '20a1d148-811b-439a-9a54-1983082e66fb'),
('5bcc5314-868f-4711-916b-695bf46a35b6', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('1f601156-1617-4582-8aa6-25bbe9463a4c', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('b6e74741-bfce-4bbb-8a6f-49fe379d0925', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('a0f1194f-f4f1-42ff-b2fa-cf7366119eb8', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('fd442943-4304-4d37-93b6-05d2ca3f815a', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '67c55754-8ab3-4026-a00b-567b1f86629d'),
('dd761677-186f-486a-b075-66b678ea9887', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'c094cee4-2043-4f99-842e-38a171613fef'),
('9cdc2a2f-5044-4a47-a91b-24c3a57945e4', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('4111ad1e-1e5f-4cba-9fe8-3f6df99d66dd', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('d3c9882f-2f6d-417e-959d-c88126b80b19', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '30585fce-bf04-422a-921d-384360791f73'),
('3a0c60bf-ef69-4d28-9c1a-81c2f6ca91fd', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('12dc321d-28f8-4eff-a806-bd6d23195c40', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('77e94690-438b-468d-a53e-b490facb4f7f', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('e9c2b369-78d6-4618-821e-e03cbc41dd0a', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('09d4dcb1-a929-4dba-a5af-e6bf53561828', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('d79f3c32-1976-401e-ae15-539255f27c13', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('19064fc2-9c53-4538-9acf-c4137cc98fd2', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('1072e341-71f5-43a9-affc-4abc91390876', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('b9bf8404-b703-467e-abff-d2933c169b9f', 'USE020', 'REGISTERED', '{}', 'TICKET-1', 'token', NOW(), 0, NULL, NULL, NOW(), NOW(), 0, '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_posts (id, slug, author_account_id, title, content, post_type, status, is_pinned, allow_comments, view_count, published_at, created_at, updated_at, is_deleted, image_urls, reactions, event_id) VALUES
('fd9848d3-6427-4fe2-a6ac-0b2d894a737f', 'post-925', 'USE004', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('84e3a96c-3123-46ec-8ec1-ab7b007afc7e', 'post-477', 'USE003', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '20a1d148-811b-439a-9a54-1983082e66fb'),
('4cb5e9a5-a8a7-4f84-9d4f-fb9022b541f7', 'post-171', 'USE015', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('f7d4b286-1a53-4041-ae7d-21a24f56bf3c', 'post-985', 'USE002', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('cf4e92dc-36e7-4456-ae02-4f14b5bb11c2', 'post-795', 'USE004', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('7fe65982-6b00-4995-a82d-16ee1abc690c', 'post-190', 'USE004', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('37f08170-10cb-4520-bf12-bf4eba56bf60', 'post-364', 'USE004', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '67c55754-8ab3-4026-a00b-567b1f86629d'),
('00da725b-0e66-4624-8575-783355cac9da', 'post-495', 'USE012', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'c094cee4-2043-4f99-842e-38a171613fef'),
('d97cfd9e-e63e-40f6-a870-aae8418192b2', 'post-299', 'USE002', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('290b2953-9b55-4478-a0e8-1556a8803370', 'post-568', 'USE005', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('d801719c-db2b-4298-aa86-6d2984304746', 'post-127', 'USE007', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '30585fce-bf04-422a-921d-384360791f73'),
('575f17d2-87ee-42ba-9358-df3b0e8b0954', 'post-161', 'USE005', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('2e4a187e-e9a0-4be2-a560-ef0ddadef644', 'post-647', 'USE011', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('8e318fed-d2d5-427c-b670-8af7d804c6d0', 'post-153', 'USE001', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('a1b30a7d-21d9-4a4d-ac62-e42fa12d7aff', 'post-216', 'USE004', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('aca1fee4-5940-4995-8e23-f2902cb94659', 'post-129', 'USE008', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('dd588c0d-db4c-4385-b46b-b43a0313b470', 'post-664', 'USE001', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('ddac5de0-b80d-4a1c-9043-45ed5bcff320', 'post-993', 'USE013', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('9cf1a7ff-6c4c-4059-ae90-47538471dece', 'post-137', 'USE006', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('be346cf7-4ea2-4d2f-bcb8-43712274a311', 'post-428', 'USE012', 'Thông báo', 'Nội dung', 'ANNOUNCEMENT', 'PUBLISHED', 0, 1, 10, NOW(), NOW(), NOW(), 0, '[]', '{}', '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_feedbacks (id, reviewer_account_id, rating, title, comment, image_urls, is_anonymous, organizer_reply, replied_at, created_at, is_deleted, event_id) VALUES
('b1c69e39-b4d0-4253-a81a-62d8ea0d6de9', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('d7ca1ff7-2938-43d4-8f2f-a573519636df', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '20a1d148-811b-439a-9a54-1983082e66fb'),
('9d9623aa-ccc2-4e15-96e6-6963c895de77', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('b930ab0b-788a-4117-b444-585ec966c378', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('62cc75ee-e813-48b2-a1bb-011fde41445d', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('a929145b-f9c7-4e4d-93e0-3dd98e28a006', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('2d963b69-1a1e-49fa-892a-e484ac2c97b8', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '67c55754-8ab3-4026-a00b-567b1f86629d'),
('dab6aa34-a957-422a-9f96-4355d28b88fa', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'c094cee4-2043-4f99-842e-38a171613fef'),
('9a4fef11-9cad-48fa-a6a1-9616c7e5855d', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('06add5c8-d058-43cf-8972-bf5cec7b64fb', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('cd1017a7-aff2-4fcc-82c2-c6b63a9119aa', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '30585fce-bf04-422a-921d-384360791f73'),
('dc37c374-b451-450b-925e-1c5dbae76b6f', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('dcdc587f-ac3e-405c-9a16-ffe81c580d4b', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('f194f25e-26a8-47eb-b6c4-7f4d29bba913', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('4d5747f0-c397-4616-a882-a1b7c625a9fe', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('4c61b996-89a4-408d-9de5-0c960dec17ef', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('70a99faf-b90d-4189-8808-08b82641f044', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('518bbaa8-cf60-4237-8f92-efaa049f8a13', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('5ed21e34-7055-4b32-8430-e4a6d2294d43', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('d882c7a4-843d-43c9-9a78-53e211b93ea5', 'USE020', 5, 'Rất hay', 'Sự kiện tuyệt vời', '[]', 0, NULL, NULL, NOW(), 0, '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_invitations (id, inviter_account_id, invitee_email, type, target_role, presenter_session, message, status, rejection_reason, token, is_deleted, sent_at, responded_at, expired_at, event_id) VALUES
('5d4b709a-dfd9-4b4f-b494-8afd4e061ba4', 'USE004', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('551ec755-9d00-4b03-ae13-75093b51c620', 'USE003', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '20a1d148-811b-439a-9a54-1983082e66fb'),
('837a8eb1-bdb2-4543-bbcc-dccc78807f85', 'USE015', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('c8f3dfd3-8198-486e-9289-7002aa936c1a', 'USE002', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('b2071614-71a6-4212-9286-64926b4672e2', 'USE004', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('9bd80cb0-3e35-42a2-8834-28872901ea5f', 'USE004', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('9df6f183-74d9-4941-a38f-afd2933b436a', 'USE004', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '67c55754-8ab3-4026-a00b-567b1f86629d'),
('a2abcf3e-6721-467a-948e-4fbfc1f17815', 'USE012', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'c094cee4-2043-4f99-842e-38a171613fef'),
('1a223334-69dc-47e0-a8e7-24dc87a44518', 'USE002', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('d00aa13c-73e8-4885-9109-1d181fe70eb7', 'USE005', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('2a1fe427-0271-409a-a109-6ca6225a72ef', 'USE007', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '30585fce-bf04-422a-921d-384360791f73'),
('799f6d3f-b347-46e0-a08f-706cd4234f0d', 'USE005', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('34e50bda-68db-40b9-982a-25883f9b592d', 'USE011', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('7534b754-3839-4bdd-b245-65daa3c4de4a', 'USE001', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('2286d594-fc7f-436f-9ea8-399c2a2ce22e', 'USE004', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('e3add25a-88fb-4b56-afc1-de07ab3362e3', 'USE008', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('fbc0de16-0c92-4a51-97a4-cbccc86092ba', 'USE001', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('623c4008-3dfc-4936-9ee2-cf7b24f15ef7', 'USE013', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('895f7c40-2fc0-464c-87f4-747950e1ee8c', 'USE006', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('e6834f04-08f1-4ab0-9053-c9dbe96aff9b', 'USE012', 'guest@gmail.com', 'ORGANIZER', 'MEMBER', NULL, 'Mời tham gia BTC', 'PENDING', NULL, 'token123', 0, NOW(), NULL, NOW(), '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO recaps (id, author_account_id, title, content, image_urls, video_highlight_url, status, view_count, like_count, published_at, created_at, updated_at, is_deleted, event_id) VALUES
('53e9c9b6-708f-4bb1-b21f-6f12c59cac53', 'USE004', 'Tổng kết Hội thảo Trí tuệ nhân tạo (AI)', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('350ab1f9-974a-42a3-821e-982f1defe6a4', 'USE003', 'Tổng kết Cuộc thi Lập trình sinh viên quốc tế', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '20a1d148-811b-439a-9a54-1983082e66fb'),
('1330dbab-f8eb-45ff-9e06-00a5bfcf6ff8', 'USE015', 'Tổng kết Ngày hội Việc làm IT Job Fair 2026', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('e00d8b01-8469-4ee5-b91e-c1bcdd940edd', 'USE002', 'Tổng kết Workshop: Kỹ năng viết CV ấn tượng', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('5c851d1d-7ff1-4ee6-ab5e-3019e6310ee1', 'USE004', 'Tổng kết Talkshow: Khởi nghiệp công nghệ', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('efbf578c-e9ff-4215-9058-44c0a10bc0e7', 'USE004', 'Tổng kết Giao lưu văn nghệ', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('9fe194f9-8bdc-4f94-b075-cb67b0d77420', 'USE004', 'Tổng kết Lễ vinh danh sinh viên xuất sắc', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '67c55754-8ab3-4026-a00b-567b1f86629d'),
('86418aa0-5c3d-45d0-8700-0141c6640cf2', 'USE012', 'Tổng kết Tập huấn PCCC', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'c094cee4-2043-4f99-842e-38a171613fef'),
('e5f51d38-1462-4559-b913-bedf129e6a0e', 'USE002', 'Tổng kết Cuộc thi Hùng biện tiếng Anh', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('96ebae03-5160-4fe2-8da4-26edd79fff14', 'USE005', 'Tổng kết Sinh hoạt chuyên đề Khoa CNTT', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('920726b4-ee85-4fb0-92b3-983f718d26b5', 'USE007', 'Tổng kết Giải bóng đá nam', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '30585fce-bf04-422a-921d-384360791f73'),
('5444b8b0-f040-4221-a0ca-c40b21ac3d14', 'USE005', 'Tổng kết Tọa đàm: Blockchain', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('b7a17dc0-8034-406b-b296-3a8cbd19a126', 'USE011', 'Tổng kết Webinar: Kỹ năng phỏng vấn', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('81c80b32-df68-4236-b3b2-161e3825fa4e', 'USE001', 'Tổng kết Hội thao truyền thống', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('61e51f3f-57fa-4071-a384-1d0026a7e273', 'USE004', 'Tổng kết Lớp học kỹ năng mềm', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('b5d9f5c7-fb00-4f36-8e25-675119195b00', 'USE008', 'Tổng kết Seminar: Bảo mật', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('57b688ae-6547-4c82-b052-a2baaa092d56', 'USE001', 'Tổng kết Cuộc thi Hackathon Mùa xuân', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('b7cafc47-ada8-49e7-8d46-31d7d5207cb8', 'USE013', 'Tổng kết Lễ hội mùa đông', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('486a17d3-d88c-42fc-a0a6-40886f294c4f', 'USE006', 'Tổng kết Talkshow: Định hướng nghề nghiệp', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('eac82967-e28b-4bef-8215-8d23b312808f', 'USE012', 'Tổng kết Hội nghị nghiên cứu khoa học', 'Bài tổng kết...', '[]', NULL, 'PUBLISHED', 10, 5, NOW(), NOW(), NOW(), 0, '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO quizzes (id, title, description, is_active, created_at, event_id) VALUES
('62fadbb1-8f47-4c74-9ae4-8af483d12c33', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('ae8f2327-1ae1-4aa9-9877-baca8ddac5f8', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '20a1d148-811b-439a-9a54-1983082e66fb'),
('d48e823d-f8c1-472a-8b20-654fadc643ff', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('e14353fe-cbf8-4a44-82a1-757102c4722b', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('40c307e3-a116-46bc-a705-989c71a59e91', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('63d49a81-e571-4913-a87f-e775e1194896', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('b5a88c63-d6ad-44f5-8868-5fe57f7a92ac', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '67c55754-8ab3-4026-a00b-567b1f86629d'),
('08c0f5a1-740e-4dcb-ad54-cd5f77f1d491', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'c094cee4-2043-4f99-842e-38a171613fef'),
('37503ba1-7f13-4369-bc8b-7fad9785042d', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('8b4cbb14-bde3-4c73-a04b-fe02b0ae7349', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('847a95f9-b519-4086-a6a4-09a5adf81446', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '30585fce-bf04-422a-921d-384360791f73'),
('cc14dc30-aaeb-473f-be22-4737031524fb', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('3963bb81-4a88-4a73-ac09-388c30d874b2', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('2edbabed-fb3b-4fe3-99c2-979d1132f4af', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('5c1225e9-6483-4f02-995b-0c5128b06ccb', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('b1074bfd-aeb5-4230-9983-31af3c087d8d', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('2c5b29fc-f2e2-41dc-bef4-143487b8d89a', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('7a853143-573f-4bfb-94b8-6d332800af13', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('25b81865-9635-42e3-b276-0d864ffb21a2', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('cf2cf08e-d867-43d1-b7f6-9c19e54b9de5', 'Quiz sự kiện', 'Câu hỏi vui', 1, NOW(), '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

INSERT INTO event_surveys (id, title, description, is_published, created_at, event_id) VALUES
('d70ee963-9923-40c7-8e70-851f4339ac8f', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'd1f55432-3b93-4366-9226-09a2e5af8f8a'),
('b9a9bca9-d86d-4519-9321-2bf3b8426742', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '20a1d148-811b-439a-9a54-1983082e66fb'),
('5331547c-b4cd-4025-b70a-d678c90b3f3d', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '2ac3e3a8-d96e-49cc-bc9d-9cbefcc23b69'),
('774c4bc0-fcc0-4af5-82fd-e6f330b4514e', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'ca1e952b-505d-4fc4-b5cb-f2120481ab5c'),
('93227120-67ca-4280-aef3-28fcfd41bcb1', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'bf2f2b1a-98a7-488f-8c6a-a08540364f6d'),
('ef625ed5-d4ec-4dd3-8650-c45548419899', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '55b8e55c-88e1-48dd-b5d7-2a35b5ea4167'),
('9269ef29-1d74-431a-876f-b0b0605716bb', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '67c55754-8ab3-4026-a00b-567b1f86629d'),
('ec74c542-a54d-4c5d-87b5-9db9db031eee', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'c094cee4-2043-4f99-842e-38a171613fef'),
('d8b60e31-72a6-478c-a940-375cbe06778c', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'fbe6b4e3-eb13-46fc-9153-af02edcab02e'),
('1807e0e4-e3df-40ff-a6ce-05c6d65a03a7', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'b67c6385-fa6d-4745-9419-de07372bd6b6'),
('2efeec39-48c8-4b6d-8105-5d80f0eca50b', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '30585fce-bf04-422a-921d-384360791f73'),
('524b4100-ddf6-475d-ab00-ef95b02f6611', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '3b405567-6542-47a4-8f18-f5efe4d26cf0'),
('074c0700-f424-4268-8b12-ae83ea1a8791', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'f3f1e457-1211-4604-b54b-0c57a270c55a'),
('c35eb6df-fadb-4205-a3d1-965c32be5f56', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'cd9bedb0-92e2-48ce-ac7e-b2f9e28f38c1'),
('e3fd19df-aa95-4434-a535-b3601db108cd', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '7ff7ceda-73b0-4df1-98ab-d8394a706048'),
('56291fa1-19a8-40af-ab0e-07d2e6e2885f', 'Khảo sát', 'Xin ý kiến', 1, NOW(), 'ec4cab90-f1f0-4432-91e7-7901e9dd8454'),
('f490294c-065e-4803-92f9-c69422d7883e', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '314aa2e8-c30a-4bdd-8ed6-5c8edf994a87'),
('78da7bcd-faaf-45bd-9dd6-254a035fa44d', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '19d92c5a-11d8-4b03-abd8-6964c698a27d'),
('d2a210dc-2d24-4b87-9e4f-45d77a3c3710', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '892213d9-3b2f-4cdb-9a8b-5df8ae3ede9f'),
('ebce7f25-4e6e-4509-bc32-dad05faab5b3', 'Khảo sát', 'Xin ý kiến', 1, NOW(), '0f979dfd-532b-4e44-9d40-a52dcbe6e616');

