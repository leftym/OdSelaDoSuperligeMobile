// Scenarios finish, retiring pays legacy points that buy perks, a dynasty takes over, and a crash in a button never traps you.
const { open, newCareer } = require('./lib');

const PLAY_SCEN = `(id)=>{S=null;startScen(id);S.modal=null;S.mq=[];let guard=0,out=null;
  while(guard++<80){S.pending=[];S.modal=null;
    if(S.scen.done)break;
    if(euroLate()){A.eurolate();S.modal=null;openMatch('euro');A.quick();A.endmatch();S.modal=null;S.mq=S.mq.filter(x=>x.type!=='euro');const k=S.mq.find(x=>x.type==='scenend');if(k){out=k;break;}continue;}
    if(S.week>=14){const k=S.mq.find(x=>x.type==='scenend');if(k){out=k;break;}S.mq=[];nextSeason();S.modal=null;S.mq=[];continue;}
    if(pendKind()){S.mq=[];openPend();S.modal=null;openMatch(pendKind()==='euro'?'euro':true);A.quick();A.endmatch();S.modal=null;S.mq=[];continue;}
    openMatch();A.quick();A.endmatch();S.modal=null;const k=S.mq.find(x=>x.type==='scenend');if(k){out=k;break;}S.mq=[];}
  return {out,done:!!(S.scen&&S.scen.done)}}`;

module.exports = {
  'every scenario reaches its ending': async assert => {
    const page = await open();
    const ids = await page.evaluate(() => SCEN.map(x => x.id));
    assert.ok(ids.length >= 5);
    for (const id of ids) {
      const r = await page.evaluate(`(${PLAY_SCEN})(${JSON.stringify(id)})`);
      assert.ok(r.out || r.done, `${id} never ended`);
      if (r.out) assert.ok(typeof r.out.score === 'number', `${id} ended without a score`);
    }
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
  'retiring earns legacy points that carry into the next career': async assert => {
    const page = await open();
    await newCareer(page, 'p1');
    const base = await page.evaluate(() => S.money);
    await page.evaluate(() => {
      S.modal = null; S.mq = []; S.season = 7; S.maxLi = 5; S.li = 5; S.stats.titles = 0; S.stats.cups = 1; S.stats.abroad = 4; S.stats.kids = 6;
      render(); A.retire(); A.retireyes(); render(); renderModal();
    });
    const award = await page.evaluate(() => S.lpAward.tot);
    assert.ok(award > 0, 'no legacy points for a 7-season career');
    await page.click('#modal [data-a=epidone]');
    const before = await page.evaluate(() => lgM().pts);
    await page.evaluate(() => { const b = document.querySelector('[data-a=lbuy][data-v=cash]'); b && b.click(); });
    const after = await page.evaluate(() => lgM().pts);
    assert.ok(after < before, 'buying a perk did not spend points');
    await page.evaluate(() => document.querySelector('[data-a=lclose]').click());
    await newCareer(page, 'p1');
    assert.ok(await page.evaluate(() => S.money) > base, 'the starting-money perk did nothing');
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
  'an heir takes over the same club': async assert => {
    const page = await open();
    await newCareer(page, 'p3');
    const club = await page.evaluate(() => {
      S.season = 6; S.maxLi = 5; S.li = 5; S.stats.cups = 2; render(); A.retire(); A.retireyes(); renderModal(); return S.club.name;
    });
    await page.click('#modal [data-a=dyn][data-v=sin]');
    const r = await page.evaluate(() => ({ club: S.club.name, gen: S.gen, retired: !!S.flags.retired }));
    assert.strictEqual(r.club, club);
    assert.ok(r.gen >= 2, 'generation did not advance');
    assert.strictEqual(r.retired, false);
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
  'a button that crashes closes its pop-up and logs the error': async assert => {
    const page = await open();
    await newCareer(page, 'p5');
    await page.evaluate(() => { S.modal = { type: 'outcome', title: 'Test', msgs: ['x'] }; renderModal(); A.ok = () => { throw new Error('boom test'); }; });
    await page.click('#modal [data-a=ok]');
    const r = await page.evaluate(() => ({ modal: S.modal, err: (meta().errs || [])[0] }));
    assert.strictEqual(r.modal, null);
    assert.match(r.err.msg, /boom test/);
    await page.close();
  },
  'the phone back button closes pop-ups, then tabs, then leaves': async assert => {
    const page = await open();
    await newCareer(page, 'p2');
    const r = await page.evaluate(() => {
      const out = [];
      S.modal = { type: 'outcome', title: 'Test', msgs: ['x'] }; renderModal();
      out.push(window.odselaBack(), !!S.modal);
      document.querySelector('[data-a=tab][data-v=squad]').click();
      out.push(window.odselaBack(), S.tab);
      out.push(window.odselaBack());
      openMatch(); out.push(window.odselaBack(), !!M);
      return out;
    });
    assert.deepStrictEqual(r, [true, false, true, 'home', false, true, true]);
    assert.deepStrictEqual(page.errors, []);
    await page.close();
  },
};
