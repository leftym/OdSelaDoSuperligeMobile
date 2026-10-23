/* ---------- press conferences ---------- */
// After big matches a journalist asks two questions. Answers move fans, ugled, morale and relations, and some are promises the press remembers.
const PAPER=()=>phase()>=4?'Sportski žurnal':phase()>=2?'Okružni glas':'Seoski glasnik';
const PRESSQ={
  win:{q:c=>`Danas ${c.sc}. Je li ovaj tim bolji nego što ljudi misle?`,a:[
    ['Možemo da pobedimo bilo koga u ovoj ligi.',{fan:2,morale:1,promise:1},'Hrabro. Novine to štampaju velikim slovima.'],
    ['Jedna utakmica. Ostajemo skromni i radimo dalje.',{ugled:2,fan:1}],
    ['Pitajte me ponovo u maju.',{fan:1,sarm:2}]]},
  loss:{q:c=>`${c.sc}. ${c.streak>=2?`To je ${c.streak}. poraz zaredom.`:'Loš dan.'} Jeste li zabrinuti?`,a:[
    ['Sudija je odlučio ovu utakmicu.',{fan:2,ugled:-2,fine:.35},'Navijači su oduševljeni. Savez nije.'],
    ['Odgovornost je na meni. Ja ću to popraviti.',{ugled:2,morale:1}],
    ['Neki igrači nisu bili dovoljno dobri.',{morale:-1,fan:1,ugled:1}]]},
  draw:{q:c=>`${c.sc}. Pošten rezultat?`,a:[
    ['Trebalo je da pobedimo. Sledeće nedelje hoćemo.',{fan:1,promise:1}],
    ['Bod je bod.',{ugled:1}],
    ['Pitajte golmana, imao je dug dan.',{fan:1,sarm:1}]]},
  derby:{q:c=>`Gazda kluba ${c.rival} vaš klub naziva hobijem. Vaša poruka njemu?`,a:[
    ['Neka ponese veći novčanik.',{rival:-10,fan:3,ultras:5}],
    ['Poštovanje njemu i njegovom klubu.',{rival:8,ugled:2}],
    ['Ništa. Pričamo na terenu.',{morale:1}]]},
  star:{q:c=>`Klubovi se raspituju za igrača ${c.star}. Da li je na prodaju?`,a:[
    ['Ni za kakve pare.',{star:2,fan:2}],
    ['Svako ima svoju cenu.',{star:-1,ugled:1,biz:1}],
    ['Ovde je srećan. To je sve.',{star:1}]]},
  promo:{q:c=>`Vi ste ${c.pos}${ordSuf(c.pos)}. Možete li gore ove sezone?`,a:[
    ['Da. Plasman ili ništa.',{fan:4,morale:1,vow:1},'Sad će svi to pamtiti u maju.'],
    ['Pričaćemo ponovo na proleće.',{ugled:1}],
    ['Tabela ne laže. Dobri smo.',{fan:2,sarm:1}]]},
  danger:{q:c=>`Vi ste ${c.pos}${ordSuf(c.pos)}. Je li ispadanje stvarna opasnost?`,a:[
    ['Nećemo ispasti. Obećavam.',{fan:2,promise:1}],
    ['Rezultati moraju da se poprave, od danas.',{morale:-1,ugled:1}],
    ['To je moj problem, ne vaš.',{ugled:-2,fan:1}]]},
  ultras:{q:c=>`${c.ult} kažu da ste izgubili vezu sa tribinom. Vaš odgovor?`,a:[
    ['Sastaću se sa njima ove nedelje.',{ultras:8,fan:1}],
    ['Ovim klubom upravljam samo ja.',{ultras:-8,ugled:2}],
    ['Oni su srce ovog kluba.',{ultras:4,fan:1}]]},
  village:{q:c=>`Ljudi u selu ${c.village} pitaju šta im klub vraća. Pa?`,a:[
    ['Besplatne karte za decu, od danas.',{goodwill:4,money:-25000}],
    ['Klub je selo. Mi smo isto.',{goodwill:2,sarm:1}],
    ['Pobede. To dajemo.',{fan:2,goodwill:-2}]]}
};
function pressAfter(W,D,L,opp,res){
  if(S.flags.promise){const p=S.flags.promise;delete S.flags.promise;
    if(W){S.fan=clamp(S.fan+3,0,100);addUgled(2);news(`${PAPER()}: „Gazda je obećao, i ispunio.”`);}
    else if(L){S.fan=clamp(S.fan-5,0,100);addUgled(-3);news(`${PAPER()} ponovo štampa tvoje obećanje pored rezultata. Kafana se smeje.`);}}
  const big=Math.abs(res.gf-res.ga)>=3,streak=(S.lstreak=L?(S.lstreak||0)+1:0);
  const due=opp.rival||big||streak>=3||(S.week-(S.lastPress??-9)>=3&&Math.random()<.3);
  if(!due||S.week-(S.lastPress??-9)<2&&!opp.rival)return;
  S.lastPress=S.week;
  const pos=rank().indexOf(0)+1,sc=`${res.gf}–${res.ga}`,c={sc,streak,pos,rival:rivalShort(S),star:bestP(S).name,ult:S.ultras&&S.ultras.name,village:S.club.village};
  const first=opp.rival?'derby':W?'win':L?'loss':'draw',pool=[];
  if(S.week>=4&&S.week<=11&&pos<=2&&S.li<MAXLI&&!S.flags.vow)pool.push('promo');
  if(S.week>=4&&pos>=7&&S.li>=1)pool.push('danger');
  if(S.ultras&&S.ultras.mood<40)pool.push('ultras');
  if(phase()>=2&&(bestP(S)?ovr(bestP(S)):0)>=LEAGUES[S.li].lvl+2)pool.push('star');
  pool.push('village',W?'win':L?'loss':'draw');
  const second=shuffle(pool.filter(k=>k!==first))[0];
  S.mq.push({type:'press',qs:[first,second],i:0,c,log:[],paper:PAPER()});
}
function pressApply(d,m){const out=[],xi=S.squad,c=m.c;
  const sb=d.sarm?Math.round(d.sarm*(S.owner.st.sarm-5)/5):0;
  if(d.fan||sb){const v=(d.fan||0)+sb;S.fan=clamp(S.fan+v,0,100);out.push(`Navijači ${v>=0?'+':''}${v}`);}
  if(d.goodwill){S.goodwill=clamp(S.goodwill+d.goodwill,0,100);out.push(`Selo ${d.goodwill>0?'+':''}${d.goodwill}`);}
  if(d.ugled||d.biz){const v=(d.ugled||0)+(d.biz?Math.round(d.biz*(S.owner.st.biz-5)/5):0);if(v){addUgled(v);out.push(`Ugled ${v>0?'+':''}${v}`);}}
  if(d.morale){xi.forEach(p=>p.morale=clamp(p.morale+d.morale,1,5));out.push(`Moral ekipe ${d.morale>0?'raste':'pada'}`);}
  if(d.star){const p=xi.find(x=>x.name===c.star);if(p){p.morale=clamp(p.morale+d.star,1,5);out.push(`${p.name.split(' ')[0]} ${d.star>0?'je zadovoljan':'je uznemiren'}`);}}
  if(d.rival){S.rel.rival=clamp(S.rel.rival+d.rival,-100,100);out.push(`Rivalski gazda ${d.rival>0?'+':''}${d.rival}`);}
  if(d.ultras&&S.ultras){S.ultras.mood=clamp(S.ultras.mood+d.ultras,0,100);out.push(`${S.ultras.name} ${d.ultras>0?'+':''}${d.ultras}`);}
  if(d.money){const v=Math.round(d.money*(1+S.li));S.money+=v;led('other',v);out.push(fmtS(v));}
  if(d.fine&&Math.random()<d.fine){const v=-50000*(1+S.li);S.money+=v;led('other',v);out.push(`Kazna saveza ${fmt(-v)}`);}
  if(d.promise){S.flags.promise=1;out.push('Obećanje: pobeda na sledećoj utakmici');}
  if(d.vow){S.flags.vow=1;out.push('Obećanje: plasman ove sezone');}
  return out.join(' · ');}
