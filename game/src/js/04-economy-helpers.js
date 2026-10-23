/* ---------- economy helpers ---------- */
function led(k,v){S.ledger[k]=(S.ledger[k]||0)+v;}
const costF=()=>clamp(1-(S.owner.st.biz-5)*.02,.7,1.1);
const buildCost=t=>Math.round(t.c*costF()*(wev('stadioni')?.8:1)*(1-.05*LV('grad'))*(obg()==='sin'&&t.c<5000000?.9:1)*(has('seoski')&&t.c<3000000?.75:1)/1000)*1000;
const buildWeeks=t=>Math.max(1,t.w-Math.floor((S.owner.st.veze-5)/3));
const permitWeeks=t=>t.pm?Math.max(0,(obg()==='tajkun'?3:4)-Math.floor((S.owner.st.veze-5)/2)-(S.rel.mayor>=30?1:0)-(has('opstina')?2:0)-LV('kum')):0;
// ---- Staff room ----
const STAFF={physio:{n:'Fizioterapeut',ph:1,d:r=>`povrede ${r*8}% kraće i ${r*6}% ređe`},fit:{n:'Kondicioni trener',ph:2,d:r=>`+${r*1.5} oporavka kondicije nedeljno`},
  youth:{n:'Trener omladinaca',ph:2,need:()=>S.b.academy>=1,d:r=>`bolja deca na danu škole, mladi brže napreduju`},asst:{n:'Pomoćni trener',ph:2,d:r=>`pre utakmice daje savet o protivniku${r>=3?', bolje izmene':''}`}};
const stR=k=>S&&S.staff&&S.staff[k]?S.staff[k].r:0;
const staffWage=()=>S.staff?Object.values(S.staff).reduce((a,x)=>a+(x?x.wage:0),0):0;
function genStaff(){const r=clamp(RI(1,2)+(phase()>=3?1:0)+(phase()>=4?RI(0,1):0),1,5);return{name:pick(FIRST)+' '+pick(LAST),r,wage:Math.round((2500+r*r*900)*(1+.25*S.li)*(phase()>=5?4:phase()>=4?2.5:1)/500)*500};}
function staffCard(){const P=phase(),ks=Object.keys(STAFF).filter(k=>P>=STAFF[k].ph);if(!ks.length)return '';S.staff=S.staff||{};
  return `<section class="card"><h3>Stručni štab</h3><div class="list">${ks.map(k=>{const D=STAFF[k],s=S.staff[k],ok=!D.need||D.need();
    return `<div class="li">${staffImg(k,40)}<span class="grow"><span class="lbl">${D.n}</span><br>${s?`<b>${esc(s.name)}</b> <span class="stars">${'★'.repeat(s.r)}${'☆'.repeat(5-s.r)}</span><br><span class="hint">${D.d(s.r)} · ${fmt(s.wage)}/ned.</span>`:`<span class="hint">${ok?'Nema nikoga na ovom mestu.':'Potrebna je škola fudbala.'}</span>`}</span>${s?`<button class="btn sm" data-a="stafffire" data-v="${k}">Otpusti</button>`:`<button class="btn sm pri" data-a="staffopen" data-v="${k}" ${ok?'':'disabled'}>Angažuj</button>`}</div>`;}).join('')}</div></section>`;}
function staffHireHTML(m){const D=STAFF[m.k];S.staffC=S.staffC||{};const C=S.staffC[m.k]||(S.staffC[m.k]=[genStaff(),genStaff()]);
  return `<span class="eyebrow">Stručni štab</span><h2>${D.n}: koga zoveš?</h2>${C.map((c,i)=>`<button class="choice" data-a="staffhire" data-v="${i}" ${S.money<c.wage*2?'disabled':''}><b>${esc(c.name)} · ${'★'.repeat(c.r)}${'☆'.repeat(5-c.r)}</b><span class="fx">${D.d(c.r)} · ${fmt(c.wage)}/ned.</span></button>`).join('')}<button class="btn" data-a="ok">Ne sada</button>`;}
