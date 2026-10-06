/* SmetaGo — "Panellar" menyusi: sahifadagi kartalarni foydalanuvchi o'zi yoqib-o'chiradi.
 * Belgilash: menyu — <details data-panels-menu>, undagi <input data-panel-toggle="kalit">;
 * karta — data-panel="kalit". Yashirilganlar ro'yxati shu brauzerda, foydalanuvchi va sahifa bo'yicha saqlanadi.
 * Yangi panel qo'shish: kartaga data-panel="yangi" va menyuga shu kalitli checkbox. */
(function(){
  const menu=document.querySelector("[data-panels-menu]");if(!menu)return;
  const KEY="smetago-panels:"+(document.body.dataset.uid||"")+":"+location.pathname;
  const boxes=[...menu.querySelectorAll("[data-panel-toggle]")];
  const keys=boxes.map(b=>b.dataset.panelToggle);
  let hidden=[];
  try{hidden=(JSON.parse(localStorage.getItem(KEY))||[]).filter(k=>keys.includes(k))}catch(e){}

  function apply(save){
    boxes.forEach(b=>{const k=b.dataset.panelToggle,on=!hidden.includes(k);b.checked=on;
      document.querySelectorAll(`[data-panel="${k}"]`).forEach(el=>{el.hidden=!on})});
    const shown=keys.length-hidden.length;
    const cnt=menu.querySelector("[data-panels-count]");if(cnt)cnt.textContent=`${shown}/${keys.length}`;
    document.querySelectorAll("[data-panels-empty]").forEach(el=>{el.hidden=shown>0});
    if(save)try{localStorage.setItem(KEY,JSON.stringify(hidden))}catch(e){}
  }
  menu.addEventListener("change",e=>{const b=e.target.closest("[data-panel-toggle]");if(!b)return;
    const k=b.dataset.panelToggle;hidden=hidden.filter(x=>x!==k);if(!b.checked)hidden.push(k);apply(true)});
  const reset=menu.querySelector("[data-panels-reset]");
  if(reset)reset.addEventListener("click",()=>{hidden=[];apply(true)});
  // tashqariga bosilsa yoki Esc — menyu yopiladi
  document.addEventListener("click",e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.open){menu.open=false;menu.querySelector("summary").focus()}});
  apply(false);
})();
