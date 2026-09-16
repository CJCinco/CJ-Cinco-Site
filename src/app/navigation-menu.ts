/** Native disclosure behavior shared by the site and its self-contained review. */
export function mountNavigation(menu: HTMLDetailsElement) {
  const header = menu.closest("header") ?? menu;
  const summary = menu.querySelector("summary");
  function closeOutside(event: Event) {
    if (menu.open && event.target instanceof Node && !header.contains(event.target)) menu.open = false;
  }
  function escape(event: KeyboardEvent) {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      summary?.focus();
      event.preventDefault();
    }
  }
  function followLink(event: Event) {
    if (event.target instanceof Element && event.target.closest("a")) menu.open = false;
  }
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("focusin", closeOutside);
  document.addEventListener("keydown", escape);
  header.addEventListener("click", followLink);
  return () => {
    document.removeEventListener("pointerdown", closeOutside);
    document.removeEventListener("focusin", closeOutside);
    document.removeEventListener("keydown", escape);
    header.removeEventListener("click", followLink);
  };
}
