/* SmetaGo — ilova mantig'i: holat (state), hisob-kitob, chizish (render) va hodisalar.
 * data.js dan keyin yuklanadi. Tuzilishi: docs/ARXITEKTURA.md
 */
/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const num=v=>{const x=parseFloat(String(v??"").replace(/\s/g,"").replace(",","."));return isFinite(x)?x:0};
const fmt=n=>Math.round(n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ");
const fd=(n,d=2)=>(Math.round((n||0)*10**d)/10**d).toFixed(d).replace(".",",");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sum=a=>a.reduce((x,y)=>x+y,0);

/* ---------- state ---------- */
function mkRoom(type,name,L,W,H){const t=ROOM_TYPES[type]||ROOM_TYPES.Boshqa;return{id:uid(),type,name:name||type,L:L??"",W:W??"",H:H??"2,8",doors:["0,9"],windows:[],floor:t.floor,wall:t.wall,ceil:t.ceil,tileLen:"",tileH:"",plinthOv:"",items:[]}}
function mkItem(cid,opt={}){const c=CAT_INDEX[cid];const v=c.v&&c.v[opt.vi??0];return{uid:uid(),cid,name:c.n,variant:v?v[0]:"",unit:c.u,qty:opt.qty??1,price:v?v[1]:c.p,h:v&&v[2]!=null?v[2]:c.h,dims:opt.dims||"",watt:opt.watt||"",note:opt.note||"",custom:false}}
function sample(){
  const m=mkRoom("Mehmonxona","Mehmonxona","5","4","2,8");m.doors=["0,9","0,9","0,9"];m.windows=[{w:"1,5",h:"1,5"}];
  m.items=[mkItem("svetilnik",{vi:1,qty:4,watt:"12"}),mkItem("lyustra"),mkItem("vyklyuchatel",{vi:1}),mkItem("rozetka",{vi:1,qty:3}),mkItem("divan",{dims:"220×90×85 sm"}),mkItem("kreslo",{qty:2}),mkItem("konditsioner",{vi:1}),mkItem("radiator",{qty:10}),mkItem("vent_panjara")];
  const o=mkRoom("Oshxona","Oshxona","3,5","3","2,8");o.doors=["0,8"];o.windows=[{w:"1,2",h:"1,4"}];o.tileLen="3";o.tileH="0,6";
  o.items=[mkItem("gaz_plita"),mkItem("vytyazhka",{vi:0,dims:"60×50×40 sm"}),mkItem("osh_rakovina"),mkItem("smesitel"),mkItem("garnitur",{qty:3}),mkItem("rozetka",{qty:4}),mkItem("vyklyuchatel"),mkItem("svetilnik",{qty:2,watt:"18"}),mkItem("vent_shaxta",{qty:2.8})];
  const h=mkRoom("Hammom","Hammom","2","1,7","2,7");h.doors=["0,7"];
  h.items=[mkItem("unitaz"),mkItem("rakovina"),mkItem("vanna",{dims:"170×70 sm"}),mkItem("smesitel",{qty:2}),mkItem("isitgich"),mkItem("ventilyator",{watt:"25"}),mkItem("svetilnik",{vi:2,qty:3,watt:"7"})];
  const own={uid:uid(),cid:null,name:"Oyna (hammom uchun)",variant:"",unit:"dona",qty:1,price:450000,h:.5,dims:"60×80 sm",watt:"",note:"",custom:true};h.items.push(own);
  return{
    v:1,sample:true,
    obj:{name:"Namuna: 2 xonali kvartira, Chilonzor",region:"Toshkent sh.",quarter:QUARTERS[0]},
    settings:{reserve:10,piece:2.5,contingency:5,vat:false,monthly:7030000,hoursMonth:176,rhoSheben:1400,rhoQum:1500,concreteHours:3},
    prices:defaultPrices(),
    rooms:[m,o,h],
    concrete:[{id:uid(),name:"Hovli yo'lagi",grade:"M200",cem:"M500",mode:"dims",L:"10",W:"1",T:"0,1",V:"",factory:""},{id:uid(),name:"Ayvon poydevori",grade:"M250",cem:"M400",mode:"vol",L:"",W:"",T:"",V:"3,2",factory:"1150000"}],
    ui:{tab:"xonalar",room:m.id,grp:"Tavsiya",q:""}
  };
}
let S;
try{const raw=localStorage.getItem("smetago-v1");S=raw?JSON.parse(raw):null}catch(e){S=null}
if(!S||S.v!==1)S=sample();
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem("smetago-v1",JSON.stringify(S))}catch(e){}},300)}

/* ---------- calculations ---------- */
function priceStats(p){const v=p.src.map(num).filter(x=>x>0);if(!v.length)return{min:0,max:0,avg:0};return{min:Math.min(...v),max:Math.max(...v),avg:sum(v)/v.length}}
function priceOf(id){const p=S.prices.find(x=>x.id===id);if(!p)return 0;if(p.mode==="manual")return num(p.manual);return priceStats(p)[p.mode]||0}
const MODE_L={avg:"o'rtacha",min:"eng arzon",max:"eng qimmat",manual:"qo'lda"};
function srcLabel(id){const p=S.prices.find(x=>x.id===id);return p?MODE_L[p.mode]+" narx":""}
const rate=()=>num(S.settings.monthly)/Math.max(1,num(S.settings.hoursMonth));

