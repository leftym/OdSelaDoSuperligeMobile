/* ---------- week resolution ---------- */
function tire(xi,off=[]){const pr=S.tactics.press;[...xiAll(xi),...off].forEach(p=>{p.apps=(p.apps||0)+1;p.sa=(p.sa||0)+1;if(p.apps===100&&!p.legend){p.legend=true;S.legends.push({name:p.name,pos:p.pos,since:S.season});news(`${p.name} igra svoju 100. utakmicu za klub. Legenda kluba.`);toast(`${p.name}: 100 utakmica!`);}p.cond=clamp(Math.round((p.cond??100)-(12+[0,2,5][pr]-(p.fit-10)*.5+R(-2,2))),25,100);});}
function finishWeek(res){
  const fx=nextFixture(),opp=S.teams[fx.opp],round=S.sched[S.week],list=[];
  for(const [h,a] of round){let gh,ga;if(h===0){gh=res.gf;ga=res.ga;}else if(a===0){gh=res.ga;ga=res.gf;}else[gh,ga]=simAI(h,a);list.push([h,a,gh,ga]);addTable(h,a,gh,ga);}
  S.results[S.week]=list;
  const W=res.gf>res.ga,D=res.gf===res.ga,L=!W&&!D,ss=S.sstat||(S.sstat={l:0,hw:0,hg:0,dw:0});
  h2hRec(opp.name,res.gf,res.ga,'Liga');
  if(W)recNote('win',{gf:res.gf,ga:res.ga,opp:opp.name,s:S.season},x=>res.gf-res.ga>x.gf-x.ga);
  if(L)ss.l++;if(fx.home){ss.hg++;if(W)ss.hw++;}if(opp.rival&&W){ss.dw++;if(ss.dw>=2)unlock('derby');}
  if(W){unlock('win1');if(res.gf-res.ga>=5&&S.li>=2)unlock('five');if(res.low<=-2)unlock('comeback');}
  let df=W?3+Math.round((S.owner.st.sarm-5)*.25):D?0:-4;if(opp.rival)df*=2;
  if(fx.home){df+=S.pt===0?1:S.pt===2?-2:0;if(S.b.fanbiz>=1)df+=1;}
  if(df>0)df=Math.round(df*REG().fan);
  S.fan=clamp(Math.round(S.fan+df+(50-S.fan)*.05),0,100);
  if(S.ultras){let du=W?2:D?-1:-5;if(opp.rival)du=Math.round(du*1.5);if(fx.home)du+=S.pt===0?1:S.pt===2?-2:0;S.ultras.mood=clamp(Math.round(S.ultras.mood+du+(55-S.ultras.mood)*.08),0,100);if(S.ultras.mood<15&&fx.home)news(`${S.ultras.name} bojkotuju utakmicu. Tribina je poluprazna.`);}
  if(fx.home&&S.flags.tv){S.money+=60000;led('tv',60000);}
  addUgled((W?3:D?1:0)+(W&&opp.rival?2:0));
  if(fx.home){const att=attendance(opp.rival),gate=Math.round(att*price()*INC());S.money+=gate;led('gate',gate);S.lastAtt=att;if(recNote('att',{n:att,s:S.season},x=>att>x.n)&&S.season>1)news(`Rekordna poseta: ${thn(att)} gledalaca!`);if(S.b.fanbiz>=1){const f=att*70*(phase()>=2?1.5:1);S.money+=f;led('food',f);}if(S.b.fanbiz>=4){S.money+=400000;led('vip',400000);}}
  const sp=Math.round(sponsorSum()*INC()),{wages,up,loan}=weeklyCosts(),kaf=(S.b.fanbiz>=2?25000:0)+(S.b.fanbiz>=3?Math.round((20000+S.fan*600)/1000)*1000:0);
  S.money+=sp+kaf-wages-up-loan;led('sponsors',sp);led('wages',-wages);led('upkeep',-up);if(kaf)led('kafana',kaf);if(loan)led('loan',-loan);
  S.loans.forEach(l=>l.left--);if(S.loans.some(l=>l.left<=0)){S.loans=S.loans.filter(l=>l.left>0);news('Bankarski kredit je otplaćen.');}
  if(S.flags.bet&&opp.rival){const amt=W?100000:L?-100000:0;S.money+=amt;led('other',amt);news(amt>0?`Dobio si opkladu. Gazda kluba ${short(opp.name)} plaća 100k pred celom kafanom.`:amt<0?`Izgubio si opkladu. 100k ide klubu ${short(opp.name)}. Boli.`:`Nerešeno. Opklada pada, ali niko ni sa kim ne priča.`);delete S.flags.bet;}
  if(S.flags.brawl&&opp.rival){if(Math.random()<.5){S.money-=100000;led('other',-100000);news('Navijači su se potukli posle derbija. Savez kažnjava klub sa 100k.');}delete S.flags.brawl;}
  const starters=new Set([...xiAll(res.xi),...(res.off||[])].map(p=>p.id)),heal=(S.b.medical>=3?.35:S.b.medical>=2?.5:S.b.medical>=1?.75:1)*(1-.08*stR('physio')),pf=S.b.pitch>=4?.5:S.b.pitch>=2?.65:S.b.pitch>=1?.8:1.3;
  const rec=14+stR('fit')*1.5+(has('gvozdena')?4:0)+(S.b.medical>=2?3:0)+(S.b.training>=2?2:0)+(S.coach&&S.coach.style==='trener'?2:0);S.squad.forEach(p=>{p.cond=Math.min(100,(p.cond??100)+rec);});tire(res.xi,res.off||[]);
  S.squad.forEach(p=>{if(p.inj>0&&!starters.has(p.id))p.inj--;});
  S.squad.forEach(p=>{
    if(starters.has(p.id)){if(W&&Math.random()<.4)p.morale=Math.min(5,p.morale+1);if(L&&Math.random()<.3)p.morale=Math.max(1,p.morale-1);
      const pr=.02*pf*(1-.1*LV('fizio'))*(1-.06*stR('physio'))*(S.tactics.press===2?1.3:1)*(p.trait==='krh'?2:1)*(S.flags.cow?2:1)*((p.cond??100)<50?1.6:1);
      if(Math.random()<pr){p.inj=Math.max(1,Math.round(RI(1,4)*heal));news(`${p.name} je povređen, pauzira ${p.inj} ${plu(p.inj,'nedelju','nedelje','nedelja')}.`);}}
    else if(!p.inj&&!p.rest&&Math.random()<.12)p.morale=Math.max(1,p.morale-1);
    if(S.b.changing>=1&&Math.random()<.08)p.morale=Math.min(5,p.morale+1);
    if(S.coach&&S.coach.style==='motiv'&&Math.random()<.12)p.morale=Math.min(5,p.morale+1);
    if(has('glas')&&p.morale<2)p.morale=2;
    p.wedding=false;
  });
  let grew=0;const cb=S.coach?.016*S.coach.r*(S.coach.style==='trener'?1.3:1):0;
  S.squad.forEach(p=>{if(p.inj)return;let ch=.065+cb+(p.age<=21?.01*stR('youth'):0)+persGrow(p,starters)+(S.coach&&S.coach.phil==='mladi'&&p.age<=21?.03:0)+(S.b.training>=3?.08:S.b.training>=2?.055:S.b.training>=1?.04:0)+(p.age<=21?.06+(S.b.academy>=1?.03:0):p.age>=30?-.07:0);if(p.trait==='lenj')ch*=.5;if(ovr(p)>=p.pot)ch*=.15;ch*=DF().tr*(1+.05*LV('tren'))*(obg()==='igrac'?1.08:1);
    if(Math.random()<ch){const k=S.train==='bal'?pick(STATS)[0]:S.train;if(p[k]<20){p[k]++;grew++;}}});
  if(grew)news(`Trening: ${grew} ${plu(grew,'igrač je napredovao','igrača su napredovala','igrača je napredovalo')}.`);
  if(S.flags.kafana&&Math.random()<.35){const p=pick(S.squad);p.fit=Math.max(1,p.fit-1);news(`${p.name} je viđen u kafani Kod Mileta do 3 ujutru. Kondicija pala.`);}
  S.squad.forEach(p=>{if(p.adapt>0){p.adapt--;if(!p.adapt){p.morale=Math.min(5,p.morale+2);news(`${p.name} se navikao na Srbiju. Već psuje na srpskom.`);}}});
  advanceBuilds(1);
  if(S.task){S.task.left--;if(S.task.left<=0)scoutReport();}
  delete S.flags.cow;delete S.flags.snow;
  const home=fx.home,sc=home?`${res.gf}–${res.ga}`:`${res.ga}–${res.gf}`;
  news(`${S.week+1}. kolo: ${home?short(S.club.name):short(opp.name)} ${sc} ${home?short(opp.name):short(S.club.name)}. ${W?'Pobeda':D?'Nerešeno':'Poraz'}.`);
  S.posHist.push(rank().indexOf(0)+1);
  dressingRoom(starters,W,L);
  coachTick(W,L);
  benchWatch(starters);
  rivalTick(opp,W,L);
  paperIssue(W,D,L,opp,res);
  pressAfter(W,D,L,opp,res);
  S.week++;
  if(phase()>=2&&S.squad.length>12&&!S.pending.includes('listbid')){const L=S.squad.filter(p=>p.listed&&!p.inj);L.forEach(p=>p.lw=(p.lw||0)+1);const p0=L.sort((a,b)=>b.lw-a.lw)[0];
    if(p0&&Math.random()<.3+.08*p0.lw){const lv=p0.age>=30?Math.max(0,S.li-1):Math.min(S.li+(Math.random()<.4?1:0),MAXLI),cl=Object.values(world()).filter(c=>c.li===lv&&!S.teams.some(t=>t.name===c.name)).map(c=>c.name),buyer=cl.length?pick(cl):(p0.age>=30?'FK Sloga Lipovac':pick(ABROAD));
      S.lbid={pid:p0.id,buyer,fee:Math.max(10000,Math.round(value(p0)*clamp(.95-.03*p0.lw,.6,.95)*(1+(S.owner.st.biz-5)*.02)/10000)*10000)};S.pending.push('listbid');}}
  if(S.week===12){const lo=S.squad.filter(p=>p.loanIn);if(lo.length)news(`Pozajmice ističu na kraju sezone: ${lo.map(p=>`${p.name} (otkup ${fmt(p.loanIn.buy)})`).join(', ')}. Otkup je na ekranu igrača.`);}
  if(S.week%4===0){refreshFA();monthAward();}
  if(phase()>=4&&(S.week===5||S.week===10)){const lim=LEAGUES[S.li].lvl+.8,c=S.squad.filter(p=>!p.inj&&ovr(p)>=lim).sort((a,b)=>ovr(b)-ovr(a)).slice(0,3);if(c.length){c.forEach(p=>{p.caps=(p.caps||0)+1;p.cond=Math.max(40,(p.cond??100)-15);p.morale=Math.min(5,p.morale+1);if(Math.random()<.08){p.inj=RI(1,2);news(`${p.name} se povredio na okupljanju reprezentacije (${p.inj} ned.).`);}});addUgled(c.length);news(`Reprezentativna pauza: ${c.map(p=>p.name).join(', ')} ${c.length>1?'su pozvani':'je pozvan'} u reprezentaciju Srbije. Vraćaju se umorni.`);}}
  if(S.euro&&S.euro.stage!=='done'&&S.week<14){const e=S.euro,w=S.week;
    if(e.stage==='q'&&w>=1&&w<=6){const r=Math.floor((w-1)/2),leg=(w-1)%2+1;if(r===e.r){e.leg=leg;if(leg===1){e.opp=euroOpp(EURO[e.c].lv[r]);e.home=Math.random()<.5;e.agg=[0,0];}else e.home=!e.home;e.pending=true;S.mq.push({type:'euro'});}}
    else if(e.stage==='group'&&[8,10,12].includes(w)){const md=[8,10,12].indexOf(w);e.md=md;e.opp=e.group[md+1];e.home=md!==1;e.pending=true;S.mq.push({type:'euro'});}
    else if(e.stage==='ko'&&w===13){e.leg=1;e.home=Math.random()<.5;e.agg=[0,0];e.pending=true;S.mq.push({type:'euro'});}}
  if(S.cup&&S.cup.alive&&CUP_WEEKS[S.cup.round]===S.week&&S.week<14){S.cup.opp=cupOpp();S.cup.home=S.cup.round===3?null:Math.random()<.5;S.mq.push({type:'cup'});}
  if(S.week===7&&!S.winter){S.winter=true;S.mq.push({type:'winter'});}
  if(S.week>=14){seasonSummary();S.mq.push({type:'season'});weeklySeasonEnd();scenCheck('season',S.sum);}else drawEvents();
  if(S.money<0&&!S.flags.debtWarned){S.flags.debtWarned=true;news('Zove banka. U minusu si. Sponzori i predsednik opštine postaju nervozni.');S.rel.mayor=clamp(S.rel.mayor-5,-100,100);}
  if(S.money>=0)S.flags.debtWarned=false;
  checkAch();
  {const lim=Math.max(500000,weeklyCosts().wages*10);if(S.money<-lim&&S.squad.length>14){const p=S.squad.filter(x=>!x.forced).sort((a,b)=>value(b)-value(a))[0];if(p){const f=Math.round(value(p)*.6/10000)*10000;S.squad=S.squad.filter(x=>x.id!==p.id);S.money+=f;led('sales',f);S.fan=clamp(S.fan-8,0,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood-10,0,100);news(`Banka se umešala. ${p.name} je prodat za ${fmt(f)} da bi se pokrio dug.`);S.mq.push({type:'outcome',title:'Banka se umešala',msgs:[`Previše si u dugovima. Banka nameće prodaju igrača ${p.name} za ${fmt(f)}, daleko ispod njegove vrednosti.`,'Navijači su besni. Ne puštaj klub u minus.']});}}}
  checkEpilogue();
}
function advanceBuilds(n){
  for(let i=0;i<n;i++)S.queue.forEach(q=>{if(q.permit>0){q.permit--;if(!q.permit)news(`Dozvola odobrena: ${BUILD[q.k].t[q.tier].n}. Radovi počinju.`);}else q.left--;});
  S.queue.filter(q=>q.left<=0).forEach(q=>{S.b[q.k]=q.tier;news(`Završeno: ${BUILD[q.k].t[q.tier].n}.`);if(['changing','stands','academy'].includes(q.k))S.goodwill=clamp(S.goodwill+2,0,100);});
  S.queue=S.queue.filter(q=>q.left>0);
}
function cupOpp(){const r=S.cup.round,L=r===0?LEAGUES[5]:LEAGUES[6],nt=n=>n&&!S.teams.some(t=>t.name===n),wn=Object.values(world()).filter(c=>(r===0?[4,5]:[5,6]).includes(c.li)&&nt(c.name)).map(c=>c.name),names=wn.length?wn:L.names.concat(r>0?[L.rival]:[]).filter(nt);const n=r===3?pick(GIANTS.filter(x=>x!==S.club.name&&!S.teams.some(t=>t.name===x)).concat(names).slice(0,2)):pick(names);const lv=[13.2,14.2,15,15.8][r]+R(-.4,.4);return{name:n,r:lv,atk:lv*R(.95,1.08),def:lv*R(.95,1.08),mid:lv*R(.95,1.08),tempo:RI(0,2),press:RI(0,2),rival:false};}
function finishCup(res){
  tire(res.xi,res.off||[]);
  const c=S.cup,t=c.opp,rn=CUP[c.round];let win=res.gf>res.ga,pens='';
  if(res.gf===res.ga){const gk=res.xi.GK[0]?ovrAt(res.xi.GK[0],'GK'):5,pw=clamp(.5+(gk-t.r)*.03,.25,.75);win=Math.random()<pw;pens=win?' Pobeda posle penala!':' Poraz posle penala.';}
  if(c.home===true){const att=Math.round(Math.min(cap(),attendance(false)*1.6)),gt=att*price();S.money+=gt;led('cup',gt);S.lastAtt=att;}
  const sc=`${short(S.club.name)} ${res.gf}–${res.ga} ${short(t.name)}`;
  h2hRec(t.name,res.gf+(pens&&win?1:0),res.ga+(pens&&!win?1:0),'Kup');
  if(win){const pz=Math.round(CUP_PRIZE[c.round]*(1+.2*LV('kup')));S.money+=pz;led('cup',pz);addUgled([5,8,12,30][c.round]);S.fan=clamp(S.fan+[3,5,8,15][c.round],0,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood+[4,6,10,20][c.round],0,100);xiAll(res.xi).forEach(p=>p.morale=Math.min(5,p.morale+1));
    if(c.round===3){c.alive=false;c.won=true;S.stats.cups=(S.stats.cups||0)+1;S.trophies=S.trophies||[];S.trophies.push(`Kup Srbije, ${S.season}. sezona`);news(`OSVAJAČI KUPA SRBIJE! ${sc}.${pens} Celo selo ${S.club.village} je na ulicama.`);S.modal={type:'outcome',title:'Kup Srbije',msgs:[`${sc}.${pens}`,`Osvojili ste Kup Srbije! Nagrada: ${fmt(pz)}. O ovome će se u selu ${S.club.village} pričati sto godina.`]};}
    else{c.round++;news(`Kup Srbije, ${rn.toLowerCase()}: ${sc}.${pens} Dalje, sledi: ${CUP[c.round].toLowerCase()}.`);S.modal={type:'outcome',title:'Kup Srbije',msgs:[`${sc}.${pens}`,`Prolaz dalje! Sledi: ${CUP[c.round].toLowerCase()}. Nagrada: ${fmt(pz)}.`]};}}
  else{c.alive=false;c.out=rn;news(`Kup Srbije, ${rn.toLowerCase()}: ${sc}. Ispadanje.${pens}`);S.modal={type:'outcome',title:'Kup Srbije',msgs:[`${sc}.${pens}`,`Kraj puta u kupu. Ispali ste, faza: ${rn.toLowerCase()}.`]};}
  c.opp=null;
}
function euroOpp(lv){const e=S.euro,pool=EUROC.filter((c,i)=>(lv>=16.4?i>=17:lv>=15.4?i>=8&&i<20:i<14)&&!e.used.includes(c[0]));const c=pick(pool.length?pool:EUROC);e.used.push(c[0]);const r=lv+R(-.3,.3);return{name:c[0],country:c[1],r,atk:r*R(.95,1.08),def:r*R(.95,1.08),mid:r*R(.95,1.08),tempo:RI(0,2),press:RI(0,2),rival:false};}
function gAdd(x,y,gx,gy){x.gf+=gx;x.ga+=gy;y.gf+=gy;y.ga+=gx;if(gx>gy)x.pts+=3;else if(gx<gy)y.pts+=3;else{x.pts++;y.pts++;}}
function euroGroup(c){const E=EURO[c],e=S.euro;e.c=c;e.stage='group';e.md=0;e.group=[{name:S.club.name,me:1,pts:0,gf:0,ga:0}].concat(shuffle(E.g).map(l=>({...euroOpp(l),pts:0,gf:0,ga:0})));S.money+=E.gp;led('euro',E.gp);addUgled(25);S.fan=clamp(S.fan+10,0,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood+15,0,100);S.stats.euroBest=Math.max(S.stats.euroBest||0,3);e.best=`${E.n}, grupna faza`;news(`GRUPNA FAZA! ${S.club.name} igra u takmičenju ${E.n}.`);return `${E.n}: vi ste u grupnoj fazi! ${fmt(E.gp)} od UEFA. Vaša grupa: ${e.group.slice(1).map(x=>`${x.name} (${x.country})`).join(', ')}.`;}
function finishEuro(res){
  tire(res.xi,res.off||[]);
  const e=S.euro,E=EURO[e.c],t=e.opp,msgs=[`${short(S.club.name)} ${res.gf}–${res.ga} ${t.name}`];e.pending=false;
  if(e.home){const att=Math.round(Math.min(cap(),attendance(false)*1.8)),gt=Math.round(att*price());S.money+=gt;led('euro',gt);S.lastAtt=att;}
  if(res.gf>res.ga)xiAll(res.xi).forEach(p=>p.morale=Math.min(5,p.morale+1));
  if(e.stage==='q'||e.stage==='ko'||e.stage==='ko2'){
    e.agg[0]+=res.gf;e.agg[1]+=res.ga;
    if(e.leg===1){msgs.push(`Prva utakmica je odigrana. Revanš ${e.stage==='q'?'je sledeće nedelje':'sledi odmah, kad budeš spreman'}.`);if(e.stage==='ko'||e.stage==='ko2'){e.leg=2;e.home=!e.home;e.pending=true;S.mq.unshift({type:'euro'});}}
    else{let win=e.agg[0]>e.agg[1],pens='';
      if(e.agg[0]===e.agg[1]){const gk=res.xi.GK[0]?ovrAt(res.xi.GK[0],'GK'):5,pw=clamp(.5+(gk-t.r)*.03,.25,.75);win=Math.random()<pw;pens=win?' Prolaz posle penala!':' Ispadanje posle penala.';}
      msgs.push(`Ukupno ${e.agg[0]}–${e.agg[1]}.${pens}`);
      if(e.stage==='ko2'){const r=e.r2;
        if(win){const pz=Math.round(E.kp*[1.5,2,3,6][r]);S.money+=pz;led('euro',pz);addUgled([30,40,60,120][r]);S.fan=clamp(S.fan+[6,8,12,25][r],0,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood+[6,8,12,25][r],0,100);S.stats.euroBest=Math.max(S.stats.euroBest||0,6+r);e.r2++;
          if(e.r2>=4){e.stage='done';e.best=`${E.n}, pobednik`;S.trophies.push(`${E.n}, ${S.season}. sezona`);msgs.push(`PRVACI EVROPE! ${S.club.name} osvaja takmičenje ${E.n}. ${fmt(pz)}. Selo ${S.club.village} ne spava tri dana.`);news(`${S.club.name} je osvojio ${E.n}!`);}
          else{e.best=`${E.n}, ${KO2[e.r2].toLowerCase()}`;e.opp=euroOpp(E.ko+.4*(e.r2+1));msgs.push(`Prolaz! Sledi ${KO2[e.r2].toLowerCase()} protiv kluba ${e.opp.name}. Nagrada: ${fmt(pz)}.`);news(`${E.n}: ${S.club.name} u rundi ${KO2[e.r2].toLowerCase()}!`);}}
        else{e.stage='done';e.best=`${E.n}, ${KO2[r].toLowerCase()}`;msgs.push(`Kraj puta u rundi ${KO2[r].toLowerCase()}. Ali Evropa sada zna za ${S.club.village}.`);}
      }else if(e.stage==='q'){
        if(win){const pz=E.pr[e.r];S.money+=pz;led('euro',pz);addUgled(6+e.r*3);S.fan=clamp(S.fan+4,0,100);S.stats.euroBest=Math.max(S.stats.euroBest||0,2);e.r++;
          if(e.r===3)msgs.push(euroGroup(e.c));else{msgs.push(`Prolaz dalje! Sledi: ${EQ[e.r].toLowerCase()}. Nagrada: ${fmt(pz)}.`);news(`${E.n}: prolaz protiv kluba ${t.name}.`);}}
        else if(e.r===2&&e.c!=='uecl'){const nc=e.c==='ucl'?'uel':'uecl';msgs.push(`Ispali ste iz takmičenja ${E.n}, ali prelazite u: ${EURO[nc].n}.`);msgs.push(euroGroup(nc));}
        else{e.stage='done';e.best=e.best||`${E.n}, ${EQ[e.r].toLowerCase()}`;msgs.push(`Kraj evropskog puta: ${E.n}.`);news(`${E.n}: ispadanje protiv kluba ${t.name}.`);}
      }else{
        if(win){S.money+=E.kp;led('euro',E.kp);addUgled(30);S.stats.euroBest=Math.max(S.stats.euroBest||0,5);e.best=`${E.n}, osmina finala`;S.trophies.push(`${E.n}, osmina finala, ${S.season}. sezona`);msgs.push(`${E.n}: osmina finala! ${fmt(E.kp)}. Srbija ne priča ni o čemu drugom.`);news(`${S.club.name} u osmini finala, takmičenje: ${E.n}!`);e.stage='ko2';e.r2=0;e.opp=euroOpp(E.ko+.4);msgs.push(`Evropsko proleće počinje posle prvenstva: osmina finala protiv kluba ${e.opp.name}.`);}
        else{msgs.push('Ispadanje u nokaut plej-ofu. Ali kakav put!');e.stage='done';}}
    }
  }else{
    const me=e.group[0];gAdd(me,t,res.gf,res.ga);const o=[[2,3],[1,3],[1,2]][e.md],a=e.group[o[0]],b=e.group[o[1]];gAdd(a,b,poisson(1.3*Math.pow(a.r/b.r,1.6)),poisson(1.3*Math.pow(b.r/a.r,1.6)));
    if(res.gf>res.ga){S.money+=E.gw;led('euro',E.gw);addUgled(5);}
    const ord=e.group.slice().sort((x,y)=>y.pts-x.pts||(y.gf-y.ga)-(x.gf-x.ga));
    msgs.push('Grupa: '+ord.map(x=>`${x.me?short(x.name):x.name} ${x.pts}`).join(' · '));
    if(e.md===2){const pos=ord.indexOf(me)+1;if(pos<=2){e.stage='ko';e.opp=euroOpp(E.ko);S.stats.euroBest=Math.max(S.stats.euroBest||0,4);e.best=`${E.n}, nokaut plej-of`;addUgled(15);msgs.push(`${pos}${ordSuf(pos)} mesto u grupi: nokaut plej-of protiv kluba ${e.opp.name}!`);}else{e.stage='done';msgs.push(`${pos}${ordSuf(pos)} mesto u grupi. Ispadanje, ali uzdignute glave.`);}}
  }
  S.modal={type:'outcome',title:E.n,msgs};checkEpilogue();scenCheck('euro');
}
function aiAdapt(){
  const o=M.ot,t=S.tactics,tn=esc(short(M.oppT.name)),ch=[];
  if(M.g[1]<=M.g[0]&&Math.random()<DF().ad){
    if(t.press===2&&o.tempo!==2){o.tempo=2;ch.push('igraju direktno preko tvog presa');}
    if(t.tempo===0&&o.press!==2){o.press=2;ch.push('presuju visoko protiv tvoje spore igre');}
    else if(t.tempo===2&&o.press===2){o.press=1;ch.push('više ne presuju tako visoko');}
    if(M.g[1]<M.g[0]&&o.instr!==2&&Math.random()<.5){o.instr=2;ch.push('šalju ljude u napad');}
  }else if(M.g[1]>M.g[0]&&Math.random()<DF().ad){o.instr=0;ch.push('povlače se da sačuvaju vođstvo');}
  if(ch.length)M.feed.push({m:'46',t:`${tn} menja plan: ${ch.join(' i ')}.`,k:'why'});
}
function analystAdvice(t,ot){const a=[];if(t.press===2)a.push('Presuju visoko: igraj direktno.');if(t.tempo===0)a.push('Sporo grade napad: presuj visoko.');if(ot.instr===0)a.push('Parkiraće autobus.');if(!a.length)a.push('Nema jasne slabosti. Drži formaciju.');return a.join(' ');}
function scoutTripCost(){return Math.round(40000*(1+S.li)*(1+S.li*.5)/10000)*10000;}
function scoutReport(){
  if(S.task.reg){const {pos,focus,reg}=S.task;S.report=(has('skaut')?[0,1,2,3]:[0,1,2]).map(()=>{const p=intlPlayer(pos,reg,focus==='young'?0:.4,focus==='young');p.fee=Math.round(p.fee*.9/10000)*10000;return p;});S.task=null;news(`Skaut se vratio iz regije ${IREG[reg].n} sa tri imena. Pogledaj ekran Ekipa.`);return;}
  const {pos,focus}=S.task,L=LEAGUES[S.li],others=S.teams.filter(t=>!t.me).map(t=>t.name);
  S.report=(has('skaut')?[0,1,2,3]:[0,1,2]).map(()=>{const p=focus==='young'?genPlayer(pos,L.lvl-3+R(0,1),{age:RI(17,20)}):genPlayer(pos,L.lvl-1.4+R(0,1.6),{age:RI(23,29)});
    if(focus==='young')p.pot=clamp(p.pot+RI(1,4),1,20);p.scouted=true;p.from=pick(others);p.fee=Math.round(value(p)*.9*(has('pregovarac')?.85:1)/10000)*10000;return p;});
  S.task=null;news(`Izveštaj skauta je spreman: ${has('skaut')?'četiri':'tri'} ${focus==='young'?'mlada ':''}${pos==='GK'?'golmana':pos==='DEF'?'odbrambena igrača':pos==='MID'?'vezna igrača':'napadača'}. Pogledaj ekran Ekipa.`);
}

