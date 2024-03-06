
const mongoose = require('mongoose');
const constants = require('./constants');

module.exports = function mongoConnect() {

    var options = {
        // db: { native_parser: true },
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // server: { poolSize: 5 },
        // replset: { rs_name: 'myReplicaSetName' },
        user: constants.MONGO_USERNAME,
        pass: constants.MONGO_PASSWORD,
        authSource: constants.MONGO_AUTH_SOURCE
        // promiseLibrary: global.Promise
    }
    mongoose.connect(`mongodb://${constants.MONGO_HOST}:${constants.MONGO_PORT}/${constants.MONGO_NAME}`, options);
    return mongoose.connection;
}