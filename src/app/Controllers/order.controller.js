const moment = require("moment")
const { saveOrderHistory, getAvailableRider, sendNotification } = require("../../helpers/general_helper");
const { order } = require("../MongoModels/Order");
const { orderHistory } = require("../MongoModels/OrderHistory");
const general_helper = require("../../helpers/general_helper");
const { rider } = require("../MongoModels/Rider");
const rpcClient = require('../../lib/rpcClient');


exports.getAll = async function (req, res) {
  try {
    let userId = req.user.id;
    let orderStatusType = req.query.listType;
    let startDate = req.query.startDate ? req.query.startDate : null;
    let endDate = req.query.endDate ? req.query.endDate : moment().format();
    let orderWhere = {
      riderId: userId
    };

    if (startDate) {
      orderWhere.created_at = {
        $gte: startDate,
        $lt: endDate
      };
    }

    let agentRoles = await general_helper.getAgentRoles()

    if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
      if (req.query.userId) {
        orderWhere.riderId = req.query.userId
      } else {
        return res.status(422).send({
          message: "Error: Invalid Data.",
        });
      }
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

    if (orderStatusType === "active") {
      orderWhere.status = {
        $in: [
          "new",
          "accepted",
          "ready_for_delivery",
          "arrived_restaurant",
          "picked",
          "arrived_customer",
        ],
      };
      order.find(orderWhere, {}, {
        ...pagination,
      })
        .then(async (orderData) => {
          if (orderData && orderData.length) {
            let userIds = [];
            orderData.map((item) => {
              if (!userIds.includes(item.orderData.userId)) {
                userIds.push(item.orderData.userId);
              }
            });
            rpcClient.UserService.GetUsers(
              { ids: userIds },
              function (err, response) {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    message: "Unable to get riders this time.",
                  });
                }

                if (!response || !response.data) {
                  sequelizeTransaction.rollback();
                  return res.status(500).send({
                    message: "Unable to get riders this time.",
                  });
                }
                let users = JSON.parse(response.data);
                let dataToSend = [];
                orderData.map((item) => {
                  item = item.toJSON();
                  users.map((userData) => {
                    if (userData.id === item.orderData.userId) {
                      item.user = userData;
                    }
                  });
                  delete item.__v
                  delete item._id
                  delete item.serviceId
                  if (item.orderData && item.orderData != "") {
                    dataToSend.push(item);
                  }
                });

                return res.send({
                  data: dataToSend,
                });
              }
            );
          } else {
            return res.send({
              data: [],
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            message: "Internal Server Error.",
          });
        });
    } else if (orderStatusType === "past") {
      orderWhere.action = {
        $in: [
          "order_completed",
          "rejected",
        ],
      };
      orderHistory.find(orderWhere, {}, {
        ...pagination,
      })
        .then(async (orderData) => {
          if (orderData && orderData.length) {
            let userIds = [];
            orderData.map((item) => {
              console.log(item.orderData.userId)
              if (!userIds.includes(item.orderData.userId)) {
                userIds.push(item.orderData.userId);
              }
            });
            rpcClient.UserService.GetUsers(
              { ids: userIds },
              function (err, response) {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    message: "Unable to get riders this time.",
                  });
                }

                if (!response || !response.data) {
                  sequelizeTransaction.rollback();
                  return res.status(500).send({
                    message: "Unable to get riders this time.",
                  });
                }
                let users = JSON.parse(response.data);
                console.log(users)
                let dataToSend = [];
                orderData.map((item) => {
                  item = item.toJSON();
                  users.map((userData) => {
                    if (userData.id === item.orderData.userId) {
                      item.user = userData;
                    }
                  });
                  item.status = item.action === "order_completed" ? "completed" : item.action
                  delete item.__v
                  delete item._id
                  delete item.serviceId
                  if (item.orderData && item.orderData != "") {
                    dataToSend.push(item);
                  }
                });

                return res.send({
                  data: dataToSend,
                });
              }
            );
          } else {
            return res.send({
              data: [],
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            message: "Internal Server Error.",
          });
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error.",
    });
  }
};

