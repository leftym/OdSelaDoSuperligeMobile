// Splits a single od-sela.html (for example the one published on claude.ai) back into game/src/.
//   node game/tools/import.js path/to/od-sela.html [output folder, default game/src]
// The code is cut at its section headers (/* ---------- name ---------- */), one file per section,
// numbered in order, so the build joins them back into exactly the same page.
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node game/tools/import.js path/to/od-sela.html'); process.exit(1); }
const html = fs.readFileSync(file, 'utf8');
const src = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, '..', 'src');
fs.mkdirSync(src, { recursive: true });

const cssOpen = html.indexOf('<style>\n'), cssClose = html.indexOf('\n</style>', cssOpen);
const jsOpen = html.indexOf('<script>\n', cssClose), jsClose = html.lastIndexOf('\n</script>');
if (cssOpen < 0 || cssClose < 0 || jsOpen < 0 || jsClose < jsOpen) { console.error('Could not find the <style> and <script> blocks.'); process.exit(1); }
const css = html.slice(cssOpen + 8, cssClose);
const js = html.slice(jsOpen + 9, jsClose);
const tpl = html.slice(0, cssOpen + 8) + '/*__CSS__*/' + html.slice(cssClose, jsOpen + 9) + '/*__JS__*/' + html.slice(jsClose);

// Cut the code at each section header.
const lines = js.split('\n');
const parts = [];
let cur = { name: 'start', lines: [] };
for (const l of lines) {
  const m = l.match(/^\/\* -{5,} (.+?) -{5,} \*\/$/);
  if (m && cur.lines.some(x => x.trim())) { parts.push(cur); cur = { name: m[1], lines: [] }; }
  else if (m) cur.name = m[1];
  cur.lines.push(l);
}
parts.push(cur);

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[:,(]/)[0]
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 4).join('-') || 'part';
const jsDir = path.join(src, 'js');
fs.rmSync(jsDir, { recursive: true, force: true });
fs.mkdirSync(jsDir, { recursive: true });
parts.forEach((p, i) => {
  const name = String(i).padStart(2, '0') + '-' + slug(p.name) + '.js';
  // Every file but the last ends with the newline that separated it from the next section.
  fs.writeFileSync(path.join(jsDir, name), p.lines.join('\n') + (i < parts.length - 1 ? '\n' : ''));
});
fs.writeFileSync(path.join(src, 'styles.css'), css);
fs.writeFileSync(path.join(src, 'index.html'), tpl);
console.log(`Imported ${parts.length} code files, styles and page into ${path.relative(process.cwd(), src) || '.'}.`);
