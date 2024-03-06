
const path = require('path');
const config = require('../../config/constants');

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = path.join(__dirname, '../protos/order.proto');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var order_proto = grpc.loadPackageDefinition(packageDefinition).orderService;

var target = `${config.RPC_HOST ? config.RPC_HOST : 'localhost'}:${config.RPC_PORT ? config.RPC_PORT : '50051'}`;
var client = new order_proto.OrderRPC(target,
    grpc.credentials.createInsecure());

module.exports = client;
