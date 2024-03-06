// routes

const router = require('express').Router();
const multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require("../app/Controllers/order.controller");

//***************** Validations **********************/ 

const validator = require('../app/Validators/order')

const errorMsgs = require('../app/Validators/commonValidators').responseValidationResults;

// router.get('/:id', controller.fetch);

router.get('/', [validator.getAll, errorMsgs], controller.getAll);

router.get('/:id', [validator.getOne, errorMsgs], controller.getOne);

router.put('/', multipart(), [validator.put, errorMsgs], controller.update);



module.exports = router;
