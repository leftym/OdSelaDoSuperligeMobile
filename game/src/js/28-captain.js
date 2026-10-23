/* ---------- captain, group moods, team meetings ---------- */
function capOf(){let c=S.squad.find(p=>p.id===S.capId);if(!c){c=S.squad.filter(p=>!p.inj).sort((a,b)=>(ovr(b)*1.5+b.men+(b.trait==='kap'?4:0))-(ovr(a)*1.5+a.men+(a.trait==='kap'?4:0)))[0];if(c)S.capId=c.id;}return c||null;}
function capMult(all){const c=capOf();if(!c||!all.some(p=>p.id===c.id))return 1;return 1+clamp(.01+(c.men-10)*.002+(persOf(c).k==='vodja'?.01:0),0,.035);}
function groupsOf(){const sq=S.squad,f=(n,L)=>({n,L,m:L.length?L.reduce((s,p)=>s+(p.morale||3),0)/L.length:0});
  const intl=sq.filter(p=>natOf(p)&&natOf(p).r!=='balkan');
  return [f('Domaći',sq.filter(isLocal)),f('Pojačanja',sq.filter(p=>!isLocal(p)&&!intl.includes(p))),f('Stranci',intl),f('Veterani 30+',sq.filter(p=>p.age>=30)),f('Klinci 21−',sq.filter(p=>p.age<=21))].filter(g=>g.L.length);}
const moodLab=m=>m>=4?['Srećni','g']:m>=3?['Mirni','']:m>=2?['Nezadovoljni','w']:['Ljuti','b'];
function meetReady(){return S.week-(S.meetW??-9)>=3;}
function roomExtra(){const c=capOf(),G=groupsOf(),cands=S.squad.filter(p=>p.id!==(c&&c.id)&&!p.inj).sort((a,b)=>(ovr(b)*1.5+b.men)-(ovr(a)*1.5+a.men)).slice(0,3);
  return `<div class="row between" style="margin-top:6px"><div><span class="lbl">Kapiten</span><div><b>${c?esc(c.name):'—'}</b> <span class="hint">${c?`mentalitet ${c.men}${persOf(c).k==='vodja'?' · prirodni vođa':''} · ${capMult(xiAll(pickXI()))>1?'+'+((capMult(xiAll(pickXI()))-1)*100).toFixed(1).replace('.',',')+'% kad igra':'ne igra'}`:''}</span></div></div></div>
  <div class="row" style="flex-wrap:wrap;gap:6px">${cands.map(p=>`<button class="btn sm" data-a="capset" data-v="${p.id}">${esc(p.name.split(' ').slice(1).join(' ')||p.name)} (${p.men})</button>`).join('')}</div>
  <span class="lbl">Grupe u svlačionici</span><div class="grps">${G.map(g=>{const [l,cl]=moodLab(g.m);return `<span class="grp ${cl}"><b>${g.n}</b> ${g.L.length} · ${l}</span>`;}).join('')}</div>
  <button class="btn${meetReady()?' pri':''}" data-a="meetopen" ${meetReady()?'':'disabled'}>${meetReady()?'Sastanak tima':`Sledeći sastanak za ${3-(S.week-(S.meetW??-9))} ned.`}</button>`;}
