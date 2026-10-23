// Builds the game from game/src/. No dependencies: run with `node game/build.js`.
//   game/dist/od-sela.html + img/    the web version (fonts from Google Fonts)
//   android/app/src/main/assets/      the app's copy: the same page with its fonts and paintings inside the app
const fs = require('fs');
const path = require('path');

const root = __dirname;
const src = path.join(root, 'src');
const tpl = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(src, 'styles.css'), 'utf8');
const files = fs.readdirSync(path.join(src, 'js')).filter(f => f.endsWith('.js')).sort();
const js = files.map(f => fs.readFileSync(path.join(src, 'js', f), 'utf8')).join('');
if (!tpl.includes('/*__CSS__*/') || !tpl.includes('/*__JS__*/')) {
  console.error('src/index.html is missing a /*__CSS__*/ or /*__JS__*/ placeholder');
  process.exit(1);
}
const page = (style, code) => tpl.replace('/*__CSS__*/', () => style).replace('/*__JS__*/', () => code);

function copyDir(from, to, ext) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  const list = fs.readdirSync(from).filter(f => f.endsWith(ext)).sort();
  for (const f of list) fs.copyFileSync(path.join(from, f), path.join(to, f));
  return list.length;
}

// Web version
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const html = page(css, js);
fs.writeFileSync(path.join(dist, 'od-sela.html'), html);
fs.writeFileSync(path.join(dist, 'game.js'), js);
const nImg = copyDir(path.join(src, 'img'), path.join(dist, 'img'), '.webp');

// Android version: no internet needed, so the Google Fonts links are swapped for the fonts in src/fonts.
const app = path.join(root, '..', 'android', 'app');
let nFont = 0;
if (fs.existsSync(app)) {
  const asset = path.join(app, 'src', 'main', 'assets');
  fs.mkdirSync(asset, { recursive: true });
  const fontCss = fs.readFileSync(path.join(src, 'fonts', 'fonts.css'), 'utf8');
  const offline = tpl.split('\n').filter(l => !/fonts\.(googleapis|gstatic)\.com/.test(l)).join('\n')
    .replace('/*__CSS__*/', () => fontCss + '\n' + css).replace('/*__JS__*/', () => js);
  fs.writeFileSync(path.join(asset, 'index.html'), offline);
  copyDir(path.join(src, 'img'), path.join(asset, 'img'), '.webp');
  nFont = copyDir(path.join(src, 'fonts'), path.join(asset, 'fonts'), '.woff2');
}
console.log(`Built od-sela.html (${Math.round(html.length / 1024)} KB, ${files.length} code files, ${nImg} paintings${nFont ? `, Android copy with ${nFont} fonts` : ''}).`);
