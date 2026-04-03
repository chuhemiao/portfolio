const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function fetchChannelMessages() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`;
  const res = await fetch(url);
  const data = await res.json();

  console.log('API Response:', JSON.stringify(data, null, 2));

  if (!data.ok) throw new Error('Failed to fetch messages');

  const channelPosts = data.result.filter(u => u.channel_post && u.channel_post.text);
  console.log(`Found ${channelPosts.length} channel posts`);

  return channelPosts
    .map(u => ({
      id: String(u.channel_post.message_id),
      text: u.channel_post.text,
      date: new Date(u.channel_post.date * 1000).toISOString(),
      timestamp: u.channel_post.date
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function main() {
  const filePath = path.join(__dirname, '..', 'content', 'thoughts.json');

  // 读取现有数据
  let existing = { thoughts: [] };
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const newThoughts = await fetchChannelMessages();

  // 合并数据，按 ID 去重
  const existingIds = new Set(existing.thoughts.map(t => t.id));
  const merged = [
    ...newThoughts.filter(t => !existingIds.has(t.id)),
    ...existing.thoughts
  ].sort((a, b) => b.timestamp - a.timestamp);

  const data = {
    thoughts: merged,
    lastSync: new Date().toISOString(),
    totalCount: merged.length
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Synced ${newThoughts.length} new, total ${merged.length} thoughts`);
}

main().catch(console.error);
