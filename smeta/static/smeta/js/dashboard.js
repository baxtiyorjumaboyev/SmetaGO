/* SmetaGo — "Boshqaruv paneli" va "Smeta loyihalari" sahifalari.
 * Obyektlar ro'yxati, hisob-kitoblar va tezkor beton kalkulyatori.
 */
(function() {
  let S;
  const DASH = (() => {
    try {
      return JSON.parse(document.getElementById("dash-data").textContent);
    } catch(e) {
      return [];
    }
  })();

  const SOMs = () => tr("so'm");
  const $id = id => document.getElementById(id);
  const shortP = n => n >= 1e9 ? [fd(n/1e9, 1), tr("mlrd")] : n >= 1e6 ? [fd(n/1e6, 1), tr("mln")] : n >= 1e3 ? [fmt(n/1e3), tr("ming")] : [fmt(n), ""];
  const short = n => shortP(n).join(" ").trim();
  const hhmm = iso => {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).replace(",", "");
  };
  const thisMonth = iso => {
    const d = new Date(iso), n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  };

  const IC = {
    sum: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    obj: '<path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21M3 21h18M7.5 8h3M7.5 12h3M7.5 16h3"/>',
    area: '<path d="M3 17l9 4 9-4-9-4z"/><path d="M3 12l9 4 9-4M12 3l9 4-9 4-9-4z"/>',
    concrete: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'
  };
  const svg = (p, c = "") => `<svg viewBox="0 0 24 24" class="${c}" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${p}</svg>`;

  // Merge server objects and any local draft / guest objects
  let allObjects = [...DASH];
  try {
    const guestList = JSON.parse(localStorage.getItem("smetago-guest-projects") || "[]");
    guestList.forEach(gp => {
      if (gp && gp.state && !allObjects.some(o => o.id === gp.id)) {
        allObjects.push({
          id: gp.id,
          name: gp.name || tr("Mening smetam"),
          url: "/app/",
          created: gp.updated || new Date().toISOString(),
          updated: gp.updated || new Date().toISOString(),
          state: gp.state
        });
      }
    });
  } catch(e) {}
  if (!allObjects.length) {
    try {
      const local = JSON.parse(localStorage.getItem("smetago-v1") || localStorage.getItem("smetago-demo"));
      if (local && local.v === 1 && local.rooms && local.rooms.length) {
        allObjects.push({
          id: "local",
          name: (local.obj && local.obj.name) || tr("Mening smetam"),
          url: "/app/",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          state: local
        });
      }
    } catch(e) {}
  }

  const rows = allObjects.map(o => {
    const r = {
      id: o.id, name: o.name, url: o.url, created: o.created, updated: o.updated,
      region: "", rooms: [], lines: [], floor: 0, wall: 0, mat: 0, lab: 0,
      cont: 0, vat: 0, grand: 0, concVol: 0, ok: false
    };
    if (!o.state || o.state.v !== 1) return r;
    try {
      S = normState(JSON.parse(JSON.stringify(o.state)));
      const sm = buildSmeta();
      Object.assign(r, {
        ok: true,
        region: (S.obj && S.obj.region) || "",
        mat: sm.mat, lab: sm.lab, cont: sm.cont, vat: sm.vat, grand: sm.grand
      });
      if (Array.isArray(S.rooms)) {
        S.rooms.forEach(rm => {
          const c = roomCalc(rm);
          r.floor += c.floorA;
          r.wall += c.wallNet;
          r.rooms.push({ name: rm.name, area: c.floorA });
        });
      }
      if (Array.isArray(S.concrete)) {
        S.concrete.forEach(c => {
          const k = concreteCalc(c);
          r.concVol += k.vol;
        });
      }
    } catch(e) {}
    return r;
  });

  const tot = k => sum(rows.map(r => r[k] || 0));
  const okRows = rows.filter(r => r.ok);

  function kpis() {
    const el = $id("kpis") || $id("ly-kpis");
    if (!el) return;
    const [gv, gu] = shortP(tot("grand"));
    const K = [
      [IC.sum, tr("Jami smeta qiymati"), gv, `${gu} ${SOMs()}`, tr("Materiallar"), short(tot("mat"))],
      [IC.obj, tr("Faol obyektlar"), fmt(okRows.length), tr("ta loyiha"), tr("Xonalar"), fmt(sum(rows.map(r => r.rooms.length)))],
      [IC.area, tr("Umumiy pol maydoni"), fd(tot("floor"), 1), "m²", tr("Devor (sof)"), `${fd(tot("wall"), 1)} m²`],
      [IC.concrete, tr("Beton ishlari"), fd(tot("concVol"), 1), "m³", tr("Standart"), "GOST/SNiP"]
    ];
    el.innerHTML = K.map(([ic, lab, v, u, fl, fv], i) => `
      <div class="kpi2 k${i+1}">
        <div class="k-top"><span class="k-ic" style="color:var(--accent)">${svg(ic)}</span></div>
        <p class="k-lab">${esc(lab)}</p>
        <p class="k-val"><b class="mono">${esc(v)}</b> <span>${esc(u)}</span></p>
        <div class="k-foot"><span>${esc(fl)}</span><b>${esc(fv)}</b></div>
      </div>
    `).join("");
  }

  function renderConcrete() {
    const grade = $id("qc-grade");
    if (!grade) return;
    if (!grade.children.length && window.MIX) {
      grade.innerHTML = Object.keys(MIX).map(k => `<option value="${k}"${k === "M250" ? " selected" : ""}>${k}</option>`).join("");
    }

    const run = () => {
      const g = grade.value || "M250";
      const cem = ($id("qc-cem") && $id("qc-cem").value) || "M500";
      const vol = ($id("qc-v") && num($id("qc-v").value)) || 10;
      window.S = window.S || { settings: { ...DEFAULT_SETTINGS }, prices: defaultPrices(), rooms: [], concrete: [] };
      const k = concreteCalc({ grade: g, cem: cem, mode: "vol", V: vol });
      const labr = sum(k.lines.map(l => lineTotals(l).lab));
      const direct = k.mat + labr;
      const vat = $id("qc-vat") && $id("qc-vat").checked ? direct * 0.12 : 0;

      const linesEl = $id("qc-lines");
      if (linesEl) {
        linesEl.innerHTML = k.lines.slice(0, 4).map(l => `
          <div style="background:rgba(255,255,255,0.08);padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06)">
            <span style="color:#94a3b8;font-size:11px;display:block">${esc(l.name)}</span>
            <b class="mono" style="color:#ffffff;font-size:14px">${l.unit === "kg" ? fmt(l.qty) : fd(l.qty, 1)} ${esc(U(l.unit))}</b>
          </div>
        `).join("");
      }

      const sumEl = $id("qc-sum");
      if (sumEl) {
        sumEl.innerHTML = `${tr("Jami")}: <b class="mono" style="color:#f97316">${fmt(direct + vat)}</b> <small style="font-size:13px;color:#cbd5e1">${SOMs()}</small>`;
      }
    };

    const box = $id("qc-section") || $id("qc");
    if (box) {
      box.addEventListener("input", run);
      box.addEventListener("change", run);
      box.addEventListener("click", e => {
        const b = e.target.closest("[data-act=step]");
        if (b) stepInput($id(b.dataset.for), +b.dataset.d);
      });
    }
    run();
  }

  function renderTable() {
    // Fill in values for rows in #dash-rows and #ly-rows
    const updateRows = (tbId) => {
      const tb = $id(tbId);
      if (!tb) return;
      rows.forEach(r => {
        const tr_ = tb.querySelector(`[data-id="${r.id}"]`);
        if (!tr_) return;
        const cRooms = tr_.querySelector(".c-rooms");
        if (cRooms) cRooms.innerHTML = r.ok ? `<b class="mono">${r.rooms.length}</b> <small>${tr("xona")}</small>` : "—";
        const cArea = tr_.querySelector(".c-area");
        if (cArea) cArea.innerHTML = r.ok ? `<b class="mono">${fd(r.floor, 1)} m²</b>` : "—";
        const cSum = tr_.querySelector(".c-sum");
        if (cSum) cSum.innerHTML = r.ok ? `<b class="mono" style="color:var(--accent)">${fmt(r.grand)} ${SOMs()}</b>` : `<small style="color:var(--muted)">${tr("hali ochilmagan")}</small>`;
      });

      // If empty and we have local guest objects, insert them
      const emptyRow = tb.querySelector("#empty-row");
      if (emptyRow && rows.length > 0 && !DASH.length) {
        emptyRow.remove();
        rows.forEach(r => {
          const rowHtml = `
            <tr data-id="${r.id}" data-name="${r.name.toLowerCase()}">
              <td>
                <a class="oname" href="${r.url}" style="font-weight:600;color:var(--ink);text-decoration:none">${esc(r.name)}</a>
                <small style="display:block;color:var(--muted)">${tr("Qurilmada saqlangan")} · ${hhmm(r.updated)}</small>
              </td>
              <td class="r c-rooms"><b class="mono">${r.rooms.length}</b> <small>${tr("xona")}</small></td>
              <td class="r c-area"><b class="mono">${fd(r.floor, 1)} m²</b></td>
              <td class="r c-sum" style="font-weight:600;color:var(--accent)">${fmt(r.grand)} ${SOMs()}</td>
              <td class="r">
                <a class="btn sm pri" href="${r.url}">${tr("Ochish")}</a>
              </td>
            </tr>
          `;
          tb.insertAdjacentHTML("beforeend", rowHtml);
        });
      }
    };

    updateRows("dash-rows");
    updateRows("ly-rows");

    // Search filter
    const searchInp = $id("dash-search") || $id("ly-q");
    if (searchInp) {
      searchInp.addEventListener("input", function() {
        const q = this.value.trim().toLowerCase();
        document.querySelectorAll("#dash-rows tr[data-id], #ly-rows tr[data-id]").forEach(tr_ => {
          const name = tr_.dataset.name || "";
          tr_.hidden = q && !name.includes(q);
        });
      });
    }
  }

  function init() {
    kpis();
    renderConcrete();
    renderTable();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("languagechange", init);
  init();
})();
