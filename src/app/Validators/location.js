const { body, param, query } = require('express-validator');

exports.post = [
    body('riderId')
        .notEmpty()
        .isInt(),

    body('longitude')
        .notEmpty()
        .isDecimal(),

    body('latitude')
        .notEmpty()
        .isDecimal(),
];

var params = [
    param('id')
        .notEmpty()
        .isInt(),
];

exports.getOne = params;

exports.delete = params;
