/* ---------- utilities ---------- */
const $=s=>document.querySelector(s);
const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fmt(n){const a=Math.abs(n);let s;if(a>=1e6){s=(n/1e6).toFixed(2);if(s.includes('.'))s=s.replace(/0+$/,'').replace(/\.$/,'');s=s.replace('.',',')+'M';}else if(a>=1e3)s=Math.round(n/1e3)+'k';else s=String(Math.round(n));return s+' RSD';}
// Serbian plural: plu(n,'gol','gola','golova')
const plu=(n,a,b,c)=>{n=Math.abs(n);const t=n%10,h=n%100;return t===1&&h!==11?a:t>=2&&t<=4&&(h<12||h>14)?b:c;};
const thn=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fmtS=n=>(n>=0?'+':'−')+fmt(Math.abs(n));
const nr=n=>fmt(n).replace(' RSD','');
function poisson(l){const L=Math.exp(-l);let k=0,p=1;do{k++;p*=Math.random();}while(p>L);return k-1;}
const short=n=>n.replace(/^FK\s+/,'');
function srand(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}

