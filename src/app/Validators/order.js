const { check, body, param, query } = require("express-validator");

exports.put = [
	body("action")
		.notEmpty()
		.isIn(["accepted", "declined", "arrived_restaurant", "picked", "completed", "arrived_customer", "cancelled"]),

	body("id")
		.notEmpty()
		.isInt(),

	body("deliveryTime")
		.notEmpty()
		.isString()
		.optional(),

	body('rejectionReason')
		.notEmpty()
		.isString()
		.optional(),

	body("image")
		.notEmpty()
		.isString()
		.optional(),
];

exports.adjustTime = [
	body("id").notEmpty().isInt(),

	body("deliveryTime").notEmpty().isString(),
];

exports.getAll = [query("listType").notEmpty().isIn(["active", "past"])];

exports.getOne = [param("id").notEmpty().isInt()];

exports.update = [];

exports.delete = [];
