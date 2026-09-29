/* SmetaGo — "Boshqaruv paneli" va "Smeta loyihalari" sahifalari.
 * Har bir obyekt summasi calc.js dagi buildSmeta() bilan — ilovadagi "Jami smeta" bilan aynan bir xil.
 * Sahifada qaysi blok bo'lsa (id bo'yicha), o'shasi chiziladi.
 */
let S;
const DASH=(()=>{try{return JSON.parse(document.getElementById("dash-data").textContent)}catch(e){return []}})();
const CATS=[["pol",tr("Pol"),"#16a34a"],["devor",tr("Devor"),"#2563eb"],["shift",tr("Shift"),"#f59e0b"],["element",tr("Elementlar"),"#8b5cf6"],["beton",tr("Beton"),"#64748b"]];
const SOMs=tr("so'm"),$id=id=>document.getElementById(id);
// qisqa son: [qiymat, birlik] — 14,2 mlrd / 69,2 mln / 450 ming
const shortP=n=>n>=1e9?[fd(n/1e9,1),tr("mlrd")]:n>=1e6?[fd(n/1e6,1),tr("mln")]:n>=1e3?[fmt(n/1e3),tr("ming")]:[fmt(n),""];
const short=n=>shortP(n).join(" ").trim();
const hhmm=iso=>{const d=new Date(iso);return isNaN(d)?"":d.toLocaleString("ru-RU",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}).replace(",","")};
const thisMonth=iso=>{const d=new Date(iso),n=new Date();return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()};
const IC={sum:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
  obj:'<path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21M3 21h18M7.5 8h3M7.5 12h3M7.5 16h3"/>',
  area:'<path d="M3 17l9 4 9-4-9-4z"/><path d="M3 12l9 4 9-4M12 3l9 4-9 4-9-4z"/>',
  sync:'<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2"/>'};
const svg=(p,c="")=>`<svg viewBox="0 0 24 24" class="${c}" aria-hidden="true">${p}</svg>`;

// har obyekt: summalar, bo'limlar, xonalar, qatorlar
const rows=DASH.map(o=>{
  const r={id:o.id,name:o.name,url:o.url,created:o.created,updated:o.updated,region:"",rooms:[],lines:[],floor:0,wall:0,mat:0,lab:0,cont:0,vat:0,grand:0,cats:{},ok:false};
  if(!o.state||o.state.v!==1)return r;
  try{S=normState(JSON.parse(JSON.stringify(o.state)));const sm=buildSmeta();
    Object.assign(r,{ok:true,region:(S.obj&&S.obj.region)||"",mat:sm.mat,lab:sm.lab,cont:sm.cont,vat:sm.vat,grand:sm.grand});
    S.rooms.forEach(rm=>{const c=roomCalc(rm);const ls=[...c.lines,...rm.items.map(itemLine)];
      r.floor+=c.floorA;r.wall+=c.wallNet;
      r.rooms.push({name:rm.name,L:num(rm.L),W:num(rm.W),H:num(rm.H),area:c.floorA,tot:sum(ls.map(l=>lineTotals(l).tot)),
        doors:rm.doors.map(d=>({w:num(d.w),h:num(d.h)})),windows:rm.windows.map(w=>({w:num(w.w),h:num(w.h)}))})});
    sm.groups.forEach((g,gi)=>g.lines.forEach((l,li)=>{const t=lineTotals(l);const k=l.cat||"element";r.cats[k]=(r.cats[k]||0)+t.tot;
      r.lines.push({code:`${gi+1}-${li+1}`,name:l.name,sub:l.sub,unit:l.unit,qty:l.qty,price:l.price,tot:t.tot,mat:t.mat})}));
  }catch(e){}
  return r});
const tot=k=>sum(rows.map(r=>r[k]));
const okRows=rows.filter(r=>r.ok),latest=[...okRows].sort((a,b)=>a.updated<b.updated?1:-1)[0];

