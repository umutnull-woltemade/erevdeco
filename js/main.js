/* EREVDECO — interaction layer */
(function () {
  "use strict";

  var state = { lang: "tr" };

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    state.lang = lang;
    var dict = window.I18N[lang];
    if (!dict) return;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });

    // language toggle visual state
    document.querySelectorAll(".lang-toggle__opt").forEach(function (o) {
      o.classList.toggle("is-active", o.getAttribute("data-lang") === lang);
    });

    // restart rotator with current language
    buildRotator();
    try { localStorage.setItem("erev_lang", lang); } catch (e) {}
  }

  /* ---------- Rotating hero headline ---------- */
  var rotTimer = null, rotIndex = 0;
  function buildRotator() {
    var host = document.getElementById("rotator");
    if (!host) return;
    if (rotTimer) clearInterval(rotTimer);
    var dict = window.I18N[state.lang];
    var keys = window.HERO_KEYS;

    host.innerHTML = "";
    keys.forEach(function (k, i) {
      var span = document.createElement("span");
      span.className = "rotator__item" + (i === 0 ? " is-active" : "");
      span.textContent = dict[k];
      host.appendChild(span);
    });
    var items = host.querySelectorAll(".rotator__item");
    rotIndex = 0;
    rotTimer = setInterval(function () {
      items[rotIndex].classList.remove("is-active");
      rotIndex = (rotIndex + 1) % items.length;
      items[rotIndex].classList.add("is-active");
    }, 3400);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Scroll progress + nav state + scene parallax ---------- */
  function initScroll() {
    var bar = document.getElementById("scrollProgress");
    var nav = document.getElementById("nav");
    var stage = document.getElementById("stage");
    var hero = document.querySelector(".hero");
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var st = window.pageYOffset;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = "scaleX(" + (h > 0 ? st / h : 0) + ")";
        if (nav) nav.classList.toggle("is-scrolled", st > 30);

        // hero product: rotate + lift as you scroll through the hero
        if (stage && hero) {
          var hp = Math.min(1, st / (hero.offsetHeight || 1));
          stage.style.transform =
            "translateY(" + hp * -40 + "px) rotate(" + hp * 16 + "deg) scale(" + (1 - hp * 0.08) + ")";
          stage.style.opacity = String(1 - hp * 0.5);
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Sticky mobile CTA ---------- */
  function initSticky() {
    var cta = document.getElementById("stickyCta");
    var order = document.getElementById("order");
    if (!cta) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // hide sticky bar once we reach the order section, and while in hero
        cta.classList.toggle("is-hidden", en.isIntersecting);
      });
    }, { threshold: 0.2 });
    if (order) io.observe(order);

    // also reveal only after leaving hero
    var hero = document.querySelector(".hero");
    if (hero) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          cta.classList.toggle("is-armed", !en.isIntersecting);
        });
      }, { threshold: 0.3 });
      io2.observe(hero);
    }
  }

  /* ---------- Exit intent ---------- */
  function initExit() {
    var modal = document.getElementById("exitModal");
    if (!modal) return;
    var shown = false;
    try { shown = localStorage.getItem("erev_exit") === "1"; } catch (e) {}

    function open() {
      if (shown) return;
      shown = true;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      try { localStorage.setItem("erev_exit", "1"); } catch (e) {}
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    // desktop: mouse leaves top of viewport
    document.addEventListener("mouseout", function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) open();
    });
    // mobile fallback: fast scroll-up near top after some dwell
    var armed = false;
    setTimeout(function () { armed = true; }, 12000);
    var lastY = window.pageYOffset;
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      if (armed && y < 200 && lastY - y > 40) open();
      lastY = y;
    }, { passive: true });

    modal.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    // copy code on click
    var code = document.getElementById("exitCode");
    if (code) code.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(code.textContent.trim());
        var orig = code.textContent;
        code.textContent = state.lang === "tr" ? "Kopyalandı ✓" : "Copied ✓";
        setTimeout(function () { code.textContent = orig; }, 1400);
      } catch (e) {}
    });
  }

  /* ---------- Buy buttons (placeholder checkout) ---------- */
  function initBuy() {
    document.querySelectorAll('#buyBtn, .sticky-cta').forEach(function (b) {
      // allow anchor jump to #order for sticky; buyBtn shows toast
    });
    var buy = document.getElementById("buyBtn");
    if (buy) buy.addEventListener("click", function (e) {
      e.preventDefault();
      toast(state.lang === "tr"
        ? "Sepete eklendi — kasa yakında açılıyor."
        : "Added to cart — checkout opening soon.");
    });
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () {
      t.classList.remove("is-in");
      setTimeout(function () { t.remove(); }, 400);
    }, 2600);
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Language toggle wiring ---------- */
  function initLang() {
    var toggle = document.getElementById("langToggle");
    if (toggle) toggle.addEventListener("click", function () {
      applyLang(state.lang === "tr" ? "en" : "tr");
    });
    var saved = null;
    try { saved = localStorage.getItem("erev_lang"); } catch (e) {}
    if (saved !== "tr" && saved !== "en") {
      saved = (navigator.language || "").slice(0, 2) === "en" ? "en" : "tr";
    }
    applyLang(saved);
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initReveal();
    initScroll();
    initSticky();
    initExit();
    initBuy();
    initAnchors();
  });
})();
