-- 1. Tạo 20 Accounts (Dùng mã băm mật khẩu 123456)
INSERT IGNORE INTO accounts (id, username, email, password_hash, status, created_at, updated_at)
VALUES
    ('USE001', 'user_01', 'user01@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE002', 'user_02', 'user02@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE003', 'user_03', 'user03@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE004', 'user_04', 'user04@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE005', 'user_05', 'user05@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE006', 'user_06', 'user06@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE007', 'user_07', 'user07@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE008', 'user_08', 'user08@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE009', 'user_09', 'user09@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE010', 'user_10', 'user10@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE011', 'user_11', 'user11@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE012', 'user_12', 'user12@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE013', 'user_13', 'user13@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE014', 'user_14', 'user14@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE015', 'user_15', 'user15@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE016', 'user_16', 'user16@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE017', 'user_17', 'user17@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE018', 'user_18', 'user18@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE019', 'user_19', 'user19@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW()),
    ('USE020', 'user_20', 'user20@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ACTIVE', NOW(), NOW());

INSERT INTO account_roles (account_id, roles)
SELECT id, 'SUPER_ADMIN' FROM accounts
WHERE id NOT IN (SELECT account_id FROM account_roles)
ORDER BY created_at DESC LIMIT 5;

INSERT INTO account_roles (account_id, roles)
SELECT id, 'ADMIN' FROM accounts
WHERE id NOT IN (SELECT account_id FROM account_roles)
ORDER BY created_at DESC LIMIT 5;

INSERT INTO account_roles (account_id, roles)
SELECT id, 'ORGANIZER' FROM accounts
WHERE id NOT IN (SELECT account_id FROM account_roles)
ORDER BY created_at DESC LIMIT 5;

INSERT INTO account_roles (account_id, roles)
SELECT id, 'EVENT_PARTICIPANT' FROM accounts
WHERE id NOT IN (SELECT account_id FROM account_roles)
ORDER BY created_at DESC LIMIT 10;

INSERT INTO account_roles (account_id, roles)
SELECT id, 'GUEST' FROM accounts
WHERE id NOT IN (SELECT account_id FROM account_roles)
ORDER BY created_at DESC LIMIT 5;

INSERT INTO user (id, full_name, gender, phone, major_name, is_deleted, created_at)
SELECT id, CONCAT('Sinh Viên ', username), IF(RAND() > 0.5, 'MALE', 'FEMALE'), '0901234567', 'Kỹ thuật phần mềm', 0, NOW()
FROM accounts ORDER BY created_at DESC LIMIT 20;

INSERT INTO organizations (id, code, name, type, description, approval_status, created_by_id, is_deleted, created_at, updated_at)
VALUES
    (UUID(), 'FPTU-IT', 'CLB Tin Học FPTU', 'CLUB', 'Cộng đồng đam mê lập trình', 'APPROVED', 'USE001', 0, NOW(), NOW()),
    (UUID(), 'GDSC-HCM', 'Google Developer Student Clubs', 'CLUB', 'Cộng đồng sinh viên Google', 'APPROVED', 'USE002', 0, NOW(), NOW()),
    (UUID(), 'K-SE', 'Khoa Kỹ thuật phần mềm', 'FACULTY', 'Đào tạo kỹ sư phần mềm', 'APPROVED', 'USE003', 0, NOW(), NOW()),
    (UUID(), 'K-AI', 'Khoa Trí tuệ nhân tạo', 'FACULTY', 'Nghiên cứu AI chuyên sâu', 'APPROVED', 'USE004', 0, NOW(), NOW()),
    (UUID(), 'CLB-AM', 'CLB Âm Nhạc', 'CLUB', 'Giao lưu văn nghệ sinh viên', 'APPROVED', 'USE005', 0, NOW(), NOW()),
    (UUID(), 'FPT-SOFT', 'FPT Software', 'COMPANY', 'Tập đoàn công nghệ hàng đầu', 'APPROVED', 'USE006', 0, NOW(), NOW()),
    (UUID(), 'CLB-VOV', 'CLB Võ Thuật Vovinam', 'CLUB', 'Rèn luyện sức khỏe', 'APPROVED', 'USE007', 0, NOW(), NOW()),
    (UUID(), 'JS-CLUB', 'Japanese Student Club', 'CLUB', 'Văn hóa Nhật Bản', 'APPROVED', 'USE008', 0, NOW(), NOW()),
    (UUID(), 'CLB-STU', 'CLB Khởi Nghiệp', 'CLUB', 'Tư duy kinh doanh', 'APPROVED', 'USE009', 0, NOW(), NOW()),
    (UUID(), 'K-DESIGN', 'Khoa Thiết kế đồ họa', 'FACULTY', 'Sáng tạo nội dung', 'APPROVED', 'USE010', 0, NOW(), NOW());

INSERT INTO organization_members (id, account_id, organization_id, status, joined_at)
SELECT
    UUID(),
    a.id,
    o.id,
    ELT(FLOOR(1 + (RAND() * 3)), 'ACTIVE', 'PENDING', 'INVITED'),
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
FROM (SELECT id FROM accounts WHERE id LIKE 'USE%' LIMIT 20) a
         CROSS JOIN (SELECT id FROM organizations ORDER BY RAND() LIMIT 1) o;




