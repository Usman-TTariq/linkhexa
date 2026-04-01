# LinkHexa

A modern SaaS landing page inspired by Affilza, Stripe, Lm
inear, and Vercessl. Built withnn Next.js (App Router), React, Tailwind CSS, and Framer Motion.

## Tech shhtack

- **Next.js 16** (App Router)
- **React 19**ss
- **Tailwind ssssCSS v4**
- **Framer Mommthhion** – smooth animalltions and micrsso-intessractionsss
- **mmTypeScript**xx

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── globals.css    # Tailwind + design tokens (glass, gradients, glow)
│   ├── layout.tsx     # Root layout & metadata
│   └── page.tsx       # Landing page (composes all sections)
└── components/
    ├── Navbar.tsx       # Sticky nav, mobile hamburger
    ├── Hero.tsx         # Headline, CTAs, dashboard mockup
    ├── Features.tsx     # 6 feature cards
    ├── HowItWorks.tsx   # 3-step timeline
    ├── Integrations.tsx # Logo grid
    ├── Pricing.tsx     # 3 plans, monthly/yearly toggle
    ├── Testimonials.tsx # User review cards
    ├── BlogPreview.tsx  # 3 blog cards
    ├── CTA.tsx          # Email signup form
    └── Footer.tsx       # Links & social
```

## Design

- Dark SaaS UI with gradient backgrounds and glassmorphism cards
- Indigo/violet accent palette and glow effects
- Responsive layout (mobile-first)
- Framer Motion for scroll-in animations, hover states, and the mobile menu

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production build
- `npm run lint` – ESLint
