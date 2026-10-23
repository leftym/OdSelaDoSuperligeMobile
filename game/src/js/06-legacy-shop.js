/* ---------- legacy shop: points earned when you retire, spent before the next career ---------- */
const LPERKS=[
 {id:'cash',g:'Novac',n:'Porodična ušteđevina',d:'+15% početnog novca',max:5,c:8},
 {id:'spon',g:'Novac',n:'Stari poslovni drugovi',d:'+8% od svih sponzora',max:3,c:10},
 {id:'grad',g:'Novac',n:'Majstori iz komšiluka',d:'Gradnja 5% jeftinija',max:4,c:10},
 {id:'plate',g:'Novac',n:'Skromna svlačionica',d:'Plate igrača 4% niže',max:3,c:12},
 {id:'fans',g:'Ljudi',n:'Ime koje se pamti',d:'+5 navijača i +5 naklonosti sela na početku',max:3,c:6},
 {id:'mica',g:'Ljudi',n:'Čika Mića od prvog dana',d:'Trener je s tobom već u seoskoj ligi',max:1,c:15},
 {id:'kum',g:'Ljudi',n:'Kum u opštini',d:'Dozvole za gradnju stižu nedelju dana brže',max:2,c:12},
 {id:'gen',g:'Teren',n:'Zlatna generacija',d:'Početna ekipa je jača',max:3,c:12},
 {id:'tal',g:'Teren',n:'Oko za talente',d:'Deca iz akademije imaju +1 potencijal',max:3,c:10},
 {id:'tren',g:'Teren',n:'Stari metod',d:'Igrači napreduju 5% brže',max:3,c:12},
 {id:'dom',g:'Teren',n:'Tvrđava na livadi',d:'Domaći teren 2% jači',max:2,c:14},
 {id:'stat',g:'Gazda',n:'Iskusan gazda',d:'+1 poen osobina na početku',max:3,c:10},
 {id:'ugl',g:'Gazda',n:'Poznato ime',d:'+25 Ugleda na početku',max:3,c:8},
 {id:'ulaz',g:'Novac',n:'Pun stadion',d:'+5% publike na domaćim utakmicama',max:3,c:10},
 {id:'prod',g:'Novac',n:'Tvrd pregovarač',d:'+5% na svaku prodaju igrača',max:3,c:10},
 {id:'kup',g:'Novac',n:'Kup groznica',d:'+20% nagrade u Kupu Srbije',max:2,c:8},
 {id:'ultr',g:'Ljudi',n:'Verna tribina',d:'Navijačka grupa kreće raspoloženija (+8)',max:2,c:8},
 {id:'mir',g:'Ljudi',n:'Komšijski mir',d:'Rivalski gazda kreće manje neprijateljski (+15)',max:2,c:6},
 {id:'trn',g:'Ljudi',n:'Mreža trenera',d:'Treneri na tržištu imaju veće šanse za +1 zvezdicu',max:2,c:14},
 {id:'fizio',g:'Teren',n:'Narodni lekar',d:'10% manje povreda',max:3,c:10},
 {id:'deca',g:'Teren',n:'Pun školski autobus',d:'+1 dete na danu akademije',max:2,c:12},
 {id:'moral',g:'Teren',n:'Pobednički duh',d:'Igrači kreću sa višim moralom',max:1,c:8},
 {id:'b_pitch',g:'Objekti',n:'Pokošena livada',d:'Počinješ sa pokošenim terenom',max:1,c:6},
 {id:'b_fan',g:'Objekti',n:'Roštilj od prvog dana',d:'Počinješ sa roštilj štandom',max:1,c:6},
 {id:'b_med',g:'Objekti',n:'Kutija prve pomoći',d:'Počinješ sa prvom pomoći',max:1,c:5},
 {id:'b_tr',g:'Objekti',n:'Pomoćni teren',d:'Počinješ sa pomoćnim terenom za trening',max:1,c:14},
 {id:'biz',g:'Gazda',n:'Poslovni nos',d:'+1 Biznis',max:2,c:12},
 {id:'sarm',g:'Gazda',n:'Kafanski šarm',d:'+1 Šarm',max:2,c:12},
 {id:'lpx',g:'Nasleđe',n:'Ime u novinama',d:'+10% poena nasleđa posle svake karijere',max:3,c:15},
 {id:'x_tajkun',g:'Otključavanja',n:'Tajkun',d:'Novi gazda: ogroman kapital, ali selo i navijači ga ne vole',max:1,c:40},
 {id:'x_omladina',g:'Otključavanja',n:'Omladinski projekat',d:'Novi početak: Prva liga sa ekipom od 17 do 20 godina punom talenta',max:1,c:30},
 {id:'x_legenda',g:'Otključavanja',n:'Težina Legenda',d:'Teže od teškog. Poeni nasleđa ×1,6',max:1,c:35},
 {id:'boje',g:'Nasleđe',n:'Nove klupske boje',d:'Otključava ljubičasto-belu i narandžasto-crnu',max:1,c:5}];
