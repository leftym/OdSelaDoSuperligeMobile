/* ---------- the rival owner ---------- */
// A named owner runs your local rival. Every few weeks he spends: signs players, builds his ground, or taunts you.
// How he acts depends on your relationship: hostile owners spend to beat you, friendly ones mostly build.
const NICK=['Boki','Žile','Cane','Gile','Šone','Pera','Dragi','Rale'];
function rivalO(){const t=rivalTeam(S);if(!t)return null;S.rivals=S.rivals||{};let R=S.rivals[t.name];
  if(!R){const h=hash(t.name);R=S.rivals[t.name]={first:FIRST[h%FIRST.length],nick:NICK[(h>>>3)%NICK.length],last:LAST[(h>>>7)%LAST.length],cash:400000*(1+S.li)*(1+S.li),ground:1+(S.li>=3?1:0),spent:0,log:[]};}
  return R;}
const rivalName=R=>`${R.first} „${R.nick}” ${R.last}`;
const GROUND_N=['livada','drvena klupa','betonska tribina','natkrivena tribina','stadion sa sedištima','veliki stadion'];
function rivalLog(R,t){R.log.unshift({s:S.season,w:S.week+1,t});R.log=R.log.slice(0,6);}
function rivalTick(opp,W,L){const t=rivalTeam(S),R=rivalO();if(!t||!R)return;
  R.cash+=Math.round(LEAGUES[S.li].lvl*9000*(1+S.li));
  const rel=S.rel.rival,cap=LEAGUES[S.li].lvl+2.2,short_=short(t.name),who=`${R.first} ${R.last}`;
  if(opp===t){if(W){S.rel.rival=clamp(rel-3,-100,100);rivalLog(R,`Izgubio derbi od tebe. Besan je.`);}else if(L){rivalLog(R,`Pobedio te u derbiju. Likuje po kafani.`);news(`${who} časti celu kafanu posle derbija. Svi znaju zašto.`);}}
  if(S.week%3!==1)return;
  const hostile=rel<-30,friendly=rel>30,r=Math.random();
  const act=hostile?(r<.45?'buy':r<.75?'build':'taunt'):friendly?(r<.5?'build':r<.85?'none':'gift'):(r<.35?'buy':r<.7?'build':r<.8?'taunt':'none');
  const cost=Math.round(120000*Math.pow(1+S.li,1.35)/10000)*10000;
  if(act==='buy'&&R.cash>=cost&&t.r<cap){R.cash-=cost;R.spent+=cost;t.r+=.18;t.atk*=1.03;t.mid*=1.02;
    const nm=`${pick(FIRST)} ${pick(LAST)}`;rivalLog(R,`Doveo igrača ${nm} za ${fmt(cost)}.`);news(`${short_} dovodi igrača ${nm} za ${fmt(cost)}. ${who}: „Sad ćemo da vidimo ko je gazda u ovom okrugu.”`);}
  else if(act==='build'&&R.cash>=cost*1.5&&R.ground<5){R.cash-=cost*1.5;R.spent+=cost*1.5;R.ground++;t.def*=1.02;rivalLog(R,`Sagradio: ${GROUND_N[R.ground]}.`);news(`${short_} otvara novi objekat: ${GROUND_N[R.ground]}. ${who} lično seče vrpcu.`);}
  else if(act==='taunt'){S.rel.rival=clamp(rel-3,-100,100);if(S.ultras)S.ultras.mood=clamp(S.ultras.mood+2,0,100);const q=pick([`„Taj klub je hobi za čoveka koji ima previše slobodnog vremena.”`,`„Njihov gazda misli da se tradicija kupuje parama.”`,`„Igraćemo kod njih na livadi, a krave donosimo svoje.”`]);rivalLog(R,`Rekao novinama: ${q}`);news(`${who} za novine: ${q}`);}
  else if(act==='gift'){S.goodwill=clamp(S.goodwill+2,0,100);rivalLog(R,'Poslao gajbu rakije za tvoju slavu. Poštovanje.');news(`${who} šalje gajbu rakije sa porukom: „Srećno ove sezone. Osim protiv nas.”`);}
}
function rivalCard(){const t=rivalTeam(S),R=rivalO();if(!t||!R)return '';const rel=S.rel.rival,mood=rel<-30?'Neprijateljski':rel>30?'Prijateljski':'Oprezno';
  return `<section class="card"><div class="row" style="gap:12px"><img class="gazda" src="img/pr-rival.webp" alt="" width="64" height="64" style="width:64px;height:64px"><div class="grow"><span class="lbl">Rivalski gazda · ${esc(short(t.name))}</span><h3>${esc(rivalName(R))}</h3><div class="hint">${mood} · njegov teren: ${GROUND_N[R.ground]} · ocena tima ${t.r.toFixed(1)} · potrošio ${fmt(R.spent)}</div></div><span class="chip ${rel<-30?'bad':rel>30?'club':''}">${rel>0?'+':''}${rel}</span></div>
  ${R.log.length?`<div class="list">${R.log.slice(0,4).map(x=>`<div class="li"><span class="wk lbl">K${x.w}</span><span class="grow">${esc(x.t)}</span></div>`).join('')}</div>`:'<div class="hint">Posmatra te.</div>'}
  <div class="hint">Što su vam odnosi gori, to više troši da te pobedi. Dobiješ derbi, on se još više ljuti.</div></section>`;}

