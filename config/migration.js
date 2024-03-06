// exports.NODE_ENV=development
const constants = require('./constants')
exports.development = {
	host: constants.DB_HOST,
	username: constants.DB_USERNAME,
	password: constants.DB_PASSWORD,
	database: constants.DB_NAME,
	port: constants.DB_PORT,
	"dialect": "mysql"
	// "development": {
	// }
	
}