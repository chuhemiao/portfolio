const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

// Technical keywords that indicate a tech post
const techKeywords = [
  'react', 'native', 'flutter', 'dart', 'javascript', 'typescript',
  'git', 'github', 'php', 'python', 'golang', 'go', 'node',
  'http', 'https', 'api', 'curl', 'nginx', 'mysql', 'database',
  'seo', 'css', 'html', 'code', 'bug', 'error', 'function',
  'install', 'config', 'setup', '配置', '安装', '教程', '指南',
  'yii', 'yaf', 'laravel', 'composer', 'npm', 'webpack',
  'ios', 'android', 'app', 'sdk', 'framework', 'library',
  '算法', '加密', '接口', '开发', 'debug', 'es6', 'hexo',
  'typecho', 'wordpress', 'markdown', 'vpn', 'server'
];

// Personal/life keywords that indicate a thoughts post
const thoughtsKeywords = [
  '忙碌', '心情', '年终', '总结', '水瓶座', '男人', '心理',
  '公司', '留住人', '努力', '工作', '菜', '假', '现实',
  'end', 'life', 'busy', 'mood'
];

function categorizePost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Extract title
  let title = '';
  for (const line of lines) {
    if (line.startsWith('title:')) {
      title = line.replace('title:', '').replace(/"/g, '').trim().toLowerCase();
      break;
    }
  }

  // Check for thoughts keywords first (higher priority for personal posts)
  for (const keyword of thoughtsKeywords) {
    if (title.includes(keyword.toLowerCase())) {
      return 'thoughts';
    }
  }

  // Check for tech keywords
  for (const keyword of techKeywords) {
    if (title.includes(keyword.toLowerCase())) {
      return 'tech';
    }
  }

  // Default to thoughts for ambiguous cases
  return 'thoughts';
}

function updateCategory(filePath, newCategory) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('category: "thoughts"')) {
    content = content.replace('category: "thoughts"', `category: "${newCategory}"`);
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

let techCount = 0;
let thoughtsCount = 0;

// Process old posts (2015-2020)
['2015', '2016', '2017', '2018', '2019', '2020'].forEach(year => {
  const yearPath = path.join(blogDir, year);
  if (!fs.existsSync(yearPath)) return;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const category = categorizePost(fullPath);

        if (category === 'tech' && updateCategory(fullPath, 'tech')) {
          techCount++;
          console.log(`Tech: ${path.relative(blogDir, fullPath)}`);
        } else {
          thoughtsCount++;
        }
      }
    }
  }

  scanDir(yearPath);
});

console.log(`\nCategorized ${techCount} as tech, ${thoughtsCount} remain as thoughts`);
