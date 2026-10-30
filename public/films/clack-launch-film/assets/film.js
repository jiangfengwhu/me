const V={brand:'clack',headline:'每一声敲击，落在纸上。',manuscript:'落笔无悔，字字留痕。',endHold:4,...OM.vars()};
const tl=gsap.timeline({paused:true});window.__timelines={clack:tl};
const duration=26+Number(V.endHold);const product=initClackFilm();
const clamp=x=>Math.max(0,Math.min(1,x)),phase=(t,a,b)=>clamp((t-a)/(b-a)),mix=(a,b,k)=>a+(b-a)*k;
const ease=gsap.parseEase('power2.inOut'),out=gsap.parseEase('power3.out');
const vec=(a,b,k)=>a.map((v,i)=>mix(v,b[i],k));
const movieEvents=[];
function typeEvents(text,start,step){return Array.from(text).map((key,i)=>({key:key.toLowerCase(),at:start+i*step}));}
const intro=typeEvents(V.brand,.2,.25),english=typeEvents('Every key matters.',6.15,.17),pinyinA=typeEvents('luobiwuhui',14.35,.16),pinyinB=typeEvents('ziziliuhen',17.10,.16);
const detail=[{key:'shift_l',at:10.2},{key:' ',at:11.2},{key:'a',at:12.15},{key:'r',at:12.5}];
movieEvents.push(...intro,...english,...detail,...pinyinA,{key:' ',at:16.2},...pinyinB,{key:' ',at:19.2});movieEvents.sort((a,b)=>a.at-b.at);
const sceneNames=[['hook',0],['hero',3],['typing',6],['detail',10],['ime',14],['manuscript',20],['logo',26]];
sceneNames.forEach(([name,t])=>tl.addLabel('scene:'+name,t));

const openingMark=document.querySelector('#opening .bigmark');openingMark.replaceChildren(...Array.from(V.brand).map(letter=>{const span=document.createElement('span');span.textContent=letter;return span;}));
const claim=String(V.headline).split('，');const heroLines=document.querySelectorAll('#hero-copy h1 .line>span');heroLines[0].textContent=claim.length>1?claim[0]+'，':claim[0];heroLines[1].textContent=claim.slice(1).join('，');
document.querySelector('#ime-copy h2').replaceChildren(...String(V.imeTitle||'中文，逐键成章。').split('，').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part+'，')]));
const manuscript=String(V.manuscript).split('，');document.querySelector('.manuscript').replaceChildren(...manuscript.flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part+'，')]));

