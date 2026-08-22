'use strict';

/**
 * ---------------------------------------------------------------------------
 * CampusBuddy — campus reference data
 * ---------------------------------------------------------------------------
 * This file is the single source of truth for the seed script. Everything here
 * is plain hand-authored data: waypoints traced onto the walkways of
 * `frontend/public/campus-map2.svg`, the buildings that hang off those
 * waypoints, and the PREDEFINED routes between them.
 *
 * Coordinates are in the SVG's own coordinate space: viewBox "0 0 2483 1621".
 * (0,0) is the top-left corner of the map image.
 *
 * NOTE ON ROUTES: no shortest-path algorithm exists in this project. Each route
 * below was drawn by hand along the visible roads. The API only ever performs
 * a `findOne({ startNode, endNode })` lookup.
 */

// ---------------------------------------------------------------------------
// 1. NODES — waypoints on the walkway network
// ---------------------------------------------------------------------------
const nodes = [
  // --- Main north road (runs west to east across the top of the campus) ---
  { nodeId: 'N1', x: 74, y: 50, label: 'Main Gate' },
  { nodeId: 'N2', x: 348, y: 50, label: 'West junction' },
  { nodeId: 'N3', x: 745, y: 50, label: 'North walkway' },
  { nodeId: 'N4', x: 1074, y: 50, label: 'Circle' },
  { nodeId: 'N5', x: 1353, y: 50, label: 'Admin north junction' },
  { nodeId: 'N6', x: 1701, y: 50, label: 'East junction' },

  // --- West road (runs south from N2, past the parking lots and Ayurveda) ---
  { nodeId: 'N7', x: 348, y: 149, label: 'Car parking access' },
  { nodeId: 'N8', x: 348, y: 236, label: 'Two-wheeler parking access' },
  { nodeId: 'N9', x: 348, y: 469, label: 'Ayurveda Building access' },
  { nodeId: 'N10', x: 348, y: 621, label: 'West road south end' },

  // --- Mid road (runs east from N9, in front of H and I blocks) ---
  { nodeId: 'N11', x: 637, y: 469, label: 'H Building entrance' },
  { nodeId: 'N12', x: 898, y: 469, label: 'I Building entrance' },
  { nodeId: 'N13', x: 1074, y: 469, label: 'Central junction' },

  // --- Central road (runs south from the Circle, beside the main garden) ---
  { nodeId: 'N14', x: 1074, y: 248, label: 'Central Garden access' },
  { nodeId: 'N15', x: 1074, y: 695, label: 'Central road south end' },

  // --- Admin branch (runs south from N5 to the Admin Building entrance) ---
  { nodeId: 'N16', x: 1353, y: 224, label: 'Admin approach' },
  { nodeId: 'N17', x: 1353, y: 420, label: 'Admin forecourt' },
  { nodeId: 'N18', x: 1510, y: 420, label: 'Admin Building entrance' },

  // --- East road (runs south from N6, through the eastern academic zone) ---
  { nodeId: 'N19', x: 1697, y: 435, label: 'East road north' },
  { nodeId: 'N20', x: 1697, y: 583, label: 'Plantation walk' },
  { nodeId: 'N21', x: 1697, y: 757, label: 'East road south' },
  { nodeId: 'N22', x: 1697, y: 925, label: 'C Building access' },

  // --- Lake road (runs east from N19 towards the lake) ---
  { nodeId: 'N23', x: 1900, y: 403, label: 'Lake approach' },
  { nodeId: 'N24', x: 2111, y: 403, label: 'Lake junction' },

  // --- Far-east road (runs south past B Block and the cricket ground) ---
  { nodeId: 'N25', x: 2111, y: 583, label: 'B Building access' },
  { nodeId: 'N26', x: 2111, y: 757, label: 'Cricket Ground gate' },
  { nodeId: 'N27', x: 2111, y: 925, label: 'South-east corner' },
];

