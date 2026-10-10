/* SmetaGo — jonli 3D xona (kutubxonasiz, canvas 2D).
 * Room3D(canvas, {autoRotate, onDims}) -> {set({L,W,H,doors,windows}), destroy()}
 * O'lchamlar metrda. Yaqin devorlar "kesilgan" (ichi ko'rinadi), uzoqdagi ikkitasi chiziladi;
 * derazalar uzunroq devorda, eshik ikkinchisida. O'lcham o'zgarsa — silliq o'tadi. Sichqoncha/barmoq
 * bilan aylantiriladi; ekrandan tashqarida va "kamroq harakat" sozlamasida o'zi aylanmaydi.
 */
(function(){
  const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const fmt=v=>(Math.round(v*100)/100).toFixed(2).replace(".",",");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T=0.14; // devor qalinligi, m

  window.Room3D=function(canvas,opts={}){
    const ctx=canvas.getContext("2d");
    const st={L:4.2,W:3.4,H:2.7,tL:4.2,tW:3.4,tH:2.7,doors:[{w:.9,h:2.1}],windows:[{w:1.5,h:1.4}],
      yaw:-0.75,pitch:0.52,auto:opts.autoRotate!==false&&!reduce,idleUntil:0,raf:0,visible:true,drag:null};
    const css=n=>getComputedStyle(canvas).getPropertyValue(n).trim();

    function size(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));return d}

    function draw(){
      const d=size(),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
      const {L,W,H,yaw,pitch}=st;if(!(L>0&&W>0&&H>0))return;
      const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const diag=Math.hypot(L,W),s=Math.min(w/(diag*1.3),h/((diag*sp+H*cp)*1.5)),D=diag*5;
      const ox=w/2,oy=h/2+ (H*cp*s)*0.42;
      const P=(x,y,z)=>{const x1=x*cy-z*sy,z1=x*sy+z*cy,dep=z1*cp+y*sp,f=D/(D-dep);
        return {x:ox+x1*s*f,y:oy-(y*cp-z1*sp)*s*f,d:dep}};
      const poly=(pts,fill,stroke,lw)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
        if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||1;ctx.stroke()}};
      const hx=L/2,hz=W/2,lime=css("--dim")||"#fbbf24",ink=css("--ink")||"#e9f0eb";

      // yaqin tomonlar (kamera tomonidagi devorlar kesiladi, o'lchamlar shu tomonda)
      const nearZ=(P(0,0,hz).d>P(0,0,-hz).d)?hz:-hz, nearX=(P(hx,0,0).d>P(-hx,0,0).d)?hx:-hx;
      // soya: pol va uzoq devorlar tepasining yerga proyeksiyasi (qavariq qobiq)
      const sh=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].flatMap(([x,z])=>[[x,z],[x+H*.9,z+H*.45]]).map(([x,z])=>P(x,0,z));
      const hull=pts=>{pts=pts.slice().sort((a,b)=>a.x-b.x||a.y-b.y);const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
        const lo=[],up=[];for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
        for(const p of pts.reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))};
      poly(hull(sh),"rgba(0,0,0,.34)");

      // pol + plitka (0,6 m)
      const fl=[P(-hx,0,-hz),P(hx,0,-hz),P(hx,0,hz),P(-hx,0,hz)];
      const g=ctx.createLinearGradient(fl[0].x,fl[0].y,fl[2].x,fl[2].y);g.addColorStop(0,"#ddd8cc");g.addColorStop(1,"#c9c3b5");
      poly(fl,g);
      ctx.strokeStyle="rgba(90,80,64,.22)";ctx.lineWidth=Math.max(1,d*.8);ctx.beginPath();
      for(let x=-hx+.6;x<hx-.01;x+=.6){const a=P(x,0,-hz),b=P(x,0,hz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}
      for(let z=-hz+.6;z<hz-.01;z+=.6){const a=P(-hx,0,z),b=P(hx,0,z);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}ctx.stroke();

      // uzoqdagi ikki devor: ichki tomoni kameraga qaragan
      const walls=[
        {a:[-hx,-hz],b:[hx,-hz],n:[0,1],len:L,far:nearZ>0},   // z = -W/2
        {a:[hx,hz],b:[-hx,hz],n:[0,-1],len:L,far:nearZ<0},    // z = +W/2
        {a:[-hx,hz],b:[-hx,-hz],n:[1,0],len:W,far:nearX>0},   // x = -L/2
        {a:[hx,-hz],b:[hx,hz],n:[-1,0],len:W,far:nearX<0}     // x = +L/2
      ].filter(v=>v.far);
      walls.sort((p,q)=>P((p.a[0]+p.b[0])/2,H/2,(p.a[1]+p.b[1])/2).d-P((q.a[0]+q.b[0])/2,H/2,(q.a[1]+q.b[1])/2).d);
      const winWall=walls.reduce((m,v)=>v.len>m.len?v:m,walls[0]);
      const light=[.55,.35];
      walls.forEach(v=>{
        const [ax,az]=v.a,[bx,bz]=v.b,[nx,nz]=v.n,k=.82+.18*Math.abs(nx*light[0]+nz*light[1]);
        const c=Math.round(233*k),col=`rgb(${c},${Math.round(c*.985)},${Math.round(c*.955)})`;
        poly([P(ax,0,az),P(bx,0,bz),P(bx,H,bz),P(ax,H,az)],col,"rgba(0,0,0,.08)");
        // qalinlik: tepa yuzasi
        const ox_=-nx*T,oz_=-nz*T;
        poly([P(ax,H,az),P(bx,H,bz),P(bx+ox_,H,bz+oz_),P(ax+ox_,H,az+oz_)],"#f4f2ee","rgba(0,0,0,.12)");
        const at=(u,y)=>P(lerp(ax,bx,u),y,lerp(az,bz,u)),len=v.len;
        const open=(u0,u1,y0,y1,kind)=>{
          const q=[at(u0,y0),at(u1,y0),at(u1,y1),at(u0,y1)];
          if(kind==="win"){const gg=ctx.createLinearGradient(q[3].x,q[3].y,q[1].x,q[1].y);gg.addColorStop(0,"#3c5552");gg.addColorStop(.55,"#1f2d2b");gg.addColorStop(1,"#2e4441");
            poly(q,gg,"#9c6b3a",Math.max(2,d*2.2));const m1=at((u0+u1)/2,y0),m2=at((u0+u1)/2,y1);ctx.beginPath();ctx.moveTo(m1.x,m1.y);ctx.lineTo(m2.x,m2.y);ctx.stroke();
            poly([at(u0-.02,y0),at(u1+.02,y0),at(u1+.02,y0-.05),at(u0-.02,y0-.05)],"#b07c45")}
          else{poly(q,"#a8743f","#7d5028",Math.max(1.5,d*1.5));const kn=at(u0+(u1-u0)*.82,y1*.48);ctx.fillStyle="#e7c27a";ctx.beginPath();ctx.arc(kn.x,kn.y,Math.max(1.5,d*1.6),0,TAU);ctx.fill()}};
        if(v===winWall){const ws=st.windows.slice(0,3),n=ws.length;
          ws.forEach((o,i)=>{const ww=Math.min(o.w,len/(n+.5)),uc=(i+1)/(n+1);open(uc-ww/len/2,uc+ww/len/2,.9,Math.min(H-.15,.9+o.h),"win")})}
        else st.doors.slice(0,2).forEach((o,i)=>{const dw=Math.min(o.w,len*.4),uc=.3+i*.4;open(uc-dw/len/2,uc+dw/len/2,0,Math.min(H-.1,o.h),"door")});
      });

      // o'lcham chiziqlari (lime): uzunlik va en — yaqin qirralar bo'ylab, balandlik — yaqin burchakda
      const off=.5,dot=Math.max(2.5,d*2.4);ctx.lineWidth=Math.max(1.5,d*1.4);ctx.strokeStyle=lime;ctx.fillStyle=lime;
      const line=(a,b)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()};
      const tick=p=>{ctx.beginPath();ctx.arc(p.x,p.y,dot,0,TAU);ctx.fill()};
      const label=(p,t)=>{ctx.font=`600 ${Math.round(11.5*d)}px "JetBrains Mono",ui-monospace,monospace`;const tw=ctx.measureText(t).width+10*d,th=18*d;
        ctx.fillStyle="rgba(10,14,10,.78)";ctx.beginPath();ctx.roundRect?ctx.roundRect(p.x-tw/2,p.y-th/2,tw,th,5*d):ctx.rect(p.x-tw/2,p.y-th/2,tw,th);ctx.fill();
        // yozuv to'q "tabletka"da — har doim ochiq lime (kunduzgi rejimdagi to'q --dim bu fonda o'qilmasdi)
        ctx.fillStyle="#fde68a";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t,p.x,p.y+.5*d);ctx.fillStyle=lime};
      const sz=Math.sign(nearZ),sx=Math.sign(nearX);
      const a1=P(-hx,0,nearZ+sz*off),b1=P(hx,0,nearZ+sz*off);line(P(-hx,0,nearZ),a1);line(P(hx,0,nearZ),b1);line(a1,b1);tick(a1);tick(b1);
      const a2=P(nearX+sx*off,0,-hz),b2=P(nearX+sx*off,0,hz);line(P(nearX,0,-hz),a2);line(P(nearX,0,hz),b2);line(a2,b2);tick(a2);tick(b2);
      const c0=P(nearX+sx*off*.6,0,nearZ+sz*off*.6),c1=P(nearX+sx*off*.6,H,nearZ+sz*off*.6);line(c0,c1);tick(c0);tick(c1);
      label(P(0,0,nearZ+sz*off),fmt(L)+" m");label(P(nearX+sx*off,0,0),fmt(W)+" m");label(P(nearX+sx*off*.6,H*.78,nearZ+sz*off*.6),fmt(H)+" m");  // yuqoriroqda — en yorlig'i bilan ustma-ust tushmasin
    }

    function frame(t){st.raf=0;let moving=false;
      for(const k of ["L","W","H"]){const tk="t"+k;if(Math.abs(st[k]-st[tk])>.002){st[k]=lerp(st[k],st[tk],.18);moving=true}else st[k]=st[tk]}
      if(st.auto&&!st.drag&&performance.now()>st.idleUntil){st.yaw+=.0035;moving=true}
      draw();if(opts.onDims)opts.onDims(st.L,st.W,st.H);
      if(moving&&st.visible&&!document.hidden)st.raf=requestAnimationFrame(frame)}
    const kick=()=>{if(!st.raf)st.raf=requestAnimationFrame(frame)};

    canvas.style.touchAction="pan-y";canvas.style.cursor="grab";
    canvas.addEventListener("pointerdown",e=>{st.drag={x:e.clientX,y:e.clientY,yaw:st.yaw,pitch:st.pitch};canvas.setPointerCapture(e.pointerId);canvas.style.cursor="grabbing"});
    canvas.addEventListener("pointermove",e=>{if(!st.drag)return;st.yaw=st.drag.yaw-(e.clientX-st.drag.x)*.01;
      st.pitch=clamp(st.drag.pitch+(e.clientY-st.drag.y)*.005,.22,1.05);draw()});
    const up=()=>{if(!st.drag)return;st.drag=null;st.idleUntil=performance.now()+4000;canvas.style.cursor="grab";kick()};
    canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);
    const ro=new ResizeObserver(()=>draw());ro.observe(canvas);
    const io=new IntersectionObserver(es=>{st.visible=es[0].isIntersecting;if(st.visible)kick()});io.observe(canvas);
    const vis=()=>{if(!document.hidden)kick()};document.addEventListener("visibilitychange",vis);

    kick();
    return {
      set(p){if(p.L>0)st.tL=clamp(p.L,.5,60);if(p.W>0)st.tW=clamp(p.W,.5,60);if(p.H>0)st.tH=clamp(p.H,1.8,12);
        if(p.doors)st.doors=p.doors.filter(o=>o.w>0&&o.h>0);if(p.windows)st.windows=p.windows.filter(o=>o.w>0&&o.h>0);kick()},
      rotate(on){st.auto=on&&!reduce;kick()},
      destroy(){cancelAnimationFrame(st.raf);ro.disconnect();io.disconnect();document.removeEventListener("visibilitychange",vis)}
    };
  };
})();
