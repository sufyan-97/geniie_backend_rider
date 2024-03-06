// Libraries
var auth = require('http-auth');

// App Constants & Configs
const app_constants = require('../../../config/constants');

// Swagger Auth
var basicAuth = auth.basic({
    realm: "API Documentation"
}, (username, password, callback) => {
    // Custom authentication
    // Use callback(error) if you want to throw async error.
    callback(username === app_constants.BASIC_AUTH_USER && password === app_constants.BASIC_AUTH_PASSWORD);
});

module.exports = auth.connect(basicAuth)