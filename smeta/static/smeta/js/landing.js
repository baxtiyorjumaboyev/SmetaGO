/* SmetaGo — bosh sahifadagi jonli kalkulyator.
 * Formulalar va narxlar ilovaning o'zidan: calc.js (roomCalc, lineTotals) + #smeta-ref (bazadagi ma'lumotnoma),
 * shuning uchun bu yerdagi summa ilovada shu xonani kiritgandagi summa bilan aynan bir xil.
 * "Saqlash" bosilganda xona "smetago-draft" ga yoziladi; ro'yxatdan o'tgach yangi obyektga o'zi tushadi (app.js applyDraft). */
(function(){
  const box=document.getElementById("calc");if(!box)return;
  // app.js bosh sahifada yuklanmaydi — kerakli yordamchilar shu yerda
  const SOM=tr("so'm");
  // calc.js global S dan o'qiydi: sozlamalar va narxlar — yangi obyektdagi kabi standart
  window.S={settings:{...DEFAULT_SETTINGS},prices:defaultPrices(),rooms:[],concrete:[]};
  // xona turi tanlanmaydi (foydalanuvchi talabi) — umumiy xona, qoplamalarni o'zi tanlaydi
  const start=ROOM_TYPES.Boshqa?"Boshqa":Object.keys(ROOM_TYPES)[0];
  const t0=ROOM_TYPES[start]||ROOM_DEFAULT;
  // ilovadagi yangi xona bilan bir xil: 1 ta eshik (mkDoor), derazasiz (app.js mkRoom)
  const room={type:start,L:"5",W:"4",H:"2,8",doors:[mkDoor()],windows:[],floor:t0.floor,wall:t0.wall,ceil:t0.ceil,tileLen:"",tileH:"",plinthOv:""};
  const LIM={L:[0.5,50],W:[0.5,50],H:[2,10]};
  const $$=id=>document.getElementById(id);

  const opts=(o,cur)=>Object.entries(o).map(([k,v])=>`<option value="${k}"${k===cur?" selected":""}>${esc(lab(v))}</option>`).join("");
  function renderSelects(){$$("calc-floor").innerHTML=opts(FLOOR,room.floor);$$("calc-wall").innerHTML=opts(WALL,room.wall);$$("calc-ceil").innerHTML=opts(CEIL,room.ceil)}

  let r3=null;
  function update(){
    const c=roomCalc(room);let mat=0,labr=0;
    $$("calc-lines").innerHTML=c.lines.map(l=>{const t=lineTotals(l);mat+=t.mat;labr+=t.lab;
      return `<li><div><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></div><div class="r"><b>${fd(l.qty)} ${esc(U(l.unit))}</b><small>${fmt(t.tot)} ${SOM}</small></div></li>`}).join("");
    $$("calc-plan").innerHTML=planSvg(num(room.L),num(room.W));
    $$("calc-sum").innerHTML=`${fmt(mat+labr)} <span>${SOM}</span>`;
    $$("calc-split").textContent=`${tr("Material")} ${fmt(mat)} · ${tr("Ish haqi")} ${fmt(labr)}`;
  }
  const clamp=(k,v)=>Math.min(LIM[k][1],Math.max(LIM[k][0],v));
  const show=v=>fd(v,2).replace(/,?0+$/,"");

  box.addEventListener("click",e=>{
    const sb=e.target.closest("[data-step]");
    if(sb){const k=sb.dataset.step;const v=clamp(k,Math.round((num(room[k])+(+sb.dataset.d)*.1)*10)/10);room[k]=show(v);$$("calc-"+k).value=room[k];update()}
  });
  box.addEventListener("input",e=>{const el=e.target;
    if(el.dataset.dim){const v=num(el.value);if(v>0){room[el.dataset.dim]=String(clamp(el.dataset.dim,v)).replace(".",",");update()}}
    if(el.dataset.cover){room[el.dataset.cover]=el.value;update()}
  });
  box.addEventListener("change",e=>{const el=e.target;if(el.dataset.dim)el.value=room[el.dataset.dim]});
  $$("calc-save").addEventListener("click",()=>{
    const {type,L,W,H,floor,wall,ceil}=room;
    try{localStorage.setItem("smetago-draft",JSON.stringify({ts:Date.now(),room:{type,L,W,H,floor,wall,ceil}}))}catch(e){}
  });

  renderSelects();update();
})();
