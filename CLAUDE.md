
---

## Design Reference Files — Read These Before Any UI Work

Before building any UI component, read all three files in `/design/`:

### `design/mockup-reference.jsx` — PRIMARY REFERENCE
A complete working React prototype of the full app. Extract from it:
- SVG ring animation logic (MissionRing component)
- Strategy Map SVG path + node rendering + hover logic
- Heatmap grid structure (ConsistencyTracker)
- All Recharts configurations (axes, colours, gradients, tooltips)
- Exact layout grid structure (grid-cols, gaps, padding values)
- Every Tailwind class combination used

Rebuild each component properly per the architecture in this document,
but the visual output must match this file exactly.

### `design/stitch-dashboard.html` — SPACING + TYPOGRAPHY REFERENCE
Original Stitch export for the main dashboard. Use for:
- Exact Tailwind spacing (p-5, gap-4, mb-2, etc.)
- Typography classes (text-xs, font-bold, tracking-widest, uppercase)
- Component nesting hierarchy and structure
- Background/border colour class combinations

### `design/stitch-analytics.html` — ANALYTICS LAYOUT REFERENCE
Original Stitch export for the Analytics screen. Use for:
- Tab layout and panel proportions
- Core Model Variables and Savings Intelligence panel structure
- Chart card layouts and annotation positioning

---

## Design Reference Files — Read These Before Any UI Work

Before building any UI component, read all three files in `/design/`:

### `design/mockup-reference.jsx` — PRIMARY REFERENCE
A complete working React prototype of the full app. Extract from it:
- SVG ring animation logic (MissionRing component)
- Strategy Map SVG path + node rendering + hover logic
- Heatmap grid structure (ConsistencyTracker)
- All Recharts configurations (axes, colours, gradients, tooltips)
- Exact layout grid structure (grid-cols, gaps, padding values)
- Every Tailwind class combination used

Rebuild each component properly per the architecture in this document,
but the visual output must match this file exactly.

### `design/stitch-dashboard.html` — SPACING + TYPOGRAPHY REFERENCE
Original Stitch export for the main dashboard. Use for:
- Exact Tailwind spacing (p-5, gap-4, mb-2, etc.)
- Typography classes (text-xs, font-bold, tracking-widest, uppercase)
- Component nesting hierarchy and structure
- Background/border colour class combinations

### `design/stitch-analytics.html` — ANALYTICS LAYOUT REFERENCE
Original Stitch export for the Analytics screen. Use for:
- Tab layout and panel proportions
- Core Model Variables and Savings Intelligence panel structure
- Chart card layouts and annotation positioning
