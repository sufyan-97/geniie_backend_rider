
try {
	// =============== DotEnv =====================//

	let yamlConfigLib = require('node-yaml-config');

	var env = yamlConfigLib.load(__dirname + `/../config.yaml`);
	// console.log(env);


	// ================ Env List =================== //
	// App Info
	const HOST_NAME = env?.app?.hostName ? env?.app?.hostName : 'localhost';
	const HOST = env?.app?.hostURL ? env?.app?.hostURL : 'http://localhost:3000';

	const APP_ENV = env?.app?.env ? env?.app?.env : 'local'
	const APP_TITLE = env?.app?.title ? env?.app?.title : 'ASAP';
	const APP_PORT = env?.app?.port ? env?.app?.port : 3004;
	const API_VERSION = env?.app?.version ? env?.app?.version : 4.1;

	const TIME_ZONE = env?.app?.timezone ? env?.app?.timezone : 'Europe/London'; // "Asia/Karachi";
	const TIME_ZONE_OFFSET = env?.app?.timezoneOffset ? env?.app?.timezoneOffset : '+0:00';

	const IP_INFO_CHECKER = env?.app?.ipInfoChecker ? env?.app?.ipInfoChecker : 'http://ipinfo.io/';
	const DEFAULT_COUNTRY = env?.app?.defaultCountry ? env?.app?.defaultCountry : 'PK';

	// #GRPC
	const RPC_HOST = env?.app?.rpcHost ? env?.app?.rpcHost : 'localhost';
	const RPC_PORT = env?.app?.rpcPort ? env?.app?.rpcPort : 3005

	const FRONTEND_URL = null;

	// App Config & Secrets

	// set default utc-1 timezone for testing

	const APP_SECRET = env?.secret?.key ? env?.secret?.key : '';
	const EXPIRE_IN = env?.secret?.expiresIn ? env?.secret?.expiresIn : '';

	// App Credentials
	const APP_USERNAME = env?.secret?.username ? env?.secret?.username : '';
	const APP_PASSWORD = env?.secret?.password ? env?.secret?.password : '';

	const BASIC_AUTH_USER = env?.basicAuth?.username ? env?.basicAuth?.username : ''
	const BASIC_AUTH_PASSWORD = env?.basicAuth?.password ? env?.basicAuth?.password : ''

	// // MySQL Database
	// const DB_HOST = env?.mysql?.host ? env?.mysql?.host : '';
	// const DB_NAME = env?.mysql?.name ? env?.mysql?.name : '';
	// const DB_USERNAME = env?.mysql?.username ? env?.mysql?.username : '';
	// const DB_PASSWORD = env?.mysql?.password ? env?.mysql?.password : '';
	// const DB_PORT = env?.mysql?.port ? env?.mysql?.port : '';
	// const DB_SSL = env?.mysql?.ssl ? env?.mysql?.ssl : '';

	// MongoDB
	const MONGO_HOST = env?.mongo?.host ? env?.mongo?.host : '';
	const MONGO_NAME = env?.mongo?.name ? env?.mongo?.name : '';
	const MONGO_USERNAME = env?.mongo?.username ? env?.mongo?.username : '';
	const MONGO_PASSWORD = env?.mongo?.password ? env?.mongo?.password : '';
	const MONGO_PORT = env?.mongo?.port ? env?.mongo?.port : '';
	const MONGO_AUTH_SOURCE = env?.mongo?.authSource ? env?.mongo?.authSource : '';

	// Redis Database
	const REDIS_HOST = env?.redis?.host ? env?.redis?.host : ''
	const REDIS_PORT = env?.redis?.port ? env?.redis?.port : ''
	const REDIS_PREFIX = env?.redis?.prefix ? env?.redis?.prefix : ''
	const REDIS_KEY = env?.redis?.key ? env?.redis?.key : ''
	const REDIS_USERNAME = env?.redis?.username ? env?.redis?.username : ''
	const REDIS_PASSWORD = env?.redis?.password ? env?.redis?.password : ''


	const RPC_CLIENTS = env.rpcClients

	module.exports = {
		// APP INFO Constants

		HOST_NAME,
		HOST,
		APP_ENV,
		APP_TITLE,
		APP_PORT,
		API_VERSION,

		RPC_HOST,
		RPC_PORT,

		FRONTEND_URL,

		IP_INFO_CHECKER,
		DEFAULT_COUNTRY,

		TIME_ZONE,
		TIME_ZONE_OFFSET,

		// App Config & Secrets
		APP_SECRET,
		EXPIRE_IN,


		// APP Credentials
		APP_USERNAME,
		APP_PASSWORD,

		// MySQL Database
		// DB_HOST,
		// DB_NAME,
		// DB_USERNAME,
		// DB_PASSWORD,
		// DB_PORT,
		// DB_SSL,

		// MongoDB
		MONGO_HOST,
		MONGO_USERNAME,
		MONGO_PASSWORD,
		MONGO_AUTH_SOURCE,
		MONGO_NAME,
		MONGO_PORT,

		// Redis Database
		REDIS_HOST,
		REDIS_PORT,
		REDIS_PREFIX,
		REDIS_KEY,
		REDIS_USERNAME,
		REDIS_PASSWORD,

		
		// BASIC AUTH Constants
		BASIC_AUTH_USER,
		BASIC_AUTH_PASSWORD,
		
		// Plugins
		RPC_CLIENTS
	}
} catch (error) {
	console.log(error);
	process.exit(1)
}
