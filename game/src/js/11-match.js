/* ---------- match ---------- */
const GOAL=[n=>`GOOOL! ${n} gađa ispod prečke, lopta je u mreži.`,n=>`GOL! ${n} provlači loptu ispod golmana.`,n=>`GOL! ${n} glavom posle kornera.`,n=>`GOL! ${n} sa 20 metara. Tribina eksplodira.`,n=>`GOL! ${n} gura loptu u mrežu posle gužve u šesnaestercu.`,n=>`GOL! ${n} prelazi golmana i ubacuje u prazan gol.`];
const WXL={'wx-rain':['Kiša lije od jutra. Lopta staje u lokvama, a kopačke propadaju u blato.','Pljusak. Sudija je pogledao nebo, slegnuo ramenima i svirao početak.'],
 'wx-fog':['Magla je pala na teren. Sa tribine se jedva vidi drugi gol.','Gusta magla. Navijači pitaju jedni druge ko je šutirao.'],
 'wx-night':['Reflektori gore, tribina bruji. Fudbal pod svetlima je nešto drugo.','Večernji termin. Celo selo je posle posla došlo na stadion.']};
const WXP={'wx-rain':'Kiša: teren je težak, više grešaka i golova, tehnika manje vredi.','wx-fog':'Magla: manje udaraca sa distance, manje golova.','wx-night':'Utakmica pod reflektorima: domaća publika je glasnija.'};
const MISSW=[n=>`${n} se pokliznuo u lokvi baš pred šut.`,n=>`Lopta staje u blatu. ${n} je ne stiže.`,n=>`${n} šutira, lopta preskače mokar teren i ide pored gola.`];
const MISSF=[n=>`${n} šutira u maglu. Niko nije siguran gde je lopta otišla.`,n=>`${n} ne vidi saigrača od magle i gubi loptu.`];
const MISS=[n=>`${n} pogađa stativu.`,n=>`${n} šutira preko gola, pravo u kukuruz.`,n=>`${n} je sam ispred golmana, ali golman brani.`,n=>`${n} glavom, malo pored gola.`];
const OGOAL=[t=>`${t} daje gol. Njihova devetka završava na prvoj stativi.`,t=>`${t} postiže gol. Naša odbrana je stajala i gledala.`,t=>`${t} postiže gol iz slobodnjaka. Živi zid je skočio prerano.`,t=>`${t} postiže gol iz kontranapada.`];
const OMISS=[(t,k)=>`Sjajna odbrana, ${k}! ${t} ostaje bez gola.`,t=>`${t} pogađa prečku. Imali smo sreće.`,t=>`${t} promašuje zicer glavom.`];

const PK=()=>DF().opp[S.li];
// What the match engine really plays with: your XI after coach, harmony and facilities; the opponent after the league boost. Home side gets ~4%.
const effMe=(P,home)=>(P.atk+P.def+P.mid)/3/1.05*(home?1.04:1);
const effOpp=(t,home)=>t.r*PK()*(home?1.04:1);
function openMatch(kind){
  const eu=kind==='euro',cup=kind===true||kind==='cup';
  let fx,t;if(eu){t=S.euro.opp;fx={home:!!S.euro.home,opp:-1};}else if(cup){t=S.cup.opp;fx={home:S.cup.home===true,opp:-1};}else{fx=nextFixture();t=S.teams[fx.opp];}
  const xi=pickXI(),my=powersOf(xi);
  const ot={tempo:t.tempo,press:t.press,width:1,instr:t.r<my.rating-1.2?0:1},wc=!eu&&S.world&&S.world[t.name];
  M={phase:'pre',home:fx.home,opp:fx.opp,xi,myP:my,opP:{atk:t.atk*1.04*PK(),def:t.def*1.11*PK(),mid:t.mid*PK(),gk:t.r*PK(),fit:10,rating:t.r},ot,c:0,g:[0,0],feed:[],
    st:{poss:[],mc:0,oc:0,fl:{},dm:0,dop:0,mm:0,om:0},ht:'keep',snow:(!!S.flags.snow||!!S.flags.mudweek)&&S.b.pitch<2,fast:false,timer:0,night:S.b.flood>=1&&fx.home,oppT:t,cup:!!cup,euro:eu,neutral:!!cup&&S.cup.home===null,wx:eu?null:wxFor(fx.home),grudge:!!(wc&&wc.grudge),exs:wc?wc.ex.filter(x=>x.pos!=='GK').map(x=>x.n):[],injd:{},kmAt:kmPlan(),kmDone:{},ev:{},subs:0,off:[],on:{},offAt:{},fresh:0,shouts:[0,0],seed:RI(1,1e9),posOf:Object.fromEntries(['GK','DEF','MID','ATT'].flatMap(k=>xi[k].map(p=>[p.id,k]))),viz:{bx:.5,by:.5,tx:.5,ty:.5,nt:0}};
  S.modal={type:'match'};renderModal();
}
// ---- Match day 2.0: assists, substitutions, ratings, shouts, live pitch ----
const evOf=p=>M.ev[p.id]||(M.ev[p.id]={g:0,a:0});
function pickAssist(s){if(Math.random()>.65)return null;const pool=[],aw=(p,pos)=>({pm:1.6,wg:1.35,ff:1.4,wb:1.8,bw:.6,po:.8})[roleOf(p,pos)]||1;M.xi.MID.forEach(p=>pool.push([p,3*(p.tec+3)*aw(p,'MID')]));M.xi.ATT.forEach(p=>pool.push([p,2*(p.tec+3)*aw(p,'ATT')]));M.xi.DEF.forEach(p=>pool.push([p,.6*(p.tec+3)*aw(p,'DEF')]));
  const c=pool.filter(x=>x[0]!==s);let tot=c.reduce((a,x)=>a+x[1],0),r=Math.random()*tot;for(const [p,w] of c){r-=w;if(r<=0)return p;}return null;}
