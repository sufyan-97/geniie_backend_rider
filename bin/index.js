// Libraries
var path = require('path');
var fs = require("fs");
var moment = require("moment")
var Table = require('cli-table');

// Custom Libraries
// const { sql } = require('../config/database');
var app = require("../src/index.js");


// Helpers
// const sim_helpers = require('../helper/sim_helpers');
// const helpers = require('./command_helper');

//***************** Validations **********************//
// const accountValidators = require('../app/Validators/account');

// Constants
var app_constants = require('../config/constants');
// const constants = require('../constants/Application');


exports.config = function (args) {
    let username = args.u || args.username;
    let password = args.p || args.password;
    if (username && password) {
        console.log("hi! config", args)
    }
}

exports.allRoutes = async function () {
    var routes = [];
    app._router.stack.forEach(function (middleware) {
        if (middleware.route) { // routes registered directly on the app
            let methods = ''
            for (key in middleware.route.methods) {
                if (middleware.route.methods[key] === true) {
                    methods += key + ','
                }
            }
            routes.push([
                middleware.route.path,
                methods
            ]);
        } else if (middleware.name === 'router') { // router middleware

            middleware.handle.stack.forEach(function (handler) {
                route = handler.route;
                if (route) {
                    let methods = ''
                    for (key in route.methods) {
                        if (route.methods[key] === true) {
                            methods += key + ','
                        }
                    }
                    routes.push([
                        route.path,
                        methods
                    ]);
                }
            });
        }
    });
    // console.log(routes)
    var table = new Table({
        // head: ['Path', 'Method'],
        colWidths: [100, 50]
    });
    table.push(...routes)
    console.log(table.toString());
    process.exit(1)
}