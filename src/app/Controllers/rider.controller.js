// const { Mongoose } = require("mongoose")
const moment = require("moment")
const { loadFileDescriptorSetFromBuffer } = require("@grpc/proto-loader");
const general_helper = require("../../helpers/general_helper");
const { location } = require("../MongoModels/location");
const rpcClient = require('../../lib/rpcClient');

//constant
const app_constants = require("../Constants/app.constants");

const { rider } = require("../MongoModels/Rider");
const { order } = require("../MongoModels/Order");
const { orderHistory } = require("../MongoModels/OrderHistory");

exports.createRider = async function (req, res) {
    let id = req.request.userId;
    console.log(req.request)
    rider.findOne({ riderId: id }).then(async item => {
        if (!item) {
            item = await rider.create({ riderId: id, restaurant_userId: req.request.restaurantUserId })
        }
        return res(null, item);
    }).catch(err => {
        return res(null, err);
    })
}

exports.updateOnlineStatus = async function (req, res) {
    let id = req.request.userId;
    let status = req.request.status;
    console.log(req.request)
    rider.findOne({ riderId: id }).then(async item => {
        console.log(item)
        if (!item) {
            rider.create({ riderId: id, isOnline: status }).then(savedData => {
                console.log(savedData)
                return res(null, savedData)
            })
        } else {
            item.isOnline = status
            item.save()
            return res(null, item);
        }
    }).catch(err => {
        return res(null, err);
    })
}

exports.availability = async function (req, res) {
    let id = req.user.id;
    let status = req.body.status;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    // console.log(latitude, longitude)
    if (req.user.roleName !== 'rider') {
        return res.status(400).send({
            message: "Error: Unauthorized Access."
        })
    }

    if ((status == true || status === 'true') && (!latitude || !longitude)) {
        return res.status(422).send({
            message: "Error: Incomplete information."
        })
    }


    rider.findOne({ riderId: id }).then(async item => {
        if (!item) {
            rider.create({ riderId: id, isOnline: status, isAvailable: status, longitude: longitude, latitude: latitude }).then(savedData => {
                // location.findOneAndUpdate({ riderId: id }, { riderId: id, longitude: longitude, latitude: latitude }, { upsert: true }, (err, value) => {
                //     console.log(err, value)
                // })
                return res.send({ message: "Availability Status has been updated successfully.", isAvailable: status })
            })
        } else {
            item.isAvailable = status
            if (status === "true" || status == true) {
                item.latitude = latitude
                item.longitude = longitude
            }
            item.save()
            // location.findOneAndUpdate({ riderId: id }, { riderId: id, longitude: longitude, latitude: latitude }, { upsert: true }, (err, value) => {
            //     console.log(err, value)
            // })
            return res.send({ message: "Availability Status has been updated successfully.", isAvailable: status })
        }
    }).catch(err => {
        console.log(err)
        return res.status(500).send({ message: "Error: Internal Server Error." });
    })
}

exports.getRiderAvailability = async function (req, res) {
    let id = req.user.id;
    if (req.user.roleName !== 'rider') {
        return res.status(400).send({
            message: "Error: Unauthorized Access."
        })
    }

    rider.findOne({ riderId: id }).then(async item => {
        return res.send({ message: "", isAvailable: item.isAvailable })
    }).catch(err => {
        console.log(err)
        return res.status(500).send({ message: "Error: Internal Server Error." });
    })
}

exports.info = async function (req, res) {
    let id = req.user.id;
    if (req.user.roleName !== 'rider') {
        return res.status(400).send({
            message: "Error: Unauthorized Access."
        })
    }

    rider.findOne({ riderId: id }).select('-_id -__v -riderId -created_at -updated_at').then(async item => {
        if (!item) {
            return res.status(400).send({ message: "Error: User not found." });
        }
        let itemData = item.toJSON()
        if (item.suspensionTime) {
            itemData.remainingTime = (moment()).diff(moment(item.suspensionTime))
        }
        return res.send({ message: "", data: itemData })
    }).catch(err => {
        console.log(err)
        return res.status(500).send({ message: "Error: Internal Server Error." });
    })
}

