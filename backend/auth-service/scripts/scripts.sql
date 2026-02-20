INSERT INTO accounts (id, username, password, status, created_at, updated_at) VALUES
('u-001', 'admin_master', 'pass_hash_001', 'ACTIVE', NOW(), NOW()),
('u-002', 'organizer_hcm', 'pass_hash_002', 'ACTIVE', NOW(), NOW()),
('u-003', 'organizer_hn', 'pass_hash_003', 'ACTIVE', NOW(), NOW()),
('u-004', 'member_001', 'pass_hash_004', 'ACTIVE', NOW(), NOW()),
('u-005', 'member_002', 'pass_hash_005', 'ACTIVE', NOW(), NOW()),
('u-006', 'member_003', 'pass_hash_006', 'LOCKED', NOW(), NOW()),
('u-007', 'member_004', 'pass_hash_007', 'ACTIVE', NOW(), NOW()),
('u-008', 'member_005', 'pass_hash_008', 'DISABLED', NOW(), NOW()),
('u-009', 'super_boss', 'pass_hash_009', 'ACTIVE', NOW(), NOW()),
('u-010', 'staff_test', 'pass_hash_010', 'ACTIVE', NOW(), NOW());

-- Chèn roles tương ứng cho 10 account trên vào bảng account_roles (do @ElementCollection tạo ra)
INSERT INTO account_roles (account_id, role_name) VALUES
('u-001', 'ADMIN'), ('u-001', 'SUPER_ADMIN'),
('u-002', 'ORGANIZER'),
('u-003', 'ORGANIZER'),
('u-004', 'MEMBER'),
('u-005', 'MEMBER'),
('u-006', 'MEMBER'),
('u-007', 'MEMBER'),
('u-008', 'MEMBER'),
('u-009', 'SUPER_ADMIN'),
('u-010', 'MEMBER');

INSERT INTO refresh_tokens (id, account_id, token, expiry_date, revoked) VALUES
('rt-001', 'u-001', 'ref-token-string-001', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-002', 'u-002', 'ref-token-string-002', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-003', 'u-003', 'ref-token-string-003', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-004', 'u-004', 'ref-token-string-004', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-005', 'u-005', 'ref-token-string-005', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-006', 'u-006', 'ref-token-string-006', DATE_ADD(NOW(), INTERVAL -1 DAY), 1), -- Token đã hết hạn/thu hồi
('rt-007', 'u-007', 'ref-token-string-007', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-008', 'u-008', 'ref-token-string-008', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-009', 'u-009', 'ref-token-string-009', DATE_ADD(NOW(), INTERVAL 7 DAY), 0),
('rt-010', 'u-010', 'ref-token-string-010', DATE_ADD(NOW(), INTERVAL 7 DAY), 0);