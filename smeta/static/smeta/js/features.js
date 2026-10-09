/* SmetaGo — interaktiv imkoniyatlar:
 * 1. Aniqlik va ochiqlik modali
 * 2. Oflayn ishlash rejimi modali (PWA o'rnatish bilan)
 * 3. Qo'llanma va yordam modali
 */
(function() {
  function ensureModal() {
    let el = document.getElementById("sg-feature-modal");
    if (!el) {
      el = document.createElement("div");
      el.id = "sg-feature-modal";
      el.className = "sg-modal-overlay";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.innerHTML = `
        <div class="sg-modal-box">
          <div class="sg-modal-head">
            <h3 id="sg-modal-title"></h3>
            <button type="button" class="sg-modal-close" id="sg-modal-close-btn" aria-label="Yopish">×</button>
          </div>
          <div class="sg-modal-body" id="sg-modal-content"></div>
          <div class="sg-modal-foot" id="sg-modal-actions"></div>
        </div>
      `;
      document.body.appendChild(el);
      
      el.addEventListener("click", function(e) {
        if (e.target === el || e.target.closest("#sg-modal-close-btn")) {
          closeModal();
        }
      });
      document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && el.classList.contains("active")) {
          closeModal();
        }
      });
    }
    return el;
  }

  function openModal(title, bodyHtml, actionHtml) {
    const m = ensureModal();
    document.getElementById("sg-modal-title").textContent = title;
    document.getElementById("sg-modal-content").innerHTML = bodyHtml;
    document.getElementById("sg-modal-actions").innerHTML = actionHtml || `<button type="button" class="btn pri btn-new-smeta" onclick="document.getElementById('sg-feature-modal').classList.remove('active')">${window.tr ? tr("Tushunarli") : "Tushunarli"}</button>`;
    m.classList.add("active");
  }

  function closeModal() {
    const m = document.getElementById("sg-feature-modal");
    if (m) m.classList.remove("active");
  }

  window.sgOpenAniqlik = function() {
    const t = window.tr || (x => x);
    openModal(
      t("Aniqlik va ochiqlik"),
      `
      <div style="display:flex;flex-direction:column;gap:14px">
        <p><b>${t("SmetaGo formulalari 100% shaffof va ochiq hisoblanadi:")}</b></p>
        <div style="background:var(--surface2);padding:14px;border-radius:8px;border-left:4px solid var(--accent)">
          <b>${t("1. Sof devor maydoni:")}</b><br>
          <code style="display:inline-block;margin:4px 0;color:var(--accent);font-weight:600">S = 2 × (Uzunlik + Eni) × Balandlik − S(eshiklar) − S(derazalar) − S(kafel)</code><br>
          <small style="color:var(--muted)">${t("Eshik va deraza teshiklari devordan hamda plintusdan avtomatik ayirib tashlanadi.")}</small>
        </div>
        <div style="background:var(--surface2);padding:14px;border-radius:8px;border-left:4px solid var(--accent)">
          <b>${t("2. Beton retsepti (СНиП va ГОСТ):")}</b><br>
          <code style="display:inline-block;margin:4px 0;color:var(--accent);font-weight:600">${t("1 m³ beton uchun sement, qum, shag'al va suv miqdori normativ jadval asosida hisoblanadi.")}</code><br>
          <small style="color:var(--muted)">PC M500 / PC M400 sement markasiga qarab sarf avtomatik moslashtiriladi.</small>
        </div>
        <div style="background:var(--surface2);padding:14px;border-radius:8px;border-left:4px solid var(--accent)">
          <b>${t("3. Material zaxirasi:")}</b><br>
          ${t("Har bir xonada pol va devor materiallari uchun 10% (yoki o'zingiz belgilagan) zaxira alohida ko'rsatiladi.")}
        </div>
        <div style="background:var(--surface2);padding:14px;border-radius:8px;border-left:4px solid var(--accent)">
          <b>${t("4. Excel eksport:")}</b><br>
          ${t("Barcha hisob-kitoblar formulalari bilan birga tayyor .xlsx jadvalga chiqariladi.")}
        </div>
      </div>
      `,
      `<button type="button" class="btn pri btn-new-smeta" onclick="document.getElementById('sg-feature-modal').classList.remove('active')">${t("Tushunarli")}</button>`
    );
  };

  window.sgOpenOflayn = function() {
    const t = window.tr || (x => x);
    const isOnline = navigator.onLine;
    openModal(
      t("Oflayn ishlash rejimi"),
      `
      <div style="display:flex;flex-direction:column;gap:14px">
        <p><b>${t("Internet bo'lmagan obyektlarda ham bemalol ishlang:")}</b></p>
        <div style="display:flex;align-items:center;gap:10px;background:var(--surface2);padding:12px;border-radius:8px">
          <span>${t("Tarmoq holati:")}</span>
          <b style="color:${isOnline ? 'var(--good)' : 'var(--danger)'}">
            ${isOnline ? '● ' + t("Onlayn (aloqa bor)") : '○ ' + t("Oflayn (internetsiz rejim)")}
          </b>
        </div>
        <ul style="padding-left:20px;margin:0;line-height:1.7">
          <li><b>${t("Avto-saqlash:")}</b> ${t("O'zgartirilgan har bir xona, o'lcham va beton hisobi darhol qurilmaning o'zida saqlanadi.")}</li>
          <li><b>${t("Avtomatik sinxronizatsiya:")}</b> ${t("Internet paydo bo'lgach, barcha ma'lumotlar serverga o'zi uzatiladi.")}</li>
          <li><b>${t("Ilova sifatida o'rnatish (PWA):")}</b> ${t("Chrome, Edge yoki Safari orqali bosh ekranga qo'shib, brauzersiz to'liq ilova sifatida foydalanishingiz mumkin.")}</li>
        </ul>
      </div>
      `,
      `
      <button type="button" class="btn ol" onclick="if(window.installPWA){window.installPWA()}else{alert('Brauzer menyusidan «Bosh ekranga qo‘shish» ni tanlang')}">${t("Ilovani o'rnatish")}</button>
      <button type="button" class="btn pri btn-new-smeta" onclick="document.getElementById('sg-feature-modal').classList.remove('active')">${t("Yopish")}</button>
      `
    );
  };

  window.sgOpenYordam = function() {
    const t = window.tr || (x => x);
    openModal(
      t("SmetaGo yo'riqnomasi"),
      `
      <div style="display:flex;flex-direction:column;gap:14px">
        <p><b>${t("3 qadamda obyektdan tayyor smetagacha:")}</b></p>
        <div style="background:var(--surface2);padding:12px;border-radius:8px">
          <b style="color:var(--accent)">1. ${t("Xonalarni o'lchang")}</b><br>
          ${t("Uzunlik, en va balandlikni kiriting. Eshik va derazalarni qo'shing — maydon avtomatik ayiriladi.")}
        </div>
        <div style="background:var(--surface2);padding:12px;border-radius:8px">
          <b style="color:var(--accent)">2. ${t("Beton ishlarini hisoblang")}</b><br>
          ${t("Poydevor, pol yoki ustun uchun beton markasini (M150, M200, M250, M300) va hajmini kiriting. Sement qoplari soni va qum/shag'al tayyor bo'ladi.")}
        </div>
        <div style="background:var(--surface2);padding:12px;border-radius:8px">
          <b style="color:var(--accent)">3. ${t("Excel smetani yuklab oling")}</b><br>
          ${t("Material va ish haqi bo'yicha tayyor smetani buyurtmachiga yuborish uchun .xlsx formatida bir zumda oling.")}
        </div>
      </div>
      `,
      `
      <a href="/app/" class="btn pri btn-new-smeta" style="text-decoration:none">${t("Smeta tuzishni boshlash")} →</a>
      <button type="button" class="btn ol" onclick="document.getElementById('sg-feature-modal').classList.remove('active')">${t("Yopish")}</button>
      `
    );
  };

  // Delegated click listener matching attributes or text in Latin, Cyrillic, and Russian
  document.addEventListener("click", function(e) {
    const el = e.target.closest("[data-feat-aniqlik], [data-feat-oflayn], [data-feat-yordam], article, .step, .feat-card, button, a");
    if (!el) return;

    if (el.hasAttribute("data-feat-aniqlik") || el.closest("[data-feat-aniqlik]")) {
      e.preventDefault();
      sgOpenAniqlik();
      return;
    }
    if (el.hasAttribute("data-feat-oflayn") || el.closest("[data-feat-oflayn]")) {
      e.preventDefault();
      sgOpenOflayn();
      return;
    }
    if (el.hasAttribute("data-feat-yordam") || el.closest("[data-feat-yordam]")) {
      e.preventDefault();
      sgOpenYordam();
      return;
    }

    const txt = (el.textContent || "").toLowerCase();
    if (txt.includes("aniqlik va ochiqlik") || txt.includes("аниқлик ва очиқлик") || txt.includes("точность и прозрачность")) {
      e.preventDefault();
      sgOpenAniqlik();
    } else if (txt.includes("oflayn ishlash") || txt.includes("офлайн ишлаш") || txt.includes("офлайн режим")) {
      e.preventDefault();
      sgOpenOflayn();
    } else if (
      (txt.includes("namuna va yordam") || txt.includes("қўлланма ва ёрдам") || txt.includes("пример и помощь") || txt.includes("yo'riqnoma") || txt.includes("қўлланмани очиш") || txt.includes("qo'llanmani ochish")) &&
      !el.getAttribute("href")?.includes("/yordam/")
    ) {
      e.preventDefault();
      sgOpenYordam();
    }
  });
})();
