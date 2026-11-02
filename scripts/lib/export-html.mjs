export function countInitialHeaderLanguageMenus(markup) {
  const header = markup.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? '';
  return (header.match(/<select\b[^>]*aria-label="(?:Site language|网站语言|サイトの言語)"/gu) ?? []).length;
}
