/* SmetaGo — ilova mantig'i: holat (state), hisob-kitob, chizish (render) va hodisalar.
 * i18n.js va data.js dan keyin yuklanadi. Tuzilishi: docs/ARXITEKTURA.md
 * Barcha ko'rinadigan matnlar tr("o'zbekcha matn") orqali (ruscha tarjima — i18n.js),
 * birliklar U("m²") orqali. Holatda (S) hamma kalitlar o'zbekcha saqlanadi.
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

/* ---------- state ---------- */
function mkRoom(type,name,L,W,H){const t=ROOM_TYPES[type]||ROOM_DEFAULT;return{id:uid(),type,name:name||rtLabel(type),L:L??"",W:W??"",H:H??"2,8",doors:["0,9"],windows:[],floor:t.floor,wall:t.wall,ceil:t.ceil,tileLen:"",tileH:"",plinthOv:"",items:[]}}
function mkItem(cid,opt={}){const c=CAT_INDEX[cid];if(!c)return null;const v=c.v&&c.v[opt.vi??0];return{uid:uid(),cid,name:c.n,variant:v?v[0]:"",unit:c.u,qty:opt.qty??1,price:v?v[1]:c.p,h:v&&v[2]!=null?v[2]:c.h,dims:opt.dims||"",watt:opt.watt||"",note:opt.note||"",custom:false}}
function sample(){const sm=" "+tr("sm");
  const m=mkRoom("Mehmonxona",null,"5","4","2,8");m.doors=["0,9","0,9","0,9"];m.windows=[{w:"1,5",h:"1,5"}];
  m.items=[mkItem("svetilnik",{vi:1,qty:4,watt:"12"}),mkItem("lyustra"),mkItem("vyklyuchatel",{vi:1}),mkItem("rozetka",{vi:1,qty:3}),mkItem("divan",{dims:"220×90×85"+sm}),mkItem("kreslo",{qty:2}),mkItem("konditsioner",{vi:1}),mkItem("radiator",{qty:10}),mkItem("vent_panjara")].filter(Boolean);
  const o=mkRoom("Oshxona",null,"3,5","3","2,8");o.doors=["0,8"];o.windows=[{w:"1,2",h:"1,4"}];o.tileLen="3";o.tileH="0,6";
  o.items=[mkItem("gaz_plita"),mkItem("vytyazhka",{vi:0,dims:"60×50×40"+sm}),mkItem("osh_rakovina"),mkItem("smesitel"),mkItem("garnitur",{qty:3}),mkItem("rozetka",{qty:4}),mkItem("vyklyuchatel"),mkItem("svetilnik",{qty:2,watt:"18"}),mkItem("vent_shaxta",{qty:2.8})].filter(Boolean);
  const h=mkRoom("Hammom",null,"2","1,7","2,7");h.doors=["0,7"];
  h.items=[mkItem("unitaz"),mkItem("rakovina"),mkItem("vanna",{dims:"170×70"+sm}),mkItem("smesitel",{qty:2}),mkItem("isitgich"),mkItem("ventilyator",{watt:"25"}),mkItem("svetilnik",{vi:2,qty:3,watt:"7"})].filter(Boolean);
  const own={uid:uid(),cid:null,name:tr("Oyna (hammom uchun)"),variant:"",unit:"dona",qty:1,price:450000,h:.5,dims:"60×80"+sm,watt:"",note:"",custom:true};h.items.push(own);
  return{
    v:1,sample:true,
    obj:{name:tr("Namuna: 2 xonali kvartira, Chilonzor"),region:"Toshkent sh.",quarter:QUARTERS[0]},
    settings:{reserve:10,piece:2.5,contingency:5,vat:false,monthly:7030000,hoursMonth:176,rhoSheben:1400,rhoQum:1500,concreteHours:3},
    prices:defaultPrices(),
    rooms:[m,o,h],
    concrete:[{id:uid(),name:tr("Hovli yo'lagi"),grade:"M200",cem:"M500",mode:"dims",L:"10",W:"1",T:"0,1",V:"",factory:""},{id:uid(),name:tr("Ayvon poydevori"),grade:"M250",cem:"M400",mode:"vol",L:"",W:"",T:"",V:"3,2",factory:"1150000"}],
    ui:{tab:"xonalar",room:m.id,grp:"Tavsiya",q:""}
  };
}
function blank(base,name){const nr=mkRoom("Mehmonxona");return{v:1,sample:false,obj:{name:name||tr("Yangi obyekt"),region:base.obj.region,quarter:base.obj.quarter},settings:base.settings,prices:base.prices,rooms:[nr],concrete:[],ui:{tab:"xonalar",room:nr.id,grp:"Tavsiya",q:""}}}
/* Django orqali ochilganda (window.SMETAGO bor) holat serverdan keladi va serverga saqlanadi.
 * Aks holda (index.html to'g'ridan-to'g'ri ochilsa) avvalgidek localStorage ishlatiladi. */
const SERVER=window.SMETAGO||null;
/* Oflayn navbat: serverga yetib bormagan oxirgi holat qurilmada saqlanadi ({ts, state})
 * va aloqa tiklanganda yuboriladi. Serverdagi nusxa undan yangiroq bo'lsa (boshqa qurilmadan
 * o'zgartirilgan) — navbat e'tiborga olinmaydi. */
const PKEY=SERVER?"smetago-pending:"+SERVER.saveUrl:null;
const readPending=()=>{try{const p=JSON.parse(localStorage.getItem(PKEY));return p&&p.state&&p.state.v===1?p:null}catch(e){return null}};
let S;
if(SERVER){
  let st=null;try{st=JSON.parse($("#smeta-state").textContent)}catch(e){}
  S=st&&st.v===1?st:null;
  const pend=readPending();
  if(pend&&pend.ts>(Date.parse(SERVER.updated)||0))S=pend.state;
  else if(pend){try{localStorage.removeItem(PKEY)}catch(e){}}
  if(!S){S=sample();if(!(st&&st.namuna))S=blank(S,SERVER.name)}
}else{
  try{const raw=localStorage.getItem("smetago-v1");S=raw?JSON.parse(raw):null}catch(e){S=null}
  if(!S||S.v!==1)S=sample();
}
// ma'lumotnomaga keyin qo'shilgan materiallar eski obyektlarda ham paydo bo'lsin
{const have=new Set(S.prices.map(p=>p.id));defaultPrices().forEach(p=>{if(!have.has(p.id))S.prices.push(p)})}
// katalog guruhi nomi tilga bog'liq: til almashganda eski guruh topilmasa — "Tavsiya"
if(S.ui.grp!=="Tavsiya"&&!CATALOG.some(g=>g.g===S.ui.grp))S.ui.grp="Tavsiya";
let saveT=null,offlineNoted=false;
function persist(){saveT=null;const body=JSON.stringify(S);
  if(!SERVER){try{localStorage.setItem("smetago-v1",body)}catch(e){}return}
  const ts=Date.now();try{localStorage.setItem(PKEY,JSON.stringify({ts,state:S}))}catch(e){}
  fetch(SERVER.saveUrl,{method:"PUT",credentials:"same-origin",keepalive:body.length<60000,headers:{"Content-Type":"application/json","X-CSRFToken":SERVER.csrf},body})
   .then(r=>{if(r.status===403||r.redirected)throw new Error("auth");if(!r.ok)throw new Error(r.status)})
   .then(()=>{offlineNoted=false;window.smetagoNet?.(true);const p=readPending();if(p&&p.ts===ts)try{localStorage.removeItem(PKEY)}catch(e){}})
   .catch(e=>{if(e.message==="auth")toast(tr("Sessiya tugagan — qayta kiring"));
     else if(!navigator.onLine||e instanceof TypeError){window.smetagoNet?.(false);if(!offlineNoted){offlineNoted=true;toast(tr("Internet yo'q — o'zgarishlar qurilmada saqlandi"))}}
     else toast(tr("Serverga saqlanmadi, qayta urinib ko'ring"))})}
