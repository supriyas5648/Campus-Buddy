'use strict';

const { Schema, model } = require('mongoose');

/**
 * A PREDEFINED route between two nodes.
 *
 * IMPORTANT: CampusBuddy performs no path finding at request time. There is no
 * A*, Dijkstra, BFS or DFS anywhere in this codebase. Every walkable route is
 * authored by hand in `src/data/campusData.js`, loaded by the seed script and
 * simply *looked up* here by (startNode, endNode).
 */
const routeSchema = new Schema(
  {
    startNode: {
      type: String,
      required: [true, 'startNode is required'],
      trim: true,
      uppercase: true,
    },
    endNode: {
      type: String,
      required: [true, 'endNode is required'],
      trim: true,
      uppercase: true,
    },
    path: {
      type: [String],
      required: [true, 'path is required'],
      validate: [
        {
          validator: (path) => Array.isArray(path) && path.length >= 2,
          message: 'A route path must contain at least two nodes',
        },
        {
          validator(path) {
            return path[0] === this.startNode && path[path.length - 1] === this.endNode;
          },
          message: 'A route path must begin at startNode and finish at endNode',
        },
      ],
    },
    // Optional walking distance/duration metadata for future turn-by-turn UI.
    distanceMeters: { type: Number, min: 0, default: null },
    estimatedMinutes: { type: Number, min: 0, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'routes',
  }
);

// One stored route per ordered node pair — this is the lookup key.
routeSchema.index({ startNode: 1, endNode: 1 }, { unique: true });

module.exports = model('Route', routeSchema);
