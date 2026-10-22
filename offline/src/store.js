/* SmetaGo oflayn ilova (bitta HTML fayl / Android APK) — serversiz qism.
 *  - Smetalar ro'yxati (bosh ekran): yaratish, ochish, nusxa, o'chirish (+ "Qaytarish"), zaxira nusxa (JSON).
 *  - Saqlash: qurilma xotirasi (localStorage) — har smeta alohida kalitda.
 *  - Excel: .xlsx fayl shu yerning o'zida yasaladi (server kerak emas) va qurilmaga saqlanadi.
 *  - Muharrir: app.js (saytdagi bilan bir xil) — window.SMETAGO_STORE orqali shu faylga ulanadi.
 * i18n.js, data.js, calc.js dan keyin, app.js dan oldin yuklanadi. */
(function () {
  const LIST = "smetago-off-list";              // [{id, name, updated}]
  const KEY = id => "smetago-off:" + id;        // har bir smetaning to'liq holati
  const $ = s => document.querySelector(s);
  const esc2 = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const newId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nowIso = () => new Date().toISOString();

  // ---------- saqlash ----------
  function readList() { try { const l = JSON.parse(localStorage.getItem(LIST) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function writeList(l) { localStorage.setItem(LIST, JSON.stringify(l)); }
  function readState(id) { try { const s = JSON.parse(localStorage.getItem(KEY(id))); return s && s.v === 1 ? s : null; } catch (e) { return null; } }
  function writeState(id, st) {
    localStorage.setItem(KEY(id), JSON.stringify(st));
    const l = readList(), i = l.findIndex(p => p.id === id);
    const e = { id, name: (st.obj && st.obj.name) || tr("Yangi smeta"), updated: nowIso() };
    if (i >= 0) l[i] = e; else l.unshift(e);
    writeList(l);
  }
  function removeProject(id) { localStorage.removeItem(KEY(id)); writeList(readList().filter(p => p.id !== id)); }

  // ---------- qurilmaga fayl saqlash (Android ilovada — ko'prik orqali, brauzerda — yuklab olish) ----------
  function toB64(bytes) { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function saveFile(name, bytes, mime) {
    if (window.SmetaGoAndroid && window.SmetaGoAndroid.saveFile) {
      const where = window.SmetaGoAndroid.saveFile(name, toB64(bytes), mime);   // "Download/SmetaGo/<fayl>" yoki ""
      toast(where ? tr("Saqlandi: {0}", where) : tr("Fayl saqlandi"));
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    toast(tr("Fayl saqlandi"));
  }
  function toast(m) {
    const t = $("#toast"); if (!t) return;
    t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600);
  }

  // ---------- .xlsx yozuvchi (zip + XML; uslublar saytdagi smeta/excel.py bilan bir xil) ----------
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {               // files: [{name, data: Uint8Array}] — siqmasdan (store)
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    for (const f of files) {
      const nm = enc.encode(f.name), crc = crc32(f.data), sz = f.data.length;
      const head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(sz), ...u32(sz), ...u16(nm.length), ...u16(0)];
      parts.push(new Uint8Array(head), nm, f.data);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(sz), ...u32(sz), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
      off += head.length + nm.length + sz;
    }
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
    const all = [...parts, ...central, end], out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
    let p = 0; for (const a of all) { out.set(a, p); p += a.length; }
    return out;
  }
  const xmlEsc = s => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const colName = i => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  // smeta/excel.py STYLES: shrift, fon
  const STY = {
    title: { font: { b: 1, sz: 14, color: "0C140F" } }, meta: { font: { color: "536159" } },
    head: { font: { b: 1, color: "FFFFFF" }, fill: "15803D", center: 1 }, group: { font: { b: 1, color: "0C140F" }, fill: "DCFCE7" },
    sub: { font: { b: 1 }, fill: "EEF3EF" }, total: { font: { b: 1 } }, grand: { font: { b: 1, sz: 12, color: "4ADE80" }, fill: "0C140F" }, b: { font: { b: 1 } },
  };
  const NUMFMT = { money: 3, dec2: 2, int: 1 };   // Excel'ning o'rnatilgan formatlari: #,##0 / 0.00 / 0
  function buildXlsx(sheets) {
    const fonts = ['<font><sz val="11"/><name val="Calibri"/></font>'], fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
    const fontIx = {}, fillIx = {}, xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'], xfIx = { "": 0 };
    const fontOf = f => { if (!f) return 0; const k = JSON.stringify(f); if (fontIx[k] == null) { fontIx[k] = fonts.length; fonts.push(`<font>${f.b ? "<b/>" : ""}<sz val="${f.sz || 11}"/>${f.color ? `<color rgb="FF${f.color}"/>` : ""}<name val="Calibri"/></font>`); } return fontIx[k]; };
    const fillOf = c => { if (!c) return 0; if (fillIx[c] == null) { fillIx[c] = fills.length; fills.push(`<fill><patternFill patternType="solid"><fgColor rgb="FF${c}"/><bgColor indexed="64"/></patternFill></fill>`); } return fillIx[c]; };
    const xfOf = (s, fmt, border, top) => {
      const st = STY[s], k = [s || "", fmt || "", border ? 1 : 0, top ? 1 : 0].join("|");
      if (xfIx[k] != null) return xfIx[k];
      const fid = fontOf(st && st.font), flid = fillOf(st && st.fill), nf = NUMFMT[fmt] || 0;
      const align = st && st.center ? '<alignment horizontal="center" vertical="center" wrapText="1"/>' : top ? '<alignment vertical="top"/>' : "";
      xfIx[k] = xfs.length;
      xfs.push(`<xf numFmtId="${nf}" fontId="${fid}" fillId="${flid}" borderId="${border ? 1 : 0}" xfId="0"${nf ? ' applyNumberFormat="1"' : ""}${fid ? ' applyFont="1"' : ""}${flid ? ' applyFill="1"' : ""}${border ? ' applyBorder="1"' : ""}${align ? ` applyAlignment="1">${align}</xf>` : "/>"}`);
      return xfIx[k];
    };
    const used = new Set(), names = [], sheetXml = [], defNames = [];
    sheets.forEach((sh, si) => {
      let nm = String(sh.name || "Smeta").replace(/[\[\]:*?\/\\]/g, " ").trim().slice(0, 31) || "Smeta", base = nm, n = 2;
      while (used.has(nm.toLowerCase())) nm = `${base.slice(0, 28)} ${n++}`;
      used.add(nm.toLowerCase()); names.push(nm);
      const cols = sh.cols || [], rows = sh.rows || [], [tf, tt] = Array.isArray(sh.table) ? sh.table : [-1, -2];
      const freeze = Number.isInteger(sh.freeze) && sh.freeze > 0 && sh.freeze < rows.length ? sh.freeze : 0;
      let body = "";
      rows.forEach((row, ri) => {
        if (!row) return;
        const inT = tf <= ri && ri <= tt, isHead = inT && row.some(c => c && c.s === "head");
        let cells = "";
        const n = Math.max(row.length, inT ? cols.length : 0);
        for (let ci = 0; ci < n; ci++) {
          const c = row[ci] || {}, v = c.v, has = v !== undefined && v !== null && v !== "";
          if (!has && !STY[c.s] && !inT) continue;
          const isNum = typeof v === "number" && isFinite(v), isStr = has && !isNum;
          const s = xfOf(STY[c.s] ? c.s : "", isNum ? c.f : "", inT, inT && isStr && c.s !== "head");
          const ref = colName(ci) + (ri + 1), sa = s ? ` s="${s}"` : "";
          if (!has) cells += `<c r="${ref}"${sa}/>`;
          else if (isNum) cells += `<c r="${ref}"${sa}><v>${v}</v></c>`;
          else cells += `<c r="${ref}"${sa} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(String(v).slice(0, 2000))}</t></is></c>`;
        }
        body += `<row r="${ri + 1}"${isHead ? ' ht="32" customHeight="1"' : ""}>${cells}</row>`;
      });
      const colsXml = cols.length ? `<cols>${cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.min(120, Math.max(1, +w || 10))}" customWidth="1"/>`).join("")}</cols>` : "";
      const view = freeze ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${freeze}" topLeftCell="A${freeze + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;
      if (freeze) defNames.push(`<definedName name="_xlnm.Print_Titles" localSheetId="${si}">'${nm.replace(/'/g, "''")}'!$${freeze}:$${freeze}</definedName>`);
      sheetXml.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>${view}<sheetFormatPr defaultRowHeight="15"/>${colsXml}<sheetData>${body}</sheetData><pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`);
    });
    const enc = new TextEncoder(), F = (name, s) => ({ name, data: enc.encode(s) });
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="${fonts.length}">${fonts.join("")}</fonts><fills count="${fills.length}">${fills.join("")}</fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border>${["left", "right", "top", "bottom"].map(s => `<${s} style="thin"><color rgb="FFC9D5CC"/></${s}>`).join("")}<diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    const wb = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>${defNames.length ? `<definedNames>${defNames.join("")}</definedNames>` : ""}</workbook>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${names.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${names.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`;
    const root = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    return zip([F("[Content_Types].xml", types), F("_rels/.rels", root), F("xl/workbook.xml", wb), F("xl/_rels/workbook.xml.rels", rels), F("xl/styles.xml", styles),
      ...sheetXml.map((x, i) => F(`xl/worksheets/sheet${i + 1}.xml`, x))]);
  }
  window.SmetaGoXlsx = buildXlsx;   // tekshiruv uchun

  // ---------- til va mavzu tugmalari (sahifa qayta ochiladi — hamma matn shu tilda) ----------
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-off-lang]");
    if (!b) return;
    try { localStorage.setItem("smetago-off-lang", b.dataset.offLang); } catch (err) {}
    location.reload();
  });
  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = tr(el.dataset.t); });
  document.querySelectorAll("[data-t-title]").forEach(el => { el.title = tr(el.dataset.tTitle); el.setAttribute("aria-label", tr(el.dataset.tTitle)); });
  document.querySelectorAll("[data-off-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.offLang === LANG)));

  // ---------- qaysi ekran: #p=<id> — muharrir, aks holda — smetalar ro'yxati ----------
  const m = /^#p=([\w-]+)$/.exec(location.hash);
  const curId = m && readState(m[1]) ? m[1] : null;
  addEventListener("hashchange", () => location.reload());
  const goHome = () => { location.hash = ""; };
  // Android "Orqaga" tugmasi: muharrirdan ro'yxatga qaytadi; ro'yxatda — ilovadan chiqadi
  window.smetagoBack = function () {
    const md = $("#modal");
    if (md && !md.hidden && window.closeModal) { window.closeModal(); return true; }
    if (document.body.classList.contains("cat-open")) { document.body.classList.remove("cat-open"); return true; }
    if (curId) { goHome(); return true; }
    return false;
  };

  if (curId) {
    document.body.classList.add("in-editor");
    window.SMETAGO_STORE = {
      load: () => { const s = readState(curId); return s && s.__fresh ? null : s; },   // yangi — app.js o'zi to'ldiradi
      save: st => { try { writeState(curId, st); } catch (e) { toast(tr("Xotira to'lgan — saqlanmadi")); } },
      xlsx: (sheets, name) => { try { saveFile(name, buildXlsx(sheets), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); } catch (e) { toast(tr("Excel faylni yaratib bo'lmadi, qayta urinib ko'ring")); } },
    };
    $("#home-btn").addEventListener("click", goHome);
    return;   // app.js (muharrir) shundan keyin ishga tushadi
  }

  // ---------- bosh ekran: smetalar ro'yxati ----------
  document.body.classList.add("in-home");
  function summary(st) {
    try {
      window.S = normState(JSON.parse(JSON.stringify(st)));
      const rooms = window.S.rooms || [], floor = rooms.reduce((a, r) => a + roomCalc(r).floorA, 0); window.S = null;
      return { floor, rooms: rooms.length };
    } catch (e) { window.S = null; return null; }
  }
  const dt = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleString(LANG === "ru" ? "ru-RU" : "uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); };
  function render() {
    const l = readList().filter(p => readState(p.id));
    $("#home-list").innerHTML = l.length ? l.map(p => {
      const sm = summary(readState(p.id));
      return `<article class="off-card" data-id="${esc2(p.id)}">
        <a class="off-open" href="#p=${esc2(p.id)}"><b>${esc2(p.name)}</b>
          <small>${sm ? `${tr("{0} xona", sm.rooms)} · ` : ""}${esc2(dt(p.updated))}</small>
          ${sm ? `<span class="off-sum mono">${fd(sm.floor)} ${U("m²")}</span>` : ""}</a>
        <div class="off-acts">
          <button type="button" class="btn sm" data-off="copy">${tr("Nusxa")}</button>
          <button type="button" class="btn sm ghost del-btn" data-off="del" title="${tr("O'chirish")}" aria-label="${tr("O'chirish")}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button>
        </div></article>`;
    }).join("") : `<p class="off-empty">${tr("Hali smeta yo'q. «+ Yangi smeta» tugmasi bilan boshlang.")}</p>`;
  }
  function createNew() {
    const id = newId();
    // app.js bo'sh holatni o'zi yaratadi (blank) — bu yerda faqat nom va v:1 belgisi
    const name = tr("Yangi smeta");
    writeState(id, { v: 1, obj: { name }, rooms: [], concrete: [], ui: { tab: "xonalar" }, __fresh: true });
    location.hash = "p=" + id;
  }
  let undo = null;
  function undoBar(text, fn) {
    const bar = $("#undo-bar");
    bar.querySelector("span").textContent = text; bar.hidden = false;
    bar.querySelector("button").onclick = () => { bar.hidden = true; fn(); };
    clearTimeout(undoBar.t); undoBar.t = setTimeout(() => { bar.hidden = true; undo = null; }, 7000);
  }
  document.addEventListener("click", e => {
    if (e.target.closest("#new-btn")) { createNew(); return; }
    if (e.target.closest("#export-btn")) { exportAll(); return; }
    if (e.target.closest("#import-btn")) { $("#import-file").click(); return; }
    const b = e.target.closest("[data-off]"); if (!b) return;
    const id = b.closest("[data-id]").dataset.id, st = readState(id);
    if (b.dataset.off === "copy" && st) {
      const nid = newId(), c = JSON.parse(JSON.stringify(st));
      c.obj = c.obj || {}; c.obj.name = `${c.obj.name || tr("Yangi smeta")} ${tr("(nusxa)")}`.slice(0, 200);
      writeState(nid, c); render(); toast(tr("Nusxa olindi"));
    }
    if (b.dataset.off === "del" && st) {
      const list = readList(), pos = list.findIndex(p => p.id === id), entry = list[pos];
      removeProject(id); render();
      undo = () => { localStorage.setItem(KEY(id), JSON.stringify(st)); const l = readList(); l.splice(Math.max(0, pos), 0, entry); writeList(l); render(); };
      undoBar(tr("«{0}» o'chirildi", entry ? entry.name : ""), () => { if (undo) undo(); undo = null; });
    }
  });
  // ---------- zaxira nusxa: barcha smetalar bitta .json faylda ----------
  function exportAll() {
    const projects = readList().map(p => ({ ...p, state: readState(p.id) })).filter(p => p.state);
    const data = { app: "SmetaGo", v: 1, exported: nowIso(), projects };
    const d = new Date(), pad = x => String(x).padStart(2, "0");
    saveFile(`SmetaGo-zaxira-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`, new TextEncoder().encode(JSON.stringify(data)), "application/json");
  }
  $("#import-file").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || data.app !== "SmetaGo" || !Array.isArray(data.projects)) throw new Error("format");
        let n = 0;
        data.projects.forEach(p => {
          if (!p || !p.state || p.state.v !== 1) return;
          const id = /^[\w-]{1,40}$/.test(p.id || "") ? p.id : newId();
          localStorage.setItem(KEY(id), JSON.stringify(p.state));
          const l = readList().filter(x => x.id !== id);
          l.unshift({ id, name: String(p.name || (p.state.obj && p.state.obj.name) || tr("Yangi smeta")).slice(0, 200), updated: p.updated || nowIso() });
          writeList(l); n++;
        });
        render(); toast(tr("Tiklandi: {0} ta smeta", n));
      } catch (err) { toast(tr("Fayl SmetaGo zaxira nusxasi emas")); }
      e.target.value = "";
    };
    r.readAsText(f);
  });
  render();
})();
