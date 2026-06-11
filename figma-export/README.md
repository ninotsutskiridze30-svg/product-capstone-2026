# TutorLink → Figma export

Static HTML mockup of all 18 pages, ready to import into Figma as editable layers.

## What you get

`index.html` contains 18 page frames stacked vertically, each 1440px wide:

| # | Page |
|---|---|
| 01 | Landing |
| 02 | Tutors list (public) |
| 03 | Tutor profile (public) |
| 04 | Login |
| 05 | Student register |
| 06 | Tutor register |
| 07 | Student dashboard — Home |
| 08 | Student — Bookings |
| 09 | Student — Homework |
| 10 | Student — Messages |
| 11 | Tutor dashboard — Home |
| 12 | Tutor — Calendar |
| 13 | Tutor — Bookings |
| 14 | Tutor — Groups |
| 15 | Tutor — Messages |
| 16 | Tutor — Homework |
| 17 | Tutor — Edit profile |
| 18 | Tutor — Settings |

Each frame uses the same colors, fonts, spacing, and component styles as the live app.

## Import into Figma (free path)

You need: a free Figma account + the **html.to.design** plugin (free tier = 5 imports/day, but we only need 1).

### Step 1 — Serve the HTML locally

In the project root, run:

```bash
npx serve figma-export
```

You'll see something like `Local: http://localhost:3000`. Keep that terminal open.

### Step 2 — Install the plugin

1. Open Figma → create a new design file
2. Top menu → `Resources` → `Plugins` tab → search **"html.to.design"** → click `Run`
3. (First time only) sign up for the free plan when it prompts

### Step 3 — Import

1. In the plugin, paste `http://localhost:3000` into the URL field
2. Set viewport width to **1440** (desktop)
3. Click **Import**
4. Wait ~15–30s. The plugin converts the page into Figma layers.

You'll get one big frame containing all 18 page sections, each labeled (e.g. `01 Landing`, `02 Tutors list`). The plugin preserves text, colors, borders, and spacing as editable Figma properties.

### Step 4 — Clean up (optional)

After import:
- Right-click each `page-frame` section → `Frame selection` to make them top-level frames
- Rename them using the labels (`01 Landing`, etc.) — the plugin uses the `aria-label` attribute, so they should already be named
- Drop into Figma pages: `File` → add page → drag related frames in

## Local fonts

The HTML references *Noto Serif Georgian* and *Noto Sans Georgian* by name but doesn't load them — your browser (and Figma) will substitute. After import, in Figma:

1. Select all text → right panel → change font to **Noto Serif Georgian** (headings) and **Noto Sans Georgian** (body) if you want exact fidelity
2. Or install Google Fonts → the plugin will keep the substituted font otherwise

## Re-importing later

If you change the HTML, just re-run the plugin against `http://localhost:3000`. Each import counts against the free daily limit, so batch your changes.

## Files

- `index.html` — all 18 page frames
- `styles.css` — design tokens (colors, type, components) extracted from the live app
- `README.md` — this file

No JS, no build step.
