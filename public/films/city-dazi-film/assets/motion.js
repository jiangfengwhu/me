/* Every frame is a pure function of timeline time, including direct seeking. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const V = {brand:'城市搭子',accent:'#3859ff',highlight:'#f5fb85',endHold:2,...OM.vars()};
  const D = 20 + Number(V.endHold);
  document.documentElement.style.setProperty('--accent', V.accent);
  document.documentElement.style.setProperty('--highlight', V.highlight);
  const tl = gsap.timeline({paused:true});
  window.__timelines = {film:tl};
  const scenes = [['hook',0],['preferences',4],['match',8],['montage',10],['guide',12],['saved',16],['end',18]];
  scenes.forEach(([name,t]) => tl.addLabel('scene:'+name,t));
  OM.music({bpm:120,product:'consumer',drop:8,ending:18});
  [['pop',.5],['pop',1],['pop',2],['whoosh',3.8],['click',4.5],['click',5],['tick',5.6],['click',6],['click',7],['ding',8],['tick',10],['tick',10.5],['tick',11],['tick',11.5],['pop',12.4],['click',13],['tick',14],['ding',16.25],['whoosh',18],['pop',19.25]].forEach(([s,t]) => OM.sfx(s,t,{gain:s==='whoosh'?.26:.4}));
  const clamp = n => Math.max(0,Math.min(1,n));
  const p = (t,a,d=.45) => clamp((t-a)/d);
  const ease = x => 1-Math.pow(1-x,3);
  const smooth = x => x*x*(3-2*x);
  const fade = (t,a,b,d=.3) => smooth(p(t,a,d))*(1-smooth(p(t,b-d,d)));
  const set = (sel,o,tr) => { const el=typeof sel==='string'?$(sel):sel; el.style.opacity=o; if(tr!==undefined)el.style.transform=tr; };
  // All four images exist in the DOM before capture; montage never races an image request.
  const photo = $('#event-photo');
  const wrap = document.createElement('div'); wrap.className='event-photo';wrap.id='event-photo';
  ['coffee','walk','gallery','games'].forEach(name => {const img=document.createElement('img');img.src='assets/'+name+'.jpg';img.id='photo-'+name;img.alt='兴趣活动氛围示意';wrap.appendChild(img);});
  photo.replaceWith(wrap);
  const style=document.createElement('style');style.textContent='.event-photo{position:relative;overflow:hidden}.event-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.brandmark,.form-submit,.event-button,.flood,.slider-fill,.slider-knob{background:var(--accent)}.headline em,.headline .eyebrow{color:var(--accent)}.end h2 em{color:var(--highlight)}.end-cta,.interest-paper.paper-coffee,.skip-pill,.photo-category{background:var(--highlight)}.brandname small,.brandline>span,.shell-header span,.muted,.form-label small,.form-chip,.form-fine,.event-info,.event-footer small,.timeline-item p,.save-description,.ticket p,.save-fine,.caption small,.footer{color:#5c6d88}.empty-weekend strong,.empty-weekend small{color:#61718e}.guide-bottom{color:#666d3b}.end-fine{color:#fff}';document.head.appendChild(style);
  const events = {
    coffee:['周末不赶路，<br>喝杯咖啡再说','慢热友好 · 允许安静','▦ 10/24 周六 14:00–15:30<br>⌖ 三里屯附近 · 0.8 km（示例）<br>AA 预估 ¥35–65 / 人'],
    walk:['把耳机摘下，<br>一起走一小段','城市散步 · 边走边聊','▦ 周末下午 · 约 90 分钟<br>⌖ 城市公共步道（示例）<br>轻松出门 · 不用赶路'],
    gallery:['一起看展，<br>也可以各自发呆','看展同游 · 不用很懂','▦ 周末下午 · 约 90 分钟<br>⌖ 城市公共展馆（示例）<br>有话聊，也留一点安静'],
    games:['从一局桌游，<br>认识新的朋友','桌游新手 · 一起学就好','▦ 周末下午 · 约 90 分钟<br>⌖ 公共桌游空间（示例）<br>新手友好 · 轻松开局']
  };
  let activeEvent='';
  const cursorStops=[[4,700,1300],[4.42,250,825],[4.65,250,825],[4.95,670,967],[5.15,670,967],[5.45,409,1112],[5.65,221,1112],[5.95,560,1310],[6.2,560,1310],[6.9,690,1470],[7.25,690,1470]];
  function draw(t) {
    const stage=t<4?'hook':t<8?'preferences':t<12?'match':t<16?'guide':'saved';
    const starts={hook:0,preferences:4,match:8,guide:12,saved:16};
    const ends={hook:4,preferences:8,match:12,guide:16,saved:18.2};
    Object.keys(starts).forEach(s=>{
      const enter=ease(p(t,starts[s],.42));
      set('#h-'+s,fade(t,starts[s],ends[s],.3),'translateY('+(1-enter)*35+'px)');
      set('#v-'+s,fade(t,starts[s]+.08,ends[s],.25),'translateY('+(1-enter)*55+'px)');
    });
    const headers={hook:['我的周末','北京 · 生活慢一点'],preferences:['找个合拍的小局','兴趣 / 时间 / 距离 / 电量'],match:['为你挑选的兴趣小局','示例活动 · 按偏好筛选'],guide:['出门前，心里有底','可编辑话题与行程模板'],saved:['我的日程','本机体验 · 非真实预约']};
    $('#shell-name').textContent=headers[stage][0];$('#shell-meta').textContent=headers[stage][1];
    const enter=ease(p(t,.15,.7));
    const scenePulse = [4,8,12,16].reduce((sum,x)=>sum+.012*Math.sin(Math.PI*p(t,x,.45)),0);
    set('.shell',enter,'translateY('+((1-enter)*155)+'px) rotate('+(-3*(1-ease(p(t,3.5,.5))))+'deg) scale('+(1+scenePulse)+')');
    [[$('.paper-coffee'),.65,-5],[$('.paper-walk'),1.65,5],[$('.paper-question'),2.55,-3]].forEach(([el,a,r])=>{
      const arrival=ease(p(t,a,.5)),leave=ease(p(t,3.5,.4));
      set(el,arrival*(1-leave),'translate('+leave*130+'px,'+((1-arrival)*90-leave*100)+'px) rotate('+r+'deg) scale('+(1-.25*leave)+')');
    });
    $('#coffee-choice').classList.toggle('selected',t>=4.5);
    $('#time-choice').style.background=t>=5?'#edf1ff':'#f7f9fc';
    const distance=ease(p(t,5.35,.3));
    $('#distance-number').textContent=Math.round(10-7*distance)+' km';
    $('.slider-fill').style.transform='scaleX('+(1-.7*distance)+')';
    $('.slider-knob').style.transform='translateX('+(-190*distance)+'px)';
    $('#energy-choice').classList.toggle('selected',t>=6);
    set('.form-submit',1,'scale('+(1-.04*Math.sin(Math.PI*p(t,7,.2)))+')');
    set('.loading-strip',fade(t,7.25,8,.12));
    $('.loading-strip>span').style.transform='rotate('+((t-7.25)*300)+'deg)';
    let a=cursorStops[0],b=a;
    for(let i=1;i<cursorStops.length;i++){b=cursorStops[i];if(t<=b[0])break;a=b;}
    const k=smooth(p(t,a[0],Math.max(.01,b[0]-a[0]))),cx=a[1]+(b[1]-a[1])*k,cy=a[2]+(b[2]-a[2])*k;
    const click=[4.5,5,6,7].reduce((sum,x)=>sum+.2*Math.sin(Math.PI*p(t,x,.2)),0);
    set('.cursor',fade(t,4.15,7.4,.16),'translate('+(cx-690)+'px,'+(cy-1370)+'px) scale('+(1-click)+')');
    const e=t>=10&&t<10.5?'walk':t>=10.5&&t<11?'gallery':t>=11&&t<11.5?'games':'coffee';
    if(e!==activeEvent){activeEvent=e;$('#event-title').innerHTML=events[e][0];$('#photo-category').textContent=events[e][1];$('#event-info').innerHTML=events[e][2];}
    ['coffee','walk','gallery','games'].forEach(name=>set('#photo-'+name,name===e?1:0));
    const mont=t>=10&&t<12?((t-10)%.5):t-8;
    wrap.style.transform='scale('+(1+.025*(1-ease(p(mont,0,.4))))+')';
    set('.event-reasons',t>=10&&t<11.5?0:ease(p(t,8.45,.35)));
    set('.ice-question',ease(p(t,12.3,.4)),'translateY('+(25*(1-ease(p(t,12.3,.4))))+'px)');
    const skip=ease(p(t,13,.35));set('.skip-pill',skip,'rotate('+(7+10*(1-skip))+'deg) scale('+(.7+.3*skip)+')');
    $$('.timeline-item').forEach((el,i)=>{const reveal=ease(p(t,13.8+i*.3,.35));set(el,reveal,'translateY('+25*(1-reveal)+'px)');});
    set('.detail-mini',ease(p(t,13.7,.3)));set('.guide-bottom',ease(p(t,14.6,.3)));
    const saved=ease(p(t,16.15,.4));set('.save-check',saved,'scale('+(.5+.5*saved)+')');
    set('.ticket',ease(p(t,16.35,.4)),'translateY('+35*(1-ease(p(t,16.35,.4)))+'px)');
    $$('.feedback-pills span').forEach((el,i)=>{const q=ease(p(t,16.8+i*.15,.25));set(el,q,'translateY('+20*(1-q)+'px)');});
    const captions={hook:['这次，别又变成“下次吧”。','给城市生活，留一点偶遇。'],preferences:['合拍，先从小小的偏好开始。','选兴趣、时间、距离，再选今天的社交电量。'],match:['先一起做件小事，再慢慢认识彼此。','3–5 人的小局，不必硬聊，不用赶场。'],guide:['有话题，也有不回答的自由。','有具体行程，也有舒服的边界。'],saved:['把一点小期待，放进周末。','局后轻评价：准时、尊重、相处舒服。']};
    $('#caption-main').textContent=captions[stage][0];$('#caption-sub').textContent=captions[stage][1];
    set('.caption',fade(t,starts[stage]+.5,Math.min(18,ends[stage]),.25),'translateY('+20*(1-ease(p(t,starts[stage]+.5,.4)))+'px)');
    const flood=ease(p(t,18,.65));set('.flood',t>=18?1:0,'scale('+(18*flood)+')');
    ['.brandline','.shell','.caption','.footer',...Object.keys(starts).map(s=>'#h-'+s)].forEach(sel=>{$(sel).style.visibility=t>=18.65?'hidden':'visible';});
    set('.end',ease(p(t,18.4,.45)));
    [['.end-logo',18.5],['.end h2',18.7],['.end-note',19.25],['.end-cta',19.6],['.end-fine',19.8]].forEach(([sel,a])=>{const q=ease(p(t,a,.5));set(sel,q,'translateY('+40*(1-q)+'px)');});
    $$('.end-avatars b').forEach((el,i)=>{const q=ease(p(t,18.9+i*.1,.4));set(el,q,'translateY('+35*(1-q)+'px) scale('+(.6+.4*q)+')');});
  }
  OM.clock(tl,draw,D);draw(0);
})();
