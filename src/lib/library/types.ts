export const LIBRARY_SCHEMA_VERSION = '1.1.0' as const;
export const LIBRARY_LOCALES = ['zh-CN', 'en', 'ja'] as const;
export const LIBRARY_KINDS = ['video', 'book', 'paper', 'spec', 'article'] as const;
export const LIBRARY_RIGHTS_FIELDS = [
  'kind', 'identifier', 'url', 'title_hint', 'canonical_key', 'canonical_url', 'original_title',
  'creators', 'original_language', 'original_published_at', 'date_precision', 'availability',
  'last_checked_at', 'level', 'title', 'description', 'editorial_body', 'recommendation_reasons',
  'rationale_locales', 'source_url', 'source_record_id', 'observed_at', 'evidence_kind',
  'evidence_excerpt', 'origin_locator', 'confidence', 'asset_url', 'attribution_text', 'actor_cluster_ref',
] as const;
export type LibraryLocale = typeof LIBRARY_LOCALES[number];
export type LibraryKind = typeof LIBRARY_KINDS[number];
export type LibraryRightsField = typeof LIBRARY_RIGHTS_FIELDS[number];
export type LibraryPolicyOperation = 'fetch' | 'store' | 'display' | 'derive' | 'public_git' | 'public_snapshot';
export type LibraryItemStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'quarantined' | 'takedown' | 'rejected';
export type LibraryEvidenceKind = 'recommendation' | 'mention' | 'citation' | 'criticism' | 'correction';
export type LibraryRelationType = 'background' | 'supports' | 'challenges' | 'further_reading';
export type LibraryReviewedRelationStatus = 'pending_review' | 'approved' | 'rejected';
export type LibraryFeature = 'I' | 'E' | 'Q' | 'G' | 'V' | 'T' | 'C';

type Versioned = { schema_version: typeof LIBRARY_SCHEMA_VERSION; revision: number };
export type LibraryFieldProvenance = {
  origin_source_id: string;
  source_record_id: string;
  source_url: string;
  rights_policy_version: string;
  observed_at: string;
  fetched_at: string | null;
  expires_at: string | null;
};
export type LibraryProvenance = Partial<Record<LibraryRightsField, LibraryFieldProvenance>>;
type ContentSource = { source_id: string; rights_policy_version: string; field_provenance: LibraryProvenance };

