const db = require('../config/db');

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

exports.data = (req, res) => {
    const queries = {
        parents: 'SELECT * FROM parents',
        students: 'SELECT * FROM students',
        teachers: 'SELECT * FROM teachers',
        sessions: 'SELECT * FROM attendance_sessions',
        users: 'SELECT * FROM users'
    };

    const results = {};

    db.query(queries.parents, (err, parents) => {
        if (err) throw err;
        results.parents = parents;

        db.query(queries.students, (err, students) => {
            if (err) throw err;
            results.students = students;

            db.query(queries.teachers, (err, teachers) => {
                if (err) throw err;
                results.teachers = teachers;

                db.query(queries.sessions, (err, sessions) => {
                    if (err) throw err;
                    results.sessions = sessions;

                    db.query(queries.users, (err, users) => {
                        if (err) throw err;
                        results.users = users;

                        res.render('data', {
                            layout: 'layouts/main-layout',
                            title: "Data",
                            loggedin: req.session.loggedin || false,
                            ...results
                        });
                    });
                });
            });
        });
    });
};