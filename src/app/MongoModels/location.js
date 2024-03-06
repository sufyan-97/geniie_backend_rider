/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const LocationSchema = new Schema({

    riderId: {
        type: String,
        default: null
    },
    longitude: {
        type: String,
        default: null
    },
    latitude: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
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

LocationSchema.method({});

/**
 * Statics
 */

LocationSchema.static({});

/**
 * Register
 */

exports.location = mongoose.model('location', LocationSchema);

