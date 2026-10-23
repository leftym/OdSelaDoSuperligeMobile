// The build and the import tool must agree, and every painting the code names must exist.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');

module.exports = {
  'import of the built page gives back the same source files': assert => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'odsela-'));
    execFileSync('node', [path.join(root, 'tools', 'import.js'), path.join(root, 'dist', 'od-sela.html'), tmp], { stdio: 'pipe' });
    for (const f of ['index.html', 'styles.css']) assert.strictEqual(fs.readFileSync(path.join(tmp, f), 'utf8'), fs.readFileSync(path.join(root, 'src', f), 'utf8'), f);
    const a = fs.readdirSync(path.join(tmp, 'js')).sort(), b = fs.readdirSync(path.join(root, 'src', 'js')).sort();
    assert.deepStrictEqual(a, b, 'code file names');
    for (const f of a) assert.strictEqual(fs.readFileSync(path.join(tmp, 'js', f), 'utf8'), fs.readFileSync(path.join(root, 'src', 'js', f), 'utf8'), f);
    fs.rmSync(tmp, { recursive: true, force: true });
  },
  'the game code parses': () => {
    new Function(fs.readFileSync(path.join(root, 'dist', 'game.js'), 'utf8'));
  },
  'every painting named in the code exists': assert => {
    const code = fs.readFileSync(path.join(root, 'dist', 'game.js'), 'utf8');
    const named = new Set([...code.matchAll(/img\/([a-z0-9-]+)\.webp/g)].map(m => m[1]));
    const missing = [...named].filter(n => !fs.existsSync(path.join(root, 'src', 'img', n + '.webp')));
    assert.deepStrictEqual(missing, []);
  },
  'the Android copy has no internet links and carries its fonts': assert => {
    const p = path.join(root, '..', 'android', 'app', 'src', 'main', 'assets', 'index.html');
    if (!fs.existsSync(p)) return;
    const html = fs.readFileSync(p, 'utf8');
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), 'Google Fonts link left in the app');
    for (const m of html.matchAll(/url\(fonts\/([^)]+)\)/g)) assert.ok(fs.existsSync(path.join(path.dirname(p), 'fonts', m[1])), 'missing font ' + m[1]);
    assert.ok(html.includes('Alfa Slab One') && html.includes('Barlow Condensed'));
  },
};
