export function quantize(pixels,limit){
  // Weighted median cut over a compact histogram, followed by centroid refinement.
  const hist=new Map();for(const p of pixels){if(!p)continue;const key=(p[0]>>3)<<10|(p[1]>>3)<<5|(p[2]>>3);let b=hist.get(key);if(!b){b={sum:[0,0,0],n:0};hist.set(key,b);}b.n++;for(let i=0;i<3;i++)b.sum[i]+=p[i];}
  if(!hist.size)return [];
  const samples=[...hist.values()].map(b=>({rgb:b.sum.map(v=>v/b.n),n:b.n}));
  const describe=items=>{const lo=[255,255,255],hi=[0,0,0];let count=0;for(const b of items){count+=b.n;for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],b.rgb[k]);hi[k]=Math.max(hi[k],b.rgb[k]);}}const ranges=hi.map((v,k)=>(v-lo[k])*[.8,1,.65][k]);const axis=ranges.indexOf(Math.max(...ranges));return{items,count,axis,score:ranges[axis]*Math.sqrt(count)};};
  const boxes=[describe(samples)];while(boxes.length<limit){boxes.sort((a,b)=>b.score-a.score);const idx=boxes.findIndex(b=>b.items.length>1);if(idx<0)break;const box=boxes.splice(idx,1)[0];box.items.sort((a,b)=>a.rgb[box.axis]-b.rgb[box.axis]);let n=0,cut=1;for(let i=0;i<box.items.length-1;i++){n+=box.items[i].n;cut=i+1;if(n>=box.count/2)break;}boxes.push(describe(box.items.slice(0,cut)),describe(box.items.slice(cut)));}
  let colors=boxes.map(b=>{const c=[0,0,0];for(const p of b.items)for(let k=0;k<3;k++)c[k]+=p.rgb[k]*p.n;return c.map(v=>v/b.count);});
  for(let pass=0;pass<5;pass++){const sums=colors.map(()=>[0,0,0,0]);for(const p of samples){const s=sums[nearest(p.rgb,colors)];for(let k=0;k<3;k++)s[k]+=p.rgb[k]*p.n;s[3]+=p.n;}colors=colors.map((c,i)=>sums[i][3]?sums[i].slice(0,3).map(v=>v/sums[i][3]):c);}
  return colors.map(c=>c.map(Math.round));
}
export function nearest(p,colors){let best=0,dist=Infinity;for(let i=0;i<colors.length;i++){const c=colors[i],d=(p[0]-c[0])**2*.3+(p[1]-c[1])**2*.59+(p[2]-c[2])**2*.11;if(d<dist){dist=d;best=i;}}return best;}
export function mapPixels(pixels,colors,w,h,dither){const work=pixels.map(p=>p?p.slice():null),indices=new Int16Array(pixels.length).fill(-1);if(!colors.length)return indices;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,p=work[i];if(!p)continue;const id=nearest(p,colors);indices[i]=id;if(dither){const e=p.map((v,k)=>v-colors[id][k]);for(const [dx,dy,f]of[[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy>=h)continue;const q=work[yy*w+xx];if(q)for(let k=0;k<3;k++)q[k]=Math.max(0,Math.min(255,q[k]+e[k]*f));}}}return indices;}
export const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
