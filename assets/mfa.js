// Segundo factor (TOTP de Supabase Auth) para la oficina y las páginas de administración. Fase 11.5b (A8).
// - cwMfa.asegurar(sb): si la persona ya activó el segundo factor y la sesión todavía no lo pasó, pide el código de 6 dígitos
//   de su app autenticadora. Devuelve true cuando la sesión queda en el nivel que corresponde; false si la persona cancela.
// - cwMfa.panel(sb, el): dibuja en `el` el estado del segundo factor y deja activarlo (código QR) o quitarlo.
// La base exige el segundo factor por su cuenta: es_admin() no deja entrar con una sesión sin él a quien ya lo activó.
// Nada de esto se activa solo: hasta que la persona inscribe su factor, entrar sigue igual que antes.
(function () {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const soloDigitos = (s) => String(s ?? "").replace(/\D/g, "").slice(0, 6);

  async function nivel(sb) {
    const { data, error } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return data;
  }
  async function factores(sb) {
    const { data, error } = await sb.auth.mfa.listFactors();
    if (error) throw error;
    return { verificados: (data?.totp ?? []).filter((f) => f.status === "verified"), todos: data?.all ?? [] };
  }

  function dialogo() {
    const fondo = document.createElement("div");
    fondo.className = "cw-mfa";
    fondo.setAttribute("role", "dialog");
    fondo.setAttribute("aria-modal", "true");
    fondo.setAttribute("aria-labelledby", "cwMfaTit");
    Object.assign(fondo.style, { position: "fixed", inset: "0", zIndex: "9999", background: "rgba(0,0,0,.72)", display: "grid", placeItems: "center", padding: "16px" });
    fondo.innerHTML = `<form style="width:100%;max-width:340px;background:#15151a;color:#f2f2f2;border:1px solid #333;border-radius:14px;padding:22px;font:16px/1.4 system-ui,sans-serif">
      <h2 id="cwMfaTit" style="margin:0 0 6px;font-size:20px">Código de tu app</h2>
      <p style="margin:0 0 14px;color:#b5b5b5;font-size:14px">Abre tu app autenticadora y escribe el código de 6 dígitos de «Creative Whisper».</p>
      <input name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" aria-label="Código de 6 dígitos"
        style="width:100%;box-sizing:border-box;font-size:24px;letter-spacing:6px;text-align:center;padding:12px;border-radius:10px;border:1px solid #444;background:#0d0d10;color:#fff">
      <div data-aviso role="alert" style="min-height:20px;margin:8px 0;color:#ff8a8a;font-size:14px"></div>
      <div style="display:flex;gap:8px"><button type="button" data-salir style="flex:1;padding:12px;border-radius:10px;border:1px solid #444;background:transparent;color:#ddd">Salir</button>
      <button type="submit" style="flex:2;padding:12px;border-radius:10px;border:0;background:#e9e3d6;color:#111;font-weight:700">Entrar</button></div></form>`;
    document.body.appendChild(fondo);
    const form = fondo.querySelector("form"), input = fondo.querySelector("input"), aviso = fondo.querySelector("[data-aviso]");
    input.addEventListener("input", () => { input.value = soloDigitos(input.value); });
    setTimeout(() => input.focus(), 30);
    return { fondo, form, input, aviso, salir: fondo.querySelector("[data-salir]"), cerrar: () => fondo.remove() };
  }

  let enCurso = null; // si ya hay un diálogo abierto, las llamadas siguientes esperan el mismo
  function asegurar(sb) {
    if (!enCurso) enCurso = asegurarUnaVez(sb).finally(() => { enCurso = null; });
    return enCurso;
  }
  async function asegurarUnaVez(sb) {
    let n;
    try { n = await nivel(sb); } catch (e) { return true; } // la base decide igual (es_admin exige el factor si existe)
    if (n.currentLevel === "aal2") return true;
    // Los factores se piden al servidor (no a la sesión guardada, que puede estar desactualizada).
    let f;
    try { f = (await factores(sb)).verificados[0]; } catch (e) { f = null; }
    if (!f) return true;
    return new Promise((resolver) => {
      const d = dialogo();
      d.salir.addEventListener("click", async () => { d.cerrar(); try { await sb.auth.signOut(); } catch (e) { /* nada */ } resolver(false); });
      d.form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const code = soloDigitos(d.input.value);
        if (code.length !== 6) { d.aviso.textContent = "Escribe los 6 dígitos."; return; }
        d.aviso.textContent = "";
        const boton = d.form.querySelector("[type=submit]");
        boton.disabled = true;
        const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: f.id, code });
        boton.disabled = false;
        if (error) { d.aviso.textContent = "Ese código no sirvió. Revisa la hora del celular y prueba con el siguiente."; d.input.select(); return; }
        d.cerrar();
        resolver(true);
      });
    });
  }

  async function panel(sb, el) {
    el.innerHTML = "Revisando…";
    let fs, n;
    try { fs = await factores(sb); n = await nivel(sb); } catch (e) { el.textContent = "No pude revisar el segundo factor: " + (e.message || e); return; }
    const activo = fs.verificados[0];
    if (activo) {
      el.innerHTML = `<p>✅ <b>Activo</b> desde ${esc(new Date(activo.created_at).toLocaleDateString("es-EC"))}. Cada vez que entres a la oficina te pedirá el código de tu app.</p>
        <p class="sub">Para cambiar de celular: quita este factor y activa el nuevo. Si pierdes el celular, la recuperación está en el informe de la fase 11.5b (borrar el factor desde Supabase).</p>
        <div class="acciones"><button class="btn" type="button" data-mfa-quitar>Quitar el segundo factor</button></div><div data-mfa-msg class="sub"></div>`;
      el.querySelector("[data-mfa-quitar]").addEventListener("click", async () => {
        if (n.currentLevel !== "aal2") { el.querySelector("[data-mfa-msg]").textContent = "Para quitarlo, sal y vuelve a entrar con el código."; return; }
        if (!confirm("¿Quitar el segundo factor? La oficina volverá a abrir solo con la contraseña.")) return;
        const { error } = await sb.auth.mfa.unenroll({ factorId: activo.id });
        if (error) { el.querySelector("[data-mfa-msg]").textContent = "No se pudo: " + error.message; return; }
        await sb.auth.refreshSession().catch(() => {});
        panel(sb, el);
      });
      return;
    }
    el.innerHTML = `<p>Sin segundo factor. Hoy quien tenga tu contraseña entra a la oficina.</p>
      <p class="sub">Necesitas una app autenticadora en tu celular (Google Authenticator, Microsoft Authenticator, 1Password u otra).</p>
      <div class="acciones"><button class="btn" type="button" data-mfa-activar>Activar el segundo factor</button></div><div data-mfa-paso></div>`;
    el.querySelector("[data-mfa-activar]").addEventListener("click", async (ev) => {
      ev.target.disabled = true;
      const paso = el.querySelector("[data-mfa-paso]");
      // Los intentos que quedaron a medias se quitan antes de empezar otro.
      for (const f of fs.todos.filter((x) => x.status !== "verified")) await sb.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
      const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Oficina CW " + new Date().toISOString().slice(0, 16), issuer: "Creative Whisper" });
      if (error) { paso.textContent = "No se pudo empezar: " + error.message; ev.target.disabled = false; return; }
      const qr = String(data?.totp?.qr_code ?? "");
      paso.innerHTML = `<p><b>1.</b> Escanea este código con tu app autenticadora.</p>
        ${/^data:image\/svg\+xml/.test(qr) ? `<img alt="Código QR para tu app autenticadora" style="width:200px;height:200px;background:#fff;padding:8px;border-radius:8px" data-mfa-qr>` : ""}
        <p class="sub">¿No puedes escanear? Escribe esta clave en la app: <code data-mfa-secreto style="user-select:all"></code></p>
        <p><b>2.</b> Escribe el código de 6 dígitos que te muestra la app.</p>
        <div class="fila2"><input class="salud-in" inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-mfa-codigo aria-label="Código de 6 dígitos"><button class="btn" type="button" style="flex:0 0 auto" data-mfa-confirmar>Confirmar</button></div>
        <div data-mfa-msg class="sub" role="alert"></div>`;
      const img = paso.querySelector("[data-mfa-qr]"); if (img) img.src = qr;
      paso.querySelector("[data-mfa-secreto]").textContent = String(data?.totp?.secret ?? "");
      const entrada = paso.querySelector("[data-mfa-codigo]");
      entrada.addEventListener("input", () => { entrada.value = soloDigitos(entrada.value); });
      paso.querySelector("[data-mfa-confirmar]").addEventListener("click", async (e2) => {
        const code = soloDigitos(entrada.value), msg = paso.querySelector("[data-mfa-msg]");
        if (code.length !== 6) { msg.textContent = "Escribe los 6 dígitos."; return; }
        e2.target.disabled = true;
        const r = await sb.auth.mfa.challengeAndVerify({ factorId: data.id, code });
        e2.target.disabled = false;
        if (r.error) { msg.textContent = "Ese código no sirvió. Revisa la hora del celular y prueba con el siguiente."; return; }
        el.innerHTML = `<p>✅ <b>Listo.</b> Desde ahora la oficina, finanzas y admin te pedirán el código de tu app al entrar. Las sesiones que estaban abiertas sin el código dejan de tener acceso.</p>`;
      });
    });
  }

  window.cwMfa = { asegurar, panel };
})();
