/* ---------- boot ---------- */
// Android back button (the app calls this): match stays open, a pop-up closes with its neutral button,
// other tabs go back to the home tab. Returns false when there is nothing left to close, so the app goes to the background.
window.odselaBack=function(){try{
  if(typeof M!=='undefined'&&M)return true;
  const ls=document.querySelector('[data-a=lclose]');if(ls){ls.click();return true;}
  if(S&&S.modal){const b=document.querySelector('#modal [data-a=ok]:not([disabled]),#modal [data-a=subclose]');if(b)b.click();return true;}
  if(S&&S.tab&&S.tab!=='home'){const t=document.querySelector('[data-a=tab][data-v=home]');if(t){t.click();return true;}}
}catch(e){}return false;};
function start(data){
  let raw=null;try{raw=localStorage.getItem(KEY);}catch(e){}
  let hung=false;try{hung=localStorage.getItem('odsela-boot')==='1'&&!!raw;localStorage.setItem('odsela-boot','1');}catch(e){}
  setTimeout(()=>{try{localStorage.removeItem('odsela-boot');}catch(e){}},1500);
  if(hung&&!(data&&data.S)){errLog('hang',new Error('prethodno učitavanje se zaglavilo'));try{localStorage.setItem(KEY+'-backup',raw);const o=JSON.parse(raw);cleanRaw(o);S=migrate(o);repairState();render();renderModal();toast('Igra se zaglavila pri učitavanju. Otvorena je u sigurnom režimu.');return;}catch(e){errLog('safe',e);}}
  if(raw&&!(data&&data.S)){try{JSON.parse(raw);}catch(e){try{localStorage.setItem(KEY+'-backup',raw);}catch(x){}errLog('start',e);rescueScreen(raw);return;}}
  try{
    S=migrate((data&&data.S)||load());
    if(S){if(S.modal&&S.modal.type==='match')S.modal=S.euro&&S.euro.pending?{type:'euro'}:S.cup&&S.cup.opp?{type:'cup'}:null;nextModal();}
    render();renderModal();
  }catch(e1){
    errLog('start',e1);try{if(raw)localStorage.setItem(KEY+'-backup',raw);}catch(x){}
    try{if(!S&&raw){const o=JSON.parse(raw);cleanRaw(o);S=migrate(o);}repairState();render();renderModal();toast('Sačuvana igra je imala grešku i popravljena je.');return;}catch(e2){errLog('repair',e2);}
    try{S.tab='home';S.modal=null;render();toast('Igra je otvorena na početnom ekranu.');return;}catch(e3){errLog('repair2',e3);}
    rescueScreen(raw);
  }
}
function errLog(a,err){try{const m=meta();m.errs=m.errs||[];m.errs.unshift({t:new Date().toISOString().slice(0,16),a,msg:String(err&&err.message||err).slice(0,160),at:String(err&&err.stack||'').split('\n').slice(1,4).join(' ').replace(/https?:[^ )]*\//g,'').slice(0,260),st:S?{s:S.season,w:S.week,li:S.li,m:S.modal&&S.modal.type,e:S.euro?[S.euro.stage,S.euro.r2,S.euro.leg,S.euro.pending,!!S.euro.opp]:null}:null});m.errs=m.errs.slice(0,6);saveMeta();}catch(x){}}
// Clear everything that is "in progress" and fix half-finished competitions, keeping the career itself.
function cleanRaw(o){if(!o||typeof o!=='object')throw new Error('bad save');['squad','fa','intl','loanMkt','stars','queue','loans','mq','pending'].forEach(k=>{if(Array.isArray(o[k]))o[k]=o[k].filter(x=>x&&typeof x==='object'&&(k==='mq'||k==='pending'||x.name));else if(o[k]!=null&&k!=='squad')o[k]=[];});o.modal=null;o.mq=[];o.hold=0;}
function repairState(){if(!S)throw new Error('no save');M=null;S.modal=null;S.mq=[];S.hold=0;S.pending=[];S.tab='home';S.sellNego=null;
  ['squad','fa','report','stars','intl','loanMkt','news','hist','trophies','legends','sponsors','queue','loans'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[];S[k]=S[k].filter(Boolean);});
  const e=S.euro;if(e){if(!EURO[e.c])S.euro=null;else{if(!e.opp||!e.opp.name){e.pending=false;if(e.stage!=='group')e.stage='done';}if(e.stage==='ko2'&&!(e.r2>=0&&e.r2<=3))e.stage='done';if(e.stage==='group'&&!Array.isArray(e.group))e.stage='done';e.agg=e.agg||[0,0];}}
  if(S.cup&&S.cup.opp&&!S.cup.opp.name)S.cup.opp=null;if(S.week>14)S.week=14;if(S.week<0)S.week=0;
  if(!Array.isArray(S.results))S.results=[];if(!S.table||S.table.length!==S.teams.length)S.table=S.teams.map(()=>({p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));save();}
function rescueScreen(raw){S=null;const app=$('#app');$('#nav').hidden=true;$('#modal').innerHTML='';
  app.innerHTML=`<div class="wrap"><section class="card"><span class="eyebrow">Spasavanje igre</span><h2>Sačuvana igra ne može da se otvori</h2><p class="story">Tvoja karijera nije obrisana. Sačuvana je i kao rezervna kopija. Kopiraj kod ispod i pošalji ga, da se greška popravi i karijera vrati.</p>
  <textarea readonly rows="6" style="width:100%;font-size:11px" onclick="this.select()">${esc(raw?btoa(unescape(encodeURIComponent(raw))):'')}</textarea>
  <div class="hint">${esc(JSON.stringify((meta().errs||[]).slice(0,2)))}</div>
  <div class="row" style="flex-wrap:wrap"><button class="btn pri" onclick="location.reload()">Pokušaj ponovo</button><button class="btn" onclick="try{localStorage.removeItem('${KEY}')}catch(e){};location.reload()">Nova karijera (rezerva ostaje)</button></div></section></div>`;}
if(window.claude&&window.claude.hot&&window.claude.hot.snapshot)window.claude.hot.snapshot(()=>({S}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
