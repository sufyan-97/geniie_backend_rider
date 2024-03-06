const { check, body, param, query } = require('express-validator');

exports.signup = [
    body('username')
        .notEmpty()
        .matches(`^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$`),

    body('email')
        .isEmail(),

    body('password')
        .notEmpty()
        .isString()
];

exports.verify = [
    query('token')
        .notEmpty().isString()
];

exports.forgotPassword = [
    body('email')
        .isEmail()
];

exports.resetPassword = [
    query('token')
        .notEmpty()
        .isString(),

    body('password')
        .notEmpty()
        .isString()
];

exports.login = [
    body('username')
        .notEmpty()
        .isString()
        .matches(`^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$`),

    body('password')
        .notEmpty()
        .isString()
];

exports.refreshToken = [
    query('accessToken').notEmpty(),
    query('refreshToken').notEmpty()
];