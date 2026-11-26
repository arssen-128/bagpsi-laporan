export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const sidebar = document.getElementById("sidebar");

  function closeSidebar() {
    shell.classList.remove("sidebar-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
  function openSidebar() {
    shell.classList.add("sidebar-open");
    toggle?.setAttribute("aria-expanded", "true");
  }

  toggle?.addEventListener("click", () => {
    shell.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
  });
  backdrop?.addEventListener("click", closeSidebar);
  document.querySelectorAll("[data-close-sidebar]").forEach((link) => link.addEventListener("click", closeSidebar));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });
  sidebar?.addEventListener("click", (event) => {
    if (event.target.closest("button.item-riwayat")) closeSidebar();
  });
}
