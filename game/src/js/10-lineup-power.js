/* ---------- lineup & power ---------- */
function pickXI(){
  const f=FORMS[S.tactics.form],avail=S.squad.filter(p=>!p.inj&&!p.rest&&!p.wedding),used=new Set(),xi={GK:[],DEF:[],MID:[],ATT:[]};
  for(const p of avail.filter(p=>p.forced||(p.promise&&p.promise>nowW()))){if(xi[p.pos].length<f[p.pos]){xi[p.pos].push(p);used.add(p.id);}}
  for(const pos of ['GK','DEF','MID','ATT']){for(const p of avail.filter(p=>p.pos===pos).sort((a,b)=>ovr(b)*condF(b)-ovr(a)*condF(a))){if(used.has(p.id)||(p.cond??100)<45)continue;if(xi[pos].length<f[pos]){xi[pos].push(p);used.add(p.id);}}}
  for(const pos of ['GK','DEF','MID','ATT']){while(xi[pos].length<f[pos]){const c=avail.filter(p=>!used.has(p.id)).sort((a,b)=>ovrAt(b,pos)*condF(b)-ovrAt(a,pos)*condF(a))[0];if(!c)break;xi[pos].push(c);used.add(c.id);}}
  return xi;
}
const xiAll=xi=>[...xi.GK,...xi.DEF,...xi.MID,...xi.ATT];
function powersOf(xi){
  const n=k=>xi[k].length,avg=k=>n(k)?xi[k].reduce((s,p)=>s+ovrAt(p,k)*mor(p),0)/n(k):2;
  const gk=avg('GK'),d=avg('DEF'),m=avg('MID'),a=avg('ATT'),all=xiAll(xi),cnt=all.length;
  const k=(cnt/11)*(all.some(p=>p.trait==='kap')?1.02:1)*(typeof capMult==='function'?capMult(all):1)*harmMult()*coachMult()*(S.b.changing>=3?1.06:S.b.changing>=2?1.04:S.b.changing>=1?1.02:1);
  const raw=(xi.GK.reduce((s,p)=>s+ovrAt(p,'GK')*condF(p),0)+xi.DEF.reduce((s,p)=>s+ovrAt(p,'DEF')*condF(p),0)+xi.MID.reduce((s,p)=>s+ovrAt(p,'MID')*condF(p),0)+xi.ATT.reduce((s,p)=>s+ovrAt(p,'ATT')*condF(p),0))/11;
  const rm=roleMods(xi);
  return{atk:(a*(.62+.09*n('ATT'))+m*.06*n('MID'))*k*(1+rm.A),def:(d*(.55+.09*n('DEF'))+m*.05*n('MID'))*k*(1+rm.D),mid:m*(.6+.1*n('MID'))*k*(1+rm.M),gk:gk*k,fit:cnt?all.reduce((s,p)=>s+p.fit,0)/cnt:5,rating:raw,cnt};
}
function applyTac(P,tac,ot,c,home,mine){
  let A=P.atk,D=P.def,Mi=P.mid;const fl={},rps=(mine&&S.coach&&S.coach.style==='taktik'?1.16:1.1)+(mine&&S.analyst?.04:0)+(mine&&has('taktika')?.03:0);
  if(tac.tempo===2){A*=1.06;Mi*=.94;}else if(tac.tempo===0){Mi*=1.06;A*=.96;}
  if(tac.press===2)Mi*=1.08;
  if(tac.width===2){A*=1.04;D*=.97;}else if(tac.width===0){D*=1.04;A*=.97;}
  if(tac.instr===0){D*=1.15;A*=.75;}else if(tac.instr===2){A*=1.2;D*=.8;}
  if(mine&&S.coach&&S.coach.phil==='odbrana')D*=1.03;if(mine&&S.coach&&S.coach.phil==='napad')A*=1.03;
  if(tac.press===2&&ot.tempo===0){Mi*=rps;fl.press=1;}
  if(tac.tempo===2&&ot.press===2){A*=rps;fl.direct=1;}
  if(ot.press===2)A*=.95;
  const rate=tac.press===2?.05:tac.press===1?.02:.005;
  const drain=c>=3?rate*(c-2)*(1.4-P.fit/20):0;
  A*=1-drain;D*=1-drain;Mi*=1-drain;
  if(home){A*=1.05;D*=1.03;Mi*=1.03;if(mine&&LV('dom')){const lb=1+.02*LV('dom');A*=lb;D*=lb;}if(mine&&has('tvrdjava')){A*=1.03;D*=1.03;Mi*=1.03;}if(mine&&S.b.pitch>=1)A*=1.03;if(mine&&S.b.pitch>=3)A*=1.03;if(mine&&S.b.pitch>=4)A*=1.02;if(mine&&S.ultras&&S.ultras.mood>=50){A*=1.03;Mi*=1.02;}}
  return{A,D,Mi,gk:P.gk,drain,fl};
}

