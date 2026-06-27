import type { QType } from './spec';

// Mirrors the `questions` table (plans/data-schema.md).
export type Question = {
  qid: string;
  source: 'E' | 'T' | 'M';
  component: number;
  topic: number;
  question_type: QType;
  tariff: number;
  locator: string | null;
  seq: number | null;
  spec_point: string | null;
  question_text: string;
  mark_scheme: string;
  indicative: string | null;
  spag: boolean;
  ao: string | null;
  doc_id: string | null;
};

export type AttemptItem = { qid: string; mark_awarded: number | null; tariff: number; band: string | null };