const LP_RANK=[[0,'Seoski gazda'],[60,'Opštinski moćnik'],[160,'Okružni bos'],[350,'Gazda Srbije'],[650,'Legenda srpskog fudbala'],[1100,'Besmrtni gazda']];
function lgM(){const m=meta();m.leg=m.leg||{pts:0,life:0,spent:{},careers:0,hist:[]};m.leg.spent=m.leg.spent||{};m.leg.hist=m.leg.hist||[];return m.leg;}
const LV=id=>(S&&S.lp&&S.lp[id])||0;
const lpCost=(k,lv)=>k.c*(lv+1);
function lpRank(life){let r=LP_RANK[0][1];for(const [t,n] of LP_RANK)if(life>=t)r=n;return r;}
function lpNext(life){const n=LP_RANK.find(([t])=>t>life);return n?`${n[0]-life} do ranga ${n[1]}`:'Najviši rang';}
function lpSnap(){const st=S.stats||{};return {season:S.season,titles:st.titles||0,cups:st.cups||0,abroad:st.abroad||0,kids:st.kids||0,euroBest:st.euroBest||0,vp:(S.vp||[]).length,leg:(S.legends||[]).length,maxLi:Math.max(S.maxLi||0,S.li)};}
function lpCalc(){const L=[],add=(n,v)=>{v=Math.round(v);if(v>0)L.push([n,v]);},B=S.lpBase||{season:0,titles:0,cups:0,abroad:0,kids:0,euroBest:0,vp:0,leg:0,maxLi:S.startLi||0},N=lpSnap(),d=k=>Math.max(0,N[k]-B[k]),st={titles:d('titles'),cups:d('cups'),abroad:d('abroad'),kids:d('kids'),euroBest:d('euroBest')};
  const yrs=S.season-B.season;if(S.weekly||S.scen||(yrs<2&&N.maxLi===B.maxLi))return {L:[],tot:0,mult:1};
  add(`${yrs} ${plu(yrs,'sezona','sezone','sezona')} u klubu`,Math.min(40,yrs*2));
  add('Usponi kroz rangove',d('maxLi')*12);
  add(`Titule prvaka (${st.titles||0})`,(st.titles||0)*25);
  add(`Kup Srbije (${st.cups||0})`,(st.cups||0)*15);
  add('Evropski put',(st.euroBest||0)*10);
  add(`Prodati u inostranstvo (${st.abroad||0})`,Math.min(30,(st.abroad||0)*3));
  add(`Deca iz akademije (${st.kids||0})`,Math.min(30,(st.kids||0)*2));
  add(`Seoski projekti (${d('vp')})`,d('vp')*5);
  add(`Legende kluba (${d('leg')})`,d('leg')*4);
  const base=L.reduce((a,x)=>a+x[1],0),mult=({easy:.75,normal:1,hard:1.3,legend:1.6}[S.diff]||1)*(S.chall&&S.chall!=='none'?1.2:1)*(1+.1*LV('lpx'));
  return {L,base,mult,tot:Math.round(base*mult)};}
function lpAward(){if(S.flags.lpDone)return S.lpAward;const r=lpCalc(),g=lgM();S.flags.lpDone=1;S.lpAward=r;
  if(r.tot>0){g.pts+=r.tot;g.life+=r.tot;g.careers++;g.hist.unshift({club:S.club.name,village:S.club.village,seasons:S.season,best:LEAGUES[Math.max(S.maxLi||0,S.li)].name,lp:r.tot});g.hist=g.hist.slice(0,8);saveMeta();}
  return r;}
