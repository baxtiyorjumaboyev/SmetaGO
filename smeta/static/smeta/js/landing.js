/* SmetaGo — bosh sahifadagi jonli kalkulyator.
 * Formulalar va narxlar ilovaning o'zidan: calc.js (roomCalc, lineTotals) + #smeta-ref (bazadagi ma'lumotnoma),
 * shuning uchun bu yerdagi summa ilovada shu xonani kiritgandagi summa bilan aynan bir xil.
 * "Saqlash" bosilganda xona "smetago-draft" ga yoziladi; ro'yxatdan o'tgach yangi obyektga o'zi tushadi (app.js applyDraft). */
(function(){
  const box=document.getElementById("calc");if(!box)return;
  // app.js bosh sahifada yuklanmaydi — kerakli yordamchilar shu yerda
  const SOM=tr("so'm");
  const rtLabel=k=>(ROOM_TYPES[k]&&ROOM_TYPES[k].l)||tr(k);
  // calc.js global S dan o'qiydi: sozlamalar va narxlar — yangi obyektdagi kabi standart
  window.S={settings:{...DEFAULT_SETTINGS},prices:defaultPrices(),rooms:[],concrete:[]};
  const TYPES=["Yotoqxona","Mehmonxona","Oshxona","Hammom"].filter(k=>ROOM_TYPES[k]);
  const start=ROOM_TYPES.Mehmonxona?"Mehmonxona":Object.keys(ROOM_TYPES)[0];
  const t0=ROOM_TYPES[start]||ROOM_DEFAULT;
  // ilovadagi yangi xona bilan bir xil: 1 ta eshik (mkDoor), derazasiz (app.js mkRoom)
  const room={type:start,L:"5",W:"4",H:"2,8",doors:[mkDoor()],windows:[],floor:t0.floor,wall:t0.wall,ceil:t0.ceil,tileLen:"",tileH:"",plinthOv:""};
  const LIM={L:[0.5,50],W:[0.5,50],H:[2,10]};
  const $$=id=>document.getElementById(id);

  const opts=(o,cur)=>Object.entries(o).map(([k,v])=>`<option value="${k}"${k===cur?" selected":""}>${esc(lab(v))}</option>`).join("");
  function renderTypes(){
    $$("calc-types").innerHTML=TYPES.map(k=>`<button type="button" class="chip" data-type="${esc(k)}" aria-pressed="${k===room.type}">${esc(rtLabel(k))}</button>`).join("")}
  function renderSelects(){$$("calc-floor").innerHTML=opts(FLOOR,room.floor);$$("calc-wall").innerHTML=opts(WALL,room.wall);$$("calc-ceil").innerHTML=opts(CEIL,room.ceil)}

  let r3=null;
  function update(){
    const c=roomCalc(room);let mat=0,labr=0;
    $$("calc-lines").innerHTML=c.lines.map(l=>{const t=lineTotals(l);mat+=t.mat;labr+=t.lab;
      return `<li><div><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></div><div class="r"><b>${fd(l.qty)} ${esc(U(l.unit))}</b><small>${fmt(t.tot)} ${SOM}</small></div></li>`}).join("");
    // jonli 3D xona (room3d.js) — o'lcham, eshik va deraza o'zgarsa silliq yangilanadi; bo'lmasa 2D reja
    if(!r3&&window.Room3D){const cv=document.createElement("canvas");cv.className="r3d";cv.setAttribute("role","img");
      cv.setAttribute("aria-label",tr("Xonaning 3D ko'rinishi"));$$("calc-plan").replaceChildren(cv);r3=Room3D(cv,{})}
    if(r3)r3.set({L:num(room.L),W:num(room.W),H:num(room.H),doors:room.doors.map(d=>({w:num(d.w),h:num(d.h)})),windows:room.windows.map(o=>({w:num(o.w),h:num(o.h)}))});
    else $$("calc-plan").innerHTML=planSvg(num(room.L),num(room.W));
    $$("calc-sum").innerHTML=`${fmt(mat+labr)} <span>${SOM}</span>`;
    $$("calc-split").textContent=`${tr("Material")} ${fmt(mat)} · ${tr("Ish haqi")} ${fmt(labr)}`;
  }
  const clamp=(k,v)=>Math.min(LIM[k][1],Math.max(LIM[k][0],v));
  const show=v=>fd(v,2).replace(/,?0+$/,"");

  box.addEventListener("click",e=>{
    const tb=e.target.closest("[data-type]");
    if(tb){const k=tb.dataset.type,t=ROOM_TYPES[k];room.type=k;Object.assign(room,{floor:t.floor,wall:t.wall,ceil:t.ceil});renderTypes();renderSelects();update();return}
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

  renderTypes();renderSelects();update();
})();
