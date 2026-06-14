'use strict';

/* ──────────────────────────
   LOADER
────────────────────────── */
const loaderEl = document.getElementById('loader');
const pctEl = document.getElementById('ldr-pct');
let pct = 0;
const pctTimer = setInterval(() => {
  pct = Math.min(pct + Math.ceil(Math.random() * 3 + 1), 100);
  pctEl.textContent = pct + '%';
  if (pct >= 100) clearInterval(pctTimer);
}, 45);
setTimeout(() => {
  loaderEl.classList.add('exit');
  document.body.classList.remove('loading');
}, 3200);

/* Loader Burst of Hearts */
(function() {
  const ldrHearts = document.querySelector('.ldr-hearts');
  if (ldrHearts) {
    const heartChars = ['💕', '🌸', '✨', '💖', '🤍', '🎀'];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 20 : 50;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ldr-heart';
      span.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
      span.style.cssText = `left:${Math.random()*100}%;animation-delay:${(Math.random()*1.5).toFixed(2)}s;font-size:${(Math.random()*1.5+0.8).toFixed(1)}rem;animation-duration:${(Math.random()*3+3).toFixed(1)}s`;
      frag.appendChild(span);
    }
    ldrHearts.appendChild(frag);
  }
})();

/* Loader canvas petals */
(function () {
  const lc = document.getElementById('loader-canvas');
  const lx = lc.getContext('2d');
  lc.width = window.innerWidth; lc.height = window.innerHeight;
  const lW = lc.width, lH = lc.height;
  const LC = [[199,139,145,.3],[237,212,207,.24],[175,165,198,.2],[212,155,122,.2],[232,200,151,.18]];
  const lp = [];
  class LP {
    constructor() { this.r(); }
    r() {
      this.x = Math.random()*lW; this.y = Math.random()*lH;
      this.rx = Math.random()*6+2; this.ry = this.rx*(.35+Math.random()*.28);
      this.vx = (Math.random()-.5)*.35; this.vy = Math.random()*.45+.12;
      this.rot = Math.random()*Math.PI*2; this.vr = (Math.random()-.5)*.018;
      this.sw = Math.random()*Math.PI*2; this.c = LC[Math.floor(Math.random()*LC.length)];
    }
    u() { this.sw+=.007; this.x+=this.vx+Math.sin(this.sw)*.38; this.y+=this.vy; this.rot+=this.vr; if(this.y>lH+20)this.r(); }
    d() { lx.save(); lx.translate(this.x,this.y); lx.rotate(this.rot); lx.globalAlpha=this.c[3]; lx.fillStyle=`rgb(${this.c[0]},${this.c[1]},${this.c[2]})`; lx.beginPath(); lx.ellipse(0,0,this.rx,this.ry,0,0,Math.PI*2); lx.fill(); lx.restore(); }
  }
  for(let i=0;i<32;i++) lp.push(new LP());
  let alive=true;
  (function ll(){if(!alive)return; lx.clearRect(0,0,lW,lH); lp.forEach(p=>{p.u();p.d();}); requestAnimationFrame(ll);})();
  setTimeout(()=>{alive=false;},4500);
})();

/* ──────────────────────────
   SCROLL PROGRESS
────────────────────────── */
const scrollBar = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = (window.scrollY/max*100).toFixed(1)+'%';
}, {passive:true});

