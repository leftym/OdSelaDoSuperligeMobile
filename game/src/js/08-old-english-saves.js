/* ---------- old English saves: translate what we can, drop the rest ---------- */
const SRMAP={"mechanic": "automehaničar", "baker's son": "pekarev sin", "tractor driver": "traktorista", "postman": "poštar", "butcher's apprentice": "mesarski šegrt", "beekeeper": "pčelar", "teacher": "učitelj", "farmer": "ratar", "plum grower": "šljivar", "electrician": "električar", "bus driver": "vozač autobusa", "shepherd": "čobanin", "kafana waiter": "konobar u kafani", "bricklayer": "zidar", "vet assistant": "veterinarski tehničar", "carpenter": "stolar", "semi-pro": "poluprofesionalac", "factory worker": "fabrički radnik", "PE student": "student DIF-a", "ex-academy player": "bivši omladinac", "warehouse worker": "magacioner", "taxi driver": "taksista", "policeman": "policajac", "physio student": "student fizioterapije", "professional": "profesionalac", "ex-Superliga player": "bivši superligaš", "back from Cyprus": "vratio se sa Kipra", "U21 international": "reprezentativac U21", "journeyman pro": "promenio deset klubova", "KRC Genkveld (Belgium)": "KRC Genkveld (Belgija)", "Vitória Riba (Portugal)": "Vitória Riba (Portugalija)", "SV Rheinau (Germany)": "SV Rheinau (Nemačka)", "FC Alpenthal (Austria)": "FC Alpenthal (Austrija)", "IF Nordhavn (Denmark)": "IF Nordhavn (Danska)", "FC Lémanique (Switzerland)": "FC Lémanique (Švajcarska)", "Aris Limani (Greece)": "Aris Limani (Grčka)", "Sparta Vltava (Czechia)": "Sparta Vltava (Češka)", "(Ireland)": "(Irska)", "(Sweden)": "(Švedska)", "(Norway)": "(Norveška)", "(Poland)": "(Poljska)", "(Austria)": "(Austrija)", "(Czechia)": "(Češka)", "(Hungary)": "(Mađarska)", "(Israel)": "(Izrael)", "(Bulgaria)": "(Bugarska)", "(Romania)": "(Rumunija)", "(Scotland)": "(Škotska)", "(Turkey)": "(Turska)", "(Greece)": "(Grčka)", "(Belgium)": "(Belgija)", "(Portugal)": "(Portugalija)", "(Netherlands)": "(Holandija)", "(France)": "(Francuska)", "(Spain)": "(Španija)", "(Italy)": "(Italija)", "(Germany)": "(Nemačka)", "(England)": "(Engleska)", "academy kid": "dete iz akademije", "school kid": "đak", "returning legend": "legenda se vratila", "Round of 16": "Osmina finala", "Quarter-final": "Četvrtfinale", "Semi-final": "Polufinale", "Final": "Finale", "(Denmark)": "(Danska)", "(Switzerland)": "(Švajcarska)", "(Cyprus)": "(Kipar)"};
const ENW=new Set('the and you your with for of is are this that his they their will was has have from it its player players season round win beat beats signed lost told built into after before our them who when what which there here then week weeks goal fans village money now next more less only than all every one two three can were been would could should about over just very also pay each train ignore host feast ground break work trouble again fine him her wage offer accept decline politely refuse sell buy let keep tell give take make my an by out off thank thanks say said yes no sold joins comes leaves retired'.split(' '));
function isEn(t){if(typeof t!=='string')return false;const w=t.toLowerCase().match(/[a-z']+/g)||[];let n=0;for(const x of w)if(ENW.has(x))n++;return n>=2||(n>=1&&n/w.length>=.34);}
function srStr(t){if(typeof t!=='string')return t;if(SRMAP[t])return SRMAP[t];let r=t.replace(/\([A-Z][a-z]+\)/g,m=>SRMAP[m]||m);r=r.replace(/^back from (.+)$/,'vratio se iz $1');return r;}
function srFix(s){
  const fixP=p=>{if(p&&typeof p.job==='string')p.job=srStr(p.job);};
  ['squad','fa','report','stars','alumni','youth'].forEach(k=>Array.isArray(s[k])&&s[k].forEach(fixP));
  (s.onLoan||[]).forEach(x=>fixP(x.p));if(s.intake&&Array.isArray(s.intake.kids))s.intake.kids.forEach(fixP);
  ['soldList','sellons'].forEach(k=>(s[k]||[]).forEach(x=>{if(x.to)x.to=srStr(x.to);}));
  if(s.cup)for(const k in s.cup)if(typeof s.cup[k]==='string')s.cup[k]=srStr(s.cup[k]);
  if(Array.isArray(s.news))s.news=s.news.map(n=>{if(!n||typeof n.t!=='string')return n;let m=n.t.match(/^Round (\d+): (.+?) (\d+–\d+) (.+?)\. (Win|Draw|Loss)\.$/);
    if(m)return {...n,t:`${m[1]}. kolo: ${m[2]} ${m[3]} ${m[4]}. ${{Win:'Pobeda',Draw:'Nerešeno',Loss:'Poraz'}[m[5]]}.`};
    m=n.t.match(/^Training: (\d+) players? improved\.$/);if(m){const g=+m[1];return {...n,t:`Trening: ${g} ${plu(g,'igrač je napredovao','igrača su napredovala','igrača je napredovalo')}.`};}
    return isEn(n.t)?null:n;}).filter(Boolean);
  if(s.rivals)for(const k in s.rivals){const R=s.rivals[k];if(R&&Array.isArray(R.log))R.log=R.log.filter(x=>!isEn(x&&x.t));}
  if(s.paper&&[s.paper.hl,s.paper.sub,...(s.paper.stories||[])].some(isEn))s.paper=null;
  if(s.modal&&s.modal.type==='outcome'&&(isEn(s.modal.title)||(s.modal.msgs||[]).some(isEn)))s.modal=null;
  if(Array.isArray(s.mq))s.mq=s.mq.filter(m=>!(m&&m.type==='outcome'&&(m.msgs||[]).some(isEn)));
  s.sr=1;}
function migrate(s){
  if(!s||!s.squad)return null;
  if(s.coach===true)s.coach={name:'Miodrag „Čika Mića”',r:3,style:'motiv',phil:'mladi',trust:65,age:61,wage:Math.round(6000*(1+.25*(s.li||0)))};
  if(!s.coach)s.coach=null;
  if(s.pt==null)s.pt={100:0,200:1,300:2}[s.price]??1;
  for(const k in BUILD)if(s.b[k]==null)s.b[k]=0;
  s.loans=s.loans||[];s.scout=s.scout||null;s.task=s.task||null;s.report=s.report||[];s.coaches=s.coaches||[];s.sellons=s.sellons||[];s.ultras=s.ultras||null;s.investor=s.investor||null;s.goal=s.goal||null;s.cup=s.cup||null;s.analyst=s.analyst||null;s.trophies=s.trophies||[];s.stars=s.stars||[];s.intl=s.intl||[];s.loanMkt=s.loanMkt||[];s.euro=s.euro||null;s.vp=s.vp||[];s.stats=s.stats||{titles:0,cups:0,abroad:0,kids:0,euroBest:0,top:0};
  s.queue.forEach(q=>{if(q.permit==null)q.permit=0;});s.squad.forEach(p=>{if(p.cond==null)p.cond=100;});if(!s.diff)s.diff='normal';if(!s.region)s.region='sumadija';if(!s.chall)s.chall='none';if(!s.cid)s.cid=Math.random().toString(36).slice(2,10);s.perks=s.perks||[];s.legends=s.legends||[];s.posHist=s.posHist||[];s.sstat=s.sstat||{};if(s.maxLi==null)s.maxLi=s.li;if(s.startLi==null)s.startLi=s.li;
  if(s.flags&&s.flags.phase1Done)delete s.flags.phase1Done;
  if(!s.phv){s.phv=1;if(s.li===1){s.mq=s.mq||[];s.mq.push({type:'phase',n:2});}}
  if(!s.sr)srFix(s);
  if(s.club&&!s.club.crest)s.club.crest={sh:'stit',pt:'pruge',sy:'inicijali'};
  applyRealWorld(s.club);
  if(!s.rc){s=JSON.parse(realNames(JSON.stringify(s)));s.rc=1;}
  s.v=2;return s;
}
function setupSeason(){
  S.teams=worldTeams(S.li);S.sched=makeSchedule(8);
  S.table=S.teams.map(()=>({p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
  S.results=[];S.week=0;S.winter=false;S.ledger={};S.posHist=[];S.sstat={l:0,hw:0,hg:0,dw:0};S.squad.forEach(p=>{p.sg=0;p.sa=0;p.rsum=0;p.rcnt=0;p.sas=0;if(phase()>=2&&(p.ce==null||p.ce<S.season))p.ce=S.season+(p.id%3);});
  const grant=Math.max(100000,Math.round((300000+S.rel.mayor*3000)*(1+.8*S.li)*INC()*(has('opstina')?1.25:1)/10000)*10000);
  S.money+=grant;led('grant',grant);
  const sol=[0,0,600000,1200000,2000000,0,0][S.li];if(sol){S.money+=sol;led('grant',sol);news(`Uplata saveza za takmičenje: ${fmt(sol)}.`);}
  S.cup=phaseOf(S.li)>=4?{round:0,alive:true}:null;
  S.stars=phaseOf(S.li)>=5?['DEF','MID','ATT'].map(pos=>{const p=genPlayer(pos,LEAGUES[S.li].lvl+.2+R(0,1),{age:RI(24,29)});const c=pick(EUROC),N=pick(NATS.filter(n=>n.r==='zapad'||n.r==='juzam'));p.name=pick(N.fn)+' '+pick(N.ln);p.nat=N.k;p.job='stranac';p.scouted=true;p.from=`${c[0]} (${c[1]})`;p.fee=Math.round(value(p)*3*(has('pregovarac')?.85:1)/100000)*100000;return p;}):[];
  if(phaseOf(S.li)>=4){const tv=S.li>=6?15000000:5000000;S.money+=tv;led('tv',tv);news(`Novac od TV prava: ${fmt(tv)}.`);const lic=S.li>=6?6000000:2000000;S.money-=lic;led('upkeep',-lic);news(`Licenca i članarina saveza za ${LEAGUES[S.li].name}: ${fmt(lic)}.`);}
  news(`${S.season}. sezona, ${LEAGUES[S.li].name}. Opštinska subvencija: ${fmt(grant)}.`);
  {const my=S.squad.length?effMe(powersOf(pickXI()),false)+.2:LEAGUES[S.li].lvl,pos=1+S.teams.filter(t=>!t.me&&t.r*PK()>my).length;S.pred={pos,s:S.season};news(`${PAPER()}, prognoza pred sezonu: ${S.club.name} završava na ${pos}. mestu.`);}
}

