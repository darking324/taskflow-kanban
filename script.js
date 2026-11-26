// TaskFlow — Week 2: Add, Move & Delete Tasks with JavaScript

const COLUMN_ORDER = ["todo", "progress", "done"];
const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };

const form = document.querySelector(".add-task-form");
const titleInput = document.querySelector("#task-input");
const prioritySelect = document.querySelector("#priority-select");

function getColumn(status) {
  return document.querySelector(`.column[data-status="${status}"]`);
}

// One helper keeps every column's task count in sync.
function updateCounts() {
  document.querySelectorAll(".column").forEach((column) => {
    const count = column.querySelectorAll(".task-card").length;
    column.querySelector(".task-count").textContent = count;
  });
}

function makeButton(className, text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card-button ${className}`;
  button.textContent = text;
  button.setAttribute("aria-label", label);
  return button;
}

// Adds Edit / Move / Delete buttons to a card (new or from the HTML).
function addCardActions(card) {
  if (card.querySelector(".card-actions")) return;
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    makeButton("edit-button", "Edit", "Edit task title"),
    makeButton("move-button", "→", "Move task to next column"),
    makeButton("delete-button", "×", "Delete task")
  );
  card.append(actions);
}

function createCard(title, priority) {
  const card = document.createElement("article");
  card.className = "task-card";

  const heading = document.createElement("h3");
  heading.className = "task-title";
  heading.textContent = title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const label = document.createElement("span");
  label.className = `priority priority-${priority}`;
  label.textContent = PRIORITY_LABELS[priority];
  meta.append(label);

  card.append(heading, meta);
  addCardActions(card);
  return card;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  getColumn("todo").append(createCard(title, prioritySelect.value));
  titleInput.value = "";
  titleInput.focus();
  updateCounts();
});

// Event delegation: one listener handles every card button.
document.querySelector(".board").addEventListener("click", (event) => {
  const button = event.target.closest(".card-button");
  if (!button) return;
  const card = button.closest(".task-card");

  if (button.classList.contains("delete-button")) {
    if (confirm("Delete this task?")) {
      card.remove();
      updateCounts();
    }
  } else if (button.classList.contains("move-button")) {
    const current = card.closest(".column").dataset.status;
    const next = COLUMN_ORDER[COLUMN_ORDER.indexOf(current) + 1];
    if (next) {
      getColumn(next).append(card);
      updateCounts();
    }
  } else if (button.classList.contains("edit-button")) {
    const titleEl = card.querySelector(".task-title");
    const newTitle = prompt("Edit task title", titleEl.textContent);
    if (newTitle && newTitle.trim()) titleEl.textContent = newTitle.trim();
  }
});

document.querySelectorAll(".task-card").forEach(addCardActions);
updateCounts();
