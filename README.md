# Velozity Project Tracker

A fully-featured multi-view project management UI built with **React + TypeScript**, **Zustand**, and **Tailwind CSS**. No drag-and-drop libraries, no virtual scrolling libraries, no UI component libraries.

Live demo: [your-deploy-url.vercel.app]

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
git clone https://github.com/your-username/velozity-tracker
cd velozity-tracker
npm install
npm run dev
```

Open http://localhost:5173

### Build for production

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo to Vercel — it auto-detects Vite.

---

## Project Structure

```
src/
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.tsx       # Top-level kanban container + pointer capture
│   │   ├── KanbanColumn.tsx      # Single column (drop zone, header, body)
│   │   ├── TaskCard.tsx          # Card with collab indicators
│   │   └── useDragAndDrop.ts     # Custom DnD hook (pointer events)
│   ├── list/
│   │   ├── ListView.tsx          # Virtual scroll container + sortable headers
│   │   ├── ListRow.tsx           # Single absolutely-positioned row
│   │   └── useVirtualScroll.ts   # Custom windowing hook
│   ├── timeline/
│   │   └── TimelineView.tsx      # Gantt bars, today line, synced scroll panes
│   ├── filters/
│   │   └── FilterBar.tsx         # Multi-select chips + date range + URL sync
│   └── shared/
│       ├── AssigneeAvatar.tsx    # Initials-based avatar
│       ├── PriorityBadge.tsx     # Colour-coded priority pill
│       └── DueLabel.tsx          # Overdue / due-today / date label
├── store/
│   └── useAppStore.ts            # Zustand store (all state + URL sync)
├── data/
│   ├── users.ts                  # 6 user constants
│   └── seedTasks.ts              # Seeded LCG generator → 500 tasks
├── hooks/
│   └── useCollabSim.ts           # Collaboration simulation (interval-based)
├── types/
│   └── index.ts                  # All TypeScript interfaces + enums
├── utils/
│   ├── date.ts                   # Due label logic, month helpers
│   └── sort.ts                   # List sort by column
├── App.tsx
├── main.tsx
└── index.css
```

---

## State Management: Why Zustand

The three views (Kanban, List, Timeline) share one task dataset and must switch **instantly** with no re-fetch. The choice was between:

**Option A: React Context + useReducer**
- Every consumer re-renders on any state change
- Threading providers through the tree adds boilerplate
- No built-in selector support — Timeline would re-render on every drag event

**Option B: Zustand** ✅
- Selector subscriptions: `useAppStore(s => s.filters)` only re-renders when `filters` changes. A Kanban drag touching `tasks` does not re-render `FilterBar`.
- Zero-boilerplate mutations: `set({ tasks: [...] })` vs. dispatching an action and writing a case
- Works outside React (accessed in `useDragAndDrop.ts` hook without a Provider)
- Flat store = predictable data flow; all state in one place makes URL sync trivial

With 500 tasks and real-time collab ticks every 2.5–4.5s, Zustand's granular subscriptions are materially better than Context re-rendering the entire tree on every tick.

---

## Virtual Scrolling Implementation

**Problem**: 500 task rows × 48px = 24,000px DOM. Naive rendering tanks frame rate on scroll.

**Algorithm** (in `useVirtualScroll.ts` + `ListView.tsx`):

1. **Outer container**: `overflow-y: auto`, fixed height (fills remaining viewport).
2. **Inner spacer div**: `height = totalRows × ROW_HEIGHT` — this is the only thing that tells the browser how tall the content is. The scrollbar thumb size and position are correct even though most rows don't exist in the DOM.
3. **On every `scroll` event**: compute the visible window:
   ```
   startIndex = floor(scrollTop / ROW_HEIGHT) - BUFFER   (BUFFER = 5)
   endIndex   = ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER
   ```
4. **Render only** rows `[startIndex, endIndex]` as `position: absolute` divs with `top = index × ROW_HEIGHT`.
5. Rows that scroll out of the window are removed from the DOM.

**Result**:
- DOM node count stays at ~20 regardless of dataset size
- Scrollbar is correct (spacer div maintains full height)
- No flickering: the 5-row buffer ensures rows are painted before they enter the viewport on fast scroll
- No blank gaps: buffer covers rapid scroll jumps

Tested against 500 tasks — smooth 60fps on a mid-range machine.

---

## Drag-and-Drop Implementation

**API choice: Pointer Events** (`pointerdown` / `pointermove` / `pointerup`)

One unified handler covers mouse and touch — no separate touch event handling needed. `board.setPointerCapture(e.pointerId)` keeps events firing even when the pointer leaves the board boundary.

### Placeholder without layout shift — the core challenge

Naive DnD implementations remove the dragged card from the DOM, causing the column to shrink and all sibling cards to jump up — a jarring visual flash that breaks spatial memory.

**Fix** (in `useDragAndDrop.ts`):

```
1. pointerdown fires
2. Measure card: rect = cardEl.getBoundingClientRect()
3. Create ghost div: height = rect.height (exact match)
4. Insert ghost BEFORE touching the card: cardEl.parentNode.insertBefore(ghost, cardEl)
5. Set card opacity to 0.25 (still in DOM, still occupying space via ghost)
6. Create floating clone: position: fixed, follows cursor
```

The column never sees a height change. The ghost placeholder maintains the exact vertical space. This is what `react-beautiful-dnd` does internally — implemented here from scratch.

### Ghost repositioning on hover

As the pointer moves over a column, `getInsertTarget()` compares the cursor Y against each card's midpoint to find where the ghost should be inserted. This gives the live preview of where the card will land.

### Snap-back on invalid drop

If `pointerup` fires outside a valid column (`overColStatus === null`), no `updateTaskStatus` is called. The ghost and clone are removed, the original card's opacity is restored, and the task appears in its original position — instant, smooth, no animation needed.

### Touch support

The Pointer Events API (`onPointerDown`, `onPointerMove`, `onPointerUp`) works identically for mouse and touch. `touchAction: 'none'` on cards prevents scroll interference during drag.

---

## Seed Data

`src/data/seedTasks.ts` uses a **seeded Linear Congruential Generator** (LCG):

```typescript
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}
```

This gives deterministic, reproducible data across environments. `generateTasks(500)` produces:
- 6 assignees spread evenly
- All 4 priorities and statuses represented
- Due dates from -20 to +40 days (ensures ~33% overdue tasks)
- ~15% of tasks have no `startDate` (edge case for Timeline)
- Some tasks due exactly today

---

## URL State

Filters and view mode are reflected as URL query parameters:
```
?status=todo,inprogress&priority=critical&assignee=u1,u3&from=2026-03-01&view=list
```

- Shareable: paste the URL in another browser tab — exact filter state restored
- Back navigation: `popstate` event triggers store re-read from URL
- Implementation: `pushFiltersToURL()` called from every store mutation; `readFiltersFromURL()` called once at store init

---

## Hardest UI Problem

**Keeping Kanban column height stable during drag** was the hardest problem.

The instinct is to remove the dragged card, then render a placeholder. But any timing gap between removal and placeholder insertion causes a visible height collapse — cards jump, the column shrinks, users lose their mental model of where they're dropping.

The solution is to **insert the ghost before any mutation**. The sequence is:
1. Insert ghost (column height unchanged)
2. Reduce card opacity (card still in DOM via ghost)
3. Attach floating clone to document.body

The column never experiences a height change. Zero layout shift.

**Drag placeholder without layout shift**: Ghost div inserted before the original card's opacity changes, using the card's exact `getBoundingClientRect().height` — no CSS estimate, the actual rendered height. Even cards with variable content (long titles wrapping to 2 lines) produce a correctly-sized ghost.

**One thing I'd refactor with more time**: The virtual scroll hook re-computes `startIndex`/`endIndex` on every scroll event, which triggers a React re-render and DOM diff on each frame. A better architecture uses a node recycling pool — a fixed ring buffer of ~25 pre-allocated row elements that get their content swapped (via `key` reassignment or direct DOM mutation) rather than being mounted/unmounted. This eliminates the render cycle on fast scroll entirely, which matters at 10,000+ rows.

---

## Lighthouse

**Target: 85+ on Desktop**

Performance factors:
- Vite build: tree-shaking, code splitting, minification
- Virtual scrolling: only ~20 DOM nodes in list view regardless of dataset
- No render-blocking resources
- No external JS libraries (Zustand = 1.1kb gzipped)
- CSS transitions only (no JS animation loops)
- Tasks generated at runtime — zero network requests

Screenshot: [add `/public/lighthouse.png` after running audit]

---

## Technical Checklist

| Requirement | Status |
|---|---|
| React + TypeScript | ✅ Vite + React 18 + TS strict mode |
| No drag-and-drop library | ✅ Custom Pointer Events hook |
| No virtual scroll library | ✅ Custom windowing in `useVirtualScroll.ts` |
| No UI component library | ✅ All components hand-built |
| Zustand state management | ✅ Single store, selector subscriptions |
| Kanban with 4 columns | ✅ |
| List view sortable columns | ✅ title, priority, dueDate |
| Inline status change (no modal) | ✅ `<select>` in list row |
| Timeline / Gantt | ✅ Current month, today line, colour-coded bars |
| URL-synced filters | ✅ Shareable, restores on back navigation |
| Multi-select filters | ✅ status, priority, assignee |
| Date range filter | ✅ from / to inputs |
| Overdue highlighting | ✅ Red label, days count if >7d |
| Due Today label | ✅ |
| Empty states | ✅ Kanban columns + list view |
| Collab indicators | ✅ Avatars on cards, presence bar |
| 500+ seed tasks | ✅ Seeded LCG generator |
| Desktop (1280px+) | ✅ |
| Tablet (768px) | ✅ Kanban horizontal scroll |
