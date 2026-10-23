/* ---------- international market: foreign players by region ---------- */
const NATS=[
 {k:'ba',n:'Bosna i Hercegovina',f:'🇧🇦',r:'balkan',c:['Sarajevo','Željezničar','Borac Banja Luka','Zrinjski'],fn:['Amar','Edin','Haris','Emir','Kenan','Tarik','Adnan','Mirza'],ln:['Hodžić','Begić','Mujić','Hasić','Delić','Mehić','Alić','Omerović']},
 {k:'me',n:'Crna Gora',f:'🇲🇪',r:'balkan',c:['Budućnost Podgorica','Sutjeska'],fn:['Vuk','Stefan','Balša','Nikola','Andrija','Luka'],ln:['Vukčević','Radulović','Bulatović','Vujović','Lakić','Raičević']},
 {k:'mk',n:'Severna Makedonija',f:'🇲🇰',r:'balkan',c:['Vardar','Škendija'],fn:['Ilija','Bojan','Darko','Aleksandar','Filip','Goran'],ln:['Trajkovski','Nikolovski','Stojanovski','Ristovski','Velkovski','Angelovski']},
 {k:'hr',n:'Hrvatska',f:'🇭🇷',r:'balkan',c:['Hajduk Split','Rijeka','Osijek'],fn:['Ivan','Josip','Mateo','Ante','Toni','Dino'],ln:['Jurić','Babić','Šimić','Perić','Grgić','Bašić']},
 {k:'si',n:'Slovenija',f:'🇸🇮',r:'balkan',c:['Olimpija Ljubljana','Maribor'],fn:['Žan','Jan','Nejc','Luka','Tim','Rok'],ln:['Kranjc','Zupan','Horvat','Vidmar','Kos','Golob']},
 {k:'bg',n:'Bugarska',f:'🇧🇬',r:'istok',c:['Levski Sofija','CSKA Sofija'],fn:['Georgi','Ivajlo','Dimitar','Martin','Kristijan'],ln:['Petrov','Georgijev','Ivanov','Dimitrov','Kolev']},
 {k:'ro',n:'Rumunija',f:'🇷🇴',r:'istok',c:['Rapid Bukurešt','Univerzitatea Krajova'],fn:['Andrej','Mihaj','Rareš','Kristijan','Darijus'],ln:['Popesku','Ionesku','Dumitru','Munteanu','Stan']},
 {k:'hu',n:'Mađarska',f:'🇭🇺',r:'istok',c:['Ujpešt','Debrecin'],fn:['Adam','Bence','Mate','Daniel','Levente'],ln:['Nađ','Sabo','Varga','Tot','Molnar']},
 {k:'sk',n:'Slovačka',f:'🇸🇰',r:'istok',c:['Slovan Bratislava','Žilina'],fn:['Martin','Matuš','Tomaš','Patrik'],ln:['Novak','Kučera','Hudak','Polak']},
 {k:'ge',n:'Gruzija',f:'🇬🇪',r:'istok',c:['Dinamo Tbilisi','Saburtalo'],fn:['Giorgi','Levan','Luka','Saba','Nika'],ln:['Beridze','Kapanadze','Gelašvili','Mamaladze','Lobžanidze']},
 {k:'gh',n:'Gana',f:'🇬🇭',r:'afrika',c:['Hearts of Oak','Asante Kotoko'],fn:['Kvame','Kofi','Jau','Kvesi','Isak','Emanuel'],ln:['Mensa','Asante','Ovusu','Ansa','Adžei','Frimpong']},
 {k:'ng',n:'Nigerija',f:'🇳🇬',r:'afrika',c:['Enyimba','Rangers International'],fn:['Čidi','Emeka','Tunde','Ifeani','Samson','Viktor'],ln:['Okafor','Adejemi','Eze','Okonkvo','Balogun','Nvankvo']},
 {k:'sn',n:'Senegal',f:'🇸🇳',r:'afrika',c:['Génération Foot','Jaraaf'],fn:['Mamadu','Ibrahima','Šeik','Pap','Ismaila'],ln:['Diop','Ndijaje','Sar','Fal','Sek','Gej']},
 {k:'ci',n:'Obala Slonovače',f:'🇨🇮',r:'afrika',c:['ASEC Mimosas','Africa Sports'],fn:['Seku','Ibrahim','Žan','Lasina','Jaja'],ln:['Kone','Bamba','Koné','Diomande','Fofana']},
 {k:'ml',n:'Mali',f:'🇲🇱',r:'afrika',c:['Djoliba','Stade Malien'],fn:['Musa','Adama','Bakari','Amadu','Hamari'],ln:['Kulibali','Dijara','Keita','Sisoko','Dembele']},
 {k:'cm',n:'Kamerun',f:'🇨🇲',r:'afrika',c:['Coton Sport','Canon Yaoundé'],fn:['Samuel','Pjer','Andre','Klinton','Bruno'],ln:['Ekoto','Mbija','Nđoja','Čami','Ebosse']},
 {k:'br',n:'Brazil',f:'🇧🇷',r:'juzam',c:['Fluminense','Vasko da Gama','Bahija','Koritiba'],fn:['Lukas','Gabrijel','Mateus','Rafael','Kaio','Danilo','Igor','Vitor'],ln:['Santos','Oliveira','Souza','Kosta','Pereira','Almeida','Ferejra','Barbosa']},
 {k:'ar',n:'Argentina',f:'🇦🇷',r:'juzam',c:['Lanus','Velez Sarsfild','Rosario Central'],fn:['Nikolas','Fakundo','Agustin','Tomas','Franko','Valentin'],ln:['Gonsales','Rodriges','Lopes','Romero','Sosa','Benites']},
 {k:'co',n:'Kolumbija',f:'🇨🇴',r:'juzam',c:['Atletiko Nasional','Miljonarios'],fn:['Huan','Andres','Kamilo','Santjago','Felipe'],ln:['Gomes','Ramires','Moreno','Kastiljo','Ospina']},
 {k:'uy',n:'Urugvaj',f:'🇺🇾',r:'juzam',c:['Nasional','Penjarol','Defensor'],fn:['Matijas','Rodrigo','Mateo','Agustin','Brajan'],ln:['Pereira','Kabrera','Olivera','Rodriges','Sanči']},
 {k:'jp',n:'Japan',f:'🇯🇵',r:'azija',c:['Kašima Entlers','Urava Reds'],fn:['Takumi','Haruto','Ren','Kaito','Sota','Riku'],ln:['Sato','Suzuki','Takahaši','Tanaka','Vatanabe','Ito']},
 {k:'kr',n:'Južna Koreja',f:'🇰🇷',r:'azija',c:['Ulsan','Đeonbuk'],fn:['Min-džun','Seo-džun','Do-hjun','Džu-van','Hjun-u'],ln:['Kim','Li','Park','Čoi','Džang']},
 {k:'fr',n:'Francuska',f:'🇫🇷',r:'zapad',c:['Lans','Nant','Monpelje'],fn:['Teo','Hugo','Matis','Enco','Rajan'],ln:['Moro','Lefevr','Mišel','Lerua','Gaske']},
 {k:'es',n:'Španija',f:'🇪🇸',r:'zapad',c:['Hetafe','Osasuna','Selta'],fn:['Pablo','Alvaro','Adrijan','Mario','Iker'],ln:['Garsija','Martines','Sančes','Peres','Nunjes']},
 {k:'pt',n:'Portugalija',f:'🇵🇹',r:'zapad',c:['Braga','Gimaraeš'],fn:['Žoao','Rui','Diogo','Tijago','Andre'],ln:['Kosta','Santos','Fereira','Mendeš','Rodrigeš']},
 {k:'nl',n:'Holandija',f:'🇳🇱',r:'zapad',c:['Utreht','Tvente'],fn:['Jan','Dan','Sem','Lars','Tom'],ln:['Jansen','Baker','Viser','Smit','Mulder']},
 {k:'de',n:'Nemačka',f:'🇩🇪',r:'zapad',c:['Majnc','Augsburg'],fn:['Jonas','Leon','Fin','Paul','Tim'],ln:['Miler','Šmit','Šnajder','Fišer','Veber']}];
