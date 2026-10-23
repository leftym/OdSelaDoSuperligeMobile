/* ---------- player roles: what each man does in his slot ---------- */
const ROLES={DEF:[['cb','Štoper',{def:.5,fit:.25,men:.25},{D:.02,A:-.01},'Čuva prostor i igra glavom'],['fb','Bek',{def:.4,fit:.35,tec:.25},{D:.008},'Pouzdan na krilu'],['wb','Krilni bek',{fit:.4,tec:.3,att:.3},{A:.018,D:-.015},'Ide napred, centrira']],
 MID:[['bw','Rušilac',{def:.45,fit:.3,men:.25},{D:.02,A:-.01},'Otima lopte ispred odbrane'],['pm','Plejmejker',{tec:.55,men:.45},{M:.02,D:-.01},'Diktira igru, više asistencija'],['b2b','Box-to-box',{fit:.4,att:.3,def:.3},{M:.008,A:.004},'Svuda po terenu'],['wg','Krilo',{tec:.4,fit:.3,att:.3},{A:.018,D:-.01},'Driblinzi i centaršutevi']],
 ATT:[['po','Golgeter',{att:.65,men:.35},{A:.02,M:-.01},'Živi u šesnaestercu, više golova'],['tm','Target',{att:.45,fit:.3,men:.25},{A:.012,M:-.004},'Drži loptu, jak u vazduhu'],['ff','Lažna devetka',{tec:.55,att:.45},{M:.015,A:-.006},'Spušta se po loptu, otvara prostor']]};
const roleDef=(pos,k)=>(ROLES[pos]||[]).find(r=>r[0]===k);
const roleQ=(p,r)=>Object.entries(r[2]).reduce((s,[k,w])=>s+p[k]*w,0);
function roleFit(p,pos,r){const o=ovrAt(p,pos)||1;return roleQ(p,r)/o;}
function bestRole(p,pos){const L=ROLES[pos];if(!L)return null;return L.slice().sort((a,b)=>roleQ(p,b)-roleQ(p,a))[0][0];}
function roleOf(p,pos){if(!ROLES[pos])return null;const k=p.rl&&p.rl[pos];return roleDef(pos,k)?k:bestRole(p,pos);}
const fitStars=f=>f>=1.08?5:f>=1.02?4:f>=.96?3:f>=.9?2:1;
// Players without a chosen role get a sensible spread: best fit, but no more than two of the same role per line.
function ensureRoles(xi){['DEF','MID','ATT'].forEach(pos=>{const g=xi[pos]||[],cnt={};g.forEach(p=>{const k=p.rl&&p.rl[pos];if(roleDef(pos,k))cnt[k]=(cnt[k]||0)+1;});
  g.filter(p=>!(p.rl&&roleDef(pos,p.rl[pos]))).forEach(p=>{const L=ROLES[pos].slice().sort((a,b)=>roleQ(p,b)-roleQ(p,a)),r=L.find(x=>(cnt[x[0]]||0)<2)||L[0];p.rl=p.rl||{};p.rl[pos]=r[0];cnt[r[0]]=(cnt[r[0]]||0)+1;});});}
function roleMods(xi){ensureRoles(xi);const m={A:0,D:0,M:0},seen={};['DEF','MID','ATT'].forEach(pos=>(xi[pos]||[]).forEach(p=>{const r=roleDef(pos,roleOf(p,pos));if(!r)return;const n=seen[pos+r[0]]=(seen[pos+r[0]]||0)+1,dup=n===1?1:n===2?.5:.25;const s=fitStars(roleFit(p,pos,r)),k=(s>=4?1:s===3?.5:0)*dup;for(const x in r[3])m[x]+=r[3][x]*k;const pen=s===1?.008:s===2?.003:0;m.A-=pen;m.D-=pen;m.M-=pen;}));
  const lim=v=>clamp(v,-.06,.08);return {A:lim(m.A),D:lim(m.D),M:lim(m.M)};}