function save(){clearTimeout(saveT);saveT=setTimeout(persist,SERVER?700:300)}
addEventListener("pagehide",()=>{if(saveT){clearTimeout(saveT);persist()}});
addEventListener("online",()=>{if(SERVER&&readPending()){persist();toast(tr("Aloqa tiklandi — o'zgarishlar yuborilmoqda"))}});
// "online" hodisasi kelmasa ham (Wi-Fi bor, internet yo'q edi) navbat vaqti-vaqti bilan qayta yuboriladi
setInterval(()=>{if(SERVER&&!saveT&&readPending())persist()},30000);
if(SERVER)save();

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

/* ---------- rendering ---------- */
const TABS=[["xonalar",tr("Xonalar va o'lchov")],["beton",tr("Beton")],["narxlar",tr("Narxlar")],["smeta",tr("Smeta")]];
function renderHeader(){
  $("#o-name").value=S.obj.name;
  $("#o-region").innerHTML=REGIONS.map(r=>`<option value="${esc(r)}"${r===S.obj.region?" selected":""}>${esc(tr(r))}</option>`).join("");
  $("#o-quarter").innerHTML=QUARTERS.map(r=>`<option value="${esc(r)}"${r===S.obj.quarter?" selected":""}>${esc(qLabel(r))}</option>`).join("");
  $("#tabs").innerHTML=TABS.map(([k,l])=>`<button class="tab" role="tab" data-act="tab" data-k="${k}" aria-selected="${S.ui.tab===k}">${l}</button>`).join("");
}
function render(){renderHeader();const t=S.ui.tab;
  $("#app").innerHTML=t==="xonalar"?viewRooms():t==="beton"?viewConcrete():t==="narxlar"?viewPrices():viewSmeta();
  if(t==="xonalar"){renderDerived();renderCatItems()}
  renderTotal();save();
}
function curRoom(){return S.rooms.find(r=>r.id===S.ui.room)||S.rooms[0]}
function roomTotal(r){const c=roomCalc(r);return sum([...c.lines,...r.items.map(itemLine)].map(l=>lineTotals(l).tot))}

