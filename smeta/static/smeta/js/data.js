/* SmetaGo — ma'lumotnoma ma'lumotlar.
 * Django orqali ochilganda katalog, material narxlari va xona turlari bazadan keladi
 * (#smeta-ref, admin panelda tahrirlanadi); quyidagi qiymatlar faqat zaxira.
 * Qoplamalar (FLOOR/WALL/CEIL), beton retseptlari va hududlar shu faylda qoladi.
 */
const REF=(()=>{try{const el=document.getElementById("smeta-ref");return el?JSON.parse(el.textContent):null}catch(e){return null}})();
const REGIONS=["Toshkent sh.","Toshkent vil.","Andijon","Buxoro","Farg'ona","Jizzax","Xorazm","Namangan","Navoiy","Qashqadaryo","Qoraqalpog'iston","Samarqand","Sirdaryo","Surxondaryo"];
const QUARTERS=["2026-yil III chorak","2026-yil IV chorak","2027-yil I chorak"];
const DOOR_H=2.1;

// l — o'zbekcha, ru — ruscha nom (lab() tanlaydi, i18n.js)
const FLOOR={
  laminat:{l:"Laminat",ru:"Ламинат",pid:"laminat",h:.3,pl:"plintus_pvc"},
  kafel:{l:"Kafel",ru:"Плитка",pid:"kafel_pol",h:1,pl:"plintus_kafel"},
  linoleum:{l:"Linoleum",ru:"Линолеум",pid:"linoleum",h:.15,pl:"plintus_pvc"},
  parket:{l:"Parket",ru:"Паркет",pid:"parket",h:.6,pl:"plintus_yogoch"},
  yoq:{l:"O'zgarmaydi",ru:"Без изменений",pid:null,h:0,pl:null}
};
const WALL={
  boyoq:{l:"Bo'yoq (shpaklyovka bilan)",ru:"Покраска (со шпаклёвкой)",pid:"boyoq_devor",h:.35},
  oboy:{l:"Oboy",ru:"Обои",pid:"oboy",h:.25},
  kafel:{l:"Kafel (to'liq balandlik)",ru:"Плитка (на всю высоту)",pid:"kafel_devor",h:1.1},
  gipsokarton:{l:"Gipsokarton",ru:"Гипсокартон",pid:"gipsokarton",h:.6},
  yoq:{l:"O'zgarmaydi",ru:"Без изменений",pid:null,h:0}
};
const CEIL={
  shift_boyoq:{l:"Bo'yoq",ru:"Покраска",pid:"shift_boyoq",h:.35},
  natyajnoy:{l:"Natyajnoy shift",ru:"Натяжной потолок",pid:"natyajnoy",h:.3},
  gipsokarton:{l:"Gipsokarton",ru:"Гипсокартон",pid:"gipsokarton",h:.7},
  armstrong:{l:"Armstrong",ru:"Армстронг",pid:"armstrong",h:.3},
  yoq:{l:"O'zgarmaydi",ru:"Без изменений",pid:null,h:0}
};
const PLINTH_LABEL={plintus_pvc:{l:"PVC (plastik)",ru:"ПВХ (пластик)"},plintus_kafel:{l:"Kafel plintus",ru:"Плиточный плинтус"},plintus_yogoch:{l:"Yog'och",ru:"Деревянный"}};

// concrete per 1 m3 on PC M500 (СНиП 82-02-95, ГОСТ 7473-2010 reference table)
const MIX={M150:[230,850,1200,145],M200:[280,800,1200,155],M250:[320,750,1200,160],M300:[350,720,1200,165],M350:[380,700,1200,170],M400:[420,670,1200,175]};

