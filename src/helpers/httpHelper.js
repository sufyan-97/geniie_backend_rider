const translation = require("../lib/translation");

exports.respondWithSuccess = (req, res, message, data, statusCode = 200, dataObjName = 'data') => {
	let lngCode = req.headers['language'] ? req.headers['language'] : 'en'

	const response = {
		status: true,
		statusCode: statusCode,
		message: (message) ? translation(message, message, lngCode) : 'Success',
		[dataObjName]: data || null,
	};

	return res.status(statusCode).send(response);
}

exports.respondWithError = (req, res, message, error, statusCode=500) => {
	let lngCode = req.headers['language'] ? req.headers['language'] : 'en'
	if (statusCode === 500) {
		message = 'internal_server_error'
	}
	const response = {
		status: false,
		statusCode: statusCode,
		message: (message) ? translation(message, message, lngCode) : 'Error',
		error: error || null,
	};

	return res.status(statusCode).send(response);
}