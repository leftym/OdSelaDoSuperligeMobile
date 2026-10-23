/* ---------- village scene: painted ---------- */
// Painted in passes: shapes -> brushstroke filter -> crisp details -> light grade -> lamps -> canvas texture.
function ell(g,x,y,rx,ry){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);g.fill();}
function poly(g,pts,fill){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();if(fill){g.fillStyle=fill;g.fill();}}
function person(g,x,y,col,s=1){g.fillStyle=col;g.fillRect(x-1.1*s,y-6*s,2.2*s,4*s);g.fillStyle='#e8c9a6';ell(g,x,y-7.5*s,1.4*s,1.4*s);}
const seasonOf=w=>w<=5?'autumn':w<=8?'winter':'spring';
const SEASON_N={autumn:'Jesen',winter:'Zima',spring:'Proleće'};
const SKY={morning:['#8cc0e4','#d4e6ee','#f4e0c2'],afternoon:['#6aa3d6','#b9d5e9','#f0ddb4'],golden:['#7598c6','#e6c09a','#f3a55a'],dusk:['#34477c','#9d6b8c','#ee9a62'],night:['#0a1330','#16264d','#2c3a63']};
const TINT={morning:'rgba(255,244,226,.05)',afternoon:'rgba(255,232,196,.04)',golden:'rgba(255,160,70,.13)',dusk:'rgba(110,60,120,.2)',night:'rgba(4,10,34,.52)'};
const VEG={autumn:{grass:'#8f9e50',far:'#a2a66f',tree:['#c98a2e','#b4562a','#d8b04a','#8a8f3a']},winter:{grass:'#8a9670',far:'#a7aea6',tree:['#6e5a48','#7d6a55','#5f6d58']},spring:{grass:'#6ea447',far:'#8daf73',tree:['#5f9b42','#4f8a3a','#79ad52']}};
let SCN={k:'',c:null},NOISE=null;
// Painted art (Nano Banana via Higgsfield), served next to the page in img/. Missing pieces fall back to the procedural painter.
const ART_BG={sumadija:{autumn:.57,spring:.6,winter:.6},vojvodina:{autumn:.68,winter:.61,spring:.67},zlatibor:{autumn:.65,spring:.61,winter:.62},jug:{autumn:.66,winter:.6,spring:.67}};
const ART_EV={harvest:'ev-harvest',slava:'ev-slava',rival:'ev-rival',brawl:'ev-rival',kafana:'ev-kafana',rakija:'ev-kafana',kid:'ev-kid',prodigy:'ev-kid',mayor:'ev-mayor',scandal1:'ev-mayor',election:'ev-mayor',cow:'ev-cow',wedding:'ev-wedding'};
const ART_PH={2:'ph2',3:'ph3',4:'ph4',5:'ph5'};
const IMGS={};
function artImg(name){let im=IMGS[name];if(!im){if(typeof Image==='undefined')return null;im=IMGS[name]=new Image();im.onload=()=>{SCN.k='';artRedraw();};im.onerror=()=>{im.bad=1;};im.src='img/'+name+'.webp';}return im.complete&&im.naturalWidth&&!im.bad?im:null;}
function artRedraw(){clearTimeout(artRedraw.t);artRedraw.t=setTimeout(()=>{if(!S){const c=$('#postcard');if(c)drawVillage(c,sceneSetup(),.42);}else if(S.tab==='home'&&!S.modal&&$('#village'))drawVillage($('#village'));},40);}
// Recurring characters: an event without its own painting shows who is talking to you.
const ART_WHO={butcher:'rade',election:'mayor',street:'mayor',scandal1:'journalist',scandal2:'journalist',press:'journalist',tv:'journalist',titlerace:'journalist',
  agent:'agent',bid:'agent',abroad:'agent',bigbid:'agent',contract:'agent',payrise:'agent',loanback:'agent',bank:'banker',inspector:'inspector',audit:'inspector',
  mower:'farmer',nets:'farmer',school:'teacher',youthcup:'teacher',prodigy:'teacher',diaspora:'uncle',investor:'investor',legendret:'legend',ruin1:'rival',ruin2:'rival',
  flares:'ultra',banner:'ultra',choreo:'ultra',eurotrip:'ultra',brawl:'ultra',cupfever:'ultra',pivara:'sponsor',mlekara:'sponsor',agro:'sponsor',sponsor2:'sponsor',signal:'sponsor',
  kladionica:'sponsor',konzorcijum:'sponsor',naming:'sponsor',tvdeal:'sponsor',poach:'coach'};
const WHO_HAVE=new Set(['rival','sponsor','ultra','investor','coach','banker','uncle','legend','rade','farmer','journalist','inspector','teacher','mayor','agent']);
const faceOf=p=>`img/pl-${String(1+hash(p.name)%12).padStart(2,'0')}.webp`;
const faceImg=(p,px)=>`<img class="gazda" src="${faceOf(p)}" alt="" width="${px}" height="${px}" style="width:${px}px;height:${px}px;border-width:1px" loading="lazy" decoding="async">`;
const GAZDA_ART={tajkun:'gazda-biznismen',sin:'gazda-sin',povratnik:'gazda-povratnik',igrac:'gazda-igrac',biznismen:'gazda-biznismen'};
const gazdaImg=(px,extra='')=>`<img class="gazda" src="img/${GAZDA_ART[S?S.owner.bg:SET.bg]||'gazda'}.webp" alt="${esc(S?S.owner.name:'Gazda')}, gazda kluba" width="${px}" height="${px}" style="width:${px}px;height:${px}px;${extra}" decoding="async">`;
const artOpt=name=>name?`<img class="evart" src="img/${name}.webp" alt="" decoding="async" onerror="this.remove()">`:'';
// ---- Youth intake day and pre-season ----
const coachArt=c=>`img/coach-${/Čika|Mića/.test(c.name)?1:1+hash(c.name)%6}.webp`;
const coachImg=(c,px)=>`<img class="gazda" src="${coachArt(c)}" onerror="this.onerror=null;this.src='img/pr-coach.webp'" alt="" width="${px}" height="${px}" style="width:${px}px;height:${px}px">`;
const staffImg=(k,px)=>`<img class="gazda" src="img/staff-${k}.webp" onerror="this.onerror=null;this.src='img/pr-coach.webp'" alt="" width="${px}" height="${px}" style="width:${px}px;height:${px}px;border-width:1px">`;
function intakeHTML(){const K=S.intake||[],room=maxSquad()-S.squad.length;
  return `${artOpt(S.b.academy>=2?'youth-academy':'youth-day')}<span class="eyebrow">Dan omladinske škole · ${S.season}. sezona</span><h2>Klinci traže priliku</h2><p class="story">Na livadi iza svlačionice stoji ${K.length} ${plu(K.length,'klinac','klinca','klinaca')}. Roditelji su na ogradi, trener drži spisak. Mesta u ekipi: <b>${Math.max(0,room)}</b>.</p>
  <div class="list">${K.map(p=>`<div class="li">${faceImg(p,40)}<span class="pos ${p.pos}">${POSL[p.pos]}</span><span class="grow"><b>${esc(p.name)}</b>${p.hype?' <span class="chip club">Talenat</span>':''}${p.prodigy?' <span class="chip warn">Čudo od deteta</span>':''}<br><span class="hint">${p.age} god. · ${persOf(p).n} · ocena ${Math.round(ovr(p))}</span></span><span class="stars">${starStr(starsOf(p))}</span>${p.ksg?'<span class="chip good">Potpisan</span>':`<button class="btn sm pri" data-a="ksign" data-v="${p.id}" ${room<=0?'disabled':''}>Potpiši</button>`}</div>`).join('')}</div>
  <p class="hint">Ko ne dobije ugovor, odlazi da igra za susedno selo. Deca dobijaju upola manju platu. ${room<=0?'Ekipa je puna: otpusti ili prodaj nekoga, ili pošalji mladog igrača na pozajmicu.':''}</p><button class="btn pri" data-a="kdone">Završi</button>`;}
