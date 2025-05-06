const db = require('../config/db');
const { format } = require('date-fns');

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

exports.session = (req, res) => {
    res.render('session', {
        layout: 'layouts/main-layout',
        title: "Pantau",
        loggedin: req.session.loggedin || false
    });
};

exports.sessionMonitor = (req, res) => {
    res.render('session_monitor', {
        layout: 'layouts/main-layout',
        title: "Pantau",
        loggedin: req.session.loggedin || false
    });
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
            db.promise().query(queries.sessions).then(([rows]) => rows),
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
            sessions,
            users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};