function rolesHTML(xi){ensureRoles(xi);const rows=['DEF','MID','ATT'].map(pos=>(xi[pos]||[]).map(p=>{const k=roleOf(p,pos),r=roleDef(pos,k),s=fitStars(roleFit(p,pos,r));
    return `<div class="li"><span class="pos ${pos}">${POSL[pos]}</span><span class="grow"><b>${esc(p.name)}</b><br><span class="hint">${esc(r[4])}</span></span><span class="fitd ${s>=4?'g':s<=2?'b':''}" title="Koliko mu uloga leži">${'●'.repeat(s)}${'○'.repeat(5-s)}</span><button class="btn sm" data-a="rolecyc" data-v="${p.id}:${pos}">${esc(r[1])}</button></div>`;}).join('')).join('');
  const m=roleMods(xi),f=v=>`${v>=0?'+':'−'}${Math.abs(Math.round(v*1000)/10).toString().replace('.',',')}%`;
  return `<section class="card"><div class="row between"><h3>Uloge</h3><span class="lbl">Napad ${f(m.A)} · Sredina ${f(m.M)} · Odbrana ${f(m.D)}</span></div><div class="hint">Dodirni ulogu da je promeniš. Svaka uloga nešto daje, a nešto košta. Tačkice pokazuju koliko igraču uloga leži: 4–5 puna korist, 3 pola, 1–2 slabi ekipu. Golgeter daje više golova, plejmejker i krila više asistencija. Ista uloga dva puta u liniji vredi manje.</div><div class="list">${rows}</div></section>`;}
