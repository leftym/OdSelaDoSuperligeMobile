// Europe: the round of 16 carries on after the league ends and every tie can be finished, through to the final.
const { open, newCareer } = require('./lib');

module.exports = {
  'a knockout run after the season can always be completed': async assert => {
    const page = await open();
    for (let trial = 0; trial < 3; trial++) {
      await newCareer(page, 'p5');
      const r = await page.evaluate(() => {
        S.squad.forEach(p => { for (const [k] of STATS) p[k] = 19; });
        S.week = 14; S.euro = { c: 'ucl', stage: 'ko2', r2: 0, used: [], agg: [0, 0], best: 'x' };
        S.euro.opp = euroOpp(EURO.ucl.ko + .4); S.euro.opp.r = 9; seasonSummary(); S.mq = []; S.tab = 'home'; render();
        let guard = 0, matches = 0;
        while (euroLate() && guard++ < 20) {
          A.eurolate(); S.modal = null; openMatch('euro'); A.quick(); A.endmatch(); matches++;
          let g = 0; while ((S.modal || S.mq.length) && g++ < 20) { S.modal = null; nextModal(); if (S.modal && S.modal.type === 'euro') { S.modal = null; break; } }
        }
        return { matches, stage: S.euro && S.euro.stage, late: euroLate() };
      });
      assert.ok(r.matches >= 2, 'fewer than two legs were played');
      assert.strictEqual(r.late, false, 'Europe still waiting after the run');
    }
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
  'after the first leg the Continue button leads somewhere': async assert => {
    const page = await open();
    await newCareer(page, 'p5');
    await page.evaluate(() => {
      S.week = 14; S.euro = { c: 'ucl', stage: 'ko2', r2: 0, used: [], agg: [0, 0], best: 'x' };
      S.euro.opp = euroOpp(EURO.ucl.ko); seasonSummary(); S.mq = []; S.tab = 'home'; render();
      document.querySelector('[data-a=eurolate]').click();
      document.querySelector('#modal [data-a=europlay]').click();
      A.quick(); renderModal();
    });
    await page.click('#modal [data-a=endmatch]');
    for (let i = 0; i < 6; i++) {
      const b = await page.$('#modal [data-a=ok],#modal [data-a=nextseason]');
      if (!b) break;
      await b.click();
    }
    const after = await page.evaluate(() => ({ modal: S.modal && S.modal.type, next: document.querySelectorAll('[data-a=eurolate],[data-a=seasonview],[data-a=play],#modal [data-a]').length }));
    assert.ok(after.next > 0, 'nothing left to press: ' + JSON.stringify(after));
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
};
