# Content Model (draft)

How the data is shaped. **The live source of truth is the Supabase database**,
edited via the admin dashboard ([`accounts-and-admin.md`](./accounts-and-admin.md));
Markdown/CSV templates may seed it for bulk entry. Every record links to a
**spec-point ID** for cross-referencing.

> **Scope note (post requirements round):** **Quotes are NOT in scope** —
> `re.ibzz.uk` already covers them, so the Quote entity + the source-based quote-ID
> scheme below are **parked** (kept for reference, not built). Active entities are
> **Keyword**, **Question**, **Document** (index), and later **Note**.

## Spec structure (Eduqas, Christianity + Islam)

- **Component 1 — Religious, Philosophical & Ethical themes** (e.g. Relationships,
  Life & Death, Good & Evil, Human Rights).
- **Component 2 — Christianity** (Beliefs & Teachings, Practices).
- **Component 3 — Islam** (Beliefs & Teachings, Practices).

Each component → themes/units → spec points. Every piece of content links to a
**spec point ID** so notes, quotes, keywords, and questions can be cross-referenced.

## Entities

### Quote — ⛔ PARKED (out of scope; kept for reference only)
```
id            source-based reference (see scheme below), e.g. C-GEN-1-28
text          the quote
source        human-readable citation, e.g. "Genesis 1:28"
sourceRange   optional, e.g. "1:27–28" when the quote spans verses
religion      Christian | Muslim | Non-religious
themes        [ ... ]  one or more theme tags (a verse can serve several themes)
topics        [ ... ]  optional finer topics, e.g. "Marriage"
specPoints    [ ... ]  one or more spec-point IDs it supports
meaning       1-line: what it means / how to use it in an answer
stance        For | Against | Neutral (optional)
```
> A quote is keyed by its **source**, so it exists once and is linked from every
> theme/spec point that uses it (many-to-many).

### Theme tags (metadata — used by `themes`, notes, keywords, questions)

| Tag | Theme | Component |
|-----|-------|-----------|
| `RLP` | Relationships | 1 |
| `LD`  | Life & Death | 1 |
| `GE`  | Good & Evil | 1 |
| `HR`  | Human Rights | 1 |
| `CB`  | Christian Beliefs | 2 |
| `CP`  | Christian Practices | 2 |
| `IB`  | Islamic Beliefs | 3 |
| `IP`  | Islamic Practices | 3 |

### Keyword  ✅ active
```
term, definition, component, theme, specPointId
```

### Question (Question Bank)  ✅ active
```
id            QID — source-encoded, see question-ids.md (E.… / T.… / M.…)
component, theme, specPointId, questionType (A/B/C/D), tariff (2/5/8/15),
questionText, markScheme (band descriptors for all parts)
ao            optional metadata (AO1/AO2) — de-emphasised, not surfaced prominently
```
> Question IDs follow the **QID scheme** in [`question-ids.md`](./question-ids.md).
> No `linkedQuotes` (quotes are out of scope).

### Document (Misc-source index)  ✅ active
```
docId (freeform owner-typed slug), title, source, components[], topics[], notes
```
> Registers each `M.<DocID>…` source so Misc question IDs resolve in the database.

### Note (per topic / spec point)  🕓 Coming Soon (deferred)
```
specPointId, component, theme, title, body (Markdown)
```
> Authored in Markdown; surfaced later under the database / Topic Summaries.

## Quote reference scheme — **SOURCE-BASED (provisional, owner to confirm)**

The reference *is* the source citation: `RELIGION-SOURCE-LOCATION`. Stable,
human-readable, and naturally unique. Used in notes, mark schemes, AI prompts, and
conversation ("learn C-GEN-1-28").

**Key principle:** one **source = one quote entity**, tagged to *many* themes/spec
points. A verse used in both Relationships and Human Rights exists once and is
linked from both — so the source-based ID never collides.

### Format by source type

| Source | Pattern | Example | Meaning |
|--------|---------|---------|---------|
| Christian Bible | `C-BOOK-CH-VS` | `C-GEN-1-28` | Genesis 1:28 |
| Christian — Catechism | `C-CAT-####` | `C-CAT-2258` | Catechism §2258 |
| Christian — Creed | `C-CREED-XX-N` | `C-CREED-AP-1` | Apostles' Creed, line 1 |
| Qur'an | `M-Q-SURAH-AYAH` | `M-Q-96-1` | Surah 96:1 |
| Hadith | `M-H-COLL-REF` | `M-H-BUK-9-89-252` | Sahih Bukhari 9:89:252 |
| Non-religious / philosophical | `P-AUTHOR-NN` | `P-SINGER-01` | a Peter Singer quote |

- **`RELIGION`** — `C` (Christian), `M` (Muslim), `P` (philosophical /
  non-religious: humanist, utilitarian, situation ethics — used in Component 1).
- Hadith collection codes: `BUK` (Bukhari), `MUS` (Muslim), `ABU` (Abu Dawud), … (extend as needed).

### Rules
- **Anchor verse for ranges.** A quote spanning verses uses the first verse as its
  ID (`C-GEN-1-27`); the full range is stored as metadata. Avoids hyphen ambiguity.
- **Duplicate disambiguation.** Two *different* quotes from the same verse get a
  trailing lowercase letter: `C-GEN-1-27a`, `C-GEN-1-27b`.
- **Bible book abbreviations** follow a recognised standard (OSIS/SBL): `GEN, EXO,
  LEV, NUM, DEU, … MATT, MRK, LUK, JHN, ACT, ROM, 1CO, 2CO, …`. Full table to be
  appended here.
- **Once assigned, an ID is permanent** — never reused or renamed.

### Sub-decisions — ✅ CONFIRMED by owner
1. ✅ Qur'an `M-Q-…` vs Hadith `M-H-…` markers.
2. ✅ Christian non-Bible codes `C-CAT-…`, `C-CREED-…`.
3. ✅ Include non-religious `P` quotes, author-based (`P-SINGER-01`).
4. ✅ Range = anchor verse + metadata; duplicates = trailing letter.

## Spec-point IDs

Every quote / note / keyword / question links to a **spec point**. Spec-point IDs
reuse the theme code + a number that mirrors Eduqas's own sub-section numbering
where possible (for traceability back to the official spec), e.g. `RLP-1`, `RLP-2`…
Full map: see [`spec-map.md`](./spec-map.md).
