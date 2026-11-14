# Abandoned but not Forgotten

An interactive **space-archaeology** experience — an archive of abandoned and
inactive human-made equipment on the Moon and Mars. Built for the NASA Space
Apps Challenge.

**First expedition:** Apollo 11 — Tranquility Base.

## Tech stack

- React 19 + TypeScript (strict) + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Three.js / React Three Fiber / Drei — 3D survey environments (pending)
- Framer Motion — interface motion
- Lucide React — iconography
- React Router (data router)

## Getting started

```bash
npm install
npm run dev      # development server
npm run build    # typecheck + production build
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Structure

```
src/
├── app/               # Router configuration
├── components/
│   ├── layout/        # AppLayout (application shell)
│   └── ui/            # Reusable primitives (HudPanel, StatusChip)
├── data/              # Expedition registry (placeholders, no fabricated data)
└── pages/
    ├── archive/       # Archive landing page
    ├── expeditions/   # Selection, expedition workspace, artifact inspection
    └── NotFoundPage
```

## Design system

Defined CSS-first in `src/index.css` (Tailwind v4 `@theme`):

- **Surfaces:** `void`, `charcoal-*` (dark interface panels)
- **Foreground:** `lunar-*` greys (text and terrain reference)
- **Signals:** muted `amber-signal*` (pending states), pale `cyan-signal*` (active telemetry)
- **Typography:** Space Grotesk (display), IBM Plex Mono (data readouts)
- **Utilities:** `hud-panel`, `hud-grid`, `data-label`, `data-value`, `hairline`, `animate-signal-pulse`

## Content policy

No survey, mission, or artifact data is fabricated. Placeholder views
explicitly report their build state (`pending survey`, `unregistered`) until
real, sourced data is ingested.

Interface photography comes from the NASA Johnson Space Center Apollo 11
archive (public domain). Full source URLs, frame IDs and treatment notes are
preserved in [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

## Roadmap

- [x] Project foundation, design system, routing, layout, placeholder pages
- [ ] Isometric 2.5D lunar terrain environment (Apollo 11)
- [ ] Stylised 3D artifact models and inspection viewer
- [ ] Sourced data registry with citation pipeline
