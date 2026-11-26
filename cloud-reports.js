import { TABLES } from "../config.js";
import { byId, setStatus } from "../utils/dom.js";

export function createCloudReports({ client, editor, getUser }) {
  let currentReportId = null;
  let saveTimer = null;
  let loading = false;
  let saving = false;
  let saveAgain = false;

  const statusNode = byId("status-simpan");
  const historyNode = byId("daftar-laporan");

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
    if (saving) return;
    cancelScheduledSave();
    saving = true;
    const data = editor.collect();
    const payload = {
      user_id: user.id,
      judul: reportTitle(data),
      jenis: data.jenis,
      data,
      isi_laporan: byId("hasil").textContent,
      updated_at: new Date().toISOString()
    };

    setCloudStatus("Menyimpan ke database…");
    try {
      let result;
      if (currentReportId) {
        result = await client.from(TABLES.reports)
          .update(payload).eq("id", currentReportId).select("id").single();
      } else {
        result = await client.from(TABLES.reports)
          .insert(payload).select("id").single();
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
      if (saveAgain) {
        saveAgain = false;
        scheduleSave();
      }
    }
  }

  async function loadHistory() {
    const user = getUser();
    if (!user) return;
    historyNode.textContent = "Memuat laporan…";
    const { data, error } = await client.from(TABLES.reports)
      .select("id,judul,jenis,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      historyNode.textContent = `Gagal memuat daftar laporan: ${error.message}`;
      return;
    }

    historyNode.replaceChildren();
    if (!data?.length) {
      const empty = document.createElement("p");
      empty.className = "bantu";
      empty.textContent = "Belum ada laporan tersimpan di database.";
      historyNode.append(empty);
      return;
    }

    data.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item-riwayat";
      const title = document.createElement("strong");
      title.textContent = record.judul || "Laporan tanpa judul";
      const meta = document.createElement("small");
      meta.textContent = `${record.jenis === "karopsi" ? "KAROPSI" : "KARO SDM"} · ${new Date(record.updated_at).toLocaleString("id-ID")}`;
      button.append(title, meta);
      button.addEventListener("click", () => open(record.id));
      historyNode.append(button);
    });
  }

  async function open(id) {
    const { data, error } = await client.from(TABLES.reports)
      .select("id,data").eq("id", id).single();
    if (error) {
      alert(`Laporan tidak dapat dibuka: ${error.message}`);
      return;
    }
    loading = true;
    currentReportId = data.id;
    editor.load(data.data || {}, { cloud: true });
    loading = false;
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
      historyNode.replaceChildren();
      setCloudStatus("Belum tersimpan");
      return;
    }
    loadHistory();
    setCloudStatus("Terhubung · perubahan akan disinkronkan ke database");
  }

  byId("simpan-cloud").addEventListener("click", () => save(true));
  byId("muat-ulang").addEventListener("click", loadHistory);
  window.addEventListener("bagpsi:new-report", newReport);
  window.addEventListener("bagpsi:archive-opened", loadHistory);

  return {
    scheduleSave,
    save,
    loadHistory,
    onSessionChanged,
    newReport,
    cancelScheduledSave
  };
}