export type LibrarySourcePolicy = Versioned & {
  id: string;
  hostname: string;
  source_kind: 'api' | 'dump' | 'manual' | 'owned' | 'spec';
  acquisition_method: 'manual_json' | 'manual_csv' | 'official_api' | 'approved_dump';
  policy_version: string;
  status: 'pending' | 'approved' | 'blocked' | 'revoked' | 'disabled';
  license_identifier: string | null;
  license_url: string | null;
  approval_basis_url: string | null;
  attribution_required: boolean;
  attribution_text: string | null;
  fetch_allowed: boolean;
  store_raw_allowed: boolean;
  show_excerpt_allowed: boolean;
  derivative_analysis_allowed: boolean;
  allowed_fields: Record<LibraryPolicyOperation, LibraryRightsField[]>;
  retention_mode: 'none' | 'time_limited' | 'permanent';
  retention_days: number | null;
  requires_refresh: boolean;
  refresh_interval_days: number | null;
  deletion_required: boolean;
  public_history_allowed: boolean;
  approved_by: string | null;
  approved_at: string | null;
  last_legal_review_at: string | null;
  review_due_at: string | null;
  review_event_id: string | null;
  policy_scope: string;
  review_notes: string;
};
export type LibraryCandidate = Versioned & {
  candidate_id: string;
  ingestion_id: string;
  source_id: string;
  source_record_id: string;
  source_url: string;
  observed_at: string;
  resource: { kind: LibraryKind; identifier: string | null; url: string; title_hint: string | null };
  policy_version: string;
  field_provenance: LibraryProvenance;
  state: 'new' | 'matched' | 'needs_review' | 'rejected' | 'promoted';
};
export type LibraryCheck = { passed: boolean; review_event_id: string | null };
export type LibraryItem = Versioned & ContentSource & {
  id: string;
  slug: string;
  kind: LibraryKind;
  canonical_key: string;
  canonical_url: string;
  identifiers: Record<'youtube_id' | 'doi' | 'arxiv_id' | 'arxiv_version' | 'isbn13' | 'openlibrary_work' | 'eip_number' | 'version', string | null>;
  original_title: string;
  creators: string[];
  original_language: string;
  original_published_at: string | null;
  date_precision: 'day' | 'month' | 'year' | 'unknown';
  status: LibraryItemStatus;
  rights_status: 'approved' | 'pending' | 'blocked' | 'revoked';
  validity_status: 'current' | 'historical' | 'superseded' | 'disputed' | 'unknown';
  availability: 'available' | 'unavailable' | 'unknown';
  last_checked_at: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  detail_enabled: boolean;
  checks: Record<'metadata_valid' | 'rights_checked' | 'evidence_checked', LibraryCheck> & { content_status: 'approved' | 'needs_review' | 'rejected' };
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
};
export type LibraryReason = {
  id: string;
  text: string;
  basis_type: 'evidence' | 'editorial_selection';
  evidence_ids: string[];
  editorial_selection_id: string | null;
  basis_revisions: Record<string, number>;
  source_revision: number;
  review_event_id: string | null;
};
export type LibraryItemLocale = Versioned & ContentSource & {
  item_id: string;
  locale: LibraryLocale;
  title: string;
  description: string;
  editorial_body: string;
  recommendation_reasons: LibraryReason[];
  summary_language: LibraryLocale;
  abstract_status: 'draft' | 'machine_draft' | 'reviewed';
  model_version: string | null;
  reviewed_at: string | null;
  review_event_id: string | null;
  source_revision: number;
};
export type LibraryEvidence = Versioned & ContentSource & {
  id: string;
  item_id: string;
  source_record_id: string;
  source_url: string;
  origin_locator: string | null;
  actor_cluster_ref: string | null;
  evidence_kind: LibraryEvidenceKind;
  observed_at: string;
  confidence: number | null;
  review_status: 'extracted' | 'verified' | 'rejected' | 'needs_review';
  evidence_excerpt: string | null;
  extractor_version: string;
  model_id: string | null;
  prompt_version: string | null;
  run_id: string | null;
  input_hash: string | null;
  expires_at: string | null;
  review_event_id: string | null;
};
export type LibraryEditorialSelection = Versioned & ContentSource & {
  id: string;
  item_id: string;
  reviewer_id: string;
  rationale_locales: Record<LibraryLocale, string>;
  selected_at: string;
  review_event_id: string | null;
};
export type LibraryItemTopic = Versioned & {
  item_id: string;
  existing_topic_slug: string;
  mapping_method: 'manual' | 'model_suggested';
  review_status: LibraryReviewedRelationStatus;
  reviewed_at: string | null;
  review_event_id: string | null;
};
export type LibraryItemRelation = Versioned & {
  item_id: string;
  existing_entity_type: 'article' | 'project';
  existing_entity_slug: string;
  article_translation_key: string | null;
  relation_type: LibraryRelationType;
  review_status: LibraryReviewedRelationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_event_id: string | null;
};
export type LibraryReviewEvent = {
  schema_version: typeof LIBRARY_SCHEMA_VERSION;
  event_id: string;
  entity_type: 'source' | 'item' | 'item_locale' | 'reason' | 'evidence' | 'editorial_selection' | 'item_topic' | 'item_relation' | 'score' | 'identity_event';
  entity_id: string;
  action: 'approve' | 'approve_rights' | 'publish' | 'revise' | 'reject' | 'quarantine' | 'archive' | 'takedown' | 'restore' | 'merge' | 'split';
  from_state: string | null;
  to_state: string;
  expected_revision: number;
  next_revision: number;
  subject_hash: string;
  redacted_diff: { field: string; before_hash: string | null; after_hash: string | null }[];
  reason: string;
  reviewer_id: string;
  created_at: string;
  previous_event_hash: string | null;
  event_hash: string;
};
export type LibraryIdentityEvent = Versioned & {
  event_id: string;
  action: 'alias' | 'merge' | 'split';
  from_ids: string[];
  to_ids: string[];
  canonical_keys: string[];
  rationale: string;
  review_event_id: string | null;
  at: string;
};
export type LibraryScore = Versioned & {
  item_id: string;
  rank_version: string;
  model_version: string | null;
  feature_schema_version: string;
  input_hash: string;
  code_version: string;
  as_of: string;
  features: Record<LibraryFeature, number | null>;
  missingness: LibraryFeature[];
  score_total: number | null;
  rank_position: number | null;
  scoring_status: 'scored' | 'unscored' | 'ineligible';
  unscored_reason: string | null;
  review_event_id: string | null;
  override_reason: string | null;
};
export type LibraryIngestJob = {
  schema_version: typeof LIBRARY_SCHEMA_VERSION;
  id: string;
  source_id: string;
  batch_key: string;
  job_version: string;
  input_hash: string;
  state: 'pending' | 'running' | 'checkpointed' | 'completed' | 'failed' | 'cancelled';
  cursor: string | null;
  attempts: number;
  completed_record_ids: string[];
  failures: { record_id: string; code: string; attempts: number }[];
  started_at: string | null;
  finished_at: string | null;
};
export type LibraryReferenceContext = {
  topic_slugs: string[];
  articles: { slug: string; translation_key: string }[];
  project_slugs: string[];
};
export type LibraryCatalog = {
  schema_version: typeof LIBRARY_SCHEMA_VERSION;
  sources: LibrarySourcePolicy[];
  candidates: LibraryCandidate[];
  items: LibraryItem[];
  item_locales: LibraryItemLocale[];
  evidence: LibraryEvidence[];
  item_topics: LibraryItemTopic[];
  item_relations: LibraryItemRelation[];
  editorial_selections: LibraryEditorialSelection[];
  identity_history: LibraryIdentityEvent[];
  review_log: LibraryReviewEvent[];
  scores: LibraryScore[];
};
export type LibraryValidationIssue = { code: string; path: string; message: string };
export type LibraryValidationResult = {
  valid: boolean;
  errors: LibraryValidationIssue[];
  counts: Record<Exclude<keyof LibraryCatalog, 'schema_version'>, number>;
  eligibleItemIds: string[];
  communityRecommendedItemIds: string[];
};