exports.getOne = async function (req, res) {
  let userId = req.user.id;
  let id = req.params.id;
  let orderWhere = { riderId: userId, orderId: id }
  order.findOne(orderWhere)
    .then(async (orderData) => {
      if (orderData) {
        orderData = orderData.toJSON()
        let userIds = [orderData.orderData.userId, orderData.orderData.restaurant.userId];
        rpcClient.UserService.GetUsers(
          { ids: userIds },
          function (err, response) {
            if (err) {
              console.log(err);
              return res.status(500).send({
                message: "Unable to get riders this time.",
              });
            }

            if (!response || !response.data) {
              sequelizeTransaction.rollback();
              return res.status(500).send({
                message: "Unable to get riders this time.",
              });
            }
            let users = JSON.parse(response.data);
            users.map((userData) => {

              delete userData.roles
              delete userData.parentId
              delete userData.bank_account
              delete userData.user_addresses

              if (userData.id === orderData.orderData.userId) {
                orderData.user = userData;
              }
              if (userData.id === orderData.orderData.restaurant.userId) {
                orderData.restaurantUser = userData;
              }

            })
            delete orderData.__v
            delete orderData._id
            delete orderData.serviceId

            return res.send({
              data: orderData,
            });
          }
        );
      } else {
        return res.send({
          data: {},
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "Internal Server Error.",
      });
    });
};

exports.update = async function (req, res) {
  let userId = req.user.id;
  let id = req.body.id;
  let action = req.body.action;
  let rejectionReason = req.body.rejectionReason;
  let image = req.body.image;

  let loggedInRiderData = await rider.findOne({ riderId: userId })

  if (!loggedInRiderData) {
    return res.status(400).send({
      message: "Error: Unauthorized Access.",
    });
  }

  // let ageRestrictedPhotoId = req.body.ageRestrictedPhotoId;

  // let deliveryTime = req.body.deliveryTime;
  // console.log(userId)
  // let orderStatusWhere = { slug: "confirmed" }
  order.findOne({
    orderId: id,
    riderId: userId,
    status: { $nin: ["completed", "cancelled"] }
  }).then(async (orderData) => {
    if (orderData) {
      let userIds = [orderData.orderData.userId];
      rpcClient.UserService.GetUsers(
        { ids: userIds },
        async function (err, response) {
          if (err) {
            console.log(err);
            return res.status(500).send({
              message: "Unable to get riders this time.",
            });
          }

          if (!response || !response.data) {
            sequelizeTransaction.rollback();
            return res.status(500).send({
              message: "Unable to get riders this time.",
            });
          }

          let users = JSON.parse(response.data);
          let currentUserData = null
          users.map((userData) => {
            if (userData.id === orderData.orderData.userId) {
              currentUserData = userData;
            }
          })

          let where = {};
          let historyObject = {
            orderId: orderData.orderId,
            orderData: orderData.orderData,
            riderId: orderData.riderId
          };
          let restaurantDetails = orderData.orderData.restaurant
          if (action === "accepted") {
            if (orderData.status === "new") {
              historyObject.action = "accepted";
              orderData.status = "accepted";
            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }

            rpcClient.riderRPC.updateAcceptedStatusOfOrder({
              orderId: orderData.orderId
            }, (err, response) => {
              console.log(err, response)
            })

          } else if (action === "declined") {
            if (rejectionReason) {
              historyObject.orderData.rejectionReason = rejectionReason
            }

            if (orderData.status === "new") {
              historyObject.action = "rejected";
            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }

            rider.updateOne({ riderId: orderData.riderId }, { isOccupied: false }, function (err, docs) {
              if (err) {
                console.log(err)
              }
              else {
                console.log("Updated Docs : ", docs);
              }
            })
            let data = {
              longitude: orderData.orderData.restaurant.longitude,
              latitude: orderData.orderData.restaurant.latitude,
              userId: orderData.riderId
            }
            let newRider = await getAvailableRider(data)
            if (newRider.status) {
              orderData.riderId = newRider.userId
              rpcClient.riderRPC.updateRiderOfOrder({
                riderId: orderData.riderId,
                orderId: orderData.orderId
              }, (err, response) => {
                console.log(err, response)
              })
            } else {

              rpcClient.riderRPC.updateOrderStatusByRIder({
                status: "cancelled_by_rider",
                riderId: orderData.riderId,
                orderId: orderData.orderId,
                extraDetail: JSON.stringify({ message: "Order Cancelled by rider." })
              }, (err, response) => {
                console.log(response)
              })
              orderData.status = "cancelled"
            }
          } else if (action === "arrived_restaurant") {

            let distance = await general_helper.getDistanceFromLatLonInKm(restaurantDetails.latitude, restaurantDetails.longitude, loggedInRiderData.latitude, loggedInRiderData.longitude)
            let distanceInMeters = distance * 1609.344
            if (distanceInMeters >= 5000) {
              return res.status(400).send({
                message: "Error: You must be in 100 meter range from restaurant to mark order as arrived at restaurant. ",
              });
            }
            if (orderData.status === "accepted" || orderData.status === "ready_for_delivery") {
              orderData.status = "arrived_restaurant";
              historyObject.action = "arrived_restaurant";
              // await sendNotification()
            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }

            let notificationData = {
              userId: orderData.orderData.restaurant.userId,
              title: "Order update.",
              body: "Rider is arrived at your location. Click to check.",
              data: {
                action: "rider_arrived_at_restaurant",
                data: { id: orderData.orderData.id },
              },
            };
            sendNotification(notificationData)

          } else if (action === "picked") {
            let distance = await general_helper.getDistanceFromLatLonInKm(restaurantDetails.latitude, restaurantDetails.longitude, loggedInRiderData.latitude, loggedInRiderData.longitude)
            let distanceInMeters = distance * 1609.344
            if (distanceInMeters >= 5000) {
              return res.status(400).send({
                message: "Error: You must be in 100 meter range from restaurant to mark order as picked. ",
              });
            }
            if (orderData.status === "arrived_restaurant" || orderData.status === "ready_for_delivery") {
              orderData.status = "picked";
              historyObject.action = "picked";
              // await sendNotification()
            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }
            rpcClient.riderRPC.updateOrderStatusByRIder({
              status: "picked",
              riderId: orderData.riderId,
              orderId: orderData.orderId
            }, (err, response) => {
              console.log(err, response)
            })

          } else if (action === "arrived_customer") {
            let distance = await general_helper.getDistanceFromLatLonInKm(loggedInRiderData.latitude, loggedInRiderData.longitude, orderData.orderData.orderSummary.lat, orderData.orderData.orderSummary.long)
            let distanceInMeters = distance * 1609.344
            console.log("distanceInMeters", distanceInMeters)
            if (distanceInMeters >= 5000) {
              return res.status(400).send({
                message: "Error: You must be in 100 meter range from restaurant to mark order as arrived at restaurant. ",
              });
            }
            if (orderData.status === "picked") {
              orderData.status = "arrived_customer";
              historyObject.action = "arrived_customer";
              // await sendNotification()
            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }

            let notificationData = {
              userId: orderData.orderData.userId,
              title: "Order update.",
              body: "Rider is arrived at your location. Click to check.",
              data: {
                action: "rider_arrived_at_customer",
                data: { id: orderData.orderData.id },
              },
            };
            sendNotification(notificationData)

          } else if (action === "completed") { 
            let distance = await general_helper.getDistanceFromLatLonInKm(loggedInRiderData.latitude, loggedInRiderData.longitude, orderData.orderData.orderSummary.lat, orderData.orderData.orderSummary.long)
            let distanceInMeters = distance * 1609.344
            if (distanceInMeters >= 5000) {
              return res.status(400).send({
                message: "Error: You must be in 100 meter range from restaurant to mark order as arrived at restaurant. ",
              });
            }
            if (
              orderData.status === "arrived_customer"
            ) {
              notificationAction = "completed";
              historyObject.action = "order_completed";
              orderData.status = "completed"



            } else {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }

            if (orderData.orderData.isContactLessDelivery == 'true' || orderData.orderData.isContactLessDelivery == true) {
              if (!image) {
                return res.status(400).send({
                  message: "Food photo required in contact less delivery.",
                });
              }
              else {
                orderData.orderData.orderSummary.foodImage = image
              }
            }
            else if (orderData.orderData.orderSummary.cart_products.find(a => a.productData?.ageRestrictedItem == 'true' || a.productData?.ageRestrictedItem == true)) {
              if (!image) {
                return res.status(400).send({
                  message: "Consumer photo id required in restricted products.",
                });
              }
              else {
                orderData.orderData.orderSummary.ageRestrictedPhotoId = image
              }
            }

            rpcClient.riderRPC.updateOrderStatusByRIder({
              status: "completed",
              riderId: orderData.riderId,
              orderId: orderData.orderId,
              extraDetail: '',
              image: image ? image : '',
            }, (err, response) => {
              if (err) console.log(err)
              else {
                console.log(response)
              }
              rider.updateOne({ riderId: orderData.riderId }, { isOccupied: false }, (err, updatedRecord) => {
                if (err) {
                  console.log(err)
                }
                else {
                  console.log("Updated Docs : ", updatedRecord);
                }
              })
            })
            rpcClient.ChatRPC.deactivateConversation({
              orderId: orderData.orderId
            }, (err, response) => {
              console.log(err, response)
            })

            let rewardPointData = {
              restaurantName: orderData.orderData.restaurant.name,
              number: orderData.orderData.orderId,
            }

            rpcClient.UserService.UpdateUserRewardPoints({
              userId: Number(orderData.orderData.userId),
              relevantId: orderData.orderData.id,
              type: 'order',
              points: orderData.orderData.orderSummary.total,
              data: JSON.stringify(rewardPointData)
            }, (err, response) => {
              if (err) console.log('rewardPointRpcError', err)
              console.log('rewardPointsRpcResponse', response)
            })

          } else if (action === "cancelled") {
            if (orderData.status == "new") {
              return res.status(400).send({
                message: "Unable to update order status.",
              });
            }
            notificationAction = "cancelled";
            historyObject.action = "order_cancelled";
            orderData.status = "cancelled"

            rpcClient.riderRPC.updateOrderStatusByRIder({
              status: "cancelled_by_system",
              riderId: orderData.riderId,
              orderId: orderData.orderId,
              extraDetail: JSON.stringify({ message: "Order Cancelled by rider." })
            }, (err, response) => {
              rider.updateOne({ riderId: orderData.riderId }, { isOccupied: false }, (err, updatedRecord) => {
                if (err) {
                  console.log(err)
                }
                else {
                  console.log("Updated Docs : ", updatedRecord);
                }
              })
            })
            rpcClient.ChatRPC.deactivateConversation({
              orderId: orderData.orderId
            }, (err, response) => {
              console.log(err, response)
            })

          } else {
            return res.status(400).send({
              message: "Error: Action not allowed",
            });
          }

          await saveOrderHistory(historyObject);
          orderData.orderData = { ...orderData.orderData }
          await order.updateOne({ orderId: orderData.orderId }, { status: orderData.status, riderId: orderData.riderId, orderData: orderData.orderData }, (Updated) => {
            console.log(Updated);
          })
          let jsonData = orderData.toJSON()

          if (currentUserData) {
            jsonData.user = currentUserData
          }
          return res.send({
            message: `Order has been marked as ${action}`,
            data: jsonData
          });
        })

    } else {
      return res.status(400).send({
        message: "Unable to update order status.",
      });
    }
  })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "Internal Server Error.",
      });
    });
};