/* ---------- Boshqaruv paneli ---------- */
function kpis(){const el=$id("kpis");if(!el)return;
  let pend=0;try{pend=Object.keys(localStorage).filter(k=>k.indexOf("smetago-pending:")===0).length}catch(e){}
  const [gv,gu]=shortP(tot("grand")),newM=rows.filter(r=>thisMonth(r.created)).length,last=[...rows].sort((a,b)=>a.updated<b.updated?1:-1)[0];
  const K=[
    [IC.sum,newM?`↑ +${newM} ${tr("bu oy")}`:tr("Jami"),tr("Jami smeta qiymati"),gv,`${gu} ${SOMs}`,tr("Materiallar"),short(tot("mat"))],
    [IC.obj,tr("{0} ta obyekt",rows.length),tr("Faol obyektlar"),fmt(okRows.length),tr("ta hisoblangan"),tr("Xonalar"),fmt(sum(rows.map(r=>r.rooms.length)))],
    [IC.area,"m²",tr("Umumiy pol maydoni"),fd(tot("floor"),1),"m²",tr("Devor (sof)"),`${fd(tot("wall"),1)} m²`],
    [IC.sync,pend?tr("Navbatda"):tr("Tayyor"),tr("Sinxronizatsiya"),pend?fmt(pend):"100%",pend?tr("kutmoqda"):tr("saqlangan"),tr("Oxirgi saqlash"),last?hhmm(last.updated):"—"]];
  el.innerHTML=K.map(([ic,badge,lab,v,u,fl,fv],i)=>`<div class="kpi2 k${i+1}"><div class="k-top"><span class="k-ic">${svg(ic)}</span><span class="k-badge">${esc(badge)}</span></div>
    <p class="k-lab">${esc(lab)}</p><p class="k-val"><b class="mono">${esc(v)}</b> <span>${esc(u)}</span></p><div class="k-foot"><span>${esc(fl)}</span><b>${esc(fv)}</b></div></div>`).join("");
}
function model(){if(!$id("model"))return;
  const r3=window.Room3D?Room3D($id("model-3d"),{}):null;const o=latest;
  if(!o){$id("model-loc").textContent=tr("Obyekt qo'shing — 3D ko'rinish va summalar shu yerda chiqadi.");if(r3)r3.set({L:4.2,W:3.4,H:2.7});return}
  const room=[...o.rooms].sort((a,b)=>b.area-a.area)[0];
  $id("model-name").textContent=o.name;
  $id("model-loc").textContent=[o.region?tr(o.region):"",tr("{0} xona",o.rooms.length)].filter(Boolean).join(" · ");
  if(room){$id("model-room").textContent=`${room.name} · ${fd(room.L,1)} × ${fd(room.W,1)} m`;if(r3)r3.set(room)}
  $id("model-st").innerHTML=`<small>${tr("Oxirgi o'zgarish")}</small><b><i></i>${esc(hhmm(o.updated))}</b>`;
  const lp=o.grand?o.lab/o.grand*100:0;
  $id("model-bar").innerHTML=`<div><small>${tr("Jami smeta")}</small><b class="mono big">${fmt(o.grand)}</b><small>${SOMs}</small></div>
    <div><small>${tr("Materiallar")}</small><b class="mono">${fmt(o.mat)}</b><small>${SOMs}</small></div>
    <div class="mb-p"><small>${tr("Ish haqi ulushi")} <b>${fd(lp,1)}%</b></small><span class="pbar"><i style="width:${lp.toFixed(1)}%"></i></span><small>${fmt(o.lab)} ${SOMs}</small></div>`;
}
function stages(){const el=$id("stages");if(!el)return;const o=latest;
  if(!o||!o.rooms.length){el.innerHTML=`<p class="ometa">${tr("Xonalar hali kiritilmagan.")}</p>`;return}
  $id("rooms-note").textContent=o.name;
  const T=sum(o.rooms.map(r=>r.tot))||1;
  el.innerHTML=o.rooms.slice(0,4).map((r,i)=>{const p=r.tot/T*100;return `<div class="stage"><div class="st-h"><span>${i+1}-${tr("xona")}</span>${r.tot>0?svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.3 2.3 4.7-4.8"/>',"st-ok"):""}</div>
    <b>${esc(r.name)}</b><small>${tr("Maydon")}: ${fd(r.area)} m²</small><div class="st-p"><b>${fd(p,0)}%</b><small>${fmt(r.tot)} ${SOMs}</small></div><span class="pbar"><i style="width:${p.toFixed(1)}%"></i></span></div>`}).join("");
}
function lines(){const el=$id("lines");if(!el)return;const o=latest;
  if(!o){el.innerHTML=`<tr><td colspan="6" class="ometa">${tr("Hali hisoblangan obyekt yo'q.")}</td></tr>`;return}
  const top=[...o.lines].sort((a,b)=>b.tot-a.tot).slice(0,6);
  el.innerHTML=top.map(l=>`<tr><td class="code mono">${esc(l.code)}</td><td><b>${esc(l.name)}</b>${l.sub?`<small>${esc(l.sub)}</small>`:""}</td><td class="u">${esc(U(l.unit))}</td>
    <td class="r mono">${l.unit==="dona"?fmt(l.qty):fd(l.qty)}</td><td class="r mono">${fmt(l.price)}</td><td class="r mono"><b>${fmt(l.tot)}</b><span class="mbar"><i style="width:${l.tot?(l.mat/l.tot*100).toFixed(0):0}%"></i></span></td></tr>`).join("");
  $id("lines-note").textContent=tr("Ko'rsatilgan: {0} ta pozitsiya (jami {1} tadan)",top.length,o.lines.length);
  $id("lines-open").href=o.url;
}
function highlight(){const el=$id("hl");if(!el)return;const G=tot("grand");
  el.innerHTML=`<div class="hl-h"><b>${tr("Kutilmagan xarajatlar zaxirasi")}</b><span>${G?fd(tot("cont")/G*100,1):"0,0"}%</span></div>
    <p>${tr("Barcha obyektlar bo'yicha: materiallar {0}, ish haqi {1} so'm.",short(tot("mat")),short(tot("lab")))}</p>
    <p class="hl-v"><b class="mono">${esc(shortP(tot("cont"))[0])}</b> <span>${esc(shortP(tot("cont"))[1])} ${SOMs}</span></p>`;
}
function cats(){const el=$id("cats");if(!el)return;
  const vals=CATS.map(([k])=>sum(rows.map(r=>r.cats[k]||0))),mx=Math.max(...vals,1);
  el.innerHTML=CATS.map(([,l,c],i)=>`<div class="cat"><div class="cat-h"><span>${esc(l)}</span><b>${esc(short(vals[i]))} ${SOMs}</b></div><span class="pbar"><i style="width:${(vals[i]/mx*100).toFixed(1)}%;background:${c}"></i></span></div>`).join("");
}
function feed(){const el=$id("feed");if(!el)return;
  const d=[...rows].sort((a,b)=>a.updated<b.updated?1:-1).slice(0,4);
  el.innerHTML=d.map(r=>`<li><span class="f-ic">${svg('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>')}</span><div><a href="${esc(r.url)}">${esc(r.name)}</a>
    <small>${r.ok?`${tr("{0} xona",r.rooms.length)} · ${fmt(r.grand)} ${SOMs}`:tr("hali ochilmagan")}</small><small class="f-t">${esc(hhmm(r.updated))}</small></div></li>`).join("")
    ||`<li class="ometa">${tr("Hali o'zgarish yo'q.")}</li>`;
}

