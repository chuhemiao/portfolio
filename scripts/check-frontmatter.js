const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(__dirname, '..', 'content', 'blog');
const errors = [];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    matter(content);
  } catch (error) {
    errors.push({
      file: path.relative(blogDir, filePath),
      error: error.message
    });
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      checkFile(fullPath);
    }
  }
}

scanDir(blogDir);

if (errors.length > 0) {
  console.log(`Found ${errors.length} files with frontmatter errors:\n`);
  errors.forEach(({ file, error }) => {
    console.log(`❌ ${file}`);
    console.log(`   ${error}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ All frontmatter is valid!');
}
