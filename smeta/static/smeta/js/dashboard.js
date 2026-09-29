/* SmetaGo — "Asosiy" (dashboard): obyektlar bo'yicha KPI, grafik, tarkib va reyting.
 * Har bir obyekt summasi calc.js dagi buildSmeta() bilan — ilovadagi "Jami smeta" bilan aynan bir xil.
 */
let S;
const DASH=(()=>{try{return JSON.parse(document.getElementById("dash-data").textContent)}catch(e){return []}})();
const CATS=[["pol",tr("Pol"),"#16a34a"],["devor",tr("Devor"),"#2563eb"],["shift",tr("Shift"),"#f59e0b"],["element",tr("Elementlar"),"#8b5cf6"],["beton",tr("Beton"),"#64748b"]];
const SOMs=tr("so'm");
// qisqa son: 1,2 mlrd / 69,2 mln / 450 ming
const short=n=>n>=1e9?fd(n/1e9,1)+" "+tr("mlrd"):n>=1e6?fd(n/1e6,1)+" "+tr("mln"):n>=1e3?fmt(n/1e3)+" "+tr("ming"):fmt(n);

const rows=DASH.map(o=>{
  const r={id:o.id,name:o.name,url:o.url,created:o.created,updated:o.updated,rooms:0,mat:0,lab:0,cont:0,vat:0,grand:0,cats:{},ok:false};
  if(!o.state||o.state.v!==1)return r;
  try{S=normState(JSON.parse(JSON.stringify(o.state)));const sm=buildSmeta();
    Object.assign(r,{ok:true,rooms:S.rooms.length,mat:sm.mat,lab:sm.lab,cont:sm.cont,vat:sm.vat,grand:sm.grand});
    sm.groups.forEach(g=>g.lines.forEach(l=>{const k=l.cat||"element";r.cats[k]=(r.cats[k]||0)+lineTotals(l).tot}));
  }catch(e){}
  return r});
const tot=k=>sum(rows.map(r=>r[k]));
let metric="grand";

