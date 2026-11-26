# BAGPSI REPORT — Update 02

## Master Personel

1. Pagination 12 baris per halaman.
2. Pencarian nama, pangkat, NRP, gelar, jabatan, dan bagian/satuan.
3. Ringkasan total personel, aktif, nonaktif, dan hasil filter.
4. Filter status aktif/semua/nonaktif.
5. Hak admin tetap membatasi tambah, edit, dan perubahan status; akun non-admin hanya melihat dan memilih personel aktif.
6. Snapshot pelaksana pada laporan menyimpan identitas saat ditambahkan, sehingga arsip tidak berubah ketika data master diedit/nonaktifkan.

## Kompatibilitas

- Tidak mengubah nama tabel, kolom, atau RPC Supabase.
- Tidak memerlukan SQL migration.
- Tetap memakai tabel `personel_master` dan RPC `is_bagpsi_admin`.

## Verifikasi

- Seluruh file JavaScript diperiksa dengan `node --check`.
- Seluruh aset HTML, import lokal JavaScript, dan import CSS diperiksa keberadaannya.
- Pengujian langsung ke Supabase dan deployment GitHub Pages tetap harus dilakukan pada project pemilik.


## Update 03 — Halaman Laporan Tersimpan

1. Menu sidebar **Laporan tersimpan** kini membuka halaman arsip tersendiri, bukan sekadar anchor ke bagian sidebar.
2. Halaman arsip menampilkan daftar laporan online dalam tata letak kartu yang responsif untuk desktop dan ponsel.
3. Tombol muat ulang tersedia pada halaman arsip.
4. Tombol **Buat laporan baru** dari arsip kembali ke editor dan memulai laporan kosong.
5. Memilih salah satu arsip akan membuka laporan tersebut kembali di editor.
6. URL hash `#riwayat-panel` dapat dibuka langsung dan navigasi browser Back/Forward ditangani.
