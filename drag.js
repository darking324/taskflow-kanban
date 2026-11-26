// TaskFlow — Week 4: Drag-and-drop.
// Kept separate from save/load: it only reads the dragged card's id and
// calls moveTask() from script.js, which saves state and re-renders.

let draggedId = null;

document.querySelector(".board").addEventListener("dragstart", (event) => {
  const card = event.target.closest(".task-card");
  if (!card) return;
  draggedId = card.dataset.id;
  card.classList.add("is-dragging");
  event.dataTransfer.setData("text/plain", draggedId);
  event.dataTransfer.effectAllowed = "move";
});

document.querySelector(".board").addEventListener("dragend", (event) => {
  const card = event.target.closest(".task-card");
  if (card) card.classList.remove("is-dragging");
  document.querySelectorAll(".column.drag-over").forEach((c) => c.classList.remove("drag-over"));
  draggedId = null;
});

document.querySelectorAll(".column").forEach((column) => {
  column.addEventListener("dragover", (event) => {
    event.preventDefault(); // allow dropping
    event.dataTransfer.dropEffect = "move";
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", (event) => {
    if (!column.contains(event.relatedTarget)) column.classList.remove("drag-over");
  });

  column.addEventListener("drop", (event) => {
    event.preventDefault();
    column.classList.remove("drag-over");
    const id = event.dataTransfer.getData("text/plain") || draggedId;
    if (id) moveTask(id, column.dataset.status);
  });
});