exports.getAvailableRider = async function (req, res) {
    let latitude = req.request.latitude;
    let longitude = req.request.longitude;
    let excludeId = req.request.userId
    let whereClause = { isOccupied: false, isAvailable: true, status: "active" }
    let branchOwnRiders = req.request.branchOwnRiders ? req.request.branchOwnRiders : false

    console.log('excludeId', excludeId);
    console.log('branchOwnRiders', branchOwnRiders);
    console.log("excludeId && branchOwnRiders != 'true' && branchOwnRiders != 'false'", excludeId && branchOwnRiders != true && branchOwnRiders != false);

    if (req.request.userId && branchOwnRiders) {
        whereClause.restaurant_userId = req.request.userId
    } else if (excludeId && branchOwnRiders != true && branchOwnRiders != false) {
        whereClause.riderId = { $not: excludeId }
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
        { $match: { radius: { $lte: 15 } } },
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
        return res(null, { status: true, message: "Rider Found", userId: data[0].riderId });
    } else {
        return res(null, { status: false, message: "Rider not found." });
    }
}

exports.updateRiderOccupyStatus = async function (req, res) {
    let isOccupied = req.request.isOccupied;
    let userId = req.request.userId;
    let data = req.request.data;
    if (data) {
        data = JSON.parse(data)
    }
    console.log("DATA OF ORDER: ", data)
    if (!isOccupied || !userId) {
        return res(null, { status: false, message: "Invalid Information" });
    }

    rider.updateOne({ riderId: userId }, { isOccupied: isOccupied }, function (err, docs) {
        if (err) {
            console.log(err)
            return res(null, { status: false, message: "Internal Server Error." });
        }
        else {
            if (isOccupied) {
                order.create({
                    riderId: userId,
                    orderId: data.id,
                    serviceId: null,
                    status: "new",
                    orderData: data
                })
            }
            return res(null, { status: true, message: "Data Updated Successfully." });
        }
    })

}

exports.updateOrderStatus = async function (call, callBack) {
    // console.log(call.request)
    let status = call.request.status;
    let orderId = call.request.orderId;
    let data = call.request.data;
    if (!status || !orderId) {
        return callBack(null, { status: false, message: "Invalid Information" });
    }

    let dataToUpdate = {
        status: status
    }

    if (data) {
        data = JSON.parse(data)
        dataToUpdate.orderData = data
    }

    order.updateOne({ orderId: orderId }, dataToUpdate, function (err, docs) {
        if (err) {
            console.log(err)
            return callBack(null, { status: false, message: "Internal Server Error." });
        }
        else {
            return callBack(null, { status: true, message: "Data Updated Successfully." });
        }
    })

}

exports.updateRiderLocation = async function (req, res) {
    try {

        let id = req.request.userId;

        let latitude = req.request.latitude;
        let longitude = req.request.longitude;

        let riderData = await rider.findOne({ riderId: id })

        if (!riderData) {
            await rider.create({ riderId: id, isOnline: true, latitude: latitude, longitude: longitude })
        } else {
            riderData.latitude = latitude
            riderData.longitude = longitude
            await riderData.save()
            // return res(null, riderData);
        }

        let orderData = [];

        let riderOrders = await order.find({
            riderId: id,
            status: {
                $nin: ["completed", "cancelled"]
            }
        });

        riderOrders.forEach((riderOrder) => {
            if (riderOrder?.orderData) {
                orderData.push({
                    userId: riderOrder?.orderData?.userId,
                    orderId: riderOrder?.orderData?.id
                })
            }
        })
        // console.log('here', consumers)

        return res(null, {
            status: true,
            message: 'location updated successfully',
            data: JSON.stringify(orderData)
        })
    } catch (error) {
        console.log(error);
        return res(error.message)
    }

}

exports.getAcceptanceAndCancellationRate = async function (req, res) {

    let userId = req.user.id;
    const today = moment();
    const from_date = today.startOf('week').format('YYYY-MM-DD');
    let cancellationRate = 0
    let acceptanceRate = 100

    let agentRoles = await general_helper.getAgentRoles()

    if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
        if (req.query.userId) {
            userId = Number(req.query.userId)
        } else {
            return res.status(422).send({
                message: "Error: Invalid Data.",
            });
        }
    }
    orderHistory.aggregate([
        { $match: { riderId: userId, created_at: { "$gte": new Date(from_date) } } },
        {
            "$group": {
                "_id": "$orderId",
                "action": { $first: '$action' }
            }
        },
    ]).then(async (orderData) => {
        console.log(orderData.length)
        if (orderData && orderData.length) {
            try {
                let cancelledOrder = orderData.filter(item => item.action == 'rejected' || item.action == 'cancelled')
                if (cancelledOrder.length) {
                    cancellationRate = ((cancelledOrder.length / orderData.length) * 100).toFixed(2)
                    acceptanceRate = (100 - cancellationRate).toFixed(2)
                }
                res.status(200).send({
                    data: { cancellationRate: parseFloat(cancellationRate).toFixed(2), acceptanceRate: parseFloat(acceptanceRate).toFixed(2) }
                })
            } catch (error) {
                return res.status(400).send({
                    message: "Unable to find order data",
                });
            }
        } else {
            res.status(200).send({
                data: { cancellationRate: parseFloat(cancellationRate).toFixed(2), acceptanceRate: parseFloat(acceptanceRate).toFixed(2) }
            })
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({
            message: "Internal Server Error.",
        });
    });
};


