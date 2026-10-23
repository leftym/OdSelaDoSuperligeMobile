/* ---------- players ---------- */
function ovrPos(p,pos){
  if(pos==='GK')return p.def*.6+p.men*.2+p.tec*.1+p.fit*.1;
  if(pos==='DEF')return p.def*.5+p.fit*.2+p.men*.2+p.tec*.1;
  if(pos==='MID')return p.tec*.4+p.fit*.2+p.att*.2+p.def*.1+p.men*.1;
  return p.att*.55+p.tec*.25+p.fit*.1+p.men*.1;
}
const ovr=p=>ovrPos(p,p.pos);
const ovrAt=(p,pos)=>ovrPos(p,pos)*(p.pos===pos?1:.75);
const mor=p=>(.9+.05*(p.morale-1))*condF(p);
const condF=p=>.7+.3*(p.cond??100)/100;
function wageFor(p){return Math.round((1-.04*LV('plate'))*(ovr(p)*200+300)*(1+.25*(S?S.li:0))*(S&&phaseOf(S.li)>=5?14:S&&phaseOf(S.li)>=4?5:1)*(S&&phaseOf(S.li)>=2?STM[statusOf(p)]:1)*(p.wm||1)/100)*100;}
// ---- Contracts and squad status ----
const STN={k:'Ključni',r:'Rotacija',z:'Rezerva'},STM={k:1.4,r:1,z:.75};
function statusOf(p){if(!S||!S.squad||S.squad.length<8)return 'r';const o=S.squad.map(ovr).sort((a,b)=>b-a),v=ovr(p);return v>=o[4]?'k':v>=o[Math.min(13,o.length-1)]?'r':'z';}
const contractsOn=()=>S&&phase()>=2;
const expiring=()=>contractsOn()?S.squad.filter(p=>p.ce!=null&&p.ce<=S.season&&!p.leaving):[];
function renewDemand(p){const m=1.12+(statusOf(p)==='k'?.18:0)+(persOf(p).k==='amb'?.1:0)+(favg(p)>=7.2?.08:0)+(p.age>=31?-.12:0);return Math.max(1,m);}
const renewWage=p=>Math.round(Math.max(p.wage*1.05,wageFor(p)*renewDemand(p))/100)*100;
const setWage=(p,w)=>{p.wm=(p.wm||1)*w/Math.max(1,wageFor(p));p.wage=Math.round(w/100)*100;};
function contractsHTML(){const ex=expiring();if(!ex.length)return '';
  return `<section class="card"><div class="row between"><h3>Ugovori ističu</h3><span class="lbl">${S.week<14?'do kraja sezone':'odluči sada'}</span></div><div class="hint">Ko ne dobije novi ugovor, odlazi leti kao slobodan igrač. Ključni igrači traže više.</div><div class="list">${ex.map(p=>{const w=renewWage(p);
    return `<div class="li" style="flex-wrap:wrap"><span class="pos ${p.pos}">${POSL[p.pos]}</span><span class="grow"><b>${esc(p.name)}</b><br><span class="hint">${p.age} god. · ${STN[statusOf(p)]} · sada ${fmt(p.wage)}/ned. · traži ${fmt(w)}/ned.</span></span><span class="row" style="gap:6px;width:100%;justify-content:flex-end"><button class="btn sm pri" data-a="renew" data-v="${p.id}">Produži (${p.age>=31?2:3} god.)</button><button class="btn sm" data-a="renewlow" data-v="${p.id}">Ponudi manje</button><button class="btn sm" data-a="letgo" data-v="${p.id}">Pusti</button></span></div>`;}).join('')}</div></section>`;}
function unhappyHTML(m){const p=S.squad.find(x=>x.id===m.pid);if(!p)return '';
  return `<div class="row" style="gap:12px">${faceImg(p,64)}<div class="grow"><span class="eyebrow">Ključni igrač traži razgovor</span><h2>${esc(p.name)}</h2></div></div><p class="story">„Gazda, ja sam ovde da igram. Već ${p.bench} utakmice sedim na klupi. Ili igram, ili tražim klub.”</p>
  <button class="choice" data-a="unh" data-v="promise"><b>Obećaj mu mesto u timu</b><span class="fx">Igra naredne 3 utakmice · moral raste · trener nije oduševljen</span></button>
  <button class="choice" data-a="unh" data-v="fight"><b>Neka se izbori na treningu</b><span class="fx">Moral pada · ambiciozni i problematični traže transfer</span></button>
  <button class="choice" data-a="unh" data-v="list"><b>Stavi ga na transfer listu</b><span class="fx">Stižu ponude za njega</span></button>`;}
function benchWatch(starters){if(!contractsOn())return;S.squad.forEach(p=>{if(statusOf(p)!=='k'||p.inj||p.rest||p.wedding||(p.cond??100)<60){p.bench=0;return;}
  if(starters.has(p.id)){p.bench=0;return;}p.bench=(p.bench||0)+1;if(p.bench>=2&&Math.random()<.5)p.morale=Math.max(1,p.morale-1);if(p.bench===3&&!S.mq.some(m=>m.type==='unhappy'))S.mq.push({type:'unhappy',pid:p.id});});
  if(S.week===8){const ex=expiring();if(ex.length)news(`Ugovori ističu na kraju sezone: ${ex.map(p=>p.name).join(', ')}. Odluči na ekranu Ekipa.`);}}
function value(p){const o=ovr(p);return Math.round(6000*Math.pow(o,2.3)*(S&&S.li>=6?2.2:S&&S.li>=5?2:1)*(p.age<=21?1.5:p.age<=25?1.2:p.age>=30?.6:1)*(p.pot>=o+3?1.3:1)/10000)*10000;}
function genPlayer(pos,lvl,o={}){
  const age=o.age??RI(18,33);
  const base=lvl+R(-1.6,1.6);
  const em={GK:{def:2,men:1,att:-4,tec:-2},DEF:{def:2,fit:1,att:-2},MID:{tec:2,fit:1},ATT:{att:2.5,tec:1,def:-2}}[pos];
  const st=k=>clamp(Math.round(base+R(-2,2)+(em[k]||0)+(k==='fit'&&S&&REG().fit?1:0)),1,20);
  const p={id:S.nextId++,name:pick(FIRST)+' '+pick(LAST),pos,age,att:st('att'),def:st('def'),tec:st('tec'),fit:st('fit'),men:st('men'),
    morale:3,cond:100,inj:0,rest:false,job:o.job??(S&&S.li>=5?pick(JOBS3):S&&S.li>=2?pick(JOBS2):pick(JOBS)),trait:Math.random()<.22?pick(TRAITS).k:null,noise:RI(-1,1)};
  const v=ovr(p);
  p.pot=clamp(Math.round(o.pot??(v+(age<20?R(2,7):age<23?R(1,5):age<27?R(0,2.5):R(0,.8)))),Math.ceil(v),20);
  p.wage=wageFor(p);if(S&&phase()>=2)p.ce=S.season+RI(1,3);
  return p;
}
function starsOf(p){const s=clamp(Math.round(p.pot/4),1,5);return clamp(s+(S.owner.st.oko<9&&!p.scouted&&!has('skaut')?p.noise:0),1,5);}
const starStr=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const traitOf=k=>TRAITS.find(t=>t.k===k);
const maxSquad=()=>phase()>=5?28:phase()>=4?26:phase()>=2?24:22;