function meetHTML(){const G=groupsOf(),low=G.filter(g=>g.m<2.6),form=S.results.slice(Math.max(0,S.week-3),S.week).filter(Boolean).map(r=>{const f=r.find(x=>x[0]===0||x[1]===0);if(!f)return 0;const gf=f[0]===0?f[2]:f[3],ga=f[0]===0?f[3]:f[2];return gf>ga?1:gf<ga?-1:0;}),sc=form.reduce((a,b)=>a+b,0);
  const bonus=Math.round(weeklyCosts().wages*.5/1000)*1000;
  return `<span class="eyebrow">Sastanak tima</span><h2>Šta im govoriš?</h2><p class="story">${sc>=2?'Ekipa je u naletu. Svi te gledaju sa osmehom.':sc<=-2?'Tri teška kola. U svlačionici je tiho, niko ne gleda u oči.':'Sezona teče. Momci čekaju da čuju šta misliš.'}</p>
  <button class="choice" data-a="meet" data-v="praise"><b>Pohvali ekipu</b><span class="fx">${sc>=1?'Dobro leži posle dobrih rezultata':'Posle loših rezultata zvuči prazno'}</span></button>
  <button class="choice" data-a="meet" data-v="shout"><b>Podigni glas</b><span class="fx">Rizik: ili se trgnu, ili se zatvore. Šarm i kapiten pomažu</span></button>
  ${low.length?`<button class="choice" data-a="meet" data-v="group"><b>Razgovaraj sa grupom: ${esc(low[0].n)}</b><span class="fx">Oni su nezadovoljni. Ostali to primete</span></button>`:''}
  <button class="choice" data-a="meet" data-v="bonus" ${S.money<bonus?'disabled':''}><b>Obećaj premiju za sledeću pobedu</b><span class="fx">${fmt(bonus)} · svi su motivisani</span></button>
  <button class="btn" data-a="ok">Ipak ne sada</button>`;}
function meetDo(v){const sq=S.squad,c=capOf(),sarm=S.owner.st.sarm,msgs=[],h0=harmony();let dh=0;
  const form=S.results.slice(Math.max(0,S.week-3),S.week).filter(Boolean).map(r=>{const f=r.find(x=>x[0]===0||x[1]===0);if(!f)return 0;const gf=f[0]===0?f[2]:f[3],ga=f[0]===0?f[3]:f[2];return gf>ga?1:gf<ga?-1:0;}).reduce((a,b)=>a+b,0);
  if(v==='praise'){if(form>=1){dh=4;sq.forEach(p=>{if(Math.random()<.35)p.morale=Math.min(5,p.morale+1);});msgs.push('Pohvala je legla. Ekipa veruje u sebe.');}else{dh=-1;msgs.push('„Svaka čast?” Posle ovakvih rezultata, momci se pogledaju u čudu.');}}
  if(v==='shout'){const ch=clamp(.45+(sarm-5)*.04+(c&&c.men>=13?.1:0)+(form<=-1?.1:0),.2,.85);if(Math.random()<ch){dh=3;sq.forEach(p=>{if(Math.random()<.5)p.morale=Math.min(5,p.morale+1);});msgs.push(`Trgli su se. ${c?esc(c.name)+' ustaje i kaže: „Gazda je u pravu.”':''}`);}else{dh=-4;sq.filter(p=>persOf(p).k==='bunt'||p.morale<=2).forEach(p=>p.morale=Math.max(1,p.morale-1));msgs.push('Pogrešan ton. Nekoliko igrača izlazi bez reči. Svlačionica je hladnija.');}}
  if(v==='group'){const g=groupsOf().filter(x=>x.m<2.6)[0];if(g){g.L.forEach(p=>p.morale=Math.min(5,p.morale+1));dh=1;msgs.push(`Razgovor sa grupom „${g.n}” je pomogao. Osećaju da ih vidiš.`);const other=groupsOf().filter(x=>x.n!==g.n&&x.L.length);if(other.length&&Math.random()<.4){const o=pick(other);o.L.forEach(p=>{if(Math.random()<.3)p.morale=Math.max(1,p.morale-1);});msgs.push(`${o.n} misle da imaš ljubimce.`);}}}
  if(v==='bonus'){const b=Math.round(weeklyCosts().wages*.5/1000)*1000;S.money-=b;led('wages',-b);S.bonusW=S.week;sq.forEach(p=>p.morale=Math.min(5,p.morale+1));dh=2;msgs.push(`Premija od ${fmt(b)} je obećana i isplaćena. Svi trče za dvojicu.`);}
  S.harmony=clamp(h0+dh,0,100);S.meetW=S.week;msgs.push(`Svlačionica: ${Math.round(h0)} → ${Math.round(S.harmony)}.`);S.modal={type:'outcome',title:'Sastanak tima',msgs};}

