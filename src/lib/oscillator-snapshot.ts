import type { OscillatorData } from './oscillator-data';

export interface OscillatorSnapshotEnvelope {
  asOf: string;
  data: Omit<OscillatorData, 'mode' | 'snapshotAsOf' | 'note'>;
}

const SNAPSHOT_NOTE =
  'Local market snapshot. Prices and ranks reflect the source timestamps; missing history remains unavailable.';

export function normalizeOscillatorSnapshot(
  snapshot: OscillatorSnapshotEnvelope
): OscillatorData {
  return {
    ...snapshot.data,
    mode: 'snapshot',
    snapshotAsOf: snapshot.asOf,
    note: SNAPSHOT_NOTE,
  };
}
