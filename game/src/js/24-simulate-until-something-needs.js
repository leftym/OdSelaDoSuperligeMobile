/* ---------- simulate until something needs you ---------- */
// The assistant only handles routine choices: anything about selling players stops the sim.
function evImportant(e){try{return e.ch(S).some(c=>/sellPlayer|sellNego|listed/.test(String(c.d&&c.d.fn)))||/Ponuda|Investitor|velikani/.test(e.title);}catch(x){return true;}}
function evDelegate(){const id=S.pending[0],e=EVENTS.find(x=>x.id===id);if(!e||!e.when(S)){S.pending.shift();return null;}if(evImportant(e))return false;
  const C=e.ch(S),sc=C.map((c,i)=>{const d=c.d||{};let v=0;if(d.money<0)v-=2+Math.abs(d.money)/(200000*(1+S.li));if(c.chk)v-=1.5;for(const k of ['fan','goodwill','ugled','morale'])if(d[k])v+=d[k]*(k==='ugled'?.6:.3);return [v,i];}).sort((a,b)=>b[0]-a[0]);
  const i=sc[0][1];A.evch(i);if(S.sellNego){S.sellNego=null;}S.modal=null;return `${e.title}: ${C[i].l}`;}
function autoSim(mode){const out=[],m0=S.money,n0=S.news.length,p0=S.table[0].pts,dl=[],maxW=mode==='del'?4:14;S.hold=0;let stop='';
  const flush=()=>{for(let g=0;g<12;g++){if(!S.modal&&S.mq.length)S.modal=S.mq.shift();const m=S.modal;if(!m)return true;if(m.type==='outcome'){S.modal=null;continue;}if(m.type==='winter'){S.modal=null;A.winterok();continue;}return false;}return false;};
  for(let w=0;w<maxW;w++){
    if(!flush()){stop='odluka';break;}
    if(S.week>=14){stop='kraj';break;}if(euroLate()){stop='evropa';break;}if(pendKind()){stop='kup';break;}
    if(S.pending.length&&mode==='del'){let bad=false;for(let g=0;g<4&&S.pending.length;g++){const r=evDelegate();if(r===false){bad=true;break;}if(r)dl.push(r);if(!flush()){bad=true;break;}}if(bad){stop='odluka';break;}}
    if(S.pending.length){stop='odluka';break;}
    const wk=S.week;openMatch();if(!M){stop='odluka';break;}A.quick();const g=[M.g[0],M.g[1]],opp=short(S.teams[M.opp].name),home=M.home;A.endmatch();out.push({wk:wk+1,opp,g,home});}
  if(!out.length)return false;
  const cur=S.modal;S.modal={type:'autosum',out,dm:S.money-m0,dp:S.table[0].pts-p0,news:S.news.slice(0,Math.max(0,S.news.length-n0)).map(n=>n.t).filter(t=>!/kolo:/.test(t)&&!dl.some(d=>t.startsWith(d.split(':')[0]))).slice(0,6),dl,stop:stop||(mode==='del'?'cetiri':'')};if(cur)S.mq.unshift(cur);return true;}
function autoSumHTML(m){const W=m.out.filter(x=>x.g[0]>x.g[1]).length,D=m.out.filter(x=>x.g[0]===x.g[1]).length,L=m.out.length-W-D;
  return `<span class="eyebrow">Šta se desilo</span><h2>${m.out.length} ${plu(m.out.length,'kolo','kola','kola')}: ${W}P ${D}N ${L}I</h2>
  <div class="list">${m.out.map(x=>`<div class="li"><span class="wk lbl">K${x.wk}</span><span class="grow">${x.home?'vs':'@'} ${esc(x.opp)}</span><b class="num ${x.g[0]>x.g[1]?'good':x.g[0]<x.g[1]?'no':''}">${x.g[0]}–${x.g[1]}</b></div>`).join('')}</div>
  <p class="story">+${m.dp} ${plu(m.dp,'bod','boda','bodova')} · ${rank().indexOf(0)+1}. mesto · novac ${m.dm>=0?'+':'−'}${fmt(Math.abs(m.dm))}</p>
  ${m.dl&&m.dl.length?`<span class="lbl">Pomoćnik je odlučio</span><div class="list">${m.dl.map(t=>`<div class="li"><span class="grow hint">${esc(t)}</span></div>`).join('')}</div>`:''}
  ${m.news.length?`<span class="lbl">Važnije vesti</span><div class="list">${m.news.map(t=>`<div class="li"><span class="grow hint">${esc(t)}</span></div>`).join('')}</div>`:''}
  <p class="hint">${{odluka:'Stao sam jer te čeka odluka.',kup:'Stao sam: na redu je kup ili evropska utakmica.',evropa:'Stao sam: počinje evropsko proleće.',kraj:'Sezona je gotova.',cetiri:'Odigrana su četiri kola.'}[m.stop]||''}</p><button class="btn pri" data-a="ok">Nastavi</button>`;}
function weeklyCard(){const w=weeklySpec(),b=(meta().weekly||{})[w.seed];
  return `<section class="card"><div class="row between"><span class="lbl">Nedeljni izazov · ${w.label}</span>${b?`<span class="chip club">Najbolje ${b.score}</span>`:''}</div>
  <h3>FK ${esc(w.club)}, ${esc(w.village)}</h3><div class="hint">${esc(REGIONS[w.region].n)} · ${esc(BG[w.bg].n)} · <b>${esc(w.mod.n)}</b>: ${esc(w.mod.d)}</div>
  <div class="hint">Isti početak za sve ove nedelje. Tri sezone, a onda dobijaš rezultat: bodovi u ligi, koliko si se popeo, trofeji i novac. Igraj ponovo da oboriš svoj rekord.</div>
  <button class="btn pri" data-a="weekly">Igraj izazov ove nedelje</button></section>`;}
function weeklyEndHTML(m){const W=S.weekly;return `<span class="eyebrow">Nedeljni izazov · ${esc(W.label)}</span><h2>Rezultat: ${m.score}</h2>
  <p class="story">Tri sezone sa klubom ${esc(S.club.name)}. Stigao si do lige: ${esc(LEAGUES[Math.max(S.maxLi||0,S.li)].name)}, i osvojio ${W.pts} ${plu(W.pts,'bod','boda','bodova')} u ligi.</p>
  <p class="story">${m.best?(m.score>m.best?`Novi lični rekord ove nedelje. Stari je bio ${m.best}.`:`Tvoj najbolji rezultat ove nedelje i dalje je ${m.best}.`):'Tvoj prvi rezultat ove nedelje. Vrati se i obori ga.'}</p>
  <div class="hint">Bodovi u ligi ${W.pts} · Rang ${(S.maxLi||S.li)}×120 · Trofeji ${(S.trophies||[]).length}×80 · Novac ${Math.max(0,Math.round(S.money/250000))}</div>
  <p class="hint">Možeš da nastaviš ovu karijeru; rezultat je sačuvan.</p><button class="btn pri" data-a="ok">Igraj dalje</button>`;}

