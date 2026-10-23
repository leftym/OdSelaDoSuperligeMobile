/* ---------- the weekly newspaper ---------- */
// One issue per league round, printed from what happened that week. Stored, so old news stays old.
function paperIssue(W,D,L,opp,res){
  const us=short(S.club.name).toUpperCase(),th=short(opp.name).toUpperCase(),sc=`${res.gf}:${res.ga}`,mg=res.gf-res.ga,pos=rank().indexOf(0)+1;
  const hl=opp.rival?(W?'DERBI JE NAŠ!':L?'SRAMOTA U DERBIJU':`DERBI BEZ POBEDNIKA, ${sc}`)
    :mg>=3?pick([`${us} RAZBIO ${th} ${sc}!`,`FUDBALSKA LEKCIJA: ${sc}`]):W?pick([`POBEDA! ${us} ${sc}`,`${us} SLAVI PROTIV ${th}`])
    :D?`PODELA BODOVA: ${sc}`:mg<=-3?pick([`KATASTROFA! ${res.ga} GOLOVA U NAŠOJ MREŽI`,`CRNI DAN ZA ${us}`]):`PORAZ OD ${th}`;
  const sub=`${short(S.club.name)} ${W?'pobeđuje':L?'gubi od':'igra nerešeno sa'} ${short(opp.name)} ${res.gf}–${res.ga}${opp.rival?' u derbiju':''}. Klub je sada ${pos}${ordSuf(pos)} u ligi (${LEAGUES[S.li].name})${S.lastAtt?`, a poslednju domaću utakmicu gledalo je ${thn(S.lastAtt)} ljudi`:''}.`;
  const wk=S.news.filter(n=>n.s===S.season&&n.w===S.week&&!/^\d+\. kolo/.test(n.t)).map(n=>n.t);
  if(S.queue.length){const q=S.queue[0],t=BUILD[q.k].t[S.b[q.k]+1];if(t)wk.push(q.permit?`I dalje se čeka opštinska dozvola za objekat: ${t.n.toLowerCase()}.`:`Radovi se nastavljaju (${t.n.toLowerCase()}): još ${q.left} ${plu(q.left,'nedelja','nedelje','nedelja')}.`);}
  const stories=wk.slice(0,4);
  const side=stories.find(t=>/potpis|u ekipi|stiže|dovodi/.test(t))?'np-sign':stories.find(t=>/povređen/.test(t))?'np-injury':S.queue.length&&Math.random()<.5?'np-build':pick(['np-kafana','np-team']);
  const top=rank().slice(0,3).map(i=>[short(S.teams[i].name),S.table[i].pts,i===0]);if(pos>3)top.push([short(S.club.name),S.table[0].pts,true]);
  const h=harmony(),gossip=pick([
    h<40?`Kod Mileta se priča da se svlačionica podelila na dvoje. Niko neće da kaže ko je počeo.`:h>=72?`Igrači su viđeni kako zajedno pevaju Kod Mileta do ponoći. Atmosfera je odlična.`:`Starci Kod Mileta slažu se oko jednog: levi bek je prespor.`,
    S.fan>=70?`Kažu da se za sledeću domaću utakmicu karta ne može naći, čak ni kod gazdinog rođaka.`:`Opet prazna mesta u nedelju. „U moje vreme”, kaže deda Mile, „stajali smo i na snegu.”`,
    S.rel&&S.rel.rival<-20?`Gazda kluba ${rivalShort(S)} priča svakom ko hoće da sluša da se naš gazda „gore kupio”.`:`Priča se: skaut iz Beograda viđen je kako jede ćevape na stadionu.`,
    S.money<0?`Direktor banke viđen je kako izlazi iz klupske kancelarije veoma ozbiljnog lica.`:`Gazdin novi auto ove nedelje svake večeri stoji ispred kafane.`]);
  const letter=W?pick([`„Navijam za ovaj klub 41 godinu. Danas sam plakao kao dete. Hvala, momci.” – M. P.`,`„Konačno fudbal vredan karte za autobus.” – čitalac iz susednog sela`])
    :L?pick([`„Ko bira ovaj tim? Moja koza bi bolje.” – ljuti čitalac`,`„Prodajte ih sve i krenite ispočetka.” – R. J., vlasnik sezonske karte`]):`„Bod je bod, ali meni su živci gotovi.” – S. K.`;
  const ads=shuffle(['PRODAJEM KRAVU. Mirna, zdrava, ne gleda fudbal. Pitati za Dragoljuba.','TRAŽIM društvo za gostovanja. Imam auto i rakiju.','IZGUBLJENA kopačka, leva, broj 43. Nalazaču nagrada: pivo.','PRODAJEM traktor IMT 539. Vozi sporije od našeg beka.','MESARA RADE: ćevapi za navijače, 10% popusta posle pobede.','KUPUJEM stare dresove kluba. Plaćam dobro.']).slice(0,2);
  S.paperNo=(S.paperNo||0)+1;
  S.paper={no:S.paperNo,name:PAPER(),season:S.season,round:S.week+1,hl,sub,photo:W?'np-goal':L?'np-loss':'np-team',stories,side,top,gossip,letter,ads};S.paperNew=1;
}
function paperHTML(){const p=S.paper;if(!p)return '';
  return `<div class="np"><div class="np-mast"><span>Br. ${p.no} · Sezona ${p.season} · Kolo ${p.round}</span><h1>${esc(p.name)}</h1><span>Nezavisni list za ${esc(S.club.village)} i okolinu · Cena 50 din.</span></div>
  <h2 class="np-hl">${esc(p.hl)}</h2><img class="np-ph" src="img/${p.photo}.webp?v=2" alt="" loading="lazy"><p class="np-lead">${esc(p.sub)}</p>
  <div class="np-cols"><div>${p.stories.length?`<h4>Iz kluba</h4>${p.stories.map(t=>`<p>${esc(t)}</p>`).join('')}`:''}<img class="np-ph sm" src="img/${p.side}.webp?v=2" alt="" loading="lazy"><h4>Kafanska priča</h4><p>${esc(p.gossip)}</p></div>
  <div><h4>Tabela</h4><table class="np-t">${p.top.map(([n,pts,me])=>`<tr${me?' class="me"':''}><td>${esc(n)}</td><td>${pts}</td></tr>`).join('')}</table><h4>Pisma čitalaca</h4><p><i>${esc(p.letter)}</i></p><h4>Mali oglasi</h4>${p.ads.map(a=>`<p class="np-ad">${esc(a)}</p>`).join('')}</div></div></div>
  <button class="btn pri" data-a="ok">Presavij novine</button>`;}
function paperTeaser(){const p=S.paper;if(!p)return '';
  return `<button class="card np-teaser" data-a="paper"><div class="row between"><span class="lbl">${esc(p.name)} · Br. ${p.no}</span>${S.paperNew?'<span class="chip club">Novo</span>':'<span class="lbl">Pročitano</span>'}</div><b class="np-th">${esc(p.hl)}</b></button>`;}

