// routes
const router = require('express').Router();

// controllers
const controller = require("../app/Controllers/rider.controller");

// Validators
const validator = require("../app/Validators/rider")
const errorMsgs = require("../app/Validators/commonValidators").responseValidationResults


router.put('/availability', [validator.availability, errorMsgs], controller.availability);
router.get('/availability', controller.getRiderAvailability);
router.get('/info', controller.info);
router.get('/acceptanceAndCancellationRate', controller.getAcceptanceAndCancellationRate);
router.get('/report', controller.report);
router.get('/reportSummary', controller.reportSummary);

module.exports = router;
