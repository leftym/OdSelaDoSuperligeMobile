/* ---------- key moments: the match stops and you decide ---------- */
function kmPlan(){const a=[RI(0,2),RI(3,5)];if(Math.random()<.35){const x=RI(1,5);if(!a.includes(x))a.push(x);}return a;}
function kmGK(){return M.xi.GK[0]||null;}
function kmOppShooter(){const n=RP[M.oppT.name];return n?rpPick(M.oppT.name):'njihov napadač';}
function kmGen(c){const tn=short(M.oppT.name),xs=xiAll(M.xi).filter(p=>!M.injd[p.id]);if(!xs.length)return null;
  const atk=(M.xi.ATT.length?M.xi.ATT:xs).slice().sort((a,b)=>ovrAt(b,'ATT')-ovrAt(a,'ATT'))[0];
  const r=Math.random(),m=RI(c*15+3,c*15+13);
  if(r<.2){const tk=xs.slice().sort((a,b)=>(b.tec+b.men)-(a.tec+a.men)).slice(0,3);return {k:'pen',m,step:0,opts:tk.map(p=>p.id),t:`${m}'. Penal za nas! Faul u šesnaestercu. Ko puca?`};}
  if(r<.42){const tk=spTaker()||xs[0],hd=[...M.xi.DEF,...M.xi.ATT].sort((a,b)=>(b.att+b.fit)-(a.att+a.fit))[0]||tk;return {k:'fk',m,tk:tk.id,hd:hd.id,t:`${m}'. Slobodan udarac na ivici šesnaesterca. ${tk.name} stoji iznad lopte. Kako izvodimo?`};}
  if(r<.72)return {k:'one',m,pid:atk.id,t:`${m}'. ${atk.name} je izašao sam na golmana! Šta radi?`};
  const sh=kmOppShooter();
  if(r<.87)return {k:'dpen',m,sh,t:`${m}'. Sudija svira penal protiv nas. Na loptu staje ${sh} (${tn}). Na koju stranu se baca ${kmGK()?kmGK().name:'naš golman'}?`};
  return {k:'gk1',m,sh,t:`${m}'. Kontra! ${sh} (${tn}) beži sam ka našem golu. Šta radi ${kmGK()?kmGK().name:'golman'}?`};}
function kmChoices(k){const P=id=>S.squad.find(x=>x.id===id);
  if(k.k==='pen'&&k.step===0)return k.opts.map((id,i)=>{const p=P(id);return [String(id),`${p.name}`,`tehnika ${p.tec} · mentalitet ${p.men}`];});
  if(k.k==='pen'||k.k==='dpen')return [['l','Levo','Najčešći izbor'],['c','Sredina','Rizično, ali golmani se skoro uvek bacaju'],['r','Desno','']];
  if(k.k==='fk')return [['shot',`${P(k.tk).name} šutira direktno`,`tehnika ${P(k.tk).tec}`],['head',`Centaršut na glavu: ${P(k.hd).name}`,'Visoka lopta u gužvu'],['short','Kratko izvođenje','Sigurno, ali retko daje gol']];
  if(k.k==='one'){const p=P(k.pid);return [['shoot','Šutni odmah','Jak udarac, golman nema vremena'],['chip','Prebaci golmana','Lepo kad uspe. Treba tehnika: '+p.tec],['pass','Dodaj saigraču','Sigurnije, ali odbrana se vraća']];}
  return [['out','Izađi mu u susret','Smanjuje ugao, rizik od faula'],['stay','Ostani na liniji','Čekaj njegov potez']];}
function kmGoal(us,txt,scorer){if(us){M.g[0]++;if(scorer){scorer.goals=(scorer.goals||0)+1;scorer.sg=(scorer.sg||0)+1;evOf(scorer).g++;}}else M.g[1]++;
  M.feed.push({m:M.km?M.km.m:'',t:txt,k:us?'goal us':'goal them'});M.flash=M.c;
  if(!M.fast){M.viz.goal={us,t0:typeof performance!=='undefined'?performance.now():0};const tt=txt,mm=M.km?M.km.m:'';clearTimeout(M.celT);M.celT=setTimeout(()=>{if(!M)return;M.cel={us,t:tt,m:mm};renderModal();M.celT=setTimeout(()=>{if(M){M.cel=null;renderModal();}},2400);},700);}}
