/* ---------- personalities and the dressing room ---------- */
const PERS=[
  {k:'vodja',n:'Vođa',w:.5,d:'Vođa. Podiže momke posle poraza i drži svlačionicu na okupu.'},
  {k:'prof',n:'Profesionalac',w:2,d:'Profesionalac. Trenira naporno i brže napreduje.'},
  {k:'bunt',n:'Bundžija',w:1,d:'Problematičan. Talentovan, ali nevolje ga prate.'},
  {k:'sala',n:'Šaljivdžija',w:1,d:'Šaljivdžija. Svlačionica se uz njega smeje.'},
  {k:'amb',n:'Ambiciozan',w:1.5,d:'Ambiciozan. Brzo raste kad igra, a duri se na klupi.'},
  {k:'tih',n:'Tihi',w:3,d:'Tih. Radi svoj posao.'}];
function persOf(p){if(!p.pers){const tot=PERS.reduce((a,x)=>a+x.w,0);let r=(hash(p.name+'|'+p.id)%1000)/1000*tot;p.pers=(PERS.find(x=>(r-=x.w)<0)||PERS[5]).k;}return PERS.find(x=>x.k===p.pers)||PERS[5];}
const isLocal=p=>!p.from;
function cliques(s){const sq=s.squad,loc=sq.filter(isLocal),sig=sq.filter(p=>!isLocal(p)),vet=sq.filter(p=>p.age>=30),kid=sq.filter(p=>p.age<=21);return{loc,sig,vet,kid};}
const harmony=()=>S.harmony??60;
function persGrow(p,starters){const k=persOf(p).k;return k==='prof'?.03:k==='amb'&&starters.has(p.id)?.035:0;}
function dressingRoom(starters,W,L){
  let h=harmony();h+=(60-h)*.08;const sq=S.squad,c=cliques(S);
  sq.forEach(p=>{const k=persOf(p).k;
    if(k==='sala')h+=1;
    if(k==='vodja'){h+=.8;if(L){h+=1.5;const t=pick(sq);t.morale=Math.min(5,t.morale+1);}}
    if(k==='bunt'){h-=1.2;if(Math.random()<.06){h-=4;sq.filter(x=>x!==p&&Math.random()<.25).forEach(x=>x.morale=Math.max(1,x.morale-1));news(`${p.name} ${pick(['se posvađao sa saigračem','je opet zakasnio na trening','se svađao sa trenerom pred svima'])}. U svlačionici je napeto.`);}}
    if(k==='amb'){if(!starters.has(p.id)&&!p.inj&&Math.random()<.25)p.morale=Math.max(1,p.morale-1);if(starters.has(p.id)&&W&&Math.random()<.2)p.morale=Math.min(5,p.morale+1);}});
  const sigXI=[...starters].filter(id=>{const p=sq.find(x=>x.id===id);return p&&!isLocal(p);}).length;
  if(c.loc.length>=5&&sigXI>=6)h-=1.5;
  if(c.vet.filter(p=>!starters.has(p.id)&&!p.inj).length>=3)h-=1;
  h+=W?1.5:L?-1.5:0;
  {const cp=capOf();if(cp){if(cp.morale<=2)h-=1;else if(cp.morale>=4)h+=.5;}}
  S.harmony=clamp(Math.round(h*10)/10,0,100);
  if(S.harmony>=72)sq.forEach(p=>{if(Math.random()<.08)p.morale=Math.min(5,p.morale+1);});
  if(S.harmony<35)sq.forEach(p=>{if(Math.random()<.1)p.morale=Math.max(1,p.morale-1);});
  if(obg()==='igrac')sq.forEach(p=>p.morale=Math.max(2,p.morale));
  if(obg()==='sin')S.goodwill=Math.max(35,S.goodwill);
  if(obg()==='tajkun'&&S.week%4===0)S.goodwill=clamp(S.goodwill-2,0,100);
}
const harmMult=()=>1+(harmony()-60)/900;

