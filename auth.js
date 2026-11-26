import { byId, setStatus } from "../utils/dom.js";

export function createAuth({ client, onSession }) {
  const form = byId("login-form");
  const errorNode = byId("login-error");
  const submitButton = form.querySelector('button[type="submit"]');
  let lastUserId;

  function showSignedIn(session) {
    const user = session?.user || null;
    const userId = user?.id || null;
    byId("auth-screen").hidden = Boolean(user);
    byId("app-shell").hidden = !user;
    if (user) byId("akun-info").textContent = user.email || "Akun aktif";
    // Hindari pemanggilan ulang saat event login dan getSession mengembalikan sesi yang sama.
    if (userId !== lastUserId) {
      lastUserId = userId;
      onSession(session);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    setStatus(errorNode, "Memeriksa akun…");
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: byId("email-login").value.trim(),
        password: byId("password-login").value
      });
      if (error) throw error;
      setStatus(errorNode, "");
      showSignedIn(data.session);
    } catch (error) {
      setStatus(errorNode, `Login gagal: ${error.message || error}`, true);
    } finally {
      submitButton.disabled = false;
    }
  });

  byId("keluar").addEventListener("click", async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      setStatus(errorNode, `Gagal keluar: ${error.message}`, true);
      return;
    }
    showSignedIn(null);
  });

  async function init() {
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      showSignedIn(data.session);
    } catch (error) {
      setStatus(errorNode, `Tidak dapat memeriksa sesi: ${error.message || error}`, true);
    }
  }

  const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
    // Callback Supabase tidak menjalankan operasi async di dalam callback.
    queueMicrotask(() => showSignedIn(session));
  });

  return { init, unsubscribe: () => listener?.subscription?.unsubscribe() };
}