function roomCalc(r){
  const L=num(r.L),W=num(r.W),H=num(r.H),res=num(S.settings.reserve)/100;
  const floorA=L*W,perim=2*(L+W),doorsW=sum(r.doors.map(num));
  const doorA=sum(r.doors.map(d=>num(d)*DOOR_H)),winA=sum(r.windows.map(w=>num(w.w)*num(w.h)));
  const tileLen=num(r.tileLen),tileA=tileLen*num(r.tileH);
  const wallNet=Math.max(0,perim*H-doorA-winA);
  const plAuto=Math.max(0,perim-doorsW-(r.floor==="kafel"?0:tileLen));
  const ov=String(r.plinthOv??"").trim();const pl=ov!==""?num(ov):plAuto;
  const lines=[];const F=FLOOR[r.floor],Wf=WALL[r.wall],C=CEIL[r.ceil];
  if(F.pid&&floorA>0)lines.push({name:"Pol qoplamasi: "+F.l,sub:`${fd(floorA)} m² + ${S.settings.reserve}% zaxira`,unit:"m²",qty:floorA*(1+res),price:priceOf(F.pid),hrs:floorA*F.h,src:srcLabel(F.pid),kind:"auto"});
  if(F.pl&&pl>0){const pp=S.prices.find(p=>p.id===F.pl);const piece=num(S.settings.piece)||2.5;
    const qty=pp.u==="dona"?Math.ceil(pl*(1+res)/piece):pl*(1+res);
    lines.push({name:"Plintus: "+PLINTH_LABEL[F.pl],sub:ov!==""?`${fd(pl)} m (qo'lda o'lchangan)`:`${fd(perim)} − eshiklar ${fd(doorsW)}${tileLen&&r.floor!=="kafel"?" − kafel "+fd(tileLen):""} = ${fd(pl)} m`,unit:pp.u,qty,price:priceOf(F.pl),hrs:pl*.1,src:srcLabel(F.pl),kind:"auto"})}
  const paintA=r.wall==="kafel"?wallNet:Math.max(0,wallNet-tileA);
  if(Wf.pid&&paintA>0)lines.push({name:"Devor: "+Wf.l,sub:`${fd(paintA)} m² (eshik va derazalarsiz)`,unit:"m²",qty:paintA*(1+(r.wall==="kafel"||r.wall==="oboy"?res:0)),price:priceOf(Wf.pid),hrs:paintA*Wf.h,src:srcLabel(Wf.pid),kind:"auto"});
  if(tileA>0&&r.wall!=="kafel")lines.push({name:"Devor: kafel qismi",sub:`${fd(tileLen)} m × ${fd(num(r.tileH))} m`,unit:"m²",qty:tileA*(1+res),price:priceOf("kafel_devor"),hrs:tileA*1.1,src:srcLabel("kafel_devor"),kind:"auto"});
  if(C.pid&&floorA>0)lines.push({name:"Shift: "+C.l,sub:`${fd(floorA)} m²`,unit:"m²",qty:floorA,price:priceOf(C.pid),hrs:floorA*C.h,src:srcLabel(C.pid),kind:"auto"});
  return{floorA,perim,wallNet,pl,plAuto,doorsW,lines};
}
function itemLine(it){const q=num(it.qty);const bits=[it.variant,it.dims,it.watt?it.watt+" Vt":"",it.note].filter(Boolean);
  return{name:it.name,sub:bits.join(" · "),unit:it.unit,qty:q,price:num(it.price),hrs:q*num(it.h),src:it.custom?"qo'lda":"katalog",kind:it.custom?"own":"item",uid:it.uid}}
function concreteCalc(c){
  const vol=c.mode==="dims"?num(c.L)*num(c.W)*num(c.T):num(c.V);const m=MIX[c.grade]||MIX.M200;
  const k=c.cem==="M400"?1.15:1;const cem=m[0]*k,qum=m[1],sheb=m[2],suv=m[3];
  const lines=[
    {name:"Sement",sub:`${fmt(cem)} kg/m³ · PC ${c.cem}`,unit:"kg",qty:cem*vol,price:priceOf("sement"),hrs:0,src:srcLabel("sement"),kind:"auto"},
    {name:"Shag'al (sheben)",sub:`${fmt(sheb)} kg/m³`,unit:"m³",qty:sheb*vol/num(S.settings.rhoSheben||1400),price:priceOf("sheben"),hrs:0,src:srcLabel("sheben"),kind:"auto"},
    {name:"Qum",sub:`${fmt(qum)} kg/m³`,unit:"m³",qty:qum*vol/num(S.settings.rhoQum||1500),price:priceOf("qum"),hrs:0,src:srcLabel("qum"),kind:"auto"},
    {name:"Suv",sub:`${fmt(suv)} l/m³`,unit:"m³",qty:suv*vol/1000,price:priceOf("suv"),hrs:0,src:srcLabel("suv"),kind:"auto"},
    {name:"Qorishma tayyorlash va quyish",sub:`${fd(num(S.settings.concreteHours),1)} soat/m³`,unit:"m³",qty:vol,price:0,hrs:vol*num(S.settings.concreteHours),src:"ish haqi",kind:"auto"}
  ];
  const mat=sum(lines.map(l=>l.qty*l.price));
  return{vol,cem,qum,sheb,suv,lines,mat,perM3:vol>0?mat/vol:0};
}
function lineTotals(l){const mat=l.qty*l.price,lab=l.hrs*rate();return{mat,lab,tot:mat+lab}}
function buildSmeta(){
  const groups=[];
  S.rooms.forEach(r=>{const c=roomCalc(r);groups.push({title:r.name,sub:`${fd(num(r.L))} × ${fd(num(r.W))} × ${fd(num(r.H))} m`,lines:[...c.lines,...r.items.map(itemLine)]})});
  S.concrete.forEach(c=>{const k=concreteCalc(c);if(k.vol>0)groups.push({title:"Beton: "+c.name,sub:`${c.grade}, ${fd(k.vol)} m³`,lines:k.lines})});
  let mat=0,lab=0;groups.forEach(g=>{g.mat=0;g.lab=0;g.lines.forEach(l=>{const t=lineTotals(l);g.mat+=t.mat;g.lab+=t.lab});mat+=g.mat;lab+=g.lab});
  const base=mat+lab,cont=base*num(S.settings.contingency)/100,vat=S.settings.vat?(base+cont)*.12:0;
  return{groups,mat,lab,base,cont,vat,grand:base+cont+vat};
}

