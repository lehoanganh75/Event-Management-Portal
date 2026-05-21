-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.8.6-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for identity_db
CREATE DATABASE IF NOT EXISTS `identity_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `identity_db`;

-- Dumping structure for table identity_db.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` varchar(255) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used` bit(1) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK71lqwbwtklmljk3qlsugr1mig` (`token`),
  UNIQUE KEY `UKla2ts67g4oh2sreayswhox1i6` (`user_id`),
  CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table identity_db.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table identity_db.refresh_tokens
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` varchar(255) NOT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `revoked` bit(1) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `used` bit(1) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1lih5y2npsf8u5o3vhdb9y0os` (`user_id`),
  CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table identity_db.refresh_tokens: ~59 rows (approximately)
INSERT INTO `refresh_tokens` (`id`, `expiry_date`, `revoked`, `token`, `used`, `user_id`) VALUES
	('08a2a58b-cd86-49dd-addb-52727d36bafd', '2026-05-22 17:33:10.239156', b'0', '3a5f5659-9bcf-4a3d-9b61-a6b52052d0bf', b'0', 'USE001'),
	('0e3ec054-44f9-4abe-92f1-c6920c80f39c', '2026-05-26 09:19:39.056535', b'0', '452f7091-1f93-460c-bbfd-a16a9af011de', b'0', 'USE021'),
	('0ef0e339-b166-4c36-a59f-ca335f2f5f55', '2026-05-25 11:31:13.953615', b'0', '51e4a354-1b3e-46e4-a43b-40e80970eb9c', b'1', 'USE001'),
	('187d2f2f-ca88-42af-b987-07d9422a40b1', '2026-05-25 08:09:10.357357', b'0', 'f47f3d0e-be69-466b-87e7-3c9dd4bb622a', b'1', 'USE001'),
	('1bba5b93-c276-47e4-af17-3567c3e96507', '2026-05-24 16:02:55.526438', b'0', '564beae0-257a-483e-b394-e0bf77ac23f9', b'1', 'USE011'),
	('1d204aed-0d5f-4c2b-97e1-2a6cbcd3e1b2', '2026-05-26 08:56:22.105824', b'1', 'ffc1517d-c90c-42ee-91ae-923265a1c7a0', b'1', 'USE021'),
	('226bf534-f6ea-4ec7-8950-36c31a028c7c', '2026-05-25 10:21:49.601251', b'1', 'b859bf4d-8f1a-4019-a0f9-1faed4ed4ac9', b'1', 'USE001'),
	('271c7175-ca96-4f58-bfe0-3d4000c4faf1', '2026-05-24 13:48:51.246846', b'0', 'a42e1a25-75ef-4ffe-a4b9-e3b9faf3316f', b'1', 'USE011'),
	('2f4ffceb-29ea-4065-8f46-2f71fae9a1aa', '2026-05-24 13:38:13.126302', b'1', '9c390f0e-3ad6-4e60-8dbb-8d66aceba261', b'1', 'USE013'),
	('31aa0364-2fbe-4a9d-bae8-8d9677cde70f', '2026-05-23 12:53:12.335628', b'0', '3cb89e25-1755-466e-97a1-569ef6c073d5', b'1', 'USE013'),
	('3291752e-f370-4a1b-b276-18d5e11f651e', '2026-05-25 12:52:34.995360', b'0', 'b0cee630-56e1-45ce-9ca3-50b872365cb7', b'0', 'USE001'),
	('33dd0003-eb4f-469b-ad83-9849dd9d607a', '2026-05-25 11:01:02.383190', b'0', '4d5715e9-d4c4-464a-b456-1f571aaeda44', b'0', 'USE011'),
	('3463eb20-1885-4325-bca6-9be3106b2ada', '2026-05-24 13:33:34.289122', b'0', '1715e9df-8f87-4a43-bcad-5be031948cbd', b'0', 'USE011'),
	('3857a4a5-d01d-4375-8307-acab445727a7', '2026-05-23 15:03:08.530660', b'0', '6f1b73aa-4190-4037-99a1-a8548a00f5d1', b'0', 'USE013'),
	('3e739827-15c3-40f9-a029-c0a0d5dff898', '2026-05-23 14:01:24.543312', b'0', 'e5adeb80-dfb6-44fc-90f0-e1e13b329495', b'1', 'USE013'),
	('42a59934-f09f-4f87-9360-851c2b4023bf', '2026-05-26 07:36:40.226643', b'1', '256eca14-8b50-407c-bff5-1fa1832d0c1b', b'1', 'USE001'),
	('4548493c-1548-4523-bd00-1cd28d86c373', '2026-05-25 13:34:00.371482', b'0', '1d47d19e-7d06-4f39-b1d3-d3b8bf7d93fe', b'1', 'USE021'),
	('46ae3569-1892-4c89-95c5-012fb02ded48', '2026-05-23 16:40:40.794475', b'0', 'fb0bd770-8936-4c1c-b980-b00f5677840d', b'0', 'USE001'),
	('4d0e9dd8-9525-4c3b-a8a9-7396760ca841', '2026-05-25 12:52:54.436913', b'0', 'f839a95f-abda-4c41-a456-a513c5b1b802', b'1', 'USE001'),
	('5928bc17-ce68-4eaa-b607-0dab2ae2ec46', '2026-05-24 17:09:04.263917', b'1', '115763e1-fc54-4348-98a1-7248410cf696', b'1', 'USE011'),
	('5ad37ead-27e6-4714-85ab-40e2a7b7c781', '2026-05-24 14:59:41.665502', b'0', 'ece5fb42-f050-4b25-b389-22a45e4a13d3', b'0', 'USE011'),
	('68d01edb-a2c0-43b0-8405-f195dd6c586d', '2026-05-24 13:38:39.891754', b'0', '46980352-0527-4e47-a377-7397c74170b9', b'0', 'USE011'),
	('6b3cfe13-ab15-4b63-b054-37d891f5b137', '2026-05-26 08:02:09.514759', b'1', '01e7bb54-cd38-4d58-8fd3-8b0c984bdd6e', b'1', 'USE001'),
	('6fdeec55-f4b9-4d93-b720-0fd5988919a0', '2026-05-24 17:48:02.232208', b'0', '4216c05b-99bf-4d4b-9387-f956424a45c7', b'1', 'USE013'),
	('77060f2a-4ad0-4e2c-9c04-5828a9ffe546', '2026-05-23 15:03:54.017193', b'0', 'a6d0922f-e0c5-4233-ac2f-f0509243412b', b'1', 'USE013'),
	('7860893d-3813-40cf-89fd-b7e7af27c04f', '2026-05-25 07:00:13.811891', b'0', '28fb024f-1611-486a-bbe5-929e4a330312', b'0', 'USE013'),
	('80468060-c568-4b93-947d-ddffd2523cb5', '2026-05-22 16:15:16.551592', b'0', 'e1d14a56-6ddd-4dc4-a7ef-54cd1c465745', b'1', 'USE001'),
	('804ffe8d-8ae5-4379-8041-8b927d4e5586', '2026-05-24 13:37:41.969496', b'1', '229237db-f3a6-4f11-8785-d2269ea99ea0', b'1', 'USE011'),
	('805bdc61-2566-4988-8eb2-41fa223fe786', '2026-05-23 16:06:12.453584', b'0', 'af87135b-50b2-43d0-9ad9-caedde3b5b1f', b'0', 'USE013'),
	('82bbffcd-b118-4cdd-8891-8fcd1187ead5', '2026-05-25 11:35:35.296321', b'0', 'c9373c81-ac91-4cc9-abe2-a21788f1e6da', b'0', 'USE002'),
	('85366964-2d40-4bc4-ab38-76b641863b34', '2026-05-25 08:08:33.865509', b'0', 'c918c49b-6afa-4a5c-9311-8345d09518a6', b'0', 'USE001'),
	('874fda7b-28f3-4099-8701-ad6064c0d70e', '2026-05-26 07:05:15.145518', b'1', '18392c42-8543-4265-b7c1-8dd8abf7abba', b'1', 'USE001'),
	('8860585a-f220-4530-8ade-6cb9d8397840', '2026-05-25 08:08:36.303681', b'0', '5ed1845b-dd7c-4c68-8a8a-d12636c07be8', b'1', 'USE011'),
	('908b7528-3e10-4395-8d95-10363a80501f', '2026-05-22 18:45:39.022692', b'0', 'bca72afb-f8b3-4c3a-827d-0ba3e55b93e6', b'1', 'USE001'),
	('919f8fd5-4f80-46dd-926b-4e7584a1f177', '2026-05-23 12:52:33.964934', b'1', '0dba3a93-6fc1-442d-8583-6ccfc524161f', b'1', 'USE013'),
	('935b582e-6e34-4b35-8f45-a61be169e03d', '2026-05-26 10:14:21.318679', b'0', 'c4e6e57a-641f-4e7d-9b4e-6216246cf877', b'0', 'USE001'),
	('99ece92d-0b74-4b5d-9c07-9526cdf954bd', '2026-05-25 07:00:31.762864', b'0', '9edcdc0b-1f09-4514-92b1-159b1d2aa225', b'1', 'USE001'),
	('a1ad81c1-50a6-4c72-ad52-08310a8742c4', '2026-05-25 09:10:24.999235', b'0', '5d2349d6-c5c5-4e93-9055-d85a4754f662', b'1', 'USE001'),
	('a383c3ec-7d89-4dc3-9d7f-cda0d6567ba7', '2026-05-23 15:39:34.100068', b'0', 'e8341d38-065d-4916-a193-e90f9a709732', b'1', 'USE001'),
	('a6735a8b-13ae-4840-903e-71b0e8a1819c', '2026-05-25 14:45:25.368738', b'0', 'cdbb866f-ddc3-4f49-97fc-e2e6310eb5cc', b'0', 'USE021'),
	('aa97bbcc-117d-458c-b354-6bc152f409a0', '2026-05-26 08:58:02.734550', b'0', 'cff61e0c-e5dd-4776-8a7a-82eedba67beb', b'1', 'USE001'),
	('ac7c716e-7df5-42b2-bf3c-e7480d411beb', '2026-05-25 12:54:54.619343', b'0', 'cfb8f4cc-ed40-48b1-903d-855ea5de4b1c', b'0', 'USE028'),
	('ad81ed77-642f-4c5e-9604-eab89e1f4781', '2026-05-25 13:57:28.793961', b'0', '6d01eb3d-a7a0-453f-87b6-89e63c9d128f', b'0', 'USE001'),
	('b3cae032-bed2-41ea-a861-98f511e62fef', '2026-05-23 12:50:23.189033', b'1', 'f9276e42-6646-4c7e-bc61-30ba6f11516b', b'1', 'USE001'),
	('b7549875-a9db-49cd-90e4-e7d8fe52670f', '2026-05-23 12:50:11.593689', b'0', 'dcf71cdf-9171-4bdc-ba3a-be265665cc2d', b'0', 'USE001'),
	('b7702cac-ae4a-4e12-bbb7-efea82037cfe', '2026-05-25 13:24:54.660555', b'0', 'f9088bf8-69f8-438a-9e8c-acc20c4641b3', b'0', 'USE028'),
	('bfa8e5dd-b0cc-478b-ba42-e8a32d97f6b1', '2026-05-23 14:26:39.984560', b'0', '21d7c6ab-1cfd-41fb-85d4-26f15dcae74b', b'1', 'USE001'),
	('c73718b3-15d5-4cd4-86ae-09dd19519be5', '2026-05-24 13:33:54.529163', b'0', '83a2cc3c-9070-4eae-b82b-9a024a7f87b9', b'0', 'USE002'),
	('c9313d15-e31d-4b6d-8205-cc48db3edce5', '2026-05-25 14:44:37.584501', b'0', '9dcbfa56-93d4-4810-88cb-c08e3e3f58b8', b'0', 'USE021'),
	('cf2c88d8-1ed7-4253-8a2b-d4c0c77fd545', '2026-05-25 07:04:20.933387', b'0', 'd72249e7-cd09-4c41-9047-ced3a12a77c8', b'1', 'USE011'),
	('d7c23e85-5451-47b1-bc80-d5cc78be5b9e', '2026-05-24 15:00:49.900937', b'0', '7ac843a6-2cfc-4b7b-94e3-e16e05129f1c', b'1', 'USE011'),
	('dc57f823-7567-4d3d-9bc2-6235b13f1474', '2026-05-24 17:34:32.424165', b'1', 'a6f68901-8e0f-4e29-b0f2-c4d28a18791e', b'1', 'USE001'),
	('deefdb09-cac2-499d-94c5-755c7f7e6a21', '2026-05-23 16:06:26.498488', b'0', 'f6fab89c-d5f0-4025-b07c-0e6c8b682b9a', b'1', 'USE011'),
	('e15caca5-ce2e-4903-a2c9-cd33b5204426', '2026-05-23 12:50:56.259054', b'1', '7a492306-f113-4262-af5f-9adf02c7ec6e', b'1', 'USE011'),
	('eaf81199-425f-4877-be67-0f083c276e23', '2026-05-25 09:55:27.879063', b'0', '1962286d-62e9-402e-80f9-dbadc8b60b0f', b'1', 'USE011'),
	('f0af727f-1b90-4373-9be7-c2a1be1bdacf', '2026-05-25 10:48:45.090915', b'0', 'bb5cfa86-66c9-432b-91f1-027cdbeecf8e', b'0', 'USE026'),
	('f133071c-c389-424a-bfb3-c11a0b1e1c0d', '2026-05-24 16:02:15.590509', b'0', 'aee26349-2ad4-4d1d-ad9b-ba28e202188f', b'0', 'USE011'),
	('f528c93d-49ea-476e-9248-62d00898afbc', '2026-05-22 17:35:11.410826', b'0', 'c0430ced-edfd-4583-b32e-168138fc7ed3', b'1', 'USE001'),
	('fa4e9e30-743d-4dff-b6f2-f92cc2371676', '2026-05-25 10:29:31.239745', b'1', '314dde71-f5bc-4806-b753-c47e1b334ccb', b'1', 'USE049');

