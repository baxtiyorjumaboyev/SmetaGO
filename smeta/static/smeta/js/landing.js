/* SmetaGo — bosh sahifadagi jonli kalkulyator (ro'yxatdan o'tmasdan).
 * Hisob ilovadagi bilan bir xil: calc.js dagi roomCalc() va lineTotals().
 * Namuna xona: bitta eshik va bitta deraza, xona elementlarisiz — faqat pardozlash va ish haqi.
 */
const S={settings:{...DEFAULT_SETTINGS},prices:defaultPrices()};
// xona turi tugmalari: odatiy o'lcham + qoplamalar (ROOM_TYPES dan)
const PRESETS={Yotoqxona:["4","3,5","2,8"],Mehmonxona:["5","4","2,8"],Oshxona:["3,5","3","2,8"],Hammom:["2","1,7","2,7"]};
const room={type:"Mehmonxona",L:"5",W:"4",H:"2,8",doors:[mkDoor()],windows:[{w:"1,5",h:"1,5"}],
  floor:"laminat",wall:"boyoq",ceil:"shift_boyoq",tileLen:"",tileH:"",plinthOv:""};
{const rt=ROOM_TYPES[room.type];if(rt)Object.assign(room,{floor:rt.floor,wall:rt.wall,ceil:rt.ceil})}
const hc=id=>document.getElementById(id);

function hcTypes(){
  hc("hc-types").innerHTML=Object.keys(PRESETS).map(k=>`<button type="button" class="lc-chip" data-type="${k}" aria-pressed="${room.type===k}">${esc((ROOM_TYPES[k]&&ROOM_TYPES[k].l)||tr(k))}</button>`).join("");
}
function hcInputs(){
  const dim=(k,l)=>`<label class="fld">${tr(l)}, ${U("m")}<span class="lc-num"><button type="button" data-act="step" data-for="hc-${k}" data-d="-0.1" aria-label="−">−</button><input class="inp numin" id="hc-${k}" data-k="${k}" inputmode="decimal" value="${esc(room[k])}"><button type="button" data-act="step" data-for="hc-${k}" data-d="0.1" aria-label="+">+</button></span></label>`;
  const sel=(k,o,l)=>`<label class="fld">${tr(l)}<select class="inp" id="hc-${k}" data-k="${k}">${Object.entries(o).filter(([,v])=>v.pid).map(([key,v])=>`<option value="${key}"${key===room[k]?" selected":""}>${esc(lab(v))}</option>`).join("")}</select></label>`;
  hc("hc-inputs").innerHTML=`<div class="lc-row">${dim("L","Uzunligi")}${dim("W","Eni")}${dim("H","Balandligi")}</div>
   <div class="lc-row">${sel("floor",FLOOR,"Pol")}${sel("wall",WALL,"Devor")}${sel("ceil",CEIL,"Shift")}</div>`;
}
function hcUpdate(){
  const c=roomCalc(room);let mat=0,lab=0;
  hc("hc-plan").innerHTML=planSvg(num(room.L),num(room.W));
  hc("hc-lines").innerHTML=c.lines.map(l=>{const t=lineTotals(l);mat+=t.mat;lab+=t.lab;
    return `<li><div><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></div><div class="r"><b>${l.unit==="dona"?fmt(l.qty):fd(l.qty)} ${esc(U(l.unit))}</b><small>${fmt(t.tot)} ${tr("so'm")}</small></div></li>`}).join("")
    ||`<li><div>${tr("O'lchamlarni kiriting — pol, plintus, devor va shift hisobi shu yerda chiqadi.")}</div></li>`;
  hc("hc-total").textContent=fmt(mat+lab);
  hc("hc-split").textContent=`${tr("Material")} ${fmt(mat)} · ${tr("Ish haqi")} ${fmt(lab)}`;
}
if(hc("hero-calc")){
  hcTypes();hcInputs();hcUpdate();
  hc("hero-calc").addEventListener("input",e=>{const k=e.target.dataset.k;if(k){room[k]=e.target.value;hcUpdate()}});
  hc("hero-calc").addEventListener("click",e=>{
    const b=e.target.closest("[data-act=step]");if(b){stepInput(hc(b.dataset.for),+b.dataset.d);return}
    const t=e.target.closest("[data-type]");if(!t)return;const k=t.dataset.type,rt=ROOM_TYPES[k]||{};
    [room.L,room.W,room.H]=PRESETS[k];Object.assign(room,{type:k,floor:rt.floor||room.floor,wall:rt.wall||room.wall,ceil:rt.ceil||room.ceil});
    hcTypes();hcInputs();hcUpdate()});
}
