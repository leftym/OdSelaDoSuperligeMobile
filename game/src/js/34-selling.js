/* ---------- selling: negotiate with the buying club ---------- */
// Mirror of buying: the buyer has a hidden top price and limited patience. Biznis raises their ceiling.
function sellNegoStart(p,offer,buyer){const biz=S.owner.st.biz+(has('pregovarac')?2:0);
  const top=clamp(1.12+.025*(biz-5)+(Math.random()*.14-.06),1.02,1.5);
  S.sellNego={type:'sellhag',pid:p.id,buyer,offer,orig:offer,top:Math.round(offer*top/10000)*10000,pat:3+(biz>=12?1:0),log:[],last:0};return '';}
function sellAsk(m,y){const p=S.squad.find(x=>x.id===m.pid);if(!p)return;y=Math.round(y/10000)*10000;m.last=y;m.log.push({who:'you',t:`Tražiš ${fmt(y)}.`});
  if(y<=m.top||(y-m.offer)/m.offer<.04){m.deal=Math.min(y,Math.max(m.offer,m.top));m.log.push({who:'them',t:pick(['„Dogovoreno. Šalji papire.”','„Tvrd si ti, gazda. Važi.”','„Dobro. Vredi toliko.”'])});return;}
  const greedy=y>m.top*1.3;m.pat-=greedy?2:1;
  if(m.pat<=0){m.gone=1;p.morale=Math.max(1,p.morale-1);m.log.push({who:'them',t:`„Zaboravi.” ${short(m.buyer)} odustaje. ${p.name} je želeo taj transfer.`});return;}
  const cap=Math.round(m.top*.98/10000)*10000;m.offer=Math.min(cap,Math.max(m.offer,Math.round((m.offer+(y-m.offer)*(greedy?.12:.35))/10000)*10000));
  m.log.push({who:'them',t:m.offer>=cap&&!greedy?`„${fmt(m.offer)}. To je sve što imamo.”`:greedy?`Smeju se. „${fmt(m.offer)}, i budi zahvalan.”`:pick([`„Možemo do ${fmt(m.offer)}.”`,`„${fmt(m.offer)}, konačno.”`,`„Budi razuman. ${fmt(m.offer)}.”`])});}
function sellHagHTML(m){const p=S.squad.find(x=>x.id===m.pid);
  const head=`<div class="row" style="gap:12px">${p?faceImg(p,64):''}<div class="grow"><span class="eyebrow">Prodaja · ${esc(short(m.buyer))}</span><h2>${esc(p?p.name:'')}</h2>${p?`<div class="hint">${POSL[p.pos]} · ${p.age} god. · ukupno ${Math.round(ovr(p))} · prva ponuda ${fmt(m.orig)}</div>`:''}</div></div>`;
  const box=m.log.length?`<div class="feed" style="max-height:30vh">${m.log.map(x=>`<div class="ln"><span class="m">${x.who==='you'?'Ti':'Oni'}</span><span>${esc(x.t)}</span></div>`).join('')}</div>`:'';
  if(m.gone||!p)return `${head}${box}<button class="btn pri" data-a="sellx" data-v="close">Nastavi</button>`;
  if(m.deal)return `${head}${box}<button class="btn pri" data-a="sellx" data-v="deal">Potpiši papire: ${fmt(m.deal)}</button>`;
  const asks=[[1.1,'Pristojno'],[1.25,'Čvrsto'],[1.45,'Pohlepno']].map(([k,l])=>[Math.round(m.offer*k/10000)*10000,l]).filter(([y])=>!m.last||y<m.last);
  const mid=m.last?Math.round((m.last+m.offer)/20000)*10000:0;
  const b=(v,t,d)=>`<button class="choice" data-a="sellask" data-v="${v}"><b>${t}</b><span class="fx">${d}</span></button>`;
  return `${head}${box}<div class="row between"><span class="lbl">Nude ${fmt(m.offer)}</span><span class="lbl">Strpljenje ${'●'.repeat(Math.max(0,m.pat))}${'○'.repeat(Math.max(0,4-m.pat))}</span></div>
    ${b('take',`Prihvati ${fmt(m.offer)}`,'Odlazi danas')}${mid&&mid>m.offer?b('mid',`Nađimo se na pola: ${fmt(mid)}`,'Dobre šanse'):''}${asks.map(([y,l])=>b(String(y),`${l}: traži ${fmt(y)}`,l==='Pohlepno'?'Mogu da odustanu':'Troši strpljenje ako odbiju')).join('')}
    <button class="btn" data-a="sellx" data-v="keep">Nije na prodaju</button>`;}

