import { PANGKAT, SKOR_PANGKAT, HARI } from "../utils/constants.js";
import { buildReport } from "../utils/report-format.js";
import { byId } from "../utils/dom.js";

const DRAFT_KEY = "bagpsi-halaman";

function timeSelectMarkup() {
  const hours = ['<option value="">--</option>'];
  const minutes = ['<option value="">--</option>'];
  for (let i = 0; i < 24; i++) hours.push(`<option value="${String(i).padStart(2, "0")}">${String(i).padStart(2, "0")}</option>`);
  for (let i = 0; i < 60; i++) minutes.push(`<option value="${String(i).padStart(2, "0")}">${String(i).padStart(2, "0")}</option>`);
  return `<select class="jj" aria-label="Jam">${hours.join("")}</select><span>.</span><select class="mm" aria-label="Menit">${minutes.join("")}</select>`;
}

function fillRankSelect(select) {
  select.replaceChildren(new Option("Pangkat", ""));
  PANGKAT.forEach((rank) => select.add(new Option(rank, rank)));
}

function setTime(container, value) {
  const match = /^(\d{2}):(\d{2})/.exec(value || "");
  container.querySelector(".jj").value = match ? match[1] : "";
  container.querySelector(".mm").value = match ? match[2] : "";
}

function getTime(container, untilFinished) {
  if (untilFinished) return "hingga";
  const hour = container.querySelector(".jj").value;
  const minute = container.querySelector(".mm").value;
  if (!hour && !minute) return "";
  return `${hour || "00"}:${minute || "00"}`;
}

function addPersonToCard(card, person) {
  if (!person?.pangkat || !person?.nama) return;
  const item = document.createElement("div");
  item.className = "orang-item";
  item.dataset.pangkat = person.pangkat;
  item.dataset.nama = person.nama;
  item.dataset.gelar = person.gelar || "";
  item.dataset.jabatan = person.jabatan || "";

  const info = document.createElement("div");
  const name = document.createElement("b");
  name.textContent = `${person.pangkat} ${person.nama}`;
  const detail = document.createElement("span");
  detail.textContent = [person.gelar, person.jabatan].filter(Boolean).join(" · ");
  info.append(name, detail);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "teks buang";
  remove.textContent = "Hapus";
  item.append(info, remove);
  card.querySelector(".terpilih").append(item);
}

function sortPeople(card) {
  const container = card.querySelector(".terpilih");
  [...container.children]
    .sort((a, b) => {
      const rankDifference = (SKOR_PANGKAT[b.dataset.pangkat] || 0) - (SKOR_PANGKAT[a.dataset.pangkat] || 0);
      return rankDifference || a.dataset.nama.localeCompare(b.dataset.nama, "id", { sensitivity: "base" });
    })
    .forEach((node) => container.append(node));
}

function fillCard(card, item = {}) {
  card.querySelector(".nama").value = item.nama || "";
  card.querySelector(".tanggal").value = item.tanggal || "";
  card.querySelector(".hari").value = item.hari || "";
  setTime(card.querySelector(".mulai"), item.mulai);
  const untilFinished = item.selesai === "hingga";
  card.querySelector(".hingga").checked = untilFinished;
  card.querySelector(".selesai").querySelectorAll("select").forEach((select) => { select.disabled = untilFinished; });
  if (!untilFinished) setTime(card.querySelector(".selesai"), item.selesai);
  card.querySelector(".lokasi").value = item.lokasi || "";
  card.querySelector(".uraian").value = item.uraian || "";
  card.querySelector(".hasil").value = item.hasil || "";
  (item.orang || []).forEach((person) => addPersonToCard(card, person));
  sortPeople(card);
}

function readDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return value && Array.isArray(value.kegiatan) ? value : null;
  } catch {
    return null;
  }
}

