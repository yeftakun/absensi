function homeAuth(req, res, next) {
  if (!req.session || !req.session.loggedin) {
    return res.redirect('/'); // redirect ke login
  }
  const role = req.session.role;
  if (role === 'admin') {
    return next();
  }
  return res.status(403).send('Akses ditolak');
}

function sessionAuth(req, res, next) {
  if (!req.session || !req.session.loggedin) {
    return res.redirect('/'); // redirect ke login
  }
  const role = req.session.role;
  if (role === 'admin' || role === 'teacher') {
    return next();
  }
  return res.status(403).render('Akses ditolak'); // akses ditolak
}

function dataAuth(req, res, next) {
  if (!req.session || !req.session.loggedin) {
    return res.redirect('/'); // redirect ke login
  }
  const role = req.session.role;
  if (role === 'admin') {
    return next();
  }
  return res.status(403).send('Akses ditolak');
}

module.exports = { homeAuth, sessionAuth, dataAuth };