function viewRooms(){
  const r=curRoom();
  const list=`<aside class="panel roomlist"><ul>${S.rooms.map(x=>`<li><button class="roombtn" data-act="room" data-id="${x.id}" aria-current="${r&&x.id===r.id}"><b>${esc(x.name)}</b><span id="rl-${x.id}">${fmt(roomTotal(x))} ${SOM}</span></button></li>`).join("")}</ul>
   <div class="addroom"><select class="inp" id="newType" aria-label="${tr("Xona turi")}">${Object.keys(ROOM_TYPES).map(k=>`<option value="${esc(k)}">${esc(rtLabel(k))}</option>`).join("")}</select><button class="btn pri" data-act="addRoom">${tr("+ Xona qo'shish")}</button></div></aside>`;
  if(!r)return `<div class="layout">${list}<section class="panel pad empty">${tr("Xona qo'shing — o'lchamlarni kiritgach, hisob avtomatik chiqadi.")}</section></div>`;
  const opt=(o,cur)=>Object.entries(o).map(([k,v])=>`<option value="${k}"${k===cur?" selected":""}>${esc(lab(v))}</option>`).join("");
  const edit=`<section class="stack">
   ${S.sample?`<div class="hint">${tr("Bu namunaviy obyekt: 3 xona va 2 ta beton ishi bilan to'ldirilgan. O'zingiznikini boshlash uchun")} <button class="btn sm" data-act="reset">${S.ui.confirmReset?tr("Tasdiqlang: hammasi o'chadi"):tr("Yangi obyekt")}</button></div>`:""}
   <div class="panel pad stack">
    <div class="roomhead"><input id="r-name" data-f="name" value="${esc(r.name)}" aria-label="${tr("Xona nomi")}"><span class="tag">${esc(rtLabel(r.type))}</span><button class="btn ghost sm" data-act="delRoom">${S.ui.confirmDel===r.id?tr("O'chirishni tasdiqlang"):tr("Xonani o'chirish")}</button></div>
    <fieldset><legend class="eyebrow">${tr("O'lchamlar, metr")}</legend>
     <div class="grid3">
      <label class="fld">${tr("Uzunligi")}<input class="inp numin" id="r-L" data-f="L" inputmode="decimal" value="${esc(r.L)}" placeholder="0,00"></label>
      <label class="fld">${tr("Eni")}<input class="inp numin" id="r-W" data-f="W" inputmode="decimal" value="${esc(r.W)}" placeholder="0,00"></label>
      <label class="fld">${tr("Balandligi")}<input class="inp numin" id="r-H" data-f="H" inputmode="decimal" value="${esc(r.H)}" placeholder="0,00"></label>
     </div></fieldset>
    <fieldset><legend class="eyebrow">${tr("Eshiklar — eni, m (plintusdan ayiriladi)")}</legend>
     <div class="openings">${r.doors.map((d,i)=>`<span class="opening">${i+1}<input class="inp numin" id="d-${i}" data-door="${i}" inputmode="decimal" value="${esc(d)}" aria-label="${tr("{0}-eshik eni",i+1)}"><button class="x" data-act="delDoor" data-i="${i}" aria-label="${tr("Eshikni olib tashlash")}">×</button></span>`).join("")}
     <button class="btn sm" data-act="addDoor">${tr("+ Eshik")}</button></div></fieldset>
    <fieldset><legend class="eyebrow">${tr("Derazalar — eni × balandligi, m")}</legend>
     <div class="openings">${r.windows.map((w,i)=>`<span class="opening">${i+1}<input class="inp numin" id="w-${i}-w" data-win="${i}" data-k="w" inputmode="decimal" value="${esc(w.w)}" aria-label="${tr("Deraza eni")}">×<input class="inp numin" id="w-${i}-h" data-win="${i}" data-k="h" inputmode="decimal" value="${esc(w.h)}" aria-label="${tr("Deraza balandligi")}"><button class="x" data-act="delWin" data-i="${i}" aria-label="${tr("Derazani olib tashlash")}">×</button></span>`).join("")}
     <button class="btn sm" data-act="addWin">${tr("+ Deraza")}</button></div></fieldset>
    <fieldset><legend class="eyebrow">${tr("Qoplamalar")}</legend>
     <div class="grid3 g-stack">
      <label class="fld">${tr("Pol")}<select class="inp" id="r-floor" data-f="floor">${opt(FLOOR,r.floor)}</select></label>
      <label class="fld">${tr("Devor")}<select class="inp" id="r-wall" data-f="wall">${opt(WALL,r.wall)}</select></label>
      <label class="fld">${tr("Shift")}<select class="inp" id="r-ceil" data-f="ceil">${opt(CEIL,r.ceil)}</select></label>
     </div>
     <div class="grid3 g-stack">
      <label class="fld">${tr("Devordagi kafel uzunligi, m")}<input class="inp numin" id="r-tileLen" data-f="tileLen" inputmode="decimal" value="${esc(r.tileLen)}" placeholder="0"></label>
      <label class="fld">${tr("Kafel balandligi, m")}<input class="inp numin" id="r-tileH" data-f="tileH" inputmode="decimal" value="${esc(r.tileH)}" placeholder="0"></label>
      <label class="fld">${tr("Plintus, m (qo'lda)")}<input class="inp numin" id="r-plinthOv" data-f="plinthOv" inputmode="decimal" value="${esc(r.plinthOv)}" placeholder="${tr("avto")}"></label>
     </div>
     <p class="note" style="margin:0">${tr("Devorning pastki qismi kafel bo'lsa, o'sha uzunlik plintusdan va bo'yoq maydonidan ayiriladi. Plintusni lenta bilan o'lchagan bo'lsangiz, \"qo'lda\" maydoniga yozing.")}</p>
    </fieldset>
   </div>
   <div id="derived" class="stack"></div>
  </section>`;
  const cat=`<aside class="panel catalog" id="catalog" aria-label="${tr("Katalog")}"><div class="head"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap"><h3 style="font-size:16px">${tr("Xonada nima bor?")}</h3><span class="note deskonly">${tr("bosing → o'lchang")}</span><button class="btn sm mobonly" data-act="closeCat" aria-label="${tr("Katalogni yopish")}">${tr("Yopish ×")}</button></div>
   <input class="inp" id="catq" placeholder="${tr("Qidirish: rozetka, vytyazhka…")}" value="${esc(S.ui.q)}" aria-label="${tr("Katalogdan qidirish")}">
   <div class="chips">${["Tavsiya",...CATALOG.map(g=>g.g)].map(g=>`<button class="chip" data-act="grp" data-g="${esc(g)}" aria-pressed="${S.ui.grp===g}">${esc(g==="Tavsiya"?tr("Tavsiya"):g)}</button>`).join("")}</div></div>
   <div class="catbody"><div id="catItems" class="stack"></div><button class="addown" data-act="custom">${tr("+ Ro'yxatda yo'q narsani qo'shish")}</button></div></aside>`;
  return `<div class="layout">${list}${edit}${cat}</div><button class="fab mobonly" data-act="openCat">${tr("+ Element qo'shish")}</button><button class="catbg" hidden data-act="closeCat" aria-label="${tr("Katalogni yopish")}"></button>`;
}
function renderCatItems(){
  const box=$("#catItems");if(!box)return;const r=curRoom();const q=S.ui.q.trim().toLowerCase();
  const card=(it,s)=>`<button class="cat-item${s?" sugg":""}" data-act="pick" data-cid="${it.id}"><b>${esc(it.n)}</b><span>${it.v?tr("dan")+" ":""}${fmt(it.v?Math.min(...it.v.map(v=>v[1])):it.p)} / ${esc(U(it.u))}</span></button>`;
  const sugg=()=>{const t=ROOM_TYPES[r?.type]||ROOM_DEFAULT;return `<p class="eyebrow" style="margin:0">${esc(tr("{0} uchun odatiy",r?rtLabel(r.type):""))}</p><div class="catgrid">${t.s.map(id=>CAT_INDEX[id]).filter(Boolean).map(it=>card(it,1)).join("")}</div>`};
  let html="";
  if(q){const res=Object.values(CAT_INDEX).filter(it=>(it.n+" "+(it.v||[]).map(v=>v[0]).join(" ")+" "+it.g).toLowerCase().includes(q));
    html=res.length?`<div class="catgrid">${res.map(it=>card(it)).join("")}</div>`:`<p class="note">${esc(tr("\"{0}\" topilmadi — pastdagi tugma orqali o'zingiz qo'shing.",S.ui.q))}</p>`}
  else if(S.ui.grp==="Tavsiya")html=sugg();
  else{const g=CATALOG.find(g=>g.g===S.ui.grp);html=g?`<div class="catgrid">${g.items.map(it=>card(it)).join("")}</div>`:sugg()}
  box.innerHTML=html;
}
function renderDerived(){
  const box=$("#derived");const r=curRoom();if(!box||!r)return;const c=roomCalc(r);
  const autoRows=c.lines.map(l=>{const t=lineTotals(l);return `<tr><td class="c-name"><div class="itemname">${esc(l.name)} <span class="tag auto">${tr("avto")}</span></div><div class="itemsub">${esc(l.sub)}</div></td><td class="num r c-qty" data-l="${tr("Miqdor")}">${fd(l.qty)} ${esc(U(l.unit))}</td><td class="num r c-price" data-l="${tr("Narx")}">${fmt(l.price)}</td><td class="num r c-sum" data-l="${tr("Jami")}">${fmt(t.tot)}</td><td class="c-del"></td></tr>`}).join("");
  const itemRows=r.items.map(it=>{const l=itemLine(it);const t=lineTotals(l);return `<tr><td class="c-name"><div class="itemname">${esc(l.name)}${it.custom?` <span class="tag own">${tr("o'zim qo'shdim")}</span>`:""}</div><div class="itemsub">${esc(l.sub)||"&nbsp;"}</div></td>
    <td class="num r c-qty" data-l="${tr("Miqdor")}"><input class="inp numin qty" id="iq-${it.uid}" data-it="${it.uid}" data-k="qty" inputmode="decimal" value="${esc(it.qty)}" aria-label="${tr("Miqdor")}"> <span class="note">${esc(U(it.unit))}</span></td>
    <td class="r c-price" data-l="${tr("Narx, so'm")}"><input class="inp numin price" id="ip-${it.uid}" data-it="${it.uid}" data-k="price" inputmode="decimal" value="${esc(it.price)}" aria-label="${tr("Narx")}"></td>
    <td class="num r c-sum" data-l="${tr("Jami")}" id="is-${it.uid}">${fmt(t.tot)}</td><td class="c-del"><button class="btn ghost sm" data-act="delItem" data-uid="${it.uid}" aria-label="${tr("O'chirish")}">×</button></td></tr>`}).join("");
  box.innerHTML=`<div class="metrics">
    <div class="metric"><div class="v">${fd(c.floorA)}<small>${U("m²")}</small></div><div class="k">${tr("Pol maydoni")}</div></div>
    <div class="metric"><div class="v">${fd(c.perim)}<small>${U("m")}</small></div><div class="k">${tr("Perimetr")}</div></div>
    <div class="metric"><div class="v">${fd(c.wallNet)}<small>${U("m²")}</small></div><div class="k">${tr("Devor (sof)")}</div></div>
    <div class="metric"><div class="v">${fd(c.pl)}<small>${U("m")}</small></div><div class="k">${tr("Plintus")}${String(r.plinthOv).trim()!==""?" ("+tr("qo'lda")+")":""}</div></div></div>
   <div class="tscroll"><table class="rtable"><thead><tr><th>${tr("Nomi")}</th><th class="r">${tr("Miqdor")}</th><th class="r">${tr("Narx, so'm")}</th><th class="r">${tr("Jami*, so'm")}</th><th></th></tr></thead>
   <tbody>${autoRows||`<tr><td colspan="5" class="note">${tr("O'lchamlarni kiriting — pol, plintus, devor va shift hisobi shu yerda chiqadi.")}</td></tr>`}
   <tr class="grp"><td colspan="5">${tr("Xonadagi elementlar ({0})",r.items.length)} <button class="btn sm pri mobonly" data-act="openCat">${tr("+ Qo'shish")}</button></td></tr>
   ${itemRows||`<tr><td colspan="5" class="note">${tr("O'ngdagi katalogdan tanlang yoki o'zingiz qo'shing.")}</td></tr>`}</tbody></table></div>
   <p class="note" style="margin:0">${tr("* Jami = material + ish haqi (soatlik stavka {0} so'm, o'rtacha oylikdan). Xona bo'yicha:",fmt(rate()))} <b class="mono">${fmt(roomTotal(r))} ${SOM}</b></p>`;
}
function renderTotal(){const s=buildSmeta();
  $("#totalbar").innerHTML=`<div class="wrap"><div class="t"><span>${tr("Materiallar")}</span><b>${fmt(s.mat)}</b></div><div class="t"><span>${tr("Ish haqi")}</span><b>${fmt(s.lab)}</b></div><div class="t"><span>${esc(tr("Kutilmagan {0}%",S.settings.contingency))}${S.settings.vat?" + "+tr("QQS"):""}</span><b>${fmt(s.cont+s.vat)}</b></div><div class="t grand"><span>${tr("Jami smeta, so'm")}</span><b>${fmt(s.grand)}</b></div><div class="spacer"></div><button class="btn xlbtn" data-act="xlsx" title="${tr("Excel yuklab olish")}" aria-label="${tr("Excel yuklab olish")}">${DL_ICON}<span>Excel</span></button>${S.ui.tab!=="smeta"?`<button class="btn" data-act="tab" data-k="smeta">${tr("Smetani ochish →")}</button>`:""}</div>`;
  S.rooms.forEach(r=>{const el=$("#rl-"+r.id);if(el)el.textContent=fmt(roomTotal(r))+" "+SOM});
}

