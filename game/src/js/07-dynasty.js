/* ---------- dynasty: someone takes over the same club, same world ---------- */
const DYN={sin:{n:'Sin',d:'Tvoje dete preuzima klub. Nosi prezime i deo tvog ugleda, a selo ga voli od malena.',bg:'sin'},
 legenda:{n:'Legenda kluba',d:'Tvoj najveći bivši igrač postaje gazda. Svlačionica ga poštuje, ali o novcu zna malo.',bg:'igrac'},
 investitor:{n:'Investitor',d:'Prodaješ klub čoveku sa parama. Stiže kapital, ali selo i navijači su sumnjičavi.',bg:'biznismen'}};
function dynHeir(){const used=new Set((S.dyn||[]).map(x=>x.name).concat([S.owner.name])),ok=n=>n&&!used.has(n),L=(S.legends||[]).map(x=>x.name).filter(ok),A=(S.alumni||[]).slice().sort((a,b)=>(b.apps||0)-(a.apps||0)).map(x=>x.n||x.name).filter(ok);if(!S.heirX)S.heirX=pick(FIRST)+' '+pick(LAST);return L[0]||A[0]||S.heirX;}
function dynSurname(n){const w=String(n).trim().split(/\s+/);return w.length>1?w[w.length-1]:null;}
function dynHTML(){return `<section class="card"><span class="lbl">Ili nastavi isti svet</span><h3>Ko preuzima ${esc(short(S.club.name))}?</h3><div class="hint">Isti klub, isti rivali, isti stadion i igrači. Nova generacija gazda kreće od sledeće utakmice. Poeni nasleđa su već tvoji.</div>${Object.keys(DYN).map(k=>`<button class="choice" data-a="dyn" data-v="${k}"><b>${DYN[k].n}${k==='legenda'?': '+esc(dynHeir()):''}</b><span class="fx">${DYN[k].d}</span></button>`).join('')}</section>`;}
function dynTakeover(k){const D=DYN[k];if(!D)return;const old=S.owner,gen=(S.gen||1);
  (S.dyn=S.dyn||[]).push({name:old.name,from:S.ownerSince||1,to:S.season,tr:(S.trophies||[]).length-(S.trBase||0),best:LEAGUES[Math.max(S.maxLi||0,S.li)].name});
  const sur=dynSurname(old.name),nm=k==='sin'?`${pick(FIRST)} ${sur||old.name+' mlađi'}`:k==='legenda'?dynHeir():`${pick(FIRST)} ${pick(LAST)}`;
  const st={...BG[D.bg].st};if(k==='sin')for(const x in st)st[x]=clamp(Math.round(st[x]+(old.st[x]-st[x])*.35),1,12);
  S.owner={name:nm,bg:D.bg,st};
  const ug=Math.round(S.ugled*(k==='sin'?.45:k==='legenda'?.3:.2));S.ugled=0;S.lvl=1;S.pts=0;S.perks=[];
  if(k==='sin'){S.goodwill=clamp(S.goodwill+5,0,100);}
  S.heirX=null;
  if(k==='legenda'){const pl=S.squad.find(x=>x.name===nm);if(pl){alumniAdd(pl);S.squad=S.squad.filter(x=>x!==pl);news(`${nm} završava karijeru i odmah postaje gazda.`);}S.fan=clamp(S.fan+8,0,100);S.squad.forEach(p=>p.morale=Math.min(5,(p.morale||3)+1));}
  if(k==='investitor'){const c=Math.round(Math.max(5000000*(1+S.li),S.money*.3)/100000)*100000;S.money+=c;led('other',c);S.goodwill=clamp(S.goodwill-10,0,100);S.fan=clamp(S.fan-5,0,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood-12,0,100);}
  for(const r in S.rel)S.rel[r]=Math.round(S.rel[r]*.5);
  S.flags.retired=0;S.flags.lpDone=0;S.lpAward=null;S.lp={...lgM().spent};S.lpBase=lpSnap();S.gen=gen+1;S.ownerSince=S.season;S.trBase=(S.trophies||[]).length;
  addUgled(ug);
  news(`${gen+1}. generacija: ${nm} preuzima ${S.club.name} od ${old.name}.`);
  S.modal={type:'outcome',title:'Nova generacija',msgs:[`${nm} je novi gazda kluba ${S.club.name}.`,k==='sin'?`Prezime otvara vrata: deo ugleda i selo uz njega.`:k==='legenda'?`Svlačionica slavi. Moral raste.`:`Na račun stiže kapital. Selo gleda ispod oka.`,`Ugled kreće od ${ug}. Sve ostalo je isto: klub, igrači, stadion, rivali.`]};}