const mcond=(p,min)=>(p.cond??100)-Math.max(0,min-(M.on[p.id]||0))/90*(12+[0,2,5][S.tactics.press]-(p.fit-10)*.5);
function benchOf(){const inn=new Set(xiAll(M.xi).map(p=>p.id)),O=['GK','DEF','MID','ATT'];return S.squad.filter(p=>!inn.has(p.id)&&!M.off.includes(p)&&!p.inj&&!p.rest&&!p.wedding).sort((a,b)=>O.indexOf(a.pos)-O.indexOf(b.pos)||ovr(b)-ovr(a));}
function bestBench(pos){return benchOf().sort((a,b)=>ovrAt(b,pos)*condF(b)-ovrAt(a,pos)*condF(a))[0]||null;}
function doSub(o,n,why,min){const pos=M.posOf[o.id],arr=M.xi[pos],i=arr?arr.indexOf(o):-1;if(i<0)return;
  if(n){arr[i]=n;M.posOf[n.id]=pos;M.on[n.id]=min;M.subs++;M.fresh++;}else arr.splice(i,1);
  M.off.push(o);M.offAt[o.id]=min;M.myP=powersOf(M.xi);
  M.feed.push({m:min,t:n?`Izmena: ulazi ${esc(n.name)}, izlazi ${esc(o.name)}${why?` (${why})`:''}.`:`${esc(o.name)} ne može dalje. Igrate sa ${xiAll(M.xi).length} igrača.`,k:'sub'});}
function coachSubs(c){if(M.manual||M.subs>=3)return;const min=c*15;
  xiAll(M.xi).map(p=>[p,mcond(p,min)]).sort((a,b)=>a[1]-b[1]).slice(0,Math.min(c===4?2:1,3-M.subs)).forEach(([p,cn])=>{if(cn>(stR('asst')>=3?85:80))return;const pos=M.posOf[p.id],b=bestBench(pos);if(b&&ovrAt(b,pos)*condF(b)>=ovrAt(p,pos)*.85)doSub(p,b,'trener',min);});}
