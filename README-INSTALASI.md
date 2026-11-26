# BAGPSI REPORT — Modular Revision

## Struktur
- `index.html` — markup aplikasi.
- `styles.css` — pintu masuk CSS.
- `css/` — tokens, layout, forms, preview, personnel, responsive.
- `src/config.js` — URL dan publishable key Supabase.
- `src/services/supabase.js` — inisialisasi client Supabase.
- `src/features/auth.js` — login, session, logout.
- `src/features/report-editor.js` — form, draf lokal, pelaksana, pratinjau.
- `src/features/cloud-reports.js` — simpan, buka, dan riwayat laporan cloud.
- `src/features/personnel.js` — master personel.
- `src/features/navigation.js` — navigasi sidebar.
- `src/utils/` — konstanta, DOM helpers, formatter laporan.

## Instalasi GitHub Pages
1. Backup repository yang sedang aktif.
2. Ekstrak ZIP ini.
3. Upload seluruh isi folder `BAGPSI-REPORT-modular` ke root repository, bukan folder pembungkusnya.
4. Pastikan `index.html`, `styles.css`, folder `css/`, dan folder `src/` berada sejajar di root repository.
5. Commit perubahan dan tunggu GitHub Pages selesai deploy.
6. Buka situs, lalu lakukan hard refresh (`Ctrl + Shift + R`).

## Kompatibilitas database
Kode ini mempertahankan nama tabel dan kolom yang dipakai versi sumber:
- `laporan_cloud`: `id`, `user_id`, `judul`, `jenis`, `data`, `isi_laporan`, `updated_at`.
- `personel_master`: `id`, `nrp`, `pangkat`, `nama`, `gelar`, `jabatan`, `bagian`, `status`, `created_at`, `updated_at`, `created_by`.
- RPC: `is_bagpsi_admin`.

Tidak ada migrasi SQL yang dijalankan atau diasumsikan.

## Catatan keamanan
- Hanya Supabase publishable/anon key yang boleh berada di frontend.
- Jangan pernah menaruh `service_role` key di file JavaScript frontend.
- Keamanan akses data harus ditegakkan melalui Supabase Row Level Security (RLS) dan policy database, bukan hanya dengan menyembunyikan tombol admin di UI.

## Revisi perilaku dari sumber
- Kolom "Salam pembuka" sekarang benar-benar dimasukkan ke hasil laporan; pada versi sumber kolom ini dikumpulkan tetapi tidak pernah dirender.
- Penanganan event sesi login dideduplikasi agar pemuatan awal sesi dan event autentikasi tidak memicu pemuatan data ganda.
- Perubahan input yang terjadi ketika penyimpanan cloud masih berlangsung akan dijadwalkan untuk disimpan setelah operasi sebelumnya selesai.

## Uji penerimaan setelah deploy
1. Login/logout dan pemulihan sesi.
2. Buat laporan KARO SDM (satu kegiatan).
3. Buat laporan KAROPSI (beberapa kegiatan).
4. Tambah/hapus pelaksana; pastikan urutan pangkat lalu nama.
5. Simpan manual, tunggu autosave, muat ulang riwayat, dan buka laporan tersimpan.
6. Buka Master Personel; pastikan daftar tampil.
7. Uji akun admin untuk tambah/edit/nonaktifkan; uji akun non-admin untuk mode lihat saja.
8. Pilih personel aktif pada kartu kegiatan dan tambahkan sebagai pelaksana.

## Batas verifikasi paket
Pemeriksaan yang dilakukan pada paket: sintaks seluruh modul JavaScript, keberadaan aset yang direferensikan HTML, dan resolusi seluruh import lokal. Koneksi live ke Supabase, hak admin, policy RLS, serta deployment GitHub Pages tetap harus diuji menggunakan akun dan project pemilik.
