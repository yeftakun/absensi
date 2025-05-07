const db = require('../config/db');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');

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

exports.scan = (req, res) => {
    res.render('scan', {
        layout: 'layouts/main-layout',
        title: "Scan RFID",
        loggedin: req.session.loggedin || false
    });
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
            LIMIT 10
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
        const [parents, students, teachers, sessions, users] = await Promise.all([
            db.promise().query(queries.parents).then(([rows]) => rows),
            db.promise().query(queries.students).then(([rows]) => rows),
            db.promise().query(queries.teachers).then(([rows]) => rows),
            // db.promise().query(queries.sessions).then(([rows]) => rows),
            db.promise().query(queries.users).then(([rows]) => rows)
        ]);

        // Format created_at field
        users.forEach(user => {
            user.created_at = format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        teachers.forEach(teacher => {
            teacher.created_at = format(new Date(teacher.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        parents.forEach(parent => {
            parent.created_at = format(new Date(parent.created_at), 'yyyy-MM-dd HH:mm:ss');
        });
        students.forEach(student => {
            student.created_at = format(new Date(student.created_at), 'yyyy-MM-dd HH:mm:ss');
        });

        // Format updated_at field
        users.forEach(user => {
            user.updated_at = format(new Date(user.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        teachers.forEach(teacher => {
            teacher.updated_at = format(new Date(teacher.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        parents.forEach(parent => {
            parent.updated_at = format(new Date(parent.updated_at), 'yyyy-MM-dd HH:mm:ss');
        });
        students.forEach(student => {
            student.updated_at = format(new Date(student.updated_at), 'yyyy-MM-dd HH:mm:ss');
            student.dob = format(new Date(student.dob), 'yyyy-MM-dd');
        });

        // Render halaman dengan data yang diambil
        res.render('data', {
            layout: 'layouts/main-layout',
            title: "Data",
            loggedin: req.session.loggedin || false,
            parents,
            students,
            teachers,
            // sessions,
            users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};