// ---- Awards and club records ----
function alumniAdd(p){(S.alumni=S.alumni||[]).push({n:p.name,pos:p.pos,apps:p.apps||0,goals:p.goals||0,asts:p.asts||0,mom:p.mom||0});S.alumni=S.alumni.filter(a=>a.apps>0).slice(-60);}
function recNote(k,v,ok){S.rec=S.rec||{};if(!S.rec[k]||ok(S.rec[k])){S.rec[k]=v;return true;}return false;}
function monthAward(){const c=S.squad.filter(p=>(p.mrn||0)>=2).sort((a,b)=>b.mrs/b.mrn-a.mrs/a.mrn)[0];if(c){c.pom=(c.pom||0)+1;c.morale=Math.min(5,c.morale+1);news(`Igrač meseca: ${c.name}, prosečna ocena ${fmt1(c.mrs/c.mrn)}.`);}S.squad.forEach(p=>{p.mrs=0;p.mrn=0;});}
function teamOfSeason(){const pool=S.squad.filter(p=>(p.rcnt||0)>=4),avg=p=>p.rsum/p.rcnt,pick_=(pos,n)=>pool.filter(p=>p.pos===pos).sort((a,b)=>avg(b)-avg(a)).slice(0,n);
  const t=[...pick_('GK',1),...pick_('DEF',4),...pick_('MID',4),...pick_('ATT',2)];return t;}
function recordsCard(){const R=S.rec||{},all=[...S.squad.map(p=>({n:p.name,goals:p.goals||0,apps:p.apps||0,here:1})),...(S.alumni||[])];
  const tg=all.filter(x=>x.goals).sort((a,b)=>b.goals-a.goals).slice(0,5),ta=all.filter(x=>x.apps).sort((a,b)=>b.apps-a.apps).slice(0,5);
  if(!tg.length&&!R.win)return '';
  const row=(l,v)=>`<div class="li" style="padding:5px 0"><span class="grow">${l}</span><b class="num">${v}</b></div>`;
  return `<section class="card"><h3>Rekordi kluba</h3><div class="list">${R.win?row(`Najveća pobeda: ${esc(short(R.win.opp))} (${R.win.s}. sez.)`,`${R.win.gf}–${R.win.ga}`):''}${R.att?row(`Najveća poseta (${R.att.s}. sez.)`,thn(R.att.n)):''}${R.sale?row(`Rekordna prodaja: ${esc(R.sale.n)}`,fmt(R.sale.fee)):''}${R.scorer?row(`Najviše golova u sezoni: ${esc(R.scorer.n)} (${R.scorer.s}. sez.)`,R.scorer.g):''}</div>
  ${tg.length?`<span class="lbl">Najbolji strelci svih vremena</span><div class="list">${tg.map((x,i)=>row(`${i+1}. ${esc(x.n)}${x.here?'':' <span class="hint">bivši</span>'}`,x.goals)).join('')}</div>`:''}
  ${ta.length?`<span class="lbl">Najviše utakmica</span><div class="list">${ta.map((x,i)=>row(`${i+1}. ${esc(x.n)}${x.here?'':' <span class="hint">bivši</span>'}`,x.apps)).join('')}</div>`:''}</section>`;}
