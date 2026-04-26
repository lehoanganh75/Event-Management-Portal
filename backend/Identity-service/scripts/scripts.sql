-- 1. Tạo 20 Accounts (Dùng mã băm mật khẩu 123456)
INSERT IGNORE INTO accounts (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES
('USE001', 'user_01', 'user01@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN','ACTIVE', NOW(), NOW()),
('USE002', 'user_02', 'user02@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN','ACTIVE', NOW(), NOW()),
('USE003', 'user_03', 'user03@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN','ACTIVE', NOW(), NOW()),
('USE004', 'user_04', 'user04@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'SUPER_ADMIN','ACTIVE', NOW(), NOW()),
('USE005', 'user_05', 'user05@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN','ACTIVE', NOW(), NOW()),
('USE006', 'user_06', 'user06@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN','ACTIVE', NOW(), NOW()),
('USE007', 'user_07', 'user07@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN','ACTIVE', NOW(), NOW()),
('USE008', 'user_08', 'user08@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'ADMIN','ACTIVE', NOW(), NOW()),
('USE009', 'user_09', 'user09@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE010', 'user_10', 'user10@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE011', 'user_11', 'user11@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE012', 'user_12', 'user12@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE013', 'user_13', 'user13@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE014', 'user_14', 'user14@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE015', 'user_15', 'user15@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE016', 'user_16', 'user16@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'STUDENT','ACTIVE', NOW(), NOW()),
('USE017', 'user_17', 'user17@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST','ACTIVE', NOW(), NOW()),
('USE018', 'user_18', 'user18@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST','ACTIVE', NOW(), NOW()),
('USE019', 'user_19', 'user19@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST','ACTIVE', NOW(), NOW()),
('USE020', 'user_20', 'user20@gmail.com', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', 'GUEST','ACTIVE', NOW(), NOW());

INSERT INTO user (
    id,
    date_of_birth,
    full_name,
    gender,
    phone,
    major_name,
    is_deleted,
    created_at
)
SELECT
    id,
    DATE_SUB(CURDATE(), INTERVAL FLOOR(18 + RAND()*5) YEAR), -- random 18-23 tuổi
    CONCAT('Sinh Viên ', username),
    IF(RAND() > 0.5, 'MALE', 'FEMALE'),
    '0901234567',
    'Kỹ thuật phần mềm',
    0,
    NOW()
FROM accounts
ORDER BY created_at DESC
LIMIT 20;




