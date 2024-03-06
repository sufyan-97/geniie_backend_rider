// Libraries
const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');

// Constants
const { RPC_CLIENTS } = require('../../config/constants')

let clients = {}
if (RPC_CLIENTS) {
    for (let i = 0; i < RPC_CLIENTS.length; i++) {
        const rpcClient = RPC_CLIENTS[i];

        console.log("RPC CLIENT SERVICE INFO:", rpcClient.serviceName, rpcClient.host, rpcClient.port);
        // reads proto file and services
        const packageDefinition = loader.loadSync(path.join(__dirname, `../protos/${rpcClient.protoFile}`), {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        //loads services into pkg
        const pkg = grpc.loadPackageDefinition(packageDefinition);

        //create server and assign port for server service
        const pkgClient = new pkg[rpcClient.serviceName](`${rpcClient.host}:${rpcClient.port}`, grpc.credentials.createInsecure());
        clients[rpcClient.serviceName] = pkgClient
    }
}


module.exports = clients