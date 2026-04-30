-- 1. Xóa dữ liệu cũ nếu có
DELETE FROM users;

-- 2. Tạo 10 Users (Mật khẩu mặc định: 123456)
INSERT INTO users (id, username, email, password_hash, role, status, full_name, gender, date_of_birth, bio, phone, avatar_url, is_deleted, created_at, updated_at)
VALUES
('USE001', 'super_admin', 'hiennguyenbuitan@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN', 'ACTIVE', 'Nguyễn Bùi Tấn Hiển (SA)', 'MALE', '1995-01-01', 'Hệ thống Admin quản trị tối cao.', '0901234560', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SA', 0, NOW(), NOW()),
('USE002', 'admin_user', 'hnguyenbuitan@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN', 'ACTIVE', 'Nguyễn Bùi Tấn Hiển (AD)', 'MALE', '1996-05-15', 'Người quản lý sự kiện và nội dung.', '0901234561', 'https://api.dicebear.com/7.x/avataaars/svg?seed=AD', 0, NOW(), NOW()),
('USE003', 'student_user', 'hnguyenbuitan2810@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT', 'ACTIVE', 'Nguyễn Bùi Tấn Hiển (ST)', 'MALE', '2002-10-28', 'Sinh viên nhiệt huyết, đam mê công nghệ.', '0901234562', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ST', 0, NOW(), NOW()),
('USE004', 'student_01', 'student01@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT', 'ACTIVE', 'Trần Văn A', 'MALE', '2003-02-10', 'Yêu thích các hoạt động ngoại khóa.', '0901234563', 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', 0, NOW(), NOW()),
('USE005', 'student_02', 'student02@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT', 'ACTIVE', 'Lê Thị B', 'FEMALE', '2003-08-20', 'Chuyên gia tổ chức sự kiện tương lai.', '0901234564', 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', 0, NOW(), NOW()),
('USE006', 'student_03', 'student03@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT', 'ACTIVE', 'Phạm Văn C', 'MALE', '2002-12-05', 'Đam mê lập trình và âm nhạc.', '0901234565', 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', 0, NOW(), NOW()),
('USE007', 'guest_01', 'guest01@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST', 'ACTIVE', 'Khách Hàng 01', 'FEMALE', '1998-11-11', 'Đến để tham gia những sự kiện thú vị.', '0901234566', 'https://api.dicebear.com/7.x/avataaars/svg?seed=G1', 0, NOW(), NOW()),
('USE008', 'guest_02', 'guest02@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST', 'ACTIVE', 'Khách Hàng 02', 'MALE', '1999-01-20', 'Luôn tìm kiếm cơ hội kết nối.', '0901234567', 'https://api.dicebear.com/7.x/avataaars/svg?seed=G2', 0, NOW(), NOW()),
('USE009', 'guest_03', 'guest03@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST', 'ACTIVE', 'Khách Hàng 03', 'FEMALE', '2000-03-30', 'Người yêu nghệ thuật và sáng tạo.', '0901234568', 'https://api.dicebear.com/7.x/avataaars/svg?seed=G3', 0, NOW(), NOW()),
('USE010', 'guest_04', 'guest04@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST', 'ACTIVE', 'Khách Hàng 04', 'MALE', '2001-07-07', 'Thích giao lưu và học hỏi.', '0901234569', 'https://api.dicebear.com/7.x/avataaars/svg?seed=G4', 0, NOW(), NOW());

