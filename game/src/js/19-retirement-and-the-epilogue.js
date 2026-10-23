/* ---------- retirement and the epilogue ---------- */
// When you hand over the club, the game tells you what became of everyone: the club, the village, the players, the rival.
function epiPlayers(){const cur=S.squad.map(p=>({n:p.name,age:p.age,apps:p.apps||0,goals:p.goals||0,leg:!!p.legend,pers:persOf(p).k,o:ovr(p),here:1}));
  const gone=(S.soldList||[]).map(x=>({n:x.name,age:x.age,apps:x.apps||0,goals:x.goals||0,leg:false,pers:'',o:x.o||0,to:x.to,here:0}));
  return cur.concat(gone).filter(x=>x.apps>0||!x.here).sort((a,b)=>(b.leg-a.leg)||(b.apps-a.apps)||(b.goals-a.goals)).slice(0,6);}
function epiFate(x){const r=srand(hash(x.n+S.cid)),age=x.age+10+Math.floor(r()*3);
  if(!x.here){return pick2(r,[`otišao je u inostranstvo iz kluba ${short(x.to||'kluba')} i nikad se zapravo nije vratio. Svake godine šalje božićnu čestitku.`,`igrao je za ${short(x.to||'veći klub')}, a onda otvorio kafić u Beogradu sa zastavicom tvog kluba iza šanka.`,`i dalje u intervjuima kaže da su seoske godine bile najlepše u njegovom životu.`]);}
  if(x.leg)return pick2(r,[`sada ima ${age} godina i trenira klupske pionire do 12 godina. Deca ga zovu „Legenda”.`,`ima tribinu sa svojim imenom. Sedi na njoj na svakoj domaćoj utakmici, na istom mestu.`,`drži kafanu pored stadiona. Njegova slika sa peharom stoji iznad kase.`]);
  if(x.pers==='bunt')return pick2(r,[`dobio je dve godine suspenzije posle čuvene tuče, vratio se i postao najomiljeniji sudija u okrugu.`,`otišao je u Nemačku na građevinu. Priča se da i dalje igra za neki nedeljni tim, i da se i dalje svađa sa sudijom.`]);
  if(x.pers==='vodja')return pick2(r,[`postao je sportski direktor kluba. I dalje drži govor pred utakmicu.`,`sada je predsednik mesne zajednice u selu ${S.club.village}. Naravno da jeste.`]);
  if(x.pers==='sala')return `vodi sportsku emisiju na lokalnom radiju. Svakog ponedeljka imitira tebe.`;
  if(x.goals>=20)return `dao je ${x.goals} golova za klub. Starci u kafani se i dalje svađaju koji je bio najlepši.`;
  return pick2(r,[`vratio se na imanje. Na dan utakmice je na tribini sa sinovima.`,`postao je nastavnik fizičkog u seoskoj školi i šalje najbolju decu u akademiju.`,`radi u mlekari u susednoj dolini i nedeljom i dalje igra za veterane.`,`ima ${age} godina, troje dece i brkove, i ne propušta nijedan derbi.`]);}
const pick2=(r,a)=>a[Math.floor(r()*a.length)];
function epiHTML(){const t=rivalTeam(S),R=t?rivalO():null,rel=S.rel.rival,L=LEAGUES[Math.max(S.maxLi||0,S.li)].name,lr=legacyRank(),pop=villagePop(),ph=Math.min(5,phaseOf(S.maxLi||S.li));
  const club=S.li>=MAXLI?(S.stats.titles?`${esc(S.club.name)} je superligaški klub. Novi gazda je navijačima obećao jedno: livada se nikad neće zaboraviti.`:`${esc(S.club.name)} je ostao u Superligi. Stadion koji si sagradio i dalje se puni svake druge nedelje.`)
    :S.money<0?`Dugovi su sustigli ${esc(S.club.name)}. Klub je za tri godine pao dva ranga, ali ga je selo održalo u životu, slavu po slavu, dobrotvornu priredbu po priredbu.`
    :`${esc(S.club.name)} igra u takmičenju ${esc(LEAGUES[S.li].name)}. Nije glamurozno, ali stadion je pun, a ćevapi su najbolji u okrugu.`;
  const vil=`${esc(S.club.village)} sada ima oko ${thn(pop)} stanovnika${S.vp.length?`, i ${S.vp.length} stvari kojih nije bilo pre tebe`:''}. ${S.goodwill>=70?'Tvoje ime je na tabli ulice, bar u duhu.':S.goodwill<35?'Neki te i dalje krive za cene karata.':'Ljudi klimnu glavom kad prođeš pored kafane.'}`;
  const riv=R?(rel>30?`${esc(rivalName(R))} ti je na kraju postao prijatelj. Na svakom derbiju prvo poluvreme gledaš iz njegove lože, a drugo iz svoje.`:rel<-30?`${esc(rivalName(R))} ti nikad nije oprostio. Potrošio je ${fmt(R.spent)} pokušavajući da te pobedi, i još pokušava.`:`${esc(rivalName(R))} je i dalje gazda kluba ${esc(short(t.name))}. Za svaku slavu šaljete jedan drugom flašu rakije, sa bezobraznom porukom.`):'';
  const plh=epiPlayers().map(x=>`<div class="li"><span class="grow"><b>${esc(x.n)}</b>${x.leg?' <span class="chip club">Legenda</span>':''}<br><span class="hint">${x.apps} ${plu(x.apps,'utakmica','utakmice','utakmica')}${x.goals?`, ${x.goals} ${plu(x.goals,'gol','gola','golova')}`:''} · ${esc(epiFate(x))}</span></span></div>`).join('');
  const own=S.owner.name;
  return `<div class="cel promo" style="position:relative;inset:auto;min-height:44vh;border-radius:10px 10px 0 0;margin:-18px -16px 0;width:calc(100% + 32px);--cimg:url(img/ph${ph}.webp${ph===1?'?v=2':''})"><div><span class="eyebrow">${S.season} ${plu(S.season,'sezona','sezone','sezona')} · ${esc(lr)}</span><h1 style="font-size:40px">Hvala, gazda</h1><p>${esc(own)} predaje ${esc(S.club.name)}</p></div></div>
  <span class="eyebrow">Deset godina kasnije</span><h2>Gde su sada?</h2>
  <p class="story"><b>Klub.</b> ${club}</p><p class="story"><b>Selo.</b> ${vil}</p>${riv?`<p class="story"><b>Rival.</b> ${riv}</p>`:''}
  <span class="lbl">Igrači</span><div class="list">${plh||'<div class="hint">Niko nije igrao dovoljno dugo da bi se pamtio.</div>'}</div>
  <p class="story"><b>Ti.</b> Najviši rang: ${esc(L)}. Trofeji: ${(S.trophies||[]).length}. Nasleđe ${thn(legacyScore())}. ${S.stats.titles?'Na tribini i dalje pevaju tvoje ime.':'Negde u kafani neko i dalje priča o kravi na beloj tački.'}</p>
  ${lpEpiHTML()}${S.weekly||S.scen?'':dynHTML()}<button class="btn pri" data-a="epidone">${lgM().pts?'Prodavnica nasleđa i nova karijera':'Počni novu karijeru'}</button>`;}

