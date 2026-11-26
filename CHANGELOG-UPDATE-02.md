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
