import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const srcFile = path.join(rootDir, "common", "validation.js");

const targets = [
  path.join(rootDir, "server", "utils", "validation.js"),
  path.join(rootDir, "client", "src", "utils", "validation.js"),
  path.join(rootDir, "admin", "src", "utils", "validation.js"),
  path.join(rootDir, "seller", "src", "utils", "validation.js"),
  path.join(rootDir, "deliveryman", "src", "utils", "validation.js")
];

console.log(`Syncing ${srcFile} to target paths...`);

if (!fs.existsSync(srcFile)) {
  console.error("Source validation.js file does not exist!");
  process.exit(1);
}

const content = fs.readFileSync(srcFile, "utf8");

targets.forEach((target) => {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, content, "utf8");
  console.log(`Successfully synced to: ${target}`);
});

console.log("Validation sync completed!");
