// Libraries
const redis = require("redis");

const constants = require('./constants');

// console.log(constants.REDIS_HOST)
// const redisClient = redis.createClient({
//     host: constants.REDIS_HOST,
//     port: constants.REDIS_PORT,
//     prefix: constants.REDIS_PREFIX,
//     password: constants.REDIS_PASSWORD
// })

// redisClient.on("error", function (err) {
//     console.log('could not establish a connection with redis. ' + err);
//     process.exit(1)
// });
// redisClient.on('reconnecting', function (attempt) {
//     console.log('attempt', attempt)
// })

// redisClient.on('connect', function () {
//     console.log('connected to redis successfully',);
// })

// module.exports = redisClient;