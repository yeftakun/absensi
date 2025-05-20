-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3310
-- Waktu pembuatan: 20 Bulan Mei 2025 pada 06.58
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `absensi_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance_sessions`
--

CREATE TABLE `attendance_sessions` (
  `as_id` int(11) NOT NULL,
  `as_name` varchar(200) NOT NULL,
  `as_type` enum('class','event') NOT NULL,
  `as_start_time` timestamp NULL DEFAULT NULL,
  `as_end_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `number_of_student` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `attendance_sessions`
--

INSERT INTO `attendance_sessions` (`as_id`, `as_name`, `as_type`, `as_start_time`, `as_end_time`, `created_at`, `updated_at`, `number_of_student`) VALUES
(1, 'Math Class - 10th Grade', 'class', '2025-05-07 00:10:00', '2025-05-14 15:58:00', '2025-05-06 18:38:39', '2025-05-14 14:52:35', 1),
(2, 'School Annual Event', 'event', '2025-05-10 01:00:00', '2025-05-14 07:45:00', '2025-05-06 18:38:39', '2025-05-14 23:44:54', 5),
(3, 'Science Class - 11th Grade', 'class', '2025-05-12 00:30:00', '2025-05-18 18:45:00', '2025-05-06 18:38:39', '2025-05-18 12:35:14', 1),
(7, 'Contoh Sesi', 'class', '2025-05-14 23:45:00', '2025-05-15 01:15:00', '2025-05-14 23:45:46', '2025-05-15 01:00:06', 50),
(8, 'dasdasd', 'class', '2025-05-15 01:53:00', '2025-05-18 15:17:00', '2025-05-15 01:53:21', '2025-05-18 07:08:32', 144),
(10, 'fff', 'class', '2025-05-18 07:27:00', '2025-05-18 15:27:00', '2025-05-18 07:27:33', '2025-05-18 12:27:40', 7),
(11, 'Hsushj', 'class', '2025-05-18 08:21:00', '2025-05-18 22:21:00', '2025-05-18 08:21:34', '2025-05-18 21:52:05', 500),
(12, 'Halo', 'class', '2025-05-18 15:50:00', '2025-05-18 17:50:00', '2025-05-18 15:50:42', '2025-05-18 15:50:42', 5),
(13, 'Test2', 'event', '2025-05-19 00:59:00', '2025-05-19 01:59:00', '2025-05-19 00:59:24', '2025-05-19 00:59:24', 23),
(14, 'Apalah', 'class', '2025-05-19 04:00:00', '2025-05-20 04:00:00', '2025-05-19 04:00:40', '2025-05-19 04:00:40', 30),
(15, 'Matematika', 'class', '2025-05-19 23:49:00', '2025-05-20 00:49:00', '2025-05-19 23:49:45', '2025-05-19 23:49:45', 100);

-- --------------------------------------------------------

--
-- Struktur dari tabel `parents`
--

CREATE TABLE `parents` (
  `parent_id` int(11) NOT NULL,
  `parent_name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `parents`
--

INSERT INTO `parents` (`parent_id`, `parent_name`, `created_at`, `updated_at`, `user_id`) VALUES
(6, 'dasdas', '2025-05-14 12:25:08', '2025-05-14 13:56:35', 20),
(7, 'heheh', '2025-05-14 14:03:26', '2025-05-15 01:32:40', 26),
(8, 'dsd', '2025-05-14 14:10:03', '2025-05-14 14:10:03', NULL),
(9, 'dsadasd', '2025-05-14 14:10:12', '2025-05-14 14:10:12', NULL),
(10, 'dasda', '2025-05-14 14:10:15', '2025-05-14 14:10:15', NULL),
(11, 'adasds', '2025-05-14 14:10:19', '2025-05-14 14:10:19', NULL),
(12, 'dsads', '2025-05-14 14:10:23', '2025-05-14 14:10:23', NULL),
(13, 'dasdad', '2025-05-14 14:10:27', '2025-05-14 14:10:27', NULL),
(14, 'dasdasd', '2025-05-14 14:10:31', '2025-05-14 14:10:31', NULL),
(15, 'dasdsad', '2025-05-14 14:10:36', '2025-05-14 14:10:36', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `nis` varchar(50) NOT NULL,
  `nisn` varchar(50) NOT NULL,
  `student_name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `pob` varchar(50) NOT NULL,
  `photo_path` varchar(200) NOT NULL,
  `address` varchar(200) NOT NULL,
  `rfid` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `students`
--

INSERT INTO `students` (`student_id`, `nis`, `nisn`, `student_name`, `dob`, `pob`, `photo_path`, `address`, `rfid`, `created_at`, `updated_at`, `user_id`, `parent_id`) VALUES
(6, '2131', '2131', 'Yefta Asyel', '2025-05-14', '123', '1747585486258_91.jpg', 'dasd', 'BD C6 5E 21', '2025-05-14 14:08:00', '2025-05-18 16:24:46', 21, 6),
(8, 'N/A', 'N/A', 'Yefta Asyeldsa', '2025-05-14', 'N/A', 'default/default.jpg', 'N/A', NULL, '2025-05-14 14:24:30', '2025-05-14 14:24:30', NULL, NULL),
(12, 'dsad', 'dasd', 'dasdas', '2025-05-14', 'N/A', 'default/default.jpg', 'N/A', NULL, '2025-05-14 14:25:26', '2025-05-14 14:25:26', NULL, NULL),
(15, 'dsadasdasd', 'dasdas', 'dasda', '2025-05-14', 'N/A', 'default/default.jpg', 'N/A', NULL, '2025-05-14 14:31:43', '2025-05-14 14:31:43', NULL, NULL),
(16, 'dasdadaaa', 'aaaaa', 'dasdasd', '2025-05-14', 'N/A', 'default/default.jpg', 'N/A', NULL, '2025-05-14 14:31:50', '2025-05-14 14:31:50', NULL, NULL),
(17, '64564', '64564', '64564', '2025-05-14', 'N/A', 'default/default.jpg', 'N/A', '2C 7C D7 00', '2025-05-14 14:31:58', '2025-05-18 16:08:00', 27, NULL),
(18, '312', '3123', 'ok', '2025-02-19', 'N/A', 'default/default.jpg', 'N/A', NULL, '2025-05-19 00:31:09', '2025-05-19 00:32:05', NULL, 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_attendances`
--

CREATE TABLE `student_attendances` (
  `sa_id` int(11) NOT NULL,
  `sa_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `sa_photo_path` varchar(200) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `as_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `pos` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `student_attendances`
--

INSERT INTO `student_attendances` (`sa_id`, `sa_time`, `sa_photo_path`, `updated_at`, `as_id`, `student_id`, `pos`) VALUES
(8, '2025-05-17 00:43:21', 'default/default.jpg', '2025-05-17 00:43:21', 3, 6, 'A'),
(34, '2025-05-18 13:26:55', '1747574815434_92.jpg', '2025-05-18 13:26:55', 3, 17, 'Pos A'),
(41, '2025-05-18 13:51:00', '1747576260933_65.jpg', '2025-05-18 13:51:00', 8, 17, 'Pos A'),
(42, '2025-05-18 13:57:14', 'default/default.jpg', '2025-05-18 13:57:14', 8, 6, 'Manual'),
(43, '2025-05-18 13:59:48', 'default/default.jpg', '2025-05-18 13:59:48', 8, 8, 'Manual'),
(51, '2025-05-18 15:03:36', '1747580616340_50.jpg', '2025-05-18 15:03:36', 10, 6, 'Pos A'),
(52, '2025-05-18 15:03:47', '1747580627802_30.jpg', '2025-05-18 15:03:47', 10, 17, 'Pos A'),
(71, '2025-05-18 22:15:31', '1747606531897_44.jpg', '2025-05-18 22:15:31', 11, 6, 'Pos A'),
(84, '2025-05-19 01:53:08', '1747619588919_85.jpg', '2025-05-19 01:53:08', 13, 6, 'Pos A'),
(93, '2025-05-19 05:00:02', '1747630802497_33.jpg', '2025-05-19 05:00:02', 14, 6, 'Pos A');

-- --------------------------------------------------------

--
-- Struktur dari tabel `teachers`
--

CREATE TABLE `teachers` (
  `teacher_id` int(11) NOT NULL,
  `teacher_name` varchar(50) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `photo_path` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `teachers`
--

INSERT INTO `teachers` (`teacher_id`, `teacher_name`, `nip`, `photo_path`, `created_at`, `updated_at`, `user_id`) VALUES
(11, 'Guru 1', 'dasd', 'default/default.jpg', '2025-05-14 12:24:57', '2025-05-14 13:13:32', 19),
(13, 'dasdsa', '', 'default/default.jpg', '2025-05-14 14:09:08', '2025-05-14 14:09:08', NULL),
(14, 'dsadadasd', '', 'default/default.jpg', '2025-05-14 14:09:18', '2025-05-14 14:09:18', NULL),
(15, 'dasdas', '', 'default/default.jpg', '2025-05-14 14:09:21', '2025-05-14 14:09:21', NULL),
(16, 'dasdasd', '', 'default/default.jpg', '2025-05-14 14:09:23', '2025-05-14 14:09:23', NULL),
(17, 'adasdasdasd', '', 'default/default.jpg', '2025-05-14 14:09:26', '2025-05-14 14:09:26', NULL),
(18, 'dsadasdasdasd', '', 'default/default.jpg', '2025-05-14 14:09:28', '2025-05-14 14:09:28', NULL),
(19, 'dasdasdsafasfdsad', '', 'default/default.jpg', '2025-05-14 14:09:33', '2025-05-14 14:09:33', NULL),
(20, 'dasdasdasd', '', 'default/default.jpg', '2025-05-14 14:09:36', '2025-05-14 14:09:36', NULL),
(21, 'asdasda', '', 'default/default.jpg', '2025-05-14 14:09:44', '2025-05-14 14:09:44', NULL),
(22, 'dsadas', '', 'default/default.jpg', '2025-05-14 14:10:06', '2025-05-14 14:10:06', NULL),
(23, 'dasd', '', 'default/default.jpg', '2025-05-14 14:10:08', '2025-05-14 14:10:08', NULL),
(24, 'dsad', 'asdas', '1747585555141_11.webp', '2025-05-18 16:25:32', '2025-05-18 16:25:55', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(25) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` enum('admin','teacher','parent','student','scanner') NOT NULL,
  `wa_num` varchar(20) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `last_active` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `created_at`, `updated_at`, `role`, `wa_num`, `is_online`, `last_active`) VALUES
(2, 'admin', '$2b$10$rW/K1o/.XAOdGTq2HkAsmeP5luZHk9y/v2ljHTRVN0tcmKMZWsv3e', 'admin@example.com', '2025-05-14 04:19:26', '2025-05-14 12:35:58', 'admin', '081234567890', 0, NULL),
(17, 'yefta', '$2b$10$iRGmy4nNE9MNj5r9ADdtKunouCadUtU0GAVBWS81w/fB5OV0SjWoG', 'N/A', '2025-05-14 12:38:05', '2025-05-15 02:41:26', 'teacher', '082325960260', 1, '2025-05-15 10:41:26'),
(19, 'ssssrr', '$2b$10$.lsvsUP5O5gx4Cryr2Y7T.2xuIysyUadDVgzZqjLy1K..fdRVk3H.', 'N/A', '2025-05-14 13:02:18', '2025-05-14 13:02:18', 'teacher', 'dasdasd', 0, NULL),
(20, 'orangtua1', '$2b$10$.lebbwwJFYoBzNd5QBe8U.K.DlIOo8gi9Au0TsOZqM7c3AcapsQPa', 'N/A', '2025-05-14 13:08:04', '2025-05-19 05:00:49', 'parent', '6285775471308', 0, NULL),
(21, 'student1', '$2b$10$xvm/.uHJbIkwNzwUGWaz0eqzbfdhsxNfE9yIMVrYnDgZW/oGSmIAm', 'N/A', '2025-05-14 14:04:01', '2025-05-18 15:49:33', 'student', '6282325960260', 0, NULL),
(22, '6546', '$2b$10$gq7rVFnnMpF2CUjf3DOG2.A.jhBWCtQyPW5IJH3wtPmEy/jMx3fOW', 'N/A', '2025-05-14 14:32:07', '2025-05-14 14:32:07', 'teacher', '6456', 0, NULL),
(23, 'aaaa', '$2b$10$3.yz4A5jKSPr9Jj6MFmcTer9CmgWO.6KhQE.NSfLSUgG9OnrG5S.a', 'N/A', '2025-05-14 23:24:35', '2025-05-14 23:25:16', 'student', 'aaaa', 0, NULL),
(24, 'scanner1', '$2b$10$Kmk33Hnt.I13H1NArFUWuOAowqbe2F.9W22OIKpqHHzorz8BZyeES', 'N/A', '2025-05-15 00:40:21', '2025-05-15 02:40:25', 'scanner', '111', 0, '2025-05-15 10:40:25'),
(25, '123', '$2b$10$KN5nLtEasfuVLMoscubGSe3Ch/ER/GBQsy/E2nEAYvRrWyNByfaB6', 'N/A', '2025-05-15 00:40:42', '2025-05-15 00:40:42', 'scanner', '213132', 0, NULL),
(26, 'test11', '$2b$10$KsPeKHFZQ22Vc1QHfUFyXORZ0rg9X5PJWzbwum80QH2/DQrjN8pcy', 'N/A', '2025-05-15 01:32:30', '2025-05-15 01:32:30', 'parent', 'dsadsad', 0, NULL),
(27, 'sad', '$2b$10$xer1gMO9dJmOE/lMxiqC9uaKgIMvCiJDjL3PmNcaRY3r7raJwS/Gm', 'N/A', '2025-05-17 20:39:00', '2025-05-17 20:39:00', 'student', 'dasda', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`as_id`);

--
-- Indeks untuk tabel `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`parent_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD UNIQUE KEY `rfid` (`rfid`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indeks untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  ADD PRIMARY KEY (`sa_id`),
  ADD KEY `as_id` (`as_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indeks untuk tabel `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`teacher_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  MODIFY `as_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `parents`
--
ALTER TABLE `parents`
  MODIFY `parent_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  MODIFY `sa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT untuk tabel `teachers`
--
ALTER TABLE `teachers`
  MODIFY `teacher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`parent_id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  ADD CONSTRAINT `student_attendances_ibfk_1` FOREIGN KEY (`as_id`) REFERENCES `attendance_sessions` (`as_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_attendances_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
