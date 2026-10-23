/* ---------- national team tournaments every two summers ---------- */
function natTourney(){const s=S.season;if(s<2||s%2)return;const wc=s%4===0,T=wc?'Svetsko prvenstvo':'Evropsko prvenstvo',yr=2026+s;
  const lim=Math.max(14.8,LEAGUES[S.li].lvl+.8),mine=S.squad.filter(p=>ovr(p)>=lim&&p.age>=19&&p.age<=34).sort((a,b)=>ovr(b)-ovr(a)).slice(0,4),ex=(S.exP||[]).filter(x=>x.st==='aktivan'&&x.o>=15.8).slice(0,4);
  const q=Math.random()<(wc?.55:.7);if(!q){news(`${T} ${yr}: Srbija se nije kvalifikovala.`);return;}
  const st=['grupna faza','osmina finala','četvrtfinale','polufinale','finale','titula'],r=Math.random(),res=r<.32?0:r<.62?1:r<.84?2:r<.95?3:r<.99?4:5;
  const sc=[...mine.map(p=>p.name),...ex.map(x=>x.n)],gl=sc.length&&Math.random()<.7?pick(sc):null,ng=gl?RI(1,3):0;
  mine.forEach(p=>{p.caps=(p.caps||0)+RI(2,5);p.morale=Math.min(5,p.morale+1);p.cond=Math.max(60,(p.cond??100)-20);if(p.name===gl)p.goals=(p.goals||0);});ex.forEach(x=>{x.caps+=RI(2,5);x.o=Math.round(Math.min(20.5,x.o+.2)*10)/10;});
  if(mine.length){addUgled(3*mine.length);S.fan=clamp(S.fan+2*mine.length,0,100);}
  S.mq.push({type:'nattour',T,yr,res:st[res],mine:mine.map(p=>p.name),ex:ex.map(x=>`${x.n} (${short(x.club)})`),gl,ng});news(`${T} ${yr}: Srbija stiže do ${['grupne faze','osmine finala','četvrtfinala','polufinala','finala','TITULE'][res]}.${mine.length?` Iz kluba: ${mine.map(p=>p.name).join(', ')}.`:''}`);}
function natTourHTML(m){return `<span class="eyebrow">Reprezentacija · leto ${m.yr}</span><div style="font-size:40px">🇷🇸</div><h2>${m.T}</h2><p class="story">Srbija: <b>${m.res}</b>.${m.gl?` Najviše se pamte golovi igrača ${esc(m.gl)} (${m.ng}).`:''}</p>
  ${m.mine.length?`<p class="story"><b>Iz tvog kluba:</b> ${m.mine.map(esc).join(', ')}. Moral raste, ugled kluba takođe, ali dolaze umorni na pripreme.</p>`:'<p class="hint">Ovog puta niko iz tvog kluba nije pozvan. Igrači od oko '+Math.max(15,Math.round(LEAGUES[S.li].lvl+.8))+' ocene ulaze u izbor.</p>'}
  ${m.ex.length?`<p class="story"><b>Tvoji bivši igrači:</b> ${m.ex.map(esc).join(', ')}. Selo gleda utakmice u kafani i ponosno govori „naš je”.</p>`:''}<button class="btn pri" data-a="ok">Nastavi</button>`;}

