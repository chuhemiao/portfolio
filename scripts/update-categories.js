const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

function updateCategory(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace category: "research" with category: "thoughts"
  if (content.includes('category: "research"')) {
    content = content.replace('category: "research"', 'category: "thoughts"');
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

let count = 0;

// Update categories for old posts (2015-2020)
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
        if (updateCategory(fullPath)) {
          count++;
          console.log(`Updated: ${path.relative(blogDir, fullPath)}`);
        }
      }
    }
  }

  scanDir(yearPath);
});

console.log(`\nUpdated ${count} posts to "thoughts" category`);
