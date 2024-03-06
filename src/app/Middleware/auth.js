

module.exports = (req, res, next) => {
    let user = req.headers['user']
    if (user) {
        req.user = JSON.parse(user)
    }
    return next();
}