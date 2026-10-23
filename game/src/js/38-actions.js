/* ---------- actions ---------- */
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const t=localStorage.getItem(KEY);return t?JSON.parse(t):null;}catch(e){return null;}}
function commit(){nextModal();save();render();}
const A={
  tab:v=>{S.tab=v;window.scrollTo(0,0);},
  col:v=>{SET.col=v;},realon:v=>{SET.realOn=v==='1';},realpick:v=>{SET.real=v;if(CLUBCOL[v])SET.col=CLUBCOL[v];},
  csh:v=>{crestTgt().sh=v;},cpt:v=>{crestTgt().pt=v;},csy:v=>{crestTgt().sy=v;},crestedit:()=>{S.modal={type:'crestedit'};},bg:v=>{SET.bg=v;},startph:v=>{SET.start=v;},diff:v=>{SET.diff=v;},
  start:()=>{newGame();},
  sqtab:v=>{S.sqTab=v;window.scrollTo&&window.scrollTo(0,0);},sqsort:v=>{S.sqSort=v;},
  weekly:()=>{startWeekly();},
  retire:()=>{S.modal={type:'retire'};},
  retireyes:()=>{S.flags.retired=1;hofSave();lpAward();S.modal={type:'finalepi'};},
  scen:v=>{startScen(v);window.scrollTo(0,0);},
  backyes:v=>{const x=(S.exP||[]).find(y=>y.n===v);if(!x||S.squad.length>=maxSquad()){S.modal=null;return;}const pl=genPlayer(x.pos,x.o,{age:x.age,job:'legenda se vratila'});pl.name=x.n;pl.wage=Math.round(wageFor(pl)*.5/100)*100;pl.ce=S.season+1;pl.signed=S.season;pl.morale=5;pl.trait='ljub';S.squad.push(pl);x.st='kod kuće';x.hist.push(`${S.season}. sez: vratio se kući`);S.goodwill=clamp(S.goodwill+6,0,100);S.fan=clamp(S.fan+5,0,100);news(`${x.n} se vratio kući! Selo slavi.`);S.modal={type:'outcome',title:'Povratak kući',msgs:[`${x.n} ponovo nosi dres kluba.`,'Naklonost sela i navijači rastu.']};},
  autosim:v=>{if(pendKind()||S.week>=14)return;if(S.pending.length&&v!=='del'){S.modal={type:'event',id:S.pending[0]};return;}if(!autoSim(v))toast('Nema šta da se simulira.');window.scrollTo(0,0);},
  errclear:()=>{const m=meta();m.errs=[];saveMeta();},
  dyn:v=>{if(!S||!S.flags.retired)return;dynTakeover(v);window.scrollTo(0,0);S.tab='home';},
  epidone:()=>{try{localStorage.removeItem(KEY);}catch(e){}S=null;M=null;applyRealWorld(null);SET.shop=lgM().pts>0?1:0;if(typeof window!=='undefined')window.scrollTo(0,0);},
  lshop:()=>{SET.shop=1;SET.lref=0;if(typeof window!=='undefined')window.scrollTo(0,0);},lclose:()=>{SET.shop=0;SET.lref=0;},
  lbuy:v=>{const g=lgM(),k=LPERKS.find(x=>x.id===v);if(!k)return;const lv=g.spent[k.id]||0,c=lpCost(k,lv);if(lv>=k.max||g.pts<c)return;g.pts-=c;g.spent[k.id]=lv+1;SET.lref=0;saveMeta();toast(`${k.n}: nivo ${lv+1}`);},
  lref:()=>{if(!SET.lref){SET.lref=1;return;}const g=lgM();let s=0;LPERKS.forEach(k=>{for(let i=0;i<(g.spent[k.id]||0);i++)s+=lpCost(k,i);});g.pts+=Math.floor(s*.8);g.spent={};SET.lref=0;saveMeta();toast('Veštine vraćene');},
  play:()=>{S.hold=0;if(S.pending.length)S.modal={type:'event',id:S.pending[0]};else if(openPend())return;else{openMatch();return 'skip';}},
  later:()=>{S.modal=null;S.hold=1;},latertac:()=>{S.modal=null;S.hold=1;S.tab='tac';window.scrollTo(0,0);},pendmatch:()=>{openPend();},
  eurolate:()=>{const e=S.euro;if(!euroLate()||e.pending)return;e.pending=true;e.agg=[0,0];if(e.r2===3){e.leg=2;e.home=false;}else{e.leg=1;e.home=Math.random()<.5;}S.hold=0;S.modal={type:'euro'};},
  evch:v=>{
    const id=S.pending[0],e=EVENTS.find(x=>x.id===id),c=e.ch(S)[+v];let msgs=[];
    if(c.chk){const ok=S.owner.st[c.chk[0]]+RI(0,6)+(c.chk[0]==='sarm'&&has('kafanska')?2:0)+(c.chk[0]==='biz'&&has('pregovarac')?2:0)>=c.chk[1];msgs=applyD(ok?c.d:c.f);const t=ok?c.ok:c.no;if(t)msgs.unshift(t);}
    else msgs=applyD(c.d);
    S.used[id]=e.once?'once':S.season;S.pending.shift();
    const tx=fx(c.chk?null:c.d);news(`${e.title}: ${c.l}.`);
    S.modal={type:'outcome',title:e.title,msgs:msgs.length?msgs:[tx?`${c.l}. ${tx}`:`${c.l}.`],cont:S.pending.length?'event':null};
    if(S.sellNego){S.modal=S.sellNego;S.modal.cont=S.pending.length?'event':null;S.sellNego=null;}
  },
  paper:()=>{S.paperNew=0;S.modal={type:'paper'};},
  sellask:v=>{const m=S.modal;if(!m||m.type!=='sellhag'||m.deal||m.gone)return 'skip';if(v==='take'){m.deal=m.offer;m.log.push({who:'you',t:`Prihvataš ${fmt(m.offer)}.`});}else sellAsk(m,v==='mid'?(m.last+m.offer)/2:+v);renderModal();return 'skip';},
  sellx:v=>{const m=S.modal;if(!m||m.type!=='sellhag')return;const p=S.squad.find(x=>x.id===m.pid),cont=m.cont;let msgs=[];
    if(v==='deal'&&p){msgs=[sellPlayer(p,m.deal,m.buyer)];if(m.deal>m.orig)msgs.push(`${fmt(m.deal-m.orig)} više od njihove prve ponude.`);}
    else if(v==='keep'&&p){p.listed=false;msgs=[`${p.name} ostaje.`];news(`Odbijaš ${short(m.buyer)} za igrača ${p.name}.`);}
    else msgs=[`${short(m.buyer)} je odustao.`];
    S.modal={type:'outcome',title:'Transfer',msgs,cont};},
  ok:()=>{const m=S.modal;S.modal=null;tapRelease=null;if(m&&m.type==='outcome'&&m.cont&&S.pending.length)S.modal={type:'event',id:S.pending[0]};},
  quick:()=>{M.phase='live';for(let c=0;c<3;c++)simChunk(c);M.c=3;whyLines(true).forEach(t=>M.feed.push({m:'POL',t,k:'why'}));aiAdapt();for(let c=3;c<6;c++)simChunk(c);M.c=6;M.phase='done';whyLines(false).forEach(t=>M.feed.push({m:'KRAJ',t,k:'why'}));SFX.full(M.g[0],M.g[1]);renderModal();return 'skip';},
  kick:()=>{M.phase='live';vizStart();renderModal();SFX.matchStart();M.timer=setTimeout(tick,500);return 'skip';},
  pressans:v=>{const m=S.modal;if(!m||m.type!=='press'||m.i>=m.qs.length)return 'skip';const [t,d,note]=PRESSQ[m.qs[m.i]].a[+v];m.log.push({a:t,fx:pressApply(d,m),note});m.i++;renderModal();return;},
  promox:()=>{if(S&&S.modal){S.modal.seen=1;renderModal();}return 'skip';},
  celx:()=>{if(M){M.cel=null;clearTimeout(M.celT);renderModal();}return 'skip';},
  fast:()=>{if(M.km){const c=M.c;M.kmDone[c]=0;M.km=null;}M.fast=true;M.pause=false;M.cel=null;clearTimeout(M.timer);tick();return 'skip';},
  shout:v=>{if(!M||M.phase!=='live')return 'skip';const h=M.c<3?0:1;if(M.shouts[h]>=2||(M.shout&&M.shout.c>=M.c))return 'skip';M.shouts[h]++;M.shout={k:v,c:M.c};const m=Math.max(1,Math.min(90,M.c*15));
    M.feed.push({m,t:`Gazda viče sa klupe: „${{push:'Napred! Svi u napad!',hold:'Čuvajte rezultat, polako!',calm:'Smirite se, igrajte svoju igru!'}[v]}”`,k:'shout'});
    if(S.coach&&M.shouts[0]+M.shouts[1]>=3){trustAdj(-3);M.feed.push({m,t:`${esc(S.coach.name.split(' ')[0])} odmahuje glavom. Ne voli kad se gazda meša.`,k:''});}renderModal();return 'skip';},
  kmc:v=>{const k=M&&M.km;if(!k)return 'skip';if(k.k==='pen'&&k.step===0){k.tk=+v;k.step=1;renderModal();return 'skip';}kmResolve(k,v);M.km=null;M.pause=false;renderModal();clearTimeout(M.timer);M.timer=setTimeout(tick,M.feed[M.feed.length-1]&&/goal/.test(M.feed[M.feed.length-1].k)?3400:900);return 'skip';},
  rolecyc:v=>{const [id,pos]=String(v).split(':'),p=S.squad.find(x=>x.id===+id),L=ROLES[pos];if(!p||!L)return;const cur=roleOf(p,pos),i=L.findIndex(r=>r[0]===cur);p.rl=p.rl||{};p.rl[pos]=L[(i+1)%L.length][0];},
  ownact:()=>{ownAct();},
  capset:v=>{const p=S.squad.find(x=>x.id===+v);if(!p)return;const old=capOf();S.capId=p.id;p.morale=Math.min(5,p.morale+1);if(old&&old!==p){old.morale=Math.max(1,old.morale-(persOf(old).k==='amb'?2:1));S.harmony=clamp(harmony()-2,0,100);}news(`${p.name} je novi kapiten${old&&old!==p?`. ${old.name} je predao traku, nije srećan`:''}.`);toast(`Kapiten: ${p.name}`);},
  meetopen:()=>{if(meetReady())S.modal={type:'meeting'};},meet:v=>{if(meetReady())meetDo(v);},
  subopen:()=>{if(!M||M.phase!=='live'||M.subs>=3)return 'skip';M.pause=true;M.manual=true;M.subOut=null;clearTimeout(M.timer);renderModal();return 'skip';},
  subclose:()=>{if(!M)return 'skip';M.pause=false;M.subOut=null;renderModal();if(M.phase==='live'){clearTimeout(M.timer);M.timer=setTimeout(tick,600);}return 'skip';},
  subout:v=>{if(!M)return 'skip';M.subOut=+v||null;renderModal();return 'skip';},
  subin:v=>{if(!M||M.subs>=3)return 'skip';const o=xiAll(M.xi).find(p=>p.id===M.subOut),n=S.squad.find(p=>p.id===+v);if(o&&n){M.manual=true;if(S.coach)trustAdj(-1);doSub(o,n,'',M.phase==='ht'?45:Math.max(1,Math.min(90,M.c*15)));}M.subOut=null;renderModal();return 'skip';},
  httempo:v=>{S.tactics.tempo=+v;renderModal();return 'skip';},htpress:v=>{S.tactics.press=+v;renderModal();return 'skip';},
  ht:v=>{M.ht=v;M.subOut=null;if(v==='talk')xiAll(M.xi).forEach(p=>p.morale=Math.min(5,p.morale+1));M.feed.push({m:'46',t:{keep:'Isti sastav, isti plan.',push:'Govoriš im da sve bace u napad.',sit:'Govoriš im da se povuku i izdrže.',talk:'Mirna reč za svakoga. Glave gore.'}[v],k:''});aiAdapt();M.phase='live';M.fast=false;renderModal();SFX.second();M.timer=setTimeout(tick,600);return 'skip';},
  endmatch:()=>{SFX.crowdStop();applyRatings(matchRatings());const res={gf:M.g[0],ga:M.g[1],xi:M.xi,off:M.off.slice(),low:M.low??0},cup=M.cup,eu=M.euro;clearTimeout(M.timer);M=null;S.modal=null;const snap=weekSnap();if(eu)finishEuro(res);else if(cup)finishCup(res);else finishWeek(res);weekDiff(snap,res,eu?'Evropa':cup?'Kup Srbije':'Liga');},
  europlay:()=>{openMatch('euro');return 'skip';},
  vp:k=>{const v=VP.find(x=>x.k===k);if(!v||S.vp.includes(k)||S.money<v.c)return;S.money-=v.c;led('village',-v.c);S.vp.push(k);S.goodwill=clamp(S.goodwill+8,0,100);addUgled(5);news(`Završeno: ${v.n}. Selo ${S.club.village} ovo neće zaboraviti.`);checkEpilogue();},
  cupplay:()=>{openMatch(true);return 'skip';},
  useplan:()=>{const t=M.oppT;if(t.press===2)S.tactics.tempo=2;if(t.tempo===0)S.tactics.press=2;M.plan=true;save();renderModal();return 'skip';},
  hireanalyst:()=>{S.analyst={name:pick(FIRST)+' '+pick(LAST),wage:60000};news(`${S.analyst.name} dolazi kao analitičar. Doneo je tri laptopa.`);},
  fireanalyst:()=>{if(S.analyst)news(`${S.analyst.name} odlazi. Laptopovi idu sa njim.`);S.analyst=null;},
  sound:()=>{SFX.toggle();if(S&&S.modal)renderModal();return S&&S.modal?'skip':undefined;},
  cancelmatch:()=>{SFX.crowdStop();clearTimeout(M&&M.timer);const pk=M&&(M.cup||M.euro);M=null;S.modal=null;S.tab='tac';if(pk)S.hold=1;},
  form:v=>{S.tactics.form=v;},tempo:v=>{S.tactics.tempo=+v;},press:v=>{S.tactics.press=+v;},width:v=>{S.tactics.width=+v;},instr:v=>{S.tactics.instr=+v;},
  train:v=>{S.train=v;},price:v=>{S.pt=+v;},
  mica:()=>{if(S.coach){S.coach=null;news('Čika Mića je otpušten. Nosi svoju pištaljku sa sobom.');}else{S.coach={name:'Miodrag „Čika Mića”',r:3,style:'motiv',phil:'mladi',trust:65,age:61,wage:Math.round(6000*(1+.25*S.li))};news('Čika Mića je novi trener. Doneo je svoju pištaljku.');}},
  coaches:()=>{S.modal={type:'coaches'};},
  hirecoach:v=>{const c=S.coaches[+v];if(!c)return;if(S.coach)news(`${S.coach.name} je smenjen.`);S.coach=c;S.coaches.splice(+v,1);S.modal=null;news(`${c.name} je novi trener (${CSTY[c.style][0]}).`);},
  firecoach:()=>{if(!S.coach)return;const pay=S.coach.wage*4;S.money-=pay;led('other',-pay);coachX(S.coach);if(S.coach.trust>=60){S.harmony=clamp(harmony()-6,0,100);news(`${S.coach.name} je otpušten. Igrači su ga voleli; u svlačionici je tišina. Otpremnina: ${fmt(pay)}.`);}else news(`${S.coach.name} je otpušten. Otpremnina: ${fmt(pay)}.`);S.coach=null;},
  creq:v=>{const m=S.modal,c=coachX(S.coach);if(!m||!c){S.modal=null;return;}if(v==='yes'){c.req=m.q;trustAdj(2);news(`Obećao si treneru: ${reqText(m.q)}`);}else if(v==='later')trustAdj(-6);else{trustAdj(-12);addUgled(1);}c.reqCd=nowW()+3;S.modal=null;},
  cult:v=>{const c=S.coach;S.modal=null;if(!c)return;if(v==='raise'){c.wage=Math.round(c.wage*1.3/500)*500;c.trust=55;news(`Javno si stao iza trenera ${c.name}. Dobio je povišicu.`);}else if(v==='go'){news(`${c.name} odlazi. „Želim klubu sreću. Gazdi malo manje.”`);S.coach=null;S.coaches=[];S.harmony=clamp(harmony()-5,0,100);}else trustAdj(-5);},
  hirescout:()=>{S.scout={name:pick(FIRST)+' '+pick(LAST),wage:scoutWage()};news(`${S.scout.name} dolazi kao skaut. Zna svaki teren u okrugu.`);},
  scoutsend:()=>{S.modal={type:'scoutsend'};},
  spos:v=>{scoutPick.pos=v;},sfocus:v=>{scoutPick.focus=v;},sreg:v=>{scoutPick.reg=v;},
  scoutgo:()=>{const rg=scoutPick.reg&&scoutPick.reg!=='dom'&&iRegs().includes(scoutPick.reg)?scoutPick.reg:null;if(rg){const c=scoutTripCost();if(S.money<c){toast('Nema para za put.');return 'skip';}S.money-=c;led('transfers',-c);}S.task={pos:scoutPick.pos,focus:scoutPick.focus,left:rg?3:2,reg:rg};S.report=[];S.modal=null;},
  offer:v=>{const [l,i]=lp(v);S.modal={type:'offer',i,list:l};},
  buy:v=>{if(S.chall==='local')return;const [l,i]=lp(v),p=S[l][i];if(!p||S.money<p.fee||S.squad.length>=maxSquad())return;{const N=natOf(p);if(N&&N.r!=='balkan'&&forCnt()>=forLim()){toast(`Limit za strance je ${forLim()}. Prvo prodaj nekog stranca.`);return;}}signScouted(i,p.fee,l);},
  haggle:v=>{if(S.chall==='local')return;const [l,i]=lp(v);haggleOpen(l,i);},
  hoff:v=>{const m=S.modal;if(!m||m.type!=='haggle'||m.deal||m.gone)return 'skip';if(v==='ask'){m.log.push({who:'you',t:`Plaćaš traženu cenu.`});m.deal=m.ask;m.wage=haggleWage(S[m.list][m.i],m.list);}else haggleOffer(m,v==='mid'?(m.last+m.ask)/2:+v);renderModal();return 'skip';},
  hwage:v=>{const m=S.modal;if(!m||!m.deal)return;haggleSign(m,v==='1');},
  lowball:v=>{if(S.chall==='local')return;const [l,i]=lp(v),p=S[l][i];if(!p)return;const low=Math.round(p.fee*.8/10000)*10000;if(S.money<low||S.squad.length>=maxSquad())return;
    if(S.owner.st.biz+RI(0,6)+(has('pregovarac')?2:0)>=(l==='stars'?14:11)){signScouted(i,low,l);}else{S[l].splice(i,1);S.modal={type:'outcome',title:'Transfer',msgs:[`${short(p.from)} spušta slušalicu. ${p.name} potpisuje na drugom mestu.`]};}},
  renew:v=>{const p=S.squad.find(x=>x.id===+v);if(!p)return;setWage(p,renewWage(p));p.ce=S.season+(p.age>=31?2:3);p.morale=Math.min(5,p.morale+1);news(`${p.name} potpisuje novi ugovor do kraja ${p.ce}. sezone: ${fmt(p.wage)}/ned.`);},
  renewlow:v=>{const p=S.squad.find(x=>x.id===+v);if(!p)return;const ok=S.owner.st.sarm+RI(0,6)+(has('pregovarac')?2:0)>=(statusOf(p)==='k'?13:10);if(ok){setWage(p,Math.max(p.wage,renewWage(p)*.87));p.ce=S.season+2;S.modal={type:'outcome',title:'Ugovor',msgs:[`${p.name} prihvata manje. Novi ugovor: ${fmt(p.wage)}/ned., do kraja ${p.ce}. sezone.`]};}else{p.leaving=true;p.morale=Math.max(1,p.morale-2);S.modal={type:'outcome',title:'Ugovor',msgs:[`${p.name} je uvređen. „Onda idem tamo gde me cene.” Odlazi leti kao slobodan igrač.`]};}},
  letgo:v=>{const p=S.squad.find(x=>x.id===+v);if(!p)return;p.leaving=true;news(`${p.name} neće dobiti novi ugovor. Odlazi leti.`);},
  unh:v=>{const m=S.modal,p=m&&S.squad.find(x=>x.id===m.pid);S.modal=null;if(!p)return;p.bench=0;if(v==='promise'){p.promise=nowW()+3;p.morale=Math.min(5,p.morale+1);trustAdj(-4);news(`Obećao si igraču ${p.name} mesto u timu.`);}else if(v==='fight'){p.morale=Math.max(1,p.morale-1);if(['amb','bunt'].includes(persOf(p).k)){p.listed=true;news(`${p.name} traži transfer.`);}}else{p.listed=true;news(`${p.name} je na transfer listi.`);}},
  ksign:v=>{const p=(S.intake||[]).find(x=>x.id===+v);if(!p||p.ksg||S.squad.length>=maxSquad())return;p.ksg=1;S.squad.push(p);S.stats.kids=(S.stats.kids||0)+1;news(`${p.name} (${p.age}) potpisuje prvi ugovor sa klubom.`);},
  kdone:()=>{const left=(S.intake||[]).filter(p=>!p.ksg);if(left.length)news(`Bez ugovora ostaju: ${left.map(p=>p.name).join(', ')}. Igraće za susedno selo.`);if(left.some(p=>p.hype))S.goodwill=clamp(S.goodwill-3,0,100);S.intake=null;S.modal=null;},
  pcamp:v=>{S.pre.camp=v;},pfr:v=>{S.pre.fr=v;},pgo:()=>{preGo();},
  loanout:v=>{const p=S.squad.find(x=>x.id===+v);if(!p||p.age>21||phase()<2)return;const cl=Object.values(world()).filter(c=>c.li===Math.max(0,S.li-1)&&!S.teams.some(t=>t.name===c.name)),to=cl.length?pick(cl).name:'FK Susedno Selo';S.squad=S.squad.filter(x=>x!==p);(S.onLoan=S.onLoan||[]).push({p,to});S.modal=null;news(`${p.name} ide na pozajmicu u ${short(to)} do kraja sezone.`);},
  staffopen:k=>{S.modal={type:'staffhire',k};},
  staffhire:v=>{const m=S.modal,c=S.staffC&&S.staffC[m.k]&&S.staffC[m.k][+v];if(!c)return;S.staff=S.staff||{};S.staff[m.k]=c;S.staffC[m.k]=null;S.modal=null;news(`${c.name} dolazi kao ${STAFF[m.k].n.toLowerCase()}.`);},
  stafffire:k=>{const s=S.staff&&S.staff[k];if(!s)return;const pay=s.wage*2;S.money-=pay;led('other',-pay);news(`${s.name} odlazi. Otpremnina: ${fmt(pay)}.`);S.staff[k]=null;},
  nfilt:v=>{S.nf=v;},mark:v=>{S.tactics.mark=+v;},
  sptaker:()=>{const xs=xiAll(pickXI()).sort((a,b)=>b.tec-a.tec).slice(0,5);if(!xs.length)return;const i=xs.findIndex(p=>p.id===S.tactics.sp);S.tactics.sp=xs[(i+1)%xs.length].id;},
  club:v=>{const t=S.teams[+v];if(t)S.modal={type:'club',name:t.name};},
  player:v=>{tapRelease=null;S.modal={type:'player',id:+v};},
  rest:v=>{const p=S.squad.find(x=>x.id===+v);if(p)p.rest=!p.rest;},
  list:v=>{const p=S.squad.find(x=>x.id===+v);if(p&&!p.loanIn){p.listed=!p.listed;p.lw=0;}},
  loanin:v=>{const p=(S.loanMkt||[])[+v];if(!p||S.money<p.loan.fee||S.squad.filter(x=>x.loanIn).length>=3||S.squad.length>=maxSquad())return;S.money-=p.loan.fee;led('transfers',-p.loan.fee);
    p.loanIn={from:p.loan.from,buy:p.loan.buy,s:S.season};delete p.loan;delete p.fee;p.ce=S.season+1;p.signed=S.season;S.squad.push(p);S.loanMkt.splice(+v,1);news(`${p.name} stiže na pozajmicu iz kluba ${short(p.loanIn.from)} do kraja sezone. Opcija otkupa: ${fmt(p.loanIn.buy)}.`);S.modal={type:'outcome',title:'Pozajmica',msgs:[`${p.name} je tvoj do kraja sezone.`,`Otkup bilo kad za ${fmt(p.loanIn.buy)}, na ekranu igrača.`]};},
  loanbuy:v=>{const p=S.squad.find(x=>x.id===+v);if(!p||!p.loanIn||S.money<p.loanIn.buy)return;const c=p.loanIn.buy,from=p.loanIn.from;S.money-=c;led('transfers',-c);delete p.loanIn;p.wage=wageFor(p);p.ce=S.season+2;news(`${p.name} ostaje! Otkupljen od kluba ${short(from)} za ${fmt(c)}.`);S.modal={type:'outcome',title:'Otkup',msgs:[`${p.name} je sada tvoj igrač. Ugovor do kraja ${S.season+2}. sezone, plata ${fmt(p.wage)}/ned.`]};},
  loanret:v=>{const p=S.squad.find(x=>x.id===+v);if(!p||!p.loanIn)return;if(tapRelease!==p.id){tapRelease=p.id;return;}tapRelease=null;S.squad=S.squad.filter(x=>x!==p);S.modal=null;news(`${p.name} se ranije vraća u ${short(p.loanIn.from)}.`);},
  sellnow:v=>{const id=+v,p=S.squad.find(x=>x.id===id);if(!p||!p.listed||S.squad.length<=12)return;if(tapSell!==id){tapSell=id;return;}tapSell=null;const q=quickSale(p);const msg=sellPlayer(p,q.fee,q.buyer);S.modal={type:'outcome',title:'Brza prodaja',msgs:[msg]};},
  release:v=>{const id=+v;if(tapRelease!==id){tapRelease=id;return;}const p=S.squad.find(x=>x.id===id);if(p)alumniAdd(p);S.squad=S.squad.filter(x=>x.id!==id);tapRelease=null;S.modal=null;if(p){news(`${p.name} je otpušten.`);S.goodwill=clamp(S.goodwill-1,0,100);}},
  sign:v=>{if(S.chall==='local')return;const p=S.fa[+v];if(!p||S.money<p.fee||S.squad.length>=maxSquad())return;S.money-=p.fee;led('transfers',-p.fee);delete p.fee;S.squad.push(p);S.fa.splice(+v,1);news(`${p.name} potpisuje za ${S.club.name}.`);},
  build:k=>{const B=BUILD[k],nx=B.t[S.b[k]+1];if(!nx||(nx.ph&&nx.ph>phase())||S.queue.length>=2||S.queue.some(q=>q.k===k))return;const c=buildCost(nx);if(S.money<c)return;S.money-=c;led('build',-c);const pw=permitWeeks(nx);S.queue.push({k,tier:S.b[k]+1,left:buildWeeks(nx),permit:pw});news(pw?`Planovi za objekat (${nx.n.toLowerCase()}) idu u opštinu. Dozvola za ${pw} ${plu(pw,'nedelju','nedelje','nedelja')}.`:`Počinju radovi: ${nx.n.toLowerCase()}.`);},
  lvlopen:()=>{S.modal={type:'level'};},
  perk:k=>{if(!S.perks.includes(k)){S.perks.push(k);const x=PERKS.find(y=>y.k===k);news(`Nova veština: ${x.n}.`);}S.modal=null;},
  records:()=>{if(S)S.modal={type:'records'};else{SET.rec=!SET.rec;}},
  tipsoff:()=>{S.flags.tipsOff=1;},
  region:v=>{SET.region=v;},chall:v=>{SET.chall=v;},
  lvlstat:k=>{if(S.pts<=0||S.owner.st[k]>=20)return;S.owner.st[k]++;S.pts--;if(S.pts<=0)S.modal=null;},
  winterok:()=>{advanceBuilds(3);S.squad.forEach(p=>p.cond=100);refreshFA();S.modal=null;news('Zimska pauza je gotova. Nazad na posao.');},
  seasonview:()=>{if(S.sum)S.modal={type:'season'};},
  nextseason:()=>{S.modal=null;if(euroLate()||pendKind())return;nextSeason();},
  export:()=>{let code='';try{code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));}catch(e){}const msg=$('#savemsg');
    const show=t=>{if(msg)msg.textContent=t;};
    try{navigator.clipboard.writeText(code).then(()=>show('Kod je kopiran. Sačuvaj ga na sigurnom mestu.'),()=>{showCode(code);});}catch(e){showCode(code);}
    return 'skip';},
  importopen:()=>{S.modal={type:'import'};},
  importgo:()=>{if(S&&S.chall==='iron'){const m=$('#impmsg');if(m)m.textContent='Karijere sa jednim životom ne mogu da učitaju kod.';return 'skip';}const t=($('#impbox')||{}).value||'';try{const d=migrate(JSON.parse(decodeURIComponent(escape(atob(t.trim())))));if(!d||!d.club)throw 0;S=d;S.modal=null;M=null;}catch(e){const m=$('#impmsg');if(m)m.textContent='Kod nije učitan. Proveri da li si nalepio ceo kod.';return 'skip';}},
  newgame:()=>{S.modal={type:'confirmnew'};},
  ultname:v=>{const n=ultNames()[+v];S.ultras={name:n,mood:55+8*LV('ultr')};S.modal=null;news(`Rođeni su ${n}. Bubnjevi kreću na sledećoj domaćoj utakmici.`);},
  goal:v=>{S.goal={k:v,season:S.season};S.modal=null;news(`Cilj sezone: ${GOALS[v].n}.`);},
  newgameyes:()=>{hofSave();try{localStorage.removeItem(KEY);}catch(e){}S=null;M=null;}
};
const lp=v=>{const x=String(v).split(':');return x.length>1?[x[0],+x[1]]:['report',+x[0]];};
function signScouted(i,fee,l='report'){const p=S[l][i];{const N=natOf(p);if(N&&IREG[N.r].ad){p.adapt=IREG[N.r].ad+RI(0,2);p.morale=Math.min(p.morale,2);}}S.money-=fee;led('transfers',-fee);delete p.fee;p.wage=l==='stars'?Math.round(wageFor(p)*1.6/500)*500:wageFor(p);S.squad.push(p);S[l].splice(i,1);news(`${p.name} dolazi iz kluba ${short(p.from)} za ${fmt(fee)}.`);S.modal={type:'outcome',title:'Transfer',msgs:[`${p.name} potpisuje za ${fmt(fee)}. Traži ${fmt(p.wage)} nedeljno.`]};}
function showCode(code){const msg=$('#savemsg');if(msg)msg.innerHTML=`<textarea rows="4" readonly id="codebox">${esc(code)}</textarea><span>Označi sve i kopiraj ovaj kod.</span>`;const b=$('#codebox');if(b){b.focus();b.select();}}
document.addEventListener('click',e=>{
  SFX.resume();
  const el=e.target.closest('[data-a]');if(!el||el.disabled)return;
  const a=el.dataset.a,f=A[a];if(!f)return;
  try{const r=f(el.dataset.v,el);if(r==='skip')return;if(!S){render();return;}commit();}
  catch(err){errRecover(a,err);}
});
// If any button ever fails, record what happened and get the player moving again instead of freezing.
function errRecover(a,err){try{const m=meta();m.errs=m.errs||[];m.errs.unshift({t:new Date().toISOString().slice(0,16),a,msg:String(err&&err.message||err).slice(0,160),at:String(err&&err.stack||'').split('\n').slice(1,3).join(' ').replace(/https?:[^ )]*\//g,'').slice(0,200),st:S?{s:S.season,w:S.week,li:S.li,m:S.modal&&S.modal.type,mq:(S.mq||[]).map(x=>x.type).slice(0,5),e:S.euro?[S.euro.stage,S.euro.r2,S.euro.leg,S.euro.pending]:null,cup:S.cup?[S.cup.round,!!S.cup.opp]:null,M:!!M}:null});m.errs=m.errs.slice(0,6);saveMeta();}catch(x){}
  try{if(M){clearTimeout(M.timer);clearTimeout(M.celT);SFX.crowdStop();}}catch(x){}
  try{if(S){if(a==='endmatch'&&M){M=null;}else if(M&&S.modal&&S.modal.type==='match'){}else M=null;S.modal=null;S.hold=0;if(!S.mq.length&&typeof pendKind==='function'&&pendKind())openPend();save();}render();renderModal();toast('Greška je zabeležena i preskočena. Igra ide dalje.');}catch(x){try{S&&(S.modal=null);render();}catch(y){}}}
function errLogHTML(){const E=(meta().errs||[]);if(!E.length)return '';return `<section class="card"><span class="lbl">Zabeležene greške</span><div class="hint">Ako se nešto zaglavilo, ovo pomaže da se popravi. Kopiraj i pošalji.</div><textarea readonly rows="4" style="width:100%;font-size:11px">${esc(JSON.stringify(E.slice(0,3)))}</textarea><button class="btn sm" data-a="errclear">Obriši zapis</button></section>`;}
document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.in;if(k)SET[k]=e.target.value;});
let rz=0;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(S&&S.tab==='home'&&!S.modal)drawVillage($('#village'));},150);});

