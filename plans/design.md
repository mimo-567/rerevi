# Design / Aura

> Look and feel. Planning doc — no code yet. Goal: evoke a calm, premium revision
> vibe like `re.ibzz.uk` **without copying it** — clearly REREVI's own identity.

## Brand
- **Name:** **REREVI** (provisional). Wordmark/logo TBD.
- Tone: focused, modern, a little playful (the pixel display font gives character).

## Typography
- **Display / brand / headings: Bitcount Single** (Google Fonts — a pixel /
  dot-matrix style variable font). Distinctive and clearly *not* the reference
  site's Playfair serif.
- ⚠️ **Bitcount is decorative** — hard to read in long runs. By default use it for
  the **wordmark, big headings, and accents only**, paired with a **clean, highly
  readable body font** for notes/questions/UI (a neutral sans such as Inter / IBM
  Plex Sans / DM Sans — pick during build). The **body font is swappable.**

### "Bitcount Everything" mode (opt-in)
- A toggle that renders the **entire UI** — body text included — in **Bitcount
  Single**, for the full pixel aesthetic.
- **Separate axis from the colour theme** (works with light/dark/auto). Off by
  default; persists per account / locally. Purely a novelty/fun mode — the readable
  body font stays the default for actual revising.

## Colour
- **Distinct from `re.ibzz.uk`** — **avoid its gold (#c9a84c) + purple (#8b6fce)**.
- Direction (to refine): pick **one confident accent** in a different family — e.g.
  a teal/green or a warm coral/amber-red — on neutral greys, so it reads fresh and
  isn't mistaken for the reference. Final palette TBD.

## Theme modes
- **Colour:** light, dark, and auto (follow the OS/`prefers-color-scheme`). Default
  = **auto**; user can override and the choice persists (per account / local).
- **Typography:** normal (readable body) or **Bitcount Everything** (above). These
  two axes are independent — e.g. dark + Bitcount Everything is valid.

## Layout / motion (inspiration, not copied)
- Calm spacing, rounded cards, soft shadows — a similar *mood* to the reference,
  but our own grid, components, and pixel-accent personality.
- Subtle, tasteful motion only (no heavy effects).

## Open
- Exact palette + the body-font pairing → settle during the design build-out.
- Logo/wordmark treatment for "REREVI" in Bitcount.