const IREG={balkan:{n:'Balkan',ph:2,fee:.9,wm:1,lv:0,ad:0},istok:{n:'Istočna Evropa',ph:3,fee:1,wm:1.1,lv:.1,ad:3},afrika:{n:'Afrika',ph:3,fee:.8,wm:1.05,lv:-.2,ad:4,young:1},juzam:{n:'Južna Amerika',ph:4,fee:1.3,wm:1.35,lv:.3,ad:4,young:1},azija:{n:'Azija',ph:4,fee:1.15,wm:1.3,lv:.1,ad:5},zapad:{n:'Zapadna Evropa',ph:5,fee:1.7,wm:1.6,lv:.6,ad:3}};
const natOf=p=>p&&p.nat?NATS.find(n=>n.k===p.nat):null;
const natTag=p=>{const N=natOf(p);return N?`<span class="nat" title="${N.n}" aria-label="${N.n}">${N.f}</span> `:'';};
const iRegs=()=>Object.keys(IREG).filter(r=>phase()>=IREG[r].ph-(obg()==='povratnik'?1:0));
const forLim=()=>phase()<=3?4:phase()===4?5:7;
const forCnt=()=>S.squad.filter(p=>{const N=natOf(p);return N&&N.r!=='balkan';}).length;
function intlPlayer(pos,reg,lvlAdj=0,young){const R0=IREG[reg],pool=NATS.filter(n=>n.r===reg),N=pick(pool),yg=young??(R0.young&&Math.random()<.6);
  const p=genPlayer(pos,LEAGUES[S.li].lvl-1.3+R0.lv+lvlAdj+R(0,1.8)-(yg?1:0),{age:yg?RI(18,21):RI(22,30)});
  p.name=pick(N.fn)+' '+pick(N.ln);p.nat=N.k;p.wm=R0.wm*(obg()==='povratnik'?.9:1);p.job='stranac';p.from=`${pick(N.c)} (${N.n})`;p.scouted=true;
  if(yg)p.pot=clamp(p.pot+RI(1,3),1,20);
  p.fee=Math.round(value(p)*1.15*R0.fee*(has('pregovarac')?.85:1)/10000)*10000;p.wage=wageFor(p);return p;}
