const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'thoughts');
const IMAGE_ROUTE = '/thoughts';

async function fetchChannelPosts() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) throw new Error('Failed to fetch messages');

  // A photo message carries `caption`, not `text`. Filtering on `text` alone
  // dropped every message with an image, caption and all.
  const posts = data.result
    .map(u => u.channel_post)
    .filter(p => p && (p.text || p.caption || p.photo));

  console.log(`Found ${posts.length} channel posts`);
  return posts;
}

// An album arrives as one update per photo, all sharing media_group_id.
// Without grouping, a three-photo post becomes three separate thoughts.
function groupPosts(posts) {
  const groups = new Map();
  for (const post of posts) {
    const key = post.media_group_id ?? `single:${post.message_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }
  return [...groups.values()].map(group => group.sort((a, b) => a.message_id - b.message_id));
}

async function downloadPhoto(photo, name) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${photo.file_id}`);
  const data = await res.json();
  if (!data.ok) {
    console.warn(`  getFile failed for ${name}: ${data.description ?? 'unknown error'}`);
    return null;
  }

  const ext = path.extname(data.result.file_path) || '.jpg';
  const target = path.join(IMAGE_DIR, `${name}${ext}`);

  if (!fs.existsSync(target)) {
    // The download URL embeds the bot token, so it can never be stored or used
    // as an image src. Fetch the bytes now and keep only the local path.
    const file = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`);
    if (!file.ok) {
      console.warn(`  download failed for ${name}: ${file.status}`);
      return null;
    }
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    fs.writeFileSync(target, Buffer.from(await file.arrayBuffer()));
  }

  return { src: `${IMAGE_ROUTE}/${path.basename(target)}`, width: photo.width, height: photo.height };
}

async function toThought(group) {
  const head = group[0];
  const thought = {
    id: String(head.message_id),
    text: group.map(p => p.text ?? p.caption ?? '').find(t => t.trim()) ?? '',
    date: new Date(head.date * 1000).toISOString(),
    timestamp: head.date
  };

  const withPhoto = group.filter(p => p.photo && p.photo.length);
  const images = [];
  for (const [i, post] of withPhoto.entries()) {
    // `photo` is ascending by size, so the last entry is the largest.
    const largest = post.photo[post.photo.length - 1];
    const image = await downloadPhoto(largest, withPhoto.length > 1 ? `${thought.id}-${i + 1}` : thought.id);
    if (image) images.push(image);
  }
  if (images.length) thought.images = images;

  return thought;
}

async function main() {
  const filePath = path.join(__dirname, '..', 'content', 'thoughts.json');

  // 读取现有数据
  let existing = { thoughts: [] };
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // 合并数据，按 ID 去重
  const existingIds = new Set(existing.thoughts.map(t => t.id));
  const newThoughts = [];
  for (const group of groupPosts(await fetchChannelPosts())) {
    if (existingIds.has(String(group[0].message_id))) continue;
    newThoughts.push(await toThought(group));
  }

  const merged = [...newThoughts, ...existing.thoughts].sort((a, b) => b.timestamp - a.timestamp);

  const data = {
    thoughts: merged,
    lastSync: new Date().toISOString(),
    totalCount: merged.length
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  const withImages = newThoughts.filter(t => t.images).length;
  console.log(`Synced ${newThoughts.length} new (${withImages} with images), total ${merged.length} thoughts`);
}

main().catch(console.error);
