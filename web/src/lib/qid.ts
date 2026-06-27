// Parse a QID into its component fields, per plans/question-ids.md:
//   <source>.<locator>.<Component>.<Topic>[.<NNN>].<Type>
//   E (exam):     E.YYYY.C.T.Type           e.g. E.2024.1.2.A      (no NNN)
//   T (textbook): T.<page>.C.T.NNN.Type      e.g. T.27.1.1.000.D
//   M (misc):     M.<docslug>.C.T.NNN.Type   e.g. M.rerevi-examples.1.2.004.D
// Doc slugs are assumed not to contain '.'.
import { tariffOf, type QType } from './spec';

export type ParsedQid = {
  qid: string;
  source: 'E' | 'T' | 'M';
  locator: string;
  component: number;
  topic: number;
  seq: number | null;
  question_type: QType;
  tariff: number;
};

const TYPES = new Set(['A', 'B', 'C', 'D']);

export function parseQid(raw: string): ParsedQid {
  const qid = raw.trim();
  const parts = qid.split('.');
  const source = parts[0] as 'E' | 'T' | 'M';
  if (!['E', 'T', 'M'].includes(source)) throw new Error(`QID must start with E, T or M: "${qid}"`);

  const type = parts[parts.length - 1] as QType;
  if (!TYPES.has(type)) throw new Error(`QID must end with a type A/B/C/D: "${qid}"`);

  let locator: string, component: number, topic: number, seq: number | null;

  if (source === 'E') {
    // E.YYYY.C.T.Type
    if (parts.length !== 5) throw new Error(`Exam QID needs 5 parts (E.YYYY.C.T.Type): "${qid}"`);
    [, locator] = parts;
    component = Number(parts[2]); topic = Number(parts[3]); seq = null;
  } else {
    // T/M: src.locator.C.T.NNN.Type
    if (parts.length !== 6) throw new Error(`${source} QID needs 6 parts (${source}.<loc>.C.T.NNN.Type): "${qid}"`);
    locator = parts[1];
    component = Number(parts[2]); topic = Number(parts[3]); seq = Number(parts[4]);
  }

  if (!(component >= 1 && component <= 3)) throw new Error(`Component must be 1–3 in "${qid}"`);
  if (!Number.isInteger(topic) || topic < 1) throw new Error(`Topic must be a positive integer in "${qid}"`);

  return { qid, source, locator, component, topic, seq, question_type: type, tariff: tariffOf(type) };
}
