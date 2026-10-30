const declared=Object.fromEntries(JSON.parse(document.documentElement.dataset.compositionVariables).map(v=>[v.id,v.default]));
const V={...declared,...OM.vars()};for(const [k,v]of Object.entries(V))document.documentElement.style.setProperty('--'+k,v);
document.querySelectorAll('[data-var-text]').forEach(e=>e.textContent=V[e.dataset.varText]);
const tl=gsap.timeline({paused:true});window.__timelines={traveler:tl};
const duration=26+Number(V.endHold),frame=document.getElementById('product');let lastTime=0;
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
let productResolve;window.__hf.buildReady.product=new Promise(resolve=>productResolve=resolve);
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
OM.music({bpm:120});
for(const [id,t]of [['hook',0],['light',4],['turn',7],['flight',9],['clock',12],['burst',13],['angle',16],['home',22],['logo',26]])tl.addLabel('scene:'+id,t);
for(const [name,t,gain]of [['paper',.12,.35],['whoosh',1,.2],['click',4,.3],['sparkle',5.5,.27],['paper',7.4,.55],['slide',9.1,.35],['paper',11.4,.5],['tick',12.6,.4],['tick',13.1,.3],['hit',13.6,.2],['slide',14.1,.25],['hit',14.6,.2],['sparkle',15.1,.22],['whoosh',16.1,.24],['paper',21.5,.5],['click',23.5,.3],['chime',26.5,.27]])OM.sfx(name,t,{gain});
const captions=[['01 / 轻触','轻轻一拉，星球亮起。','风车转动，灯花发光。'],['02 / 翻页','每一页，都有小机关。','沿着书脊，翻开下一段旅程。'],['03 / 探索','五个跨页，一个小宇宙。','星球 · 纸鹤 · 钟表 · 日落 · 回家'],['04 / 视角','换个角度，发现更多。','旋转、俯视、靠近，看清每一层纸景。'],['05 / 回家','走过星河，温柔归来。','最亮的星光，依然在家门前。']];
function draw(t){
lastTime=t;let o={time:t,page:0,mech:0,yaw:-14,pitch:35,distance:21.4,focus:0};
let ci=0,sideShade=0;
if(t<3){o.open=ease((t-.1)/1.6);o.distance=mix(18,23,ease(t/2.2));o.focus=-3.2;sideShade=1;}
else if(t<7){o.mech=ease((t-3.5)/2.2);o.yaw=mix(-14,-21,ease((t-3)/4));o.distance=20.5;o.focus=mix(-3.2,0,ease((t-3)/.8));sideShade=1-ease((t-3)/.8);}
else if(t<8.8){o.turn={from:0,to:1,progress:clamp((t-7)/1.8)};ci=1;}
else if(t<11){o.page=1;o.mech=ease((t-9)/1.2);o.distance=20.5;ci=1;}
else if(t<12.6){o.page=1;o.turn={from:1,to:2,progress:clamp((t-11)/1.6)};ci=1;}
else if(t<16){let n=Math.min(5,Math.floor((t-12.6)/.55));o.page=[2,2,3,3,4,4][n];o.mech=[.3,.9,0,1,0,1][n];o.distance=n%2?18.5:21;o.yaw=n%2?-23:-10;o.pitch=n%2?28:39;ci=2;}
else if(t<21){o.page=4;o.mech=.85;o.yaw=mix(-38,35,ease((t-16)/5));o.pitch=mix(25,61,ease((t-16)/5));o.distance=22.5;ci=3;}
else if(t<23){o.page=4;o.turn={from:4,to:0,progress:clamp((t-21)/2)};o.yaw=mix(35,-14,ease((t-21)/2));o.pitch=mix(61,35,ease((t-21)/2));ci=4;}
else if(t<26){o.mech=ease((t-23)/1.6);o.distance=mix(21.4,20.5,ease((t-23)/3));ci=4;}
else{o.mech=1;o.focus=mix(0,-3.6,ease((t-26)/1.2));o.distance=mix(20.5,24,ease((t-26)/1.2));o.yaw=-14+Math.sin((t-26)*.25)*3;sideShade=ease((t-26)/.8);}
const intro=document.getElementById('intro'),end=document.getElementById('end'),caption=document.getElementById('caption');
intro.style.visibility=t<3.4?'visible':'hidden';intro.style.opacity=ease(t/.65)*(1-ease((t-2.7)/.7));intro.style.transform=`translateY(${(1-ease(t/.8))*30}px)`;
end.style.visibility=t>=26?'visible':'hidden';end.style.opacity=ease((t-26)/.8);end.style.transform=`translateY(${(1-ease((t-26)/.8))*24}px)`;
caption.style.visibility=t>=3.4&&t<26?'visible':'hidden';caption.style.opacity=1;
document.getElementById('chapter').textContent=captions[ci][0];document.getElementById('feature-title').textContent=captions[ci][1];document.getElementById('feature-sub').textContent=captions[ci][2];
document.getElementById('shade').style.opacity=sideShade;
document.getElementById('scene-label').textContent=t>=26?'THE LITTLE TRAVELER':String(o.page+1).padStart(2,'0')+' / 05';
if(frame.contentWindow?.filmReady)frame.contentWindow.filmDraw(o);
}
OM.clock(tl,draw,duration);
const awaitProduct=()=>{if(frame.contentWindow?.filmReady){draw(lastTime);window.filmReady=true;productResolve();}else setTimeout(awaitProduct,50);};
awaitProduct();
OM.region('paper-world',t=>[650,170,1150,710],'纸艺立体书与机关');
OM.region('page-spine',t=>[930,420,100,450],'书脊与翻页');