function refreshLoans(){if(phase()<2||S.chall==='local'){S.loanMkt=[];return;}
  const src=S.li<MAXLI?Object.values(world()).filter(c=>c.li===S.li+1).map(c=>c.name):EUROC.slice(12).map(c=>`${c[0]} (${c[1]})`).concat(GIANTS.includes(S.club.name)?[]:GIANTS);
  S.loanMkt=Array.from({length:4},()=>{const from=src.length?pick(src):LEAGUES[Math.min(S.li+1,MAXLI)].names[0];
    const pl=genPlayer(pick(['DEF','DEF','MID','MID','ATT','ATT','GK']),LEAGUES[S.li].lvl-.3+R(0,1.5),{age:RI(18,23)});pl.from=from;pl.job='mladi profesionalac';pl.pot=clamp(pl.pot+RI(0,2),1,20);const v=value(pl);
    pl.loan={from,fee:Math.max(10000,Math.round(v*.08/10000)*10000),buy:Math.round(v*1.15/10000)*10000};pl.wage=Math.round(wageFor(pl)*.6/100)*100;return pl;});}
function loansHTML(){if(phase()<2||S.chall==='local')return '';if(!S.loanInit){S.loanInit=1;if(!(S.loanMkt||[]).length)refreshLoans();}const L=S.loanMkt||[],cur=S.squad.filter(p=>p.loanIn).length;
  return `<section class="card"><div class="row between"><div class="grow"><span class="lbl">Pozajmice · ${cur}/3 u ekipi</span><h3>Igrači na pozajmicu</h3><div class="hint">Mladi igrači iz jačih klubova, do kraja sezone. Plaćaš malu nadoknadu i 60% plate. Svaki ima <b>opciju otkupa</b>: fiksnu cenu po kojoj ga možeš zadržati bilo kad do kraja sezone. Inače se leti vraća u svoj klub.</div></div></div>
  <div class="list">${L.map((p,i)=>`<div class="li"><span class="pos ${p.pos}">${POSL[p.pos]}</span><span class="grow"><b>${esc(p.name)}</b><br><span class="hint">${p.age} · ${esc(short(p.loan.from).replace(/ \(.*\)$/,''))} · otkup ${nr(p.loan.buy)} · ${nr(p.wage)}/ned.</span></span><span class="stars">${starStr(starsOf(p))}</span><span class="ovr">${Math.round(ovr(p))}</span><button class="btn sm pri" data-a="loanin" data-v="${i}" ${S.money<p.loan.fee||cur>=3||S.squad.length>=maxSquad()?'disabled':''}>${nr(p.loan.fee)}</button></div>`).join('')||'<div class="hint">Trenutno niko nije na raspolaganju.</div>'}</div></section>`;}
