/* ---------- depth chart ---------- */
function depthHTML(){const need=FORMS[S.tactics.form],P=['GK','DEF','MID','ATT'];
  const col=P.map(pos=>{const L=S.squad.filter(p=>!p.loanOut).map(p=>({p,v:ovrAt(p,pos)})).filter(x=>x.p.pos===pos||x.v>=ovrAt(x.p,x.p.pos)-1.5).sort((a,b)=>b.v-a.v),ok=L.filter(x=>!x.p.inj),n=need[pos],thin=ok.length<n+1;
    return `<div class="dcol"><div class="row between"><span class="pos ${pos}">${POSL[pos]}</span><span class="lbl ${thin?'no':''}">${ok.length}/${n+1}${thin?' · tanko':''}</span></div>${L.slice(0,n+2).map((x,i)=>`<button class="dp${i>=n?' bench':''}${x.p.inj?' inj':''}" data-a="player" data-v="${x.p.id}"><span>${esc(x.p.name.split(' ').slice(1).join(' ')||x.p.name)}${x.p.pos!==pos?' *':''}</span><b>${Math.round(x.v)}</b>${x.p.inj?`<i>povr.</i>`:(x.p.cond??100)<75?`<i class="w">${x.p.cond}%</i>`:''}</button>`).join('')}</div>`;}).join('');
  return `<section class="card"><div class="row between"><h3>Dubina kadra</h3><span class="lbl">${S.tactics.form}</span></div><div class="dgrid">${col}</div><div class="hint">Prvi u koloni su starteri, ispod su zamene. * igra van svoje pozicije. „Tanko” znači da nema ni jedne zdrave zamene za tu liniju.</div></section>`;}
function weekExtras0(){}

