// TaskFlow — Weeks 2–4: add/move/delete, save/load + import, stats.
// Drag-and-drop lives separately in drag.js.
// The `tasks` array is the single source of truth; the board is always
// re-rendered from it, and every change is saved to localStorage.

const STORAGE_KEY = "taskflow-tasks";
const COLUMN_ORDER = ["todo", "progress", "done"];
const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };

let tasks = [];
let searchTerm = "";

const form = document.querySelector(".add-task-form");
const titleInput = document.querySelector("#task-input");
const prioritySelect = document.querySelector("#priority-select");
const searchInput = document.querySelector("#search-input");
const importButton = document.querySelector("#import-button");
const statusMessage = document.querySelector("#status-message");

/* ---------- Save / load ---------- */

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    tasks = Array.isArray(saved) ? saved : [];
  } catch (error) {
    tasks = []; // corrupted storage: start clean
  }
}

function newId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ---------- State changes (each one saves + re-renders) ---------- */

function commit() {
  saveTasks();
  render();
}

function addTask(title, priority) {
  tasks.push({ id: newId(), title, priority, status: "todo" });
  commit();
}

function moveTask(id, status) {
  const task = tasks.find((t) => t.id === id);
  if (!task || !COLUMN_ORDER.includes(status)) return;
  task.status = status;
  commit();
}

function moveToNext(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const next = COLUMN_ORDER[COLUMN_ORDER.indexOf(task.status) + 1];
  if (next) moveTask(id, next);
}

function editTask(id, title) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = title;
    commit();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  commit();
}

/* ---------- Import starter data ---------- */

function showStatus(text, isError = false) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("is-error", isError);
}

async function importStarterTasks() {
  try {
    const response = await fetch("tasks.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const starter = await response.json();
    const existingIds = new Set(tasks.map((t) => t.id));
    const fresh = starter.filter((t) => t && t.id && !existingIds.has(t.id));
    tasks.push(...fresh);
    commit();
    showStatus(
      fresh.length
        ? `Imported ${fresh.length} starter task${fresh.length === 1 ? "" : "s"}.`
        : "Starter tasks are already on the board."
    );
  } catch (error) {
    showStatus(`Could not import starter tasks (${error.message}).`, true);
  }
}

/* ---------- Rendering ---------- */

function makeButton(className, text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card-button ${className}`;
  button.textContent = text;
  button.setAttribute("aria-label", label);
  return button;
}

function createCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.dataset.id = task.id;
  card.setAttribute("draggable", "true");

  const heading = document.createElement("h3");
  heading.className = "task-title";
  heading.textContent = task.title;
  card.append(heading);

  if (task.description) {
    const desc = document.createElement("p");
    desc.className = "task-desc";
    desc.textContent = task.description;
    card.append(desc);
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const label = document.createElement("span");
  const priority = PRIORITY_LABELS[task.priority] ? task.priority : "medium";
  label.className = `priority priority-${priority}`;
  label.textContent = PRIORITY_LABELS[priority];
  meta.append(label);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    makeButton("edit-button", "Edit", `Edit task: ${task.title}`),
    makeButton("move-button", "→", `Move task to next column: ${task.title}`),
    makeButton("delete-button", "×", `Delete task: ${task.title}`)
  );

  card.append(meta, actions);
  return card;
}

// One helper keeps every column's task count in sync.
function updateCounts() {
  document.querySelectorAll(".column").forEach((column) => {
    column.querySelector(".task-count").textContent =
      column.querySelectorAll(".task-card").length;
  });
  updateStats();
}

// Stats bar: counts per status and completion % (from all tasks, not the search filter).
function updateStats() {
  const total = tasks.length;
  const by = (status) => tasks.filter((t) => t.status === status).length;
  const done = by("done");
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.querySelector("#stat-total").textContent = total;
  document.querySelector("#stat-todo").textContent = by("todo");
  document.querySelector("#stat-progress").textContent = by("progress");
  document.querySelector("#stat-done").textContent = done;
  document.querySelector("#stat-percent").textContent = `${percent}%`;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
}

function render() {
  const term = searchTerm.toLowerCase();
  document.querySelectorAll(".column").forEach((column) => {
    column.querySelectorAll(".task-card").forEach((card) => card.remove());
  });
  tasks
    .filter((t) => t.title.toLowerCase().includes(term))
    .forEach((task) => {
      const column = document.querySelector(`.column[data-status="${task.status}"]`);
      if (column) column.append(createCard(task));
    });
  updateCounts();
}

/* ---------- Events ---------- */

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  addTask(title, prioritySelect.value);
  titleInput.value = "";
  titleInput.focus();
});

document.querySelector(".board").addEventListener("click", (event) => {
  const button = event.target.closest(".card-button");
  if (!button) return;
  const id = button.closest(".task-card").dataset.id;

  if (button.classList.contains("delete-button")) {
    if (confirm("Delete this task?")) deleteTask(id);
  } else if (button.classList.contains("move-button")) {
    moveToNext(id);
  } else if (button.classList.contains("edit-button")) {
    const task = tasks.find((t) => t.id === id);
    const newTitle = prompt("Edit task title", task ? task.title : "");
    if (newTitle && newTitle.trim()) editTask(id, newTitle.trim());
  }
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  render();
});

importButton.addEventListener("click", importStarterTasks);

loadTasks();
render();
