// Saves: a career survives a reload, old English saves still open, and a broken save never leaves a blank screen.
const fs = require('fs');
const path = require('path');
const { open, newCareer, PLAY_SEASONS } = require('./lib');
const OLD = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'oldsaves.json'), 'utf8'));
const KEY = 'odsela-save-v1';

async function playedSave() {
  const page = await open();
  await newCareer(page, 'p5');
  await page.evaluate(`(${PLAY_SEASONS})(1)`);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) { S.modal = null; openMatch(); A.quick(); A.endmatch(); S.modal = null; S.mq = []; S.pending = []; } save(); });
  const raw = await page.evaluate(k => localStorage.getItem(k), KEY);
  await page.close();
  return raw;
}
let cached;
const save = async () => cached || (cached = await playedSave());

const BROKEN = {
  'European tie with no opponent': "s.euro={c:'ucl',stage:'ko2',r2:0,leg:1,pending:true,opp:null,agg:[1,0]};s.modal={type:'euro'};",
  'European tie past the final': "s.euro={c:'ucl',stage:'ko2',r2:9,leg:2,pending:true,opp:{name:'X'}};s.modal={type:'euro'};s.hold=1;",
  'stuck match screen and junk queue': "s.modal={type:'match'};s.mq=[{type:'nonsense'},null];s.hold=1;",
  'empty players in the squad': "s.squad.push(null);s.squad.push({});",
  'missing lists': "s.pending=null;s.mq=null;s.table=null;",
  'save with no league': "delete s.teams;",
  'save that is not data at all': "return '{not json';",
};

const tests = {
  'a career survives a reload': async assert => {
    const raw = await save();
    const page = await open({ storage: { [KEY]: raw } });
    const s = JSON.parse(raw);
    const now = await page.evaluate(() => ({ season: S.season, week: S.week, money: S.money, club: S.club.name, squad: S.squad.length }));
    assert.deepStrictEqual(now, { season: s.season, week: s.week, money: s.money, club: s.club.name, squad: s.squad.length });
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
  'old English saves open in Serbian': async assert => {
    for (const [k, raw] of Object.entries(OLD.saves)) {
      const page = await open({ storage: { [KEY]: raw, 'odsela-meta': OLD.meta } });
      const ok = await page.evaluate(() => !!S && document.querySelectorAll('[data-a=play],[data-a=pendmatch],[data-a=eurolate],[data-a=seasonview]').length > 0);
      assert.ok(ok, `${k}: home screen did not load`);
      assert.deepStrictEqual(page.errors, [], k);
      await page.close();
    }
  },
  'a slow load opens next time in safe mode': async assert => {
    const page = await open({ storage: { [KEY]: await save(), 'odsela-boot': '1' } });
    assert.match(await page.evaluate(() => document.querySelector('#toast').textContent), /sigurnom/);
    assert.ok(await page.evaluate(() => !!S && !S.modal));
    await page.close();
  },
};
for (const [name, js] of Object.entries(BROKEN)) {
  tests[`broken save: ${name}`] = async assert => {
    const page = await open();
    await page.evaluate(([raw, js, KEY]) => { const s = JSON.parse(raw); const out = new Function('s', js + ';return JSON.stringify(s)')(s); localStorage.setItem(KEY, out); }, [await save(), js, KEY]);
    await page.reload();
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({
      rescue: !!document.querySelector('textarea[readonly]'),
      playable: !!S && document.querySelectorAll('#app [data-a]').length > 0,
      backup: !!localStorage.getItem('odsela-save-v1-backup'),
    }));
    assert.ok(r.rescue || r.playable, 'blank screen: neither playable nor the rescue screen');
    assert.deepStrictEqual(page.errors, [], 'errors escaped the start-up guard');
    if (name !== 'stuck match screen and junk queue' && name !== 'European tie with no opponent') assert.ok(r.backup, 'the original save was not backed up');
    await page.close();
  };
}
module.exports = tests;
