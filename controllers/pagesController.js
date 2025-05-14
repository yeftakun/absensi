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
  
exports.home = (req, res) => {
    res.render('home', {
      layout: 'layouts/main-layout',
      title: "Home",
      name: req.session.name,
      loggedin: req.session.loggedin || false
    });
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
            sessions
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
            SELECT s.student_name as name, s.nis, sa.sa_photo_path as photo, sa.sa_time as timestamp, sa.pos as position
            FROM students s
            JOIN student_attendances sa ON s.student_id = sa.student_id
            WHERE sa.as_id = ?
            ORDER BY sa.sa_time DESC
            LIMIT 10`
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
            latestLogs
          });          

    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.'); 
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
        const { as_name, as_type, as_start_time, as_end_time } = req.body;
        if (!as_name || !as_type || !as_start_time || !as_end_time) {
            return res.status(400).send('Semua field wajib diisi.');
        }
        await db.promise().query(
            'INSERT INTO attendance_sessions (as_name, as_type, as_start_time, as_end_time) VALUES (?, ?, ?, ?)',
            [as_name, as_type, as_start_time, as_end_time]
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
            // Coba ambil parent_id dari database berdasarkan nama (dan username jika ada)
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
            }
        }

        await db.promise().query(
            `INSERT INTO students 
            (student_name, nis, nisn, dob, pob, photo_path, address, rfid, user_id, parent_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_name, nis, nisn, dob, pob, photo_path, address || '', rfid || null, user_id, parentIdValue
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