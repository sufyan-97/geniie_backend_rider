var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var constants = require('../../config/constants');

var transporter = null

if (constants.SMTP_HOST && constants.SMTP_PORT) {
	transporter = nodemailer.createTransport(smtpTransport({
		host: constants.SMTP_HOST,
		port: constants.SMTP_PORT,
		auth: {
			user: constants.SMTP_USERNAME,
			pass: constants.SMTP_PASSWORD
		},
		// authMethod : 'PLAIN',


		// securing
		// secureConnection: false, // if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
		secure: false, // if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
		tls: true, // defines additional node.js TLSSocket options to be passed to the socket constructor, eg. {rejectUnauthorized: true}.
		tls: {
			// 	ciphers: 'SSLv3',
			rejectUnauthorized: false,
			// 	servername:''
		},
		// ignoreTLS: true, // if this is true and secure is false then TLS is not used even if the server supports STARTTLS extension
		// requireTLS: true, // if this is true and secure is false then Nodemailer tries to use STARTTLS even if the server does not advertise support for it. If the connection can not be encrypted then message is not sent

		logger: true,
		debug: true,

		connectionTimeout: 600000,
		greetingTimeout: 300000,

	}));
}

var transporter2 = null
if (constants.SMTP_HOST2 && constants.SMTP_PORT2) {
	transporter2 = nodemailer.createTransport(smtpTransport({
		host: constants.SMTP_HOST2,
		port: constants.SMTP_PORT2,
		auth: {
			user: constants.SMTP_USERNAME2,
			pass: constants.SMTP_PASSWORD2
		},
		// authMethod : 'PLAIN',


		// securing
		// secureConnection: false, // if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
		secure: false, // if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
		tls: true, // defines additional node.js TLSSocket options to be passed to the socket constructor, eg. {rejectUnauthorized: true}.
		tls: {
			// 	ciphers: 'SSLv3',
			rejectUnauthorized: false,
			// 	servername:''
		},
		// ignoreTLS: true, // if this is true and secure is false then TLS is not used even if the server supports STARTTLS extension
		// requireTLS: true, // if this is true and secure is false then Nodemailer tries to use STARTTLS even if the server does not advertise support for it. If the connection can not be encrypted then message is not sent

		logger: true,
		debug: true,

		connectionTimeout: 600000,
		greetingTimeout: 300000,

	}));
}

exports.sendEmail = function (subject, message, to, callback, attachment = null) {
	let cb = () => { }
	if (callback) {
		cb = callback;
	}

	subject = `${constants.SMTP_COMMON_SUBJECT} ${subject}`

	let mailOptions = {
		from: constants.SMTP_FROM_EMAIL,
		to: to,
		subject: subject,
		html: message,
		attachments: attachment ? [{ filename: attachment.fileName, path: attachment.file, contentType: 'application/pdf' }] : null
	};

	if (transporter) {
		console.log("****************************************************************************************")
		console.log("***********************************  Run First Mail server    **************************")

		console.log("hello smtp", smtpTransport);
		transporter.sendMail(mailOptions,
			(error, response) => {
				if (error) {
					console.log("****************************************************************************************")
					if (transporter2) {
						console.log("***********************  Run 2nd into first Mail server condition   ****************")

						mailOptions.from = constants.SMTP_FROM_EMAIL2;
						transporter2.sendMail(mailOptions, cb);
					} else {
						// response.response
						cb(error, response)
					}
				} else {
					console.log("good response of first....!")
					cb(error, response);
					// response.response
				}
			}
		);
	} else if (transporter2) {
		console.log("****************************************************************************************")
		console.log("***********************************  Run 2nd Mail server  ******************************")

		mailOptions.from = constants.SMTP_FROM_EMAIL2;
		transporter2.sendMail(mailOptions, cb)
	} else {
		console.log("****************************************************************************************")
		console.log("***********************************  Credentials not provided  *************************")
		cb(Error('Credentials not provided'))
	}
}

exports.sendEmailV2 = function (subject, message, to, attachment = null) {
	return new Promise((resolve, reject) => {

		subject = `${constants.SMTP_COMMON_SUBJECT} ${subject}`

		let mailOptions = {
			from: constants.SMTP_FROM_EMAIL,
			to: to,
			subject: subject,
			html: message,
			attachments: attachment ? [{ filename: attachment.fileName, path: attachment.file, contentType: 'application/pdf' }] : null
		};

		if (transporter) {
			console.log("****************************************************************************************")
			console.log("***********************************  Run First Mail server    **************************")

			// console.log("hello smtp", smtpTransport);
			transporter.sendMail(mailOptions,
				(error, response) => {
					if (error) {
						console.log("SMTP 1 Error: ", error);
						if (transporter2) {
							console.log("****************************************************************************************")
							console.log("***********************  Run 2nd into first Mail server condition   ****************")

							mailOptions.from = constants.SMTP_FROM_EMAIL2;
							transporter2.sendMail(mailOptions, function (err, resp) {
								if (err) {
									console.log("SMTP 2 Error: ", err);
									reject(err, resp)
								} else {
									console.log("ok response SMTP2...!")
									resolve(err, resp)
								}
							});
						} else {
							console.log('SMTP2 not provided')
							reject(error, response)
						}

					} else {
						console.log("ok response SMTP1...!")
						resolve(error, response);
					}
				}
			);
		} else if (transporter2) {
			console.log("****************************************************************************************")
			console.log("***********************************  Run 2nd Mail server  ******************************")

			mailOptions.from = constants.SMTP_FROM_EMAIL2;
			transporter2.sendMail(mailOptions, function (error, response) {
				if (error) {
					console.log("SMTP 2 Error: ", error);
					reject(error, response)
				} else {
					console.log("ok response SMTP2...!")
					resolve(error, response)
				}
			})
		} else {
			console.log("***********************************  Credentials not provided  *************************")
			reject('Credentials not provided')
		}
	})
}