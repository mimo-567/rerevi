# Question-ID (QID) scheme

> Every question in the Question Bank carries a **QID** that encodes where it came
> from. QIDs drive the **Past Paper / Question Generator**, **Question Lookup**, and
> cross-referencing in mark schemes and AI-marking prompts.
>
> This is **separate** from the source-based **quote** IDs (`C-GEN-1-28`, etc., in
> [`content-model.md`](./content-model.md)). Quotes ≠ questions.

## Unified grammar (standardised — decided)

All QIDs follow **one consistent field order**:

```
<source> . <locator> . <Component> . <Topic> [ . <NNN> ] . <Type>
```

- **`<source>`** — `E` exam · `T` textbook · `M` misc.
- **`<locator>`** — source-specific: exam **year** (`E`), **page** (`T`), or
  **Document ID** (`M`).
- **`<Component>` then `<Topic>`** — always in that order (component first).
- **`<NNN>`** — `000`–`999` sequence number, used by `T` and `M` only.
- **`<Type>`** — the Eduqas part letter, **always last**.

### `E` — Exam (past-paper) question  *(no sequence number)*
```
E . <YYYY> . <Component> . <Topic> . <Type>
```
- **Example:** `E.2024.1.2.A` → 2024 paper, **Component 1**, topic **2 = Life and
  Death**, type **A**.

### `T` — Textbook question
```
T . <Page> . <Component> . <Topic> . <NNN> . <Type>
```
- `<NNN>` = order **on that page**.
- **Example:** `T.27.1.1.000.D` → page **27**, **Component 1**, topic **1 =
  Relationships**, **first** on the page, type **D**.

### `M` — Misc question (any RE file you have)
```
M . <DocID> . <Component> . <Topic> . <NNN> . <Type>
```
- `<NNN>` = unique question number **within that document**.
- **Example:** `M.LD-MOCK-01.1.2.000.A` → document `LD-MOCK-01`, **Component 1**,
  topic **2 = Life and Death**, question **1**, type **A**.

> **Note — translation from the original spec.** The first draft had `E` ordered
> topic→component and `T` with type before the number. The standardised forms
> above swap those so every pattern reads component→topic with the **type last**.
> e.g. original `E.2024.2.1.A` → `E.2024.1.2.A`; `T.27.1.1.D.000` → `T.27.1.1.000.D`.

## Document IDs for Misc (`<DocID>`) — decided

A Misc document is **any RE-spec file the owner has** (worksheet, revision pack,
non-official mock, PDF, etc.). The DocID is a **freeform slug the owner types
themselves** — no fixed convention required; just keep it readable and unique so it
can be looked up later in the MEGA RE DATABASE.

- Freeform examples: `LD-MOCK-01`, `relationships-pack`, `mr-x-handout3`.
- Each DocID is **registered once** in the **documents index** (DB table — see
  `content-model.md` → Document) mapping the slug → title, source,
  component(s)/topic(s), notes. Questions then reference the slug.
- A slug is **permanent once assigned** (don't rename/reuse).

## Field reference

### Component numbers
| # | Component |
|---|-----------|
| 1 | Religious, Philosophical & Ethical themes |
| 2 | Christianity |
| 3 | Islam |

### Topic numbers within each component  *(proposed — confirm)*
| Component | 1 | 2 | 3 | 4 |
|-----------|---|---|---|---|
| **1** | Relationships | Life and Death | Good and Evil | Human Rights |
| **2** (Christianity) | Beliefs & teachings | Practices | — | — |
| **3** (Islam) | Beliefs & teachings | Practices | — | — |

### Question type
`<QuestionType>` = the Eduqas **part letter** (`A`, `B`, `C`, `D`) — the a/b/c/d
structured-question parts, each with its own tariff and AO. The type→tariff/AO
mapping table lives in [`paper-generator.md`](./paper-generator.md) §1 (confirm
against a current official paper).

## Resolved decisions
- ✅ **Field order standardised** → `source · locator · Component · Topic · [NNN] · Type` (above).
- ✅ **Document ID** → owner-typed descriptive slug, registered in a documents index.

## How QIDs are used
- **Generator** filters by any field (year, component, topic, type) to assemble papers.
- **Question Lookup** resolves a pasted QID to the question + mark scheme.
- Each question also links to **spec-point IDs** (`LD-2`, …) and **quote IDs** so
  generated papers can pull matching quotes and coverage tracking stays in sync.
- ⚠️ **Copyright:** real Eduqas (`E.…`) questions are copyrighted — store the QID +
  our own metadata and **link** to the official paper; **paraphrase** before
  publishing question text. Textbook (`T.…`) questions: same caution.
