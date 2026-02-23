INSERT INTO organizations (id, name, code, type, description, created_at, updated_at, is_deleted) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Khoa Công nghệ Thông tin', 'CNTT', 'FACULTY', 'Khoa đào tạo CNTT và khoa học máy tính', '2025-01-15 09:30:00', '2025-11-20 14:45:00', false),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Câu lạc bộ Lập trình', 'CLB_LT', 'CLUB', 'Câu lạc bộ sinh viên đam mê lập trình và công nghệ', '2025-03-10 10:15:00', '2025-10-05 16:20:00', false),
('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Công ty FPT Software', 'FPT_SW', 'COMPANY', 'Công ty phần mềm hàng đầu Việt Nam', '2024-12-01 08:00:00', '2025-09-15 11:30:00', false),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Câu lạc bộ Âm nhạc', 'CLB_AM', 'CLUB', 'Câu lạc bộ sinh viên yêu thích âm nhạc', '2025-04-22 13:45:00', '2025-08-10 17:10:00', false),
('123e4567-e89b-12d3-a456-426614174000', 'Khoa Kinh tế', 'KT', 'FACULTY', 'Khoa Kinh tế và Quản trị kinh doanh', '2025-02-05 11:20:00', '2025-12-01 09:00:00', false),
('987fcdeb-1234-5678-9abc-def012345678', 'Công ty VNG Corporation', 'VNG', 'COMPANY', 'Công ty công nghệ giải trí và game', '2024-11-10 14:30:00', '2025-07-25 15:55:00', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cá nhân - Nguyễn Văn A', 'NVA', 'PERSONAL', 'Cá nhân tổ chức sự kiện cộng đồng', '2025-06-18 16:40:00', '2025-11-01 10:15:00', true),
('fedcba98-7654-3210-9876-543210fedcba', 'Khoa Điện tử Viễn thông', 'ĐTVT', 'FACULTY', 'Khoa Điện tử Viễn thông và Công nghệ thông tin', '2025-01-20 08:45:00', '2025-09-30 13:20:00', false),
('11111111-2222-3333-4444-555555555555', 'Câu lạc bộ Tiếng Anh', 'CLB_TA', 'CLUB', 'Câu lạc bộ rèn luyện tiếng Anh', '2025-05-12 12:00:00', '2025-10-20 18:30:00', true),
('99999999-8888-7777-6666-555544443333', 'Khác - Nhóm cộng đồng', 'OTHER_01', 'OTHER', 'Nhóm cộng đồng tự do', '2025-07-01 09:10:00', '2025-11-10 11:45:00', false);


INSERT INTO user_profiles (id, account_id, organization_id, login_code, full_name, gender, date_of_birth, major_name, approval_status, created_at, updated_at, is_deleted) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'SV001', 'Nguyễn Văn A', 'Male', '2003-05-15 00:00:00', 'Công nghệ Thông tin', 'APPROVED', '2025-02-10 08:30:00', '2025-11-15 14:20:00', false),
('b2c3d4e5-f6g7-8901-bcde-f2345678901', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'SV002', 'Trần Thị B', 'Female', '2004-08-22 00:00:00', 'Khoa học Máy tính', 'APPROVED', '2025-03-20 09:45:00', '2025-10-10 16:55:00', false),
('c3d4e5f6-g7h8-9012-cdef-3456789012', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'NV001', 'Lê Văn C', 'Male', '1998-11-30 00:00:00', NULL, 'APPROVED', '2025-01-05 10:15:00', '2025-09-25 11:40:00', false),
('d4e5f6g7-h8i9-0123-def0-4567890123', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SV003', 'Phạm Thị D', 'Female', '2002-03-10 00:00:00', NULL, 'PENDING', '2025-04-15 13:30:00', '2025-08-05 17:00:00', false),
('e5f6g7h8-i9j0-1234-ef01-5678901234', '123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'SV004', 'Hoàng Văn E', 'Male', '2003-07-25 00:00:00', 'Kinh tế Quốc tế', 'APPROVED', '2025-02-28 11:00:00', '2025-12-05 09:30:00', false),
('f6g7h8i9-j0k1-2345-f012-6789012345', '987fcdeb-1234-5678-9abc-def012345678', '987fcdeb-1234-5678-9abc-def012345678', 'NV002', 'Đặng Thị F', 'Female', '1997-12-01 00:00:00', NULL, 'APPROVED', '2025-01-20 14:45:00', '2025-07-15 10:20:00', false),
('g7h8i9j0-k1l2-3456-0123-7890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CA001', 'Vũ Văn G', 'Male', '2000-06-18 00:00:00', NULL, 'APPROVED', '2025-06-10 16:00:00', '2025-11-01 12:15:00', false),
('h8i9j0k1-l2m3-4567-1234-8901234567', 'fedcba98-7654-3210-9876-543210fedcba', 'fedcba98-7654-3210-9876-543210fedcba', 'SV005', 'Bùi Thị H', 'Female', '2004-02-14 00:00:00', 'Điện tử Viễn thông', 'PENDING', '2025-03-05 09:20:00', '2025-10-30 14:50:00', false),
('i9j0k1l2-m3n4-5678-2345-9012345678', '11111111-2222-3333-4444-555555555555', '11111111-2222-3333-4444-555555555555', 'SV006', 'Đỗ Văn I', 'Male', '2003-09-09 00:00:00', NULL, 'APPROVED', '2025-05-25 12:30:00', '2025-11-20 18:00:00', false),
('j0k1l2m3-n4o5-6789-3456-0123456789', '99999999-8888-7777-6666-555544443333', '99999999-8888-7777-6666-555544443333', 'CA002', 'Lý Thị J', 'Female', '1999-04-04 00:00:00', NULL, 'APPROVED', '2025-07-15 10:45:00', '2025-11-10 13:25:00', false);