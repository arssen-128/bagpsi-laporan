// Entry point navigasi yang berdiri sendiri dari modul Supabase/editor.
// Dengan demikian sidebar dan halaman arsip tetap bisa berpindah meskipun
// inisialisasi modul utama mengalami error.
import { initNavigation } from "./features/navigation.js?v=8";

initNavigation();
