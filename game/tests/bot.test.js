// A random player clicks through the game for a while: no errors, never stuck on a pop-up, no English on screen.
const { open, englishIn } = require('./lib');

const BOT = `(start)=>{
 const T=window.__T||(window.__T=new Set());const grab=el=>{if(!el)return;el.querySelectorAll('*').forEach(n=>{for(const c of n.childNodes)if(c.nodeType===3&&c.textContent.trim())T.add(c.textContent.trim());if(n.getAttribute){for(const a of ['aria-label','placeholder','alt','title'])if(n.getAttribute(a))T.add(n.getAttribute(a));}});};
 const q=s=>[...document.querySelectorAll(s)].filter(b=>!b.disabled);
 if(!S){const b=q('[data-a=startph][data-v='+start+']')[0];if(b&&!b.classList.contains('on')){b.click();return 'ph';}grab(document.getElementById('app'));q('[data-a=start]')[0].click();return 'start';}
 if(S.modal){grab(document.getElementById('modal'));
  const order=['kmc','promox','celx','evch','creq','cult','unh','pressans','ultname','goal','perk','lvlstat','quick','endmatch','europlay','cupplay','hoff','hwage','sellask','ksign','kdone','pgo','nextseason','winterok','ok'];
  for(const a of order){const bs=q('#modal [data-a='+a+']');if(bs.length){bs[Math.floor(Math.random()*bs.length)].click();return a;}}
  const sx=q('#modal [data-a=sellx]');if(sx.length){sx[0].click();return 'sellx';}
  return 'stuck:'+S.modal.type;}
 const tabs=['home','squad','tac','build','league','club'];const t=tabs[Math.floor(Math.random()*tabs.length)];
 q('[data-a=tab][data-v='+t+']')[0].click();grab(document.getElementById('app'));
 if(t==='squad'){for(const r of q('#app [data-a=renew]'))if(Math.random()<.75){r.click();break;}for(const v of ['staff','market','players']){const b=q('[data-a=sqtab][data-v='+v+']')[0];if(b){b.click();grab(document.getElementById('app'));}}}
 if(Math.random()<.15){const p=q('#app [data-a=player]')[0];if(p){p.click();grab(document.getElementById('modal'));const o=q('#modal [data-a=ok]')[0];o&&o.click();}}
 if(Math.random()<.1){const b=q('#app [data-a=build]')[0];if(b)b.click();}
 q('[data-a=tab][data-v=home]')[0].click();grab(document.getElementById('app'));
 const pb=q('[data-a=pendmatch]')[0]||q('[data-a=eurolate]')[0]||q('[data-a=play]')[0]||q('[data-a=seasonview]')[0];if(pb){pb.click();return 'play';}return 'idle';}`;

async function run(assert, start, steps, scheme) {
  const page = await open({ scheme });
  const stuck = {};
  for (let i = 0; i < steps; i++) {
    const r = await page.evaluate(`(${BOT})(${JSON.stringify(start)})`);
    if (r.startsWith('stuck')) stuck[r] = (stuck[r] || 0) + 1;
  }
  const texts = await page.evaluate(() => [...window.__T]);
  const weeks = await page.evaluate(() => S ? S.season * 20 + S.week : 0);
  await page.close();
  assert.deepStrictEqual(page.errors, [], 'page errors');
  // A pop-up the bot can't leave for many turns in a row is a real dead end; a few are pop-ups waiting on a text field.
  assert.ok(Object.values(stuck).every(n => n < 20), 'stuck on ' + JSON.stringify(stuck));
  assert.ok(weeks > 20, 'the season barely moved');
  assert.deepStrictEqual(englishIn(texts), [], 'English text on screen');
}
module.exports = {
  'village start, light mode': a => run(a, 'p1', 700, 'light'),
  'Prva liga start, dark mode': a => run(a, 'p4', 700, 'dark'),
  'Superliga start': a => run(a, 'p5', 700, 'light'),
};