function lpEpiHTML(){const r=S.lpAward||lpCalc(),g=lgM();
  if(!r.tot)return `<section class="card"><h3>Nasleđe gazde</h3><div class="hint">Za poene nasleđa treba odigrati bar dve sezone.</div></section>`;
  return `<section class="card"><div class="row between"><h3>Poeni nasleđa</h3><span class="chip club">+${r.tot}</span></div><div class="list">${r.L.map(([n,v])=>`<div class="li"><span class="grow">${esc(n)}</span><b class="num">+${v}</b></div>`).join('')}${r.mult!==1?`<div class="li"><span class="grow">Težina, izazov i veštine</span><b class="num">×${r.mult.toFixed(2).replace('.',',')}</b></div>`:''}</div>
   <div class="hint">Ukupno za trošenje: <b>${g.pts}</b> · ${esc(lpRank(g.life))} · ${esc(lpNext(g.life))}. Poene trošiš u prodavnici nasleđa pre nove karijere.</div></section>`;}
function lpShopHTML(){const g=lgM(),grp=['Novac','Ljudi','Teren','Objekti','Gazda','Nasleđe','Otključavanja'],spentTot=LPERKS.reduce((a,k)=>{let s=0;for(let i=0;i<(g.spent[k.id]||0);i++)s+=lpCost(k,i);return a+s;},0);
  return `<section class="card lshop"><div class="row between"><div><span class="lbl">Nasleđe gazde · ${esc(lpRank(g.life))}</span><h2>Prodavnica nasleđa</h2></div><span class="chip club">${g.pts} ${plu(g.pts,'poen','poena','poena')}</span></div>
  <div class="hint">Ukupno zarađeno ${g.life} · ${g.careers} ${plu(g.careers,'karijera','karijere','karijera')} · ${esc(lpNext(g.life))}. Veštine važe za svaku novu karijeru, osim nedeljnog izazova.</div>
  ${grp.map(G=>`<span class="lbl">${G}</span><div class="list">${LPERKS.filter(k=>k.g===G).map(k=>{const lv=g.spent[k.id]||0,mx=lv>=k.max,c=lpCost(k,lv);
    return `<div class="li"><span class="grow"><b>${esc(k.n)}</b> <span class="lvdots">${'●'.repeat(lv)}${'○'.repeat(k.max-lv)}</span><br><span class="hint">${esc(k.d)}${k.max>1?' (po nivou)':''}</span></span>${mx?'<span class="chip good">Maks.</span>':`<button class="btn sm${g.pts>=c?' pri':''}" data-a="lbuy" data-v="${k.id}" ${g.pts<c?'disabled':''}>${c}</button>`}</div>`;}).join('')}</div>`).join('')}
  ${g.hist.length?`<span class="lbl">Prošle karijere</span><div class="list">${g.hist.map(h=>`<div class="li"><span class="grow"><b>${esc(h.club)}</b> · ${esc(h.village)}<br><span class="hint">${h.seasons} ${plu(h.seasons,'sezona','sezone','sezona')} · ${esc(h.best)}</span></span><b class="num">+${h.lp}</b></div>`).join('')}</div>`:''}
  <div class="row" style="flex-wrap:wrap">${spentTot?`<button class="btn" data-a="lref">${SET.lref?`Potvrdi: vrati ${Math.floor(spentTot*.8)} poena`:'Vrati sve veštine (80%)'}</button>`:''}<button class="btn pri" data-a="lclose">Gotovo</button></div></section>`;}
function lpSetupCard(){const g=lgM();if(SET.shop)return lpShopHTML();const act=Object.keys(g.spent).filter(k=>g.spent[k]).length;
  return `<section class="card"><div class="row between"><div><span class="lbl">Nasleđe gazde</span><h3>${esc(lpRank(g.life))}</h3></div><button class="btn sm${g.pts?' pri':''}" data-a="lshop">${g.pts?`${g.pts} ${plu(g.pts,'poen','poena','poena')} · Prodavnica`:'Prodavnica'}</button></div><div class="hint">${g.careers?`${act} ${plu(act,'veština','veštine','veština')} iz prošlih karijera prelazi u novu.`:'Kad odeš u penziju (ekran Klub), dobijaš poene nasleđa za sledeću karijeru: za sezone, uspone, titule, kupove, Evropu i selo.'}</div></section>`;}