/* ---------- rendering ---------- */
const TABS=[["xonalar","Xonalar va o'lchov"],["beton","Beton"],["narxlar","Narxlar"],["smeta","Smeta"]];
function renderHeader(){
  $("#o-name").value=S.obj.name;
  $("#o-region").innerHTML=REGIONS.map(r=>`<option${r===S.obj.region?" selected":""}>${esc(r)}</option>`).join("");
  $("#o-quarter").innerHTML=QUARTERS.map(r=>`<option${r===S.obj.quarter?" selected":""}>${esc(r)}</option>`).join("");
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
  const list=`<aside class="panel roomlist"><ul>${S.rooms.map(x=>`<li><button class="roombtn" data-act="room" data-id="${x.id}" aria-current="${r&&x.id===r.id}"><b>${esc(x.name)}</b><span id="rl-${x.id}">${fmt(roomTotal(x))} so'm</span></button></li>`).join("")}</ul>
   <div class="addroom"><select class="inp" id="newType" aria-label="Xona turi">${Object.keys(ROOM_TYPES).map(k=>`<option>${k}</option>`).join("")}</select><button class="btn pri" data-act="addRoom">+ Xona qo'shish</button></div></aside>`;
  if(!r)return `<div class="layout">${list}<section class="panel pad empty">Xona qo'shing — o'lchamlarni kiritgach, hisob avtomatik chiqadi.</section></div>`;
  const opt=(o,cur)=>Object.entries(o).map(([k,v])=>`<option value="${k}"${k===cur?" selected":""}>${v.l}</option>`).join("");
  const edit=`<section class="stack">
   ${S.sample?`<div class="hint">Bu namunaviy obyekt: 3 xona va 2 ta beton ishi bilan to'ldirilgan. O'zingiznikini boshlash uchun <button class="btn sm" data-act="reset">${S.ui.confirmReset?"Tasdiqlang: hammasi o'chadi":"Yangi obyekt"}</button></div>`:""}
   <div class="panel pad stack">
    <div class="roomhead"><input id="r-name" data-f="name" value="${esc(r.name)}" aria-label="Xona nomi"><span class="tag">${esc(r.type)}</span><button class="btn ghost sm" data-act="delRoom">${S.ui.confirmDel===r.id?"O'chirishni tasdiqlang":"Xonani o'chirish"}</button></div>
    <fieldset><legend class="eyebrow">O'lchamlar, metr</legend>
     <div class="grid3">
      <label class="fld">Uzunligi<input class="inp numin" id="r-L" data-f="L" inputmode="decimal" value="${esc(r.L)}" placeholder="0,00"></label>
      <label class="fld">Eni<input class="inp numin" id="r-W" data-f="W" inputmode="decimal" value="${esc(r.W)}" placeholder="0,00"></label>
      <label class="fld">Balandligi<input class="inp numin" id="r-H" data-f="H" inputmode="decimal" value="${esc(r.H)}" placeholder="0,00"></label>
     </div></fieldset>
    <fieldset><legend class="eyebrow">Eshiklar — eni, m (plintusdan ayiriladi)</legend>
     <div class="openings">${r.doors.map((d,i)=>`<span class="opening">${i+1}<input class="inp numin" id="d-${i}" data-door="${i}" inputmode="decimal" value="${esc(d)}" aria-label="${i+1}-eshik eni"><button class="x" data-act="delDoor" data-i="${i}" aria-label="Eshikni olib tashlash">×</button></span>`).join("")}
     <button class="btn sm" data-act="addDoor">+ Eshik</button></div></fieldset>
    <fieldset><legend class="eyebrow">Derazalar — eni × balandligi, m</legend>
     <div class="openings">${r.windows.map((w,i)=>`<span class="opening">${i+1}<input class="inp numin" id="w-${i}-w" data-win="${i}" data-k="w" inputmode="decimal" value="${esc(w.w)}" aria-label="Deraza eni">×<input class="inp numin" id="w-${i}-h" data-win="${i}" data-k="h" inputmode="decimal" value="${esc(w.h)}" aria-label="Deraza balandligi"><button class="x" data-act="delWin" data-i="${i}" aria-label="Derazani olib tashlash">×</button></span>`).join("")}
     <button class="btn sm" data-act="addWin">+ Deraza</button></div></fieldset>
    <fieldset><legend class="eyebrow">Qoplamalar</legend>
     <div class="grid3 g-stack">
      <label class="fld">Pol<select class="inp" id="r-floor" data-f="floor">${opt(FLOOR,r.floor)}</select></label>
      <label class="fld">Devor<select class="inp" id="r-wall" data-f="wall">${opt(WALL,r.wall)}</select></label>
      <label class="fld">Shift<select class="inp" id="r-ceil" data-f="ceil">${opt(CEIL,r.ceil)}</select></label>
     </div>
     <div class="grid3 g-stack">
      <label class="fld">Devordagi kafel uzunligi, m<input class="inp numin" id="r-tileLen" data-f="tileLen" inputmode="decimal" value="${esc(r.tileLen)}" placeholder="0"></label>
      <label class="fld">Kafel balandligi, m<input class="inp numin" id="r-tileH" data-f="tileH" inputmode="decimal" value="${esc(r.tileH)}" placeholder="0"></label>
      <label class="fld">Plintus, m (qo'lda)<input class="inp numin" id="r-plinthOv" data-f="plinthOv" inputmode="decimal" value="${esc(r.plinthOv)}" placeholder="avto"></label>
     </div>
     <p class="note" style="margin:0">Devorning pastki qismi kafel bo'lsa, o'sha uzunlik plintusdan va bo'yoq maydonidan ayiriladi. Plintusni lenta bilan o'lchagan bo'lsangiz, "qo'lda" maydoniga yozing.</p>
    </fieldset>
   </div>
   <div id="derived" class="stack"></div>
  </section>`;
  const cat=`<aside class="panel catalog" id="catalog" aria-label="Katalog"><div class="head"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap"><h3 style="font-size:16px">Xonada nima bor?</h3><span class="note deskonly">bosing → o'lchang</span><button class="btn sm mobonly" data-act="closeCat" aria-label="Katalogni yopish">Yopish ×</button></div>
   <input class="inp" id="catq" placeholder="Qidirish: rozetka, vytyazhka…" value="${esc(S.ui.q)}" aria-label="Katalogdan qidirish">
   <div class="chips">${["Tavsiya",...CATALOG.map(g=>g.g)].map(g=>`<button class="chip" data-act="grp" data-g="${esc(g)}" aria-pressed="${S.ui.grp===g}">${esc(g)}</button>`).join("")}</div></div>
   <div class="catbody"><div id="catItems" class="stack"></div><button class="addown" data-act="custom">+ Ro'yxatda yo'q narsani qo'shish</button></div></aside>`;
  return `<div class="layout">${list}${edit}${cat}</div><button class="fab mobonly" data-act="openCat">+ Element qo'shish</button><button class="catbg" hidden data-act="closeCat" aria-label="Katalogni yopish"></button>`;
}
function renderCatItems(){
  const box=$("#catItems");if(!box)return;const r=curRoom();const q=S.ui.q.trim().toLowerCase();
  const card=(it,s)=>`<button class="cat-item${s?" sugg":""}" data-act="pick" data-cid="${it.id}"><b>${esc(it.n)}</b><span>${it.v?"dan ":""}${fmt(it.v?Math.min(...it.v.map(v=>v[1])):it.p)} / ${it.u}</span></button>`;
  let html="";
  if(q){const res=Object.values(CAT_INDEX).filter(it=>(it.n+" "+(it.v||[]).map(v=>v[0]).join(" ")+" "+it.g).toLowerCase().includes(q));
    html=res.length?`<div class="catgrid">${res.map(it=>card(it)).join("")}</div>`:`<p class="note">"${esc(S.ui.q)}" topilmadi — pastdagi tugma orqali o'zingiz qo'shing.</p>`}
  else if(S.ui.grp==="Tavsiya"){const t=ROOM_TYPES[r?.type]||ROOM_TYPES.Boshqa;html=`<p class="eyebrow" style="margin:0">${esc(r?.type||"")} uchun odatiy</p><div class="catgrid">${t.s.map(id=>card(CAT_INDEX[id],1)).join("")}</div>`}
  else{const g=CATALOG.find(g=>g.g===S.ui.grp);html=`<div class="catgrid">${g.items.map(it=>card(it)).join("")}</div>`}
  box.innerHTML=html;
}
function renderDerived(){
  const box=$("#derived");const r=curRoom();if(!box||!r)return;const c=roomCalc(r);
  const autoRows=c.lines.map(l=>{const t=lineTotals(l);return `<tr><td class="c-name"><div class="itemname">${esc(l.name)} <span class="tag auto">avto</span></div><div class="itemsub">${esc(l.sub)}</div></td><td class="num r c-qty" data-l="Miqdor">${fd(l.qty)} ${esc(l.unit)}</td><td class="num r c-price" data-l="Narx">${fmt(l.price)}</td><td class="num r c-sum" data-l="Jami">${fmt(t.tot)}</td><td class="c-del"></td></tr>`}).join("");
  const itemRows=r.items.map(it=>{const l=itemLine(it);const t=lineTotals(l);return `<tr><td class="c-name"><div class="itemname">${esc(it.name)}${it.custom?' <span class="tag own">o\'zim qo\'shdim</span>':""}</div><div class="itemsub">${esc(l.sub)||"&nbsp;"}</div></td>
    <td class="num r c-qty" data-l="Miqdor"><input class="inp numin qty" id="iq-${it.uid}" data-it="${it.uid}" data-k="qty" inputmode="decimal" value="${esc(it.qty)}" aria-label="Miqdor"> <span class="note">${esc(it.unit)}</span></td>
    <td class="r c-price" data-l="Narx, so'm"><input class="inp numin price" id="ip-${it.uid}" data-it="${it.uid}" data-k="price" inputmode="decimal" value="${esc(it.price)}" aria-label="Narx"></td>
    <td class="num r c-sum" data-l="Jami" id="is-${it.uid}">${fmt(t.tot)}</td><td class="c-del"><button class="btn ghost sm" data-act="delItem" data-uid="${it.uid}" aria-label="O'chirish">×</button></td></tr>`}).join("");
  box.innerHTML=`<div class="metrics">
    <div class="metric"><div class="v">${fd(c.floorA)}<small>m²</small></div><div class="k">Pol maydoni</div></div>
    <div class="metric"><div class="v">${fd(c.perim)}<small>m</small></div><div class="k">Perimetr</div></div>
    <div class="metric"><div class="v">${fd(c.wallNet)}<small>m²</small></div><div class="k">Devor (sof)</div></div>
    <div class="metric"><div class="v">${fd(c.pl)}<small>m</small></div><div class="k">Plintus${String(r.plinthOv).trim()!==""?" (qo'lda)":""}</div></div></div>
   <div class="tscroll"><table class="rtable"><thead><tr><th>Nomi</th><th class="r">Miqdor</th><th class="r">Narx, so'm</th><th class="r">Jami*, so'm</th><th></th></tr></thead>
   <tbody>${autoRows||`<tr><td colspan="5" class="note">O'lchamlarni kiriting — pol, plintus, devor va shift hisobi shu yerda chiqadi.</td></tr>`}
   <tr class="grp"><td colspan="5">Xonadagi elementlar (${r.items.length}) <button class="btn sm pri mobonly" data-act="openCat">+ Qo'shish</button></td></tr>
   ${itemRows||`<tr><td colspan="5" class="note">O'ngdagi katalogdan tanlang yoki o'zingiz qo'shing.</td></tr>`}</tbody></table></div>
   <p class="note" style="margin:0">* Jami = material + ish haqi (soatlik stavka ${fmt(rate())} so'm, o'rtacha oylikdan). Xona bo'yicha: <b class="mono">${fmt(roomTotal(r))} so'm</b></p>`;
}
function renderTotal(){const s=buildSmeta();
  $("#totalbar").innerHTML=`<div class="wrap"><div class="t"><span>Materiallar</span><b>${fmt(s.mat)}</b></div><div class="t"><span>Ish haqi</span><b>${fmt(s.lab)}</b></div><div class="t"><span>Kutilmagan ${S.settings.contingency}%${S.settings.vat?" + QQS":""}</span><b>${fmt(s.cont+s.vat)}</b></div><div class="t grand"><span>Jami smeta, so'm</span><b>${fmt(s.grand)}</b></div><div class="spacer"></div>${S.ui.tab!=="smeta"?`<button class="btn" data-act="tab" data-k="smeta">Smetani ochish →</button>`:""}</div>`;
  S.rooms.forEach(r=>{const el=$("#rl-"+r.id);if(el)el.textContent=fmt(roomTotal(r))+" so'm"});
}

