/* ---------- data ---------- */
const KEY='odsela-save-v1';
const FIRST=['Marko','Nikola','Stefan','Luka','Milan','Nemanja','Dušan','Aleksandar','Miloš','Filip','Vuk','Lazar','Đorđe','Uroš','Bogdan','Vladimir','Petar','Jovan','Ognjen','Srđan','Dragan','Zoran','Goran','Bojan','Ivan','Radovan','Mladen','Veljko','Andrija','Dejan','Mihajlo','Strahinja','Nenad','Branko','Saša'];
const LAST=['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Stanković','Pavlović','Milošević','Popović','Živković','Tomić','Kovačević','Lazić','Radić','Simić','Mitrović','Obradović','Savić','Ristić','Todorović','Vasić','Kostić','Babić','Lukić','Filipović','Janković','Bogdanović','Mladenović','Gajić','Perić','Vuković'];
const JOBS=['automehaničar','pekarev sin','traktorista','student','poštar','mesarski šegrt','pčelar','učitelj','ratar','šljivar','električar','vozač autobusa','čobanin','konobar u kafani','zidar','veterinarski tehničar','stolar'];
const JOBS3=['profesionalac','bivši superligaš','vratio se sa Kipra','reprezentativac U21','promenio deset klubova'];
const JOBS2=['poluprofesionalac','fabrički radnik','student DIF-a','bivši omladinac','magacioner','taksista','policajac','student fizioterapije'];
const TRAITS=[{k:'kap',n:'Kapiten',d:'Podiže ceo tim kad igra'},{k:'lenj',n:'Lenj',d:'Lenj. Trenira upola snage'},{k:'ljub',n:'Miljenik publike',d:'Publika poludi kad on da gol'},{k:'krh',n:'Krhak',d:'Sklon povredama'}];
const STATS=[['att','Napad','Attack'],['def','Odbrana','Defense'],['tec','Tehnika','Technique'],['fit','Kondicija','Fitness'],['men','Mentalitet','Mentality']];
const COLORS={red:['#C1121F','#FFFFFF','Crveno-beli'],blue:['#1D4E9E','#FFFFFF','Plavo-beli'],green:['#1F7A3A','#FFFFFF','Zeleno-beli'],black:['#1B1B1B','#F2F2F2','Crno-beli'],yellow:['#D49A00','#1B1B1B','Žuto-crni'],purple:['#5B2A86','#FFFFFF','Ljubičasto-beli',1],orange:['#E2661A','#1B1B1B','Narandžasto-crni',1]};
const BG={
  tajkun:{n:'Tajkun',sub:'Novac iz Beograda',d:'Kupio si klub kao hobi. Para ima koliko hoćeš, ali u selu te zovu „onaj iz Beograda”.',money:12000000,st:{biz:9,sarm:3,oko:4,veze:9},gw:15,rel:{mayor:20,kafana:-20,pop:-20,rival:-40},locked:'x_tajkun'},
  povratnik:{n:'Povratnik',sub:'Iz dijaspore',d:'Vratio si se iz Čikaga sa ušteđevinom. Pun novčanik, ali selo misli da si zaboravio odakle si.',money:4500000,st:{biz:8,sarm:6,oko:5,veze:5},gw:25,rel:{mayor:0,kafana:-10,pop:0,rival:-10}},
  biznismen:{n:'Lokalni biznismen',sub:'Vlasnik servisa',d:'Imaš auto-servis. Jedan sponzor od prvog dana, i poneki neprijatelj.',money:1800000,st:{biz:6,sarm:5,oko:5,veze:8},gw:45,rel:{mayor:-15,kafana:10,pop:0,rival:-25}},
  igrac:{n:'Bivši igrač',sub:'Bivši fudbaler',d:'Igrao si za ovaj klub 12 sezona. Momci te poštuju, a fudbalera prepoznaješ čim ga vidiš.',money:1000000,st:{biz:4,sarm:6,oko:9,veze:5},gw:55,rel:{mayor:0,kafana:5,pop:5,rival:0}},
  sin:{n:'Seoski sin',sub:'Dete ovog sela',d:'Svi znaju tvoju majku. Para skoro nemaš, ali celo selo će pomoći.',money:700000,st:{biz:4,sarm:9,oko:6,veze:5},gw:72,rel:{mayor:5,kafana:5,pop:15,rival:0}}
};
const OWNER_ST=[['biz','Biznis','Bolji sponzorski ugovori, jeftinija gradnja, bolje transfer cene'],['sarm','Šarm','Navijači i meštani te brže zavole'],['oko','Fudbalsko oko','Vidiš pravi potencijal igrača'],['veze','Veze','Brža gradnja i dozvole, bolje usluge']];
const LEAGUES=[
  {name:'Opštinska liga',lvl:6.4,rival:'FK Sloga Lipovac',names:['FK Jedinstvo Gornje Polje','FK Mladost Brestovac','FK Polet Vrbovac','FK Borac Kruševica','FK Zadrugar Topolovac','FK Hajduk Selište','FK Omladinac Vinci','FK Bratstvo Ravni Gaj']},
  {name:'Međuopštinska liga',lvl:7.5,rival:'FK Sloga Lipovac',names:['FK Rudar Brdo','FK Radnički Stari Gaj','FK Napredak Ravnica','FK Graničar Kamenica','FK Šumadinac Lug','FK Dinamo Breza','FK Proleter Vlaško','FK Vardar Bukovik']},
  {name:'Okružna liga',lvl:8.6,rival:'FK Metalac Dolovo',names:['FK Tekstilac Lipe','FK Sloboda Varoš','FK Železničar Polje','FK Budućnost Dobrava','FK Vihor Selo','FK Morava Brod','FK Ibar Klisura','FK Kosmaj Planinica']},
  {name:'Zonska liga',lvl:9.7,rival:'FK Metalac Dolovo',names:['FK Jagodinac Ravno','FK Mladost Varošica','FK Polet Zlatna Reka','FK Radnički Ćuprija Polje','FK Smederevac Dunavac','FK Trudbenik Lazarevo','FK Pobeda Belica','FK Partizanac Gornji Grad']},
  {name:'Srpska liga',lvl:11,rival:'FK Metalac Dolovo',names:['FK Takovo','FK FAP Priboj','FK Zlatibor Čajetina','FK Budućnost Krušik','FK Radnički Valjevo','FK Šumadija 1903','FK Jedinstvo Putevi','GFK Sloboda Užice']},
  {name:'Prva liga',lvl:12.9,rival:null,names:['FK TSC','FK Jedinstvo Ub','FK Javor-Matis','FK Spartak Subotica','FK Metalac Gornji Milanovac','FK Napredak Kruševac','FK Voždovac','FK Borac Čačak']},
  {name:'Superliga',lvl:14.6,rival:'FK Crvena zvezda',names:['FK Partizan','FK Vojvodina','FK Radnički 1923','FK Radnički Niš','FK Čukarički','FK Novi Pazar','FK Železničar Pančevo','OFK Beograd']}
];
const PHASES={1:{n:'Selo',d:'Seoski fudbal'},2:{n:'Okrug',d:'Regionalni fudbal'},3:{n:'Srpska liga',d:'Era akademije'},4:{n:'Prva liga',d:'Profesionalni fudbal'},5:{n:'Superliga',d:'Elita i Evropa'}};
const phaseOf=li=>li>=6?5:li>=5?4:li>=4?3:li>=1?2:1;
const phase=()=>phaseOf(S.li);
const BUILD={
  pitch:{n:'Teren',t:[{n:'Kvrgava livada',e:'Blato, krtičnjaci i poneka krava'},{n:'Pokošena livada',c:200000,w:2,e:'Manje povreda, +3% napad kod kuće'},{n:'Teren sa drenažom',c:2000000,w:6,ph:2,pm:1,e:'Sneg i kiša više ne kvare utakmice. Manje povreda'},{n:'Pravi travnjak',c:8000000,w:10,ph:3,pm:1,e:'Još +3% napad kod kuće, manje povreda'},{n:'Hibridni teren sa grejanjem',c:20000000,w:12,ph:4,pm:1,e:'Najbolja podloga u zemlji. Potrebno za Superligu'}]},
  stands:{n:'Tribine',t:[{n:'Stajanje uz ogradu',cap:120,e:'Navijači stoje pored aut-linije'},{n:'Drvena klupa',c:300000,w:3,cap:270,e:'+150 mesta. Potrebno za viši rang'},{n:'Betonska tribina',c:3500000,w:8,ph:2,pm:1,cap:1070,e:'+800 mesta. Potrebno za Srpsku ligu'},{n:'Natkrivena tribina',c:12000000,w:14,ph:3,pm:1,cap:4070,e:'+3.000 sedišta pod krovom. Potrebno za Prvu ligu'},{n:'Stadion sa sedištima (8.000)',c:40000000,w:16,ph:4,pm:1,cap:8070,e:'Tribine sa sve četiri strane. Potrebno za Superligu'},{n:'Veliki stadion (20.000)',c:150000000,w:20,ph:5,pm:1,cap:20070,e:'Pravi stadion za evropske noći'}]},
  changing:{n:'Svlačionice',t:[{n:'Iza hrasta',e:'Igrači se presvlače na otvorenom'},{n:'Drvena svlačionica',c:400000,w:3,e:'Veći moral. Potrebno za viši rang'},{n:'Blok sa tuševima',c:2500000,w:6,ph:2,pm:1,e:'Veći moral. Potrebno za Srpsku ligu'},{n:'Moderne svlačionice',c:15000000,w:10,ph:4,pm:1,e:'Veći moral. Potrebno za Superligu'}]},
  medical:{n:'Medicina',t:[{n:'Mokar sunđer',e:'To je cela medicinska služba'},{n:'Prva pomoć',c:100000,w:1,e:'Povrede zarastaju 25% brže'},{n:'Fizio soba',c:1500000,w:4,ph:2,e:'Povrede zarastaju 50% brže. Potrebno za Prvu ligu'},{n:'Medicinski centar',c:10000000,w:8,ph:4,e:'Povrede zarastaju 65% brže'}]},
  training:{n:'Trening',t:[{n:'Isti teren',e:'Trening uništava teren za utakmice'},{n:'Pomoćni teren',c:600000,w:4,e:'Igrači brže napreduju'},{n:'Dva terena + teretana',c:7000000,w:10,ph:3,pm:1,e:'Veliki skok u treningu'},{n:'Trening centar',c:15000000,w:12,ph:4,pm:1,e:'Najbolji trening u ligi'}]},
  fanbiz:{n:'Navijači i biznis',t:[{n:'Ništa',e:'Navijači donose svoje semenke'},{n:'Roštilj štand',c:200000,w:1,e:'Zarada od ćevapa na svakoj domaćoj utakmici, navijači srećniji'},{n:'Klupska kafana',c:2000000,w:6,ph:2,pm:1,e:'+25k RSD svake nedelje, navijači srećniji'},{n:'Fan šop',c:4000000,w:5,ph:3,e:'Prodaja dresova i šalova svake nedelje'},{n:'VIP lože',c:12000000,w:8,ph:4,pm:1,e:'+400k RSD na svakoj domaćoj utakmici'}]},
  flood:{n:'Reflektori',t:[{n:'Nema',e:'Utakmice se završavaju pre mraka'},{n:'Obični reflektori',c:1800000,w:5,ph:2,pm:1,e:'Večernje utakmice: +25% publike'},{n:'Licencirani reflektori (1.200 luksa)',c:25000000,w:12,ph:4,pm:1,e:'Spremno za TV. Potrebno za Superligu'}]},
  academy:{n:'Omladinska škola',t:[{n:'Nema',e:'Deca šutiraju loptu u zid crkve'},{n:'Škola fudbala',c:1000000,w:4,ph:2,e:'Više seoske dece svakog leta, sa većim potencijalom'},{n:'Regionalna akademija',c:6000000,w:8,ph:3,pm:1,e:'Više i bolje dece iz akademije svakog leta'},{n:'Elitna akademija + dom',c:15000000,w:10,ph:4,pm:1,e:'Najbolja deca u Srbiji žele da dođu'}]}
};
const GATES=[
  {need:{changing:1,stands:1},to:'Međuopštinska liga'},
  {need:{changing:1,stands:1,pitch:1},to:'Okružna liga'},
  {need:{pitch:2},to:'Zonska liga'},
  {need:{stands:2,changing:2},to:'Srpska liga'},
  {need:{stands:3,changing:2,medical:2},to:'Prva liga'},
  {need:{stands:4,flood:2,pitch:4,changing:3},extra:[['Novac iznad nule na kraju sezone',s=>s.money>=0],['Regionalna akademija (omladinska licenca)',s=>s.b.academy>=2],['Trener sa 3+ zvezdice',s=>!!s.coach&&s.coach.r>=3]],to:'Superliga'},
  {need:{},to:null}
];
const MAXLI=6;
const EURO={ucl:{n:'Liga šampiona',lv:[15.4,16.1,16.8],g:[16.6,17.4,18.2],ko:18.8,pr:[3000000,5000000,8000000],gp:25000000,gw:3000000,kp:15000000},
  uel:{n:'Liga Evrope',lv:[14.8,15.4,16],g:[15.8,16.4,17],ko:17.4,pr:[1500000,2500000,4000000],gp:12000000,gw:1500000,kp:8000000},
  uecl:{n:'Liga konferencije',lv:[14.2,14.8,15.4],g:[15,15.6,16.2],ko:16.6,pr:[800000,1200000,2000000],gp:6000000,gw:800000,kp:4000000}};
