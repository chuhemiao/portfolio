const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

// Manual slug mappings for duplicates
const slugFixes = {
  'content/blog/2016/tech/HTTP工作原理.mdx': 'http-basics',
  'content/blog/2016/tech/http状态码.mdx': 'http-status-codes',
  'content/blog/2016/tech/php安装扩展.mdx': 'php-extensions',
  'content/blog/2015/tech/php接口.mdx': 'php-interfaces',
  'content/blog/2020/tech/Flutter 基础.mdx': 'flutter-basics',
  'content/blog/2020/tech/flutter 问题汇总.mdx': 'flutter-issues',
  'content/blog/2020/tech/dart 基础.mdx': 'dart-basics'
};

function updateSlug(filePath, newSlug) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace existing slug
  content = content.replace(/slug: "[^"]*"/, `slug: "${newSlug}"`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${path.relative(blogDir, filePath)} -> ${newSlug}`);
}

Object.entries(slugFixes).forEach(([relativePath, newSlug]) => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    updateSlug(fullPath, newSlug);
  }
});

console.log('\nFixed duplicate slugs');
