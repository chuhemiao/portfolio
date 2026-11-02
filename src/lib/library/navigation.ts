export function libraryPathScope(pathname: string | null | undefined): 'library' | 'other' | 'unknown' {
  if (!pathname || !pathname.startsWith('/') || /[?#\\\u0000-\u001f]/u.test(pathname)) return 'unknown';
  let path: string;
  try { path = decodeURIComponent(pathname); } catch { return 'unknown'; }
  if (/%|\\|[\u0000-\u001f]/u.test(path)) return 'unknown';
  return /^\/(?:zh-CN\/|en\/|ja\/)?library(?:\/|$)/u.test(path) ? 'library' : 'other';
}

export function libraryDocumentNavigation(from: string | null | undefined, to: string) {
  return libraryPathScope(from) !== 'other' || libraryPathScope(to.split(/[?#]/u)[0]) !== 'other';
}

export function librarySafeReferrer(referrer: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    return libraryPathScope(url.pathname) !== 'other' ? `${url.origin}/` : undefined;
  } catch { return ''; }
}
