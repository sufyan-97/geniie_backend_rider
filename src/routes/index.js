// routes
var multipart = require('connect-multiparty');

var orderRoutes = require("./order");
// var locationRoutes = require("./location");
var riderRoutes = require("./rider");

// Middlewares
const authMiddleware = require('../app/Middleware/auth');

module.exports = function (app) {

	app.use('/order', authMiddleware, orderRoutes);
	// app.use('/location', authMiddleware, multipart(), locationRoutes);
	app.use('/', authMiddleware, riderRoutes);
}