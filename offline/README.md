# SmetaGo — oflayn ilova (bitta fayl va Android APK)

`SmetaGo.html` — butun ilova bitta faylda: dizayn (CSS), hisob-kitob va muharrir (JavaScript),
katalog va narxlar (o'zbekcha va ruscha). Server kerak emas, internet kerak emas.

- Smetalar qurilmaning o'zida saqlanadi (localStorage). Bosh ekranda "Zaxira nusxa olish" — barcha smetalar bitta `.json` faylga.
- Excel (`.xlsx`) fayl qurilmaning o'zida yasaladi (`src/store.js`).
- Muharrir saytdagi bilan bir xil kod: `smeta/static/smeta/js/app.js` (`window.SMETAGO_STORE` orqali ulanadi).

## Qayta yig'ish

```
python tools/build_offline.py          # katalog va narxlar ishlab turgan saytdan
python tools/build_offline.py --local  # lokal bazadan
```

Sayt kodi (`smeta/static/...`) yoki `offline/src/*` o'zgarsa — qayta yig'ib, `SmetaGo.html` ni commit qiling.

## Android APK

`android/` — oddiy WebView ilova: `SmetaGo.html` APK ichida ochiladi, INTERNET ruxsati yo'q.
`offline/` yoki `android/` o'zgarib GitHub'ga push qilinganda `.github/workflows/android-apk.yml` APK yig'adi va
GitHub "Releases" bo'limiga `SmetaGo-1.0.<N>.apk` qo'yadi. Har versiya bir xil kalit bilan imzolanadi
(GitHub sirlari `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`), shuning uchun yangi APK eskisining
ustidan o'rnatiladi va smetalar o'chmaydi. Kalitni yo'qotmang: usiz yangi versiyani ustidan o'rnatib bo'lmaydi.
