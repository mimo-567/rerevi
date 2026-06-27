// Paper / question assembly. Reads the Question Bank via Supabase and fills each
// slot ONLY with questions valid for it (eligibility rule, plans/paper-generator.md §3).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Question } from './types';
import { COMPONENT_1, COMPONENT_2, COMPONENT_3, QUESTION_TYPES, Q_TYPE_ORDER, topicLabel, effectiveTariff, type QType } from './spec';

export type SourcePref = 'E' | 'ETM' | 'ANY';
export type SpagMode = 'all' | 'first' | 'none';

function sourcesFor(pref: SourcePref): ('E' | 'T' | 'M')[] {
  if (pref === 'E') return ['E'];
  return ['E', 'T', 'M']; // ETM and ANY are the same set today
}

// --- seeded RNG (reproducible papers) ---
function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type EligOpts = { sources: ('E' | 'T' | 'M')[]; excludeYears: string[] };

async function fetchPool(
  supabase: SupabaseClient,
  component: number,
  topic: number,
  type: QType,
  opts: EligOpts,
): Promise<Question[]> {
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('component', component)
    .eq('topic', topic)
    .eq('question_type', type)
    .in('source', opts.sources);
  let rows = (data ?? []) as Question[];
  // must have a usable mark scheme; exclude sat exam years
  rows = rows.filter((q) => q.mark_scheme && q.mark_scheme.trim().length > 0);
  if (opts.excludeYears.length) {
    rows = rows.filter((q) => !(q.source === 'E' && q.locator && opts.excludeYears.includes(q.locator)));
  }
  return rows;
}

export type Slot = { type: QType; tariff: number; spag: boolean; question: Question | null };
export type Group = { component: number; topic: number; topicName: string; slots: Slot[] };
export type Paper = {
  title: string;
  minutes: number;
  totalMarks: number;
  groups: Group[];
  gaps: string[];
  questions: Question[]; // flat, in order, for the whole-paper AI prompt
};

const BLUEPRINTS: Record<number, { title: string; minutes: number; topics: { component: number; topic: number }[] }> = {
  1: { title: 'Component 1 — Religious, Philosophical & Ethical Themes', minutes: 120, topics: COMPONENT_1 },
  2: { title: 'Component 2 — Study of Christianity', minutes: 60, topics: COMPONENT_2 },
  3: { title: 'Component 3 — Study of Islam', minutes: 60, topics: COMPONENT_3 },
};

export async function assembleFullPaper(
  supabase: SupabaseClient,
  o: { component: number; source: SourcePref; spag: SpagMode; excludeYears: string[]; seed: string },
): Promise<Paper> {
  const bp = BLUEPRINTS[o.component] ?? BLUEPRINTS[1];
  const rng = mulberry32(hashSeed(o.seed + ':' + o.component));
  const opts: EligOpts = { sources: sourcesFor(o.source), excludeYears: o.excludeYears };
  const groups: Group[] = [];
  const gaps: string[] = [];
  const flat: Question[] = [];
  const used = new Set<string>();
  let dCount = 0;

  for (const t of bp.topics) {
    const slots: Slot[] = [];
    for (const type of Q_TYPE_ORDER) {
      const tariff = QUESTION_TYPES[type].tariff;
      let spag = false;
      if (type === 'D') {
        if (o.spag === 'all') spag = true;
        else if (o.spag === 'first') spag = dCount === 0;
        dCount++;
      }
      const pool = (await fetchPool(supabase, t.component, t.topic, type, opts)).filter((q) => !used.has(q.qid));
      const pick = pool.length ? shuffled(pool, rng)[0] : null;
      if (pick) { used.add(pick.qid); flat.push({ ...pick, spag }); }
      else gaps.push(`${topicLabel(t.component, t.topic)} · Part ${type} (${tariff} marks)`);
      slots.push({ type, tariff, spag, question: pick });
    }
    groups.push({ component: t.component, topic: t.topic, topicName: topicLabel(t.component, t.topic), slots });
  }

  const totalMarks = groups.reduce(
    (s, g) => s + g.slots.reduce((ss, sl) => ss + effectiveTariff(sl.tariff, sl.spag), 0), 0);
  return { title: bp.title, minutes: bp.minutes, totalMarks, groups, gaps, questions: flat };
}

export type CustomReq = {
  topics: { component: number; topic: number }[];
  types: QType[];
  count: number;
  mode: 'FLAT' | 'SET';
  source: SourcePref;
  excludeYears: string[];
  seed: string;
};

export async function assembleCustom(supabase: SupabaseClient, r: CustomReq): Promise<Paper> {
  const rng = mulberry32(hashSeed(r.seed + ':custom'));
  const opts: EligOpts = { sources: sourcesFor(r.source), excludeYears: r.excludeYears };
  const groups: Group[] = [];
  const gaps: string[] = [];
  const flat: Question[] = [];
  const used = new Set<string>();

  for (const t of r.topics) {
    if (r.mode === 'SET') {
      // count sets of (each chosen type, in A→D order) per topic
      for (let n = 0; n < r.count; n++) {
        const slots: Slot[] = [];
        for (const type of Q_TYPE_ORDER.filter((x) => r.types.includes(x))) {
          const pool = (await fetchPool(supabase, t.component, t.topic, type, opts)).filter((q) => !used.has(q.qid));
          const pick = pool.length ? shuffled(pool, rng)[0] : null;
          if (pick) { used.add(pick.qid); flat.push(pick); }
          else gaps.push(`${topicLabel(t.component, t.topic)} · Part ${type}`);
          slots.push({ type, tariff: QUESTION_TYPES[type].tariff, spag: false, question: pick });
        }
        groups.push({ component: t.component, topic: t.topic, topicName: `${topicLabel(t.component, t.topic)} — set ${n + 1}`, slots });
      }
    } else {
      // FLAT: `count` questions per chosen type for this topic
      const slots: Slot[] = [];
      for (const type of r.types) {
        const pool = (await fetchPool(supabase, t.component, t.topic, type, opts)).filter((q) => !used.has(q.qid));
        const chosen = shuffled(pool, rng).slice(0, r.count);
        for (const q of chosen) { used.add(q.qid); flat.push(q); slots.push({ type, tariff: q.tariff, spag: false, question: q }); }
        if (chosen.length < r.count) {
          gaps.push(`${topicLabel(t.component, t.topic)} · Part ${type}: asked ${r.count}, found ${chosen.length}`);
        }
      }
      if (slots.length) groups.push({ component: t.component, topic: t.topic, topicName: topicLabel(t.component, t.topic), slots });
    }
  }

  const totalMarks = flat.reduce((s, q) => s + effectiveTariff(q.tariff, q.spag), 0);
  const minutes = Math.round(totalMarks * 1.0); // ~1 min/mark rough guide
  return { title: 'Custom question set', minutes, totalMarks, groups, gaps, questions: flat };
}
