/* EREVDECO — interaction layer */
(function () {
  "use strict";
  var state = { lang: "tr", phase: -1 };

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
    document.querySelectorAll(".lang-toggle__opt").forEach(function (o) {
      o.classList.toggle("is-active", o.getAttribute("data-lang") === lang);
    });
    // refresh the anatomy caption in the new language
    if (state.phase >= 0) setCaption(state.phase);
    try { localStorage.setItem("erev_lang", lang); } catch (e) {}
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Anatomy: scroll-driven phase machine ---------- */
  var anat, xsec, caption, layers;
  function setCaption(phase) {
    if (!caption) return;
    var dict = window.I18N[state.lang];
    var txt = dict && dict["anat.p" + phase];
    if (txt) { caption.style.opacity = 0; setTimeout(function () { caption.textContent = txt; caption.style.opacity = 1; }, 180); }
  }
  function setPhase(phase) {
    if (phase === state.phase) return;
    state.phase = phase;
    // classes on the cross-section
    var cls = ["is-p0", "is-p1", "is-p2", "is-p3", "is-p4", "is-p5"];
    cls.forEach(function (c, i) { xsec.classList.toggle(c, i === phase); });
    xsec.classList.toggle("is-exploded", phase >= 1 && phase <= 4);
    xsec.classList.toggle("is-coil", phase >= 2 && phase <= 4);
    xsec.classList.toggle("is-heat", phase === 3 || phase === 4);
    xsec.classList.toggle("is-power", phase === 4);
    // active layer in the panel
    var activeLayer = { 1: 1, 2: 3, 3: 2, 4: 5 }[phase] || 0;
    layers.forEach(function (li) {
      li.classList.toggle("is-active", parseInt(li.getAttribute("data-layer"), 10) === activeLayer);
    });
    setCaption(phase);
  }
  function initAnatomy() {
    anat = document.getElementById("anatomi");
    xsec = document.getElementById("xsec");
    caption = document.getElementById("anatCaption");
    layers = Array.prototype.slice.call(document.querySelectorAll(".layer"));
    if (!anat || !xsec) return;
    var ticking = false;
    function update() {
      var rect = anat.getBoundingClientRect();
      var total = anat.offsetHeight - window.innerHeight;
      var prog = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      var phase = Math.min(5, Math.floor(prog * 6));
      setPhase(phase);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Scroll progress + nav + hero parallax ---------- */
  function initScroll() {
    var bar = document.getElementById("scrollProgress");
    var nav = document.getElementById("nav");
    var stage = document.getElementById("heroStage");
    var hero = document.querySelector(".hero");
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var st = window.pageYOffset;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = "scaleX(" + (h > 0 ? st / h : 0) + ")";
        if (nav) nav.classList.toggle("is-scrolled", st > 30);
        if (stage && hero) {
          var hp = Math.min(1, st / (hero.offsetHeight || 1));
          stage.style.transform = "translateY(calc(-50% + " + hp * 60 + "px)) rotate(" + hp * -5 + "deg)";
          stage.style.opacity = String(1 - hp * 0.6);
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Cursor light ---------- */
  function initCursorLight() {
    var light = document.getElementById("cursorLight");
    if (!light || !window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;
    var x = 0, y = 0, tx = 0, ty = 0, raf = null;
    function loop() {
      tx += (x - tx) * 0.16; ty += (y - ty) * 0.16;
      light.style.left = tx + "px"; light.style.top = ty + "px";
      if (Math.abs(x - tx) > 0.5 || Math.abs(y - ty) > 0.5) { raf = requestAnimationFrame(loop); } else { raf = null; }
    }
    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY; light.classList.add("is-on");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    window.addEventListener("mouseleave", function () { light.classList.remove("is-on"); });
  }

  /* ---------- Sticky CTA ---------- */
  function initSticky() {
    var cta = document.getElementById("stickyCta");
    var order = document.getElementById("order");
    var hero = document.querySelector(".hero");
    if (!cta) return;
    if (order) new IntersectionObserver(function (en) {
      en.forEach(function (e) { cta.classList.toggle("is-hidden", e.isIntersecting); });
    }, { threshold: 0.2 }).observe(order);
    if (hero) new IntersectionObserver(function (en) {
      en.forEach(function (e) { cta.classList.toggle("is-armed", !e.isIntersecting); });
    }, { threshold: 0.3 }).observe(hero);
  }

  /* ---------- Exit intent ---------- */
  function initExit() {
    var modal = document.getElementById("exitModal");
    if (!modal) return;
    var shown = false;
    try { shown = localStorage.getItem("erev_exit") === "1"; } catch (e) {}
    function open() { if (shown) return; shown = true; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); try { localStorage.setItem("erev_exit", "1"); } catch (e) {} }
    function close() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); }
    document.addEventListener("mouseout", function (e) { if (e.clientY <= 0 && !e.relatedTarget) open(); });
    var armed = false; setTimeout(function () { armed = true; }, 12000);
    var lastY = window.pageYOffset;
    window.addEventListener("scroll", function () { var y = window.pageYOffset; if (armed && y < 200 && lastY - y > 40) open(); lastY = y; }, { passive: true });
    modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    var code = document.getElementById("exitCode");
    if (code) code.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(code.textContent.trim());
        var orig = code.textContent; code.textContent = state.lang === "tr" ? "Kopyalandı ✓" : "Copied ✓";
        setTimeout(function () { code.textContent = orig; }, 1400);
      } catch (e) {}
    });
  }

  /* ---------- Buy ---------- */
  function initBuy() {
    var buy = document.getElementById("buyBtn");
    if (buy) buy.addEventListener("click", function (e) {
      e.preventDefault();
      toast(state.lang === "tr" ? "Sepete eklendi — kasa yakında açılıyor." : "Added to cart — checkout opening soon.");
    });
  }
  function toast(msg) {
    var t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () { t.classList.remove("is-in"); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  /* ---------- Smooth anchors ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var el = document.querySelector(id); if (!el) return;
        e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Language wiring ---------- */
  function initLang() {
    var toggle = document.getElementById("langToggle");
    if (toggle) toggle.addEventListener("click", function () { applyLang(state.lang === "tr" ? "en" : "tr"); });
    var saved = null;
    try { saved = localStorage.getItem("erev_lang"); } catch (e) {}
    if (saved !== "tr" && saved !== "en") saved = (navigator.language || "").slice(0, 2) === "en" ? "en" : "tr";
    applyLang(saved);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initReveal();
    initAnatomy();
    initScroll();
    initCursorLight();
    initSticky();
    initExit();
    initBuy();
    initAnchors();
  });
})();
