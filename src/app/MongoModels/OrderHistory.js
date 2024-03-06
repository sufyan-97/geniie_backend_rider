/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const OrderHistorySchema = new Schema({

    riderId: {
        type: Number,
        default: null
    },
    orderId: {
        type: Number,
        default: null
    },

    orderNumber: {
        type: String,
        default: null
    },

    orderData: {
        type: Object,
        default: null
    },

    serviceId: {
        type: String,
        default: null
    },

    action: {
        type: String,
        default: false
    },

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

OrderHistorySchema.method({});

/**
 * Statics
 */

OrderHistorySchema.static({});

/**
 * Register
 */

exports.orderHistory = mongoose.model('order_history', OrderHistorySchema);

