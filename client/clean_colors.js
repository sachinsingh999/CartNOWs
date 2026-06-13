import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/pages/ProductDetail.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  [/indigo-650/g, 'indigo-600'],
  [/violet-650/g, 'violet-600'],
  [/slate-850/g, 'slate-800'],
  [/slate-855/g, 'slate-800'],
  [/slate-550/g, 'slate-500'],
  [/slate-450/g, 'slate-400'],
  [/rose-450/g, 'rose-400'],
  [/emerald-450/g, 'emerald-400'],
  [/slate-655/g, 'slate-600'],
  [/slate-355/g, 'slate-300'],
  [/indigo-955/g, 'indigo-950'],
  [/indigo-750/g, 'indigo-700'],
  [/slate-750/g, 'slate-700'],
  [/violet-750/g, 'violet-700'],
  [/px-4.5/g, 'px-4'],
  [/px-1.5/g, 'px-2'],
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Colors cleaned successfully!');