function viewConcrete(){
  return `<div class="pagehead"><div><h2>Beton qorishmasi</h2><p>Markani va hajmni kiriting — sement, shag'al va qum miqdori normativ bo'yicha, narxi esa "Narxlar" bo'limidagi tanlangan narxdan hisoblanadi.</p></div><button class="btn pri" data-act="addConc">+ Beton ishi</button></div>
  <div class="section"><div class="cards">${S.concrete.map(c=>`<div class="panel pad ccard">
    <div class="row" style="justify-content:space-between;align-items:center"><input class="inp" style="font-weight:600;flex:1" id="c-${c.id}-name" data-c="${c.id}" data-k="name" value="${esc(c.name)}" aria-label="Nomi"><button class="btn ghost sm" data-act="delConc" data-id="${c.id}">O'chirish</button></div>
    <div class="grid3">
     <label class="fld">Beton markasi<select class="inp" id="c-${c.id}-grade" data-c="${c.id}" data-k="grade">${Object.keys(MIX).map(g=>`<option${g===c.grade?" selected":""}>${g}</option>`).join("")}</select></label>
     <label class="fld">Sement markasi<select class="inp" id="c-${c.id}-cem" data-c="${c.id}" data-k="cem">${["M500","M400"].map(g=>`<option value="${g}"${g===c.cem?" selected":""}>PC ${g}</option>`).join("")}</select></label>
     <label class="fld">Hajm<select class="inp" id="c-${c.id}-mode" data-c="${c.id}" data-k="mode" data-rerender="1"><option value="vol"${c.mode==="vol"?" selected":""}>m³ da kiritaman</option><option value="dims"${c.mode==="dims"?" selected":""}>o'lchamdan (U×E×Q)</option></select></label>
    </div>
    ${c.mode==="dims"?`<div class="grid3"><label class="fld">Uzunligi, m<input class="inp numin" id="c-${c.id}-L" data-c="${c.id}" data-k="L" inputmode="decimal" value="${esc(c.L)}"></label><label class="fld">Eni, m<input class="inp numin" id="c-${c.id}-W" data-c="${c.id}" data-k="W" inputmode="decimal" value="${esc(c.W)}"></label><label class="fld">Qalinligi, m<input class="inp numin" id="c-${c.id}-T" data-c="${c.id}" data-k="T" inputmode="decimal" value="${esc(c.T)}"></label></div>`
     :`<div class="grid3"><label class="fld">Hajm, m³<input class="inp numin" id="c-${c.id}-V" data-c="${c.id}" data-k="V" inputmode="decimal" value="${esc(c.V)}"></label></div>`}
    <label class="fld" style="max-width:260px">Zavod narxi, so'm/m³ (solishtirish uchun)<input class="inp numin" id="c-${c.id}-factory" data-c="${c.id}" data-k="factory" inputmode="decimal" value="${esc(c.factory)}" placeholder="ixtiyoriy"></label>
    <div id="cd-${c.id}"></div></div>`).join("")||`<div class="panel empty">Hali beton ishi yo'q.</div>`}</div>
  <p class="note">Retseptlar: СНиП 82-02-95 va ГОСТ 7473-2010 asosidagi ma'lumotnoma jadvali, 1 m³ uchun, portlandsement PC M500. PC M400 tanlansa sement sarfi 15% ga oshiriladi. Zichlik: shag'al ${fmt(S.settings.rhoSheben)} kg/m³, qum ${fmt(S.settings.rhoQum)} kg/m³ (Narxlar → Sozlamalar).</p></div>`;
}
function renderConcreteDerived(){S.concrete.forEach(c=>{const el=$("#cd-"+c.id);if(!el)return;const k=concreteCalc(c);const f=num(c.factory);
  el.innerHTML=`<div class="mix"><div><span>Sement</span><b>${fmt(k.cem*k.vol)} kg</b><span>${fd(k.cem*k.vol/50,1)} qop × 50 kg</span></div><div><span>Shag'al</span><b>${fd(k.lines[1].qty)} m³</b><span>${fmt(k.sheb*k.vol)} kg</span></div><div><span>Qum</span><b>${fd(k.lines[2].qty)} m³</b><span>${fmt(k.qum*k.vol)} kg</span></div><div><span>Suv</span><b>${fmt(k.suv*k.vol)} l</b><span>${fd(k.vol)} m³ beton</span></div></div>
  <div class="row" style="justify-content:space-between;align-items:end;margin-top:4px"><div><div class="eyebrow">1 m³ tannarxi (materiallar)</div><div class="big">${fmt(k.perM3)} so'm</div></div><div style="text-align:right"><div class="eyebrow">Jami materiallar</div><div class="big">${fmt(k.mat)} so'm</div></div></div>
  ${f>0&&k.perM3>0?`<p class="note" style="margin:6px 0 0">Zavod narxi ${fmt(f)} so'm/m³ — o'zingiz qorishtirsangiz ${k.perM3<f?"<b style=\"color:var(--good)\">"+fmt(f-k.perM3)+" so'm arzon</b>":"<b style=\"color:var(--danger)\">"+fmt(k.perM3-f)+" so'm qimmat</b>"} (ish haqisiz).</p>`:""}`})}

function viewPrices(){
  const groups=[...new Set(S.prices.map(p=>p.g))];const st=S.settings;
  return `<div class="pagehead"><div><h2>Narxlar bazasi — ${esc(S.obj.quarter)}</h2><p>Har bir material uchun 3 ta manbadan narx kiriting (zavod, karyer, do'kon, birja). Dastur o'rtachasini hisoblaydi; kerakli narxni tanlang. Narxlar har chorakda yangilanadi.</p></div></div>
  <div class="section"><div class="tscroll"><table class="ptable"><thead><tr><th>Material</th><th>Birlik</th><th>1-manba</th><th>2-manba</th><th>3-manba</th><th>Tanlov</th><th class="r">Qo'llanadigan narx</th></tr></thead><tbody>
  ${groups.map(g=>`<tr class="grp"><td colspan="7">${esc(g)}</td></tr>`+S.prices.filter(p=>p.g===g).map(p=>`<tr><td class="p-name"><div class="itemname">${esc(p.n)} <span class="mobonly note">/ ${esc(p.u)}</span></div>${p.s?`<div class="itemsub">${esc(p.s)}</div>`:""}</td><td class="p-unit">${esc(p.u)}</td>
   ${[0,1,2].map(i=>`<td class="p-src" data-l="${i+1}-manba"><input class="inp numin" id="p-${p.id}-${i}" data-p="${p.id}" data-i="${i}" inputmode="decimal" value="${esc(p.src[i])}" aria-label="${i+1}-manba narxi"></td>`).join("")}
   <td class="p-mode"><div class="row" style="flex-wrap:nowrap;gap:6px"><select class="inp" style="width:auto" id="p-${p.id}-mode" data-p="${p.id}" data-k="mode">${Object.entries(MODE_L).map(([k,l])=>`<option value="${k}"${k===p.mode?" selected":""}>${l}</option>`).join("")}</select>${p.mode==="manual"?`<input class="inp numin" style="width:110px" id="p-${p.id}-manual" data-p="${p.id}" data-k="manual" inputmode="decimal" value="${esc(p.manual)}" aria-label="Qo'lda narx">`:""}</div></td>
   <td class="num r p-res" data-l="Narx" id="pr-${p.id}"><b>${fmt(priceOf(p.id))}</b></td></tr>`).join("")).join("")}
  </tbody></table></div>
  <div class="panel pad stack"><h3 style="font-size:16px">Ish haqi va sozlamalar</h3>
   <div class="grid4">
    <label class="fld">O'rtacha oylik (qurilish), so'm<input class="inp numin" id="s-monthly" data-s="monthly" inputmode="decimal" value="${esc(st.monthly)}"></label>
    <label class="fld">Oyiga ish soati<input class="inp numin" id="s-hoursMonth" data-s="hoursMonth" inputmode="decimal" value="${esc(st.hoursMonth)}"></label>
    <label class="fld">Material zaxirasi, %<input class="inp numin" id="s-reserve" data-s="reserve" inputmode="decimal" value="${esc(st.reserve)}"></label>
    <label class="fld">Kutilmagan xarajatlar, %<input class="inp numin" id="s-contingency" data-s="contingency" inputmode="decimal" value="${esc(st.contingency)}"></label>
    <label class="fld">Plintus uzunligi (1 dona), m<input class="inp numin" id="s-piece" data-s="piece" inputmode="decimal" value="${esc(st.piece)}"></label>
    <label class="fld">Shag'al zichligi, kg/m³<input class="inp numin" id="s-rhoSheben" data-s="rhoSheben" inputmode="decimal" value="${esc(st.rhoSheben)}"></label>
    <label class="fld">Qum zichligi, kg/m³<input class="inp numin" id="s-rhoQum" data-s="rhoQum" inputmode="decimal" value="${esc(st.rhoQum)}"></label>
    <label class="fld">Beton ishi, soat/m³<input class="inp numin" id="s-concreteHours" data-s="concreteHours" inputmode="decimal" value="${esc(st.concreteHours)}"></label>
   </div>
   <label class="row" style="gap:8px;align-items:center"><input type="checkbox" id="s-vat" data-s="vat"${st.vat?" checked":""}> QQS 12% qo'shilsin</label>
   <p class="note" style="margin:0" id="rateNote">Soatlik stavka: <b class="mono">${fmt(rate())} so'm</b>. Standart qiymat — qurilish sohasida 2026-yil yanvar–iyun o'rtacha oylik ish haqi 7,03 mln so'm (Milliy statistika qo'mitasi). Narxlar namunaviy; o'z manbalaringizdagi narxlarni kiriting.</p>
  </div></div>`;
}

function viewSmeta(){
  const s=buildSmeta();let n=0;
  const rows=s.groups.map(g=>`<tr class="grp"><td colspan="9">${esc(g.title)} <span class="note" style="font-family:var(--f-mono);font-weight:400">${esc(g.sub)}</span></td></tr>`+
   g.lines.map(l=>{const t=lineTotals(l);n++;return `<tr><td class="num hm">${n}</td><td><div class="itemname">${esc(l.name)}</div>${l.sub?`<div class="itemsub">${esc(l.sub)}</div>`:""}<div class="itemsub mobonly mono">${fmt(l.price)} so'm/${esc(l.unit)}</div></td><td class="hm">${esc(l.unit)}</td><td class="num r">${fd(l.qty)}<span class="mobonly"> ${esc(l.unit)}</span></td><td class="num r hm">${fmt(l.price)}</td><td class="num r hm">${fmt(t.mat)}</td><td class="num r hm">${fmt(t.lab)}</td><td class="num r"><b>${fmt(t.tot)}</b></td><td class="hm"><span class="tag${l.kind==="auto"?" auto":l.kind==="own"?" own":""}">${esc(l.src)}</span></td></tr>`}).join("")+
   `<tr class="sub"><td class="hm"></td><td colspan="2" class="colfix">Jami: ${esc(g.title)}</td><td class="hm" colspan="2"></td><td class="num r hm">${fmt(g.mat)}</td><td class="num r hm">${fmt(g.lab)}</td><td class="num r">${fmt(g.mat+g.lab)}</td><td class="hm"></td></tr>`).join("");
  return `<div class="pagehead"><div><h2>Smeta: ${esc(S.obj.name)}</h2><p>${esc(S.obj.region)} · ${esc(S.obj.quarter)} narxlarida · soddalashtirilgan hisob (davlat standarti formati keyingi versiyada)</p></div>
   <div class="row"><button class="btn dark" data-act="copyTsv">Excel uchun nusxa olish</button><button class="btn" data-act="copyTxt">Matn sifatida nusxa</button></div></div>
  <div class="section"><div class="sumgrid"><div><span>Materiallar</span><b>${fmt(s.mat)}</b></div><div><span>Ish haqi</span><b>${fmt(s.lab)}</b></div><div><span>Kutilmagan xarajatlar ${S.settings.contingency}%</span><b>${fmt(s.cont)}</b></div>${S.settings.vat?`<div><span>QQS 12%</span><b>${fmt(s.vat)}</b></div>`:""}<div class="g"><span>Jami, so'm</span><b>${fmt(s.grand)}</b></div></div>
  <div class="tscroll"><table><thead><tr><th class="hm">№</th><th>Nomi</th><th class="hm">Birlik</th><th class="r">Miqdor</th><th class="r hm">Narx</th><th class="r hm">Material</th><th class="r hm">Ish haqi</th><th class="r">Jami</th><th class="hm">Manba</th></tr></thead><tbody>${rows||`<tr><td colspan="9" class="empty">Smeta bo'sh.</td></tr>`}</tbody></table></div>
  <div id="fallback"></div></div>`;
}
function smetaTsv(){const s=buildSmeta();const L=[["№","Nomi","Tafsilot","Birlik","Miqdor","Narx","Material","Ish haqi","Jami"].join("\t")];let n=0;
  s.groups.forEach(g=>{L.push(["",g.title+" ("+g.sub+")"].join("\t"));g.lines.forEach(l=>{const t=lineTotals(l);n++;L.push([n,l.name,l.sub,l.unit,fd(l.qty),Math.round(l.price),Math.round(t.mat),Math.round(t.lab),Math.round(t.tot)].join("\t"))})});
  L.push(["","Materiallar","","","","",Math.round(s.mat)].join("\t"),["","Ish haqi","","","","","",Math.round(s.lab)].join("\t"),["","Kutilmagan xarajatlar "+S.settings.contingency+"%","","","","","","",Math.round(s.cont)].join("\t"));
  if(S.settings.vat)L.push(["","QQS 12%","","","","","","",Math.round(s.vat)].join("\t"));
  L.push(["","JAMI","","","","","","",Math.round(s.grand)].join("\t"));return L.join("\n")}
function smetaTxt(){const s=buildSmeta();let o=`SMETA: ${S.obj.name}\n${S.obj.region}, ${S.obj.quarter}\n\n`;let n=0;
  s.groups.forEach(g=>{o+=`${g.title} (${g.sub})\n`;g.lines.forEach(l=>{n++;o+=`${n}. ${l.name} — ${fd(l.qty)} ${l.unit} × ${fmt(l.price)} = ${fmt(lineTotals(l).tot)} so'm\n`});o+=`   Jami: ${fmt(g.mat+g.lab)} so'm\n\n`});
  o+=`Materiallar: ${fmt(s.mat)}\nIsh haqi: ${fmt(s.lab)}\nKutilmagan xarajatlar: ${fmt(s.cont)}\n${S.settings.vat?"QQS 12%: "+fmt(s.vat)+"\n":""}JAMI: ${fmt(s.grand)} so'm`;return o}
