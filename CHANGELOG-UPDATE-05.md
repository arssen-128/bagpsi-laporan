# BAGPSI REPORT — Update 05: Navigasi Arsip

## Perbaikan
- Klik menu sidebar **Laporan tersimpan** sekarang ditangani melalui event delegation pada `.side-nav`.
- Klik pada teks maupun ikon di dalam menu tetap membuka halaman arsip.
- Halaman editor disembunyikan dan halaman `#riwayat-panel` ditampilkan.
- Navigasi langsung melalui URL hash, tombol Back/Forward browser, dan refresh halaman didukung.
- Setelah halaman arsip dibuka, aplikasi mengirim event `bagpsi:archive-opened` agar daftar arsip dimuat ulang.

## Instalasi
Replace satu file saja:
`src/features/navigation.js`

Jangan menaruh file ini di root repository. Pertahankan struktur folder `src/features/`.

Setelah commit dan deployment GitHub Pages selesai, lakukan hard refresh (Ctrl+Shift+R), lalu klik **Laporan tersimpan**.
