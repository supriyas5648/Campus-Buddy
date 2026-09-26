/**
 * Floor SVG asset mappings and metadata.
 */
export const BUILDING_FLOOR_MAP = {
  'I-building': {
    id: 'I-building',
    label: 'Building I',
    buildingCode: 'I',
    defaultDestination: 'I-201',
    floors: {
      1: {
        label: 'Floor 1',
        asset: '/floor-maps/i-floor-1.svg',
        level: 1,
        stairNodeId: 'N010',
      },
      2: {
        label: 'Floor 2',
        asset: '/floor-maps/i-floor-2.svg',
        level: 2,
        stairNodeId: 'N020',
      },
      3: {
        label: 'Floor 3',
        asset: '/floor-maps/i-floor-3.svg',
        level: 3,
        stairNodeId: 'N030',
      },
    },
  },
};

BUILDING_FLOOR_MAP['I'] = BUILDING_FLOOR_MAP['I-building'];
BUILDING_FLOOR_MAP['I - Building'] = BUILDING_FLOOR_MAP['I-building'];

/**
 * Master Navigation Graph for Building I across all 3 floors.
 * N010 is the MAIN STARTING NODE near the stairs on Floor 1.
 * N020 is the stair transition node on Floor 2.
 * N030 is the stair transition node on Floor 3.
 */
export const INDOOR_NODES = {
  // --- Floor 1 Nodes ---
  N010: { id: 'N010', floor: 1, x: 307, y: 32, label: 'Floor 1 Stairs Connection', neighbors: ['N016', 'N020'] },
  N016: { id: 'N016', floor: 1, x: 300, y: 220, label: 'Floor 1 Main Hallway', neighbors: ['N010', 'N012', 'N014'] },
  N012: { id: 'N012', floor: 1, x: 167, y: 220, label: 'Floor 1 West Junction', neighbors: ['N016', 'N011'] },
  N011: { id: 'N011', floor: 1, x: 139, y: 298, label: 'Floor 1 West Corridor (I102)', neighbors: ['N012', 'N013'] },
  N013: { id: 'N013', floor: 1, x: 153, y: 342, label: 'Floor 1 West Corridor (I101)', neighbors: ['N011'] },
  N014: { id: 'N014', floor: 1, x: 631, y: 215, label: 'Floor 1 East Corridor (I104)', neighbors: ['N016', 'N015'] },
  N015: { id: 'N015', floor: 1, x: 631, y: 265, label: 'Floor 1 East Corridor (I105)', neighbors: ['N014'] },

  // --- Floor 2 Nodes ---
  N020: { id: 'N020', floor: 2, x: 307, y: 32, label: 'Floor 2 Stairs Connection', neighbors: ['N010', 'N026', 'N030'] },
  N026: { id: 'N026', floor: 2, x: 300, y: 220, label: 'Floor 2 Main Hallway', neighbors: ['N020', 'N022', 'N024'] },
  N022: { id: 'N022', floor: 2, x: 167, y: 220, label: 'Floor 2 West Junction', neighbors: ['N026', 'N021'] },
  N021: { id: 'N021', floor: 2, x: 139, y: 298, label: 'Floor 2 West Corridor (I202)', neighbors: ['N022', 'N023'] },
  N023: { id: 'N023', floor: 2, x: 153, y: 342, label: 'Floor 2 West Corridor (I201)', neighbors: ['N021'] },
  N024: { id: 'N024', floor: 2, x: 631, y: 215, label: 'Floor 2 East Corridor (I204)', neighbors: ['N026', 'N025'] },
  N025: { id: 'N025', floor: 2, x: 631, y: 265, label: 'Floor 2 East Corridor (I205)', neighbors: ['N024'] },

  // --- Floor 3 Nodes ---
  N030: { id: 'N030', floor: 3, x: 307, y: 32, label: 'Floor 3 Stairs Connection', neighbors: ['N020', 'N036'] },
  N036: { id: 'N036', floor: 3, x: 300, y: 220, label: 'Floor 3 Main Hallway', neighbors: ['N030', 'N032', 'N034'] },
  N032: { id: 'N032', floor: 3, x: 167, y: 220, label: 'Floor 3 West Junction', neighbors: ['N036', 'N031'] },
  N031: { id: 'N031', floor: 3, x: 139, y: 298, label: 'Floor 3 West Corridor (I302)', neighbors: ['N032', 'N033'] },
  N033: { id: 'N033', floor: 3, x: 153, y: 342, label: 'Floor 3 West Corridor (I301)', neighbors: ['N031'] },
  N034: { id: 'N034', floor: 3, x: 631, y: 215, label: 'Floor 3 East Corridor (I304)', neighbors: ['N036', 'N035'] },
  N035: { id: 'N035', floor: 3, x: 631, y: 265, label: 'Floor 3 East Corridor (I305)', neighbors: ['N034'] },
};

