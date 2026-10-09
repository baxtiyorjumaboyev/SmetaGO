/* SmetaGo — kirish va ro'yxatdan o'tish yordamchisi:
 * 1. Telefon raqamini faqat raqamlar bilan kiritish va +998 XX XXX XX XX formatlash
 * 2. Parolni ko'rsatish / yashirish tugmasi
 */
(function() {
  const ph = document.getElementById("id_phone");
  if (ph) {
    function formatUzPhone(val) {
      let digits = val.replace(/\D/g, "");
      if (digits.startsWith("998")) {
        digits = digits.slice(3);
      }
      digits = digits.slice(0, 9); // max 9 digits after 998
      
      if (!digits.length) return "";
      let res = "+998";
      if (digits.length > 0) res += " " + digits.slice(0, 2);
      if (digits.length >= 3) res += " " + digits.slice(2, 5);
      if (digits.length >= 6) res += " " + digits.slice(5, 7);
      if (digits.length >= 8) res += " " + digits.slice(7, 9);
      return res;
    }

    ph.setAttribute("autocomplete", "tel");
    ph.setAttribute("inputmode", "numeric");
    ph.setAttribute("placeholder", "+998 90 123 45 67");

    ph.addEventListener("input", function(e) {
      const cur = this.value;
      const formatted = formatUzPhone(cur);
      this.value = formatted;
      
      const digits = formatted.replace(/\D/g, "");
      const isComplete = digits.length === 12; // 998 + 9 digits
      if (formatted.length > 0 && !isComplete) {
        this.setCustomValidity ? this.setCustomValidity("Telefon raqamini to'liq kiriting: +998 90 123 45 67") : null;
      } else {
        this.setCustomValidity ? this.setCustomValidity("") : null;
      }
    });

    ph.addEventListener("keydown", function(e) {
      // Allow control keys: backspace, delete, tab, arrows, copy/paste
      if (
        ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) ||
        (e.ctrlKey || e.metaKey)
      ) {
        return;
      }
      // Strictly prevent non-digit keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    ph.addEventListener("paste", function(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text") || "";
      this.value = formatUzPhone(text);
    });

    const form = ph.closest("form");
    if (form) {
      form.addEventListener("submit", function(e) {
        if (ph.value.trim().length > 0) {
          const digits = ph.value.replace(/\D/g, "");
          if (digits.length !== 12) {
            e.preventDefault();
            alert("Telefon raqamini to'liq kiriting: +998 90 123 45 67");
            ph.focus();
          }
        }
      });
    }
  }

  document.addEventListener("click", function(e) {
    const b = e.target.closest("[data-pw-toggle]");
    if (!b) return;
    const inp = document.getElementById(b.dataset.pwToggle);
    if (!inp) return;
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    b.setAttribute("aria-pressed", show);
    inp.focus();
  });
})();