/* ──────────────────────────
   CURSOR TRAIL (desktop only)
────────────────────────── */
(function() {
  if ('ontouchstart' in window) return; // Skip on touch devices for perf
  const cc = document.getElementById('cursor-canvas');
  const cx = cc.getContext('2d');
  let cW, cH;
  function resizeCursor() { cW = cc.width = window.innerWidth; cH = cc.height = window.innerHeight; }
  resizeCursor();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resizeCursor, 150); });

  const TRAIL_COLS = ['199,139,145','237,212,207','176,167,200','212,155,122','232,200,151'];
  const trails = [];

  class Trail {
    constructor(x,y) {
      this.x = x; this.y = y;
      this.sz = Math.random()*3+1;
      this.vx = (Math.random()-.5)*1.5;
      this.vy = (Math.random()-.5)*1.5 - .5;
      this.life = 0; this.max = 40+Math.random()*30;
      this.col = TRAIL_COLS[Math.floor(Math.random()*TRAIL_COLS.length)];
      this.isStar = Math.random() < .25;
    }
    update() { this.x+=this.vx; this.y+=this.vy; this.vy+=.04; this.life++; }
    draw() {
      const a = (1-this.life/this.max)*.6;
      if(a<.02) return;
      cx.save(); cx.translate(this.x,this.y); cx.globalAlpha=a;
      cx.fillStyle=`rgb(${this.col})`;
      if(this.isStar) {
        const s=this.sz;
        cx.beginPath();
        cx.moveTo(0,-s*2.5); cx.quadraticCurveTo(s*.2,-s*.2,s*2.5,0);
        cx.quadraticCurveTo(s*.2,s*.2,0,s*2.5); cx.quadraticCurveTo(-s*.2,s*.2,-s*2.5,0);
        cx.quadraticCurveTo(-s*.2,-s*.22,0,-s*2.5); cx.closePath(); cx.fill();
      } else {
        cx.beginPath(); cx.arc(0,0,this.sz,0,Math.PI*2); cx.fill();
      }
      cx.restore();
    }
    get done() { return this.life>=this.max; }
  }

  let lastX=-9999, lastY=-9999;
  let mouseQueued = false;
  let pendingX = 0, pendingY = 0;
  document.addEventListener('mousemove', e => {
    pendingX = e.clientX; pendingY = e.clientY;
    if (mouseQueued) return;
    mouseQueued = true;
    requestAnimationFrame(() => {
      mouseQueued = false;
      const dx = pendingX-lastX, dy = pendingY-lastY;
      if(dx*dx+dy*dy < 30) return;
      lastX=pendingX; lastY=pendingY;
      for(let i=0;i<3;i++) trails.push(new Trail(pendingX+((Math.random()-.5)*4), pendingY+((Math.random()-.5)*4)));
    });
  }, {passive:true});

  (function tloop(){
    cx.clearRect(0,0,cW,cH);
    for(let i=trails.length-1;i>=0;i--) {
      trails[i].update(); trails[i].draw();
      if(trails[i].done) trails.splice(i,1);
    }
    requestAnimationFrame(tloop);
  })();
})();

/* ──────────────────────────
   HERO CONSTELLATION
────────────────────────── */
(function() {
  const heroSection = document.querySelector('.hero');
  const constellationEl = document.getElementById('hero-constellation');
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  constellationEl.appendChild(svg);

  const W = heroSection.offsetWidth, H = heroSection.offsetHeight;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

  // Create stars
  const stars = [];
  for(let i=0;i<60;i++) {
    const x = Math.random()*W, y = Math.random()*H;
    const r = Math.random()*1.2+.3;
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx',x); circle.setAttribute('cy',y); circle.setAttribute('r',r);
    circle.setAttribute('fill',`rgba(240,232,237,${Math.random()*.5+.1})`);
    const animDur = (Math.random()*3+2).toFixed(1);
    const animDelay = (Math.random()*4).toFixed(1);
    circle.style.cssText = `animation:starTwinkle ${animDur}s ease-in-out ${animDelay}s infinite`;
    svg.appendChild(circle);
    stars.push({x,y});
  }

  // Connect nearby stars with lines
  for(let i=0;i<stars.length;i++) {
    for(let j=i+1;j<stars.length;j++) {
      const dx=stars[i].x-stars[j].x, dy=stars[i].y-stars[j].y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<90 && Math.random()<.35) {
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',stars[i].x); line.setAttribute('y1',stars[i].y);
        line.setAttribute('x2',stars[j].x); line.setAttribute('y2',stars[j].y);
        line.setAttribute('stroke',`rgba(199,139,145,${0.04+Math.random()*0.06})`);
        line.setAttribute('stroke-width','0.5');
        svg.insertBefore(line, svg.firstChild);
      }
    }
  }

  const style = document.createElement('style');
  style.textContent = `@keyframes starTwinkle{0%,100%{opacity:.3}50%{opacity:1}}`;
  document.head.appendChild(style);
})();

