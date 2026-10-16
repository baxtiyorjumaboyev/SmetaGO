/* SmetaGo — bosh sahifadagi "Imkoniyatlar" kartalari ochadigan oynalar:
 *   [data-feat-aniqlik] — hisob formulalari, [data-feat-yordam] — qisqa qo'llanma.
 * Barcha matnlar tr() orqali (ruscha tarjima — i18n.js). */
(function() {
  const t = s => (window.tr ? window.tr(s) : s);

  function ensureModal() {
    let el = document.getElementById("sg-feature-modal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "sg-feature-modal";
    el.className = "sg-modal-overlay";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "sg-modal-title");
    el.innerHTML = `
      <div class="sg-modal-box">
        <div class="sg-modal-head">
          <h3 id="sg-modal-title"></h3>
          <button type="button" class="sg-modal-close" data-sg-close aria-label="${t("Yopish")}">×</button>
        </div>
        <div class="sg-modal-body" id="sg-modal-content"></div>
        <div class="sg-modal-foot" id="sg-modal-actions"></div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el || e.target.closest("[data-sg-close]")) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && el.classList.contains("active")) close(); });
    return el;
  }
  function open(title, body, actions) {
    const m = ensureModal();
    m.querySelector("#sg-modal-title").textContent = title;
    m.querySelector("#sg-modal-content").innerHTML = body;
    m.querySelector("#sg-modal-actions").innerHTML = actions ||
      `<button type="button" class="btn pri btn-new-smeta" data-sg-close>${t("Tushunarli")}</button>`;
    m.classList.add("active");
  }
  function close() {
    const m = document.getElementById("sg-feature-modal");
    if (m) m.classList.remove("active");
  }
  const box = (title, text) =>
    `<div style="background:var(--surface2);padding:14px;border-radius:8px;border-left:4px solid var(--accent)"><b>${title}</b><br>${text}</div>`;

  function openAniqlik() {
    open(t("Aniqlik va ochiqlik"), `
      <div style="display:flex;flex-direction:column;gap:14px">
        <p><b>${t("Har bir raqam qanday hisoblangani ko'rinib turadi:")}</b></p>
        ${box(t("1. Sof devor maydoni"),
          `<code style="display:inline-block;margin:4px 0;color:var(--accent);font-weight:600">${t("2 × (uzunlik + eni) × balandlik − eshiklar − derazalar")}</code><br>
           <small style="color:var(--muted)">${t("Eshik va derazalar devor va plintusdan avtomatik ayiriladi.")}</small>`)}
        ${box(t("2. Material zaxirasi"), t("Pol qoplamasi va plintusga 10% zaxira qo'shiladi va qatorda alohida ko'rsatiladi."))}
        ${box(t("3. Excel fayl"), t("Barcha qatorlar, oraliq va umumiy jami bilan tayyor .xlsx fayl yuklab olinadi."))}
      </div>`);
  }
  function openYordam() {
    open(t("Qisqa qo'llanma"), `
      <div style="display:flex;flex-direction:column;gap:14px">
        ${box(`1. ${t("Xonani o'lchang")}`, t("Uzunlik, eni va balandlikni kiriting, eshik va derazalarni qo'shing."))}
        ${box(`2. ${t("Pol, devor va shiftni tanlang")}`, t("Qoplamani ro'yxatdan tanlang yoki «+ O'zim qo'shaman» bilan o'zingiz yozing."))}
        ${box(`3. ${t("Excel'ni yuklab oling")}`, t("Material va ish haqi bilan tayyor smetani buyurtmachiga yuboring."))}
      </div>`,
      `<a href="/app/" class="btn pri btn-new-smeta" style="text-decoration:none">${t("Smeta tuzishni boshlash")} →</a>
       <button type="button" class="btn ol" data-sg-close>${t("Yopish")}</button>`);
  }

  // faqat tegishli karta bosilganda — boshqa tugma va havolalarga tegilmaydi
  document.addEventListener("click", e => {
    if (e.target.closest("[data-feat-aniqlik]")) { e.preventDefault(); openAniqlik(); }
    else if (e.target.closest("[data-feat-yordam]")) { e.preventDefault(); openYordam(); }
  });
})();
