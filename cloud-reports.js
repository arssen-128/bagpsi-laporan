import { TABLES } from "../config.js";
import { byId, setStatus } from "../utils/dom.js";

export function createCloudReports({ client, editor, getUser }) {
  let currentReportId = null;
  let saveTimer = null;
  let loading = false;
  let saving = false;
  let saveAgain = false;
  let archiveRecords = [];
  let archivePage = 1;
  const pageSize = 5;

  const statusNode = byId("status-simpan");
  const historyNode = byId("daftar-laporan");
  const searchNode = byId("arsip-search");
  const templateNode = byId("arsip-template");
  const periodNode = byId("arsip-period");
  const summaryNode = byId("arsip-summary");
  const paginationNode = byId("arsip-pagination");

  function setCloudStatus(message, error = false) {
    setStatus(statusNode, message, error);
  }
  function reportTitle(data) {
    const first = (data.kegiatan || [])[0] || {};
    return (first.nama || `Laporan BAGPSI ${new Date().toLocaleDateString("id-ID")}`).slice(0, 180);
  }
  function cancelScheduledSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = null;
  }
  function scheduleSave() {
    if (!getUser() || loading || saving) return;
    cancelScheduledSave();
    setCloudStatus("Perubahan belum disimpan…");
    saveTimer = setTimeout(() => save(false), 1400);
  }
  async function save(showMessage = true) {
    const user = getUser();
    if (!user) {
      if (showMessage) alert("Silakan login terlebih dahulu.");
      return;
    }
    if (saving) { saveAgain = true; return; }
    cancelScheduledSave();
    saving = true;
    const data = editor.collect();
    const payload = {
      user_id: user.id, judul: reportTitle(data), jenis: data.jenis, data,
      isi_laporan: byId("hasil").textContent, updated_at: new Date().toISOString()
    };
    setCloudStatus("Menyimpan ke database…");
    try {
      let result;
      if (currentReportId) {
        result = await client.from(TABLES.reports).update(payload)
          .eq("id", currentReportId).select("id").single();
      } else {
        result = await client.from(TABLES.reports).insert(payload).select("id").single();
      }
      if (result.error) throw result.error;
      currentReportId = result.data.id;
      setCloudStatus(`Tersimpan online · ${new Date().toLocaleTimeString("id-ID")}`);
      await loadHistory();
      if (showMessage) alert("Laporan berhasil disimpan ke database online.");
    } catch (error) {
      console.error("Supabase report save error:", error);
      setCloudStatus(`Gagal menyimpan: ${error.message || error}`, true);
      if (showMessage) alert(`Laporan belum tersimpan. ${error.message || error}`);
    } finally {
      saving = false;
      if (saveAgain) { saveAgain = false; scheduleSave(); }
    }
  }

  function dateOnly(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  function reportDate(record) {
    const dates = (record.data?.kegiatan || []).map(item => item.tanggal).filter(Boolean).sort();
    return dates[0] || null;
  }
  function formatDate(value) {
    const date = dateOnly(value);
    return date ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "—";
  }
  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[char]);
  }
  function getFilteredRecords() {
    const query = (searchNode?.value || "").trim().toLocaleLowerCase("id");
    const template = templateNode?.value || "all";
    const period = periodNode?.value || "all";
    return archiveRecords.filter(record => {
      const data = record.data || {};
      const activityText = (data.kegiatan || []).map(item =>
        [item.nama, item.uraian, item.hasil, item.lokasi].join(" ")
      ).join(" ");
      const searchable = [record.judul, data.penerima, activityText].join(" ").toLocaleLowerCase("id");
      const date = reportDate(record);
      return searchable.includes(query)
        && (template === "all" || record.jenis === template)
        && (period === "all" || (date && date.startsWith(period)));
    });
  }
  function renderPeriodOptions() {
    if (!periodNode) return;
    const selected = periodNode.value || "all";
    const periods = [...new Set(archiveRecords.map(reportDate).filter(Boolean).map(date => date.slice(0, 7)))].sort().reverse();
    periodNode.replaceChildren(new Option("Semua Periode", "all"));
    periods.forEach(period => {
      const [year, month] = period.split("-");
      const label = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month)-1, 1));
      periodNode.add(new Option(label, period));
    });
    periodNode.value = periods.includes(selected) ? selected : "all";
  }
  function renderArchive() {
    if (!historyNode) return;
    const records = getFilteredRecords();
    const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
    archivePage = Math.min(archivePage, pageCount);
    const start = (archivePage - 1) * pageSize;
    const pageRecords = records.slice(start, start + pageSize);

    if (!pageRecords.length) {
      historyNode.innerHTML = `<tr><td colspan="6" class="archive-message">${archiveRecords.length ? "Tidak ada laporan yang sesuai dengan pencarian atau filter." : "Belum ada laporan tersimpan di database."}</td></tr>`;
    } else {
      historyNode.innerHTML = pageRecords.map((record, index) => {
        const kind = record.jenis === "karopsi" ? "KAROPSI" : "KARO SDM";
        const recipient = record.data?.penerima || "Penerima belum diisi";
        const date = reportDate(record);
        const tagClass = record.jenis === "karopsi" ? "tag-psi" : "tag-karo";
        return `<tr>
          <td>${start + index + 1}.</td>
          <td><strong class="archive-report-title">${escapeHtml(record.judul || "Laporan tanpa judul")}</strong><span class="archive-recipient">${escapeHtml(recipient)}</span></td>
          <td><span class="archive-tag ${tagClass}">${kind}</span></td>
          <td class="archive-date">▢ &nbsp;${formatDate(date)}</td>
          <td class="archive-date">◷ &nbsp;${formatDateTime(record.updated_at)}</td>
          <td><div class="archive-row-actions"><button type="button" class="archive-open" data-open-report="${escapeHtml(record.id)}">↗ &nbsp;Buka</button><button type="button" class="archive-more" data-report-menu="${escapeHtml(record.id)}" aria-label="Opsi laporan">⋮</button></div></td>
        </tr>`;
      }).join("");
    }
    summaryNode.textContent = records.length
      ? `Menampilkan ${start + 1}–${Math.min(start + pageSize, records.length)} dari ${records.length} laporan`
      : "Menampilkan 0 laporan";
    paginationNode.replaceChildren();
    const addPage = (label, page, active = false, disabled = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `archive-page-button${active ? " active" : ""}`;
      button.textContent = label;
      button.disabled = disabled;
      button.addEventListener("click", () => { archivePage = page; renderArchive(); });
      paginationNode.append(button);
    };
    addPage("‹", Math.max(1, archivePage - 1), false, archivePage === 1);
    for (let page = 1; page <= pageCount; page++) addPage(String(page), page, page === archivePage);
    addPage("›", Math.min(pageCount, archivePage + 1), false, archivePage === pageCount);
  }

  async function loadHistory() {
    const user = getUser();
    if (!user || !historyNode) return;
    historyNode.innerHTML = '<tr><td colspan="6" class="archive-message">Memuat laporan…</td></tr>';
    const { data, error } = await client.from(TABLES.reports)
      .select("id,judul,jenis,data,updated_at")
      .order("updated_at", { ascending: false }).limit(100);
    if (error) {
      historyNode.innerHTML = `<tr><td colspan="6" class="archive-message archive-error">Gagal memuat daftar laporan: ${escapeHtml(error.message)}</td></tr>`;
      return;
    }
    archiveRecords = data || [];
    renderPeriodOptions();
    archivePage = 1;
    renderArchive();
  }
  async function open(id) {
    const { data, error } = await client.from(TABLES.reports).select("id,data").eq("id", id).single();
    if (error) { alert(`Laporan tidak dapat dibuka: ${error.message}`); return; }
    loading = true;
    currentReportId = data.id;
    try { editor.load(data.data || {}, { cloud: true }); }
    finally { loading = false; }
    setCloudStatus("Laporan dibuka dari database online");
    window.dispatchEvent(new CustomEvent("bagpsi:navigate-editor"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function newReport() {
    cancelScheduledSave();
    currentReportId = null;
    setCloudStatus("Laporan baru · belum disimpan");
  }
  function onSessionChanged(user) {
    cancelScheduledSave();
    if (!user) {
      currentReportId = null;
      archiveRecords = [];
      renderArchive();
      setCloudStatus("Belum tersimpan");
      return;
    }
    loadHistory();
    setCloudStatus("Terhubung · perubahan akan disinkronkan ke database");
  }

  byId("simpan-cloud").addEventListener("click", () => save(true));
  byId("muat-ulang").addEventListener("click", loadHistory);
  searchNode?.addEventListener("input", () => { archivePage = 1; renderArchive(); });
  templateNode?.addEventListener("change", () => { archivePage = 1; renderArchive(); });
  periodNode?.addEventListener("change", () => { archivePage = 1; renderArchive(); });
  historyNode?.addEventListener("click", event => {
    const openButton = event.target.closest("[data-open-report]");
    const menuButton = event.target.closest("[data-report-menu]");
    if (openButton) open(openButton.dataset.openReport);
    if (menuButton) {
      const record = archiveRecords.find(item => String(item.id) === menuButton.dataset.reportMenu);
      if (record && confirm(`Hapus laporan "${record.judul || "tanpa judul"}"?`)) {
        alert("Penghapusan belum diaktifkan. Tidak ada data yang dihapus.");
      }
    }
  });
  window.addEventListener("bagpsi:new-report", newReport);
  window.addEventListener("bagpsi:archive-opened", loadHistory);

  return { scheduleSave, save, loadHistory, onSessionChanged, newReport, cancelScheduledSave };
}
