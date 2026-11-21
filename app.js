(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const first=root.classList.contains('first');
try{sessionStorage.setItem('vv-seen','1')}catch(e){}

/* ---------- fit text: big wordmarks always fill their container exactly ---------- */
function fit(wrap,el,max){
  if(!wrap||!el) return;
  el.style.setProperty('--fit','100px');
  const w=el.scrollWidth, cw=wrap.clientWidth;
  if(!w||!cw) return;
  let size=100*cw/w*0.995;
  if(max) size=Math.min(size,max);
  el.style.setProperty('--fit',size.toFixed(2)+'px');
}
function fitAll(){
  fit($('#heroFit'),$('#heroTitle'),Math.max(innerHeight*.32,60));
  fit($('#footFit'),$('#footBig'));
}

/* ---------- split helpers ---------- */
function splitChars(el){
  const txt=el.textContent.trim(); el.textContent='';
  const frag=document.createDocumentFragment();
  [...txt].forEach(ch=>{const w=document.createElement('span');w.className='chw';w.setAttribute('aria-hidden','true');const s=document.createElement('span');s.className='ch';s.textContent=ch;w.appendChild(s);frag.appendChild(w);});
  el.appendChild(frag);
  return $$('.ch',el);
}
function splitWords(el){
  const nodes=[...el.childNodes]; el.textContent='';
  nodes.forEach(n=>{
    if(n.nodeType===3){
      n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part) return;
        if(/^\s+$/.test(part)){el.appendChild(document.createTextNode(' '));return;}
        const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.textContent=part;w.appendChild(s);el.appendChild(w);
      });
    } else el.appendChild(n);
  });
  $$('.w>span',el).forEach((s,i)=>s.style.transitionDelay=(i*0.06)+'s');
}
$$('.split').forEach(splitWords);

const heroTitle=$('#heroTitle');
const heroChars=splitChars(heroTitle);
fitAll();
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitAll);
let rz;addEventListener('resize',()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{fitAll();onScroll();});},{passive:true});

/* ---------- loader + hero intro ---------- */
(async function intro(){
  const heroReveals=$$('.hero .reveal-up');
  if(!first||reduce){
    $('#loader')?.remove();
    heroReveals.forEach(e=>e.classList.add('in'));
    return;
  }
  document.body.classList.add('is-loading');
  const cnt=$('#loaderCount'),bar=$('#loaderBar');
  const dur=1100,t0=performance.now();
  await new Promise(res=>{(function f(){const p=Math.min((performance.now()-t0)/dur,1);const e=1-Math.pow(1-p,3);
    cnt.textContent=String(Math.round(e*100)).padStart(3,'0');bar.style.transform=`scaleX(${e})`;
    p<1?requestAnimationFrame(f):res();})();});
  await sleep(120);
  $('#loader').classList.add('done');document.body.classList.remove('is-loading');
  setTimeout(()=>$('#loader')?.remove(),1200);
  heroChars.forEach((c,i)=>c.animate(
    [{transform:'translateY(110%) rotate(8deg)',opacity:0},{transform:'none',opacity:1}],
    {duration:1200,delay:250+i*50,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}
  ).finished.then(a=>{c.style.transform='none';c.style.opacity='1';try{a.cancel()}catch(e){}}));
  setTimeout(()=>heroReveals.forEach((e,i)=>setTimeout(()=>e.classList.add('in'),i*120)),800);
})();

/* hero title: letters lift toward cursor (rects cached, updated in rAF) */
if(fine&&!reduce){
  let rects=[],pending=null;
  const cache=()=>rects=heroChars.map(c=>{const r=c.parentElement.getBoundingClientRect();return r.left+r.width/2;});
  heroTitle.addEventListener('pointerenter',cache);
  heroTitle.addEventListener('pointermove',e=>{
    if(pending) return; const x=e.clientX;
    pending=requestAnimationFrame(()=>{pending=null;
      const rad=heroTitle.clientHeight*1.4;
      heroChars.forEach((c,i)=>{const k=Math.max(0,1-Math.abs(x-rects[i])/rad);
        c.parentElement.style.transform=`translateY(${(-k*.14).toFixed(3)}em)`;c.style.color=k>.6?'var(--acc)':'';});
    });
  });
  heroTitle.addEventListener('pointerleave',()=>heroChars.forEach(c=>{c.parentElement.style.transform='';c.style.color='';}));
}

