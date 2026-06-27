# AI-marking prompt generator

> The site auto-builds a **copy-paste prompt** a student drops into any AI
> (ChatGPT / Claude / Gemini / Grok) **together with their answer** to get an
> **approximate** Eduqas-style mark + feedback. The site fills the `{placeholders}`
> from the Question Bank; the student only writes their answer.
>
> Planning doc — no code yet. It marks against **our** mark schemes, so it's a
> revision aid, **not** an official result.

## 1. What the site injects

All of these come straight from the question's record (QID-tagged), so generation
is automatic:

- `{qid}`, `{component}`, `{topicName}`, `{specPoints}`
- `{type}` (A/B/C/D), `{tariff}`, `{spag}` (if applicable). *(AO is de-emphasised —
  the tariff + band descriptors drive marking; AO is optional, not foregrounded.)*
- `{questionText}`
- `{markScheme}` — **band descriptors for every part, A–D** (A/B included, not just
  point lists)
- `{indicativeContent}` — exemplar points the answer could include
- `{studentAnswer}` — the **only** field the student fills

## 2. Single-question prompt template

```
You are an experienced Eduqas GCSE Religious Studies (Route A) examiner. Mark the
student's answer ONLY against the mark scheme provided. Be fair but rigorous, and
use the exact band/level boundaries given. Do not invent extra criteria.

QUESTION
- Component {component} · Theme/Topic: {topicName} · Spec: {specPoints}
- Part {type} · {tariff} marks{spagLine}
- Question: {questionText}

MARK SCHEME (band/level descriptors)
{markScheme}

INDICATIVE CONTENT (possible creditworthy points — not a checklist)
{indicativeContent}

STUDENT ANSWER
"""
{studentAnswer}
"""

INSTRUCTIONS
1. Decide which band/level the answer sits in, and justify it against the
   descriptor wording.
2. Give a numeric mark out of {tariff}.
3. List 2–3 specific strengths (quote the student where relevant).
4. List the precise gaps that stop it reaching the next band (no evaluation/
   judgement, no scripture/source, one-sided argument, etc.).
5. Give ONE improved exemplar paragraph at the top band.
{spagInstruction}

OUTPUT FORMAT (exactly)
Mark: X / {tariff}  (Band/Level n)
Why this band: …
Strengths: …
To reach the next band: …
Exemplar upgrade: …

Remember: this is an approximate practice mark, not an official Eduqas result.
```

- `{spagLine}` → ` · includes SPaG` only when `spag` is true (set by the paper's
  SPaG mode — all D-parts / first D-part / none); else empty.
- `{spagInstruction}` → an extra step asking for a SPaG judgement, only when `spag`.
- **All parts A–D use band descriptors**, so the band/level marking language applies
  uniformly (no point-list fallback).

## 3. Whole-paper variant

For a generated paper, the site can emit **one bundled prompt** that lists every
question + mark scheme in order with answer slots, plus a final instruction:

```
…mark EACH question as above, then give:
TOTAL: sum / paper total
Per-question table: QID | mark | band
Overall feedback: top 3 things to improve across the paper.
```

(Optionally the site emits one prompt per question instead — better for long papers
that would overflow an AI's context window.)

## 4. Design notes
- **Self-contained:** the prompt carries the mark scheme inline, so the AI never
  needs the rest of the site.
- **Constrained:** "mark ONLY against the scheme" + fixed output format reduces the
  AI grading on vibes.
- **Honest framing:** every prompt states the mark is approximate.
- **AO-aware:** AO1 parts reward knowledge/understanding; AO2 (`D`) parts demand a
  balanced, reasoned evaluation with a justified conclusion — the instructions push
  the AI to check for that, since it's where students most often drop marks.
- One **copy** button per question + one for the whole paper.
