-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3310
-- Waktu pembuatan: 14 Bulan Mei 2025 pada 09.40
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
(1, 'Math Class - 10th Grade', 'class', '2025-05-07 00:10:00', '2025-05-14 07:24:00', '2025-05-06 18:38:39', '2025-05-14 07:23:51', 1),
(2, 'School Annual Event', 'event', '2025-05-10 01:00:00', '2025-05-14 07:45:00', '2025-05-06 18:38:39', '2025-05-14 06:56:11', 1),
(3, 'Science Class - 11th Grade', 'class', '2025-05-12 00:30:00', '2025-05-14 07:45:00', '2025-05-06 18:38:39', '2025-05-14 06:55:50', 1);

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
(1, 'Yanto Wijaya', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL),
(2, 'Rina Suryani', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL),
(3, 'Dedi Nugroho', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL);

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
(1, '123456789', '987654321', 'Aliyah Putri', '2007-02-15', 'Jakarta', 'shirokodddd1.jpg', 'Jl. Melati No. 10', NULL, '2025-05-06 18:37:43', '2025-05-07 01:40:17', NULL, NULL),
(2, '234567890', '876543210', 'Bram Satria', '2008-06-20', 'Bandung', 'photos/bram.jpg', 'Jl. Merpati No. 5', NULL, '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL, NULL),
(3, '345678901', '765432109', 'Citra Dewi', '2009-10-10', 'Surabaya', 'photos/citra.jpg', 'Jl. Pahlawan No. 7', NULL, '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL, NULL);

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
(1, '2025-05-08 00:05:00', 'shiroko1.jpg', '2025-05-07 01:37:37', 1, 1, 'Front row'),
(2, '2025-05-10 01:15:00', 'attendance_photos/bram_2025_05_10.jpg', '2025-05-06 18:38:39', 2, 2, 'Middle row'),
(3, '2025-05-12 00:35:00', 'attendance_photos/citra_2025_05_12.jpg', '2025-05-06 18:38:39', 3, 3, 'Back row'),
(4, '2025-05-08 00:05:01', 'hehhe', '2025-05-07 00:57:44', 1, 2, 'ok');

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
(1, 'Budi Santoso', '12345', 'photos/budi.jpg', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL),
(2, 'Siti Nurhaliza', '67890', 'photos/siti.jpg', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL),
(3, 'Ahmad Fauzi', '54321', 'photos/ahmad.jpg', '2025-05-06 18:37:43', '2025-05-06 18:37:43', NULL);

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
  `wa_num` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `created_at`, `updated_at`, `role`, `wa_num`) VALUES
(2, 'admin', '$2b$10$b963.NauQRMrthqtMBVUwO7ucTD8Qx3hccc8y6EdmNwsE9OBGu9iu', 'admin@example.com', '2025-05-14 04:19:26', '2025-05-14 04:19:26', 'admin', '081234567890');

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
  MODIFY `as_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `parents`
--
ALTER TABLE `parents`
  MODIFY `parent_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  MODIFY `sa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `teachers`
--
ALTER TABLE `teachers`
  MODIFY `teacher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
