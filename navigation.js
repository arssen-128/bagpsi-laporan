export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const editorView = document.getElementById("editor-view");
  const archiveView = document.getElementById("riwayat-panel");
  const navLinks = [...document.querySelectorAll(".side-nav .side-link")];

  function closeSidebar() {
    shell.classList.remove("sidebar-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
  function openSidebar() {
    shell.classList.add("sidebar-open");
    toggle?.setAttribute("aria-expanded", "true");
  }
  function setActive(link) {
    navLinks.forEach((item) => item.classList.toggle("active", item === link));
  }
  function showEditor({ updateHash = true } = {}) {
    archiveView.hidden = true;
    editorView.hidden = false;
    const editorLink = document.querySelector("[data-editor-nav][href='#area-editor']");
    setActive(editorLink);
    if (updateHash && location.hash !== "#area-editor") history.replaceState(null, "", "#area-editor");
  }
  function showArchive({ updateHash = true } = {}) {
    editorView.hidden = true;
    archiveView.hidden = false;
    setActive(document.querySelector("[data-archive-nav]"));
    if (updateHash && location.hash !== "#riwayat-panel") history.pushState(null, "", "#riwayat-panel");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("bagpsi:archive-opened"));
  }

  toggle?.addEventListener("click", () => {
    shell.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
  });
  backdrop?.addEventListener("click", closeSidebar);

  document.querySelectorAll("[data-archive-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showArchive();
      closeSidebar();
    });
  });

  document.querySelectorAll("[data-editor-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showEditor();
      closeSidebar();
      if (link.getAttribute("href") === "#area-preview") {
        document.getElementById("area-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  document.querySelectorAll("[data-personel-nav]").forEach((link) => {
    link.addEventListener("click", () => {
      archiveView.hidden = true;
      editorView.hidden = false;
      setActive(link);
      closeSidebar();
    });
  });

  document.getElementById("buat-laporan-dari-arsip")?.addEventListener("click", () => {
    showEditor();
    window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("bagpsi:navigate-editor", () => showEditor());
  window.addEventListener("popstate", () => {
    if (location.hash === "#riwayat-panel") showArchive({ updateHash: false });
    else showEditor({ updateHash: false });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  // Deep link langsung ke arsip juga membuka halaman arsip.
  if (location.hash === "#riwayat-panel") showArchive({ updateHash: false });
}
