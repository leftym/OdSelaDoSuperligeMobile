/* ---------- transfer haggling ---------- */
// The seller has a hidden lowest price and limited patience. Biznis lowers the floor and buys you another round; Šarm helps on wages.
function haggleOpen(l,i){const p=S[l][i];if(!p)return;const biz=S.owner.st.biz+(has('pregovarac')?2:0);
  const floor=clamp(.86-.02*(biz-5)+(l==='stars'?.08:0)+(Math.random()*.12-.05),.62,.98);
  S.modal={type:'haggle',list:l,i,ask:p.fee,orig:p.fee,floor:Math.round(p.fee*floor/1000)*1000,pat:3+(biz>=12?1:0)+(l==='fa'?1:0),log:[],last:0};}
const fmtW=w=>w<10000?thn(w)+' RSD':fmt(w);
function haggleWage(p,l){return l==='stars'?Math.round(wageFor(p)*1.6/500)*500:l==='fa'?p.wage:wageFor(p);}
function haggleOffer(m,x){const p=S[m.list][m.i];if(!p)return;x=Math.round(x/1000)*1000;
  m.log.push({who:'you',t:`Nudiš ${fmt(x)}.`});m.last=x;
  if(x>=m.ask||x>=m.floor){m.deal=x;m.wage=haggleWage(p,m.list);m.log.push({who:'them',t:x>=m.ask?'„Dogovoreno. Daj ruku.”':pick(['„…Dobro. Tvrd si pregovarač.”','„Žena će me ubiti. Dogovoreno.”','„Važi. Ali ćevapi idu na tebe.”'])});return;}
  const insult=x<m.floor*.8;m.pat-=insult?2:1;
  if(m.pat<=0){m.gone=1;S[m.list].splice(m.i,1);m.log.push({who:'them',t:`„Završili smo.” ${p.name} potpisuje na drugom mestu.`});return;}
  m.ask=Math.max(Math.round(m.floor*1.02/1000)*1000,Math.round((m.ask-(m.ask-x)*(insult?.15:.35))/1000)*1000);
  const lastP=m.ask<=Math.round(m.floor*1.02/1000)*1000;
  m.log.push({who:'them',t:lastP&&!insult?`„${fmt(m.ask)}. To mi je poslednja cena. Uzmi ili ostavi.”`:insult?`„Je l' ovo šala?” Spuštaju samo na ${fmt(m.ask)}.`:pick([`„Nije dovoljno. ${fmt(m.ask)}, konačna ponuda.”`,`„Ajde, gazda. ${fmt(m.ask)}.”`,`„Za tebe, ${fmt(m.ask)}. Ni dinar manje.”`])});}
function haggleSign(m,cut){const p=S[m.list][m.i];if(!p)return;let w=m.wage,msg;
  if(cut){const ch=clamp(.35+.05*(S.owner.st.sarm-5),.15,.8);if(Math.random()<ch){w=Math.round(m.wage*.85/100)*100;msg=`Prihvata ${fmtW(w)} nedeljno.`;}else{p.morale=Math.max(1,(p.morale||3)-1);msg=`Potpisuje za ${fmtW(w)} nedeljno, ali se oseća potcenjeno. Moral pada.`;}}
  else msg=`Potpisuje za ${fmtW(w)} nedeljno.`;
  {const N=natOf(p);if(N&&N.r!=='balkan'&&forCnt()>=forLim()){S.modal=null;toast(`Limit za strance je ${forLim()}. Prvo prodaj nekog stranca.`);return;}if(N&&IREG[N.r].ad){p.adapt=IREG[N.r].ad+RI(0,2);p.morale=Math.min(p.morale,2);}}
  S.money-=m.deal;led('transfers',-m.deal);delete p.fee;p.wage=w;S.squad.push(p);S[m.list].splice(m.i,1);
  const saved=m.orig-m.deal;news(`${p.name} potpisuje za ${fmt(m.deal)}${saved>0?`, ${fmt(saved)} ispod tražene cene`:''}.`);
  S.modal={type:'outcome',title:'Transfer',msgs:[`${p.name} prelazi u ${S.club.name} za ${fmt(m.deal)}${saved>0?` (uštedeo si ${fmt(saved)})`:''}.`,msg]};}
function haggleHTML(m){const p=S[m.list][m.i];
  if(!p&&!m.gone){S.modal=null;return '';}
  const name=p?p.name:'',from=p&&p.from?short(p.from):'njegov menadžer';
  const head=`<div class="row" style="gap:12px">${p?faceImg(p,64):''}<div class="grow"><span class="eyebrow">Pregovori · ${esc(from)}</span><h2>${esc(name)}</h2>${p?`<div class="hint">${POSL[p.pos]} · ${p.age} god. · ukupno ${Math.round(ovr(p))} · traže ${fmt(m.orig)}</div>`:''}</div></div>`;
  const log=m.log.map(x=>`<div class="ln"><span class="m">${x.who==='you'?'Ti':'Oni'}</span><span>${esc(x.t)}</span></div>`).join('');
  const box=log?`<div class="feed" style="max-height:30vh">${log}</div>`:'';
  if(m.gone)return `${head}${box}<button class="btn pri" data-a="ok">Zatvori</button>`;
  if(m.deal)return `${head}${box}<div class="lbl">Odšteta dogovorena: ${fmt(m.deal)}. Sad plata.</div>
    <button class="choice" data-a="hwage" data-v="0"><b>Pristani na ${fmtW(m.wage)} nedeljno</b><span class="fx">Potpisuje danas</span></button>
    <button class="choice" data-a="hwage" data-v="1"><b>Ponudi ${fmtW(Math.round(m.wage*.85/100)*100)} nedeljno</b><span class="fx">Provera Šarma · ako odbije, ipak potpisuje, ali nezadovoljan</span></button>`;
  const full=S.squad.length>=maxSquad(),offs=[[.7,'Drska'],[.8,'Čvrsta'],[.9,'Fer']].map(([k,l])=>[Math.round(m.ask*k/1000)*1000,l]).filter(([x])=>x>m.last);
  const mid=m.last?Math.round((m.last+m.ask)/2000)*1000:0;
  const btn=(v,x,t,d)=>`<button class="choice" data-a="hoff" data-v="${v}" ${S.money<x||full?'disabled':''}><b>${t}: ${fmt(x)}</b><span class="fx">${d}</span></button>`;
  return `${head}${box}<div class="row between"><span class="lbl">Traže ${fmt(m.ask)}</span><span class="lbl">Strpljenje ${'●'.repeat(Math.max(0,m.pat))}${'○'.repeat(Math.max(0,4-m.pat))}</span></div>
    ${full?'<p class="no">Ekipa je puna. Prvo otpusti ili prodaj nekoga.</p>':''}
    ${btn('ask',m.ask,'Plati','Potpisuje, bez rizika')}${mid&&mid<m.ask?btn('mid',mid,'Nađimo se na pola','Dobre šanse'):''}${offs.map(([x,l])=>btn(String(x),x,`${l} ponuda`,l==='Drska'?'Može da ih uvredi':'Troši strpljenje ako odbiju')).join('')}
    <button class="btn" data-a="ok">Odustani</button>`;}