const EQ=['Drugo kolo kvalifikacija','Treće kolo kvalifikacija','Plej-of'];
const KO2=['Osmina finala','Četvrtfinale','Polufinale','Finale'];
const euroLate=()=>!!(S&&S.euro&&S.euro.stage==='ko2');
const EUROC=[['Šamrok Rovers','Irska'],['Malme','Švedska'],['Rozenborg','Norveška'],['Legija Varšava','Poljska'],['Rapid Beč','Austrija'],['Slavija Prag','Češka'],['Ferencvaroš','Mađarska'],['Makabi Tel Aviv','Izrael'],['Ludogorec','Bugarska'],['FCSB','Rumunija'],['Seltik','Škotska'],['Galatasaraj','Turska'],['Olimpijakos','Grčka'],['Briž','Belgija'],['Sporting','Portugalija'],['Ajaks','Holandija'],['Olimpik Marselj','Francuska'],['Atletiko Madrid','Španija'],['Inter','Italija'],['Borusija Dortmund','Nemačka'],['Pari Sen Žermen','Francuska'],['Real Madrid','Španija'],['Mančester siti','Engleska'],['Milan','Italija'],['Bajern Minhen','Nemačka']];
const VP=[{k:'road',n:'Asfaltni put do sela',c:10000000,l:60},{k:'bus',n:'Svakodnevni autobus do grada',c:8000000,l:50},{k:'park',n:'Sportski park za decu',c:15000000,l:80},{k:'church',n:'Obnova stare crkve',c:20000000,l:70},{k:'school',n:'Nova seoska škola',c:30000000,l:100},{k:'clinic',n:'Dom zdravlja',c:35000000,l:100},{k:'factory',n:'Fabrika u selu',c:80000000,l:180}];
const LEG_R=[[300,'Lokalni heroj'],[600,'Ime u okrugu'],[900,'Poznat u celoj Srbiji'],[1300,'Legenda sela'],[1e9,'Legenda: stadion će nositi tvoje ime']];
const CUP=['Osmina finala','Četvrtfinale','Polufinale','Finale'],CUP_WEEKS=[3,6,10,13],CUP_PRIZE=[1000000,2500000,5000000,15000000];
const GOALS={stay:{n:'Opstanak: 6. mesto ili bolje',pos:6,ok:4,bad:3},top:{n:'Gornja polovina: 4. mesto ili bolje',pos:4,ok:8,bad:6},up:{n:'Top 2: viši rang ili borba za titulu',pos:2,ok:15,bad:10}};
const ABROAD=['Genk (Belgija)','Benfika (Portugalija)','Frajburg (Nemačka)','Red Bul Salcburg (Austrija)','Midtjiland (Danska)','Jang Bojs (Švajcarska)','PAOK (Grčka)','Sparta Prag (Češka)'];
const UG=[0,20,50,90,140,200,270,350,440,540];
const POSL={GK:'GOL',DEF:'ODB',MID:'VEZ',ATT:'NAP'};
const FORMS={'4-4-2':{GK:1,DEF:4,MID:4,ATT:2},'4-3-3':{GK:1,DEF:4,MID:3,ATT:3},'4-5-1':{GK:1,DEF:4,MID:5,ATT:1},'3-5-2':{GK:1,DEF:3,MID:5,ATT:2},'5-3-2':{GK:1,DEF:5,MID:3,ATT:2}};
const REL_N={mayor:'Predsednik opštine',kafana:'Kafana',pop:'Pop',rival:'Rivalski gazda'};
const CSTY={trener:['Trener','Igrači brže napreduju'],taktik:['Taktičar','Taktičke prednosti jače deluju'],motiv:['Motivator','Moral ostaje visok, govor na poluvremenu bolje deluje']};
const PRICES=[100,200,300];
const DIFFS={easy:{n:'Lako',d:'Blagi protivnici, brži trening, 15% veći prihod. Za opuštenu karijeru.',opp:[1,1,1,1,1,1.12,1.18],sp:.75,ad:0,tr:1.15,inc:1.15},
  normal:{n:'Normalno',d:'Pravi rivali za titulu koji menjaju plan na poluvremenu. Treba ti širok kadar i plan.',opp:[1,1.03,1.07,1.1,1.14,1.18,1.27],sp:1,ad:.55,tr:1,inc:1},
  hard:{n:'Teško',d:'Jaki rivali, sporiji trening, 10% manji prihod. Svaka sezona je borba.',opp:[1.04,1.07,1.12,1.16,1.2,1.26,1.36],sp:1.15,ad:.85,tr:.9,inc:.9}};
