(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
document.body.classList.add('is-loading');

/* ---------- split helpers ---------- */
function splitChars(el){
  const txt=el.textContent; el.textContent='';
  [...txt].forEach(ch=>{const w=document.createElement('span');w.className='chw';const s=document.createElement('span');s.className='ch';s.textContent=ch;w.appendChild(s);el.appendChild(w);});
  return $$('.ch',el);
}
function splitWords(el){
  // keeps <br>
  const nodes=[...el.childNodes]; el.innerHTML='';
  nodes.forEach(n=>{
    if(n.nodeType===3){
      n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part) return;
        if(/^\s+$/.test(part)){el.appendChild(document.createTextNode(' '));return;}
        const w=document.createElement('span');w.className='w';w.innerHTML='<span>'+part+'</span>';el.appendChild(w);
      });
    } else el.appendChild(n);
  });
}
$$('.split').forEach(splitWords);
$$('.split').forEach(el=>$$('.w>span',el).forEach((s,i)=>s.style.transitionDelay=(i*0.06)+'s'));

/* ---------- loader + hero intro ---------- */
const heroChars=splitChars($('#heroTitle'));
(async function intro(){
  const cnt=$('#loaderCount'),bar=$('#loaderBar');
  const dur=1400,t0=performance.now();
  await new Promise(res=>{(function f(){const p=Math.min((performance.now()-t0)/dur,1);const e=1-Math.pow(1-p,3);
    cnt.textContent=String(Math.round(e*100)).padStart(3,'0');bar.style.width=(e*100)+'%';
    p<1?requestAnimationFrame(f):res();})();});
  await sleep(150);
  $('#loader').classList.add('done');document.body.classList.remove('is-loading');
  heroChars.forEach((c,i)=>c.animate([{transform:'translateY(110%) rotate(8deg)',opacity:0},{transform:'none',opacity:1}],{duration:1200,delay:300+i*55,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}));
  setTimeout(()=>$$('.hero .reveal-up').forEach((e,i)=>setTimeout(()=>e.classList.add('in'),i*120)),900);
})();

/* hero title: letters scatter away from cursor */
const title=$('#heroTitle');
title.addEventListener('pointermove',e=>{
  heroChars.forEach(c=>{const r=c.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);const k=Math.max(0,1-d/260);
    c.parentElement.style.transform=`translateY(${-k*24}px)`;c.parentElement.style.transition='transform .25s';c.style.color=k>.55?'var(--acc)':'';});
});
title.addEventListener('pointerleave',()=>heroChars.forEach(c=>{c.parentElement.style.transform='';c.style.color='';}));

/* roller */
const roles=['пишу мессенджер V-Rik','развиваю VibeMatch','делаю игры','экспериментирую с вебом','строю свой путь'];
let ri=0;const roller=$('#roller');
setInterval(()=>{const old=roller.firstElementChild;ri=(ri+1)%roles.length;
  old.style.transform='translateY(-100%)';old.style.opacity='0';
  const n=document.createElement('i');n.textContent=roles[ri];n.style.transform='translateY(100%)';n.style.position='absolute';
  roller.style.position='relative';roller.appendChild(n);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{n.style.transform='none';}));
  setTimeout(()=>{old.remove();n.style.position='';},650);},2600);

/* clock */
function clock(){const d=new Date(Date.now()+ (5*60+new Date().getTimezoneOffset())*60000);
  $('#clock').textContent='TYUMEN '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' · UTC+5';}
clock();setInterval(clock,10000);

/* ---------- cursor ---------- */
const cur=$('#cursor'),curL=$('#cursorLabel');let cx=innerWidth/2,cy=innerHeight/2,px=cx,py=cy;
addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;});
(function f(){px+=(cx-px)*.2;py+=(cy-py)*.2;cur.style.transform=`translate(${px}px,${py}px) translate(-50%,-50%)`;requestAnimationFrame(f);})();
document.addEventListener('pointerover',e=>{const t=e.target.closest('[data-cursor]');if(t){cur.classList.add('is-big');curL.textContent=t.dataset.cursor;}});
document.addEventListener('pointerout',e=>{const t=e.target.closest('[data-cursor]');if(t&&!t.contains(e.relatedTarget)){cur.classList.remove('is-big');}});

/* magnetic */
$$('[data-magnetic]').forEach(el=>{
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;});
  el.addEventListener('pointerleave',()=>{el.style.transition='transform .5s cubic-bezier(.2,.8,.2,1)';el.style.transform='';setTimeout(()=>el.style.transition='',500);});
});

/* nav hide on scroll */
let lastY=0;const nav=$('#nav');
addEventListener('scroll',()=>{const y=scrollY;nav.classList.toggle('is-solid',y>40);nav.classList.toggle('is-hidden',y>lastY&&y>400);lastY=y;},{passive:true});

/* ---------- reveals ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.2});
$$('.split, section:not(.hero) .reveal-up, .timeline li').forEach(el=>io.observe(el));

/* about: scroll-lit words */
const about=$('#aboutText');
(function(){const nodes=[...about.childNodes];about.innerHTML='';nodes.forEach(n=>{if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){about.appendChild(document.createTextNode(' '));return;}const s=document.createElement('span');s.className='wd';s.textContent=p;about.appendChild(s);});}else about.appendChild(n);});})();
const aw=$$('.wd',about);

/* timeline progress */
const tl=$('.timeline');

