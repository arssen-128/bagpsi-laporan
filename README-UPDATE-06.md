# BAGPSI REPORT — Update 06: Arsip Laporan (HTML + CSS + JavaScript)

Paket ini secara eksplisit menyertakan komponen halaman arsip, styling, dan navigasi:
- `index.html`: memuat menu sidebar `Laporan tersimpan` dan elemen halaman `#riwayat-panel`.
- `styles.css`: entry point stylesheet aplikasi.
- `css/layout.css`: styling halaman arsip dan aturan responsif arsip.
- `src/features/navigation.js`: logika perpindahan halaman, deep-link, hashchange, dan Back/Forward.

## Instalasi — replace sesuai path
1. `index.html` → root repository.
2. `styles.css` → root repository.
3. `css/layout.css` → folder `css/`.
4. `src/features/navigation.js` → folder `src/features/`.

Jangan memindahkan file dari foldernya. File `index.html` dalam paket ini sudah mempertahankan penggunaan logo `PSI.png`; pastikan file `PSI.png` tetap berada di root repository.

`src/main.js` yang sudah ada harus tetap memanggil `initNavigation()` dari `./features/navigation.js`.

Setelah commit dan GitHub Pages selesai deploy, lakukan hard refresh (Ctrl+Shift+R). Buka `https://arssen-128.github.io/bagpsi-laporan/#riwayat-panel` untuk menguji deep-link arsip.
