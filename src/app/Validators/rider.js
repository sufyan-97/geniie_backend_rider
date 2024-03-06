const { body, param, query } = require('express-validator');

exports.availability = [
    body('status')
        .notEmpty()
        .isBoolean(),

    body('longitude')
        .notEmpty()
        .isDecimal().optional(),

    body('latitude')
        .notEmpty()
        .isDecimal().optional(),
];