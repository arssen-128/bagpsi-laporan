import { createSupabaseClient } from "./services/supabase.js";
import { createReportEditor } from "./features/report-editor.js";
import { createCloudReports } from "./features/cloud-reports.js";
import { createPersonnelModule } from "./features/personnel.js";
import { createAuth } from "./features/auth.js";
import { byId, setStatus } from "./utils/dom.js";

async function startApplication() {
  const loginError = byId("login-error");
  try {
    const client = createSupabaseClient();
    let currentUser = null;
    let cloudReports = null;

    const editor = createReportEditor({
      onChange: () => cloudReports?.scheduleSave()
    });

    cloudReports = createCloudReports({
      client,
      editor,
      getUser: () => currentUser
    });

    const personnel = createPersonnelModule({ client });

    const auth = createAuth({
      client,
      onSession: async (session) => {
        currentUser = session?.user || null;
        byId("auth-screen").hidden = Boolean(currentUser);
        byId("app-shell").hidden = !currentUser;
        if (currentUser) {
          byId("akun-info").textContent = currentUser.email || "Akun aktif";
          await personnel.setSession(session);
          cloudReports.onSessionChanged(currentUser);
        } else {
          await personnel.setSession(null);
          cloudReports.onSessionChanged(null);
        }
      }
    });

    editor.init();
    await auth.init();

    window.addEventListener("beforeunload", () => {
      cloudReports.cancelScheduledSave();
      auth.unsubscribe();
    });
  } catch (error) {
    console.error("BAGPSI REPORT initialization error:", error);
    setStatus(loginError, `Aplikasi gagal diinisialisasi: ${error.message || error}`, true);
  }
}

startApplication();
