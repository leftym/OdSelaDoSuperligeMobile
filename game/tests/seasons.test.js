// A new career at every level plays two full seasons without errors, and the league table adds up.
const { open, newCareer, PLAY_SEASONS } = require('./lib');

const check = (assert, ph, out) => {
  for (const s of out) {
    assert.ok(Number.isFinite(s.money), `${ph}: money is ${s.money}`);
    assert.ok(s.squad >= 11, `${ph}: only ${s.squad} players left`);
    assert.ok(s.pos >= 1, `${ph}: club missing from the table`);
    assert.deepStrictEqual(s.pts, s.wdl, `${ph}: points don't match wins and draws`);
    assert.ok(new Set(s.played).size === 1 && s.played[0] > 0, `${ph}: teams played different numbers of games ${s.played}`);
  }
};
const tests = {};
for (const ph of ['p1', 'p2', 'p3', 'p4', 'p5']) {
  tests[`career at ${ph} plays two seasons`] = async assert => {
    const page = await open();
    await newCareer(page, ph);
    const s0 = await page.evaluate(() => S.season);
    const out = await page.evaluate(`(${PLAY_SEASONS})(2)`);
    check(assert, ph, out);
    assert.strictEqual(await page.evaluate(() => S.season), s0 + 2);
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  };
}
module.exports = tests;