const campCost=c=>c==='zlatibor'?150000*(1+S.li):c==='antalya'?600000*(1+S.li):0;
const CAMPS={home:['Kod kuće','Trening na svom terenu. Besplatno, ali bez posebnog efekta.'],zlatibor:['Zlatibor','Planinski vazduh: deo igrača dobija +1 kondiciju, svlačionica se zbližava.'],antalya:['Antalija','Profesionalne pripreme: više igrača napreduje, svlačionica i navijači su oduševljeni.']};
const FRS={none:['Bez','Odmor pred sezonu.'],local:['Seoski turnir','Turnir sa susednim selima: selo je srećno, malo para.'],big:['Jak rival','Utakmica sa jakim klubom: novac i ugled, ali rizik od povrede.']};
function preHTML(){const P=S.pre||(S.pre={camp:'home',fr:'none'}),cost=campCost(P.camp),cs=[['home','Kod kuće'],['zlatibor','Zlatibor']].concat(phase()>=3?[['antalya','Antalija']]:[]);
  return `${artOpt('camp-'+P.camp)}<span class="eyebrow">Pripreme · ${S.season}. sezona</span><h2>Gde se spremamo?</h2>
  <span class="lbl">Kamp</span>${seg(cs,P.camp,'pcamp')}<div class="hint">${CAMPS[P.camp][1]}${cost?` Cena: ${fmt(cost)}.`:''}</div>
  <span class="lbl">Prijateljske utakmice</span>${seg(Object.keys(FRS).map(k=>[k,FRS[k][0]]),P.fr,'pfr')}<div class="hint">${FRS[P.fr][1]}</div>
  <button class="btn pri" data-a="pgo" ${S.money<cost?'disabled':''}>Kreni u pripreme</button>`;}
function preGo(){const P=S.pre||{camp:'home',fr:'none'},msgs=[],cost=campCost(P.camp);S.money-=cost;if(cost)led('other',-cost);
  if(P.camp!=='home'){const n=P.camp==='antalya'?.6:.4;let g=0;S.squad.forEach(p=>{if(Math.random()<n&&p.fit<20){p.fit++;g++;}if(P.camp==='antalya'&&Math.random()<.25){const k=pick(STATS)[0];if(p[k]<20&&ovr(p)<p.pot)p[k]++;}});S.harmony=clamp(harmony()+(P.camp==='antalya'?7:4),0,100);if(P.camp==='antalya')S.fan=clamp(S.fan+2,0,100);msgs.push(`${CAMPS[P.camp][0]}: ${g} ${plu(g,'igrač je','igrača su','igrača je')} u boljoj kondiciji, a svlačionica se zbližila.`);}
  else msgs.push('Pripreme kod kuće. Ništa posebno, ali ni troškova.');
  if(P.fr==='local'){const m=Math.round(30000*(1+S.li*.5));S.money+=m;led('other',m);S.goodwill=clamp(S.goodwill+5,0,100);S.harmony=clamp(harmony()+2,0,100);msgs.push(`Seoski turnir: pobeda u finalu protiv komšija, roštilj do ponoći. Selo +5, ${fmt(m)}.`);}
  if(P.fr==='big'){const W=world(),gi=Object.values(W).filter(c=>c.li===Math.min(6,S.li+1)).sort((a,b)=>b.r-a.r)[0],nm=gi?gi.name:bigC(),my=powersOf(pickXI()).rating,or=gi?gi.r:LEAGUES[6].lvl,gf=poisson(1.1*Math.pow(my/or,1.6)),ga=poisson(1.3*Math.pow(or/my,1.6)),m=Math.round(150000*(1+S.li)/10000)*10000;
    S.money+=m;led('other',m);addUgled(2);let inj='';if(Math.random()<.25){const p=pick(S.squad);p.inj=RI(1,2);inj=` ${p.name} se povredio (${p.inj} ned.).`;}msgs.push(`Prijateljska: ${short(S.club.name)} ${gf}–${ga} ${short(nm)}. Pola regiona je došlo da gleda. ${fmt(m)}.${inj}`);}
  news(`Pripreme: ${msgs.join(' ')}`);S.modal={type:'outcome',title:'Pripreme',msgs};}
const artTag=(name,cls='evart')=>name?`<img class="${cls}" src="img/${name}.webp" alt="" decoding="async">`:'';
function sceneState(){
  const w=Math.min(S.week,13),season=seasonOf(w),reg=S.region||'sumadija';
  const snow=season==='winter'&&(!!(ART_BG[reg]&&ART_BG[reg].winter)||reg==='zlatibor'||(reg!=='vojvodina'&&hash(S.club.village+S.season)%3!==0));
  return{region:reg,ph:phase(),li:S.li,b:{...S.b},season,snow,village:S.club.village,club:S.club.name,col:S.club.col,
    crowd:Math.min(cap(),S.lastAtt||Math.round(40+S.fan)),ultras:S.ultras?S.ultras.name:null,um:S.ultras?S.ultras.mood:0,vp:(S.vp||[]).slice(),tv:!!S.flags.tv};
}
function sceneSetup(){const b={};for(const k in BUILD)b[k]=0;return{region:SET.region,ph:1,li:0,b,season:'autumn',snow:false,village:SET.village||'Selo',club:'FK '+(SET.club||'Mladost'),col:SET.col,crowd:24,ultras:null,um:0,vp:[],tv:false,setup:true};}
const todOf=st=>st.ph>=5?(st.b.flood>=1?'night':'dusk'):[null,'morning','afternoon','golden','dusk'][st.ph];

function ridge(W,H,yb,amp,f,seed,jag){const pts=[];for(let x=-6;x<=W+6;x+=5){let y=H*yb-Math.sin(x/W*Math.PI*f+seed)*H*amp-Math.sin(x/W*9+seed*3)*H*amp*.3;if(jag)y-=Math.abs(Math.sin(x/W*Math.PI*jag+seed*2))*H*amp*.8;pts.push([x,y]);}return pts;}
function fillRidge(g,pts,H,col){g.beginPath();g.moveTo(pts[0][0],H);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(pts[pts.length-1][0],H);g.closePath();g.fillStyle=col;g.fill();}
const yAt=(pts,x)=>{const i=Math.max(0,Math.min(pts.length-1,Math.round((x+6)/5)));return pts[i][1];};
function tree(g,x,y,r,col){g.fillStyle='#4a3a2a';g.fillRect(x-.7,y-r*.5,1.4,r*.9);g.fillStyle=col;ell(g,x,y-r*.95,r,r*.85);}
function pine(g,x,y,h,col,snow){poly(g,[[x,y-h],[x-h*.32,y],[x+h*.32,y]],col);if(snow)poly(g,[[x,y-h],[x-h*.13,y-h*.6],[x+h*.13,y-h*.6]],'#f1f4f6');}
function house(g,x,y,w,wall,roof,snow,glows){const h=w*.7;g.fillStyle=wall;g.fillRect(x-w/2,y-h,w,h);poly(g,[[x-w*.62,y-h],[x,y-h-w*.5],[x+w*.62,y-h]],roof);if(snow)poly(g,[[x-w*.5,y-h-w*.08],[x,y-h-w*.5],[x+w*.5,y-h-w*.08]],'#f3f6f8');g.fillStyle='rgba(60,40,20,.55)';g.fillRect(x-w*.15,y-h*.55,w*.3,h*.3);glows.push([x,y-h*.4,w*.4]);}

