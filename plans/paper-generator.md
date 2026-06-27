# Past Paper / Question Generator

> Assembles a practice paper shaped like a **real Eduqas Route A paper**, pulling
> **only questions that are valid for each slot** of that paper. Driven entirely by
> the Question Bank + QID tags ([`question-ids.md`](./question-ids.md)).
>
> Planning doc — no code yet.

## 0. Two sub-tabs

The generator page has **two sub-tabs**, both reading the same Question Bank and
reusing the same **eligibility rule** (§3) and rendering (paper + mark scheme + AI
prompts):

1. **Full Paper** — assembles a complete, **exam-shaped** paper from a fixed
   blueprint (§1–§5). For realistic timed practice.
2. **Custom** — free-form question builder (§6). You choose the topic(s), the
   question type(s), and how many — e.g. *"5 A-type questions in Life and Death"*
   or *"an A+B+C+D set for Life and Death only"*. For targeted drilling.

## 1. The exam shape it must mimic

> ⚠️ **Confirm tariffs/structure against a current official Eduqas paper** before
> building — specs get revised. The shape below is the working assumption.

Every Eduqas Route A structured question has the same **four parts**, which map
directly onto our `<QuestionType>` letters:

| Type | Part | Tariff | AO | Style |
|------|------|--------|----|-------|
| `A` | (a) | 2 | (AO1) | "What is meant by…" — define a term |
| `B` | (b) | 5 | (AO1) | Describe / explain beliefs |
| `C` | (c) | 8 | (AO1) | Explain from two religious traditions / influence |
| `D` | (d) | 15 | (AO2) | Evaluate a statement ("Discuss this statement…") + SPaG on one per paper |