-- Dumping structure for table identity_db.registration_verification_tokens
CREATE TABLE IF NOT EXISTS `registration_verification_tokens` (
  `id` varchar(255) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used` bit(1) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqd1plln8nqfj66p1vbmt2b34a` (`token`),
  UNIQUE KEY `UKklp7s8de538auia8map6g0gwc` (`user_id`),
  CONSTRAINT `FKoiajhqqnkd7oyhxdpf5ynuv3r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table identity_db.registration_verification_tokens: ~0 rows (approximately)

-- Dumping structure for table identity_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `is_deleted` bit(1) NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','GUEST','LECTURER','MEMBER','STUDENT','SUPER_ADMIN') DEFAULT NULL,
  `status` enum('ACTIVE','DISABLED','LOCKED','PENDING') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table identity_db.users: ~115 rows (approximately)
INSERT INTO `users` (`id`, `avatar_url`, `bio`, `created_at`, `date_of_birth`, `email`, `full_name`, `gender`, `is_deleted`, `last_login_at`, `password_hash`, `phone`, `role`, `status`, `updated_at`, `username`) VALUES
	('USE001', 'https://s3-demo-practice-728399089150.s3.ap-southeast-1.amazonaws.com/0d2f-1779177739163-avatar.jpg', 'Người dùng Nguyễn Bùi Tấn Hiển (SA) với vai trò SUPER_ADMIN.', '2026-05-15 14:29:43.000000', '1986-08-21', 'super_admin_001@gmail.com', 'Nguyễn Bùi Tấn Hiển (SA)', 'MALE', b'0', '2026-05-19 08:58:02.733424', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903997433', 'SUPER_ADMIN', 'ACTIVE', '2026-05-19 08:58:02.736338', 'super_admin_001'),
	('USE002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE002', 'Người dùng Phan Thị Bình với vai trò SUPER_ADMIN.', '2026-05-15 14:29:43.000000', '1989-03-05', 'super_admin_002@gmail.com', 'Phan Thị Bình', 'FEMALE', b'0', '2026-05-18 11:35:35.295329', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907288521', 'SUPER_ADMIN', 'ACTIVE', '2026-05-18 11:35:35.297570', 'super_admin_002'),
	('USE003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE003', 'Người dùng Phan Văn Linh với vai trò SUPER_ADMIN.', '2026-05-15 14:29:43.000000', '1985-01-27', 'super_admin_003@gmail.com', 'Phan Văn Linh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901003285', 'SUPER_ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'super_admin_003'),
	('USE004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE004', 'Người dùng Phạm Văn Em với vai trò SUPER_ADMIN.', '2026-05-15 14:29:43.000000', '1989-08-21', 'super_admin_004@gmail.com', 'Phạm Văn Em', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905596040', 'SUPER_ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'super_admin_004'),
	('USE005', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE005', 'Người dùng Vũ Văn Em với vai trò SUPER_ADMIN.', '2026-05-15 14:29:43.000000', '1988-11-03', 'super_admin_005@gmail.com', 'Vũ Văn Em', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904651719', 'SUPER_ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'super_admin_005'),
	('USE006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE006', 'Người dùng Nguyễn Bùi Tấn Hiển (AD) với vai trò ADMIN.', '2026-05-15 14:29:43.000000', '1981-11-24', 'admin_006@gmail.com', 'Nguyễn Bùi Tấn Hiển (AD)', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906419490', 'ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'admin_006'),
	('USE007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE007', 'Người dùng Võ Văn Hải với vai trò ADMIN.', '2026-05-15 14:29:43.000000', '1988-02-05', 'admin_007@gmail.com', 'Võ Văn Hải', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906458142', 'ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'admin_007'),
	('USE008', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE008', 'Người dùng Phan Văn Oanh với vai trò ADMIN.', '2026-05-15 14:29:43.000000', '1988-10-03', 'admin_008@gmail.com', 'Phan Văn Oanh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902263869', 'ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'admin_008'),
	('USE009', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE009', 'Người dùng Hoàng Văn Vinh với vai trò ADMIN.', '2026-05-15 14:29:43.000000', '1995-01-25', 'admin_009@gmail.com', 'Hoàng Văn Vinh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902230155', 'ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'admin_009'),
	('USE010', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE010', 'Người dùng Phan Thị Phong với vai trò ADMIN.', '2026-05-15 14:29:43.000000', '1983-02-11', 'admin_010@gmail.com', 'Phan Thị Phong', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905872924', 'ADMIN', 'ACTIVE', '2026-05-15 14:29:43.000000', 'admin_010'),
	('USE011', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE011', 'Người dùng Đặng Văn Quang với vai trò LECTURER.', '2026-05-15 14:29:43.000000', '1984-07-04', 'lecturer_011@gmail.com', 'Đặng Văn Quang', 'MALE', b'0', '2026-05-18 07:04:20.931410', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907656427', 'LECTURER', 'ACTIVE', '2026-05-18 07:04:20.935952', 'lecturer_011'),
	('USE012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE012', 'Người dùng Võ Thị Ngọc với vai trò LECTURER.', '2026-05-15 14:29:43.000000', '1982-11-23', 'lecturer_012@gmail.com', 'Võ Thị Ngọc', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906272762', 'LECTURER', 'ACTIVE', '2026-05-15 14:29:43.000000', 'lecturer_012'),
	('USE013', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE013', 'Người dùng Huỳnh Thị Linh với vai trò LECTURER.', '2026-05-15 14:29:43.000000', '1982-09-05', 'lecturer_013@gmail.com', 'Huỳnh Thị Linh', 'FEMALE', b'0', '2026-05-17 17:48:02.230040', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902763955', 'LECTURER', 'ACTIVE', '2026-05-17 17:48:02.233895', 'lecturer_013'),
	('USE014', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE014', 'Người dùng Võ Thị Uyên với vai trò LECTURER.', '2026-05-15 14:29:43.000000', '1995-03-11', 'lecturer_014@gmail.com', 'Võ Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906709421', 'LECTURER', 'ACTIVE', '2026-05-15 14:29:43.000000', 'lecturer_014'),
	('USE015', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE015', 'Người dùng Võ Văn Hải với vai trò LECTURER.', '2026-05-15 14:29:43.000000', '1988-11-08', 'lecturer_015@gmail.com', 'Võ Văn Hải', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904190507', 'LECTURER', 'ACTIVE', '2026-05-15 14:29:43.000000', 'lecturer_015'),
	('USE016', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE016', 'Người dùng Võ Văn Quang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-12-17', 'student_016@gmail.com', 'Võ Văn Quang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907684700', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_016'),
	('USE017', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE017', 'Người dùng Nguyễn Thị Trang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-03-21', 'student_017@gmail.com', 'Nguyễn Thị Trang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908859951', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_017'),
	('USE018', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE018', 'Người dùng Lê Văn Giang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2001-10-13', 'student_018@gmail.com', 'Lê Văn Giang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907215432', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_018'),
	('USE019', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE019', 'Người dùng Đặng Văn Trang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2000-09-20', 'student_019@gmail.com', 'Đặng Văn Trang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908724227', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_019'),
	('USE020', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE020', 'Người dùng Nguyễn Thị Phú với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-03-27', 'student_020@gmail.com', 'Nguyễn Thị Phú', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908961613', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_020'),
	('USE021', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE021', 'Người dùng Nguyễn Văn Phú với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2001-11-29', 'student_021@gmail.com', 'Nguyễn Văn Phú', 'MALE', b'0', '2026-05-19 09:19:39.053038', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905849266', 'STUDENT', 'ACTIVE', '2026-05-19 09:19:39.058286', 'student_021'),
	('USE022', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE022', 'Người dùng Võ Thị Quang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-12-20', 'student_022@gmail.com', 'Võ Thị Quang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909353563', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_022'),
	('USE023', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE023', 'Người dùng Huỳnh Văn Vinh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-10-23', 'student_023@gmail.com', 'Huỳnh Văn Vinh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902429881', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_023'),
	('USE024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE024', 'Người dùng Hoàng Thị Uyên với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2002-04-18', 'student_024@gmail.com', 'Hoàng Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909820771', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_024'),
	('USE025', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE025', 'Người dùng Huỳnh Thị Phú với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2002-06-07', 'student_025@gmail.com', 'Huỳnh Thị Phú', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906872532', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_025'),
	('USE026', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE026', 'Người dùng Đặng Văn Quang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2001-12-22', 'student_026@gmail.com', 'Đặng Văn Quang', 'MALE', b'0', '2026-05-18 10:48:45.089354', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906943182', 'STUDENT', 'ACTIVE', '2026-05-18 10:48:45.092952', 'student_026'),
	('USE027', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE027', 'Người dùng Phạm Văn Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2002-07-11', 'student_027@gmail.com', 'Phạm Văn Châu', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905632187', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_027'),
	('USE028', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE028', 'Người dùng Hoàng Thị Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2005-10-07', 'student_028@gmail.com', 'Hoàng Thị Châu', 'FEMALE', b'0', '2026-05-18 13:24:54.629511', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901689095', 'STUDENT', 'ACTIVE', '2026-05-18 13:24:54.683242', 'student_028'),
	('USE029', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE029', 'Người dùng Hoàng Thị Quang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-07-29', 'student_029@gmail.com', 'Hoàng Thị Quang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904606642', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_029'),
	('USE030', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE030', 'Người dùng Đặng Văn Sơn với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-03-09', 'student_030@gmail.com', 'Đặng Văn Sơn', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901599737', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_030'),
	('USE031', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE031', 'Người dùng Phạm Thị Phong với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-09-04', 'student_031@gmail.com', 'Phạm Thị Phong', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909093435', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_031'),
	('USE032', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE032', 'Người dùng Võ Thị Vinh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2005-06-16', 'student_032@gmail.com', 'Võ Thị Vinh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902251191', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_032'),
	('USE033', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE033', 'Người dùng Lê Thị Uyên với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-09-13', 'student_033@gmail.com', 'Lê Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909080161', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_033'),
	('USE034', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE034', 'Người dùng Trần Thị Em với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2000-09-29', 'student_034@gmail.com', 'Trần Thị Em', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904826088', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_034'),
	('USE035', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE035', 'Người dùng Phạm Thị Vinh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-01-30', 'student_035@gmail.com', 'Phạm Thị Vinh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909616350', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_035'),
	('USE036', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE036', 'Người dùng Hoàng Văn Phong với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-09-04', 'student_036@gmail.com', 'Hoàng Văn Phong', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906327422', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_036'),
	('USE037', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE037', 'Người dùng Hoàng Văn Sơn với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2001-09-10', 'student_037@gmail.com', 'Hoàng Văn Sơn', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902319507', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_037'),
	('USE038', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE038', 'Người dùng Vũ Văn Bình với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-08-03', 'student_038@gmail.com', 'Vũ Văn Bình', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909091491', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_038'),
	('USE039', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE039', 'Người dùng Trần Văn Sơn với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-09-29', 'student_039@gmail.com', 'Trần Văn Sơn', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905953708', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_039'),
	('USE040', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE040', 'Người dùng Trần Văn Thảo với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2002-03-26', 'student_040@gmail.com', 'Trần Văn Thảo', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905974059', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_040'),
	('USE041', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE041', 'Người dùng Vũ Thị Bình với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-03-10', 'student_041@gmail.com', 'Vũ Thị Bình', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901251554', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_041'),
	('USE042', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE042', 'Người dùng Võ Thị Phú với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-05-19', 'student_042@gmail.com', 'Võ Thị Phú', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903715103', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_042'),
	('USE043', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE043', 'Người dùng Võ Thị An với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2004-07-01', 'student_043@gmail.com', 'Võ Thị An', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905691621', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_043'),
	('USE044', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE044', 'Người dùng Đặng Thị Dũng với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-07-12', 'student_044@gmail.com', 'Đặng Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904532817', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_044'),
	('USE045', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE045', 'Người dùng Phan Thị Bình với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-09-29', 'student_045@gmail.com', 'Phan Thị Bình', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905681060', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_045'),
	('USE046', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE046', 'Người dùng Lê Văn Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-08-25', 'student_046@gmail.com', 'Lê Văn Châu', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908257622', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_046'),
	('USE047', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE047', 'Người dùng Võ Thị Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2005-03-30', 'student_047@gmail.com', 'Võ Thị Châu', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901673232', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_047'),
	('USE048', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE048', 'Người dùng Đặng Văn Thảo với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-07-05', 'student_048@gmail.com', 'Đặng Văn Thảo', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901162287', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_048'),
	('USE049', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE049', 'Người dùng Võ Thị Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2000-01-02', 'student_049@gmail.com', 'Võ Thị Châu', 'FEMALE', b'0', '2026-05-18 10:29:31.238647', '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907934554', 'STUDENT', 'ACTIVE', '2026-05-18 10:29:31.241294', 'student_049'),
	('USE050', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE050', 'Người dùng Lê Thị Thảo với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-04-14', 'student_050@gmail.com', 'Lê Thị Thảo', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908599281', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_050'),
	('USE051', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE051', 'Người dùng Vũ Văn Minh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-12-12', 'student_051@gmail.com', 'Vũ Văn Minh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901180532', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_051'),
	('USE052', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE052', 'Người dùng Võ Thị Phong với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-05-14', 'student_052@gmail.com', 'Võ Thị Phong', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906208631', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_052'),
	('USE053', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE053', 'Người dùng Hoàng Thị Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2002-07-13', 'student_053@gmail.com', 'Hoàng Thị Châu', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905968333', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_053'),
	('USE054', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE054', 'Người dùng Vũ Văn Khánh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-01-13', 'student_054@gmail.com', 'Vũ Văn Khánh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902650894', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_054'),
	('USE055', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE055', 'Người dùng Vũ Thị Dũng với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2001-03-19', 'student_055@gmail.com', 'Vũ Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906900389', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_055'),
	('USE056', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE056', 'Người dùng Lê Văn Em với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-04-20', 'student_056@gmail.com', 'Lê Văn Em', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904222423', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_056'),
	('USE057', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE057', 'Người dùng Vũ Văn Châu với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-03-16', 'student_057@gmail.com', 'Vũ Văn Châu', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904724937', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_057'),
	('USE058', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE058', 'Người dùng Nguyễn Thị Trang với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-10-15', 'student_058@gmail.com', 'Nguyễn Thị Trang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903676630', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_058'),
	('USE059', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE059', 'Người dùng Phạm Thị Uyên với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2000-02-04', 'student_059@gmail.com', 'Phạm Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907719794', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_059'),
	('USE060', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE060', 'Người dùng Phạm Thị Bình với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-05-03', 'student_060@gmail.com', 'Phạm Thị Bình', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901496819', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_060'),
	('USE061', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE061', 'Người dùng Đặng Văn Phong với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1998-05-23', 'student_061@gmail.com', 'Đặng Văn Phong', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904080693', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_061'),
	('USE062', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE062', 'Người dùng Trần Thị Oanh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '1999-07-26', 'student_062@gmail.com', 'Trần Thị Oanh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902846995', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_062'),
	('USE063', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE063', 'Người dùng Phan Văn Phong với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2003-04-10', 'student_063@gmail.com', 'Phan Văn Phong', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909781475', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_063'),
	('USE064', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE064', 'Người dùng Trần Thị Khánh với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2005-01-27', 'student_064@gmail.com', 'Trần Thị Khánh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906621658', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_064'),
	('USE065', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE065', 'Người dùng Võ Thị Dũng với vai trò STUDENT.', '2026-05-15 14:29:43.000000', '2005-03-24', 'student_065@gmail.com', 'Võ Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901223950', 'STUDENT', 'ACTIVE', '2026-05-15 14:29:43.000000', 'student_065'),
	('USE066', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE066', 'Người dùng Nguyễn Thị Bình với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-05-21', 'guest_066@gmail.com', 'Nguyễn Thị Bình', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908568166', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_066'),
	('USE067', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE067', 'Người dùng Võ Văn Thảo với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2000-03-27', 'guest_067@gmail.com', 'Võ Văn Thảo', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903254252', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_067'),
	('USE068', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE068', 'Người dùng Phạm Thị Phong với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-05-01', 'guest_068@gmail.com', 'Phạm Thị Phong', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907055738', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_068'),
	('USE069', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE069', 'Người dùng Huỳnh Thị Dũng với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2000-11-11', 'guest_069@gmail.com', 'Huỳnh Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902192044', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_069'),
	('USE070', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE070', 'Người dùng Hoàng Thị An với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-06-03', 'guest_070@gmail.com', 'Hoàng Thị An', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909171687', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_070'),
	('USE071', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE071', 'Người dùng Trần Văn Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-09-26', 'guest_071@gmail.com', 'Trần Văn Quang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904789323', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_071'),
	('USE072', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE072', 'Người dùng Phan Văn Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-10-29', 'guest_072@gmail.com', 'Phan Văn Quang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905569621', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_072'),
	('USE073', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE073', 'Người dùng Vũ Văn Phú với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-08-13', 'guest_073@gmail.com', 'Vũ Văn Phú', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902994970', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_073'),
	('USE074', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE074', 'Người dùng Đặng Thị Minh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2005-11-16', 'guest_074@gmail.com', 'Đặng Thị Minh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901773706', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_074'),
	('USE075', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE075', 'Người dùng Nguyễn Thị Dũng với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2005-02-27', 'guest_075@gmail.com', 'Nguyễn Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901372768', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_075'),
	('USE076', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE076', 'Người dùng Phạm Thị Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-06-27', 'guest_076@gmail.com', 'Phạm Thị Quang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908412499', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_076'),
	('USE077', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE077', 'Người dùng Phạm Văn Linh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-02-27', 'guest_077@gmail.com', 'Phạm Văn Linh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907614291', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_077'),
	('USE078', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE078', 'Người dùng Phan Văn Sơn với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-03-29', 'guest_078@gmail.com', 'Phan Văn Sơn', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901090641', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_078'),
	('USE079', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE079', 'Người dùng Huỳnh Thị Thảo với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-08-19', 'guest_079@gmail.com', 'Huỳnh Thị Thảo', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906062044', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_079'),
	('USE080', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE080', 'Người dùng Huỳnh Văn Uyên với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-07-29', 'guest_080@gmail.com', 'Huỳnh Văn Uyên', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909027801', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_080'),
	('USE081', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE081', 'Người dùng Phan Thị An với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-02-02', 'guest_081@gmail.com', 'Phan Thị An', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905335595', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_081'),
	('USE082', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE082', 'Người dùng Phạm Thị Phú với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2000-05-11', 'guest_082@gmail.com', 'Phạm Thị Phú', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905333089', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_082'),
	('USE083', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE083', 'Người dùng Võ Văn An với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-09-25', 'guest_083@gmail.com', 'Võ Văn An', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907389377', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_083'),
	('USE084', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE084', 'Người dùng Đặng Văn An với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-08-22', 'guest_084@gmail.com', 'Đặng Văn An', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909593284', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_084'),
	('USE085', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE085', 'Người dùng Vũ Văn Oanh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-01-26', 'guest_085@gmail.com', 'Vũ Văn Oanh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904839047', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_085'),
	('USE086', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE086', 'Người dùng Lê Văn Minh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-12-15', 'guest_086@gmail.com', 'Lê Văn Minh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902451775', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_086'),
	('USE087', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE087', 'Người dùng Huỳnh Thị Linh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-09-15', 'guest_087@gmail.com', 'Huỳnh Thị Linh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909351344', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_087'),
	('USE088', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE088', 'Người dùng Vũ Văn Phú với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-05-20', 'guest_088@gmail.com', 'Vũ Văn Phú', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901639676', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_088'),
	('USE089', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE089', 'Người dùng Đặng Thị Uyên với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1998-11-27', 'guest_089@gmail.com', 'Đặng Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903169404', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_089'),
	('USE090', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE090', 'Người dùng Trần Văn Trang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-03-12', 'guest_090@gmail.com', 'Trần Văn Trang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908781389', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_090'),
	('USE091', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE091', 'Người dùng Lê Thị Dũng với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1998-10-28', 'guest_091@gmail.com', 'Lê Thị Dũng', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904091713', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_091'),
	('USE092', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE092', 'Người dùng Lê Thị Bình với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-05-08', 'guest_092@gmail.com', 'Lê Thị Bình', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0906283937', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_092'),
	('USE093', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE093', 'Người dùng Phạm Văn Uyên với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-05-15', 'guest_093@gmail.com', 'Phạm Văn Uyên', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909525321', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_093'),
	('USE094', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE094', 'Người dùng Vũ Thị Uyên với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-07-11', 'guest_094@gmail.com', 'Vũ Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908774862', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_094'),
	('USE095', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE095', 'Người dùng Vũ Thị Minh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-12-11', 'guest_095@gmail.com', 'Vũ Thị Minh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903913526', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_095'),
	('USE096', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE096', 'Người dùng Phạm Thị Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-09-23', 'guest_096@gmail.com', 'Phạm Thị Quang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901105895', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_096'),
	('USE097', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE097', 'Người dùng Hoàng Văn Vinh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2005-09-22', 'guest_097@gmail.com', 'Hoàng Văn Vinh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908766489', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_097'),
	('USE098', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE098', 'Người dùng Võ Thị Em với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2003-06-30', 'guest_098@gmail.com', 'Võ Thị Em', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905857003', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_098'),
	('USE099', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE099', 'Người dùng Phạm Thị Châu với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2005-07-12', 'guest_099@gmail.com', 'Phạm Thị Châu', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907600234', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_099'),
	('USE100', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE100', 'Người dùng Hoàng Thị Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-11-24', 'guest_100@gmail.com', 'Hoàng Thị Quang', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905604538', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_100'),
	('USE101', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE101', 'Người dùng Trần Văn Bình với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-10-21', 'guest_101@gmail.com', 'Trần Văn Bình', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908485118', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_101'),
	('USE102', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE102', 'Người dùng Hoàng Thị Thảo với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-10-03', 'guest_102@gmail.com', 'Hoàng Thị Thảo', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0907362687', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_102'),
	('USE103', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE103', 'Người dùng Võ Thị Uyên với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2004-11-07', 'guest_103@gmail.com', 'Võ Thị Uyên', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908395688', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_103'),
	('USE104', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE104', 'Người dùng Võ Văn Thảo với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-07-03', 'guest_104@gmail.com', 'Võ Văn Thảo', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904520803', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_104'),
	('USE105', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE105', 'Người dùng Hoàng Thị Em với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-12-06', 'guest_105@gmail.com', 'Hoàng Thị Em', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0905288389', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_105'),
	('USE106', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE106', 'Người dùng Lê Thị Sơn với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2002-12-12', 'guest_106@gmail.com', 'Lê Thị Sơn', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904159534', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_106'),
	('USE107', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE107', 'Người dùng Lê Thị Oanh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1998-06-07', 'guest_107@gmail.com', 'Lê Thị Oanh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904798307', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_107'),
	('USE108', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE108', 'Người dùng Phạm Thị Minh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2000-12-16', 'guest_108@gmail.com', 'Phạm Thị Minh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0904012502', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_108'),
	('USE109', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE109', 'Người dùng Phạm Văn Linh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-03-08', 'guest_109@gmail.com', 'Phạm Văn Linh', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0902626865', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_109'),
	('USE110', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE110', 'Người dùng Phan Văn Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1999-02-24', 'guest_110@gmail.com', 'Phan Văn Quang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909846821', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_110'),
	('USE111', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE111', 'Người dùng Lê Thị Phong với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-11-16', 'guest_111@gmail.com', 'Lê Thị Phong', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909293904', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_111'),
	('USE112', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE112', 'Người dùng Võ Thị Khánh với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2005-11-28', 'guest_112@gmail.com', 'Võ Thị Khánh', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0909391169', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_112'),
	('USE113', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE113', 'Người dùng Đặng Thị An với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1998-07-05', 'guest_113@gmail.com', 'Đặng Thị An', 'FEMALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0901807154', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_113'),
	('USE114', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE114', 'Người dùng Phan Văn Quang với vai trò GUEST.', '2026-05-15 14:29:43.000000', '1998-12-04', 'guest_114@gmail.com', 'Phan Văn Quang', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0908994005', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_114'),
	('USE115', 'https://api.dicebear.com/7.x/avataaars/svg?seed=USE115', 'Người dùng Phan Văn Dũng với vai trò GUEST.', '2026-05-15 14:29:43.000000', '2001-11-25', 'guest_115@gmail.com', 'Phan Văn Dũng', 'MALE', b'0', NULL, '$2a$10$nW9zCrVtyzzhgT9qjmPxQ.2WkQtlCrZ88mAdjJ6zsr/czO.itUe96', '0903950948', 'GUEST', 'ACTIVE', '2026-05-15 14:29:43.000000', 'guest_115');

-- Dumping structure for table identity_db.verification_tokens
CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `id` varchar(255) NOT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `used` bit(1) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK54y8mqsnq1rtyf581sfmrbp4f` (`user_id`),
  CONSTRAINT `FK54y8mqsnq1rtyf581sfmrbp4f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table identity_db.verification_tokens: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