exports.report = async function (req, res) {

    let agentRoles = await general_helper.getAgentRoles()

    if (req.user.roleName !== "rider" && req.user.roleName !== "admin" && !agentRoles.includes(req.user.roleName)) {
        return res.status(400).send({ message: "Error: Unauthorized Access." })
    }


    let userId = req.user.id
    let frequency = req.query.frequency
    let timezone = req.headers['timezone']


    let startDate = req.query.startDate ? req.query.startDate : ''
    let endDate = req.query.endDate ? req.query.endDate : ''

    if (frequency == '7_days') {

        // startDate = moment().tz('UTC').subtract(7, 'days').startOf('day').format(app_constants.DATE_FORMAT)
        // endDate = moment().tz('UTC').format(app_constants.DATE_FORMAT)
        startDate = moment().tz('UTC').subtract(7, 'days').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'last_month') {

        startDate = moment().tz('UTC').subtract(1, 'month').startOf('month').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').subtract(1, 'month').endOf('month').endOf('day').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'this_month') {

        startDate = moment().tz('UTC').startOf('month').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'range' && startDate && startDate != '' && endDate && endDate != '') {

        // startDate = moment(startDate).format(app_constants.TIMESTAMP_FORMAT)
        // endDate = moment(endDate).format(app_constants.TIMESTAMP_FORMAT)
        // console.log(startDate, endDate);
        startDate = moment.tz(startDate, timezone).tz('UTC').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment.tz(endDate, timezone).tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else {
        return res.status(422).send({
            message: 'Invalid Data',
        })
    }

    let data = {
        data: [],
        totalRecords: 0,
        totalPrice: 0
    }

    let actionIn = ["order_completed"]
    if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
        userId = Number(req.query.userId);
        if (!userId) {
            return res.status(422).send({ message: "invalid data" })
        }
        actionIn = ["order_completed", "cancelled", "rejected"]
    }

    let size = req.query.size ? Number(req.query.size) : 10;
    let pageNo = req.query.pageNo ? Number(req.query.pageNo) : 1;
    let offset = 0;
    if (pageNo > 1) {
        offset = size * pageNo - size;
    }
    let pagination = {};
    pagination.limit = size;
    pagination.skip = offset;
    pagination.pageNo = pageNo;

    let restaurantOrderReportData = await orderHistory.find({
        action: { $in: actionIn },
        riderId: userId,
        created_at: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }
    }, {}, {
        ...pagination,
    })

    // console.log(restaurantOrderReportData)
    if (restaurantOrderReportData && restaurantOrderReportData.length) {

        // console.log(restaurantOrderReportData.length);
        let totalRecords = restaurantOrderReportData.filter(a => a.action === 'order_completed').length
        let totalPrice = 0
        for (let i = 0; i < restaurantOrderReportData.length; i++) {
            if (restaurantOrderReportData[i].action === 'order_completed') {
                totalPrice = totalPrice + restaurantOrderReportData[i].orderData.orderSummary.deliveryCharges
            }
        }
        data = {
            data: restaurantOrderReportData,
            totalRecords: totalRecords,
            totalPrice
        }
    }

    return res.send(data)
}