function dynCard(){const L=S.dyn||[];if(!L.length)return '';
  return `<section class="card"><span class="lbl">Dinastija · ${(S.gen||1)}. generacija</span><div class="list">${L.map((x,i)=>`<div class="li"><span class="grow"><b>${i+1}. ${esc(x.name)}</b><br><span class="hint">${x.from}.–${x.to}. sezona · ${esc(x.best)} · ${x.tr} ${plu(x.tr,'trofej','trofeja','trofeja')}</span></span></div>`).join('')}<div class="li"><span class="grow"><b>${L.length+1}. ${esc(S.owner.name)}</b><br><span class="hint">od ${S.ownerSince||1}. sezone · sadašnji gazda</span></span><span class="chip club">Sada</span></div></div></section>`;}
function newGame(){
  const bg=BG[SET.bg],RC=SET.realOn&&SET.real&&realLi(SET.real)?SET.real:null;if(RC)SET.start=['','','','','p3','p4','p5'][realLi(RC)];
  S={v:2,screen:'game',tab:'home',nextId:1,
    owner:{name:SET.owner.trim()||'Gazda',bg:SET.bg,st:{...bg.st}},
    club:{name:RC||'FK '+(SET.club.trim()||'Mladost'),village:RC?REALCITY[RC]:(SET.village.trim()||'Donje Selo'),col:RC&&CLUBCOL[RC]?CLUBCOL[RC]:SET.col,real:!!RC,crest:RC?{...crestSpec(RC)}:{...(SET.crest||{sh:'stit',pt:'pruge',sy:'inicijali'}),yr:+(SET.year||1926)||0}},
    money:bg.money,ugled:0,lvl:1,pts:0,fan:45,goodwill:bg.gw,rel:{...bg.rel},
    diff:SET.chall==='iron'?'hard':(SET.diff||'normal'),region:SET.region||'sumadija',chall:SET.chall||'none',cid:Math.random().toString(36).slice(2,10),startPh:SET.start,perks:[],legends:[],posHist:[],sstat:{},maxLi:0,season:1,li:0,week:0,winter:false,teams:[],table:[],sched:[],results:[],
    squad:[],tactics:{form:'4-4-2',tempo:1,press:1,width:1,instr:1},train:'bal',coach:null,pt:1,
    b:{},queue:[],sponsors:[],news:[],pending:[],used:{},flags:{},fa:[],lastAtt:0,ledger:{},mq:[],modal:null,hist:[],sum:null,
    phv:1,loans:[],scout:null,task:null,report:[],coaches:[],sellons:[],ultras:null,investor:null,goal:null,cup:null,analyst:null,trophies:[],euro:null,vp:[],stats:{titles:0,cups:0,abroad:0,kids:0,euroBest:0,top:0}};
  for(const k in BUILD)S.b[k]=0;
  applyRealWorld(S.club);
  if(SET.bg==='biznismen')S.sponsors.push({name:'Auto-servis '+(S.owner.name.split(' ')[0]),w:9000});
  const py=SET.start==='py'&&!!lgM().spent.x_omladina,p5=SET.start==='p5',p4=SET.start==='p4'||py||p5,p3=SET.start==='p3'||p4,p2=SET.start==='p2'||p3;if(p2)S.li=p5?6:p4?5:p3?4:2;
  const lvl=p2?LEAGUES[S.li].lvl-(p5?1.8:p3?2.5:1.9):LEAGUES[0].lvl-1.5,plan=p2?{GK:2,DEF:6,MID:6,ATT:4}:{GK:2,DEF:5,MID:5,ATT:4};
  for(const pos in plan)for(let i=0;i<plan[pos];i++)S.squad.push(genPlayer(pos,lvl));
  if(!S.squad.some(p=>p.trait==='kap'))S.squad[RI(2,10)].trait='kap';
  if(SET.bg==='igrac')S.squad.forEach(p=>p.morale=4);
  if(p2){
    Object.assign(S.b,{pitch:1,stands:1,changing:1,medical:1,training:1,fanbiz:1});
    S.money+=2500000;S.ugled=50;S.lvl=3;S.pts=2;S.fan=65;S.goodwill=clamp(S.goodwill+15,0,100);
    S.coach={name:'Miodrag „Čika Mića”',r:3,style:'motiv',phil:'mladi',trust:65,age:61,wage:Math.round(6000*(1+.25*S.li))};
    S.sponsors.push({name:'Mesara Rade',w:12000},{name:'Kafana Kod Mileta',w:8000});
    S.used.butcher='once';S.used.kafana='once';
    S.hist.push({season:0,league:'Opštinska liga',pos:1},{season:0,league:'Međuopštinska liga',pos:2});
    if(p3){Object.assign(S.b,{pitch:2,stands:2,changing:2,medical:2,fanbiz:2,flood:1,academy:1});S.money+=6000000;S.ugled=140;S.lvl=5;S.pts=3;S.fan=72;S.coach=genCoach();S.scout={name:pick(FIRST)+' '+pick(LAST),wage:scoutWage()};S.sponsors.push({name:'Pivara Okrug',w:40000},{name:'Mlekara Bela Reka',w:25000});S.used.pivara='once';S.used.mlekara='once';S.hist.push({season:0,league:'Okružna liga',pos:1},{season:0,league:'Zonska liga',pos:2});if(p4){Object.assign(S.b,{pitch:3,stands:3,changing:2,medical:2,training:2,fanbiz:3,flood:1,academy:2});S.money+=14000000;S.ugled=270;S.lvl=7;S.pts=4;S.ultras={name:'Seoski Orlovi',mood:60};S.coach.r=Math.max(3,S.coach.r);S.hist.push({season:0,league:'Srpska liga',pos:2});if(p5){Object.assign(S.b,{pitch:4,stands:4,changing:3,medical:3,training:3,fanbiz:4,flood:2,academy:3});S.money+=40000000;S.ugled=440;S.lvl=9;S.pts=5;S.coach.r=Math.max(4,S.coach.r);S.analyst={name:pick(FIRST)+' '+pick(LAST),wage:60000};S.ultras.mood=65;S.hist.push({season:0,league:'Prva liga',pos:1});S.mq.push({type:'phase',n:5},{type:'goal'},{type:'level'});}else S.mq.push({type:'phase',n:4},{type:'goal'},{type:'level'});}else S.mq.push({type:'phase',n:3},{type:'ultras'},{type:'goal'},{type:'level'});}
    else S.mq.push({type:'phase',n:2},{type:'level'});
  }
  if(S.chall==='debt'){S.money=Math.round(S.money*.3/10000)*10000;S.loans.push({w:40000,left:60,amt:2400000});S.goodwill=clamp(S.goodwill-10,0,100);}
  if(RC&&GIANTS0.includes(RC)){S.squad.forEach(pl=>{for(const [k] of STATS)if(Math.random()<.85)pl[k]=Math.min(20,pl[k]+1);});S.money=Math.round(S.money*1.5);S.fan=88;S.goodwill=clamp(S.goodwill+10,0,100);}
  if(py){const L=LEAGUES[S.li].lvl;S.squad=[];const plan={GK:2,DEF:7,MID:7,ATT:5};for(const pos in plan)for(let i=0;i<plan[pos];i++){const pl=genPlayer(pos,L-2.3+R(-.4,.8),{age:RI(17,20),job:'dete iz akademije'});pl.pot=clamp(pl.pot+RI(0,2),1,20);pl.wage=Math.round(pl.wage*.6/100)*100;S.squad.push(pl);}S.squad[RI(0,8)].trait='kap';S.b.academy=Math.max(S.b.academy,2);S.money=Math.round(S.money*.5/10000)*10000;news('Omladinski projekat: najmlađa ekipa u Prvoj ligi. Svi pričaju o talentima.');}
  S.startLi=S.li;S.maxLi=S.li;
  S.lp=SET._wk?{}:{...lgM().spent};
  if(LV('cash'))S.money=Math.round(S.money*(1+.15*LV('cash'))/1000)*1000;
  if(LV('fans')){S.fan=clamp(S.fan+5*LV('fans'),0,100);S.goodwill=clamp(S.goodwill+5*LV('fans'),0,100);}
  if(LV('mica')&&!S.coach)S.coach={name:'Miodrag „Čika Mića”',r:3,style:'motiv',phil:'mladi',trust:65,age:61,wage:Math.round(6000*(1+.25*S.li))};
  if(LV('gen'))S.squad.forEach(pl=>{for(const [k] of STATS)if(Math.random()<.35*LV('gen'))pl[k]=Math.min(20,pl[k]+1);});
  if(LV('stat'))S.pts+=LV('stat');
  if(LV('biz'))S.owner.st.biz+=LV('biz');if(LV('sarm'))S.owner.st.sarm+=LV('sarm');
  if(LV('mir'))S.rel.rival=clamp(S.rel.rival+15*LV('mir'),-100,100);
  if(LV('moral'))S.squad.forEach(pl=>pl.morale=Math.min(5,(pl.morale||3)+1));
  [['b_pitch','pitch'],['b_fan','fanbiz'],['b_med','medical'],['b_tr','training']].forEach(([k,b])=>{if(LV(k)&&S.b[b]<1)S.b[b]=1;});
  setupSeason();
  news(`${S.owner.name} preuzima ${S.club.name}. U selu ${S.club.village} se ne priča ni o čemu drugom.`);
  {const m=meta();if(!m.regions.includes(S.region)){m.regions.push(S.region);saveMeta();}if(m.regions.length>=4)unlock('regions');}
  refreshFA();drawEvents();
  if(LV('ugl'))addUgled(25*LV('ugl'));
}
