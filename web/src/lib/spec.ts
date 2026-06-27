// The Eduqas Route A spec structure, mirrored from plans/spec-map.md.
// Drives topic pickers, the paper blueprints, and human-readable labels.
// Source of truth for content is Supabase; this is UI/structural metadata.

export type ThemeTag =
  | 'RLP' | 'LD' | 'GE' | 'HR'   // Component 1 themes
  | 'CB' | 'CP'                   // Component 2 Christianity (Beliefs / Practices)
  | 'IB' | 'IP';                  // Component 3 Islam (Beliefs / Practices)

export type Topic = {
  /** component + topic number, the join used by `questions.component` / `.topic` */
  component: 1 | 2 | 3;
  topic: number;
  tag: ThemeTag;
  /** short label for pickers */
  name: string;
};

// Component 1 — four themes (each is "topic 1..4" within component 1).
export const COMPONENT_1: Topic[] = [
  { component: 1, topic: 1, tag: 'RLP', name: 'Relationships' },
  { component: 1, topic: 2, tag: 'LD', name: 'Life and Death' },
  { component: 1, topic: 3, tag: 'GE', name: 'Good and Evil' },
  { component: 1, topic: 4, tag: 'HR', name: 'Human Rights' },
];

// Components 2 & 3 — topic 1 = Beliefs, topic 2 = Practices.
export const COMPONENT_2: Topic[] = [
  { component: 2, topic: 1, tag: 'CB', name: 'Christianity: Beliefs & Teachings' },
  { component: 2, topic: 2, tag: 'CP', name: 'Christianity: Practices' },
];
export const COMPONENT_3: Topic[] = [
  { component: 3, topic: 1, tag: 'IB', name: 'Islam: Beliefs & Teachings' },
  { component: 3, topic: 2, tag: 'IP', name: 'Islam: Practices' },
];

export const ALL_TOPICS: Topic[] = [...COMPONENT_1, ...COMPONENT_2, ...COMPONENT_3];

export const COMPONENTS = [
  { component: 1 as const, title: 'Component 1 — Themes', minutes: 120, marks: 120 },
  { component: 2 as const, title: 'Component 2 — Christianity', minutes: 60, marks: 60 },
  { component: 3 as const, title: 'Component 3 — Islam', minutes: 60, marks: 60 },
];

export function topicOf(component: number, topic: number): Topic | undefined {
  return ALL_TOPICS.find((t) => t.component === component && t.topic === topic);
}
export function topicLabel(component: number, topic: number): string {
  return topicOf(component, topic)?.name ?? `C${component}·T${topic}`;
}

// Question types A/B/C/D map to the four parts and tariffs (2/5/8/15).
export type QType = 'A' | 'B' | 'C' | 'D';
export const QUESTION_TYPES: Record<QType, { part: string; tariff: number; ao: string; style: string }> = {
  A: { part: '(a)', tariff: 2, ao: 'AO1', style: 'Define a term — "What is meant by…"' },
  B: { part: '(b)', tariff: 5, ao: 'AO1', style: 'Describe / explain beliefs' },
  C: { part: '(c)', tariff: 8, ao: 'AO1', style: 'Explain from two traditions / influence' },
  D: { part: '(d)', tariff: 15, ao: 'AO2', style: 'Evaluate a statement (+ SPaG on one per paper)' },
};
export const Q_TYPE_ORDER: QType[] = ['A', 'B', 'C', 'D'];

export function tariffOf(type: QType): number {
  return QUESTION_TYPES[type].tariff;
}

// Eduqas awards an extra 6 marks for SPaG on the one evaluative (d) question per
// paper that carries it, so that question is worth 15 + 6 = 21.
export const SPAG_MARKS = 6;
export function effectiveTariff(tariff: number, spag: boolean): number {
  return tariff + (spag ? SPAG_MARKS : 0);
}
