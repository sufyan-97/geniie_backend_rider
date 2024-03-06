// Libraries
var fs = require("fs");
var moment = require("moment-strftime");
var util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const mongoose = require('mongoose');
const crypto = require("crypto");

// Models
// const LoginHistory = mongoose.model('login_history')

// Custom Libraries
const { sendEmail, sendEmailV2 } = require("../lib/email");
const rpcClient = require('../lib/rpcClient');
// const { sql } = require("../config/database");


// Constants
// const app_constants = require("../config/constants");

const constants = require("../app/Constants/app.constants");
const { orderHistory } = require("../app/MongoModels/OrderHistory");
const { rider } = require("../app/MongoModels/Rider");
// const Order = require("../app/SqlModels/Order");
// const { sendEmail } = require("../lib/email");

module.exports = {

	getRandomInt: (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	},

	getAgentRoles: async function () {
		const GetRoles = () => {
			return new Promise((resolve, reject) => {
				rpcClient.MainService.GetRoles({ status: true }, function (error, rolesData) {
					if (error) {
						console.log(error);
						return reject(error)
					}
					return resolve(rolesData)
				})
			})
		}
	
		let rolesData = await GetRoles()
	
		let roles = []
		roles = rolesData ? JSON.parse(rolesData.data) : [];
	
		let agentRoles = []
		roles.forEach((role) => {
			if(role.isAgent){
				agentRoles.push(role.roleName)
			}
		});
		return agentRoles;
	},

	getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
		// var R = 6378; // Radius of the earth in km
		var R = 3963; // Radius of the earth in miles
		var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
		var dLon = this.deg2rad(lon2 - lon1);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2)
			;
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c; // Distance in km
		return d;
	},

	deg2rad: function (deg) {
		return deg * (Math.PI / 180)
	},


	isValidDate: async function (dateIs) {
		if (new Date(dateIs) == 'Invalid Date') {
			return false;
		} else {
			return true;
		}
	},

	getWeekDay: async function (key) {

		switch (key) {
			case 1:
				return "Every Sunday";
			case 2:
				return "Every Monday";
			case 3:
				return "Every Tuesday";
			case 4:
				return "Every Wednesday";
			case 5:
				return "Every Thursday";
			case 6:
				return "Every Friday";
			case 7:
				return "Every Saturday";


			default:
				return "N/A";
		}
	},

	getMonthName: async function (key) {

		switch (key) {
			case 1:
				return "January";
			case 2:
				return "February";
			case 3:
				return "March";
			case 4:
				return "April";
			case 5:
				return "May";
			case 6:
				return "June";
			case 7:
				return "July";
			case 8:
				return "August";
			case 9:
				return "September";
			case 10:
				return "October";
			case 11:
				return "November";
			case 12:
				return "December";

			default:
				return "N/A";
		}
	},

	convertToLang: async function (lngWord, constant) {
		if (lngWord !== undefined && lngWord !== "" && lngWord !== null) {
			return lngWord;
		} else if (
			constant !== undefined &&
			constant !== "" &&
			constant !== null
		) {
			return constant;
		} else {
			return "N/A";
		}
	},

	validateEmail: email => {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},

	validateIPAddress: ip => {
		var re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return re.test(ip);
	},

	validateMacAddress: mac => {
		var re = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
		return re.test(mac);
	},

	expireLoginByToken: async function (token) {
		return new Promise((resolve, reject) => {

			LoginHistory.updateMany({
				token: token
			}, {
				status: false
			}).then((updatedDocument) => {
				resolve(updatedDocument)
			}).catch((error) => { reject(error) })
		})
	},


	formatBytes: function (bytes, decimals = 2) {
		if (bytes === 0) return "0 Bytes";

		const k = 1000;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	},

	bytesToSize: function (bytes) {
		var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		if (bytes == 0) return "0 Byte";
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
		return Math.round(bytes / Math.pow(1000, i), 2) + " " + sizes[i];
	},

	getFileSize: function (file) {
		let fileExist = path.join(__dirname, "../uploads/" + file);
		if (fs.existsSync(fileExist)) {
			let file_status = fs.statSync(fileExist);
			return file_status.size;
		} else {
			return 0;
		}
	},

	replaceAt: function (string, index, replace) {
		index--;
		return (
			string.substring(0, index) + replace + string.substring(index + 1)
		);
	},

	move: (oldPath, newPath) => {
		return new Promise((resolve, reject) => {
			fs.rename(oldPath, newPath, function (err) {
				if (err) {
					if (err.code === 'EXDEV') {
						var readStream = fs.createReadStream(oldPath);
						var writeStream = fs.createWriteStream(newPath);

						readStream.on('error', reject);
						writeStream.on('error', reject);

						readStream.on('close', function () {
							fs.unlink(oldPath, resolve);
						});

						readStream.pipe(writeStream);
					} else {
						reject(err);
					}
					return;
				}
				resolve();
			});

		})
	},

	convertTimezoneValue: async function (dealerTimezone = '', date, clientToServerTZ = false, dateFormat = "YYYY-MM-DD HH:mm:ss") { // dealerTimezone: timezone, date: date/time
		let convertedDateTime = "N/A";
		if (date && new Date(date) !== "Invalid Date" && new Date(date) !== "Invalid date" && !isNaN(new Date(date))) {
			let timeZones = moment.tz.names();
			let foundZoneIndex = -1;
			if (this.isValidTimezone(dealerTimezone)) {
				foundZoneIndex = timeZones.findIndex(item => item.toLowerCase() === dealerTimezone.toLowerCase());
			}
			if (foundZoneIndex === -1) {
				dealerTimezone = moment.tz.guess(); // get local time zone value e.g "Asia/Karachi"
			}

			if (clientToServerTZ) {
				convertedDateTime = moment.tz(date, dealerTimezone).tz('UTC').format(dateFormat);
			} else {
				// convert server time to client time
				convertedDateTime = moment.tz(date, 'UTC').tz(dealerTimezone).format(dateFormat);
			}
		}

		return convertedDateTime;
	},

	isValidTimezone: function (tz) {
		let isValidTimezone = true;
		if (tz) {
			try {
				Intl.DateTimeFormat(undefined, { timeZone: tz });
			}
			catch (ex) {
				isValidTimezone = false;
			}
		} else {
			isValidTimezone = false;
		}
		return isValidTimezone;
	},

	getValueFromPrice: async function (value) {
		var regexOnlyFloatValue = /[+-]?\d+(\.\d+)?/g;
		let parsedValue = value;
		let finalValue = '';
		let isNegativeValue = false;

		try {

			if (value && typeof (value) !== 'number' && value.match(regexOnlyFloatValue)) {
				let indexOfNegative = parsedValue.indexOf("-");
				if (indexOfNegative !== -1) {
					isNegativeValue = true;
					parsedValue = parsedValue.splice(indexOfNegative, 1);
				}
				let parsedFloatValue = parsedValue.match(regexOnlyFloatValue);
				// parsedValue = parsedValue[0]
				for (let i = 0; i < parsedFloatValue.length; i++) {
					finalValue += parsedFloatValue[i]
				}

				// console.log(parsedValue);
				// parsedValue = parseFloat(value.replace(/\$|,/g, ''))
			} else {
				finalValue = value;
			}

		} catch (err) {
			console.log(err)
		}
		return finalValue ? isNegativeValue ? -parseFloat(finalValue) : parseFloat(finalValue) : "0.00";
	},

	IsValidJSONString: function (str) {
		try {
			return JSON.parse(str);
		} catch (e) {
			console.log("ERROR CONSOLE IN IsValidJSONString", e)
			return false;
		}
	},

	currencyFormat: function (value, symbol = '$') {
		let isNegativeValue = false;
		let formattedValue = `0.00`;

		if (device_helpers.checkValue(value) !== "N/A") {
			value = value.toString();
			formattedValue = `${value} .00`;
			let indexOfDot = value.indexOf(".");

			if (indexOfDot !== -1) {
				let intValue = Number(value);
				if (indexOfDot === 0) { // . dot place at zero index
					formattedValue = `0${intValue.toFixed(2)} `
				} else {
					formattedValue = `${intValue.toFixed(2)} `
				}
			}

			let indexOfNegative = formattedValue.indexOf("-");
			if (indexOfNegative !== -1) {
				isNegativeValue = true;
				formattedValue = formattedValue.slice(1, formattedValue.length);
			}
		}
		formattedValue = `${symbol} ${device_helpers.addCommas(formattedValue)} `
		return isNegativeValue ? `- ${formattedValue} ` : formattedValue;
	},

	hasSql: (value) => {

		if (value === null || value === undefined) {
			return false;
		}

		// sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
		var sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
		if (sql_meta.test(value)) {
			return true;
		}

		var sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i');
		if (sql_meta2.test(value)) {
			return true;
		}

		var sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
		if (sql_typical.test(value)) {
			return true;
		}

		var sql_union = new RegExp('((%27)|(\'))union', 'i');
		if (sql_union.test(value)) {
			return true;
		}

		return false;
	},

	generateRefreshToken: () => {
		return crypto.randomBytes(40).toString('hex');
	},

	checkIsArray: function (data) {
		try {
			if (!data) {
				return [];
			}
			if (Array.isArray(data) && data.length) {
				return data;
			} else {
				return [];
			}
		} catch (err) {
			return [];
		}
	},

	uploadImage: async function (image, prefix) {
		let imageMimeType = image.type
		if (!constants.IMAGE_SUPPORTED_FORMATS.includes(imageMimeType.toLowerCase())) {
			return {
				status: false,
				message: "Error: one of the uploaded file Extension is not valid.",
				statusCode: 422
			};
		}

		let currentDate = moment().format("YYYYMMDDHHmmss")

		let imageName = `${prefix}-${currentDate}.png`;
		let imageTarget = path.join(__dirname, "../storage/images/" + imageName);
		let moveImageError = await this.move(image.path, imageTarget)
		if (moveImageError) {
			console.log(error)
			return {
				status: false,
				message: 'Error: Internal server error'
			}
		}
		return {
			status: true,
			imageName: imageName
		}
	},

	sendNotification: function (notificationData) {
		return new Promise((resolve, reject) => {
			try {
				let userId = notificationData.userId
				let title = notificationData.title
				let body = notificationData.body
				let data = notificationData.data

				rpcClient.NotificationService.SendNotification({
					userId: userId,
					title: title,
					body: body,
					data: JSON.stringify(data)
				}, (err, response) => {
					if (err) {
						console.log(err);
						resolve(false)
					} else {
						resolve(true)
					}
				})
			} catch (error) {
				console.log(error);
				resolve(false)
			}
		})
	},

	saveOrderHistory: function (data) {
		return new Promise((resolve, reject) => {
			orderHistory.create(data).then(savedData => {
				console.log("Order History Saved");
				resolve(true)
			}).catch(err => {
				console.log(err);
				resolve(false)
			})
		})

	},

	getAvailableRider: function (requestData) {
		return new Promise(async (resolve, reject) => {
			console.log(requestData)
			let latitude = requestData.latitude;
			let longitude = requestData.longitude;
			let excludeId = requestData.userId
			let whereClause = { isOccupied: false, isAvailable: true, status: "active" }
			if (excludeId) {
				whereClause.riderId = { $ne: excludeId }
			}

			let data = await rider.aggregate([
				{ $match: whereClause },
				{
					$addFields:
					{
						radius:
						{
							$function:
							{
								body: function (lat1, long1, latitude, longitude) {
									let general_helper = {
										getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
											// var R = 6378; // Radius of the earth in km
											var R = 3963; // Radius of the earth in miles
											var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
											var dLon = this.deg2rad(lon2 - lon1);
											var a =
												Math.sin(dLat / 2) * Math.sin(dLat / 2) +
												Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
												Math.sin(dLon / 2) * Math.sin(dLon / 2)
												;
											var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
											var d = R * c; // Distance in km
											return d;
										},

										deg2rad: function (deg) {
											return deg * (Math.PI / 180)
										}
									}
									return general_helper.getDistanceFromLatLonInKm(lat1, long1, latitude, longitude)
								},
								args: ["$latitude", "$longitude", latitude, longitude],
								lang: "js"
							}
						}
					}
				},
				{ $match: { radius: { $lte: 5 } } },
				{ $sort: { radius: 1 } },
				{ $limit: 1 }
			])
			if (data && data.length) {
				rider.updateOne({ riderId: data[0].riderId }, { isOccupied: true }, function (err, docs) {
					if (err) {
						console.log(err)
					}
					else {
						console.log("Updated Docs : ", docs);
					}
				})
				return resolve({ status: true, message: "Rider Found", userId: data[0].riderId });
			} else {
				return resolve({ status: false, message: "Rider not found." });
			}
		})

	},
}





