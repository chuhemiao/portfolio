export const cardProjects = ['collector-crypt', 'oripa', 'renaiss'] as const;
export const cardMetrics = ['packOpenings', 'secondarySales', 'cardBuybacks', 'tokenBuybacks'] as const;
export const cardReceiptFractionDigits = 6;
const extraMetrics = ['protocolRevenue', 'holdersRevenue'] as const;
const allCardMetrics = [...cardMetrics, ...extraMetrics];
const languages = ['en', 'zh-CN', 'ja'] as const;
const dayMs = 86_400_000;

export type CardProject = (typeof cardProjects)[number];
export type CardMetric = (typeof cardMetrics)[number] | (typeof extraMetrics)[number];
type Localized = Record<(typeof languages)[number], string>;
type Source = { title: string; url: string };
type Bounds = [number, number];

interface Measurement {
  value: number;
  source: Source;
  confidence95?: Bounds;
}

interface Metric {
  current: Measurement | null;
  previous: Measurement | null;
  missing?: 'unreported' | 'prelaunch' | 'rate-limited';
  source?: Source;
  receiptSubtotal?: { asset: string; source: Source };
}

interface Milestone {
  date: string;
  end?: string;
  kind: 'event' | 'planned';
  text: Localized;
  source: Source;
}

interface Project {
  state: 'active' | 'prelaunch';
  metrics: Record<(typeof cardMetrics)[number], Metric> & Partial<Record<(typeof extraMetrics)[number], Metric>>;
  milestones: Milestone[];
}

export interface CardReceipt {
  project: CardProject;
  chain: 'solana' | 'bsc';
  transaction: string;
  eventIndex: number | null;
  checkout?: { service: string; id: string };
  kind: (typeof cardMetrics)[number];
  settledAt: string;
  paid: { amount: number; asset: string };
  received: { amount: number; asset: string } | null;
  source: Source;
}

interface Collaboration {
  machineId: string;
  packId: string;
  projects: CardProject[];
  source: Source;
}

