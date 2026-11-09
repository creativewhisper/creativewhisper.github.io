// Service worker de la app de Bosco: recibe las llamadas y avisos (Web Push) y abre la app en el caso o la tarea.
const VERSION = "bosco-2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { titulo: "Bosco", cuerpo: e.data ? e.data.text() : "" }; }
  const llamada = d.tipo === "llamada", mensaje = d.tipo === "mensaje";
  const acciones = llamada ? [{ action: "contestar", title: "📞 Contestar" }, { action: "luego", title: "Ahora no" }]
    : (Array.isArray(d.acciones) ? d.acciones.slice(0, 2).map((a) => ({ action: String(a.action), title: String(a.title) })) : []);
  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const v of ventanas) v.postMessage({ tipo: "push", carga: d });
    await self.registration.showNotification(d.titulo || "Bosco", {
      body: d.cuerpo || "", icon: "icono-192.png", badge: "insignia-96.png", tag: d.tag || undefined, renotify: true,
      requireInteraction: llamada || mensaje, silent: false, timestamp: Date.now(),
      vibrate: llamada ? [900, 400, 900, 400, 900, 400, 900, 400, 900] : mensaje ? [300, 150, 300, 150, 300] : [200, 100, 200],
      data: { url: d.url || "./", urls: Object.fromEntries((Array.isArray(d.acciones) ? d.acciones : []).map((a) => [String(a.action), String(a.url || "")])) },
      actions: acciones,
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "luego") return;
  const datos = e.notification.data || {};
  const url = new URL((e.action && datos.urls && datos.urls[e.action]) || datos.url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const v of ventanas) {
      if (v.url.startsWith(self.registration.scope)) { v.postMessage({ tipo: "abrir", url }); return v.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