// ---------------------------------------------------------------------------
// 2. BUILDINGS — the searchable places, each pinned to one node
// ---------------------------------------------------------------------------
const buildings = [
  {
    name: 'Main Gate',
    nearestNode: 'N1',
    category: 'landmark',
    description: 'Primary entrance to the campus on the west side.',
    aliases: ['Gate', 'Entrance', 'Main Entrance'],
  },
  {
    name: 'Parking',
    nearestNode: 'N7',
    category: 'parking',
    description: 'Four-wheeler parking lot just inside the main gate.',
    aliases: ['Car Parking', 'Four Wheeler Parking'],
  },
  {
    name: '2-Wheeler Parking',
    nearestNode: 'N8',
    category: 'parking',
    description: 'Bike and scooter parking beside the west garden.',
    aliases: ['Bike Parking', 'Two Wheeler Parking', 'Scooter Parking'],
  },
  {
    name: 'Ayurveda Building',
    nearestNode: 'N9',
    category: 'academic',
    description: 'Ayurveda department block on the west edge of the campus.',
    aliases: ['Ayurveda', 'Ayurveda Bhavan'],
  },
  {
    name: 'H - Building',
    nearestNode: 'N11',
    category: 'academic',
    description: 'H academic block, south of the central garden.',
    aliases: ['H Block', 'H'],
  },
  {
    name: 'I - Building',
    nearestNode: 'N12',
    category: 'academic',
    description: 'I academic block, east of the H block.',
    aliases: ['I Block', 'I'],
  },
  {
    name: 'Central Garden',
    nearestNode: 'N14',
    category: 'amenity',
    description: 'The large landscaped garden in the middle of the campus.',
    aliases: ['Garden', 'Main Garden'],
  },
  {
    name: 'Circle',
    nearestNode: 'N4',
    category: 'landmark',
    description: 'The roundabout on the main north road — the campus meeting point.',
    aliases: ['Roundabout', 'Round Circle'],
  },
  {
    name: 'Admin Building',
    nearestNode: 'N18',
    category: 'administrative',
    description: 'Administration block housing the registrar and accounts offices.',
    aliases: ['Admin', 'Administration', 'Office'],
  },
  {
    name: 'B - Building',
    nearestNode: 'N25',
    category: 'academic',
    description: 'B academic block in the eastern zone, next to the cricket ground.',
    aliases: ['B Block', 'B'],
  },
  {
    name: 'Cricket Ground',
    nearestNode: 'N26',
    category: 'sports',
    description: 'Main cricket ground on the eastern side of the campus.',
    aliases: ['Ground', 'Playground', 'Sports Ground'],
  },
  {
    name: 'Lake',
    nearestNode: 'N24',
    category: 'amenity',
    description: 'Campus lake on the north-east boundary.',
    aliases: ['Lake 1', 'Pond'],
  },
  {
    name: 'C - Building',
    nearestNode: 'N22',
    category: 'academic',
    description: 'Southern academic block below the eastern garden.',
    aliases: ['C Block', 'C', 'South Block'],
  },
];

