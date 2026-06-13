import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/ProductDetail.jsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let openTags = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('//') || line.startsWith('{/*')) continue;
  
  let index = 0;
  while (index < line.length) {
    const nextOpen = line.indexOf('<div', index);
    const nextClose = line.indexOf('</div>', index);
    
    if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
      const endOfTag = line.indexOf('>', nextOpen);
      if (endOfTag !== -1 && line.substring(nextOpen, endOfTag + 1).endsWith('/>')) {
        // self-closing
      } else {
        openTags.push({ line: i + 1, content: line });
        console.log(`[OPEN] Line ${i + 1}: ${line} (Stack depth: ${openTags.length})`);
      }
      index = nextOpen + 4;
    } else if (nextClose !== -1) {
      if (openTags.length === 0) {
        console.log(`[EXTRA CLOSE] Line ${i + 1}: ${line}`);
      } else {
        const popped = openTags.pop();
        console.log(`[CLOSE] Line ${i + 1}: ${line} (Closed line ${popped.line}, Stack depth: ${openTags.length})`);
      }
      index = nextClose + 6;
    } else {
      break;
    }
  }
}
