/* SmetaGo — bosh sahifadagi jonli kalkulyator (ro'yxatdan o'tmasdan).
 * Hisob ilovadagi bilan bir xil: calc.js dagi roomCalc() va lineTotals().
 * Namuna xona: bitta eshik va bitta deraza, xona elementlarisiz — faqat pardozlash va ish haqi.
 */
const S={settings:{...DEFAULT_SETTINGS},prices:defaultPrices()};
const room={L:"5",W:"4",H:"2,8",doors:[mkDoor()],windows:[{w:"1,5",h:"1,5"}],
  floor:"laminat",wall:"boyoq",ceil:"shift_boyoq",tileLen:"",tileH:"",plinthOv:""};
const hc=id=>document.getElementById(id);

function hcInputs(){
  const dim=(k,l)=>`<label class="fld">${tr(l)}${stepper(`<input class="inp numin" id="hc-${k}" data-k="${k}" inputmode="decimal" value="${esc(room[k])}">`,"hc-"+k,.1)}</label>`;
  const sel=(k,o,l)=>`<label class="fld">${tr(l)}<select class="inp" data-k="${k}">${Object.entries(o).filter(([,v])=>v.pid).map(([key,v])=>`<option value="${key}"${key===room[k]?" selected":""}>${esc(lab(v))}</option>`).join("")}</select></label>`;
  hc("hc-inputs").innerHTML=`<div class="grid3">${dim("L","Uzunligi")}${dim("W","Eni")}${dim("H","Balandligi")}</div>
   <div class="grid3 g-stack">${sel("floor",FLOOR,"Pol")}${sel("wall",WALL,"Devor")}${sel("ceil",CEIL,"Shift")}</div>`;
}
function hcUpdate(){
  const c=roomCalc(room);
  hc("hc-plan").innerHTML=planSvg(num(room.L),num(room.W));
  hc("hc-lines").innerHTML=c.lines.map(l=>`<li><span>${esc(l.name)}<small>${esc(l.sub)}</small></span><b class="mono">${l.unit==="dona"?fmt(l.qty):fd(l.qty)} ${esc(U(l.unit))}</b></li>`).join("")
    ||`<li><span>${tr("O'lchamlarni kiriting — pol, plintus, devor va shift hisobi shu yerda chiqadi.")}</span></li>`;
  hc("hc-total").textContent=`${fmt(sum(c.lines.map(l=>lineTotals(l).tot)))} ${tr("so'm")}`;
}
if(hc("hero-calc")){
  hcInputs();hcUpdate();
  hc("hero-calc").addEventListener("input",e=>{const k=e.target.dataset.k;if(k){room[k]=e.target.value;hcUpdate()}});
  hc("hero-calc").addEventListener("click",e=>{const b=e.target.closest("[data-act=step]");if(b)stepInput(hc(b.dataset.for),+b.dataset.d)});
}
