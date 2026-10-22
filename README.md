# Schedule For You

Post scheduler web app, built from the Claude Design prototypes. Next.js 15 (App Router) + React 19, ready to deploy on Vercel.

| Route    | Screen                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------- |
| `/`      | Landing page                                                                                    |
| `/app`   | Dashboard: Overview, Queue, Calendar, Bulk scheduling, Media library, Accounts, Analytics, Settings, New post |
| `/brand` | Logo and brand sheet                                                                            |

On phones the dashboard switches to a top bar, a bottom tab bar (Home, Queue, Create, Calendar, More) and a slide-in menu; desktop layout is unchanged.

The dashboard runs entirely in the browser on sample data (Maya's workspace, Field & Co., Northside Coffee). There is no backend or database yet, so changes reset on reload.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Deploy to Vercel

Import the repo in Vercel (or run `vercel`). It detects Next.js automatically: no environment variables or extra settings are needed.

## How the code is organised

- `components/DashboardView.jsx`, `LandingView.jsx`, `BrandView.jsx`: the markup and styles for each page.
- `components/Dashboard.jsx`, `Landing.jsx`, `Brand.jsx`: state and behaviour (React class components).
- `lib/dc.js`: small rendering helpers shared by the views.
- `public/logos`, `public/icons`: the app logo, platform logos and nav icons.
- `design/`: the original Claude Design prototypes these pages were built from.

The view and logic files are generated from `design/*.dc.html` by `scripts/convert-design.mjs`, which keeps the pages identical to the prototypes. If you export an updated design, drop the new `.dc.html` files into `design/` and run:

```bash
npm run design:convert
```

This overwrites the files in `components/`, so if you have hand-edited them, make the same change in the design file or re-apply your edits after converting.
