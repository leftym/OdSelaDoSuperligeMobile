// Shared helpers: serve game/dist on a local port, open the game in Chromium, and collect page errors.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dist = path.join(__dirname, '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webp': 'image/webp', '.css': 'text/css', '.woff2': 'font/woff2' };

let server, browser, base;
async function setup() {
  if (base) return;
  server = http.createServer((req, res) => {
    const f = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/od-sela.html`;
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
}
async function teardown() {
  if (browser) await browser.close();
  if (server) server.close();
  base = browser = server = null;
}

// A fresh phone-sized page. page.errors collects uncaught errors; Google Fonts requests are blocked so tests run offline.
async function open({ storage, scheme = 'light' } = {}) {
  await setup();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e.message || e) + ' @ ' + String(e.stack || '').split('\n')[1]));
  await page.goto(base);
  await page.evaluate(st => { localStorage.clear(); for (const k in (st || {})) localStorage.setItem(k, st[k]); }, storage);
  await page.reload();
  await page.waitForTimeout(400);
  page.close = (orig => async () => { await orig.call(page); await ctx.close(); })(page.close);
  return page;
}

// Starts a new career at a given phase (p1 village … p5 Superliga) and clears the welcome pop-ups.
async function newCareer(page, phase = 'p1') {
  await page.evaluate(ph => {
    S = null; M = null; SET.start = ph; render(); document.querySelector('[data-a=start]').click();
    S.modal = null; S.mq = []; S.pending = []; render();
  }, phase);
}

// Plays matches with quick-sim (a scandal world event docks one club 6 points, which the check allows for), straight through pop-ups, until the season rolls over. Returns a summary per season.
const PLAY_SEASONS = `(n)=>{const out=[];
 for(let s=0;s<n;s++){let g=0;
  while(S.week<14&&g++<80){S.modal=null;S.mq=[];S.pending=[];
    if(pendKind()){openPend();S.modal=null;openMatch(pendKind()==='euro'?'euro':true);A.quick();A.endmatch();S.mq=[];S.modal=null;continue;}
    openMatch();A.quick();A.endmatch();S.modal=null;S.mq=[];
    if(S.winter){try{A.winterok();}catch(e){}}}
  let gg=0;while(euroLate()&&gg++<10){A.eurolate();S.modal=null;openMatch('euro');A.quick();A.endmatch();S.modal=null;S.mq=S.mq.filter(x=>x.type!=='euro');}
  out.push({season:S.season,week:S.week,li:S.li,pos:rank().indexOf(0)+1,money:S.money,squad:S.squad.length,
    played:S.table.map(r=>r.p),pts:S.table.map(r=>r.pts),wdl:S.table.map((r,i)=>r.w*3+r.d-(S.wev&&S.wev.k==='skandal'&&S.wev.club===S.teams[i].name?6:0))});
  S.modal=null;S.mq=[];nextSeason();S.modal=null;S.mq=[];
  let k=0;while(S.squad.length<18&&S.fa.length&&k++<6){try{S.money+=S.fa[0].fee||0;A.sign('0');}catch(e){break;}}}
 return out;}`;

// Words that give away untranslated English in what the player sees.
const ENGLISH = new Set(('the and you your with for of is are this that he his they their will was has have from it week weeks season ' +
  'player players match goal club fans village money new next more less only than after before into all every yes can cannot must ' +
  'get gets got we our us them she her who what which when where how why but if so very just also back over about there here then').split(' '));
// Real names and Serbian football words that look English: foreign club names, "plej-of".
const NAMES = /Hearts of Oak|plej-of|Plej-of|[A-Z][a-z]+ of [A-Z][a-z]+/g;
const englishIn = texts => texts.filter(t => (t.replace(NAMES, '').match(/[A-Za-z']+/g) || []).some(w => ENGLISH.has(w.toLowerCase())));

module.exports = { setup, teardown, open, newCareer, PLAY_SEASONS, englishIn };
