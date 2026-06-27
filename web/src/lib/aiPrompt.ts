// Builds the copy-paste AI-marking prompt from a question record.
// Provider-agnostic, marks ONLY against our mark scheme, states it's approximate.
// Mirrors plans/ai-marking-prompt.md.
import type { Question } from './types';
import { topicLabel } from './spec';

export function buildPrompt(q: Question): string {
  const topicName = topicLabel(q.component, q.topic);
  const spec = q.spec_point ?? '—';
  const spagLine = q.spag ? ' · includes SPaG (spelling, punctuation & grammar)' : '';
  const spagInstruction = q.spag
    ? '6. Judge SPaG: assess spelling, punctuation, grammar and use of specialist terms, and note its effect on the mark.'
    : '';

  return `You are an experienced Eduqas GCSE Religious Studies (Route A) examiner. Mark the
student's answer ONLY against the mark scheme provided. Be fair but rigorous, and
use the exact band/level boundaries given. Do not invent extra criteria.

QUESTION
- Component ${q.component} · Theme/Topic: ${topicName} · Spec: ${spec}
- Part ${q.question_type} · ${q.tariff} marks${spagLine}
- Question: ${q.question_text}

MARK SCHEME (band/level descriptors)
${q.mark_scheme}

INDICATIVE CONTENT (possible creditworthy points — not a checklist)
${q.indicative ?? '(none provided)'}

STUDENT ANSWER
"""
{paste your answer here}
"""

INSTRUCTIONS
1. Decide which band/level the answer sits in, and justify it against the descriptor wording.
2. Give a numeric mark out of ${q.tariff}.
3. List 2–3 specific strengths (quote the student where relevant).
4. List the precise gaps that stop it reaching the next band (no evaluation/judgement, no scripture/source, one-sided argument, etc.).
5. Give ONE improved exemplar paragraph at the top band.
${spagInstruction}

OUTPUT FORMAT (exactly)
Mark: X / ${q.tariff}  (Band/Level n)
Why this band: …
Strengths: …
To reach the next band: …
Exemplar upgrade: …

Remember: this is an approximate practice mark, not an official Eduqas result.`;
}

// Whole-paper bundled prompt: every question + scheme in order, then a summary ask.
export function buildPaperPrompt(questions: Question[]): string {
  const total = questions.reduce((s, q) => s + q.tariff, 0);
  const blocks = questions.map((q, i) => {
    const topicName = topicLabel(q.component, q.topic);
    const spagLine = q.spag ? ' · includes SPaG' : '';
    return `── Q${i + 1} [${q.qid}] · ${topicName} · Part ${q.question_type} · ${q.tariff} marks${spagLine}
Question: ${q.question_text}
Mark scheme:
${q.mark_scheme}
Indicative: ${q.indicative ?? '(none)'}
Student answer:
"""
{paste your answer to Q${i + 1} here}
"""`;
  }).join('\n\n');

  return `You are an experienced Eduqas GCSE Religious Studies (Route A) examiner. Mark EACH
question below ONLY against its own mark scheme. Use the exact band/level boundaries.
Do not invent criteria. This is an approximate practice mark, not an official result.

${blocks}

AFTER MARKING EVERY QUESTION, OUTPUT:
TOTAL: <sum> / ${total}
Per-question table: QID | mark | band
Overall feedback: the top 3 things to improve across the whole paper.`;
}