/* ──────────────────────────
   MAIN CANVAS (petals + sparkles + bursts)
────────────────────────── */
const canvas = document.getElementById('petals');
const ctx = canvas.getContext('2d');
let W, H;
const IS_MOBILE = window.innerWidth < 768 || 'ontouchstart' in window;
const PCOLS = [[199,139,145,.42],[237,212,207,.34],[175,165,198,.28],[212,155,122,.26],[240,232,237,.2],[232,200,151,.22]];
// Pre-cache fill strings to avoid repeated template literal allocations
const PCOL_STRINGS = PCOLS.map(c => `rgb(${c[0]},${c[1]},${c[2]})`);

class Petal {
  constructor(init) { this.reset(init); }
  reset(init=false) {
    this.x=Math.random()*W; this.y=init?Math.random()*H:-25;
    this.rx=Math.random()*8+3; this.ry=this.rx*(.33+Math.random()*.28);
    this.vx=(Math.random()-.5)*.55; this.vy=Math.random()*.6+.18;
    this.rot=Math.random()*Math.PI*2; this.vr=(Math.random()-.5)*.022;
    this.sw=Math.random()*Math.PI*2; this.svp=.005+Math.random()*.012;
    this.ci=Math.floor(Math.random()*PCOLS.length);
  }
  update() { this.sw+=this.svp; this.x+=this.vx+Math.sin(this.sw)*.48; this.y+=this.vy; this.rot+=this.vr; if(this.y>H+25)this.reset(); }
  draw() { ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.globalAlpha=PCOLS[this.ci][3]; ctx.fillStyle=PCOL_STRINGS[this.ci]; ctx.beginPath(); ctx.ellipse(0,0,this.rx,this.ry,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
}

const SCOLS=['255,248,252','237,212,207','175,165,198','232,200,151'];
const SCOL_STRINGS = SCOLS.map(c => `rgb(${c})`);
class Sparkle {
  constructor() { this.reset(true); }
  reset(init=false) {
    this.x=Math.random()*W; this.y=init?Math.random()*H:Math.random()*H;
    this.sz=Math.random()*2+.7; this.life=0; this.max=100+Math.random()*160;
    this.peak=Math.random()*.45+.1; this.ci=Math.floor(Math.random()*SCOLS.length);
  }
  update() { this.life++; if(this.life>=this.max)this.reset(); }
  draw() {
    const t=this.life/this.max;
    const a=this.peak*Math.sin(t*Math.PI);
    if(a<.02)return;
    const s=this.sz;
    ctx.save(); ctx.translate(this.x,this.y); ctx.globalAlpha=a; ctx.fillStyle=SCOL_STRINGS[this.ci];
    ctx.beginPath(); ctx.moveTo(0,-s*3); ctx.quadraticCurveTo(s*.22,-s*.22,s*3,0); ctx.quadraticCurveTo(s*.22,s*.22,0,s*3); ctx.quadraticCurveTo(-s*.22,s*.22,-s*3,0); ctx.quadraticCurveTo(-s*.22,-s*.22,0,-s*3); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

const bursts = [];
class Burst {
  constructor(bx,by) {
    this.x=bx; this.y=by;
    const a=Math.random()*Math.PI*2; const sp=Math.random()*8+3;
    this.vx=Math.cos(a)*sp; this.vy=Math.sin(a)*sp; this.g=.15;
    this.rx=Math.random()*6+2; this.ry=this.rx*(.35+Math.random()*.28);
    this.rot=Math.random()*Math.PI*2; this.vr=(Math.random()-.5)*.14;
    this.life=0; this.max=55+Math.floor(Math.random()*45);
    this.ci=Math.floor(Math.random()*PCOLS.length);
  }
  update() { this.x+=this.vx; this.y+=this.vy; this.vy+=this.g; this.vx*=.97; this.rot+=this.vr; this.life++; }
  draw() {
    const a=PCOLS[this.ci][3]*(1-this.life/this.max);
    if(a<.02)return;
    ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.globalAlpha=a;
    ctx.fillStyle=PCOL_STRINGS[this.ci];
    ctx.beginPath(); ctx.ellipse(0,0,this.rx,this.ry,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  get done() { return this.life>=this.max; }
}

/* Pre-render emoji hearts to offscreen canvases for GPU-friendly blitting */
const F_HEARTS = ['💕', '🌸', '✨', '💖', '🤍', '🎀'];
const heartCache = new Map();
function getHeartBitmap(char, sz) {
  const key = char + '|' + sz;
  if (heartCache.has(key)) return heartCache.get(key);
  const pad = 4;
  const dim = sz + pad * 2;
  const oc = document.createElement('canvas');
  oc.width = dim; oc.height = dim;
  const ox = oc.getContext('2d');
  ox.font = `${sz}px sans-serif`;
  ox.textAlign = 'center';
  ox.textBaseline = 'middle';
  ox.fillText(char, dim / 2, dim / 2);
  heartCache.set(key, oc);
  return oc;
}

class FloatingHeart {
  constructor(init=false) { this.reset(init); }
  reset(init=false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 50;
    this.charIdx = Math.floor(Math.random() * F_HEARTS.length);
    this.sz = Math.floor(Math.random() * 18 + 12);
    this.bitmap = getHeartBitmap(F_HEARTS[this.charIdx], this.sz);
    this.vy = -(Math.random() * 0.8 + 0.3);
    this.vx = (Math.random() - 0.5) * 0.4;
    this.sw = Math.random() * Math.PI * 2;
    this.svp = 0.004 + Math.random() * 0.008;
    this.alpha = Math.random() * 0.5 + 0.15;
  }
  update() {
    this.sw += this.svp;
    this.x += this.vx + Math.sin(this.sw) * 0.4;
    this.y += this.vy;
    if (this.y < -60) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.bitmap, this.x - this.bitmap.width/2, this.y - this.bitmap.height/2);
    ctx.restore();
  }
}

let petals=[], sparkles=[], floatingHearts=[];
let resizeTimer;
function resize() { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
function init() { 
  resize(); 
  const numPetals = IS_MOBILE ? 18 : 42;
  const numSparkles = IS_MOBILE ? 20 : 60;
  const numHearts = IS_MOBILE ? 12 : 35;
  petals=Array.from({length:numPetals},()=>new Petal(true)); 
  sparkles=Array.from({length:numSparkles},()=>new Sparkle()); 
  floatingHearts=Array.from({length:numHearts},()=>new FloatingHeart(true)); 
}
(function loop(){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<sparkles.length;i++){sparkles[i].update();sparkles[i].draw();}
  for(let i=0;i<petals.length;i++){petals[i].update();petals[i].draw();}
  for(let i=0;i<floatingHearts.length;i++){floatingHearts[i].update();floatingHearts[i].draw();}
  for(let i=bursts.length-1;i>=0;i--){bursts[i].update();bursts[i].draw();if(bursts[i].done)bursts.splice(i,1);}
  requestAnimationFrame(loop);
})();
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
init();

/* ──────────────────────────
   HERO MOUSE PARALLAX (desktop only)
────────────────────────── */
const heroGlow = document.getElementById('hero-glow');
if (!IS_MOBILE) {
  let parallaxQueued = false;
  let pmx = 0, pmy = 0;
  document.addEventListener('mousemove', e => {
    pmx = (e.clientX/window.innerWidth-.5)*35;
    pmy = (e.clientY/window.innerHeight-.5)*35;
    if (parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(() => {
      parallaxQueued = false;
      heroGlow.style.transform=`translate(calc(-50% + ${pmx}px), calc(-50% + ${pmy}px))`;
    });
  }, {passive:true});
}

/* ──────────────────────────
   MARQUEE
────────────────────────── */
const words = ['Happy Birthday','·','Astha Batra','·','Birthday Girl','·','deluluu','·','asthaaaaaa._','·','🌸','·','forever young','·','cosmic queen','·','main character','·'];
const mq = document.getElementById('mq');
[...words,...words,...words,...words].forEach(t=>{
  const s=document.createElement('span');
  const isDot=(t==='·'||t==='🌸');
  s.className=isDot?'mq-item mq-dot':'mq-item'; s.textContent=t; mq.appendChild(s);
});
mq.innerHTML+=mq.innerHTML;

/* ──────────────────────────
   GALLERY
────────────────────────── */
const gallery = document.getElementById('gallery');
const totalPhotos = 16;
const photoSrcs = [];
const galleryWords = ['gorgeous ✨','stunning 🤍','ethereal 🌸','magic 🦋','radiant 💫','iconic 🎀','beautiful 🌷','angelic 🕊️','flawless 👑','dreamy ☁️','perfect 💎','sweet 🍓','precious 🧸','unreal 🧚‍♀️','lovely 💕','muse 🧿'];

for(let i=1;i<=totalPhotos;i++){
  const src=`imgs/img (${i}).jpg`;
  photoSrcs.push(src);
  const wrap=document.createElement('div');
  wrap.className='photo'; wrap.dataset.index=i-1;
  wrap.style.transitionDelay=`${((i-1)%4)*110+Math.random()*60}ms`;
  const grain=document.createElement('div'); grain.className='film-grain';
  const grad=document.createElement('div'); grad.className='photo-gradient';
  const sh=document.createElement('div'); sh.className='shimmer';
  const mdg=document.createElement('span'); mdg.className='photo-mdg'; mdg.textContent=galleryWords[i-1]||'magic';
  const glow=document.createElement('div'); glow.className='photo-glow';
  const caption=document.createElement('div'); caption.className='photo-caption';
  const numSpan=document.createElement('span'); numSpan.className='photo-caption-num'; numSpan.textContent=String(i).padStart(2,'0')+' / '+totalPhotos;
  const iconSpan=document.createElement('span'); iconSpan.className='photo-caption-icon'; iconSpan.textContent='⤢';
  caption.appendChild(numSpan); caption.appendChild(iconSpan);
  const img=document.createElement('img'); img.src=src; img.alt=`Astha — memory ${i}`; img.loading='lazy';
  img.onerror=()=>{wrap.style.display='none';};
  wrap.appendChild(img); wrap.appendChild(grain); wrap.appendChild(grad); wrap.appendChild(sh);
  wrap.appendChild(glow); wrap.appendChild(mdg); wrap.appendChild(caption);
  gallery.appendChild(wrap);
}

const revIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('on');revIO.unobserve(e.target);} });
},{threshold:.07});

document.querySelectorAll('.photo').forEach(el=>{
  revIO.observe(el);
  if(!('ontouchstart' in window)){
    el.addEventListener('mouseenter',()=>{el.style.transition='transform .14s ease';});
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
      const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      el.style.transform=`perspective(520px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg) scale(1.05)`;
      el.style.zIndex='5';
    });
    el.addEventListener('mouseleave',()=>{
      el.style.transition='transform .7s cubic-bezier(.22,1,.36,1)';
      el.style.transform=''; el.style.zIndex='';
    });
  }
  el.addEventListener('click',()=>{ openLightbox(parseInt(el.dataset.index)); });
});

