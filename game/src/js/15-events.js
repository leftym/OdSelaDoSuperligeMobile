/* ---------- events ---------- */
const bestP=s=>s.squad.slice().sort((a,b)=>ovr(b)-ovr(a))[0];
const avgO=s=>s.squad.reduce((t,p)=>t+ovr(p),0)/s.squad.length;
const isRivalNext=s=>s.week<14&&s.teams[nextFixture().opp].rival;
function lastLosses(s){let n=0;for(let w=s.week-1;w>=0;w--){const r=s.results[w]&&s.results[w].find(x=>x[0]===0||x[1]===0);if(!r)break;const gf=r[0]===0?r[2]:r[3],ga=r[0]===0?r[3]:r[2];if(gf<ga)n++;else break;}return n;}
function abroadInfo(s){const av=avgO(s),c=s.squad.filter(p=>!p.inj&&!p.loanIn&&p.age<=24&&ovr(p)>=av).sort((a,b)=>((b.listed?1:0)-(a.listed?1:0))||value(b)-value(a)),p=c[0];if(!p)return null;const buyer=ABROAD[(p.id*5+s.week)%ABROAD.length],fee=Math.round(value(p)*1.7*(1+((p.id*3+s.week)%4)*.08)*(1+(s.owner.st.biz-5)*.02)*(has('agent')?1.25:1)/10000)*10000;return{p,buyer,fee};}
const P3=s=>phaseOf(s.li)>=3;
const P4=s=>phaseOf(s.li)>=4;
const contractP=s=>s.squad.filter(p=>!p.leaving&&p.signed!==s.season&&p.age<=31&&!p.forced).sort((a,b)=>ovr(b)-ovr(a))[0];
const P5=s=>phaseOf(s.li)>=5;
const bigFee=p=>Math.round(value(p)*2.5*(has('agent')?1.25:1)/100000)*100000;
const youngStar=s=>s.squad.filter(p=>p.age<=18).sort((a,b)=>b.pot-a.pot)[0];
const P2=s=>phaseOf(s.li)>=2;
const genTmp=s=>({att:10,def:10,tec:10,fit:10,men:10,pos:'MID',age:19,pot:15,...{att:Math.round(avgO(s)+1),tec:Math.round(avgO(s)+1),fit:Math.round(avgO(s)),def:Math.round(avgO(s)),men:Math.round(avgO(s))}});
function bidTarget(s){const c=s.squad.filter(p=>!p.inj&&!p.loanIn&&(p.age<=29||p.listed)).sort((a,b)=>((b.listed?1:0)-(a.listed?1:0))||value(b)-value(a));return c[0];}
function bidInfo(s){const p=bidTarget(s);if(!p)return null;const wn=Object.values(world()).filter(c=>c.li===Math.min(s.li+1,MAXLI)&&!s.teams.some(t=>t.name===c.name)).map(c=>c.name),names=wn.length?wn:LEAGUES[Math.min(s.li+1,MAXLI)].names,buyer=names[(p.id*3+s.week)%names.length];const fee=Math.round(value(p)*(.9+((p.id*7+s.week)%5)*.06)*(1+(s.owner.st.biz-5)*.02)/10000)*10000;return{p,buyer,fee};}
// A listed player can be dumped at once: a club from the league above pays ~75% of his value.
let tapSell=null;
function quickSale(p){const lv=Math.min(S.li+1,MAXLI),cl=Object.values(world()).filter(c=>c.li===lv&&!S.teams.some(t=>t.name===c.name)).map(c=>c.name),names=cl.length?cl:LEAGUES[lv].names,buyer=names[(p.id*7+S.season)%names.length];
  return {fee:Math.max(10000,Math.round(value(p)*.75*(1+(S.owner.st.biz-5)*.02)/10000)*10000),buyer};}
