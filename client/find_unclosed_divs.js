import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/pages/ProductDetail.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// A simple lexical scanner for JSX/HTML tags
let pos = 0;
let stack = [];
let lineNum = 1;

while (pos < content.length) {
  const char = content[pos];
  if (char === '\n') {
    lineNum++;
    pos++;
    continue;
  }

  // Check for block comments in JS/JSX
  if (content.startsWith('/*', pos)) {
    pos = content.indexOf('*/', pos + 2);
    if (pos === -1) break;
    pos += 2;
    continue;
  }
  // Check for line comments
  if (content.startsWith('//', pos)) {
    pos = content.indexOf('\n', pos + 2);
    if (pos === -1) break;
    continue;
  }

  // Look for tags
  if (char === '<') {
    // Check if it's a comment inside JSX
    if (content.startsWith('<!--', pos)) {
      pos = content.indexOf('-->', pos + 4);
      if (pos === -1) break;
      pos += 3;
      continue;
    }
    
    // Check if it's a closing div
    if (content.startsWith('</div>', pos)) {
      if (stack.length === 0) {
        console.log(`Extra closing </div> on line ${lineNum}`);
      } else {
        const popped = stack.pop();
        // console.log(`Closed <div> from line ${popped.line} on line ${lineNum}`);
      }
      pos += 6;
      continue;
    }

    // Check if it's an opening div
    if (content.startsWith('<div', pos) && (content[pos + 4] === ' ' || content[pos + 4] === '>' || content[pos + 4] === '\n' || content[pos + 4] === '\r')) {
      const startLine = lineNum;
      let tagEnd = -1;
      let tempPos = pos + 4;
      let inString = false;
      let quoteChar = null;
      let bracesDepth = 0;

      while (tempPos < content.length) {
        const c = content[tempPos];
        if (c === '\n') lineNum++;
        
        if (inString) {
          if (c === quoteChar) {
            inString = false;
          }
        } else {
          if (c === '"' || c === "'" || c === '`') {
            inString = true;
            quoteChar = c;
          } else if (c === '{') {
            bracesDepth++;
          } else if (c === '}') {
            bracesDepth--;
          } else if (c === '>' && bracesDepth === 0) {
            tagEnd = tempPos;
            break;
          }
        }
        tempPos++;
      }

      if (tagEnd !== -1) {
        const tagText = content.substring(pos, tagEnd + 1);
        const isSelfClosing = tagText.trim().endsWith('/>');
        if (!isSelfClosing) {
          stack.push({ line: startLine, text: tagText.substring(0, 80).replace(/\s+/g, ' ') });
        }
        pos = tagEnd + 1;
        continue;
      }
    }
  }
  pos++;
}

console.log(`\n--- Unclosed Divs: ${stack.length} ---`);
stack.forEach(item => {
  console.log(`Line ${item.line}: ${item.text}`);
});