function viewConcrete(){
  return `<div class="pagehead"><div><h2>${tr("Beton qorishmasi")}</h2><p>${tr("Markani va hajmni kiriting — sement, shag'al va qum miqdori normativ bo'yicha, narxi esa \"Narxlar\" bo'limidagi tanlangan narxdan hisoblanadi.")}</p></div><button class="btn pri" data-act="addConc">${tr("+ Beton ishi")}</button></div>
  <div class="section"><div class="cards">${S.concrete.map(c=>`<div class="panel pad ccard">
    <div class="row" style="justify-content:space-between;align-items:center"><input class="inp" style="font-weight:600;flex:1" id="c-${c.id}-name" data-c="${c.id}" data-k="name" value="${esc(c.name)}" aria-label="${tr("Nomi")}"><button class="btn ghost sm" data-act="delConc" data-id="${c.id}">${tr("O'chirish")}</button></div>
    <div class="grid3">
     <label class="fld">${tr("Beton markasi")}<select class="inp" id="c-${c.id}-grade" data-c="${c.id}" data-k="grade">${Object.keys(MIX).map(g=>`<option${g===c.grade?" selected":""}>${g}</option>`).join("")}</select></label>
     <label class="fld">${tr("Sement markasi")}<select class="inp" id="c-${c.id}-cem" data-c="${c.id}" data-k="cem">${["M500","M400"].map(g=>`<option value="${g}"${g===c.cem?" selected":""}>PC ${g}</option>`).join("")}</select></label>
     <label class="fld">${tr("Hajm")}<select class="inp" id="c-${c.id}-mode" data-c="${c.id}" data-k="mode" data-rerender="1"><option value="vol"${c.mode==="vol"?" selected":""}>${tr("m³ da kiritaman")}</option><option value="dims"${c.mode==="dims"?" selected":""}>${tr("o'lchamdan (U×E×Q)")}</option></select></label>
    </div>
    ${c.mode==="dims"?`<div class="grid3"><label class="fld">${tr("Uzunligi, m")}<input class="inp numin" id="c-${c.id}-L" data-c="${c.id}" data-k="L" inputmode="decimal" value="${esc(c.L)}"></label><label class="fld">${tr("Eni, m")}<input class="inp numin" id="c-${c.id}-W" data-c="${c.id}" data-k="W" inputmode="decimal" value="${esc(c.W)}"></label><label class="fld">${tr("Qalinligi, m")}<input class="inp numin" id="c-${c.id}-T" data-c="${c.id}" data-k="T" inputmode="decimal" value="${esc(c.T)}"></label></div>`
     :`<div class="grid3"><label class="fld">${tr("Hajm, m³")}<input class="inp numin" id="c-${c.id}-V" data-c="${c.id}" data-k="V" inputmode="decimal" value="${esc(c.V)}"></label></div>`}
    <label class="fld" style="max-width:260px">${tr("Zavod narxi, so'm/m³ (solishtirish uchun)")}<input class="inp numin" id="c-${c.id}-factory" data-c="${c.id}" data-k="factory" inputmode="decimal" value="${esc(c.factory)}" placeholder="${tr("ixtiyoriy")}"></label>
    <div id="cd-${c.id}"></div></div>`).join("")||`<div class="panel empty">${tr("Hali beton ishi yo'q.")}</div>`}</div>
  <p class="note">${tr("Retseptlar: СНиП 82-02-95 va ГОСТ 7473-2010 asosidagi ma'lumotnoma jadvali, 1 m³ uchun, portlandsement PC M500. PC M400 tanlansa sement sarfi 15% ga oshiriladi. Zichlik: shag'al {0} kg/m³, qum {1} kg/m³ (Narxlar → Sozlamalar).",fmt(S.settings.rhoSheben),fmt(S.settings.rhoQum))}</p></div>`;
}
function renderConcreteDerived(){S.concrete.forEach(c=>{const el=$("#cd-"+c.id);if(!el)return;const k=concreteCalc(c);const f=num(c.factory);
  el.innerHTML=`<div class="mix"><div><span>${tr("Sement")}</span><b>${fmt(k.cem*k.vol)} ${U("kg")}</b><span>${tr("{0} qop × 50 kg",fd(k.cem*k.vol/50,1))}</span></div><div><span>${tr("Shag'al")}</span><b>${fd(k.lines[1].qty)} ${U("m³")}</b><span>${fmt(k.sheb*k.vol)} ${U("kg")}</span></div><div><span>${tr("Qum")}</span><b>${fd(k.lines[2].qty)} ${U("m³")}</b><span>${fmt(k.qum*k.vol)} ${U("kg")}</span></div><div><span>${tr("Suv")}</span><b>${fmt(k.suv*k.vol)} ${U("l")}</b><span>${tr("{0} m³ beton",fd(k.vol))}</span></div></div>
  <div class="row" style="justify-content:space-between;align-items:end;margin-top:4px"><div><div class="eyebrow">${tr("1 m³ tannarxi (materiallar)")}</div><div class="big">${fmt(k.perM3)} ${SOM}</div></div><div style="text-align:right"><div class="eyebrow">${tr("Jami materiallar")}</div><div class="big">${fmt(k.mat)} ${SOM}</div></div></div>
  ${f>0&&k.perM3>0?`<p class="note" style="margin:6px 0 0">${tr("Zavod narxi {0} so'm/m³ — o'zingiz qorishtirsangiz",fmt(f))} ${k.perM3<f?`<b style="color:var(--good)">${tr("{0} so'm arzon",fmt(f-k.perM3))}</b>`:`<b style="color:var(--danger)">${tr("{0} so'm qimmat",fmt(k.perM3-f))}</b>`} ${tr("(ish haqisiz).")}</p>`:""}`})}

