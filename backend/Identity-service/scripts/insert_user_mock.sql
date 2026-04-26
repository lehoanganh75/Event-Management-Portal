-- 1. Chèn vào bảng accounts (10 tài khoản test)
INSERT IGNORE INTO accounts (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES
    ('USE001', 'hnguyenbuitan', 'hnguyenbuitan@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN','ACTIVE', NOW(), NOW()),
    ('USE002', 'hnguyenbuitan2810', 'hnguyenbuitan2810@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE003', 'hiennguyenbuitan', 'hiennguyenbuitan@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN','ACTIVE', NOW(), NOW()),
    ('USE004', 'teststudent1', 'student1@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE005', 'teststudent2', 'student2@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE006', 'teststudent3', 'student3@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE007', 'teststudent4', 'student4@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE008', 'teststudent5', 'student5@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE009', 'teststudent6', 'student6@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE010', 'teststudent7', 'student7@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE011', 'teststudent8', 'student8@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE012', 'teststudent9', 'student9@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
    ('USE013', 'teststudent10', 'student10@iuh.edu.vn', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW());

-- 2. Chèn vào bảng user (profile)
INSERT IGNORE INTO user (id, date_of_birth, full_name, gender, phone, major_name, is_deleted, created_at, bio, avatar_url)
VALUES
    ('USE001', '2002-10-28', 'Nguyễn Bùi Tấn Hiển (ADMIN)', 'MALE', '0901234561', 'Quản trị hệ thống', 0, NOW(), 'Quản trị viên sự kiện chuyên nghiệp.', 'https://moon-s3-demo.s3.ap-southeast-1.amazonaws.com/f8fb-1777034065553-avatar.jpg'),
    ('USE002', '2002-10-28', 'Nguyễn Bùi Tân Hiển (STUDENT)', 'MALE', '0901234562', 'Quản trị kinh doanh', 0, NOW(), 'Sinh viên năm cuối ngành Kỹ thuật phần mềm IUH.', 'https://moon-s3-demo.s3.ap-southeast-1.amazonaws.com/f8fb-1777034065553-avatar.jpg'),
    ('USE003', '2002-10-28', 'Nguyễn Bùi Tấn Hiển (SUPER_ADMIN)', 'FEMALE', '0901234563', 'Kỹ thuật phần mềm', 0, NOW(), 'Tôi là Super Admin của hệ thống Event Management.', 'https://moon-s3-demo.s3.ap-southeast-1.amazonaws.com/f8fb-1777034065553-avatar.jpg'),
    ('USE004', '2003-01-01', 'Trần Văn Test 1', 'MALE', '0912000001', 'Công nghệ thông tin', 0, NOW(), 'Tài khoản thử nghiệm 1', 'https://ui-avatars.com/api/?name=Test+1'),
    ('USE005', '2003-02-02', 'Lê Thị Test 2', 'FEMALE', '0912000002', 'Kế toán', 0, NOW(), 'Tài khoản thử nghiệm 2', 'https://ui-avatars.com/api/?name=Test+2'),
    ('USE006', '2003-03-03', 'Phạm Minh Test 3', 'MALE', '0912000003', 'Quản trị kinh doanh', 0, NOW(), 'Tài khoản thử nghiệm 3', 'https://ui-avatars.com/api/?name=Test+3'),
    ('USE007', '2003-04-04', 'Hoàng Anh Test 4', 'FEMALE', '0912000004', 'Kỹ thuật phần mềm', 0, NOW(), 'Tài khoản thử nghiệm 4', 'https://ui-avatars.com/api/?name=Test+4'),
    ('USE008', '2003-05-05', 'Vũ Đức Test 5', 'MALE', '0912000005', 'Hệ thống thông tin', 0, NOW(), 'Tài khoản thử nghiệm 5', 'https://ui-avatars.com/api/?name=Test+5'),
    ('USE009', '2003-06-06', 'Đặng Thu Test 6', 'FEMALE', '0912000006', 'Thương mại điện tử', 0, NOW(), 'Tài khoản thử nghiệm 6', 'https://ui-avatars.com/api/?name=Test+6'),
    ('USE010', '2003-07-07', 'Bùi Xuân Test 7', 'MALE', '0912000007', 'Công nghệ thông tin', 0, NOW(), 'Tài khoản thử nghiệm 7', 'https://ui-avatars.com/api/?name=Test+7'),
    ('USE011', '2003-08-08', 'Ngô Bảo Test 8', 'FEMALE', '0912000008', 'Tài chính ngân hàng', 0, NOW(), 'Tài khoản thử nghiệm 8', 'https://ui-avatars.com/api/?name=Test+8'),
    ('USE012', '2003-09-09', 'Đỗ Hùng Test 9', 'MALE', '0912000009', 'Marketing', 0, NOW(), 'Tài khoản thử nghiệm 9', 'https://ui-avatars.com/api/?name=Test+9'),
    ('USE013', '2003-10-10', 'Trương Mỹ Test 10', 'FEMALE', '0912000010', 'Luật kinh tế', 0, NOW(), 'Tài khoản thử nghiệm 10', 'https://ui-avatars.com/api/?name=Test+10');