import 'server-only';
import { readCurrentLibrary } from '../../../scripts/library/public-reader.mjs';
import type { LibraryPublicAlias, LibraryPublicDetail, LibraryPublicFacets, LibraryPublicItem, LibraryPublicRankings, LibraryPublicRelation, LibrarySnapshotManifest } from './types';

export type LibraryPublicSnapshot = {
  manifest: LibrarySnapshotManifest;
  items: LibraryPublicItem[];
  rankings: LibraryPublicRankings;
  facets: LibraryPublicFacets;
  relations: LibraryPublicRelation[];
  aliases: Record<string, LibraryPublicAlias>;
  details: Record<string, LibraryPublicDetail>;
};

let snapshot: Promise<LibraryPublicSnapshot> | undefined;

// A static export consumes one verified source version per build process.
export function getLibrarySnapshot(): Promise<LibraryPublicSnapshot> {
  snapshot ??= (readCurrentLibrary(process.cwd()) as Promise<LibraryPublicSnapshot>).catch(error => {
    snapshot = undefined;
    throw error;
  });
  return snapshot;
}
