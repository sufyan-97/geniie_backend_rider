var passport = require('passport');
var { APP_SECRET, REDIS_PREFIX } = require('../../../config/constants');
var redisClient = require('../../../config/redis');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
    
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = APP_SECRET;
opts.passReqToCallback = true
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';

// const User = require('../SqlModels/User')

passport.use(new JwtStrategy(opts, function (req, jwt_payload, done) {
    let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // console.log(token);
    redisClient.keys(`${REDIS_PREFIX}${token}`, async function (err, isAuthorized) {
        // console.log(err, isAuthorized);
        if (err) {
            return done(null, false);
        }
        if (isAuthorized && isAuthorized.length) {
            let id = jwt_payload.user.id
            let user = await User.findOne({ where: { id: id } });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } else {
            return done(null, false);
        }
    });

}));

module.exports = passport;