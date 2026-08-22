# 3D Building Implementation

## Overview

CampusBuddy now includes seven 3D building layers, including the original Ayurveda Building proof of concept, layered on top of the existing campus map. The existing SVG map, navigation nodes, routes, pan, zoom, and markers remain in place.

Enabled buildings are `ayurveda-building`, `H-building`, `I-building`, `Admin-building`, `A-building`, `B-building`, and `C-building`.

## Files Changed

- `frontend/src/components/CampusMap.jsx`
  - Mounts the 3D building layer inside the existing transformed SVG group.
  - Keeps the route overlay above the building layer.
  - Tracks the selected building.

- `frontend/src/components/Building3D.jsx`
  - Reusable SVG/React building component.
  - Generates the extrusion geometry from a footprint path.
  - Provides hover, click, keyboard selection, and a selected building label.

- `frontend/src/data/buildings.js`
  - Central building registry.
  - Contains all seven building IDs, display names, and original SVG footprints.

## Existing Map Rendering

The campus map is rendered in `CampusMap.jsx` as an inline SVG containing an SVG `<image>`:

```jsx
<image
  href={CAMPUS_MAP}
  x="0"
  y="0"
  width={MAP_WIDTH}
  height={MAP_HEIGHT}
/>
```

`CAMPUS_MAP` is centralized in `frontend/src/config/map.js` and points to:

```text
/campus-map2.svg
```

The image and all overlays share the same SVG coordinate system and transformed `<g>`. This keeps the building aligned during resizing, panning, and zooming.

## Layer Order

The map group is rendered in this order:

1. Existing campus map image
2. `Building3D` layer
3. Existing `RouteOverlay`

The route remains above the building layer and its implementation was not changed.

## Geometry Generation

The building footprint is stored as SVG path data in the centralized building registry:

```js
{
  id: 'ayurveda-building',
  name: 'Ayurveda Building',
  footprint: 'M330.5 413.5H33V587H330.5V413.5Z'
}
```

`Building3D.jsx` generates the visual extrusion programmatically:

1. Creates an SVG path from the footprint.
2. Samples points along the path using `getTotalLength()` and `getPointAtLength()`.
3. Creates an offset copy for the roof.
4. Connects each original edge to its offset edge with polygon faces.
5. Draws the roof and original footprint in the shared campus coordinate system.

No separate front, side, or roof polygons were manually created in the SVG.

## Interaction States

- Normal: the building is visible but subdued so it remains integrated with the map.
- Hover: opacity increases and the cursor changes to a pointer.
- Selected: the building is emphasized and displays `Ayurveda Building` in an SVG label.
- Keyboard: Enter and Space select the focused building group.

Pointer-down propagation is stopped on the building so clicking it does not start map panning.

## Adding Another Building

The current registry contains these entries:

```text
ayurveda-building -> Ayurveda Building
H-building        -> H Building
I-building        -> I Building
Admin-building    -> Admin Building
A-building        -> A Building
B-building        -> B Building
C-building        -> C Building
```

To add another building, add an entry to `frontend/src/data/buildings.js`:

```js
{
  id: 'new-building',
  name: 'New Building',
  footprint: '...existing SVG path data...'
}
```

No change to `Building3D.jsx` or `CampusMap.jsx` should be needed. The new entry will be rendered automatically.

## Current Asset Limitation

The repository contains two `campus-map2.svg` copies:

- Root-level `campus-map2.svg`, which contains the named building paths.
- `frontend/public/campus-map2.svg`, which is the asset served by Vite and has the same `2483 1621` viewBox but does not contain the building IDs.

Because the frontend-served asset does not expose the building paths, the Ayurveda footprint is currently kept in the centralized building data file. It still uses the original SVG coordinates and remains aligned with the served map.

If the served SVG is later updated to include the named building paths, the registry can be changed to load those paths from the asset instead of storing the footprint string.

## Validation

- `npm run build` passes in `frontend/`.
- No editor diagnostics were reported for the changed source files.
- The Vite development server starts at `http://127.0.0.1:5173/`.
- The app reached its existing login screen without errors from the new component.
- All seven buildings use the same reusable `Building3D` component and the same extrusion parameters.
- No building required special geometry handling.
- Authenticated route, hover, click, resize, and navigation-node testing requires a valid backend session.
