export function initNavigation() {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("sidebar-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const editorView = document.getElementById("editor-view");
  const archiveView = document.getElementById("riwayat-panel");
  const sideNav = document.querySelector(".side-nav");

  if (!shell || !editorView || !archiveView || !sideNav) {
    console.error("BAGPSI navigation: elemen navigasi atau halaman arsip tidak ditemukan.");
    return;
  }

  const navLinks = [...sideNav.querySelectorAll(".side-link")];

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

  function showEditor({ updateHash = true, scroll = true } = {}) {
    archiveView.hidden = true;
    editorView.hidden = false;
    setActive(sideNav.querySelector("[data-editor-nav][href='#area-editor']"));
    if (updateHash && location.hash !== "#area-editor") {
      history.pushState({ bagpsiPage: "editor" }, "", "#area-editor");
    }
    if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showArchive({ updateHash = true } = {}) {
    editorView.hidden = true;
    archiveView.hidden = false;
    setActive(sideNav.querySelector("[data-archive-nav]"));
    if (updateHash && location.hash !== "#riwayat-panel") {
      history.pushState({ bagpsiPage: "archive" }, "", "#riwayat-panel");
    }
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "auto" });
    window.dispatchEvent(new CustomEvent("bagpsi:archive-opened"));
  }

  // Delegasi klik di level nav: tetap bekerja walaupun yang diklik adalah ikon/teks di dalam link.
  sideNav.addEventListener("click", (event) => {
    const link = event.target.closest("a.side-link");
    if (!link || !sideNav.contains(link)) return;

    if (link.hasAttribute("data-archive-nav")) {
      event.preventDefault();
      event.stopPropagation();
      showArchive();
      return;
    }

    if (link.hasAttribute("data-editor-nav")) {
      event.preventDefault();
      event.stopPropagation();
      const isPreview = link.getAttribute("href") === "#area-preview";
      showEditor();
      closeSidebar();
      if (isPreview) {
        document.getElementById("area-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (link.hasAttribute("data-personel-nav")) {
      event.preventDefault();
      event.stopPropagation();
      archiveView.hidden = true;
      editorView.hidden = false;
      setActive(link);
      closeSidebar();
      document.getElementById("master-personel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  toggle?.addEventListener("click", () => {
    shell.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
  });
  backdrop?.addEventListener("click", closeSidebar);

  document.getElementById("buat-laporan-dari-arsip")?.addEventListener("click", () => {
    showEditor();
    window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
  });

  window.addEventListener("bagpsi:navigate-editor", () => showEditor());
  window.addEventListener("popstate", () => {
    if (location.hash === "#riwayat-panel") showArchive({ updateHash: false });
    else showEditor({ updateHash: false });
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#riwayat-panel") showArchive({ updateHash: false });
    else if (location.hash === "#area-editor" || location.hash === "") showEditor({ updateHash: false });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  // Dukungan tautan langsung: /?#!riwayat-panel atau /?#riwayat-panel.
  if (location.hash === "#riwayat-panel") {
    showArchive({ updateHash: false });
  } else {
    archiveView.hidden = true;
    editorView.hidden = false;
  }
}
