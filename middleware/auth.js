function requireStudentLogin(req, res, next) {
    if (!req.session || !req.session.student_id) {
        return res.redirect('/');
    }
    next();
}

function requireAdminLogin(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    next();
}

module.exports = {
    requireStudentLogin,
    requireAdminLogin
};