import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/ProductDetail.jsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let openTags = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Skip comments
  if (line.startsWith('//') || line.startsWith('{/*')) continue;
  
  // Find all matches of <div or </div on this line
  // Let's count them manually
  let index = 0;
  while (index < line.length) {
    const nextOpen = line.indexOf('<div', index);
    const nextClose = line.indexOf('</div>', index);
    
    if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
      // It's an opening div. Check if it's self-closing
      const endOfTag = line.indexOf('>', nextOpen);
      if (endOfTag !== -1 && line.substring(nextOpen, endOfTag + 1).endsWith('/>')) {
        // Self-closing div, ignore
      } else {
        openTags.push({ type: 'div', line: i + 1, content: line });
      }
      index = nextOpen + 4;
    } else if (nextClose !== -1) {
      if (openTags.length === 0) {
        console.log(`Extra closing div on line ${i + 1}: ${line}`);
      } else {
        openTags.pop();
      }
      index = nextClose + 6;
    } else {
      break;
    }
  }
}

console.log(`Remaining unclosed tags: ${openTags.length}`);
openTags.forEach(tag => {
  console.log(`Unclosed ${tag.type} on line ${tag.line}: ${tag.content}`);
});