function onScroll(){
  const vh=innerHeight;
  const r=about.getBoundingClientRect();
  const p=Math.min(Math.max((vh*.85-r.top)/(r.height+vh*.4),0),1);
  const n=Math.floor(p*aw.length*1.05);
  aw.forEach((w,i)=>w.classList.toggle('lit',i<n));
  const tr=tl.getBoundingClientRect();
  const tp=Math.min(Math.max((vh*.6-tr.top)/tr.height,0),1);
  tl.style.setProperty('--prog',(tp*100)+'%');
  // ask "?" rotation
  const aq=$('#askQ'),ar=aq.getBoundingClientRect();
  aq.style.transform=`rotate(${(ar.top-vh/2)*-.06}deg)`;
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* tilt */
$$('[data-tilt-wrap]').forEach(w=>{
  const card=$('[data-tilt]>*',w);
  w.addEventListener('pointermove',e=>{const r=w.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateY(${x*10}deg) rotateX(${-y*10}deg)`;});
  w.addEventListener('pointerleave',()=>card.style.transform='');
});

/* link spotlight origin */
$$('.lnk').forEach(l=>l.addEventListener('pointerenter',e=>{const r=l.getBoundingClientRect();l.style.setProperty('--mx',(e.clientX-r.left)+'px');l.style.setProperty('--my',(e.clientY-r.top)+'px');}));

/* ---------- VibeMatch loop ---------- */
const vmChat=$('#vmChat'),vmRing=$('#vmRing'),vmPct=$('#vmPct');
function onceVisible(el,fn){const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){o.disconnect();fn();}},{threshold:.35});o.observe(el);}
function bub(parent,html,cls=''){const b=document.createElement('div');b.className='bub '+cls;b.innerHTML=html;parent.appendChild(b);while(parent.children.length>6)parent.firstElementChild.remove();return b;}
async function vmLoop(){
  const people=[['Аня',94],['Кирилл',87],['Лиза',91]];let k=0;
  while(true){
    vmChat.innerHTML='';vmRing.style.strokeDashoffset=327;vmPct.textContent='0';
    bub(vmChat,'Привет! Что сейчас слушаешь?');await sleep(900);
    bub(vmChat,'Phonk и lo-fi по вечерам','me');await sleep(900);
    bub(vmChat,'<span>🎧 музыка</span><span>🌙 ночной</span><span>💻 код</span>','chips');await sleep(900);
    bub(vmChat,'Ищу совпадения по Vibe DNA…');await sleep(700);
    const [nm,pc]=people[k++%people.length];
    vmRing.style.strokeDashoffset=327*(1-pc/100);
    const t0=performance.now();await new Promise(r=>{(function f(){const p=Math.min((performance.now()-t0)/1600,1);vmPct.textContent=Math.round((1-Math.pow(1-p,3))*pc);p<1?requestAnimationFrame(f):r();})();});
    bub(vmChat,`Нашёл! <b>${nm}</b> — совпадение ${pc}% ✦`);await sleep(3200);
  }
}
onceVisible(vmChat,vmLoop);

/* ---------- V-Rik loop ---------- */
const vrMsgs=$('#vrMsgs'),wave=$('#vrWave'),vrTime=$('#vrTime');
for(let i=0;i<34;i++)wave.appendChild(document.createElement('i'));
const bars=$$('i',wave);
setInterval(()=>bars.forEach((b,i)=>b.style.height=(15+Math.abs(Math.sin(Date.now()/300+i*.5))*Math.random()*85)+'%'),130);
let sec=0;setInterval(()=>{sec++;vrTime.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);
const conv=[['Никита','Залил новый билд?'],['me','Да, голос теперь на WebRTC'],['Дима','Звук чистый, задержки нет 🔥'],['Рома','Кидаю файл с макетом'],['me','Принял, смотрю'],['Никита','Поиск по чатам — топ']];
async function vrLoop(){let i=0;while(true){const [who,t]=conv[i++%conv.length];
  bub(vrMsgs,(who==='me'?'':'<small>'+who+'</small>')+t,who==='me'?'me':'');await sleep(1700);}}
onceVisible(vrMsgs,vrLoop);

/* ---------- GitHub code typing ---------- */
const code=[
  '<span class="c">$</span> git log --oneline',
  'a91f3c2 feat(v-rik): webrtc voice',
  '7be04d1 feat(vibematch): referrals',
  'e2c88aa release: eno card battle',
  '<span class="c">$</span> git push origin main',
  '<span class="c">✓</span> shipped.'
];
onceVisible($('#ghCode'),async()=>{const el=$('#ghCode');while(true){el.innerHTML='';for(const line of code){
  const tmp=document.createElement('div');tmp.innerHTML=line;const plain=tmp.textContent;const prefixHTML=line.startsWith('<span')?line.match(/^<span[^>]*>.*?<\/span>/)[0]:'';const prefixLen=prefixHTML?tmp.firstChild.textContent.length:0;
  const row=document.createElement('div');el.appendChild(row);
  for(let i=prefixLen;i<=plain.length;i++){row.innerHTML=prefixHTML+plain.slice(prefixLen,i).replace(/</g,'&lt;')+'<span class="c">▍</span>';await sleep(22);}
  row.innerHTML=prefixHTML+plain.slice(prefixLen);await sleep(260);}
  await sleep(3500);}});

/* ---------- footer letters wave ---------- */
const fb=$('#footBig');const fch=[...fb.textContent];fb.innerHTML=fch.map(c=>'<span class="ch">'+c+'</span>').join('');
const fspans=$$('.ch',fb);
fb.addEventListener('pointermove',e=>fspans.forEach(s=>{const r=s.getBoundingClientRect();const d=Math.abs(e.clientX-(r.left+r.width/2));const k=Math.max(0,1-d/220);s.style.transform=`translateY(${-k*18}%)`;}));
fb.addEventListener('pointerleave',()=>fspans.forEach(s=>s.style.transform=''));
})();
