# Update 04 — Perbaikan dropdown personel pada template KAROPSI

## Bug yang diperbaiki
Dropdown "Pilih personel dari database master" pada kartu kegiatan baru dapat tertinggal pada status "Memuat database personel..." setelah pengguna mengganti jenis laporan dari KARO SDM ke KAROPSI (atau sebaliknya).

## Akar masalah
Modul personel sebelumnya hanya memperbarui dropdown yang sudah ada di DOM ketika data personel selesai dimuat. Ketika template diganti, editor menghapus kartu lama dan membuat kartu baru, tetapi dropdown pada kartu baru tidak ikut disinkronkan.

## Perbaikan
- Editor mengirim event `bagpsi:activity-added` setiap kali kartu kegiatan baru dibuat.
- Modul personel mendengarkan event tersebut dan mengisi dropdown kartu yang baru dengan data personel aktif yang sudah dimuat.
- Perbaikan berlaku untuk pergantian template dan penambahan kegiatan baru.
- Tidak ada perubahan skema database, tabel, RPC, maupun konfigurasi Supabase.

## File yang berubah
- `src/features/report-editor.js`
- `src/features/personnel.js`

## Pengujian statis
Pemeriksaan sintaks JavaScript dan keberadaan file paket dilakukan setelah perubahan. Pengujian live terhadap akun, RLS, dan data Supabase harus dilakukan setelah deployment.
