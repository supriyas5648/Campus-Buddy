# CampusBuddy Backend Documentation

## Purpose and Use Case

The backend for CampusBuddy provides the campus navigation API for the Map Buddy module. It exposes building lookup and campus route data so the frontend can:

- show autocomplete building names,
- provide enriched building metadata,
- resolve navigation requests between campus locations,
- and expose raw map nodes for debugging or visualization.

This backend is specifically responsible for the server-side logic, database access, and API contract of the CampusBuddy service. It does not contain frontend UI code.

## Main Backend Responsibilities

- Start the Express server and connect to MongoDB.
- Validate incoming navigation requests.
- Retrieve building names and rich building details.
- Resolve navigation from one building to another via predefined campus routes.
- Return node coordinate data for campus map rendering.
- Handle errors consistently and apply security middleware.

## Key Files

- `server.js`
  - Application entry point.
  - Connects to MongoDB, starts the HTTP server, and registers graceful shutdown.

- `src/app.js`
  - Builds the Express application.
  - Configures middleware: CORS, helmet, compression, JSON body parsing, logging, rate limiting.
  - Registers API routes and error handling.

- `src/routes/index.js`
  - Main API router under `/api`.
  - Exposes `/health`, `/modules`, `/buildings`, and `/navigation`.

- `src/routes/buildingRoutes.js`
  - Routes for building-related requests.
  - `GET /api/buildings`
  - `GET /api/buildings/details`

- `src/routes/navigationRoutes.js`
  - Routes for navigation-related requests.
  - `POST /api/navigation`
  - `GET /api/navigation/nodes`

- `src/controllers/buildingController.js`
  - Handles building routes and delegates to `buildingService`.

- `src/controllers/navigationController.js`
  - Handles navigation routes and delegates to `navigationService`.

- `src/services/buildingService.js`
  - Queries `Building` data.
  - Provides building name lists, building details, and lookup by name.

- `src/services/navigationService.js`
  - Performs navigation resolution.
  - Translates building names into node IDs and route coordinates.
  - Fetches route data from `Route` and node coordinates from `Node`.

- `src/models/Building.js`
  - Mongoose schema for searchable buildings.
  - Stores building name, nearest node, category, description, aliases.

- `src/models/Node.js`
  - Mongoose schema for campus map waypoints.
  - Stores `nodeId`, `x`, `y`, and optional label.

- `src/models/Route.js`
  - Mongoose schema for predefined routes.
  - Stores `startNode`, `endNode`, `path`, `distanceMeters`, `estimatedMinutes`.

- `src/middleware/validateNavigationRequest.js`
  - Validates `POST /api/navigation` body.
  - Ensures `start` and `destination` are non-empty strings.

- `src/middleware/asyncHandler.js`
  - Wraps async controllers so errors are forwarded to Express error middleware.

- `src/middleware/errorHandler.js`
  - Central error handler that returns JSON error responses.

- `src/middleware/notFound.js`
  - Returns 404 JSON for unknown routes.

- `src/config/env.js`
  - Reads environment variables and default settings.
  - Configures `PORT`, `MONGO_URI`, allowed CORS origins, and environment mode.

- `src/config/db.js`
  - Connects to MongoDB and manages the Mongoose connection.

- `src/seed/seedDatabase.js`
  - Seeds the `nodes`, `buildings`, and `routes` collections.
  - Validates campus data and computes walk distance and ETA metadata.

- `src/data/campusData.js`
  - The single source of truth for nodes, buildings, and predefined routes.
  - No runtime path finding is performed; all routes are authored data.

## API Endpoints

### GET `/`
- Returns a simple API info JSON object.

### GET `/api/health`
- Returns liveness/readiness data and current MongoDB connection state.

### GET `/api/modules`
- Returns available module metadata for feature discovery.

### GET `/api/buildings`
- Returns a sorted array of building names used for autocomplete.

### GET `/api/buildings/details`
- Returns detailed building metadata for richer UI display.

### POST `/api/navigation`
- Request body: `{ "start": "Main Gate", "destination": "Ayurveda Building" }`
- Returns a predefined route path with coordinates, distance, and ETA.

### GET `/api/navigation/nodes`
- Returns all waypoint nodes from the campus map.

## Backend Workflow

### 1. Server startup

1. `server.js` loads environment config from `src/config/env.js`.
2. It calls `connectDatabase()` from `src/config/db.js`.
3. It creates the Express app via `src/app.js`.
4. It listens on the configured port and registers shutdown handling.

### 2. Incoming request handling

1. The request enters Express and passes through global middleware in `src/app.js`:
   - CORS validation
   - security headers via `helmet`
   - request compression
   - JSON body parsing
   - request logging
   - API rate limiting under `/api`

2. The request reaches the `/api` router from `src/routes/index.js`.
3. The router delegates to specific route modules:
   - `src/routes/buildingRoutes.js`
   - `src/routes/navigationRoutes.js`

4. Controller functions execute:
   - `buildingController.getBuildings`
   - `buildingController.getBuildingDetails`
   - `navigationController.postNavigation`
   - `navigationController.getNodes`

5. Controller functions call service layer functions:
   - `buildingService.listBuildingNames`
   - `buildingService.listBuildingDetails`
   - `navigationService.getNavigationRoute`
   - `navigationService.listNodes`

6. The service layer queries MongoDB using Mongoose models:
   - `Building`
   - `Node`
   - `Route`

7. Responses are returned as JSON.

### 3. Navigation request flow (`POST /api/navigation`)

1. Request body is validated by `src/middleware/validateNavigationRequest.js`.
2. `navigationController.postNavigation` receives cleaned values.
3. `navigationService.getNavigationRoute(start, destination)` is called.
4. `buildingService.findBuildingByName` resolves each building name to a `Building` document.
5. If start and destination are the same, the service returns a zero-distance path.
6. Otherwise, it looks up a matching `Route` document by `startNode` and `endNode`.
7. If found, it resolves each node ID in the route path to `(x, y)` coordinates via `Node`.
8. The API returns:
   - `start`
   - `destination`
   - `path` array of coordinate points
   - `distanceMeters`
   - `estimatedMinutes`

### 4. Error handling

- Validation problems produce 400 responses with a structured error payload.
- Missing buildings or routes produce 404 errors.
- Unexpected failures are converted to standardized 500 JSON responses.
- The `errorHandler` middleware ensures consistent error output.

## Seed and Data Behavior

- `npm run seed` inserts or updates campus nodes, buildings, and routes.
- `npm run seed:fresh` drops the relevant collections first, then inserts fresh data.
- Campus routes are authored manually in `src/data/campusData.js`.
- The backend does not perform graph search at runtime; it only looks up stored routes.

## Run Commands

- `npm start` — start production server.
- `npm run dev` — start server with auto-reload.
- `npm run seed` — seed MongoDB data.
- `npm run seed:fresh` — clear and reseed data.

## Notes

- The backend depends on MongoDB via `MONGO_URI`.
- Allowed CORS origins are configured in `CORS_ORIGIN`.
- The app is designed for the Map Buddy module and may later support additional campus modules.