const LAND={
  zlatibor(g,W,H,r,st,veg){
    const far=ridge(W,H,.34,.1,1.6,1.3,5);fillRidge(g,far,H,'#8ba1bc');
    g.fillStyle='rgba(246,249,252,.92)';far.forEach((p,i)=>{if(i%2===0&&p[1]<H*.3)ell(g,p[0],p[1]+3,5,3.5);});
    const mid=ridge(W,H,.42,.05,2.2,2.7);fillRidge(g,mid,H,st.snow?'#9fb3ad':'#56795b');
    for(let x=-4;x<W+6;x+=6)pine(g,x+r()*3,yAt(mid,x)+6+r()*6,10+r()*7,st.snow?'#3c5a46':'#2e4f38',st.snow);
    fillRidge(g,ridge(W,H,.495,.02,3,4.1),H,st.snow?'#e6ebee':veg.far);
  },
  sumadija(g,W,H,r,st,veg){
    fillRidge(g,ridge(W,H,.31,.06,1.3,.7),H,'#9db39a');
    const mid=ridge(W,H,.41,.055,2.1,1.9);fillRidge(g,mid,H,st.snow?'#e3e8ea':veg.far);
    for(let row=0;row<4;row++)for(let x=4;x<W;x+=11){if(x>W*.66&&x<W*.97)continue;const y=yAt(mid,x)+6+row*6;const c=st.season==='spring'?(r()<.6?'#f6e4ee':'#6f9c4a'):st.season==='winter'?'#7a6a58':pick(veg.tree);tree(g,x+r()*3,y,st.season==='winter'?2.4:3.6,c);}
    g.strokeStyle=st.snow?'#c9d0cf':'#5f7334';g.lineWidth=1.6;for(let i=0;i<12;i++){const x=W*.68+i*W*.024;g.beginPath();g.moveTo(x,H*.51);g.lineTo(x+W*.035,yAt(mid,x)+4);g.stroke();}
  },
  vojvodina(g,W,H,r,st,veg){
    poly(g,[[0,H*.4],[W,H*.395],[W,H*.47],[0,H*.47]],'#a9b78f');
    for(let i=0;i<16;i++){const x=W*(.02+i*.064+r()*.02),hh=H*(.07+r()*.05);g.fillStyle=st.season==='autumn'?pick(['#c7a23c','#b88a2e','#d1b04a']):st.season==='winter'?'#7c6d5a':pick(['#4f7d3a','#5d8a43']);ell(g,x,H*.405-hh/2,W*.008,hh/2);}
    const bands=st.snow?['#e8ecef','#dfe4e6','#e8ecef','#d9dfe1']:st.season==='autumn'?['#c9a86a','#8a6a48','#d6b45c','#9b7a52']:st.season==='winter'?['#a4927a','#8a7860','#a89a80','#7d6e58']:['#8fbf5a','#e3c33a','#7fb04e','#9cc463'];
    for(let i=0;i<8;i++){const c=bands[i%4],ya=.405+i*.0145;poly(g,[[0,H*ya],[W,H*(ya-.004)],[W,H*(ya+.012)],[0,H*(ya+.016)]],c);}
    if(!st.snow&&st.season!=='winter'){for(let i=0;i<160;i++){const x=r()*W,y=H*(.44+r()*.07);g.fillStyle=st.season==='spring'?'#f0cf34':'#a6853a';ell(g,x,y,1.6,1.4);if(st.season==='spring'){g.fillStyle='#5a3d1e';ell(g,x,y,.6,.6);}}}
    const tx=W*.93,ty=H*.43;g.fillStyle='#b9b4aa';g.fillRect(tx-1.5,ty-H*.12,3,H*.12);g.fillStyle='#c9c3b8';ell(g,tx,ty-H*.13,W*.016,H*.02);
    const sx=W*.66,sy=H*.44,sw=W*.06;g.fillStyle='#f3efe6';g.fillRect(sx-sw/2,sy-sw*.45,sw,sw*.45);poly(g,[[sx-sw*.6,sy-sw*.45],[sx,sy-sw*.8],[sx+sw*.6,sy-sw*.45]],st.snow?'#f1f4f6':'#a88a52');
  },
  jug(g,W,H,r,st,veg){
    fillRidge(g,ridge(W,H,.32,.09,1.8,2.2,3),H,'#a69d84');
    const mid=ridge(W,H,.43,.06,2.4,3.6);fillRidge(g,mid,H,st.snow?'#dfe4e3':'#8e8f62');
    g.strokeStyle=st.snow?'#c8cecd':'#7b7c50';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();mid.forEach((p,i)=>{const y=p[1]+k*5;i?g.lineTo(p[0],y):g.moveTo(p[0],y);});g.stroke();}
    const mx=W*.64,my=yAt(mid,mx)+2,mw=W*.07;g.fillStyle='#f4efe4';g.fillRect(mx-mw/2,my-mw*.4,mw,mw*.4);poly(g,[[mx-mw*.58,my-mw*.4],[mx,my-mw*.62],[mx+mw*.58,my-mw*.4]],st.snow?'#eef1f3':'#a8452e');g.fillStyle='#7d8f86';ell(g,mx,my-mw*.66,mw*.14,mw*.12);g.fillStyle='#c9a227';g.fillRect(mx-.7,my-mw*.92,1.4,mw*.16);g.fillRect(mx-mw*.05,my-mw*.86,mw*.1,1.4);
    for(let i=0;i<14;i++){const x=r()*W;tree(g,x,yAt(mid,x)+8+r()*8,2.4,st.season==='spring'?'#6f8f45':pick(veg.tree));}
    fillRidge(g,ridge(W,H,.495,.022,3,1.1),H,st.snow?'#e6ebee':veg.far);
  }
};

function paintLand(g,W,H,st,r){
  const veg=VEG[st.season],tod=todOf(st),sky=SKY[tod];
  let gr=g.createLinearGradient(0,0,0,H*.55);gr.addColorStop(0,sky[0]);gr.addColorStop(.55,sky[1]);gr.addColorStop(1,sky[2]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(tod==='night'){g.fillStyle='#f4efd8';ell(g,W*.82,H*.13,H*.035,H*.035);g.fillStyle=sky[1];ell(g,W*.82+H*.014,H*.125,H*.03,H*.03);}
  else{const sy={morning:.16,afternoon:.12,golden:.3,dusk:.4}[tod],sg=g.createRadialGradient(W*.8,H*sy,0,W*.8,H*sy,H*.38);sg.addColorStop(0,'rgba(255,246,220,1)');sg.addColorStop(.12,'rgba(255,236,190,.8)');sg.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=sg;g.fillRect(0,0,W,H*.75);}
  const cc=tod==='night'?'rgba(70,85,130,.4)':tod==='dusk'?'rgba(245,185,175,.6)':tod==='golden'?'rgba(255,224,190,.7)':'rgba(255,255,255,.72)';
  for(let i=0;i<4;i++){const x=r()*W,y=H*(.06+r()*.15),s=W*(.05+r()*.05);for(let k=0;k<7;k++){const cx=x+(r()-.5)*s*2.2,cy=y+(r()-.5)*s*.3,rr=s*(.35+r()*.5),rg=g.createRadialGradient(cx,cy,0,cx,cy,rr);rg.addColorStop(0,cc);rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.save();g.translate(cx,cy);g.scale(1,.45);g.translate(-cx,-cy);g.fillRect(cx-rr,cy-rr,rr*2,rr*2);g.restore();}}
  LAND[st.region](g,W,H,r,st,veg);
  g.fillStyle=st.snow?'#e4e9ec':veg.grass;g.fillRect(0,H*.52,W,H*.48);
  if(st.snow){g.fillStyle='rgba(140,155,120,.4)';for(let i=0;i<30;i++)ell(g,r()*W,H*(.53+r()*.45),W*(.01+r()*.03),H*(.004+r()*.008));}
  else if(st.season==='autumn'){for(let i=0;i<60;i++){g.fillStyle=pick(veg.tree);ell(g,r()*W,H*(.53+r()*.45),1.4,.9);}}
}
const MEAD={};
function meadOf(name,im,hz){if(name in MEAD)return MEAD[name];let c=null;
  try{const cv=document.createElement('canvas');cv.width=40;cv.height=20;const x=cv.getContext('2d',{willReadFrequently:true}),ih=im.naturalHeight;
    x.drawImage(im,im.naturalWidth*.1,ih*(hz+.06),im.naturalWidth*.8,ih*(.9-hz-.06),0,0,40,20);const d=x.getImageData(0,0,40,20).data;let r=0,gg=0,b=0,n=0;
    for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];n++;}c=[r/n,gg/n,b/n];}catch(e){c=null;}
  return MEAD[name]=c;}
