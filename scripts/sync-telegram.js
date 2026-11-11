const fs = require('fs');
const path = require('path');

// The channel is public, so its web preview is the source. The Bot API's
// getUpdates only holds 24 hours of updates and hands each one to whichever
// poller asks first: messages posted a few hours before a run came back as
// "Found 0", and any run that failed afterwards lost what it had fetched.
// The preview keeps the whole history, so a missed day is caught up next run.
const CHANNEL = process.env.TELEGRAM_CHANNEL_USERNAME || 'kkdemian2050';
const PREVIEW = `https://t.me/s/${CHANNEL}`;
const MAX_PAGES = 10;
const FILE = path.join(__dirname, '..', 'content', 'thoughts.json');
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'thoughts');
const IMAGE_ROUTE = '/thoughts';

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const bareUrl = (s) => s.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Stored texts keep links as [text](url), except where Telegram auto-linked a
// bare URL or domain: that stays plain, as it was typed.
function messageText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, inner) => {
        const text = decodeEntities(inner.replace(/<[^>]+>/g, ''));
        const url = decodeEntities(href);
        if (bareUrl(text.trim()) === bareUrl(url)) return text;
        const [, lead, label, trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        return `${lead}[${label}](${url})${trail}`;
      })
      .replace(/<[^>]+>/g, '')
  );
}

function parsePreview(html) {
  const posts = [];
  for (const block of html.split('<div class="tgme_widget_message_wrap').slice(1)) {
    const id = block.match(/data-post="[^/"]+\/(\d+)"/)?.[1];
    const date = block.match(/<time datetime="([^"]+)"/)?.[1];
    if (!id || !date) continue;
    const body = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    // An album is one block holding every photo, under the first message id.
    const photos = [...block.matchAll(/tgme_widget_message_photo_wrap[^"]*"[^>]*background-image:url\('([^']+)'\)/g)].map((m) => m[1]);
    posts.push({ id, date, text: body ? messageText(body) : '', photos });
  }
  return posts;
}

function jpegSize(buffer) {
  let i = 2;
  while (i + 9 < buffer.length && buffer[i] === 0xff) {
    const marker = buffer[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
    }
    i += 2 + buffer.readUInt16BE(i + 2);
  }
  return null;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

// Pages back until it reaches a message that is already stored, so a gap of
// any length is filled without re-reading the whole channel every run.
async function fetchNewPosts(knownIds) {
  const found = new Map();
  let url = PREVIEW;
  for (let page = 0; page < MAX_PAGES; page++) {
    const posts = parsePreview(await fetchText(url));
    if (posts.length === 0) {
      if (page === 0) throw new Error(`no messages parsed from ${PREVIEW}; the channel went private or the page markup changed`);
      break;
    }
    for (const post of posts) if (!knownIds.has(post.id)) found.set(post.id, post);
    const oldest = Math.min(...posts.map((p) => Number(p.id)));
    if (posts.some((p) => knownIds.has(p.id)) || oldest <= 1) break;
    url = `${PREVIEW}?before=${oldest}`;
  }
  return [...found.values()];
}

async function downloadPhoto(url, name) {
  const target = path.join(IMAGE_DIR, `${name}.jpg`);
  if (!fs.existsSync(target)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  download failed for ${name}: ${res.status}`);
      return null;
    }
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  const size = jpegSize(fs.readFileSync(target));
  if (!size) {
    console.warn(`  ${name} is not a JPEG; skipped`);
    fs.unlinkSync(target);
    return null;
  }
  return { src: `${IMAGE_ROUTE}/${path.basename(target)}`, ...size };
}

async function toThought(post) {
  const timestamp = Math.floor(Date.parse(post.date) / 1000);
  const thought = { id: post.id, text: post.text, date: new Date(timestamp * 1000).toISOString(), timestamp };
  const images = [];
  for (const [i, url] of post.photos.entries()) {
    const image = await downloadPhoto(url, post.photos.length > 1 ? `${post.id}-${i + 1}` : post.id);
    if (image) images.push(image);
  }
  if (images.length) thought.images = images;
  return thought;
}

async function main() {
  const existing = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { thoughts: [] };
  const knownIds = new Set(existing.thoughts.map((t) => t.id));

  // Service messages (pins, title changes) carry neither text nor a photo.
  const posts = (await fetchNewPosts(knownIds)).filter((p) => p.text.trim() || p.photos.length);
  console.log(`Found ${posts.length} new channel posts`);

  const newThoughts = [];
  for (const post of posts) newThoughts.push(await toThought(post));

  const merged = [...newThoughts, ...existing.thoughts].sort((a, b) => b.timestamp - a.timestamp);
  fs.writeFileSync(FILE, JSON.stringify({ thoughts: merged, lastSync: new Date().toISOString(), totalCount: merged.length }, null, 2));
  const withImages = newThoughts.filter((t) => t.images).length;
  console.log(`Synced ${newThoughts.length} new (${withImages} with images), total ${merged.length} thoughts`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { parsePreview, messageText, jpegSize };