function viewPrices(){
  const groups=[...new Set(S.prices.map(p=>p.g))];const st=S.settings;
  // nom va manbalar joriy tilda markaziy bazadan (bo'lmasa — obyektda saqlangani)
  const PN={};(REF&&REF.prices||[]).forEach(p=>PN[p.id]=p);const pn=p=>(PN[p.id]||p).n,ps=p=>(PN[p.id]||p).s;
  return `<div class="pagehead"><div><h2>${esc(tr("Narxlar bazasi — {0}",qLabel(S.obj.quarter)))}</h2><p>${tr("Har bir material uchun 3 ta manbadan narx kiriting (zavod, karyer, do'kon, birja). Dastur o'rtachasini hisoblaydi; kerakli narxni tanlang. Narxlar har chorakda yangilanadi.")}</p></div>
   <div class="row"><button class="btn" data-act="syncPrices" title="${esc(SERVER?tr("Manba narxlari markaziy bazadan olinadi; tanlov (o'rtacha / qo'lda) saqlanadi"):tr("Manba narxlari standart qiymatlardan olinadi; tanlov (o'rtacha / qo'lda) saqlanadi"))}">${S.ui.confirmSync?tr("Tasdiqlang: manba narxlari almashadi"):SERVER?tr("Markaziy narxlarni yuklash"):tr("Standart narxlarga qaytarish")}</button>${REF&&REF.pricesUpdated?`<span class="note">${esc(tr("Markaziy baza: {0}",REF.pricesUpdated))}</span>`:""}</div></div>
  <div class="section"><div class="tscroll"><table class="ptable"><thead><tr><th>${tr("Material")}</th><th>${tr("Birlik")}</th><th>${tr("1-manba")}</th><th>${tr("2-manba")}</th><th>${tr("3-manba")}</th><th>${tr("Tanlov")}</th><th class="r">${tr("Qo'llanadigan narx")}</th></tr></thead><tbody>
  ${groups.map(g=>`<tr class="grp"><td colspan="7">${esc(tr(g))}</td></tr>`+S.prices.filter(p=>p.g===g).map(p=>`<tr><td class="p-name"><div class="itemname">${esc(pn(p))} <span class="mobonly note">/ ${esc(U(p.u))}</span></div>${ps(p)?`<div class="itemsub">${esc(ps(p))}</div>`:""}</td><td class="p-unit">${esc(U(p.u))}</td>
   ${[0,1,2].map(i=>`<td class="p-src" data-l="${tr("{0}-manba",i+1)}"><input class="inp numin" id="p-${p.id}-${i}" data-p="${p.id}" data-i="${i}" inputmode="decimal" value="${esc(p.src[i])}" aria-label="${tr("{0}-manba narxi",i+1)}"></td>`).join("")}
   <td class="p-mode"><div class="row" style="flex-wrap:nowrap;gap:6px"><select class="inp" style="width:auto" id="p-${p.id}-mode" data-p="${p.id}" data-k="mode">${Object.entries(MODE_L).map(([k,l])=>`<option value="${k}"${k===p.mode?" selected":""}>${l}</option>`).join("")}</select>${p.mode==="manual"?`<input class="inp numin" style="width:110px" id="p-${p.id}-manual" data-p="${p.id}" data-k="manual" inputmode="decimal" value="${esc(p.manual)}" aria-label="${tr("Qo'lda narx")}">`:""}</div></td>
   <td class="num r p-res" data-l="${tr("Narx")}" id="pr-${p.id}"><b>${fmt(priceOf(p.id))}</b></td></tr>`).join("")).join("")}
  </tbody></table></div>
  <div class="panel pad stack"><h3 style="font-size:16px">${tr("Ish haqi va sozlamalar")}</h3>
   <div class="grid4">
    <label class="fld">${tr("O'rtacha oylik (qurilish), so'm")}<input class="inp numin" id="s-monthly" data-s="monthly" inputmode="decimal" value="${esc(st.monthly)}"></label>
    <label class="fld">${tr("Oyiga ish soati")}<input class="inp numin" id="s-hoursMonth" data-s="hoursMonth" inputmode="decimal" value="${esc(st.hoursMonth)}"></label>
    <label class="fld">${tr("Material zaxirasi, %")}<input class="inp numin" id="s-reserve" data-s="reserve" inputmode="decimal" value="${esc(st.reserve)}"></label>
    <label class="fld">${tr("Kutilmagan xarajatlar, %")}<input class="inp numin" id="s-contingency" data-s="contingency" inputmode="decimal" value="${esc(st.contingency)}"></label>
    <label class="fld">${tr("Plintus uzunligi (1 dona), m")}<input class="inp numin" id="s-piece" data-s="piece" inputmode="decimal" value="${esc(st.piece)}"></label>
    <label class="fld">${tr("Shag'al zichligi, kg/m³")}<input class="inp numin" id="s-rhoSheben" data-s="rhoSheben" inputmode="decimal" value="${esc(st.rhoSheben)}"></label>
    <label class="fld">${tr("Qum zichligi, kg/m³")}<input class="inp numin" id="s-rhoQum" data-s="rhoQum" inputmode="decimal" value="${esc(st.rhoQum)}"></label>
    <label class="fld">${tr("Beton ishi, soat/m³")}<input class="inp numin" id="s-concreteHours" data-s="concreteHours" inputmode="decimal" value="${esc(st.concreteHours)}"></label>
   </div>
   <label class="row" style="gap:8px;align-items:center"><input type="checkbox" id="s-vat" data-s="vat"${st.vat?" checked":""}> ${tr("QQS 12% qo'shilsin")}</label>
  </div></div>`;
}

/* ---------- Excel: varaq modeli ----------
 * Bitta model ikki joyda ishlatiladi: ekrandagi "Excel ko'rinishi" (viewSheet) va serverdagi .xlsx (smeta/excel.py).
 * Katak: {v: qiymat, f: "money"|"dec2"|"int", s: "title"|"meta"|"head"|"group"|"sub"|"total"|"grand"|"b"} */
