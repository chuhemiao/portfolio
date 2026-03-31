const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

const fixes = [
  {
    file: '2016/tech/curl_attachment.mdx',
    fix: (content) => {
      return content.replace(
        'summary: "$url = "https://test.idiot.com/preregister/data?phone=15756892356" ;"',
        'summary: "$url = \\"https://test.idiot.com/preregister/data?phone=15756892356\\" ;"'
      );
    }
  },
  {
    file: '2016/tech/php获取url.mdx',
    fix: (content) => {
      // Replace the problematic summary line
      return content.replace(
        /summary: ".*?"\n/s,
        'summary: "PHP获取当前URL的方法"\n'
      );
    }
  },
  {
    file: '2016/tech/qrcode_imagecopyresampled.mdx',
    fix: (content) => {
      // Find and fix the summary with unescaped quotes
      const lines = content.split('\n');
      const summaryIndex = lines.findIndex(l => l.startsWith('summary:'));
      if (summaryIndex !== -1) {
        // Extract summary content and escape quotes
        const summaryLine = lines[summaryIndex];
        const match = summaryLine.match(/summary: "(.*)"$/);
        if (match) {
          const summaryContent = match[1].replace(/"/g, '\\"');
          lines[summaryIndex] = `summary: "${summaryContent}"`;
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: '2017/tech/baijiahao.mdx',
    fix: (content) => {
      const lines = content.split('\n');
      const summaryIndex = lines.findIndex(l => l.startsWith('summary:'));
      if (summaryIndex !== -1) {
        const summaryLine = lines[summaryIndex];
        const match = summaryLine.match(/summary: "(.*)"$/);
        if (match) {
          const summaryContent = match[1].replace(/"/g, '\\"');
          lines[summaryIndex] = `summary: "${summaryContent}"`;
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: '2017/tech/react-ios-native-CFBundleIdentifier.mdx',
    fix: (content) => {
      return content.replace(
        'title: "解决CFBundleIdentifier", Does Not Exist"',
        'title: "解决CFBundleIdentifier Does Not Exist"'
      );
    }
  },
  {
    file: '2019/tech/go-gin-golang-x.mdx',
    fix: (content) => {
      const lines = content.split('\n');
      const summaryIndex = lines.findIndex(l => l.startsWith('summary:'));
      if (summaryIndex !== -1) {
        const summaryLine = lines[summaryIndex];
        const match = summaryLine.match(/summary: "(.*)"$/);
        if (match) {
          const summaryContent = match[1].replace(/"/g, '\\"');
          lines[summaryIndex] = `summary: "${summaryContent}"`;
        }
      }
      return lines.join('\n');
    }
  }
];

fixes.forEach(({ file, fix }) => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fix(content);
  fs.writeFileSync(filePath, fixed);
  console.log(`Fixed: ${file}`);
});

console.log('\nAll fixes applied!');