/* ---------- Smeta loyihalari ---------- */
function lyHero(){const el=$id("ly-kpis");if(!el)return;
  const newM=rows.filter(r=>thisMonth(r.created)).length,[pv,pu]=shortP(tot("grand")),[av,au]=shortP(okRows.length?tot("grand")/okRows.length:0);
  el.innerHTML=[[tr("Jami smetalar"),fmt(rows.length),tr("ta"),newM?`↗ +${newM} ${tr("bu oy")}`:""],
    [tr("Umumiy portfel"),pv,`${pu} ${SOMs}`,""],[tr("O'rtacha smeta"),av,`${au} ${SOMs}`,tr("hisoblangan obyektlar bo'yicha")]]
    .map(([k,v,u,n])=>`<div class="hk"><small>${esc(k)}</small><b class="mono">${esc(v)}</b><span>${esc(u)}</span>${n?`<em>${esc(n)}</em>`:""}</div>`).join("");
  const r3=window.Room3D&&$id("ly-3d")?Room3D($id("ly-3d"),{}):null,o=latest;
  if(r3){const rm=o&&[...o.rooms].sort((a,b)=>b.area-a.area)[0];r3.set(rm||{L:4.2,W:3.4,H:2.7})}
  if($id("ly-last"))$id("ly-last").textContent=o?o.name:tr("Hali obyekt yo'q");
}
function lyTable(){const tb=$id("ly-rows");if(!tb)return;
  rows.forEach(r=>{const tr_=tb.querySelector(`[data-id="${r.id}"]`);if(!tr_)return;
    tr_.dataset.new=thisMonth(r.created)?"1":"";tr_.dataset.ok=r.ok?"1":"";
    tr_.querySelector(".c-rooms").innerHTML=r.ok?`<b class="mono">${r.rooms.length}</b><small>${tr("xona")}</small>`:"—";
    tr_.querySelector(".c-area").innerHTML=r.ok?`<b class="mono">${fd(r.floor,1)} m²</b><small>${tr("pol maydoni")}</small>`:"—";
    tr_.querySelector(".c-sum").innerHTML=r.ok?`<b class="mono">${fmt(r.grand)}</b><small class="mono">${tr("mat.")} ${fmt(r.mat)}</small>`:`<small>${tr("hali ochilmagan")}</small>`;
    tr_.querySelector(".c-st").innerHTML=`<i class="dot ${r.ok?"ok":"wait"}" title="${r.ok?tr("Hisoblangan"):tr("Hali ochilmagan")}"></i>`});
  const q=$id("ly-q"),segs=document.querySelectorAll("#ly-filter [data-f]");let f="all";
  const apply=()=>{const s=(q?q.value:"").trim().toLowerCase();let n=0;
    tb.querySelectorAll("tr[data-id]").forEach(t=>{const show=(!s||t.dataset.name.includes(s))&&(f==="all"||(f==="new"&&t.dataset.new)||(f==="wait"&&!t.dataset.ok));t.hidden=!show;if(show)n++});
    if($id("ly-count"))$id("ly-count").textContent=tr("Ko'rsatilmoqda: {0} ta / {1} ta",n,rows.length)};
  q&&q.addEventListener("input",apply);
  segs.forEach(b=>b.addEventListener("click",()=>{f=b.dataset.f;segs.forEach(x=>x.setAttribute("aria-pressed",x===b));apply()}));
  const cnt=(k)=>rows.filter(k).length;
  document.querySelectorAll("[data-cnt]").forEach(el=>{el.textContent=cnt({all:()=>1,new:r=>thisMonth(r.created),wait:r=>!r.ok}[el.dataset.cnt])});
  apply();
}
function lyCalc(){const box=$id("qc");if(!box)return;
  S={settings:{...DEFAULT_SETTINGS},prices:defaultPrices(),rooms:[],concrete:[]};
  const g=$id("qc-grade");g.innerHTML=Object.keys(MIX).map(k=>`<option${k==="M300"?" selected":""}>${k}</option>`).join("");
  const run=()=>{const c={grade:g.value,cem:$id("qc-cem").value,mode:"vol",V:$id("qc-v").value};const k=concreteCalc(c);
    const labr=sum(k.lines.map(l=>lineTotals(l).lab)),direct=k.mat+labr,vat=$id("qc-vat").checked?direct*.12:0;
    $id("qc-lines").innerHTML=k.lines.slice(0,4).map(l=>`<div><span>${esc(l.name)}</span><b class="mono">${l.unit==="kg"?fmt(l.qty):fd(l.qty)} ${esc(U(l.unit))}</b><small class="mono">${fmt(l.qty*l.price)} ${SOMs}</small></div>`).join("");
    $id("qc-sum").innerHTML=`<div><span>${tr("To'g'ridan-to'g'ri xarajatlar")}</span><b class="mono">${fmt(direct)} ${SOMs}</b></div>
      <div><span>${tr("Qo'shilgan qiymat solig'i (12%)")}</span><b class="mono">${fmt(vat)} ${SOMs}</b></div>
      <div class="qc-g"><span>${tr("Umumiy smeta")}</span><b class="mono">${fmt(direct+vat)}</b><small>${SOMs}</small></div>`};
  box.addEventListener("input",run);box.addEventListener("change",run);
  box.addEventListener("click",e=>{const b=e.target.closest("[data-act=step]");if(b)stepInput($id(b.dataset.for),+b.dataset.d)});
  run();
}
function lyDonut(){const el=$id("ly-donut");if(!el)return;
  const P=[[tr("Materiallar"),tot("mat"),"#15803d"],[tr("Ish haqi"),tot("lab"),"#0f766e"],[tr("Kutilmagan"),tot("cont"),"#b45309"],[tr("QQS"),tot("vat"),"#64748b"]].filter(p=>p[1]>0);
  const T=sum(P.map(p=>p[1])),R=52,C=2*Math.PI*R;let off=0;
  const arcs=T?P.map(([,v,c])=>{const len=v/T*C;const a=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;off+=len;return a}).join(""):`<circle r="${R}" cx="70" cy="70" fill="none" class="dn-empty" stroke-width="18"/>`;
  el.innerHTML=`<svg viewBox="0 0 140 140" class="donut" aria-hidden="true">${arcs}<text x="70" y="70" text-anchor="middle" class="dn-v">${T?"100%":"—"}</text><text x="70" y="86" text-anchor="middle" class="dn-k">${esc(tr("TANNARX"))}</text></svg>
    <ul class="legend">${P.map(([l,v,c])=>`<li><i style="background:${c}"></i><span>${esc(l)}</span><b class="mono">${fd(v/T*100,0)}%</b></li>`).join("")}</ul>`;
}

kpis();model();stages();lines();highlight();cats();feed();lyHero();lyTable();lyCalc();lyDonut();