const XC=(v,f,s)=>({v:v??"",f,s});
const r2=x=>Math.round((x||0)*100)/100;
const todayStr=()=>{const d=new Date(),p=x=>String(x).padStart(2,"0");return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`};
const DL_ICON=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`;
// butun qatorni bir uslubda to'ldirish (Excel'dagi rangli qator), berilgan ustunlarga qiymat
const xlRow=(n,style,vals)=>Array.from({length:n},(_,i)=>vals[i]!==undefined?XC(vals[i][0],vals[i][1],style):XC("",null,style));
function sheetSmeta(){const s=buildSmeta();const N=9;const R=[];let n=0;
  R.push([XC(`${tr("SMETA")}: ${S.obj.name}`,null,"title")]);
  R.push([XC(`${tr(S.obj.region)} · ${qLabel(S.obj.quarter)} · ${tr("Tuzilgan: {0}",todayStr())}`,null,"meta")]);
  R.push([]);
  const head=R.length;
  R.push(["№",tr("Nomi"),tr("Tafsilot"),tr("Birlik"),tr("Miqdor"),tr("Narx, so'm"),tr("Material, so'm"),tr("Ish haqi, so'm"),tr("Jami, so'm")].map(h=>XC(h,null,"head")));
  s.groups.forEach(g=>{
    R.push(xlRow(N,"group",{1:[`${g.title}  (${g.sub})`]}));
    g.lines.forEach(l=>{const t=lineTotals(l);n++;
      R.push([XC(n,"int"),XC(l.name),XC(l.sub),XC(U(l.unit)),XC(r2(l.qty),"dec2"),XC(Math.round(l.price),"money"),XC(Math.round(t.mat),"money"),XC(Math.round(t.lab),"money"),XC(Math.round(t.tot),"money","b")])});
    R.push(xlRow(N,"sub",{1:[tr("Jami: {0}",g.title)],6:[Math.round(g.mat),"money"],7:[Math.round(g.lab),"money"],8:[Math.round(g.mat+g.lab),"money"]}))});
  const last=R.length-1;
  R.push([]);
  const tot=(label,v)=>xlRow(N,undefined,{1:[label],8:[Math.round(v),"money"]}).map((c,i)=>i===1||i===8?{...c,s:"total"}:null);
  R.push(tot(tr("Materiallar"),s.mat),tot(tr("Ish haqi"),s.lab),tot(tr("Kutilmagan xarajatlar {0}%",S.settings.contingency),s.cont));
  if(S.settings.vat)R.push(tot(tr("QQS 12%"),s.vat));
  R.push(xlRow(N,"grand",{1:[tr("JAMI, so'm")],8:[Math.round(s.grand),"money"]}));
  return{name:tr("Smeta"),cols:[5,36,30,8,10,13,15,14,15],rows:R,freeze:head+1,table:[head,Math.max(head,last)]};
}
function sheetRooms(){const R=[];const N=16;let sumF=0,sumW=0,sumP=0,sumT=0;
  R.push([XC(`${tr("Xonalar hisobi")}: ${S.obj.name}`,null,"title")]);
  R.push([XC(`${tr(S.obj.region)} · ${qLabel(S.obj.quarter)} · ${tr("Tuzilgan: {0}",todayStr())}`,null,"meta")]);
  R.push([]);
  const head=R.length;
  R.push(["№",tr("Xona"),tr("Xona turi"),tr("Uzunligi, m"),tr("Eni, m"),tr("Balandligi, m"),tr("Pol maydoni, m²"),tr("Perimetr, m"),tr("Devor (sof), m²"),tr("Plintus, m"),tr("Eshiklar"),tr("Derazalar"),tr("Pol"),tr("Devor"),tr("Shift"),tr("Jami, so'm")].map(h=>XC(h,null,"head")));
  S.rooms.forEach((r,i)=>{const c=roomCalc(r);const tot=roomTotal(r);sumF+=c.floorA;sumW+=c.wallNet;sumP+=c.pl;sumT+=tot;
    R.push([XC(i+1,"int"),XC(r.name),XC(rtLabel(r.type)),XC(r2(num(r.L)),"dec2"),XC(r2(num(r.W)),"dec2"),XC(r2(num(r.H)),"dec2"),XC(r2(c.floorA),"dec2"),XC(r2(c.perim),"dec2"),XC(r2(c.wallNet),"dec2"),XC(r2(c.pl),"dec2"),XC(r.doors.length,"int"),XC(r.windows.length,"int"),XC(lab(FLOOR[r.floor])),XC(lab(WALL[r.wall])),XC(lab(CEIL[r.ceil])),XC(Math.round(tot),"money","b")])});
  R.push(xlRow(N,"grand",{1:[tr("JAMI")],6:[r2(sumF),"dec2"],8:[r2(sumW),"dec2"],9:[r2(sumP),"dec2"],15:[Math.round(sumT),"money"]}));
  return{name:tr("Xonalar"),cols:[5,24,18,11,9,12,14,12,14,11,10,11,14,24,18,16],rows:R,freeze:head+1,table:[head,R.length-1]};
}
const xlSheets=()=>[sheetSmeta(),sheetRooms()];
// Excel ko'rinishi: ustun harflari, qator raqamlari, varaq yorliqlari
function viewSheet(sheets,cur){const sh=sheets[cur]||sheets[0];const ncol=sh.cols.length;
  const colName=i=>{let s="";i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  const filled=c=>!!c&&c.v!=="";
  // Excel kabi: matn o'ngdagi katak bo'sh bo'lsa unga "oqib" o'tadi, bo'lmasa kesiladi
  const cell=(x,next)=>{if(!x)return "<td></td>";const v=x.v;const isN=typeof v==="number";
    const txt=v===""?"":isN?(x.f==="money"?fmt(v):x.f==="dec2"?fd(v):String(v)):esc(v);
    const cls=[x.s?"x-"+x.s:"",isN?"x-n":"",!isN&&txt&&!filled(next)&&x.s!=="head"?"x-ov":""].filter(Boolean).join(" ");return `<td${cls?` class="${cls}"`:""}>${txt}</td>`};
  const [t0,t1]=sh.table||[-1,-2];const pad=4;
  const body=sh.rows.map((r,i)=>`<tr${i>=t0&&i<=t1?' class="x-t"':""}><th>${i+1}</th>${Array.from({length:ncol},(_,j)=>cell(r[j],r[j+1])).join("")}</tr>`).join("")
    +Array.from({length:pad},(_,k)=>`<tr><th>${sh.rows.length+k+1}</th>${"<td></td>".repeat(ncol)}</tr>`).join("");
  // Excel ustun kengligi (belgilarda) -> px; jadval kengligi aniq bo'lishi shart, aks holda brauzer kengliklarni o'zi tanlaydi
  const px=sh.cols.map(w=>Math.round(w*7.5+10));const total=42+px.reduce((a,b)=>a+b,0);
  return `<div class="xl"><div class="xl-scroll"><table class="xlgrid" style="width:${total}px"><colgroup><col style="width:42px">${px.map(w=>`<col style="width:${w}px">`).join("")}</colgroup>
   <thead><tr><th class="xl-corner"></th>${sh.cols.map((_,i)=>`<th>${colName(i)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>
   <div class="xl-tabs">${sheets.map((x,i)=>`<button type="button" data-act="xlSheet" data-i="${i}" aria-pressed="${sh===x}">${esc(x.name)}</button>`).join("")}</div></div>`}
const safeFile=s=>String(s).replace(/[\\/:*?"<>|\u0000-\u001f]+/g," ").replace(/\s+/g," ").trim().slice(0,120)||"Smeta";
async function downloadXlsx(){
  if(!SERVER||!SERVER.xlsxUrl){toast(tr("Excel fayl uchun internet kerak"));return}
  const btns=document.querySelectorAll('[data-act="xlsx"]');btns.forEach(b=>b.disabled=true);
  try{
    const r=await fetch(SERVER.xlsxUrl,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","X-CSRFToken":SERVER.csrf},body:JSON.stringify({sheets:xlSheets()})});
    if(r.status===403||r.redirected)throw new Error("auth");if(!r.ok)throw new Error(r.status);
    const blob=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download=safeFile(`${tr("Smeta")} - ${S.obj.name} - ${todayStr()}`)+".xlsx";document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast(tr("Excel fayl yuklab olindi"));
  }catch(e){toast(e.message==="auth"?tr("Sessiya tugagan — qayta kiring"):(!navigator.onLine||e instanceof TypeError)?tr("Excel fayl uchun internet kerak"):tr("Excel faylni yaratib bo'lmadi, qayta urinib ko'ring"))}
  finally{btns.forEach(b=>b.disabled=false)}
}

function viewSmeta(){
  const s=buildSmeta();let n=0;const mode=S.ui.smetaView==="table"?"table":"excel";
  const rows=s.groups.map(g=>`<tr class="grp"><td colspan="9">${esc(g.title)} <span class="note" style="font-family:var(--f-mono);font-weight:400">${esc(g.sub)}</span></td></tr>`+
   g.lines.map(l=>{const t=lineTotals(l);n++;return `<tr><td class="num hm">${n}</td><td><div class="itemname">${esc(l.name)}</div>${l.sub?`<div class="itemsub">${esc(l.sub)}</div>`:""}<div class="itemsub mobonly mono">${fmt(l.price)} ${SOM}/${esc(U(l.unit))}</div></td><td class="hm">${esc(U(l.unit))}</td><td class="num r">${fd(l.qty)}<span class="mobonly"> ${esc(U(l.unit))}</span></td><td class="num r hm">${fmt(l.price)}</td><td class="num r hm">${fmt(t.mat)}</td><td class="num r hm">${fmt(t.lab)}</td><td class="num r"><b>${fmt(t.tot)}</b></td><td class="hm"><span class="tag${l.kind==="auto"?" auto":l.kind==="own"?" own":""}">${esc(l.src)}</span></td></tr>`}).join("")+
   `<tr class="sub"><td class="hm"></td><td colspan="2" class="colfix">${esc(tr("Jami: {0}",g.title))}</td><td class="hm" colspan="2"></td><td class="num r hm">${fmt(g.mat)}</td><td class="num r hm">${fmt(g.lab)}</td><td class="num r">${fmt(g.mat+g.lab)}</td><td class="hm"></td></tr>`).join("");
  return `<div class="pagehead"><div><h2>${esc(tr("Smeta: {0}",S.obj.name))}</h2><p>${esc(tr("{0} · {1} narxlarida · soddalashtirilgan hisob (davlat standarti formati keyingi versiyada)",tr(S.obj.region),qLabel(S.obj.quarter)))}</p></div>
   <div class="row"><button class="btn pri" data-act="xlsx">${DL_ICON} ${tr("Excel yuklab olish")}</button><button class="btn" data-act="copyTxt">${tr("Matn sifatida nusxa")}</button></div></div>
  <div class="section"><div class="sumgrid"><div><span>${tr("Materiallar")}</span><b>${fmt(s.mat)}</b></div><div><span>${tr("Ish haqi")}</span><b>${fmt(s.lab)}</b></div><div><span>${esc(tr("Kutilmagan xarajatlar {0}%",S.settings.contingency))}</span><b>${fmt(s.cont)}</b></div>${S.settings.vat?`<div><span>${tr("QQS 12%")}</span><b>${fmt(s.vat)}</b></div>`:""}<div class="g"><span>${tr("Jami, so'm")}</span><b>${fmt(s.grand)}</b></div></div>
  <div class="row" style="align-items:center;justify-content:space-between"><div class="seg" role="group" aria-label="${tr("Ko'rinish")}"><button type="button" data-act="smetaView" data-k="excel" aria-pressed="${mode==="excel"}">${tr("Excel ko'rinishi")}</button><button type="button" data-act="smetaView" data-k="table" aria-pressed="${mode==="table"}">${tr("Jadval")}</button></div>${mode==="excel"?`<span class="note">${tr("Yuklab olinadigan fayl aynan shunday bo'ladi")}</span>`:""}</div>
  ${mode==="excel"?viewSheet(xlSheets(),+S.ui.xlSheet||0):`<div class="tscroll"><table><thead><tr><th class="hm">№</th><th>${tr("Nomi")}</th><th class="hm">${tr("Birlik")}</th><th class="r">${tr("Miqdor")}</th><th class="r hm">${tr("Narx")}</th><th class="r hm">${tr("Material")}</th><th class="r hm">${tr("Ish haqi")}</th><th class="r">${tr("Jami")}</th><th class="hm">${tr("Manba")}</th></tr></thead><tbody>${rows||`<tr><td colspan="9" class="empty">${tr("Smeta bo'sh.")}</td></tr>`}</tbody></table></div>`}
  <div id="fallback"></div></div>`;
}
function smetaTxt(){const s=buildSmeta();let o=`${tr("SMETA")}: ${S.obj.name}\n${tr(S.obj.region)}, ${qLabel(S.obj.quarter)}\n\n`;let n=0;
  s.groups.forEach(g=>{o+=`${g.title} (${g.sub})\n`;g.lines.forEach(l=>{n++;o+=`${n}. ${l.name} — ${fd(l.qty)} ${U(l.unit)} × ${fmt(l.price)} = ${fmt(lineTotals(l).tot)} ${SOM}\n`});o+=`   ${tr("Jami: {0}",fmt(g.mat+g.lab))} ${SOM}\n\n`});
  o+=`${tr("Materiallar")}: ${fmt(s.mat)}\n${tr("Ish haqi")}: ${fmt(s.lab)}\n${tr("Kutilmagan xarajatlar")}: ${fmt(s.cont)}\n${S.settings.vat?tr("QQS 12%")+": "+fmt(s.vat)+"\n":""}${tr("JAMI")}: ${fmt(s.grand)} ${SOM}`;return o}
function copy(text){const done=()=>toast(tr("Nusxa olindi — Excel yoki Telegramga joylang"));
  const fb=()=>{const f=$("#fallback");if(f){f.innerHTML=`<p class="note">${tr("Avtomatik nusxa olinmadi. Matnni belgilab, nusxa oling:")}</p><textarea class="fallback inp" readonly>${esc(text)}</textarea>`;const t=f.querySelector("textarea");t.focus();t.select()}};
  try{navigator.clipboard.writeText(text).then(done,fb)}catch(e){fb()}}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}

/* ---------- modal: add item ---------- */
let M=null;
function openPick(cid){const c=CAT_INDEX[cid];M={cid,vi:0};
  const v=c.v,u=esc(U(c.u));
  $("#modal").innerHTML=`<div class="backdrop" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-t">
   <div class="sh"><div><div class="eyebrow">${esc(c.g)}</div><h3 id="m-t" style="font-size:20px">${esc(c.n)}</h3></div><button class="btn ghost" data-act="close" aria-label="${tr("Yopish")}">×</button></div>
   <div class="sb">
    ${v?`<label class="fld">${tr("Turi")}<select class="inp" id="m-variant">${v.map((x,i)=>`<option value="${i}">${esc(x[0])} — ${fmt(x[1])} ${SOM}</option>`).join("")}</select></label>`:""}
    <div class="grid3">
     <label class="fld">${c.u==="dona"?tr("Soni"):tr("Miqdori")}, ${u}<input class="inp numin" id="m-qty" inputmode="decimal" value="1"></label>
     <label class="fld">${tr("Narx, so'm/{0}",u)}<input class="inp numin" id="m-price" inputmode="decimal" value="${v?v[0][1]:c.p}"></label>
     ${c.w?`<label class="fld">${tr("Quvvati, Vt")}<input class="inp numin" id="m-watt" inputmode="decimal" placeholder="36"></label>`:""}
    </div>
    ${c.dims?`<fieldset><legend class="eyebrow">${tr("O'lchami, sm (ixtiyoriy)")}</legend><div class="grid3"><label class="fld">${tr("Uzunligi / eni")}<input class="inp numin" id="m-l" inputmode="decimal"></label><label class="fld">${tr("Chuqurligi")}<input class="inp numin" id="m-w" inputmode="decimal"></label><label class="fld">${tr("Balandligi")}<input class="inp numin" id="m-h" inputmode="decimal"></label></div></fieldset>`:""}
    <label class="fld">${tr("Izoh (holati, rangi, joyi)")}<input class="inp" id="m-note" placeholder="${tr("masalan: eski, almashtiriladi")}"></label>
    <div class="preview"><span>${tr("O'rnatish: {0} soat/{1}",fd(v&&v[0][2]!=null?v[0][2]:c.h,1),u)}</span><b class="mono" id="m-sum"></b></div>
   </div>
   <div class="sf"><button class="btn" data-act="close">${tr("Bekor qilish")}</button><button class="btn pri" data-act="modalAdd">${tr("Xonaga qo'shish")}</button></div></div></div>`;
  $("#modal").hidden=false;updModalSum();setTimeout(()=>$("#m-qty")?.select(),30);
}
function openCustom(){M={custom:true};
  $("#modal").innerHTML=`<div class="backdrop" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-t">
   <div class="sh"><div><div class="eyebrow">${tr("O'z elementingiz")}</div><h3 id="m-t" style="font-size:20px">${tr("Ro'yxatda yo'q narsa")}</h3></div><button class="btn ghost" data-act="close" aria-label="${tr("Yopish")}">×</button></div>
   <div class="sb">
    <label class="fld">${tr("Nomi")}<input class="inp" id="m-name" placeholder="${tr("masalan: Oyna, Akvarium, Sport trenajyori")}"></label>
    <div class="grid3">
     <label class="fld">${tr("Birlik")}<select class="inp" id="m-unit">${["dona","m","m²","m³","kg","komplekt"].map(u=>`<option value="${u}">${esc(U(u))}</option>`).join("")}</select></label>
     <label class="fld">${tr("Miqdori")}<input class="inp numin" id="m-qty" inputmode="decimal" value="1"></label>
     <label class="fld">${tr("Narx, so'm")}<input class="inp numin" id="m-price" inputmode="decimal" placeholder="0"></label>
    </div>
    <div class="grid3">
     <label class="fld">${tr("O'lchami (erkin)")}<input class="inp" id="m-dims" placeholder="60×80 ${tr("sm")}"></label>
     <label class="fld">${tr("O'rnatish, soat/birlik")}<input class="inp numin" id="m-hours" inputmode="decimal" value="0"></label>
     <label class="fld">${tr("Izoh")}<input class="inp" id="m-note"></label>
    </div>
    <div class="preview"><span>${tr("Smetaga \"qo'lda\" belgisi bilan tushadi")}</span><b class="mono" id="m-sum"></b></div>
    <p class="note" id="m-err" style="margin:0;color:var(--danger)" hidden>${tr("Nomini yozing.")}</p>
   </div>
   <div class="sf"><button class="btn" data-act="close">${tr("Bekor qilish")}</button><button class="btn pri" data-act="modalAdd">${tr("Xonaga qo'shish")}</button></div></div></div>`;
  $("#modal").hidden=false;updModalSum();setTimeout(()=>$("#m-name")?.focus(),30);
}
function updModalSum(){const el=$("#m-sum");if(!el)return;el.textContent=fmt(num($("#m-qty")?.value)*num($("#m-price")?.value))+" "+SOM}
function closeModal(){$("#modal").hidden=true;$("#modal").innerHTML="";M=null}
function modalAdd(){const r=curRoom();if(!r||!M)return;
  if(M.custom){const name=$("#m-name").value.trim();if(!name){$("#m-err").hidden=false;$("#m-name").focus();return}
    r.items.push({uid:uid(),cid:null,name,variant:"",unit:$("#m-unit").value,qty:$("#m-qty").value||"1",price:$("#m-price").value||"0",h:$("#m-hours").value||"0",dims:$("#m-dims").value.trim(),watt:"",note:$("#m-note").value.trim(),custom:true})}
  else{const c=CAT_INDEX[M.cid];const vi=$("#m-variant")?+$("#m-variant").value:0;const v=c.v&&c.v[vi];
    const d=["#m-l","#m-w","#m-h"].map(s=>$(s)?.value.trim()).filter(Boolean);
    r.items.push({uid:uid(),cid:c.id,name:c.n,variant:v?v[0]:"",unit:c.u,qty:$("#m-qty").value||"1",price:$("#m-price").value||"0",h:v&&v[2]!=null?v[2]:c.h,dims:d.length?d.join("×")+" "+tr("sm"):"",watt:$("#m-watt")?.value.trim()||"",note:$("#m-note").value.trim(),custom:false})}
  const nm=M.custom?$("#m-name").value.trim():CAT_INDEX[M.cid].n;
  closeModal();document.body.classList.remove("cat-open");S.sample=false;renderDerived();renderTotal();save();toast(tr("{0} qo'shildi",nm));
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;const r=curRoom();
  if(a==="closeBg"&&e.target!==b)return;
  switch(a){
   case "tab":document.body.classList.remove("cat-open");S.ui.tab=b.dataset.k;S.ui.confirmSync=false;render();window.scrollTo(0,0);if(S.ui.tab==="beton")renderConcreteDerived();break;
   case "room":S.ui.room=b.dataset.id;S.ui.confirmDel=null;render();break;
   case "addRoom":{const t=$("#newType").value;const lbl=rtLabel(t);const n=S.rooms.filter(x=>x.type===t).length;const nr=mkRoom(t,n?`${lbl} ${n+1}`:lbl);S.rooms.push(nr);S.ui.room=nr.id;S.ui.grp="Tavsiya";render();$("#r-L")?.focus();break}
   case "delRoom":if(S.ui.confirmDel!==r.id){S.ui.confirmDel=r.id;render();break}S.rooms=S.rooms.filter(x=>x.id!==r.id);S.ui.room=S.rooms[0]?.id;S.ui.confirmDel=null;render();break;
   case "reset":if(!S.ui.confirmReset){S.ui.confirmReset=true;render();break}{S=blank(S);render();$("#r-L")?.focus()}break;
   case "syncPrices":if(!S.ui.confirmSync){S.ui.confirmSync=true;render();break}
    defaultPrices().forEach(np=>{const p=S.prices.find(x=>x.id===np.id);if(p)Object.assign(p,{n:np.n,u:np.u,g:np.g,src:np.src,s:np.s});else S.prices.push(np)});
    S.ui.confirmSync=false;render();toast(tr("Manba narxlari yangilandi"));break;
   case "addDoor":r.doors.push("0,9");render();$("#d-"+(r.doors.length-1))?.select();break;
   case "delDoor":r.doors.splice(+b.dataset.i,1);render();break;
   case "addWin":r.windows.push({w:"1,2",h:"1,4"});render();$("#w-"+(r.windows.length-1)+"-w")?.select();break;
   case "delWin":r.windows.splice(+b.dataset.i,1);render();break;
   case "grp":S.ui.grp=b.dataset.g;S.ui.q="";$("#catq").value="";document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.g===S.ui.grp));renderCatItems();save();break;
   case "openCat":document.body.classList.add("cat-open");break;
   case "closeCat":document.body.classList.remove("cat-open");break;
   case "pick":openPick(b.dataset.cid);break;
   case "custom":openCustom();break;
   case "close":case "closeBg":closeModal();break;
   case "modalAdd":modalAdd();break;
   case "delItem":r.items=r.items.filter(i=>i.uid!==b.dataset.uid);renderDerived();renderTotal();save();break;
   case "addConc":S.concrete.push({id:uid(),name:tr("Yangi beton ishi"),grade:"M200",cem:"M500",mode:"vol",L:"",W:"",T:"",V:"1",factory:""});render();renderConcreteDerived();break;
   case "delConc":S.concrete=S.concrete.filter(c=>c.id!==b.dataset.id);render();renderConcreteDerived();break;
   case "xlsx":downloadXlsx();break;
   case "smetaView":S.ui.smetaView=b.dataset.k;render();break;
   case "xlSheet":S.ui.xlSheet=+b.dataset.i;render();break;
   case "copyTxt":copy(smetaTxt());break;
  }
});
document.addEventListener("input",e=>{const t=e.target;const r=curRoom();
  if(t.dataset.o){S.obj[t.dataset.o]=t.value;save();return}
  if(t.id==="catq"){S.ui.q=t.value;renderCatItems();return}
  if(t.closest("#modal")){if(t.id==="m-variant"){const c=CAT_INDEX[M.cid];$("#m-price").value=c.v[+t.value][1]}updModalSum();return}
  if(t.dataset.f&&r){r[t.dataset.f]=t.value;S.sample=false;if(t.dataset.f==="name"){const b=document.querySelector(`.roombtn[data-id="${r.id}"] b`);if(b)b.textContent=t.value}
    renderDerived();renderTotal();save();return}
  if(t.dataset.door!=null){r.doors[+t.dataset.door]=t.value;renderDerived();renderTotal();save();return}
  if(t.dataset.win!=null){r.windows[+t.dataset.win][t.dataset.k]=t.value;renderDerived();renderTotal();save();return}
  if(t.dataset.it){const it=r.items.find(i=>i.uid===t.dataset.it);if(it){it[t.dataset.k]=t.value;const el=$("#is-"+it.uid);if(el)el.textContent=fmt(lineTotals(itemLine(it)).tot)}renderTotal();save();return}
  if(t.dataset.c){const c=S.concrete.find(x=>x.id===t.dataset.c);c[t.dataset.k]=t.value;if(t.dataset.rerender){render();}renderConcreteDerived();renderTotal();save();return}
  if(t.dataset.p){const p=S.prices.find(x=>x.id===t.dataset.p);if(t.dataset.i!=null)p.src[+t.dataset.i]=t.value;else p[t.dataset.k]=t.value;
    if(t.dataset.k==="mode"){render();return}const el=$("#pr-"+p.id);if(el)el.innerHTML=`<b>${fmt(priceOf(p.id))}</b>`;renderTotal();save();return}
  if(t.dataset.s){S.settings[t.dataset.s]=t.type==="checkbox"?t.checked:t.value;renderTotal();save();return}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal();if(e.key==="Enter"&&!$("#modal").hidden&&e.target.tagName==="INPUT"){e.preventDefault();modalAdd()}});

render();if(S.ui.tab==="beton")renderConcreteDerived();
