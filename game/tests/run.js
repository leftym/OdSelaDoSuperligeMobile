// Runs every *.test.js in this folder (or those whose name contains the argument): node game/tests/run.js [filter]
// Build first: node game/build.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { teardown } = require('./lib');

const filter = process.argv[2] || '';
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js') && f.includes(filter)).sort();
if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'od-sela.html'))) { console.error('Run node game/build.js first.'); process.exit(1); }

(async () => {
  let pass = 0, fail = 0;
  const t0 = Date.now();
  for (const f of files) {
    const tests = require(path.join(__dirname, f));
    for (const [name, fn] of Object.entries(tests)) {
      const s = Date.now();
      try {
        await fn(assert);
        pass++;
        console.log(`  ok    ${f.replace('.test.js', '')} › ${name} (${((Date.now() - s) / 1000).toFixed(1)}s)`);
      } catch (e) {
        fail++;
        console.log(`  FAIL  ${f.replace('.test.js', '')} › ${name}\n        ${String(e.message || e).split('\n').join('\n        ')}`);
      }
    }
  }
  await teardown();
  console.log(`\n${pass} passed, ${fail} failed in ${Math.round((Date.now() - t0) / 1000)}s`);
  process.exit(fail ? 1 : 0);
})();
