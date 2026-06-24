/* EREVDECO — shared nav + footer for sub-pages (body[data-chrome="1"]). */
(function () {
  "use strict";
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }

  // global utility chrome on every page
  if (!document.querySelector(".scroll-progress")) document.body.insertBefore(el('<div class="scroll-progress" aria-hidden="true"></div>'), document.body.firstChild);
  if (!document.querySelector(".cursor-light")) document.body.appendChild(el('<div class="cursor-light" id="cursorLight" aria-hidden="true"></div>'));
  // fix ids the scroll handler looks up
  var sp = document.querySelector(".scroll-progress"); if (sp && !sp.id) sp.id = "scrollProgress";

  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });

  if (document.body.getAttribute("data-chrome") !== "1") return;

  var nav = el(
    '<header class="nav nav--solid" id="nav">' +
    '  <a href="index.html" class="nav__brand">EREVDECO</a>' +
    '  <nav class="nav__links" aria-label="Primary">' +
    '    <a href="index.html" data-i18n="nav.home">Ana Sayfa</a>' +
    '    <a href="urun.html" data-i18n="nav.shop">Ürün</a>' +
    '    <a href="hikaye.html" data-i18n="nav.story">Hikâye</a>' +
    '    <a href="index.html#faq" data-i18n="nav.faq">SSS</a>' +
    '  </nav>' +
    '  <div class="nav__actions">' +
    '    <button class="lang-toggle" id="langToggle" aria-label="Switch language">' +
    '      <span class="lang-toggle__opt is-active" data-lang="tr">TR</span><span class="lang-toggle__sep">/</span><span class="lang-toggle__opt" data-lang="en">EN</span>' +
    '    </button>' +
    '    <button class="nav__cartbtn" data-cart-toggle aria-label="Cart"><span class="nav__carticon"></span><span class="nav__cartbadge" data-cart-count>0</span></button>' +
    '    <button class="nav__burger" aria-label="Menu"><span></span><span></span></button>' +
    '  </div>' +
    "</header>");
  document.body.insertBefore(nav, document.body.firstChild);

  var footer = el(
    '<footer class="footer">' +
    '  <div class="footer__brand">EREVDECO</div>' +
    '  <p data-i18n="footer.tag">Günlük ritüelleriniz için yapılmış masaüstü objeler.</p>' +
    '  <form class="newsletter" id="newsletter" novalidate>' +
    '    <input type="email" class="newsletter__input" id="nlEmail" placeholder="ornek@eposta.com" data-i18n-ph="footer.nl.ph" aria-label="E-posta" required />' +
    '    <button type="submit" class="btn btn--solid newsletter__btn" data-i18n="footer.nl.cta">Haberdar Et</button>' +
    '  </form>' +
    '  <div class="footer__links">' +
    '    <a href="urun.html" data-i18n="nav.shop">Ürün</a>' +
    '    <a href="hikaye.html" data-i18n="nav.story">Hikâye</a>' +
    '    <a href="kargo-iade.html" data-i18n="legal.ship.title">Kargo & İade</a>' +
    '    <a href="gizlilik.html" data-i18n="legal.priv.title">Gizlilik</a>' +
    '    <a href="kosullar.html" data-i18n="legal.terms.title">Koşullar</a>' +
    '  </div>' +
    '  <p class="footer__copy">© 2026 EREVDECO. <span data-i18n="footer.rights">Tüm hakları saklıdır.</span></p>' +
    "</footer>");
  document.body.appendChild(footer);
})();
