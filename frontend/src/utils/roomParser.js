/**
 * Validates and parses a room destination string.
 *
 * Expected format:
 * - First character: Building letter (e.g. 'I')
 * - Hyphen '-'
 * - First digit after hyphen: Floor number (e.g. 1, 2, 3)
 * - Remaining digits: Room number (e.g. 01 -> 201)
 *
 * Example:
 * "I-201" -> { building: "I", floor: 2, room: "I-201", roomCode: "I201", roomNumber: "201" }
 * "i-301" -> { building: "I", floor: 3, room: "I-301", roomCode: "I301", roomNumber: "301" }
 */
export function validateRoomInput(rawValue) {
  if (typeof rawValue !== 'string') {
    return {
      valid: false,
      error: 'Please enter a valid text input.',
    };
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Please enter a room destination (e.g. I-201 or I-301).',
    };
  }

  // Must contain hyphen separating building and room digits
  if (!trimmed.includes('-')) {
    return {
      valid: false,
      error: `Invalid format "${trimmed}". Room numbers must include a hyphen (e.g. I-201).`,
    };
  }

  // Check general pattern: [Letter]-[Digit][Digits]
  const match = trimmed.match(/^([a-zA-Z])-(\d)(\d+)$/);
  if (!match) {
    return {
      valid: false,
      error: `Invalid room code "${trimmed}". Expected format: Building-FloorRoom (e.g. I-101, I-201, I-301).`,
    };
  }

  const building = match[1].toUpperCase();
  const floor = Number(match[2]);
  const roomDigits = match[3];
  const roomNumber = `${match[2]}${roomDigits}`;

  // Check valid floor range (floors 1-3)
  if (floor < 1 || floor > 3) {
    return {
      valid: false,
      error: `Floor ${floor} is not available in Building ${building}. Valid floors are 1, 2, and 3.`,
    };
  }

  return {
    valid: true,
    building,
    floor,
    room: `${building}-${roomNumber}`,
    roomCode: `${building}${roomNumber}`,
    roomNumber,
  };
}

/**
 * Convenience parser returning parsed object or null on failure.
 *
 * @param {string} rawValue
 * @returns {{ building: string, floor: number, room: string, roomCode: string, roomNumber: string } | null}
 */
export function parseRoomInput(rawValue) {
  const result = validateRoomInput(rawValue);
  if (!result.valid) {
    return null;
  }

  return {
    building: result.building,
    floor: result.floor,
    room: result.room,
    roomCode: result.roomCode,
    roomNumber: result.roomNumber,
  };
}
