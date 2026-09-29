/* SmetaGo — hisob-kitob yadrosi: yordamchi funksiyalar va formulalar (xona, beton, smeta).
 * Ilova (app.js) ham, bosh sahifadagi kalkulyator (landing.js) ham shu faylni ishlatadi —
 * shuning uchun saytdagi va ilovadagi raqamlar doim bir xil. i18n.js va data.js dan keyin yuklanadi.
 * Funksiyalar global holatni (S: settings, prices, rooms, concrete) chaqirilgan paytda o'qiydi.
 * Formulalar: smetago-project/.../docs/HISOB-QOIDALARI.md
 */
/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const num=v=>{const x=parseFloat(String(v??"").replace(/\s/g,"").replace(",","."));return isFinite(x)?x:0};
const fmt=n=>Math.round(n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ");
const fd=(n,d=2)=>(Math.round((n||0)*10**d)/10**d).toFixed(d).replace(".",",");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sum=a=>a.reduce((x,y)=>x+y,0);
const SOM=tr("so'm");
const rtLabel=k=>(ROOM_TYPES[k]&&ROOM_TYPES[k].l)||tr(k);
// katalog elementi joriy tilda (xonaga qo'shilgan paytdagi nom — zaxira)
const itemName=it=>(it.cid&&CAT_INDEX[it.cid]?CAT_INDEX[it.cid].n:it.name);
// standart sozlamalar (namunaviy va yangi obyekt uchun)
const DEFAULT_SETTINGS={reserve:10,piece:2.5,contingency:5,vat:false,monthly:7030000,hoursMonth:176,rhoSheben:1400,rhoQum:1500,concreteHours:3};

/* ---------- calculations ---------- */
function priceStats(p){const v=p.src.map(num).filter(x=>x>0);if(!v.length)return{min:0,max:0,avg:0};return{min:Math.min(...v),max:Math.max(...v),avg:sum(v)/v.length}}
function priceOf(id){const p=S.prices.find(x=>x.id===id);if(!p)return 0;if(p.mode==="manual")return num(p.manual);return priceStats(p)[p.mode]||0}
const MODE_L={avg:tr("o'rtacha"),min:tr("eng arzon"),max:tr("eng qimmat"),manual:tr("qo'lda")};
function srcLabel(id){const p=S.prices.find(x=>x.id===id);return p?tr("{0} narx",MODE_L[p.mode]):""}
const rate=()=>num(S.settings.monthly)/Math.max(1,num(S.settings.hoursMonth));

function roomCalc(r){
  const L=num(r.L),W=num(r.W),H=num(r.H),res=num(S.settings.reserve)/100;
  const floorA=L*W,perim=2*(L+W),doorsW=sum(r.doors.map(num));
  const doorA=sum(r.doors.map(d=>num(d)*DOOR_H)),winA=sum(r.windows.map(w=>num(w.w)*num(w.h)));
  const tileLen=num(r.tileLen),tileA=tileLen*num(r.tileH);
  const wallNet=Math.max(0,perim*H-doorA-winA);
  const plAuto=Math.max(0,perim-doorsW-(r.floor==="kafel"?0:tileLen));
  const ov=String(r.plinthOv??"").trim();const pl=ov!==""?num(ov):plAuto;
  const lines=[];const F=FLOOR[r.floor],Wf=WALL[r.wall],C=CEIL[r.ceil];const m=U("m"),m2=U("m²");
  if(F.pid&&floorA>0)lines.push({name:tr("Pol qoplamasi: {0}",lab(F)),sub:tr("{0} m² + {1}% zaxira",fd(floorA),S.settings.reserve),unit:"m²",qty:floorA*(1+res),price:priceOf(F.pid),hrs:floorA*F.h,src:srcLabel(F.pid),kind:"auto"});
  if(F.pl&&pl>0){const pp=S.prices.find(p=>p.id===F.pl);const piece=num(S.settings.piece)||2.5;
    const qty=pp.u==="dona"?Math.ceil(pl*(1+res)/piece):pl*(1+res);
    lines.push({name:tr("Plintus: {0}",lab(PLINTH_LABEL[F.pl])),sub:ov!==""?tr("{0} m (qo'lda o'lchangan)",fd(pl)):`${fd(perim)} − ${tr("eshiklar")} ${fd(doorsW)}${tileLen&&r.floor!=="kafel"?" − "+tr("kafel")+" "+fd(tileLen):""} = ${fd(pl)} ${m}`,unit:pp.u,qty,price:priceOf(F.pl),hrs:pl*.1,src:srcLabel(F.pl),kind:"auto"})}
  const paintA=r.wall==="kafel"?wallNet:Math.max(0,wallNet-tileA);
  if(Wf.pid&&paintA>0)lines.push({name:tr("Devor: {0}",lab(Wf)),sub:tr("{0} m² (eshik va derazalarsiz)",fd(paintA)),unit:"m²",qty:paintA*(1+(r.wall==="kafel"||r.wall==="oboy"?res:0)),price:priceOf(Wf.pid),hrs:paintA*Wf.h,src:srcLabel(Wf.pid),kind:"auto"});
  if(tileA>0&&r.wall!=="kafel")lines.push({name:tr("Devor: kafel qismi"),sub:`${fd(tileLen)} ${m} × ${fd(num(r.tileH))} ${m}`,unit:"m²",qty:tileA*(1+res),price:priceOf("kafel_devor"),hrs:tileA*1.1,src:srcLabel("kafel_devor"),kind:"auto"});
  if(C.pid&&floorA>0)lines.push({name:tr("Shift: {0}",lab(C)),sub:`${fd(floorA)} ${m2}`,unit:"m²",qty:floorA,price:priceOf(C.pid),hrs:floorA*C.h,src:srcLabel(C.pid),kind:"auto"});
  return{floorA,perim,wallNet,pl,plAuto,doorsW,lines};
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
function buildSmeta(){
  const groups=[];
  S.rooms.forEach(r=>{const c=roomCalc(r);groups.push({title:r.name,sub:`${fd(num(r.L))} × ${fd(num(r.W))} × ${fd(num(r.H))} ${U("m")}`,lines:[...c.lines,...r.items.map(itemLine)]})});
  S.concrete.forEach(c=>{const k=concreteCalc(c);if(k.vol>0)groups.push({title:tr("Beton: {0}",c.name),sub:`${c.grade}, ${fd(k.vol)} ${U("m³")}`,lines:k.lines})});
  let mat=0,lab=0;groups.forEach(g=>{g.mat=0;g.lab=0;g.lines.forEach(l=>{const t=lineTotals(l);g.mat+=t.mat;g.lab+=t.lab});mat+=g.mat;lab+=g.lab});
  const base=mat+lab,cont=base*num(S.settings.contingency)/100,vat=S.settings.vat?(base+cont)*.12:0;
  return{groups,mat,lab,base,cont,vat,grand:base+cont+vat};
}