/* ──────────────────────────
   LIGHTBOX
────────────────────────── */
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightbox-img');
const lightboxNum=document.getElementById('lightbox-num');
const lightboxClose=document.getElementById('lightbox-close');
const lightboxPrev=document.getElementById('lightbox-prev');
const lightboxNext=document.getElementById('lightbox-next');
const lightboxBackdrop=document.getElementById('lightbox-backdrop');
const lightboxIndicators=document.getElementById('lightbox-indicators');
let currentLightboxIndex=0;

for(let i=0;i<totalPhotos;i++){
  const dot=document.createElement('span'); dot.className='lightbox-ind'; dot.dataset.index=i;
  dot.addEventListener('click',()=>goToLightbox(i)); lightboxIndicators.appendChild(dot);
}
function updateIndicators(){ document.querySelectorAll('.lightbox-ind').forEach((d,i)=>{d.classList.toggle('active',i===currentLightboxIndex);}); }
function openLightbox(index){ currentLightboxIndex=index; lightboxImg.src=photoSrcs[index]; lightboxNum.textContent=String(index+1).padStart(2,'0')+' / '+totalPhotos; updateIndicators(); lightbox.classList.add('active'); document.body.style.overflow='hidden'; }
function closeLightbox(){ lightbox.classList.remove('active'); document.body.style.overflow=''; }
function goToLightbox(index){
  currentLightboxIndex=((index%totalPhotos)+totalPhotos)%totalPhotos;
  lightboxImg.style.opacity='0'; lightboxImg.style.transform='scale(.95)';
  setTimeout(()=>{ lightboxImg.src=photoSrcs[currentLightboxIndex]; lightboxNum.textContent=String(currentLightboxIndex+1).padStart(2,'0')+' / '+totalPhotos; updateIndicators(); lightboxImg.style.opacity='1'; lightboxImg.style.transform='scale(1)'; },200);
}
lightboxImg.style.transition='opacity .3s ease, transform .3s ease';
lightboxClose.addEventListener('click',closeLightbox);
lightboxBackdrop.addEventListener('click',closeLightbox);
lightboxPrev.addEventListener('click',e=>{e.stopPropagation();goToLightbox(currentLightboxIndex-1);});
lightboxNext.addEventListener('click',e=>{e.stopPropagation();goToLightbox(currentLightboxIndex+1);});
document.addEventListener('keydown',e=>{ if(!lightbox.classList.contains('active'))return; if(e.key==='Escape')closeLightbox(); if(e.key==='ArrowLeft')goToLightbox(currentLightboxIndex-1); if(e.key==='ArrowRight')goToLightbox(currentLightboxIndex+1); });

