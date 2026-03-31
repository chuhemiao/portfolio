const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

function extractPublishedYear(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/publishedAt:\s*"(\d{4})-/);
  return match ? match[1] : null;
}

function getCategoryFromPath(filePath) {
  const relativePath = path.relative(blogDir, filePath);
  const parts = relativePath.split(path.sep);
  if (parts.length >= 2) {
    return parts[1]; // blockchain, tech, thoughts
  }
  return 'tech';
}

function reorganizeFiles() {
  const moves = [];

  // Scan 2016-2020 directories
  ['2016', '2017', '2018', '2020'].forEach(yearDir => {
    const yearPath = path.join(blogDir, yearDir);
    if (!fs.existsSync(yearPath)) return;

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const actualYear = extractPublishedYear(fullPath);
          const category = getCategoryFromPath(fullPath);

          if (actualYear && actualYear !== yearDir) {
            const targetDir = path.join(blogDir, actualYear, category);
            const targetPath = path.join(targetDir, entry.name);

            moves.push({
              from: fullPath,
              to: targetPath,
              fromYear: yearDir,
              toYear: actualYear,
              category,
              filename: entry.name
            });
          }
        }
      }
    }

    scanDir(yearPath);
  });

  // Execute moves
  moves.forEach(move => {
    const targetDir = path.dirname(move.to);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.renameSync(move.from, move.to);
    console.log(`Moved: ${move.filename} from ${move.fromYear} to ${move.toYear}/${move.category}`);
  });

  console.log(`\nReorganized ${moves.length} files`);
}

reorganizeFiles();