/**
 * Mapping of room identifiers to their floor, access node, and visual center point.
 */
export const ROOM_MAPPING = {
  // Floor 1 Rooms
  'I-101': { room: 'I-101', code: 'I101', floor: 1, accessNode: 'N013', center: { x: 82, y: 428 } },
  'I101': { room: 'I-101', code: 'I101', floor: 1, accessNode: 'N013', center: { x: 82, y: 428 } },
  'I-102': { room: 'I-102', code: 'I102', floor: 1, accessNode: 'N011', center: { x: 57, y: 282 } },
  'I102': { room: 'I-102', code: 'I102', floor: 1, accessNode: 'N011', center: { x: 57, y: 282 } },
  'I-103': { room: 'I-103', code: 'I103', floor: 1, accessNode: 'N012', center: { x: 106, y: 103 } },
  'I103': { room: 'I-103', code: 'I103', floor: 1, accessNode: 'N012', center: { x: 106, y: 103 } },
  'I-104': { room: 'I-104', code: 'I104', floor: 1, accessNode: 'N014', center: { x: 721, y: 103 } },
  'I104': { room: 'I-104', code: 'I104', floor: 1, accessNode: 'N014', center: { x: 721, y: 103 } },
  'I-105': { room: 'I-105', code: 'I105', floor: 1, accessNode: 'N015', center: { x: 721, y: 388 } },
  'I105': { room: 'I-105', code: 'I105', floor: 1, accessNode: 'N015', center: { x: 721, y: 388 } },

  // Floor 2 Rooms
  'I-201': { room: 'I-201', code: 'I201', floor: 2, accessNode: 'N023', center: { x: 82, y: 428 } },
  'I201': { room: 'I-201', code: 'I201', floor: 2, accessNode: 'N023', center: { x: 82, y: 428 } },
  'I-202': { room: 'I-202', code: 'I202', floor: 2, accessNode: 'N021', center: { x: 57, y: 282 } },
  'I202': { room: 'I-202', code: 'I202', floor: 2, accessNode: 'N021', center: { x: 57, y: 282 } },
  'I-203': { room: 'I-203', code: 'I203', floor: 2, accessNode: 'N022', center: { x: 106, y: 103 } },
  'I203': { room: 'I-203', code: 'I203', floor: 2, accessNode: 'N022', center: { x: 106, y: 103 } },
  'I-204': { room: 'I-204', code: 'I204', floor: 2, accessNode: 'N024', center: { x: 721, y: 103 } },
  'I204': { room: 'I-204', code: 'I204', floor: 2, accessNode: 'N024', center: { x: 721, y: 103 } },
  'I-205': { room: 'I-205', code: 'I205', floor: 2, accessNode: 'N025', center: { x: 721, y: 388 } },
  'I205': { room: 'I-205', code: 'I205', floor: 2, accessNode: 'N025', center: { x: 721, y: 388 } },

  // Floor 3 Rooms
  'I-301': { room: 'I-301', code: 'I301', floor: 3, accessNode: 'N033', center: { x: 82, y: 428 } },
  'I301': { room: 'I-301', code: 'I301', floor: 3, accessNode: 'N033', center: { x: 82, y: 428 } },
  'I-302': { room: 'I-302', code: 'I302', floor: 3, accessNode: 'N031', center: { x: 57, y: 282 } },
  'I302': { room: 'I-302', code: 'I302', floor: 3, accessNode: 'N031', center: { x: 57, y: 282 } },
  'I-303': { room: 'I-303', code: 'I303', floor: 3, accessNode: 'N032', center: { x: 106, y: 103 } },
  'I303': { room: 'I-303', code: 'I303', floor: 3, accessNode: 'N032', center: { x: 106, y: 103 } },
  'I-304': { room: 'I-304', code: 'I304', floor: 3, accessNode: 'N034', center: { x: 721, y: 103 } },
  'I304': { room: 'I-304', code: 'I304', floor: 3, accessNode: 'N034', center: { x: 721, y: 103 } },
  'I-305': { room: 'I-305', code: 'I305', floor: 3, accessNode: 'N035', center: { x: 721, y: 388 } },
  'I305': { room: 'I-305', code: 'I305', floor: 3, accessNode: 'N035', center: { x: 721, y: 388 } },
};

