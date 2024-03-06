//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// Libraries
const moment = require("moment");
const rpcClient = require("../../lib/rpcClient");

// Models
const { order } = require('../MongoModels/Order');
const { rider } = require('../MongoModels/Rider');
const { orderHistory } = require('../MongoModels/OrderHistory');

// helpers
const general_helper = require("../../helpers/general_helper");

// Constants
const { TIMESTAMP_FORMAT } = require('../Constants/app.constants');
const appConstants = require("../Constants/app.constants");

exports.restrictRiderOnRejectionRate = async function () {
	// let userId = req.user.id;
	// console.log('here')
	// return;

	const today = moment();
	const from_date = today.startOf('week');
	let ridersList = await rider.find({ status: "active" })
	let riderIds = ridersList.map(item => item.riderId)
	// console.log(riderIds)
	orderHistory.aggregate([
		// { $match: { createdAt: { $gt: from_date } } },
		{ $match: { riderId: { $in: riderIds }, created_at: { $gt: new Date(from_date) } } },
		{
			"$group": {
				"_id": "$orderId",
				"action": { $first: '$action' },
				"riderId": { $first: '$riderId' },
			}
		}
	]).then(async (orderData) => {
		// console.log(orderData)
		

		if (orderData && orderData.length) {
			try {
				let riderOrderDetails = {}
				orderData.forEach(item => {
					let cancelled = item.action === "rejected" || item.action == "cancelled"
					if (riderOrderDetails[item.riderId]) {
						riderOrderDetails[item.riderId].total = riderOrderDetails[item.riderId].total + 1
						if (cancelled) {
							riderOrderDetails[item.riderId].cancelledOrders = riderOrderDetails[item.riderId].cancelledOrders + 1
						}
						riderOrderDetails[item.riderId].cancelledPercentage = riderOrderDetails[item.riderId].cancelledOrders / riderOrderDetails[item.riderId].total
					} else {
						riderOrderDetails[item.riderId] = {
							cancelledOrders: cancelled ? 1 : 0,
							cancelledPercentage: cancelled ? 1 : 0,
							total: 1,
						}
					}
				})
				

				let suspendedRiders = []
				for (const riderId in riderOrderDetails) {
					let dateNow = moment()
					if (riderOrderDetails[riderId].total > 10) {
						
						let cancelledPercentage = riderOrderDetails[riderId].cancelledPercentage
						let riderData = ridersList.find(riderData => riderData.riderId == riderId)
						let suspensionLevel;
						
						if (cancelledPercentage > 0.70) {
							let suspensionTime;
							let needUpdate = false
							if (cancelledPercentage < 0.75 && (riderData.suspensionLevel === 0 || riderData.suspensionLevel == null)) {
								suspensionTime = dateNow.add(2, "hours").format(TIMESTAMP_FORMAT)
								suspensionLevel = 1
								needUpdate = true
							} else if (cancelledPercentage < 0.80 && cancelledPercentage > 0.75 && (riderData.suspensionLevel <= 1)) {
								suspensionTime = dateNow.add(4, "hours").format(TIMESTAMP_FORMAT)
								suspensionLevel = 2
								needUpdate = true

							} else if (cancelledPercentage < 0.90 && cancelledPercentage > 0.80 && (riderData.suspensionLevel <= 2)) {
								suspensionTime = dateNow.add(8, "hours").format(TIMESTAMP_FORMAT)
								suspensionLevel = 3
								needUpdate = true

							} else if (cancelledPercentage > 0.90 && (riderData.suspensionLevel <= 3)) {
								suspensionLevel = 4
								suspensionTime = dateNow.add(24, "hours").format(TIMESTAMP_FORMAT)
								needUpdate = true
							}

							
							if (needUpdate) {
								riderOrderDetails[riderId].suspensionTime = suspensionTime
								riderOrderDetails[riderId].suspensionLevel = suspensionLevel

								let updatedRider = await rider.updateOne({ riderId: Number(riderId) }, { status: "suspended", suspensionTime: suspensionTime, suspensionLevel, suspendedDueToCancellation: true })
								if (updatedRider.nModified) {
									suspendedRiders.push(riderId)
								}
							}
						}
					}
				}

				// console.log('riderOrderDetails:', riderOrderDetails)
				if (suspendedRiders && suspendedRiders.length) {
					rpcClient.riderRPCMain.updateRiderStatus({
						status: "suspended",
						userIds: suspendedRiders,
						data: JSON.stringify(riderOrderDetails)
					}, function (err, response) {
						console.log(err, response)
					})

				}
			} catch (error) {
				console.log(error)
			}
		}
	}).catch((err) => {
		console.log(err);
	});
};

exports.activateRiderAfterSuspensionTime = async function () {
	// let userId = req.user.id;
	const today = moment();
	rider.find({ status: "suspended", suspendedDueToCancellation: true, suspensionTime: { $lt: new Date(today) } }).then(async (ridersData) => {
		// console.log("ridersData", ridersData)
		if (ridersData && ridersData.length) {
			try {
				let riderIds = ridersData.map(item => item.riderId)
				rider.updateMany({ riderId: { $in: riderIds } }, { status: "active", suspendedDueToCancellation: false, suspensionTime: null }, (err, data) => {
					console.log("Riders Updated", err, data)
					if (data.nModified) {
						rpcClient.riderRPCMain.updateRiderStatus({ status: "active", userIds: riderIds },
							function (err, response) {
								console.log(err, response)
							})
					}
				})
			} catch (error) {
				console.log(error)
			}
		}
	}).catch((err) => {
		console.log(err);
	});
};