const fmt1=r=>r.toFixed(1).replace('.',',');
const rtCls=r=>r>=7.5?'hi':r<5.5?'lo':'';
const favg=p=>p.form&&p.form.length?p.form.reduce((a,b)=>a+b,0)/p.form.length:0;
function rateP(p){const pos=M.posOf[p.id]||p.pos,e=M.ev[p.id]||{g:0,a:0},r=srand(M.seed+p.id*7919)(),gf=M.g[0],ga=M.g[1],now=Math.min(90,M.c*15),played=Math.max(1,(M.offAt[p.id]??now)-(M.on[p.id]||0));
  const pav=M.st.poss.length?M.st.poss.reduce((a,b)=>a+b,0)/M.st.poss.length:.5;
  let v=6.3+(r-.5)+clamp(.12*(ovrAt(p,pos)*condF(p)-M.opP.rating),-1,1)+e.g+e.a*.5;
  if(pos==='GK')v+=(ga===0&&played>=60?.7:0)-.25*ga;else if(pos==='DEF')v+=(ga===0&&played>=60?.5:0)-.15*ga;else if(pos==='MID')v+=(pav-.5)*3;else if(!e.g)v-=.2;
  v+=gf>ga?.35:gf<ga?-.25:0;if(played<30)v=6.5+(v-6.5)*.4;if(M.injd[p.id])v-=.3;
  return Math.round(clamp(v,3.5,10)*10)/10;}
function matchRatings(){const O=['GK','DEF','MID','ATT'];return [...xiAll(M.xi),...M.off].filter(p=>p.id!=null).map(p=>({p,pos:M.posOf[p.id]||p.pos,r:rateP(p)})).sort((a,b)=>O.indexOf(a.pos)-O.indexOf(b.pos)||(M.on[a.p.id]||0)-(M.on[b.p.id]||0));}
function applyRatings(L){if(!L.length)return;
  L.forEach(({p,r})=>{p.mrs=(p.mrs||0)+r;p.mrn=(p.mrn||0)+1;p.rt=r;p.form=(p.form||[]).concat(r).slice(-5);p.rsum=(p.rsum||0)+r;p.rcnt=(p.rcnt||0)+1;if(r>=8&&Math.random()<.5)p.morale=Math.min(5,p.morale+1);if(r<5.5&&Math.random()<.5)p.morale=Math.max(1,p.morale-1);});
  const b=L.slice().sort((a,c)=>c.r-a.r)[0];b.p.mom=(b.p.mom||0)+1;b.p.morale=Math.min(5,b.p.morale+1);news(`Igrač utakmice: ${b.p.name}, ocena ${fmt1(b.r)}.`);}
function ratingsHTML(){const L=matchRatings();if(!L.length)return '';const best=L.reduce((a,b)=>b.r>a.r?b:a);
  return `<div class="card"><div class="row between"><span class="lbl">Ocene igrača</span><span class="lbl">★ igrač utakmice</span></div><div class="list">${L.map(x=>{const e=M.ev[x.p.id]||{g:0,a:0};return `<div class="li rtl"><span class="pos ${x.pos}">${POSL[x.pos]}</span><span class="grow">${x===best?'★ ':''}${esc(x.p.name)}${M.on[x.p.id]?` <span class="hint">${M.on[x.p.id]}'</span>`:''}${M.offAt[x.p.id]!=null&&!M.on[x.p.id]?` <span class="hint">↓${M.offAt[x.p.id]}'</span>`:''} ${'⚽'.repeat(e.g)}${e.a?` <span class="hint">${e.a} as.</span>`:''}</span><span class="rt ${rtCls(x.r)}">${fmt1(x.r)}</span></div>`;}).join('')}</div></div>`;}
function subPanel(){const sel=M.subOut?xiAll(M.xi).find(p=>p.id===M.subOut):null,min=M.phase==='ht'?45:Math.min(90,M.c*15);
  const close=M.pause?'<button class="btn sm" data-a="subclose">Nazad na utakmicu</button>':'';
  if(M.subs>=3)return `<div class="card subp"><div class="row between"><span class="lbl">Izmene · 3/3</span>${close}</div><div class="hint">Iskoristio si sve tri izmene.</div></div>`;
  const row=(p,a,extra)=>`<button class="li rtl" data-a="${a}" data-v="${p.id}"><span class="pos ${a==='subout'?M.posOf[p.id]:p.pos}">${POSL[a==='subout'?M.posOf[p.id]:p.pos]}</span><span class="grow">${esc(p.name)}</span>${extra}</button>`;
  const cc=v=>`<span class="chip ${v<55?'bad':v<75?'warn':''}">${Math.round(clamp(v,0,100))}%</span>`;
  const body=sel?`<div class="row between"><span class="hint">Ko ulazi umesto: <b>${esc(sel.name)}</b> (${POSL[M.posOf[sel.id]]})?</span><button class="btn sm" data-a="subout" data-v="0">Otkaži</button></div><div class="list">${benchOf().sort((x,y)=>ovrAt(y,M.posOf[sel.id])-ovrAt(x,M.posOf[sel.id])).map(p=>row(p,'subin',`${cc(p.cond??100)}<span class="ovr">${Math.round(ovrAt(p,M.posOf[sel.id]))}</span>`)).join('')||'<div class="hint">Nema nikoga na klupi.</div>'}</div>`
    :`<div class="hint">Izaberi ko izlazi. Procenat je trenutna kondicija, broj desno ocena do sada.</div><div class="list">${xiAll(M.xi).map(p=>{const r=rateP(p);return row(p,'subout',`${cc(mcond(p,min))}<span class="rt ${rtCls(r)}">${fmt1(r)}</span>`);}).join('')}</div>`;
  return `<div class="card subp">${M.pause?'<img class="subart" src="img/sub-board.webp" alt="" onerror="this.remove()">':''}<div class="row between"><span class="lbl">Izmene · ${M.subs}/3</span>${close}</div>${body}</div>`;}
