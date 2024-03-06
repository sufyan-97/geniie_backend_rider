/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const RiderSchema = new Schema({

    riderId: {
        type: Number,
        default: null
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    },
    isAvailable: {
        type: Boolean,
        default: false
    },

    longitude: {
        type: String,
        default: null
    },

    latitude: {
        type: String,
        default: null
    },

    suspensionTime: {
        type: Date,
        default: null
    },

    suspensionLevel: {
        type: Number,
        default: 0
    },

    suspendedDueToCancellation: {
        type: Boolean,
        default: false
    },
    restaurant_userId: {
        type: Number,
        default: null
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

RiderSchema.method({});

/**
 * Statics
 */

RiderSchema.static({});

/**
 * Register
 */

exports.rider = mongoose.model('riders', RiderSchema);

