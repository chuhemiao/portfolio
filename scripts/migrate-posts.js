const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', '_posts');
const blogDir = path.join(__dirname, '..', 'content', 'blog');

const categoryMap = {
  'blockchain': ['区块链', 'eth', 'eos', 'dapp', 'web3'],
  'tech': ['react', 'flutter', 'python', 'http', 'seo'],
  'thoughts': ['end', 'life']
};

function getCategory(filename) {
  const lower = filename.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'tech';
}

function getYear(filename) {
  const match = filename.match(/^(\d{4})/);
  return match ? match[1] : '2020';
}

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const year = getYear(file);
  const category = getCategory(file);
  const newName = file.replace('.md', '.mdx');

  const targetDir = path.join(blogDir, year, category);
  fs.mkdirSync(targetDir, { recursive: true });

  const source = path.join(postsDir, file);
  const target = path.join(targetDir, newName);

  fs.copyFileSync(source, target);
  console.log(`Migrated: ${file} -> ${year}/${category}/${newName}`);
});

console.log(`\nMigrated ${files.length} files`);