/* ──────────────────────────
   SCROLL REVEALS
────────────────────────── */
const secIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(!e.isIntersecting)return; e.target.classList.add('on'); secIO.unobserve(e.target); });
},{threshold:.2});

[
  document.getElementById('eye-wrap'),
  document.getElementById('gallery-subtitle'),
  document.getElementById('gallery-footer'),
  document.getElementById('msg-title'),
  document.getElementById('msg-body'),
].forEach(el=>el&&secIO.observe(el));

/* ──────────────────────────
   VIBES SECTION REVEAL
────────────────────────── */
const vibeIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(!e.isIntersecting)return; e.target.classList.add('on'); vibeIO.unobserve(e.target); });
},{threshold:.15});
document.querySelectorAll('.vibe-card').forEach(el=>vibeIO.observe(el));

/* ──────────────────────────
   WISHES SECTION REVEAL
────────────────────────── */
[document.getElementById('wishes-eyebrow'), document.getElementById('wishes-title')].forEach(el=>el&&secIO.observe(el));
const wishIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(!e.isIntersecting)return; e.target.classList.add('on'); wishIO.unobserve(e.target); });
},{threshold:.12});
document.querySelectorAll('.wish-card').forEach(el=>wishIO.observe(el));

/* ──────────────────────────
   BIRTHDAY MOMENTS REVEAL
────────────────────────── */
const bdayEyebrow=document.getElementById('bday-eyebrow');
const bdayTitle=document.getElementById('bday-title');
const bdaySubtitle=document.getElementById('bday-subtitle');
const bdayHbdText=document.getElementById('bday-hbd-text');
const bdayPolaroids=document.querySelectorAll('.bday-polaroid');
[bdayEyebrow,bdayTitle,bdaySubtitle,bdayHbdText].forEach(el=>el&&secIO.observe(el));
bdayPolaroids.forEach(p=>revIO.observe(p));

