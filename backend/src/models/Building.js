'use strict';

const { Schema, model } = require('mongoose');

/**
 * A building (or any point of interest) that a student can pick as a start or
 * destination. Each building is attached to exactly one node on the walkway
 * network via `nearestNode` — that is the hand-off point between "a place" and
 * "a point on the path network".
 */
const buildingSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Building name is required'],
      // Uniqueness is enforced by the case-insensitive index declared below.
      trim: true,
      maxlength: [120, 'Building name must be 120 characters or fewer'],
    },
    nearestNode: {
      type: String,
      required: [true, 'nearestNode is required'],
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ['academic', 'administrative', 'residential', 'amenity', 'landmark', 'sports', 'parking'],
      default: 'academic',
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be 500 characters or fewer'],
    },
    // Search aliases, e.g. "Admin" for "ADMIN - BUILDING".
    aliases: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    floors: {
      type: Number,
      default: 1,
      min: [1, 'floors must be at least 1'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'buildings',
  }
);

// Case-insensitive uniqueness so "Main Gate" and "main gate" cannot coexist.
buildingSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// Supports the autocomplete endpoint.
buildingSchema.index({ nearestNode: 1 });

module.exports = model('Building', buildingSchema);
