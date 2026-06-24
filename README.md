# EREVDECO — Marble Heated Coaster

A world-class, bilingual (TR/EN) direct-to-consumer luxury landing page for **EREVDECO**, a premium home-product brand. The flagship product is a handcrafted **Marble Heated Coaster** (Mermer Isıtmalı Bardak Altlığı) that keeps coffee, tea and hot beverages warm for hours.

> *"Your Coffee Deserves More Than 10 Minutes."*

## Highlights

- **100% bespoke visual language** — no stock photos, no icon kits (Heroicons/Feather), no generic 3D. Every illustration is hand-authored inline SVG: procedural marble veining via SVG `feTurbulence` filters, patent-drawing line art, USB-C scenario sketches.
- **Cinematic hero** — large bespoke marble-warmer render (realistic veining, visible USB-C port, light refraction, live steam, heat halo) with scroll parallax.
- **Apple-style scroll storytelling** — a pinned, scroll-driven exploded **cross-section** (anatomy): marble surface → heat plate → heating element → sensor → USB-C module, with animated heat waves, power flow, and synced annotations across 6 phases.
- **Bespoke data viz** — the cooling-curve "problem" chart is a hand-drawn animated SVG (no chart library).
- **Original line-art sets** — 5 USB-C usage scenarios, a 4-step marble-origin story (quarry → processing → craft → object), and 8 custom feature icons.
- **Micro-interactions** — cursor-following warm light, drifting marble veins, button light-sweep, draw-on-scroll strokes.
- **Bilingual** — full Turkish + English, instant in-page toggle (no reload), persisted to `localStorage`, full key parity.
- **Conversion mechanics** — sticky mobile buy bar, scarcity counter, exit-intent discount modal, scroll progress, micro-trust signals.
- **Luxury system** — Cormorant Garamond + Inter, pure-white / kırık-beyaz / marble / anthracite / soft-gold palette, massive whitespace, `cubic-bezier` motion.
- **Performance & a11y** — zero build step, no framework, `prefers-reduced-motion` support, semantic markup, SEO + Product JSON-LD.

## Tech

Pure static site — HTML, CSS, vanilla JS. No build, no dependencies.

```
index.html         # landing page (TR default)
urun.html          # product / buy page (marble + bundle + qty → cart)
odeme.html         # checkout flow + order confirmation
hikaye.html        # brand story
kargo-iade.html    # shipping & returns
gizlilik.html      # privacy policy
kosullar.html      # terms of use
404.html           # luxury not-found
css/style.css      # full luxury design system + storefront
js/i18n.js         # TR/EN dictionary (271 keys, full parity)
js/main.js         # i18n, reveals, anatomy scroll, configurator, stats…
js/cart.js         # localStorage cart + slide-out drawer (all pages)
js/chrome.js       # shared nav + footer injector for sub-pages
sw.js              # service worker (offline shell cache)
manifest.webmanifest, favicon.svg, robots.txt, sitemap.xml
```

### Storefront
Full front-end commerce funnel — no backend: a `localStorage` cart with a slide-out drawer (shared across every page), a product page with live marble + bundle + quantity selection, and a checkout that validates, generates an order number, and clears the cart. Installable PWA with an offline shell cache; `robots.txt` + `sitemap.xml` for SEO.

## Run locally

```bash
# any static server, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push to GitHub.
2. Settings → Pages → Build from branch → `main` / root.
3. Custom domain `erevdeco.com` is set via the `CNAME` file; point the domain's DNS to GitHub Pages.

## Color system

| Token | Hex |
|---|---|
| Pure White | `#FFFFFF` |
| Warm Marble | `#F6F3EF` |
| Luxury Neutral | `#E9E4DD` |
| Deep Charcoal | `#151515` |
| Soft Gold | `#C9A86A` |

---

© 2026 EREVDECO. The product renders are CSS-built placeholders — swap in real cinematic photography for production.
