// libraries
// var datetime = require('node-datetime');
var moment = require('moment');
var cron = require('node-cron');
const { Op } = require("sequelize");
const parser = require("cron-parser");
const log = require("single-line-log").stdout;

// custom libraries

// Models
// const CronJob = require("../app/SqlModels/CronJob");

// controllers
const cronController = require('../app/Controllers/cron.controller');

// constants


/**
 * =================
 * Asterisk. E.g. *
 * Ranges. E.g. 1-3,5
 * Steps. E.g. *'/2
 * =================
 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11 (Jan-Dec)
 * Day of Week: 0-6 (Sun-Sat)
 *
 *   *         *       *         *            *       *
 * Seconds  Minutes  Hours  (Days of Month)  Months  Weekday
 */

/** Cron for device expiry date **/
// cron.schedule('0 0 0 * * *', cronController.cronJob);

cron.schedule("*/5 * * * * *", async () => {
    try {
        Promise.all([
            cronController.restrictRiderOnRejectionRate(),
            cronController.activateRiderAfterSuspensionTime(),
        ]);
    } catch (error) {
        console.log(error);
    }
});