function defaultPrices(){if(REF&&REF.prices&&REF.prices.length)return JSON.parse(JSON.stringify(REF.prices));return [
 {id:"sement",n:"Sement",u:"kg",g:"Beton",src:[2000,1800,1700],s:"Quvasoy · Jizzax · Ohangaron",mode:"avg",manual:0},
 {id:"sheben",n:"Shag'al (sheben)",u:"m³",g:"Beton",src:[500000,550000,600000],s:"1-, 2-, 3-karyer",mode:"avg",manual:0},
 {id:"qum",n:"Qum",u:"m³",g:"Beton",src:[100000,80000,50000],s:"1-, 2-, 3-karyer",mode:"avg",manual:0},
 {id:"suv",n:"Suv",u:"m³",g:"Beton",src:[6000,6000,6000],s:"Suvoqova tarifi",mode:"avg",manual:0},
 {id:"laminat",n:"Laminat",u:"m²",g:"Pol",src:[95000,110000,120000],s:"Do'kon / bozor / marketpleys",mode:"avg",manual:0},
 {id:"kafel_pol",n:"Kafel (pol)",u:"m²",g:"Pol",src:[100000,120000,140000],s:"",mode:"avg",manual:0},
 {id:"linoleum",n:"Linoleum",u:"m²",g:"Pol",src:[60000,70000,85000],s:"",mode:"avg",manual:0},
 {id:"parket",n:"Parket",u:"m²",g:"Pol",src:[220000,250000,300000],s:"",mode:"avg",manual:0},
 {id:"plintus_pvc",n:"Plintus PVC, 2,5 m",u:"dona",g:"Pol",src:[22000,25000,30000],s:"",mode:"avg",manual:0},
 {id:"plintus_yogoch",n:"Plintus yog'och, 2,5 m",u:"dona",g:"Pol",src:[45000,55000,60000],s:"",mode:"avg",manual:0},
 {id:"plintus_kafel",n:"Kafel plintus",u:"m",g:"Pol",src:[30000,35000,40000],s:"",mode:"avg",manual:0},
 {id:"boyoq_devor",n:"Devor bo'yog'i + shpaklyovka",u:"m²",g:"Devor",src:[14000,16000,18000],s:"",mode:"avg",manual:0},
 {id:"oboy",n:"Oboy",u:"m²",g:"Devor",src:[35000,45000,60000],s:"",mode:"avg",manual:0},
 {id:"kafel_devor",n:"Kafel (devor)",u:"m²",g:"Devor",src:[100000,120000,150000],s:"",mode:"avg",manual:0},
 {id:"gipsokarton",n:"Gipsokarton (karkas bilan)",u:"m²",g:"Devor",src:[55000,60000,70000],s:"",mode:"avg",manual:0},
 {id:"shift_boyoq",n:"Shift bo'yog'i",u:"m²",g:"Shift",src:[12000,14000,16000],s:"",mode:"avg",manual:0},
 {id:"natyajnoy",n:"Natyajnoy shift",u:"m²",g:"Shift",src:[80000,90000,110000],s:"",mode:"avg",manual:0},
 {id:"armstrong",n:"Armstrong shift",u:"m²",g:"Shift",src:[60000,70000,80000],s:"",mode:"avg",manual:0}
];}

