/* ---------- sound: everything synthesized with Web Audio, no files ---------- */
const SFX={ctx:null,master:null,noise:null,crowd:null,drum:0,last:null,
  on(){return meta().sound!==false;},
  init(){
    if(this.ctx||!this.on()||typeof window==='undefined')return this.ctx;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{const c=new AC();this.ctx=c;this.master=c.createGain();this.master.gain.value=.85;
      const comp=c.createDynamicsCompressor();this.master.connect(comp);comp.connect(c.destination);
      const len=c.sampleRate*2,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let br=0;
      for(let i=0;i<len;i++){const w=Math.random()*2-1;br=(br+.02*w)/1.02;d[i]=w*.45+br*3;}
      this.noise=b;}catch(e){this.ctx=null;}
    return this.ctx;},
  live(){const c=this.ctx;return c&&this.on()&&c.state==='running'?c:null;},
  resume(){const c=this.init();if(c&&c.state==='suspended')c.resume().catch(()=>{});return this.on()?c:null;},
  src(){const s=this.ctx.createBufferSource();s.buffer=this.noise;s.loop=true;s.loopStart=Math.random();s.playbackRate.value=.9+Math.random()*.2;return s;},
  // a swell of crowd noise: roar, "oooh", groan
  burst(at,o){const c=this.ctx;if(!c||!this.on())return;const t=c.currentTime+at,s=this.src(),f=c.createBiquadFilter(),g=c.createGain(),end=t+o.att+o.hold+o.rel;
    f.type=o.type||'bandpass';f.Q.value=o.q||.8;f.frequency.setValueAtTime(o.f0,t);f.frequency.linearRampToValueAtTime(o.f1,t+o.att+o.hold);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.peak,t+o.att);g.gain.setValueAtTime(o.peak,t+o.att+o.hold);g.gain.exponentialRampToValueAtTime(.0001,end);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(end+.05);},
  roar(at,lv){this.burst(at,{peak:.16+.34*lv,att:.22,hold:1.2,rel:2.6,f0:420,f1:950,q:.5});this.burst(at+.08,{peak:.05+.1*lv,att:.3,hold:.9,rel:2,f0:1500,f1:2300,q:1.3});},
  ooh(at,lv){this.burst(at,{peak:.05+.13*lv,att:.35,hold:.12,rel:.9,f0:380,f1:640,q:1.6});},
  groan(at,lv){this.burst(at,{peak:.05+.11*lv,att:.12,hold:.3,rel:1.5,f0:700,f1:240,q:1.1,type:'lowpass'});},
  // the referee's pea whistle: a trilled tone, one blast per entry (seconds)
  whistle(at,pat){const c=this.live();if(!c)return;let t=c.currentTime+at;
    pat.forEach(d=>{const o=c.createOscillator(),v=c.createOscillator(),vg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain();
      o.type='triangle';o.frequency.value=2780;v.frequency.value=33;vg.gain.value=110;v.connect(vg);vg.connect(o.frequency);
      f.type='bandpass';f.frequency.value=2800;f.Q.value=2.5;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.02);g.gain.setValueAtTime(.2,t+d-.05);g.gain.linearRampToValueAtTime(0,t+d);
      o.connect(f);f.connect(g);g.connect(this.master);o.start(t);v.start(t);o.stop(t+d+.02);v.stop(t+d+.02);t+=d+.15;});},
  boom(t,acc){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(acc?115:98,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);
    g.gain.setValueAtTime(acc?.55:.34,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.36);},
  // the match crowd: a murmur that grows with the attendance (lv 0..1)
  crowdStart(lv){const c=this.resume();if(!c||this.crowd)return;
    const s=this.src(),bp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),base=.025+.12*lv;
    bp.type='bandpass';bp.frequency.value=480+lv*120;bp.Q.value=.6;lp.type='lowpass';lp.frequency.value=1500;
    g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(base,c.currentTime+1.5);lfo.frequency.value=.21;lg.gain.value=base*.3;lfo.connect(lg);lg.connect(g.gain);
    s.connect(bp);bp.connect(lp);lp.connect(g);g.connect(this.master);s.start();lfo.start();this.crowd={s,g,lfo,base,lv};},
  crowdLevel(k){const c=this.ctx,w=this.crowd;if(!c||!w)return;const t=c.currentTime;w.g.gain.cancelScheduledValues(t);w.g.gain.setValueAtTime(w.g.gain.value,t);w.g.gain.linearRampToValueAtTime(w.base*k,t+1);},
  crowdStop(){const c=this.ctx,w=this.crowd;if(this.drum)clearInterval(this.drum);this.drum=0;if(!w)return;this.crowd=null;const t=c.currentTime;
    w.g.gain.cancelScheduledValues(t);w.g.gain.setValueAtTime(w.g.gain.value,t);w.g.gain.linearRampToValueAtTime(0,t+1.4);w.s.stop(t+1.5);w.lfo.stop(t+1.5);},
  // ultras drums on the terrace
  drumsStart(){if(!this.ctx||this.drum)return;const pat=[1,0,1,0,1,1,1,0];let i=0;
    this.drum=setInterval(()=>{if(!this.ctx||!this.crowd||!this.on()){clearInterval(this.drum);this.drum=0;return;}if(pat[i%8])this.boom(this.ctx.currentTime+.04,i%8===0);i++;},250);},
  // a Balkan brass flourish: two trumpets a third apart, with a tapan drum
  horn(t,f,d,v){const c=this.ctx;[1,1.005].forEach(dt=>{const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=f*dt;
    lp.type='lowpass';lp.frequency.setValueAtTime(800,t);lp.frequency.linearRampToValueAtTime(2700,t+.05);lp.frequency.linearRampToValueAtTime(1500,t+d);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.setValueAtTime(v*.85,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);
    o.connect(lp);lp.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.02);});},
  fanfare(big){const c=this.live();if(!c)return;const N=n=>440*Math.pow(2,(n-69)/12),t0=c.currentTime+.08;
    const mel=big?[[62,.12],[64,.12],[65,.12],[68,.12],[69,.36],[68,.12],[69,.12],[71,.12],[72,.24],[74,.7]]:[[69,.14],[68,.14],[69,.14],[74,.55]];
    let t=t0;mel.forEach(([n,d])=>{this.horn(t,N(n),d*.92,.075);this.horn(t,N(n-3),d*.92,.045);t+=d;});
    for(let i=0;i<(big?8:4);i++)this.boom(t0+i*(big?.3:.24),i%2===0);},
  chime(){const c=this.live();if(!c)return;[[1318.5,0],[1760,.09]].forEach(([f,d])=>{const t=c.currentTime+d,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.08,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+1);});},
  toggle(){const m=meta();m.sound=!this.on();saveMeta();
    const c=this.ctx;
    if(!m.sound){if(c){const t=c.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setValueAtTime(this.master.gain.value,t);this.master.gain.linearRampToValueAtTime(0,t+.08);}this.crowdStop();}
    else{this.resume();if(this.ctx){const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setValueAtTime(0,t);this.master.gain.linearRampToValueAtTime(.85,t+.1);}if(M&&(M.phase==='live'||M.phase==='ht'))this.matchStart(true);if(M&&M.phase==='ht')this.crowdLevel(.45);}
    toast(m.sound?'Zvuk uključen':'Zvuk isključen');},
  // ---- match hooks ----
  level(){if(!S||!M)return .3;const att=M.euro?Math.max(cap(),8000):M.home?(S.lastAtt||cap()):Math.max(80,cap()*.4);return clamp(Math.log10(Math.max(20,att))/4.6,.15,1)*(M.home?1:.8);},
  matchStart(quiet){if(!this.resume())return;this.crowdStart(this.level());if(!quiet)this.whistle(.35,[.75]);
    if(M.home&&S.ultras&&S.ultras.mood>=50)setTimeout(()=>this.drumsStart(),1200);},
  chunk(lines,ms){if(!this.ctx||!this.crowd||!this.on())return;const lv=this.level(),span=ms/1000;
    if(M.fast)return;
    lines.forEach(l=>{if(typeof l.m!=='number')return;const at=Math.max(0,Math.min(.95,((l.m-1)%15)/15))*span;
      if(/goal us/.test(l.k))this.roar(at,M.home?lv:lv*.55);
      else if(/goal them/.test(l.k)){if(M.home)this.groan(at,lv);else this.roar(at,lv*.7);}
      else if(l.k==='')this.ooh(at,lv*.8);});},
  half(){this.whistle(.1,[.3,.75]);this.crowdLevel(.45);},
  second(){if(!this.crowd)this.matchStart(true);this.crowdLevel(1);this.whistle(.2,[.6]);},
  full(gf,ga){if(!this.live())return;this.whistle(.1,[.3,.3,1]);const lv=this.level();
    if(gf>ga)this.roar(1.9,M&&M.home?lv:lv*.6);else if(gf<ga&&M&&M.home)this.groan(1.9,lv*.8);
    setTimeout(()=>this.crowdStop(),3200);},
  modal(m){if(!m||m===this.last)return;this.last=m;
    if(m.type==='phase')this.fanfare(true);
    else if(m.type==='season'&&S.sum&&((S.sum.up&&S.sum.gate)||(S.li>=MAXLI&&S.sum.pos===1)))this.fanfare(true);
    else if(m.type==='outcome'&&m.title==='Kup Srbije'&&S.cup&&S.cup.won)this.fanfare(true);
    else if(m.type==='level'||m.type==='perk')this.fanfare(false);}
};