function pickScorer(){
  const pool=[],rw=(p,pos)=>({po:1.5,tm:1.15,ff:.85,b2b:1.25,wg:1.15,bw:.6})[roleOf(p,pos)]||1;M.xi.ATT.forEach(p=>pool.push([p,3*(p.att+4)*rw(p,'ATT')]));M.xi.MID.forEach(p=>pool.push([p,1.4*(p.att+4)*rw(p,'MID')]));M.xi.DEF.forEach(p=>pool.push([p,.35*(p.att+4)]));
  let tot=pool.reduce((s,x)=>s+x[1],0),r=Math.random()*tot;for(const [p,w] of pool){r-=w;if(r<=0)return p;}return pool.length?pool[0][0]:{name:'Neko',trait:null};
}
function simChunk(c){
  if(M.kmAt&&M.kmAt.includes(c)&&!M.kmDone[c])kmAuto(c);
  const g0=[M.g[0],M.g[1]];
  const tac={...S.tactics};
  if(c>=3){if(M.ht==='push')tac.instr=2;if(M.ht==='sit')tac.instr=0;}
  if(c>=4)coachSubs(c);
  const sh=M.shout&&M.shout.c===c?M.shout.k:null;if(sh==='push')tac.instr=2;if(sh==='hold')tac.instr=0;
  const me=applyTac(M.myP,tac,M.ot,c,M.home,true),op=applyTac(M.opP,M.ot,tac,c,M.neutral?false:!M.home,false);
  if(M.fresh&&me.drain){const f=1-.1*M.fresh,k=(1-me.drain*f)/(1-me.drain);me.A*=k;me.D*=k;me.Mi*=k;me.drain*=f;}
  if(sh==='calm'){me.A*=1.03;me.D*=1.03;me.Mi*=1.03;}
  if(S.tactics.mark&&!M.euro_){op.A*=.95;me.Mi*=.97;}
  if(M.grudge){me.A*=1.02;me.D*=1.02;}
  if(c>=3&&M.ht==='talk'){const b=1+((S.coach&&S.coach.style==='motiv'?.07:.04)*(has('glas')?2:1));me.A*=b;me.D*=b;me.Mi*=b;}
  if(M.wx==='wx-night')me.Mi*=1.02;
  const wxc=M.wx==='wx-rain'?.03:M.wx==='wx-fog'?-.03:0;
  const ex=M.snow?1:1.4,p=me.Mi/(me.Mi+op.Mi);
  const lm=1.5*p*Math.pow(me.A/op.D,ex),lo=1.5*(1-p)*Math.pow(op.A/me.D,ex);
  const tk=spTaker(),cm0=clamp(.27*Math.pow(me.A/(op.gk*.5+op.D*.5),.9)+(M.snow?.05:0)+wxc,.08,.6),cm=tk?cm0*(1+(M.wx==='wx-rain'?.01:.02)*clamp(tk.tec-10,-3,8)):cm0,co=clamp(.27*Math.pow(op.A/(me.gk*.5+me.D*.5),.9)+(M.snow?.05:0)+wxc,.08,.6);
  const nm=poisson(lm),no=poisson(lo);
  const st=M.st;st.poss.push(p);st.mc+=nm;st.oc+=no;st.dm=me.drain;st.dop=op.drain;
  if(me.fl.press)st.fl.press=1;if(me.fl.direct)st.fl.direct=1;if(op.fl.press)st.fl.opress=1;if(op.fl.direct)st.fl.odirect=1;
  const lines=[],tn=short(M.oppT.name),kp=M.xi.GK[0]?M.xi.GK[0].name:'naš golman';
  const mn=()=>RI(c*15+1,c*15+15)+(c===2||c===5?RI(0,2):0);
  if(c===0&&M.wx&&WXL[M.wx])lines.push({m:1,t:pick(WXL[M.wx]),k:''});
  if((c===1||c===4)&&!M.euro&&Math.random()<.6)lines.push({m:RI(c*15+3,c*15+12),t:chantLine(),k:'chant'});
  for(let i=0;i<nm;i++){const m=mn();if(Math.random()<cm){let s=pickScorer(),as=pickAssist(s),spk=0;if(Math.random()<.2){if(tk&&Math.random()<.45){s=tk;as=null;spk=2;}else{const hs=[...M.xi.DEF,...M.xi.ATT],tmn=M.xi.ATT.find(x=>roleOf(x,'ATT')==='tm');if(hs.length){s=tmn&&Math.random()<.45?tmn:pick(hs);as=tk&&tk!==s?tk:null;spk=1;}}}M.g[0]++;s.goals=(s.goals||0)+1;s.sg=(s.sg||0)+1;evOf(s).g++;if(as){evOf(as).a++;as.sas=(as.sas||0)+1;as.asts=(as.asts||0)+1;}M.flash=M.c;lines.push({m,t:(spk===2?`GOL iz slobodnog udarca! ${esc(s.name)} pogađa u rašlje.`:spk===1?`GOL posle kornera! ${esc(s.name)} glavom.`:pick(GOAL)(esc(s.name)))+(as?` <span class="hint">(asist: ${esc(as.name)})</span>`:''),k:'goal us'});if(s.trait==='ljub')S.fan=clamp(S.fan+1,0,100);}else if(st.mm<4&&Math.random()<.45){st.mm++;lines.push({m,t:(M.wx==='wx-rain'&&Math.random()<.45?pick(MISSW):M.wx==='wx-fog'&&Math.random()<.4?pick(MISSF):pick(MISS))(esc(pickScorer().name)),k:''});}}
  for(let i=0;i<no;i++){const m=mn();if(Math.random()<co){M.g[1]++;lines.push({m,t:M.exs.length&&Math.random()<.3?`${esc(pick(M.exs))} postiže gol protiv bivšeg kluba. Ne slavi.`:(RP[M.oppT.name]&&Math.random()<.8?(sc=>{M.osc=M.osc||[];M.osc.push(sc);return pick(OGOALP)(esc(sc),esc(tn));})(rpPick(M.oppT.name)):pick(OGOAL)(esc(tn))),k:'goal them'});}else if(st.om<3&&Math.random()<.4){st.om++;lines.push({m,t:RP[M.oppT.name]&&Math.random()<.5?`${esc(rpPick(M.oppT.name))} (${esc(tn)}) šutira, ${esc(kp)} brani.`:pick(OMISS)(esc(tn),esc(kp)),k:''});}}
  lines.sort((a,b)=>a.m-b.m).forEach(l=>{l.m=Math.min(l.m,c===2?47:c===5?94:l.m);M.feed.push(l);});
  xiAll(M.xi).slice().forEach(p=>{if(p.id==null||Math.random()>=.0016*(1-.1*LV('fizio'))*(p.trait==='krh'?2:1)*((p.cond??100)<50?1.8:1))return;const m=Math.min(mn(),c===2?45:90);p.inj=Math.max(1,RI(1,3));M.injd[p.id]=1;M.feed.push({m,t:`Povreda: ${esc(p.name)} hramlje sa terena.`,k:'inj'});const b=M.subs<3?bestBench(M.posOf[p.id]):null;doSub(p,b,b?'povreda':'',m);});
  M.low=Math.min(M.low??0,M.g[0]-M.g[1]);
  (M.mom=M.mom||[]).push({p,us:M.g[0]-g0[0],them:M.g[1]-g0[1],ch:nm-no});
}
function whyLines(ht){
  const st=M.st,pav=st.poss.reduce((a,b)=>a+b,0)/st.poss.length,t=short(M.oppT.name),c=[];
  if(st.fl.press)c.push([3,`Tvoj visoki pres ugušio je njihovu sporu igru.${S.coach&&S.coach.style==='taktik'?' Tvoj taktičar je to predvideo.':''}`]);
  if(st.fl.direct)c.push([3,'Tvoje duge lopte prelazile su preko njihovog visokog presa.']);
  if(st.fl.opress)c.push([3,`${t} je presovao visoko i kažnjavao tvoje sporo dodavanje.`]);
  if(st.fl.odirect)c.push([3,`${t} je igrao duge lopte preko tvog presa.`]);
  if(!ht&&st.dm>.08)c.push([2.5+st.dm*10,'Pres je potrošio noge. U poslednjih 20 minuta ste se ugasili.']);
  if(!ht&&st.dop>.09&&st.dm<st.dop-.03)c.push([2.4,`${t} je na kraju ostao bez snage.`]);
  if(pav>.57)c.push([2+(pav-.5)*10,`Sredina terena bila je vaša: ${Math.round(pav*100)}% poseda.`]);
  if(pav<.43)c.push([2+(.5-pav)*10,`Sredina je izgubljena. Oni su imali ${Math.round((1-pav)*100)}% poseda.`]);
  const gap=M.myP.rating-M.opP.rating;
  if(gap>1.2)c.push([1.5+gap,`Bolji igrači su presudili: tvoja jedanaestorka ${M.myP.rating.toFixed(1)}, njihova ${M.opP.rating.toFixed(1)}.`]);
  if(gap<-1.2)c.push([1.5-gap,`Imali su bolje igrače: ${M.opP.rating.toFixed(1)} protiv tvojih ${M.myP.rating.toFixed(1)}.`]);
  if(st.mc>=st.oc+3&&M.g[0]<=M.g[1])c.push([4,`Imali ste više šansi (${st.mc} prema ${st.oc}), ali niste ih iskoristili.`]);
  if(st.oc>=st.mc+3&&M.g[0]>=M.g[1])c.push([4,`Oni su imali više šansi (${st.oc} prema ${st.mc}). Tvoj golman je zaslužio pivo.`]);
  if(M.myP.cnt<11)c.push([5,`Igrali ste sa samo ${M.myP.cnt} igrača.`]);
  if(M.snow)c.push([2,'Na snegu se sve moglo desiti. I desilo se.']);
  if(!c.length)c.push([1,'Tesna, izjednačena utakmica. Odlučili su sitni detalji.']);
  c.sort((a,b)=>b[0]-a[0]);return c.slice(0,ht?1:2).map(x=>x[1]);
}
function tick(){
  if(!M||M.phase!=='live'||M.pause)return;
  if(!M.fast&&M.kmAt&&M.kmAt.includes(M.c)&&!M.kmDone[M.c]){const k=kmGen(M.c);M.kmDone[M.c]=1;if(k){M.km=k;M.pause=true;SFX.second&&SFX.second();renderModal();return;}}
  const n0=M.feed.length;simChunk(M.c);M.c++;SFX.chunk(M.feed.slice(n0),M.fast?160:1300);
  const gl=M.fast||M.c===3||M.c===6?null:M.feed.slice(n0).filter(l=>/goal/.test(l.k)).pop();
  if(gl){const us=/goal us/.test(gl.k);M.viz.goal={us,t0:typeof performance!=='undefined'?performance.now():0};try{if(us&&SFX.on()){if(window.OdSelaAndroid)window.OdSelaAndroid.vibrate(160);else if(navigator.vibrate)navigator.vibrate([60,40,120]);}}catch(e){}clearTimeout(M.celT);
    M.celT=setTimeout(()=>{if(!M)return;M.cel={us,t:gl.t,m:gl.m};renderModal();M.celT=setTimeout(()=>{if(M){M.cel=null;renderModal();}},2700);},900);}
  if(M.c===3){M.phase='ht';whyLines(true).forEach(t=>M.feed.push({m:'POL',t,k:'why'}));SFX.half();}
  else if(M.c===6){M.phase='done';whyLines(false).forEach(t=>M.feed.push({m:'KRAJ',t,k:'why'}));SFX.full(M.g[0],M.g[1]);}
  renderModal();
  if(M.phase==='live')M.timer=setTimeout(tick,M.fast?160:(gl?4100:1300));
}

