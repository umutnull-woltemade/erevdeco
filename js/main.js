/* EREVDECO — interaction layer */
(function () {
  "use strict";
  var state = { lang: "tr", phase: -1 };

  /* ---------- Focus trap (shared via window.ErevA11y) ---------- */
  function focusables(c) {
    return c.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])');
  }
  function trap(container, onEsc) {
    var prev = document.activeElement;
    var f = focusables(container);
    if (f.length) f[0].focus();
    function onKey(e) {
      if (e.key === "Escape") { if (onEsc) onEsc(); return; }
      if (e.key !== "Tab") return;
      var list = focusables(container); if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener("keydown", onKey);
    return function release() {
      container.removeEventListener("keydown", onKey);
      if (prev && prev.focus) try { prev.focus(); } catch (e) {}
    };
  }
  window.ErevA11y = { trap: trap };

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
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
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
    var dots = document.querySelectorAll("#anatDots i");
    dots.forEach(function (d, i) { d.classList.toggle("is-on", i === phase); });
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
    var panel = modal.querySelector(".modal__panel"), release = null;
    function open() { if (shown) return; shown = true; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); release = trap(panel || modal, close); try { localStorage.setItem("erev_exit", "1"); } catch (e) {} }
    function close() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); if (release) { release(); release = null; } }
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

  /* ---------- Intro preloader ---------- */
  function initIntro() {
    var intro = document.getElementById("intro");
    if (!intro) return;
    var seen = false;
    try { seen = sessionStorage.getItem("erev_intro") === "1"; } catch (e) {}
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (seen || reduce) { intro.classList.add("is-done"); return; }
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      intro.classList.add("is-done");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("erev_intro", "1"); } catch (e) {}
    }, 1700);
  }

  /* ---------- Marble configurator ---------- */
  function initConfig() {
    var swatches = document.querySelectorAll(".swatch");
    if (!swatches.length) return;
    var saved = null;
    try { saved = localStorage.getItem("erev_marble"); } catch (e) {}
    function set(marble) {
      if (marble && marble !== "calacatta") document.body.setAttribute("data-marble", marble);
      else document.body.removeAttribute("data-marble");
      swatches.forEach(function (s) { s.classList.toggle("is-active", s.getAttribute("data-marble") === (marble || "calacatta")); });
      try { localStorage.setItem("erev_marble", marble || "calacatta"); } catch (e) {}
    }
    swatches.forEach(function (s) {
      s.addEventListener("click", function () { set(s.getAttribute("data-marble")); });
    });
    if (saved) set(saved);
  }

  /* ---------- Count-up stats ---------- */
  function initStats() {
    var nums = document.querySelectorAll(".stat__num");
    if (!nums.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-num"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target.toFixed(dec) + suffix; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec) + suffix;
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;
    document.querySelectorAll(".btn--solid, .btn--xl").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + mx * 0.18 + "px," + my * 0.28 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    var form = document.getElementById("newsletter");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("nlEmail");
      if (input && input.value && input.value.indexOf("@") > 0) {
        var dict = window.I18N[state.lang];
        toast((dict && dict["footer.nl.ok"]) || "Thanks!");
        input.value = "";
      }
    });
  }

  /* ---------- Skip link ---------- */
  function initA11y() {
    var main = document.querySelector("main") || document.querySelector("section");
    if (!main) return;
    if (!main.id) main.id = "maincontent";
    if (document.querySelector(".skip")) return;
    var s = document.createElement("a");
    s.className = "skip"; s.href = "#" + main.id; s.setAttribute("data-i18n", "skip"); s.textContent = "İçeriğe geç";
    document.body.insertBefore(s, document.body.firstChild);
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var burger = document.querySelector(".nav__burger");
    var links = document.querySelector(".nav__links");
    if (!burger || !links) return;
    var overlay = document.createElement("div");
    overlay.className = "navmenu";
    var inner = document.createElement("nav");
    inner.className = "navmenu__inner";
    Array.prototype.forEach.call(links.children, function (a) {
      var c = a.cloneNode(true); inner.appendChild(c);
    });
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    burger.setAttribute("aria-expanded", "false");
    var release = null;
    function close() { overlay.classList.remove("is-open"); burger.classList.remove("is-open"); document.body.style.overflow = ""; burger.setAttribute("aria-expanded", "false"); if (release) { release(); release = null; } }
    function open() { overlay.classList.add("is-open"); burger.classList.add("is-open"); document.body.style.overflow = "hidden"; burger.setAttribute("aria-expanded", "true"); release = trap(overlay, close); }
    burger.addEventListener("click", function () { overlay.classList.contains("is-open") ? close() : open(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay || e.target.tagName === "A") close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Announcement bar ---------- */
  function initAnnounce() {
    var dismissed = false;
    try { dismissed = localStorage.getItem("erev_announce") === "1"; } catch (e) {}
    if (dismissed) return;
    var dict = window.I18N[state.lang] || {};
    var bar = document.createElement("div");
    bar.className = "announce";
    bar.innerHTML = '<span data-i18n="announce">' + (dict["announce"] || "") + '</span><button class="announce__x" aria-label="Close">×</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.style.setProperty("--announce-h", bar.offsetHeight + "px");
    bar.querySelector("button").addEventListener("click", function () {
      try { localStorage.setItem("erev_announce", "1"); } catch (e) {}
      document.documentElement.style.setProperty("--announce-h", "0px");
      bar.classList.add("is-hidden");
      setTimeout(function () { bar.remove(); }, 400);
    });
  }

  /* ---------- Cookie consent ---------- */
  function initCookies() {
    var ok = false;
    try { ok = localStorage.getItem("erev_cookie") === "1"; } catch (e) {}
    if (ok) return;
    var dict = window.I18N[state.lang] || {};
    var bar = document.createElement("div");
    bar.className = "cookiebar";
    bar.innerHTML = '<span>' + (dict["cookie.text"] || "We use cookies.") + '</span>' +
      '<button class="btn btn--solid cookiebar__btn">' + (dict["cookie.accept"] || "Accept") + '</button>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add("is-in"); });
    bar.querySelector("button").addEventListener("click", function () {
      try { localStorage.setItem("erev_cookie", "1"); } catch (e) {}
      bar.classList.remove("is-in"); setTimeout(function () { bar.remove(); }, 400);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initA11y();
    initIntro();
    initLang();
    initAnnounce();
    initMenu();
    initCookies();
    initConfig();
    initReveal();
    initAnatomy();
    initStats();
    initScroll();
    initCursorLight();
    initMagnetic();
    initSticky();
    initExit();
    initBuy();
    initNewsletter();
    initAnchors();
  });
})();