function sellPlayer(p,fee,buyer,so){
  if(wev('kriza'))fee=Math.round(fee*.85/10000)*10000;
  if(LV('prod'))fee=Math.round(fee*(1+.05*LV('prod'))/10000)*10000;
  alumniAdd(p);recNote('sale',{n:p.name,fee,s:S.season},x=>fee>x.fee);
  if(S.world&&S.world[buyer])S.world[buyer].ex.push({n:p.name,pos:p.pos});
  (S.soldList=S.soldList||[]).push({name:p.name,age:p.age,apps:p.apps||0,goals:p.goals||0,o:ovr(p),to:buyer});S.soldList=S.soldList.slice(-12);
  (S.exP=S.exP||[]).push({n:p.name,pos:p.pos,age:p.age,o:Math.round(ovr(p)*10)/10,pot:p.pot,club:buyer,caps:p.caps||0,st:'aktivan',hist:[`${S.season}. sez: prodat klubu ${short(buyer)}`],fee:fee,home:isLocal(p)});S.exP=S.exP.slice(-30);
  if(has('pregovarac'))fee=Math.round(fee*1.1/10000)*10000;if(fee>=50000000)unlock('sale');S.squad=S.squad.filter(x=>x.id!==p.id);S.money+=fee;led('sales',fee);
  const top=bestP(S)&&ovr(p)>=(bestP(S)?ovr(bestP(S)):0);const hit=(p.trait==='ljub'?8:3)+(top?4:0);S.fan=clamp(S.fan-hit,0,100);if(/\(/.test(buyer))S.stats.abroad=(S.stats.abroad||0)+1;if(so)S.sellons.push({name:p.name,to:buyer,pct:so,base:fee,season:S.season});if(S.ultras)S.ultras.mood=clamp(S.ultras.mood-(p.trait==='ljub'?15:6),0,100);
  const ag=phase()>=2?Math.round(fee*.1/10000)*10000:0;if(ag){S.money-=ag;led('sales',-ag);}
  news(`${p.name} prodat klubu ${short(buyer)} za ${fmt(fee)}.`);return `${p.name} odlazi u ${short(buyer)}. ${fmt(fee-ag)} u banci${ag?` (provizija menadžera ${fmt(ag)})`:''}. Navijači ${hit>=8?'su besni':'gunđaju'}.`;
}
const EVENTS=[
 {id:'clique',cd:2,w:2,when:s=>s.week>=3&&cliques(s).sig.length>=4&&cliques(s).loc.length>=5&&harmony()<62,title:'Domaći i pojačanja',
  text:s=>`Seoski momci sede za jednim stolom, pojačanja za drugim. ${esc(cliques(s).loc[0].name)} kaže da došljaci dobijaju više para za manje rada.`,
  ch:s=>[{l:`Zajednička večera Kod Mileta (${nr(30000*(1+s.li))})`,d:{money:-30000*(1+s.li),fn:s=>{s.harmony=clamp(harmony()+12,0,100);return 'Rakija, ćevapi i tamburaši. Do ponoći svi zajedno pevaju.';}}},
   {l:'Povećaj platu domaćima za 10%',d:{fn:s=>{cliques(s).loc.forEach(p=>{p.wage=Math.round(p.wage*1.1/100)*100;p.morale=Math.min(5,p.morale+1);});s.harmony=clamp(harmony()+8,0,100);return 'Seoski momci se osećaju cenjeno. Platni spisak raste.';}}},
   {l:'Profesionalci su. Neka se dogovore.',d:{fn:s=>{s.harmony=clamp(harmony()-6,0,100);return 'Niko se ništa ne dogovara.';}}}]},
 {id:'oldguard',cd:2,when:s=>s.week>=4&&cliques(s).vet.length>=3&&cliques(s).kid.length>=3&&harmony()<65,title:'Stara garda',
  text:s=>{const v=cliques(s).vet.sort((a,b)=>b.age-a.age)[0];return `${esc(v.name)} (${v.age}) govori u ime veterana: „Mi smo napravili ovaj klub. Sad klinci igraju, a mi gledamo.”`;},
  ch:s=>{const v=cliques(s).vet.sort((a,b)=>b.age-a.age)[0];return[{l:'Obećaj im više minuta',d:{fn:s=>{cliques(s).vet.forEach(p=>p.morale=Math.min(5,p.morale+1));s.harmony=clamp(harmony()+5,0,100);return 'Veterani klimaju glavom. Sad moraš da održiš obećanje.';}}},
   {l:'Budućnost je sada',d:{fn:s=>{cliques(s).vet.forEach(p=>p.morale=Math.max(1,p.morale-1));cliques(s).kid.forEach(p=>p.morale=Math.min(5,p.morale+1));s.harmony=clamp(harmony()-3,0,100);return 'Klinci lete. Stari se duri u ćošku.';}}},
   {l:`Postavi ${esc(v.name.split(' ')[0])} za zamenika kapitena`,d:{fn:s=>{v.morale=5;v.pers='vodja';s.harmony=clamp(harmony()+6,0,100);return `${v.name} ozbiljno shvata traku. Sada je vođa.`;}}}];}},
 {id:'buntevt',cd:1,w:2,when:s=>s.week>=2&&s.squad.some(p=>persOf(p).k==='bunt'),title:'Opet problemi',
  text:s=>{const p=s.squad.find(p=>persOf(p).k==='bunt');return `${esc(p.name)} ${pick(['je došao na trening sa mirisom rakije','je treneru u lice rekao da ništa ne zna','je objavio snimak iz diskoteke u 4 ujutru pred utakmicu'])}.`;},
  ch:s=>{const p=s.squad.find(p=>persOf(p).k==='bunt');return[{l:'Kazni ga nedeljnom platom',d:{fn:s=>{s.money+=p.wage;led('other',p.wage);p.morale=Math.max(1,p.morale-2);s.harmony=clamp(harmony()+5,0,100);return 'Plaća, i besan je. Ostali poštuju granicu koju si povukao.';}}},
   {l:'Izbaci ga za sledeću utakmicu',d:{fn:s=>{p.rest=true;s.harmony=clamp(harmony()+3,0,100);return `${p.name} sledeću utakmicu gleda sa tribine.`;}}},
   {l:'Pusti. Daje golove.',d:{fn:s=>{p.morale=Math.min(5,p.morale+1);s.harmony=clamp(harmony()-6,0,100);return 'On je srećan. Ostali u ekipi primećuju dvostruke aršine.';}}}];}},
 {id:'captainword',cd:3,when:s=>s.squad.some(p=>persOf(p).k==='vodja')&&harmony()<50,title:'Kapitenova reč',
  text:s=>`${esc(s.squad.find(p=>persOf(p).k==='vodja').name)} kuca na vrata. „Momci su pali, gazda. Premija za pobedu narednih mesec dana bi sve promenila.”`,
  ch:s=>[{l:`Isplati premiju (${nr(40000*(1+s.li))})`,d:{money:-40000*(1+s.li),morale:1,fn:s=>{s.harmony=clamp(harmony()+15,0,100);return 'Kapiten javlja momcima. Klicanje se čuje do parkinga.';}}},
   {l:'Nema para. Neka se bore za dres.',d:{fn:s=>{s.harmony=clamp(harmony()-3,0,100);return 'Kapiten slegne ramenima i vraća se u svlačionicu.';}}}]},
 {id:'butcher',force:1,once:1,when:s=>s.season===1&&s.week===0&&s.li===0,title:'Mesara Rade',
  text:s=>`Mesar Rade te zaustavlja ispred radnje. „Stavi Mesaru Rade na dresove. 10.000 dinara nedeljno. I momci ćevape kupuju kod mene.”`,
  ch:s=>[{l:'Rukovanje, dogovoreno',d:{sponsor:['Mesara Rade',10000]}},
   {l:'Traži 15.000',chk:['biz',9],d:{sponsor:['Mesara Rade',15000]},f:{sponsor:['Mesara Rade',7000]},ok:'Rade uzdahne, obriše ruke i pristaje na 15k nedeljno.',no:'Rade se uvredio. Sedam hiljada, uzmi ili ostavi. Uzimaš.'},
   {l:'Bez reklama na našim dresovima',d:{fan:3,goodwill:2}}]},
 {id:'harvest',cd:2,when:s=>s.week>=1&&s.week<=5,title:'Žetva',
  text:s=>`Vreme je žetve. Četiri igrača kažu da ove nedelje ne mogu na trening. Kukuruz se neće sam obrati.`,
  ch:s=>[{l:'Pusti ih',d:{goodwill:4,fn:s=>{shuffle(s.squad).slice(0,4).forEach(p=>p.fit=Math.max(1,p.fit-1));return 'Četiri igrača gube malo kondicije. Njihove porodice su zahvalne.';}}},
   {l:'Plati svakom po 5.000 da treniraju',d:{money:-20000}},
   {l:'Sam pomozi u žetvi',d:{goodwill:9,ugled:2,rel:{pop:3},tag:'Propuštaš dan u klubu'}}]},
 {id:'mower',cd:3,when:s=>s.b.pitch===1&&s.week>=2,title:'Crkla kosilica',
  text:s=>`Klupska kosilica se zakašljala, zadimila i crkla. Trava je već do članaka.`,
  ch:s=>[{l:'Kupi novu kosilicu',d:{money:-45000}},
   {l:'Pozajmi od komšije',d:{goodwill:-1,fn:s=>{s.flags.cow=1;return 'Radi, nekako. Teren je ove nedelje šaren.';},tag:'Šaren teren ove nedelje'}},
   {l:'Pusti ovce da popasu',d:{fan:2,fn:()=> 'Ovce su odradile pristojan posao. Jedna je gledala celo drugo poluvreme.'}}]},
 {id:'kafana',once:1,when:s=>s.week>=2&&s.li<2,title:'Kafana Kod Mileta',
  text:s=>`Mile iz kafane Kod Mileta nudi 8.000 nedeljno za reklamu na ogradi. Kvaka: ekipa posle svake utakmice pije kod njega.`,
  ch:s=>[{l:'Dogovoreno',d:{sponsor:['Kafana Kod Mileta',8000],rel:{kafana:20},flag:{kafana:1},tag:'Igrači kasno ležu'}},
   {l:'Reklama da, pijanka ne',chk:['sarm',10],d:{sponsor:['Kafana Kod Mileta',8000],rel:{kafana:5}},f:{rel:{kafana:-8}},ok:'Mile se smeje i pristaje. Reklama ide na ogradu, a igrači kući na spavanje.',no:'Mile odlazi gunđajući. Nema dogovora.'},
   {l:'Hvala, ne',d:{rel:{kafana:-10}}}]},
 {id:'slava',when:s=>s.week>=3&&s.week<=9,title:'Seoska slava',
  text:s=>`Seoska slava u selu ${esc(s.club.village)}. Svi kuvaju, a ljudi pitaju šta će klub da uradi.`,
  ch:s=>{const m=P2(s)?2:1;return[{l:'Napravi gozbu na stadionu',d:{money:-120000*m,fan:6,goodwill:12,rel:{pop:15}}},
   {l:'Pošalji pogaču i flašu',d:{money:-20000*m,goodwill:4,rel:{pop:5}}},
   {l:'Preskoči ove godine',d:{goodwill:-6,rel:{pop:-10}}}];}},
 {id:'snow',when:s=>s.week>=7&&s.week<=9&&s.b.pitch<2,title:'Sneg na dan utakmice',
  text:s=>`Preko noći je napadalo dvadeset centimetara snega. Linija nema, a nema ni bele tačke.`,
  ch:s=>[{l:'Pozovi volontere sa lopatama',d:{fn:s=>{if(s.goodwill>=40){s.goodwill=clamp(s.goodwill+2,0,100);return 'Pola sela dolazi sa lopatama i rakijom. Teren je očišćen.';}s.flags.snow=1;return 'Došla su samo trojica. Igrate na snegu.';},tag:'Uspeva ako te selo voli'}},
   {l:'Plati traktor da očisti',d:{money:-40000}},
   {l:'Igrajte na snegu',d:{flag:{snow:1},tag:'Haos: slabiji tim ima šansu'}}]},
 {id:'kid',cd:2,when:s=>s.week>=2&&s.squad.length<maxSquad(),title:'Klinac na kapiji',
  text:s=>`Mršavi šesnaestogodišnjak se pojavio na treningu u pozajmljenim kopačkama. Hoće probu.`,
  ch:s=>[{l:'Potpiši ga',d:{money:-15000,fn:s=>{const p=genPlayer(pick(['DEF','MID','ATT']),LEAGUES[s.li].lvl-4,{age:16,job:'đak',pot:RI(7,17)+(s.li>=2?2:0)});p.wage=Math.round(p.wage*.5/100)*100;s.squad.push(p);return `${p.name} je u ekipi. Potencijal: ${starStr(starsOf(p))}.`;}}},
   {l:'Pošalji ga kući',d:{fn:s=>`Odlazi. Priča se da je otišao na probu u ${rivalShort(s)}.`}}]},
 {id:'mayor',cd:2,when:s=>s.week>=3,title:'Slikanje sa predsednikom opštine',
  text:s=>`Predsednik opštine hoće sliku sa ekipom pred lokalne izbore. Nagoveštava subvenciju.`,
  ch:s=>[{l:'Osmeh za kameru',d:{money:150000*(P2(s)?3:1),rel:{mayor:15},goodwill:-4,tag:'Pola sela je glasalo za drugog'}},
   {l:'Ljubazno odbij',d:{rel:{mayor:-8},goodwill:3}},
   {l:'Umesto toga traži put do stadiona',chk:['veze',9],d:{rel:{mayor:5},goodwill:10,ugled:3},f:{rel:{mayor:-5}},ok:'Pristaje. Asfalt stiže za dve nedelje. Selo te obožava.',no:'Nasmeje se i promeni temu.'}]},
 {id:'payrise',cd:2,w:2,when:s=>s.week>=4&&!s.flags.promise&&(bestP(s)?ovr(bestP(s)):0)>=avgO(s)+1.5,title:'Povišica, molim',
  text:s=>`${esc(bestP(s).name)}, tvoj najbolji igrač, traži duplu platu. Zvali su ga iz kluba ${esc(rivalShort(s))}.`,
  ch:s=>{const p=bestP(s);return[{l:`Dupliraj (+${fmt(p.wage)}/ned.)`,d:{fn:s=>{p.wage*=2;p.morale=5;return `${p.name} je oduševljen.`;}}},
   {l:'Odbij',d:{fn:s=>{p.morale=Math.max(1,p.morale-2);if(Math.random()<.3){s.squad=s.squad.filter(x=>x.id!==p.id);s.rel.rival=clamp(s.rel.rival-10,-100,100);return `${p.name} odlazi i potpisuje za ${rivalShort(s)}. Navijači su besni.`;}return `${p.name} se duri, ali ostaje.`;},tag:'Možda ode'}},
   {l:'Obećaj više sledeće sezone',d:{fn:s=>{p.morale=Math.min(5,p.morale+1);s.flags.promise=1;return 'Rukuje se sa tobom. Zapamtiće to obećanje.';}}}];}},
 {id:'cow',cd:2,when:s=>s.b.pitch===0,title:'Krava na terenu',
  text:s=>`Krava čika Dragoljuba opet je probila ogradu. Stoji na beloj tački.`,
  ch:s=>[{l:'Plati pravu ogradu',d:{money:-60000,goodwill:2}},
   {l:'Sam je oteraj',d:{fan:4,ugled:2,tag:'Neko je to snimio'}},
   {l:'Ostavi je',d:{flag:{cow:1},tag:'Rizik od povreda ove nedelje'}}]},
 {id:'rival',w:4,when:s=>isRivalNext(s),title:'Nedelja derbija',
  text:s=>`Gazda kluba ${esc(rivalShort(s))} priča po kafani da je tvoj klub „hobi za čoveka koji ima previše slobodnog vremena”. Derbi je ove nedelje.`,
  ch:s=>[{l:'Odgovori mu pred svima',chk:['sarm',10],d:{fan:6,morale:1},f:{fan:-3,rel:{rival:-10}},ok:'Kafana se ori od smeha. Igrači su do ručka čuli za to.',no:'Zapleo si se u rečima. Ljudi se smeju, ali ne sa tobom.'},
   {l:'Ostani dostojanstven',d:{ugled:3,rel:{rival:5}}},
   {l:'Opkladi se u 100.000 na rezultat',d:{flag:{bet:1},tag:'Pobedi ili plati'}}]},
 {id:'wedding',cd:3,when:s=>s.week>=1,title:'Svadba',
  text:s=>`Tri tvoja igrača su pozvana na svadbu kod rođaka. Baš na dan utakmice. A srpska svadba traje dva dana.`,
  ch:s=>[{l:'Pusti ih',d:{goodwill:3,fn:s=>{const ps=shuffle(s.squad.filter(p=>!p.inj)).slice(0,3);ps.forEach(p=>{p.wedding=true;p.morale=Math.min(5,p.morale+1);});return `${ps.map(p=>p.name.split(' ')[0]).join(', ')} propuštaju utakmicu.`;}}},
   {l:'Plati svakom po 10.000 da igraju',d:{money:-30000*(P2(s)?2:1)}},
   {l:'Zamoli mladoženju da počne posle utakmice',chk:['sarm',11],d:{goodwill:4},f:{fn:s=>{const ps=shuffle(s.squad.filter(p=>!p.inj)).slice(0,3);ps.forEach(p=>p.wedding=true);return `Mladoženja odbija. ${ps.map(p=>p.name.split(' ')[0]).join(', ')} idu na svadbu.`;}},ok:'Mladoženja pristaje. Cela svadba dolazi na utakmicu.',no:''}]},
 {id:'rakija',cd:3,when:s=>s.week>=1,title:'Poklon od navijača',
  text:s=>`Jedan navijač ostavio je flašu domaće šljivovice u svlačionici. „Za momke, za sreću.”`,
  ch:s=>[{l:'Podeli je',d:{morale:1,fan:2}},{l:'Sačuvaj je za slavu',d:{rel:{pop:4}}},{l:'Prospi je',d:{fan:-4,morale:-1}}]},
 {id:'nets',cd:3,when:s=>s.week>=2&&s.li<2,title:'Rupe u mrežama',
  text:s=>`Mreže na golovima su pune rupa. Sudija kaže da ovako neće započeti sledeću utakmicu.`,
  ch:s=>[{l:'Kupi nove mreže',d:{money:-15000}},{l:'Stavi ribarske mreže',d:{ugled:-1,fan:1,tag:'Izgleda smešno'}}]},
 {id:'school',once:1,when:s=>s.week>=3&&s.goodwill>=20,title:'Seoska škola',
  text:s=>`Učiteljica pita može li klub subotom da drži trening za decu.`,
  ch:s=>[{l:'Sam ih treniraj',d:{goodwill:10,flag:{kids:1},tag:'Više seoske dece svakog leta'}},{l:'Pokloni lopte i markere',d:{money:-25000,goodwill:5}},{l:'Nemam vremena',d:{goodwill:-5}}]},
 {id:'agent',cd:2,when:s=>s.chall!=='local'&&s.lvl>=2&&s.week>=2&&s.squad.length<maxSquad(),title:'Zove menadžer Žika',
  text:s=>`Menadžer Žika ima igrača iz kluba koji je propao. „Dobar dečko. Možda voli da popije. ${fmt(150000*(1+s.li))} i tvoj je.”`,
  ch:s=>[{l:`Potpiši ga za ${nr(150000*(1+s.li))}`,d:{money:-150000*(1+s.li),fn:s=>{const p=genPlayer(pick(['MID','ATT','DEF']),avgO(s)+.4,{age:RI(24,29)});s.squad.push(p);return `${p.name} (${POSL[p.pos]}, ocena ${Math.round(ovr(p))}) stiže pozajmljenim Golfom.`;}}},
   {l:'Ne zanima me',d:{}}]},
 {id:'tv',cd:3,when:s=>s.week>=2&&(s.lvl>=2||s.fan>=60),title:'Regionalna televizija',
  text:s=>`Regionalna televizija hoće priču o klubu sa velikim planovima.`,
  ch:s=>[{l:'Daj intervju',chk:['sarm',9],d:{fan:5,ugled:4},f:{fan:-2,ugled:-1},ok:'Ostavio si dobar utisak. Ljudi te zaustavljaju u prodavnici.',no:'Ukočio si se pred kamerom. Snimak je svuda.'},
   {l:'Pošalji kapitena',d:{ugled:2}},{l:'Odbij',d:{}}]},
 {id:'agro',once:1,when:s=>s.week>=5,title:'Poljoapoteka Zrno',
  text:s=>`Poljoapoteka Zrno nudi 6.000 nedeljno ako njihov baner stoji iza gola.`,
  ch:s=>[{l:'Prihvati',d:{sponsor:['Zrno agro',6000]}},{l:'Odbij',d:{}}]},
 /* ---- story arcs ---- */
 {id:'scandal1',once:1,when:s=>P2(s)&&s.rel.mayor>=15&&s.week>=3&&s.week<=10,title:'Rođak predsednika opštine',
  text:s=>`Novinarka Okružnog glasa ima dokumenta. Firma rođaka predsednika opštine sagradila je pola grada od subvencija, uključujući i tvoj stadion. Traži komentar.`,
  ch:s=>[{l:'Brani predsednika opštine',d:{rel:{mayor:10},flag:{arc_scandal:'defend',arc_scandal_due:ARC_DUE(5)},tag:'Ovo će se vratiti'}},
   {l:'Ogradi se',d:{rel:{mayor:-10},flag:{arc_scandal:'distance',arc_scandal_due:ARC_DUE(5)}}},
   {l:'Daj joj svoja dokumenta',d:{rel:{mayor:-25},ugled:2,flag:{arc_scandal:'leak',arc_scandal_due:ARC_DUE(5)},tag:'Veliki rizik'}}]},
 {id:'scandal2',once:1,force:1,when:s=>!!s.flags.arc_scandal&&nowW()>=s.flags.arc_scandal_due&&s.week<14,title:'Skandal je izbio',
  text:s=>({defend:'Priča je na naslovnoj strani. Svi pitaju da li si znao.',distance:'Priča je objavljena. Ljudi pamte da si se ogradio.',leak:'Tvoja dokumenta su na naslovnoj strani. Predsednik opštine je gotov, i zna ko je to uradio.'})[s.flags.arc_scandal],
  ch:s=>[{l:'Izdrži oluju',d:{fn:s=>{const a=s.flags.arc_scandal;delete s.flags.arc_scandal;
    if(a==='defend'){if(Math.random()<.5){s.rel.mayor=clamp(s.rel.mayor+15,-100,100);return 'Predsednik opštine preživljava i ne zaboravlja ko je stao uz njega.';}s.rel.mayor=-20;addUgled(-6);s.fan=clamp(s.fan-4,0,100);return 'Predsednik opštine pada. Novi te vidi kao deo stare ekipe.';}
    if(a==='leak'){s.rel.mayor=35;addUgled(6);const cut=200000*(1+s.li);s.money-=cut;led('other',-cut);return `Predsednik opštine podnosi ostavku. Novi ti duguje, ali stara mreža otkazuje posao sa klubom vredan ${fmt(cut)}.`;}
    s.rel.mayor=Math.random()<.5?0:clamp(s.rel.mayor,-100,100);return 'Oluja je prošla pored tebe.';}}}]},
 {id:'ruin1',once:1,when:s=>s.season>=2&&!!rivalTeam(s)&&s.week>=2&&s.week<=10,title:'Rivali su bankrotirali',
  text:s=>`${esc(rivalShort(s))} ne može da plati igrače. Njihov gazda je otišao u Austriju i ne javlja se na telefon.`,
  ch:s=>{const pr=Math.round(value(genTmp(s))*.4/10000)*10000;return[{l:`Kupi njihovog najboljeg mladog igrača (${nr(pr)})`,d:{money:-pr,fn:s=>{const p=genPlayer(pick(['MID','ATT']),avgO(s)+.6,{age:19});p.from=rivalShort(s);s.squad.push(p);s.rel.rival=clamp(s.rel.rival-15,-100,100);s.flags.arc_ruin='vulture';s.flags.arc_ruin_due=ARC_DUE(14);return `${p.name} (19, ocena ${Math.round(ovr(p))}) prelazi kod vas. Njihovi navijači će te mrzeti zbog toga.`;}}},
   {l:'Pomozi im da prežive',d:{money:-150000*(1+s.li),rel:{rival:30},goodwill:5,flag:{arc_ruin:'help',arc_ruin_due:ARC_DUE(14)}}},
   {l:'Pusti ih da potonu',d:{flag:{arc_ruin:'sink',arc_ruin_due:ARC_DUE(14)}}}];}},
 {id:'ruin2',once:1,force:1,when:s=>!!s.flags.arc_ruin&&nowW()>=s.flags.arc_ruin_due&&s.week<14,title:'Godinu dana kasnije, kod komšija',
  text:s=>({vulture:'Rivalski klub je preživeo, jedva. Njihov novi gazda se kune u osvetu.',help:'Rivalski gazda je ponovo na nogama i dolazi kod tebe sa flašom rakije.',sink:'Rivalski klub se ugasio. Njihovi navijači traže novi tim.'})[s.flags.arc_ruin],
  ch:s=>[{l:'Saslušaj ih',d:{fn:s=>{const a=s.flags.arc_ruin;delete s.flags.arc_ruin;
    if(a==='help'){const p=genPlayer(pick(['DEF','MID','ATT']),LEAGUES[s.li].lvl-3,{age:16,job:'dete iz akademije',pot:RI(15,19)});s.squad.push(p);s.rel.rival=clamp(s.rel.rival+10,-100,100);return `„Mi ne zaboravljamo.” Njihovo najbolje dete iz akademije, ${p.name}, dolazi kod vas besplatno.`;}
    if(a==='sink'){s.fan=clamp(s.fan+10,0,100);s.goodwill=clamp(s.goodwill-4,0,100);if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+5,0,100);return 'Stotine njihovih navijača sad dolaze na vaše utakmice. Susedno selo ti to nikad neće oprostiti.';}
    s.rel.rival=-60;const t=rivalTeam(s);if(t){t.r+=.8;t.atk*=1.06;t.def*=1.06;t.mid*=1.06;}return 'Potrošili su gomilu para da vas pobede. Derbi će biti rat.';}}}]},
 {id:'legendret',once:1,when:s=>P2(s)&&s.season>=3&&s.week>=2&&s.week<=9&&s.squad.length<maxSquad(),title:'Sin se vraća kući',
  text:s=>`Zoran „Zoka” Radić rođen je u selu ${esc(s.club.village)}, igrao je za reprezentaciju i proveo deset godina u Kini. Ima 34 godine i želi još jednu, poslednju sezonu kod kuće.`,
  ch:s=>[{l:'Potpiši ga na jednu sezonu',d:{fn:s=>{const p=genPlayer('ATT',LEAGUES[s.li].lvl+.8,{age:34,job:'legenda se vratila'});p.name='Zoran „Zoka” Radić';p.trait='ljub';p.leaving=true;p.wage=Math.round(wageFor(p)*1.5/500)*500;p.morale=5;s.squad.push(p);s.fan=clamp(s.fan+8,0,100);if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+10,0,100);return 'Celo selo dolazi na njegov prvi trening. Leto mu je poslednje u karijeri.';}}},
   {l:'Postavi ga za trenera omladinaca',d:{goodwill:6,flag:{kids:1},fn:s=>{s.squad.filter(p=>p.age<=19).forEach(p=>p.pot=Math.min(20,p.pot+1));return 'Deca treniraju sa pravim reprezentativcem. Njihov potencijal raste.';}}},
   {l:'Zahvali mu, ali ne',d:{fan:-3}}]},
 /* ---- Phase 2 ---- */
 {id:'listbid',w:1,cd:-1,force:true,when:s=>!!(s.lbid&&s.squad.find(p=>p.id===s.lbid.pid&&p.listed)),title:'Ponuda za igrača sa liste',
  text:s=>{const b=s.lbid,p=s.squad.find(x=>x.id===b.pid);return `${esc(short(b.buyer))} želi igrača ${esc(p.name)} (${POSL[p.pos]}, ${p.age} god., ocena ${Math.round(ovr(p))}), koji je na tvojoj transfer listi već ${p.lw} ${plu(p.lw,'nedelju','nedelje','nedelja')}. Nude ${fmt(b.fee)}.${p.lw>=6?' Što duže čeka, ponude su niže.':''}`;},
  ch:s=>{const b=s.lbid,p=s.squad.find(x=>x.id===b.pid);return[{l:`Prodaj za ${nr(b.fee)}`,d:{fn:s=>{s.lbid=null;return sellPlayer(p,b.fee,b.buyer);}}},{l:'Pregovaraj o ceni',d:{fn:s=>{s.lbid=null;return sellNegoStart(p,b.fee,b.buyer);},tag:'Cenkanje · Biznis podiže njihovu granicu'}},{l:'Sačekaj bolju ponudu',d:{fn:s=>{s.lbid=null;return `${p.name} ostaje na listi.`;}}},{l:'Skini ga sa liste',d:{fn:s=>{s.lbid=null;p.listed=false;p.lw=0;return `${p.name} ostaje u klubu.`;}}}];}},
 {id:'bid',w:3,when:s=>P2(s)&&s.week>=2&&s.week<=12&&s.squad.length>15&&!!bidTarget(s),title:'Ponuda za tvog igrača',
  text:s=>{const b=bidInfo(s);return `${esc(b.buyer)} želi igrača ${esc(b.p.name)} (${POSL[b.p.pos]}, ${b.p.age} god., ocena ${Math.round(ovr(b.p))}). Nude ${fmt(b.fee)}.${b.p.listed?' On je na tvojoj transfer listi.':''}`;},
  ch:s=>{const b=bidInfo(s);return[{l:`Prodaj za ${nr(b.fee)}`,d:{fn:s=>sellPlayer(b.p,b.fee,b.buyer)}},
   {l:'Pregovaraj o ceni',d:{fn:s=>sellNegoStart(b.p,b.fee,b.buyer),tag:'Cenkanje · Biznis podiže njihovu granicu'}},
   {l:'Nije na prodaju',d:{fan:b.p.listed?0:2,fn:s=>{if(b.p.listed){b.p.listed=false;}return `${b.p.name} ostaje.`;}}}];}},
 {id:'bank',cd:3,when:s=>P2(s)&&s.money<2000000&&!s.loans.length&&s.week>=1,title:'Direktor banke',
  text:s=>`Direktor banke u gradu nudi klubu kredit. „Za tribinu, reflektore, šta god vam treba, gazda.”`,
  ch:s=>[{l:'Uzmi 3M (60k nedeljno, 60 nedelja)',d:{fn:s=>{s.money+=3000000;led('loan',3000000);s.loans.push({w:60000,left:60,amt:3000000});return 'Pare su na računu. Otplata počinje sledeće nedelje.';},tag:'+3M sada, 3,6M vraćaš'}},
   {l:'Uzmi 1M (25k nedeljno, 50 nedelja)',d:{fn:s=>{s.money+=1000000;led('loan',1000000);s.loans.push({w:25000,left:50,amt:1000000});return 'Pare su na računu.';},tag:'+1M sada, 1,25M vraćaš'}},
   {l:'Bez dugova',d:{ugled:1}}]},
 {id:'pivara',once:1,when:s=>P2(s)&&s.week>=3,title:'Pivara Okrug',
  text:s=>`Okružna pivara hoće da uđe. Četrdeset hiljada nedeljno za ime na stadionu. Ili osamdeset hiljada za ime u nazivu kluba.`,
  ch:s=>[{l:'Nazovi stadion „Pivara Arena”',d:{sponsor:['Pivara Okrug',40000],goodwill:-2}},
   {l:`Preimenuj klub u „${esc(short(s.club.name))} Pivara”`,d:{sponsor:['Pivara Okrug',80000],fan:-12,goodwill:-10,tag:'Selo će to mrzeti'}},
   {l:'Bez piva na grbu',d:{fan:3,goodwill:3}}]},
 {id:'mlekara',once:1,when:s=>P2(s)&&s.week>=5,title:'Mlekara Bela Reka',
  text:s=>`Mlekara iz susedne doline nudi 25.000 nedeljno za rukave dresa.`,
  ch:s=>[{l:'Prihvati',d:{sponsor:['Mlekara Bela Reka',25000]}},
   {l:'Traži 35.000',chk:['biz',11],d:{sponsor:['Mlekara Bela Reka',35000]},f:{},ok:'Pristaju. I besplatan jogurt za igrače.',no:'Našli su drugi klub. Nema dogovora.'},
   {l:'Odbij',d:{}}]},
 {id:'inspector',cd:2,w:3,when:s=>s.queue.some(q=>BUILD[q.k].t[q.tier].pm&&q.permit===0),title:'Građevinski inspektor',
  text:s=>`Građevinski inspektor je našao „nepravilnosti” na gradilištu. Radovi bi mogli da stanu na nekoliko nedelja.`,
  ch:s=>[{l:'Angažuj inženjera da sredi papire',d:{money:-80000*(1+s.li)}},
   {l:'Pozovi predsednika opštine',chk:['veze',11],d:{rel:{mayor:-3}},f:{fn:s=>{s.queue.forEach(q=>{if(BUILD[q.k].t[q.tier].pm)q.left+=3;});return 'Predsednik opštine je „na odmoru”. Radovi stoje 3 nedelje.';}},ok:'Jedan telefonski poziv. Inspektor odjednom sve nalazi u redu.',no:''},
   {l:'Po propisima',d:{ugled:2,goodwill:2,fn:s=>{s.queue.forEach(q=>{if(BUILD[q.k].t[q.tier].pm)q.left+=3;});return 'Radovi stoje 3 nedelje dok papiri prođu.';},tag:'+3 nedelje'}}]},
 {id:'night',once:1,when:s=>s.b.flood>=1,title:'Prva noć pod reflektorima',
  text:s=>`Reflektori su upaljeni. Prva večernja utakmica je ove nedelje i ceo okrug hoće da dođe.`,
  ch:s=>[{l:'Napravi veliko veče: vatromet i orkestar',d:{money:-60000,fan:8,ugled:4,goodwill:3}},{l:'Samo igrajte fudbal',d:{fan:3}}]},
 {id:'election',cd:1,when:s=>P2(s)&&s.week>=5&&s.week<=9&&s.season%2===0,title:'Lokalni izbori',
  text:s=>`Izbori se bliže. I predsednik opštine i njegov protivkandidat žele podršku kluba.`,
  ch:s=>[{l:'Podrži predsednika opštine',d:{rel:{mayor:20},goodwill:-5}},
   {l:'Podrži protivkandidata',d:{fn:s=>{if(Math.random()<.45){s.rel.mayor=35;s.goodwill=clamp(s.goodwill+4,0,100);return 'Protivkandidat pobeđuje! Novi predsednik opštine pamti ko mu je pomogao.';}s.rel.mayor=clamp(s.rel.mayor-30,-100,100);return 'Predsednik opštine pobeđuje. Zapamtiće ovo.';},tag:'Kocka'}},
   {l:'Ne mešaj se u politiku',d:{goodwill:4}}]},
 {id:'poach',cd:2,when:s=>P2(s)&&s.coach&&s.coach.r>=3&&s.week>=3,title:'Hoće tvog trenera',
  text:s=>`Veći klub hoće trenera ${esc(s.coach.name)}. Nude obeštećenje.`,
  ch:s=>[{l:`Pusti ga (+${nr(200000*(1+s.li))})`,d:{fn:s=>{const n=s.coach.name;s.money+=200000*(1+s.li);led('other',200000*(1+s.li));s.coach=null;s.coaches=[];return `${n} odlazi. Novog trenera nađi na ekranu Ekipa.`;}}},
   {l:'Povećaj mu platu za pola',d:{fn:s=>{s.coach.wage=Math.round(s.coach.wage*1.5/500)*500;return `${s.coach.name} ostaje, sada za ${fmt(s.coach.wage)} nedeljno.`;}}},
   {l:'Odbij razgovor',d:{fn:s=>{if(Math.random()<.3){const n=s.coach.name;s.coach=null;s.coaches=[];return `${n} ipak daje ostavku.`;}return 'Gunđa, ali ostaje.';},tag:'Možda ipak ode'}}]},
 {id:'diaspora',once:1,when:s=>P2(s)&&s.week>=4,title:'Čika Mile iz Čikaga',
  text:s=>`Mile, koji je otišao iz sela ${esc(s.club.village)} 1991, zove iz Čikaga. Poslaće 500.000 ako sledeća tribina dobije ime njegovog pokojnog oca.`,
  ch:s=>[{l:'Prihvati',d:{money:500000,goodwill:-1}},{l:'Prihvati i pozovi ga na otvaranje',d:{money:500000,goodwill:3,rel:{pop:3},ugled:2}},{l:'Odbij',d:{}}]},
 {id:'brawl',cd:2,w:3,when:s=>P2(s)&&isRivalNext(s),title:'Napetost pred derbi',
  text:s=>`Navijači oba mesta cele nedelje se vređaju na internetu. Policija je zabrinuta zbog derbija.`,
  ch:s=>[{l:'Sastani se sa obe navijačke grupe',chk:['sarm',11],d:{fan:3,rel:{rival:5}},f:{flag:{brawl:1}},ok:'Kafa, rukovanje, zajednička slika. Derbi će biti glasan, ali ne i nasilan.',no:'Niko ne sluša. Moglo bi biti ružno.'},
   {l:'Plati dodatno obezbeđenje',d:{money:-60000*(1+s.li)}},
   {l:'Ignoriši',d:{flag:{brawl:1},tag:'Rizik od kazne'}}]},
 {id:'prodigy',once:1,when:s=>s.b.academy>=1&&s.week>=4,title:'Nešto posebno',
  text:s=>`Trener iz škole fudbala te povlači u stranu. „Imamo jednog četrnaestogodišnjaka. Moraš da ga vidiš.”`,
  ch:s=>[{l:'Ubrzano ga uvedi u klub',d:{money:-50000,flag:{prodigy:1},goodwill:3,tag:'Dolazi sledećeg leta'}},{l:'Neka prvo odraste',d:{goodwill:2}}]},
 {id:'sponsor2',cd:3,when:s=>P2(s)&&s.week>=6&&s.sponsors.length<6,title:'Zove lokalna firma',
  text:s=>`Građevinska firma Građevina Kovač nudi 15.000 nedeljno, plus popust ako oni grade tvoj sledeći projekat.`,
  ch:s=>[{l:'Prihvati',d:{sponsor:['Građevina Kovač',15000]}},{l:'Odbij',d:{}}]},
 /* ---- Phase 3 ---- */
 {id:'abroad',w:4,when:s=>P3(s)&&s.week>=2&&s.week<=12&&!!abroadInfo(s),title:'Ponuda iz inostranstva',
  text:s=>{const b=abroadInfo(s);return `${esc(b.buyer)} je tri puta gledao igrača ${esc(b.p.name)} (${POSL[b.p.pos]}, ${b.p.age} god., ocena ${Math.round(ovr(b.p))}). Nude ${fmt(b.fee)}.`;},
  ch:s=>{const b=abroadInfo(s),lo=Math.round(b.fee*.75/10000)*10000;return[{l:`Prodaj za ${nr(b.fee)}`,d:{fn:s=>sellPlayer(b.p,b.fee,b.buyer)}},
   {l:'Pregovaraj o ceni',d:{fn:s=>sellNegoStart(b.p,b.fee,b.buyer),tag:'Cenkanje · Biznis podiže njihovu granicu'}},
   {l:`Uzmi ${nr(lo)} plus 20% od sledeće prodaje`,d:{fn:s=>sellPlayer(b.p,lo,b.buyer,.2),tag:'Može se isplatiti kasnije'}},
   {l:'Nije na prodaju',d:{fn:s=>{b.p.morale=Math.max(1,b.p.morale-1);if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+6,0,100);return `${b.p.name} ostaje. Tribina peva njegovo ime; on je malo razočaran.`;}}}];}},
 {id:'flares',cd:2,w:2,when:s=>s.ultras&&s.ultras.mood>=35&&s.week>=1,title:'Baklje na tribini',
  text:s=>`${esc(s.ultras.name)} su prošle nedelje zapalili četrdeset baklji. Savez kažnjava klub sa ${fmt(150000)}.`,
  ch:s=>[{l:'Plati i zabrani ulaz kolovođama',d:{money:-150000,ugled:2,fn:s=>{s.ultras.mood=clamp(s.ultras.mood-15,0,100);return `${s.ultras.name} su besni na tebe.`;}}},
   {l:'Plati i javno brani navijače',d:{money:-150000,ugled:-2,fn:s=>{s.ultras.mood=clamp(s.ultras.mood+8,0,100);return `${s.ultras.name} razvijaju transparent sa zahvalnicom tebi.`;}}},
   {l:'Žali se na kaznu',chk:['veze',12],d:{},f:{money:-200000},ok:'Kazna je poništena. Neko ti je dugovao uslugu.',no:'Žalba je odbijena, a kazna raste na 200k.'}]},
 {id:'banner',cd:2,w:3,when:s=>s.ultras&&s.ultras.mood<30,title:'“Gazda, napolje!”',
  text:s=>`Na tribini stoji transparent „GAZDA, NAPOLJE”. ${esc(s.ultras.name)} su nezadovoljni.`,
  ch:s=>[{l:'Nađi se sa njima u njihovoj kafani',chk:['sarm',12],d:{fn:s=>{s.ultras.mood=clamp(s.ultras.mood+20,0,100);return 'Dva sata i mnogo rakije kasnije, mir je sklopljen.';}},f:{fan:-3,fn:s=>{s.ultras.mood=clamp(s.ultras.mood-5,0,100);return 'Izviždali su te iz kafane.';}},ok:'',no:''},
   {l:'Spusti cene karata na minimum',d:{fn:s=>{s.pt=0;s.ultras.mood=clamp(s.ultras.mood+15,0,100);return 'Karte su na najnižoj ceni. Transparent je skinut.';}}},
   {l:'Ignoriši',d:{fan:-5,fn:s=>{s.ultras.mood=clamp(s.ultras.mood-5,0,100);return 'Transparent ostaje.';}}}]},
 {id:'choreo',when:s=>s.ultras&&s.ultras.mood>=65&&isRivalNext(s),title:'Koreografija',
  text:s=>`${esc(s.ultras.name)} hoće koreografiju preko cele tribine za derbi. Treba im novac za boju i platno.`,
  ch:s=>[{l:'Plati (100k)',d:{money:-100000,fan:6,ugled:3,morale:1,fn:s=>{s.ultras.mood=clamp(s.ultras.mood+10,0,100);return 'Fotografije obilaze celu zemlju.';}}},
   {l:'Neka sami plate',d:{fn:s=>{s.ultras.mood=clamp(s.ultras.mood-4,0,100);return 'Ispalo je manje nego što su planirali.';}}}]},
 {id:'investor',once:1,when:s=>P3(s)&&s.week>=2&&!s.investor,title:'Investitor iz Čikaga',
  text:s=>`Dragan „Den” Petrović se obogatio na kamionskom prevozu u Ilinoisu. Hoće 30% kluba i nudi ${fmt(15000000)}. Zauzvrat stadion nosi ime njegove firme, a on traži plasman u viši rang do kraja sledeće sezone.`,
  ch:s=>[{l:'Uzmi njegove pare',d:{fn:s=>{s.money+=15000000;led('other',15000000);s.investor={name:'Petrović Trucking',cash:15000000,deadline:s.season+1};s.fan=clamp(s.fan-6,0,100);if(s.ultras)s.ultras.mood=clamp(s.ultras.mood-10,0,100);return 'Stiže 15M. Stadion se sada zove Petrović Trucking Arena. Plasman do kraja sledeće sezone, ili se povlači i odnosi pare.';},tag:'+15M, ali sa uslovima'}},
   {l:'Pregovaraj: pare da, novo ime ne',chk:['biz',13],d:{fn:s=>{s.money+=10000000;led('other',10000000);s.investor={name:'Dan Petrović',cash:10000000,deadline:s.season+1};return '10M, a stadion zadržava ime. Rok za plasman ostaje.';}},f:{},ok:'',no:'Nasmeje se i odleti kući. Nema dogovora.'},
   {l:'Klub nije na prodaju',d:{fan:5,goodwill:4}}]},
 {id:'press',cd:2,w:3,when:s=>P3(s)&&lastLosses(s)>=2,title:'Okružni glas',
  text:s=>`Posle ${lastLosses(s)} poraza zaredom, okružne novine tvoj tim nazivaju „seljacima koji su zalutali u ozbiljan fudbal”.`,
  ch:s=>[{l:'Održi konferenciju za medije',chk:['sarm',11],d:{morale:1,ugled:2},f:{ugled:-3,fan:-3},ok:'Smiren si i duhovit. Sutradan je naslov o tvojoj košulji, a ne o porazima.',no:'Izgubio si živce pred kamerom. Snimak se vrti cele nedelje.'},
   {l:'Okrivi igrače',d:{morale:-1,ugled:1}},
   {l:'Ćuti',d:{}}]},
 {id:'tvdeal',once:1,when:s=>P3(s)&&s.week>=3,title:'TV ugovor',
  text:s=>`Regionalni kanal hoće da prenosi vaše domaće utakmice uživo. 60.000 po utakmici, ali početak se seli na ponedeljak u 17:00.`,
  ch:s=>[{l:'Potpiši',d:{flag:{tv:1},tag:'+60k po domaćoj utakmici, publika −10%'}},{l:'Zadrži nedeljni fudbal',d:{fan:3}}]},
 {id:'u18',cd:2,when:s=>P3(s)&&s.week>=3&&youngStar(s)&&youngStar(s).pot>=14,title:'Poziv u reprezentaciju',
  text:s=>`${esc(youngStar(s).name)} je pozvan u reprezentaciju Srbije do 18 godina. Gledaće ga skauti iz inostranstva.`,
  ch:s=>{const p=youngStar(s);return[{l:'Napravi slavlje u selu',d:{money:-40000,fan:4,goodwill:5,fn:()=>{p.morale=5;return `Majka igrača ${p.name} plače na regionalnoj televiziji.`;}}},{l:'Bez pompe',d:{fn:()=>{p.morale=Math.min(5,p.morale+1);p.pot=Math.min(20,p.pot+1);return 'Ode tiho, a vrati se bolji.';}}}];}},
 {id:'youthcup',cd:2,when:s=>s.b.academy>=2&&s.week>=8,title:'Finale omladinskog kupa',
  text:s=>`Tvoja deca iz akademije stigla su do finala regionalnog omladinskog kupa, u Nišu. Samo autobus košta 80.000.`,
  ch:s=>[{l:'Pošalji ih sa celim stručnim štabom',d:{money:-80000,goodwill:5,fn:s=>{s.squad.filter(p=>p.age<=19).forEach(p=>{if(Math.random()<.5)p.pot=Math.min(20,p.pot+1);});return Math.random()<.55?'Osvojili su! Deca se vraćaju kao heroji.':'Izgubili su na penale, ali su tog dana mnogo odrasli.';}}},{l:'Preskupo je',d:{goodwill:-4}}]},
 /* ---- Phase 4 ---- */
 {id:'contract',cd:1,w:2,when:s=>P4(s)&&s.week>=2&&s.week<=11&&!!contractP(s),title:'Pregovori o ugovoru',
  text:s=>{const p=contractP(s);return `Igraču ${esc(p.name)} ugovor ističe ovog leta. Menadžer traži ${fmt(Math.round(p.wage*1.6/500)*500)} nedeljno za novi potpis.`;},
  ch:s=>{const p=contractP(s),sf=Math.round(value(p)*.8/10000)*10000;return[{l:'Plati ga',d:{fn:()=>{p.wage=Math.round(p.wage*1.6/500)*500;p.morale=5;p.signed=s.season;p.ce=s.season+3;return `${p.name} potpisuje na još tri godine.`;}}},
   {l:'Pusti da mu istekne ugovor',d:{fn:()=>{p.leaving=true;p.morale=Math.max(1,p.morale-1);return `${p.name} odlazi ovog leta kao slobodan igrač.`;},tag:'Leti odlazi besplatno'}},
   {l:`Prodaj ga odmah za ${nr(sf)}`,d:{fn:s=>sellPlayer(p,sf,LEAGUES[6].names[p.id%8])}}];}},
 {id:'loanback',w:2,when:s=>P4(s)&&s.week>=3&&s.week<=12&&!!bidTarget(s)&&!bidTarget(s).leaving&&!bidTarget(s).forced,title:'Zovu velikani',
  text:s=>{const p=bidTarget(s);return `${esc(bigC())} hoće igrača ${esc(p.name)}. ${fmt(Math.round(value(p)*1.3/10000)*10000)} odmah, ili malo manje ako ostane kod vas do leta.`;},
  ch:s=>{const p=bidTarget(s),f=Math.round(value(p)*1.3/10000)*10000,f2=Math.round(f*.85/10000)*10000;return[{l:`Prodaj odmah za ${nr(f)}`,d:{fn:s=>sellPlayer(p,f,bigC())}},
   {l:`Prodaj za ${nr(f2)}, ostaje do leta`,d:{fn:s=>{s.money+=f2;led('sales',f2);p.leaving=true;s.fan=clamp(s.fan-3,0,100);news(`${p.name} prodat klubu ${short(bigC())} za ${fmt(f2)}. Ostaje do leta.`);return `${fmt(f2)} u banci. ${p.name} igra za vas do kraja sezone.`;}}},
   {l:'Nije na prodaju',d:{fan:3,fn:s=>{if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+5,0,100);return 'Tribina je oduševljena.';}}}];}},
 {id:'signal',once:1,when:s=>P4(s)&&s.week>=2,title:'Nacionalni sponzor',
  text:s=>`Mobilna mreža Signal, nacionalni mobilni operater, nudi 120.000 nedeljno da bude na vašim dresovima.`,
  ch:s=>[{l:'Prihvati',d:{sponsor:['Mobilna mreža Signal',120000]}},{l:'Traži 160.000',chk:['biz',13],d:{sponsor:['Mobilna mreža Signal',160000]},f:{sponsor:['Mobilna mreža Signal',100000]},ok:'Signal pristaje.',no:'Dogovor na 100k.'},{l:'Odbij',d:{}}]},
 {id:'kladionica',once:1,when:s=>P4(s)&&s.week>=4,title:'Kladionica Tiket',
  text:s=>`Kladionica nudi 200.000 nedeljno za ime na stadionu.`,
  ch:s=>[{l:'Uzmi pare',d:{sponsor:['Kladionica Tiket',200000],goodwill:-8,rel:{pop:-10},tag:'Seoski pop nije zadovoljan'}},{l:'Ne sa parama od kladionice',d:{goodwill:4,rel:{pop:5}}}]},
 {id:'konzorcijum',once:1,when:s=>P4(s)&&s.week>=3,title:'Konzorcijum Morava',
  text:s=>`Regionalni holding nudi ${fmt(40000000)} za veliki udeo u klubu. Jedan uslov: predsednikov sestrić Dejan ulazi u ekipu, i igra.`,
  ch:s=>[{l:'Uzmi 40M, i sestrića',d:{fn:s=>{s.money+=40000000;led('other',40000000);const p=genPlayer('MID',LEAGUES[s.li].lvl-4.5,{age:24,job:'predsednikov sestrić'});p.name='Dejan Moravac';p.forced=true;p.trait='lenj';p.pot=Math.ceil(ovr(p))+1;s.squad.push(p);return 'Stiže 40M. Stiže i Dejan. Mora da počne svaku utakmicu za koju je spreman.';},tag:'+40M, slab igrač koji mora da igra'}},
   {l:'Pare da, sestrić ne',chk:['biz',14],d:{fn:s=>{s.money+=25000000;led('other',25000000);return 'Stiže 25M, bez sestrića.';}},f:{},ok:'Pristaju na 25M bez uslova.',no:'Odlaze.'},
   {l:'Hvala, ne',d:{}}]},
 {id:'audit',cd:2,when:s=>P4(s)&&s.week>=6,title:'Kontrola za licencu',
  text:s=>`Revizori saveza pregledaju knjige kluba zbog licence za Superligu. Nalaze „nepravilnosti” u papirima.`,
  ch:s=>[{l:'Angažuj prave knjigovođe (500k)',d:{money:-500000,ugled:1}},{l:'Pozovi nekog u savezu',chk:['veze',13],d:{},f:{money:-1000000},ok:'Jedan poziv, i predmet je zatvoren.',no:'Obilo se o glavu. Savez kažnjava klub sa 1M.'},{l:'Svađaj se sa njima',d:{money:-1000000,ugled:-3,tag:'Kazna 1M'}}]},
 {id:'cupfever',when:s=>s.cup&&s.cup.alive&&s.cup.round>=2,title:'Kup groznica',
  text:s=>`Ceo region priča o vašem putu u kupu. Navijači traže autobuse i više karata.`,
  ch:s=>[{l:'Plati autobuse za navijače (300k)',d:{money:-300000,fan:6,goodwill:5,fn:s=>{if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+10,0,100);return 'Trideset autobusa kreće iz sela.';}}},{l:'Neka se sami snađu',d:{}}]},
 /* ---- Phase 5 ---- */
 {id:'national',cd:2,w:2,when:s=>P5(s)&&s.week>=2&&(bestP(s)?ovr(bestP(s)):0)>=14,title:'Zovu Orlovi',
  text:s=>`${esc(bestP(s).name)} je pozvan u reprezentaciju Srbije.`,
  ch:s=>{const p=bestP(s);return[{l:'Proslavi sa selom',d:{money:-200000,fan:5,goodwill:6,fn:()=>{p.morale=5;p.pot=Math.min(20,p.pot+1);return `${p.name} se vraća kući kao reprezentativac.`;}}},{l:'Reci mu da ostane fokusiran',d:{fn:()=>{p.morale=Math.min(5,p.morale+1);return 'Klimne glavom i vrati se na trening.';}}}];}},
 {id:'bigbid',w:3,when:s=>P5(s)&&s.week>=2&&s.week<=12&&!!bidTarget(s)&&!bidTarget(s).leaving&&!bidTarget(s).forced,title:'Zove Engleska',
  text:s=>{const p=bidTarget(s);return `Northbridge United iz engleske Premijer lige nudi ${fmt(bigFee(p))} za igrača ${esc(p.name)}. Bio bi to rekord za srpski klub van Beograda.`;},
  ch:s=>{const p=bidTarget(s),f=bigFee(p),lo=Math.round(f*.8/100000)*100000;return[{l:`Prodaj za ${nr(f)}`,d:{fn:s=>sellPlayer(p,f,'Northbridge United (Engleska)')}},{l:'Pregovaraj o ceni',d:{fn:s=>sellNegoStart(p,f,'Northbridge United (Engleska)'),tag:'Cenkanje · Biznis podiže njihovu granicu'}},{l:`Uzmi ${nr(lo)} plus 25% od sledeće prodaje`,d:{fn:s=>sellPlayer(p,lo,'Northbridge United (Engleska)',.25)}},{l:'Nije na prodaju',d:{fan:4,fn:s=>{p.morale=Math.max(1,p.morale-2);if(s.ultras)s.ultras.mood=clamp(s.ultras.mood+8,0,100);return `${p.name} ostaje, ali nije srećan.`;}}}];}},
 {id:'street',once:1,when:s=>P5(s)&&legacyScore()>=700,title:'Ulica sa tvojim imenom',
  text:s=>`Savet mesne zajednice hoće da glavna ulica u selu ${esc(s.club.village)} nosi tvoje ime.`,
  ch:s=>[{l:'Prihvati, skromno',d:{goodwill:6,ugled:10,flag:{street:1}}},{l:'Zamoli da ulica dobije ime kluba',d:{goodwill:10,fan:5,flag:{street:2}}}]},
 {id:'naming',once:1,when:s=>P5(s)&&s.week>=3,title:'Ime stadiona na prodaju',
  text:s=>`Nacionalna banka nudi 500.000 nedeljno za ime na vašem stadionu.`,
  ch:s=>[{l:'Prodaj ime',d:{sponsor:['Banka Srbija Centar',500000],fan:-6,fn:s=>{if(s.ultras)s.ultras.mood=clamp(s.ultras.mood-12,0,100);return 'Stadion sada nosi ime banke. Tribina i dalje koristi staro.';}}},{l:'Ime ostaje',d:{fan:5,goodwill:3}}]},
 {id:'eurotrip',when:s=>s.euro&&s.euro.stage!=='done'&&s.ultras&&s.week>=1,title:'Gostovanje u Evropi',
  text:s=>`${esc(s.ultras.name)} hoće da prate tim u inostranstvu. Organizuju autobuse kroz tri države.`,
  ch:s=>[{l:'Pomozi da plate put (1M)',d:{money:-1000000,fan:6,fn:s=>{s.ultras.mood=clamp(s.ultras.mood+12,0,100);return 'Dve hiljade navijača iz tvog sela peva u stranom gradu.';}}},{l:'Poželi im sreću',d:{}}]},
 {id:'titlerace',when:s=>P5(s)&&s.week>=9&&rank().indexOf(0)<=1,title:'Borba za titulu',
  text:s=>`U borbi ste za titulu. Cela zemlja gleda, a beogradska štampa nije prijateljski raspoložena.`,
  ch:s=>[{l:'Obećaj titulu',d:{fan:6,morale:1,ugled:-2,tag:'Veliki pritisak'}},{l:'Spuštaj loptu',d:{ugled:2}}]}
];
function drawEvents(){
  const pool=EVENTS.filter(e=>{const u=S.used[e.id];return !(u==='once'||(u!=null&&S.season-u<(e.cd||1)))&&e.when(S);});
  const forced=pool.filter(e=>e.force),rest=pool.filter(e=>!e.force);
  const r=Math.random(),n=r<.22?0:r<.82?1:2,out=forced.map(e=>e.id);
  const bag=[];rest.forEach(e=>{let w=e.w||1;if(e.id==='bid'&&bidTarget(S)&&bidTarget(S).listed)w=6;if(e.id==='snow')w=Math.max(1,Math.round(w*REG().snow*(wev('zima')?2.5:1)));if(e.id==='harvest')w=Math.max(1,Math.round(w*REG().harvest));for(let i=0;i<w;i++)bag.push(e.id);});
  while(out.length<n+forced.length&&bag.length){const id=pick(bag);if(!out.includes(id))out.push(id);bag.splice(bag.indexOf(id),1);}
  S.pending=out;
}
function applyD(d){
  const out=[];if(!d)return out;
  if(d.money){S.money+=d.money;led('other',d.money);}
  if(d.fan)S.fan=clamp(S.fan+Math.round(d.fan*(d.fan>0?(1+(S.owner.st.sarm-5)*.04)*REG().fan:1)),0,100);
  if(d.goodwill)S.goodwill=clamp(S.goodwill+Math.round(d.goodwill*(d.goodwill>0&&has('domacin')?1.3:1)),0,100);
  if(d.ugled)addUgled(d.ugled);
  if(d.rel)for(const k in d.rel)S.rel[k]=clamp(S.rel[k]+d.rel[k],-100,100);
  if(d.morale)S.squad.forEach(p=>p.morale=clamp(p.morale+d.morale,1,5));
  if(d.sponsor){const w=Math.round(d.sponsor[1]*(1+(S.owner.st.biz-5)*.03)*(has('kafanska')?1.15:1)/500)*500;S.sponsors=S.sponsors.filter(x=>x.name!==d.sponsor[0]);S.sponsors.push({name:d.sponsor[0],w});out.push(`${d.sponsor[0]}: ${fmt(w)} nedeljno.`);}
  if(d.flag)Object.assign(S.flags,d.flag);
  if(d.fn){const m=d.fn(S);if(m)out.push(m);}
  return out;
}
const sgn=n=>n>=8?'++':n>0?'+':n<=-8?'−−':'−';
function fx(d){
  if(!d)return '';const a=[];
  if(d.money)a.push(fmtS(d.money));
  if(d.sponsor)a.push(`+${fmt(d.sponsor[1])}/ned.`);
  if(d.fan)a.push('Navijači '+sgn(d.fan));
  if(d.goodwill)a.push('Selo '+sgn(d.goodwill));
  if(d.ugled)a.push('Ugled '+sgn(d.ugled));
  if(d.morale)a.push('Moral '+sgn(d.morale));
  if(d.rel)for(const k in d.rel)if(d.rel[k])a.push(REL_N[k]+' '+sgn(d.rel[k]));
  if(d.tag)a.push(d.tag);
  return a.join(' · ');
}

