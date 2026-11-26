# TaskFlow — Collaborative Sprint & Kanban Workspace

A Kanban board built with plain HTML, CSS and vanilla JavaScript during the
**SkillMe Web Development Internship** (4 weekly milestones).

**Live:** https://skillme-taskflow.vercel.app
**Repo:** https://github.com/darking324/taskflow-kanban

## Features

- Three columns — To Do, In Progress, Done — with live task counts
- Add tasks with a title and priority (Low / Medium / High)
- Move (→), edit and delete (×, with confirmation) any task
- Drag-and-drop cards between columns, with the target column highlighted
- Tasks saved in `localStorage` (key `taskflow-tasks`) and restored on reload
- "Import starter tasks" loads `tasks.json` with `fetch()`; repeat imports
  never create duplicates (deduped by `id`); fetch errors show a message
- Search box that filters cards by title
- Stats bar: totals per column and completion %
- Responsive: columns stack below 700px; keyboard focus styles and
  `aria-label`s on every card button

## Weekly milestones

| Week | Milestone | Tag |
|---|---|---|
| 1 | Kanban Board Layout with HTML & CSS | [`week-1`](https://github.com/darking324/taskflow-kanban/tree/week-1) |
| 2 | Add, Move & Delete Tasks with JavaScript | [`week-2`](https://github.com/darking324/taskflow-kanban/tree/week-2) |
| 3 | Saving Tasks & Importing Starter Data | [`week-3`](https://github.com/darking324/taskflow-kanban/tree/week-3) |
| 4 | Drag-and-Drop, Polish & Deploy | [`week-4`](https://github.com/darking324/taskflow-kanban/tree/week-4) |

### Week 1 — Layout
Semantic HTML header with the add-task form, a CSS Grid board
(`repeat(3, 1fr)`), 6 sample cards sharing `.task-card` with title, short
description and priority label, priority colours from CSS variables
(`.priority-high` etc.), no inline styles, columns with a minimum height,
and stacking below 700px.

### Week 2 — Add, move & delete
The form's submit handler (`preventDefault`) creates a card in To Do and
clears the input. Each card gets Edit, Move (→, hidden in Done) and Delete
(×, asks `confirm()`) buttons, handled with one delegated click listener.
One helper, `updateCounts()`, keeps every column count correct.

### Week 3 — Save & import
A single `tasks` array of `{ id, title, priority, status }` objects is the
source of truth; the board is re-rendered from it. Every change calls
`saveTasks()`; `loadTasks()` runs on page load and survives empty or
corrupted storage. `tasks.json` holds 6 starter tasks for the Import button.
Stretch: search by title.

### Week 4 — Drag-and-drop, polish & deploy
`drag.js` (kept separate from save/load) handles `dragstart`, `dragover`,
`dragleave` and `drop`, highlights the target column with `.drag-over`, and
calls `moveTask()`, which saves and updates the counts. Polished card
shadows and hover states, focus outlines, a stats bar with completion %, a
footer credit, and a production deploy on Vercel.

## Run it

Open `index.html` directly, or serve the folder (needed for the Import
button, since `fetch()` doesn't load local files):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Tests

`tests/board.test.js` drives the real page in jsdom (add, move, delete,
save/reload, import + dedupe, fetch error, search, drag-and-drop, stats):

```bash
npm install jsdom
node tests/board.test.js . w4
```

## Files

- `index.html` — structure: header, form, toolbar, stats bar, board, footer
- `style.css` — layout, CSS variables, priority colours, drag/focus styles
- `script.js` — state, save/load, import, rendering, card actions, stats
- `drag.js` — drag-and-drop only
- `tasks.json` — starter tasks

---
Built during the SkillMe Web Development Internship by Abhishek Kumar.
