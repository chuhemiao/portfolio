const venueHosts = {
  Binance: ['www.binance.com', 'api.binance.com', 'fapi.binance.com'],
  Bithumb: ['feed.bithumb.com', 'api.bithumb.com'],
  Bybit: ['announcements.bybit.com', 'api.bybit.com'],
} as const;

const markets = ['spot', 'perp', 'alpha'] as const;
const actions = ['listing', 'delisting', 'postponement', 'discovery'] as const;
const assetKinds = ['crypto', 'tokenized-equity', 'equity-linked'] as const;

type Venue = keyof typeof venueHosts;
type EquationNotice = { id: number; url: string; publishedAt: string };

export interface WatchListingEvent {
  id: string;
  venue: Venue;
  market: (typeof markets)[number];
  action: (typeof actions)[number];
  assetKind: (typeof assetKinds)[number];
  instruments: string[];
  chain?: string;
  contractAddress?: string;
  notice: { url: string; publishedAt: string | null; publicationSourceUrl?: string; displayedPublication?: string } | null;
  eqn: EquationNotice | null;
  productUrl?: string;
  scheduledAt: string | null;
  previousSchedule?: { at: string; url: string };
  effective: { effectiveAt: string; url: string; basis: 'first-trade' | 'onboard-date' } | null;
  observed: { firstObservedAt: string; url: string; basis: 'first-trade' | 'minute-bar' | 'pair-break' } | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function member<T extends string>(values: readonly T[], value: unknown): value is T {
  return values.some(item => item === value);
}

function utc(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  return value === new Date(value).toISOString();
}

function httpsUrl(value: unknown): URL | null {
  const url = typeof value === 'string' && value.length <= 1000 ? URL.parse(value) : null;
  return url?.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
}

function officialUrl(value: unknown, venue: Venue) {
  return member(venueHosts[venue], httpsUrl(value)?.hostname);
}

function isEquationNotice(value: unknown, reviewedAt: string): value is EquationNotice {
  if (!record(value) || typeof value.id !== 'number' || !Number.isSafeInteger(value.id) || value.id <= 0 ||
    !utc(value.publishedAt) || value.publishedAt > reviewedAt) return false;
  const url = httpsUrl(value.url);
  return url?.hostname === 'eqn.news' &&
    (url.pathname === `/main/${value.id}` || url.pathname === `/monitor/${value.id}`);
}

function isEvent(value: unknown, reviewedAt: string): value is WatchListingEvent {
  if (!record(value) || typeof value.id !== 'string' || !/^[a-z0-9-]{3,90}$/.test(value.id) ||
    !member(Object.keys(venueHosts) as Venue[], value.venue) || !member(markets, value.market) ||
    !member(actions, value.action) || !member(assetKinds, value.assetKind)) return false;

  const { venue, market, action, notice, eqn, instruments, scheduledAt, previousSchedule, effective, observed } = value;
  const instrumentPattern = market === 'alpha' ? /^[A-Z0-9]{1,20}$/ : /^[A-Z0-9]{1,20}\/[A-Z0-9]{1,12}$/;
  if (!Array.isArray(instruments) || instruments.length === 0 || instruments.length > 12 ||
    new Set(instruments).size !== instruments.length ||
    !instruments.every(pair => typeof pair === 'string' && instrumentPattern.test(pair))) return false;
  if (value.chain !== undefined && (typeof value.chain !== 'string' || !/^[A-Za-z0-9 .-]{1,25}$/.test(value.chain))) return false;
  if (value.contractAddress !== undefined && (!value.chain || typeof value.contractAddress !== 'string' ||
    !/^0x[\da-fA-F]{40}$/.test(value.contractAddress))) return false;

  if (notice !== null && (!record(notice) || !officialUrl(notice.url, venue) ||
    (notice.publishedAt !== null && (!utc(notice.publishedAt) || notice.publishedAt > reviewedAt)) ||
    (notice.publicationSourceUrl !== undefined && (notice.publishedAt === null || !officialUrl(notice.publicationSourceUrl, venue))) ||
    (notice.displayedPublication !== undefined && (typeof notice.displayedPublication !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?$/.test(notice.displayedPublication))))) return false;
  if (eqn !== null && !isEquationNotice(eqn, reviewedAt)) return false;
  if (value.productUrl !== undefined && !officialUrl(value.productUrl, venue)) return false;

  if ((market === 'alpha') !== (action === 'discovery') || (market === 'alpha' && venue !== 'Binance')) return false;
  if (action === 'discovery' && (!eqn || !value.productUrl || scheduledAt !== null || effective !== null || observed !== null)) return false;
  if (action !== 'discovery' && !notice) return false;
  if (scheduledAt !== null && !utc(scheduledAt)) return false;
  if (action === 'postponement' && (!previousSchedule || effective !== null || observed !== null)) return false;
  if (previousSchedule !== undefined && (!record(previousSchedule) || !utc(previousSchedule.at) || !officialUrl(previousSchedule.url, venue))) return false;

  if (effective !== null && (!record(effective) || action !== 'listing' || !utc(effective.effectiveAt) ||
    effective.effectiveAt > reviewedAt || !officialUrl(effective.url, venue) ||
    !member(['first-trade', 'onboard-date'], effective.basis))) return false;
  if (observed !== null && (!record(observed) || !utc(observed.firstObservedAt) || observed.firstObservedAt > reviewedAt ||
    !officialUrl(observed.url, venue) || !member(['first-trade', 'minute-bar', 'pair-break'], observed.basis) ||
    (action === 'delisting') !== (observed.basis === 'pair-break') ||
    (scheduledAt !== null && observed.firstObservedAt < scheduledAt))) return false;
  if (effective?.basis === 'first-trade' && (!observed || observed.basis !== 'first-trade' ||
    observed.firstObservedAt !== effective.effectiveAt || observed.url !== effective.url)) return false;
  return true;
}

export function readWatchListingEvents(snapshot: unknown, currentNews?: unknown) {
  if (!record(snapshot) || !utc(snapshot.reviewedAt) || !Array.isArray(snapshot.events) || snapshot.events.length > 200) return null;
  const { reviewedAt } = snapshot;
  const events = snapshot.events.filter((event): event is WatchListingEvent => isEvent(event, reviewedAt));
  const ids = new Set(events.map(event => event.id));
  if (events.length !== snapshot.events.length || ids.size !== events.length) return null;

  const currentNotices = Array.isArray(currentNews) ? currentNews : [];
  const newsById = new Map(currentNotices.filter(item => isEquationNotice(item, reviewedAt)).map(item => [item.id, item]));
  const publication = (event: WatchListingEvent) => event.notice?.publishedAt ?? event.eqn?.publishedAt ?? event.notice?.displayedPublication?.slice(0, 10) ?? '';
  return {
    reviewedAt,
    events: events.map(event => {
      const current = event.eqn ? newsById.get(event.eqn.id) : undefined;
      return current && current.url === event.eqn?.url
        ? { ...event, eqn: { id: current.id, url: current.url, publishedAt: current.publishedAt } }
        : event;
    }).sort((first, second) => publication(second).localeCompare(publication(first))),
  };
}

export function watchEventStatus(event: WatchListingEvent, reviewedAt: string) {
  if (event.action === 'postponement') return 'postponed';
  if (event.action === 'discovery') return 'discovered';
  if (event.effective) return 'verified';
  if (event.observed?.basis === 'pair-break') return 'removed';
  if (event.observed) return 'observed';
  if (event.scheduledAt) return event.scheduledAt > reviewedAt ? 'scheduled' : 'pending';
  return 'announced';
}

export function watchEventRegion(venue: Venue) {
  return venue === 'Bithumb' ? 'kr' : 'international';
}

export function filterWatchListingEvents(
  events: readonly WatchListingEvent[],
  filters: { market: string; venue: string; region: string; status: string },
  reviewedAt: string,
) {
  return events.filter(event =>
    (!filters.market || event.market === filters.market) &&
    (!filters.venue || event.venue === filters.venue) &&
    (!filters.region || watchEventRegion(event.venue) === filters.region) &&
    (!filters.status || watchEventStatus(event, reviewedAt) === filters.status),
  );
}
