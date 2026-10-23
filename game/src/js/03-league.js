/* ---------- league ---------- */
function makeSchedule(n){
  const t=[...Array(n).keys()],rounds=[];
  for(let r=0;r<n-1;r++){const pr=[];for(let i=0;i<n/2;i++){const a=t[i],b=t[n-1-i];pr.push((r+i)%2?[b,a]:[a,b]);}rounds.push(pr);t.splice(1,0,t.pop());}
  return rounds.concat(rounds.map(pr=>pr.map(([a,b])=>[b,a])));
}
// ---- Persistent football world: every club keeps its name, strength, history and record against you ----
const GIANTS=['FK Crvena zvezda','FK Partizan'];
const LEAGUES0=LEAGUES.map(L=>({rival:L.rival,names:[...L.names]})),GIANTS0=[...GIANTS];
const REALCITY={'FK Crvena zvezda':'Beograd','FK Partizan':'Beograd','FK Vojvodina':'Novi Sad','FK Radnički 1923':'Kragujevac','FK Radnički Niš':'Niš','FK Čukarički':'Beograd','FK Novi Pazar':'Novi Pazar','FK Železničar Pančevo':'Pančevo','OFK Beograd':'Beograd',
 'FK TSC':'Bačka Topola','FK Jedinstvo Ub':'Ub','FK Javor-Matis':'Ivanjica','FK Spartak Subotica':'Subotica','FK Metalac Gornji Milanovac':'Gornji Milanovac','FK Napredak Kruševac':'Kruševac','FK Voždovac':'Beograd','FK Borac Čačak':'Čačak',
 'FK Takovo':'Gornji Milanovac','FK FAP Priboj':'Priboj','FK Zlatibor Čajetina':'Čajetina','FK Budućnost Krušik':'Valjevo','FK Radnički Valjevo':'Valjevo','FK Šumadija 1903':'Kragujevac','FK Jedinstvo Putevi':'Užice','GFK Sloboda Užice':'Užice'};
const REAL_REPL={4:'FK Sloga Požega',5:'FK Smederevo 1924',6:'FK Mladost Lučani'};
const realList=li=>[LEAGUES0[li].rival].concat(LEAGUES0[li].names).filter(n=>n&&REALCITY[n]);
const realLi=n=>[6,5,4].find(li=>realList(li).includes(n));
const bigC=()=>GIANTS.find(n=>!S||n!==S.club.name)||'FK Partizan';
// Taking over a real club removes it from the computer-run world and hands its rivalry to the other giant.
function applyRealWorld(club){LEAGUES.forEach((L,i)=>{L.rival=LEAGUES0[i].rival;L.names=[...LEAGUES0[i].names];});GIANTS.length=0;GIANTS0.forEach(g=>GIANTS.push(g));
  const me=club&&club.real?club.name:null;if(!me)return;
  LEAGUES.forEach((L,i)=>{const k=L.names.indexOf(me);if(k>=0)L.names[k]=REAL_REPL[i]||L.names[k];if(L.rival===me)L.rival=me==='FK Crvena zvezda'?'FK Partizan':me==='FK Partizan'?'FK Crvena zvezda':null;});
  const g=GIANTS.indexOf(me);if(g>=0)GIANTS.splice(g,1);}
function realPickCard(){return `<section class="card"><span class="lbl">Klub</span>${seg([['0','Svoj klub iz sela'],['1','Pravi klub']],SET.realOn?'1':'0','realon')}${SET.realOn?[6,5,4].map(li=>`<span class="lbl">${LEAGUES[li].name}${li===4?' (Zapad)':''}</span><div class="row" style="flex-wrap:wrap;gap:6px">${realList(li).map(n=>`<button class="btn sm${SET.real===n?' pri':''}" data-a="realpick" data-v="${esc(n)}">${esc(short(n))}</button>`).join('')}</div>`).join('')+`<div class="hint">${SET.real?`<b>${esc(short(SET.real))}</b>, ${esc(REALCITY[SET.real])}. Počinješ u ligi ${LEAGUES[realLi(SET.real)].name}. `:'Izaberi klub. '}Grad, liga i boje su pravi. Igrači u tvom klubu su izmišljeni; pravi igrači se pojavljuju samo kod protivnika.</div>`:''}</section>`;}