/* roller */
const roles=['пишу мессенджер V-Rik','развиваю VibeMatch','делаю игры','экспериментирую с вебом','строю свой путь'];
let ri=0;const roller=$('#roller');
setInterval(()=>{
  if(document.hidden) return;
  const old=roller.firstElementChild;ri=(ri+1)%roles.length;
  const n=document.createElement('i');n.textContent=roles[ri];n.style.transform='translateY(100%)';n.style.opacity='0';
  roller.appendChild(n);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{old.style.transform='translateY(-100%)';old.style.opacity='0';n.style.transform='none';n.style.opacity='1';}));
  setTimeout(()=>old.remove(),650);
},2600);

/* clock */
function clock(){const d=new Date(Date.now()+(5*60+new Date().getTimezoneOffset())*60000);
  $('#clock').textContent='TYUMEN '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' · UTC+5';}
clock();setInterval(clock,15000);

/* ---------- cursor (rAF only while moving) ---------- */
if(fine){
  const cur=$('#cursor'),curL=$('#cursorLabel');let cx=0,cy=0,px=0,py=0,run=false,started=false;
  const step=()=>{px+=(cx-px)*.22;py+=(cy-py)*.22;cur.style.transform=`translate3d(${px}px,${py}px,0)`;
    if(Math.abs(cx-px)+Math.abs(cy-py)>.1)requestAnimationFrame(step);else run=false;};
  addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;if(!started){px=cx;py=cy;started=true;cur.classList.add('on');}if(!run){run=true;requestAnimationFrame(step);}},{passive:true});
  document.addEventListener('pointerleave',()=>cur.classList.remove('on'));
  document.addEventListener('pointerenter',()=>started&&cur.classList.add('on'));
  addEventListener('pointerdown',()=>cur.classList.add('is-down'));
  addEventListener('pointerup',()=>cur.classList.remove('is-down'));
  document.addEventListener('pointerover',e=>{const t=e.target.closest('[data-cursor]');if(t){cur.classList.add('is-big');curL.textContent=t.dataset.cursor;}});
  document.addEventListener('pointerout',e=>{const t=e.target.closest('[data-cursor]');if(t&&!t.contains(e.relatedTarget)){cur.classList.remove('is-big');}});

  /* magnetic */
  $$('[data-magnetic]').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transition='transform .15s linear';el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;});
    el.addEventListener('pointerleave',()=>{el.style.transition='transform .5s cubic-bezier(.2,.8,.2,1)';el.style.transform='';});
  });

  /* tilt + glare */
  $$('[data-tilt-wrap]').forEach(w=>{
    const card=$('[data-tilt]>*',w);let raf=null;
    w.addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=null;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.classList.add('is-tilting');card.style.transform=`rotateY(${(x-.5)*10}deg) rotateX(${-(y-.5)*10}deg)`;
      card.style.setProperty('--gx',(x*100)+'%');card.style.setProperty('--gy',(y*100)+'%');});});
    w.addEventListener('pointerleave',()=>{card.classList.remove('is-tilting');card.style.transform='';});
  });

  /* footer letters wave */
  const fb=$('#footBig');
  const fspans=[...fb.textContent.trim()].map(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;return s;});
  fb.textContent='';fspans.forEach(s=>fb.appendChild(s));
  let frects=[];
  fb.addEventListener('pointerenter',()=>frects=fspans.map(s=>{const r=s.getBoundingClientRect();return r.left+r.width/2;}));
  fb.addEventListener('pointermove',e=>fspans.forEach((s,i)=>{const k=Math.max(0,1-Math.abs(e.clientX-frects[i])/(fb.clientHeight*1.6));s.style.transform=`translateY(${-k*18}%)`;s.style.color=k>.7?'var(--acc)':'';}));
  fb.addEventListener('pointerleave',()=>fspans.forEach(s=>{s.style.transform='';s.style.color='';}));
}

