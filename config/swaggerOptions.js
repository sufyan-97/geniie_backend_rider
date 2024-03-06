const app_constants = require('./constants');

let options = {
    swaggerDefinition: {
        info: {
            description: 'This is secure MDM API',
            title: 'LockMesh',
            version: '1.0',
        },
        host: app_constants.HOST,
        basePath: '/',
        produces: [
            "application/json"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['../routes/**/*.js'] //Path to the API handle folder
};

exports.options = options