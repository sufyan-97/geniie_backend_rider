/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const OrderSchema = new Schema({

    riderId: {
        type: Number,
        default: null
    },
    orderId: {
        type: Number,
        default: null
    },
    serviceId: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        default: null
    },
    orderData: {
        type: Object,
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

OrderSchema.method({});

/**
 * Statics
 */

OrderSchema.static({});

/**
 * Register
 */

exports.order = mongoose.model('orders', OrderSchema);

