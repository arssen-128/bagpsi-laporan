export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const editorView = document.getElementById("editor-view");
  const archiveView = document.getElementById("riwayat-panel");
  const navLinks = [...document.querySelectorAll(".side-nav .side-link")];

  if (!shell || !editorView || !archiveView) {
    throw new Error("Elemen utama navigasi (#app-shell, #editor-view, #riwayat-panel) tidak ditemukan.");
  }
  const closeSidebar = () => {
    shell.classList.remove("sidebar-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
  const setActive = link => navLinks.forEach(item => item.classList.toggle("active", item === link));
  function showEditor({ updateHash = true, activeLink = null } = {}) {
    archiveView.hidden = true;
    editorView.hidden = false;
    setActive(activeLink || document.querySelector("[data-editor-nav][href='#area-editor']"));
    if (updateHash && location.hash !== "#area-editor") history.pushState(null, "", "#area-editor");
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
    const opening = !shell.classList.contains("sidebar-open");
    shell.classList.toggle("sidebar-open", opening);
    toggle.setAttribute("aria-expanded", String(opening));
  });
  backdrop?.addEventListener("click", closeSidebar);
  document.querySelectorAll("[data-archive-nav]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault(); showArchive(); closeSidebar();
  }));
  document.querySelectorAll("[data-editor-nav]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault(); showEditor({ activeLink: link }); closeSidebar();
    if (link.getAttribute("href") === "#area-preview") {
      document.getElementById("area-preview")?.scrollIntoView({ behavior:"smooth", block:"start" });
    } else window.scrollTo({ top:0, behavior:"smooth" });
  }));
  document.querySelectorAll("[data-personel-nav]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    showEditor({ activeLink: link });
    closeSidebar();
    document.getElementById("master-personel")?.scrollIntoView({ behavior:"smooth", block:"start" });
    if (location.hash !== "#master-personel") history.pushState(null, "", "#master-personel");
  }));
  document.getElementById("buat-laporan-dari-arsip")?.addEventListener("click", () => {
    showEditor(); closeSidebar();
    window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
    window.scrollTo({ top:0, behavior:"smooth" });
  });
  window.addEventListener("bagpsi:navigate-editor", () => showEditor());
  window.addEventListener("popstate", () => {
    if (location.hash === "#riwayat-panel") showArchive({ updateHash:false });
    else if (location.hash === "#master-personel") {
      showEditor({ updateHash:false, activeLink:document.querySelector("[data-personel-nav]") });
      document.getElementById("master-personel")?.scrollIntoView({ behavior:"smooth", block:"start" });
    } else showEditor({ updateHash:false });
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeSidebar(); });
  if (location.hash === "#riwayat-panel") showArchive({ updateHash:false });
  else if (location.hash === "#master-personel") {
    showEditor({ updateHash:false, activeLink:document.querySelector("[data-personel-nav]") });
  }
}
