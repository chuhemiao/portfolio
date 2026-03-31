const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

function generateSlug(filename) {
  // Remove extension
  let slug = filename.replace(/\.mdx?$/, '');

  // Remove leading/trailing spaces
  slug = slug.trim();

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace Chinese and special characters with hyphens
  slug = slug
    .replace(/[\u4e00-\u9fff]+/g, '-') // Chinese characters
    .replace(/[^\w\s-]/g, '-') // Special characters
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If slug is empty or too short, use a hash
  if (slug.length < 3) {
    slug = 'post-' + Math.random().toString(36).substring(2, 8);
  }

  return slug;
}

function needsSlug(filePath) {
  const filename = path.basename(filePath, '.mdx');

  // Check if filename has problematic characters
  return (
    /[\u4e00-\u9fff]/.test(filename) || // Chinese
    /[^\w\s-]/.test(filename) || // Special chars
    /^\s/.test(filename) || // Leading space
    /\s$/.test(filename) // Trailing space
  );
}

function addSlugToFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check if slug already exists
  if (content.includes('slug:')) {
    return false;
  }

  const filename = path.basename(filePath, '.mdx');
  const slug = generateSlug(filename);

  // Find the end of frontmatter (second ---)
  let frontmatterEnd = -1;
  let dashCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) {
        frontmatterEnd = i;
        break;
      }
    }
  }

  if (frontmatterEnd === -1) {
    console.log(`⚠️  No frontmatter found: ${path.relative(blogDir, filePath)}`);
    return false;
  }

  // Insert slug before the closing ---
  lines.splice(frontmatterEnd, 0, `slug: "${slug}"`);

  fs.writeFileSync(filePath, lines.join('\n'));
  return true;
}

let count = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      if (needsSlug(fullPath) && addSlugToFrontmatter(fullPath)) {
        count++;
        const filename = path.basename(fullPath, '.mdx');
        const slug = generateSlug(filename);
        console.log(`Added slug: ${slug} -> ${entry.name}`);
      }
    }
  }
}

scanDir(blogDir);

console.log(`\nAdded slugs to ${count} posts`);