function clubGen(name,li,spr){const L=LEAGUES[li],r=L.lvl+(spr-.3)*DF().sp*(li===0?.7:1)+R(-.35,.35);return{name,li,r,tempo:RI(0,2),press:RI(0,2),hist:[],h2h:{w:0,d:0,l:0},last:null,ex:[]};}
function initWorld(){const W={},used=new Set(),keep=(S.teams||[]).filter(t=>!t.me);keep.forEach(t=>used.add(t.name));
  for(let li=0;li<=6;li++){const L=LEAGUES[li];
    if(li===S.li&&keep.length){keep.forEach(t=>{W[t.name]={...clubGen(t.name,li,0),r:t.r,tempo:t.tempo,press:t.press};});continue;}
    let pool=(L.rival&&!used.has(L.rival)?[L.rival]:[]).concat(shuffle(L.names.filter(n=>!used.has(n))));
    if(li===6)pool=GIANTS.filter(n=>!used.has(n)).concat(pool.filter(n=>!GIANTS.includes(n)));
    const need=li===S.li?7:8,spr=shuffle(SPREAD.concat([0]));
    pool.slice(0,need).forEach((n,i)=>{used.add(n);W[n]=clubGen(n,li,li===6&&GIANTS.includes(n)?[2.7,2.3][GIANTS.indexOf(n)]:spr[i%8]);});}
  return W;}
const world=()=>S.world||(S.world=initWorld());
function worldTeams(li){const W=world(),L=LEAGUES[li];
  if(L.rival&&W[L.rival]&&W[L.rival].li!==li){const rv=W[L.rival],c=Object.values(W).filter(x=>x.li===li&&x.name!==L.rival).sort((a,b)=>a.r-b.r);const sw=c[Math.floor(c.length/2)];if(sw)sw.li=rv.li;rv.li=li;rv.r=Math.max(rv.r,L.lvl-.3);}
  let cl=Object.values(W).filter(c=>c.li===li);
  while(cl.length>7){const c=cl.sort((a,b)=>a.r-b.r).shift();if(c.name===L.rival){cl.push(c);cl.sort((a,b)=>a.r-b.r);const d=cl.splice(1,1)[0];d.li=Math.max(0,li-1)===li?li+1:li-1;continue;}c.li=li>0?li-1:li+1;}
  while(cl.length<7){const n=L.names.find(n=>!W[n])||`FK ${pick(['Sloboda','Polet','Jedinstvo','Napredak','Graničar'])} ${pick(['Gornji','Donji','Novi','Stari'])} ${pick(['Lug','Breg','Gaj','Do'])}`;if(W[n])break;W[n]=clubGen(n,li,R(-1,1));cl.push(W[n]);}
  return [{name:S.club.name,me:true}].concat(cl.map(c=>({name:c.name,r:c.r,atk:c.r*R(.9,1.1),def:c.r*R(.9,1.1),mid:c.r*R(.9,1.1),tempo:c.tempo,press:c.press,rival:c.name===L.rival})));}
function worldSeasonEnd(sm){const W=world(),me=S.li,ord=rank();S.lastLi=me;
  S.teams.forEach(t=>{if(!t.me&&W[t.name])W[t.name].r=t.r;});
  const T={};
  for(let li=0;li<=6;li++){if(li===me)continue;T[li]=Object.values(W).filter(c=>c.li===li).map(c=>({c,k:c.r+R(-1.6,1.6)})).sort((a,b)=>b.k-a.k).map(x=>x.c);T[li].forEach((c,k)=>c.hist.push({s:S.season,li,pos:k+1}));}
  T[me]=ord.map(i=>i===0?'ME':W[S.teams[i].name]).filter(Boolean);T[me].forEach((c,k)=>{if(c!=='ME')c.hist.push({s:S.season,li:me,pos:k+1});});
  const mv=[];
  for(let li=0;li<6;li++){mv.push([T[li].filter(c=>c!=='ME'||(sm.up&&sm.gate)).slice(0,2),li+1]);mv.push([T[li+1].slice(-2),li]);}
  mv.forEach(([cs,to])=>cs.forEach(c=>{if(c==='ME')return;const f=LEAGUES[c.li],t=LEAGUES[to];c.r=t.lvl+(c.r-f.lvl)*.5+(to>c.li?-.5:.5);c.moved=to>c.li?'up':'down';}));
  mv.forEach(([cs,to])=>cs.forEach(c=>{if(c!=='ME')c.li=to;}));
  Object.values(W).forEach(c=>{const L=LEAGUES[c.li];c.r=L.lvl+(c.r-L.lvl)*.82+R(-.45,.45);if(Math.random()<.3)c.tempo=RI(0,2);if(Math.random()<.3)c.press=RI(0,2);});
  GIANTS.forEach((n,i)=>{const c=W[n];if(c&&c.li===6)c.r=Math.max(c.r,LEAGUES[6].lvl+[2.4,2.0][i]);});}
