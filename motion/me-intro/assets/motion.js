(() => {
  const V = OM.vars();
  const products = [
    {folder:'bead-film',name:'豆物 BEAD STUDIO',line:'把喜欢的照片，拼成一颗颗 3D 拼豆。',category:'03 / 图片转 3D 拼豆',portrait:true,source:5.1,rate:1.25},
    {folder:'city-dazi-film',name:'城市搭子',line:'给周末找一个舒服的 3–5 人小局。',category:'04 / 低压力同城社交',portrait:true,source:8,rate:1},
    {folder:'creator-film',name:'3D 主页大片',line:'把自己的主页，拍成有运镜的宣传片。',category:'05 / 个人频道视频工作台',source:7,rate:1.4},
    {folder:'yixu-outfits-film',name:'衣序 YIXU',line:'同一个人，六种穿搭的可能。',category:'06 / AI 穿搭与商品创作',source:8,rate:3.3},
    {folder:'fx-film',name:'FX VFX STUDIO',line:'让一张照片，拥有自己的特效现场。',category:'07 / 浏览器视觉特效',source:6,rate:1.6},
    {folder:'little-traveler-film',name:'星星上的小旅人',line:'翻开一页，遇见一个小宇宙。',category:'01 / 互动纸艺立体书',source:9,rate:1},
    {folder:'clack-launch-film',name:'CLACK 打字机',line:'每一声敲击，落在纸上。',category:'02 / 3D 机械打字机',source:7,rate:1}
  ];
  const frames = [], drivers = [];
  const holder = document.querySelector('#products');
  const index = document.querySelector('.project-index');
  products.forEach((p,i) => {
    const frame = document.createElement('div');
    frame.className = 'product-frame' + (p.portrait?' portrait':'');
    frame.dataset.omId = 'actual-film-'+p.folder;
    frame.setAttribute('data-layout-allow-occlusion','');
    const iframe = document.createElement('iframe');
    iframe.title = p.name+' · 原始 HTML 动画';
    const w = p.portrait?1080:1920, h = p.portrait?1920:1080;
    iframe.width=w; iframe.height=h;
    iframe.style.width=w+'px'; iframe.style.height=h+'px';
    iframe.style.transform='scale('+(p.portrait?448/1080:976/1920)+')';
    frame.append(iframe); holder.append(frame); frames.push(frame);
    const dot = document.createElement('i'); index.append(dot);
    drivers.push(new Promise((resolve,reject) => {
      iframe.onload = async () => {
        try {
          const win=iframe.contentWindow;
          await win.document.fonts.ready;
          await win.__filmAssetsReady;
          await Promise.all([...win.document.images].map(img => img.decode?.().catch(()=>{})));
          const timeline=Object.values(win.__timelines || {})[0];
          if(!timeline) throw new Error(p.folder+' has no original timeline');
          timeline.pause(0);
          const film=win.document.querySelector('[data-composition-id]');
          film.style.width=w+'px'; film.style.height=h+'px'; film.dataset.ready='true';
          resolve({win,timeline});
        } catch(error) {reject(error);}
      };
      iframe.onerror=()=>reject(new Error('Could not load '+p.folder));
      iframe.src='assets/films/'+p.folder+'/index.html';
    }));
  });
  const segments = [
    {start:14,end:18,index:0,offset:5.1,rate:1.25},
    {start:18,end:22,index:3,offset:8,rate:3.3},
    {start:22,end:24,index:4,offset:6,rate:1.6},
    {start:24,end:26,index:2,offset:7,rate:1.4},
    ...products.map((p,i)=>({start:26+i*.5,end:26.5+i*.5,index:i,offset:p.source,rate:1}))
  ];
  const preparation = Promise.all([window.createOriginalScene(document.querySelector('#stage')),Promise.all(drivers)]).then(([scene,films])=>{
    const tl=gsap.timeline({paused:true});
    const S=scene.shot;
    gsap.set('.hook,.bio,.bio-shade,.shelf-caption,.ending,.project-caption,.project-index',{autoAlpha:0});
    gsap.set('.hero-shade',{autoAlpha:1});
    tl.addLabel('scene:hook',0).addLabel('scene:bio',4).addLabel('scene:shelf',10)
      .addLabel('scene:bead',14).addLabel('scene:outfits',18).addLabel('scene:fx',22)
      .addLabel('scene:creator',24).addLabel('scene:montage',26).addLabel('scene:end',30);
    tl.fromTo(S,{extract:.18,cz:56,spin:-1.5},{extract:1,cz:62,spin:-1.05,duration:1.4,ease:'power3.out',immediateRender:false},0);
    tl.fromTo('.hook',{autoAlpha:0,y:45},{autoAlpha:1,y:0,duration:.65,ease:'power3.out',immediateRender:false},.3);
    tl.to('.hook',{autoAlpha:0,y:-24,duration:.25},3.65);
    tl.set(S,{extract:0,board:1,cx:-5,cy:9,cz:42,tx:-5,ty:9,tz:-8,mascot:1},4);
    tl.to(S,{cz:39,duration:5.5,ease:'none'},4);
    tl.set('.bio-shade',{autoAlpha:1},4);
    tl.set('.hero-shade',{autoAlpha:0},4);
    tl.fromTo('.bio',{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.6,ease:'power3.out',immediateRender:false},4.1);
    tl.to('.bio,.bio-shade',{autoAlpha:0,duration:.3},7.7);
    tl.set(S,{board:0,cx:63,cy:1,cz:69,tx:63,ty:1,tz:-6},10);
    tl.fromTo('.shelf-caption',{autoAlpha:0,x:-25},{autoAlpha:1,x:0,duration:.5,ease:'power3.out',immediateRender:false},10.1);
    tl.to(S,{cx:66,tx:66,cz:66,duration:3.5,ease:'power1.inOut'},10);
    tl.to('.shelf-caption',{autoAlpha:0,duration:.25},13.65);
    tl.set(S,{detail:1,extract:1,cx:76,tx:76,cy:1,ty:1,cz:54,spin:-1.05},14);
    tl.set('.project-caption,.project-index',{autoAlpha:1},14);
    tl.set('.project-caption,.project-index',{autoAlpha:0},29.5);
    tl.set(S,{detail:0,extract:0,index:0,cx:89,tx:89,cy:1,ty:1,cz:68,mascot:1},29.5);
    tl.set('.hero-shade',{autoAlpha:1},29.5);
    tl.to(S,{cx:88,tx:88,cz:65,duration:2,ease:'power2.inOut'},29.5);
    tl.fromTo('.ending',{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.7,ease:'power3.out',immediateRender:false},30);
    tl.to({}, {duration:V.endHold},30);
    let last=-1;
    function draw(t){
      const seg=segments.find(s=>t>=s.start && t<s.end);
      const n=seg?seg.index:-1;
      // The canvas clock is inserted at t=0, before later GSAP state setters.
      // Derive the complete camera/pose from time so jumps and playback agree.
      Object.assign(S,{cx:76,cy:1,cz:62,tx:76,ty:1,tz:-6,board:0,detail:0,extract:0,index:0,spin:-1.05,mascot:1});
      if(t<4){
        const p=gsap.parseEase('power3.out')(Math.min(1,t/1.4));
        Object.assign(S,{cz:56+6*p,extract:.18+.82*p,spin:-1.5+.45*p});
      }else if(t<10){
        Object.assign(S,{board:1,cx:-5,cy:9,cz:42-Math.min(1,(t-4)/5.5)*3,tx:-5,ty:9,tz:-8});
        const p=gsap.parseEase('power2.inOut')(Math.max(0,Math.min(1,(t-7.7)/1.8)));
        Object.assign(S,{cx:-5+5*p,tx:-5+5*p,cy:9-7.4*p,ty:9-7.4*p,cz:S.cz+(64-S.cz)*p});
      }else if(t<14){
        const p=gsap.parseEase('power1.inOut')(Math.min(1,(t-10)/3.5));
        Object.assign(S,{cx:63+3*p,tx:63+3*p,cz:69-3*p});
      }else if(t<29.5){
        Object.assign(S,{detail:1,extract:1,cz:54});
      }else{
        const p=gsap.parseEase('power2.inOut')(Math.min(1,(t-29.5)/2));
        Object.assign(S,{cx:89-p,tx:89-p,cz:68-3*p});
      }
      if(n!==last){
        frames.forEach((frame,i)=>frame.style.visibility=i===n?'visible':'hidden');
        [...index.children].forEach((dot,i)=>dot.classList.toggle('active',i===n));
        if(n>=0){
          const p=products[n];
          document.querySelector('#project-category').textContent=p.category;
          document.querySelector('#project-title').textContent=p.name;
          document.querySelector('#project-tagline').textContent=p.line;
          document.querySelector('.project-caption').classList.toggle('portrait',!!p.portrait);
        }
        last=n;
      }
      if(seg){
        S.index=scene.books.findIndex(book=>book.films?.some(film=>film.src.includes('/'+products[n].folder+'/')));
        const filmTime=Math.min(films[n].timeline.duration()-.02,seg.offset+(t-seg.start)*seg.rate);
        films[n].timeline.pause().time(filmTime,false);
        S.spin=-1.05+Math.sin((t-seg.start)*.6)*.055;
      }
      scene.draw(t);
    }
    OM.music({bpm:120});
    for(const [effect,time,gain] of [['paper',.5,.6],['thud',1,.55],['click',4,.4],['whoosh',10,.55],['paper',11,.4],['paper',12,.4],['impact',14,.55],['slide',18,.6],['hit',22,.5],['whoosh',24,.5],['hit',26,.5],['tick',26.5,.5],['tick',27,.5],['tick',27.5,.5],['tick',28,.5],['tick',28.5,.5],['tick',29,.5],['chime',30.5,.5]]) OM.sfx(effect,time,{gain});
    OM.clock(tl,draw,tl.duration());
    OM.region('original-books',t=>(t<4 || t>=10)?[80,130,760,780]:null,'原站 3D 书本与人偶');
    OM.region('actual-profile-card',t=>t>=4&&t<10?[30,220,1070,650]:null,'原站个人简介卡片');
    window.__timelines=window.__timelines||{};
    window.__timelines['me-intro']=tl;
    window.__introReady=true;
    draw(0);
  }).catch(error=>{
    window.__introError=error.message;
    console.error('Original scene preparation failed:',error);
    throw error;
  });
  if (OM.ready) OM.ready(preparation);
  else {
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady.intro = preparation;
  }
})();
