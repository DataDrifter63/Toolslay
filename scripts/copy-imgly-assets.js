// Copies @imgly/background-removal's model/WASM assets into /public/imgly
// so the Background Remover tool can load them from the same origin instead
// of a third-party CDN. Runs automatically via the "postinstall" npm script
// (see package.json), which also means it runs on every Vercel/Cloudflare
// deploy — not just on your own machine.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "@imgly", "background-removal", "dist");
const dest = path.join(__dirname, "..", "public", "imgly");

function copyRecursive(from, to) {
  if (!fs.existsSync(from)) {
    console.warn(`[copy-imgly-assets] Skipped — ${from} not found. Did "npm install @imgly/background-removal" run?`);
    return;
  }
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) copyRecursive(fromPath, toPath);
    else fs.copyFileSync(fromPath, toPath);
  }
}

copyRecursive(src, dest);
console.log(`[copy-imgly-assets] Copied model assets to ${dest}`);