DIFFS.legend={n:'Legenda',d:'Za one koji su sve videli. Najjači rivali, najsporiji trening, manje para. Poeni nasleđa ×1,6.',opp:[1.08,1.11,1.16,1.2,1.25,1.32,1.42],sp:1.25,ad:1,tr:.85,inc:.85,locked:'x_legenda'};
const DF=()=>DIFFS[(S&&S.diff)||'normal'];
const REGIONS={
  sumadija:{n:'Šumadija',d:'Srce Srbije. Slave, šljivovica i glasni navijači: raspoloženje navijača raste 20% brže.',inc:1,fan:1.2,youth:0,snow:1,harvest:1,att:1,fit:0},
  vojvodina:{n:'Vojvodina',d:'Ravna, bogata zemlja. 15% veći prihod od sponzora, ulaznica i subvencija, ali žetva ti stalno odvlači igrače.',inc:1.15,fan:1,youth:0,snow:.6,harvest:3,att:1,fit:0},
  zlatibor:{n:'Zlatibor',d:'Planine. Sneg cele zime, ali turisti donose 20% više publike, a igrači su u boljoj kondiciji.',inc:1,fan:1,youth:0,snow:3,harvest:.5,att:1.2,fit:1},
  jug:{n:'Jug',d:'Ponosni, siromašni jug. 8% manje para, ali najtalentovanija deca u zemlji. Najteži region.',inc:.92,fan:1.1,youth:2,snow:1,harvest:1,att:1,fit:0}};
