import { TABLES } from "../config.js";
import { byId, createElement, setStatus } from "../utils/dom.js";

export function createPersonnelModule({ client }) {
  let currentUser = null;
  let isAdmin = false;
  let records = [];
  let currentPage = 1;
  const PAGE_SIZE = 12;

  const panel = byId("master-personel");
  const contentGrid = document.querySelector(".content-grid");
  const form = byId("personel-form");
  const statusNode = byId("personel-status");
  const listNode = byId("personel-list");

  function status(message, error = false) {
    setStatus(statusNode, message, error);
  }

  function showMaster() {
    panel.hidden = false;
    contentGrid.classList.add("master-view");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll("[data-personel-nav]").forEach((node) => node.classList.add("active"));
  }

  function hideMaster() {
    panel.hidden = true;
    contentGrid.classList.remove("master-view");
    document.querySelectorAll("[data-personel-nav]").forEach((node) => node.classList.remove("active"));
    byId("area-editor").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function refreshActivitySelects() {
    document.querySelectorAll(".pilih-master-personel").forEach((select) => {
      const oldValue = select.value;
      select.replaceChildren(new Option(records.length ? "Pilih personel…" : "Belum ada personel aktif", ""));
      records.filter((person) => person.status === "aktif").forEach((person) => {
        const label = `${person.pangkat} ${person.nama}${person.jabatan ? ` — ${person.jabatan}` : ""}`;
        select.add(new Option(label, person.id));
      });
      if (oldValue && records.some((person) => person.id === oldValue && person.status === "aktif")) {
        select.value = oldValue;
      }
    });
  }

  function fillSelectedPerson(select) {
    const card = select.closest(".kegiatan");
    if (!card) return;
    const person = records.find((item) => item.id === select.value);
    card.querySelector(".pangkat").value = person?.pangkat || "";
    card.querySelector(".nama-orang").value = person?.nama || "";
    card.querySelector(".gelar").value = person?.gelar || "";
    card.querySelector(".jabatan").value = person?.jabatan || "";
  }

  function clearForm() {
    form.reset();
    byId("personel-id").value = "";
    byId("simpan-personel").textContent = "Simpan personel";
  }

  function editPerson(id) {
    const person = records.find((item) => item.id === id);
    if (!person || !isAdmin) return;
    byId("personel-id").value = person.id;
    byId("master-nrp").value = person.nrp || "";
    byId("master-pangkat").value = person.pangkat || "";
    byId("master-nama").value = person.nama || "";
    byId("master-gelar").value = person.gelar || "";
    byId("master-jabatan").value = person.jabatan || "";
    byId("master-bagian").value = person.bagian || "";
    byId("simpan-personel").textContent = "Perbarui personel";
    byId("master-nama").focus();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function getFilteredRecords() {
    const query = (byId("cari-personel").value || "").trim().toLocaleLowerCase("id");
    const filter = byId("filter-status-personel").value;
    return records.filter((person) => {
      const statusMatch = filter === "semua" || person.status === filter;
      const haystack = [person.nrp, person.pangkat, person.nama, person.gelar, person.jabatan, person.bagian]
        .filter(Boolean).join(" ").toLocaleLowerCase("id");
      return statusMatch && (!query || haystack.includes(query));
    });
  }

  function renderSummary(visible) {
    const active = records.filter((person) => person.status === "aktif").length;
    const inactive = records.length - active;
    byId("personel-count-total").textContent = String(records.length);
    byId("personel-count-active").textContent = String(active);
    byId("personel-count-inactive").textContent = String(inactive);
    byId("personel-count-filtered").textContent = `${visible.length} hasil`;
  }

  function renderPagination(totalPages, totalItems) {
    const pagination = byId("personel-pagination");
    pagination.replaceChildren();
    if (!totalItems) return;

    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);
    const info = createElement("span", "pagination-info", `Menampilkan ${start}–${end} dari ${totalItems} personel`);
    const controls = createElement("div", "pagination-controls");
    const previous = createElement("button", "button-outline", "‹ Sebelumnya");
    previous.type = "button";
    previous.disabled = currentPage <= 1;
    previous.addEventListener("click", () => { currentPage -= 1; renderList(); });
    const pageLabel = createElement("span", "pagination-page", `Halaman ${currentPage} / ${totalPages}`);
    const next = createElement("button", "button-outline", "Berikutnya ›");
    next.type = "button";
    next.disabled = currentPage >= totalPages;
    next.addEventListener("click", () => { currentPage += 1; renderList(); });
    controls.append(previous, pageLabel, next);
    pagination.append(info, controls);
  }

  function renderList() {
    const visible = getFilteredRecords();
    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageRecords = visible.slice(startIndex, startIndex + PAGE_SIZE);

    renderSummary(visible);
    listNode.replaceChildren();
    if (!visible.length) {
      listNode.append(createElement("div", "personel-empty", "Tidak ada data personel yang cocok."));
      renderPagination(0, 0);
      return;
    }

    pageRecords.forEach((person) => {
      const row = createElement("div", "personel-row");
      const main = createElement("div", "personel-row-main");
      const nameLine = createElement("div", "personel-name-line");
      nameLine.append(createElement("strong", "", `${person.pangkat} ${person.nama}`));
      nameLine.append(createElement("span", `personel-status-badge ${person.status === "aktif" ? "is-active" : "is-inactive"}`, person.status === "aktif" ? "AKTIF" : "NONAKTIF"));
      main.append(nameLine,
        createElement("small", "", [
          person.gelar, person.jabatan, person.bagian,
          person.nrp ? `NRP ${person.nrp}` : ""
        ].filter(Boolean).join(" · "))
      );
      row.append(main);

      if (isAdmin) {
        const actions = createElement("div", "personel-row-actions");
        const edit = createElement("button", "button-outline", "Edit");
        edit.type = "button";
        edit.addEventListener("click", () => editPerson(person.id));
        const toggle = createElement("button", "button-outline", person.status === "aktif" ? "Nonaktifkan" : "Aktifkan");
        toggle.type = "button";
        toggle.addEventListener("click", () => changeStatus(person));
        actions.append(edit, toggle);
        row.append(actions);
      }
      listNode.append(row);
    });
    renderPagination(totalPages, visible.length);
  }

  async function changeStatus(person) {
    if (!isAdmin) return;
    const nextStatus = person.status === "aktif" ? "nonaktif" : "aktif";
    const prompt = nextStatus === "nonaktif"
      ? `Nonaktifkan ${person.nama}? Data tidak akan dihapus dan riwayat laporan tetap utuh.`
      : `Aktifkan kembali ${person.nama}?`;
    if (!confirm(prompt)) return;

    status("Memperbarui status personel…");
    const { error } = await client.from(TABLES.personnel)
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", person.id);
    if (error) {
      status(`Gagal memperbarui status: ${error.message}`, true);
      return;
    }
    await loadPersonnel();
    status("Status personel berhasil diperbarui.");
  }

  async function savePerson(event) {
    event.preventDefault();
    if (!isAdmin || !currentUser) {
      status("Hanya admin yang dapat menambah atau mengubah master personel.", true);
      return;
    }

    const id = byId("personel-id").value;
    const payload = {
      nrp: byId("master-nrp").value.trim() || null,
      pangkat: byId("master-pangkat").value,
      nama: byId("master-nama").value.trim(),
      gelar: byId("master-gelar").value.trim() || null,
      jabatan: byId("master-jabatan").value.trim() || null,
      bagian: byId("master-bagian").value.trim() || null,
      updated_at: new Date().toISOString()
    };

    if (!payload.pangkat || !payload.nama) {
      status("Pangkat dan nama wajib diisi.", true);
      return;
    }

    const button = byId("simpan-personel");
    button.disabled = true;
    status("Menyimpan data personel ke Supabase…");
    try {
      let result;
      if (id) {
        result = await client.from(TABLES.personnel).update(payload).eq("id", id).select().single();
      } else {
        payload.created_by = currentUser.id;
        result = await client.from(TABLES.personnel).insert(payload).select().single();
      }
      if (result.error) throw result.error;
      clearForm();
      await loadPersonnel();
      status("Data personel berhasil disimpan ke database online.");
    } catch (error) {
      status(`Gagal menyimpan personel: ${error.message || error}`, true);
    } finally {
      button.disabled = false;
    }
  }

  async function loadPersonnel() {
    if (!client || !currentUser) return;
    status("Memuat database personel…");
    const { data, error } = await client.from(TABLES.personnel)
      .select("id,nrp,pangkat,nama,gelar,jabatan,bagian,status,created_at,updated_at")
      .order("nama", { ascending: true });

    if (error) {
      records = [];
      refreshActivitySelects();
      renderList();
      status(`Gagal memuat master personel: ${error.message}`, true);
      return;
    }
    records = data || [];
    currentPage = 1;
    refreshActivitySelects();
    renderList();
    status(`${records.length} data personel tersedia di database online.`);
  }

  async function checkAdmin() {
    const { data, error } = await client.rpc("is_bagpsi_admin");
    if (error) {
      isAdmin = false;
      byId("personel-admin-area").hidden = true;
      status(`Tidak dapat memverifikasi hak administrator: ${error.message}. Mode lihat saja.`, true);
      return;
    }
    isAdmin = data === true;
    byId("personel-admin-area").hidden = !isAdmin;
    if (!isAdmin) status("Mode lihat saja. Hubungi administrator BAGPSI untuk menambah atau mengubah personel.");
  }

  async function setSession(session) {
    currentUser = session?.user || null;
    if (!currentUser) {
      records = [];
      isAdmin = false;
      byId("personel-admin-area").hidden = true;
      refreshActivitySelects();
      listNode.replaceChildren();
      status("Silakan login untuk mengakses database personel.");
      return;
    }
    await checkAdmin();
    await loadPersonnel();
  }

  function init() {
    document.querySelectorAll("[data-personel-nav]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showMaster();
      });
    });
    byId("tutup-master-personel").addEventListener("click", hideMaster);
    form.addEventListener("submit", savePerson);
    byId("batal-edit-personel").addEventListener("click", clearForm);
    byId("cari-personel").addEventListener("input", () => { currentPage = 1; renderList(); });
    byId("filter-status-personel").addEventListener("change", () => { currentPage = 1; renderList(); });
    document.body.addEventListener("change", (event) => {
      if (event.target.classList.contains("pilih-master-personel")) fillSelectedPerson(event.target);
    });

    // Sinkronkan dropdown personel pada setiap kartu kegiatan yang baru dibuat.
    // Penting saat pengguna berpindah template KARO SDM ke KAROPSI atau sebaliknya.
    document.addEventListener("bagpsi:activity-added", (event) => {
      const card = event.detail?.card;
      const select = card?.querySelector(".pilih-master-personel");
      if (!select) return;
      const oldValue = select.value;
      select.replaceChildren(new Option(records.length ? "Pilih personel…" : "Belum ada personel aktif", ""));
      records.filter((person) => person.status === "aktif").forEach((person) => {
        const label = `${person.pangkat} ${person.nama}${person.jabatan ? ` — ${person.jabatan}` : ""}`;
        select.add(new Option(label, person.id));
      });
      if (oldValue && records.some((person) => person.id === oldValue && person.status === "aktif")) {
        select.value = oldValue;
      }
    });
  }

  init();
  return { setSession, loadPersonnel, refreshActivitySelects };
}