// catalog: v = variants [label, price, hours?]; dims: ask L×W×H; w: ask power (W)
let CATALOG=[
 {g:"Mebel",items:[
  {id:"stol",n:"Stol",u:"dona",p:900000,h:.5,dims:1,v:[["Ofis stoli",1200000],["Oshxona stoli",900000],["Jurnal stoli",500000]]},
  {id:"stul",n:"Stul",u:"dona",p:250000,h:0,v:[["Oddiy stul",250000],["Ofis stuli (g'ildirakli)",700000]]},
  {id:"shkaf",n:"Shkaf",u:"dona",p:2500000,h:2,dims:1,v:[["2 eshikli",2500000],["3 eshikli",3500000],["Kupe",5000000],["Hujjat shkafi",1800000]]},
  {id:"divan",n:"Divan",u:"dona",p:4500000,h:.5,dims:1},
  {id:"kreslo",n:"Kreslo",u:"dona",p:1800000,h:0},
  {id:"kushetka",n:"Kushetka (yotadigan)",u:"dona",p:1500000,h:.5,dims:1},
  {id:"krovat",n:"Krovat",u:"dona",p:3500000,h:1.5,dims:1,v:[["1 kishilik",2000000],["2 kishilik",3500000],["Ikki qavatli",3000000]]},
  {id:"tumba",n:"Tumba",u:"dona",p:600000,h:.3,dims:1},
  {id:"javon",n:"Javon (polka)",u:"dona",p:250000,h:.5,dims:1},
  {id:"garnitur",n:"Oshxona garnituri",u:"m",p:3000000,h:3},
  {id:"seyf",n:"Seyf",u:"dona",p:2000000,h:1},
  {id:"shtativ",n:"Shtativ / ilgich",u:"dona",p:400000,h:.3}
 ]},
 {g:"Oshxona",items:[
  {id:"gaz_plita",n:"Gaz plita",u:"dona",p:3500000,h:1.5,v:[["4 konforkali",3500000],["2 konforkali",1800000]]},
  {id:"elektr_plita",n:"Elektr plita",u:"dona",p:3000000,h:1,w:1},
  {id:"vytyazhka",n:"Vytyazhka",u:"dona",p:1800000,h:1.5,dims:1,v:[["Eni 60 sm",1800000],["Eni 90 sm",2600000]]},
  {id:"muzlatgich",n:"Muzlatgich",u:"dona",p:6000000,h:0},
  {id:"osh_rakovina",n:"Oshxona rakovinasi",u:"dona",p:800000,h:2},
  {id:"mikro",n:"Mikroto'lqinli pech",u:"dona",p:1500000,h:0}
 ]},
 {g:"Elektrika",items:[
  {id:"svetilnik",n:"Svetilnik / plafon",u:"dona",p:250000,h:.75,w:1,v:[["Plafon",250000],["LED svetilnik",200000],["Nuqtali (spot)",90000]]},
  {id:"lpo",n:"LPO (uzun lampali)",u:"dona",p:180000,h:1,w:1,v:[["2×18 Vt",150000],["2×36 Vt",180000],["4×18 Vt",220000]]},
  {id:"led_panel",n:"LED panel 600×600",u:"dona",p:220000,h:.75,w:1},
  {id:"lyustra",n:"Lyustra",u:"dona",p:1200000,h:1.5},
  {id:"bra",n:"Bra (devor chirog'i)",u:"dona",p:300000,h:.75},
  {id:"vyklyuchatel",n:"Vyklyuchatel",u:"dona",p:35000,h:.4,v:[["1 klavishali",35000],["2 klavishali",45000],["3 klavishali",60000]]},
  {id:"rozetka",n:"Rozetka",u:"dona",p:40000,h:.5,v:[["1 o'rinli",40000],["2 o'rinli",70000],["Namlikdan himoyalangan",60000]]},
  {id:"shchit",n:"Elektr shchit",u:"dona",p:800000,h:4},
  {id:"avtomat",n:"Avtomat (uzgich)",u:"dona",p:60000,h:.3},
  {id:"kabel",n:"Kabel VVG 3×2,5",u:"m",p:14000,h:.05}
 ]},
 {g:"Santexnika",items:[
  {id:"unitaz",n:"Unitaz",u:"dona",p:1800000,h:3},
  {id:"rakovina",n:"Rakovina (qo'l yuvish)",u:"dona",p:900000,h:2},
  {id:"vanna",n:"Vanna",u:"dona",p:3000000,h:4,dims:1},
  {id:"dush",n:"Dush kabina",u:"dona",p:4500000,h:4,dims:1},
  {id:"smesitel",n:"Smesitel",u:"dona",p:600000,h:1},
  {id:"isitgich",n:"Suv isitgich",u:"dona",p:2500000,h:2,v:[["50 l",2500000],["80 l",3200000]]},
  {id:"polotense",n:"Sochiq quritgich",u:"dona",p:700000,h:1.5},
  {id:"trap",n:"Trap",u:"dona",p:250000,h:1.5}
 ]},
 {g:"Isitish va ventilyatsiya",items:[
  {id:"radiator",n:"Radiator",u:"seksiya",p:110000,h:.3},
  {id:"konditsioner",n:"Konditsioner",u:"dona",p:4000000,h:4,v:[["9000 BTU",4000000],["12000 BTU",5000000],["18000 BTU",7000000]]},
  {id:"vent_panjara",n:"Ventilyatsiya panjarasi",u:"dona",p:50000,h:.3,dims:1},
  {id:"vent_teshik",n:"Ventilyatsiya teshigi (teshish)",u:"dona",p:100000,h:1.5},
  {id:"vent_shaxta",n:"Ventilyatsiya shaxtasi (kanal)",u:"m",p:150000,h:1},
  {id:"ventilyator",n:"Ventilyator (so'ruvchi)",u:"dona",p:350000,h:1,w:1}
 ]},
 {g:"Eshik va deraza",items:[
  {id:"ichki_eshik",n:"Ichki eshik",u:"dona",p:1800000,h:3,dims:1},
  {id:"kirish_eshik",n:"Kirish eshigi (metall)",u:"dona",p:5000000,h:4,dims:1},
  {id:"deraza",n:"Plastik deraza",u:"m²",p:1300000,h:1.5},
  {id:"tokcha",n:"Deraza tokchasi",u:"m",p:180000,h:.5},
  {id:"jalyuzi",n:"Parda / jalyuzi",u:"m²",p:150000,h:.3}
 ]},
 {g:"Qurilish ishlari",items:[
  {id:"gruntovka",n:"Gruntovka",u:"m²",p:3000,h:.05},
  {id:"shpaklyovka",n:"Shpaklyovka",u:"m²",p:12000,h:.4},
  {id:"styajka",n:"Styajka (5 sm)",u:"m²",p:45000,h:.5},
  {id:"fartuk",n:"Kafel fartuk (oshxona)",u:"m²",p:150000,h:1.2},
  {id:"panel",n:"Dekorativ panel",u:"m²",p:120000,h:.5},
  {id:"demontaj",n:"Demontaj ishlari",u:"m²",p:0,h:.3}
 ]}
];
if(REF&&REF.catalog&&REF.catalog.length)CATALOG=REF.catalog;
const CAT_INDEX={};CATALOG.forEach(g=>g.items.forEach(it=>{it.g=g.g;CAT_INDEX[it.id]=it}));