function makeBurst(cx,cy){ const count = IS_MOBILE ? 30 : 80; for(let i=0;i<count;i++)bursts.push(new Burst(cx,cy)); }
bdayPolaroids.forEach(p=>{ p.addEventListener('click',e=>makeBurst(e.clientX,e.clientY)); });

/* ──────────────────────────
   OUTRO SECTION REVEAL
────────────────────────── */
const outroIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el = e.target;
    el.querySelector('.outro-eyebrow')?.classList.add('on');
    el.querySelector('.outro-name')?.classList.add('on');
    el.querySelector('.outro-sub')?.classList.add('on');
    setTimeout(()=>{ el.querySelectorAll('.of').forEach((f,i)=>{ setTimeout(()=>f.classList.add('visible'), i*200); }); },600);
    outroIO.unobserve(e.target);
    // Start outro canvas fireworks
    startOutroFireworks();
  });
},{threshold:0, rootMargin:"0px 0px -30% 0px"});
const outroSection = document.querySelector('.closing-section');
if(outroSection) outroIO.observe(outroSection);

/* Outro firework canvas */
function startOutroFireworks(){
  const oc = document.getElementById('outro-canvas');
  if(!oc||oc.dataset.started) return;
  oc.dataset.started='1';
  const ox = oc.getContext('2d');
  oc.width = outroSection.offsetWidth; oc.height = outroSection.offsetHeight;

  const OCOLS=['199,139,145','237,212,207','176,167,200','212,155,122','232,200,151'];
  const oParticles=[];
  class OP {
    constructor(x,y){
      this.x=x; this.y=y; const a=Math.random()*Math.PI*2;
      const sp=Math.random()*4+1; this.vx=Math.cos(a)*sp; this.vy=Math.sin(a)*sp;
      this.g=.06; this.life=0; this.max=80+Math.random()*60;
      this.sz=Math.random()*2+.5; this.col=OCOLS[Math.floor(Math.random()*OCOLS.length)];
    }
    update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=this.g; this.vx*=.98; this.life++; }
    draw(){
      const a=(1-this.life/this.max)*.7;
      if(a<.02)return;
      ox.save(); ox.translate(this.x,this.y); ox.globalAlpha=a;
      ox.fillStyle=`rgb(${this.col})`; ox.beginPath(); ox.arc(0,0,this.sz,0,Math.PI*2); ox.fill(); ox.restore();
    }
    get done(){ return this.life>=this.max; }
  }

  function spawnBurst(){
    const bx=Math.random()*oc.width; const by=Math.random()*oc.height*.7;
    for(let i=0;i<50;i++) oParticles.push(new OP(bx,by));
  }

  let spawnCount=0;
  const spawnInt = setInterval(()=>{ spawnBurst(); spawnCount++; if(spawnCount>12)clearInterval(spawnInt); },600);

  (function oloop(){
    ox.clearRect(0,0,oc.width,oc.height);
    for(let i=oParticles.length-1;i>=0;i--){ oParticles[i].update(); oParticles[i].draw(); if(oParticles[i].done)oParticles.splice(i,1); }
    requestAnimationFrame(oloop);
  })();
}

