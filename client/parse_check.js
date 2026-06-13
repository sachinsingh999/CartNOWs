import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';

const filePath = path.resolve('src/pages/ProductDetail.jsx');
const content = fs.readFileSync(filePath, 'utf8');

try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log("Parsing successful! No JSX errors found.");
} catch (err) {
  console.error("Parsing failed:");
  console.error(err.message);
  if (err.loc) {
    console.error(`Error at Line ${err.loc.line}, Column ${err.loc.column}`);
    const lines = content.split('\n');
    console.error("Context:");
    for (let l = Math.max(0, err.loc.line - 5); l < Math.min(lines.length, err.loc.line + 5); l++) {
      console.error(`${l + 1}: ${lines[l]}`);
    }
  }
}