export type LibraryPublicReason = Pick<LibraryReason, 'id' | 'text' | 'basis_type' | 'evidence_ids' | 'editorial_selection_id'>;
export type LibraryPublicEvidence = {
  id: string; kind: LibraryEvidenceKind; source_url: string; source_hostname: string; observed_at: string; excerpt: string | null;
};
export type LibraryPublicSelection = Pick<LibraryEditorialSelection, 'id' | 'selected_at' | 'rationale_locales'>;
export type LibraryPublicItem = Pick<LibraryItem, 'id' | 'slug' | 'kind' | 'canonical_key' | 'canonical_url' | 'original_title' | 'creators' | 'original_language' | 'original_published_at' | 'date_precision' | 'validity_status' | 'availability' | 'level' | 'detail_enabled' | 'updated_at'> & {
  published_at: string;
  locales: Record<LibraryLocale, { title: string; description: string; reasons: LibraryPublicReason[]; machine_assisted: boolean; reviewed_at: string }>;
  topic_slugs: string[];
  source_hostname: string;
  attributions: { hostname: string; license_identifier: string | null; license_url: string | null; text: string | null }[];
  evidence: LibraryPublicEvidence[];
  editorial_selections: LibraryPublicSelection[];
};
export type LibraryPublicDetail = { item_id: string; locales: Record<LibraryLocale, { editorial_body: string }> };
export type LibrarySort = 'best' | 'evergreen' | 'recently-recommended' | 'recently-published';
export type LibraryPublicRankings = { rank_version: 'editorial-v1'; basis: 'editorial-order; no quality probability'; sorts: Record<LibrarySort, string[]> };
export type LibraryPublicFacets = Record<'kinds' | 'topics' | 'languages' | 'levels' | 'years', Record<string, number>>;
export type LibraryPublicRelation = { item_id: string; entity_type: 'article' | 'project'; entity_slug: string; article_translation_key: string | null; relation_type: LibraryRelationType };
export type LibraryPublicAlias = { status: 'resolved' | 'split'; ids: string[] };
export type LibrarySnapshotManifest = {
  schema_version: typeof LIBRARY_SCHEMA_VERSION;
  snapshot_id: string; generated_at: string; as_of: string; valid_until: string | null;
  rank_version: 'editorial-v1'; items_file: string; ranking_file: string;
  files: Record<string, { sha256: string; bytes: number; count: number }>;
  checksum: string; input_hash: string; code_version: string;
};
