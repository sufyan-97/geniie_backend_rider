const { validationResult, matchedData } = require('express-validator');


// send response of error messages
exports.responseValidationResults = async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // console.log({ status: false, msg: 'Check detail of invalid data', errors: errors.array() })
        return res.status(422).json({ message: 'Invalid data', errors: errors.mapped() })
    } else {

        const allData = matchedData(req, { includeOptionals: true });
        req.body.match = allData;
        next();
    }
}