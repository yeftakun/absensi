const db = require('../config/db');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Konfigurasi multer untuk upload foto guru
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'img', 'profile'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const rand = Math.floor(Math.random() * 90 + 10); // 2 digit random
        cb(null, `${timestamp}_${rand}${ext}`);
    }
});
exports.uploadTeacherPhoto = multer({ storage: storage });

exports.index = (req, res) => {
    res.render('index', {
      layout: 'layouts/main-layout',
      title: "Login",
      error: null
    });
  };
  
exports.home = async (req, res) => {
    try {
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        // 1. Jumlah guru (teachers yang punya user_id)
        const [guruRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM teachers WHERE user_id IS NOT NULL"
        );
        // 1b. Jumlah guru yang punya akun (parafrase)
        const totalGuruWithAccount = guruRows[0]?.total || 0;
        // 2. Jumlah siswa terdaftar
        const [studentRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM students"
        );
        // 3. Sesi aktif (end_time > now)
        const [activeSessions] = await db.promise().query(
            "SELECT as_id, number_of_student FROM attendance_sessions WHERE as_end_time > ?",
            [format(now, 'yyyy-MM-dd HH:mm:ss')]
        );
        // 4. Siswa belum absen di sesi aktif
        let totalBelumAbsen = 0;
        let totalSesiAktif = activeSessions.length;
        if (activeSessions.length > 0) {
            const asIds = activeSessions.map(s => s.as_id);
            const totalHarusAbsen = activeSessions.reduce((sum, s) => sum + (s.number_of_student || 0), 0);
            let sudahAbsen = 0;
            if (asIds.length > 0) {
                const [absenRows] = await db.promise().query(
                    `SELECT COUNT(DISTINCT student_id) as total FROM student_attendances WHERE as_id IN (${asIds.map(() => '?').join(',')})`,
                    asIds
                );
                sudahAbsen = absenRows[0]?.total || 0;
            }
            totalBelumAbsen = totalHarusAbsen - sudahAbsen;
            if (totalBelumAbsen < 0) totalBelumAbsen = 0;
        }
        // 5. Absensi tercatat hari ini
        const [absenHariIniRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM student_attendances WHERE DATE(sa_time) = ?",
            [todayStr]
        );
        // 6. Guru login hari ini (updated_at hari ini)
        const [guruLoginRows] = await db.promise().query(
            `SELECT COUNT(*) as total FROM users 
             WHERE role = 'teacher' AND DATE(updated_at) = ?`,
            [todayStr]
        );
        // 7. Sesi berlangsung hari ini (start_time dan end_time hari ini)
        const [sesiHariIniRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM attendance_sessions WHERE DATE(as_start_time) = ? OR DATE(as_end_time) = ?",
            [todayStr, todayStr]
        );
        // 8. Log aktivitas terakhir (ambil 10 dari student_attendances join students)
        const [logRows] = await db.promise().query(
            `SELECT sa.sa_time, s.student_name, sa.pos 
             FROM student_attendances sa
             JOIN students s ON sa.student_id = s.student_id
             ORDER BY sa.sa_time DESC
             LIMIT 10`
        );
        // 9. Log admin/guru (contoh: user update terbaru)
        const [userLogRows] = await db.promise().query(
            `SELECT updated_at, username, role FROM users ORDER BY updated_at DESC LIMIT 5`
        );

        const aktivitasLog = [
            ...logRows.map(l => ({
                type: 'absen',
                waktu: format(new Date(l.sa_time), 'HH:mm'),
                nama: l.student_name,
                pos: l.pos
            })),
            ...userLogRows.map(u => ({
                type: 'user',
                waktu: format(new Date(u.updated_at), 'HH:mm'),
                nama: u.username,
                role: u.role
            }))
        ].sort((a, b) => (a.waktu < b.waktu ? 1 : -1)).slice(0, 10);

        // Orang tua yang sudah punya akun
        const [parentWithAccountRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM parents WHERE user_id IS NOT NULL"
        );
        const [parentTotalRows] = await db.promise().query(
            "SELECT COUNT(*) as total FROM parents"
        );
        const totalParentWithAccount = parentWithAccountRows[0]?.total || 0;
        const totalParent = parentTotalRows[0]?.total || 0;

        res.render('home', {
            layout: 'layouts/main-layout',
            title: "Home",
            name: req.session.name,
            loggedin: req.session.loggedin || false,
            totalGuruAdmin: totalGuruWithAccount,
            totalGuruWithAccount, // for explicit use in view
            totalSiswa: studentRows[0]?.total || 0,
            totalBelumAbsen,
            totalSesiAktif,
            absenHariIni: absenHariIniRows[0]?.total || 0,
            guruLoginHariIni: guruLoginRows[0]?.total || 0,
            sesiHariIni: sesiHariIniRows[0]?.total || 0,
            aktivitasLog,
            totalParentWithAccount,
            totalParent
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};

exports.about = (req, res) => {
    res.render('about', {
        layout: 'layouts/main-layout',
        title: "About",
        loggedin: req.session.loggedin || false
    });
};

exports.scan = async (req, res) => {
    try {
        const [sessions] = await db.promise().query('SELECT * FROM attendance_sessions');
        // Format date fields
        sessions.forEach(session => {
            session.as_start_time = session.as_start_time ? format(new Date(session.as_start_time), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_end_time = session.as_end_time ? format(new Date(session.as_end_time), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_created_at = session.as_created_at ? format(new Date(session.as_created_at), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_updated_at = session.as_updated_at ? format(new Date(session.as_updated_at), 'yyyy-MM-dd HH:mm:ss') : null;
        });
        // Filter sessions where end time is in the future
        const now = new Date();
        const filteredSessions = sessions.filter(session =>
            session.as_end_time && new Date(session.as_end_time) > now
        );

        // Buat array string: "{Nama Sesi} ({sisa waktu})"
        const allSessions = filteredSessions.map(session => {
            const end = new Date(session.as_end_time);
            const diffMs = end - now;
            if (diffMs <= 0) return `${session.as_name} (Berakhir)`;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
            let sisa = '';
            if (diffDays > 0) {
                sisa = `Sisa ${diffDays} hari ${diffHours} jam`;
            } else if (diffHours > 0) {
                sisa = `Sisa ${diffHours} jam ${diffMinutes} menit`;
            } else {
                sisa = `Sisa ${diffMinutes} menit`;
            }
            return `${session.as_name} (${sisa})`;
        });

        res.render('scan', {
            layout: 'layouts/main-layout',
            title: "Scan RFID",
            loggedin: req.session.loggedin || false,
            allSessions
        });
        // console.log('Filtered sessions:', filteredSessions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};

exports.session = async (req, res) => {
    const queries = {
        sessions: 'SELECT * FROM attendance_sessions'
    };
    try {
        // Jalankan semua query secara paralel 
        const [sessions] = await Promise.all([
            db.promise().query(queries.sessions).then(([rows]) => rows)
        ]);

        // Format date field
        sessions.forEach(session => {
            session.as_start_time = session.as_start_time ? format(new Date(session.as_start_time), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_end_time = session.as_end_time ? format(new Date(session.as_end_time), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_created_at = session.as_created_at ? format(new Date(session.as_created_at), 'yyyy-MM-dd HH:mm:ss') : null;
            session.as_updated_at = session.as_updated_at ? format(new Date(session.as_updated_at), 'yyyy-MM-dd HH:mm:ss') : null;
        });

        // render halaman dengan data yang diambil
        res.render('session', {
            layout: 'layouts/main-layout',
            title: "Sesi",
            loggedin: req.session.loggedin || false,
            sessions // number_of_student sudah ikut
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    };
};

exports.sessionMonitor = async (req, res) => {
    const as_id = req.params.as_id;

    const queries = {
        attendance_sessions: 'SELECT * FROM attendance_sessions WHERE as_id = ?',
        students: `
            SELECT *
            FROM students s
            JOIN student_attendances sa ON s.student_id = sa.student_id
            WHERE sa.as_id = ?
            ORDER BY sa.sa_time DESC
        `,
        latest_logs: `
            SELECT s.student_name as name, s.nis, sa.sa_photo_path as photo, sa.sa_time as timestamp, sa.pos as position, sa.sa_id
            FROM students s
            JOIN student_attendances sa ON s.student_id = sa.student_id
            WHERE sa.as_id = ?
            ORDER BY sa.sa_time DESC
        `
    };

    try {
        const [[attendance_sessions]] = await db.promise().query(queries.attendance_sessions, [as_id]);
        const students = await db.promise().query(queries.students, [as_id]).then(([rows]) => rows);
        const latestLogs = await db.promise().query(queries.latest_logs, [as_id]).then(([rows]) => rows);

        if (!attendance_sessions) return res.status(404).send('Session not found');

        attendance_sessions.as_start_time = attendance_sessions.as_start_time
        ? format(new Date(attendance_sessions.as_start_time), 'yyyy-MM-dd HH:mm:ss')
        : null;

        attendance_sessions.as_end_time = attendance_sessions.as_end_time
        ? format(new Date(attendance_sessions.as_end_time), 'yyyy-MM-dd HH:mm:ss')
        : null;

        attendance_sessions.created_at = attendance_sessions.created_at
        ? format(new Date(attendance_sessions.created_at), 'yyyy-MM-dd HH:mm:ss')
        : null;

        attendance_sessions.updated_at = attendance_sessions.updated_at
        ? format(new Date(attendance_sessions.updated_at), 'yyyy-MM-dd HH:mm:ss')
        : null;

        students.forEach(s => {
            s.sa_time = format(new Date(s.sa_time), 'HH:mm');
        });

        latestLogs.forEach(log => {
            log.timestamp = format(new Date(log.timestamp), 'HH:mm');
        });
        
        // Check if student photo exists or is valid, otherwise set to default
        latestLogs.forEach(s => {
            const photoPath = path.join(__dirname, '..', 'public', 'img', 'attendance_pic', s.photo || '');
            if (!fs.existsSync(photoPath) || !fs.statSync(photoPath).isFile()) {
                s.photo = 'photo_default.jpg';
            }
        });

        res.render('session_monitor', {
            layout: 'layouts/main-layout',
            title: "Pantau",
            loggedin: req.session.loggedin || false,
            session: attendance_sessions,
            students,
            latestLogs,
            manual_success: req.query.manual_success === '1'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.'); 
    }
};

// API polling log kehadiran siswa & absensi terbaru (realtime)
exports.sessionLogsApi = async (req, res) => {
    const as_id = req.params.as_id;
    const latest_logs_query = `
        SELECT s.student_name as name, s.nis, sa.sa_photo_path as photo, sa.sa_time as timestamp, sa.pos as position, sa.sa_id
        FROM students s
        JOIN student_attendances sa ON s.student_id = sa.student_id
        WHERE sa.as_id = ?
        ORDER BY sa.sa_time DESC
    `;
    try {
        const latestLogs = await db.promise().query(latest_logs_query, [as_id]).then(([rows]) => rows);
        latestLogs.forEach(log => {
            log.timestamp = format(new Date(log.timestamp), 'HH:mm');
            // Check photo existence
            const photoPath = path.join(__dirname, '..', 'public', 'img', 'attendance_pic', log.photo || '');
            if (!fs.existsSync(photoPath) || !fs.statSync(photoPath).isFile()) {
                log.photo = 'photo_default.jpg';
            }
        });
        res.json({ latestLogs });
    } catch (err) {
        res.json({ latestLogs: [] });
    }
};

exports.data = async (req, res) => {
    const queries = {
        parents: 'SELECT * FROM parents',
        students: 'SELECT * FROM students',
        teachers: 'SELECT * FROM teachers',
        sessions: 'SELECT * FROM attendance_sessions',
        users: 'SELECT * FROM users'
    };

    try {
        // Jalankan semua query secara paralel
        const [parents, students, teachers, users] = await Promise.all([
            db.promise().query(queries.parents).then(([rows]) => rows),
            db.promise().query(queries.students).then(([rows]) => rows),
            db.promise().query(queries.teachers).then(([rows]) => rows),
            db.promise().query(queries.users).then(([rows]) => rows)
        ]);

        // Format created_at field
        (users || []).forEach(user => {
            user.created_at = format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (teachers || []).forEach(teacher => {
            teacher.created_at = format(new Date(teacher.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (parents || []).forEach(parent => {
            parent.created_at = format(new Date(parent.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (students || []).forEach(student => {
            student.created_at = format(new Date(student.created_at), 'yyyy-MM-dd HH:mm:ss');
        });

        // Format updated_at field
        (users || []).forEach(user => {
            user.updated_at = format(new Date(user.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (teachers || []).forEach(teacher => {
            teacher.updated_at = format(new Date(teacher.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (parents || []).forEach(parent => {
            parent.updated_at = format(new Date(parent.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        (students || []).forEach(student => {
            student.updated_at = format(new Date(student.updated_at), 'yyyy-MM-dd HH:mm:ss');
            student.dob = format(new Date(student.dob), 'yyyy-MM-dd');
        });

        // Simpan alert ke variabel lokal, lalu hapus dari session SEBELUM render
        const alert = req.session.alert || null;
        delete req.session.alert;

        // Render halaman dengan data yang diambil
        res.render('data', {
            layout: 'layouts/main-layout',
            title: "Data",
            loggedin: req.session.loggedin || false,
            parents: parents || [],
            students: students || [],
            teachers: teachers || [],
            users: users || [],
            alert // hanya tampil sekali
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};

exports.addSession = async (req, res) => {
    try {
        const { as_name, as_type, as_start_time, as_end_time, number_of_student } = req.body;
        if (!as_name || !as_type || !as_start_time || !as_end_time || !number_of_student) {
            return res.status(400).send('Semua field wajib diisi.');
        }
        await db.promise().query(
            'INSERT INTO attendance_sessions (as_name, as_type, as_start_time, as_end_time, number_of_student) VALUES (?, ?, ?, ?, ?)',
            [as_name, as_type, as_start_time, as_end_time, Number(number_of_student)]
        );
        res.redirect('/session');
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal menambah sesi.');
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const as_id = req.params.as_id;
        await db.promise().query('DELETE FROM attendance_sessions WHERE as_id = ?', [as_id]);
        res.redirect('/session');
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal menghapus sesi.');
    }
};

exports.addUser = async (req, res) => {
    try {
        const { username, password, email, role, wa_num } = req.body;
        if (!username || !password || !role || !wa_num) {
            req.session.alert = { type: 'danger', message: 'Username, password, role, dan nomor WA wajib diisi.' };
            return res.redirect('/data');
        }
        // Validasi role agar sesuai enum di database
        const allowedRoles = ['admin', 'teacher', 'parent', 'student', 'scanner'];
        if (!allowedRoles.includes(role)) {
            req.session.alert = { type: 'danger', message: 'Role tidak valid.' };
            return res.redirect('/data');
        }
        // Cek username/wa_num unik (email boleh kosong dan tidak dicek unik jika kosong)
        let checkQuery = 'SELECT * FROM users WHERE username = ? OR wa_num = ?';
        let checkParams = [username, wa_num];
        let emailValue = email && email.trim() !== '' ? email : 'N/A';
        if (email && email.trim() !== '') {
            checkQuery += ' OR email = ?';
            checkParams.push(email);
        }
        const [exist] = await db.promise().query(checkQuery, checkParams);
        if (exist.length > 0) {
            req.session.alert = { type: 'danger', message: 'Username, email, atau nomor WA sudah terdaftar.' };
            return res.redirect('/data');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO users (username, password, email, role, wa_num) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, emailValue, role, wa_num]
        );
        req.session.alert = { type: 'success', message: 'User berhasil ditambahkan.' };
        res.redirect('/data');
    } catch (err) {
        console.error('Gagal menambah user:', err);
        req.session.alert = { type: 'danger', message: 'Gagal menambah user.' };
        res.redirect('/data');
    }
};

// Handler tambah guru
exports.addTeacher = async (req, res) => {
    try {
        const { teacher_name, nip, username } = req.body;
        let photo_path = 'default/default.jpg';
        if (req.file) {
            photo_path = req.file.filename;
        }

        let user_id = null;
        if (username && username.trim() !== '') {
            // Cek username di tabel users
            const [users] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Cek apakah user_id sudah dipakai di teachers
            const [teachers] = await db.promise().query('SELECT teacher_id FROM teachers WHERE user_id = ?', [user_id]);
            if (teachers.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username sudah dipakai guru lain.' };
                return res.redirect('/data');
            }
        }

        // Simpan data guru
        await db.promise().query(
            'INSERT INTO teachers (teacher_name, nip, photo_path, user_id) VALUES (?, ?, ?, ?)',
            [teacher_name, nip, photo_path, user_id]
        );
        req.session.alert = { type: 'success', message: 'Data guru berhasil ditambahkan.' };
        res.redirect('/data');
    } catch (err) {
        console.error(err);
        req.session.alert = { type: 'danger', message: 'Gagal menambah guru.' };
        res.redirect('/data');
    }
};

// API untuk autocomplete username guru
exports.autocompleteTeacherUsernames = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Cari username teacher yang belum dipakai di teachers
        const [rows] = await db.promise().query(
            `SELECT username FROM users 
             WHERE role = 'teacher' 
             AND user_id NOT IN (SELECT user_id FROM teachers WHERE user_id IS NOT NULL)
             AND username LIKE ? 
             ORDER BY username ASC
             LIMIT 3`,
            [`%${q}%`]
        );
        res.json(rows.map(r => r.username));
    } catch (err) {
        res.json([]);
    }
};

// API untuk autocomplete username orang tua
exports.autocompleteParentUsernames = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Cari username parent yang belum dipakai di parents
        const [rows] = await db.promise().query(
            `SELECT username FROM users 
             WHERE role = 'parent' 
             AND user_id NOT IN (SELECT user_id FROM parents WHERE user_id IS NOT NULL)
             AND username LIKE ? 
             ORDER BY username ASC
             LIMIT 3`,
            [`%${q}%`]
        );
        res.json(rows.map(r => r.username));
    } catch (err) {
        res.json([]);
    }
};

// Handler tambah orang tua
exports.addParent = async (req, res) => {
    try {
        const { parent_name, username } = req.body;
        let user_id = null;
        if (username && username.trim() !== '') {
            // Cek username di tabel users
            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE username = ? AND role = 'parent'", [username]
            );
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Cek apakah user_id sudah dipakai di parents
            const [parents] = await db.promise().query(
                'SELECT parent_id FROM parents WHERE user_id = ?', [user_id]
            );
            if (parents.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username sudah dipakai orang tua lain.' };
                return res.redirect('/data');
            }
        }
        await db.promise().query(
            'INSERT INTO parents (parent_name, user_id) VALUES (?, ?)',
            [parent_name, user_id]
        );
        req.session.alert = { type: 'success', message: 'Data orang tua berhasil ditambahkan.' };
        res.redirect('/data');
    } catch (err) {
        console.error(err);
        req.session.alert = { type: 'danger', message: 'Gagal menambah orang tua.' };
        res.redirect('/data');
    }
};

// API untuk autocomplete username siswa
exports.autocompleteStudentUsernames = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Cari username student yang belum dipakai di students
        const [rows] = await db.promise().query(
            `SELECT username FROM users 
             WHERE role = 'student' 
             AND user_id NOT IN (SELECT user_id FROM students WHERE user_id IS NOT NULL)
             AND username LIKE ? 
             ORDER BY username ASC
             LIMIT 3`,
            [`%${q}%`]
        );
        res.json(rows.map(r => r.username));
    } catch (err) {
        res.json([]);
    }
};

// API untuk autocomplete parent siswa (Nama Orang Tua + username)
exports.autocompleteParentSiswa = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Cari parent yang punya user_id dan belum dipakai di students.parent_id
        const [rows] = await db.promise().query(
            `SELECT p.parent_id, p.parent_name, u.username
             FROM parents p
             JOIN users u ON p.user_id = u.user_id
             WHERE u.role = 'parent'
             AND p.parent_id NOT IN (SELECT parent_id FROM students WHERE parent_id IS NOT NULL)
             AND (p.parent_name LIKE ? OR u.username LIKE ?)
             ORDER BY p.parent_name ASC
             LIMIT 3`,
            [`%${q}%`, `%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        res.json([]);
    }
};

// API untuk autocomplete parent siswa (berdasarkan nama orang tua, tampilkan "Nama Ortu (username)" jika ada username)
exports.autocompleteParentSiswa = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Cari parent yang belum dipakai di students.parent_id, pencarian berdasarkan parent_name
        const [rows] = await db.promise().query(
            `SELECT p.parent_id, p.parent_name, u.username
             FROM parents p
             LEFT JOIN users u ON p.user_id = u.user_id
             WHERE p.parent_id NOT IN (SELECT parent_id FROM students WHERE parent_id IS NOT NULL)
             AND p.parent_name LIKE ?
             ORDER BY p.parent_name ASC
             LIMIT 3`,
            [`%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        res.json([]);
    }
};

// Handler tambah siswa
exports.addStudent = async (req, res) => {
    try {
        const {
            student_name, nis, nisn, dob, pob, address, rfid, username, parent_id
        } = req.body;
        let photo_path = 'default/default.jpg';
        if (req.file) {
            photo_path = req.file.filename;
        }

        // Set default values for optional fields
        const nisValue = nis && nis.trim() !== '' ? nis : 'N/A';
        const nisnValue = nisn && nisn.trim() !== '' ? nisn : 'N/A';
        const dobValue = dob && dob.trim() !== '' ? dob : format(new Date(), 'yyyy-MM-dd');
        const pobValue = pob && pob.trim() !== '' ? pob : 'N/A';
        const addressValue = address && address.trim() !== '' ? address : 'N/A';

        // Cari user_id jika username diisi
        let user_id = null;
        if (username && username.trim() !== '') {
            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE username = ? AND role = 'student'", [username]
            );
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username siswa tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Pastikan user_id belum dipakai di students
            const [students] = await db.promise().query(
                'SELECT student_id FROM students WHERE user_id = ?', [user_id]
            );
            if (students.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username siswa sudah dipakai siswa lain.' };
                return res.redirect('/data');
            }
        }

        // Ambil parent_id dari input (bisa berupa "Nama Ortu (username)" atau hanya nama)
        let parentIdValue = null;
        if (parent_id && parent_id.trim() !== '') {
            let parentName = parent_id;
            let usernameOrtu = null;
            const match = parent_id.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                parentName = match[1].trim();
                usernameOrtu = match[2].trim();
            }
            let query = "SELECT parent_id FROM parents";
            let params = [];
            if (usernameOrtu) {
                query += " p.LEFT JOIN users u ON p.user_id = u.user_id WHERE p.parent_name = ? AND u.username = ?";
                params = [parentName, usernameOrtu];
            } else {
                query += " WHERE parent_name = ?";
                params = [parentName];
            }
            const [parents] = await db.promise().query(query, params);
            if (parents.length > 0) {
                parentIdValue = parents[0].parent_id;
            }
        }

        await db.promise().query(
            `INSERT INTO students 
            (student_name, nis, nisn, dob, pob, photo_path, address, rfid, user_id, parent_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_name, nisValue, nisnValue, dobValue, pobValue, photo_path, addressValue, rfid || null, user_id, parentIdValue
            ]
        );
        req.session.alert = { type: 'success', message: 'Data siswa berhasil ditambahkan.' };
        res.redirect('/data');
    } catch (err) {
        console.error(err);
        req.session.alert = { type: 'danger', message: 'Gagal menambah siswa.' };
        res.redirect('/data');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await db.promise().query('DELETE FROM users WHERE user_id = ?', [id]);
        req.session.alert = { type: 'success', message: 'User berhasil dihapus.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal menghapus user.' };
        res.redirect('/data');
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const id = req.params.id;
        // Ambil photo_path sebelum delete
        const [rows] = await db.promise().query('SELECT photo_path FROM teachers WHERE teacher_id = ?', [id]);
        if (rows.length > 0) {
            const photoPath = rows[0].photo_path;
            if (photoPath && photoPath !== 'default/default.jpg') {
                const fullPath = path.join(__dirname, '..', 'public', 'img', 'profile', photoPath);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) {}
                }
            }
        }
        await db.promise().query('DELETE FROM teachers WHERE teacher_id = ?', [id]);
        req.session.alert = { type: 'success', message: 'Guru berhasil dihapus.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal menghapus guru.' };
        res.redirect('/data');
    }
};

exports.deleteParent = async (req, res) => {
    try {
        const id = req.params.id;
        await db.promise().query('DELETE FROM parents WHERE parent_id = ?', [id]);
        req.session.alert = { type: 'success', message: 'Orang tua berhasil dihapus.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal menghapus orang tua.' };
        res.redirect('/data');
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;
        // Ambil photo_path sebelum delete
        const [rows] = await db.promise().query('SELECT photo_path FROM students WHERE student_id = ?', [id]);
        if (rows.length > 0) {
            const photoPath = rows[0].photo_path;
            if (photoPath && photoPath !== 'default/default.jpg') {
                const fullPath = path.join(__dirname, '..', 'public', 'img', 'profile', photoPath);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) {}
                }
            }
        }
        await db.promise().query('DELETE FROM students WHERE student_id = ?', [id]);
        req.session.alert = { type: 'success', message: 'Siswa berhasil dihapus.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal menghapus siswa.' };
        res.redirect('/data');
    }
};

exports.editUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, email, role, wa_num, password } = req.body;
        if (!username || !role || !wa_num) {
            req.session.alert = { type: 'danger', message: 'Username, role, dan nomor WA wajib diisi.' };
            return res.redirect('/data');
        }
        // Cek username/wa_num/email unik (kecuali milik user ini sendiri)
        let checkQuery = 'SELECT * FROM users WHERE (username = ? OR wa_num = ?';
        let checkParams = [username, wa_num];
        if (email && email.trim() !== '') {
            checkQuery += ' OR email = ?';
            checkParams.push(email);
        }
        checkQuery += ') AND user_id != ?';
        checkParams.push(id);

        const [exist] = await db.promise().query(checkQuery, checkParams);
        if (exist.length > 0) {
            req.session.alert = { type: 'danger', message: 'Username, email, atau nomor WA sudah terdaftar.' };
            return res.redirect('/data');
        }

        let emailValue = email && email.trim() !== '' ? email : 'N/A';
        let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?, wa_num = ?';
        let updateParams = [username, emailValue, role, wa_num];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password = ?';
            updateParams.push(hashedPassword);
        }
        updateQuery += ' WHERE user_id = ?';
        updateParams.push(id);

        await db.promise().query(updateQuery, updateParams);
        req.session.alert = { type: 'success', message: 'User berhasil diupdate.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal update user.' };
        res.redirect('/data');
    }
};

exports.editTeacher = async (req, res) => {
    try {
        const id = req.params.id;
        const { teacher_name, nip, username } = req.body;
        let photo_path = null;

        // Ambil data lama
        const [oldRows] = await db.promise().query('SELECT photo_path, user_id FROM teachers WHERE teacher_id = ?', [id]);
        if (oldRows.length === 0) {
            req.session.alert = { type: 'danger', message: 'Guru tidak ditemukan.' };
            return res.redirect('/data');
        }
        const oldPhoto = oldRows[0].photo_path;
        let user_id = oldRows[0].user_id;

        // Handle username (optional)
        if (username && username.trim() !== '') {
            const [users] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Cek apakah user_id sudah dipakai di teachers lain
            const [teachers] = await db.promise().query('SELECT teacher_id FROM teachers WHERE user_id = ? AND teacher_id != ?', [user_id, id]);
            if (teachers.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username sudah dipakai guru lain.' };
                return res.redirect('/data');
            }
        } else {
            user_id = null;
        }

        // Handle foto baru
        if (req.file) {
            photo_path = req.file.filename;
            // Hapus foto lama jika bukan default
            if (oldPhoto && oldPhoto !== 'default/default.jpg') {
                const fullPath = path.join(__dirname, '..', 'public', 'img', 'profile', oldPhoto);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) {}
                }
            }
        } else {
            photo_path = oldPhoto;
        }

        await db.promise().query(
            'UPDATE teachers SET teacher_name = ?, nip = ?, photo_path = ?, user_id = ? WHERE teacher_id = ?',
            [teacher_name, nip, photo_path, user_id, id]
        );
        req.session.alert = { type: 'success', message: 'Data guru berhasil diupdate.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal update guru.' };
        res.redirect('/data');
    }
};

exports.editParent = async (req, res) => {
    try {
        const id = req.params.id;
        const { parent_name, username } = req.body;

        // Ambil data lama
        const [oldRows] = await db.promise().query('SELECT user_id FROM parents WHERE parent_id = ?', [id]);
        if (oldRows.length === 0) {
            req.session.alert = { type: 'danger', message: 'Orang tua tidak ditemukan.' };
            return res.redirect('/data');
        }
        let user_id = oldRows[0].user_id;

        // Handle username (optional)
        if (username && username.trim() !== '') {
            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE username = ? AND role = 'parent'", [username]
            );
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Cek apakah user_id sudah dipakai di parents lain
            const [parents] = await db.promise().query(
                'SELECT parent_id FROM parents WHERE user_id = ? AND parent_id != ?', [user_id, id]
            );
            if (parents.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username sudah dipakai orang tua lain.' };
                return res.redirect('/data');
            }
        } else {
            user_id = null;
        }

        await db.promise().query(
            'UPDATE parents SET parent_name = ?, user_id = ? WHERE parent_id = ?',
            [parent_name, user_id, id]
        );
        req.session.alert = { type: 'success', message: 'Data orang tua berhasil diupdate.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal update orang tua.' };
        res.redirect('/data');
    }
};

exports.editStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            student_name, nis, nisn, dob, pob, address, rfid, username, parent_id
        } = req.body;
        let photo_path = null;

        // Set default values for optional fields
        const nisValue = nis && nis.trim() !== '' ? nis : 'N/A';
        const nisnValue = nisn && nisn.trim() !== '' ? nisn : 'N/A';
        const dobValue = dob && dob.trim() !== '' ? dob : format(new Date(), 'yyyy-MM-dd');
        const pobValue = pob && pob.trim() !== '' ? pob : 'N/A';
        const addressValue = address && address.trim() !== '' ? address : 'N/A';

        // Ambil data lama
        const [oldRows] = await db.promise().query('SELECT photo_path, user_id, parent_id FROM students WHERE student_id = ?', [id]);
        if (oldRows.length === 0) {
            req.session.alert = { type: 'danger', message: 'Siswa tidak ditemukan.' };
            return res.redirect('/data');
        }
        const oldPhoto = oldRows[0].photo_path;
        let user_id = oldRows[0].user_id;
        let parentIdValue = oldRows[0].parent_id;

        // Handle username (optional)
        if (username && username.trim() !== '') {
            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE username = ? AND role = 'student'", [username]
            );
            if (users.length === 0) {
                req.session.alert = { type: 'danger', message: 'Username siswa tidak tersedia.' };
                return res.redirect('/data');
            }
            user_id = users[0].user_id;
            // Pastikan user_id belum dipakai di students lain
            const [students] = await db.promise().query(
                'SELECT student_id FROM students WHERE user_id = ? AND student_id != ?', [user_id, id]
            );
            if (students.length > 0) {
                req.session.alert = { type: 'danger', message: 'Username siswa sudah dipakai siswa lain.' };
                return res.redirect('/data');
            }
        } else {
            user_id = null;
        }

        // Handle parent_id dari input (bisa berupa "Nama Ortu (username)" atau hanya nama)
        if (parent_id && parent_id.trim() !== '') {
            let parentName = parent_id;
            let usernameOrtu = null;
            const match = parent_id.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                parentName = match[1].trim();
                usernameOrtu = match[2].trim();
            }
            let query = "SELECT parent_id FROM parents";
            let params = [];
            if (usernameOrtu) {
                query += " p LEFT JOIN users u ON p.user_id = u.user_id WHERE p.parent_name = ? AND u.username = ?";
                params = [parentName, usernameOrtu];
            } else {
                query += " WHERE parent_name = ?";
                params = [parentName];
            }
            const [parents] = await db.promise().query(query, params);
            if (parents.length > 0) {
                parentIdValue = parents[0].parent_id;
            } else {
                parentIdValue = null;
            }
        } else {
            parentIdValue = null;
        }

        // Handle foto baru
        if (req.file) {
            photo_path = req.file.filename;
            // Hapus foto lama jika bukan default
            if (oldPhoto && oldPhoto !== 'default/default.jpg') {
                const fullPath = path.join(__dirname, '..', 'public', 'img', 'profile', oldPhoto);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) {}
                }
            }
        } else {
            photo_path = oldPhoto;
        }

        await db.promise().query(
            `UPDATE students SET 
                student_name = ?, nis = ?, nisn = ?, dob = ?, pob = ?, photo_path = ?, address = ?, rfid = ?, user_id = ?, parent_id = ?
             WHERE student_id = ?`,
            [
                student_name, nisValue, nisnValue, dobValue, pobValue, photo_path, addressValue, rfid || null, user_id, parentIdValue, id
            ]
        );
        req.session.alert = { type: 'success', message: 'Data siswa berhasil diupdate.' };
        res.redirect('/data');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal update siswa.' };
        res.redirect('/data');
    }
};

exports.editSession = async (req, res) => {
    try {
        const id = req.params.id;
        const { as_name, as_type, as_start_time, as_end_time, number_of_student } = req.body;
        if (!as_name || !as_type || !as_start_time || !as_end_time || !number_of_student) {
            req.session.alert = { type: 'danger', message: 'Semua field wajib diisi.' };
            return res.redirect('/session');
        }
        await db.promise().query(
            'UPDATE attendance_sessions SET as_name = ?, as_type = ?, as_start_time = ?, as_end_time = ?, number_of_student = ? WHERE as_id = ?',
            [as_name, as_type, as_start_time, as_end_time, Number(number_of_student), id]
        );
        req.session.alert = { type: 'success', message: 'Sesi berhasil diupdate.' };
        res.redirect('/session');
    } catch (err) {
        req.session.alert = { type: 'danger', message: 'Gagal update sesi.' };
        res.redirect('/session');
    }
};

// API autocomplete nama siswa (max 3)
exports.autocompleteStudentName = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        const [rows] = await db.promise().query(
            `SELECT student_id, student_name, nis FROM students WHERE student_name LIKE ? ORDER BY student_name ASC LIMIT 3`,
            [`%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        res.json([]);
    }
};

// POST manual attendance
exports.manualAttendance = async (req, res) => {
    try {
        const as_id = req.params.as_id;
        const student_id = req.body.student_id_manual;
        if (!student_id) return res.status(400).send('Pilih siswa.');

        // Cek apakah sudah ada absensi untuk student_id dan as_id ini
        const [rows] = await db.promise().query(
            'SELECT COUNT(*) as total FROM student_attendances WHERE student_id = ? AND as_id = ?',
            [student_id, as_id]
        );
        if (rows[0].total > 0) {
            // Sudah absen, jangan insert lagi
            req.session.alert = { type: 'danger', message: 'Siswa sudah melakukan absensi pada sesi ini.' };
            return res.redirect(`/session/${as_id}/monitor`);
        }

        await db.promise().query(
            `INSERT INTO student_attendances (sa_photo_path, as_id, student_id, pos) VALUES (?, ?, ?, ?)`,
            ['default/default.jpg', as_id, student_id, 'Manual']
        );
        res.redirect(`/session/${as_id}/monitor?manual_success=1`);
    } catch (err) {
        res.status(500).send('Gagal input kehadiran manual.');
    }
};

// Handler hapus log kehadiran siswa
exports.deleteAttendance = async (req, res) => {
    try {
        const as_id = req.params.as_id;
        const sa_id = req.params.attendance_id;
        // Ambil nama file foto sebelum delete
        const [rows] = await db.promise().query('SELECT sa_photo_path FROM student_attendances WHERE sa_id = ?', [sa_id]);
        if (rows.length > 0) {
            const photoPath = rows[0].sa_photo_path;
            if (photoPath && photoPath !== 'default/default.jpg') {
                const fullPath = path.join(__dirname, '..', 'public', 'img', 'attendance_pic', photoPath);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) {}
                }
            }
        }
        // Hapus log kehadiran berdasarkan sa_id
        await db.promise().query('DELETE FROM student_attendances WHERE sa_id = ?', [sa_id]);
        res.redirect(`/session/${as_id}/monitor`);
    } catch (err) {
        res.status(500).send('Gagal menghapus log kehadiran.');
    }
};

// API: Ambil sesi berikutnya (untuk scan.ejs)
exports.nextSessionApi = async (req, res) => {
    try {
        const after = req.query.after ? Number(req.query.after) : null;
        let sessionRow = null;
        if (!after) {
            // Ambil sesi pertama
            const [rows] = await db.promise().query(
                "SELECT * FROM attendance_sessions WHERE as_end_time > NOW() ORDER BY as_id ASC LIMIT 1"
            );
            if (rows.length > 0) sessionRow = rows[0];
        } else {
            // Ambil sesi berikutnya
            const [rows] = await db.promise().query(
                "SELECT * FROM attendance_sessions WHERE as_end_time > NOW() AND as_id > ? ORDER BY as_id ASC LIMIT 1",
                [after]
            );
            if (rows.length > 0) {
                sessionRow = rows[0];
            } else {
                // Jika tidak ada, ulang dari awal
                const [firstRows] = await db.promise().query(
                    "SELECT * FROM attendance_sessions WHERE as_end_time > NOW() ORDER BY as_id ASC LIMIT 1"
                );
                if (firstRows.length > 0) sessionRow = firstRows[0];
            }
        }
        if (!sessionRow) return res.json({ session: null });

        // Hitung sisa waktu
        const now = new Date();
        const end = new Date(sessionRow.as_end_time);
        const diffMs = end - now;
        let sisa = '';
        if (diffMs <= 0) {
            sisa = 'Berakhir';
        } else {
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
            if (diffDays > 0) {
                sisa = `Sisa ${diffDays} hari ${diffHours} jam`;
            } else if (diffHours > 0) {
                sisa = `Sisa ${diffHours} jam ${diffMinutes} menit`;
            } else {
                sisa = `Sisa ${diffMinutes} menit`;
            }
        }
        res.json({
            session: {
                as_id: sessionRow.as_id,
                as_name: sessionRow.as_name
            },
            sisa
        });
    } catch (err) {
        res.json({ session: null });
    }
};

exports.studentProfile = async (req, res) => {
    const role = req.session.role;
    const userId = req.session.user_id || req.session.userId || (req.session.user && req.session.user.user_id);
    // fallback: cari userId dari username jika belum ada
    let user_id = userId;
    if (!user_id && req.session.name) {
        const [userRows] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [req.session.name]);
        if (userRows.length > 0) user_id = userRows[0].user_id;
    }

    if (role === 'student') {
        // Ambil data siswa berdasarkan user_id
        const [students] = await db.promise().query(
            'SELECT * FROM students WHERE user_id = ?', [user_id]
        );
        if (students.length === 0) {
            return res.render('student_profile', {
                layout: 'layouts/main-layout',
                title: 'Profil Siswa',
                siswa: null,
                siswaList: null,
                message: 'Tidak ada data siswa ditemukan.',
                role
            });
        }
        return res.render('student_profile', {
            layout: 'layouts/main-layout',
            title: 'Profil Siswa',
            siswa: students[0],
            siswaList: null,
            message: null,
            role
        });
    } else if (role === 'parent') {
        // Ambil parent_id dari user_id
        const [parents] = await db.promise().query(
            'SELECT parent_id FROM parents WHERE user_id = ?', [user_id]
        );
        if (parents.length === 0) {
            return res.render('student_profile', {
                layout: 'layouts/main-layout',
                title: 'Profil Siswa',
                siswa: null,
                siswaList: [],
                message: 'Tidak ada siswa terdaftar',
                role
            });
        }
        const parent_id = parents[0].parent_id;
        // Ambil semua siswa yang parent_id-nya sama
        const [students] = await db.promise().query(
            'SELECT * FROM students WHERE parent_id = ?', [parent_id]
        );
        if (students.length === 0) {
            return res.render('student_profile', {
                layout: 'layouts/main-layout',
                title: 'Profil Siswa',
                siswa: null,
                siswaList: [],
                message: 'Tidak ada siswa terdaftar',
                role
            });
        }
        return res.render('student_profile', {
            layout: 'layouts/main-layout',
            title: 'Profil Siswa',
            siswa: null,
            siswaList: students,
            message: null,
            role
        });
    } else {
        // Role lain
        return res.render('student_profile', {
            layout: 'layouts/main-layout',
            title: 'Profil Siswa',
            siswa: null,
            siswaList: null,
            message: 'Khusus untuk siswa dan orang tua',
            role
        });
    }
};