const REG=()=>REGIONS[(S&&S.region)||'sumadija'];
const INC=()=>DF().inc*REG().inc;
const PERKS=[
  {k:'kafanska',n:'Kafanska diplomatija',d:'+2 na svaku proveru Šarma, a novi sponzori plaćaju 15% više'},
  {k:'domacin',n:'Domaćin',d:'Naklonost sela raste 30% više'},
  {k:'seoski',n:'Seoski radovi',d:'Pomažu volonteri: objekti ispod 3M koštaju 25% manje'},
  {k:'opstina',n:'Opštinski prijatelj',d:'Dozvole dve nedelje brže, opštinska subvencija 25% veća'},
  {k:'pregovarac',n:'Pregovarač',d:'Plaćaš 15% manje za pojačanja, dobijaš 10% više od prodaje, +2 na proveru Biznisa'},
  {k:'agent',n:'Agentska mreža',d:'Ponude iz inostranstva i Engleske su 25% veće'},
  {k:'skaut',n:'Skautsko oko',d:'Vidiš pravi potencijal svakog igrača; izveštaj skauta ima četiri igrača'},
  {k:'akademija',n:'Akademija srca',d:'Jedno dete više iz akademije svakog leta, sa većim potencijalom'},
  {k:'taktika',n:'Taktička glava',d:'Tvoji taktički odgovori deluju 3% jače'},
  {k:'glas',n:'Glas svlačionice',d:'Govor na poluvremenu deluje duplo jače; moral nikad ne pada ispod 2'},
  {k:'gvozdena',n:'Gvozdena kondicija',d:'Igrači povrate 4 kondicije više svake nedelje'},
  {k:'tvrdjava',n:'Tvrđava',d:'+3% za tvoj tim kod kuće'},
  {k:'mediji',n:'Medijska zvezda',d:'Ugled raste 20% više'}];