export function createReportEditor({ onChange = () => {} } = {}) {
  const list = byId("daftar");
  const template = byId("tpl");
  const kind = byId("jenis");
  let suppressChange = false;

  function notifyChange() {
    if (suppressChange) return;
    const data = collect();
    byId("hasil").textContent = buildReport(data);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (error) {
      console.warn("Draf lokal tidak dapat disimpan:", error);
    }
    onChange(data);
  }

  function updateNumbers() {
    [...list.children].forEach((card, index) => {
      card.querySelector(".judul-kegiatan").textContent = `Kegiatan ${index + 1}`;
      card.querySelector(".hapus").hidden = list.children.length === 1;
    });
    byId("tambah").hidden = kind.value === "karo_sdm";
  }

  function addActivity({ silent = false, data = {} } = {}) {
    if (kind.value === "karo_sdm" && list.children.length >= 1) return;
    const card = template.content.firstElementChild.cloneNode(true);
    card.querySelectorAll(".jam").forEach((container) => { container.innerHTML = timeSelectMarkup(); });
    fillRankSelect(card.querySelector(".pangkat"));
    list.append(card);
    if (data) fillCard(card, data);
    updateNumbers();
    if (!silent) notifyChange();
    return card;
  }

  function collect() {
    return {
      jenis: kind.value,
      penerima: byId("penerima").value,
      pembuka: byId("pembuka").value,
      penutup: byId("penutup").value,
      kegiatan: [...list.querySelectorAll(".kegiatan")].map((card) => ({
        nama: card.querySelector(".nama").value.trim(),
        tanggal: card.querySelector(".tanggal").value,
        hari: card.querySelector(".hari").value.trim(),
        mulai: getTime(card.querySelector(".mulai"), false),
        selesai: getTime(card.querySelector(".selesai"), card.querySelector(".hingga").checked),
        lokasi: card.querySelector(".lokasi").value.trim(),
        uraian: card.querySelector(".uraian").value,
        hasil: card.querySelector(".hasil").value,
        orang: [...card.querySelectorAll(".orang-item")].map((node) => ({
          pangkat: node.dataset.pangkat,
          nama: node.dataset.nama,
          gelar: node.dataset.gelar,
          jabatan: node.dataset.jabatan
        }))
      }))
    };
  }

  function load(data, { cloud = false } = {}) {
    suppressChange = true;
    list.replaceChildren();
    const safe = data && typeof data === "object" ? data : {};
    kind.value = safe.jenis === "karopsi" ? "karopsi" : "karo_sdm";
    byId("penerima").value = safe.penerima || (kind.value === "karopsi" ? "Yth. KAROPSI SSDM POLRI" : "Yth. KARO SDM POLDA BANTEN");
    byId("pembuka").value = safe.pembuka || "";
    byId("penutup").value = safe.penutup || "";
    let activities = Array.isArray(safe.kegiatan) && safe.kegiatan.length ? safe.kegiatan : [{}];
    if (kind.value === "karo_sdm") activities = activities.slice(0, 1);
    activities.forEach((item) => addActivity({ silent: true, data: item }));
    if (!list.children.length) addActivity({ silent: true, data: {} });
    updateNumbers();
    const normalized = collect();
    byId("hasil").textContent = buildReport(normalized);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(normalized)); } catch {}
    suppressChange = false;
    if (!cloud) onChange(normalized, { restored: true });
    return normalized;
  }

  function clearDraft({ notify = true } = {}) {
    localStorage.removeItem(DRAFT_KEY);
    const blank = {
      jenis: kind.value,
      penerima: kind.value === "karopsi" ? "Yth. KAROPSI SSDM POLRI" : "Yth. KARO SDM POLDA BANTEN",
      pembuka: "",
      penutup: "Demikian disampaikan, atas perhatiannya diucapkan terima kasih.",
      kegiatan: [{}]
    };
    if (!notify) suppressChange = true;
    const result = load(blank, { cloud: !notify });
    suppressChange = false;
    return result;
  }

  function init() {
    const saved = readDraft();
    if (saved) load(saved);
    else load({
      jenis: "karo_sdm",
      penerima: "Yth. KARO SDM POLDA BANTEN",
      pembuka: "Dengan hormat,\nBersama ini disampaikan laporan kegiatan sebagai berikut.",
      penutup: "Demikian disampaikan, atas perhatiannya diucapkan terima kasih.",
      kegiatan: [{}]
    });

    byId("tambah").addEventListener("click", () => addActivity());
    kind.addEventListener("change", () => {
      byId("penerima").value = kind.value === "karopsi" ? "Yth. KAROPSI SSDM POLRI" : "Yth. KARO SDM POLDA BANTEN";
      const previous = collect().kegiatan[0] || {};
      list.replaceChildren();
      addActivity({ silent: true, data: previous });
      updateNumbers();
      notifyChange();
    });

    document.body.addEventListener("input", (event) => {
      const card = event.target.closest(".kegiatan");
      if (event.target.classList.contains("tanggal") && card) {
        const value = event.target.value;
        card.querySelector(".hari").value = value ? HARI[new Date(`${value}T00:00:00`).getDay()] : "";
      }
      if (event.target.closest("#area-editor") && !event.target.closest("#master-personel")) notifyChange();
    });

    document.body.addEventListener("change", (event) => {
      if (event.target.classList.contains("hingga")) {
        const finish = event.target.closest(".kegiatan").querySelector(".selesai");
        finish.querySelectorAll("select").forEach((select) => { select.disabled = event.target.checked; });
      }
      if (event.target.closest("#area-editor") && !event.target.closest("#master-personel")) notifyChange();
    });

    document.body.addEventListener("click", (event) => {
      const card = event.target.closest(".kegiatan");
      if (!card) return;
      if (event.target.classList.contains("tambah-orang")) {
        const rank = card.querySelector(".pangkat").value;
        const name = card.querySelector(".nama-orang").value.trim();
        if (!rank || !name) return;
        addPersonToCard(card, {
          pangkat: rank,
          nama: name,
          gelar: card.querySelector(".gelar").value.trim(),
          jabatan: card.querySelector(".jabatan").value.trim()
        });
        card.querySelector(".pangkat").value = "";
        card.querySelector(".nama-orang").value = "";
        card.querySelector(".gelar").value = "";
        card.querySelector(".jabatan").value = "";
        sortPeople(card);
        notifyChange();
      } else if (event.target.classList.contains("buang")) {
        event.target.closest(".orang-item").remove();
        sortPeople(card);
        notifyChange();
      } else if (event.target.classList.contains("hapus") && list.children.length > 1) {
        card.remove();
        updateNumbers();
        notifyChange();
      }
    });

    byId("salin").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(byId("hasil").textContent);
        byId("salin").textContent = "Tersalin";
        setTimeout(() => { byId("salin").textContent = "Salin teks"; }, 1600);
      } catch {
        alert("Tidak dapat menyalin otomatis. Pilih teks pratinjau lalu salin secara manual.");
      }
    });

    byId("baru").addEventListener("click", () => {
      if (!confirm("Draf di perangkat ini akan dihapus. Lanjutkan?")) return;
      clearDraft({ notify: false });
      window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
    });

    byId("laporan-baru").addEventListener("click", () => {
      if (!confirm("Mulai laporan baru? Pastikan laporan sebelumnya sudah tersimpan.")) return;
      clearDraft();
      window.dispatchEvent(new CustomEvent("bagpsi:new-report"));
    });
  }

  return { init, collect, load, notifyChange, clearDraft };
}
