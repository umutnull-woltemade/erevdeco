/* EREVDECO — shared cart (localStorage), drawer, badges. Loaded on every page. */
(function () {
  "use strict";
  var KEY = "erev_cart";
  var BUNDLES = { 1: { pieces: 1, price: 1690 }, 2: { pieces: 2, price: 2990 }, 3: { pieces: 3, price: 3990 } };
  var MARBLE = { calacatta: "Calacatta", nero: "Nero Marquina", emperador: "Emperador" };

  function lang() { return document.documentElement.lang === "en" ? "en" : "tr"; }
  function t(k) { var d = window.I18N && window.I18N[lang()]; return (d && d[k]) || k; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(); }
  function money(n) { return "₺" + Number(n).toLocaleString("tr-TR"); }
  function count() { return read().reduce(function (s, i) { return s + i.qty; }, 0); }
  function subtotal() { return read().reduce(function (s, i) { return s + BUNDLES[i.bundle].price * i.qty; }, 0); }
  function lineName(i) { return t("prod.title") + " — " + (MARBLE[i.marble] || "Calacatta") + " · " + t("prod.b" + i.bundle); }

  function add(bundle, marble, qty) {
    bundle = bundle || 1; marble = marble || "calacatta"; qty = qty || 1;
    var items = read(), id = bundle + "-" + marble;
    var ex = items.filter(function (i) { return i.id === id; })[0];
    if (ex) ex.qty += qty; else items.push({ id: id, bundle: bundle, marble: marble, qty: qty });
    save(items); openDrawer(); toast(t("cart.added"));
  }
  function setQty(id, qty) {
    var items = read(), ex = items.filter(function (i) { return i.id === id; })[0];
    if (ex) { ex.qty = qty; if (ex.qty <= 0) items = items.filter(function (i) { return i.id !== id; }); }
    save(items);
  }
  function remove(id) { save(read().filter(function (i) { return i.id !== id; })); }
  function clear() { save([]); }

  /* drawer */
  var drawer, cartRelease = null;
  function injectDrawer() {
    if (document.getElementById("cartDrawer")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="cart" id="cartDrawer" aria-hidden="true">' +
      '  <div class="cart__backdrop" data-cart-close></div>' +
      '  <aside class="cart__panel" role="dialog" aria-modal="true" aria-label="Cart">' +
      '    <header class="cart__head"><span class="cart__title" data-i18n="cart.title">Sepetiniz</span>' +
      '      <button class="cart__x" data-cart-close aria-label="Close">×</button></header>' +
      '    <div class="cart__body" id="cartBody"></div>' +
      '    <footer class="cart__foot" id="cartFoot"></footer>' +
      '  </aside></div>';
    document.body.appendChild(wrap.firstElementChild);
    drawer = document.getElementById("cartDrawer");
    drawer.querySelectorAll("[data-cart-close]").forEach(function (b) { b.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }
  function openDrawer() {
    injectDrawer(); render(); drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false");
    document.querySelectorAll("[data-cart-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var panel = drawer.querySelector(".cart__panel");
    if (window.ErevA11y && panel) cartRelease = window.ErevA11y.trap(panel, closeDrawer);
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true");
    document.querySelectorAll("[data-cart-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (cartRelease) { cartRelease(); cartRelease = null; }
  }

  function render() {
    // badges
    var c = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = c; el.classList.toggle("is-empty", c === 0);
      el.setAttribute("aria-live", "polite");
    });
    if (!drawer) drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    var body = document.getElementById("cartBody"), foot = document.getElementById("cartFoot");
    var items = read();
    if (!items.length) {
      body.innerHTML = '<p class="cart__empty">' + t("cart.empty") + '</p>' +
        '<a class="btn btn--ghost" href="urun.html">' + t("cart.shop") + "</a>";
      foot.innerHTML = ""; return;
    }
    body.innerHTML = items.map(function (i) {
      var line = BUNDLES[i.bundle].price * i.qty;
      return '<div class="citem" data-id="' + i.id + '">' +
        '<span class="citem__sw citem__sw--' + i.marble + '"></span>' +
        '<div class="citem__info"><b>' + lineName(i) + "</b>" +
        '<div class="citem__qty"><button data-dec aria-label="-">−</button><span>' + i.qty + "</span><button data-inc aria-label=\"+\">+</button>" +
        '<button class="citem__rm" data-rm>' + "✕" + "</button></div></div>" +
        '<span class="citem__price">' + money(line) + "</span></div>";
    }).join("");
    foot.innerHTML =
      '<div class="cart__row"><span data-i18n="cart.subtotal">' + t("cart.subtotal") + '</span><b>' + money(subtotal()) + "</b></div>" +
      '<div class="cart__row cart__row--muted"><span>' + t("cart.shipping") + "</span><span>" + t("cart.free") + "</span></div>" +
      '<a class="btn btn--solid cart__checkout" href="odeme.html">' + t("cart.checkout") + "</a>";
    body.querySelectorAll(".citem").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var it = items.filter(function (i) { return i.id === id; })[0];
      row.querySelector("[data-inc]").addEventListener("click", function () { setQty(id, it.qty + 1); });
      row.querySelector("[data-dec]").addEventListener("click", function () { setQty(id, it.qty - 1); });
      row.querySelector("[data-rm]").addEventListener("click", function () { remove(id); });
    });
  }

  /* toast */
  function toast(msg) {
    var el = document.createElement("div"); el.className = "toast"; el.textContent = msg;
    document.body.appendChild(el); requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () { el.classList.remove("is-in"); setTimeout(function () { el.remove(); }, 400); }, 2200);
  }

  function wire() {
    injectDrawer(); render();
    document.querySelectorAll("[data-cart-toggle]").forEach(function (b) {
      b.setAttribute("aria-haspopup", "dialog"); b.setAttribute("aria-expanded", "false");
      b.addEventListener("click", function (e) { e.preventDefault(); openDrawer(); });
    });
    document.querySelectorAll("[data-add-to-cart]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        add(parseInt(b.getAttribute("data-bundle") || "1", 10), b.getAttribute("data-marble") || (window.__EREV_MARBLE || "calacatta"), parseInt(b.getAttribute("data-qty") || "1", 10));
      });
    });
    // re-render dynamic strings when language toggles
    var lt = document.getElementById("langToggle");
    if (lt) lt.addEventListener("click", function () { setTimeout(render, 30); });
  }

  window.Cart = { add: add, remove: remove, setQty: setQty, clear: clear, read: read, count: count, subtotal: subtotal, money: money, open: openDrawer, BUNDLES: BUNDLES, MARBLE: MARBLE, lineName: lineName, render: render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
