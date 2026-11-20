# TaskFlow — Collaborative Sprint & Kanban Workspace

Week 1 milestone for the SkillMe Web Development Internship: the static
layout of a Kanban board, built with semantic HTML and CSS.

## What Week 1 includes

- Header with the app name and an "Add task" form (text input, priority
  select, button). The form does nothing yet — interactivity arrives in
  Week 2.
- A board with three columns — **To Do**, **In Progress**, **Done** —
  each with a heading and a task count, laid out side by side with CSS
  Grid (`grid-template-columns: repeat(3, 1fr)`).
- 6 hard-coded sample task cards (2 per column). Every card shares the
  `.task-card` class and shows a title, a priority label (Low / Medium /
  High) and a due date.
- Priority labels styled with CSS variables (`.priority-high`,
  `.priority-medium`, `.priority-low`) — no inline styles anywhere.
- Stretch goal done: below 700px the columns stack vertically via a
  media query.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

- `index.html` — semantic structure: header, form, board, columns, cards
- `style.css` — Grid layout, CSS variables, priority colours, responsive
  stacking
- `script.js` — placeholder for Week 2 (add / move / delete tasks)