function paintBackdrop(g,W,H,st,im,hz){
  const iw=im.naturalWidth,ih=im.naturalHeight,base=H*.53;
  const s=Math.max(W/iw,base/(hz*ih)),dw=iw*s,dh=ih*s,dx=(W-dw)/2,dy=base-hz*dh;
  const sy=ih*Math.min(.9,hz+.06);g.drawImage(im,0,sy,iw,ih-sy,0,H*.54,W,H*.46);
  g.drawImage(im,dx,dy,dw,dh);
}
// Painted building pieces (img/sp-*.webp, cut out of a flat background). Each returns false until loaded, so the old shapes still draw.
function drawSpr(g,name,cx,bottom,w){const im=artImg('sp-'+name);if(!im)return false;const h=w*im.naturalHeight/im.naturalWidth;
  g.fillStyle='rgba(30,25,15,.22)';ell(g,cx,bottom-1,w*.46,Math.max(2,h*.05));g.drawImage(im,cx-w/2,bottom-h,w,h);return {x0:cx-w/2,x1:cx+w/2,y0:bottom-h,y1:bottom,h};}
function paintBuild(g,W,H,st,r,glows,bg,mead){
  const SP={};
  const mx=(hex,t)=>{if(!mead)return hex;const c=hexRgb(hex);return rgbHex(c.map((v,k)=>v+(mead[k]-v)*t));};
  const [c1,c2]=COLORS[st.col]||COLORS.red,veg=VEG[st.season],b=st.b,hilly=st.region!=='vojvodina';
  const walls=['#f2e8d6','#e5d1b5','#efe3cf','#e9dcc6'],roofs=['#b4472f','#a84a32','#8f3b2a','#b85a3a'];
  const nH=12+(st.li>=2?7:0)+st.vp.length*3;
  if(!bg)for(let i=0;i<nH;i++){const x=W*(.03+r()*.62),y=hilly?H*(.38+r()*.075):H*(.455+r()*.012),w=W*(hilly?.022+r()*.012:.017+r()*.008);house(g,x,y,w,pick(walls),pick(roofs),st.snow,glows);}
  if(!bg&&st.region!=='jug'){const cx=W*.34,cy=hilly?H*.405:H*.465,s=hilly?1:.8;g.fillStyle='#f6f1e6';g.fillRect(cx-W*.03*s,cy-H*.06*s,W*.06*s,H*.06*s);g.fillRect(cx+W*.02*s,cy-H*.13*s,W*.022*s,H*.13*s);poly(g,[[cx+W*.016*s,cy-H*.13*s],[cx+W*.031*s,cy-H*.18*s],[cx+W*.046*s,cy-H*.13*s]],'#5b6b74');poly(g,[[cx-W*.034*s,cy-H*.06*s],[cx,cy-H*.095*s],[cx+W*.034*s,cy-H*.06*s]],st.snow?'#eef2f4':'#a3412c');g.fillStyle=st.vp.includes('church')?'#e0b83c':'#c9a227';g.fillRect(cx+W*.0295*s,cy-H*.205*s,1.5,H*.03*s);g.fillRect(cx+W*.024*s,cy-H*.195*s,W*.014*s,1.5);}
  // village projects on the hillside
  const vp=st.vp;
  if(vp.includes('school')){const x=W*.5,y=hilly?H*.405:H*.468,w=W*.09;g.fillStyle='#f4efe6';g.fillRect(x-w/2,y-w*.42,w,w*.42);poly(g,[[x-w*.55,y-w*.42],[x,y-w*.62],[x+w*.55,y-w*.42]],st.snow?'#eef2f4':'#a3412c');g.fillStyle='rgba(90,120,150,.8)';for(let i=0;i<4;i++){g.fillRect(x-w*.4+i*w*.22,y-w*.3,w*.12,w*.1);glows.push([x-w*.34+i*w*.22,y-w*.25,w*.12]);}g.strokeStyle='#888';g.lineWidth=1;g.beginPath();g.moveTo(x+w*.6,y);g.lineTo(x+w*.6,y-w*.75);g.stroke();g.fillStyle='#c6363c';g.fillRect(x+w*.6,y-w*.75,w*.2,w*.05);g.fillStyle='#0c4076';g.fillRect(x+w*.6,y-w*.7,w*.2,w*.05);g.fillStyle='#fff';g.fillRect(x+w*.6,y-w*.65,w*.2,w*.05);}
  if(vp.includes('clinic')){const x=W*.6,y=hilly?H*.41:H*.468,w=W*.07;g.fillStyle='#fbfbfb';g.fillRect(x-w/2,y-w*.45,w,w*.45);g.fillStyle='#d62828';g.fillRect(x-w*.04,y-w*.38,w*.08,w*.26);g.fillRect(x-w*.13,y-w*.29,w*.26,w*.08);glows.push([x,y-w*.2,w*.3]);}
  if(vp.includes('factory')){const x=W*.74,y=hilly?H*.43:H*.468,w=W*.1;g.fillStyle='#a6a9ad';g.fillRect(x-w/2,y-w*.35,w,w*.35);for(let i=0;i<3;i++)poly(g,[[x-w/2+i*w/3,y-w*.35],[x-w/2+(i+.5)*w/3,y-w*.5],[x-w/2+(i+1)*w/3,y-w*.35]],'#8e9195');g.fillStyle='#7a7d80';g.fillRect(x+w*.35,y-w*.85,w*.07,w*.5);}
  if(vp.includes('park')){const x=W*.42,y=H*.475;g.fillStyle=st.snow?'#e9eef0':'#5f9a48';ell(g,x,y,W*.045,H*.012);}
  // kafana
  const kx=W*.87,ky=H*.535,kw=W*.13;if((SP.kafana=drawSpr(g,'kafana',kx,ky+H*.012,W*.16)))glows.push([kx-kw*.15,ky-kw*.2,kw*.2]);else{g.fillStyle='#eadcc2';g.fillRect(kx-kw/2,ky-kw*.55,kw,kw*.55);poly(g,[[kx-kw*.58,ky-kw*.55],[kx,ky-kw*.85],[kx+kw*.58,ky-kw*.55]],st.snow?'#eef2f4':'#9a3b28');g.fillStyle='#3b2a1d';g.fillRect(kx-kw*.36,ky-kw*.5,kw*.72,kw*.14);g.fillStyle='rgba(255,214,120,.75)';g.fillRect(kx-kw*.3,ky-kw*.3,kw*.16,kw*.14);g.fillRect(kx+kw*.14,ky-kw*.3,kw*.16,kw*.14);glows.push([kx-kw*.22,ky-kw*.23,kw*.2],[kx+kw*.22,ky-kw*.23,kw*.2]);}
  if(vp.includes('road')){poly(g,[[0,H*.565],[W*.13,H*.555],[W*.16,H*.585],[0,H*.62]],'#7d7d78');}
  if(b.training>=1){const tl=W*.18,tr=W*.31,ty=H*.535;poly(g,[[tl+6,ty],[tr-6,ty],[tr,ty+H*.035],[tl,ty+H*.035]],st.snow&&b.pitch<2?'#dfe6e3':'#579142');}
  // changing rooms (or the oak)
  const hx=W*.085,hy=H*.565,chT=Math.min(3,b.changing),chS=drawSpr(g,['oak','changing-1','changing-2','changing-3'][chT],hx+(chT?0:W*.005),hy,W*[.15,.11,.13,.15][chT]);
  if(chS&&chT)glows.push([hx,hy-chS.h*.45,W*.04]);
  if(!chS){
  if(b.changing>=3){const w=W*.12,h=w*.5;g.fillStyle='rgba(140,190,215,.95)';g.fillRect(hx-w/2,hy-h,w,h);g.fillStyle='#e6e8ea';g.fillRect(hx-w/2,hy-h-3,w,3);g.fillStyle=c1;g.fillRect(hx-w/2,hy-h*.25,w,h*.25);glows.push([hx,hy-h*.6,w*.5]);}
  else if(b.changing>=2){const w=W*.11,h=w*.48;g.fillStyle='#d9d6cf';g.fillRect(hx-w/2,hy-h,w,h);g.fillStyle='#8f8a80';g.fillRect(hx-w/2-2,hy-h-3,w+4,3);g.fillStyle=c1;g.fillRect(hx-w/2,hy-h*.95,w,h*.16);g.fillStyle='#4a5560';g.fillRect(hx-w*.32,hy-h*.6,w*.16,h*.6);g.fillStyle='rgba(120,170,200,.8)';g.fillRect(hx+w*.05,hy-h*.6,w*.13,h*.25);g.fillRect(hx+w*.24,hy-h*.6,w*.13,h*.25);glows.push([hx+w*.2,hy-h*.5,w*.25]);}
  else if(b.changing>=1){const w=W*.085,h=w*.55;g.fillStyle='#9a6a3e';g.fillRect(hx-w/2,hy-h,w,h);g.strokeStyle='rgba(60,35,15,.45)';g.lineWidth=1;for(let i=1;i<5;i++){g.beginPath();g.moveTo(hx-w/2+i*w/5,hy-h);g.lineTo(hx-w/2+i*w/5,hy);g.stroke();}poly(g,[[hx-w*.6,hy-h],[hx,hy-h-w*.38],[hx+w*.6,hy-h]],st.snow?'#eef2f4':'#5a2d1d');g.fillStyle='#3e2716';g.fillRect(hx-w*.1,hy-h*.7,w*.2,h*.7);}
  else{g.fillStyle='#5a3d22';g.fillRect(hx-3,hy-H*.08,6,H*.08);const lc=st.season==='winter'?'#6b5a48':st.season==='autumn'?'#b97a2c':'#46682f';g.fillStyle=lc;ell(g,hx,hy-H*.1,W*.05,H*.055);ell(g,hx-W*.03,hy-H*.08,W*.03,H*.04);ell(g,hx+W*.03,hy-H*.085,W*.032,H*.04);if(st.snow){g.fillStyle='#f1f4f6';ell(g,hx,hy-H*.14,W*.04,H*.015);}}
  }
  if(b.medical>=1&&b.changing<2){g.fillStyle='#fff';g.fillRect(hx-W*.06,hy-H*.03,W*.025,W*.02);g.fillStyle='#d62828';g.fillRect(hx-W*.0515,hy-H*.03+2,W*.008,W*.02-4);}
  const y0=H*.585,y1=H*.935,at=(u,v)=>{const xl=W*.17+(W*.04-W*.17)*v,xr=W*.83+(W*.96-W*.83)*v;return[xl+(xr-xl)*u,y0+(y1-y0)*v];};
  // stands (structures only; crowds come later)
  const stT=Math.min(5,b.stands),stU=[0,[.3,.7],[.1,.9],[.06,.94],[-.03,1.03],[-.09,1.09]][stT];
  const stIm=stT?artImg('sp-stand-'+stT):null;
  if(!stIm){
  if(b.stands>=5){const a=at(-.06,0),e=at(1.06,0);for(let k=0;k<6;k++){g.fillStyle=k%2?'#7f858b':'#9aa0a6';g.fillRect(a[0]-k*5,a[1]-58-k*4,e[0]-a[0]+k*10,4);}g.fillStyle=c1;g.fillRect(a[0]-34,a[1]-88,e[0]-a[0]+68,6);g.fillStyle='#5b6168';for(let i=0;i<=12;i++)g.fillRect(a[0]-30+i*(e[0]-a[0]+60)/12,a[1]-82,2,24);}
  if(b.stands>=4){const a=at(.02,0),e=at(.98,0);for(let k=0;k<7;k++){g.fillStyle=k%2?'#8f959b':'#aab0b6';g.fillRect(a[0]-30-k*4,a[1]-30-k*4,e[0]-a[0]+60+k*8,4);}
    for(let k=0;k<4;k++){const col=k%2?'#9aa0a6':'#b8bdc2',[x0,yy0]=at(0,0),[x1,yy1]=at(0,1),[u0,v0]=at(1,0),[u1,v1]=at(1,1);poly(g,[[x0-8-k*6,yy0],[x0-2-k*6,yy0],[x1-6-k*8,yy1],[x1-14-k*8,yy1]],col);poly(g,[[u0+2+k*6,v0],[u0+8+k*6,v0],[u1+14+k*8,v1],[u1+6+k*8,v1]],col);}}
  if(b.fanbiz>=4){const a=at(.35,0),e=at(.65,0);g.fillStyle='rgba(150,200,230,.9)';g.fillRect(a[0],a[1]-64,e[0]-a[0],7);glows.push([(a[0]+e[0])/2,a[1]-60,e[0]-a[0]]);}
  if(b.stands>=3){const a=at(.1,0),e=at(.9,0);poly(g,[[a[0]-20,a[1]-36],[e[0]+20,e[1]-36],[e[0]+12,e[1]-28],[a[0]-12,a[1]-28]],c1);g.fillStyle='#55595e';const sp=(e[0]-a[0])/6;for(let i=0;i<=6;i++)g.fillRect(a[0]-8+i*(sp+16/6),a[1]-29,2,26);}
  if(b.stands>=2){const a=at(.12,0),e=at(.88,0);for(let k=0;k<5;k++){g.fillStyle=k%2?'#b9b6ae':'#cfccc4';g.fillRect(a[0]-k*3,a[1]-4-k*4.5,e[0]-a[0]+k*6,4.5);}}
  else if(b.stands>=1){for(let k=0;k<3;k++){const a=at(.3,0),e=at(.7,0),yy=a[1]-5-k*5;g.fillStyle='#7d4f2c';g.fillRect(a[0]+k*6,yy,e[0]-a[0]-k*12,2.5);g.fillStyle='#5b3a20';for(let x=a[0]+k*6+4;x<e[0]-k*6;x+=18)g.fillRect(x,yy+2,1.5,4);}}
  }
  if(b.training>=2&&!drawSpr(g,'gym',W*.335,H*.545,W*.075)){const x=W*.32,y=H*.535,w=W*.06;g.fillStyle='#c9cdd2';g.fillRect(x,y-w*.5,w,w*.5);g.fillStyle='#7d858c';g.fillRect(x-1,y-w*.55,w+2,3);g.fillStyle='rgba(120,170,200,.8)';g.fillRect(x+w*.12,y-w*.36,w*.76,w*.12);}
  if(b.training>=3&&!drawSpr(g,'training',W*.24,H*.535,W*.11)){const x=W*.24,y=H*.525,w=W*.09;g.fillStyle='#d7dade';g.fillRect(x-w/2,y-w*.45,w,w*.45);g.fillStyle=c1;g.fillRect(x-w/2,y-w*.45,w,w*.08);glows.push([x,y-w*.25,w*.5]);}
  if(b.academy>=2&&(SP.acad=drawSpr(g,'academy',W*.6,H*.53,W*.085)))for(let i=0;i<3;i++)glows.push([W*.575+i*W*.025,H*.53-SP.acad.h*.45,W*.012]);
  if(b.academy>=2&&!SP.acad){const x=W*.6,y=H*.52,w=W*.07;g.fillStyle='#e9e2d4';g.fillRect(x-w/2,y-w*.6,w,w*.6);poly(g,[[x-w*.56,y-w*.6],[x,y-w*.85],[x+w*.56,y-w*.6]],st.snow?'#eef2f4':'#7b3b2a');for(let i=0;i<3;i++)glows.push([x-w*.3+i*w*.28,y-w*.4,w*.15]);}
  if(b.academy>=3&&!drawSpr(g,'dorms',W*.48,H*.525,W*.1)){const x=W*.48,y=H*.515,w=W*.08;g.fillStyle='#efe8da';g.fillRect(x-w/2,y-w*.5,w,w*.5);g.fillStyle=c1;g.fillRect(x-w/2,y-w*.5,w,w*.06);}
  if(b.fanbiz>=1&&(SP.grill=drawSpr(g,'rostilj',W*.75,H*.57,W*.065)))glows.push([W*.75,H*.57-SP.grill.h*.5,W*.03]);
  if(b.fanbiz>=1&&!SP.grill){const rx=W*.75,ry=H*.565;g.fillStyle='#2b2b2b';g.fillRect(rx-W*.03,ry-H*.025,W*.06,H*.02);g.fillStyle='#e0572a';g.fillRect(rx-W*.026,ry-H*.028,W*.052,H*.005);glows.push([rx,ry-H*.026,W*.05]);}
  if(b.fanbiz>=2&&(SP.bar=drawSpr(g,'club-kafana',W*.665,H*.572,W*.095)))glows.push([W*.665,H*.572-SP.bar.h*.4,W*.035]);
  if(b.fanbiz>=2&&!SP.bar){const bx=W*.665,by=H*.565,bw=W*.07;g.fillStyle='#efe6d3';g.fillRect(bx-bw/2,by-bw*.55,bw,bw*.55);for(let i=0;i<6;i++){g.fillStyle=i%2?c2:c1;g.fillRect(bx-bw/2-2+i*(bw+4)/6,by-bw*.6,(bw+4)/6,bw*.12);}g.fillStyle='rgba(255,214,120,.8)';g.fillRect(bx-bw*.3,by-bw*.38,bw*.6,bw*.18);glows.push([bx,by-bw*.3,bw*.5]);}
  if(b.fanbiz>=3&&!drawSpr(g,'fanshop',W*.585,H*.578,W*.05)){const x=W*.585,y=H*.575,w=W*.04;g.fillStyle=c1;g.fillRect(x-w/2,y-w*.6,w,w*.6);g.fillStyle=c2;g.fillRect(x-w/2,y-w*.6,w,w*.15);}
  // the painted stand goes in front of the club buildings; whatever it hides loses its window glow too
  if(stIm){const a=at(stU[0],0),e=at(stU[1],0),B=SP.stand=drawSpr(g,'stand-'+stT,(a[0]+e[0])/2,a[1]+2,e[0]-a[0]);
    if(B)for(let i=glows.length-1;i>=0;i--){const [x,y]=glows[i];if(x>B.x0&&x<B.x1&&y>B.y0&&y<B.y1)glows.splice(i,1);}}
  // pitch surface
  const P=[at(0,0),at(1,0),at(1,1),at(0,1)];
  const frozen=st.snow&&b.pitch<2;
  if(frozen){poly(g,P,'#dde4e1');g.fillStyle='rgba(120,140,95,.5)';for(let i=0;i<22;i++){const [x,y]=at(r(),r());ell(g,x,y,W*(.01+r()*.03),H*(.005+r()*.01));}}
  else if(b.pitch>=2){const hy=b.pitch>=4,ns=hy?16:12,k=hy?.12:.2;poly(g,P,mx(hy?'#2f8f3f':'#3f8a3a',k));for(let i=0;i<ns;i+=2)poly(g,[at(i/ns,0),at((i+1)/ns,0),at((i+1)/ns,1),at(i/ns,1)],mx(hy?'#3da34c':'#4c9a45',k));}
  else if(b.pitch>=1){poly(g,P,mx(st.season==='autumn'?'#5b8a3c':'#4d8a3b',.45));for(let i=0;i<10;i+=2)poly(g,[at(i/10,0),at((i+1)/10,0),at((i+1)/10,1),at(i/10,1)],mx(st.season==='autumn'?'#669444':'#5a9846',.45));}
  else{poly(g,P,mead?rgbHex(mead.map(v=>v*.92)):st.season==='spring'?'#7c9a47':'#869349');for(let i=0;i<16;i++){const [x,y]=at(r(),r());g.fillStyle=r()<.5?'rgba(130,110,60,.55)':'rgba(100,130,60,.5)';ell(g,x,y,W*(.01+r()*.03),H*(.005+r()*.012));}for(let i=0;i<10;i++){const [x,y]=at(r(),r());g.fillStyle='#5f4a2c';ell(g,x,y,2,1.3);}}
  // floodlight masts and TV tower
  if(b.flood>=1)[[-.03,-.02],[1.03,-.02],[-.02,1.02],[1.02,1.02]].forEach(([u,v])=>{const [x,y]=at(u,v),hgt=H*(v>.5?.36:.3)*(b.flood>=2?1.35:1),im=artImg('sp-flood');
    if(im){SP.flood=1;const w=(hgt+8)*im.naturalWidth/im.naturalHeight;g.drawImage(im,x-w/2,y-hgt-8,w,hgt+8);}else{g.strokeStyle='#6f7479';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-hgt);g.stroke();}});
  if(st.tv||st.li>=5){const x=W*.975,y=H*.62;g.strokeStyle='#5b6168';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-H*.2);g.stroke();g.fillStyle='#2b2f34';g.fillRect(x-9,y-H*.2-6,11,6);}
  g.save();poly(g,P);g.clip();g.lineCap='round';
  for(let i=0;i<900;i++){const u=r(),v=r(),[x,y]=at(u,v);const lt=r()<.5;g.strokeStyle=frozen?(lt?'rgba(255,255,255,.35)':'rgba(120,140,110,.25)'):(lt?'rgba(210,240,170,.16)':'rgba(20,60,20,.16)');g.lineWidth=1+r()*1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+4+r()*6,y+(r()-.5)*1.2);g.stroke();}
  g.restore();
  at.sp=SP;
  return at;
}