function worldNews(){const W=world(),prevLi=c=>{const h=c.hist[c.hist.length-1];return h&&h.s===S.season-1?h.li:null;};
  const ts=S.teams.filter(t=>!t.me&&W[t.name]).map(t=>W[t.name]),nw=ts.filter(c=>prevLi(c)!==null&&prevLi(c)!==S.lastLi);
  const up=nw.filter(c=>prevLi(c)<S.li).map(c=>short(c.name)),dn=nw.filter(c=>prevLi(c)>S.li).map(c=>short(c.name)),old=nw.filter(c=>c.h2h.w+c.h2h.d+c.h2h.l>0).map(c=>short(c.name));
  if(up.length||dn.length)news(`Nova liga, novi rivali.${up.length?` Iz nižeg ranga: ${up.join(', ')}.`:''}${dn.length?` Iz višeg ranga: ${dn.join(', ')}.`:''}${old.length?` Stari znanci: ${old.join(', ')}.`:''}`);
  Object.values(W).forEach(c=>delete c.moved);}
function h2hRec(name,gf,ga,comp,home){const c=S.world&&S.world[name];if(!c)return;const W=gf>ga,L=gf<ga;c.h2h[W?'w':L?'l':'d']++;c.last={s:S.season,gf,ga,comp};
  if(c.grudge&&W){news(`Revanš! ${short(name)} je platio za ${c.grudge.t}.`);delete c.grudge;}
  else if(L&&(ga-gf>=3||comp==='Kup'))c.grudge={s:S.season,t:comp==='Kup'?`ispadanje iz kupa (${gf}–${ga})`:`${gf}–${ga}`};}
function h2hLine(name){const c=S.world&&S.world[name];if(!c)return '';const h=c.h2h,n=h.w+h.d+h.l;if(!n&&!c.ex.length)return '';
  return `<div class="hint">${n?`Međusobno ${h.w}P ${h.d}N ${h.l}I`:''}${c.last?` · prošli put ${c.last.gf}–${c.last.ga}${c.last.comp==='Kup'?' u kupu':''}`:''}${c.grudge?' · <b class="no">Revanš!</b>':''}${c.ex.length?` · bivši naši: ${c.ex.slice(-2).map(x=>esc(x.n)).join(', ')}`:''}</div>`;}
function clubHTML(n){const c=S.world&&S.world[n],LN=li=>LEAGUES[li].name;
  if(!c)return `<h2>${esc(short(n))}</h2><button class="btn pri" data-a="ok">Zatvori</button>`;const h=c.h2h,rpl=RP[n]?`<div><span class="lbl">Poznati igrači</span><div class="hint">${RP[n].map(x=>esc(x[0])).join(' · ')}</div></div>`:'';
  return `<div class="row" style="gap:12px">${crest(n,oppCol(n),56)}<div class="grow"><span class="eyebrow">${LN(c.li)}${n===LEAGUES[S.li].rival?' · Rival':''}</span><h2>${esc(short(n))}</h2><div class="hint">Ocena ${c.r.toFixed(1)} · ${tacStyle(c)}</div></div></div>
  <div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip">Međusobno ${h.w}P ${h.d}N ${h.l}I</span>${c.last?`<span class="chip">Poslednji meč ${c.last.gf}–${c.last.ga} · ${c.last.comp} · ${c.last.s}. sez.</span>`:''}${c.grudge?`<span class="chip bad">Revanš: ${esc(c.grudge.t)}</span>`:''}</div>${rpl}
  ${c.ex.length?`<div class="hint"><b>Bivši naši igrači:</b> ${c.ex.map(x=>esc(x.n)).join(', ')}</div>`:''}
  <span class="lbl">Istorija kluba</span><div class="list">${c.hist.slice(-8).reverse().map(x=>`<div class="li" style="padding:5px 0"><span class="grow">${x.s}. sezona · ${LN(x.li)}</span><b class="num">${x.pos}.</b></div>`).join('')||'<div class="hint">Još nema završenih sezona.</div>'}</div>
  <button class="btn pri" data-a="ok">Zatvori</button>`;}