/* ---------- mobile menu ---------- */
const burger=$('#burger'),menu=$('#menu');
function setMenu(open){document.body.classList.toggle('menu-open',open);burger.setAttribute('aria-expanded',open);menu.setAttribute('aria-hidden',!open);}
burger.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
$$('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});

/* ---------- reveals ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.2,rootMargin:'0px 0px -5% 0px'});
$$('.split, section:not(.hero) .reveal-up, .timeline li').forEach(el=>io.observe(el));

/* pause decorative CSS loops when offscreen */
const pio=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('paused',!e.isIntersecting)));
$$('.marquee, .tg__bg').forEach(el=>pio.observe(el));

/* active nav link */
const navLinks=$$('.nav__links a');
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+e.target.id));}}),{rootMargin:'-45% 0px -50% 0px'});
['about','projects','explore','ask'].forEach(id=>{const s=document.getElementById(id);s&&sio.observe(s);});

/* about: scroll-lit words */
const about=$('#aboutText');
(function(){const txt=about.textContent.trim();about.textContent='';txt.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){about.appendChild(document.createTextNode(' '));return;}const s=document.createElement('span');s.className='wd';s.textContent=p;about.appendChild(s);});})();
const aw=$$('.wd',about);

/* ---------- single rAF-throttled scroll pipeline ---------- */
const tl=$('#timeline'),aq=$('#askQ'),nav=$('#nav'),prog=$('#progress');
let lastY=scrollY,ticking=false,lastLit=-1;
function onScroll(){
  ticking=false;
  const y=scrollY,vh=innerHeight;
  nav.classList.toggle('is-solid',y>40);
  if(!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden',y>lastY+2&&y>400);
  if(y<lastY-2) nav.classList.remove('is-hidden');
  lastY=y;
  const max=document.documentElement.scrollHeight-vh;
  prog.style.transform=`scaleX(${max>0?y/max:0})`;

  const r=about.getBoundingClientRect();
  if(r.top<vh&&r.bottom>0||lastLit!==-1){
    const p=Math.min(Math.max((vh*.85-r.top)/(r.height+vh*.4),0),1);
    const n=Math.floor(p*aw.length*1.05);
    if(n!==lastLit){aw.forEach((w,i)=>w.classList.toggle('lit',i<n));lastLit=n;}
  }
  const tr=tl.getBoundingClientRect();
  if(tr.top<vh&&tr.bottom>0){tl.style.setProperty('--prog',Math.min(Math.max((vh*.6-tr.top)/tr.height,0),1).toFixed(4));}
  const ar=aq.getBoundingClientRect();
  if(ar.top<vh&&ar.bottom>0&&!reduce) aq.style.transform=`rotate(${((ar.top-vh/2)*-.06).toFixed(2)}deg)`;
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
onScroll();

/* link spotlight origin */
$$('.lnk').forEach(l=>l.addEventListener('pointerenter',e=>{const r=l.getBoundingClientRect();l.style.setProperty('--mx',(e.clientX-r.left)+'px');l.style.setProperty('--my',(e.clientY-r.top)+'px');}));

/* ---------- visibility-aware loops ---------- */
function visibility(el,th=.15){const st={on:false};new IntersectionObserver(([e])=>st.on=e.isIntersecting,{threshold:th}).observe(el);return st;}
async function waitVisible(st){while(!st.on||document.hidden) await sleep(300);}
function bub(parent,html,cls=''){const b=document.createElement('div');b.className='bub '+cls;b.innerHTML=html;parent.appendChild(b);while(parent.children.length>6)parent.firstElementChild.remove();return b;}
async function typing(parent,ms,cls=''){const t=bub(parent,'<i></i><i></i><i></i>','typing '+cls);await sleep(ms);t.remove();}

/* VibeMatch */
const vmChat=$('#vmChat'),vmRing=$('#vmRing'),vmPct=$('#vmPct'),vmVis=visibility(vmChat);
(async function vmLoop(){
  const people=[['Аня',94],['Кирилл',87],['Лиза',91]];let k=0;
  while(true){
    await waitVisible(vmVis);
    vmChat.textContent='';vmRing.style.strokeDashoffset=327;vmPct.textContent='0';
    await typing(vmChat,600);
    bub(vmChat,'Привет! Что сейчас слушаешь?');await sleep(900);
    bub(vmChat,'Phonk и lo-fi по вечерам','me');await sleep(900);
    bub(vmChat,'<span>🎧 музыка</span><span>🌙 ночной</span><span>💻 код</span>','chips');await sleep(900);
    bub(vmChat,'Ищу совпадения по Vibe DNA…');await sleep(700);
    const [nm,pc]=people[k++%people.length];
    vmRing.style.strokeDashoffset=327*(1-pc/100);
    const t0=performance.now();await new Promise(r=>{(function f(){const p=Math.min((performance.now()-t0)/1600,1);vmPct.textContent=Math.round((1-Math.pow(1-p,3))*pc);p<1?requestAnimationFrame(f):r();})();});
    bub(vmChat,`Нашёл! <b>${nm}</b> — совпадение ${pc}% ✦`);await sleep(3200);
  }
})();

/* V-Rik */
const vrMsgs=$('#vrMsgs'),wave=$('#vrWave'),vrTime=$('#vrTime'),vrVis=visibility(vrMsgs);
const bars=Array.from({length:34},()=>wave.appendChild(document.createElement('i')));
setInterval(()=>{if(!vrVis.on||document.hidden)return;const t=Date.now()/300;bars.forEach((b,i)=>b.style.transform=`scaleY(${(.15+Math.abs(Math.sin(t+i*.5))*Math.random()*.85).toFixed(3)})`);},130);
let sec=0;setInterval(()=>{if(!vrVis.on)return;sec++;vrTime.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);
const conv=[['Никита','Залил новый билд?'],['me','Да, голос теперь на WebRTC'],['Дима','Звук чистый, задержки нет 🔥'],['Рома','Кидаю файл с макетом'],['me','Принял, смотрю'],['Никита','Поиск по чатам — топ']];
(async function vrLoop(){let i=0;while(true){await waitVisible(vrVis);const [who,t]=conv[i++%conv.length];
  if(who!=='me') await typing(vrMsgs,500);
  bub(vrMsgs,(who==='me'?'':'<small>'+who+'</small>')+t,who==='me'?'me':'');await sleep(1500);}})();

/* GitHub terminal typing */
const code=[['$','git log --oneline'],['','a91f3c2 feat(v-rik): webrtc voice'],['','7be04d1 feat(vibematch): referrals'],['','e2c88aa release: eno card battle'],['$','git push origin main'],['✓','shipped.']];
const gh=$('#ghCode'),ghVis=visibility(gh);
(async function ghLoop(){while(true){await waitVisible(ghVis);gh.textContent='';
  for(const [pre,txt] of code){
    const row=document.createElement('div');gh.appendChild(row);
    const p=pre?`<span class="c">${pre}</span> `:'';
    for(let i=0;i<=txt.length;i+=2){row.innerHTML=p+txt.slice(0,i).replace(/</g,'&lt;')+'<span class="c">▍</span>';await sleep(28);}
    row.innerHTML=p+txt.replace(/</g,'&lt;');await sleep(240);}
  await sleep(3500);}})();
})();