const has=k=>!!(S&&S.perks&&S.perks.includes(k));
const PERK_LV=[3,5,7,9];
const CHALL={none:{n:'Bez izazova',d:'Normalna karijera.'},debt:{n:'Dugovi',d:'Nasleđuješ klub bez dinara, sa kreditom od 2,4M koji moraš da vratiš.'},local:{n:'Samo domaći',d:'Samo igrači iz sela i akademije. Nikad nijedno pojačanje sa strane.'},iron:{n:'Jedan život',d:'Težina Teško, a kodovi za čuvanje ne mogu da se učitaju. Jedan život.'}};
const ACH=[
  ['win1','Prva pobeda','Pobedi na prvoj utakmici'],['up1','Gore!','Izbori viši rang'],['five','Petarda','Pobedi u ligi sa pet golova razlike u Fazi 2 ili višoj'],['comeback','Preokret','Pobedi posle zaostatka od dva gola'],
  ['derby','Gospodar derbija','Pobedi u oba derbija u jednoj sezoni'],['unbeaten','Neporaženi','Završi celu ligašku sezonu bez poraza'],['fortress','Tvrđava','Pobedi na svim domaćim ligaškim utakmicama u sezoni'],
  ['p2','Okrug','Stigni do Faze 2'],['p3','Srpska liga','Stigni do Faze 3'],['p4','Prva liga','Stigni do Faze 4'],['p5','Superliga','Stigni do Superlige'],
  ['cup','Pehar','Osvoji Kup Srbije'],['title','Šampioni','Osvoji Superligu'],['euro','Evropa','Stigni do grupne faze u Evropi'],['r16','Osmina finala','Stigni do osmine finala u Evropi'],
  ['sale','Rekordna prodaja','Prodaj igrača za 50M ili više'],['legend','Legenda kluba','Igrač dostigne 100 utakmica za klub'],['loyal','Ultras ljubav','Raspoloženje navijačke grupe dostigne 100'],
  ['village','Novo selo','Završi sve seoske projekte'],['fast','Raketa','Stigni do Superlige za 12 sezona od starta u Fazi 1'],['hardtitle','Teško, ali naše','Osvoji Superligu na težini Teško'],
  ['localwin','Svi su naši','Stigni do Faze 3 u izazovu Samo domaći'],['debtfree','Iz dugova','Stigni do Faze 2 u izazovu Dugovi, sa parama u banci'],['iron','Gvozden','Stigni do Superlige u izazovu Ironman'],
  ['regions','Cela Srbija','Započni karijeru u sva četiri regiona']];
