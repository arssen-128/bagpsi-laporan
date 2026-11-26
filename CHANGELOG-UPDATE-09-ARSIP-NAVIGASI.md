# Update 09 — Arsip dan navigasi

## Perubahan
- Navigasi sidebar sekarang diinisialisasi melalui `src/navigation-entry.js`, terpisah dari bootstrap editor/auth pada `src/main.js`.
- Perpindahan halaman Buat Laporan dan Laporan Tersimpan menggunakan handler navigasi khusus serta mendukung tombol Back/Forward browser.
- Halaman Laporan Tersimpan menggunakan layout tabel mengikuti mockup.
- Arsip membaca `id, judul, jenis, data, updated_at` dari tabel `laporan_cloud`.
- Pencarian mencakup judul, penerima, nama kegiatan, uraian, hasil, dan lokasi yang tersimpan di JSON `data`.
- Filter template/periode dan pagination 5 baris per halaman.
- Tombol Buka membuka kembali laporan melalui editor yang sudah ada.
- Tampilan mobile/tablet ditambahkan.

## Catatan
- Data arsip tidak dibuat dummy; sumbernya tetap tabel Supabase `laporan_cloud`.
- Tanggal laporan diturunkan dari tanggal kegiatan paling awal dalam `data.kegiatan`.
- Menu opsi tiga titik saat ini hanya menampilkan konfirmasi placeholder dan TIDAK menghapus data.
- Pemeriksaan yang dilakukan: seluruh file JavaScript lolos `node --check`, dan pemeriksaan struktur elemen/urutan script lulus.
- Belum dilakukan pengujian browser end-to-end atau pengujian koneksi Supabase pada akun pengguna.