exports.reportSummary = async function (req, res) {

    let agentRoles = await general_helper.getAgentRoles()

    if (req.user.roleName !== "rider" && req.user.roleName !== "admin" && !agentRoles.includes(req.user.roleName)) {
        return res.status(400).send({ message: "Error: Unauthorized Access." })
    }


    let timezone = req.headers['timezone']
    let userId = req.user.id
    let frequency = req.query.frequency


    let startDate = req.query.startDate ? req.query.startDate : ''
    let endDate = req.query.endDate ? req.query.endDate : ''

    if (frequency == '7_days') {

        // startDate = moment().tz('UTC').subtract(7, 'days').startOf('day').format(app_constants.DATE_FORMAT)
        // endDate = moment().tz('UTC').format(app_constants.DATE_FORMAT)
        startDate = moment().tz('UTC').subtract(7, 'days').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'last_month') {

        startDate = moment().tz('UTC').subtract(1, 'month').startOf('month').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').subtract(1, 'month').endOf('month').endOf('day').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'this_month') {

        startDate = moment().tz('UTC').startOf('month').startOf('day').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment().tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else if (frequency == 'range' && startDate && startDate != '' && endDate && endDate != '') {

        // startDate = moment(startDate).format(app_constants.TIMESTAMP_FORMAT)
        // endDate = moment(endDate).format(app_constants.TIMESTAMP_FORMAT)
        // console.log(startDate, endDate);
        startDate = moment.tz(startDate, timezone).tz('UTC').format(app_constants.TIMESTAMP_FORMAT)
        endDate = moment.tz(endDate, timezone).tz('UTC').format(app_constants.TIMESTAMP_FORMAT)

    } else {
        return res.status(422).send({
            message: 'Invalid Data',
        })
    }

    let actionIn = ["order_completed"]
    if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
        userId = Number(req.query.userId);
        if (!userId) {
            return res.status(422).send({ message: "invalid data" })
        }
        actionIn = ["order_completed", "cancelled", "rejected"]
    }

    let data = {
        totalRecords: 0,
        totalPrice: 0,
    }
    // console.log('startDate=>', startDate, "endDate=>", endDate)

    let whereCondition = { action: { $in: actionIn }, riderId: userId, created_at: { $gte: new Date(startDate), $lte: new Date(endDate) } }

    if (startDate === endDate) {
        whereCondition.created_at = { $gte: new Date(moment(startDate).startOf('day')), $lte: new Date(moment(startDate).endOf('day')) }
    }

    // console.log(whereCondition);
    orderHistory.aggregate([
        { $match: whereCondition },
        { $group: { _id: null, totalRecords: { $count: {} }, totalPrice: { $sum: "$orderData.orderSummary.deliveryCharges" } } }
    ]).then(async (orderData) => {
        // console.log(orderData)
        if (orderData && orderData.length) {
            data = orderData[0]
            delete data._id
        }
        return res.send({ data: data })
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({
            message: "Internal Server Error.",
        });
    });

}

exports.GetRiderLocation = async function (req, res) {
    let riderIds = req.request.riderIds;

    rider.find({
        riderId: { $in: riderIds },
    }).select('riderId latitude longitude').then(items => {
        let riderLatLongData = []
        items.forEach(element => {
            let rider = element.toJSON()
            delete rider._id
            riderLatLongData.push(rider)
        });
        return res(null, { status: true, data: JSON.stringify(riderLatLongData) });
    }).catch(err => {
        return res(null, err);
    })
}

exports.UpdateConsumerDeliveryAddress = async function (req, res) {
    let orderId = req.request.orderId;
    let lat = req.request.lat;
    let long = req.request.long;
    let address = req.request.address;

    order.findOne({
        orderId: orderId,
        status: { $nin: ["completed", "cancelled"] }
    }).then(async (orderData) => {
        if (orderData) {
            orderData.orderData.orderSummary.lat = lat
            orderData.orderData.orderSummary.long = long
            orderData.orderData.orderSummary.deliveryAddress = address

            await order.updateOne({ orderId: orderData.orderId }, { orderData: orderData.orderData }, (Updated) => {
                console.log(Updated);
            })

            return res(null, { status: true, message: 'consumer delivery address updated successfully' });
        }
        return res(null, { status: false, message: 'order data not found' });
    }).catch(err => {
        return res(null, err);
    })
}

exports.assignOrderToRider = async function (req, res) {
    let userId = req.request.userId;
    let data = req.request.data;
    // console.log(req.request)
    if (data) {
        data = JSON.parse(data)
    }
    // console.log("DATA OF ORDER: ", data)
    if (!userId) {
        return res(null, { status: false, message: "Invalid Information" });
    }

    order.create({
        riderId: userId,
        orderId: data.id,
        serviceId: null,
        status: "arrived_restaurant",
        orderData: data
    })
    return res(null, { status: true, message: "Data Updated Successfully." });
}

exports.isRiderHaveActiveOrder = async function (req, res) {
    let riderId = req.request.riderId;
    order.count({ riderId: riderId, status: { $nin: ["completed", "cancelled"] } }).then(count => {
        console.log(count)
        if (count > 0) {
            return res(null, { status: true, message: "Rider have active orders." });
        } else {
            return res(null, { status: false, message: "" });
        }
    }).catch(err => {
        return res(null, { status: false, message: "Error: Internal Server Error." });
    })
}