/* ──────────────────────────
   MSG BODY WORD SPLITTING
────────────────────────── */
function wrapWords(element, startIndex=0){
  const childNodes=Array.from(element.childNodes);
  element.innerHTML='';
  let wordIndex=startIndex;
  childNodes.forEach(node=>{
    if(node.nodeType===Node.TEXT_NODE){
      const words=node.nodeValue.split(/(\s+)/);
      words.forEach(word=>{
        if(word.trim()==='') element.appendChild(document.createTextNode(word));
        else { const span=document.createElement('span'); span.className='msg-word'; span.style.setProperty('--i',wordIndex); span.textContent=word; element.appendChild(span); wordIndex++; }
      });
    } else if(node.nodeType===Node.ELEMENT_NODE){
      if(node.tagName==='BR') element.appendChild(node);
      else { const clone=node.cloneNode(false); wordIndex=wrapWords(node,wordIndex); while(node.firstChild)clone.appendChild(node.firstChild); element.appendChild(clone); }
    }
  });
  return wordIndex;
}
const msgBodyEl=document.getElementById('msg-body');
if(msgBodyEl) wrapWords(msgBodyEl);

/* ──────────────────────────
   POLAROID 3D TILT (desktop)
────────────────────────── */
if(!('ontouchstart' in window)){
  document.querySelectorAll('.bday-polaroid').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
      const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      el.style.transform=`perspective(600px) rotateX(${-dy*10}deg) rotateY(${dx*10}deg) scale(1.08)`;
      el.style.zIndex='5';
    });
    el.addEventListener('mouseleave',()=>{
      el.style.transition='transform .7s cubic-bezier(.22,1,.36,1)';
      el.style.transform=''; el.style.zIndex='';
      setTimeout(()=>{ el.style.transition=''; },700);
    });
  });
}