> **AOs de-emphasised** (owner's call): keep the **tariffs** (2/5/8/15) as the
> driver; AO labels are optional metadata, not surfaced prominently in the UI.

**Paper blueprints (working assumption):**

| Component | Structure | Marks |
|-----------|-----------|-------|
| 1 (Themes, 2 hr, 50%) | **All 4 themes**, each as one A+B+C+D question (30 each) | 120 |
| 2 (Christianity, 1 hr, 25%) | **2 questions** — one Beliefs topic + one Practices topic, each A+B+C+D | 60 |
| 3 (Islam, 1 hr, 25%) | **2 questions** — one Beliefs topic + one Practices topic, each A+B+C+D | 60 |

So a paper = an ordered list of **question groups**; each group fixes a
component + topic and contains the four parts A→D.

## 2. Data: the paper blueprint

A blueprint is data, not code, so it can be edited when the spec changes.

```
PaperBlueprint
  id            e.g. "component-1-full"
  component     1 | 2 | 3
  timeLimit     minutes
  groups[]      ordered question groups

Group
  topicSelector   FIXED(<topicNum>)  |  PICK_ONE(<set of topicNums>)
                  e.g. Component 1 = FIXED for each of the 4 themes;
                       Component 2/3 Beliefs group = PICK_ONE(beliefs topics)
  parts[]         the slots, normally [A, B, C, D]

Slot
  type      A | B | C | D
  tariff    from the table above
  ao        AO1 | AO2
  spag      bool — resolved from the paper's SPaG mode (see §4) for D-parts
```

## 3. Eligibility — "only valid questions per part"

For a given slot, a Question Bank entry is **eligible** iff **all** hold:

1. `question.component` == slot's group component
2. `question.topic` matches the group's resolved topic (after `topicSelector`)
3. `question.type` == slot.type  *(an A-slot only ever takes A questions, etc.)*
4. the question **has a mark scheme** (so marking works)
5. it passes the run's **filters** (see §4) and isn't already used in this paper

This is the rule that guarantees each part of the generated paper is filled only
with questions that could legitimately appear in that part of a real paper.

## 4. Generation options (user-facing)

- **Scope:** whole component paper · single theme/topic · custom mix.
- **Source preference:** `E` only (most authentic) · `E`+`T`+`M` · any. Default mix.
- **Exclude years:** omit `E.<year>…` questions the user has already sat.
- **SPaG mode:** **all D-parts** · **first D-part only** · **none** — sets the
  `spag` flag on the relevant D slots (also flows into the AI-marking prompt).
- **Seed / regenerate:** reproducible papers via a seed; "shuffle" for a new draw.
- **Keep-intact mode:** instead of mixing parts from different sources, pull a
  **complete A–D set that shares one source** (e.g. a whole real past-paper
  question) when available — for the most exam-realistic practice.
- **Output:** the paper + a **matching mark-scheme document** + per-question the
  **AI-marking prompt** ([`ai-marking-prompt.md`](./ai-marking-prompt.md)).
- **PDF / print export (v1):** export the paper as a clean PDF with an
  **exam-style title page** modelled on a real Eduqas paper — component/title,
  time allowed, total marks, and **instructions/guidance to candidates** — followed
  by the questions, then the mark scheme. Print stylesheet for tidy paper output.

## 5. Algorithm (sketch)

```
for each group in blueprint.groups:
    topic = resolve(group.topicSelector)         # fixed or random pick
    for each slot in group.parts:
        pool = questionBank.filter(eligible(slot, topic, filters, used))
        if pool empty: flag a gap (not enough questions for this part) and continue
        q = pick(pool, seed)                       # random within the pool
        used.add(q); paper.add(q)
render(paper) + render(markSchemes) + render(aiPrompts)
```

- **Coverage gaps** are surfaced, not hidden: if a part has no eligible question
  (common early on, while the bank is small), the generator says so — which doubles
  as a **to-author list** for the Question Bank.

## 6. Custom sub-tab (free-form builder)

No blueprint — the user defines the slots directly. They pick:

```
CustomRequest
  components[]   one or more (often just 1)
  topics[]       one or more themes/topics, OR "all in component"
  types[]        any subset of A / B / C / D
  count          how many per (type × topic), e.g. 5
  mode           FLAT  — a flat list of questions (e.g. "5 A-type in LD")
                 SET   — group into A→B→C→D sets per topic ("ABCD paper for LD")
  + shared options: source preference, exclude-years, seed   (same as §4)
```

**Worked examples**
- *"5 A-type questions in Life and Death"* → `topics=[LD]`, `types=[A]`,
  `count=5`, `mode=FLAT` → 5 eligible A-questions tagged LD.
- *"An ABCD paper for only Life and Death"* → `topics=[LD]`,
  `types=[A,B,C,D]`, `count=1`, `mode=SET` → one A, B, C, D for LD, in order.
- *"A 10-question C-type mixed drill across Component 1"* →
  `components=[1]`, `topics=[all]`, `types=[C]`, `count=10`, `mode=FLAT`.

**Behaviour**
- Uses the **same eligibility rule** (§3): types still only ever draw their own
  question type; topics/components must match; a mark scheme must exist.
- If a request can't be fully met (e.g. only 3 eligible A-questions exist for LD
  but 5 were asked), it returns what it can and **reports the shortfall** — again
  doubling as a to-author list.
- Output is identical to Full Paper: question sheet + matching mark scheme + the
  per-question AI-marking prompts.

## 8. Mark schemes, scoring & saved attempts

**Mark-scheme reveal.** Mark schemes are **hidden by default**. Each page of the
paper has a **"Show Mark Scheme"** button at the **end of the page** that reveals
the schemes for that page's questions. **A and B parts show full band
descriptors** (not just point lists), same as C and D.

**Scoring an attempt.** After answering, the user scores the paper one of two ways:

| Method | How |
|--------|-----|
| **AI marking** | Copy the per-question / whole-paper AI prompt ([`ai-marking-prompt.md`](./ai-marking-prompt.md)), paste answer + result, marks come back per question. |
| **Self-entry** | Reveal the mark scheme and **type in your own mark** per question. |

**Saved attempts (accounts).** A completed attempt is saved to the user's Supabase
account so scores persist and trend over time. Working shape (finalise in the data
schema step):

```
Attempt
  id, userId, createdAt
  source        FULL_PAPER | CUSTOM
  blueprintId / customRequest   (what was generated)
  method        AI | SELF
  items[]       { qid, markAwarded, tariff, band? }
  total, maxTotal, percent
```

This is the bridge between the generator and the **accounts + saved-scores**
feature — every generated paper can become a tracked, marked attempt.

## 9. Copyright note
Real `E.…` questions are copyrighted. Generated papers should **paraphrase**
exam-sourced text before display and/or **link** to the official paper, never
reproduce it verbatim. Our own `T`/`M`-authored and rewritten questions are safe.