/**
 * Finds shortest walkable path between two nodes in INDOOR_NODES using BFS.
 */
export function findShortestPath(startNodeId, endNodeId) {
  if (!INDOOR_NODES[startNodeId] || !INDOOR_NODES[endNodeId]) {
    return null;
  }

  if (startNodeId === endNodeId) {
    return [startNodeId];
  }

  const queue = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const currentNode = currentPath[currentPath.length - 1];

    const neighbors = INDOOR_NODES[currentNode]?.neighbors || [];
    for (const neighbor of neighbors) {
      if (neighbor === endNodeId) {
        return [...currentPath, neighbor];
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...currentPath, neighbor]);
      }
    }
  }

  return null;
}

/**
 * Computes a multi-floor indoor route starting from N010 (main stair node on Floor 1)
 * to the specified target room.
 *
 * @param {string} rawRoomInput Room code (e.g. 'I-201', 'I201', 'I-301')
 * @param {string} startNodeId Default starting node 'N010'
 */
export function calculateIndoorNavigation(rawRoomInput, startNodeId = 'N010') {
  const normalizedKey = rawRoomInput ? rawRoomInput.trim().toUpperCase() : 'I-201';
  const roomData = ROOM_MAPPING[normalizedKey];

  if (!roomData) {
    return null;
  }

  const destinationNodeId = roomData.accessNode;
  const targetFloor = roomData.floor;

  // Compute node path from startNodeId (N010) to room's accessNode
  const fullPath = findShortestPath(startNodeId, destinationNodeId);
  if (!fullPath) {
    return null;
  }

  // Segment the path by floor
  const floorSegments = { 1: [], 2: [], 3: [] };
  const stairsTransitions = [];

  for (let i = 0; i < fullPath.length; i++) {
    const nodeId = fullPath[i];
    const nodeObj = INDOOR_NODES[nodeId];
    if (nodeObj) {
      floorSegments[nodeObj.floor].push(nodeObj);
    }

    if (i < fullPath.length - 1) {
      const nextNodeId = fullPath[i + 1];
      const nextNodeObj = INDOOR_NODES[nextNodeId];
      if (nodeObj && nextNodeObj && nodeObj.floor !== nextNodeObj.floor) {
        stairsTransitions.push({
          fromFloor: nodeObj.floor,
          toFloor: nextNodeObj.floor,
          fromNode: nodeId,
          toNode: nextNodeId,
        });
      }
    }
  }

  return {
    startNodeId,
    targetRoom: roomData.room,
    roomCode: roomData.code,
    targetFloor,
    roomCenter: roomData.center,
    fullPath,
    floorSegments,
    stairsTransitions,
  };
}