function refreshIntl(){if(phase()<(obg()==='povratnik'?1:2)||S.chall==='local'){S.intl=[];return;}const regs=iRegs(),n=phase()<=2?4:phase()<=4?5:6;
  S.intl=Array.from({length:n},(_,i)=>intlPlayer(['GK','DEF','DEF','MID','MID','ATT','ATT'][RI(0,6)],regs[i%regs.length]));}
function intlHTML(){if(phase()<(obg()==='povratnik'?1:2)||S.chall==='local')return '';if(!S.intlInit){S.intlInit=1;if(!(S.intl||[]).length)refreshIntl();}const L=S.intl||[],fl=forCnt(),lim=forLim();
  return `<section class="card"><div class="row between"><div class="grow"><span class="lbl">Međunarodno tržište · stranci ${fl}/${lim}</span><h3>Igrači iz inostranstva</h3><div class="hint">Otvoreno: ${iRegs().map(r=>IREG[r].n).join(', ')}. ${phase()<5?`Nove regije stižu sa višim rangom. `:''}Stranci van Balkana traže veće plate i treba im nekoliko nedelja da se naviknu. Lista se menja na 4 nedelje.</div></div></div>
  <div class="list">${L.map((p,i)=>`<div class="li"><span class="pos ${p.pos}">${POSL[p.pos]}</span><span class="grow"><b>${natTag(p)}${esc(p.name)}</b><br><span class="hint">${p.age} · ${esc(p.from.replace(/ \(.*\)$/,''))} · ${fmt(p.wage)}/ned.</span></span><span class="ovr">${Math.round(ovr(p))}</span><button class="btn sm pri" data-a="offer" data-v="intl:${i}">${nr(p.fee)}</button></div>`).join('')||'<div class="hint">Trenutno nema nikoga.</div>'}</div></section>`;}
