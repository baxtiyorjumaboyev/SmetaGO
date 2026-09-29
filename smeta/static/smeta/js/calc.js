/* SmetaGo — hisob-kitob (ilova va bosh sahifadagi jonli kalkulyator uchun umumiy).
 * i18n.js va data.js dan keyin yuklanadi. Global `S` (settings, prices) chaqiruv paytida o'qiladi:
 * ilovada app.js, bosh sahifada landing.js belgilaydi. Hisob mantig'ini faqat shu yerda o'zgartiring.
 */
/* ---------- helpers ---------- */
const num=v=>{const x=parseFloat(String(v??"").replace(/\s/g,"").replace(",","."));return isFinite(x)?x:0};
const fmt=n=>Math.round(n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ");
const fd=(n,d=2)=>(Math.round((n||0)*10**d)/10**d).toFixed(d).replace(".",",");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sum=a=>a.reduce((x,y)=>x+y,0);
// +/− tugma: inputdagi sonni d ga o'zgartiradi (0 dan kam emas) va "input" hodisasini yuboradi
function stepInput(inp,d){if(!inp)return;const dec=Math.abs(d)<1?2:0;
  const v=Math.max(0,Math.round((num(inp.value)+d)*100)/100);
  inp.value=String(dec?+v.toFixed(dec):Math.round(v)).replace(".",",");
  inp.dispatchEvent(new Event("input",{bubbles:true}))}
const stepper=(inputHtml,id,d)=>`<span class="stp"><button type="button" class="stp-b" data-act="step" data-for="${id}" data-d="${-d}" aria-label="−">−</button>${inputHtml}<button type="button" class="stp-b" data-act="step" data-for="${id}" data-d="${d}" aria-label="+">+</button></span>`;

/* ---------- chizma: xona rejasi o'lcham chiziqlari bilan (L × W, metr) ---------- */
function planSvg(L,W){
  const bw=230,bh=130,x0=18,y0=16;const ok=L>0&&W>0;
  const s=ok?Math.min(bw/L,bh/W):0,w=ok?L*s:bw*.8,h=ok?W*s:bh*.8;
  const yd=y0+h+24,xd=x0+w+24,m=U("m");const t=(v)=>ok?`${fd(v)} ${m}`:"—";
  const arr=(x1,y1,x2,y2)=>`<line class="pl-dim" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-start="url(#pl-a)" marker-end="url(#pl-a)"/>`;
  return `<svg class="plan" viewBox="0 0 ${x0+w+56} ${y0+h+44}" role="img" aria-label="${esc(t(L)+" × "+t(W))}">
   <defs><marker id="pl-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" class="pl-arrow"/></marker></defs>
   <rect class="pl-room" x="${x0}" y="${y0}" width="${w}" height="${h}"/>
   <line class="pl-ext" x1="${x0}" y1="${y0+h+4}" x2="${x0}" y2="${yd+6}"/><line class="pl-ext" x1="${x0+w}" y1="${y0+h+4}" x2="${x0+w}" y2="${yd+6}"/>
   <line class="pl-ext" x1="${x0+w+4}" y1="${y0}" x2="${xd+6}" y2="${y0}"/><line class="pl-ext" x1="${x0+w+4}" y1="${y0+h}" x2="${xd+6}" y2="${y0+h}"/>
   ${arr(x0,yd,x0+w,yd)}${arr(xd,y0,xd,y0+h)}
   <text class="pl-t" x="${x0+w/2}" y="${yd-5}" text-anchor="middle">${esc(t(L))}</text>
   <text class="pl-t" x="${xd-5}" y="${y0+h/2}" text-anchor="middle" transform="rotate(-90 ${xd-5} ${y0+h/2})">${esc(t(W))}</text>
   ${ok?`<text class="pl-a" x="${x0+w/2}" y="${y0+h/2+4}" text-anchor="middle">${fd(L*W)} ${U("m²")}</text>`:""}
  </svg>`}

// eshik: t — turi (DOOR_TYPES, bo'sh = tanlanmagan), w — eni, h — bo'yi (m)
const mkDoor=(t="",w="0,9",h=fd(DOOR_H,1),q="1")=>({t,w,h,q});
// eshik soni (q): bo'sh bo'lsa 1 ta; eshik/deraza maydoni — eni × bo'yi
const doorQ=d=>{const s=String(d.q??"").trim();return s===""?1:num(s)};
const openA=o=>num(o.w)*num(o.h);

/* ---------- calculations ---------- */
function priceStats(p){const v=p.src.map(num).filter(x=>x>0);if(!v.length)return{min:0,max:0,avg:0};return{min:Math.min(...v),max:Math.max(...v),avg:sum(v)/v.length}}
function priceOf(id){const p=S.prices.find(x=>x.id===id);if(!p)return 0;if(p.mode==="manual")return num(p.manual);return priceStats(p)[p.mode]||0}
const MODE_L={avg:tr("o'rtacha"),min:tr("eng arzon"),max:tr("eng qimmat"),manual:tr("qo'lda")};
function srcLabel(id){const p=S.prices.find(x=>x.id===id);return p?tr("{0} narx",MODE_L[p.mode]):""}
const rate=()=>num(S.settings.monthly)/Math.max(1,num(S.settings.hoursMonth));

function roomCalc(r){
  const L=num(r.L),W=num(r.W),H=num(r.H),res=num(S.settings.reserve)/100;
  // qoplamaning o'z o'lchami (fL/fW — pol, wL/wW/wH — devor, cL/cW — shift); bo'sh bo'lsa — xonaniki
  const dim=(v,d)=>String(v??"").trim()!==""?num(v):d;
  const fL=dim(r.fL,L),fW=dim(r.fW,W),wL=dim(r.wL,L),wW=dim(r.wW,W),wH=dim(r.wH,H),cL=dim(r.cL,L),cW=dim(r.cW,W);
  const floorA=fL*fW,perim=2*(fL+fW),ceilA=cL*cW;
  const doorsW=sum(r.doors.map(d=>num(d.w)*doorQ(d)));
  const doorA=sum(r.doors.map(d=>openA(d)*doorQ(d))),winA=sum(r.windows.map(openA));
  const tileLen=num(r.tileLen),tileA=tileLen*num(r.tileH);
  const wallNet=Math.max(0,2*(wL+wW)*wH-doorA-winA);
  // aniq o'lchov + zaxira: "20,00 m² + 10% = 22,00 m²"
  const plusRes=(a,u)=>res>0?` + ${S.settings.reserve}% = ${fd(a*(1+res))} ${U(u)}`:"";
  const plAuto=Math.max(0,perim-doorsW-(r.floor==="kafel"?0:tileLen));
  const ov=String(r.plinthOv??"").trim();const pl=ov!==""?num(ov):plAuto;
  const lines=[];const F=FLOOR[r.floor],Wf=WALL[r.wall],C=CEIL[r.ceil];const m=U("m"),m2=U("m²");
  if(F.pid&&floorA>0)lines.push({name:tr("Pol qoplamasi: {0}",lab(F)),sub:`${fd(fL)} × ${fd(fW)} = ${fd(floorA)} ${m2}${plusRes(floorA,"m²")}`,unit:"m²",qty:floorA*(1+res),price:priceOf(F.pid),hrs:floorA*F.h,src:srcLabel(F.pid),kind:"auto"});
  if(F.pl&&pl>0){const pp=S.prices.find(p=>p.id===F.pl);const piece=num(S.settings.piece)||2.5;
    const qty=pp.u==="dona"?Math.ceil(pl*(1+res)/piece):pl*(1+res);
    const tail=pp.u==="dona"?`${plusRes(pl,"m")} → ${tr("{0} dona × {1} m",qty,fd(piece,1))}`:plusRes(pl,"m");
    lines.push({name:tr("Plintus: {0}",lab(PLINTH_LABEL[F.pl])),sub:(ov!==""?tr("{0} m (qo'lda o'lchangan)",fd(pl)):`${fd(perim)} − ${tr("eshiklar")} ${fd(doorsW)}${tileLen&&r.floor!=="kafel"?" − "+tr("kafel")+" "+fd(tileLen):""} = ${fd(pl)} ${m}`)+tail,unit:pp.u,qty,price:priceOf(F.pl),hrs:pl*.1,src:srcLabel(F.pl),kind:"auto"})}
  const paintA=r.wall==="kafel"?wallNet:Math.max(0,wallNet-tileA);
  const wRes=r.wall==="kafel"||r.wall==="oboy";
  if(Wf.pid&&paintA>0)lines.push({name:tr("Devor: {0}",lab(Wf)),sub:tr("{0} m² (eshik va derazalarsiz)",fd(paintA))+(wRes?plusRes(paintA,"m²"):""),unit:"m²",qty:paintA*(1+(wRes?res:0)),price:priceOf(Wf.pid),hrs:paintA*Wf.h,src:srcLabel(Wf.pid),kind:"auto"});
  if(tileA>0&&r.wall!=="kafel")lines.push({name:tr("Devor: kafel qismi"),sub:`${fd(tileLen)} ${m} × ${fd(num(r.tileH))} ${m} = ${fd(tileA)} ${m2}${plusRes(tileA,"m²")}`,unit:"m²",qty:tileA*(1+res),price:priceOf("kafel_devor"),hrs:tileA*1.1,src:srcLabel("kafel_devor"),kind:"auto"});
  if(C.pid&&ceilA>0)lines.push({name:tr("Shift: {0}",lab(C)),sub:`${fd(cL)} × ${fd(cW)} = ${fd(ceilA)} ${m2}`,unit:"m²",qty:ceilA,price:priceOf(C.pid),hrs:ceilA*C.h,src:srcLabel(C.pid),kind:"auto"});
  return{floorA,perim,ceilA,wallNet,pl,plAuto,doorsW,doorA,winA,lines};
}
function itemLine(it){const q=num(it.qty);const bits=[it.variant,it.dims,it.watt?it.watt+" "+tr("Vt"):"",it.note].filter(Boolean);
  return{name:itemName(it),sub:bits.join(" · "),unit:it.unit,qty:q,price:num(it.price),hrs:q*num(it.h),src:it.custom?tr("qo'lda"):tr("katalog"),kind:it.custom?"own":"item",uid:it.uid}}
function concreteCalc(c){
  const vol=c.mode==="dims"?num(c.L)*num(c.W)*num(c.T):num(c.V);const m=MIX[c.grade]||MIX.M200;
  const k=c.cem==="M400"?1.15:1;const cem=m[0]*k,qum=m[1],sheb=m[2],suv=m[3];const per=`${U("kg")}/${U("m³")}`;
  const lines=[
    {name:tr("Sement"),sub:`${fmt(cem)} ${per} · PC ${c.cem}`,unit:"kg",qty:cem*vol,price:priceOf("sement"),hrs:0,src:srcLabel("sement"),kind:"auto"},
    {name:tr("Shag'al (sheben)"),sub:`${fmt(sheb)} ${per}`,unit:"m³",qty:sheb*vol/num(S.settings.rhoSheben||1400),price:priceOf("sheben"),hrs:0,src:srcLabel("sheben"),kind:"auto"},
    {name:tr("Qum"),sub:`${fmt(qum)} ${per}`,unit:"m³",qty:qum*vol/num(S.settings.rhoQum||1500),price:priceOf("qum"),hrs:0,src:srcLabel("qum"),kind:"auto"},
    {name:tr("Suv"),sub:`${fmt(suv)} ${U("l")}/${U("m³")}`,unit:"m³",qty:suv*vol/1000,price:priceOf("suv"),hrs:0,src:srcLabel("suv"),kind:"auto"},
    {name:tr("Qorishma tayyorlash va quyish"),sub:tr("{0} soat/m³",fd(num(S.settings.concreteHours),1)),unit:"m³",qty:vol,price:0,hrs:vol*num(S.settings.concreteHours),src:tr("ish haqi"),kind:"auto"}
  ];
  const mat=sum(lines.map(l=>l.qty*l.price));
  return{vol,cem,qum,sheb,suv,lines,mat,perM3:vol>0?mat/vol:0};
}
function lineTotals(l){const mat=l.qty*l.price,lab=l.hrs*rate();return{mat,lab,tot:mat+lab}}