function genTeams(li){
  const L=LEAGUES[li];
  let names=shuffle(L.names);
  names=L.rival?[L.rival].concat(names.filter(n=>n!==L.rival).slice(0,6)):names.slice(0,7);
  let spr=shuffle(SPREAD);
  if(li===6){const gs=[...new Set([L.rival,...GIANTS].filter(n=>n&&n!==S.club.name))];names=gs.concat(shuffle(L.names.filter(n=>!gs.includes(n)&&n!==S.club.name)).slice(0,7-gs.length));spr=[2.7,2.3].slice(0,gs.length).concat(shuffle([1,.4,-.2,-.8,-1.4,-.5]).slice(0,7-gs.length));}
  return [{name:S.club.name,me:true}].concat(names.map((n,i)=>{const r=L.lvl+(spr[i]-.3)*DF().sp*(li===0?.7:1)+R(-.35,.35);return{name:n,r,atk:r*R(.9,1.1),def:r*R(.9,1.1),mid:r*R(.9,1.1),tempo:RI(0,2),press:RI(0,2),rival:n===L.rival};}));
}
function addTable(h,a,gh,ga){
  const H=S.table[h],A=S.table[a];
  H.p++;A.p++;H.gf+=gh;H.ga+=ga;A.gf+=ga;A.ga+=gh;
  if(gh>ga){H.w++;H.pts+=3;A.l++;}else if(gh<ga){A.w++;A.pts+=3;H.l++;}else{H.d++;A.d++;H.pts++;A.pts++;}
}
function rank(){return S.table.map((t,i)=>i).sort((a,b)=>{const A=S.table[a],B=S.table[b];return B.pts-A.pts||(B.gf-B.ga)-(A.gf-A.ga)||B.gf-A.gf||a-b;});}
function simAI(h,a){const rh=S.teams[h].r,ra=S.teams[a].r;return [poisson(1.25*Math.pow(rh/ra,1.6)*1.1),poisson(1.25*Math.pow(ra/rh,1.6)*.92)];}
function nextFixture(){const f=S.sched[S.week].find(x=>x[0]===0||x[1]===0);return{home:f[0]===0,opp:f[0]===0?f[1]:f[0]};}
function cap(){return BUILD.stands.t[S.b.stands].cap;}
const pmult=()=>phase()>=5?2.5:phase()>=4?5:phase()>=3?4:phase()>=2?2:1;
const price=()=>PRICES[S.pt]*pmult();
function attendance(rival){
  const pf=[1.1,.9,.7][S.pt];
  const raw=(60+S.fan*2.4+(S.lvl-1)*15+S.goodwill*.6+S.li*140+(phase()>=5?legacyScore():0))*pf*(rival?1.4:1)*(S.b.flood>=1?1.25:1)*(S.ultras?(S.ultras.mood<15?.7:1+S.ultras.mood/400):1)*(S.flags.tv?.9:1)*(phase()>=5?3.9:phase()>=4?2:1)*REG().att*(1+.05*LV('ulaz'))*(wev('kriza')?.9:1);
  return Math.round(Math.min(cap(),raw*R(.92,1.08)));
}
function gateMet(li){const g=GATES[li].need;return Object.keys(g).every(k=>S.b[k]>=g[k])&&(GATES[li].extra||[]).every(x=>x[1](S));}
function legacyScore(){const st=S.stats||{},vp=(S.vp||[]).reduce((t,k)=>t+((VP.find(v=>v.k===k)||{}).l||0),0);return Math.round(S.goodwill*2+vp+(st.titles||0)*150+(st.cups||0)*80+(st.abroad||0)*15+(st.kids||0)*8+(st.euroBest||0)*60+(st.top||0)*20+phase()*40+(S.flags.street?40:0));}
const legacyRank=()=>LEG_R.find(x=>legacyScore()<x[0])[1];
const villagePop=()=>Math.round((800+legacyScore()*3)/10)*10;
const endgame=()=>[['Osvoji Superligu',(S.stats.titles||0)>=1],['Stigni do grupne faze u Evropi',(S.stats.euroBest||0)>=3],['Preobrazi selo (nasleđe 1.300+)',legacyScore()>=1300]];
function checkEpilogue(){if(!S.flags.epilogue&&phase()>=5&&endgame().every(x=>x[1])){S.flags.epilogue=1;S.mq.push({type:'epilogue'});}}
function euroStatus(){const e=S.euro;if(!e)return '';if(e.stage==='done')return e.best||'završeno';if(e.stage==='q')return `${EQ[e.r].toLowerCase()} posle ${e.r*2+1}. kola`;if(e.stage==='group')return `grupna faza, mečevi posle 8, 10. i 12. kola`;if(e.stage==='ko2')return `${KO2[e.r2].toLowerCase()} posle prvenstva`;return `nokaut plej-of posle 13. kola`;}
const rivalTeam=s=>s.teams.find(t=>t.rival);
const rivalShort=s=>{const t=rivalTeam(s);return t?short(t.name):'gradski klub';};