const panels=['#opening','#hero-copy','#type-copy','#detail-copy','#ime-copy','#paper-caption','#manuscript-card','#paper-actions','#ending','.endnote'];gsap.set(panels,{autoAlpha:0});
gsap.set('#opening',{autoAlpha:1});gsap.set('#opening .bigmark span',{opacity:0,y:32});gsap.set('#opening .eyebrow,#opening p',{opacity:0});
intro.forEach((e,i)=>tl.to('#opening .bigmark span:nth-child('+(i+1)+')',{opacity:1,y:0,duration:.32,ease:'power4.out'},e.at));
tl.to('#opening .eyebrow',{opacity:1,duration:.4},.08).to('#opening p',{opacity:1,duration:.7},1.25).to('#opening',{autoAlpha:0,x:-55,duration:.32,ease:'power2.in'},2.65);
tl.to('#dark-ground',{opacity:0,duration:.65},2.5).to('#intro-shade',{opacity:0,duration:.6},2.5).fromTo('.topline',{opacity:0,y:-10},{opacity:1,y:0,duration:.6,immediateRender:false},3.0);
function showCopy(id,a,b){tl.set(id,{autoAlpha:1},a);tl.fromTo(id,{opacity:0,x:-30},{opacity:1,x:0,duration:.7,ease:'power3.out',immediateRender:false},a);tl.to(id,{autoAlpha:0,x:-35,duration:.28,ease:'power2.in'},b-.28);}
showCopy('#hero-copy',3,6);showCopy('#type-copy',6,10);showCopy('#detail-copy',10,14);showCopy('#ime-copy',14,20);showCopy('#paper-caption',20.4,25.65);
tl.set('#manuscript-card',{autoAlpha:1},21.05).fromTo('#manuscript-card',{x:950,y:-800,rotation:12,scale:.55,opacity:0},{x:0,y:0,rotation:-3,scale:1,opacity:1,duration:1.0,ease:'power3.out',immediateRender:false},21.05);
tl.fromTo('#paper-actions',{opacity:0,y:18},{opacity:1,y:0,duration:.6,immediateRender:false},22.1).to('#paper-actions',{autoAlpha:0,duration:.2},25.3);
tl.to('#manuscript-card',{x:800,y:-380,rotation:5,scale:.6,autoAlpha:0,duration:.72,ease:'power2.in'},25.2);
tl.set('#ending',{autoAlpha:1},26).fromTo('#ending',{opacity:0,y:32},{opacity:1,y:0,duration:.75,ease:'power3.out',immediateRender:false},26).to('.endnote',{autoAlpha:1,duration:.6},26.7);
tl.fromTo('#cta',{opacity:0,y:16},{opacity:1,y:0,duration:.5,immediateRender:false},26.9);
tl.to('#film',{opacity:0,duration:.35},duration-.35);
gsap.set('#chapter-caption',{opacity:0});tl.to('#chapter-caption',{opacity:1,duration:.5},3.3).to('#chapter-caption',{opacity:0,duration:.3},25.4);
let lastMovieTime=0;
function draw(t){
 lastMovieTime=t;
 let text='',composition='',camera=[0,18.5,31.4],look=[0,.8,0],x=300,eject=0,lever=0;
 if(t<3){const k=ease(phase(t,1.6,3));camera=vec([-.4,4.6,8.8],[0,18.5,31.4],k);look=vec([-.4,.4,2.2],[0,.8,0],k);x=mix(355,300,k);text='hello there'.slice(0,Math.max(0,Math.floor((t-.25)*4)));}
 else if(t<6){const k=phase(t,3,6);camera=vec([0,18.5,31.4],[.5,18.1,30.7],k);text='hello there';}
 else if(t<10){const k=ease(phase(t,6,10));camera=vec([0,14,25.5],[.25,12.6,23.8],k);look=[0,1.2,-.1];x=250;text='Every key matters.'.slice(0,english.filter(e=>e.at<=t).length);}
 else if(t<14){x=0;text='Every key matters.';const shot=Math.floor(t-10),k=phase(t,10+shot,11+shot);
 const shots=[{camera:[-4.2,3.8,7.2],look:[-3.7,.28,2.8],name:'圆润长键'}, {camera:[-8.7,4.9,8],look:[-1.6,.32,2.0],name:'前段平整，向后渐升'}, {camera:[0,5.3,5.8],look:[0,.88,-1.1],name:'每一次敲击，机械联动'}, {camera:[9.6,4.8,3.7],look:[5.9,2,-2.2],name:'黑色哑光，细节有光'}];
 const s=shots[shot];camera=s.camera.map((v,i)=>v+(i===0?.22*k:0));look=s.look;document.getElementById('detail-index').textContent='CRAFT / 0'+(shot+1);document.getElementById('detail-name').textContent=s.name;}
 else if(t<20){const k=ease(phase(t,18.8,20));camera=vec([0,18.5,30],[0,17.2,28.8],k);look=[0,1,-.1];x=190;
  if(t<16.2){composition='luobiwuhui'.slice(0,pinyinA.filter(e=>e.at<=t).length);}
  else if(t<19.2){text='落笔无悔，';composition=t>=17.1?'ziziliuhen'.slice(0,pinyinB.filter(e=>e.at<=t).length):'';}
  else text=V.manuscript;
  const second=t>=17.1;document.getElementById('pinyin-value').textContent=composition?formatPinyinPreview(composition):second?'字字留痕':'落笔无悔';document.getElementById('candidate-value').textContent=composition?(second?'1. 字字留痕':'1. 落笔无悔'):'已落墨 · '+(second?'字字留痕。':'落笔无悔，');
 }
 else {text=V.manuscript;camera=[-.3,18.3,30.8];look=[0,.8,0];x=300;
  const pull=out(phase(t,20.5,21.5));const feed=ease(phase(t,25.1,26));eject=pull*(1-feed);lever=-.52*Math.sin(phase(t,20.1,20.5)*Math.PI);
  if(t>=26){camera=vec([-.3,18.3,30.8],[.1,18.1,30.3],phase(t,26,duration));x=350;}
 }
 const inkEvents=t>=6&&t<10?english.filter(e=>e.at<=t):[];const last=inkEvents.at(-1);const recoil=last ? .164*Math.exp(-(t-last.at)*30) : 0;
 document.getElementById('webglStageContainer').style.transform='translateX('+x+'px)';
 product.render({time:t,text,composition,camera,look,eject,lever,recoil,events:movieEvents});
}
OM.clock(tl,draw,duration);OM.region('keyboard',t=>[650,600,1150,390],'真实产品键盘与光效');OM.region('paper',t=>t>=14&&t<20?[1000,280,700,390]:null,'实时纸面拼音');
document.fonts.ready.then(()=>{renderHighResPaperCanvas();draw(lastMovieTime);});
OM.music({bpm:120,ending:'ring',brand:'CLACK'});
movieEvents.forEach((e,i)=>OM.sfx(e.key===' '?'thud':'type',e.at,{gain:e.key===' '?.35:.40,pitch:.93+(i%4)*.035,pan:Math.sin(i)*.16}));
OM.sfx('whoosh',3,{gain:.26});[10,11,12,13].forEach((at,i)=>OM.sfx('tick',at,{gain:.34,pitch:1+i*.1}));OM.sfx('ding',19.2,{gain:.4});OM.sfx('paper',21.2,{gain:.7});OM.sfx('slide',21.55,{gain:.3});OM.sfx('chime',26.15,{gain:.24});
