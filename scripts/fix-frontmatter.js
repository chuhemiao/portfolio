const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

const categoryMap = {
  'blockchain': 'investing',
  'tech': 'research',
  'thoughts': 'thoughts'
};

function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let title = '';
  let date = '';
  let oldCategory = '';
  let contentStart = 0;

  // Parse old frontmatter
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('title:')) {
      title = line.replace('title:', '').trim();
    } else if (line.startsWith('date:')) {
      date = line.replace('date:', '').trim().split(' ')[0];
    } else if (line.startsWith('categories:')) {
      // Skip categories line, will be mapped from directory
    } else if (line === '---' && i > 0) {
      contentStart = i + 1;
      break;
    }
  }

  // Get category from directory path
  const relativePath = path.relative(blogDir, filePath);
  const pathParts = relativePath.split(path.sep);
  if (pathParts.length >= 2) {
    oldCategory = pathParts[1];
  }

  const newCategory = categoryMap[oldCategory] || 'research';

  // Extract first paragraph as summary
  let summary = '';
  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && !line.startsWith('`')) {
      summary = line.substring(0, 150);
      break;
    }
  }

  if (!summary) summary = title;
  if (!date) date = '2020-01-01';

  // Build new frontmatter
  const newFrontmatter = `---
title: "${title}"
publishedAt: "${date}"
summary: "${summary}"
category: "${newCategory}"
---
`;

  const newContent = newFrontmatter + lines.slice(contentStart).join('\n');
  fs.writeFileSync(filePath, newContent);
  console.log(`Fixed: ${path.relative(blogDir, filePath)}`);
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      fixFrontmatter(fullPath);
    }
  }
}

// Process 2016-2020 directories only (migrated posts)
['2016', '2017', '2018', '2020'].forEach(year => {
  const yearDir = path.join(blogDir, year);
  if (fs.existsSync(yearDir)) {
    processDirectory(yearDir);
  }
});

console.log('\nFrontmatter fix complete!');