function refreshFA(){
  refreshIntl();refreshLoans();
  const lvl=LEAGUES[S.li].lvl;
  S.fa=(phaseOf(S.li)<=1?['GK','DEF','DEF','MID','MID','ATT','ATT']:['GK','DEF','MID','ATT','DEF','MID']).sort(()=>Math.random()-.5).slice(0,phaseOf(S.li)<=1?6:4).map(pos=>{const p=genPlayer(pos,lvl-2.2+R(-1,.7));p.fee=Math.round((obg()==='igrac'?.8:1)*ovr(p)*ovr(p)*1600*(1+.5*S.li)*(has('pregovarac')?.85:1)/1000)*1000;return p;});
}
function seasonSummary(){
  const order=rank(),pos=order.indexOf(0)+1;
  S.sum={pos,up:pos<=2&&S.li<MAXLI,gate:gateMet(S.li),down:S.li>=1&&pos>=(wev('reforma')?6:7),top:order.slice(0,3).map(i=>S.teams[i].name),pts:S.table[0].pts,hist:S.posHist.slice()};
  const ts=S.squad.slice().sort((a,b)=>(b.sg||0)-(a.sg||0))[0],pl=S.squad.filter(p=>(p.rcnt||0)>=6).sort((a,b)=>b.rsum/b.rcnt-a.rsum/a.rcnt)[0]||S.squad.filter(p=>(p.sa||0)>=6).sort((a,b)=>(ovr(b)+(b.sg||0)*.15)-(ovr(a)+(a.sg||0)*.15))[0];
  S.sum.tos=teamOfSeason().map(p=>({n:p.name,pos:p.pos,a:p.rsum/p.rcnt}));if(ts&&ts.sg)recNote('scorer',{n:ts.name,g:ts.sg,s:S.season},x=>ts.sg>x.g);
  S.sum.awards={top:ts&&ts.sg?[ts.name,ts.sg]:null,pots:pl?pl.name+((pl.rcnt||0)>=6?` · ${fmt1(pl.rsum/pl.rcnt)}`:''):null};
  const ss=S.sstat||{};if(ss.l===0)unlock('unbeaten');if(ss.hg>=7&&ss.hw===ss.hg)unlock('fortress');
}
function nextSeason(){
  if(obg()==='povratnik'&&!S.weekly){S.goodwill=clamp(S.goodwill-3,0,100);}
  {const back=S.squad.filter(p=>p.loanIn);back.forEach(p=>news(`${p.name} se vraća u ${short(p.loanIn.from)}. Opcija otkupa (${fmt(p.loanIn.buy)}) nije iskorišćena.`));S.squad=S.squad.filter(p=>!p.loanIn);}
  {const gone=S.squad.filter(p=>p.listed&&(p.lw||0)>=8&&S.squad.length>14);gone.forEach(p=>{const fee=Math.max(10000,Math.round(value(p)*.6/10000)*10000);const cl=Object.values(world()).filter(c=>c.li===Math.max(0,S.li-1)).map(c=>c.name);sellPlayer(p,fee,cl.length?pick(cl):'FK Sloga Lipovac');});if(gone.length)news(`Letnji prelazni rok: sa liste su otišli ${gone.map(p=>p.name).join(', ')}.`);}
  const sm=S.sum,prev=S.li;
  worldSeasonEnd(sm);
  if(S.flags.vow){delete S.flags.vow;if(sm.up&&sm.gate){S.fan=clamp(S.fan+5,0,100);addUgled(4);news('Obećao si plasman i održao reč. Ceo okrug priča o tome.');}else{S.fan=clamp(S.fan-10,0,100);addUgled(-5);news('„Plasman ili ništa”, rekao si. Bilo je ništa. Novine nisu zaboravile.');}}
  S.hist.push({season:S.season,league:LEAGUES[prev].name,pos:sm.pos,top:sm.awards&&sm.awards.top?sm.awards.top[0]+' ('+sm.awards.top[1]+')':''});
  if(prev===6){S.stats.top=(S.stats.top||0)+1;if(sm.pos===1){S.stats.titles=(S.stats.titles||0)+1;S.trophies.push(`Prvaci Superlige, ${S.season}. sezona`);S.fan=100;addUgled(40);news(`PRVACI SRBIJE! ${S.club.name} osvaja Superligu.`);}}
  const euroC=prev===6&&!sm.down?(sm.pos===1?'ucl':sm.pos===2?'uel':sm.pos===3?'uecl':null):null;
  if(S.pred&&S.pred.s===S.season){const d=S.pred.pos-sm.pos;if(d>=3){addUgled(6);S.fan=clamp(S.fan+4,0,100);news(`Iznenađenje sezone! Novine su vas videle na ${S.pred.pos}. mestu, a završili ste na ${sm.pos}.`);}else if(d<=-3){addUgled(-4);S.fan=clamp(S.fan-4,0,100);news(`Razočaranje: prognoza je bila ${S.pred.pos}. mesto, a završili ste na ${sm.pos}. Novine ne praštaju.`);}}
  if(S.goal&&S.goal.season===S.season){const g=GOALS[S.goal.k],ok=sm.pos<=g.pos;addUgled(ok?g.ok:-g.bad);S.fan=clamp(S.fan+(ok?4:-6),0,100);news(ok?`Cilj sezone ispunjen: ${g.n}. Novine su bar jednom blage.`:`Cilj sezone promašen: ${g.n}. Okružni glas oštri pera.`);}
  if(S.investor&&S.investor.deadline<=S.season){const iv=S.investor;if(sm.up&&sm.gate){news(`${iv.name} je dobio svoj plasman. Ostaje kao tihi partner.`);iv.deadline=99;}else{const take=Math.max(0,Math.round(Math.min(S.money*.3,iv.cash*.5)/10000)*10000);S.money-=take;S.fan=clamp(S.fan+4,0,100);news(`${iv.name} se povlači i odnosi ${fmt(take)}. Navijačima neće nedostajati.`);S.investor=null;}}
  S.sellons=S.sellons.filter(so=>{if(Math.random()<.35){const pay=Math.round(so.base*R(1.5,4)*so.pct/10000)*10000;S.money+=pay;news(`Procenat od sledeće prodaje: ${so.name} napušta ${short(so.to)}. Dobijaš ${fmt(pay)}.`);return false;}return S.season-so.season<4;});
  if(sm.pos===1){const cp=300000*(1+prev);S.money+=cp;news(`Prvaci lige (${LEAGUES[prev].name})! Nagrada: ${fmt(cp)}.`);}
  if(sm.up&&sm.gate){unlock('up1');S.li++;S.maxLi=Math.max(S.maxLi||0,S.li);const pz=250000*(1+prev);S.money+=pz;led('prize',pz);addUgled(15);S.fan=clamp(S.fan+10,0,100);news(`Plasman u viši rang: ${LEAGUES[S.li].name}! Slavlje u selu trajalo je do utorka.`);}
  else if(sm.up){news(`Završili ste na ${sm.pos}${ordSuf(sm.pos)} mestu, ali licenca nije prošla. ${S.club.name} ostaje u istom rangu.`);S.fan=clamp(S.fan-6,0,100);}
  else if(sm.down){S.li--;S.fan=clamp(S.fan-10,0,100);news(`Ispadanje u niži rang: ${LEAGUES[S.li].name}.`);}
  const gone=[];
  S.squad.forEach(p=>{
    p.age++;
    if(p.age>=31&&Math.random()<.6){const k=pick(STATS)[0];p[k]=Math.max(1,p[k]-1);}
    if(p.age<=23&&ovr(p)<p.pot&&Math.random()<.6){const k=pick(STATS)[0];p[k]=Math.min(20,p[k]+1);}
    p.inj=0;p.rest=false;p.wedding=false;p.cond=100;
  });
  if(phaseOf(prev)>=2)S.squad.forEach(p=>{if(p.ce!=null&&p.ce<=S.season&&!p.leaving){p.leaving=true;p.freeAgent=1;}});
  const left=S.squad.filter(p=>p.leaving).map(p=>p.name);S.squad.filter(p=>p.leaving).forEach(alumniAdd);S.squad=S.squad.filter(p=>!p.leaving);if(left.length)news(`Ovog leta klub su napustili: ${left.join(', ')}.`);
  S.squad=S.squad.filter(p=>{if(p.age>=35){gone.push(p.name);alumniAdd(p);return false;}return true;});
  if(gone.length)news(`Kopačke o klin: ${gone.join(', ')}. Doživotna besplatna rakija u kafani.`);
  S.season++;
  S.squad.forEach(p=>p.wage=wageFor(p));
  if(S.coach&&S.li!==prev)S.coach.wage=Math.round(S.coach.wage*(S.li>prev?1.15:.9)/500)*500;
  const ac=S.b.academy;
  const kids=(S.goodwill>=40?1:0)+(S.flags.kids?1:0)+(ac>=1?1:0)+(ac>=2?1:0)+(ac>=3?1:0);
  (S.onLoan||[]).forEach(({p,to})=>{p.age++;let g=0;for(let k=0;k<4;k++){const s=pick(STATS)[0];if(ovr(p)<p.pot&&p[s]<20){p[s]++;g++;}}p.cond=100;p.inj=0;p.morale=Math.min(5,p.morale+1);S.squad.push(p);news(`${p.name} se vraća sa pozajmice iz kluba ${short(to)}${g?`, napredovao je (+${g})`:''}.`);});S.onLoan=[];
  const kidsN=Math.max(2,kids+LV('deca')+(has('akademija')?1:0)+(REG().youth>=2?1:0));S.intake=[];
  for(let i=0;i<kidsN;i++){const p=genPlayer(pick(['GK','DEF','MID','ATT']),LEAGUES[S.li].lvl-3.6,{age:RI(16,17),job:'dete iz akademije'});p.pot=clamp(p.pot+RI(1,4)+LV('tal')+Math.floor(stR('youth')/2)+REG().youth+(has('akademija')?1:0)+(ac>=3?6:ac>=2?4:ac>=1?2:0)-(i>=kids+1?3:0),1,20);p.wage=Math.round(p.wage*.5/100)*100;S.intake.push(p);}
  if(S.flags.prodigy){const p=genPlayer(pick(['MID','ATT']),LEAGUES[S.li].lvl-2.6,{age:16,job:'dete iz akademije',pot:RI(17,20)});p.wage=Math.round(p.wage*.5/100)*100;p.prodigy=1;S.intake.push(p);delete S.flags.prodigy;}
  {const t=S.intake.slice().sort((a,b)=>b.pot-a.pot)[0];if(t){t.hype=1;if(t.pot>=15)news(`Dan omladinske škole: ceo kraj priča o klincu ${t.name} (${t.age}).`);}}
  S.flags.promise=false;
  S.staffC={};exTick();natTourney();setupSeason();worldEvent();(S.backOffer||[]).splice(0).forEach(n=>S.mq.push({type:'backoffer',n}));worldNews();refreshFA();S.coaches=[];drawEvents();S.sum=null;
  if(phaseOf(S.li)>phaseOf(prev))S.mq.push({type:'phase',n:phaseOf(S.li)});
  if(phase()>=3){if(!S.ultras)S.mq.push({type:'ultras'});S.mq.push({type:'goal'});}
  if(S.intake&&S.intake.length)S.mq.push({type:'intake'});
  S.pre={camp:'home',fr:'none'};S.mq.push({type:'preseason'});
  S.euro=euroC?{c:euroC,stage:'q',r:0,leg:1,agg:[0,0],opp:null,home:true,used:[]}:null;
  if(euroC){S.stats.euroBest=Math.max(S.stats.euroBest||0,1);news(`Evropa! ${S.club.name} igra kvalifikacije, takmičenje: ${EURO[euroC].n}.`);}
  checkEpilogue();checkAch();hofSave();
}
const ordSuf=n=>'.';

