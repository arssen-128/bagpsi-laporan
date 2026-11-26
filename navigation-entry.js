import { initNavigation } from "./features/navigation.js";

// Navigasi dipasang secara independen agar error pada editor/auth tidak mematikannya.
try {
  initNavigation();
} catch (error) {
  console.error("BAGPSI navigation initialization error:", error);
}
