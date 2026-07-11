// Generated from 04 Wealth/00 Manager/tools/wealth-import.py. Do not edit by hand.
function applyEntityFilters() {
  const boxes = Array.from(document.querySelectorAll("[data-entity-filter]"));
  const selected = new Set(boxes.filter((box) => box.checked).map((box) => box.value));
  document.querySelectorAll("[data-ledger-row]").forEach((row) => {
    row.hidden = selected.size > 0 && !selected.has(row.dataset.entity);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-entity-filter]").forEach((box) => {
    box.addEventListener("change", applyEntityFilters);
  });
  applyEntityFilters();
});
