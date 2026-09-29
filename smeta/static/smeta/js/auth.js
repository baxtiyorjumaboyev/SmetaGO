/* SmetaGo — kirish sahifalari: chapdagi demo 3D xona o'lchamlarini almashtirib turadi; parolni ko'rsatish tugmasi. */
(function(){
  const cv=document.getElementById("au-3d");
  if(cv&&window.Room3D){
    const lab=document.getElementById("au-dims"),f=v=>(Math.round(v*10)/10).toString().replace(".",",");
    const r=Room3D(cv,{onDims:(L,W)=>{if(lab)lab.textContent=`${f(L)} × ${f(W)} m`}});
    const P=[{L:4.2,W:3.4,H:2.7,windows:[{w:1.5,h:1.4}],doors:[{w:.9,h:2.1}]},
             {L:5.4,W:4,H:2.8,windows:[{w:1.4,h:1.5},{w:1.4,h:1.5}],doors:[{w:.9,h:2.1}]},
             {L:3,W:2.4,H:2.7,windows:[{w:1,h:1.2}],doors:[{w:.8,h:2.1}]},
             {L:6,W:4.6,H:3,windows:[{w:2,h:1.6}],doors:[{w:1.2,h:2.2}]}];
    let i=0;r.set(P[0]);
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches)setInterval(()=>{if(!document.hidden){i=(i+1)%P.length;r.set(P[i])}},5000);
  }
  document.addEventListener("click",e=>{const b=e.target.closest("[data-pw-toggle]");if(!b)return;
    const inp=document.getElementById(b.dataset.pwToggle);if(!inp)return;const show=inp.type==="password";
    inp.type=show?"text":"password";b.setAttribute("aria-pressed",show);inp.focus()});
})();
