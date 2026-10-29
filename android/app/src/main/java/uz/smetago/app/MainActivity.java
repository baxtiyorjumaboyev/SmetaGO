package uz.smetago.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * SmetaGo oflayn ilova: index.html (offline/SmetaGo.html) WebView'da ochiladi.
 * Server yo'q — smetalar WebView xotirasida (localStorage), Excel ham shu yerda yasaladi.
 *
 * Avto-yangilanish: internet bo'lganda GitHub'dagi offline/version.json tekshiriladi; versiya kattaroq bo'lsa
 * SmetaGo.html yuklab olinadi, sha256 bilan tekshiriladi va ilova xotirasiga yoziladi — keyingi ochilishda shu ishlaydi.
 * Internet bo'lmasa — oxirgi yuklangan (yoki APK ichidagi) versiya ishlayveradi.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/index.html";
    private static final String RAW = "https://raw.githubusercontent.com/baxtiyorjumaboyev/SmetaGO/main/offline/";
    private static final int PICK_FILE = 1;
    private static final int PERM_STORAGE = 2;
    private static final long CHECK_EVERY_MS = 10 * 60 * 1000;
    private static final int MAX_HTML = 8 * 1024 * 1024;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private long lastCheck = 0;

    private SharedPreferences prefs() { return getSharedPreferences("smetago", MODE_PRIVATE); }
    private File updateFile() { return new File(new File(getFilesDir(), "update"), "index.html"); }

    /** APK ichidagi versiya (assets/version.json). */
    private long bundledVersion() {
        try (InputStream in = getAssets().open("version.json")) {
            return new JSONObject(new String(readAll(in, 64 * 1024), StandardCharsets.UTF_8)).optLong("version", 0);
        } catch (Exception e) {
            return 0;
        }
    }

    /** Hozir ishlatilayotgan versiya: yuklab olingan (agar APK'dagidan yangi bo'lsa) yoki APK'dagi. */
    private long activeVersion() {
        long bundled = bundledVersion();
        long downloaded = updateFile().exists() ? prefs().getLong("version", 0) : 0;
        return Math.max(bundled, downloaded);
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        // yangi APK o'rnatilgan bo'lsa (uning ichidagi fayl yangiroq) — eski yuklangan fayl kerak emas
        if (prefs().getLong("version", 0) <= bundledVersion()) updateFile().delete();

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage — smetalar shu yerda saqlanadi
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        final WebViewAssetLoader.AssetsPathHandler assets = new WebViewAssetLoader.AssetsPathHandler(this);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", path -> {
                    if ("index.html".equals(path)) {
                        File f = updateFile();
                        if (f.exists()) {
                            try { return new WebResourceResponse("text/html", "utf-8", new FileInputStream(f)); }
                            catch (Exception ignored) { }
                        }
                    }
                    return assets.handle(path);
                })
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;   // tashqi havolalar ilova ichida ochilmaydi
            }
        });

        // "Zaxiradan tiklash": telefondan .json fayl tanlash
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(pick, null), PICK_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        web.addJavascriptInterface(new Bridge(), "SmetaGoAndroid");

        if (state != null) web.restoreState(state);
        else web.loadUrl(START);
    }

    @Override
    protected void onResume() {
        super.onResume();
        long now = System.currentTimeMillis();
        if (now - lastCheck > CHECK_EVERY_MS) {
            lastCheck = now;
            new Thread(this::checkUpdate).start();
        }
    }

    /** GitHub'dagi versiyani tekshirish va yangi faylni yuklab olish (fon oqimida). */
    private void checkUpdate() {
        try {
            JSONObject v = new JSONObject(new String(get(RAW + "version.json?t=" + System.currentTimeMillis(), 64 * 1024), StandardCharsets.UTF_8));
            long version = v.getLong("version");
            String sha = v.getString("sha256");
            if (version <= activeVersion()) return;
            byte[] html = get(RAW + "SmetaGo.html?v=" + version, MAX_HTML);
            if (!sha.equalsIgnoreCase(sha256(html))) return;   // yarim yoki boshqa fayl — qabul qilinmaydi
            File f = updateFile();
            f.getParentFile().mkdirs();
            File tmp = new File(f.getPath() + ".tmp");
            try (FileOutputStream o = new FileOutputStream(tmp)) { o.write(html); }
            if (!tmp.renameTo(f)) {
                f.delete();
                if (!tmp.renameTo(f)) return;
            }
            prefs().edit().putLong("version", version).apply();
            runOnUiThread(() -> web.evaluateJavascript("window.smetagoUpdateReady && window.smetagoUpdateReady()", null));
        } catch (Exception ignored) {
            // internet yo'q yoki GitHub javob bermadi — keyingi safar
        }
    }

    private static byte[] get(String url, int limit) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(10000);
        c.setReadTimeout(20000);
        c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
            try (InputStream in = c.getInputStream()) { return readAll(in, limit); }
        } finally {
            c.disconnect();
        }
    }

    private static byte[] readAll(InputStream in, int limit) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
            if (out.size() > limit) throw new Exception("juda katta");
        }
        return out.toByteArray();
    }

    private static String sha256(byte[] data) throws Exception {
        byte[] d = MessageDigest.getInstance("SHA-256").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : d) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    /** "Orqaga": oyna ochiq bo'lsa yopiladi, smetadan ro'yxatga qaytiladi, ro'yxatda — ilovadan chiqiladi. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.smetagoBack && window.smetagoBack()) ? 'yes' : 'no'", value -> {
            if (!"\"yes\"".equals(value)) finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /** Faylni "Download/SmetaGo" ga yozadi. Qaytaradi: [ochish uchun Uri, "Download/SmetaGo/<nom>"]. */
    private Object[] saveToDownloads(String safe, byte[] data, String mime) throws Exception {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.DISPLAY_NAME, safe);
            v.put(MediaStore.Downloads.MIME_TYPE, mime);
            v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/SmetaGo");
            v.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (u == null) throw new Exception("Download papkasiga yozib bo'lmadi");
            try (OutputStream o = getContentResolver().openOutputStream(u)) {
                if (o == null) throw new Exception("Download papkasiga yozib bo'lmadi");
                o.write(data);
            } catch (Exception e) {
                getContentResolver().delete(u, null, null);
                throw e;
            }
            ContentValues done = new ContentValues();
            done.put(MediaStore.Downloads.IS_PENDING, 0);
            getContentResolver().update(u, done, null, null);
            String shown = safe;   // bir xil nomli fayl bo'lsa, Android "nom (1).xlsx" qiladi
            try (Cursor c = getContentResolver().query(u, new String[]{MediaStore.Downloads.DISPLAY_NAME}, null, null, null)) {
                if (c != null && c.moveToFirst()) shown = c.getString(0);
            }
            return new Object[]{u, "Download/SmetaGo/" + shown};
        }
        // Android 9 va eski: umumiy Download papkasiga yozish uchun ruxsat kerak
        if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, PERM_STORAGE));
            throw new Exception("fayllarni saqlashga ruxsat bering va tugmani qayta bosing");
        }
        File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "SmetaGo");
        if (!dir.isDirectory() && !dir.mkdirs()) throw new Exception("Download/SmetaGo papkasini ochib bo'lmadi");
        int dot = safe.lastIndexOf('.');
        String base = dot > 0 ? safe.substring(0, dot) : safe;
        String ext = dot > 0 ? safe.substring(dot) : "";
        File f = new File(dir, safe);
        for (int i = 1; f.exists(); i++) f = new File(dir, base + " (" + i + ")" + ext);
        try (FileOutputStream o = new FileOutputStream(f)) { o.write(data); }
        MediaScannerConnection.scanFile(this, new String[]{f.getPath()}, new String[]{mime}, null);
        return new Object[]{exportUri(f.getName(), data), "Download/SmetaGo/" + f.getName()};
    }

    /** Ilovaning ichki nusxasi (FileProvider) — boshqa ilovada ochish/yuborish uchun. */
    private Uri exportUri(String safe, byte[] data) throws Exception {
        File dir = new File(getCacheDir(), "export");
        dir.mkdirs();
        File f = new File(dir, safe);
        try (FileOutputStream o = new FileOutputStream(f)) { o.write(data); }
        return FileProvider.getUriForFile(this, "uz.smetago.app.files", f);
    }

    private void toastLong(String m) { runOnUiThread(() -> Toast.makeText(this, m, Toast.LENGTH_LONG).show()); }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == PERM_STORAGE && results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
            toastLong("Ruxsat berildi — Excel tugmasini qayta bosing");
    }

    /** JavaScript → Android: faylni "Download/SmetaGo" ga saqlash. Excel fayl darhol Excel/WPS/Sheets'da ochiladi
     *  (ochadigan ilova bo'lmasa — ulashish oynasi), zaxira (.json) — ulashish oynasi. Xato bo'lsa — sababi ekranda. */
    private class Bridge {
        @JavascriptInterface
        public String saveFile(String name, String base64, String mime) {
            String safe = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_");
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            boolean sheet = safe.toLowerCase().endsWith(".xlsx") || mime.contains("spreadsheet");
            String savedTo = "";
            Uri open = null;
            try {
                Object[] r = saveToDownloads(safe, data, mime);
                open = (Uri) r[0];
                savedTo = (String) r[1];
            } catch (Exception e) {
                toastLong("Download papkasiga saqlanmadi: " + e.getMessage());
            }
            try {
                Uri shareUri = exportUri(safe, data);
                if (open == null) open = shareUri;
                Intent send = new Intent(Intent.ACTION_SEND)
                        .setType(mime)
                        .putExtra(Intent.EXTRA_STREAM, shareUri)
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent view = new Intent(Intent.ACTION_VIEW)
                        .setDataAndType(open, mime)
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                final String where = savedTo;
                runOnUiThread(() -> {
                    if (sheet) {
                        try { startActivity(view); return; }   // Excel o'zi ochiladi (foydalanuvchi talabi)
                        catch (Exception e) {
                            toastLong("Excel faylni ochadigan ilova topilmadi (Microsoft Excel yoki WPS Office o'rnating)."
                                    + (where.isEmpty() ? "" : " Fayl: " + where));
                        }
                    }
                    try { startActivity(Intent.createChooser(send, safe)); } catch (Exception ignored) { }
                });
            } catch (Exception e) {
                toastLong("Faylni ochib bo'lmadi: " + e.getMessage());
            }
            return savedTo;
        }

        /** Ilova qaysi versiyada ekani (ma'lumot uchun). */
        @JavascriptInterface
        public long version() { return activeVersion(); }
    }
}