let ROOM_TYPES={
 "Mehmonxona":{floor:"laminat",wall:"boyoq",ceil:"natyajnoy",s:["svetilnik","lyustra","vyklyuchatel","rozetka","divan","kreslo","konditsioner","radiator","vent_panjara","deraza"]},
 "Yotoqxona":{floor:"laminat",wall:"oboy",ceil:"shift_boyoq",s:["krovat","shkaf","tumba","svetilnik","vyklyuchatel","rozetka","konditsioner","radiator"]},
 "Oshxona":{floor:"kafel",wall:"boyoq",ceil:"shift_boyoq",s:["gaz_plita","vytyazhka","osh_rakovina","smesitel","garnitur","muzlatgich","rozetka","vyklyuchatel","svetilnik","vent_shaxta","fartuk"]},
 "Hammom":{floor:"kafel",wall:"kafel",ceil:"natyajnoy",s:["unitaz","rakovina","vanna","dush","smesitel","isitgich","ventilyator","svetilnik","trap","polotense"]},
 "Koridor":{floor:"laminat",wall:"boyoq",ceil:"shift_boyoq",s:["kirish_eshik","svetilnik","vyklyuchatel","shtativ","shkaf","shchit"]},
 "Ofis xonasi":{floor:"linoleum",wall:"boyoq",ceil:"armstrong",s:["stol","stul","shkaf","led_panel","lpo","rozetka","vyklyuchatel","konditsioner","seyf","kabel"]},
 "Navbatchi xona":{floor:"linoleum",wall:"boyoq",ceil:"armstrong",s:["kushetka","stol","stul","shkaf","shtativ","lpo","rozetka","vyklyuchatel","radiator"]},
 "Boshqa":{floor:"laminat",wall:"boyoq",ceil:"shift_boyoq",s:["svetilnik","vyklyuchatel","rozetka"]}
};
if(REF&&REF.roomTypes&&Object.keys(REF.roomTypes).length)ROOM_TYPES=REF.roomTypes;
// noma'lum xona turi uchun (admin "Boshqa" ni o'chirib yuborsa ham ishlashi uchun)
const ROOM_DEFAULT=ROOM_TYPES.Boshqa||Object.values(ROOM_TYPES)[0];