function shoutHTML(){const h=M.c<3?0:1,left=2-M.shouts[h],busy=M.shout&&M.shout.c>=M.c,dis=left<=0||busy?'disabled':'';
  return `<div><span class="lbl">Gazda sa klupe · još ${left} ${plu(left,'uzvik','uzvika','uzvika')} u ovom poluvremenu</span><div class="row" style="gap:6px;margin-top:4px">${[['push','Napred!'],['hold','Čuvaj rezultat!'],['calm','Smirite igru!']].map(([v,l])=>`<button class="btn sm grow" data-a="shout" data-v="${v}" ${dis}>${l}</button>`).join('')}</div></div>`;}
// Live pitch: 22 dots follow the ball; possession decides where the ball goes; goals fly into the net.
function vizStart(){if(vizStart.on||typeof requestAnimationFrame==='undefined')return;vizStart.on=1;const loop=t=>{if(!M){vizStart.on=0;return;}const cv=document.getElementById('mviz');if(cv&&cv.getContext)try{drawViz(cv,t);}catch(e){}requestAnimationFrame(loop);};requestAnimationFrame(loop);}
function drawViz(cv,t){const W=cv.clientWidth||320,H=cv.clientHeight||110,dpr=Math.min(2,window.devicePixelRatio||1);if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const V=M.viz,live=M.phase==='live'&&!M.pause&&!M.fast;
  if(V.goal){const k=(t-V.goal.t0)/900;if(k>1.6)V.goal=null;else{V.tx=V.goal.us?1.01:-.01;V.ty=.5;}}
  else if(live&&t>V.nt){const ps=M.st.poss,p=ps.length?ps[ps.length-1]:.5,att=Math.random()<p;V.tx=att?.55+Math.random()*.38:.07+Math.random()*.38;V.ty=.12+Math.random()*.76;V.nt=t+500+Math.random()*700;}
  else if(!live&&!V.goal){V.tx=.5;V.ty=.5;}
  const sp=V.goal?.14:.05;V.bx+=(V.tx-V.bx)*sp;V.by+=(V.ty-V.by)*sp;
  for(let i=0;i<10;i++){g.fillStyle=i%2?'#3f8a3a':'#4a964a';g.fillRect(i*W/10,0,W/10+1,H);}
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.2;g.strokeRect(4,4,W-8,H-8);g.beginPath();g.moveTo(W/2,4);g.lineTo(W/2,H-4);g.stroke();g.beginPath();g.arc(W/2,H/2,H*.17,0,7);g.stroke();
  g.strokeRect(4,H*.28,W*.1,H*.44);g.strokeRect(W-4-W*.1,H*.28,W*.1,H*.44);g.fillStyle='rgba(255,255,255,.85)';g.fillRect(1,H*.42,3,H*.16);g.fillRect(W-4,H*.42,3,H*.16);
  const F=FORMS[S.tactics.form],sh=(V.bx-.5)*.28,[c1,c2]=COLORS[S.club.col]||COLORS.red,oc=COLORS[oppCol(M.oppT.name)]||COLORS.blue,o1=oc[0]===c1?'#e8e8e8':oc[0];
  const team=(rows,mir,col,ring)=>rows.forEach(([n,x],ri)=>{for(let i=0;i<n;i++){const y=(i+1)/(n+1),jx=Math.sin(t/700+ri*2+i*1.7)*.012,jy=Math.cos(t/900+i+ri)*.02;let px=x+(ri?sh:sh*.2)+jx;px=mir?1-px:px;const py=y+(V.by-.5)*.18*(ri?1:.2)+jy;
    g.fillStyle=col;g.strokeStyle=ring;g.lineWidth=1.2;g.beginPath();g.arc(4+px*(W-8),4+py*(H-8),Math.max(3.2,H*.04),0,7);g.fill();g.stroke();}});
  team([[1,.04],[F.DEF,.2],[F.MID,.4],[F.ATT,.58]],false,c1,c2);team([[1,.04],[4,.2],[4,.4],[2,.58]],true,o1,'rgba(0,0,0,.45)');
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(4+V.bx*(W-8)+2,4+V.by*(H-8)+3,3.5,2,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(4+V.bx*(W-8),4+V.by*(H-8),3.4,0,7);g.fill();
  wxFx(g,W,H,t);
  if(V.goal&&(t-V.goal.t0)>600){g.fillStyle=`rgba(255,255,255,${.5-Math.min(.5,((t-V.goal.t0)-600)/2000)})`;g.font=`700 ${H*.3}px Barlow Condensed, sans-serif`;g.textAlign='center';g.fillText('GOL!',W/2,H*.6);}}
function wxFor(home){if(S.b.flood>=1&&home)return 'wx-night';const h=hash((S.cid||'')+':'+S.season+':'+S.week)%100,se=seasonOf(Math.min(S.week,13));return h<(se==='autumn'?18:12)?'wx-rain':h<(se==='winter'?30:22)?'wx-fog':null;}
const WXC={'wx-rain':'☔ Kiša','wx-fog':'🌫 Magla'};
function wxFx(g,W,H,t){const w=M&&M.wx;if(!w)return;
  if(w==='wx-night'){const gr=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);gr.addColorStop(0,'rgba(0,0,20,0)');gr.addColorStop(1,'rgba(0,0,30,.45)');g.fillStyle=gr;g.fillRect(0,0,W,H);
    [[.02,0],[.98,0],[.02,1],[.98,1]].forEach(([x,y])=>{const r=g.createRadialGradient(x*W,y*H,0,x*W,y*H,H*.9);r.addColorStop(0,'rgba(255,250,220,.22)');r.addColorStop(1,'rgba(255,250,220,0)');g.fillStyle=r;g.fillRect(0,0,W,H);});}
  else if(w==='wx-rain'){g.fillStyle='rgba(30,40,60,.18)';g.fillRect(0,0,W,H);g.strokeStyle='rgba(220,230,255,.45)';g.lineWidth=1;g.beginPath();
    for(let i=0;i<46;i++){const x=((i*73.7+t*.09)%(W+20))-10,y=((i*41.3+t*.38)%(H+16))-8;g.moveTo(x,y);g.lineTo(x-3,y+9);}g.stroke();}
  else if(w==='wx-fog'){for(let i=0;i<3;i++){const x=((t*.012*(i+1)+i*W*.4)%(W*1.6))-W*.3,gr=g.createRadialGradient(x,H*(.3+i*.2),0,x,H*(.3+i*.2),W*.45);gr.addColorStop(0,'rgba(235,238,240,.55)');gr.addColorStop(1,'rgba(235,238,240,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);}
    g.fillStyle='rgba(225,230,232,.28)';g.fillRect(0,0,W,H);}}
function chantLine(){const n=short(S.club.name),us=M.g[0],th=M.g[1],u=S.ultras,mood=u?u.mood:S.fan;
  const who=u?u.name:(phase()<=2?'Ljudi sa ograde':'Tribina'),vb=u?'pevaju':phase()<=2?'viču':'peva';
  const pool=us>th?[`„${n}, ${n}, ovo je naše selo!”`,`„Ole, ole, ole, ${n}!”`,'„Pevaćemo do jutra!”']:us<th&&mood<40?['„Gazda, gde su pare?”','„Igrajte za grb!”','„Sramota!”']:us<th?['„Ajmo, momci, ne predajemo se!”',`„Napred, ${n}!”`]:[`„Ajmo, ${n}!”`,'„Samo jako, momci!”',`„${n}, srce naše!”`];
  return `${esc(who)} ${vb}: ${pick(pool)}`;}

