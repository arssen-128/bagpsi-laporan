/**
 * BAGPSI REPORT — navigasi halaman.
 * Menangani klik menu dengan event delegation pada fase capture agar tidak
 * bergantung pada elemen anak yang diklik (ikon/teks) atau handler lain.
 */
export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const editorView = document.getElementById("editor-view");
  const archiveView = document.getElementById("riwayat-panel");
  const sideNav = document.querySelector(".side-nav");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");

  if (!shell || !editorView || !archiveView || !sideNav) {
    console.error("BAGPSI: navigasi arsip tidak dapat diinisialisasi. Periksa index.html (app-shell, editor-view, riwayat-panel, side-nav).");
    return;
  }

  const links = [...sideNav.querySelectorAll("a.side-link")];

  function setActive(selector) {
    const activeLink = sideNav.querySelector(selector);
    links.forEach((link) => link.classList.toggle("active", link === activeLink));
  }

  function closeSidebar() {
    shell.classList.remove("sidebar-open");
    sidebarToggle?.setAttribute("aria-expanded", "false");
  }

  function renderPage(page, { updateUrl = true, scroll = true } = {}) {
    const archive = page === "archive";

    // Gunakan atribut hidden dan style display sebagai fallback jika CSS lama
    // atau stylesheet cache masih menimpa display elemen.
    editorView.hidden = archive;
    editorView.style.display = archive ? "none" : "";
    archiveView.hidden = !archive;
    archiveView.style.display = archive ? "block" : "none";

    setActive(archive ? "[data-archive-nav]" : "[data-editor-nav][href='#area-editor']");

    const hash = archive ? "#riwayat-panel" : "#area-editor";
    if (updateUrl && window.location.hash !== hash) {
      window.history.pushState({ bagpsiPage: page }, "", hash);
    }

    if (archive) {
      closeSidebar();
      window.dispatchEvent(new CustomEvent("bagpsi:archive-opened"));
    }

    if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Capture-phase delegation: klik pada span/icon tetap dikenali sebagai klik link.
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element
      ? event.target.closest(".side-nav a.side-link")
      : null;
    if (!link || !sideNav.contains(link)) return;

    if (link.hasAttribute("data-archive-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderPage("archive");
      return;
    }

    if (link.hasAttribute("data-editor-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderPage("editor");
      closeSidebar();

      if (link.getAttribute("href") === "#area-preview") {
        document.getElementById("area-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (link.hasAttribute("data-personel-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderPage("editor");
      closeSidebar();
      document.getElementById("master-personel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, true);

  sidebarToggle?.addEventListener("click", () => {
    const opened = shell.classList.toggle("sidebar-open");
    sidebarToggle.setAttribute("aria-expanded", String(opened));
  });
  backdrop?.addEventListener("click", closeSidebar);

  document.getElementById("buat-laporan-dari-arsip")?.addEventListener("click", () => {
    renderPage("editor");
    window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
  });

  window.addEventListener("bagpsi:navigate-editor", () => renderPage("editor"));
  window.addEventListener("popstate", () => {
    renderPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", { updateUrl: false });
  });
  window.addEventListener("hashchange", () => {
    renderPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", { updateUrl: false });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  // Deep link dan refresh pada URL arsip harus membuka halaman arsip.
  renderPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", {
    updateUrl: false,
    scroll: false
  });
}
