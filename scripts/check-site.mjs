// Static site checks run in CI (no dependencies): node scripts/check-site.mjs
// - every local href/src points to a real file, and #anchors exist
// - each page has lang, <title>, viewport meta
// - every <img> has alt text
// - no inline event handlers and no inline executable <script> (keeps the CSP strict)
// - no insecure http:// links
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = resolve(process.argv[2] || ".");
const SKIP = new Set(["node_modules", ".git", ".github", "scripts"]);
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith(".") && name !== ".well-known") continue;
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && name.endsWith(".html")) pages.push(p);
  }
})(ROOT);

const errors = [];
const err = (file, msg) => errors.push(`${relative(ROOT, file)}: ${msg}`);
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  if (!/<html[^>]*\slang="[^"]+"/.test(html)) err(file, "missing <html lang>");
  if (!/<title>[^<]+<\/title>/.test(html)) err(file, "missing <title>");
  if (!/<meta name="viewport"/.test(html)) err(file, "missing viewport meta");
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(file, `<img> without alt: ${m[0].slice(0, 80)}`);
  for (const m of html.matchAll(/\son[a-z]+="/g)) err(file, `inline event handler "${m[0].trim()}" (blocked by CSP)`);
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (!/\ssrc="/.test(attrs) && !/type="application\/ld\+json"/.test(attrs) && m[2].trim()) err(file, "inline <script> (blocked by CSP) — move it to a .js file");
  }
  const pageIds = ids(html);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^http:\/\//i.test(url)) err(file, `insecure link ${url}`);
    if (/^(https?:|mailto:|tel:|data:|javascript:|\$\{)/i.test(url)) continue;
    if (url.startsWith("#")) { if (url.length > 1 && !pageIds.has(url.slice(1))) err(file, `broken anchor ${url}`); continue; }
    const [pathPart, hash] = url.split("#");
    const clean = pathPart.split("?")[0];
    if (!clean) continue;
    const target = clean.startsWith("/") ? join(ROOT, clean) : resolve(dirname(file), clean);
    const finalPath = existsSync(target) && statSync(target).isDirectory() ? join(target, "index.html") : target;
    if (!existsSync(finalPath)) { err(file, `broken link ${url}`); continue; }
    if (hash && finalPath.endsWith(".html") && !ids(readFileSync(finalPath, "utf8")).has(hash)) err(file, `broken anchor ${url}`);
  }
}

if (!existsSync(join(ROOT, ".well-known/security.txt"))) errors.push(".well-known/security.txt missing");
console.log(`Checked ${pages.length} pages.`);
if (errors.length) { console.error(`\n✗ ${errors.length} problem(s):\n  ` + errors.join("\n  ")); process.exit(1); }
console.log("✓ All checks passed.");