function kmResolve(k,v){const P=id=>S.squad.find(x=>x.id===id),gk=kmGK(),gkq=gk?ovrAt(gk,'GK'):6,opq=M.oppT.r*PK(),line=t=>M.feed.push({m:k.m,t,k:''});
  const sides=['l','c','r'],dive=()=>Math.random()<.18?'c':Math.random()<.5?'l':'r';
  if(k.k==='pen'){const p=P(k.tk),q=(p.tec+p.men)/2,d=dive(),miss=Math.random()<clamp(.14-(q-10)*.012,.03,.25)*(v==='c'?1.3:1);
    if(miss)line(`${esc(p.name)} šutira ${v==='c'?'po sredini':v==='l'?'levo':'desno'}... preko gola! Tribina se drži za glavu.`);
    else if(d===v&&Math.random()<.7){line(`${esc(p.name)} šutira ${v==='c'?'po sredini':v==='l'?'levo':'desno'}, golman pogađa stranu i brani!`);evOf(p).miss=(evOf(p).miss||0)+1;}
    else kmGoal(true,`GOL iz penala! ${esc(p.name)} ${v==='c'?'hladno po sredini, golman je već na zemlji':'sigurno u ugao'}.`,p);return;}
  if(k.k==='dpen'){const s=dive(),sh=Math.random()<.8?s:pick(sides);if(v===sh&&Math.random()<.55+(gkq-opq)*.02){line(`${esc(gk?gk.name:'Golman')} pogađa stranu i brani penal! ${esc(k.sh)} ne veruje.`);if(gk){gk.morale=Math.min(5,gk.morale+1);evOf(gk).sv=(evOf(gk).sv||0)+2;}}
    else if(Math.random()<.08)line(`${esc(k.sh)} šutira pored gola! Penal promašen.`);else kmGoal(false,`${esc(k.sh)} pogađa iz penala. ${esc(gk?gk.name:'Golman')} ${v==='c'?'je ostao u sredini':`se bacio na ${v==='l'?'levu':'desnu'} stranu`}, lopta je otišla na drugu.`);return;}
  if(k.k==='fk'){const tk=P(k.tk),hd=P(k.hd);
    if(v==='shot'){if(Math.random()<clamp(.1+(tk.tec-10)*.02,.05,.32))kmGoal(true,`GOL iz slobodnjaka! ${esc(tk.name)} preko živog zida, pravo u rašlje.`,tk);else line(`${esc(tk.name)} šutira... ${Math.random()<.5?'u živi zid':'malo preko prečke'}.`);}
    else if(v==='head'){if(Math.random()<clamp(.13+(hd.att+hd.fit-20)*.01,.06,.3))kmGoal(true,`GOL glavom! ${esc(hd.name)} se diže najviše posle centaršuta ${esc(tk.name)}.`,hd);else line(`Centaršut ${esc(tk.name)}, ${esc(hd.name)} glavom, ali golman hvata.`);}
    else{if(Math.random()<.07)kmGoal(true,`Kratko izvođenje, dve-tri dodavanja i GOL! ${esc(tk.name)} završava akciju.`,tk);else line('Kratko izvođenje. Zadržavamo loptu, bez šanse.');}return;}
  if(k.k==='one'){const p=P(k.pid),q=ovrAt(p,'ATT');
    const ch=v==='shoot'?.38+(q-opq)*.025:v==='chip'?.22+(p.tec-10)*.035:.3+(p.men-10)*.015;
    if(Math.random()<clamp(ch,.08,.65)){const mate=v==='pass'?(M.xi.ATT.find(x=>x.id!==p.id)||M.xi.MID[0]||p):p;kmGoal(true,v==='chip'?`GOL! ${esc(p.name)} prebacuje golmana. Kakav potez!`:v==='pass'?`${esc(p.name)} vraća loptu, ${esc(mate.name)} gura u prazan gol!`:`GOL! ${esc(p.name)} jako u bliži ugao.`,mate);}
    else line(v==='chip'?`${esc(p.name)} pokušava da prebaci golmana... lopta pada na krov mreže.`:v==='pass'?`${esc(p.name)} dodaje, ali odbrana se vratila i izbija.`:`${esc(p.name)} šutira, golman brani nogom!`);return;}
  if(k.k==='gk1'){const ch=v==='out'?.35-(gkq-opq)*.02:.45-(gkq-opq)*.02;
    if(v==='out'&&Math.random()<.12){kmGoal(false,`${esc(gk?gk.name:'Golman')} izlazi i ruši ga. Penal, ${esc(k.sh)} pogađa.`);return;}
    if(Math.random()<clamp(ch,.12,.7))kmGoal(false,`${esc(k.sh)} ${v==='out'?'prebacuje golmana koji je izašao':'mirno pored golmana'}. Gol za njih.`);
    else{line(v==='out'?`${esc(gk?gk.name:'Golman')} izlazi i izbija loptu sa nogu ${esc(k.sh)}! Sjajno.`:`${esc(gk?gk.name:'Golman')} čeka do kraja i brani!`);if(gk)evOf(gk).sv=(evOf(gk).sv||0)+1;}return;}}
function kmAuto(c){const k=kmGen(c);if(!k)return;M.km=k;let v;
  if(k.k==='pen'){k.tk=k.opts[0];v=pick(['l','r','l','r','c']);}else if(k.k==='dpen')v=pick(['l','r']);else if(k.k==='fk'){const tk=S.squad.find(x=>x.id===k.tk);v=tk.tec>=13?'shot':'head';}else if(k.k==='one')v='shoot';else v='stay';
  kmResolve(k,v);M.km=null;M.kmDone[c]=1;}
function kmHTML(){const k=M.km;if(!k)return '';const ch=kmChoices(k);
  return `<section class="card km"><span class="eyebrow">Ključni trenutak${k.k==='pen'&&k.step===1?' · gde puca '+esc(S.squad.find(x=>x.id===k.tk).name)+'?':''}</span><p class="story">${esc(k.t)}</p>${ch.map(([v,l,d])=>`<button class="choice" data-a="kmc" data-v="${v}"><b>${esc(l)}</b>${d?`<span class="fx">${esc(d)}</span>`:''}</button>`).join('')}</section>`;}
function spTaker(){const xi=xiAll(M.xi);return xi.find(p=>p.id===S.tactics.sp)||xi.slice().sort((a,b)=>b.tec-a.tec)[0]||null;}