export interface CardWeek {
  weekStart: string;
  weekEnd: string;
  reviewedOn: string;
  projects: Record<CardProject, Project>;
  methods: { text: Localized; source: Source }[];
  collaborations: Collaboration[];
  receipts: CardReceipt[];
  comparisonReceipts?: CardReceipt[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function date(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}

function utc(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

export function addCardDays(value: string, days: number) {
  if (!date(value)) throw new Error('Expected a UTC date in YYYY-MM-DD form');
  return new Date(Date.parse(value) + dayMs * days).toISOString().slice(0, 10);
}

function source(value: unknown): value is Source {
  if (!record(value) || typeof value.title !== 'string' || !value.title.trim() || typeof value.url !== 'string') return false;
  const url = URL.parse(value.url);
  return url?.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
}

function money(value: unknown, signed = false): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER && (signed || value >= 0);
}

function measurement(value: unknown, key: CardMetric): value is Measurement {
  if (!record(value) || !money(value.value, key === 'protocolRevenue') || !source(value.source)) return false;
  const ci = value.confidence95;
  return ci === undefined || (key === 'cardBuybacks' && Array.isArray(ci) && ci.length === 2 &&
    money(ci[0]) && money(ci[1]) && ci[0] <= value.value && value.value <= ci[1]);
}

function metric(value: unknown, key: CardMetric, prelaunch: boolean): value is Metric {
  if (!record(value) || (value.current !== null && !measurement(value.current, key)) ||
    (value.previous !== null && !measurement(value.previous, key)) || (value.source !== undefined && !source(value.source))) return false;
  if (value.receiptSubtotal !== undefined) {
    return !prelaunch && value.current === null && value.previous === null && value.missing === undefined &&
      cardMetrics.some(metric => metric === key) && record(value.receiptSubtotal) &&
      assetName(value.receiptSubtotal.asset) && source(value.receiptSubtotal.source);
  }
  if (value.current === null) {
    return value.missing === (prelaunch ? 'prelaunch' : 'unreported') || (!prelaunch && value.missing === 'rate-limited' && source(value.source));
  }
  return !prelaunch && value.missing === undefined && (value.previous === null ||
    (value.current.confidence95 === undefined) === (value.previous.confidence95 === undefined));
}

function milestone(value: unknown, start: string, end: string): value is Milestone {
  if (!record(value) || (!date(value.date) && !utc(value.date)) || !source(value.source)) return false;
  const day = value.date.slice(0, 10);
  if (value.kind !== 'event' && value.kind !== 'planned') return false;
  if (day < start || (value.kind === 'event' && day >= end)) return false;
  if (value.end !== undefined && (!utc(value.date) || !utc(value.end) || value.end <= value.date ||
    (value.kind === 'event' && value.end.slice(0, 10) >= end))) return false;
  return localized(value.text);
}

function localized(text: unknown) {
  return record(text) && languages.every(locale => typeof text[locale] === 'string' && !!text[locale].trim());
}

function assetName(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z0-9]{1,12}$/.test(value);
}

function assetAmount(value: unknown) {
  return record(value) && money(value.amount) && assetName(value.asset);
}

function receipt(value: unknown): value is CardReceipt {
  if (!record(value) || !cardProjects.some(project => project === value.project) || !cardMetrics.some(key => key === value.kind) ||
    typeof value.transaction !== 'string' || !utc(value.settledAt) || !source(value.source) ||
    !assetAmount(value.paid) || (value.received !== null && !assetAmount(value.received))) return false;
  if (value.eventIndex !== null && (typeof value.eventIndex !== 'number' || !Number.isSafeInteger(value.eventIndex) || value.eventIndex < 0)) return false;
  if (value.checkout !== undefined && (!record(value.checkout) || typeof value.checkout.service !== 'string' ||
    !/^[a-z0-9-]{1,48}$/.test(value.checkout.service) || typeof value.checkout.id !== 'string' || !/^[\w-]{1,100}$/.test(value.checkout.id))) return false;
  return value.chain === 'solana' ? /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(value.transaction) :
    value.chain === 'bsc' && /^0x[\da-fA-F]{64}$/.test(value.transaction);
}

function receiptsInPeriod(value: unknown, start: string, end: string) {
  return Array.isArray(value) && value.every(entry => receipt(entry) &&
    entry.settledAt.slice(0, 10) >= start && entry.settledAt.slice(0, 10) < end);
}

function groupCardReceipts(values: readonly CardReceipt[]) {
  const byKey = new Map<string, {
    receipt: CardReceipt; fingerprint: string; keys: Set<string>; projects: Set<CardProject>;
  }>();
  const seenTransactions = new Map<string, boolean>();
  for (const entry of values) {
    if (!receipt(entry)) throw new Error('Invalid card receipt');
    const tx = `${entry.chain}:${entry.chain === 'bsc' ? entry.transaction.toLowerCase() : entry.transaction}`;
    const transactionWide = entry.eventIndex === null;
    if (seenTransactions.has(tx) && seenTransactions.get(tx) !== transactionWide) throw new Error('Overlapping card receipt scopes');
    seenTransactions.set(tx, transactionWide);
    const keys = [`${tx}:${entry.eventIndex ?? 'all'}`];
    if (entry.checkout) keys.push(`checkout:${entry.checkout.service}:${entry.checkout.id}`);
    const fingerprint = JSON.stringify([
      entry.kind, entry.settledAt, entry.paid.asset, entry.paid.amount, entry.received?.asset, entry.received?.amount,
    ]);
    const matches = new Set(keys.flatMap(key => {
      const match = byKey.get(key);
      return match ? [match] : [];
    }));
    if ([...matches].some(match => match.fingerprint !== fingerprint)) throw new Error('Conflicting card receipt');
    const first = matches.values().next().value ?? {
      receipt: entry, fingerprint, keys: new Set<string>(), projects: new Set<CardProject>(),
    };
    for (const match of matches) {
      for (const key of match.keys) first.keys.add(key);
      for (const project of match.projects) first.projects.add(project);
    }
    first.projects.add(entry.project);
    for (const key of keys) first.keys.add(key);
    for (const key of first.keys) byKey.set(key, first);
  }
  return [...new Set(byKey.values())];
}

export function uniqueCardReceipts(values: readonly CardReceipt[]) {
  return groupCardReceipts(values).map(group => group.receipt);
}

function getCardReceiptSubtotal(settlements: readonly CardReceipt[], project: CardProject, kind: CardMetric, asset: string) {
  const scale = 10 ** cardReceiptFractionDigits;
  let units = 0;
  let count = 0;
  for (const entry of settlements) {
    if (entry.project !== project || entry.kind !== kind || entry.paid.asset !== asset || entry.paid.amount === 0) continue;
    const amount = Math.round(entry.paid.amount * scale);
    if (amount / scale !== entry.paid.amount || !Number.isSafeInteger(units + amount)) throw new Error('Invalid card receipt subtotal amount');
    units += amount;
    count += 1;
  }
  return count ? { value: units / scale, count } : null;
}

export type CardReceiptSubtotals = Partial<Record<CardMetric, { value: number; count: number }>>;

export function summarizeCardReceipts(week: CardWeek) {
  const groups = groupCardReceipts([...week.receipts, ...(week.comparisonReceipts ?? [])]);
  const settlements: CardReceipt[] = [];
  const comparisonSettlements: CardReceipt[] = [];
  const attributed: CardReceipt[] = [];
  const comparisonAttributed: CardReceipt[] = [];
  for (const { receipt: entry, projects } of groups) {
    const isComparison = entry.settledAt.slice(0, 10) < week.weekStart;
    (isComparison ? comparisonSettlements : settlements).push(entry);
    const eligible = [...projects].filter(project =>
      week.projects[project].metrics[entry.kind].receiptSubtotal?.asset === entry.paid.asset);
    if (eligible.length > 1) throw new Error(`Ambiguous card receipt subtotal attribution for ${week.weekStart}`);
    if (eligible.length === 1) {
      (isComparison ? comparisonAttributed : attributed).push({ ...entry, project: eligible[0] });
    }
  }
  const subtotals: Partial<Record<CardProject, CardReceiptSubtotals>> = {};
  const comparisonSubtotals: Partial<Record<CardProject, CardReceiptSubtotals>> = {};
  for (const project of cardProjects) for (const key of cardMetrics) {
    const basis = week.projects[project].metrics[key].receiptSubtotal;
    if (!basis) continue;
    const subtotal = getCardReceiptSubtotal(attributed, project, key, basis.asset);
    if (!subtotal) throw new Error(`Invalid card project or receipt subtotal for ${week.weekStart}`);
    (subtotals[project] ??= {})[key] = subtotal;
    const comparison = getCardReceiptSubtotal(comparisonAttributed, project, key, basis.asset);
    if (comparison) (comparisonSubtotals[project] ??= {})[key] = comparison;
  }
  return { settlements, subtotals, comparisonSettlements, comparisonSubtotals };
}

function sameCardSource(current: Source, previous: Source, currentStart: string, previousStart: string) {
  if (current.title !== previous.title) return false;
  if (current.url === previous.url) return true;
  const currentUrl = new URL(current.url);
  const previousUrl = new URL(previous.url);
  const currentDay = `/${currentStart}`;
  const previousDay = `/${previousStart}`;
  if (!currentUrl.pathname.endsWith(currentDay) || !previousUrl.pathname.endsWith(previousDay)) return false;
  currentUrl.pathname = currentUrl.pathname.slice(0, -currentDay.length);
  previousUrl.pathname = previousUrl.pathname.slice(0, -previousDay.length);
  return currentUrl.href === previousUrl.href;
}

export function compareCardWeeks(week: CardWeek, previous?: CardWeek) {
  const current = summarizeCardReceipts(week);
  if (previous?.weekEnd !== week.weekStart) return { ...current, projects: week.projects, previous: undefined };

  const previousSubtotals = summarizeCardReceipts(previous).subtotals;
  const comparisonSubtotals: Partial<Record<CardProject, CardReceiptSubtotals>> = {};
  const projects = { ...week.projects };
  for (const project of cardProjects) {
    const metrics = { ...week.projects[project].metrics };
    const prior = previous.projects[project].metrics;
    for (const key of allCardMetrics) {
      const metric = metrics[key];
      const earlier = prior[key];
      if (!metric || !earlier) continue;
      if (metric.current && earlier.current &&
        (metric.current.confidence95 === undefined) === (earlier.current.confidence95 === undefined) &&
        sameCardSource(metric.current.source, earlier.current.source, week.weekStart, previous.weekStart)) {
        metrics[key] = { ...metric, previous: earlier.current };
      }
      const basis = metric.receiptSubtotal;
      const priorBasis = earlier.receiptSubtotal;
      const subtotal = previousSubtotals[project]?.[key];
      if (basis && priorBasis && subtotal && basis.asset === priorBasis.asset &&
        sameCardSource(basis.source, priorBasis.source, week.weekStart, previous.weekStart)) {
        (comparisonSubtotals[project] ??= {})[key] = subtotal;
      }
    }
    projects[project] = { ...projects[project], metrics };
  }
  return { ...current, projects, previous, comparisonSubtotals };
}

function validProject(value: unknown, start: string, end: string) {
  if (!record(value) || (value.state !== 'active' && value.state !== 'prelaunch') ||
    !record(value.metrics) || !Array.isArray(value.milestones)) return false;
  const metrics = value.metrics;
  return cardMetrics.every(key => metric(metrics[key], key, value.state === 'prelaunch')) &&
    extraMetrics.every(key => metrics[key] === undefined || metric(metrics[key], key, value.state === 'prelaunch')) &&
    value.milestones.every(event => milestone(event, start, end));
}

function collaborations(value: unknown) {
  if (!Array.isArray(value)) return false;
  const machines = new Set<string>();
  const packs = new Set<string>();
  for (const entry of value) {
    if (!record(entry) || typeof entry.machineId !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/.test(entry.machineId) ||
      typeof entry.packId !== 'string' || !/^0x[\da-f]{64}$/.test(entry.packId) || machines.has(entry.machineId) || packs.has(entry.packId) ||
      !Array.isArray(entry.projects) || entry.projects.length < 2 || new Set(entry.projects).size !== entry.projects.length ||
      !entry.projects.every(project => cardProjects.some(id => id === project)) || !source(entry.source)) return false;
    machines.add(entry.machineId);
    packs.add(entry.packId);
  }
  return true;
}

export function readCardWeeks(input: unknown): CardWeek[] {
  if (!Array.isArray(input)) throw new Error('Expected a card weekly archive');
  const weeks = new Set<string>();
  for (const week of input) {
    if (!record(week) || !date(week.weekStart) || new Date(week.weekStart).getUTCDay() !== 1 || weeks.has(week.weekStart) ||
      !date(week.weekEnd) || week.weekEnd !== addCardDays(week.weekStart, 7) ||
      !date(week.reviewedOn) || week.reviewedOn < week.weekEnd || !record(week.projects) ||
      !Array.isArray(week.methods) || week.methods.length === 0 || !week.methods.every(method =>
        record(method) && localized(method.text) && source(method.source)) ||
      !collaborations(week.collaborations) || !Array.isArray(week.receipts)) throw new Error('Invalid card week');
    const { projects, weekStart, weekEnd } = week;
    if (!receiptsInPeriod(week.receipts, weekStart, weekEnd) || (week.comparisonReceipts !== undefined &&
      !receiptsInPeriod(week.comparisonReceipts, addCardDays(weekStart, -7), weekStart))) {
      throw new Error(`Invalid card project or out-of-week receipt for ${weekStart}`);
    }
    if (!cardProjects.every(id => validProject(projects[id], weekStart, weekEnd))) {
      throw new Error(`Invalid card project or receipt subtotal for ${weekStart}`);
    }
    summarizeCardReceipts(week as unknown as CardWeek);
    weeks.add(weekStart);
  }
  const archive = input as CardWeek[];
  for (const week of archive) {
    if (weeks.has(addCardDays(week.weekStart, -7)) && (week.comparisonReceipts !== undefined ||
      cardProjects.some(project => allCardMetrics.some(key => week.projects[project].metrics[key]?.previous)))) {
      throw new Error(`Duplicate authored card comparison for ${week.weekStart}`);
    }
  }
  groupCardReceipts(archive.flatMap(week => [...week.receipts, ...(week.comparisonReceipts ?? [])]));
  return archive.toSorted((a, b) => b.weekStart.localeCompare(a.weekStart));
}