const META_KEY='odsela-meta';
let META=null;
function meta(){if(META)return META;try{META=JSON.parse(localStorage.getItem(META_KEY)||'null');}catch(e){}if(!META||typeof META!=='object')META={};META.ach=META.ach||{};META.hof=META.hof||[];META.regions=META.regions||[];return META;}
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(meta()));}catch(e){}}
function toast(t){const el=$('#toast');if(!el||!el.classList)return;el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),2800);}
function unlock(id){const m=meta();if(m.ach[id])return;const a=ACH.find(x=>x[0]===id);if(!a)return;m.ach[id]=S?S.season:1;saveMeta();SFX.chime();toast(`Dostignuće: ${a[1]}`);if(S)news(`Otključano dostignuće: ${a[1]}. ${a[2]}.`);}
function checkAch(){
  if(!S)return;const ph=phase();
  for(let n=2;n<=5;n++)if(ph>=n)unlock('p'+n);
  if(S.stats.cups>0)unlock('cup');if(S.stats.titles>0){unlock('title');if(S.diff==='hard')unlock('hardtitle');}
  if((S.stats.euroBest||0)>=3)unlock('euro');if((S.stats.euroBest||0)>=5)unlock('r16');
  if(S.ultras&&S.ultras.mood>=100)unlock('loyal');if(S.vp&&S.vp.length>=VP.length)unlock('village');
  if(ph>=5&&S.startPh==='p1'&&S.season<=12)unlock('fast');
  if(S.chall==='local'&&ph>=3)unlock('localwin');if(S.chall==='debt'&&ph>=2&&S.money>0)unlock('debtfree');if(S.chall==='iron'&&ph>=5)unlock('iron');
  if(S.squad.some(p=>(p.apps||0)>=100))unlock('legend');
}
function hofSave(){if(!S||(S.season<2&&S.li===S.startLi))return;const m=meta(),e={id:S.cid,club:S.club.name,village:S.club.village,owner:S.owner.name,region:REG().n,diff:DIFFS[S.diff||'normal'].n,chall:S.chall&&S.chall!=='none'?CHALL[S.chall].n:'',seasons:S.season,best:LEAGUES[Math.max(S.maxLi||0,S.li)].name,bestLi:Math.max(S.maxLi||0,S.li),trophies:(S.trophies||[]).length,legacy:legacyScore()};
  m.hof=m.hof.filter(x=>x.id!==e.id);m.hof.push(e);m.hof.sort((a,b)=>b.bestLi-a.bestLi||b.trophies-a.trophies||b.legacy-a.legacy);m.hof=m.hof.slice(0,12);saveMeta();}
const TIPS=['Dodirni crveno dugme da otvoriš Gazdin sto, pa odigraj utakmicu. Jedna nedelja traje minut-dva.','Idi na Gradnju: i drvena svlačionica i drvena klupa su potrebne pre ulaska u viši rang.','Pročitaj red ispod sledeće utakmice. Ako presuju visoko, igraj Direktno. Ako sporo grade napad, presuj Visoko.','Igrači se umaraju. Taktika pokazuje kondiciju svakog igrača. Trener sam odmara umorne, pa širi kadar pomaže.','Nivoi Ugleda donose poene osobina, a od nivoa 3 biraš i veštine. Pogledaj ekran Klub.'];
const ARC_DUE=w=>S.season*20+S.week+w;
const nowW=()=>S.season*20+S.week;
const SPREAD=[2.2,1.6,1,.4,-.2,-.8,-1.4];

let S=null, M=null, SET={club:'Mladost',village:'Donje Selo',owner:'',bg:'sin',col:'red',start:'p1',diff:'normal',region:'sumadija',chall:'none'}, anim=0, tapRelease=null, scoutPick={pos:'ATT',focus:'ready'};

