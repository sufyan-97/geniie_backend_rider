// Libraries

// Helpers
const { sql } = require('../config/database');



// Constants
const Constants = require('../constants/Application');

module.exports = {
    checkSocketVars: () => {
        const socket_helper = require('../routes/sockets');
        console.log(socket_helper.deviceIo)
    },

    sendJobToPanel: function (io, job) {
        console.log("data emitted on panel successfully");

        sendSocketDataToPanel(Constants.SEND_JOB_TO_PANEL, { job: job });

    },
}

function sendSocketDataToDevice(eventName, payload) {
    const { deviceIo } = require('../routes/sockets');
    if (deviceIo) {
        console.log('device socket instance:', eventName)
        deviceIo.local.emit(eventName, payload)
    }
}

function sendSocketDataToPanel(eventName, payload) {
    const { webIo } = require('../routes/sockets');
    if (webIo) {
        console.log('webIo')
        // console.log(webIo.engine)
        // webIo.on('connection', function(socket){
        // console.log(webIo.sockets)
        webIo.local.emit(eventName, payload)
        // })
        // let sockets = webIo.sockets.sockets.client;
        // // console.log(sockets)
    }
}