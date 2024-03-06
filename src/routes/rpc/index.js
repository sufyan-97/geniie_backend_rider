// Libraries
const path = require('path');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

// Constants
const constants = require('../../../config/constants')

// RPC
const riderAppRpc = require("../../app//Controllers/rpc/app.rpc")

// Controllers
const locationController = require("../../app/Controllers/location.controller");
const riderController = require("../../app/Controllers/rider.controller");

// Proto Files
var RIDER_LOCATION_PROTO_PATH = path.join(__dirname, '../../protos/riderLocation.proto');
var RIDER_RPC_PROTO_PATH = path.join(__dirname, '../../protos/rider.proto');

// Definitions
const riderAppDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/riderApp.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});


var riderLocationPackageDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/riderLocation.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

var riderRpcPackageDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/rider.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});


// Load Services
const riderAppPackage = grpc.loadPackageDefinition(riderAppDefinition);
// var locationProto = grpc.loadPackageDefinition(locationPackageDefinition);
const riderLocationProto = grpc.loadPackageDefinition(riderLocationPackageDefinition);
const riderRpcProto = grpc.loadPackageDefinition(riderRpcPackageDefinition);


// Create Server
const server = new grpc.Server();

server.bindAsync(`${constants.RPC_HOST}:${constants.RPC_PORT}`, grpc.ServerCredentials.createInsecure(), function (error) {
    if (error) {
        console.log(error);
        return process.exit(1)
    }

    console.log(`RPC-server is listening on port: ${constants.RPC_HOST}:${constants.RPC_PORT}`);

    server.addService(riderAppPackage.RiderAppService.service, {
        saveLanguageStrings: riderAppRpc.saveLanguageStrings,
        getServiceInfo: riderAppRpc.getServiceInfo,
    });

    // Location Services
    // server.addService(locationProto.locationRPC.service, {
    //     SendLocation: locationController.getOne
    // })

    // Rider Location Services
    server.addService(riderLocationProto.RiderLocationService.service, {
        GetRiderWithLocation: locationController.getOne
    })

    server.addService(riderRpcProto.riderRPC.service, {
        AddUser: riderController.createRider,
        updateOnlineStatus: riderController.updateOnlineStatus,
        getAvailableRider: riderController.getAvailableRider,
        updateRiderOccupyStatus: riderController.updateRiderOccupyStatus,
        updateOrderStatus: riderController.updateOrderStatus,
        updateRiderLocation: riderController.updateRiderLocation,
        GetRiderLocation: riderController.GetRiderLocation,
        UpdateConsumerDeliveryAddress: riderController.UpdateConsumerDeliveryAddress,
        assignOrderToRider: riderController.assignOrderToRider,
        isRiderHaveActiveOrder: riderController.isRiderHaveActiveOrder,
    })

    // Start Server
    server.start();
});
