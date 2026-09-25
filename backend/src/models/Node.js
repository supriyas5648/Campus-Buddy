'use strict';

const { Schema, model } = require('mongoose');

/**
 * A node is a single waypoint on the campus map, expressed in the coordinate
 * space of the SVG map (viewBox "0 0 2483 1621"). Routes are stored as ordered
 * lists of node ids; the API resolves those ids to the coordinates below.
 */
const nodeSchema = new Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'nodeId is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9_-]+$/, 'nodeId may only contain letters, digits, "-" and "_"'],
    },
    x: {
      type: Number,
      required: [true, 'x coordinate is required'],
      min: [0, 'x must be a positive SVG coordinate'],
    },
    y: {
      type: Number,
      required: [true, 'y coordinate is required'],
      min: [0, 'y must be a positive SVG coordinate'],
    },
    // Optional human friendly label, useful for debugging and future turn-by-turn text.
    label: {
      type: String,
      trim: true,
      default: '',
    },
    neighbors: {
      type: [String],
      default: [],
    },
     isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'nodes',
  }
);

/**
 * Shape returned by the API: `{ id, x, y }` as specified by the navigation
 * contract. Mongo internals never leak to the client.
 */
nodeSchema.methods.toPoint = function toPoint() {
  return { id: this.nodeId, x: this.x, y: this.y };
};

module.exports = model('Node', nodeSchema);