const coachWage=()=>S.coach?S.coach.wage:0;
const scoutWage=()=>Math.round(9000*(1+.3*S.li)/500)*500;
function weeklyCosts(){
  const wages=S.squad.reduce((s,p)=>s+p.wage,0)+coachWage()+staffWage()+(S.scout?S.scout.wage:0)+(S.analyst?S.analyst.wage:0);
  let up=0;for(const k in BUILD){for(let i=1;i<=S.b[k];i++)up+=(BUILD[k].t[i].c||0)*.04/15;}
  const loan=S.loans.reduce((s,l)=>s+l.w,0);
  return{wages,up:Math.round(up),loan};
}
const sponsorSum=()=>Math.round(S.sponsors.reduce((s,x)=>s+x.w,0)*(1+.08*LV('spon'))*({biznismen:1.15,igrac:.85,sin:.9}[obg()]||1)*(wev('kriza')?.8:wev('tv')?1.1:1));
function addUgled(n){
  if(!n)return;if(n>0&&has('mediji'))n=Math.round(n*1.2);S.ugled+=n;
  while(S.lvl<10&&S.ugled>=UG[S.lvl]){S.lvl++;S.pts++;S.mq.push({type:'level'});if(PERK_LV.includes(S.lvl)){const opts=shuffle(PERKS.filter(x=>!(S.perks||[]).includes(x.k))).slice(0,3).map(x=>x.k);if(opts.length)S.mq.push({type:'perk',opts});}news(`Ugled, nivo ${S.lvl}. Ljudi te sada zovu „gazda”.`);}
}
function news(t){S.news.unshift({s:S.season,w:S.week,t});S.news=S.news.slice(0,40);}
function genCoach(){
  const r=clamp(RI(1,3)+(phase()>=2?RI(0,2):0)+(phase()>=4?1:0)+(Math.random()<.3*LV('trn')?1:0),1,5),style=pick(Object.keys(CSTY));
  return{name:pick(FIRST)+' '+pick(LAST),r,style,phil:pick(Object.keys(PHIL)),trust:60,age:RI(38,64),wage:Math.round((4000+r*r*1200)*(1+.25*S.li)/500)*500};
}
const coachMult=()=>S.coach?(1+.012*S.coach.r)*(1+((S.coach.trust??60)-60)/1500):1;
// ---- The coach as a character: philosophy, trust, requests and ultimatums ----
const PHIL={mladi:{n:'Mladi',d:'veruje u decu: igrači do 21 godine brže napreduju'},odbrana:{n:'Odbrana',d:'prvo nula: +3% odbrana'},napad:{n:'Napad',d:'igra na pobedu: +3% napad'}};
const coachX=c=>{if(c){if(c.trust==null)c.trust=60;if(!c.phil)c.phil=pick(Object.keys(PHIL));}return c;};
const trustAdj=d=>{const c=coachX(S.coach);if(c)c.trust=clamp(Math.round(c.trust+d),0,100);};
function coachReqGen(){const c=S.coach,opts=[],O=['GK','DEF','MID','ATT'];
  const avg=pos=>{const ps=S.squad.filter(p=>p.pos===pos);return ps.length?ps.reduce((a,p)=>a+ovr(p),0)/ps.length:0;},weak=O.slice(1).sort((a,b)=>avg(a)-avg(b))[0];
  if(S.chall!=='local'&&S.squad.length<maxSquad())opts.push({k:'sign',pos:weak,min:Math.round(avgO(S)),ids:S.squad.map(p=>p.id),due:nowW()+5});
  for(const k of shuffle(['training','medical','changing'])){const t=S.b[k]+1,nx=BUILD[k].t[t];if(nx&&!(nx.ph>phase())&&!S.queue.some(q=>q.k===k)&&buildCost(nx)<S.money*1.2){opts.push({k:'build',b:k,tier:t,due:nowW()+6});break;}}
  const bp=bestP(S);if(bp&&phase()>=2&&!bp.leaving)opts.push({k:'keep',pid:bp.id,name:bp.name,due:S.season*20+14});
  const want=c.phil==='odbrana'?0:c.phil==='napad'?2:1;if(S.tactics.press!==want)opts.push({k:'tactic',press:want,n:0,need:3,due:nowW()+5});
  return opts.length?pick(opts):null;}
function reqText(q){switch(q.k){case 'sign':return `„Gazda, ${({DEF:'u odbrani',MID:'u vezi',ATT:'u napadu'})[q.pos]} smo najslabiji. Dovedi mi igrača (${POSL[q.pos]}) sa ocenom bar ${q.min}.”`;
  case 'build':return `„Ovako ne mogu da radim. Treba mi: ${BUILD[q.b].t[q.tier].n.toLowerCase()}.”`;case 'keep':return `„${q.name} je srce ove ekipe. Obećaj mi da ga ove sezone nećeš prodati.”`;
  default:return `„Pusti me da radim po svom: hoću ${['nizak','srednji','visok'][q.press]} pres naredne tri utakmice.”`;}}
