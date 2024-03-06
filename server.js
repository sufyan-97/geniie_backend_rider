// Import Express Modules
require("express-group-routes");
var express = require("express");
var app = express();

// Import Libraries
const momentTz = require("moment-timezone");
const moment = require('moment');
const http = require("http");
// const socket = require('socket.io');
const path = require('path');
const fs = require('fs');

var compression = require('compression')
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const expressSwagger = require('express-swagger-generator')(app);

// const redisAdapter = require('@socket.io/redis-adapter');
// const session = require('express-session')

// Import Config
const swaggerOptions = require('./config/swaggerOptions');

// Import Custom Libraries


// Import Middleware
const basicAuth = require('./src/app/Middleware/basicAuth')

// Import constants
const constants = require('./config/constants');

// ======================================== MySQL Configurations================== //
// require("./config/database");

// ======================================== MongoDB Configurations================== //
const mongoConnect = require('./config/mongoDB')
const mongoConnection = mongoConnect();

const models = path.join(__dirname, './src/app/MongoModels');
fs.readdirSync(models)
	.filter(file => ~file.indexOf('.js'))
	.forEach(file => require(path.join(models, file)));


// ======================================== App Configurations================== //

app.disable("etag");
app.disable('x-powered-by');

// => Set timezone for moment Library
momentTz.tz.setDefault(constants.TIME_ZONE);
let d = moment().format('YYYY-MM-DD H:m:s');
console.log("Moment Date Time:", d)

// ======================================== Middleware ================== //
// url logging
app.use(logger("dev"));

// compression
app.use(compression())


// file uploading max length
app.use(express.json({ limit: "1000gb" }));
app.use(express.urlencoded({ limit: "1000gb", extended: false, parameterLimit: 100000000 }));

// cookie Parser
app.use(cookieParser());

// Allow headers
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", req.header('origin'));
	res.header('Access-Control-Allow-Credentials', true);

	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, id, featured");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
	res.header("Accept-Encoding", "gzip,sdch");

	if (req.method === "OPTIONS") {
		return res.status(200).json({});
	}

	next();
});

// ============================================ Passport Configurations ========================= //
var jwtPassport = require('./src/app/Providers/jwtStrategy');
const { sendNotification } = require("./src/helpers/general_helper");
app.use(jwtPassport.initialize());

// ============================================ Language Configurations ========================= //
// app.use(i18n.init)
// app.configure(function () {
// })
// app.use(i18n.init())
// ============================================ Route Configurations ========================= //
app.use('/api-docs', basicAuth, function (req, res, next) {
	next();
})

expressSwagger(swaggerOptions.options);

app.get("/", async function (req, res) {
	try {
		let isNotificationSent = await sendNotification({
			userId: 45,
			title: "Title",
			body: "Body",
			data: { test: "test" }
		})
		res.send({ isNotificationSent })
	} catch (error) {
		console.log(error);
		res.send(':DAsdada')
	}
	// res.send("Express");
});
require("./src/routes/index.js")(app);
require('./src/routes/rpc');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.status(404).send({ message: 'Not Found' })
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.log(err);

	res.status(err.status || 500);
	res.send(err);
});

// ============================================Server Configurations ========================= //
var port = normalizePort(constants.APP_PORT);
app.set("port", port);

// var server = http.createServer(app.use((req, res) => {
// 	i18n.init(req, res)
// }));
var server = http.createServer(app);

// ============================================Socket Configurations ========================= //
// const socketRoutes = require('../routes/sockets');

// // Socket for device
// let deviceIo = socket({
// 	path: constants.DEVICE_SOCKET_PATH
// });
// // deviceIo.adapter(RedisAdapter({
// // 	host: constants.REDIS_HOST,
// // 	port: constants.REDIS_PORT
// // }))
// deviceIo.adapter(redisAdapter({
// 	pubClient: redisClient,
// 	subClient: redisClient.duplicate()
// }))
// deviceIo.attach(server, {
// 	pingInterval: 55000,
// 	pingTimeout: 10000
// });
// socketRoutes.deviceSocket(deviceIo);

// // Socket for panel
// let webIo = socket({
// 	path: constants.WEB_SOCKET_PATH
// });
// webIo.adapter(redisAdapter({
// 	pubClient: redisClient,
// 	subClient: redisClient.duplicate()
// }))
// webIo.attach(server);
// socketRoutes.webSocket(webIo);


// ============================================ Cron Jobs ========================= //
require("./src/crons/index");
// require("../crons/cron.js");

// ============================================ Events ========================= //
// var events = require('../crons/db_events');
// events.deviceQueue()
// events.deviceQueue()
// 	.then(() => console.log('Waiting for database events...'))
// 	.catch(console.error);


// var routes = [];
// app._router.stack.forEach(function (middleware) {
// 	if (middleware.route) { // routes registered directly on the app
// 		let methods = ''
// 		for (key in middleware.route.methods) {
// 			if (middleware.route.methods[key] === true) {
// 				methods += key + ','
// 			}
// 		}
// 		routes.push([
// 			middleware.route.path,
// 			methods
// 		]);
// 	} else if (middleware.name === 'router') { // router middleware

// 		middleware.handle.stack.forEach(function (handler) {
// 			route = handler.route;
// 			if (route) {
// 				let methods = ''
// 				for (key in route.methods) {
// 					if (route.methods[key] === true) {
// 						methods += key + ','
// 					}
// 				}
// 				routes.push([
// 					route.path,
// 					methods
// 				]);
// 			}
// 		});
// 	}
// });

// console.log(routes.length)

mongoConnection
	.on('error', mongoError)
	.on('disconnected', mongoConnect)
	.once('open', startServer);

function mongoError(error) {
	console.error(error)
	process.exit(1)
}

function startServer() {
	server.listen(port);

	server.on("error", function (error) {
		if (error.syscall !== "listen") {
			throw error;
		}

		var bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case "EACCES":
				console.error(bind + " requires elevated privileges");
				process.exit(1);
			case "EADDRINUSE":
				console.error(bind + " is already in use");
				process.exit(1);
			default:
				throw error;
		}
	});

	server.on("listening", function () {
		var addr = server.address();
		var bind = typeof addr === "string" ? `pipe: ${addr}` : `port: ${addr.port}`;
		console.log(`Listening on ${bind}`);
	});
}

/**
 * Normalizing Port with correct Number.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
