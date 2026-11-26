/**
 * BAGPSI REPORT — navigasi halaman.
 * Inisialisasi independen dari editor/personel agar menu arsip tetap berfungsi
 * walaupun modul lain mengalami error.
 */
export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const editorView = document.getElementById("editor-view");
  const archiveView = document.getElementById("riwayat-panel");
  const sideNav = document.querySelector(".side-nav");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");

  if (!shell || !editorView || !archiveView || !sideNav) {
    console.error("[BAGPSI] Navigasi arsip gagal: elemen app-shell/editor-view/riwayat-panel/side-nav tidak ditemukan.", {
      shell: !!shell, editorView: !!editorView, archiveView: !!archiveView, sideNav: !!sideNav
    });
    return;
  }

  const navLinks = [...sideNav.querySelectorAll("a.side-link")];

  function closeSidebar() {
    shell.classList.remove("sidebar-open");
    sidebarToggle?.setAttribute("aria-expanded", "false");
  }

  function setActive(selector) {
    const active = sideNav.querySelector(selector);
    navLinks.forEach((link) => link.classList.toggle("active", link === active));
  }

  function showPage(page, options = {}) {
    const archive = page === "archive";
    const updateUrl = options.updateUrl !== false;
    const scroll = options.scroll !== false;

    // hidden + display inline dipakai bersama agar tidak dikalahkan CSS lama.
    editorView.hidden = archive;
    editorView.style.display = archive ? "none" : "";
    archiveView.hidden = !archive;
    archiveView.style.display = archive ? "block" : "none";

    setActive(archive
      ? "[data-archive-nav]"
      : "[data-editor-nav][href='#area-editor']");

    const targetHash = archive ? "#riwayat-panel" : "#area-editor";
    if (updateUrl && window.location.hash !== targetHash) {
      window.history.pushState({ bagpsiPage: page }, "", targetHash);
    }

    if (archive) {
      closeSidebar();
      window.dispatchEvent(new CustomEvent("bagpsi:archive-opened"));
    }
    if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Tangkap klik sebelum handler lain. Klik pada ikon/span tetap terdeteksi.
  document.addEventListener("click", (event) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest(".side-nav a.side-link") : null;
    if (!link || !sideNav.contains(link)) return;

    if (link.hasAttribute("data-archive-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPage("archive");
      return;
    }

    if (link.hasAttribute("data-editor-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPage("editor");
      closeSidebar();
      if (link.getAttribute("href") === "#area-preview") {
        document.getElementById("area-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (link.hasAttribute("data-personel-nav")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPage("editor");
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
    showPage("editor");
    window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
  });

  window.addEventListener("bagpsi:navigate-editor", () => showPage("editor"));
  window.addEventListener("popstate", () => {
    showPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", {
      updateUrl: false
    });
  });
  window.addEventListener("hashchange", () => {
    showPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", {
      updateUrl: false
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  // Deep-link / refresh langsung ke halaman arsip.
  showPage(window.location.hash === "#riwayat-panel" ? "archive" : "editor", {
    updateUrl: false,
    scroll: false
  });
}
