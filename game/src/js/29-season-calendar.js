/* ---------- season calendar: league, cup and Europe in one view ---------- */
function weekExtras(i){const x=[];
  if(S.cup&&S.cup.alive){const r=CUP_WEEKS.indexOf(i);if(r>=0&&r>=S.cup.round)x.push(['kup',`Kup · ${CUP[r]}`]);}
  const e=S.euro;if(e&&e.stage!=='done'){const n=EURO[e.c].n.replace('Liga ','L. ');
    if(e.stage==='q'&&i>=1&&i<=6){const r=Math.floor((i-1)/2);if(r>=e.r)x.push(['eu',`${n} · ${EQ[r].replace('kolo kvalifikacija','kv.')}`]);}
    if(e.stage==='group'&&[8,10,12].indexOf(i)>=e.md)x.push(['eu',`${n} · grupa`]);
    if((e.stage==='group'||e.stage==='ko')&&i===13)x.push(['eu',`${n} · plej-of`]);}
  return x;}
function calHTML(){const rows=S.sched.map((r,i)=>{const f=r.find(x=>x[0]===0||x[1]===0),home=f[0]===0,o=home?f[1]:f[0],res=S.results[i]&&S.results[i].find(x=>x[0]===0||x[1]===0),X=weekExtras(i),past=i<S.week;
    let sc='',cls='';if(res){const gf=home?res[2]:res[3],ga=home?res[3]:res[2];sc=`${gf}–${ga}`;cls=gf>ga?'good':gf<ga?'no':'';}
    return `<div class="li cal${i===S.week?' now':''}${past?' past':''}"><span class="wk lbl">K${i+1}</span><span class="grow">${home?'vs':'@'} ${esc(short(S.teams[o].name))}${S.teams[o].rival?' <span class="chip club">derbi</span>':''}${X.map(([k,t])=>`<br><span class="xt ${k}">${k==='kup'?'🏆':'⭐'} ${esc(t)}</span>`).join('')}${i===6?'<br><span class="hint">zatim zimska pauza</span>':''}</span>${X.length&&!past?`<span class="chip warn">${X.length+1} meča</span>`:''}<b class="num ${cls}">${sc||(i===S.week?'Sledeća':'')}</b></div>`;}).join('');
  const busy=S.sched.map((_,i)=>i).filter(i=>i>=S.week&&weekExtras(i).length);
  return `<section class="card"><div class="row between"><h3>Kalendar sezone</h3><span class="lbl">${busy.length?`${busy.length} ${plu(busy.length,'dupla nedelja','duple nedelje','duplih nedelja')}`:'bez duplih nedelja'}</span></div>${busy.length?`<div class="hint">U duplim nedeljama igraš dva meča. Odmori umorne igrače pre njih ili rotiraj sastav, naročito kod visokog presa.</div>`:''}${euroLate()?`<div class="hint"><b>Posle prvenstva:</b> evropsko proleće, ${KO2[S.euro.r2].toLowerCase()}.</div>`:''}<div class="list">${rows}</div></section>`;}