function brushFilter(g,cv,dpr,r,o={}){
  const w=cv.width,h=cv.height,ya=Math.floor((o.y0||0)*h),yb=Math.floor((o.y1||1)*h);let img;try{img=g.getImageData(0,0,w,h).data;}catch(e){return;}
  g.save();g.setTransform(1,0,0,1,0,0);g.lineCap='round';
  const n=Math.round(w*(yb-ya)/((o.dens||20)*dpr)),jit=o.jit??10,L=o.len||1,Wd=o.wid||1,al=o.a||.6;
  for(let i=0;i<n;i++){const x=(r()*w)|0,y=(ya+r()*(yb-ya))|0,o2=(y*w+x)*4,yy=y/h,j=(r()-.5)*jit;
    const ang=yy<.5?(r()-.5)*.3:(r()-.5)*.9,len=(yy<.5?9:6)*L*dpr*(.6+r()*.9);const o=o2;
    g.strokeStyle=`rgba(${Math.max(0,Math.min(255,img[o]+j))|0},${Math.max(0,Math.min(255,img[o+1]+j))|0},${Math.max(0,Math.min(255,img[o+2]+j*.8))|0},${al})`;
    g.lineWidth=(1.4+r()*2)*Wd*dpr;const dx=Math.cos(ang)*len/2,dy=Math.sin(ang)*len/2;
    g.beginPath();g.moveTo(x-dx,y-dy);g.lineTo(x+dx,y+dy);g.stroke();}
  g.restore();
}

