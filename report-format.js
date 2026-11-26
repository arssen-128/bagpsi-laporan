import { BULAN } from "./constants.js";

export function toRoman(number) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"]
  ];
  let value = number;
  let result = "";
  for (const [amount, symbol] of map) {
    while (value >= amount) {
      result += symbol;
      value -= amount;
    }
  }
  return result;
}

export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11 || !day) return "";
  return `${Number(day)} ${BULAN[monthIndex]} ${year}`;
}

export function formatTime(start, end) {
  const tidy = (value) => {
    const match = /^(\d{2}):(\d{2})/.exec(value || "");
    return match ? `${match[1]}.${match[2]}` : "";
  };
  const a = tidy(start);
  if (end === "hingga") return a ? `${a} WIB hingga selesai` : "";
  const b = tidy(end);
  if (a && b) return `${a}-${b} WIB`;
  return a ? `${a} WIB` : "";
}

export function numberedLines(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");
}

export function personnelText(personnel = []) {
  return personnel.map((person, index) => {
    let name = `${person.pangkat || ""} ${person.nama || ""}`.trim();
    if (person.gelar) name += `, ${person.gelar}`;
    let line = `${index + 1}. ${name}`;
    if (person.jabatan) line += `\n   ${person.jabatan}`;
    return line;
  }).join("\n");
}

function timeAndPlace(item) {
  const rows = [];
  const date = formatDate(item.tanggal);
  const day = item.hari || "";
  if (day || date) rows.push(`Hari/Tanggal: ${[day, date].filter(Boolean).join(", ")}`);
  const time = formatTime(item.mulai, item.selesai);
  if (time) rows.push(`Waktu: ${time}`);
  if (item.lokasi) rows.push(`Tempat: ${item.lokasi}`);
  return rows.join("\n");
}

function formatKaro(item) {
  const sections = [
    ["KEGIATAN", item.nama || ""],
    ["WAKTU DAN TEMPAT", timeAndPlace(item)],
    ["URAIAN KEGIATAN", numberedLines(item.uraian)],
    ["HASIL KEGIATAN", numberedLines(item.hasil)],
    ["PELAKSANA", personnelText(item.orang || [])]
  ].filter((section) => section[1]);
  return sections.map((section, index) =>
    `*${toRoman(index + 1)}. ${section[0]}*\n${section[1]}`
  ).join("\n\n");
}

function formatKaropsi(activities = []) {
  return activities.map((item, index) => {
    const sections = [
      ["Waktu", timeAndPlace(item).split("\n").filter((line) => !line.startsWith("Tempat:")).join("\n")],
      ["Tempat", item.lokasi || ""],
      ["Pelaksana", personnelText(item.orang || [])],
      ["Uraian", numberedLines(item.uraian)],
      ["Hasil", numberedLines(item.hasil)]
    ].filter((section) => section[1]);

    const title = `*${toRoman(index + 1)}${item.nama ? `. ${item.nama}` : ""}*`;
    return [title, ...sections.map(([label, value]) => `\n*${label}*\n${value}`)].join("\n");
  }).join("\n\n");
}

export function buildReport(data) {
  const blocks = [
    "*KEPADA:*",
    (data.penerima || "Yth. KARO SDM POLDA BANTEN").trim(),
    "",
    "*DARI:*",
    "KABAGPSI RO SDM POLDA BANTEN",
    "",
    "*PERIHAL:*",
    "",
    "*LAPORAN KEGIATAN BAGPSI RO SDM POLDA BANTEN*",
    "",
    "*TEMBUSAN:*",
    "1. Psikolog Utama Ropsi SSDM Polri;",
    "2. Para Kabag di lingkungan Ropsi SSDM Polri;",
    "3. Psikolog Madya Ropsi SSDM Polri.",
    "",
    "Assalamualaikum Wr. Wb.",
    "Salam sejahtera untuk kita semua.",
    "Om Swastyastu.",
    "Namo Buddhaya.",
    "Salam Kebajikan.",
    ...(data.pembuka && data.pembuka.trim() ? [data.pembuka.trim()] : []),
    ""
  ];

  const body = data.jenis === "karopsi"
    ? formatKaropsi(data.kegiatan || [])
    : formatKaro((data.kegiatan || [])[0] || {});
  if (body) blocks.push(body);

  if (data.penutup && data.penutup.trim()) blocks.push("", data.penutup.trim());

  blocks.push(
    "",
    "DUMM",
    "",
    "KABAGPSI RO SDM POLDA BANTEN",
    "",
    "SDM BERKEUNGGULAN",
    "POLISI BERSAMA MASYARAKAT",
    "INDONESIA MAJU"
  );

  return `${blocks.join("\n").trim()}\n`;
}
