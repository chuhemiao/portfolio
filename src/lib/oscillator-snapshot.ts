import type { OscillatorData } from './oscillator-data';

export interface OscillatorSnapshotEnvelope {
  asOf: string;
  data: Omit<OscillatorData, 'mode' | 'snapshotAsOf' | 'note'>;
}

const SNAPSHOT_NOTE =
  'Weekly snapshot fallback. Refresh with `pnpm sync:oscillator` when you want a new market read.';

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
