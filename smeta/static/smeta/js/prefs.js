/* SmetaGo — kunduzgi / tungi rejim. <head> ichida sinxron yuklanadi, shunda sahifa
 * noto'g'ri rangda "miltillamaydi". Tanlov brauzerda (localStorage) saqlanadi;
 * tanlanmagan bo'lsa, tizim sozlamasi (prefers-color-scheme) ishlaydi. */
(function(){
  var KEY="smetago-theme",root=document.documentElement,mq=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");
  try{var s=localStorage.getItem(KEY);if(s==="light"||s==="dark")root.setAttribute("data-theme",s)}catch(e){}
  function cur(){return root.getAttribute("data-theme")||(mq&&mq.matches?"dark":"light")}
  function sync(){var dark=cur()==="dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function(b){
      var l=b.getAttribute(dark?"data-l-day":"data-l-night");b.setAttribute("aria-pressed",dark);b.title=l;b.setAttribute("aria-label",l)})}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-theme-toggle]");if(!b)return;
    var n=cur()==="dark"?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem(KEY,n)}catch(e){}sync()});
  document.addEventListener("DOMContentLoaded",sync);
  if(mq&&mq.addEventListener)mq.addEventListener("change",sync);
})();