const reqDue=q=>q.k==='keep'?'do kraja sezone':q.k==='tactic'?`${q.n}/${q.need} utakmica`:`još ${Math.max(0,q.due-nowW())} ned.`;
function coachTick(W,L){const c=coachX(S.coach);if(!c)return;c.trust=clamp(c.trust+(W?1:L?-1:0),0,100);const q=c.req;
  if(q){let done=false,fail=false;
    if(q.k==='sign')done=S.squad.some(p=>!q.ids.includes(p.id)&&p.pos===q.pos&&ovr(p)>=q.min);
    if(q.k==='build')done=S.b[q.b]>=q.tier||S.queue.some(x=>x.k===q.b&&x.tier>=q.tier);
    if(q.k==='tactic'){if(S.tactics.press===q.press)q.n++;done=q.n>=q.need;}
    if(q.k==='keep'){if(!S.squad.some(p=>p.id===q.pid))fail=true;else if(nowW()>=q.due)done=true;}
    if(!done&&!fail&&nowW()>=q.due)fail=true;
    if(done){trustAdj(12);news(`${c.name}: „Hvala, gazda. Sada mogu da radim.”`);c.req=null;c.reqCd=nowW()+3;}
    else if(fail){trustAdj(q.k==='keep'?-25:-15);news(`${c.name} je razočaran: obećanje nije ispunjeno.`);c.req=null;c.reqCd=nowW()+3;}}
  else if(S.week>=2&&S.week<=12&&nowW()>=(c.reqCd||0)&&Math.random()<.2){const nq=coachReqGen();if(nq){c.reqCd=nowW()+4;S.mq.push({type:'coachreq',q:nq});}}
  if(c.trust<12){news(`${c.name} daje ostavku: „Ne mogu da radim kad mi se gazda meša u sve.”`);S.coach=null;S.coaches=[];S.harmony=clamp(harmony()-4,0,100);return;}
  if(c.trust<25&&!c.ult){c.ult=1;S.mq.push({type:'coachult'});}if(c.trust>=40)c.ult=0;}
function coachReqHTML(m){const c=coachX(S.coach);if(!c)return '';
  return `<div class="row" style="gap:12px"><img class="gazda" src="${coachArt(S.coach)}" onerror="this.onerror=null;this.src='img/pr-coach.webp'" alt="" width="64" height="64" style="width:64px;height:64px"><div class="grow"><span class="eyebrow">Trener traži · filozofija: ${PHIL[c.phil].n}</span><h2>${esc(c.name)}</h2></div></div><p class="story">${reqText(m.q)}</p>
  <button class="choice" data-a="creq" data-v="yes"><b>Dogovoreno</b><span class="fx">Ispuni na vreme: poverenje +12 · Ne ispuniš: poverenje −15</span></button>
  <button class="choice" data-a="creq" data-v="later"><b>Ne sada</b><span class="fx">Poverenje −6</span></button>
  <button class="choice" data-a="creq" data-v="no"><b>Ovde ja odlučujem</b><span class="fx">Poverenje −12 · Ugled +1</span></button>`;}
function coachUltHTML(){const c=S.coach;if(!c)return '';
  return `${artOpt('coach-row')}<div class="row" style="gap:12px"><img class="gazda" src="${coachArt(S.coach)}" onerror="this.onerror=null;this.src='img/pr-coach.webp'" alt="" width="64" height="64" style="width:64px;height:64px"><div class="grow"><span class="eyebrow">Ultimatum</span><h2>„Ili mi verujete, ili odlazim.”</h2></div></div><p class="story">${esc(c.name)} kaže da ne može da radi kad mu se gazda meša u svaki potez. Poverenje: ${c.trust}.</p>
  <button class="choice" data-a="cult" data-v="raise"><b>Podrži ga javno i daj mu povišicu (+30%)</b><span class="fx">Poverenje na 55 · plata ${fmt(Math.round(c.wage*1.3/500)*500)}/ned.</span></button>
  <button class="choice" data-a="cult" data-v="go"><b>Neka ide</b><span class="fx">Odlazi bez otpremnine · svlačionica se ljulja</span></button>
  <button class="choice" data-a="cult" data-v="stay"><b>Ignoriši</b><span class="fx">Poverenje −5 · ispod 12 daje ostavku</span></button>`;}
function trustHTML(c){coachX(c);return `<div class="stat" style="grid-template-columns:96px 1fr 26px"><span>Poverenje</span>${bar(c.trust,100,'club')}<b class="num">${c.trust}</b></div><div class="hint">Filozofija: <b>${PHIL[c.phil].n}</b>, ${PHIL[c.phil].d}. Poverenje raste sa pobedama i ispunjenim zahtevima; pada kad se mešaš u izmene i viče se sa klupe.</div>${c.req?`<div class="hint tip" style="padding-left:8px"><b>Zahtev:</b> ${reqText(c.req)} <span class="chip">${reqDue(c.req)}</span></div>`:''}`;}

