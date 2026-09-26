/* SmetaGo — PWA: service worker, "Ilovani o'rnatish" tugmasi, oflayn belgisi.
 * Matnlar shablondan keladi (#pwa-l10n data-* atributlari, _prefs.html), shuning uchun ikki tilda ishlaydi. */
(function(){
  var L=document.getElementById("pwa-l10n"),t=function(k,d){return (L&&L.dataset[k])||d};
  var standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  if(standalone)document.documentElement.classList.add("is-app");

  // 1) service worker (faqat xavfsiz kontekstda: https yoki localhost)
  if("serviceWorker" in navigator&&window.isSecureContext){
    addEventListener("load",function(){navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(function(){})});
  }

  // 2) o'rnatish tugmasi
  var deferred=null;
  var btns=function(){return document.querySelectorAll("[data-install]")};
  var show=function(on){btns().forEach(function(b){b.hidden=!on})};
  var isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;if(!standalone)show(true)});
  addEventListener("appinstalled",function(){deferred=null;show(false)});
  document.addEventListener("DOMContentLoaded",function(){if(isIOS&&!standalone)show(true)});
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-install]");if(!b)return;
    if(deferred){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;show(false)})}
    else if(isIOS)alert(t("ios","iPhone / iPad: Safari'da «Ulashish» tugmasini bosing, so'ng «Bosh ekranga qo'shish»."));
  });

  // 3) oflayn belgisi va internetsiz yuborib bo'lmaydigan formalar
  // navigator.onLine har doim ham to'g'ri emas (Wi-Fi bor, internet yo'q) — shuning uchun app.js
  // saqlash natijasini ham bildiradi: window.smetagoNet(false) / (true)
  var down=false;
  var net=function(){document.querySelectorAll("[data-netbadge]").forEach(function(el){el.hidden=navigator.onLine&&!down})};
  window.smetagoNet=function(online){down=!online;net()};
  addEventListener("online",function(){down=false;net()});addEventListener("offline",net);document.addEventListener("DOMContentLoaded",net);
  document.addEventListener("submit",function(e){var f=e.target;
    if(f.matches&&f.matches("[data-logout]")){
      // umumiy qurilmada boshqa odam oldingi foydalanuvchining sahifalarini ko'rmasin
      if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:"clear-pages"});
    }
    if(!navigator.onLine&&!f.matches("[data-offline-ok]")){e.preventDefault();alert(t("offline","Internet yo'q. Bu amal uchun aloqa kerak."))}
  },true);
})();