function spark(vals,color){if(vals.length<2)vals=[0,...vals,0];const mx=Math.max(...vals,1),w=120,h=34;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-3-(v/mx)*(h-8)).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" class="spark" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
function kpis(){
  const byDate=[...rows].sort((a,b)=>a.created<b.created?-1:1);
  const ok=rows.filter(r=>r.ok);
  const K=[[tr("Jami smeta"),short(tot("grand"))+" "+SOMs,"#22c55e",byDate.map(r=>r.grand)],
    [tr("Obyektlar"),fmt(rows.length),"#2563eb",byDate.map((r,i)=>i+1)],
    [tr("Xonalar"),fmt(tot("rooms")),"#f59e0b",byDate.map(r=>r.rooms)],
    [tr("O'rtacha smeta"),short(ok.length?tot("grand")/ok.length:0)+" "+SOMs,"#8b5cf6",byDate.map(r=>r.grand)]];
  document.getElementById("kpis").innerHTML=K.map(([k,v,c,s])=>`<div class="kpi"><div class="kpi-k"><i style="background:${c}"></i>${esc(k)}</div><b class="mono">${esc(v)}</b>${spark(s,c)}</div>`).join("");
}
function chart(){
  const lbl={grand:tr("Smeta summasi"),mat:tr("Materiallar"),lab:tr("Ish haqi")}[metric];
  document.getElementById("dc-label").textContent=lbl;
  document.getElementById("dc-total").textContent=fmt(tot(metric))+" "+SOMs;
  document.getElementById("dc-count").textContent=tr("{0} ta obyekt",rows.length);
  const data=[...rows].sort((a,b)=>a.updated<b.updated?1:-1).slice(0,12).reverse();
  const box=document.getElementById("dc-svg");
  if(!data.length){box.innerHTML=`<p class="dc-empty">${tr("Obyekt qo'shing — grafik shu yerda chiqadi.")}</p>`;return}
  const W=760,H=260,pl=58,pb=46,pt=12,mx=Math.max(...data.map(r=>r[metric]),1);
  const step=10**Math.floor(Math.log10(mx)),top=Math.ceil(mx/step)*step,cw=(W-pl-10)/data.length,bw=Math.min(46,cw*.56);
  let g="";for(let i=0;i<=4;i++){const v=top*i/4,y=H-pb-(H-pb-pt)*i/4;g+=`<line x1="${pl}" x2="${W-6}" y1="${y}" y2="${y}" class="dc-grid"/><text x="${pl-8}" y="${y+4}" text-anchor="end" class="dc-ax">${esc(short(v))}</text>`}
  const bars=data.map((r,i)=>{const h=(H-pb-pt)*r[metric]/top,x=pl+cw*i+(cw-bw)/2,y=H-pb-h;const nm=r.name.length>12?r.name.slice(0,11)+"…":r.name;
    return `<g><title>${esc(r.name)}: ${fmt(r[metric])} ${SOMs}</title><rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h,1)}" rx="5" class="dc-bar"/><text x="${x+bw/2}" y="${H-pb+18}" text-anchor="middle" class="dc-ax">${esc(nm)}</text></g>`}).join("");
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(lbl)}">${g}${bars}</svg>`;
}
function split(){const G=tot("grand")||1;
  const R=[[tr("Materiallar"),tot("mat")],[tr("Ish haqi"),tot("lab")],[tr("Kutilmagan xarajatlar"),tot("cont")],[tr("QQS"),tot("vat")]];
  document.getElementById("d-split").innerHTML=R.map(([k,v])=>`<div class="srow"><span>${esc(k)}</span><div><b class="mono">${fmt(v)}</b><small>${fd(v/G*100,1)}%</small></div></div>`).join("");
}
function donut(){
  const vals=CATS.map(([k])=>sum(rows.map(r=>r.cats[k]||0)));const T=sum(vals);
  const R=54,C=2*Math.PI*R;let off=0;
  const arcs=T?CATS.map(([,,c],i)=>{const len=vals[i]/T*C;const a=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${c}" stroke-width="20" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;off+=len;return a}).join(""):`<circle r="${R}" cx="70" cy="70" fill="none" class="dn-empty" stroke-width="20"/>`;
  document.getElementById("d-donut").innerHTML=`<svg viewBox="0 0 140 140" class="donut" aria-hidden="true">${arcs}<text x="70" y="68" text-anchor="middle" class="dn-v">${T?"100%":"—"}</text><text x="70" y="86" text-anchor="middle" class="dn-k">${esc(tr("{0} ta bo'lim",vals.filter(Boolean).length))}</text></svg>
   <ul class="legend">${CATS.map(([,l,c],i)=>`<li><i style="background:${c}"></i><span>${esc(l)}</span><b class="mono">${fmt(vals[i])}</b><small>${T?fd(vals[i]/T*100,1):"0,0"}%</small></li>`).join("")}</ul>`;
}
function top5(){const d=[...rows].filter(r=>r.grand>0).sort((a,b)=>b.grand-a.grand).slice(0,5);const mx=d[0]?.grand||1;
  document.getElementById("d-top").innerHTML=d.map((r,i)=>`<li><span class="tn">${i+1}</span><div><a href="${esc(r.url)}">${esc(r.name)}</a><div class="tb"><i style="width:${(r.grand/mx*100).toFixed(1)}%"></i></div></div><b class="mono">${fmt(r.grand)}</b></li>`).join("")
    ||`<li class="ometa">${tr("Hali hisoblangan obyekt yo'q.")}</li>`;
}
function cards(){rows.forEach(r=>{const el=document.querySelector(`[data-sum="${r.id}"]`);if(el)el.textContent=r.ok?`${fmt(r.grand)} ${SOMs}`:tr("hali ochilmagan")})}

document.getElementById("dash-metric")?.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;metric=b.dataset.m;
  e.currentTarget.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));chart()});
kpis();chart();split();donut();top5();cards();