function paintDetails(g,W,H,st,r,at){
  const [c1,c2]=COLORS[st.col]||COLORS.red,b=st.b,fanCols=[c1,c2,'#3a4a5a','#7a5a3a','#5a6a3a','#8a3a3a','#e8e0d0'];
  const y0=H*.585,y1=H*.935,P=[at(0,0),at(1,0),at(1,1),at(0,1)];
  // chalk lines, drawn twice for a hand-drawn edge
  for(let pass=0;pass<2;pass++){
    g.strokeStyle=b.pitch>=1?`rgba(255,255,255,${pass?.5:.85})`:`rgba(255,255,255,${pass?.3:.5})`;g.lineWidth=pass?.8:1.4;
    const jx=pass?(r()-.5)*1.2:0;g.save();g.translate(jx,pass?.6:0);
    poly(g,P);g.stroke();g.beginPath();g.moveTo(...at(.5,0));g.lineTo(...at(.5,1));g.stroke();
    const c=at(.5,.5);g.beginPath();g.ellipse(c[0],c[1],W*.075,(y1-y0)*.17,0,0,Math.PI*2);g.stroke();
    [[0,.15],[1,.85]].forEach(([u0,u1])=>{poly(g,[at(u0,.25),at(u1,.25),at(u1,.75),at(u0,.75)]);g.stroke();});g.restore();}
  g.strokeStyle='#fafafa';g.lineWidth=2;[[0,-1],[1,1]].forEach(([u,s])=>{const a=at(u,.42),e=at(u,.58),h=(y1-y0)*.14;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[0],a[1]-h);g.lineTo(e[0],e[1]-h);g.lineTo(e[0],e[1]);g.stroke();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();g.moveTo(a[0],a[1]-h);g.lineTo(a[0]+s*8,a[1]-h+4);g.lineTo(e[0]+s*8,e[1]-h+4);g.lineTo(e[0],e[1]);g.stroke();g.strokeStyle='#fafafa';g.lineWidth=2;});
  // players with shadows
  const sun=todOf(st);
  const plr=(x,y,shirt,shorts)=>{g.fillStyle='rgba(0,0,0,.18)';ell(g,x+(sun==='golden'||sun==='dusk'?3:1),y+.5,3,1);g.fillStyle=shirt;g.fillRect(x-1.6,y-6,3.2,4.5);g.fillStyle=shorts;g.fillRect(x-1.6,y-1.5,3.2,2);g.fillStyle='#e8c9a6';ell(g,x,y-7.4,1.6,1.6);};
  for(let i=0;i<11;i++){const [x,y]=at(.06+r()*.42,.12+r()*.78);plr(x,y,c1,c2);}
  for(let i=0;i<11;i++){const [x,y]=at(.52+r()*.42,.12+r()*.78);plr(x,y,'#d9dde0','#33404a');}
  g.fillStyle='#fff';ell(g,...at(.5,.5),2,2);
  // crowds
  const crowd=st.crowd,SP=at.sp||{},box=SP.stand;let inStand=0;
  if(box){// fans sit on the painted stand: heads scattered over its seating area, more rows filled as the crowd grows
    const cap=[0,60,400,1500,8000,20000][Math.min(5,b.stands)],fill=clamp(crowd/cap,0,1),n=Math.round(Math.min(700,(box.x1-box.x0)*box.h*.028)*fill),rn=srand(13);
    const top=box.y0+box.h*(b.stands>=3?.32:.12),bot=box.y1-box.h*(b.stands>=4?.22:.28);
    for(let i=0;i<n;i++){const y=bot-(bot-top)*Math.pow(rn(),1.3),x=box.x0+(box.x1-box.x0)*(.06+rn()*.88);g.fillStyle=rn()<.45?(rn()<.5?c1:c2):pick(fanCols);ell(g,x,y,1.05,1.15);}
    inStand=Math.round(Math.min(crowd,cap));}
  if(!box&&b.stands>=5){const a=at(-.06,0),e=at(1.06,0),rn=srand(11);for(let i=0;i<Math.min(420,crowd/40);i++){g.fillStyle=rn()<.5?c1:c2;ell(g,a[0]+rn()*(e[0]-a[0]),a[1]-58-rn()*22,1.2,1.2);}}
  if(!box&&b.stands>=4){const rn=srand(7),ty=at(.5,0)[1];for(let i=0;i<Math.min(320,crowd/20);i++){g.fillStyle=rn()<.5?c1:c2;ell(g,W*(.04+rn()*.92),ty-30-rn()*27,1.3,1.3);}}
  if(box){}
  else if(b.stands>=2){inStand=Math.min(1000,Math.round(crowd*.75));for(let i=0;i<inStand/4;i++){const k=Math.floor(r()*5),u=.12+r()*.76,[x,y]=at(u,0);g.fillStyle=pick(fanCols);ell(g,x,y-6-k*4.5,1.5,1.5);}}
  else if(b.stands>=1){inStand=Math.min(150,Math.round(crowd*.55));for(let i=0;i<inStand/3;i++){const k=i%3,u=.31+r()*.38,[x,y]=at(u,0);g.fillStyle=pick(fanCols);ell(g,x+(k?k*3:0),y-8-k*5,1.6,1.6);}}
  const standing=Math.round((crowd-inStand)/(b.stands>=2?5:3));
  for(let i=0;i<Math.min(standing,260);i++){const u=r(),[x,y]=at(u,0);if(b.stands>=2&&u>.11&&u<.89)continue;if(b.stands===1&&u>.29&&u<.71)continue;person(g,x,y,pick(fanCols));}
  if(st.ultras){const a=at(.36,0),e=at(.64,0),y=box?box.y1-box.h*.08:a[1]-2;g.fillStyle=c2;g.fillRect(a[0],y-6,e[0]-a[0],7);g.fillStyle=c1;g.font=`700 ${Math.max(6,W*.014)}px Barlow Condensed, Arial Narrow, sans-serif`;g.textAlign='center';g.fillText(st.ultras.toUpperCase(),(a[0]+e[0])/2,y-.5);}
  if(b.fanbiz>=1){const rx=W*.75,ry=H*.565;for(let i=0;i<5;i++)person(g,rx-W*.06-i*5,ry,pick(fanCols));}
  if(b.training>=1&&b.academy>=1){const tl=W*.18,tr=W*.31,ty=H*.535;for(let i=0;i<7;i++)person(g,tl+8+r()*(tr-tl-16),ty+H*.012+r()*H*.02,'#f2c230',.7);}
  if(st.vp.includes('bus')){g.fillStyle='#e0a400';g.fillRect(W*.03,H*.565,W*.045,H*.02);g.fillStyle='#2b2f34';ell(g,W*.04,H*.587,2,2);ell(g,W*.067,H*.587,2,2);}
  // kafana sign and floodlight heads
  const kx=W*.87,ky=H*.535,kw=W*.13;if(!SP.kafana){g.fillStyle='#f5d68a';g.font=`700 ${Math.max(7,kw*.11)}px Barlow Condensed, Arial Narrow, sans-serif`;g.textAlign='center';g.fillText('KAFANA',kx,ky-kw*.395);}
  if(b.flood>=1&&!SP.flood)[[-.03,-.02],[1.03,-.02],[-.02,1.02],[1.02,1.02]].forEach(([u,v])=>{const [x,y]=at(u,v),hgt=H*(v>.5?.36:.3)*(b.flood>=2?1.35:1);g.fillStyle='#3c4247';g.fillRect(x-7,y-hgt-6,14,7);g.fillStyle='rgba(255,246,200,.95)';g.fillRect(x-6,y-hgt-5,12,4);});
  const front=Math.round(crowd/(b.stands>=2?12:5));for(let i=0;i<Math.min(front,160);i++){const x=r()*W,y=y1+4+r()*(H-y1-6);g.fillStyle=pick(fanCols);ell(g,x,y,2.2,2.2);}
}