function copy(text){const done=()=>toast("Nusxa olindi — Excel yoki Telegramga joylang");
  const fb=()=>{const f=$("#fallback");if(f){f.innerHTML=`<p class="note">Avtomatik nusxa olinmadi. Matnni belgilab, nusxa oling:</p><textarea class="fallback inp" readonly>${esc(text)}</textarea>`;const t=f.querySelector("textarea");t.focus();t.select()}};
  try{navigator.clipboard.writeText(text).then(done,fb)}catch(e){fb()}}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}

/* ---------- modal: add item ---------- */
let M=null;
function openPick(cid){const c=CAT_INDEX[cid];M={cid,vi:0};
  const v=c.v;
  $("#modal").innerHTML=`<div class="backdrop" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-t">
   <div class="sh"><div><div class="eyebrow">${esc(c.g)}</div><h3 id="m-t" style="font-size:20px">${esc(c.n)}</h3></div><button class="btn ghost" data-act="close" aria-label="Yopish">×</button></div>
   <div class="sb">
    ${v?`<label class="fld">Turi<select class="inp" id="m-variant">${v.map((x,i)=>`<option value="${i}">${esc(x[0])} — ${fmt(x[1])} so'm</option>`).join("")}</select></label>`:""}
    <div class="grid3">
     <label class="fld">${c.u==="dona"?"Soni":"Miqdori"}, ${esc(c.u)}<input class="inp numin" id="m-qty" inputmode="decimal" value="1"></label>
     <label class="fld">Narx, so'm/${esc(c.u)}<input class="inp numin" id="m-price" inputmode="decimal" value="${v?v[0][1]:c.p}"></label>
     ${c.w?`<label class="fld">Quvvati, Vt<input class="inp numin" id="m-watt" inputmode="decimal" placeholder="36"></label>`:""}
    </div>
    ${c.dims?`<fieldset><legend class="eyebrow">O'lchami, sm (ixtiyoriy)</legend><div class="grid3"><label class="fld">Uzunligi / eni<input class="inp numin" id="m-l" inputmode="decimal"></label><label class="fld">Chuqurligi<input class="inp numin" id="m-w" inputmode="decimal"></label><label class="fld">Balandligi<input class="inp numin" id="m-h" inputmode="decimal"></label></div></fieldset>`:""}
    <label class="fld">Izoh (holati, rangi, joyi)<input class="inp" id="m-note" placeholder="masalan: eski, almashtiriladi"></label>
    <div class="preview"><span>O'rnatish: ${fd(v&&v[0][2]!=null?v[0][2]:c.h,1)} soat/${esc(c.u)}</span><b class="mono" id="m-sum"></b></div>
   </div>
   <div class="sf"><button class="btn" data-act="close">Bekor qilish</button><button class="btn pri" data-act="modalAdd">Xonaga qo'shish</button></div></div></div>`;
  $("#modal").hidden=false;updModalSum();setTimeout(()=>$("#m-qty")?.select(),30);
}
function openCustom(){M={custom:true};
  $("#modal").innerHTML=`<div class="backdrop" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-t">
   <div class="sh"><div><div class="eyebrow">O'z elementingiz</div><h3 id="m-t" style="font-size:20px">Ro'yxatda yo'q narsa</h3></div><button class="btn ghost" data-act="close" aria-label="Yopish">×</button></div>
   <div class="sb">
    <label class="fld">Nomi<input class="inp" id="m-name" placeholder="masalan: Oyna, Akvarium, Sport trenajyori"></label>
    <div class="grid3">
     <label class="fld">Birlik<select class="inp" id="m-unit">${["dona","m","m²","m³","kg","komplekt"].map(u=>`<option>${u}</option>`).join("")}</select></label>
     <label class="fld">Miqdori<input class="inp numin" id="m-qty" inputmode="decimal" value="1"></label>
     <label class="fld">Narx, so'm<input class="inp numin" id="m-price" inputmode="decimal" placeholder="0"></label>
    </div>
    <div class="grid3">
     <label class="fld">O'lchami (erkin)<input class="inp" id="m-dims" placeholder="60×80 sm"></label>
     <label class="fld">O'rnatish, soat/birlik<input class="inp numin" id="m-hours" inputmode="decimal" value="0"></label>
     <label class="fld">Izoh<input class="inp" id="m-note"></label>
    </div>
    <div class="preview"><span>Smetaga "qo'lda" belgisi bilan tushadi</span><b class="mono" id="m-sum"></b></div>
    <p class="note" id="m-err" style="margin:0;color:var(--danger)" hidden>Nomini yozing.</p>
   </div>
   <div class="sf"><button class="btn" data-act="close">Bekor qilish</button><button class="btn pri" data-act="modalAdd">Xonaga qo'shish</button></div></div></div>`;
  $("#modal").hidden=false;updModalSum();setTimeout(()=>$("#m-name")?.focus(),30);
}
function updModalSum(){const el=$("#m-sum");if(!el)return;el.textContent=fmt(num($("#m-qty")?.value)*num($("#m-price")?.value))+" so'm"}
function closeModal(){$("#modal").hidden=true;$("#modal").innerHTML="";M=null}
function modalAdd(){const r=curRoom();if(!r||!M)return;
  if(M.custom){const name=$("#m-name").value.trim();if(!name){$("#m-err").hidden=false;$("#m-name").focus();return}
    r.items.push({uid:uid(),cid:null,name,variant:"",unit:$("#m-unit").value,qty:$("#m-qty").value||"1",price:$("#m-price").value||"0",h:$("#m-hours").value||"0",dims:$("#m-dims").value.trim(),watt:"",note:$("#m-note").value.trim(),custom:true})}
  else{const c=CAT_INDEX[M.cid];const vi=$("#m-variant")?+$("#m-variant").value:0;const v=c.v&&c.v[vi];
    const d=["#m-l","#m-w","#m-h"].map(s=>$(s)?.value.trim()).filter(Boolean);
    r.items.push({uid:uid(),cid:c.id,name:c.n,variant:v?v[0]:"",unit:c.u,qty:$("#m-qty").value||"1",price:$("#m-price").value||"0",h:v&&v[2]!=null?v[2]:c.h,dims:d.length?d.join("×")+" sm":"",watt:$("#m-watt")?.value.trim()||"",note:$("#m-note").value.trim(),custom:false})}
  const nm=M.custom?$("#m-name").value.trim():CAT_INDEX[M.cid].n;
  closeModal();document.body.classList.remove("cat-open");S.sample=false;renderDerived();renderTotal();save();toast(nm+" qo'shildi");
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;const r=curRoom();
  if(a==="closeBg"&&e.target!==b)return;
  switch(a){
   case "tab":document.body.classList.remove("cat-open");S.ui.tab=b.dataset.k;render();window.scrollTo(0,0);if(S.ui.tab==="beton")renderConcreteDerived();break;
   case "room":S.ui.room=b.dataset.id;S.ui.confirmDel=null;render();break;
   case "addRoom":{const t=$("#newType").value;const n=S.rooms.filter(x=>x.type===t).length;const nr=mkRoom(t,n?`${t} ${n+1}`:t);S.rooms.push(nr);S.ui.room=nr.id;S.ui.grp="Tavsiya";render();$("#r-L")?.focus();break}
   case "delRoom":if(S.ui.confirmDel!==r.id){S.ui.confirmDel=r.id;render();break}S.rooms=S.rooms.filter(x=>x.id!==r.id);S.ui.room=S.rooms[0]?.id;S.ui.confirmDel=null;render();break;
   case "reset":if(!S.ui.confirmReset){S.ui.confirmReset=true;render();break}{const st=S.settings,pr=S.prices;const nr=mkRoom("Mehmonxona");S={v:1,sample:false,obj:{name:"Yangi obyekt",region:S.obj.region,quarter:S.obj.quarter},settings:st,prices:pr,rooms:[nr],concrete:[],ui:{tab:"xonalar",room:nr.id,grp:"Tavsiya",q:""}};render();$("#r-L")?.focus()}break;
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
   case "addConc":S.concrete.push({id:uid(),name:"Yangi beton ishi",grade:"M200",cem:"M500",mode:"vol",L:"",W:"",T:"",V:"1",factory:""});render();renderConcreteDerived();break;
   case "delConc":S.concrete=S.concrete.filter(c=>c.id!==b.dataset.id);render();renderConcreteDerived();break;
   case "copyTsv":copy(smetaTsv());break;
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
  if(t.dataset.s){S.settings[t.dataset.s]=t.type==="checkbox"?t.checked:t.value;const n=$("#rateNote b");if(n)n.textContent=fmt(rate())+" so'm";renderTotal();save();return}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal();if(e.key==="Enter"&&!$("#modal").hidden&&e.target.tagName==="INPUT"){e.preventDefault();modalAdd()}});

render();if(S.ui.tab==="beton")renderConcreteDerived();
