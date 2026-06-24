/* EREVDECO service worker — cache-first for the shell, network fallback. */
var CACHE = "erev-v2";
var ASSETS = [
  "./", "./index.html", "./urun.html", "./hikaye.html", "./odeme.html",
  "./404.html", "./kargo-iade.html", "./gizlilik.html", "./kosullar.html",
  "./css/style.css", "./js/i18n.js", "./js/main.js", "./js/cart.js",
  "./js/chrome.js", "./favicon.svg", "./manifest.webmanifest", "./assets/og.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