function pressHTML(m){
  const head=`<div class="row" style="gap:12px"><img class="gazda" src="img/pr-journalist.webp" alt="" width="64" height="64" style="width:64px;height:64px"><div class="grow"><span class="eyebrow">Konferencija za medije · ${esc(m.paper)}</span><h2>${m.i<m.qs.length?`${m.i+1}. pitanje od ${m.qs.length}`:'To je sve, hvala.'}</h2></div></div>`;
  const log=m.log.map(x=>`<p class="story"><b>„${esc(x.a)}”</b><br><span class="hint">${esc(x.fx)}${x.note?' · '+esc(x.note):''}</span></p>`).join('');
  if(m.i>=m.qs.length)return `${head}${log}<button class="btn pri" data-a="ok">Napusti salu</button>`;
  const Q=PRESSQ[m.qs[m.i]];
  return `${head}${log}<p class="story">„${esc(Q.q(m.c))}”</p>${Q.a.map(([t,d],i)=>`<button class="choice" data-a="pressans" data-v="${i}"><b>${esc(t)}</b><span class="fx">${pressHint(d)}</span></button>`).join('')}`;}
function pressHint(d){const h=[];if(d.fan||d.sarm)h.push('navijači');if(d.goodwill)h.push(d.goodwill>0?'selo +':'selo −');if(d.ugled)h.push(d.ugled>0?'ugled +':'ugled −');if(d.morale)h.push(d.morale>0?'moral +':'moral −');
  if(d.rival)h.push(d.rival>0?'rivalski gazda +':'rivalski gazda −');if(d.ultras)h.push(d.ultras>0?'tribina +':'tribina −');if(d.star)h.push(d.star>0?'zvezda srećna':'zvezda uznemirena');if(d.money)h.push('košta');if(d.fine)h.push('rizik od kazne');
  if(d.promise||d.vow)h.push('obećanje');if(d.sarm)h.push('Šarm pomaže');return h.join(' · ');}