function paintLight(g,W,H,st,at,glows,bg){
  const tod=todOf(st),b=st.b;
  g.fillStyle=TINT[tod];g.fillRect(0,0,W,H);
  if(bg&&tod==='night'){g.fillStyle='rgba(6,12,40,.35)';g.fillRect(0,0,W,H*.45);const rs=srand(5);g.fillStyle='rgba(255,250,230,.8)';for(let i=0;i<40;i++)ell(g,rs()*W,rs()*H*.3,.7,.7);g.fillStyle='#f4efd8';ell(g,W*.82,H*.12,H*.035,H*.035);}
  if(bg&&tod==='dusk'){const lg=g.createLinearGradient(0,0,0,H*.5);lg.addColorStop(0,'rgba(60,40,110,.3)');lg.addColorStop(1,'rgba(240,140,90,.18)');g.fillStyle=lg;g.fillRect(0,0,W,H*.5);}
  if(tod==='dusk'||tod==='night'){
    g.save();g.globalCompositeOperation='lighter';
    glows.forEach(([x,y,s])=>{const rg=g.createRadialGradient(x,y,0,x,y,Math.max(3,s*1.6));rg.addColorStop(0,'rgba(255,190,100,.55)');rg.addColorStop(1,'rgba(255,190,100,0)');g.fillStyle=rg;g.fillRect(x-s*2,y-s*2,s*4,s*4);});
    if(b.flood>=1){const c=at(.5,.5),rg=g.createRadialGradient(c[0],c[1],0,c[0],c[1],W*.55);rg.addColorStop(0,`rgba(255,245,210,${(tod==='night'?.38:.18)*(bg?.45:1)})`);rg.addColorStop(1,'rgba(255,245,210,0)');g.fillStyle=rg;g.fillRect(0,H*.3,W,H*.7);
      [[-.03,-.02],[1.03,-.02],[-.02,1.02],[1.02,1.02]].forEach(([u,v])=>{const [x,y]=at(u,v),hgt=H*(v>.5?.36:.3)*(b.flood>=2?1.35:1),hy=y-hgt-3,lg=g.createRadialGradient(x,hy,0,x,hy,26);lg.addColorStop(0,'rgba(255,250,225,.9)');lg.addColorStop(1,'rgba(255,250,225,0)');g.fillStyle=lg;g.fillRect(x-26,hy-26,52,52);});}
    g.restore();
  }
  if(tod==='golden'){const lg=g.createLinearGradient(W,0,0,H);lg.addColorStop(0,'rgba(255,190,110,.18)');lg.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);}
}
function paintTexture(g,W,H){
  if(!NOISE){NOISE=document.createElement('canvas');NOISE.width=NOISE.height=96;const n=NOISE.getContext('2d'),r=srand(99);for(let i=0;i<1400;i++){const v=r()<.5?0:255;n.fillStyle=`rgba(${v},${v},${v},${.015+r()*.025})`;n.fillRect(r()*96,r()*96,1+r()*2,1+r()*2);}}
  try{g.fillStyle=g.createPattern(NOISE,'repeat');g.fillRect(0,0,W,H);}catch(e){}
  const vg=g.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,W*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(20,10,0,.22)');g.fillStyle=vg;g.fillRect(0,0,W,H);
}
function paintAll(g,cv,W,H,dpr,st,bg){
  const r=srand(hash(st.village+st.club+st.region)),glows=[];
  g.lineCap='round';g.lineJoin='round';
  if(bg)paintBackdrop(g,W,H,st,bg.im,bg.hz);
  else{paintLand(g,W,H,st,r);brushFilter(g,cv,dpr,srand(hash(st.village)+7),{dens:12,len:1.9,wid:1.7,jit:8,a:.55});}
  if(st.setup&&bg){paintLight(g,W,H,st,null,[],true);paintTexture(g,W,H);return;}
  const at=paintBuild(g,W,H,st,r,glows,!!bg,bg&&bg.mead);
  brushFilter(g,cv,dpr,srand(hash(st.village)+9),{y0:bg?.5:.3,y1:.6,dens:bg?80:55,len:.6,wid:.7,jit:6,a:.4});
  paintDetails(g,W,H,st,srand(hash(st.club)+3),at);
  paintLight(g,W,H,st,at,glows,!!bg);
  paintTexture(g,W,H);
}
function paintLive(g,W,H,t,st){
  if(st.setup&&SCN.k.endsWith('+bg'))return;
  const [c1,c2]=COLORS[st.col]||COLORS.red,fx=W*.17-10,fy=H*.585,tod=todOf(st);
  g.strokeStyle='#e9e9e9';g.lineWidth=1.6;g.beginPath();g.moveTo(fx,fy);g.lineTo(fx,fy-H*.17);g.stroke();
  const fw=W*.07,fh=H*.055,top=fy-H*.17,wv=k=>Math.sin(t/420+k*3)*fh*.12*k;
  g.beginPath();g.moveTo(fx,top);for(let i=0;i<=10;i++){const k=i/10;g.lineTo(fx+fw*k,top+wv(k));}for(let i=10;i>=0;i--){const k=i/10;g.lineTo(fx+fw*k,top+fh/2+wv(k));}g.closePath();g.fillStyle=c1;g.fill();
  g.beginPath();g.moveTo(fx,top+fh/2);for(let i=0;i<=10;i++){const k=i/10;g.lineTo(fx+fw*k,top+fh/2+wv(k));}for(let i=10;i>=0;i--){const k=i/10;g.lineTo(fx+fw*k,top+fh+wv(k));}g.closePath();g.fillStyle=c2;g.fill();
  if(st.b.fanbiz>=1){const rx=W*.75,ry=H*.535;for(let i=0;i<6;i++){const ph=((t/2600)+i/6)%1;g.fillStyle=`rgba(238,238,232,${.38*(1-ph)})`;ell(g,rx+Math.sin(ph*6+i)*4+ph*12,ry-ph*H*.2,3+ph*10,3+ph*8);}}
  if(st.ultras&&st.um>=75){const x0=W*.5,y0=H*.5;for(let i=0;i<5;i++){const ph=((t/3200)+i/5)%1;g.fillStyle=`rgba(225,60,50,${.28*(1-ph)})`;ell(g,x0+(i-2)*W*.06+ph*8,y0-ph*H*.15,4+ph*12,3+ph*9);}}
  if(tod!=='night'){g.strokeStyle='rgba(40,40,50,.7)';g.lineWidth=1;for(let i=0;i<4;i++){const x=((t/45+i*97)%(W+60))-30,y=H*(.12+.04*i)+Math.sin(t/700+i)*3,w=3+i%2,f=Math.sin(t/120+i)*1.5;g.beginPath();g.moveTo(x-w,y-f);g.lineTo(x,y);g.lineTo(x+w,y-f);g.stroke();}}
  if(st.snow){g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<60;i++){const x=(i*53.7+Math.sin(t/900+i)*14+t/90*(1+i%3)*.3)%W,y=((i*37.3)+t/(18+i%7))%H;ell(g,x,y,1.1,1.1);}}
}
function drawVillage(cv,st,ratio=.58){
  if(!cv||!cv.getContext)return;st=st||(S?sceneState():null);if(!st)return;cancelAnimationFrame(anim);
  const W=Math.max(260,(cv.parentElement&&cv.parentElement.clientWidth)||360),H=Math.round(W*ratio),dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.height=H+'px';
  let bn='bg-'+st.region+'-'+st.season,hz=ART_BG[st.region]&&ART_BG[st.region][st.season],im=hz?artImg(bn):null;
  if(hz&&!im){const RB=ART_BG[st.region];for(const se in RB){const a=artImg('bg-'+st.region+'-'+se);if(a&&!im){bn='bg-'+st.region+'-'+se;hz=RB[se];im=a;}}
    if(!im&&!(IMGS['bg-'+st.region+'-'+st.season]||{}).bad){const g0=cv.getContext('2d');g0.setTransform(dpr,0,0,dpr,0,0);const gr=g0.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#d9dccb');gr.addColorStop(.5,'#c3cda9');gr.addColorStop(1,'#8fa56a');g0.fillStyle=gr;g0.fillRect(0,0,W,H);return;}}
  const bg=im?{im,hz,mead:meadOf(bn,im,hz)}:null;
  const key=JSON.stringify(st)+W+'x'+H+'@'+dpr+(bg?'+bg':'');let base=SCN.k===key?SCN.c:null;
  if(!base){base=document.createElement('canvas');base.width=cv.width;base.height=cv.height;const g=base.getContext('2d');g.scale(dpr,dpr);try{paintAll(g,base,W,H,dpr,st,bg);}catch(e){}SCN={k:key,c:base};}
  const out=cv.getContext('2d'),still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame=t=>{if(!document.body.contains(cv))return;out.setTransform(1,0,0,1,0,0);out.drawImage(base,0,0);out.setTransform(dpr,0,0,dpr,0,0);paintLive(out,W,H,t||0,st);if(!still)anim=requestAnimationFrame(frame);};
  frame(0);
}