// ---------------------------------------------------------------------------
// 3. ROUTES — every predefined walking route, authored by hand
// ---------------------------------------------------------------------------
// Written as compact "N1 N2 N3" strings for readability, expanded to arrays
// below. The seeder additionally stores the reverse of each route so that
// navigation works in both directions (reversing a stored array is not path
// finding — it is the same road walked the other way).
const routePaths = [
  // ---- from N1 (Main Gate) -------------------------------------------------
  'N1 N2 N7',
  'N1 N2 N7 N8',
  'N1 N2 N7 N8 N9',
  'N1 N2 N7 N8 N9 N11',
  'N1 N2 N7 N8 N9 N11 N12',
  'N1 N2 N3 N4',
  'N1 N2 N3 N4 N14',
  'N1 N2 N3 N4 N5 N16 N17 N18',
  'N1 N2 N3 N4 N5 N6 N19 N23 N24',
  'N1 N2 N3 N4 N5 N6 N19 N23 N24 N25',
  'N1 N2 N3 N4 N5 N6 N19 N20 N21 N26',
  'N1 N2 N3 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N7 (Parking) ---------------------------------------------------
  'N7 N8',
  'N7 N8 N9',
  'N7 N8 N9 N11',
  'N7 N8 N9 N11 N12',
  'N7 N2 N3 N4',
  'N7 N2 N3 N4 N14',
  'N7 N2 N3 N4 N5 N16 N17 N18',
  'N7 N2 N3 N4 N5 N6 N19 N23 N24',
  'N7 N2 N3 N4 N5 N6 N19 N23 N24 N25',
  'N7 N2 N3 N4 N5 N6 N19 N20 N21 N26',
  'N7 N2 N3 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N8 (2-Wheeler Parking) ----------------------------------------
  'N8 N9',
  'N8 N9 N11',
  'N8 N9 N11 N12',
  'N8 N7 N2 N3 N4',
  'N8 N7 N2 N3 N4 N14',
  'N8 N7 N2 N3 N4 N5 N16 N17 N18',
  'N8 N7 N2 N3 N4 N5 N6 N19 N23 N24',
  'N8 N7 N2 N3 N4 N5 N6 N19 N23 N24 N25',
  'N8 N7 N2 N3 N4 N5 N6 N19 N20 N21 N26',
  'N8 N7 N2 N3 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N9 (Ayurveda Building) ----------------------------------------
  'N9 N11',
  'N9 N11 N12',
  'N9 N11 N12 N13 N14',
  'N9 N11 N12 N13 N14 N4',
  'N9 N11 N12 N13 N14 N4 N5 N16 N17 N18',
  'N9 N11 N12 N13 N14 N4 N5 N6 N19 N23 N24',
  'N9 N11 N12 N13 N14 N4 N5 N6 N19 N23 N24 N25',
  'N9 N11 N12 N13 N14 N4 N5 N6 N19 N20 N21 N26',
  'N9 N11 N12 N13 N14 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N11 (H - Building) --------------------------------------------
  'N11 N12',
  'N11 N12 N13 N14',
  'N11 N12 N13 N14 N4',
  'N11 N12 N13 N14 N4 N5 N16 N17 N18',
  'N11 N12 N13 N14 N4 N5 N6 N19 N23 N24',
  'N11 N12 N13 N14 N4 N5 N6 N19 N23 N24 N25',
  'N11 N12 N13 N14 N4 N5 N6 N19 N20 N21 N26',
  'N11 N12 N13 N14 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N12 (I - Building) --------------------------------------------
  'N12 N13 N14',
  'N12 N13 N14 N4',
  'N12 N13 N14 N4 N5 N16 N17 N18',
  'N12 N13 N14 N4 N5 N6 N19 N23 N24',
  'N12 N13 N14 N4 N5 N6 N19 N23 N24 N25',
  'N12 N13 N14 N4 N5 N6 N19 N20 N21 N26',
  'N12 N13 N14 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N14 (Central Garden) ------------------------------------------
  'N14 N4',
  'N14 N4 N5 N16 N17 N18',
  'N14 N4 N5 N6 N19 N23 N24',
  'N14 N4 N5 N6 N19 N23 N24 N25',
  'N14 N4 N5 N6 N19 N20 N21 N26',
  'N14 N4 N5 N6 N19 N20 N21 N22',

  // ---- from N4 (Circle) ----------------------------------------------------
  'N4 N5 N16 N17 N18',
  'N4 N5 N6 N19 N23 N24',
  'N4 N5 N6 N19 N23 N24 N25',
  'N4 N5 N6 N19 N20 N21 N26',
  'N4 N5 N6 N19 N20 N21 N22',

  // ---- from N18 (Admin Building) ------------------------------------------
  'N18 N17 N16 N5 N6 N19 N23 N24',
  'N18 N17 N16 N5 N6 N19 N23 N24 N25',
  'N18 N17 N16 N5 N6 N19 N20 N21 N26',
  'N18 N17 N16 N5 N6 N19 N20 N21 N22',

  // ---- eastern zone --------------------------------------------------------
  'N24 N25',
  'N24 N23 N19 N20 N21 N22',
  'N25 N26',
  'N25 N26 N21 N22',
  'N26 N25 N24',
  'N26 N21 N22',
];

/**
 * Expands the compact "N1 N2 N3" strings into route documents.
 * @returns {Array<{startNode: string, endNode: string, path: string[]}>}
 */
function buildRouteDocuments() {
  return routePaths.map((spec) => {
    const path = spec.trim().split(/\s+/);
    return {
      startNode: path[0],
      endNode: path[path.length - 1],
      path,
    };
  });
}

module.exports = {
  nodes,
  buildings,
  routePaths,
  buildRouteDocuments,
  /** viewBox of `frontend/public/campus-map2.svg` — coordinates are relative to it. */
  mapViewBox: { width: 2483, height: 1621 },
};
