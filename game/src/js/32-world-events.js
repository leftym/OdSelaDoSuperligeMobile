/* ---------- world events: each season the football world can change the rules ---------- */
const WEV={
 tv:{n:'Novi TV ugovor',d:'Televizija je potpisala veliki ugovor sa savezom. Klubovi u Prvoj ligi i Superligi dobijaju 40% više od TV prava, a i sponzori plaćaju više.',ic:'📺',when:s=>phaseOf(s.li)>=4},
 kriza:{n:'Ekonomska kriza',d:'Firme štede. Sponzori daju 20% manje, publika je 10% manja, a za igrače se plaća 15% manje.',ic:'📉',when:()=>true},
 reforma:{n:'Reforma takmičenja',d:'Savez smanjuje lige. Ove sezone ispadaju TRI poslednja kluba, a ne dva.',ic:'📜',when:s=>s.li>=1},
 stadioni:{n:'Država ulaže u stadione',d:'Program obnove sportskih objekata: sva gradnja je ove sezone 20% jeftinija.',ic:'🏗️',when:()=>true},
 bankrot:{n:'Rival je bankrotirao',d:'Jedan klub je pred gašenjem i rasprodaje igrače u pola cene. Pogledaj slobodne igrače.',ic:'💸',when:s=>true},
 skandal:{n:'Afera u ligi',d:'Jednom klubu iz tvoje lige oduzeto je 6 bodova zbog nepravilnosti u registraciji igrača.',ic:'⚖️',when:s=>s.teams.some(t=>!t.me&&!REALCITY[t.name])},
 zima:{n:'Oštra zima',d:'Meteorolozi najavljuju najhladniju zimu u deceniji. Više snega i blata na terenima bez drenaže.',ic:'❄️',when:()=>true}};
const wev=k=>!!(S&&S.wev&&S.wev.s===S.season&&S.wev.k===k);
function worldEvent(){S.wev=null;if(S.weekly||S.scen||S.season<2||Math.random()>.45)return;const ks=Object.keys(WEV).filter(k=>WEV[k].when(S)&&(!S.wevLast||S.wevLast!==k));if(!ks.length)return;const k=pick(ks);S.wev={k,s:S.season};S.wevLast=k;const E=WEV[k];
  if(k==='tv'){const tv=(S.li>=6?15000000:5000000)*.4;S.money+=tv;led('tv',tv);}
  if(k==='skandal'){const fi=S.teams.map((t,j)=>j).filter(j=>j&&!REALCITY[S.teams[j].name]),i=pick(fi);S.table[i].pts-=6;S.wev.club=S.teams[i].name;}
  if(k==='bankrot'){const lv=LEAGUES[Math.min(S.li+1,MAXLI)].lvl,cl=LEAGUES0.slice(0,4).flatMap(L=>L.names).filter(n=>!REALCITY[n]&&!S.teams.some(t=>t.name===n)),from=cl.length?pick(cl):'FK Sloboda Varoš';S.wev.club=from;
    for(let i=0;i<3;i++){const pl=genPlayer(pick(['DEF','MID','ATT']),lv-.3+R(0,1),{age:RI(22,29)});pl.from=from;pl.fee=Math.round(value(pl)*.5/10000)*10000;pl.firesale=1;S.fa.unshift(pl);}}
  news(`${E.ic} ${E.n}: ${E.d}${S.wev.club?` (${short(S.wev.club)})`:''}`);S.mq.push({type:'wev'});}
function wevChip(){if(!S.wev||S.wev.s!==S.season)return '';const E=WEV[S.wev.k];return `<section class="card wevc"><span class="lbl">Ove sezone</span><div class="row" style="gap:10px"><span style="font-size:24px">${E.ic}</span><div class="grow"><b>${E.n}</b><div class="hint">${E.d}${S.wev.club?` Klub: <b>${esc(short(S.wev.club))}</b>.`:''}</div></div></div></section>`;}
function roomCard(){const h=harmony(),c=cliques(S),lab=h>=72?'Braća':h>=55?'Dobro':h>=40?'Napeto':'Otrovno';
  const by=k=>S.squad.filter(p=>persOf(p).k===k);const names=k=>by(k).map(p=>esc(p.name.split(' ')[1]||p.name)).join(', ');
  const notes=[];if(by('vodja').length)notes.push(`<b>Vođe:</b> ${names('vodja')}`);if(by('sala').length)notes.push(`<b>Šaljivdžije:</b> ${names('sala')}`);if(by('bunt').length)notes.push(`<b class="no">Problematični:</b> ${names('bunt')}`);
  return `<section class="card"><div class="row between"><h3>Svlačionica</h3><span class="chip ${h>=55?'club':h<40?'bad':''}">${lab} · ${Math.round(h)}</span></div>${bar(h,100,'club')}
  <div class="hint">Domaći ${c.loc.length} · Pojačanja ${c.sig.length} · Veterani 30+ ${c.vet.length} · Klinci 21− ${c.kid.length}. Srećna svlačionica podiže moral i dodaje do 4% na terenu; otrovna oduzima isto toliko.${c.loc.length>=5&&c.sig.length>=4?' Previše pojačanja u prvih jedanaest ljuti seoske momke.':''}</div>
  ${notes.length?`<div class="hint">${notes.join(' · ')}</div>`:''}${roomExtra()}</section>`;}

