# EREVDECO — Marble Heated Coaster

A world-class, bilingual (TR/EN) direct-to-consumer luxury landing page for **EREVDECO**, a premium home-product brand. The flagship product is a handcrafted **Marble Heated Coaster** (Mermer Isıtmalı Bardak Altlığı) that keeps coffee, tea and hot beverages warm for hours.

> *"Your Coffee Deserves More Than 10 Minutes."*

## Highlights

- **Bilingual** — full Turkish + English with an instant in-page toggle (no reload), language persisted to `localStorage`.
- **Cinematic hero** — pure-CSS marble coaster + mug with live steam, scroll-driven rotation and parallax, rotating headlines.
- **Apple-style scroll story** — sticky pinned product with 3 narrative steps.
- **10 conversion sections** — problem, transformation, why marble, features, lifestyle gallery, social proof, gift psychology, specs, animated FAQ, emotional close.
- **Conversion mechanics** — sticky mobile buy bar, scarcity counter, exit-intent discount modal, scroll progress, micro-trust signals.
- **Luxury system** — Cormorant Garamond + Inter, marble/charcoal/soft-gold palette, generous whitespace, smooth `cubic-bezier` motion.
- **Performance & a11y** — zero build step, no framework, system-font fallbacks, `prefers-reduced-motion` support, semantic markup, SEO + Product JSON-LD.

## Tech

Pure static site — HTML, CSS, vanilla JS. No build, no dependencies.

```
index.html        # markup + content (TR default)
css/style.css     # full luxury design system
js/i18n.js        # TR/EN dictionary
js/main.js        # i18n, scroll reveal, rotator, sticky CTA, exit intent
CNAME             # erevdeco.com (GitHub Pages custom domain)
```

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
