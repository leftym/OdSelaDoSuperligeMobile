/* ---------- the weekly challenge ---------- */
// Everyone who plays in the same week gets the same village, squad, league and twist. Three seasons, one score.
const WK_VIL=['Gornje Lipovo','Donja Bukovica','Mali Izvor','Crni Vrh','Vrbovo Polje','Stari Brestovac','Kamenica Gornja','Ravni Lug','Zlatno Brdo','Selište Donje'];
const WK_CLUB=['Polet','Sloga','Jedinstvo','Budućnost','Borac','Napredak','Graničar','Hajduk','Rudar','Zadrugar'];
const WK_MOD=[
  {k:'broke',n:'Prazna kasa',d:'Počinješ sa trećinom uobičajenog novca.',f:s=>{s.money=Math.round(s.money/3);}},
  {k:'old',n:'Stara garda',d:'Ekipa veterana: jači su sada, ali niko nije mlađi od 28.',f:s=>s.squad.forEach(p=>{p.age=Math.max(p.age,28+(p.id%6));STATS.forEach(([k])=>{p[k]=Math.min(20,p[k]+1);});})},
  {k:'kids',n:'Klinci',d:'Ekipa tinejdžera sa velikim potencijalom i bez iskustva.',f:s=>s.squad.forEach(p=>{p.age=16+(p.id%4);p.pot=Math.min(20,(p.pot||12)+3);STATS.forEach(([k])=>{p[k]=Math.max(1,p[k]-1);});})},
  {k:'rival',n:'Bogati komšija',d:'Rivalski gazda je upravo prodao fabriku. Njegov tim je mnogo jači.',f:s=>{const t=rivalTeam(s);if(t){t.r+=1.2;t.atk*=1.12;t.def*=1.12;t.mid*=1.12;}}},
  {k:'love',n:'Ljubav sela',d:'Celo selo je uz tebe: navijači i naklonost kreću visoko.',f:s=>{s.fan=70;s.goodwill=80;}},
  {k:'mud',n:'Blato',d:'Užasan teren i kišna jesen: svaka utakmica je lutrija.',f:s=>{s.flags.mudweek=1;}}];
function isoWeek(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();return [y,Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7)];}
function weeklySpec(){const [y,w]=isoWeek(),seed=y*100+w,r=srand(seed*7919);const pk=a=>a[Math.floor(r()*a.length)];
  return {seed,label:`${y} · ${w}. nedelja`,village:pk(WK_VIL),club:pk(WK_CLUB),region:pk(Object.keys(REGIONS)),col:pk(Object.keys(COLORS).filter(k=>!COLORS[k][3])),bg:pk(Object.keys(BG).filter(k=>!BG[k].locked)),mod:pk(WK_MOD)};}
function startWeekly(){const w=weeklySpec();Object.assign(SET,{realOn:false,real:null,club:w.club,village:w.village,region:w.region,col:w.col,bg:w.bg,start:'p1',diff:'normal',chall:'none'});
  const real=Math.random;const r=srand(w.seed);Math.random=r;SET._wk=1;try{newGame();w.mod.f(S);}finally{Math.random=real;delete SET._wk;}
  S.weekly={seed:w.seed,label:w.label,mod:w.mod.k,pts:0,done:false};news(`Nedeljni izazov ${w.label}: ${w.mod.n}. ${w.mod.d}`);}
function weeklyScore(s){const W=s.weekly;return W.pts+(s.maxLi||s.li)*120+(s.trophies||[]).length*80+Math.max(0,Math.round(s.money/250000));}
function weeklySeasonEnd(){const W=S.weekly;if(!W||W.done)return;W.pts+=S.table[0].pts;
  if(S.season>=3){W.done=true;const sc=weeklyScore(S),m=meta();m.weekly=m.weekly||{};const best=m.weekly[W.seed];if(!best||sc>best.score)m.weekly[W.seed]={score:sc,club:S.club.name,league:LEAGUES[Math.max(S.maxLi||0,S.li)].name};saveMeta();
    S.mq.push({type:'weeklyend',score:sc,best:(best&&best.score)||0});}}

