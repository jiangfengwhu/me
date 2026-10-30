    window.onload=async function(){
      initPaperArchitecture();await loadIllustrations();
      starParticles.visible=false;audio.enabled=false;
      window.filmDraw=function(o){
        const t=o.time||0,m=o.mech||0;
        turnState=null;isTurningPage=false;
        spreads.forEach((s,i)=>{
          s.group.visible=false;
          s.halves.forEach((h,k)=>{h.visible=true;h.rotation.z=0;h.position.y=0;bendPaper(s,k,0);});
          resetPaperMaterial(s);showPaperContents(s,true);applySpreadFolding(s,1);
        });
        currentSpreadIdx=o.page||0;
        const s=spreads[currentSpreadIdx];s.group.visible=true;
        leftPageSurface.material=rightPageSurface.material=pageMaterials[currentSpreadIdx];
        magicPointLight.color.setHex(0xffc469);magicPointLight.intensity=0;
        if(o.turn){
          turnState={old:spreads[o.turn.from],next:spreads[o.turn.to],direction:o.turn.to>o.turn.from?1:-1};
          leftPageSurface.material=rightPageSurface.material=pageMaterials[o.turn.to];
          renderTurn(o.turn.progress);
        }else{
          applySpreadFolding(s,o.open??1);s.mechValue=m;
          if(s.pullTab){const tab=s.pullTab.userData.tabMesh;tab.position.x=s.pullTab.userData.baseX+(tab.userData.mechType==='slideH'?m*1.35:0);tab.position.z=s.pullTab.userData.baseZ+(tab.userData.mechType==='pullV'?m*.9:0);}
          if(currentSpreadIdx===0){const r=s.refs;r.bladesMesh.rotation.z=-t*.7-m*.5;r.flower.scale.setScalar(1+m*.16);magicPointLight.intensity=m*2;}
          if(currentSpreadIdx===1){const r=s.refs;r.crane.position.y=.03+m*1.15;r.crane.rotation.z=Math.sin(t*4)*.06;r.kite.position.y=.03+m*.75;r.cloudBack.position.x=r.cloudBack.userData.basePos.x+m*.3;r.cloudMid.position.x=r.cloudMid.userData.basePos.x-m*.3;}
          if(currentSpreadIdx===2){s.refs.dialMesh.rotation.z=-m*2;s.refs.gearMeshes.forEach((g,i)=>g.rotation.z=(i%2?-1:1)*(t*.5+m*2));}
          if(currentSpreadIdx===3){const r=s.refs;r.sun.userData.mesh.position.y=1.45-m*2.15;r.moon.userData.mesh.position.y=-.65+m*2.1;magicPointLight.color.lerpColors(new THREE.Color(0xff9442),new THREE.Color(0x6e98ff),m);magicPointLight.intensity=.6+m*.3;}
          if(currentSpreadIdx===4){const r=s.refs;r.bladesMesh.rotation.z=-t*.8;r.leftPetal.rotation.z=m*.42;r.rightPetal.rotation.z=-m*.42;r.leftPetal.position.x=r.leftPetal.userData.basePos.x-m*.45;r.rightPetal.position.x=r.rightPetal.userData.basePos.x+m*.45;r.centerFlower.scale.set(1+m*.22,1+m*.22,1);magicPointLight.intensity=.4+m*2.4;}
        }
        bookGroup.rotation.y=THREE.MathUtils.degToRad(o.yaw??-14);
        const pitch=THREE.MathUtils.degToRad(o.pitch??35),distance=o.distance??21.4,focus=o.focus??0;
        camera.position.set(focus,Math.sin(pitch)*distance+.9,Math.cos(pitch)*distance+.2);
        camera.lookAt(focus,.95,.2);renderer.render(scene,camera);
      };
      window.filmReady=true;
      window.filmDraw({page:0,open:0,time:0,yaw:-14,distance:20.5});
    };
